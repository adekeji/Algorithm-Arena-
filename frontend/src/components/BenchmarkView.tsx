"use client";
import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Algorithm } from '../types'
import {
  benchmarkAlgorithm,
  formatBytes,
  formatNumber,
  type BenchmarkResult,
} from '../benchmark/engine'
import { GlassPanel } from './Glass'

const SERIES_COLORS = [
  '#7c5cff',
  '#21d4fd',
  '#ff5ca8',
  '#3ddc97',
  '#ffb347',
  '#b388ff',
  '#ff6b6b',
  '#4dd0e1',
  '#f06292',
]

const SIZE_PRESETS: Record<string, number[]> = {
  Quick: [500, 1000, 2000, 4000, 8000],
  Standard: [1000, 2000, 4000, 8000, 16000, 32000],
  Heavy: [2000, 8000, 16000, 32000, 64000, 128000],
}

interface BenchmarkViewProps {
  algorithms: Algorithm[]
}

export function BenchmarkView({ algorithms }: BenchmarkViewProps) {
  const runnable = useMemo(() => algorithms.filter((a) => a.runnable), [algorithms])
  const [picked, setPicked] = useState<Set<string>>(
    () => new Set(runnable.slice(0, 4).map((a) => a.id)),
  )
  const [preset, setPreset] = useState<keyof typeof SIZE_PRESETS>('Standard')
  const [repeats, setRepeats] = useState(3)
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<BenchmarkResult[]>([])

  const togglePick = (id: string) => {
    setPicked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const runBenchmarks = async () => {
    const chosen = runnable.filter((a) => picked.has(a.id))
    if (chosen.length === 0) return
    setRunning(true)
    setProgress(0)
    setResults([])

    const sizes = SIZE_PRESETS[preset]
    const total = chosen.length
    const collected: BenchmarkResult[] = []

    for (let i = 0; i < chosen.length; i++) {
      const res = await benchmarkAlgorithm(chosen[i], { sizes, repeats })
      collected.push(res)
      setResults([...collected])
      setProgress(Math.round(((i + 1) / total) * 100))
    }
    setRunning(false)
  }

  const chartData = useMemo(() => {
    if (results.length === 0) return []
    const sizes = SIZE_PRESETS[preset]
    return sizes.map((size) => {
      const row: Record<string, number> = { size }
      for (const r of results) {
        const p = r.points.find((pt) => pt.size === size)
        if (p) row[r.name] = Number(p.ms.toFixed(4))
      }
      return row
    })
  }, [results, preset])

  const colorFor = (name: string) => {
    const idx = results.findIndex((r) => r.name === name)
    return SERIES_COLORS[idx % SERIES_COLORS.length]
  }

  return (
    <div className="space-y-6">
      <GlassPanel className="p-5">
        <h2 className="mb-1 text-lg font-semibold text-white">Live benchmark</h2>
        <p className="mb-4 text-sm text-white/55">
          These algorithms actually run in your browser on randomized inputs. Wall-clock time is
          measured with <code className="text-[var(--accent-2)]">performance.now()</code> and the
          median across repeats is reported.
        </p>

        <div className="mb-4 flex flex-wrap gap-2">
          {runnable.map((a) => (
            <button
              key={a.id}
              onClick={() => togglePick(a.id)}
              disabled={running}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
                picked.has(a.id)
                  ? 'border-[var(--accent)]/60 bg-[var(--accent)]/20 text-white'
                  : 'border-white/10 bg-white/5 text-white/60 hover:border-white/25 hover:text-white'
              }`}
            >
              {a.name}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1 text-xs text-white/50">
            Input sizes
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value as keyof typeof SIZE_PRESETS)}
              disabled={running}
              className="glass rounded-lg px-3 py-2 text-sm text-white focus:outline-none disabled:opacity-50"
            >
              {Object.keys(SIZE_PRESETS).map((k) => (
                <option key={k} value={k} className="bg-[#0a0c14]">
                  {k} ({SIZE_PRESETS[k as keyof typeof SIZE_PRESETS].at(-1)?.toLocaleString()} max)
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs text-white/50">
            Repeats (median)
            <input
              type="number"
              min={1}
              max={15}
              value={repeats}
              onChange={(e) => setRepeats(Math.max(1, Math.min(15, Number(e.target.value))))}
              disabled={running}
              className="glass w-24 rounded-lg px-3 py-2 text-sm text-white focus:outline-none disabled:opacity-50"
            />
          </label>

          <button
            onClick={runBenchmarks}
            disabled={running || picked.size === 0}
            className="rounded-xl border border-[var(--accent)]/50 bg-[var(--accent)]/25 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent)]/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {running ? `Running… ${progress}%` : 'Run benchmark'}
          </button>
        </div>

        {running && (
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg,#7c5cff,#21d4fd)',
              }}
            />
          </div>
        )}
      </GlassPanel>

      {chartData.length > 0 && (
        <GlassPanel className="p-5">
          <h3 className="mb-4 text-sm font-medium text-white/70">
            Execution time vs input size (ms · lower is better)
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="size"
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                  tickFormatter={(v) => formatNumber(Number(v))}
                  stroke="rgba(255,255,255,0.15)"
                />
                <YAxis
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                  stroke="rgba(255,255,255,0.15)"
                  width={48}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(10,12,20,0.92)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 12,
                    backdropFilter: 'blur(8px)',
                    color: '#fff',
                  }}
                  labelFormatter={(v) => `n = ${Number(v).toLocaleString()}`}
                  formatter={(value: any, name: any) => [`${value} ms`, name]}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }} />
                {results.map((r) => (
                  <Line
                    key={r.algorithmId}
                    type="monotone"
                    dataKey={r.name}
                    stroke={colorFor(r.name)}
                    strokeWidth={2.5}
                    dot={{ r: 2 }}
                    activeDot={{ r: 5 }}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      )}

      {results.length > 0 && (
        <GlassPanel className="overflow-x-auto p-1">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-white/40">
                <th className="px-4 py-3">Algorithm</th>
                <th className="px-4 py-3">Largest n</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Throughput</th>
                <th className="px-4 py-3">Comparisons</th>
                <th className="px-4 py-3">Swaps / writes</th>
                <th className="px-4 py-3">Est. aux memory</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => {
                const last = r.points.at(-1)
                if (!last) return null
                return (
                  <tr key={r.algorithmId} className="border-t border-white/5">
                    <td className="px-4 py-3 font-medium text-white">{r.name}</td>
                    <td className="px-4 py-3 text-white/70">{last.size.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-[var(--accent-2)]">
                      {last.ms.toFixed(3)} ms
                    </td>
                    <td className="px-4 py-3 text-white/70">{formatNumber(last.opsPerSec)} ops/s</td>
                    <td className="px-4 py-3 text-white/70">
                      {formatNumber(last.counters.comparisons)}
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {formatNumber(last.counters.swaps + last.counters.writes)}
                    </td>
                    <td className="px-4 py-3 text-white/70">{formatBytes(last.memoryBytes)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </GlassPanel>
      )}
    </div>
  )
}

