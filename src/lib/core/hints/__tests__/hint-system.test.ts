/**
 * Tests for the Progressive Hint System
 * @module core/hints/__tests__/hint-system.test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { HintSystem, HintLevel } from '../index';
import { MethodSelector } from '../../methods/method-selector';
import { MethodName } from '../../../types/method';

describe('HintSystem', () => {
  let hintSystem: HintSystem;
  let methodSelector: MethodSelector;

  beforeEach(() => {
    hintSystem = new HintSystem();
    methodSelector = new MethodSelector();
  });

  describe('generateHints', () => {
    it('should generate hints for a basic multiplication problem', () => {
      const methodRanking = methodSelector.selectOptimalMethod(47, 53);
      const hintResult = hintSystem.generateHints(methodRanking, 47, 53);

      expect(hintResult).toBeDefined();
      expect(hintResult.method).toBeDefined();
      expect(hintResult.methodDisplayName).toBeDefined();
      expect(hintResult.hints.length).toBeGreaterThan(0);
      expect(hintResult.maxHints).toBeGreaterThan(0);
    });

    it('should generate method hint as first hint', () => {
      const methodRanking = methodSelector.selectOptimalMethod(47, 53);
      const hintResult = hintSystem.generateHints(methodRanking, 47, 53);

      expect(hintResult.hints[0]).toBeDefined();
      expect(hintResult.hints[0].level).toBe(HintLevel.Method);
      expect(hintResult.hints[0].title).toBe('Method Hint');
      expect(hintResult.hints[0].content).toContain('method');
    });

    it('should generate first step hint as second hint', () => {
      const methodRanking = methodSelector.selectOptimalMethod(47, 53);
      const hintResult = hintSystem.generateHints(methodRanking, 47, 53);

      if (hintResult.hints.length > 1) {
        expect(hintResult.hints[1]).toBeDefined();
        expect(hintResult.hints[1].level).toBe(HintLevel.FirstStep);
        expect(hintResult.hints[1].title).toBe('First Step');
      }
    });

    it('should include revealed steps in later hints', () => {
      const methodRanking = methodSelector.selectOptimalMethod(47, 53);
      const hintResult = hintSystem.generateHints(methodRanking, 47, 53);

      // Check if more steps hint includes revealed steps
      const moreStepsHint = hintResult.hints.find(h => h.level === HintLevel.MoreSteps);
      if (moreStepsHint) {
        expect(moreStepsHint.revealedSteps).toBeDefined();
        expect(moreStepsHint.revealedSteps!.length).toBeGreaterThan(0);
      }
    });

    it('should respect maxHints configuration', () => {
      const limitedHintSystem = new HintSystem({ maxHints: 2 });
      const methodRanking = methodSelector.selectOptimalMethod(47, 53);
      const hintResult = limitedHintSystem.generateHints(methodRanking, 47, 53);

      expect(hintResult.hints.length).toBeLessThanOrEqual(2);
      expect(hintResult.maxHints).toBeLessThanOrEqual(2);
    });
  });

  describe('createInitialState', () => {
    it('should create initial state with no hints revealed', () => {
      const methodRanking = methodSelector.selectOptimalMethod(47, 53);
      const hintResult = hintSystem.generateHints(methodRanking, 47, 53);
      const initialState = hintSystem.createInitialState(hintResult);

      expect(initialState.currentLevel).toBe(HintLevel.None);
      expect(initialState.revealedHints).toHaveLength(0);
      expect(initialState.hasMoreHints).toBe(true);
      expect(initialState.totalHints).toBe(hintResult.maxHints);
    });

    it('should indicate no more hints for empty hint result', () => {
      // Create a custom hint result with no hints
      const emptyHintResult = {
        method: MethodName.Distributive,
        methodDisplayName: 'Distributive',
        hints: [],
        maxHints: 0,
        methodReason: 'Test'
      };

      const initialState = hintSystem.createInitialState(emptyHintResult);
      expect(initialState.hasMoreHints).toBe(false);
    });
  });

  describe('getNextHint', () => {
    it('should return first hint when at level None', () => {
      const methodRanking = methodSelector.selectOptimalMethod(47, 53);
      const hintResult = hintSystem.generateHints(methodRanking, 47, 53);

      const nextHint = hintSystem.getNextHint(hintResult, HintLevel.None);

      expect(nextHint).toBeDefined();
      expect(nextHint!.level).toBe(HintLevel.Method);
    });

    it('should return second hint when at level Method', () => {
      const methodRanking = methodSelector.selectOptimalMethod(47, 53);
      const hintResult = hintSystem.generateHints(methodRanking, 47, 53);

      if (hintResult.hints.length > 1) {
        const nextHint = hintSystem.getNextHint(hintResult, HintLevel.Method);
        expect(nextHint).toBeDefined();
        expect(nextHint!.level).toBe(HintLevel.FirstStep);
      }
    });

    it('should return null when all hints are exhausted', () => {
      const methodRanking = methodSelector.selectOptimalMethod(47, 53);
      const hintResult = hintSystem.generateHints(methodRanking, 47, 53);

      // Request a hint beyond what's available
      const nextHint = hintSystem.getNextHint(hintResult, hintResult.maxHints as HintLevel);

      expect(nextHint).toBeNull();
    });
  });

  describe('revealNextHint', () => {
    it('should advance hint state by one level', () => {
      const methodRanking = methodSelector.selectOptimalMethod(47, 53);
      const hintResult = hintSystem.generateHints(methodRanking, 47, 53);
      const initialState = hintSystem.createInitialState(hintResult);

      const newState = hintSystem.revealNextHint(initialState, hintResult);

      expect(newState.currentLevel).toBe(HintLevel.Method);
      expect(newState.revealedHints).toHaveLength(1);
      expect(newState.revealedHints[0].level).toBe(HintLevel.Method);
    });

    it('should progressively reveal hints', () => {
      const methodRanking = methodSelector.selectOptimalMethod(47, 53);
      const hintResult = hintSystem.generateHints(methodRanking, 47, 53);
      let state = hintSystem.createInitialState(hintResult);

      // Reveal all available hints
      const revealedLevels: number[] = [];
      while (state.hasMoreHints) {
        state = hintSystem.revealNextHint(state, hintResult);
        revealedLevels.push(state.currentLevel);
      }

      // Verify progressive revelation
      expect(revealedLevels.length).toBe(hintResult.maxHints);
      for (let i = 0; i < revealedLevels.length - 1; i++) {
        expect(revealedLevels[i]).toBeLessThan(revealedLevels[i + 1]);
      }
    });

    it('should not change state when no more hints available', () => {
      const methodRanking = methodSelector.selectOptimalMethod(47, 53);
      const hintResult = hintSystem.generateHints(methodRanking, 47, 53);
      let state = hintSystem.createInitialState(hintResult);

      // Exhaust all hints
      while (state.hasMoreHints) {
        state = hintSystem.revealNextHint(state, hintResult);
      }

      const finalLevel = state.currentLevel;
      const finalHintsCount = state.revealedHints.length;

      // Try to reveal another hint
      const unchangedState = hintSystem.revealNextHint(state, hintResult);

      expect(unchangedState.currentLevel).toBe(finalLevel);
      expect(unchangedState.revealedHints.length).toBe(finalHintsCount);
    });

    it('should update hasMoreHints correctly', () => {
      const methodRanking = methodSelector.selectOptimalMethod(47, 53);
      const hintResult = hintSystem.generateHints(methodRanking, 47, 53);
      let state = hintSystem.createInitialState(hintResult);

      // Reveal all but one hint
      for (let i = 0; i < hintResult.maxHints - 1; i++) {
        state = hintSystem.revealNextHint(state, hintResult);
        if (i < hintResult.maxHints - 2) {
          expect(state.hasMoreHints).toBe(true);
        }
      }

      // After revealing the last hint
      state = hintSystem.revealNextHint(state, hintResult);
      expect(state.hasMoreHints).toBe(false);
    });
  });

  describe('hint content quality', () => {
    it('should include method-specific tips in method hint', () => {
      const methodRanking = methodSelector.selectOptimalMethod(98, 97);
      const hintResult = hintSystem.generateHints(methodRanking, 98, 97);
      const methodHint = hintResult.hints[0];

      expect(methodHint.explanation).toBeDefined();
      expect(methodHint.explanation!.length).toBeGreaterThan(0);
    });

    it('should provide calculation steps in revealed hints', () => {
      const methodRanking = methodSelector.selectOptimalMethod(47, 53);
      const hintResult = hintSystem.generateHints(methodRanking, 47, 53);

      // Check first step hint
      const firstStepHint = hintResult.hints.find(h => h.level === HintLevel.FirstStep);
      if (firstStepHint && firstStepHint.revealedSteps) {
        expect(firstStepHint.revealedSteps.length).toBeGreaterThan(0);
        expect(firstStepHint.revealedSteps[0].expression).toBeDefined();
        expect(firstStepHint.revealedSteps[0].result).toBeDefined();
      }
    });

    it('should include explanations when configured', () => {
      const systemWithExplanations = new HintSystem({ includeExplanations: true });
      const methodRanking = methodSelector.selectOptimalMethod(47, 53);
      const hintResult = systemWithExplanations.generateHints(methodRanking, 47, 53);

      const hintsWithExplanations = hintResult.hints.filter(h => h.explanation);
      expect(hintsWithExplanations.length).toBeGreaterThan(0);
    });

    it('should not include explanations when disabled', () => {
      const systemWithoutExplanations = new HintSystem({ includeExplanations: false });
      const methodRanking = methodSelector.selectOptimalMethod(47, 53);
      const hintResult = systemWithoutExplanations.generateHints(methodRanking, 47, 53);

      // Method hint explanation should be undefined when disabled
      hintResult.hints.forEach(hint => {
        expect(hint.explanation).toBeUndefined();
      });
    });
  });

  describe('different problem types', () => {
    const testCases = [
      { num1: 47, num2: 53, description: 'difference of squares' },
      { num1: 98, num2: 47, description: 'near power of 10' },
      { num1: 99, num2: 97, description: 'near 100' },
      { num1: 25, num2: 24, description: 'factorization' },
      { num1: 73, num2: 73, description: 'squaring' },
      { num1: 123, num2: 45, description: 'distributive' }
    ];

    testCases.forEach(({ num1, num2, description }) => {
      it(`should generate valid hints for ${description} (${num1} x ${num2})`, () => {
        const methodRanking = methodSelector.selectOptimalMethod(num1, num2);
        const hintResult = hintSystem.generateHints(methodRanking, num1, num2);

        expect(hintResult.hints.length).toBeGreaterThan(0);
        expect(hintResult.method).toBeDefined();

        // All hints should have required properties
        hintResult.hints.forEach(hint => {
          expect(hint.level).toBeGreaterThan(HintLevel.None);
          expect(hint.title).toBeDefined();
          expect(hint.content).toBeDefined();
        });
      });
    });
  });

  describe('hint state immutability', () => {
    it('should not mutate original state when revealing hints', () => {
      const methodRanking = methodSelector.selectOptimalMethod(47, 53);
      const hintResult = hintSystem.generateHints(methodRanking, 47, 53);
      const initialState = hintSystem.createInitialState(hintResult);

      const originalLevel = initialState.currentLevel;
      const originalHintsLength = initialState.revealedHints.length;

      hintSystem.revealNextHint(initialState, hintResult);

      expect(initialState.currentLevel).toBe(originalLevel);
      expect(initialState.revealedHints.length).toBe(originalHintsLength);
    });
  });
});
