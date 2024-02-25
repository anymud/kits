import { setTimeout } from 'timers/promises'
import { hash } from 'ohash'
import type { ConsoleMessage, Frame, HTTPRequest, HTTPResponse, Page } from 'puppeteer'

import {
  BehaviorSubject,
  Observable,
  Subject,
  Subscription,
  Unsubscribable,
  debounce,
  filter,
  firstValueFrom,
  fromEventPattern,
  interval,
  map, mergeWith,
  of,
  shareReplay,
  startWith,
  tap,
  timestamp,
} from 'rxjs'
import type { IDisposable } from '~~/kit/disposable/'
import { CancellationToken, OperationCanceledError } from '~~/kit/promise/cancellationToken'

declare global {
  const __mutationObserverCallback: MutationCallback
  let __mutationObserver: MutationObserver | undefined
}

interface Message<C extends string = string, V = void> {
  channel: C
  value: V
}

interface Messages {
  mutation: Message<'mutation'>
}

function isMessage(channel: keyof Messages, message: Message<any, any>): message is Messages[typeof channel] {
  return message.channel === channel
}

function setupMutationObserver(page: Page) {
  return page.evaluate(() => {
    if (typeof __mutationObserver !== 'undefined')
      return

    const observer = new MutationObserver(() => {
      console.log(JSON.stringify(<Messages['mutation']>{ channel: 'mutation' }))
    })
    observer.observe(document, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true,
    })
    __mutationObserver = observer
  })
}

export function observeMutation(page: Page): Observable<null> {
  return new Observable<null>((subscriber) => {
    const subscription = new Subscription()

    setupMutationObserver(page)
      .then(() => {
        subscription.add(() => {
          return page.evaluate(() => {
            if (typeof __mutationObserver === 'undefined')
              return

            __mutationObserver?.disconnect()
            __mutationObserver = undefined
          })
        })
      })
      .catch(e => subscriber.error(e))

    fromEventPattern<Frame>(
      x => page.on('framenavigated', x),
      x => page.off('framenavigated', x),
    )
      .pipe(filter(x => x === page.mainFrame()))
      .subscribe({
        next: async () => {
          // navigation is a mutation.
          subscriber.next(null)
          await setupMutationObserver(page)
        },
        error: e => subscriber.error(e),
      })
      .add(subscription)

    fromEventPattern<ConsoleMessage>(x => page.on('console', x), x => page.off('console', x))
      .pipe(
        filter((x) => {
          const json: Message = JSON.parse(x.text())
          return isMessage('mutation', json)
        }),
      )
      .subscribe({
        next: () => subscriber.next(null),
        error: e => subscriber.error(e),
      })
      .add(subscription)

    return subscription
  })
}

export function createDomMonitor(page: Page) {
  return new DomMonitor(page)
}

function registerToken(token: CancellationToken) {
  return function<T>(source: Observable<T>): Observable<T> {
    return new Observable((subscriber) => {
      token.register(() => subscriber.error(new OperationCanceledError(token)))
      return source.subscribe(subscriber)
    })
  }
}

export class DomMonitor implements IDisposable {
  private subscription = new Subscription()
  private mutatedAtSubject = new BehaviorSubject<number | null>(null)
  private mutationObservable
  constructor(private page: Page) {
    this.mutationObservable = observeMutation(page)
      .pipe(
        startWith(null),
        timestamp(),
        map(x => x.timestamp),
        shareReplay(1),
      )

    this.mutationObservable
      .subscribe(this.mutatedAtSubject)
      .add(this.subscription)
  }

  async waitForIdle(wait = 500, token: CancellationToken = CancellationToken.None) {
    // console.log('DomMonitor.waitForIdle')
    await firstValueFrom(this.mutationObservable
      .pipe(
        // tap(x => console.log('DomMonitor 1:', x, Date.now())),
        debounce((x) => {
          const period = x + wait - Date.now()
          // console.log('period', period)
          return period > 0 ? interval(period) : of(0)
        }),
        // tap(x => console.log('DomMonitor 2:', x, Date.now())),
        registerToken(token),
      ))
  }

  get mutatedAt() {
    return this.mutatedAtSubject.value
  }

  dispose() {
    this.subscription.unsubscribe()
  }
}

function isChanged<T>(getter: () => Promise<T>) {
  let value: T
  return async () => {
    const lastValue = value
    value = await getter()
    return lastValue !== value
  }
}

export async function autoScroll(page: Page, onScrolled?: (yDelta: number) => Promise<void>) {
  // let scrollHeightChangedCount = 0
  // const isScrollHeightChanged = isChanged(() => page.evaluate(() => document.body.scrollHeight))
  while (true) {
    // if (await isScrollHeightChanged() && ++scrollHeightChangedCount >= 5)
    //   break

    // console.log('Scrolling: ', window.scrollY, window.innerHeight, scrollHeight, document.body.scrollHeight)
    const yDelta = await page.evaluate(() => {
      const originalY = window.scrollY
      window.scrollBy({ top: window.outerHeight })
      return window.scrollY - originalY
    })
    // console.log('[autoScroll] yDelta:', yDelta)
    if (!yDelta)
      break

    // await setTimeout(500)
    await onScrolled?.(yDelta)
    // await setTimeout(200)
  }
}

