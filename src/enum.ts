// import { languages } from '@vitalets/google-translate-api'
import type { ValueOfArray } from './types'
import { isKeyOf } from './types'

export type EnumValue = string | number

type EnumConst<T extends string = string, V extends number | string | EnumValue = EnumValue> = { [ K in T ]: EnumValue extends V ? K : V }
interface EnumInterface<T extends string, V extends number | string | EnumValue = number> {
  names: () => T[]
  values: () => V[]
  nameOf: (e: V) => T
  parse: (e: string) => Extract<V, EnumValue>
  has: (e: string) => boolean
  equals: (a: V, b: V) => boolean
}

export type Enum<T extends string = string, V extends number | string | EnumValue = EnumValue> = EnumConst<T, V> & EnumInterface<T, V>
export type MyEnumValue<T extends Enum<any, any>> = T extends Enum<any, infer V> ? V : never
export function $Enum<T extends { [K in keyof T]: T[K] }>(obj: T): Enum<Extract<keyof T, string>, T[keyof T]>
export function $Enum<T extends readonly string[]>(list: T, type?: 'number'): Enum<ValueOfArray<T>, number>
export function $Enum<T extends readonly string[]>(list: T, type: 'string'): Enum<ValueOfArray<T>, ValueOfArray<T>>
export function $Enum<T extends Record<string, EnumValue>>(obj: T): Enum<Extract<keyof T, string>, T[keyof T]>
export function $Enum<T extends readonly string[] | Record<string, EnumValue>>(list: T, type: 'number' | 'string' = 'number'): { [k: string]: EnumValue } {
  const valueMap: { [k: string]: EnumValue } = {}
  const reversedMap: { [k: EnumValue]: string } = {}
  const entries = Array.isArray(list)
    ? list.map((x, i) => [x, type === 'number' ? i : x])
    : Object.entries(list).filter(x => isNaN(parseInt(x[0])))
  for (const [key, value] of entries) {
    if (key in valueMap || value in reversedMap)
      throw new Error('Enum key/value requires unique.')
    valueMap[key] = value
    reversedMap[value] = key
  }
  return new Proxy(valueMap, {
    get(target, prop) {
      switch (prop) {
        case 'names':
          return () => Object.keys(target)
        case 'values':
          return () => Object.values(target)
        case 'nameOf':
          return (e: keyof typeof reversedMap) => reversedMap[e]
        case 'parse':
          return (val: string) => valueMap[val]
        case 'has':
          return (val: string) => !!valueMap[val]
        case 'equals':
          return (a: EnumValue, b: EnumValue) => a === b
        default:
          return target[prop as string]
      }
    },
  })
}

export function $enum<T extends Record<string, any>>(obj: T): T & EnumInterface<Extract<keyof T, string>, T[keyof T]>
export function $enum<T extends Record<string, any>>(obj: T): any {
  const valueMap: { [k: string]: EnumValue } = {}
  const reversedMap: { [k: EnumValue]: string } = {}
  const entries = Object.entries(obj).filter(x => isNaN(parseInt(x[0])))
  for (const [key, value] of entries) {
    // if (key in valueMap || value in keyMap)
    if (isKeyOf(valueMap, key))
      throw new Error('Enum key/value requires unique.')

    valueMap[key] = value
    reversedMap[value] = key
  }
  return new Proxy(obj, {
    get(target, prop) {
      switch (prop) {
        case 'names':
          return () => Object.keys(target)
        case 'values':
          return () => Object.values(target)
        case 'nameOf':
          return (e: keyof typeof reversedMap) => reversedMap[e]
        case 'parse':
          return (val: string) => valueMap[val]
        case 'has':
          return (val: string) => !!valueMap[val]
        case 'equals':
          return (a: EnumValue, b: EnumValue) => a === b
        default:
          return target[prop as string]
      }
    },
  })
}
