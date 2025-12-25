/**
 * Method Selection Algorithm
 * @module core/methods/method-selector
 *
 * Selects the optimal calculation method for a given multiplication problem
 * by analyzing computational cost, mathematical elegance, and method-specific
 * applicability criteria.
 *
 * The selection algorithm uses a composite scoring function that balances:
 * - Computational cost (60%): Fewer steps, simpler arithmetic, less memory
 * - Quality score (40%): Mathematical elegance and pedagogical value
 *
 * All generated solutions are cross-validated to ensure mathematical correctness.
 */

import type { CalculationMethod, Solution } from '../../types';
import { MethodName, ABSOLUTE_MAX_VALUE } from '../../types';
import { DistributiveMethod } from './distributive';
import { DifferenceSquaresMethod } from './difference-squares';
import { NearPower10Method } from './near-power-10';
import { FactorizationMethod } from './factorization';
import { SquaringMethod } from './squaring';
import { Near100Method } from './near-100';
import { SolutionValidator } from '../validator';

// ============================================================================
// SCORING ALGORITHM CONSTANTS
// ============================================================================

/**
 * Weight for computational cost in composite scoring.
 *
 * RATIONALE: Computational cost is weighted higher (60%) because reducing
 * cognitive load is the primary goal of mental math techniques. Fewer steps
 * and simpler arithmetic are prioritized to minimize working memory demands.
 *
 * This value was chosen based on cognitive load theory principles:
 * - Working memory is limited (~4-7 items)
 * - Each calculation step consumes cognitive resources
 * - Reducing steps has compounding benefits for accuracy
 */
const COST_WEIGHT = 0.6;

/**
 * Weight for quality score in composite scoring.
 *
 * RATIONALE: Quality (mathematical elegance, pedagogical value) is weighted
 * at 40% to ensure we don't sacrifice educational value for minor efficiency
 * gains. A method that teaches deeper mathematical insight may be worth a
 * small increase in computational steps.
 */
const QUALITY_WEIGHT = 0.4;

/**
 * Threshold for "significant" cost difference in explanations.
 * Cost differences above this value warrant explicit percentage mention.
 */
const SIGNIFICANT_COST_DIFF = 1.0;

/**
 * Threshold for "moderate" cost difference.
 * Cost differences above this but below SIGNIFICANT warrant mention.
 */
const MODERATE_COST_DIFF = 0.3;

/**
 * Threshold for quality differences that affect explanation.
 * Quality differences beyond this indicate one method is notably less elegant.
 */
const QUALITY_DIFF_THRESHOLD = 0.2;

/**
 * Threshold for composite score differences that warrant explanation.
 * Used when other differences are subtle to provide clarity.
 */
const COMPOSITE_DIFF_THRESHOLD = 0.5;

/**
 * Result of method selection, including optimal method and alternatives.
 */
export interface MethodRanking {
  /** The optimal method and its solution */
  optimal: {
    method: CalculationMethod;
    solution: Solution;
    costScore: number;
    qualityScore: number;
  };
  /** Alternative methods ranked by composite score */
  alternatives: Array<{
    method: CalculationMethod;
    solution: Solution;
    costScore: number;
    qualityScore: number;
    whyNotOptimal: string;
  }>;
  /** Human-readable comparison summary explaining the selection */
  comparisonSummary: string;
}

/**
 * Internal scoring information for a method.
 */
interface MethodScore {
  method: CalculationMethod;
  cost: number;
  quality: number;
  compositeScore: number;
}

/**
 * Selects the optimal calculation method for multiplication problems.
 *
 * The selector evaluates all applicable methods, scores them based on
 * computational cost and quality, and returns the optimal method along
 * with alternatives for comparison.
 */
export class MethodSelector {
  private readonly methods: CalculationMethod[];

  /**
   * Creates a new method selector with all available calculation methods.
   */
  constructor() {
    this.methods = [
      new DistributiveMethod(),
      new DifferenceSquaresMethod(),
      new NearPower10Method(),
      new FactorizationMethod(),
      new SquaringMethod(),
      new Near100Method()
    ];
  }

