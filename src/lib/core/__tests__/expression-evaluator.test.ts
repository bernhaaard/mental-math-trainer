/**
 * Expression Evaluator Tests
 * @module core/__tests__/expression-evaluator.test
 */

import { describe, it, expect } from 'vitest';
import { evaluateExpression } from '../expression-evaluator';

describe('evaluateExpression', () => {
  describe('basic arithmetic', () => {
    it('should evaluate addition', () => {
      expect(evaluateExpression('2 + 2')).toBe(4);
      expect(evaluateExpression('100 + 200')).toBe(300);
      expect(evaluateExpression('0 + 5')).toBe(5);
    });

    it('should evaluate subtraction', () => {
      expect(evaluateExpression('10 - 3')).toBe(7);
      expect(evaluateExpression('100 - 50')).toBe(50);
      expect(evaluateExpression('5 - 10')).toBe(-5);
    });

    it('should evaluate multiplication', () => {
      expect(evaluateExpression('5 * 3')).toBe(15);
      expect(evaluateExpression('10 * 10')).toBe(100);
      expect(evaluateExpression('47 * 53')).toBe(2491);
    });

    it('should evaluate division', () => {
      expect(evaluateExpression('10 / 2')).toBe(5);
      expect(evaluateExpression('100 / 4')).toBe(25);
      expect(evaluateExpression('7 / 2')).toBe(3.5);
    });
  });

  describe('order of operations (PEMDAS)', () => {
    it('should respect multiplication over addition', () => {
      expect(evaluateExpression('2 + 3 * 4')).toBe(14);
      expect(evaluateExpression('10 + 2 * 5')).toBe(20);
    });

    it('should respect multiplication over subtraction', () => {
      expect(evaluateExpression('10 - 2 * 3')).toBe(4);
      expect(evaluateExpression('20 - 4 * 2')).toBe(12);
    });

    it('should respect division over addition', () => {
      expect(evaluateExpression('10 + 6 / 2')).toBe(13);
      expect(evaluateExpression('5 + 10 / 5')).toBe(7);
    });

    it('should evaluate left to right for same precedence', () => {
      expect(evaluateExpression('10 - 5 + 3')).toBe(8);
      expect(evaluateExpression('20 / 4 * 2')).toBe(10);
    });
  });

  describe('parentheses', () => {
    it('should evaluate parentheses first', () => {
      expect(evaluateExpression('(2 + 3) * 4')).toBe(20);
      expect(evaluateExpression('(10 - 5) * 2')).toBe(10);
    });

    it('should handle nested parentheses', () => {
      expect(evaluateExpression('((2 + 3) * 2)')).toBe(10);
      expect(evaluateExpression('(2 * (3 + 4))')).toBe(14);
    });

    it('should handle difference of squares pattern', () => {
      expect(evaluateExpression('(50 - 3) * (50 + 3)')).toBe(2491);
      expect(evaluateExpression('(100 - 5) * (100 + 5)')).toBe(9975);
    });

    it('should handle complex nested expressions', () => {
      expect(evaluateExpression('50 * 50 - 3 * 3')).toBe(2491);
      expect(evaluateExpression('(40 + 7) * 53')).toBe(2491);
    });
  });

  describe('negative numbers', () => {
    it('should handle unary minus', () => {
      expect(evaluateExpression('-5')).toBe(-5);
      expect(evaluateExpression('-10 + 3')).toBe(-7);
    });

    it('should handle negative numbers in expressions', () => {
      expect(evaluateExpression('10 + -5')).toBe(5);
      expect(evaluateExpression('3 * -4')).toBe(-12);
    });

    it('should handle double negation', () => {
      expect(evaluateExpression('--5')).toBe(5);
      expect(evaluateExpression('10 - -5')).toBe(15);
    });

    it('should handle negative numbers in parentheses', () => {
      expect(evaluateExpression('(-5) * 2')).toBe(-10);
      expect(evaluateExpression('2 * (-3 + 1)')).toBe(-4);
    });
  });

  describe('decimal numbers', () => {
    it('should handle decimal values', () => {
      expect(evaluateExpression('3.14')).toBe(3.14);
      expect(evaluateExpression('2.5 * 2')).toBe(5);
    });

    it('should handle decimal arithmetic', () => {
      expect(evaluateExpression('1.5 + 2.5')).toBe(4);
      expect(evaluateExpression('10.5 - 0.5')).toBe(10);
    });

    it('should handle floating point precision', () => {
      // Common floating point issues
      const result = evaluateExpression('0.1 + 0.2');
      expect(Math.abs(result - 0.3)).toBeLessThan(0.0001);
    });
  });

  describe('whitespace handling', () => {
    it('should handle expressions with no spaces', () => {
      expect(evaluateExpression('2+2')).toBe(4);
      expect(evaluateExpression('10*5')).toBe(50);
    });

    it('should handle expressions with extra spaces', () => {
      expect(evaluateExpression('  2  +  2  ')).toBe(4);
      expect(evaluateExpression('10   *   5')).toBe(50);
    });

    it('should handle tabs and mixed whitespace', () => {
      expect(evaluateExpression('2\t+\t2')).toBe(4);
    });
  });

  describe('edge cases', () => {
    it('should handle single number', () => {
      expect(evaluateExpression('42')).toBe(42);
      expect(evaluateExpression('0')).toBe(0);
    });

    it('should handle zero', () => {
      expect(evaluateExpression('0 + 5')).toBe(5);
      expect(evaluateExpression('5 * 0')).toBe(0);
      expect(evaluateExpression('0 - 5')).toBe(-5);
    });

    it('should handle large numbers', () => {
      expect(evaluateExpression('999999 * 2')).toBe(1999998);
      expect(evaluateExpression('1000000 + 1000000')).toBe(2000000);
    });
  });

  describe('security - injection prevention', () => {
    it('should reject JavaScript code', () => {
      expect(() => evaluateExpression('alert("hack")')).toThrow();
      expect(() => evaluateExpression('console.log(1)')).toThrow();
    });

    it('should reject function calls', () => {
      expect(() => evaluateExpression('Math.random()')).toThrow();
      expect(() => evaluateExpression('eval("1")')).toThrow();
    });

    it('should reject object access', () => {
      expect(() => evaluateExpression('window.location')).toThrow();
      expect(() => evaluateExpression('document.cookie')).toThrow();
    });

    it('should reject variable names', () => {
      expect(() => evaluateExpression('x + 1')).toThrow();
      expect(() => evaluateExpression('foo')).toThrow();
    });

    it('should reject semicolons', () => {
      expect(() => evaluateExpression('1; alert(1)')).toThrow();
    });

    it('should reject curly braces', () => {
      expect(() => evaluateExpression('{}')).toThrow();
      expect(() => evaluateExpression('{ return 1 }')).toThrow();
    });
  });

  describe('error handling', () => {
    it('should throw on empty expression', () => {
      expect(() => evaluateExpression('')).toThrow('cannot be empty');
      expect(() => evaluateExpression('   ')).toThrow('cannot be empty');
    });

    it('should throw on division by zero', () => {
      expect(() => evaluateExpression('10 / 0')).toThrow('Division by zero');
    });

    it('should throw on mismatched parentheses', () => {
      expect(() => evaluateExpression('(2 + 3')).toThrow('Missing closing parenthesis');
      expect(() => evaluateExpression('2 + 3)')).toThrow();
    });

    it('should throw on invalid operators', () => {
      expect(() => evaluateExpression('2 ** 3')).toThrow();
      expect(() => evaluateExpression('2 % 3')).toThrow();
    });

    it('should throw on expression too long', () => {
      const longExpr = '1' + '+1'.repeat(300);
      expect(() => evaluateExpression(longExpr)).toThrow('exceeds maximum length');
    });

    it('should throw on non-string input', () => {
      // @ts-expect-error Testing runtime type check
      expect(() => evaluateExpression(123)).toThrow('must be a string');
      // @ts-expect-error Testing runtime type check
      expect(() => evaluateExpression(null)).toThrow('must be a string');
    });

    it('should throw on incomplete expression', () => {
      expect(() => evaluateExpression('2 +')).toThrow();
      expect(() => evaluateExpression('* 3')).toThrow();
    });
  });

  describe('known solution expressions', () => {
    // Test expressions that appear in our known solutions
    it('should evaluate 47 × 53 expressions correctly', () => {
      expect(evaluateExpression('47 * 53')).toBe(2491);
      expect(evaluateExpression('(50 - 3) * (50 + 3)')).toBe(2491);
      expect(evaluateExpression('50 * 50 - 3 * 3')).toBe(2491);
      expect(evaluateExpression('2500 - 9')).toBe(2491);
    });

    it('should evaluate distributive property expressions', () => {
      expect(evaluateExpression('(40 + 7) * 53')).toBe(2491);
      expect(evaluateExpression('40 * 53 + 7 * 53')).toBe(2491);
      expect(evaluateExpression('2120 + 371')).toBe(2491);
    });

    it('should evaluate larger known solutions', () => {
      expect(evaluateExpression('123 * 456')).toBe(56088);
      expect(evaluateExpression('997 * 1003')).toBe(999991);
    });
  });
});
