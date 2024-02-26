import type { MayBeArray } from './types'
import {isArray, isObject, throwError} from './types'

type ObjectSelector<T, K, R = T> = (value: T, key: K) => R
type ObjectPredicate<T, K> = ObjectSelector<T, K, boolean>
type Selector<T, R = T> = (value: T, index: number) => R
type Predicate<T> = Selector<T, boolean>
type Comparer<T> = (value1: T, value2: T) => number

function not<T>(predicate: Predicate<T>): Predicate<T> {
  return (value, index) => !predicate(value, index)
}

export function reduce<T, R>(iterable: Iterable<T>, fn: (accumulator: R, value: T, index: number) => R, initialValue: R) {
  return asArray(iterable).reduce(fn, initialValue)
}


export function getLast<T>(iterable: Iterable<T>) {
  const arr = asArray(iterable)
  return arr[arr.length - 1]
}
export function getFirst<T>(iterable: Iterable<T>) {
  const arr = asArray(iterable)
  return arr[0]
}

export function resolveFirst<T>(maybeArray: T[] | T) {
  return Array.isArray(maybeArray) ? getFirst(maybeArray) : maybeArray
}

export function resolveLast<T>(maybeArray: T[] | T) {
  return Array.isArray(maybeArray) ? getLast(maybeArray) : maybeArray
}

export function split(str: string, separator = '-') {
  return str.split(separator)
}


export function bind<T extends Record<string | symbol, any>>(_this: T): T {
  return new Proxy<T>(_this, {
    get(target: T, p: string | symbol, receiver: any): any {
      if (target[p] instanceof Function)
        return target[p].bind(target)
      return target[p]
    },
  })
}

export function mapValues<K extends PropertyKey, T, R>(obj: Record<K, T>, selector: ObjectSelector<T, K, R>) {
  const newObj: Record<PropertyKey, R> = {}
  for (const [key, value] of entries(obj))
    newObj[key] = selector(value, key)
  return newObj as Record<K, R>
}

export function groupBy<T, K extends PropertyKey>(iterable: Iterable<T>, selector: Selector<T, K>) {
  const arr = asArray(iterable)
  const obj: Record<PropertyKey, T[]> = Object.create(null)
  for (let i = 0; i < arr.length; i++) {
    const value = arr[i]
    const key = selector(value, i)
    obj[key] ||= []
    obj[key].push(value)
  }
  return obj as Record<K, T[]>
}

export function flatMap<T, R>(collection: T[], fn: Selector<T, R[]>) {
  return collection.flatMap(fn)
}

export function join(iterable: Iterable<string>, separator?: string) {
  return asArray(iterable).join(separator)
}


export function asArray<T>(iterable: Iterable<T>): T[] {
  return isArray(iterable) ? iterable : Array.from(iterable)
}

export function min(obj: Iterable<number>): number {
  return Math.min(...obj)
}

export function minBy<T>(obj: Iterable<T>, selector: Selector<T, number>) {
  return Math.min(...map(obj, selector))
}
export function concat<T1, T2>(collection1: Iterable<T1>, collection2: Iterable<T2>) {
  return [...collection1, ...collection2]
}

export function max(obj: number[]): number {
  return Math.max(...obj)
}

export function maxBy<T>(iterable: Iterable<T>, selector: Selector<T, number>): number {
  const arr = asArray(iterable)
  return Math.max(...arr.map(selector))
}

export function sum(iterable: Iterable<number>, weights?: Iterable<number>): number {
  const arr = asArray(iterable)
  const weightsArr = weights ? asArray(weights) : Array(arr.length).fill(1)
  return arr.map((x, i) => x * weightsArr[i]).reduce((p, x) => p + x, 0)
}

export function sumBy<T>(iterable: Iterable<T>, selector: Selector<T, number>, weight?: Selector<T, number>): number {
  const arr = asArray(iterable)
  return arr.reduce((p, x, i) => p + selector(x, i) * (weight?.(x, i) ?? 1), 0)
}

export function mean(iterable: Iterable<number>, weights?: Iterable<number>): number {
  const arr = asArray(iterable)
  const total = weights ? sum(weights) : arr.length
  return sum(iterable, weights) / total
}

export function meanBy<T>(iterable: Iterable<T>, selector: Selector<T, number>, weight?: Selector<T, number>): number {
  const arr = asArray(iterable)
  const total = weight ? sumBy(arr, weight) : arr.length
  return sumBy(arr, selector, weight) / total
}

export function size(obj: Iterable<any> | Record<any, any>): number {
  return obj instanceof Map
    ? obj.size
    : obj instanceof Set
      ? obj.size
      : isArray(obj)
        ? obj.length
        : Object.keys(obj).length
}

