// import { getKeys } from '../types'
import z from 'zod'
import { getCookie, getHeader, getRequestIP } from 'h3'


type H3Event = Parameters<typeof getCookie>[0]


const ipParser = z.string().ip()


// function to convert IP address to buffer (supports IPv4 and IPv6)
export function ipToBuffer(ip: string): Buffer {
  const parseResult = ipParser.safeParse(ip)
  if (!parseResult.success) {
    throw new Error('Invalid IP address. Received: ' + JSON.stringify(ip))
  }
  return Buffer.from(ip.includes(':') ? ip.split(':').map((part) => parseInt(part, 16)) : ip.split('.').map((part) => parseInt(part, 10)))  
}


export function bufferToIp(buffer: Buffer): string {
  return buffer.length === 4 ? buffer.join('.') : buffer.toString('hex').match(/.{1,4}/g)!.join(':')
}

export function getClientAddress(event: H3Event): string | undefined {
  return getHeader(event, 'cf-connecting-ip') ??
    getRequestIP(event, { xForwardedFor: true })
}

// ref: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
interface MimeType<Type extends string = string, Subtype extends string = string> {
  type: Type
  subtype: Subtype
  parameters: { [key: string]: string }
}

interface AcceptLanguage {
  locale: string
  language: string
  region: string
  parameters: { [key: string]: string }
}

// export function getHeader(event: H3Event, name: string): string | undefined {
//   const crossHeaderName = `x-${name}`
//   const headers = getHeaders(event)
//   const header = headers.get(name) ?? headers.get(crossHeaderName)
//   return Array.isArray(header) ? header[0] : header
// }

// export function getHeaders(event: H3Event) {
//   return event.headers
// }

export function getAccept(event: H3Event): MimeType[] | undefined {
  const acceptHeader = getHeader(event, 'accept')
  return acceptHeader?.split(',').map((x) => {
    const [mimeTypeStr, ...optionStrings] = x.split(';')
    const [type, subtype] = mimeTypeStr.split('/')
    const parameters = Object.fromEntries(optionStrings.map((x) => {
      const [key, value] = x.split('=')
      return [key, value]
    }))

    return {
      type,
      subtype,
      parameters,
    } as MimeType
  })
}

export function getBestAccept<Type extends string = string, Subtype extends string = string>(event: H3Event, type?: Type, subtypes?: Subtype[]): MimeType<Type, Subtype> | undefined {
  return getAccept(event)?.filter(x => x.type === type && (subtypes as string[])?.includes(x.subtype))?.[0] as MimeType<Type, Subtype>
}

export function proxifyHeaders<THeader extends Record<string, string>>(headers: THeader, ...keys: (keyof THeader)[]): Record<string, string> {
  const proxiedHeaders = {} as Record<string, string>
  if (!keys.length)
    keys = Object.keys(headers)
  for (const key of keys)
    proxiedHeaders[`x-${String(key)}`] = headers[key]
  return proxiedHeaders
}
//
// export const useSubdomain = () => {
//   const host = useRequestHeaders().host
//   // console.log('host = ', host)
//   const subDomain = new URI({ hostname: host }).subdomain()
//   return subDomain
// }
// useSubdomain

export function parseAcceptLanguage(acceptLanguage?: string): readonly AcceptLanguage[] {
  return acceptLanguage?.split(',').map((x) => {
    const [locale, ...optionStrings] = x.split(';')
    const [language, region] = locale.split('-')
    const parameters = Object.fromEntries(optionStrings.map(x => x.split('=')))

    return {
      locale,
      language,
      region,
      parameters,
    } as AcceptLanguage
  }) ?? []
}

export function getAcceptLanguages(event: H3Event) {
  const acceptLanguageHeader = getHeader(event, 'accept-language')
  return parseAcceptLanguage(acceptLanguageHeader)
}


export function getClientCountry(event: H3Event) {
  return getHeader(event, 'cf-ipcountry')
}

export function getClientUserAgent(event: H3Event) {
  return getHeader(event, 'user-agent')
}
