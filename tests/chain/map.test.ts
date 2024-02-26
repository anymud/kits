import { describe, expect, it } from 'bun:test'
import { map } from '~/utils'

describe('map function', () => {
    it('applies the function to each element in an array', () => {
      const result = map([1, 2, 3], x => x * 2);
      expect(result).toEqual([2, 4, 6]);
    });
  
    it('handles an empty array', () => {
      const result = map([], x => x * 2);
      expect(result).toEqual([]);
    });
  
    it('provides correct index to the transformation function', () => {
      const result = map(['a', 'b', 'c'], (item, index) => `${item}${index}`);
      expect(result).toEqual(['a0', 'b1', 'c2']);
    });
  
    it('works with different types', () => {
      const result = map([1, 2, 3], x => x.toString());
      expect(result).toEqual(['1', '2', '3']);
    });
  
    it('preserves the length of the iterable', () => {
      const input = [1, 2, 3, 4, 5];
      const result = map(input, x => x * 2);
      expect(result.length).toBe(input.length);
    });
  
    it('works with Set as an iterable', () => {
      const result = map(new Set([1, 2, 3]), x => x * 2);
      expect(result).toEqual([2, 4, 6]);
    });
  
    it('applies a complex transformation function', () => {
      const result = map([1, 2, 3], x => ({ original: x, doubled: x * 2 }));
      expect(result).toEqual([
        { original: 1, doubled: 2 },
        { original: 2, doubled: 4 },
        { original: 3, doubled: 6 }
      ]);
    });
  });