  /**
   * Selects the optimal method for the given multiplication problem.
   *
   * Algorithm:
   * 1. Filter to applicable methods using isApplicable()
   * 2. Calculate composite score: cost * 0.6 + (1 - quality) * 0.4
   * 3. Sort by composite score (lower is better)
   * 4. Generate solutions for top 3 methods
   * 5. Cross-validate all solutions produce the same answer
   * 6. Return optimal method with alternatives
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns Method ranking with optimal solution and alternatives
   * @throws Error if no applicable methods found or if solutions don't cross-validate
   */
  selectOptimalMethod(num1: number, num2: number): MethodRanking {
    // Input validation - ensure we have valid, finite numbers within safe bounds
    this.validateInputs(num1, num2);

    // Step 1: Filter to applicable methods
    const applicable = this.methods.filter(method =>
      method.isApplicable(num1, num2)
    );

    if (applicable.length === 0) {
      // This should never happen as Distributive is always applicable
      throw new Error(
        `Unable to find a calculation method for ${num1} × ${num2}. ` +
        'Please try different numbers.'
      );
    }

    // Step 2: Calculate composite scores for all applicable methods
    const scored: MethodScore[] = applicable.map(method => {
      const cost = method.computeCost(num1, num2);
      const quality = method.qualityScore(num1, num2);

      // Composite score using documented weights (see constants above)
      // Lower is better: cost is naturally lower-is-better, quality is inverted
      const compositeScore = cost * COST_WEIGHT + (1 - quality) * QUALITY_WEIGHT;

      return {
        method,
        cost,
        quality,
        compositeScore
      };
    });

    // Step 3: Sort by composite score (lower is better)
    scored.sort((a, b) => a.compositeScore - b.compositeScore);

    // Step 4: Generate solutions for top methods (optimal + up to 2 alternatives)
    const optimal = scored[0];
    if (!optimal) {
      throw new Error(
        `No methods could be scored for ${num1} × ${num2}. ` +
        'This should never happen.'
      );
    }

    const alternatives = scored.slice(1, 3);

    // Generate optimal solution
    const optimalSolution = optimal.method.generateSolution(num1, num2);

    if (!optimalSolution.validated) {
      throw new Error(
        `Optimal method ${optimal.method.name} generated invalid solution: ` +
        optimalSolution.validationErrors.join(', ')
      );
    }

    // Generate alternative solutions
    const alternativeSolutions = alternatives.map(alt => {
      const solution = alt.method.generateSolution(num1, num2);

      if (!solution.validated) {
        throw new Error(
          `Alternative method ${alt.method.name} generated invalid solution: ` +
          solution.validationErrors.join(', ')
        );
      }

      const whyNotOptimal = this.explainWhyNotOptimal(
        optimal,
        alt,
        num1,
        num2
      );

      return {
        method: alt.method,
        solution,
        costScore: alt.cost,
        qualityScore: alt.quality,
        whyNotOptimal
      };
    });

    // Step 5: Cross-validate all solutions produce the same answer
    const allSolutions = [
      optimalSolution,
      ...alternativeSolutions.map(alt => alt.solution)
    ];

    const crossValidationPassed = SolutionValidator.crossValidate(
      num1,
      num2,
      allSolutions
    );

    if (!crossValidationPassed) {
      const answers = allSolutions.map(sol => {
        const lastStep = sol.steps[sol.steps.length - 1];
        if (!lastStep) {
          // This indicates a serious bug in the method implementation
          return `${sol.method}: ERROR - solution has no steps`;
        }
        return `${sol.method}: ${lastStep.result}`;
      });

      throw new Error(
        `Cross-validation failed for ${num1} × ${num2}. ` +
        `Different methods produced different answers: ${answers.join(', ')}. ` +
        'This indicates a bug in one of the calculation methods.'
      );
    }

    // Step 6: Generate comparison summary
    const comparisonSummary = this.generateComparisonSummary(
      optimal,
      alternatives,
      num1,
      num2
    );

    return {
      optimal: {
        method: optimal.method,
        solution: optimalSolution,
        costScore: optimal.cost,
        qualityScore: optimal.quality
      },
      alternatives: alternativeSolutions,
      comparisonSummary
    };
  }

