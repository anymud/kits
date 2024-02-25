// https://github.com/steambap/png-to-ico
import sharp from 'sharp'
import type { OutputInfo, Sharp } from 'sharp'
import { setBit } from '../bits'

const constants = {
  bitmapSize: 40,
  colorMode: 0,
  directorySize: 16,
  headerSize: 6,
}
type MayBeSharp = Sharp | Buffer

export async function toIco(image: MayBeSharp, sizes: (256 | 128 | 64 | 48 | 32 | 24 | 16)[] = [256, 128, 64, 48, 32, 24, 16]) {
  if (image instanceof Buffer)
    image = sharp(image)

  const header = getHeader(sizes.length)
  const headerAndIconDir = [header]
  const imageDataArr = []

  let offset = header.length + constants.directorySize * sizes.length

  for (const size of sizes) {
    const { data, info } = await image
      // .clone()
      // .toColorspace('srgb')
      .resize(size, size)
      // 8 bits depth
      .raw({ depth: 'uchar' })
      .toBuffer({ resolveWithObject: true })

    const dib = getDib(data, info)
    const bmpInfoHeader = getBmpInfoHeader(info, dib.length)
    const bitmapSize = bmpInfoHeader.length + dib.length
    const dir = getDir(info, offset, bitmapSize)

    offset += bitmapSize

    headerAndIconDir.push(dir)
    imageDataArr.push(bmpInfoHeader, dib)
  }

  return Buffer.concat(headerAndIconDir.concat(imageDataArr))
}

// https://en.wikipedia.org/wiki/ICO_(file_format)
function getHeader(numOfImages: number) {
  const buf = Buffer.alloc(constants.headerSize)

  buf.writeUInt16LE(0, 0) // Reserved. Must always be 0.
  buf.writeUInt16LE(1, 2) // Specifies image type: 1 for icon (.ICO) image
  buf.writeUInt16LE(numOfImages, 4) // Specifies number of images in the file.

  return buf
}

function getDir(info: OutputInfo, offset: number, size: number) {
  const buf = Buffer.alloc(constants.directorySize)
  const width = info.width >= 256 ? 0 : info.width
  const height = info.height >= 256 ? 0 : info.height
  const bpp = info.channels * 8

  buf.writeUInt8(width, 0) // Specifies image width in pixels.
  buf.writeUInt8(height, 1) // Specifies image height in pixels.
  buf.writeUInt8(0, 2) // Should be 0 if the image does not use a color palette.
  buf.writeUInt8(0, 3) // Reserved. Should be 0.
  buf.writeUInt16LE(1, 4) // Specifies color planes. Should be 0 or 1.
  buf.writeUInt16LE(bpp, 6) // Specifies bits per pixel.
  buf.writeUInt32LE(size, 8) // Specifies the size of the image's data in bytes
  buf.writeUInt32LE(offset, 12) // Specifies the offset of BMP or PNG data from the beginning of the ICO/CUR file

  return buf
}

// https://en.wikipedia.org/wiki/BMP_file_format
function getBmpInfoHeader(info: OutputInfo, size: number) {
  const buf = Buffer.alloc(constants.bitmapSize)
  buf.writeUInt32LE(constants.bitmapSize, 0) // The size of this header (40 bytes)
  buf.writeInt32LE(info.width, 4) // The bitmap width in pixels (signed integer)
  buf.writeInt32LE(info.height * 2, 8) // The bitmap height in pixels (signed integer)
  buf.writeUInt16LE(1, 12) // The number of color planes (must be 1)
  buf.writeUInt16LE(info.channels * 8, 14) // The number of bits per pixel
  buf.writeUInt32LE(constants.colorMode, 16) // The compression method being used.
  // the image size. This is the size of the raw bitmap data; a dummy 0 can be given for BI_RGB bitmaps.
  // https://github.com/GNOME/gimp/blob/94414c1ca8793b59f570dfe66fa01c81672139f2/plug-ins/file-ico/ico-save.c#L963
  buf.writeUInt32LE(0, 20) // The image size.
  buf.writeInt32LE(0, 24) // The horizontal resolution of the image. (signed integer)
  buf.writeInt32LE(0, 28) // The vertical resolution of the image. (signed integer)
  buf.writeUInt32LE(0, 32) // The number of colors in the color palette, or 0 to default to 2n
  buf.writeUInt32LE(0, 36) // The number of important colors used, or 0 when every color is important; generally ignored.
  return buf
}

// https://en.wikipedia.org/wiki/BMP_file_format
// Note that the bitmap data starts with the lower left hand corner of the image.
// blue green red alpha in order
function getDib(data: Buffer, info: OutputInfo) {
  const xorMap = Buffer.alloc(info.width * info.height * info.channels)
  // xor map
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      let pos = (y * info.width + x) * info.channels
      const r = data.readUInt8(pos)
      const g = data.readUInt8(pos + 1)
      const b = data.readUInt8(pos + 2)
      const a = data.readUInt8(pos + 3)

      pos = ((info.height - y - 1) * info.width + x) * info.channels
      xorMap.writeUInt8(b, pos)
      xorMap.writeUInt8(g, pos + 1)
      xorMap.writeUInt8(r, pos + 2)
      xorMap.writeUInt8(a, pos + 3)
    }
  }

  const andMap = Buffer.alloc(info.width * info.height / 8)
  // and map
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      let pos = (y * info.width + x) * info.channels
      const a = data.readUInt8(pos + 3)

      pos = ((info.height - y) * info.width + x)
      setBit(andMap, pos, a > 0 ? 0 : 1)
    }
  }

  return Buffer.concat([xorMap, andMap])
}
