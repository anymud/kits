import { fileTypeFromBuffer, fileTypeFromStream, type FileTypeResult } from 'file-type';
import { resolveReadable, type AnyReadable } from './stream';

export async function getFileType(stream: AnyReadable): Promise<FileTypeResult> {
    const fileType = await fileTypeFromStream(resolveReadable(stream))
    if (!fileType) {
        throw new Error('Invalid file type');
    }
    return fileType;
}


export class FileTypeStream<T extends ArrayBuffer> implements ReadableWritablePair<T, T> {
    private _fileType: FileTypeResult | undefined;
    private checkedLength = 0;

    constructor(private callback: (result: FileTypeResult) => Promise<void> | void) {
    }
    private passThrough = new TransformStream<T, T>({
        transform: async (chunk, controller) => {
            if (!this.fileType && this.checkedLength < 4100) {
                const fileType = await fileTypeFromBuffer(chunk)
                this.checkedLength += chunk.byteLength;
                if (fileType) {
                    this._fileType = fileType;
                    await this.callback(fileType);
                }
            }
            controller.enqueue(chunk);
        }
    });
    get readable() {
        return this.passThrough.readable;
    }
    get writable() {
        return this.passThrough.writable;
    }

    get fileType() {
        return this._fileType;
    }
}