export function keys<K extends PropertyKey, T>(obj: Record<K, T>) {
  return Object.keys(obj) as K[]
}

export function values<K extends PropertyKey, T>(obj: Record<K, T>) {
  return Object.values(obj) as T[]
}

export function entries<K extends PropertyKey, T>(obj: Record<K, T>) {
  return Object.entries(obj) as [K, T][]
}

export function fromEntries<K extends PropertyKey, T>(obj: Iterable<readonly [K, T]>) {
  return Object.fromEntries(obj) as Record<K, T>
}
export function pickBy<K extends PropertyKey, T>(obj: Record<K, T>, predicate: ObjectPredicate<T, K>) {
  const newObj: Record<PropertyKey, T> = {}
  for (const [key, value] of entries(obj)) {
    if (predicate(value, key))
      newObj[key] = value
  }
  return newObj as Record<K, T>
}

export function uniq<T>(iterable: Iterable<T>) {
  return [...new Set(iterable)]
}

export function keyBy<K extends PropertyKey, T>(iterable: Iterable<T>, selector: Selector<T, K>) {
  return fromEntries(map(iterable, (x, i) => [selector(x, i), x]))
}

export function merge<K extends PropertyKey, T, K2 extends PropertyKey, T2>(obj: Record<K, T>, ...sources: Record<K2, T2>[]) {
  const result: Record<PropertyKey, any> = { ...obj }
  for (const source of sources) {
    for (const [key, value] of entries(source)) {
      if (isObject(result[key]) && isObject(value))
        result[key] = merge(result[key], value)
      else
        result[key] = value
    }
  }
  return result as Record<K | K2, T & T2>
}

export function skip<T>(iterable: Iterable<T>, size: number) {
  return filter(iterable, (_, i) => i >= size)
}

export function take<T>(iterable: Iterable<T>, size: number) {
  return filter(iterable, (_, i) => i < size)
}

export function map<T, K>(iterable: Iterable<T>, fn: Selector<T, K>) {
  return Array.from(iterable, fn)
}

export function cursor<T, I>(iterable: Iterable<T>, indexSelector: Selector<T, I>, value: I) {
  const arr = asArray(iterable)
  const index = arr.map(indexSelector).indexOf(value)
  return filter(arr, (_, i) => i >= index)
}

export function page<T, I>(iterable: Iterable<T>, size: number, indexSelector: Selector<T, I>, cursorValue?: I | undefined) {
  return take(skip(cursor(iterable, indexSelector, cursorValue), cursorValue ? 1 : 0), size)
}

export function filter<T>(iterable: Iterable<T>, predicate: Selector<T, boolean>) {
  return asArray(iterable).filter(predicate)
}

export function chunk<T>(iterable: Iterable<T>, size: number) {
  const arr = asArray(iterable)
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size)
    result.push(arr.slice(i, i + size))
  return result
}

export function first<T>(iterable: Iterable<T>) {
  const arr = asArray(iterable)
  return arr.length > 0 ? arr[0] : undefined
}

export function firstOrThrow<T>(iterable: Iterable<T>) {
  return throwIfUndefined(first(iterable))
}

export function throwIfUndefined<T>(value: T | undefined) {
  return value ?? throwError('value is undefined.')
}
export function indexOf<T>(iterable: Iterable<T>, predicate: Predicate<T>) {
  const arr = asArray(iterable)
  return arr.map(predicate).indexOf(true)
}

export function lastIndexOf<T>(iterable: Iterable<T>, predicate: Predicate<T>) {
  const arr = asArray(iterable)
  return arr.map(predicate).reverse().indexOf(true)
}

export function trim<T>(iterable: Iterable<T>, predicate: Predicate<T>) {
  const arr = asArray(iterable)
  const firstIndex = indexOf(arr, not(predicate))
  const lastIndex = lastIndexOf(arr, not(predicate))
  return firstIndex >= 0 && lastIndex >= 0 ? arr.slice(firstIndex, lastIndex + 1) : [...arr]
}

export function last<T>(iterable: Iterable<T>) {
  const arr = asArray(iterable)
  return arr.length > 0 ? arr[arr.length - 1] : undefined
}

export function lastOrThrow<T>(iterable: Iterable<T>) {
  return throwIfUndefined(last(iterable))
}

export function sample<T>(iterable: Iterable<T>) {
  const arr = asArray(iterable)
  return arr[Math.floor(Math.random() * arr.length)]
}

export function shuffle<T>(iterable: Iterable<T>) {
  return orderBy(iterable,_ => Math.random())
}

export function withData<T, D>(iterable: Iterable<T>, selector: Selector<T, D>) {
  const arr = asArray(iterable)
  return arr.map((x, i) => ({
    value: x,
    data: selector(x, i),
  }))
}

