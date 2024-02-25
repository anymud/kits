import { hasOwn, isFunction, isObject } from '../../kit/type'

export interface IDisposable {
  dispose(): void
}

export interface IAsyncDisposable {
  disposeAsync(): Promise<void>
}

export function isDisposable(value: unknown): value is IDisposable {
  return isObject(value) && hasOwn(value, 'dispose') && isFunction(value.dispose)
}

export function isAsyncDisposable(value: unknown): value is IAsyncDisposable {
  return isObject(value) && hasOwn(value, 'disposeAsync') && isFunction(value.disposeAsync)
}

// export class SerialAsyncDisposable implements IAsyncDisposable {
//   constructor(private _disposable?: IAsyncDisposable) {
//   }
//
//   async set(value: IAsyncDisposable) {
//     this._disposable
//   }
// }

export class CompositeDisposable implements IDisposable, IAsyncDisposable {
  constructor(private disposables: (IDisposable | IAsyncDisposable)[] = []) {
  }

  add(...disposables: (IDisposable | IAsyncDisposable)[]) {
    this.disposables.push(...disposables)
  }

  dispose() {
    for (const disposable of this.disposables) {
      if (isDisposable(disposable))
        disposable.dispose()
      else
        throw new Error('contains async disposable, please use disposeAsync()')
    }
  }

  async disposeAsync(): Promise<void> {
    for (const disposable of this.disposables) {
      if (isDisposable(disposable))
        disposable.dispose()
      else
        await disposable.disposeAsync()
    }
  }
}

export class CompositeAsyncDisposable implements IAsyncDisposable {
  constructor(private disposables: IAsyncDisposable[] = []) {
  }

  add(...disposables: IAsyncDisposable[]) {
    this.disposables.push(...disposables)
  }

  async disposeAsync() {
    for (const disposable of this.disposables)
      await disposable.disposeAsync()
  }
}

type Func<Args extends any[] = void[], Result = void> = (...args: Args) => Result
interface EventEmitterLike<EventName extends string | symbol = string, Handler extends Func<any[]> = Func<any[]>> {
  on(eventName: EventName, handler: Handler): any
  off(eventName: EventName, handler: Handler): any
}
export class Disposable implements IDisposable {
  constructor(private disposeFunc: Func) {
  }

  dispose() {
    this.disposeFunc()
  }

  static on<T extends EventEmitterLike,
    EventName extends Parameters<T['on']>[0]>(eventEmitter: T, eventName: EventName, handler: Func<any[]>): IDisposable {
    eventEmitter.on(eventName, handler)
    return {
      dispose() {
        eventEmitter.off(eventName, handler)
      },
    }
  }

  static create(disposeFunc: Func) {
    return new Disposable(disposeFunc)
  }
}
export class AsyncDisposable implements IAsyncDisposable {
  constructor(private disposeFuncAsync: Func<void[], Promise<void>>) {
  }

  async disposeAsync() {
    await this.disposeFuncAsync()
  }

  static create(disposeFuncAsync: Func<void[], Promise<void>>) {
    return new AsyncDisposable(disposeFuncAsync)
  }
}
