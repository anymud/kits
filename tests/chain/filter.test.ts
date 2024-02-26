import { describe, expect, it } from 'bun:test'
import { filter } from '~/utils'

describe('filter function', () => {
    it('filters elements based on the predicate', () => {
      const result = filter([1, 2, 3, 4, 5], x => x % 2 === 0);
      expect(result).toEqual([2, 4]);
    });
  
    it('handles an empty array', () => {
      const result = filter([], x => x % 2 === 0);
      expect(result).toEqual([]);
    });
  
    it('works with all elements matching the predicate', () => {
      const result = filter([2, 4, 6], x => x % 2 === 0);
      expect(result).toEqual([2, 4, 6]);
    });
  
    it('returns an empty array when no elements match the predicate', () => {
      const result = filter([1, 3, 5], x => x % 2 === 0);
      expect(result).toEqual([]);
    });
  
    it('works with types other than numbers', () => {
      const result = filter(['apple', 'banana', 'grape'], fruit => fruit.startsWith('a'));
      expect(result).toEqual(['apple']);
    });
  
    it('preserves the order of elements', () => {
      const input = [5, 2, 4, 3, 1];
      const result = filter(input, x => x < 4);
      expect(result).toEqual([2, 3, 1]);
    });
  
    it('works with Set as an iterable', () => {
      const result = filter(new Set([1, 2, 3, 4, 5]), x => x > 3);
      expect(result).toEqual([4, 5]);
    });
  });