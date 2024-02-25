import crypto from 'crypto'

export function getMd5(message: string | Buffer) {
  if (typeof message === 'string')
    message = Buffer.from(message)
  return crypto.createHash('md5').update(message).digest('hex')
}
