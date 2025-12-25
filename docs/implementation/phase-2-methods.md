# Phase 2: Calculation Methods

**Objective**: Implement all six calculation methods with complete solution generation, comprehensive tests, and 100% mathematical accuracy.

**Exit Criteria**: All 6 methods working correctly; each method passes its test suite; known solutions validate correctly; cross-validation confirms consistency.

---

## Overview

Each method must:
1. Implement the exact mathematical algorithm from PROJECT_REQUIREMENTS.md
2. Generate solutions that pass validation 100% of the time
3. Include comprehensive tests with known correct answers

---

## Base Method Class

### `src/lib/core/methods/base-method.ts`

```typescript
import type { CalculationMethod, MethodName, Solution, StudyContent, CalculationStep } from '@/lib/types';
import { SolutionValidator } from '../validator';

export abstract class BaseMethod implements CalculationMethod {
  abstract name: MethodName;
  abstract displayName: string;

  abstract isApplicable(num1: number, num2: number): boolean;
  abstract computeCost(num1: number, num2: number): number;
  abstract qualityScore(num1: number, num2: number): number;
  abstract generateSolutionSteps(num1: number, num2: number): CalculationStep[];
  abstract generateStudyContent(): StudyContent;

  /**
   * Generate and validate solution
   */
  generateSolution(num1: number, num2: number): Solution {
    const steps = this.generateSolutionSteps(num1, num2);

    const solution: Solution = {
      method: this.name,
      optimalReason: this.getOptimalReason(num1, num2),
      steps,
      alternatives: [],
      validated: false,
      validationErrors: []
    };

    // Always validate
    const validation = SolutionValidator.validateSolution(num1, num2, solution);
    solution.validated = validation.valid;
    solution.validationErrors = validation.errors;

    if (!validation.valid) {
      throw new Error(
        `${this.displayName} generated invalid solution for ${num1} × ${num2}: ` +
        validation.errors.join('; ')
      );
    }

    return solution;
  }

  protected abstract getOptimalReason(num1: number, num2: number): string;

  // Helper methods

  protected countDigits(n: number): number {
    return Math.abs(n).toString().length;
  }

  protected isNear(num: number, target: number, threshold: number): boolean {
    return Math.abs(num - target) <= threshold;
  }

  protected nearestPowerOf10(n: number): number {
    if (n <= 0) return 10;
    const power = Math.round(Math.log10(n));
    return Math.pow(10, power);
  }

  protected getSmallFactors(n: number): number[] {
    const factors: number[] = [];
    const absN = Math.abs(n);
    for (const f of [2, 3, 4, 5, 6, 8, 9, 10]) {
      if (absN % f === 0) factors.push(f);
    }
    return factors;
  }
}
```

---

## Method 1: Distributive Property

### `src/lib/core/methods/distributive.ts`

