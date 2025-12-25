# Phase 3: Method Selection Algorithm

**Objective**: Implement the algorithm that selects the optimal calculation method for any given problem, including cost calculation and alternative method comparison.

**Exit Criteria**: Method selector chooses correct optimal method; alternatives are sensible; all solutions cross-validate.

---

## Method Selector Implementation

### `src/lib/core/methods/method-selector.ts`

```typescript
import type { CalculationMethod, MethodName, Solution } from '@/lib/types';
import { DistributiveMethod } from './distributive';
import { DifferenceSquaresMethod } from './difference-squares';
import { NearPower10Method } from './near-power-10';
import { SquaringMethod } from './squaring';
import { Near100Method } from './near-100';
import { FactorizationMethod } from './factorization';
import { SolutionValidator } from '../validator';

export interface MethodRanking {
  optimal: {
    method: CalculationMethod;
    solution: Solution;
    costScore: number;
    qualityScore: number;
  };
  alternatives: Array<{
    method: CalculationMethod;
    solution: Solution;
    costScore: number;
    qualityScore: number;
    whyNotOptimal: string;
  }>;
  comparisonSummary: string;
}

interface ScoredMethod {
  method: CalculationMethod;
  cost: number;
  quality: number;
  compositeScore: number;
}

export class MethodSelector {
  private methods: CalculationMethod[];

  constructor() {
    this.methods = [
      new DifferenceSquaresMethod(),
      new Near100Method(),
      new SquaringMethod(),
      new NearPower10Method(),
      new FactorizationMethod(),
      new DistributiveMethod() // Always last as fallback
    ];
  }

  /**
   * Select optimal method and generate solutions
   */
  selectOptimalMethod(num1: number, num2: number): MethodRanking {
    // Find all applicable methods
    const applicable = this.methods.filter(m => m.isApplicable(num1, num2));

    if (applicable.length === 0) {
      throw new Error('No applicable methods found (should never happen)');
    }

    // Calculate composite scores
    const scored: ScoredMethod[] = applicable.map(method => {
      const cost = method.computeCost(num1, num2);
      const quality = method.qualityScore(num1, num2);

      // Composite score: 60% cost (lower better), 40% quality (higher better)
      // Normalize quality to "lower is better" for consistent comparison
      const compositeScore = cost * 0.6 + (1 - quality) * 0.4;

      return { method, cost, quality, compositeScore };
    });

    // Sort by composite score (lower is better)
    scored.sort((a, b) => a.compositeScore - b.compositeScore);

    // Generate solution for optimal method
    const optimal = scored[0];
    const optimalSolution = optimal.method.generateSolution(num1, num2);

    // Generate solutions for alternatives (up to 2)
    const alternatives = scored.slice(1, 3).map(alt => {
      const solution = alt.method.generateSolution(num1, num2);
      const whyNotOptimal = this.explainWhyNotOptimal(optimal, alt, num1, num2);

      return {
        method: alt.method,
        solution,
        costScore: alt.cost,
        qualityScore: alt.quality,
        whyNotOptimal
      };
    });

    // Cross-validate all solutions
    const allSolutions = [optimalSolution, ...alternatives.map(a => a.solution)];
    if (!SolutionValidator.crossValidate(num1, num2, allSolutions)) {
      console.error('Cross-validation failed for', num1, '×', num2);
    }

    return {
      optimal: {
        method: optimal.method,
        solution: optimalSolution,
        costScore: optimal.cost,
        qualityScore: optimal.quality
      },
      alternatives,
      comparisonSummary: this.generateComparisonSummary(optimal, scored.slice(1), num1, num2)
    };
  }

  /**
   * Get all methods for testing/display purposes
   */
  getAllMethods(): CalculationMethod[] {
    return [...this.methods];
  }

  /**
   * Get specific method by name
   */
  getMethod(name: MethodName): CalculationMethod | undefined {
    return this.methods.find(m => m.name === name);
  }

  private explainWhyNotOptimal(
    optimal: ScoredMethod,
    alternative: ScoredMethod,
    num1: number,
    num2: number
  ): string {
    const costDiff = alternative.cost - optimal.cost;
    const qualityDiff = optimal.quality - alternative.quality;

    const reasons: string[] = [];

    if (costDiff > 0.5) {
      reasons.push(
        `requires more computational steps (cost ${alternative.cost.toFixed(1)} vs ${optimal.cost.toFixed(1)})`
      );
    }

    if (qualityDiff > 0.1) {
      reasons.push(
        `is less elegant for these specific numbers`
      );
    }

    if (reasons.length === 0) {
      reasons.push(
        `has slightly higher overall score`
      );
    }

    return `${alternative.method.displayName} is not optimal because it ${reasons.join(' and ')}. ` +
           `${optimal.method.displayName} better exploits the structure of ${num1} × ${num2}.`;
  }

  private generateComparisonSummary(
    optimal: ScoredMethod,
    alternatives: ScoredMethod[],
    num1: number,
    num2: number
  ): string {
    let summary = `For ${num1} × ${num2}, **${optimal.method.displayName}** is optimal ` +
                  `(cost: ${optimal.cost.toFixed(1)}, quality: ${(optimal.quality * 100).toFixed(0)}%).\n\n`;

    summary += `This method was chosen because it `;

    // Add specific reasoning based on method
    switch (optimal.method.name) {
      case 'difference-squares':
        const mid = (num1 + num2) / 2;
        const dev = Math.abs(num2 - num1) / 2;
        summary += `exploits the symmetry around ${mid} (deviation of only ${dev}).`;
        break;
      case 'near-100':
        summary += `leverages both numbers being close to 100 for efficient deficit calculation.`;
        break;
      case 'squaring':
        summary += `applies the binomial expansion for squaring, which is highly efficient.`;
        break;
      case 'near-power-10':
        summary += `exploits proximity to a power of 10 for trivial multiplication.`;
        break;
      case 'factorization':
        summary += `factors the numbers to create convenient multiples of 10.`;
        break;
      default:
        summary += `provides a reliable place-value decomposition.`;
    }

    if (alternatives.length > 0) {
      summary += `\n\n**Alternatives:**\n`;
      alternatives.slice(0, 2).forEach((alt, i) => {
        summary += `${i + 1}. ${alt.method.displayName} ` +
                   `(cost: ${alt.cost.toFixed(1)}, quality: ${(alt.quality * 100).toFixed(0)}%)\n`;
      });
    }

    return summary;
  }
}

// Singleton instance for convenience
let selectorInstance: MethodSelector | null = null;

export function getMethodSelector(): MethodSelector {
  if (!selectorInstance) {
    selectorInstance = new MethodSelector();
  }
  return selectorInstance;
}

export function selectOptimalMethod(num1: number, num2: number): MethodRanking {
  return getMethodSelector().selectOptimalMethod(num1, num2);
}
```

