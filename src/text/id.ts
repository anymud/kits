import { customAlphabet } from 'nanoid'
import { useLazyMany } from '../lazy'

export const NumericAlphabets = '0123456789'
export const LowerCaseAlphabets = 'abcdefghijklmnopqrstuvwxyz'
export const UpperCaseAlphabets = 'ABCDFEGHIJKLMNOPQRSTUVWXYZ'

export const generateId = useLazyMany((size: number = 12, { numeric = true, lowerCase = true, upperCase = true } = { numeric: true, lowerCase: true, upperCase: true }) => {
  const alphabets = (numeric ? NumericAlphabets : '') + (lowerCase ? LowerCaseAlphabets : '') + (upperCase ? UpperCaseAlphabets : '');
  const nanoid = customAlphabet(alphabets, size);
  return nanoid();
}, {
  key: (size: number = 12, { numeric = true, lowerCase = true, upperCase = true } = { numeric: true, lowerCase: true, upperCase: true }) => `${numeric}-${lowerCase}-${upperCase}`
});