```typescript
import { BaseMethod } from './base-method';
import type { MethodName, CalculationStep, StudyContent } from '@/lib/types';

export class DistributiveMethod extends BaseMethod {
  name: MethodName = 'distributive';
  displayName = 'Distributive Property / Place Value Partition';

  isApplicable(): boolean {
    return true; // Always applicable as fallback
  }

  computeCost(num1: number, num2: number): number {
    const digits1 = this.countDigits(num1);
    const digits2 = this.countDigits(num2);
    const subMultiplications = digits1 * digits2;
    const digitComplexity = (digits1 + digits2) * 0.8;
    const memoryChunks = Math.min(digits1 * 2, 7);
    return subMultiplications + digitComplexity + (memoryChunks * 0.5);
  }

  qualityScore(): number {
    return 0.3; // General purpose, rarely optimal
  }

  protected getOptimalReason(num1: number, num2: number): string {
    return `Distributive property partitions ${num1} by place value, ` +
           `making each sub-multiplication simpler.`;
  }

  generateSolutionSteps(num1: number, num2: number): CalculationStep[] {
    const steps: CalculationStep[] = [];
    const absNum1 = Math.abs(num1);
    const absNum2 = Math.abs(num2);
    const sign = (num1 < 0) !== (num2 < 0) ? -1 : 1;

    // Partition first number by place value
    const ones = absNum1 % 10;
    const tens = Math.floor(absNum1 / 10) * 10;

    if (tens === 0) {
      // Single digit multiplication
      const result = sign * absNum1 * absNum2;
      steps.push({
        expression: `${num1} × ${num2}`,
        result,
        explanation: 'Direct single-digit multiplication',
        depth: 0
      });
      return steps;
    }

    // Step 1: Show partition
    steps.push({
      expression: `${num1} × ${num2} = (${tens} + ${ones}) × ${num2}`,
      result: num1 * num2,
      explanation: `Partition ${absNum1} by place value into ${tens} + ${ones}`,
      depth: 0
    });

    // Step 2: Apply distributive property
    const tensProduct = tens * absNum2;
    const onesProduct = ones * absNum2;

    steps.push({
      expression: `${tens} × ${num2} + ${ones} × ${num2}`,
      result: num1 * num2,
      explanation: 'Apply distributive property: a(b + c) = ab + ac',
      depth: 0,
      subSteps: [
        {
          expression: `${tens} × ${absNum2}`,
          result: tensProduct,
          explanation: `${tens / 10} × ${absNum2} = ${(tens / 10) * absNum2}, then append zero`,
          depth: 1
        },
        {
          expression: `${ones} × ${absNum2}`,
          result: onesProduct,
          explanation: `Single digit: ${ones} × ${absNum2} = ${onesProduct}`,
          depth: 1
        }
      ]
    });

    // Step 3: Add partial products
    const finalResult = sign * (tensProduct + onesProduct);
    steps.push({
      expression: `${tensProduct} + ${onesProduct}`,
      result: finalResult,
      explanation: `Add partial products${sign < 0 ? ' (result is negative)' : ''}`,
      depth: 0
    });

    return steps;
  }

  generateStudyContent(): StudyContent {
    return {
      method: this.name,
      introduction: 'The distributive property is the foundational technique for mental math.',
      mathematicalFoundation: 'In algebra: a(b + c) = ab + ac',
      deepDiveContent: 'Ring theory foundation and base-10 polynomial interpretation...',
      whenToUse: [
        'When no other method applies efficiently',
        'For numbers without special structure',
        'As a fallback for any multiplication'
      ],
      examples: [],
      interactiveExercises: []
    };
  }
}
```

---

## Method 2: Difference of Squares

### `src/lib/core/methods/difference-squares.ts`

