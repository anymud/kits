import isPromise,  { type UnwrapPromise, type MayBePromise } from '../../kit/type'

export class Timer {
  private startTime: number | undefined
  private endTime: number | undefined

  start() {
    this.startTime = performance.now()
  }

  stop() {
    this.endTime = performance.now()
  }

  get elapsed() {
    return this.startTime ? (this.endTime ?? performance.now()) - this.startTime : 0
  }
}

export function startTimer() {
  const timer = new Timer()
  timer.start()
  return timer
}

export function time<T extends MayBePromise<unknown>>(fn: () => T): T extends Promise<infer U> ? Promise<[U, Timer]> : T
export function time<T extends MayBePromise<unknown>>(fn: () => T, callback: (timer: Timer, result: UnwrapPromise<T>) => void): T
export function time<T extends MayBePromise<unknown>>(fn: () => T, callback?: (timer: Timer, result: UnwrapPromise<T>) => void) {
  const timer = startTimer()
  const result = fn()
  function processResult(result: T) {
    if (callback instanceof Function) {
      callback(timer, result as UnwrapPromise<T>)
      return result
    }
    else {
      return [result, timer] as const
    }
  }
  if (isPromise(result)) {
    return result.then((x) => {
      timer.stop()
      return processResult(x as T)
    }) as T
  }
  else {
    timer.stop()
    return processResult(result)
  }
}
