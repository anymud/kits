import { EventEmitter as EventEmitter } from 'events'

export type TypedEventEmitter<T> = {
  on(event: string, listener: (value: T) => void): void
  off(event: string, listener: (value: T) => void): void
  emit(event: string, value: T): boolean
  addListener(event: string, listener: (value: T) => void): void
  removeListener(event: string, listener: (value: T) => void): void
  once(event: string, listener: (value: T) => void): void
  prependListener(event: string, listener: (value: T) => void): void
  prependOnceListener(event: string, listener: (value: T) => void): void
  removeAllListeners(event?: string): void
  listeners(event: string): ((value: T) => void)[]
  rawListeners(event: string): ((value: T) => void)[]
  listenerCount(event: string): number
  eventNames(): string[]
  getMaxListeners(): number
  setMaxListeners(n: number): void
}

function createTypedEventEmitter<T>(): TypedEventEmitter<T> {
  return new EventEmitter() as any
}
