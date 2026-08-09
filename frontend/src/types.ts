export type Category =
  | 'Sorting'
  | 'Searching'
  | 'Graph'
  | 'Dynamic Programming'
  | 'Hashing'
  | 'String'
  | 'Tree'
  | 'Numerical'
  | 'Cryptography'
  | 'Machine Learning'

export type Rating = 1 | 2 | 3 | 4 | 5

export interface Complexity {
  best: string
  average: string
  worst: string
}

/**
 * Counters an algorithm can report while running so the benchmark engine can
 * visualise work done (not just wall-clock time).
 */
export interface OpCounters {
  comparisons: number
  swaps: number
  reads: number
  writes: number
}

export interface BenchmarkContext {
  counters: OpCounters
}

/**
 * A runnable algorithm produces an input of a given size and executes against
 * it. The function should mutate `ctx.counters` so the engine can chart work.
 */
export interface Runnable {
  /** Build a deterministic-ish input of the requested size. */
  generateInput: (size: number) => unknown
  /** Run the algorithm; return value is ignored (used only to avoid DCE). */
  run: (input: unknown, ctx: BenchmarkContext) => unknown
  /** Rough peak auxiliary memory in bytes for an input of `size` items. */
  estimateMemoryBytes?: (size: number) => number
}

export interface Algorithm {
  id: string
  name: string
  category: Category
  /** One-line summary. */
  summary: string
  complexity: {
    time: Complexity
    space: string
  }
  /** Qualitative profiles, each 1 (poor) – 5 (excellent). */
  ratings: {
    speed: Rating
    memory: Rating
    cpu: Rating
    usability: Rating
    /** Higher = better real-time / gaming suitability. */
    gaming: Rating
    /** Higher = better large-scale simulation suitability. */
    simulation: Rating
  }
  stable?: boolean
  inPlace?: boolean
  parallelizable?: boolean
  strengths: string[]
  weaknesses: string[]
  /** Where it shines in interactive / real-time gaming workloads. */
  gamingUse: string
  /** Where it shines in scientific / large-scale simulation workloads. */
  simulationUse: string
  /** CPU & cache behaviour notes. */
  cpuNotes: string
  /** Memory / allocation behaviour notes. */
  memoryNotes: string
  /** Notes about ARM vs x86-64 behaviour, SIMD, branch prediction etc. */
  architectureNotes: string
  /** Typical hardware acceleration / placement. */
  hardware: string
  /** Common software libraries / where it ships. */
  software: string
  /** Present only for algorithms that can be benchmarked live. */
  runnable?: Runnable
}
