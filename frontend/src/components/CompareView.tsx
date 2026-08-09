"use client";
import type { Algorithm } from '../types'
import { GlassPanel } from './Glass'

interface CompareViewProps {
  algorithms: Algorithm[]
  selected: Algorithm[]
  onClear: () => void
}

type Row = {
  label: string
  get: (a: Algorithm) => React.ReactNode
}

function ratingDots(value: number) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value} of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full"
          style={{
            background:
              i < value ? 'linear-gradient(90deg,#7c5cff,#21d4fd)' : 'rgba(255,255,255,0.12)',
          }}
        />
      ))}
    </span>
  )
}

function list(items: string[]) {
  return (
    <ul className="space-y-1 text-left">
      {items.map((s) => (
        <li key={s} className="text-xs text-white/65">
          • {s}
        </li>
      ))}
    </ul>
  )
}

const ROWS: Row[] = [
  { label: 'Category', get: (a) => a.category },
  { label: 'Summary', get: (a) => <span className="text-white/65">{a.summary}</span> },
  { label: 'Time · best', get: (a) => <code className="text-[var(--accent-2)]">{a.complexity.time.best}</code> },
  { label: 'Time · average', get: (a) => <code className="text-[var(--accent-2)]">{a.complexity.time.average}</code> },
  { label: 'Time · worst', get: (a) => <code className="text-[var(--accent-2)]">{a.complexity.time.worst}</code> },
  { label: 'Space', get: (a) => <code className="text-[var(--accent-2)]">{a.complexity.space}</code> },
  { label: 'Speed', get: (a) => ratingDots(a.ratings.speed) },
  { label: 'Memory efficiency', get: (a) => ratingDots(a.ratings.memory) },
  { label: 'CPU utilisation', get: (a) => ratingDots(a.ratings.cpu) },
  { label: 'Usability', get: (a) => ratingDots(a.ratings.usability) },
  { label: 'Gaming fit', get: (a) => ratingDots(a.ratings.gaming) },
  { label: 'Simulation fit', get: (a) => ratingDots(a.ratings.simulation) },
  { label: 'Stable', get: (a) => (a.stable === undefined ? '—' : a.stable ? 'Yes' : 'No') },
  { label: 'In-place', get: (a) => (a.inPlace === undefined ? '—' : a.inPlace ? 'Yes' : 'No') },
  { label: 'Parallelizable', get: (a) => (a.parallelizable ? 'Yes' : 'No') },
  { label: 'Strengths', get: (a) => list(a.strengths) },
  { label: 'Weaknesses', get: (a) => list(a.weaknesses) },
  { label: 'CPU notes', get: (a) => <span className="text-xs text-white/60">{a.cpuNotes}</span> },
  { label: 'Memory notes', get: (a) => <span className="text-xs text-white/60">{a.memoryNotes}</span> },
  { label: 'ARM vs x86-64', get: (a) => <span className="text-xs text-white/60">{a.architectureNotes}</span> },
  { label: 'Hardware', get: (a) => <span className="text-xs text-white/60">{a.hardware}</span> },
  { label: 'Software', get: (a) => <span className="text-xs text-white/60">{a.software}</span> },
  { label: 'Gaming use', get: (a) => <span className="text-xs text-white/60">{a.gamingUse}</span> },
  { label: 'Simulation use', get: (a) => <span className="text-xs text-white/60">{a.simulationUse}</span> },
]

export function CompareView({ selected, onClear }: CompareViewProps) {
  if (selected.length === 0) {
    return (
      <GlassPanel className="p-10 text-center">
        <p className="text-white/60">
          No algorithms selected. Go to <span className="text-white">Catalog</span> and add a few
          to compare them side by side.
        </p>
      </GlassPanel>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          Comparing {selected.length} algorithm{selected.length === 1 ? '' : 's'}
        </h2>
        <button
          onClick={onClear}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:border-white/25 hover:text-white"
        >
          Clear selection
        </button>
      </div>

      <GlassPanel className="overflow-x-auto p-1">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-[#0a0c14]/80 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/40 backdrop-blur">
                Attribute
              </th>
              {selected.map((a) => (
                <th
                  key={a.id}
                  className="min-w-[220px] px-4 py-3 text-left text-sm font-semibold text-white"
                >
                  {a.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, idx) => (
              <tr
                key={row.label}
                className={idx % 2 ? 'bg-white/[0.02]' : ''}
              >
                <td className="sticky left-0 z-10 bg-[#0a0c14]/80 px-4 py-3 align-top text-xs font-medium text-white/50 backdrop-blur">
                  {row.label}
                </td>
                {selected.map((a) => (
                  <td key={a.id} className="px-4 py-3 align-top text-white/80">
                    {row.get(a)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </GlassPanel>
    </div>
  )
}

