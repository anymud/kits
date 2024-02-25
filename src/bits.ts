type Bit = 1 | 0
export function setBit(buffer: Buffer, pos: number, value: Bit) {
  const i = Math.floor(pos / 8)
  const bit = pos % 8
  if (value === 0)
    buffer[i] &= ~(1 << bit)
  else
    buffer[i] |= (1 << bit)
}

export function getBit(buffer: Buffer, pos: number): Bit {
  const i = Math.floor(pos / 8)
  const bit = pos % 8
  return (buffer[i] >> bit) % 2 as Bit
}

const lookup: Record<string, string> = {
  0: '0000',
  1: '0001',
  2: '0010',
  3: '0011',
  4: '0100',
  5: '0101',
  6: '0110',
  7: '0111',
  8: '1000',
  9: '1001',
  a: '1010',
  b: '1011',
  c: '1100',
  d: '1101',
  e: '1110',
  f: '1111',
}
export function toBits(buffer: Buffer) {
  return Array.from(buffer.toString('hex')).map(x => lookup[x]).join('')
}
