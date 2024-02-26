import { isPromise } from "../types"

export function groupBy<T, K>(keySelector: (item: T) => K) {
    return async function* (source: AsyncGenerator<T>) {
        const groups = new Map<K, T[]>()
        for await (const item of source) {
            const key = keySelector(item)
            if (!groups.has(key)) {
                groups.set(key, [])
            }
            groups.get(key)!.push(item)
        }
        for (const [key, value] of groups) {
            yield [key, value] as [K, T[]]
        }
    }
}

export function mapValues<T, U>(mapper: (item: T) => U) {
    return async function* (source: AsyncGenerator<[string, T[]]>) {
        for await (const [key, value] of source) {
            yield [key, value.map(mapper)] as [string, U[]]
        }
    }
}

export function values<T>() {
    return async function* (source: AsyncGenerator<[string, T[]]>) {
        for await (const [_, value] of source) {
            yield value
        }
    }
}

export function keys<T>() {
    return async function* (source: AsyncGenerator<[string, T[]]>) {
        for await (const [key, _] of source) {
            yield key
        }
    }
}

export function entries<T>() {
    return async function* (source: AsyncGenerator<[string, T[]]>) {
        for await (const entry of source) {
            yield entry
        }
    }
}

export function fromEntries<T>() {
    return async function* (source: AsyncGenerator<[string, T[]]>) {
        for await (const [key, value] of source) {
            yield [key, value]
        }
    }
}

export function pickBy<T>(predicate: (item: T) => boolean) {
    return async function* (source: AsyncGenerator<[string, T[]]>) {
        for await (const [key, value] of source) {
            yield [key, value.filter(predicate)] as [string, T[]]
        }
    }
}

export function uniq<T>() {
    return async function* (source: AsyncGenerator<[string, T[]]>) {
        for await (const [key, value] of source) {
            yield [key, Array.from(new Set(value))] as [string, T[]]
        }
    }
}

export function keyBy<T, K>(keySelector: (item: T) => K) {
    return async function* (source: AsyncGenerator<T>) {
        const groups = new Map<K, T[]>()
        for await (const item of source) {
            const key = keySelector(item)
            if (!groups.has(key)) {
                groups.set(key, [])
            }
            groups.get(key)!.push(item)
        }
        for (const [key, value] of groups) {
            yield [key, value] as [K, T[]]
        }
    }
}

export function merge<T>() {
    return async function* (source: AsyncGenerator<[string, T[]]>) {
        const result = new Map<string, T[]>()
        for await (const [key, value] of source) {
            if (!result.has(key)) {
                result.set(key, [])
            }
            result.get(key)!.push(...value)
        }
        for (const [key, value] of result) {
            yield [key, value] as [string, T[]]
        }
    }
}

export function split<T>(predicate: (item: T) => boolean) {
    return async function* (source: AsyncGenerator<T>) {
        let buffer: T[] = []
        for await (const item of source) {
            if (predicate(item)) {
                yield buffer
                buffer = []
            } else {
                buffer.push(item)
            }
        }
        yield buffer
    }
}

export function compact<T>() {
    return async function* (source: AsyncGenerator<T>) {
        for await (const item of source) {
            if (item) {
                yield item
            }
        }
    }
}

export function orderWith<T>(comparator: (a: T, b: T) => number) {
    return async function* (source: AsyncGenerator<T>) {
        const buffer: T[] = []
        for await (const item of source) {
            buffer.push(item)
        }
        yield* buffer.sort(comparator)
    }
}

export function cursor<T>(fn: (source: AsyncGenerator<T>) => AsyncGenerator<T>) {
    return async function* (source: AsyncGenerator<T>) {
        yield* fn(source)
    }
}

export function page<T>(size: number) {
    return async function* (source: AsyncGenerator<T>) {
        let buffer: T[] = []
        for await (const item of source) {
            buffer.push(item)
            if (buffer.length === size) {
                yield buffer
                buffer = []
            }
        }
        if (buffer.length) {
            yield buffer
        }
    }
}

export function chunk<T>(size: number) {
    return async function* (source: AsyncGenerator<T>) {
        let buffer: T[] = []
        for await (const item of source) {
            buffer.push(item)
            if (buffer.length === size) {
                yield buffer
                buffer = []
            }
        }
        if (buffer.length) {
            yield buffer
        }
    }
}

export function first<T>() {
    return async function (source: AsyncGenerator<T>) {
        for await (const item of source) {
            return item
        }
    }
}

export function last<T>() {
    return async function (source: AsyncGenerator<T>) {
        let result: T | undefined
        for await (const item of source) {
            result = item
        }
        return result
    }
}

export function firstOrThrow<T>(message?: string) {
    return async function (source: AsyncGenerator<T>) {
        for await (const item of source) {
            return item
        }
        throw new Error(message)
    }
}

export function lastOrThrow<T>(message?: string) {
    return async function (source: AsyncGenerator<T>) {
        let result: T | undefined
        for await (const item of source) {
            result = item
        }
        if (result) {
            return result
        }
        throw new Error(message)
    }
}

export function count<T>() {
    return async function (source: AsyncGenerator<T>) {
        let count = 0
        for await (const _ of source) {
            count++
        }
        return count
    }
}

export function sum() {
    return async function (source: AsyncGenerator<number>) {
        let sum = 0
        for await (const item of source) {
            sum += item
        }
        return sum
    }
}