  /**
   * Explains why an alternative method was not chosen as optimal.
   *
   * @param optimal - The optimal method's scoring information
   * @param alternative - The alternative method's scoring information
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns Human-readable explanation
   */
  private explainWhyNotOptimal(
    optimal: MethodScore,
    alternative: MethodScore,
    num1: number,
    num2: number
  ): string {
    const costDiff = alternative.cost - optimal.cost;
    const qualityDiff = alternative.quality - optimal.quality;
    const compositeDiff = alternative.compositeScore - optimal.compositeScore;

    let explanation = `${alternative.method.displayName} is not optimal because `;

    const reasons: string[] = [];

    // Analyze cost difference using documented thresholds
    if (costDiff > SIGNIFICANT_COST_DIFF) {
      const percentage = ((costDiff / optimal.cost) * 100).toFixed(0);
      reasons.push(
        `it requires ${percentage}% more computational effort ` +
        `(cost ${alternative.cost.toFixed(1)} vs ${optimal.cost.toFixed(1)})`
      );
    } else if (costDiff > MODERATE_COST_DIFF) {
      reasons.push(
        `it has higher computational cost ` +
        `(${alternative.cost.toFixed(1)} vs ${optimal.cost.toFixed(1)})`
      );
    }

    // Analyze quality difference (negative means alternative is less elegant)
    if (qualityDiff < -QUALITY_DIFF_THRESHOLD) {
      reasons.push(
        `it is less mathematically elegant for these specific numbers`
      );
    }

    // If the differences are subtle, explain the composite score
    if (reasons.length === 0 || compositeDiff < COMPOSITE_DIFF_THRESHOLD) {
      reasons.push(
        `the composite score slightly favors ${optimal.method.displayName} ` +
        `(${optimal.compositeScore.toFixed(2)} vs ${alternative.compositeScore.toFixed(2)})`
      );
    }

    explanation += reasons.join(', and ');

    // Add positive note about why the optimal method is better
    explanation += `, while ${optimal.method.displayName} better exploits ` +
      `the structure of ${num1} × ${num2}.`;

    return explanation;
  }

  /**
   * Generates a comprehensive comparison summary explaining the method selection.
   *
   * @param optimal - The optimal method's scoring information
   * @param alternatives - Alternative methods' scoring information
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns Human-readable comparison summary
   */
  private generateComparisonSummary(
    optimal: MethodScore,
    alternatives: MethodScore[],
    num1: number,
    num2: number
  ): string {
    let summary = `## Method Selection for ${num1} × ${num2}\n\n`;

    // Explain the optimal choice
    summary += `**Optimal Method: ${optimal.method.displayName}**\n\n`;
    summary += `This method was selected with a composite score of ${optimal.compositeScore.toFixed(2)} `;
    summary += `(cost: ${optimal.cost.toFixed(1)}, quality: ${optimal.quality.toFixed(2)}).\n\n`;

    // Explain WHY this method is optimal for these specific numbers
    summary += this.explainOptimalChoice(optimal.method, num1, num2);
    summary += '\n\n';

    // List alternative methods if any
    if (alternatives.length > 0) {
      summary += `### Alternative Methods\n\n`;
      summary += `While other methods could solve this problem, they are less optimal:\n\n`;

      alternatives.forEach((alt, index) => {
        summary += `${index + 1}. **${alt.method.displayName}**\n`;
        summary += `   - Cost: ${alt.cost.toFixed(1)}, Quality: ${alt.quality.toFixed(2)}, `;
        summary += `Composite: ${alt.compositeScore.toFixed(2)}\n`;
        summary += `   - ${this.getMethodCharacteristic(alt.method.name, num1, num2)}\n\n`;
      });
    } else {
      summary += `No other methods are applicable for this problem.\n`;
    }

    // Add educational note
    summary += `### Why Method Selection Matters\n\n`;
    summary += `Different multiplication problems have different structural properties. `;
    summary += `Recognizing these properties and choosing the appropriate method reduces `;
    summary += `cognitive load and helps develop deeper mathematical intuition.\n`;

    return summary;
  }

  /**
   * Explains why a specific method is optimal for the given numbers.
   *
   * @param method - The calculation method
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns Explanation of why this method is optimal
   */
  private explainOptimalChoice(
    method: CalculationMethod,
    num1: number,
    num2: number
  ): string {
    const characteristic = this.getMethodCharacteristic(method.name, num1, num2);
    return `**Why this method?** ${characteristic}`;
  }