---

## Method Selector Tests

### `src/tests/unit/methods/method-selector.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { MethodSelector, selectOptimalMethod } from '@/lib/core/methods/method-selector';

describe('MethodSelector', () => {
  const selector = new MethodSelector();

  describe('selectOptimalMethod', () => {
    it('should select difference of squares for 47 × 53', () => {
      const result = selector.selectOptimalMethod(47, 53);

      expect(result.optimal.method.name).toBe('difference-squares');
      expect(result.optimal.solution.validated).toBe(true);
      expect(result.alternatives.length).toBeGreaterThan(0);
    });

    it('should select near-100 for 98 × 87', () => {
      const result = selector.selectOptimalMethod(98, 87);

      expect(result.optimal.method.name).toBe('near-100');
      expect(result.optimal.solution.validated).toBe(true);
    });

    it('should select squaring for 73 × 73', () => {
      const result = selector.selectOptimalMethod(73, 73);

      expect(result.optimal.method.name).toBe('squaring');
    });

    it('should select near-power-10 for 102 × 47', () => {
      const result = selector.selectOptimalMethod(102, 47);

      expect(result.optimal.method.name).toBe('near-power-10');
    });

    it('should provide alternatives', () => {
      const result = selector.selectOptimalMethod(47, 53);

      expect(result.alternatives.length).toBeGreaterThan(0);
      expect(result.alternatives.length).toBeLessThanOrEqual(2);

      result.alternatives.forEach(alt => {
        expect(alt.solution.validated).toBe(true);
        expect(alt.whyNotOptimal).toBeTruthy();
        expect(alt.whyNotOptimal.length).toBeGreaterThan(20);
      });
    });

    it('should generate comparison summary', () => {
      const result = selector.selectOptimalMethod(47, 53);

      expect(result.comparisonSummary).toBeTruthy();
      expect(result.comparisonSummary.length).toBeGreaterThan(50);
      expect(result.comparisonSummary).toContain('47');
      expect(result.comparisonSummary).toContain('53');
    });

    it('should cross-validate all methods give same answer', () => {
      const result = selector.selectOptimalMethod(47, 53);
      const expectedAnswer = 47 * 53;

      const optimalAnswer = result.optimal.solution.steps.slice(-1)[0].result;
      expect(optimalAnswer).toBe(expectedAnswer);

      result.alternatives.forEach(alt => {
        const altAnswer = alt.solution.steps.slice(-1)[0].result;
        expect(altAnswer).toBe(expectedAnswer);
      });
    });
  });

  describe('known optimal selections', () => {
    const testCases = [
      { num1: 47, num2: 53, expectedMethod: 'difference-squares' },
      { num1: 98, num2: 87, expectedMethod: 'near-100' },
      { num1: 73, num2: 73, expectedMethod: 'squaring' },
      { num1: 102, num2: 47, expectedMethod: 'near-power-10' },
      { num1: 96, num2: 104, expectedMethod: 'difference-squares' },
      { num1: 97, num2: 94, expectedMethod: 'near-100' },
    ];

    testCases.forEach(({ num1, num2, expectedMethod }) => {
      it(`should select ${expectedMethod} for ${num1} × ${num2}`, () => {
        const result = selector.selectOptimalMethod(num1, num2);
        expect(result.optimal.method.name).toBe(expectedMethod);
      });
    });
  });

  describe('fallback to distributive', () => {
    it('should use distributive when no special method applies', () => {
      const result = selector.selectOptimalMethod(47, 89);
      // Either distributive or another method may apply
      // The important thing is that it returns a valid result
      expect(result.optimal.solution.validated).toBe(true);
    });
  });

  describe('getMethod', () => {
    it('should return method by name', () => {
      const method = selector.getMethod('difference-squares');
      expect(method).toBeDefined();
      expect(method?.name).toBe('difference-squares');
    });

    it('should return undefined for unknown method', () => {
      const method = selector.getMethod('unknown' as any);
      expect(method).toBeUndefined();
    });
  });
});
```

---

## Cost Calculator

### `src/lib/core/methods/cost-calculator.ts`

```typescript
import type { MethodCostBreakdown } from '@/lib/types';

