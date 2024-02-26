import { expect, test } from 'bun:test'
import { URI } from '~/uri'

test('remove subdomain', () => {
  const uri = new URI('https://www.example.com.tw/')
  uri.setSubdomain('')
  expect(uri.toString()).toStrictEqual('https://example.com.tw/')
})

test('change subdomain', () => {
  const uri = new URI('https://www.example.com.tw/')
  uri.setSubdomain('sub.sub2')
  expect(uri.toString()).toStrictEqual('https://sub.sub2.example.com.tw/')
})

test('set filename', () => {
  const uri = new URI('/path/to/')
  uri.setFilename('image.png')
  expect(uri.toString()).toStrictEqual('/path/to/image.png')
})
