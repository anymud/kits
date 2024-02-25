import type { ObjectDirective } from '@vue/runtime-core'
import { isClient, tryOnMounted, useBrowserLocation } from '@vueuse/core'
import { toValue, type ReadonlyRefOrGetter } from '@vueuse/shared'
import { isEqual } from '../../kit/utils'
import {absoluteTo, getHost, getOrigin, isAbsolute, toString} from '../../kit/text/uri'
import { isObject } from '../type'
import type { MayBePromise } from '../type'

export function useUrl(): ComputedRef<string> {
  // return useState(() => {
  if (isClient) {
    const browserLocation = useBrowserLocation()
    const route = useRoute()
    return computed(() => browserLocation.value.origin + route.fullPath)
  }
  else {
    // if (!getCurrentScope())
    //   throw new Error('We are not in the scope. please check.')
    const url = useRequestURL()
    return computed(() => url.toString())
  }
  // })
}

export function useHost<T extends string | undefined>(url?: MaybeRefOrGetter<T>) {
  const targetUrl = url ? useAbsoluteUrl(url) : useUrl()
  return computed(() => {
    const value = toValue(targetUrl)
    return value ? getHost(value) : undefined
  })
}

export function useOrigin<T extends string | undefined>(url?: MaybeRefOrGetter<T>) {
  const targetUrl = url ? useAbsoluteUrl(url) : useUrl()
  return computed(() => {
    const value = toValue(targetUrl)
    return value ? getOrigin(value) : undefined
  })
}

export function useAbsoluteUrl<T extends string | undefined, T2 extends string | undefined>(url: MaybeRefOrGetter<T>, baseUrl?: MaybeRefOrGetter<T2>) : ComputedRef<string | undefined> {
  const targetBaseUrl = baseUrl ? resolveRef(baseUrl) : useUrl()
  return computed(() => {
    const value = resolveUnref(url)
    if (!value)
      return value
    if (isAbsolute(value))
      return value

    if (!targetBaseUrl.value)
      throw new Error(`Failed to turn this to absolute url. current url is missing. url = ${value}`)

    return toString(absoluteTo(value, targetBaseUrl.value))
  })
}
//
// export function isMobile() {
//   const userAgent = isClient ? window?.navigator?.userAgent : useRequestHeaders()?.['user-agent']
//   if (!userAgent)
//     return false
//   const mobileDetect = new MobileDetect(userAgent)
//   return !!mobileDetect.mobile()
// }

export interface IWindowOptions {
  height?: number
  width?: number
  left?: number
  top?: number
  resizable?: boolean
  scrollbars?: boolean
  toolbar?: boolean
  menubar?: boolean
  location?: boolean
  directories?: boolean
  status?: boolean
}

export function openWindow(url: string, target?: string, options: IWindowOptions = {}): Window | undefined {
  return window.open(
    url,
    target,
    Object.entries(options).map(x => `${x[0]}=${Number(x[1])}`).join(','),
  ) ?? undefined
}

export function openPopupWindow(url: string, target?: string): Window | undefined {
  return openWindow(
    url,
    target,
    {
      height: 454,
      width: 580,
      left: 0,
      top: 200,
      resizable: true,
      scrollbars: true,
      toolbar: true,
      menubar: false,
      location: false,
      directories: false,
      status: true,
    })
}

type MayBeFunction<T> = (() => T) | T
export function defineObjectDirective<T = any, V = any>(directive: MayBeFunction<ObjectDirective<T, V>>) {
  if (directive instanceof Function)
    return directive()
  else
    return directive
}

export async function awaitableComputedAsync<T = any>(getter: () => Promise<T>) {
  const promise = computed(getter)
  await promise.value
  return asyncComputed(() => promise.value)
}

export function resolveUnrefDeep<T>(value: MaybeDeepRef<T>): T {
  let valueUnref = resolveUnref(value)
  if (isObject(valueUnref)) {
    valueUnref = Object.assign({}, valueUnref)
    for (const key in valueUnref)
      valueUnref[key] = resolveUnref(valueUnref[key])
  }
  return valueUnref as T
}

export function useDistinctDeep<T>(value: MaybeDeepRef<T>): Ref<T> {
  const result = ref()
  watch(() => resolveUnrefDeep(value), (x, p) => {
    if (!isEqual(x, p))
      result.value = x
  }, { deep: true })
  return result
}

// type Awaitable<T> = T | Promise<T>
// function computedAsync<T>(getter: Func<[], Promise<T>>): Awaitable<Ref<T>> {
//   const result = ref<T>()
//   let promise: Promise<Ref<T>>
//   watchEffect(() => {
//     promise = getter().then((x) => {
//       result.value = x
//       return result as Ref<T>
//     })
//   })
//   return new Proxy(result, {
//     get(target: any, p: string | symbol, receiver: any): any {
//       if (p === 'then')
//         return promise.then.bind(promise)
//       return target[p]
//     },
//   })
// }

export type MaybeDeepRef<T> = ReadonlyRefOrGetter<T extends object
  ? { [K in keyof T]: MaybeDeepRef<T[K]> }
  : T>


export function tryOnMountedAsync<T>(fn: () => MayBePromise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    tryOnMounted(async () => {
      try {
        const result = await fn()
        resolve(result)
      } catch (e) {
        reject(e)
      }
    })
  })
}
