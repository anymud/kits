import { Storage } from '@google-cloud/storage'
import { generateId } from '~/kit/text'
import type { IStaticStorage, StaticStorageOptions } from '~/kit/storages/index'

export class GoogleCloudStorage implements IStaticStorage {
  private _bucket: string
  private storage: Storage
  readonly name = 'googleCloudStorage'

  constructor(keyPath: string, bucket: string) {
    this.storage = new Storage({
      keyFilename: keyPath,
    })

    this._bucket = bucket
  }

  async upload(buffer: Buffer, options?: StaticStorageOptions): Promise<string> {
    const id = options?.id ?? generateId()
    await this.storage.bucket(this._bucket).file(id).save(buffer)
    return id
  }

  async get(id: string) {
    // to catch error
    // https://stackoverflow.com/questions/43799246/s3-getobject-createreadstream-how-to-catch-the-error
    return this.storage.bucket(this._bucket).file(id).createReadStream()
  }
}
