import type { IDisposable } from '~/kit/disposable'
import { CancellationToken } from '~/kit/promise/cancellationToken'
import type { Action } from '~/kit/type'

export class CancellationTokenSource implements IDisposable {
  private _token: CancellationToken | undefined
  private _isCancellationRequested = false
  private callbacks: Action[] = []
  private _timer: NodeJS.Timeout | undefined
  constructor() {
  }

  cancelAfter(delay: number) {
    if (this._timer) {
      clearTimeout(this._timer)
      this._timer = undefined
    }
    this._timer = setTimeout(() => this.cancel(), delay)
  }

  cancel() {
    if (this._isCancellationRequested)
      return

    this._isCancellationRequested = true
    this.callbacks.forEach(x => x())

    // clear
    this.callbacks = []
    if (this._timer) {
      clearTimeout(this._timer)
      this._timer = undefined
    }
  }

  register(callback: Action) {
    if (this.isCancellationRequested)
      callback()

    else this.callbacks.push(callback)
  }

  get token() {
    this._token = this._token ?? new CancellationToken(this)
    return this._token
  }

  get isCancellationRequested() {
    return this._isCancellationRequested
  }

  dispose(): void {
    this.cancel()
  }
}