export function sampleSize<T>(iterable: Iterable<T>, size: number) {
  return take(shuffle(iterable), size)
}

// export function orderBy<T>(collection: T[], iteratees: MayBeArray<(value: T) => number | number[]>, orders: MayBeArray<('desc' | 'asc')> = 'asc') {
  export function orderBy<T>(
    iterable: Iterable<T>, 
    iteratees: MayBeArray<(value: T) => string | number>, 
    orders: MayBeArray<'desc' | 'asc'> = 'asc'
  ) {
    const iterateesArr = isArray(iteratees) ? iteratees : [iteratees];
    const ordersArr = isArray(orders) ? orders : [orders];
    
    return Array.from(iterable).sort((a, b) => {
      for (let index = 0; index < iterateesArr.length; index++) {
        const iteratee = iterateesArr[index];
        const order = ordersArr[index] ?? 'asc';
  
        const aV = iteratee(a);
        const bV = iteratee(b);
  
        // Handle string comparison
        if (typeof aV === 'string' && typeof bV === 'string') {
          const comparison = aV.localeCompare(bV);
          if (comparison !== 0) return order === 'asc' ? comparison : -comparison;
        } else if (typeof aV === 'number' && typeof bV === 'number') {
          // Handle number comparison, including NaN checks
          if (isNaN(aV) && !isNaN(bV)) return 1;
          if (!isNaN(aV) && isNaN(bV)) return -1;
          return (order === 'desc' ? aV < bV : aV > bV) ? 1 : -1;
        }
      }
      return 0; // No difference
    });
  }

export function orderWith<T, V>(iterable: Iterable<T>, selector: Selector<T, V>, compare: Comparer<V>) {
  return withData(iterable, selector).sort((a, b) => compare(a.data, b.data)).map(x => x.value)
}


export function words(text: string) {
  return text.match(/([A-Z]?[a-z]+)|[A-Z]+/gu) ?? []
}

export function camelCase(text: string) {
  return lowerFirst(words(text).map(x => upperFirst(x.toLowerCase())).join(''))
}

export function isIterable(value: any): value is Iterable<any> {
  return value && typeof value[Symbol.iterator] === 'function'
}

export function isEmpty(value: any) {
  return value === undefined || value === null || (isIterable(value) && size(value) === 0) || (typeof value === 'string' && value.trim() === '')
}

export function snakeCase(text: string) {
  return words(text).map(x => x.toLowerCase()).join('_')
}

export function kebabCase(text: string) {
  return words(text).map(x => x.toLowerCase()).join('-')
}

export function toUpper(text: string, locales?: string | string[] | undefined) {
  return text.toLocaleUpperCase(locales)
}

export function toLower(text: string, locales?: string | string[] | undefined) {
  return text.toLocaleLowerCase(locales)
}

// export function upperFirst([ first='', ...rest ]: string, locales?: string | string[] | undefined) {
//   return [ first.toLocaleUpperCase(locales), ...rest ].join('');
// }

/* Reference: https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript */
export function upperFirst(str: string, locales?: string | string[] | undefined) {
  return str.replace(/^\p{CWU}/u, char => char.toLocaleUpperCase(locales))
}
/* Reference: https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript */
export function lowerFirst(str: string, locales?: string | string[] | undefined) {
  return str.replace(/^\p{CWL}/u, char => char.toLocaleLowerCase(locales))
}
export function compact<T>(iterable: Iterable<T>) {
  const arr = asArray(iterable)
  return arr.filter(x => !!x)
}

export function isEqual(x: any, y: any, visited = new WeakMap()): boolean {
  // Check if x and y are identical
  if (x === y) {
    return true;
  }

  // Check for NaN equality
  if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
    return true;
  }

  // Check if x and y are both objects
  if (typeof x !== 'object' || typeof y !== 'object' || x === null || y === null) {
    return false;
  }

  // Check if x and y have already been visited
  if (visited.get(x) === y || visited.get(y) === x) {
    return true;
  }

  // Add x and y to the visited set
  visited.set(x, y);
  visited.set(y, x);

  // Check for built-in objects
  if ((x instanceof Date && y instanceof Date) ||
      (x instanceof RegExp && y instanceof RegExp) ||
      (x instanceof String && y instanceof String) ||
      (x instanceof Number && y instanceof Number)) {
    return x.toString() === y.toString();
  }

  // Rest of your comparison logic goes here...

  // Recursively compare properties of x and y
  for (const key in x) {
    if (!isEqual(x[key], y[key], visited)) {
      return false;
    }
  }

  for (const key in y) {
    if (!(key in x) && y.hasOwnProperty(key)) {
      return false;
    }
  }

  return true;
}