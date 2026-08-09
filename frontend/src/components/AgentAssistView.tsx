"use client";

import { useMemo, useState } from 'react'
import { GlassPanel } from './Glass'
import {
  buildSystemPrompt,
  invokeFoundryIq,
  type FoundryChatMessage,
  type FoundryCitation,
  type FoundryIqConfig,
} from '../services/foundryIq'

type ChatRole = 'user' | 'assistant'

interface ChatMessage {
  id: string
  role: ChatRole
  text: string
  citations?: FoundryCitation[]
  reasoning?: string[]
}

const starterPrompts = [
  'Compare Quicksort vs Merge Sort for a real-time multiplayer game leaderboard.',
  'Which graph algorithm is best for weighted pathfinding on a navmesh and why?',
  'Recommend the best algorithm stack for large-scale simulation with ARM servers.',
]

export function AgentAssistView() {
  const [cfg] = useState<FoundryIqConfig>({
    endpointUrl: '/api/chat',
    deployment: 'gemini',
    apiKey: '',
    authMode: 'relay',
    apiVersion: '',
  })
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])

  const canSend = useMemo(
    () => Boolean(draft.trim() && !loading),
    [draft, loading],
  )

  const sendMessage = async () => {
    const input = draft.trim()
    if (!input || loading) return

    const userMessage: ChatMessage = {
      id: `${Date.now()}-u`,
      role: 'user',
      text: input,
    }
    const nextHistory = [...messages, userMessage]
    setMessages(nextHistory)
    setDraft('')
    setError(null)
    setLoading(true)

    try {
      const systemContent = buildSystemPrompt()
      const chatHistory: FoundryChatMessage[] = [
        { role: 'system', content: systemContent },
        ...nextHistory.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.text,
        })),
      ]

      const reply = await invokeFoundryIq(cfg, chatHistory)

      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-a`,
          role: 'assistant',
          text: reply.text,
          citations: reply.citations,
          reasoning: reply.reasoningSteps,
        },
      ])
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to call Gemini IQ endpoint.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <GlassPanel className="p-5">
        <h2 className="mb-2 text-lg font-semibold text-white">Gemini IQ Agent</h2>
        <p className="mb-4 text-sm text-white/60">
          Grounded algorithm advisor powered by Google Gemini, with the Algorithm Arena catalog as the IQ retrieval corpus.
        </p>
      </GlassPanel>

      <GlassPanel className="p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          {starterPrompts.map((p) => (
            <button
              key={p}
              onClick={() => setDraft(p)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/65 hover:border-white/20 hover:text-white"
            >
              {p}
            </button>
          ))}
        </div>

        <div className="mb-4 max-h-[440px] space-y-3 overflow-y-auto rounded-xl border border-white/10 bg-black/25 p-3">
          {messages.length === 0 && (
            <p className="text-sm text-white/45">
              Start a conversation to get grounded algorithm advice with citations.
            </p>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={`rounded-xl border px-3 py-2 ${
                m.role === 'user'
                  ? 'ml-8 border-[var(--accent)]/25 bg-[var(--accent)]/10'
                  : 'mr-8 border-white/10 bg-white/[0.03]'
              }`}
            >
              <p className="mb-1 text-[11px] uppercase tracking-wider text-white/35">{m.role}</p>
              <p className="whitespace-pre-wrap text-sm text-white/85">{m.text}</p>

              {m.reasoning && m.reasoning.length > 0 && (
                <details className="mt-2 rounded-lg border border-white/10 bg-white/[0.02] p-2">
                  <summary className="cursor-pointer text-xs text-white/55">Reasoning steps</summary>
                  <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs text-white/65">
                    {m.reasoning.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                </details>
              )}

              {m.citations && m.citations.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-white/45">Citations</p>
                  {m.citations.map((c) => (
                    <div key={`${c.index}-${c.title}`} className="text-xs text-white/70">
                      <span className="font-mono text-white/45">[{c.index}]</span>{' '}
                      {c.url ? (
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[var(--accent-2)] hover:underline"
                        >
                          {c.title}
                        </a>
                      ) : (
                        <span>{c.title}</span>
                      )}
                      {c.source ? <span className="text-white/40"> · {c.source}</span> : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && <p className="text-sm text-white/45">Thinking...</p>}
        </div>

        {error && (
          <div className="mb-3 rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-100">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2 md:flex-row">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask for grounded algorithm recommendations..."
            className="glass min-h-24 flex-1 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
          />
          <div className="flex flex-col gap-2">
            <button
              onClick={sendMessage}
              disabled={!canSend}
              className="rounded-xl border border-[var(--accent)]/50 bg-[var(--accent)]/25 px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent)]/40 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Send
            </button>
            <button
              onClick={() => {
                setMessages([])
                setError(null)
              }}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 hover:border-white/25 hover:text-white"
            >
              Reset
            </button>
          </div>
        </div>
      </GlassPanel>
    </div>
  )
}