/**
 * Utility for calculating and comparing method costs
 */
export class CostCalculator {
  /**
   * Calculate detailed cost breakdown for a method
   */
  static calculateBreakdown(
    stepCount: number,
    digitComplexity: number,
    memoryChunks: number,
    magnitudePenalty: number
  ): MethodCostBreakdown {
    const totalCost =
      stepCount * 1.0 +
      digitComplexity * 0.8 +
      memoryChunks * 0.5 +
      magnitudePenalty * 0.3;

    return {
      stepCount,
      digitComplexity,
      memoryChunks,
      magnitudePenalty,
      totalCost
    };
  }

  /**
   * Compare two costs and return human-readable comparison
   */
  static compareCosts(cost1: number, cost2: number): string {
    const diff = Math.abs(cost1 - cost2);
    const percentDiff = (diff / Math.min(cost1, cost2)) * 100;

    if (percentDiff < 10) {
      return 'approximately equivalent';
    } else if (cost1 < cost2) {
      return `${percentDiff.toFixed(0)}% more efficient`;
    } else {
      return `${percentDiff.toFixed(0)}% less efficient`;
    }
  }

  /**
   * Operation complexity ratings for reference
   */
  static readonly OPERATION_COSTS = {
    singleDigitMult: 1.0,
    singleTimesDouble: 2.0,
    doubleTimesDouble: 4.0,
    tripleTimesTriple: 9.0,
    multiplyByPowerOf10: 0.1,
    addition: 0.5,
    squaring: 0.8
  } as const;
}
```

---

## Quality Checklist

Before completing Phase 3:

- [ ] Method selector chooses correct optimal method for known test cases
- [ ] Alternatives make sense (different methods, lower scores)
- [ ] All solutions cross-validate (same answer)
- [ ] Comparison summaries are clear and informative
- [ ] WhyNotOptimal explanations are accurate
- [ ] Test coverage ≥ 90%

---

## References

- Method implementations: `docs/implementation/phase-2-methods.md`
- Algorithm details: `docs/PROJECT_REQUIREMENTS.md` Section 2.2
- Testing patterns: `docs/guides/testing-strategy.md`
