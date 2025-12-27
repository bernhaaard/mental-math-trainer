/**
 * Tests for method-registry singleton functionality.
 * @module core/methods/__tests__/method-registry
 */

import { describe, it, expect } from 'vitest';
import { getMethodInstances } from '../method-registry';
import { MethodName } from '../../../types';

describe('method-registry', () => {
  describe('getMethodInstances', () => {
    it('should return all 6 calculation methods', () => {
      const methods = getMethodInstances();
      expect(methods).toHaveLength(6);
    });

    it('should include all expected method types', () => {
      const methods = getMethodInstances();
      const methodNames = methods.map(m => m.name);

      expect(methodNames).toContain(MethodName.Distributive);
      expect(methodNames).toContain(MethodName.DifferenceSquares);
      expect(methodNames).toContain(MethodName.NearPower10);
      expect(methodNames).toContain(MethodName.Factorization);
      expect(methodNames).toContain(MethodName.Squaring);
      expect(methodNames).toContain(MethodName.Near100);
    });

    it('should return method instances with required interface', () => {
      const methods = getMethodInstances();

      methods.forEach(method => {
        expect(method.name).toBeDefined();
        expect(method.displayName).toBeDefined();
        expect(typeof method.isApplicable).toBe('function');
        expect(typeof method.computeCost).toBe('function');
        expect(typeof method.qualityScore).toBe('function');
        expect(typeof method.generateSolution).toBe('function');
        expect(typeof method.generateStudyContent).toBe('function');
      });
    });

    it('should return the same instances on multiple calls', () => {
      const methods1 = getMethodInstances();
      const methods2 = getMethodInstances();

      // Each instance should be the same object (singleton behavior)
      expect(methods1[0]).toBe(methods2[0]);
      expect(methods1[1]).toBe(methods2[1]);
      expect(methods1[2]).toBe(methods2[2]);
      expect(methods1[3]).toBe(methods2[3]);
      expect(methods1[4]).toBe(methods2[4]);
      expect(methods1[5]).toBe(methods2[5]);
    });

    it('should return a defensive copy preventing external mutation', () => {
      const methods1 = getMethodInstances();
      const originalLength = methods1.length;

      // Attempt to mutate the returned array
      methods1.pop();
      methods1.push(methods1[0]);

      // Get methods again - should be unaffected
      const methods2 = getMethodInstances();
      expect(methods2).toHaveLength(originalLength);
    });
  });
});