function dumpFrameTree(frame: Frame, indent: string) {
  console.log(indent + frame.url())
  for (const child of frame.childFrames())
    dumpFrameTree(child, `${indent}  `)
}

export async function waitForCloudflareChecking(page: Page) {
  // console.log('waitForCloudflareChecking')
  const startTime = Date.now()
  let hasClicked = false
  while (true) {
    // const checkStartTime = Date.now()
    const isOkay = await page.$eval('form#challenge-form[action="/cgi-bin/verify"]', x => false)
      .catch(() => true)
    // console.log('time for checking challenge from:', Date.now() - checkStartTime)
    if (isOkay) {
      // console.log('isOkay', isOkay, Date.now() - startTime)
      return
    }

    // console.log('waitForCloudflareChecking 1')
    // try clicking the recaptcha button if found
    if (!hasClicked) {
      try {
        // dumpFrameTree(page.mainFrame(), '')
        const frames = page.mainFrame().childFrames()
        for (const frame of frames) {
          // if (frame.)
          // console.log('checking frame', frame.url(), frame.isDetached())
          const checkbox = await frame.$('#recaptcha-anchor')
          if (checkbox) {
            // console.log('found recaptcha button')
            await checkbox.click()
            hasClicked = true
            break
          }
        }
      }
      catch (e) {
        // ignore
      }
    }
    // console.log('waitForCloudflareChecking 2')

    // timeout, failed to resolve the checking.
    if ((Date.now() - startTime) > 5000)
      throw new Error('it seems we are blocked by captcha.')

    // const setTimeoutStartTime = Date.now()
    await setTimeout(100)
    // console.log('time for setTimeout:', Date.now() - setTimeoutStartTime)
  }
}

function getRequestId(request: HTTPRequest) {
  return hash({
    url: request.url(),
    method: request.method(),
    headers: request.headers(),
    initiator: request.initiator(),
  })
}

function observeNetwork(page: Page, predicate: (request: HTTPRequest) => boolean = () => true) {
  return new Observable<{ type: 'reset' | 'request' | 'response'; activeCount: number }>((subscriber) => {
    const subscription = new Subscription()
    let activeCount = 0
    let requests: Record<string, HTTPRequest> = {}

    fromEventPattern<Frame>(x => page.on('framenavigated', x), x => page.off('framenavigated', x))
      .pipe(filter(x => x === page.mainFrame()))
      .subscribe(() => {
        activeCount = 0
        requests = {}
        subscriber.next({
          type: 'reset',
          activeCount,
        })
      })
      .add(subscription)

    fromEventPattern<HTTPRequest>(x => page.on('request', x), x => page.off('request', x))
      .pipe(filter(x => predicate(x) && !x.response() && !requests[getRequestId(x)]))
      .subscribe((x) => {
        requests[getRequestId(x)] = x
        activeCount++
        subscriber.next({
          type: 'request',
          activeCount,
        })
      })
      .add(subscription)

    fromEventPattern<HTTPResponse>(x => page.on('response', x), x => page.off('response', x))
      .pipe(
        map(x => x.request()),
        mergeWith(fromEventPattern<HTTPRequest>(x => page.on('requestfailed', x), x => page.off('requestfailed', x))),
        filter(x => !!requests[getRequestId(x)]),
      )
      .subscribe((x) => {
        delete requests[getRequestId(x)]
        activeCount--
        subscriber.next({
          type: 'response',
          activeCount,
        })
      })
      .add(subscription)

    return subscription
  })
}
class RequestsMonitor implements IDisposable {
  private subscription = new Subscription()
  private observable
  constructor(
    private page: Page,
    private predicate: (request: HTTPRequest) => boolean = () => true) {
    // console.log('RequestsMonitor')
    this.observable = observeNetwork(page, predicate)
      .pipe(
        startWith({ activeCount: 0, type: 'reset' }),
        timestamp(),
        shareReplay(1),
      )

    this.observable.subscribe()
      .add(this.subscription)
  }

  async waitForIdle(wait = 500, token: CancellationToken = CancellationToken.None) {
    // console.log('RequestsMonitor.waitForIdle')
    await firstValueFrom(this.observable
      .pipe(
        // tap(x => console.log('RequestsMonitor 1:', x, Date.now())),
        debounce((x) => {
          const period = x.timestamp + wait - Date.now()
          // console.log('period', period)
          return period > 0 ? interval(period) : of(0)
        }),
        filter(x => x.value.activeCount === 0),
        // tap(x => console.log('RequestsMonitor 2:', x, Date.now())),
        registerToken(token),
      ))
  }

  dispose() {
    this.subscription.unsubscribe()
  }
}

export function createRequestsMonitor(page: Page, predicate: (request: HTTPRequest) => boolean = () => true) {
  return new RequestsMonitor(page, predicate)
}

export async function getCanonicalUrl(page: Page) {
  return await page.$eval('link[rel="canonical"]', x => x.getAttribute('href')).then(x => x ?? page.url()).catch(() => page.url())
}
