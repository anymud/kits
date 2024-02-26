import { describe, expect, it } from 'bun:test'
import { orderBy } from '~/utils'


describe('orderBy function', () => {
    it('sorts by a single iteratee in ascending order by default', () => {
      const array = [{ age: 45 }, { age: 24 }, { age: 36 }];
      const result = orderBy(array, item => item.age);
      expect(result).toEqual([{ age: 24 }, { age: 36 }, { age: 45 }]);
    });
  
    it('sorts by a single iteratee in descending order', () => {
      const array = [{ age: 45 }, { age: 24 }, { age: 36 }];
      const result = orderBy(array, item => item.age, 'desc');
      expect(result).toEqual([{ age: 45 }, { age: 36 }, { age: 24 }]);
    });
  
    it('sorts by multiple iteratees', () => {
      const array = [
        { name: 'John', age: 45 },
        { name: 'Jane', age: 45 },
        { name: 'John', age: 35 }
      ];
      const result = orderBy(array, [item => item.name, item => item.age], ['asc', 'asc']);
      expect(result).toEqual([
        { name: 'Jane', age: 45 },
        { name: 'John', age: 35 },
        { name: 'John', age: 45 }
      ]);
    });
  
    it('handles NaN values correctly', () => {
      const array = [{ value: NaN }, { value: 1 }, { value: 2 }];
      const result = orderBy(array, item => item.value);
      expect(result).toEqual([{ value: 1 }, { value: 2 }, { value: NaN }]);
    });
  
    it('sorts using a mixture of orders', () => {
      const array = [
        { name: 'John', age: 45 },
        { name: 'Jane', age: 45 },
        { name: 'John', age: 35 }
      ];
      const result = orderBy(array, [item => item.name, item => item.age], ['asc', 'desc']);
      expect(result).toEqual([
        { name: 'Jane', age: 45 },
        { name: 'John', age: 45 },
        { name: 'John', age: 35 }
      ]);
    });
  });