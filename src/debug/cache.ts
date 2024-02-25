import { existsSync, readFileSync, writeFileSync } from 'fs'
import os from 'os'
import path from 'path'

export async function cache<T>(key: string, fn: () => Promise<T>) {
  const cacheFile = path.join(os.tmpdir(), `temp-${key}`)
  if (existsSync(cacheFile)) {
    return JSON.parse(readFileSync(cacheFile).toString('utf8')) as T
  }
  else {
    const result = await fn()
    writeFileSync(cacheFile, JSON.stringify(result))
    return result
  }
}

export function cacheSync<T>(key: string, fn: () => T) {
  const cacheFile = path.join(os.tmpdir(), `temp-${key}`)
  // console.log('cacheFile', cacheFile)
  if (existsSync(cacheFile)) {
    return JSON.parse(readFileSync(cacheFile).toString('utf8')) as T
  }
  else {
    const result = fn()
    writeFileSync(cacheFile, JSON.stringify(result))
    return result
  }
}