```typescript
import { BaseMethod } from './base-method';
import type { MethodName, CalculationStep, StudyContent } from '@/lib/types';

export class DifferenceSquaresMethod extends BaseMethod {
  name: MethodName = 'difference-squares';
  displayName = 'Difference of Squares';

  isApplicable(num1: number, num2: number): boolean {
    const sum = num1 + num2;
    // Check if numbers are symmetric about midpoint
    if (sum % 2 !== 0) return false;

    const midpoint = sum / 2;
    const deviation = Math.abs(num2 - num1) / 2;

    // Prefer when deviation is small and midpoint is round
    return deviation <= 25 && deviation > 0;
  }

  computeCost(num1: number, num2: number): number {
    const sum = num1 + num2;
    const midpoint = sum / 2;
    const deviation = Math.abs(num2 - num1) / 2;

    // Cost: two squares + one subtraction
    const midpointCost = this.isNear(midpoint, this.nearestPowerOf10(midpoint), 5) ? 0.5 : 1.5;
    const deviationCost = deviation < 10 ? 0.3 : 0.8;

    return midpointCost + deviationCost + 0.5;
  }

  qualityScore(num1: number, num2: number): number {
    const sum = num1 + num2;
    const midpoint = sum / 2;

    // High quality when midpoint is a round number
    if (midpoint % 100 === 0) return 0.95;
    if (midpoint % 50 === 0) return 0.9;
    if (midpoint % 10 === 0) return 0.8;
    return 0.6;
  }

  protected getOptimalReason(num1: number, num2: number): string {
    const sum = num1 + num2;
    const midpoint = sum / 2;
    const deviation = Math.abs(num2 - num1) / 2;
    return `Numbers are symmetric around ${midpoint} (deviation of ${deviation}), ` +
           `allowing elegant a² - b² calculation.`;
  }

  generateSolutionSteps(num1: number, num2: number): CalculationStep[] {
    const steps: CalculationStep[] = [];
    const sum = num1 + num2;
    const midpoint = sum / 2;
    const deviation = Math.abs(num2 - num1) / 2;
    const [smaller, larger] = num1 < num2 ? [num1, num2] : [num2, num1];

    // Step 1: Recognize symmetry
    steps.push({
      expression: `${smaller} × ${larger} = (${midpoint} - ${deviation})(${midpoint} + ${deviation})`,
      result: num1 * num2,
      explanation: `Recognize symmetry: both numbers are ${deviation} away from ${midpoint}`,
      depth: 0
    });

    // Step 2: Apply identity
    const midpointSquared = midpoint * midpoint;
    const deviationSquared = deviation * deviation;

    steps.push({
      expression: `${midpoint}² - ${deviation}²`,
      result: num1 * num2,
      explanation: 'Apply difference of squares: (a-b)(a+b) = a² - b²',
      depth: 0,
      subSteps: [
        {
          expression: `${midpoint}²`,
          result: midpointSquared,
          explanation: `${midpoint} × ${midpoint} = ${midpointSquared}`,
          depth: 1
        },
        {
          expression: `${deviation}²`,
          result: deviationSquared,
          explanation: `${deviation} × ${deviation} = ${deviationSquared}`,
          depth: 1
        }
      ]
    });

    // Step 3: Final subtraction
    const finalResult = midpointSquared - deviationSquared;
    steps.push({
      expression: `${midpointSquared} - ${deviationSquared}`,
      result: finalResult,
      explanation: 'Subtract to get final answer',
      depth: 0
    });

    return steps;
  }

  generateStudyContent(): StudyContent {
    return {
      method: this.name,
      introduction: 'The difference of squares is one of the most elegant algebraic patterns.',
      mathematicalFoundation: 'Identity: a² - b² = (a - b)(a + b)',
      deepDiveContent: 'Proof and geometric interpretation...',
      whenToUse: [
        'Numbers symmetric around a midpoint',
        'Deviation from midpoint is small (≤20)',
        'Midpoint is a round number (10, 50, 100...)'
      ],
      examples: [],
      interactiveExercises: []
    };
  }
}
```

---

## Method 3: Near Powers of 10

### `src/lib/core/methods/near-power-10.ts`

