"use client";
import { useMemo, useState } from 'react'
import type { Algorithm, Category } from '../types'
import { AlgorithmCard } from './AlgorithmCard'

const CATEGORIES: (Category | 'All')[] = [
  'All',
  'Sorting',
  'Searching',
  'Graph',
  'Dynamic Programming',
  'Hashing',
  'String',
  'Tree',
  'Numerical',
  'Cryptography',
  'Machine Learning',
]

interface CatalogViewProps {
  algorithms: Algorithm[]
  selected: Set<string>
  onToggle: (id: string) => void
}

export function CatalogView({ algorithms, selected, onToggle }: CatalogViewProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | 'All'>('All')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return algorithms.filter((a) => {
      const matchesCat = category === 'All' || a.category === category
      const matchesQuery =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      return matchesCat && matchesQuery
    })
  }, [algorithms, query, category])

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search algorithms…"
          className="glass w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 md:max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                category === c
                  ? 'border-[var(--accent)]/60 bg-[var(--accent)]/20 text-white'
                  : 'border-white/10 bg-white/5 text-white/60 hover:border-white/25 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-4 text-xs text-white/40">
        {filtered.length} algorithm{filtered.length === 1 ? '' : 's'} · {selected.size} selected
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((a) => (
          <AlgorithmCard
            key={a.id}
            algo={a}
            selected={selected.has(a.id)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  )
}

