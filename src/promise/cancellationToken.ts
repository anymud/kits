import { Lazy } from '~/kit/lazy'
import { CancellationTokenSource } from '~/kit/promise/cancellationTokenSource'
import type { Action } from '~/kit/type'

export class CancellationToken {
  constructor(private cancellationTokenSource: CancellationTokenSource) {
  }

  get isCanceled() {
    return this.cancellationTokenSource.isCancellationRequested
  }

  throwIfCancellationRequested(): never | void {
    if (this.isCanceled)
      throw new OperationCanceledError(this)
  }

  register(callback: Action) {
    this.cancellationTokenSource.register(callback)
  }

  private static CanceledLazy = new Lazy(() => {
    const cts = new CancellationTokenSource()
    cts.cancel()
    return cts.token
  })

  static get Canceled() {
    return CancellationToken.CanceledLazy.value
  }

  private static NoneLazy = new Lazy(() => {
    const cts = new CancellationTokenSource()
    return cts.token
  })

  static get None() {
    return CancellationToken.NoneLazy.value
  }
}

export class OperationCanceledError extends Error {
  constructor(public readonly token: CancellationToken) {
    super('A task was canceled.')
  }
}
