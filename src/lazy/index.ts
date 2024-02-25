export class Lazy<T> {
  private _generator: () => T
  private _value: T | undefined = undefined
  private _hasValue = false
  constructor(generator: () => T) {
    this._generator = generator
  }

  get value(): T {
    if (!this._hasValue) {
      this._hasValue = true
      this._value = this._generator()
    }
    return this._value as T
  }
}
class AsyncLazy<T> {
  private _generator: () => Promise<T>
  private _value: T | undefined = undefined
  private _hasValue = false
  constructor(generator: () => Promise<T>) {
    this._generator = generator
  }

  async value(): Promise<T> {
    if (!this._hasValue) {
      this._hasValue = true
      this._value = await this._generator()
    }
    return this._value as T
  }
}

export function useLazy<T>(generator: () => T) {
  return new Lazy<T>(generator)
}

export function useAsyncLazy<T>(generator: () => Promise<T>) {
  return new AsyncLazy<T>(generator)
}

export function defineLazy<T>(setup: () => T) {
  const lazy = useLazy(setup)
  return () => lazy.value
}

export function defineAsyncLazy<T>(setup: () => Promise<T>) {
  const lazy = useAsyncLazy(setup)
  return () => lazy.value()
}
