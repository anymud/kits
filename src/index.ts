import type { Nullable } from '@antfu/utils'
import type { Promisable } from 'type-fest'
import { isPromise } from './types'

export function tryOrDefault<T>(fn: () => T): Nullable<T>
export function tryOrDefault<T>(fn: () => Promisable<T>): Promise<Nullable<T>>
export function tryOrDefault<T>(fn: () => T, defaultValue: T): T
export function tryOrDefault<T, D>(fn: () => T, defaultValue: D): T | D
export function tryOrDefault<T, D>(fn: () => Promisable<T>, defaultValue: D): Promise<T | D>
export function tryOrDefault<T, D>(fn: () => Promisable<T>, defaultValue?: D): any {
  try {
    const result = fn()
    return isPromise(result) ? result.catch(_ => defaultValue) : result
  }
  catch (e) {
    return defaultValue ?? null
  }
}

export function objectFunc<I, F extends Function>(instance: I, caller: (instance: I) => F): F {
  return caller(instance).bind(instance)
}


export function asError(e: any): Error {
  if (e instanceof Error)
    return e
  return new Error(String(e))
}
