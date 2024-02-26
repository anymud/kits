import { Readable, Writable, Duplex } from 'stream';
import { asError } from '.'
import { buffer, text } from 'stream/consumers'

export function toNodeReadable(readableStream: ReadableStream): Readable {
    const reader = readableStream.getReader();
    let reading = false;

    return new Readable({
        async read() {
            if (reading) return; // Prevent concurrent read operations
            reading = true;

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        this.push(null); // Signal end of stream
                        break;
                    }
                    const canContinue = this.push(value);
                    if (!canContinue) {
                        break; // Stop reading if push returns false (backpressure)
                    }
                }
            } catch (e) {
                this.emit('error', e);
            } finally {
                reading = false;
            }
        },
        destroy(err, callback) {
            (async () => {
                try {
                    await reader.cancel();
                } catch (cancelError) {
                    callback(asError(cancelError));
                    return;
                }
                callback(null);
            })();
        },
    });
}

export function toNodeWritable(writableStream: WritableStream) {
    const writer = writableStream.getWriter();

    return new Writable({
        async write(chunk, encoding, callback) {
            try {
                await writer.write(chunk);
            } catch (error) {
                callback(asError(error));
                return;
            }
            callback();
        },
        
        async destroy(err, callback) {
            try {
                await writer.abort(err);
            } catch (error) {
                callback(asError(error));
                return 
            }
            callback();
        },
        async final(callback) {
            try {
                await writer.close();
            } catch (error) {
                callback(asError(error));
                return
            }
            callback();
        },
    });
}

export function toWebWritable(writable: Writable) : WritableStream<any> {
    return new WritableStream({
        write(chunk, controller) {
            return new Promise((resolve, reject) => {
                writable.write(chunk, (error) => {
                    if (error) {
                        controller.error(error);
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });
        },
        close() {
            // Assuming a graceful closure is desired:
            return new Promise((resolve) => {
                writable.end(resolve);
                           // If there's an error, it should be handled by listening to the 'error' event on the writable itself.
            });
        },
    });
}


export function toWebReadable(readable: Readable) : ReadableStream<any> {
    return new ReadableStream({
        start(controller) {
            readable.on('data', chunk => {
                controller.enqueue(chunk);
                    
                if (controller.desiredSize === 0) {
                    readable.pause();
                }
            });
            readable.on('end', () => {
                controller.close();
            });
            readable.on('error', (err) => {
                controller.error(err); // Properly handle errors
            });
        },
        pull(controller) {
            // Called when the consumer is ready for more data
            readable.resume();
        },
        cancel() {
            // Handle stream cancellation (cleanup if necessary)
            readable.destroy();
        },
    });
}

export function toWebPair(passthrough: Readable & Writable) {
    return {
        readable: toWebReadable(passthrough),
        writable: toWebWritable(passthrough),
    }
}

export function cast<T>(stream: WritableStream): WritableStream<T>;
export function cast<T>(stream: ReadableStream): ReadableStream<T>;
export function cast<I, O>(stream: ReadableStream | WritableStream): ReadableStream<I> | WritableStream<O>
export function cast(stream: any): any {
    return stream as any;
}

export type AnyReadable<T = any> = ReadableStream<T> | Readable;
export type AnyWritable<T = any> = WritableStream<T> | Writable;
export type AnyDuplex<I = any, O = any> = ReadableWritablePair<I, O> | (Readable & Writable);
export type AnyReadableResult<T> = T extends Readable ? ReadableStream<any> : T
export type AnyWritableResult<T> = T extends Writable ? WritableStream<any> : T
export type AnyDuplexResult<T> = T extends Readable & Writable ? ReadableWritablePair<any, any> : T


export function resolveReadable<T extends AnyReadable>(stream: T): AnyReadableResult<T> {
    if (stream instanceof ReadableStream) {
        return stream as any;
    } else {
        return toWebReadable(stream) as any;
    }
}

export function resolveWritable<T extends AnyWritable>(stream: T): AnyWritableResult<T> {
    if (stream instanceof WritableStream) {
        return stream as any;
    } else {
        return toWebWritable(stream) as any;
    }
}

export function resolveDuplex<T extends AnyDuplex>(stream: T): AnyDuplexResult<T> {
    if (isDuplex(stream)) {
        return stream as any;
    } else {
        return toWebPair(stream) as any;
    }
}

type AnyStream = AnyReadable | AnyWritable | AnyDuplex
type ResultStream<T> = T extends AnyReadable ? AnyReadableResult<T> : T extends AnyWritable ? AnyWritableResult<T> : T extends AnyDuplex ? AnyDuplexResult<T> : never
export function resolveStream<T extends AnyStream>(stream: T): ResultStream<T> {
    if (stream instanceof Readable && stream instanceof Writable) {
        return toWebPair(stream) as any;
    } else if (stream instanceof Readable) {
        return toWebReadable(stream) as any;
    } else if (stream instanceof Writable) {
        return toWebWritable(stream) as any;
    } else {
        throw new Error('Invalid stream');
    }
}

function isDuplex(stream: any): stream is ReadableWritablePair {
    return stream.readable instanceof ReadableStream && stream.writable instanceof WritableStream;
}


class ShareStream {
    private downstreams: WritableStream[] = [];
    private stream: ReadableStream;
    constructor(stream: AnyReadable) {
        this.stream = resolveReadable(stream);
    } 

    async pipeTo(stream: AnyWritable) {
        const writable = resolveWritable(stream);
        this.downstreams.push(writable);
    }

    pipeThrough(transform: AnyDuplex) {
        this.pipeTo(resolveDuplex(transform).writable);
        return transform.readable;
    }
    
    async start() {
        const reader = this.stream.getReader();
        const writers = this.downstreams.map(stream => stream.getWriter());

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }
                const writePromises = writers.map(writer => writer.write(value));
                await Promise.all(writePromises);
            }
        } finally {
            for (const writer of writers) {
                writer.releaseLock();
            }
        }
    }
}

export function share(stream: AnyReadable) {
    return new ShareStream(resolveReadable(stream));
}

export async function toBuffer(stream: ReadableStream<Uint8Array>) {
    return buffer(stream)
  }
  
  export async function toString(stream: ReadableStream<Uint8Array>) {
    return text(stream)
  }
  