```typescript
import { BaseMethod } from './base-method';
import type { MethodName, CalculationStep, StudyContent } from '@/lib/types';

export class NearPower10Method extends BaseMethod {
  name: MethodName = 'near-power-10';
  displayName = 'Near Powers of 10';

  private static readonly THRESHOLD = 15;

  isApplicable(num1: number, num2: number): boolean {
    return this.isNearPowerOf10(num1) || this.isNearPowerOf10(num2);
  }

  private isNearPowerOf10(n: number): boolean {
    const absN = Math.abs(n);
    const nearest = this.nearestPowerOf10(absN);
    return Math.abs(absN - nearest) <= NearPower10Method.THRESHOLD && absN !== nearest;
  }

  computeCost(num1: number, num2: number): number {
    const nearestNum = this.isNearPowerOf10(num1) ? num1 : num2;
    const other = nearestNum === num1 ? num2 : num1;
    const nearest = this.nearestPowerOf10(Math.abs(nearestNum));
    const offset = Math.abs(nearestNum) - nearest;

    // Cost: trivial mult + small mult + addition
    const trivialCost = 0.1;
    const smallMultCost = Math.abs(offset) * this.countDigits(other) * 0.3;
    return trivialCost + smallMultCost + 0.5;
  }

  qualityScore(num1: number, num2: number): number {
    const nearestNum = this.isNearPowerOf10(num1) ? num1 : num2;
    const nearest = this.nearestPowerOf10(Math.abs(nearestNum));
    const offset = Math.abs(Math.abs(nearestNum) - nearest);

    if (offset <= 3) return 0.9;
    if (offset <= 10) return 0.7;
    return 0.5;
  }

  protected getOptimalReason(num1: number, num2: number): string {
    const nearestNum = this.isNearPowerOf10(num1) ? num1 : num2;
    const nearest = this.nearestPowerOf10(Math.abs(nearestNum));
    const offset = Math.abs(nearestNum) - nearest;
    return `${nearestNum} is ${offset > 0 ? '+' : ''}${offset} from ${nearest}, ` +
           `making multiplication by ${nearest} trivial.`;
  }

  generateSolutionSteps(num1: number, num2: number): CalculationStep[] {
    const steps: CalculationStep[] = [];

    // Determine which number is near a power of 10
    const nearNum = this.isNearPowerOf10(num1) ? num1 : num2;
    const other = nearNum === num1 ? num2 : num1;
    const nearest = this.nearestPowerOf10(Math.abs(nearNum));
    const offset = Math.abs(nearNum) - nearest;
    const sign = nearNum < 0 ? -1 : 1;

    // Step 1: Decompose
    steps.push({
      expression: `${num1} × ${num2} = (${nearest} ${offset >= 0 ? '+' : ''}${offset}) × ${other}`,
      result: num1 * num2,
      explanation: `Express ${Math.abs(nearNum)} as ${nearest} ${offset >= 0 ? '+' : ''}${offset}`,
      depth: 0
    });

    // Step 2: Distribute
    const mainProduct = nearest * other;
    const offsetProduct = offset * other;

    steps.push({
      expression: `${nearest} × ${other} ${offset >= 0 ? '+' : '-'} ${Math.abs(offset)} × ${other}`,
      result: num1 * num2,
      explanation: 'Apply distributive property',
      depth: 0,
      subSteps: [
        {
          expression: `${nearest} × ${other}`,
          result: mainProduct,
          explanation: `Trivial: append ${Math.log10(nearest)} zeros to ${other}`,
          depth: 1
        },
        {
          expression: `${Math.abs(offset)} × ${other}`,
          result: Math.abs(offsetProduct),
          explanation: `Small multiplication: ${Math.abs(offset)} × ${other}`,
          depth: 1
        }
      ]
    });

    // Step 3: Combine
    const finalResult = sign * (mainProduct + offsetProduct) * (other < 0 ? -1 : 1);
    steps.push({
      expression: `${mainProduct} ${offsetProduct >= 0 ? '+' : '-'} ${Math.abs(offsetProduct)}`,
      result: num1 * num2,
      explanation: offset >= 0 ? 'Add the products' : 'Subtract the offset product',
      depth: 0
    });

    return steps;
  }

  generateStudyContent(): StudyContent {
    return {
      method: this.name,
      introduction: 'Numbers near powers of 10 allow us to exploit base-10 structure.',
      mathematicalFoundation: 'n × m = (10^k ± ε) × m = 10^k·m ± ε·m',
      deepDiveContent: 'Base-10 positional notation makes multiplication by 10, 100, 1000 trivial...',
      whenToUse: [
        'One number is within ±15 of a power of 10',
        'The offset times the other number is easy to compute',
        'Examples: 98, 102, 997, 1003'
      ],
      examples: [],
      interactiveExercises: []
    };
  }
}
```

---

## Method 4: Squaring

### `src/lib/core/methods/squaring.ts`

