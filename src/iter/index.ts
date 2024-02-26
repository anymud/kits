import type { Range, Tuple, UnwrapArray } from '../types'

export function* repeat(val: number, num: number): Generator<number> {
  for (let i = 0; i < num; i++)
    yield val
}

export function zip<T extends Tuple<number> | [never], U extends { [K in keyof T]: U[K] }>(a: T, b: U): Generator<[T[number], U[number]]>
export function* zip<A, B>(a: A[], b: B[]): Generator<[A, B]> {
  const size = a.length
  if (b.length !== size)
    throw new Error(`two lists must have equal size. ${a.length} != ${b.length}`)
  for (let i = 0; i < size; i++)
    yield [a[i], b[i]]
}

export function* range(start: number, end: number, step = 1): Generator<number> {
  for (let i = start; i < end; i += step)
    yield i
}

export function* rangeRight(start: number, end: number, step = 1): Generator<number> {
  for (let i = end - step; i >= start; i -= step)
    yield i
}

export function* rangeBy(start: number, end: number, step: number): Generator<number> {
  if (step > 0)
    for (let i = start; i < end; i += step)
      yield i
  else
    for (let i = start; i > end; i += step)
      yield i
}

export function* rangeByRight(start: number, end: number, step: number): Generator<number> {
  if (step > 0)
    for (let i = end - step; i >= start; i -= step)
      yield i
  else
    for (let i = end; i < start; i -= step)
      yield i
}

export function* repeatBy<T>(val: T, num: number): Generator<T> {
  for (let i = 0; i < num; i++)
    yield val
}

export function* cycle<T>(arr: T[]): Generator<T> {
  while (true)
    for (const val of arr)
      yield val
}

export function* cycleBy<T>(gen: Generator<T>): Generator<T> {
  while (true)
    for (const val of gen)
      yield val
}

export function* map<T, U>(gen: Generator<T>, fn: (val: T) => U): Generator<U> {
  for (const val of gen)
    yield fn(val)
}

export function* filter<T>(gen: Generator<T>, fn: (val: T) => boolean): Generator<T> {
  for (const val of gen)
    if (fn(val))
      yield val
}

export function* take<T>(gen: Generator<T>, num: number): Generator<T> {
  let i = 0
  for (const val of gen) {
    if (i++ >= num)
      break
    yield val
  }
}

export function* takeWhile<T>(gen: Generator<T>, fn: (val: T) => boolean): Generator<T> {
  for (const val of gen) {
    if (!fn(val))
      break
    yield val
  }
}

export function* skip<T>(gen: Generator<T>, num: number): Generator<T> {
  let i = 0
  for (const val of gen) {
    if (i++ < num)
      continue
    yield val
  }
}

export function* skipWhile<T>(gen: Generator<T>, fn: (val: T) => boolean): Generator<T> {
  let skip = true
  for (const val of gen) {
    if (skip && fn(val))
      continue
    skip = false
    yield val
  }
}

export function* concat<T>(...gens: Generator<T>[]): Generator<T> {
  for (const gen of gens)
    for (const val of gen)
      yield val
}

export function* chain<T>(...gens: Generator<T>[]): Generator<T> {
  for (const gen of gens)
    yield* gen
}

export function* flatten<T>(gen: Generator<Generator<T>>): Generator<T> {
  for (const val of gen)
    yield* val
}

export function* flatMap<T, U>(gen: Generator<T>, fn: (val: T) => Generator<U>): Generator<U> {
  for (const val of gen)
    yield* fn(val)
}

export function* enumerate<T>(gen: Generator<T>): Generator<[number, T]> {
  let i = 0
  for (const val of gen)
    yield [i++, val]
}

export function* reverse<T>(gen: Generator<T>): Generator<T> {
  const arr = [...gen]
  for (let i = arr.length - 1; i >= 0; i--)
    yield arr[i]
}

export function* unique<T>(gen: Generator<T>): Generator<T> {
  const set = new Set<T>()
  for (const val of gen)
    if (!set.has(val)) {
      set.add(val)
      yield val
    }
}

export function* chunk<T>(gen: Generator<T>, size: number): Generator<T[]> {
  let arr = []
  for (const val of gen) {
    arr.push(val)
    if (arr.length === size) {
      yield arr
      arr = []
    }
  }
  if (arr.length)
    yield arr
}

export function* window<T>(gen: Generator<T>, size: number): Generator<T[]> {
  let arr = [] as T[]
  for (const val of gen) {
    arr.push(val)
    if (arr.length === size) {
      yield arr
      arr = arr.slice(1)
    }
  }
}

export function* pairwise<T>(gen: Generator<T>): Generator<[T, T]> {
  let prev = gen.next()
  if (prev.done)
    return
  for (const val of gen) {
    yield [prev.value, val]
    prev = { value: val, done: false }
  }
}



