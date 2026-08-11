import { algorithms } from '../data/algorithms'

export interface GeminiCitation {
  index: number
  title: string
  url?: string
  source?: string
}

export interface GeminiChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface GeminiAgentReply {
  text: string
  citations: GeminiCitation[]
  reasoningSteps: string[]
}

interface GroundingEntry {
  index: number
  id: string
  title: string
  source: string
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

export function buildSystemPrompt(): string {
  return [
    'You are the Algorithm Arena Gemini IQ Agent.',
    'Your job is to recommend algorithms for gaming, simulation, and ML workloads using ONLY the grounding corpus below.',
    'Always cite the algorithms you recommend using bracketed indices like [1], [3] that match the corpus.',
    'If the corpus does not contain enough information, say so explicitly and suggest what data you would need.',
    'Keep answers concise, structured (short paragraphs or bullets), and end with a "Citations:" line listing the indices used.',
    '',
    'Grounding corpus:',
    grounding.systemContext,
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

export function citationsFromText(text: string): GeminiCitation[] {
  const indices = parseCitationIndices(text)
  const result: GeminiCitation[] = []
  for (const index of indices) {
    const entry = grounding.entries.find((e) => e.index === index)
    if (!entry) continue
    result.push({ index, title: entry.title, source: entry.source })
  }
  return result
}

export async function invokeGeminiAgent(
  messages: GeminiChatMessage[],
): Promise<GeminiAgentReply> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  })

  let data: any = {}
  try {
    data = await response.json()
  } catch {
    throw new Error(`Endpoint returned non-JSON response (${response.status}).`)
  }

  if (!response.ok) {
    throw new Error(data.error?.message || data.error || `Request failed (${response.status}).`)
  }

  const text = data.text || 'No reply returned by the model.'
  const citations = citationsFromText(text)

  return {
    text,
    citations,
    reasoningSteps: [],
  }
}