```typescript
import { BaseMethod } from './base-method';
import type { MethodName, CalculationStep, StudyContent } from '@/lib/types';

export class SquaringMethod extends BaseMethod {
  name: MethodName = 'squaring';
  displayName = 'Squaring Techniques';

  isApplicable(num1: number, num2: number): boolean {
    return num1 === num2 || Math.abs(num1 - num2) <= 2;
  }

  computeCost(num1: number, num2: number): number {
    if (num1 === num2) {
      // Pure square: use (a+b)² formula
      const n = Math.abs(num1);
      const tens = Math.floor(n / 10);
      const ones = n % 10;

      // Three terms: 100m², 20md, d²
      const termCost = tens < 10 ? 1.0 : 2.0;
      return termCost * 3 + 1.0; // Plus addition cost
    }

    // Near-square: n(n+k) = n² + nk
    return this.computeCost(num1, num1) + 1.5;
  }

  qualityScore(num1: number, num2: number): number {
    if (num1 === num2) {
      const n = Math.abs(num1);
      if (n % 10 === 0) return 0.95; // 30², 70² etc
      if (n % 10 === 5) return 0.9;  // 25², 75² etc (special pattern)
      return 0.75;
    }
    return 0.6;
  }

  protected getOptimalReason(num1: number, num2: number): string {
    if (num1 === num2) {
      return `Squaring ${num1} uses the binomial formula (a+b)² = a² + 2ab + b²`;
    }
    const base = Math.min(num1, num2);
    const diff = Math.abs(num2 - num1);
    return `Near-square: ${base}×${base + diff} = ${base}² + ${base}×${diff}`;
  }

  generateSolutionSteps(num1: number, num2: number): CalculationStep[] {
    if (num1 === num2) {
      return this.generateSquareSteps(num1);
    }
    return this.generateNearSquareSteps(num1, num2);
  }

  private generateSquareSteps(n: number): CalculationStep[] {
    const steps: CalculationStep[] = [];
    const absN = Math.abs(n);
    const tens = Math.floor(absN / 10);
    const ones = absN % 10;

    if (tens === 0) {
      steps.push({
        expression: `${n}²`,
        result: n * n,
        explanation: `${n} × ${n} = ${n * n}`,
        depth: 0
      });
      return steps;
    }

    // Step 1: Apply binomial
    steps.push({
      expression: `${absN}² = (${tens * 10} + ${ones})²`,
      result: n * n,
      explanation: `Express ${absN} as ${tens * 10} + ${ones}`,
      depth: 0
    });

    // Step 2: Expand
    const term1 = (tens * 10) * (tens * 10); // 100m²
    const term2 = 2 * (tens * 10) * ones;     // 20md
    const term3 = ones * ones;                 // d²

    steps.push({
      expression: `${tens * 10}² + 2(${tens * 10})(${ones}) + ${ones}²`,
      result: n * n,
      explanation: 'Apply (a+b)² = a² + 2ab + b²',
      depth: 0,
      subSteps: [
        {
          expression: `${tens * 10}²`,
          result: term1,
          explanation: `${tens}² = ${tens * tens}, append two zeros`,
          depth: 1
        },
        {
          expression: `2 × ${tens * 10} × ${ones}`,
          result: term2,
          explanation: `2 × ${tens} × ${ones} = ${2 * tens * ones}, append one zero`,
          depth: 1
        },
        {
          expression: `${ones}²`,
          result: term3,
          explanation: `${ones} × ${ones} = ${term3}`,
          depth: 1
        }
      ]
    });

    // Step 3: Sum
    steps.push({
      expression: `${term1} + ${term2} + ${term3}`,
      result: n * n,
      explanation: 'Add the three terms',
      depth: 0
    });

    return steps;
  }

  private generateNearSquareSteps(num1: number, num2: number): CalculationStep[] {
    const steps: CalculationStep[] = [];
    const [smaller, larger] = num1 < num2 ? [num1, num2] : [num2, num1];
    const diff = larger - smaller;

    // Step 1: Express as near-square
    steps.push({
      expression: `${smaller} × ${larger} = ${smaller} × (${smaller} + ${diff})`,
      result: num1 * num2,
      explanation: `Express ${larger} as ${smaller} + ${diff}`,
      depth: 0
    });

    // Step 2: Expand
    const square = smaller * smaller;
    const adjustment = smaller * diff;

    steps.push({
      expression: `${smaller}² + ${smaller} × ${diff}`,
      result: num1 * num2,
      explanation: 'Apply n(n+k) = n² + nk',
      depth: 0,
      subSteps: [
        {
          expression: `${smaller}²`,
          result: square,
          explanation: `${smaller} × ${smaller} = ${square}`,
          depth: 1
        },
        {
          expression: `${smaller} × ${diff}`,
          result: adjustment,
          explanation: `${smaller} × ${diff} = ${adjustment}`,
          depth: 1
        }
      ]
    });

    // Step 3: Sum
    steps.push({
      expression: `${square} + ${adjustment}`,
      result: num1 * num2,
      explanation: 'Add to get final answer',
      depth: 0
    });

    return steps;
  }

  generateStudyContent(): StudyContent {
    return {
      method: this.name,
      introduction: 'Squaring uses the binomial expansion to simplify computation.',
      mathematicalFoundation: '(a+b)² = a² + 2ab + b²',
      deepDiveContent: 'For numbers ending in 5, there is a special shortcut...',
      whenToUse: [
        'Same number multiplication (n × n)',
        'Near-same numbers (n × (n+1) or n × (n+2))',
        'Numbers ending in 5 have special patterns'
      ],
      examples: [],
      interactiveExercises: []
    };
  }
}
```

