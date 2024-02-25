import { defu } from 'defu'
import { hash } from 'ohash'
import { $fetch } from 'ofetch'
import { useStealthBrowser } from '~/kit/browser'
import { pipe } from '~/kit/chain'
import { useAsyncLazy } from '~/kit/lazy'
import { semanticSplit } from '~/kit/text'
import { addQuery, toString } from '~/kit/text/uri'
import { arrayToObject } from '~/kit/type'

interface TranslateRequest {
  text: string
  from?: string
  to: string
  autoCorrect?: boolean
}

interface ExecuteResponse {
  rpcId: string
  payload: object
  name: string
}

interface Request {
  request: TranslateRequest
  transformedRequests: TranslateRequest[]
}

export interface TranslateResult {
  translatedText: string
  detectedLanguageCode: string
  request: TranslateRequest
}
export class GoogleTranslator {
  private data: {} | undefined
  private host = 'https://translate.google.com'
  private rpcId = 'MkEWBc'
  private pageLazy = useAsyncLazy(async () => {
    const browser = await useStealthBrowser()
    const page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.134 Safari/537.36')
    return page
  })

  extract(key: string, res: string) {
    const re = new RegExp(`"${key}":".*?"`)
    const result = re.exec(res)
    if (result !== null)
      return result[0].replace(`"${key}":"`, '').slice(0, -1)
    return ''
  }

  parseResult(json: any): TranslateResult {
    if (!json)
      throw new Error('json is empty.')

    const result: TranslateResult = {
      translatedText: '',
      detectedLanguageCode: '',
      request: {
        text: '',
        to: '',
      },
    }

    // console.log(inspect(json, { showHidden: false, depth: null, colors: true }))
    if (json[1][0][0][5] === undefined || json[1][0][0][5] === null) {
      // translation not found, could be a hyperlink or gender-specific translation?
      result.translatedText = json[1][0][0][0]
    }
    else {
      result.translatedText = json[1][0][0][5]
        .map((obj: [string]) => {
          return obj[0]
        })
        .filter(Boolean)
        // Google api seems to split text per sentences by <dot><space>
        // So we join text back with spaces.
        // See: https://github.com/vitalets/google-translate-api/issues/73
        .join(' ')
    }

    // result.pronunciation = json[1][0][0][1]

    // From language
    if (json[0] && json[0][1] && json[0][1][1])
      result.detectedLanguageCode = json[0][1][1][0]

    else if (json[1][3] === 'auto')
      result.detectedLanguageCode = json[2]

    else
      result.detectedLanguageCode = json[1][3]

    result.request.text = json[1][4][0]
    result.request.from = json[1][4][1]
    result.request.to = json[1][4][2]
    result.request.autoCorrect = json[1][4][3]
    return result
  }
  //
  // processResponse(response: string) {
  //   let responseData = response.slice(6)
  //   const rpcResponses = []
  //   while (true) {
  //     // console.log('json', json)
  //
  //     const lengthStr = /^\d+/.exec(responseData)?.[0]
  //     if (!lengthStr)
  //       break
  //
  //     responseData = responseData.slice(lengthStr.length)
  //     const contentStr = responseData.slice(0, parseInt(lengthStr, 10))
  //     responseData = responseData.slice(contentStr.length)
  //     // x[1]: rpc id
  //     // x[2]: payload
  //     // x[5]: error, [3] probably translating empty string
  //     // x[6]: name
  //     rpcResponses.push(...JSON.parse(contentStr)
  //       .filter((x: any) => x[1] === this.rpcId && x[2])
  //       .map(x => JSON.parse(x[2])))
  //   }
  //   return rpcResponses
  // }

  processResponse(response: string): ExecuteResponse[] {
    return JSON.parse(response.slice(6))
      .filter((x: any) => x[1] === this.rpcId && x[2])
      .map((x: any) => (<ExecuteResponse>{
        rpcId: x[1],
        payload: JSON.parse(x[2]),
        name: x[6],
      }))
  }

  getPage() {
    return this.pageLazy.value()
  }

  async advanceTranslate(text: string, to: string) {
    const page = await this.getPage()
    const responsePromise = page.waitForResponse(x => (x.url().includes(`rpcids=${this.rpcId}`)))
    await page.goto(pipe(addQuery('https://translate.google.com/', {
      sl: 'auto',
      tl: to,
      text,
    }), toString))
    // await page.type('[aria-label="Source text"]', '區塊客早前報導有關香港證監會已向多家交易所發信警告，要求將有可能被歸類為證券或期貨的加密貨幣下架。今（<i>9</i>）日')
    const responseText = await responsePromise.then(x => x.text())
    const responses = this.processResponse(responseText)
    return this.parseResult(responses[0])
  }

  getHash(request: TranslateRequest) {
    return hash(request)
  }

  *splitRequest(request: TranslateRequest) {
    const limit = 5000
    let text = ''
    for (const line of request.text.split('\n')) {
      let newText = text ? `${text}\n${line}` : line
      if (newText.length > limit) {
        if (text.length > 0) {
          yield <TranslateRequest>{
            ...request,
            text,
          }
        }
        else {
          yield <TranslateRequest>{
            ...request,
            text: newText.slice(0, limit),
          }
          newText = newText.slice(limit)
        }
        newText = line
      }
      text = newText
    }
    if (text) {
      yield <TranslateRequest>{
        ...request,
        text,
      }
    }
  }

  getId(parent: number, index: number) {
    return `${parent}-${index}`
  }

  async translateBatch(translates: TranslateRequest[]) {
    const requests = translates.map((x) => {
      // apply default
      x = defu(x, {
        from: 'auto',
        autoCorrect: true,
      })
      // transform request within the limit
      return <Request>{
        request: x,
        transformedRequests: semanticSplit(x.text, 5000).map(y => ({
          ...x,
          text: y,
        })),
      }
    })

    // build request
    const queryParams = new URLSearchParams({
      'rpcids': this.rpcId,
      'source-path': '/',
      'f.sid': '-9181746695197541818',
      'bl': 'boq_translate-webserver_20220829.07_p0',
      'hl': 'en-US',
      'soc-app': '1',
      'soc-platform': '1',
      'soc-device': '1',
      '_reqid': '1202194',
      // 'rt': 'c',
    })
    const url = `${this.host}/_/TranslateWebserverUi/data/batchexecute?${queryParams.toString()}`
    const body = {
      'f.req': JSON.stringify([
        requests.flatMap((x, p) => x.transformedRequests.map((x, i) => [this.rpcId, JSON.stringify([[x.text, x.from, x.to, x.autoCorrect], [null]]), null, this.getId(p, i)])),
      ]),
    }

    // send
    const response = await $fetch(url, {
      method: 'POST',
      body: new URLSearchParams(body).toString(),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.124 Safari/537.36 Edg/102.0.1245.44',
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
    })

    // process request
    const responses = this.processResponse(response)

    // create result map as the order is not ensure
    const resultMap = arrayToObject(responses, x => x.name, x => this.parseResult(x.payload))

    return requests.map((x, p) => {
      // join all transformed requests
      const transformedRequests = x.transformedRequests.map((tx, i) => {
        const id = this.getId(p, i)
        if (!resultMap[id])
          throw new Error(`Missing translate result: ${JSON.stringify(tx)} (index: ${i}) ${JSON.stringify(x)}`)
        return resultMap[id]
      })

      if (!transformedRequests.length)
        throw new Error('No requests. should be a bug.')

      return {
        // base on the first request
        ...transformedRequests[0],
        // but concat all other requests
        translatedText: transformedRequests.map(x => x.translatedText).join('\n'),
      }
    })
  }
}

