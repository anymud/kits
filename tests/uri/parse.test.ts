import URIJS from 'urijs'
import { expect, test } from 'bun:test'
import { URI, normalize, parseUri, toString } from '~/uri'

const tests = [
  'http://example.org/#',
  'http://example.org/#?hello=world',
  'http://www.example.org/some/directory/file.html?query=string#fragment',
  'http://www.example.org/some/directory/file.html-is-awesome?query=string#fragment',
  'scheme://user:pass@www.example.org:123/some/directory/file.html?query=string#fragment',
  'scheme://user:pass:word@www.example.org/',
  'scheme://:password@www.example.org/',
  'scheme://john%40doe.com:pass%3Aword@www.example.org/',
  '/some/directory/file.html?query=string#fragment',
  '../some/directory/file.html?query=string#fragment',
  'user:pass@www.example.org:123/some/directory/file.html?query=string#fragment',
  '//user:pass@example.org:123/some/directory/file.html?query=string#fragment',
  ':/\\\\//user:pass@example.org:123/some/directory/file.html?query=string#fragment',
  '//www.example.org/',
  '//\\\\/www.example.org/',
  'food:///test/file.csv',
  'http://user:pass@123.123.123.123:123/some/directory/file.html?query=string#fragment',
  'http://user:pass@fe80:0000:0000:0000:0204:61ff:fe9d:f156/some/directory/file.html?query=string#fragment',
  'http://user:pass@[fe80:0000:0000:0000:0204:61ff:fe9d:f156]:123/some/directory/file.html?query=string#fragment',
  'http://[FEDC:BA98:7654:3210:FEDC:BA98:7654:3210]:80/index.html',
  'http://[1080:0:0:0:8:800:200C:417A]/index.html',
  'http://[3ffe:2a00:100:7031::1]',
  'http://[1080::8:800:200C:417A]/foo',
  // 'http://[::192.9.5.5]/ipng',
  // 'http://[::FFFF:129.144.52.38]:80/index.html',
  'ftp:?a=1',
  'http://[2010:836B:4179::836B:4179]',
  'http://user:pass@some_where.exa_mple.org:123/some/directory/file.html?query=string#fragment',
  'http://user:pass@xn--exmple-cua.org:123/some/directory/file.html?query=string#fragment',
  'http://user:pass@exämple.org:123/some/directory/file.html?query=string#fragment',
  'file:///foo/bar/baz.html',
  'file://example.org:123/foo/bar/baz.html',
  'file:///C:/WINDOWS/foo.txt',
  'file://example.org/C:/WINDOWS/foo.txt',
  'file://localhost/C|/WINDOWS/foo.txt',
  'http://www.example.org/@foobar',
  'mailto:hello@example.org?subject=hello',
  'magnet:?xt=urn:btih:f8c020dac7a083defda1769a1196a13facc38ef6&dn=Linux+64x+server+11.10+Pt+Pt&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Ftracker.publicbt.com%3A80&tr=udp%3A%2F%2Ftracker.ccc.de%3A80',
  'javascript:alert("hello world");',
  'http://en.wikipedia.org/wiki/Help:IPA',
  '/wiki/Help:IPA',
  '/foo/xy://bar',
  'http://www.example.org:8080/hello:world',
  'http://i.xss.com\\www.example.org/some/directory/file.html?query=string#fragment',
  'https://attacker.com\\@example.com/some/directory/file.html?query=string#fragment',
  'https://attacker.com\\@example.com',
  'https:/\\\\attacker.com',
  'https:/\\/\\/\\attacker.com',
  'https:attacker.com',
  'https:/attacker.com',
  'https://////attacker.com',
  'hTTps://////attacker.com',
  'ftp:attacker.com',
  'ftp:/attacker.com',
  'ftp://////attacker.com',
  // 'http://www.example.org/?__proto__=hasOwnProperty&__proto__=eviltwin&uuid',
  '\t\bhttp://www.example.org/?hello=world',
  'ja\r\nva\tscript:alert(1)',
  'http:://www.example.org:8080/hello:world',
  'http::\\\\\\\\www.example.org:8080/hello:world',
  'https://example.org.hk',
  'https://example.unknowntld',
  'https://example.sld.unknowntld',
  'https://sub.example.com',
  'https://sub.example.com.hk',
  'https://sub2.sub.example.com.hk',
]
for (const url of tests) {
  test(`parse ${url}`, () => {
    const result = parseUri(url)
    const urijs = new URIJS(url)
    const uriParseResult = URIJS.parse(url)
    expect(result).toStrictEqual({
      scheme: uriParseResult.protocol ?? undefined,
      username: uriParseResult.username ?? undefined,
      password: uriParseResult.password ?? undefined,
      hostname: uriParseResult.hostname ?? undefined,
      urn: urijs.is('urn'),
      port: uriParseResult.port ?? undefined,
      path: uriParseResult.path ?? undefined,
      query: uriParseResult.query ?? undefined,
      fragment: uriParseResult.fragment ?? undefined,
    })
  })

  test(`scheme ${url}`, () => {
    const result1 = URI.from(url).scheme
    const result2 = new URIJS(url).scheme()
    expect(result1).toStrictEqual(result2)
  })

  test(`path ${url}`, () => {
    const result1 = URI.from(url).pathname
    const result2 = new URIJS(url).pathname()
    expect(result1).toStrictEqual(result2)
  })

  test(`username ${url}`, () => {
    const result1 = URI.from(url).username
    const result2 = new URIJS(url).username()
    expect(result1).toStrictEqual(result2)
  })

  test(`password ${url}`, () => {
    const result1 = URI.from(url).password
    const result2 = new URIJS(url).password()
    expect(result1).toStrictEqual(result2)
  })

  test(`userinfo ${url}`, () => {
    const result1 = URI.from(url).userInfo
    const result2 = new URIJS(url).userinfo()
    expect(result1).toStrictEqual(result2)
  })

  test(`filename ${url}`, () => {
    const result1 = URI.from(url).filename
    const result2 = new URIJS(url).filename()
    expect(result1).toStrictEqual(result2)
  })

  test(`suffix ${url}`, () => {
    const result1 = URI.from(url).suffix
    const result2 = new URIJS(url).suffix()
    expect(result1).toStrictEqual(result2)
  })

  test(`host ${url}`, () => {
    const result1 = URI.from(url).host
    const result2 = new URIJS(url).host()
    expect(result1).toStrictEqual(result2)
  })

  test(`hostname ${url}`, () => {
    const result1 = URI.from(url).hostname
    const result2 = new URIJS(url).hostname()
    expect(result1).toStrictEqual(result2)
  })

  test(`authority ${url}`, () => {
    const result1 = URI.from(url).authority
    const result2 = new URIJS(url).authority()
    expect(result1).toStrictEqual(result2)
  })

  test(`origin ${url}`, () => {
    const result1 = URI.from(url).origin
    const result2 = new URIJS(url).origin()
    expect(result1).toStrictEqual(result2)
  })

  test(`querystring ${url}`, () => {
    const result1 = URI.from(url).queryString
    const result2 = new URIJS(url).query()
    expect(result1).toStrictEqual(result2)
  })

  test(`query ${url}`, () => {
    const result1 = URI.from(url).query
    const result2 = new URIJS(url).query(true)
    expect(result1).toStrictEqual(result2)
  })

  test(`fragment ${url}`, () => {
    const result1 = URI.from(url).fragment
    const result2 = new URIJS(url).fragment()
    expect(result1).toStrictEqual(result2)
  })

  test(`toString ${url}`, () => {
    expect(URI.from(url).toString()).toBe(new URIJS(url).toString())
  })

  test(`normalize ${url}`, () => {
    const result1 = URI.from(url).normalize().toString()
    const result2 = new URIJS(url).normalize().toString()
    expect(result1).toBe(result2)
  })

  test(`ip ${url}`, () => {
    const result1 = URI.from(url).isIp()
    const result2 = new URIJS(url).is('ip')
    expect(result1).toBe(result2)
  })

  test(`ipv6 ${url}`, () => {
    const result1 = URI.from(url).isIpv6()
    const result2 = new URIJS(url).is('ipv6')
    expect(result1).toBe(result2)
  })

  test(`ipv4 ${url}`, () => {
    const result1 = URI.from(url).isIpv4()
    const result2 = new URIJS(url).is('ipv4')
    expect(result1).toBe(result2)
  })


  test(`isAbsolute ${url}`, () => {
    const result1 = URI.from(url).isAbsolute()
    const result2 = new URIJS(url).is('absolute')
    expect(result1).toBe(result2)
  })

  test(`tld ${url}`, () => {
    const result1 = URI.from(url).tld
    const result2 = new URIJS(url).tld()
    expect(result1).toBe(result2)
  })

  test(`domain ${url}`, () => {
    const result1 = URI.from(url).domain
    const result2 = new URIJS(url).domain()
    expect(result1).toBe(result2)
  })

  test(`subdomain ${url}`, () => {
    const result1 = URI.from(url).subdomain
    const result2 = new URIJS(url).subdomain()
    expect(result1).toBe(result2)
  })
}