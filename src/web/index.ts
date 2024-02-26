export function normalizeLocales(preferred: readonly string[]): readonly string[] {
  const locales: string[] = []
  let lastLanguage
  for (const locale of preferred) {
    const [language] = locale.split('-')
    if (lastLanguage && lastLanguage !== language && !locales.includes(lastLanguage))
      locales.push(lastLanguage)

    if (!locales.includes(locale)) {
      locales.push(locale)
      lastLanguage = language
    }
  }
  if (lastLanguage && !locales.includes(lastLanguage))
    locales.push(lastLanguage)
  return locales
}

export function copyWith(request: Request, info: RequestInit & { url?: URL }) {
  return new Request(
    info.url || request.url, {
      method: info.method || request.method,
      headers: info.headers || request.headers,
      body: info.body || request.body,
      mode: info.mode || request.mode,
      credentials: info.credentials || request.credentials,
      redirect: info.redirect || request.redirect,
      integrity: info.integrity || request.integrity,
      keepalive: info.keepalive || request.keepalive,
      signal: info.signal || request.signal,
    }
  );
}

// export {
  
//   getAccept,
//   getBestAccept,
//   proxifyHeaders,
//   parseAcceptLanguage,
// } from './h3'