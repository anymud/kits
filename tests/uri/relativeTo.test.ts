import { expect, test } from 'bun:test'
import URIJS from 'urijs'
import { absoluteTo, getSegments, parseUri, toString } from '~/uri'

const tests = [
  ['https://google.com/', 'https://anymud.com/'],
  ['//google.com/', 'https://anymud.com/'],
  ['//user:pass@anymud.com/', 'https://anymud.com/'],
  ['http://anymud.com:80/', 'https://anymud.com/'],
  ['https://anymud.com:443/', 'https://anymud.com/'],
  ['./path/to/filename.json', 'https://anymud.com/'],
  ['./path/to/filename.json', 'https://anymud.com/path'],
  ['./path/to/filename.json', 'https://anymud.com/path/'],
  ['../path/to/filename.json', 'https://anymud.com/path/'],
  ['../../../path/to/filename.json', 'https://anymud.com/path/'],
  ['sky/is/blue/.//./path/to/filename.json', 'https://anymud.com/path/'],
  ['../.././/./path/to/filename.json', 'https://anymud.com/path/'],
  ['/path/to/filename.json', 'https://anymud.com/path/'],
]

for (const [relativePath, baseUri] of tests) {
  test(`${relativePath} absoluteTo to ${baseUri}`, () => {
    const result1 = toString(absoluteTo(parseUri(relativePath), parseUri(baseUri)))
    const result2 = new URIJS(relativePath).absoluteTo(baseUri).toString()
    expect(result1).toStrictEqual(result2)
  })
}
