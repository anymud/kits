import { describe, expect, it } from 'bun:test'
import { isEqual } from '~/utils'


describe('isEqual function', () => {
    it('should return true for equal primitives and functions', () => {
      expect(isEqual(5, 5)).toBe(true);
      expect(isEqual('hello', 'world')).toBe(false);
      // Add more test cases here for primitives and functions
    });
  
    it('should return true for equal built-in objects', () => {
      expect(isEqual(new Date('2022-01-01'), new Date('2022-01-01'))).toBe(true);
      expect(isEqual(/test/, /test/i)).toBe(false);
      // Add more test cases here for built-in objects
    });
  
    it('should return true for equal custom objects', () => {
      expect(isEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
      expect(isEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
      // Add more test cases here for custom objects
    });
  
    it('should return true for edge cases', () => {
      expect(isEqual(undefined, undefined)).toBe(true);
      expect(isEqual(null, null)).toBe(true);
      expect(isEqual(NaN, NaN)).toBe(true);
      expect(isEqual(NaN, 5)).toBe(false);
      // Add more test cases here for edge cases
    });
  
    it('should return true for equal arrays', () => {
      expect(isEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(isEqual([1, 2, 3], [3, 2, 1])).toBe(false);
      expect(isEqual([], [])).toBe(true);
      expect(isEqual([1, 2, [3, 4]], [1, 2, [3, 4]])).toBe(true);
      // Add more test cases here for arrays
    });
  
    it('should return true for equal nested objects', () => {
      expect(isEqual({ a: { b: { c: 1 } } }, { a: { b: { c: 1 } } })).toBe(true);
      expect(isEqual({ a: { b: { c: 1 } } }, { a: { b: { c: 2 } } })).toBe(false);
      expect(isEqual({ a: { b: { c: { d: 1 } } } }, { a: { b: { c: { d: 1 } } } })).toBe(true);
      // Add more test cases here for nested objects
    });
  
    it('should return true for objects with circular references', () => {
      type obj = { a: number, b: obj | undefined }
      const obj1: obj = { a: 1, b: undefined }; obj1.b = obj1;
      const obj2: obj = { a: 1, b: undefined }; obj2.b = obj2;
      expect(isEqual(obj1, obj2)).toBe(true);
    });
  
    it('should handle different object types appropriately', () => {
      expect(isEqual({}, null)).toBe(false);
      expect(isEqual({}, undefined)).toBe(false);
      expect(isEqual({}, 'test')).toBe(false);
      // Add more test cases here for different object types
    });
  
    // Add more test suites and cases as needed
  });