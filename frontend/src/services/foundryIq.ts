import { algorithms } from '../data/algorithms'

export interface FoundryIqConfig {
  endpointUrl: string
  deployment: string
  apiKey: string
  authMode: 'api-key' | 'bearer' | 'relay'
  apiVersion?: string
}

export interface FoundryCitation {
  index: number
  title: string
  url?: string
  source?: string
}

export interface FoundryChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface FoundryIqReply {
  text: string
  citations: FoundryCitation[]
  reasoningSteps: string[]
  raw: unknown
}

const DEFAULT_API_VERSION = '2025-01-01-preview'

interface GroundingEntry {
  index: number
  id: string
  title: string
  source: string
}

interface RetrievalDoc {
  index: number
  id: string
  name: string
  category: string
  score?: number
}

function buildGroundingCorpus(): { systemContext: string; entries: GroundingEntry[] } {
  const entries: GroundingEntry[] = []
  const lines: string[] = []

  algorithms.forEach((a, i) => {
    const idx = i + 1
    entries.push({
      index: idx,
      id: a.id,
      title: a.name,
      source: `algorithm-catalog#${a.id}`,
    })
    lines.push(
      `[${idx}] ${a.name} (category=${a.category})`,
      `    summary: ${a.summary}`,
      `    complexity: best=${a.complexity.time.best} avg=${a.complexity.time.average} worst=${a.complexity.time.worst} space=${a.complexity.space}`,
      `    strengths: ${a.strengths.join('; ')}`,
      `    weaknesses: ${a.weaknesses.join('; ')}`,
      `    gaming: ${a.gamingUse}`,
      `    simulation: ${a.simulationUse}`,
      `    cpu: ${a.cpuNotes}`,
      `    architecture: ${a.architectureNotes}`,
      '',
    )
  })

  return { systemContext: lines.join('\n'), entries }
}

const grounding = buildGroundingCorpus()
const algorithmById = new Map(algorithms.map((a) => [a.id, a]))

export function buildSystemPrompt(): string {
  return [
    'You are the Algorithm Arena Foundry IQ Agent.',
    'Your job is to recommend algorithms for gaming, simulation, and ML workloads using ONLY the grounding corpus below.',
    'Always cite the algorithms you recommend using bracketed indices like [1], [3] that match the corpus.',
    'If the corpus does not contain enough information, say so explicitly and suggest what data you would need.',
    'Keep answers concise, structured (short paragraphs or bullets), and end with a "Citations:" line listing the indices used.',
    '',
    'Grounding corpus:',
    grounding.systemContext,
  ].join('\n')
}

export function buildRelaySystemPrompt(): string {
  return [
    'You are the Algorithm Arena Foundry IQ Agent.',
    'The server has already retrieved the most relevant algorithm entries via Azure AI Search and injected them as a second system message.',
    'Ground every recommendation ONLY in those retrieved entries; do not invent algorithms that are not present.',
    'Cite with bracketed indices like [1], [3] matching the retrieved entries.',
    'If the retrieved context does not answer the question, say so explicitly.',
    'Keep answers concise (short paragraphs or bullets) and end with a "Citations:" line listing the indices used.',
  ].join('\n')
}

export function getGroundingEntries(): GroundingEntry[] {
  return grounding.entries
}

function parseCitationIndices(text: string): number[] {
  const matches = text.match(/\[(\d+)\]/g) ?? []
  const seen = new Set<number>()
  for (const m of matches) {
    const n = Number(m.slice(1, -1))
    if (Number.isFinite(n)) seen.add(n)
  }
  return [...seen].sort((a, b) => a - b)
}

export function citationsFromText(text: string): FoundryCitation[] {
  const indices = parseCitationIndices(text)
  const result: FoundryCitation[] = []
  for (const index of indices) {
    const entry = grounding.entries.find((e) => e.index === index)
    if (!entry) continue
    result.push({ index, title: entry.title, source: entry.source })
  }
  return result
}

function citationsFromRetrieval(text: string, retrieval: RetrievalDoc[]): FoundryCitation[] {
  const indices = parseCitationIndices(text)
  const result: FoundryCitation[] = []
  for (const index of indices) {
    const doc = retrieval.find((d) => d.index === index)
    if (!doc) continue
    const catalogEntry = algorithmById.get(doc.id)
    result.push({
      index,
      title: catalogEntry?.name ?? doc.name,
      source: `algorithm-catalog#${doc.id}`,
    })
  }
  return result
}

function buildChatUrl(cfg: FoundryIqConfig): string {
  const base = cfg.endpointUrl.trim().replace(/\/+$/, '')
  if (!base) throw new Error('Foundry endpoint URL is required.')
  if (cfg.authMode === 'relay') {
    return base
  }
  if (!cfg.deployment.trim()) throw new Error('Foundry deployment name is required.')
  const v = cfg.apiVersion?.trim() || DEFAULT_API_VERSION
  return `${base}/openai/deployments/${encodeURIComponent(cfg.deployment.trim())}/chat/completions?api-version=${encodeURIComponent(v)}`
}

export async function invokeFoundryIq(
  cfg: FoundryIqConfig,
  messages: FoundryChatMessage[],
): Promise<FoundryIqReply> {
  if (cfg.authMode !== 'relay' && !cfg.apiKey.trim()) {
    throw new Error('API key or bearer token is required.')
  }

  const url = buildChatUrl(cfg)

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (cfg.authMode === 'api-key') headers['api-key'] = cfg.apiKey.trim()
  else if (cfg.authMode === 'bearer') headers.Authorization = `Bearer ${cfg.apiKey.trim()}`

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      messages,
      max_completion_tokens: 800,
      temperature: 0.2,
    }),
  })

  const rawText = await response.text()
  let data: Record<string, unknown> = {}
  try {
    data = rawText ? (JSON.parse(rawText) as Record<string, unknown>) : {}
  } catch {
    throw new Error(`Endpoint returned non-JSON response (${response.status}).`)
  }

  if (!response.ok) {
    const err = data.error as { message?: string } | undefined
    const msg = err?.message ?? (typeof data.message === 'string' ? data.message : `Request failed (${response.status}).`)
    throw new Error(msg)
  }

  const choice = (data.choices as Array<{ message?: { content?: string } }> | undefined)?.[0]
  const text = choice?.message?.content?.trim() || 'No reply returned by the model.'

  const retrieval = Array.isArray(data._retrieval) ? (data._retrieval as RetrievalDoc[]) : []
  const citations = retrieval.length
    ? citationsFromRetrieval(text, retrieval)
    : citationsFromText(text)

  return {
    text,
    citations,
    reasoningSteps: [],
    raw: data,
  }
}
