import type { ReactNode } from 'react'

interface GlassPanelProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function GlassPanel({ children, className = '', hover = false }: GlassPanelProps) {
  return (
    <div className={`glass ${hover ? 'glass-hover' : ''} rounded-2xl ${className}`}>
      {children}
    </div>
  )
}

interface RatingBarProps {
  label: string
  value: number
  max?: number
}

export function RatingBar({ label, value, max = 5 }: RatingBarProps) {
  const pct = (value / max) * 100
  return (
    <div className="flex items-center gap-2">
      <span className="w-24 shrink-0 text-xs text-white/60">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #7c5cff, #21d4fd)',
          }}
        />
      </div>
      <span className="w-6 text-right text-xs tabular-nums text-white/70">{value}</span>
    </div>
  )
}

interface BadgeProps {
  children: ReactNode
  tone?: 'default' | 'good' | 'bad'
}

export function Badge({ children, tone = 'default' }: BadgeProps) {
  const tones: Record<string, string> = {
    default: 'bg-white/8 text-white/70 border-white/10',
    good: 'bg-emerald-400/10 text-emerald-200 border-emerald-300/20',
    bad: 'bg-rose-400/10 text-rose-200 border-rose-300/20',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  )
}