---

## Method 5: Near-100

### `src/lib/core/methods/near-100.ts`

```typescript
import { BaseMethod } from './base-method';
import type { MethodName, CalculationStep, StudyContent } from '@/lib/types';

export class Near100Method extends BaseMethod {
  name: MethodName = 'near-100';
  displayName = 'Near-100 Cross Multiplication';

  private static readonly THRESHOLD = 15;

  isApplicable(num1: number, num2: number): boolean {
    return (
      this.isNear100(num1) && this.isNear100(num2) &&
      num1 !== 100 && num2 !== 100
    );
  }

  private isNear100(n: number): boolean {
    return Math.abs(n - 100) <= Near100Method.THRESHOLD && n > 0;
  }

  computeCost(num1: number, num2: number): number {
    const a = 100 - num1;
    const b = 100 - num2;

    // Cost: two subtractions + one addition + one small mult + one final addition
    const smallMultCost = Math.abs(a) < 10 && Math.abs(b) < 10 ? 0.5 : 1.5;
    return 1.5 + smallMultCost + 0.5;
  }

  qualityScore(num1: number, num2: number): number {
    const a = Math.abs(100 - num1);
    const b = Math.abs(100 - num2);

    // Higher quality when offsets are small
    if (a <= 5 && b <= 5) return 0.95;
    if (a <= 10 && b <= 10) return 0.85;
    return 0.7;
  }

  protected getOptimalReason(num1: number, num2: number): string {
    const a = 100 - num1;
    const b = 100 - num2;
    return `Both numbers are close to 100 (${num1} = 100${a >= 0 ? '-' : '+'}${Math.abs(a)}, ` +
           `${num2} = 100${b >= 0 ? '-' : '+'}${Math.abs(b)}), enabling the deficit method.`;
  }

  generateSolutionSteps(num1: number, num2: number): CalculationStep[] {
    const steps: CalculationStep[] = [];

    const a = 100 - num1; // offset from 100
    const b = 100 - num2;

    // Step 1: Express as deficits from 100
    steps.push({
      expression: `${num1} × ${num2} = (100 - ${a}) × (100 - ${b})`,
      result: num1 * num2,
      explanation: `Express both numbers as offsets from 100`,
      depth: 0
    });

    // Step 2: Apply the formula
    const complement = 100 - (a + b); // This equals 100 - a - b
    const offsetProduct = a * b;
    const baseProduct = 100 * complement;

    steps.push({
      expression: `100 × (100 - ${a} - ${b}) + ${a} × ${b}`,
      result: num1 * num2,
      explanation: 'Apply formula: (100-a)(100-b) = 100(100-a-b) + ab',
      depth: 0,
      subSteps: [
        {
          expression: `100 - ${a} - ${b}`,
          result: complement,
          explanation: `The base: 100 - ${a + b} = ${complement}`,
          depth: 1
        },
        {
          expression: `100 × ${complement}`,
          result: baseProduct,
          explanation: `Multiply by 100: ${complement}00`,
          depth: 1
        },
        {
          expression: `${a} × ${b}`,
          result: offsetProduct,
          explanation: `Offset product: ${a} × ${b} = ${offsetProduct}`,
          depth: 1
        }
      ]
    });

    // Step 3: Add
    steps.push({
      expression: `${baseProduct} + ${offsetProduct}`,
      result: num1 * num2,
      explanation: 'Add to get final answer',
      depth: 0
    });

    return steps;
  }

  generateStudyContent(): StudyContent {
    return {
      method: this.name,
      introduction: 'The near-100 method exploits numbers close to 100.',
      mathematicalFoundation: '(100-a)(100-b) = 100(100-a-b) + ab',
      deepDiveContent: 'Proof: (100-a)(100-b) = 10000 - 100a - 100b + ab = 100(100-a-b) + ab',
      whenToUse: [
        'Both numbers within ±15 of 100',
        'Examples: 97×94, 103×98, 88×96'
      ],
      examples: [],
      interactiveExercises: []
    };
  }
}
```

