import type { Readable } from 'stream'

export interface StaticStorageOptions {
  id?: string
}

export interface IStaticStorage {
  readonly name: string
  upload(buffer: Buffer, options?: StaticStorageOptions): Promise<string>
  get(id: string): Promise<Readable>
  // uploadByStream(stream: Stream, options?: StaticStorageOptions): Promise<string>
  // uploadByUrl(url: string, options?: StaticStorageOptions): Promise<string>
  // list(): string[]
  // iter(): Generator<string>
}