export function max() {
    return async function (source: AsyncGenerator<number>) {
        let max = -Infinity
        for await (const item of source) {
            if (item > max) {
                max = item
            }
        }
        return max
    }
}

export function min() {
    return async function (source: AsyncGenerator<number>) {
        let min = Infinity
        for await (const item of source) {
            if (item < min) {
                min = item
            }
        }
        return min
    }
}

export function average() {
    return async function (source: AsyncGenerator<number>) {
        let sum = 0
        let count = 0
        for await (const item of source) {
            sum += item
            count++
        }
        return sum / count
    }
}

export function join(separator: string) {
    return async function (source: AsyncGenerator<string>) {
        let result = ''
        for await (const item of source) {
            result += item + separator
        }
        return result.slice(0, -separator.length)
    }
}

export function joinWith<T>(separator: string) {
    return async function (source: AsyncGenerator<T>) {
        let result = ''
        for await (const item of source) {
            result += item + separator
        }
        return result.slice(0, -separator.length)
    }
}

export function joinWithLast<T>(separator: string) {
    return async function (source: AsyncGenerator<T>) {
        let result = ''
        let last: T | undefined
        for await (const item of source) {
            if (last) {
                result += last + separator
            }
            last = item
        }
        return result + last
    }
}

export function joinLast<T>(separator: string) {
    return async function (source: AsyncGenerator<T>) {
        let result = ''
        let last: T | undefined
        for await (const item of source) {
            last = item
        }
        return result + last
    }
}

export function joinFirst<T>(separator: string) {
    return async function (source: AsyncGenerator<T>) {
        let result = ''
        let first = true
        for await (const item of source) {
            if (first) {
                first = false
            } else {
                result += separator
            }
            result += item
        }
        return result
    }
}

export function joinWithFirst<T>(separator: string) {
    return async function (source: AsyncGenerator<T>) {
        let result = ''
        let first = true
        for await (const item of source) {
            if (first) {
                first = false
            } else {
                result += separator
            }
            result += item
        }
        return result
    }
}

export function filter<T>(predicate: (item: T) => Promise<boolean>) {
    return async function* (source: AsyncGenerator<T>) {
        for await (const item of source) {
            if (await predicate(item)) {
                yield item
            }
        }
    }
}

export function map<T, U>(mapper: (item: T) => U) {
    return async function* (source: AsyncGenerator<T>) {
        for await (const item of source) {
            yield mapper(item)
        }
    }
}

export function take<T>(count: number) {
    return async function* (source: AsyncGenerator<T>) {
        let i = 0
        for await (const item of source) {
            if (i++ < count) {
                yield item
            } else {
                return
            }
        }
    }
}


export function skip<T>(count: number) {
    return async function* (source: AsyncGenerator<T>) {
        let i = 0
        for await (const item of source) {
            if (i++ >= count) {
                yield item
            }
        }
    }
}

export function concat<T>(...sources: AsyncGenerator<T>[]) {
    return async function* (source: AsyncGenerator<T>) {
        for (const source of sources) {
            for await (const item of source) {
                yield item
            }
        }
    }
}

export function flatMap<T, U>(mapper: (item: T) => AsyncGenerator<U>) {
    return async function* (source: AsyncGenerator<T>) {
        for await (const item of source) {
            for await (const subItem of mapper(item)) {
                yield subItem
            }
        }
    }
}

export function tap<T>(fn: (item: T) => void) {
    return async function* (source: AsyncGenerator<T>) {
        for await (const item of source) {
            fn(item)
            yield item
        }
    }
}

export function reduce<T, U>(reducer: (acc: U, item: T) => U, initialValue: U) {
    return async function (source: AsyncGenerator<T>) {
        let acc = initialValue
        for await (const item of source) {
            acc = reducer(acc, item)
        }
        return acc
    }
}

export function forEach<T>(fn: (item: T) => void) {
    return async function (source: AsyncGenerator<T>) {
        for await (const item of source) {
            fn(item)
        }
    }
}

export function find<T>(predicate: (item: T) => Promise<boolean>) {
    return async function (source: AsyncGenerator<T>) {
        for await (const item of source) {
            if (await predicate(item)) {
                return item
            }
        }
    }
}

export function every<T>(predicate: (item: T) => Promise<boolean>) {
    return async function (source: AsyncGenerator<T>) {
        for await (const item of source) {
            if (!await predicate(item)) {
                return false
            }
        }
        return true
    }
}

export function some<T>(predicate: (item: T) => Promise<boolean>) {
    return async function (source: AsyncGenerator<T>) {
        for await (const item of source) {
            if (await predicate(item)) {
                return true
            }
        }
        return false
    }
}

export function toArray<T>() {
    return async function (source: AsyncGenerator<T>) {
        const result: T[] = []
        for await (const item of source) {
            result.push(item)
        }
        return result
    }
}


export async function* from<T>(source: T[] | Iterable<T> | AsyncIterable<T> | AsyncGenerator<T> | Generator<T> | Promise<T>) {
    if (Array.isArray(source)) {
        yield* source
    } else if (Symbol.asyncIterator in source) {
        yield* source
    } else if (Symbol.iterator in source) {
        yield* source
    } else if (isPromise(source)) {
        yield await source
    } else {
        throw new Error('Invalid source')
    }
}