---

## Method 6: Factorization

### `src/lib/core/methods/factorization.ts`

```typescript
import { BaseMethod } from './base-method';
import type { MethodName, CalculationStep, StudyContent } from '@/lib/types';

export class FactorizationMethod extends BaseMethod {
  name: MethodName = 'factorization';
  displayName = 'Strategic Factorization';

  isApplicable(num1: number, num2: number): boolean {
    // Check if factoring creates useful multiples of 10
    return this.findBestFactorization(num1, num2) !== null;
  }

  private findBestFactorization(num1: number, num2: number): { a: number; b: number; c: number; d: number } | null {
    const factors1 = this.getSmallFactors(num1);
    const factors2 = this.getSmallFactors(num2);

    // Look for factor combinations that yield multiples of 10
    for (const f1 of factors1) {
      for (const f2 of factors2) {
        if ((f1 * f2) % 10 === 0 || f1 * f2 === 10 || f1 * f2 === 100) {
          return {
            a: f1,
            b: Math.abs(num1) / f1,
            c: f2,
            d: Math.abs(num2) / f2
          };
        }
      }
    }

    // Also check for factors that create nice numbers
    for (const f1 of factors1) {
      const q1 = Math.abs(num1) / f1;
      if (q1 % 10 === 0) {
        return { a: f1, b: q1, c: 1, d: Math.abs(num2) };
      }
    }

    return null;
  }

  computeCost(num1: number, num2: number): number {
    const factorization = this.findBestFactorization(num1, num2);
    if (!factorization) return Infinity;

    const { a, b, c, d } = factorization;
    const combinedFactor = a * c;

    // If combined factor is 10 or 100, cost is low
    if (combinedFactor === 10) return 2.0;
    if (combinedFactor === 100) return 1.5;
    if (combinedFactor % 10 === 0) return 3.0;

    return 5.0;
  }

  qualityScore(num1: number, num2: number): number {
    const factorization = this.findBestFactorization(num1, num2);
    if (!factorization) return 0;

    const { a, c } = factorization;
    if (a * c === 100) return 0.9;
    if (a * c === 10) return 0.85;
    return 0.6;
  }

  protected getOptimalReason(num1: number, num2: number): string {
    const factorization = this.findBestFactorization(num1, num2);
    if (!factorization) return 'Factorization not applicable';

    const { a, c } = factorization;
    return `Factoring creates ${a} × ${c} = ${a * c}, simplifying the calculation.`;
  }

  generateSolutionSteps(num1: number, num2: number): CalculationStep[] {
    const steps: CalculationStep[] = [];
    const factorization = this.findBestFactorization(num1, num2);

    if (!factorization) {
      throw new Error('Factorization not applicable');
    }

    const { a, b, c, d } = factorization;
    const sign = (num1 < 0) !== (num2 < 0) ? -1 : 1;

    // Step 1: Factor both numbers
    steps.push({
      expression: `${Math.abs(num1)} × ${Math.abs(num2)} = (${a} × ${b}) × (${c} × ${d})`,
      result: Math.abs(num1 * num2),
      explanation: `Factor: ${Math.abs(num1)} = ${a} × ${b}, ${Math.abs(num2)} = ${c} × ${d}`,
      depth: 0
    });

    // Step 2: Regroup
    const combined = a * c;
    const remaining = b * d;

    steps.push({
      expression: `(${a} × ${c}) × (${b} × ${d})`,
      result: Math.abs(num1 * num2),
      explanation: 'Use commutativity to regroup factors',
      depth: 0,
      subSteps: [
        {
          expression: `${a} × ${c}`,
          result: combined,
          explanation: `${a} × ${c} = ${combined}`,
          depth: 1
        }
      ]
    });

    // Step 3: Multiply
    steps.push({
      expression: `${combined} × ${remaining}`,
      result: Math.abs(num1 * num2),
      explanation: combined % 10 === 0
        ? `Multiply by ${combined} (append ${Math.log10(combined / (combined % 10 || combined))} zeros)`
        : 'Multiply the regrouped factors',
      depth: 0
    });

    if (sign < 0) {
      steps.push({
        expression: `-(${Math.abs(num1 * num2)})`,
        result: num1 * num2,
        explanation: 'Apply negative sign',
        depth: 0
      });
    }

    return steps;
  }

  generateStudyContent(): StudyContent {
    return {
      method: this.name,
      introduction: 'Strategic factorization exploits the fundamental theorem of arithmetic.',
      mathematicalFoundation: 'Commutativity and associativity allow free rearrangement of factors.',
      deepDiveContent: 'Group factors to maximize multiples of 10...',
      whenToUse: [
        'Numbers have factors that combine to 10, 100, etc.',
        'Examples: 25 × 48 = (25 × 4) × 12 = 100 × 12'
      ],
      examples: [],
      interactiveExercises: []
    };
  }
}
```

