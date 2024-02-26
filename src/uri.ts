import { groupBy, mapValues } from '~/utils'

interface UriData {
  scheme?: string
  username?: string
  password?: string
  hostname?: string
  port?: string
  path?: string
  query?: string
  fragment?: string
  urn?: boolean
}

type Query = Record<string, string | string[] | undefined>
type MayBeUriData = UriData | string

const ipv6Regex = /^((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?$/iu
const ipv4Regex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/iu

const defaultPorts: Record<string, number> = {
  http: 80,
  https: 443,
  ftp: 21,
  gopher: 70,
  ws: 80,
  wss: 443,
}
const SLD: Record<string, string> = {
  ac: 'com gov mil net org ',
  ae: 'ac co gov mil name net org pro sch ',
  af: 'com edu gov net org ',
  al: 'com edu gov mil net org ',
  ao: 'co ed gv it og pb ',
  ar: 'com edu gob gov int mil net org tur ',
  at: 'ac co gv or ',
  au: 'asn com csiro edu gov id net org ',
  ba: 'co com edu gov mil net org rs unbi unmo unsa untz unze ',
  bb: 'biz co com edu gov info net org store tv ',
  bh: 'biz cc com edu gov info net org ',
  bn: 'com edu gov net org ',
  bo: 'com edu gob gov int mil net org tv ',
  br: 'adm adv agr am arq art ato b bio blog bmd cim cng cnt com coop ecn edu eng esp etc eti far flog fm fnd fot fst g12 ggf gov imb ind inf jor jus lel mat med mil mus net nom not ntr odo org ppg pro psc psi qsl rec slg srv tmp trd tur tv vet vlog wiki zlg ',
  bs: 'com edu gov net org ',
  bz: 'du et om ov rg ',
  ca: 'ab bc mb nb nf nl ns nt nu on pe qc sk yk ',
  ck: 'biz co edu gen gov info net org ',
  cn: 'ac ah bj com cq edu fj gd gov gs gx gz ha hb he hi hl hn jl js jx ln mil net nm nx org qh sc sd sh sn sx tj tw xj xz yn zj ',
  co: 'com edu gov mil net nom org ',
  cr: 'ac c co ed fi go or sa ',
  cy: 'ac biz com ekloges gov ltd name net org parliament press pro tm ',
  do: 'art com edu gob gov mil net org sld web ',
  dz: 'art asso com edu gov net org pol ',
  ec: 'com edu fin gov info med mil net org pro ',
  eg: 'com edu eun gov mil name net org sci ',
  er: 'com edu gov ind mil net org rochest w ',
  es: 'com edu gob nom org ',
  et: 'biz com edu gov info name net org ',
  fj: 'ac biz com info mil name net org pro ',
  fk: 'ac co gov net nom org ',
  fr: 'asso com f gouv nom prd presse tm ',
  gg: 'co net org ',
  gh: 'com edu gov mil org ',
  gn: 'ac com gov net org ',
  gr: 'com edu gov mil net org ',
  gt: 'com edu gob ind mil net org ',
  gu: 'com edu gov net org ',
  hk: 'com edu gov idv net org ',
  hu: '2000 agrar bolt casino city co erotica erotika film forum games hotel info ingatlan jogasz konyvelo lakas media news org priv reklam sex shop sport suli szex tm tozsde utazas video ',
  id: 'ac co go mil net or sch web ',
  il: 'ac co gov idf k12 muni net org ',
  in: 'ac co edu ernet firm gen gov i ind mil net nic org res ',
  iq: 'com edu gov i mil net org ',
  ir: 'ac co dnssec gov i id net org sch ',
  it: 'edu gov ',
  je: 'co net org ',
  jo: 'com edu gov mil name net org sch ',
  jp: 'ac ad co ed go gr lg ne or ',
  ke: 'ac co go info me mobi ne or sc ',
  kh: 'com edu gov mil net org per ',
  ki: 'biz com de edu gov info mob net org tel ',
  km: 'asso com coop edu gouv k medecin mil nom notaires pharmaciens presse tm veterinaire ',
  kn: 'edu gov net org ',
  kr: 'ac busan chungbuk chungnam co daegu daejeon es gangwon go gwangju gyeongbuk gyeonggi gyeongnam hs incheon jeju jeonbuk jeonnam k kg mil ms ne or pe re sc seoul ulsan ',
  kw: 'com edu gov net org ',
  ky: 'com edu gov net org ',
  kz: 'com edu gov mil net org ',
  lb: 'com edu gov net org ',
  lk: 'assn com edu gov grp hotel int ltd net ngo org sch soc web ',
  lr: 'com edu gov net org ',
  lv: 'asn com conf edu gov id mil net org ',
  ly: 'com edu gov id med net org plc sch ',
  ma: 'ac co gov m net org press ',
  mc: 'asso tm ',
  me: 'ac co edu gov its net org priv ',
  mg: 'com edu gov mil nom org prd tm ',
  mk: 'com edu gov inf name net org pro ',
  ml: 'com edu gov net org presse ',
  mn: 'edu gov org ',
  mo: 'com edu gov net org ',
  mt: 'com edu gov net org ',
  mv: 'aero biz com coop edu gov info int mil museum name net org pro ',
  mw: 'ac co com coop edu gov int museum net org ',
  mx: 'com edu gob net org ',
  my: 'com edu gov mil name net org sch ',
  nf: 'arts com firm info net other per rec store web ',
  ng: 'biz com edu gov mil mobi name net org sch ',
  ni: 'ac co com edu gob mil net nom org ',
  np: 'com edu gov mil net org ',
  nr: 'biz com edu gov info net org ',
  om: 'ac biz co com edu gov med mil museum net org pro sch ',
  pe: 'com edu gob mil net nom org sld ',
  ph: 'com edu gov i mil net ngo org ',
  pk: 'biz com edu fam gob gok gon gop gos gov net org web ',
  pl: 'art bialystok biz com edu gda gdansk gorzow gov info katowice krakow lodz lublin mil net ngo olsztyn org poznan pwr radom slupsk szczecin torun warszawa waw wroc wroclaw zgora ',
  pr: 'ac biz com edu est gov info isla name net org pro prof ',
  ps: 'com edu gov net org plo sec ',
  pw: 'belau co ed go ne or ',
  ro: 'arts com firm info nom nt org rec store tm www ',
  rs: 'ac co edu gov in org ',
  sb: 'com edu gov net org ',
  sc: 'com edu gov net org ',
  sh: 'co com edu gov net nom org ',
  sl: 'com edu gov net org ',
  st: 'co com consulado edu embaixada gov mil net org principe saotome store ',
  sv: 'com edu gob org red ',
  sz: 'ac co org ',
  tr: 'av bbs bel biz com dr edu gen gov info k12 name net org pol tel tsk tv web ',
  tt: 'aero biz cat co com coop edu gov info int jobs mil mobi museum name net org pro tel travel ',
  tw: 'club com ebiz edu game gov idv mil net org ',
  mu: 'ac co com gov net or org ',
  mz: 'ac co edu gov org ',
  na: 'co com ',
  nz: 'ac co cri geek gen govt health iwi maori mil net org parliament school ',
  pa: 'abo ac com edu gob ing med net nom org sld ',
  pt: 'com edu gov int net nome org publ ',
  py: 'com edu gov mil net org ',
  qa: 'com edu gov mil net org ',
  re: 'asso com nom ',
  ru: 'ac adygeya altai amur arkhangelsk astrakhan bashkiria belgorod bir bryansk buryatia cbg chel chelyabinsk chita chukotka chuvashia com dagestan e-burg edu gov grozny int irkutsk ivanovo izhevsk jar joshkar-ola kalmykia kaluga kamchatka karelia kazan kchr kemerovo khabarovsk khakassia khv kirov koenig komi kostroma kranoyarsk kuban kurgan kursk lipetsk magadan mari mari-el marine mil mordovia mosreg msk murmansk nalchik net nnov nov novosibirsk nsk omsk orenburg org oryol penza perm pp pskov ptz rnd ryazan sakhalin samara saratov simbirsk smolensk spb stavropol stv surgut tambov tatarstan tom tomsk tsaritsyn tsk tula tuva tver tyumen udm udmurtia ulan-ude vladikavkaz vladimir vladivostok volgograd vologda voronezh vrn vyatka yakutia yamal yekaterinburg yuzhno-sakhalinsk ',
  rw: 'ac co com edu gouv gov int mil net ',
  sa: 'com edu gov med net org pub sch ',
  sd: 'com edu gov info med net org tv ',
  se: 'a ac b bd c d e f g h i k l m n o org p parti pp press r s t tm u w x y z ',
  sg: 'com edu gov idn net org per ',
  sn: 'art com edu gouv org perso univ ',
  sy: 'com edu gov mil net news org ',
  th: 'ac co go in mi net or ',
  tj: 'ac biz co com edu go gov info int mil name net nic org test web ',
  tn: 'agrinet com defense edunet ens fin gov ind info intl mincom nat net org perso rnrt rns rnu tourism ',
  tz: 'ac co go ne or ',
  ua: 'biz cherkassy chernigov chernovtsy ck cn co com crimea cv dn dnepropetrovsk donetsk dp edu gov if in ivano-frankivsk kh kharkov kherson khmelnitskiy kiev kirovograd km kr ks kv lg lugansk lutsk lviv me mk net nikolaev od odessa org pl poltava pp rovno rv sebastopol sumy te ternopil uzhgorod vinnica vn zaporizhzhe zhitomir zp zt ',
  ug: 'ac co go ne or org sc ',
  uk: 'ac bl british-library co cym gov govt icnet jet lea ltd me mil mod national-library-scotland nel net nhs nic nls org orgn parliament plc police sch scot soc ',
  us: 'dni fed isa kids nsn ',
  uy: 'com edu gub mil net org ',
  ve: 'co com edu gob info mil net org web ',
  vi: 'co com k12 net org ',
  vn: 'ac biz com edu gov health info int name net org pro ',
  ye: 'co com gov ltd me net org plc ',
  yu: 'ac co edu gov org ',
  za: 'ac agric alt bourse city co cybernet db edu gov grondar iaccess imt inca landesign law mil net ngo nis nom olivetti org pix school tm web ',
  zm: 'ac co com edu gov net org sch ',
  // https://en.wikipedia.org/wiki/CentralNic#Second-level_domains
  com: 'ar br cn de eu gb gr hu jpn kr no qc ru sa se uk us uy za ',
  net: 'gb jp se uk ',
  org: 'ae',
  de: 'com ',
}

export function parseUri(uri: string) {
  // remove all control characters
  uri = uri.replaceAll(/\p{C}/gu, '')
  // const regex = /^(?:(?<scheme>[a-zA-Z0-9]+):)?(?:(?<slash>(?<=http:|ftp:|https:|gopher:|ws:|wss:):*[\\\/]*|(?<=:)[\\\/]{2}|:*[\\\/]{2,})(?:(?<username>[^\\\/?#:]*)(?::(?<password>[^\/?#]*))?@)?(?:\[(?<hostname1>[^\]]*)\](?::(?<port1>[^\/?#:]*))?|(?<hostname2>[^\\\/?#]+(:[^\\\/?#]+){2,})|(?<hostname3>[^\\\/?#:]*)(?::(?<port3>[^\/?#]*))?)?)?(?<path>[^?#]*)(?:\?(?<query>[^#]*))?(?:#(?<fragment>.*))?$/ui
  const regex = /^(?:(?:(?:(?<scheme1>http|ftp|https|gopher|ws|wss):+(?<slash1>[\\\/]*)|(?<scheme2>[a-zA-Z0-9]+):(?<slash2>[\\\/]{2})|(?:(?<scheme3>[a-zA-Z0-9]+):)?:*(?<slash3>[\\\/]{2,}))(?:(?<username>[^\\\/?#:]*)(?::(?<password>[^\/?#]*))?@)?(?:\[(?<hostname1>[^\]]*)\](?::(?<port1>[^\/?#:]*))?|(?<hostname2>[^\\\/?#]+(:[^\\\/?#]+){2,})|(?<hostname3>[^\\\/?#:]*)(?::(?<port3>[^\/?#]*))?)?)|(?<scheme4>[a-zA-Z0-9]+):)?(?<path>[^?#]*)(?:\?(?<query>[^#]*))?(?:#(?<fragment>.*))?$/ui
  // console.log(regex.source)
  const m = uri.match(regex)
  if (!m)
    throw new Error('Failed to parse')

  const groups = m.groups ?? {}
  const scheme = groups.scheme1 || groups.scheme2 || groups.scheme3 || groups.scheme4 || undefined
  const slash = groups.slash1 || groups.slash2 || groups.slash3 || undefined
  const isUrn = scheme && !Object.keys(defaultPorts).includes(scheme) && !groups.hostname && !slash
  const hostname = groups.hostname1 || groups.hostname2 || groups.hostname3
  return <UriData>{
    scheme: scheme, // http:
    username: groups.username ? decodeURIComponent(groups.username) : undefined, // username
    password: groups.password ? decodeURIComponent(groups.password) : undefined, // password
    hostname: hostname || undefined, // localhost
    urn: !!isUrn, // unknown
    port: groups.port1 || groups.port3 || undefined, // 257
    path: groups.path.replaceAll('\\', '/') || (isUrn ? '' : '/'), // /deploy/
    query: groups.query || undefined, // ?asd=asd
    fragment: groups.fragment || undefined, // #asd
  }
}

export function toString(data: UriData) {
  const scheme = getScheme(data)
  const authority = getAuthority(data)
  const path = getPathname(data)
  return (scheme ? `${scheme}:` : '')
      + (data.urn
        ? data.path
        : ((isAbsolute(data) || !!data.scheme) ? '//' : '')
          + ((authority ? `${authority}` : '')
              + path))
      + (data.query ? `?${data.query}` : '')
      + (data.fragment ? `#${data.fragment}` : '')
}

export function parseQueryString(query: string): Query {
  return mapValues(groupBy([...new URLSearchParams(query)], x => x[0]), x => x.length > 1 ? x.map(y => y[1]) : x[0][1])
}

export function segmentPath(path: string) {
  // return (path?.[0] === '/' ? path.substring(1) : path)?.split('/') ?? []
  return path.split('/')
}

export function isAbsolute(data: MayBeUriData) {
  data = resolveUriData(data)
  return data.urn || !!data.hostname
}

function getGreatestCommonIndex(a: string[], b: string[]) {
  let i = 0
  while (a[i] === b[i] && i < Math.min(a.length, b.length))
    i++
  return i
}

export function absoluteTo(url: MayBeUriData, baseUrl: MayBeUriData) {
  url = resolveUriData(url)
  baseUrl = resolveUriData(baseUrl)
  const authority1 = getAuthority(url)
  const authority2 = getAuthority(baseUrl)
  const urlPath = url.path ? normalizeUriPath(url.path) : undefined
  const baseUrlPath = baseUrl.path ? normalizeUriPath(baseUrl.path) : undefined
  const path = urlPath?.[0] === '/' ? urlPath : baseUrlPath && urlPath ? joinPaths(baseUrlPath, urlPath) : urlPath
  return <UriData> {
    scheme: url.scheme && url.scheme !== baseUrl.scheme ? url.scheme : baseUrl.scheme,
    username: authority1 && authority1 !== authority2 ? url.username : baseUrl.username,
    password: authority1 && authority1 !== authority2 ? url.password : baseUrl.password,
    hostname: authority1 && authority1 !== authority2 ? url.hostname : baseUrl.hostname,
    port: authority1 && authority1 !== authority2 ? url.port : baseUrl.port,
    path: path ? normalizeUriPath(path) : undefined,
    urn: url.urn,
  }
}

export function joinPaths(path1: string, path2: string) {
  return segmentPath(path1).slice(0, -1).concat(segmentPath(path2)).join('/')
}
export function normalizeUriPath(path: string) {
  const segments = segmentPath(path)
  const leadingSlash = path[0] === '/'
  const newSegments = []
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    switch (segment) {
      case '':
        // handling trailing slash
        if (i === segments.length - 1)
          newSegments.push('')
        continue
      case '.':
        continue
      case '..':
        if (newSegments.length > 0 && newSegments[newSegments.length - 1] !== '..')
          newSegments.pop()
        // add `..` if  relative path
        else if (!leadingSlash)
          newSegments.push('..')
        break
      default:
        newSegments.push(encodePipe(segment))
        break
    }
  }
  return (leadingSlash ? '/' : '') + newSegments.join('/')
}

export function normalizePath(uri: UriData) {
  if (uri.urn) {
    uri.path = uri.path?.replaceAll('/', '%2F')
    return uri
  }
  if (uri.path)
    uri.path = normalizeUriPath(uri.path)
  return uri
}

export function normalize(data: UriData) {
  if (data.scheme)
    data.scheme = data.scheme?.toLowerCase()
  if (data.hostname) {
    data.hostname = new URL(`http://${getHost(data)}`).hostname
    data.hostname = data.hostname.replace(/^\[/, '').replace(/\]$/, '')
  }
  if (data.port && data.scheme)
    data.port = data.scheme && data.port && defaultPorts[data.scheme] !== parseInt(data.port) ? data.port.toString() : undefined
  if (data.port)
    data.port = parseInt(data.port).toString()
  if (data.path)
    data.path = data.path.replaceAll('"', '%22').replaceAll(' ', '%20')
  if (data.query) {
    const searchParams = new URLSearchParams(data.query)
    searchParams.delete('__proto__')
    data.query = searchParams.toString()
  }
  // uri.path = encodeURIComponent(uri.path)
  return normalizePath(data)
}

function encodePath(path: string) {
  return path.split('/').map(x => encodePipe(x)).join('/')
}

function encodePipe(text: string) {
  return text.replace('|', '%7C')
}

export function relativeTo(url: MayBeUriData, baseUrl: MayBeUriData) {
  url = resolveUriData(url)
  baseUrl = resolveUriData(baseUrl)

  const authority1 = getAuthority(url)
  const authority2 = getAuthority(baseUrl)

  const segments1 = url.path ? segmentPath(normalizeUriPath(url.path)) : []
  const segments2 = baseUrl.path ? segmentPath(normalizeUriPath(baseUrl.path)).slice(0, -1) : [] // ignore last segment which is filename
  const startIndex = getGreatestCommonIndex(segments1, segments2)
  const pathname = normalizeUriPath(segments2.slice(startIndex).map(() => '..').concat(segments1.slice(startIndex)).join('/'))
  const sameScheme = url.scheme === baseUrl.scheme
  const sameBase = sameScheme && authority1 === authority2
  // (scheme1 !== scheme2 ? `${scheme1}:` : '') + (authority1 !== authority2 ? `//${authority1}/` : '') + pathname
  return <UriData>{
    scheme: !sameScheme ? url.scheme : undefined,
    username: !sameBase ? url.username : undefined,
    password: !sameBase ? url.password : undefined,
    hostname: !sameBase ? url.hostname : undefined,
    port: !sameBase ? url.port : undefined,
    path: (!sameBase && pathname[0] !== '/' ? '/' : '') + pathname,
    urn: url.urn,
  }
}

function resolveUriData(data: MayBeUriData) {
  if (typeof data === 'string')
    return parseUri(data)
  return data
}

/* Get methods */
export function getQueryString(data: MayBeUriData) {
  data = resolveUriData(data)
  return data.query ?? ''
}

export function getQuery(data: MayBeUriData) {
  data = resolveUriData(data)
  return parseQueryString(getQueryString(data))
}

export function getScheme(data: MayBeUriData) {
  data = resolveUriData(data)
  return data.scheme ?? ''
}

export function getSegments(data: MayBeUriData) {
  data = resolveUriData(data)
  return segmentPath(data.path ?? '')
}

export function getPathname(data: MayBeUriData) {
  data = resolveUriData(data)
  return data.path ?? ''
}

export function getFilename(data: MayBeUriData) {
  data = resolveUriData(data)
  const segments = getSegments(data)
  return !data.urn ? segments[segments.length - 1] : ''
}

export function getFragment(data: MayBeUriData) {
  data = resolveUriData(data)
  return data.fragment ?? ''
}

export function getSuffix(data: MayBeUriData) {
  data = resolveUriData(data)
  const filename = getFilename(data)
  const segments = filename.split('.')
  if (segments.length < 2)
    return ''
  const suffix = segments[segments.length - 1] ?? ''
  return (/^[a-z0-9%]+$/i).test(suffix) ? suffix : ''
}

export function getHost(data: MayBeUriData) {
  // hostname:port
  data = resolveUriData(data)
  const hostname = getHostname(data)
  return (isIpv6(data) ? `[${hostname}]` : hostname) + (data.port ? `:${data.port}` : '')
}

export function getTld(data: MayBeUriData) {
  data = resolveUriData(data)
  if (isIp(data))
    return ''
  const hostname = getHostname(data)
  const hostnameParts = hostname.split('.')
  const tld = hostnameParts[hostnameParts.length - 1]
  const sld = hostnameParts[hostnameParts.length - 2]
  return SLD[tld]?.split(' ').includes(sld) ? `${sld}.${tld}` : tld
}

export function getDomain(data: MayBeUriData) {
  data = resolveUriData(data)
  if (isIp(data))
    return ''
  const tld = getTld(data)
  const hostname = getHostname(data)
  const hostnameParts = hostname.split('.')
  return hostnameParts.slice(tld.includes('.') ? -3 : -2).join('.')
}

export function getSubdomain(data: MayBeUriData) {
  data = resolveUriData(data)
  if (isIp(data))
    return ''
  const tld = getTld(data)
  const hostname = getHostname(data)
  const hostnameParts = hostname.split('.')
  return hostnameParts.slice(0, tld.includes('.') ? -3 : -2).join('.')
}

export function isIp(data: MayBeUriData) {
  return isIpv6(data) || isIpv4(data)
}

export function isIpv6(data: MayBeUriData) {
  data = resolveUriData(data)
  return data.hostname ? ipv6Regex.test(data.hostname) : false
}

export function isIpv4(data: MayBeUriData) {
  data = resolveUriData(data)
  return data.hostname ? ipv4Regex.test(data.hostname) : false
}

export function getHostname(data: MayBeUriData) {
  data = resolveUriData(data)
  return data.hostname ?? ''
}

export function getUsername(data: MayBeUriData) {
  data = resolveUriData(data)
  return data.username ?? ''
}

export function getPassword(data: MayBeUriData) {
  data = resolveUriData(data)
  return data.password ?? ''
}

export function getUserInfo(data: MayBeUriData) {
  data = resolveUriData(data)
  const username = getUsername(data)
  const password = getPassword(data)
  return `${encodeURIComponent(username)}${password ? `:${encodeURIComponent(password)}` : ''}`
}

export function getAuthority(data: MayBeUriData) {
  data = resolveUriData(data)
  const userInfo = getUserInfo(data)
  const host = getHost(data)
  return `${userInfo ? `${userInfo}@` : ''}${host}`
}

export function getOrigin(data: MayBeUriData) {
  data = resolveUriData(data)
  const scheme = getScheme(data)
  const authority = getAuthority(data)
  return authority ? ((scheme ? `${scheme}://` : '') + authority) : ''
}

/* Set Methods */
export function addQuery(data: MayBeUriData, query: Query) {
  data = resolveUriData(data)

  const search = new URLSearchParams(data.query)
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === 'string') {
      search.append(key, value)
    }
    else if (value) {
      for (const val of value)
        search.append(key, val)
    }
  }
  data.query = search.toString()
  return data
}

export function setQuery(data: MayBeUriData, query: string) {
  data = resolveUriData(data)
  data.query = query
  return data
}

export function setPathname(data: MayBeUriData, pathname: string) {
  data = resolveUriData(data)
  data.path = pathname
  return data
}

export function setFilename(data: MayBeUriData, filename: string) {
  data = resolveUriData(data)
  const segments = getSegments(data)
  segments[segments.length - 1] = filename
  return setPathname(data, segments.join('/'))
}

export function setSubdomain(data: MayBeUriData, value: string) {
  data = resolveUriData(data)
  data.hostname = `${(value ? `${value}.` : '')}${getDomain(data)}`
  return data
}

export function setAuthority(data: MayBeUriData, value: string) {
  data = resolveUriData(data)
  const newData = parseUri(`//${value}`)
  return <UriData>{
    ...data,
    username: newData.username,
    password: newData.password,
    hostname: newData.hostname,
    port: newData.port,
  }
}

export function setUserInfo(data: UriData, value: string) {
  const newData = parseUri(`//${value}`)
  return <UriData>{
    ...data,
    username: newData.username,
    password: newData.password,
  }
}

export function setHost(data: UriData, value: string) {
  const newData = parseUri(`//${value}`)
  return <UriData>{
    ...data,
    hostname: newData.hostname,
    port: newData.port,
  }
}

export class URI {
  private readonly uri

  static from(url: string) {
    const uri = parseUri(url)
    return new URI(uri)
  }

  constructor(uri: MayBeUriData) {
    uri = resolveUriData(uri)
    this.uri = uri
  }

  get authority() {
    return getAuthority(this.uri)
  }

  get scheme() {
    return getScheme(this.uri)
  }

  get suffix() {
    return getSuffix(this.uri)
  }

  get username() {
    return getUsername(this.uri)
  }

  get userInfo() {
    return getUserInfo(this.uri)
  }

  get password() {
    return getPassword(this.uri)
  }

  get host() {
    return getHost(this.uri)
  }

  get hostname() {
    return getHostname(this.uri)
  }

  get origin() {
    return getOrigin(this.uri)
  }

  get pathname() {
    return getPathname(this.uri)
  }

  get filename() {
    return getFilename(this.uri)
  }

  get query() {
    return getQuery(this.uri)
  }

  get queryString() {
    return getQueryString(this.uri)
  }

  get fragment() {
    return getFragment(this.uri)
  }

  get tld() {
    return getTld(this.uri)
  }

  get domain() {
    return getDomain(this.uri)
  }

  get subdomain() {
    return getSubdomain(this.uri)
  }

  toString() {
    return toString(this.uri)
  }

  setAuthority(value: string) {
    return new URI(setAuthority(this.uri, value))
  }

  setUserInfo(value: string) {
    return new URI(setUserInfo(this.uri, value))
  }

  setHost(value: string) {
    return new URI(setHost(this.uri, value))
  }

  setPathname(value: string) {
    return new URI(setPathname(this.uri, value))
  }

  setSubdomain(value: string) {
    return new URI(setSubdomain(this.uri, value))
  }

  setFilename(value: string) {
    return new URI(setFilename(this.uri, value))
  }

  absoluteTo(baseUrl: string) {
    return new URI(absoluteTo(this.uri, parseUri(baseUrl)))
  }

  relativeTo(baseUrl: string) {
    return new URI(relativeTo(this.uri, baseUrl))
  }

  normalize() {
    return new URI(normalize(this.uri))
  }

  isUrn() {
    return this.uri.urn
  }

  isIpv6() {
    return isIpv6(this.uri)
  }

  isIpv4() {
    return isIpv4(this.uri)
  }

  isIp() {
    return isIp(this.uri)
  }

  isAbsolute() {
    return isAbsolute(this.uri)
  }
}
