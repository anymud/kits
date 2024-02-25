import { defu } from 'defu'

export { generateId } from './id'

const wordConnector = '[\\s-]'
const apostrophe = '[\'’]'
const latinChar = '[\\p{Ll}\\p{Lu}\\p{Lt}]'
const latinVocab = `${latinChar}+(?:(?=[${apostrophe}${latinChar}+)${apostrophe}${latinChar}+)?`
const cjk = '\\p{sc=Han}|\\p{sc=Hiragana}|\\p{sc=Hangul}'
const vocabRegexStr = `(?:${latinVocab}|${cjk}|\\d+)`

const regexMap: Record<string, string> = {}
regexMap.punctuation = '\\p{P}'
regexMap.number = '\\p{N}'
regexMap.apostrophe = '[\'’]'
regexMap.space = '\\s'
regexMap.wordConnector = '[\\s-]'
regexMap.apostrophe = '[\'’]'
regexMap.latinChar = '[\\p{Ll}\\p{Lu}\\p{Lt}]'
regexMap.latinVocab = `${regexMap.latinChar}+(?:(?=[${regexMap.apostrophe}${regexMap.latinChar}+)${regexMap.apostrophe}${regexMap.latinChar}+)?`
regexMap.cjk = '[\\p{sc=Han}|\\p{sc=Hiragana}|\\p{sc=Hangul}]'
regexMap.word = `(?:${regexMap.latinVocab}|${regexMap.cjk}|\\d+)`

export function semanticWords(text: string, concatCjk = false) {
  const regex = new RegExp(`(?:${regexMap.latinVocab}|${regexMap.cjk}${concatCjk ? '+' : ''})`, 'ug')
  return Array.from(text.matchAll(regex)).map(x => x[0])
}

export function semanticNormalize(text: string) {
  /* Normalize Accent */

  // unicode
  text = text.normalize('NFKC')

  // unicode, remove diacritic
  // text = _.deburr(text)

  // remove diacritic
  text = text.replace(/\p{Diacritic}/gu, '')

  // remove apostrophe
  text = text.replace(new RegExp(apostrophe, 'ug'), '')

  /* Normalize Case */

  // ja, Katakana => Hiragana
  // text = toHiragana(text, {
  //   // very important to bypass non japanese
  //   passRomaji: true,
  // })

  // lower case
  text = text.toLowerCase()

  // normalize spaces, space between words, single space only, trim
  // text = text.replace(/\s+/u, ' ')
  // text = text.trim()
  text = Array.from(text.matchAll(new RegExp(`${regexMap.cjk}+|${regexMap.latinVocab}|\\d+`, 'ug'))).map(x => x[0]).join(' ')

  return text
}

export function semanticSlice(str: string, len: number, options?: {
  sliceOnPunctuation?: boolean
  sliceOnSpace?: boolean
  sliceOnCjk?: boolean
  sliceOnNumber?: boolean
  sliceOnEnd?: boolean
  ellipsis?: boolean
  ellipsisSymbol?: string
  includeEllipsis?: boolean
  trimEnd?: boolean
  trimStart?: boolean
}) {
  options = defu(options, {
    sliceOnPunctuation: true,
    sliceOnSpace: true,
    sliceOnCjk: true,
    sliceOnNumber: false,
    sliceOnEnd: true,
    ellipsis: false,
    ellipsisSymbol: '…',
    includeEllipsis: true,
    trimEnd: true,
    trimStart: true,
  })
  let separator = ''
  if (options.sliceOnPunctuation)
    separator += '\\p{P}'
  if (options.sliceOnCjk)
    separator += '\\p{sc=Han}|\\p{sc=Hiragana}|\\p{sc=Hangul}'
  if (options.sliceOnNumber)
    separator += '\\p{N}'
  if (options.sliceOnSpace)
    separator += '\\s'
  // console.log(str.match(new RegExp('^\\s*(.{0,' + len + '}[' + separator + '])', 'su')))

  if (options.trimStart)
    str = str.trimStart()

  const ellipsisLength = options.includeEllipsis && options.ellipsis && options.ellipsisSymbol ? options.ellipsisSymbol.length : 0
  const regex = new RegExp(`^(.{0,${Math.max(0, len - ellipsisLength - 1)}}(?:[${separator}]|.$))(.{0,${1 + ellipsisLength}})`, 'su')
  const match = str.match(regex)
  if (!match)
    return ''

  // console.log(match)
  let result = match[1] || ''
  if (options.trimEnd)
    result = result.trimEnd()
  if (match[2] && options.ellipsis && options.ellipsisSymbol) {
    if (match[2].length === options.ellipsisSymbol.length) {
      result += match[2]
      if (options.trimEnd)
        result = result.trimEnd()
    }
    else {
      result = result.replace(new RegExp(`[${regexMap.punctuation}${regexMap.space}]+$`, 'us'), '')
      result += options.ellipsisSymbol
    }
  }
  return result
}

export function semanticSplit(str: string, len: number) {
  const result: string[] = []
  while (str.length > len) {
    const slicedStr = semanticSlice(str, len, {
      ellipsis: false,
      trimStart: false,
      trimEnd: false,
      sliceOnCjk: false,
      sliceOnSpace: false,
      sliceOnNumber: false,
    }) || semanticSlice(str, len, {
      ellipsis: false,
      trimStart: false,
      trimEnd: false,
    })
    if (!slicedStr)
      break
    result.push(slicedStr)
    str = str.slice(slicedStr.length)
  }
  result.push(str)
  return result
}