---

## Barrel Export

### `src/lib/core/methods/index.ts`

```typescript
export { BaseMethod } from './base-method';
export { DistributiveMethod } from './distributive';
export { DifferenceSquaresMethod } from './difference-squares';
export { NearPower10Method } from './near-power-10';
export { SquaringMethod } from './squaring';
export { Near100Method } from './near-100';
export { FactorizationMethod } from './factorization';
```

---

## Test Suite

See `docs/examples/test-suite-example.md` for comprehensive test patterns.

### Known Solutions Fixture

Create `src/tests/fixtures/known-solutions.ts`:

```typescript
export interface KnownSolution {
  num1: number;
  num2: number;
  answer: number;
  optimalMethod: string;
  alternativeMethods?: string[];
}

export const KNOWN_SOLUTIONS: KnownSolution[] = [
  // Difference of Squares
  { num1: 47, num2: 53, answer: 2491, optimalMethod: 'difference-squares' },
  { num1: 96, num2: 104, answer: 9984, optimalMethod: 'difference-squares' },
  { num1: 43, num2: 57, answer: 2451, optimalMethod: 'difference-squares' },

  // Near-100
  { num1: 98, num2: 87, answer: 8526, optimalMethod: 'near-100' },
  { num1: 97, num2: 94, answer: 9118, optimalMethod: 'near-100' },
  { num1: 103, num2: 98, answer: 10094, optimalMethod: 'near-100' },

  // Squaring
  { num1: 73, num2: 73, answer: 5329, optimalMethod: 'squaring' },
  { num1: 25, num2: 25, answer: 625, optimalMethod: 'squaring' },
  { num1: 45, num2: 45, answer: 2025, optimalMethod: 'squaring' },

  // Near Powers of 10
  { num1: 102, num2: 47, answer: 4794, optimalMethod: 'near-power-10' },
  { num1: 98, num2: 123, answer: 12054, optimalMethod: 'near-power-10' },

  // Factorization
  { num1: 25, num2: 48, answer: 1200, optimalMethod: 'factorization' },
  { num1: 35, num2: 24, answer: 840, optimalMethod: 'factorization' },

  // Distributive (fallback)
  { num1: 47, num2: 89, answer: 4183, optimalMethod: 'distributive' },
];
```

---

## Quality Checklist

Before completing Phase 2:

- [ ] All 6 methods implemented
- [ ] Each method passes its test suite with ≥95% coverage
- [ ] All known solutions validate correctly
- [ ] Cross-validation confirms all methods produce same answer
- [ ] No method generates invalid solutions (100% validation success)
- [ ] Each method has clear explanations in steps

---

## References

- Mathematical foundations: `docs/PROJECT_REQUIREMENTS.md` Section 2
- Validation details: `docs/guides/mathematical-validation.md`
- Testing patterns: `docs/examples/test-suite-example.md`
