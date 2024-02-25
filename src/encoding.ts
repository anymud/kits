import { defu } from 'defu'

export function isBase64(v: string, opts: { mimeRequired?: boolean; allowMime?: boolean; paddingRequired?: boolean; allowEmpty?: boolean } = {}) {
  opts = defu(opts, { mimeRequired: false, allowMime: false, paddingRequired: false, allowEmpty: false })

  if (!opts.allowEmpty && v === '')
    return false

  let regex = '(?:[A-Za-z0-9+\\/]{4})*(?:[A-Za-z0-9+\\/]{2}==|[A-Za-z0-9+\/]{3}=)?'
  const mimeRegex = '(data:\\w+\\/[a-zA-Z\\+\\-\\.]+;base64,)'

  if (opts.mimeRequired)
    regex = mimeRegex + regex
  else if (opts.allowMime)
    regex = `${mimeRegex}?${regex}`

  if (!opts.paddingRequired)
    regex = '(?:[A-Za-z0-9+\\/]{4})*(?:[A-Za-z0-9+\\/]{2}(==)?|[A-Za-z0-9+\\/]{3}=?)?'

  return (new RegExp(`^${regex}$`, 'gi')).test(v)
}
