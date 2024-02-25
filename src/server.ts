import type { IncomingMessage } from 'http'
import type { TLSSocket } from 'tls'
import { promisify } from 'util'
import { gzip } from 'zlib'
import { appendHeader, defaultContentType } from 'h3'
import type { H3Event } from 'h3'
import { x } from 'xastscript'
import { u } from 'unist-builder'
import { toXml } from 'xast-util-to-xml'

export function isHTTPS(req: IncomingMessage, trustProxy: Boolean = true): Boolean | undefined {
  // Check x-forwarded-proto header
  const _xForwardedProto = (trustProxy && req.headers) ? req.headers['x-forwarded-proto'] : undefined
  const protoCheck = typeof _xForwardedProto === 'string' ? _xForwardedProto.includes('https') : undefined
  if (protoCheck)
    return true

  // Check tlsSocket
  const _encrypted = req.connection ? (req.connection as TLSSocket).encrypted : false
  const encryptedCheck = _encrypted !== undefined ? _encrypted : undefined
  if (encryptedCheck)
    return true

  if (protoCheck === undefined && encryptedCheck === undefined)
    return undefined

  return false
}

export function getOrigin(req: IncomingMessage): string {
  return encodeURI(
    `http${isHTTPS(req) ? 's' : ''}://${
         req.headers['x-forwarded-host'] || req.headers.host
         }`,
  )
}

export function sendGzip(event: H3Event, data: any) {
  appendHeader(event, 'content-encoding', 'gzip')
  return promisify(gzip)(data)
}

export function sendXml(event: H3Event, xml: string, gzip = true) {
  defaultContentType(event, 'application/xml')
  return gzip ? sendGzip(event, xml) : xml
}

export function createSitemapIndex(urls: string[]) {
  const tree = u('root', [
    u('instruction', { name: 'xml' }, 'version="1.0" encoding="UTF-8"'),
    x('sitemapindex', {
      xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
    }, urls.map(url => x('sitemap', { loc: url }))),
  ])
  return toXml(tree)
}

export function createSitemap(urls: string[]) {
  const tree = u('root', [
    u('instruction', { name: 'xml' }, 'version="1.0" encoding="UTF-8"'),
    x('urlset', {
      xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
      'xmlns:xhtml': 'http://www.w3.org/1999/xhtml',
    }, urls.map(url => x('url', { loc: url }))),
  ])
  return toXml(tree)
}
