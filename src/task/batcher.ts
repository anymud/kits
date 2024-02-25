import {
  Observable,
  Subject,
  asyncScheduler,
  buffer,
  bufferTime,
  bufferWhen,
  delay,
  expand,
  first, firstValueFrom, lastValueFrom, observeOn, race, raceWith, share, subscribeOn, throttleTime, timestamp,
} from 'rxjs'

interface Request<T> {
  id: number
  data: T
}

// function flatMapAsync<T, R>(fn: (x: T) => Promise<R[]>) {
//   return function (source: Observable<T>): Observable<R> {
//     return new Observable((subscriber) => {
//       source.subscribe({
//         async next(value) {
//           const entries = await fn(value)
//           for (const entry of entries)
//             subscriber.next(entry)
//         },
//         error(error) {
//           subscriber.error(error)
//         },
//         complete() {
//           subscriber.complete()
//         },
//       })
//     })
//   }
// }
function cooldown<T>(time: number, timeStamp: (x: T) => number = () => Date.now()) {
  return function (source: Observable<T>): Observable<T> {
    return new Observable((subscriber) => {
      let lastTime = 0
      let timer: NodeJS.Timer
      function emit(value: T) {
        lastTime = Date.now()
        subscriber.next(value)
      }
      source.subscribe({
        next(value) {
          const duration = timeStamp(value) - lastTime
          if (timer)
            clearTimeout(timer)
          // console.log('duration', duration)
          if (duration >= time)
            emit(value)
          else
            timer = setTimeout(() => emit(value), time - duration)
        },
        error(error) {
          subscriber.error(error)
        },
        complete() {
          subscriber.complete()
        },
      })
    })
  }
}
export class Batcher<T, R> {
  private requestId = 0
  private requestSubject = new Subject<Request<T>>()
  private errorSubject = new Subject<Error>()
  private responseSubject = new Subject<{
    request: Request<T>
    result: R
  }>()

  constructor(
    fn: (input: T[]) => Promise<R[]>,
    wait = 5000,
    minWait = 100,
  ) {
    const src$ = this.requestSubject.pipe(timestamp())
    const closing$ = src$
      .pipe(
        throttleTime(minWait, undefined, { leading: false, trailing: true }),
        cooldown(wait, x => x.timestamp),
      )
    src$
      .pipe(
        buffer(closing$),
      )
      .subscribe({
        next: async (requests) => {
          try {
            console.log(Date.now(), 'requests.length', requests.length)
            const results = await fn(requests.map(x => x.value.data))
            for (let i = 0; i < results.length; i++) {
              this.responseSubject.next({
                request: requests[i].value,
                result: results[i],
              })
            }
          }
          catch (e) {
            if (e instanceof Error)
              this.errorSubject.next(e)
          }
        },
        error: e => this.errorSubject.next(e),
      })
  }

  async run(data: T) {
    const request = {
      id: this.requestId++,
      data,
    }
    const observable = this.responseSubject.pipe(first(x => x.request.id === request.id))
    // const response = await new Promise((resolve, reject) => {
    //   console.log('start')
    //   const s = observable.subscribe({
    //     next: async (x) => {
    //       s.unsubscribe()
    //       await setTimeout(0)
    //       resolve(x)
    //     },
    //   })
    //
    // })
    this.requestSubject.next(request)
    const response = await firstValueFrom(observable)
    // console.log('result', response.request.id)
    return response.result
  }
}
