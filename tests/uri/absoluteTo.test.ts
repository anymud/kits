import URIJS from 'urijs'
import { expect, test } from 'bun:test'
import { URI } from '~/uri'

const tests = [
  ['https://anymud.com/path/to/filename.json', 'https://anymud.com/'],
  ['https://anymud.com/path/to/filename.json', 'https://anymud.com/path'],
  ['https://anymud.com/path/to/filename.json', 'https://anymud.com/path/'],
  ['https://anymud.com/path/to/filename.json', 'https://anymud.com/path2/to/filename.json'],
  ['https://anymud.com/path/to/filename.json', 'https://anymud.com/path/to/'],
  ['https://anymud.com/path/to/filename.json', 'https://anymud.com/path/to/abc.json'],
  ['https://anymud.com/./', 'https://anymud.com/'],
  ['https://anymud.com/./path/to/filename.json', 'https://anymud.com/path/to/abc.json'],
  ['https://google.com/', 'https://anymud.com/'],
  ['https://google.com/abc.json', 'https://anymud.com/'],
  ['http://google.com/abc.json', 'https://anymud.com/'],
  ['http://user:pass@google.com:9999/abc.json', 'https://anymud.com/'],
  ['http://user:pass@google.com:9999/abc.json', 'http://user:pass@google.com:6666/abc.json'],
  ['http://user:pass@google.com:9999/abc.json', 'http://user2:pass2@google.com:9999/abc.json'],
  ['http://user@google.com:9999/abc.json', 'http://user:pass@google.com:9999/abc.json'],
  ['/path/to/abc.json', '/path/to'],
  ['/path2/to/abc.json', '/path/to'],
]
for (const [relativePath, baseUri] of tests) {
  test(`${relativePath} relativeTo ${baseUri}`, () => {
    const result1 = URI.from(relativePath).relativeTo(baseUri).toString()
    const result2 = new URIJS(relativePath).relativeTo(baseUri).toString()
    expect(result1).toStrictEqual(result2)
  })
}
