/**
 * Progressive Hint System
 * @module core/hints/hint-system
 *
 * Provides progressive hints that gradually reveal solution steps
 * without immediately giving away the answer. Designed to support
 * struggling learners while maintaining educational value.
 */

import type { Solution } from '../../types/solution';
import type { MethodName } from '../../types/method';
import type { MethodRanking } from '../methods/method-selector';
import {
  HintLevel,
  type Hint,
  type HintResult,
  type HintState,
  type HintConfig,
  DEFAULT_HINT_CONFIG
} from './types';

/**
 * Display name mappings for methods.
 */
const METHOD_DISPLAY_NAMES: Record<MethodName, string> = {
  'distributive': 'Distributive Property',
  'near-power-10': 'Near Powers of 10',
  'difference-squares': 'Difference of Squares',
  'factorization': 'Factorization',
  'squaring': 'Squaring',
  'near-100': 'Near 100'
};

/**
 * Generates progressive hints for multiplication problems.
 *
 * The hint system follows a pedagogical approach:
 * 1. First hint: Suggest the optimal calculation method
 * 2. Second hint: Show the first step of the solution
 * 3. Third hint: Reveal additional steps progressively
 * 4. Final hints: Show most of the solution, encouraging independent completion
 *
 * This approach helps learners understand the problem-solving process
 * while still requiring them to engage with the final calculation.
 */
export class HintSystem {
  private readonly config: Required<HintConfig>;

  /**
   * Creates a new HintSystem with optional configuration.
   *
   * @param config - Optional configuration overrides
   */
  constructor(config: HintConfig = {}) {
    this.config = { ...DEFAULT_HINT_CONFIG, ...config };
  }

  /**
   * Generates all available hints for a problem based on its solution.
   *
   * @param methodRanking - The method ranking result containing optimal solution
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns HintResult containing all available hints
   */
  generateHints(
    methodRanking: MethodRanking,
    num1: number,
    num2: number
  ): HintResult {
    const { optimal } = methodRanking;
    const solution = optimal.solution;
    const method = optimal.method;

    const hints: Hint[] = [];

    // Hint Level 1: Method suggestion
    hints.push(this.generateMethodHint(method.name, solution, num1, num2));

    // Hint Level 2: First step
    if (solution.steps.length > 0) {
      hints.push(this.generateFirstStepHint(solution));
    }

    // Hint Level 3: More steps (up to half)
    if (solution.steps.length > 1) {
      hints.push(this.generateMoreStepsHint(solution));
    }

    // Hint Level 4: Nearly complete (most steps, leaving final calculation)
    if (solution.steps.length > 2) {
      hints.push(this.generateNearlyCompleteHint(solution));
    }

    // Limit hints based on configuration
    const limitedHints = hints.slice(0, this.config.maxHints);

    return {
      method: method.name,
      methodDisplayName: method.displayName,
      hints: limitedHints,
      maxHints: limitedHints.length,
      methodReason: solution.optimalReason
    };
  }

  /**
   * Gets the next hint for the current problem state.
   *
   * @param hintResult - Previously generated hint result
   * @param currentLevel - Current hint level (how many hints already shown)
   * @returns The next hint, or null if no more hints available
   */
  getNextHint(hintResult: HintResult, currentLevel: HintLevel): Hint | null {
    const nextLevel = currentLevel + 1;

    if (nextLevel > hintResult.maxHints) {
      return null;
    }

    const hint = hintResult.hints[nextLevel - 1];
    return hint ?? null;
  }

  /**
   * Creates initial hint state for a new problem.
   *
   * @param hintResult - The hint result for the current problem
   * @returns Initial hint state
   */
  createInitialState(hintResult: HintResult): HintState {
    return {
      currentLevel: HintLevel.None,
      revealedHints: [],
      hasMoreHints: hintResult.maxHints > 0,
      totalHints: hintResult.maxHints
    };
  }

  /**
   * Advances hint state by revealing the next hint.
   *
   * @param currentState - Current hint state
   * @param hintResult - The hint result for the current problem
   * @returns Updated hint state, or same state if no more hints
   */
  revealNextHint(currentState: HintState, hintResult: HintResult): HintState {
    const nextHint = this.getNextHint(hintResult, currentState.currentLevel);

    if (!nextHint) {
      return currentState;
    }

    const newLevel = currentState.currentLevel + 1;

    return {
      currentLevel: newLevel as HintLevel,
      revealedHints: [...currentState.revealedHints, nextHint],
      hasMoreHints: newLevel < hintResult.maxHints,
      totalHints: hintResult.maxHints
    };
  }

  /**
   * Generates the method hint (Level 1).
   * Suggests which calculation method to use.
   */
  private generateMethodHint(
    methodName: MethodName,
    solution: Solution,
    num1: number,
    num2: number
  ): Hint {
    const displayName = METHOD_DISPLAY_NAMES[methodName] || methodName;
    const methodTip = this.getMethodTip(methodName, num1, num2);

    return {
      level: HintLevel.Method,
      title: 'Method Hint',
      content: `Try using the ${displayName} method.`,
      explanation: this.config.includeExplanations
        ? `${methodTip}\n\n${solution.optimalReason}`
        : undefined
    };
  }

