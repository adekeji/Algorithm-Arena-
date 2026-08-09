import type { Algorithm, BenchmarkContext, OpCounters } from '../types'

export interface SizeResult {
  size: number
  /** Median wall-clock milliseconds across runs. */
  ms: number
  /** Operations per second (work / time). */
  opsPerSec: number
  counters: OpCounters
  /** Estimated peak auxiliary memory in bytes. */
  memoryBytes: number
}

export interface BenchmarkResult {
  algorithmId: string
  name: string
  points: SizeResult[]
}

export interface BenchmarkOptions {
  sizes: number[]
  /** Repeats per size; the median time is reported. */
  repeats: number
}

const emptyCounters = (): OpCounters => ({
  comparisons: 0,
  swaps: 0,
  reads: 0,
  writes: 0,
})

function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

/** Prevents the JIT from eliminating the benchmarked call as dead code. */
let sink = 0
function keepAlive(v: unknown) {
  if (Array.isArray(v)) sink += v.length
  else if (typeof v === 'number') sink += v
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  if (sink === Number.MIN_SAFE_INTEGER) console.log(sink)
}

/**
 * Benchmark a single runnable algorithm across the requested input sizes.
 * Yields after each size so the UI can update progressively.
 */
export async function benchmarkAlgorithm(
  algo: Algorithm,
  options: BenchmarkOptions,
  onPoint?: (point: SizeResult) => void,
): Promise<BenchmarkResult> {
  const runnable = algo.runnable
  if (!runnable) {
    return { algorithmId: algo.id, name: algo.name, points: [] }
  }

  const points: SizeResult[] = []

  for (const size of options.sizes) {
    const input = runnable.generateInput(size)
    const times: number[] = []
    const counters = emptyCounters()

    // Warm-up run (JIT) — not timed.
    {
      const ctx: BenchmarkContext = { counters: emptyCounters() }
      keepAlive(runnable.run(input, ctx))
    }

    for (let r = 0; r < options.repeats; r++) {
      const ctx: BenchmarkContext = { counters: emptyCounters() }
      const t0 = performance.now()
      const out = runnable.run(input, ctx)
      const t1 = performance.now()
      keepAlive(out)
      times.push(t1 - t0)
      if (r === options.repeats - 1) {
        counters.comparisons = ctx.counters.comparisons
        counters.swaps = ctx.counters.swaps
        counters.reads = ctx.counters.reads
        counters.writes = ctx.counters.writes
      }
    }

    const ms = Math.max(median(times), 0.0001)
    const work =
      counters.comparisons + counters.swaps + counters.reads + counters.writes
    const point: SizeResult = {
      size,
      ms,
      opsPerSec: work > 0 ? (work / ms) * 1000 : (size / ms) * 1000,
      counters,
      memoryBytes: runnable.estimateMemoryBytes?.(size) ?? 0,
    }
    points.push(point)
    onPoint?.(point)

    // Yield to the event loop so the UI stays responsive.
    await new Promise((res) => setTimeout(res, 0))
  }

  return { algorithmId: algo.id, name: algo.name, points }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatNumber(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
  return n.toFixed(0)
}
