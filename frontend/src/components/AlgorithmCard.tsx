"use client";
import type { Algorithm } from '../types'
import { Badge, GlassPanel, RatingBar } from './Glass'

interface AlgorithmCardProps {
  algo: Algorithm
  selected: boolean
  onToggle: (id: string) => void
}

export function AlgorithmCard({ algo, selected, onToggle }: AlgorithmCardProps) {
  return (
    <GlassPanel
      hover
      className={`flex h-full flex-col p-5 ${
        selected ? 'ring-2 ring-[var(--accent)]/60' : ''
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold leading-tight text-white">{algo.name}</h3>
          <span className="text-xs uppercase tracking-wider text-[var(--accent-2)]/80">
            {algo.category}
          </span>
        </div>
        {algo.runnable && <Badge tone="good">Benchmarkable</Badge>}
      </div>

      <p className="mb-3 text-sm text-white/60">{algo.summary}</p>

      <div className="mb-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <span className="text-white/45">Time (avg)</span>
        <span className="text-right font-mono text-white/80">{algo.complexity.time.average}</span>
        <span className="text-white/45">Worst</span>
        <span className="text-right font-mono text-white/80">{algo.complexity.time.worst}</span>
        <span className="text-white/45">Space</span>
        <span className="text-right font-mono text-white/80">{algo.complexity.space}</span>
      </div>

      <div className="mb-4 space-y-1.5">
        <RatingBar label="Speed" value={algo.ratings.speed} />
        <RatingBar label="Memory" value={algo.ratings.memory} />
        <RatingBar label="Gaming" value={algo.ratings.gaming} />
        <RatingBar label="Simulation" value={algo.ratings.simulation} />
      </div>

      <div className="mt-auto flex flex-wrap gap-1.5">
        {algo.stable !== undefined && (
          <Badge tone={algo.stable ? 'good' : 'bad'}>
            {algo.stable ? 'Stable' : 'Unstable'}
          </Badge>
        )}
        {algo.inPlace !== undefined && (
          <Badge>{algo.inPlace ? 'In-place' : 'Out-of-place'}</Badge>
        )}
        {algo.parallelizable && <Badge>Parallel</Badge>}
      </div>

      <button
        onClick={() => onToggle(algo.id)}
        className={`mt-4 w-full rounded-xl border px-3 py-2 text-sm font-medium transition ${
          selected
            ? 'border-[var(--accent)]/60 bg-[var(--accent)]/20 text-white'
            : 'border-white/10 bg-white/5 text-white/70 hover:border-white/25 hover:text-white'
        }`}
      >
        {selected ? 'Selected for compare' : 'Add to compare'}
      </button>
    </GlassPanel>
  )
}

