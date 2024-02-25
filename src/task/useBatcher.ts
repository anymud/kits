import { Batcher } from '../../kit/task/batcher'
import type { UnwrapArray, UnwrapPromise } from '../../kit/type'

export function useBatcher<F extends (input: any[]) => Promise<any[]>>(fn: F) {
  return new Batcher<UnwrapArray<Parameters<F>[0]>, UnwrapArray<UnwrapPromise<ReturnType<F>>>>(fn)
}