  /**
   * Gets a characteristic description of why a method might be good for given numbers.
   *
   * @param methodName - The method name
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns Characteristic description
   */
  private getMethodCharacteristic(
    methodName: MethodName,
    num1: number,
    num2: number
  ): string {
    switch (methodName) {
      case MethodName.DifferenceSquares:
        const avg = (num1 + num2) / 2;
        const diff = Math.abs(num1 - num2);
        return `The numbers are equidistant from ${avg} (difference: ${diff}), ` +
          `allowing efficient use of the difference of squares identity: ` +
          `(a-b)(a+b) = a² - b².`;

      case MethodName.Squaring:
        return `Both numbers are identical (${num1}), so squaring techniques ` +
          `provide the most direct path to the answer.`;

      case MethodName.NearPower10:
        const power10 = this.findNearestPower10(num1, num2);
        return `At least one number is close to ${power10}, a power of 10, ` +
          `making place-value manipulation highly efficient.`;

      case MethodName.Near100:
        return `Both numbers are close to 100, allowing the use of ` +
          `the specialized (100-a)(100-b) = 100² - 100(a+b) + ab pattern.`;

      case MethodName.Factorization:
        return `The numbers have convenient factorizations that simplify ` +
          `the multiplication into easier sub-problems.`;

      case MethodName.Distributive:
        return `The distributive property provides a systematic approach ` +
          `that works for any multiplication through place-value partition.`;

      default:
        return `This method is well-suited for the given numbers.`;
    }
  }

  /**
   * Finds the nearest power of 10 to either number.
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @returns The nearest power of 10
   */
  private findNearestPower10(num1: number, num2: number): number {
    const powers = [10, 100, 1000, 10000, 100000, 1000000];

    let nearestPower = 10;
    let minDistance = Infinity;

    for (const power of powers) {
      const dist1 = Math.abs(num1 - power);
      const dist2 = Math.abs(num2 - power);
      const minDist = Math.min(dist1, dist2);

      if (minDist < minDistance) {
        minDistance = minDist;
        nearestPower = power;
      }
    }

    return nearestPower;
  }

  /**
   * Validates input numbers for the method selector.
   *
   * Ensures inputs are:
   * - Finite numbers (not NaN, Infinity, or -Infinity)
   * - Non-zero integers (multiplication by zero is trivial)
   * - Within safe computation bounds
   * - Won't cause integer overflow in the result
   *
   * @param num1 - First multiplicand
   * @param num2 - Second multiplicand
   * @throws Error if inputs are invalid
   */
  private validateInputs(num1: number, num2: number): void {
    // Check for NaN, Infinity
    if (!Number.isFinite(num1) || !Number.isFinite(num2)) {
      throw new Error('Both operands must be finite numbers');
    }

    // Check for zero (trivial multiplication, not educational)
    if (num1 === 0 || num2 === 0) {
      throw new Error(
        'Multiplication by zero is not supported. ' +
        'Please provide non-zero integers.'
      );
    }

    // Check for non-integers
    if (!Number.isInteger(num1) || !Number.isInteger(num2)) {
      throw new Error(
        'Only integer multiplication is supported. ' +
        `Received: ${num1}, ${num2}`
      );
    }

    // Check bounds
    const absNum1 = Math.abs(num1);
    const absNum2 = Math.abs(num2);

    if (absNum1 > ABSOLUTE_MAX_VALUE || absNum2 > ABSOLUTE_MAX_VALUE) {
      throw new Error(
        `Operands exceed maximum allowed value (${ABSOLUTE_MAX_VALUE.toLocaleString()}). ` +
        'Please use smaller numbers.'
      );
    }

    // Check for potential integer overflow in result
    // JavaScript's MAX_SAFE_INTEGER is 9,007,199,254,740,991 (2^53 - 1)
    const product = absNum1 * absNum2;
    if (product > Number.MAX_SAFE_INTEGER) {
      throw new Error(
        `Product would exceed JavaScript's safe integer range. ` +
        `Maximum safe product is ${Number.MAX_SAFE_INTEGER.toLocaleString()}. ` +
        'Please use smaller numbers.'
      );
    }
  }
}
