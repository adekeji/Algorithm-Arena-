import type { BenchmarkContext, Runnable } from '../types'

/* ------------------------------------------------------------------ */
/* Input generators                                                    */
/* ------------------------------------------------------------------ */

/** Mulberry32 — tiny deterministic PRNG so benchmarks are reproducible. */
function makeRng(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function randomArray(size: number): number[] {
  const rng = makeRng(size * 2654435761)
  const arr = new Array<number>(size)
  for (let i = 0; i < size; i++) arr[i] = Math.floor(rng() * size * 4)
  return arr
}

function sortedArray(size: number): number[] {
  const arr = new Array<number>(size)
  for (let i = 0; i < size; i++) arr[i] = i
  return arr
}

/* ------------------------------------------------------------------ */
/* Sorting                                                             */
/* ------------------------------------------------------------------ */

const arrayInput = (size: number) => randomArray(size)

export const bubbleSort: Runnable = {
  generateInput: arrayInput,
  estimateMemoryBytes: (n) => n * 8,
  run: (input, { counters }: BenchmarkContext) => {
    const a = (input as number[]).slice()
    const n = a.length
    for (let i = 0; i < n - 1; i++) {
      let swapped = false
      for (let j = 0; j < n - 1 - i; j++) {
        counters.comparisons++
        if (a[j] > a[j + 1]) {
          const t = a[j]
          a[j] = a[j + 1]
          a[j + 1] = t
          counters.swaps++
          swapped = true
        }
      }
      if (!swapped) break
    }
    return a
  },
}

export const insertionSort: Runnable = {
  generateInput: arrayInput,
  estimateMemoryBytes: (n) => n * 8,
  run: (input, { counters }: BenchmarkContext) => {
    const a = (input as number[]).slice()
    for (let i = 1; i < a.length; i++) {
      const key = a[i]
      let j = i - 1
      while (j >= 0) {
        counters.comparisons++
        if (a[j] > key) {
          a[j + 1] = a[j]
          counters.writes++
          j--
        } else break
      }
      a[j + 1] = key
      counters.writes++
    }
    return a
  },
}

export const selectionSort: Runnable = {
  generateInput: arrayInput,
  estimateMemoryBytes: (n) => n * 8,
  run: (input, { counters }: BenchmarkContext) => {
    const a = (input as number[]).slice()
    const n = a.length
    for (let i = 0; i < n - 1; i++) {
      let min = i
      for (let j = i + 1; j < n; j++) {
        counters.comparisons++
        if (a[j] < a[min]) min = j
      }
      if (min !== i) {
        const t = a[i]
        a[i] = a[min]
        a[min] = t
        counters.swaps++
      }
    }
    return a
  },
}

export const mergeSort: Runnable = {
  generateInput: arrayInput,
  estimateMemoryBytes: (n) => n * 16,
  run: (input, { counters }: BenchmarkContext) => {
    const a = (input as number[]).slice()
    const aux = new Array<number>(a.length)
    const merge = (lo: number, mid: number, hi: number) => {
      for (let k = lo; k <= hi; k++) aux[k] = a[k]
      let i = lo
      let j = mid + 1
      for (let k = lo; k <= hi; k++) {
        if (i > mid) a[k] = aux[j++]
        else if (j > hi) a[k] = aux[i++]
        else {
          counters.comparisons++
          if (aux[j] < aux[i]) a[k] = aux[j++]
          else a[k] = aux[i++]
        }
        counters.writes++
      }
    }
    const sort = (lo: number, hi: number) => {
      if (hi <= lo) return
      const mid = (lo + (hi - lo) / 2) | 0
      sort(lo, mid)
      sort(mid + 1, hi)
      merge(lo, mid, hi)
    }
    sort(0, a.length - 1)
    return a
  },
}

export const quickSort: Runnable = {
  generateInput: arrayInput,
  estimateMemoryBytes: (n) => Math.ceil(Math.log2(n + 1)) * 16,
  run: (input, { counters }: BenchmarkContext) => {
    const a = (input as number[]).slice()
    const swap = (i: number, j: number) => {
      const t = a[i]
      a[i] = a[j]
      a[j] = t
      counters.swaps++
    }
    // Iterative to avoid deep recursion on large inputs.
    const stack: Array<[number, number]> = [[0, a.length - 1]]
    while (stack.length) {
      const [lo, hi] = stack.pop()!
      if (lo >= hi) continue
      const mid = (lo + (hi - lo) / 2) | 0
      const pivot = a[mid]
      let i = lo
      let j = hi
      while (i <= j) {
        while (true) {
          counters.comparisons++
          if (a[i] < pivot) i++
          else break
        }
        while (true) {
          counters.comparisons++
          if (a[j] > pivot) j--
          else break
        }
        if (i <= j) {
          swap(i, j)
          i++
          j--
        }
      }
      stack.push([lo, j])
      stack.push([i, hi])
    }
    return a
  },
}

export const heapSort: Runnable = {
  generateInput: arrayInput,
  estimateMemoryBytes: () => 32,
  run: (input, { counters }: BenchmarkContext) => {
    const a = (input as number[]).slice()
    const n = a.length
    const swap = (i: number, j: number) => {
      const t = a[i]
      a[i] = a[j]
      a[j] = t
      counters.swaps++
    }
    const sift = (start: number, end: number) => {
      let root = start
      while (root * 2 + 1 <= end) {
        let child = root * 2 + 1
        if (child + 1 <= end) {
          counters.comparisons++
          if (a[child] < a[child + 1]) child++
        }
        counters.comparisons++
        if (a[root] < a[child]) {
          swap(root, child)
          root = child
        } else break
      }
    }
    for (let start = ((n - 2) / 2) | 0; start >= 0; start--) sift(start, n - 1)
    for (let end = n - 1; end > 0; end--) {
      swap(0, end)
      sift(0, end - 1)
    }
    return a
  },
}

/** LSD radix sort for non-negative integers. */
export const radixSort: Runnable = {
  generateInput: arrayInput,
  estimateMemoryBytes: (n) => n * 16 + 256 * 8,
  run: (input, { counters }: BenchmarkContext) => {
    let a = (input as number[]).slice()
    const n = a.length
    if (n === 0) return a
    let max = 0
    for (let i = 0; i < n; i++) {
      counters.reads++
      if (a[i] > max) max = a[i]
    }
    let output = new Array<number>(n)
    for (let exp = 1; (max / exp) | 0; exp *= 256) {
      const count = new Array<number>(256).fill(0)
      for (let i = 0; i < n; i++) count[((a[i] / exp) | 0) & 0xff]++
      for (let i = 1; i < 256; i++) count[i] += count[i - 1]
      for (let i = n - 1; i >= 0; i--) {
        const b = ((a[i] / exp) | 0) & 0xff
        output[--count[b]] = a[i]
        counters.writes++
      }
      const tmp = a
      a = output
      output = tmp
    }
    return a
  },
}

/* ------------------------------------------------------------------ */
/* Searching                                                           */
/* ------------------------------------------------------------------ */

export const linearSearch: Runnable = {
  generateInput: (size) => ({ arr: randomArray(size), target: -1 }),
  estimateMemoryBytes: () => 16,
  run: (input, { counters }: BenchmarkContext) => {
    const { arr, target } = input as { arr: number[]; target: number }
    for (let i = 0; i < arr.length; i++) {
      counters.comparisons++
      if (arr[i] === target) return i
    }
    return -1
  },
}

export const binarySearch: Runnable = {
  generateInput: (size) => ({ arr: sortedArray(size), target: -1 }),
  estimateMemoryBytes: () => 16,
  run: (input, { counters }: BenchmarkContext) => {
    const { arr, target } = input as { arr: number[]; target: number }
    let lo = 0
    let hi = arr.length - 1
    while (lo <= hi) {
      const mid = (lo + (hi - lo) / 2) | 0
      counters.comparisons++
      if (arr[mid] === target) return mid
      else if (arr[mid] < target) lo = mid + 1
      else hi = mid - 1
    }
    return -1
  },
}