  /**
   * Generates the first step hint (Level 2).
   * Shows how to begin the calculation.
   */
  private generateFirstStepHint(solution: Solution): Hint {
    const firstStep = solution.steps[0];

    if (!firstStep) {
      return {
        level: HintLevel.FirstStep,
        title: 'First Step',
        content: 'Start by examining the structure of the numbers.',
        explanation: undefined
      };
    }

    return {
      level: HintLevel.FirstStep,
      title: 'First Step',
      content: firstStep.explanation,
      explanation: this.config.includeExplanations
        ? `This gives us: ${firstStep.expression}`
        : undefined,
      revealedSteps: [firstStep]
    };
  }

  /**
   * Generates the more steps hint (Level 3).
   * Reveals additional steps up to approximately half the solution.
   */
  private generateMoreStepsHint(solution: Solution): Hint {
    // Show up to half of the steps
    const stepsToReveal = Math.ceil(solution.steps.length / 2);
    const revealedSteps = solution.steps.slice(0, stepsToReveal);
    const lastRevealedStep = revealedSteps[revealedSteps.length - 1];

    if (!lastRevealedStep) {
      return {
        level: HintLevel.MoreSteps,
        title: 'Next Steps',
        content: 'Continue applying the method step by step.',
        explanation: undefined
      };
    }

    // Build a summary of the progress
    const stepsSummary = revealedSteps
      .map((step, index) => `${index + 1}. ${step.explanation}`)
      .join('\n');

    return {
      level: HintLevel.MoreSteps,
      title: 'Next Steps',
      content: `After these steps, you should have: ${lastRevealedStep.result}`,
      explanation: this.config.includeExplanations ? stepsSummary : undefined,
      revealedSteps
    };
  }

  /**
   * Generates the nearly complete hint (Level 4).
   * Shows most steps, leaving only the final calculation.
   */
  private generateNearlyCompleteHint(solution: Solution): Hint {
    // Show all steps except the last one (final answer)
    const stepsToReveal = Math.max(1, solution.steps.length - 1);
    const revealedSteps = solution.steps.slice(0, stepsToReveal);
    const lastRevealedStep = revealedSteps[revealedSteps.length - 1];

    if (!lastRevealedStep) {
      return {
        level: HintLevel.NearlyComplete,
        title: 'Almost There',
        content: 'You are very close! Complete the final calculation.',
        explanation: undefined
      };
    }

    // Build detailed steps summary
    const stepsSummary = revealedSteps
      .map((step, index) => `${index + 1}. ${step.expression} = ${step.result}`)
      .join('\n');

    // Determine what remains
    const remainingSteps = solution.steps.length - stepsToReveal;
    const remainingText = remainingSteps === 1
      ? 'Now compute the final answer.'
      : `Now complete the last ${remainingSteps} calculation(s).`;

    return {
      level: HintLevel.NearlyComplete,
      title: 'Almost There',
      content: `${remainingText} Current result: ${lastRevealedStep.result}`,
      explanation: this.config.includeExplanations ? stepsSummary : undefined,
      revealedSteps
    };
  }

  /**
   * Gets a method-specific tip for the given numbers.
   */
  private getMethodTip(methodName: MethodName, num1: number, num2: number): string {
    switch (methodName) {
      case 'distributive':
        return `Break down the numbers using place values. For example, ${num1} can be split into parts.`;

      case 'near-power-10': {
        const nearestPower = this.findNearestPowerOf10(num1, num2);
        return `Notice that one number is close to ${nearestPower}. Use this to simplify the calculation.`;
      }

      case 'difference-squares': {
        const average = (num1 + num2) / 2;
        const diff = Math.abs(num1 - num2) / 2;
        return `The numbers are ${diff} away from ${average}. Use the identity (a+b)(a-b) = a^2 - b^2.`;
      }

      case 'factorization':
        return `Look for factors that make the calculation easier. Try breaking down the numbers.`;

      case 'squaring':
        return `Both numbers are the same (${num1}). Use squaring techniques like (a+b)^2 or (a-b)^2.`;

      case 'near-100':
        return `Both numbers are close to 100. Use the pattern (100-a)(100-b) for easier calculation.`;

      default:
        return `Analyze the structure of ${num1} and ${num2} to find the best approach.`;
    }
  }

  /**
   * Finds the nearest power of 10 to either number.
   */
  private findNearestPowerOf10(num1: number, num2: number): number {
    const powers = [10, 100, 1000, 10000];
    let nearest = 10;
    let minDist = Infinity;

    for (const power of powers) {
      const dist = Math.min(Math.abs(num1 - power), Math.abs(num2 - power));
      if (dist < minDist) {
        minDist = dist;
        nearest = power;
      }
    }

    return nearest;
  }
}

/**
 * Singleton instance for convenience.
 */
export const hintSystem = new HintSystem();
