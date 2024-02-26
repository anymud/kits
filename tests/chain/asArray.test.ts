import { describe, expect, it } from 'bun:test'
import { asArray } from '~/utils'

// Mock or ensure isArray is correctly implemented
// Assuming isArray is similar to Array.isArray for demonstration
const isArray = Array.isArray;

describe('asArray function', () => {
  it('returns the same array if input is an array', () => {
    const array = [1, 2, 3];
    const result = asArray(array);
    expect(result).toBe(array);
  });

  it('converts a Set to an array', () => {
    const set = new Set([1, 2, 3]);
    const result = asArray(set);
    expect(result).toEqual([1, 2, 3]);
  });

  it('preserves order of elements', () => {
    const set = new Set(['apple', 'banana', 'cherry']);
    const result = asArray(set);
    expect(result).toEqual(['apple', 'banana', 'cherry']);
  });

  it('works with empty iterables', () => {
    const set = new Set();
    const result = asArray(set);
    expect(result).toEqual([]);
  });

  it('converts custom iterables to an array', () => {
    const customIterable = {
      *[Symbol.iterator]() {
        yield 'a';
        yield 'b';
        yield 'c';
      }
    };
    const result = asArray(customIterable);
    expect(result).toEqual(['a', 'b', 'c']);
  });
});