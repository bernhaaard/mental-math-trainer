/**
 * Method-Aware Problem Generator
 *
 * Uses "backward reasoning" to generate problems that are suitable
 * for specific calculation methods.
 */

import { MethodName } from '../types/method';
import {
  Problem,
  DifficultyLevel,
  CustomRange,
  DIFFICULTY_RANGES
} from '../types/problem';

interface GeneratorConfig {
  difficulty: DifficultyLevel | CustomRange;
  allowNegatives: boolean;
}

/**
 * Generate random number in range
 */
function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate problem suitable for Difference of Squares method
 * Numbers should be symmetric around a round number: (midpoint-delta, midpoint+delta)
 */
function generateForDifferenceSquares(
  config: GeneratorConfig
): { num1: number; num2: number } {
  // Choose round midpoints based on difficulty
  const midpoints =
    typeof config.difficulty === 'string'
      ? config.difficulty === DifficultyLevel.Beginner
        ? [10, 15, 20, 25, 30]
        : config.difficulty === DifficultyLevel.Intermediate
          ? [30, 40, 50, 60, 70, 80]
          : [50, 60, 70, 80, 90, 100, 150, 200]
      : [50, 100]; // default for custom

  const midpointIndex = Math.floor(Math.random() * midpoints.length);
  const midpoint = midpoints[midpointIndex] ?? 50; // Default to 50 if undefined
  const maxDelta = Math.min(5, Math.floor(midpoint * 0.15)); // delta is at most 15% of midpoint
  const delta = randomInRange(1, Math.max(1, maxDelta));

  const num1 = midpoint - delta;
  const num2 = midpoint + delta;

  return { num1, num2 };
}

/**
 * Generate problem suitable for Squaring method
 * Both numbers must be the same: (n, n)
 */
function generateForSquaring(
  config: GeneratorConfig
): { num1: number; num2: number } {
  const range =
    typeof config.difficulty === 'string'
      ? DIFFICULTY_RANGES[config.difficulty]
      : config.difficulty;

  const minNum =
    typeof range === 'object' && 'num1Min' in range ? range.num1Min : range.min;
  const maxNum =
    typeof range === 'object' && 'num1Max' in range ? range.num1Max : range.max;

  // Limit max for squaring to avoid huge numbers
  const cappedMax = Math.min(maxNum, 200);
  const n = randomInRange(Math.max(2, minNum), cappedMax);

  return { num1: n, num2: n };
}

/**
 * Generate problem suitable for Near Power of 10 method
 * One number should be close to 10, 100, or 1000
 */
function generateForNearPower10(
  config: GeneratorConfig
): { num1: number; num2: number } {
  const range =
    typeof config.difficulty === 'string'
      ? DIFFICULTY_RANGES[config.difficulty]
      : config.difficulty;

  // Choose a power of 10 and nearby number
  const powers = [10, 100, 1000];
  const powerIndex = Math.floor(Math.random() * powers.length);
  const power = powers[powerIndex] ?? 100; // Default to 100 if undefined
  const deviation = randomInRange(-3, 3);
  const nearPower = power + deviation;

  // Generate the other number randomly within range
  const minNum =
    typeof range === 'object' && 'num2Min' in range ? range.num2Min : range.min;
  const maxNum =
    typeof range === 'object' && 'num2Max' in range ? range.num2Max : range.max;
  const otherNum = randomInRange(Math.max(2, minNum), Math.min(maxNum, 200));

  // Randomly swap order
  return Math.random() < 0.5
    ? { num1: nearPower, num2: otherNum }
    : { num1: otherNum, num2: nearPower };
}

/**
 * Generate problem suitable for Near 100 method
 * Both numbers should be within 15 of 100
 */
function generateForNear100(
  _config: GeneratorConfig
): { num1: number; num2: number } {
  const num1 = randomInRange(85, 115);
  const num2 = randomInRange(85, 115);
  return { num1, num2 };
}

/**
 * Generate problem suitable for Factorization method
 * At least one number should have "nice" factors (2, 4, 5, 8, 25, etc.)
 */
function generateForFactorization(
  config: GeneratorConfig
): { num1: number; num2: number } {
  const niceNumbers = [
    12, 15, 16, 18, 20, 24, 25, 32, 36, 40, 45, 48, 50, 64, 72, 75, 80, 125
  ];
  const niceIndex = Math.floor(Math.random() * niceNumbers.length);
  const num1 = niceNumbers[niceIndex] ?? 24; // Default to 24 if undefined

  const range =
    typeof config.difficulty === 'string'
      ? DIFFICULTY_RANGES[config.difficulty]
      : config.difficulty;
  const minNum =
    typeof range === 'object' && 'num2Min' in range ? range.num2Min : range.min;
  const maxNum =
    typeof range === 'object' && 'num2Max' in range ? range.num2Max : range.max;
  const num2 = randomInRange(Math.max(2, minNum), Math.min(maxNum, 200));

  return Math.random() < 0.5 ? { num1, num2 } : { num1: num2, num2: num1 };
}

/**
 * Generate problem for Distributive method (general purpose)
 * Any numbers in range work - this is the fallback
 */
function generateForDistributive(
  config: GeneratorConfig
): { num1: number; num2: number } {
  const range =
    typeof config.difficulty === 'string'
      ? DIFFICULTY_RANGES[config.difficulty]
      : config.difficulty;

  const min1 =
    typeof range === 'object' && 'num1Min' in range ? range.num1Min : range.min;
  const max1 =
    typeof range === 'object' && 'num1Max' in range ? range.num1Max : range.max;
  const min2 =
    typeof range === 'object' && 'num2Min' in range ? range.num2Min : range.min;
  const max2 =
    typeof range === 'object' && 'num2Max' in range ? range.num2Max : range.max;

  return {
    num1: randomInRange(min1, max1),
    num2: randomInRange(min2, max2)
  };
}

/**
 * Generate problem suitable for Sum-to-Ten method
 * Numbers where units digits sum to 10 and tens digits are equal
 * e.g., 23 × 27 (3+7=10, both have 2 in tens place)
 */
function generateForSumToTen(
  _config: GeneratorConfig
): { num1: number; num2: number } {
  // Choose a tens digit (1-9)
  const tensDigit = randomInRange(1, 9);
  // Choose a units digit pair that sums to 10
  const unitsPairs = [[1, 9], [2, 8], [3, 7], [4, 6], [5, 5]];
  const pairIndex = Math.floor(Math.random() * unitsPairs.length);
  const [u1, u2] = unitsPairs[pairIndex] ?? [3, 7];

  const num1 = tensDigit * 10 + u1;
  const num2 = tensDigit * 10 + u2;

  return { num1, num2 };
}

/**
 * Generate problem suitable for Squaring numbers ending in 5
 * Number must end in 5: n5 × n5
 */
function generateForSquaringEndIn5(
  config: GeneratorConfig
): { num1: number; num2: number } {
  const range =
    typeof config.difficulty === 'string'
      ? DIFFICULTY_RANGES[config.difficulty]
      : config.difficulty;

  const minNum =
    typeof range === 'object' && 'num1Min' in range ? range.num1Min : range.min;
  const maxNum =
    typeof range === 'object' && 'num1Max' in range ? range.num1Max : range.max;

  // Generate numbers ending in 5 within range
  const minBase = Math.ceil(minNum / 10);
  const maxBase = Math.floor(maxNum / 10);
  const cappedMaxBase = Math.min(maxBase, 19); // Cap at 195

  const base = randomInRange(Math.max(1, minBase), cappedMaxBase);
  const n = base * 10 + 5; // e.g., 15, 25, 35, ...

  return { num1: n, num2: n };
}

/**
 * Method-specific generators map
 */
const METHOD_GENERATORS: Record<
  MethodName,
  (config: GeneratorConfig) => { num1: number; num2: number }
> = {
  [MethodName.DifferenceSquares]: generateForDifferenceSquares,
  [MethodName.Squaring]: generateForSquaring,
  [MethodName.NearPower10]: generateForNearPower10,
  [MethodName.Near100]: generateForNear100,
  [MethodName.Factorization]: generateForFactorization,
  [MethodName.Distributive]: generateForDistributive,
  [MethodName.SumToTen]: generateForSumToTen,
  [MethodName.SquaringEndIn5]: generateForSquaringEndIn5
};

/**
 * Generate a problem suitable for the specified methods
 *
 * @param config - Difficulty and settings configuration
 * @param methods - Array of methods to generate for. If empty, uses Distributive.
 * @param problemNumber - Problem number for ID generation
 * @returns Problem with numbers suitable for selected methods
 */
export function generateMethodAwareProblem(
  config: GeneratorConfig,
  methods: MethodName[],
  problemNumber: number
): Problem {
  // If no specific methods, use general generator
  const targetMethods =
    methods.length > 0 ? methods : [MethodName.Distributive];

  // Pick a random method from the allowed list
  const methodIndex = Math.floor(Math.random() * targetMethods.length);
  const selectedMethod = targetMethods[methodIndex] ?? MethodName.Distributive;

  // Generate numbers using method-specific generator
  const generator = METHOD_GENERATORS[selectedMethod];
  let { num1, num2 } = generator(config);

  // Apply negatives if allowed (30% chance each)
  if (config.allowNegatives) {
    if (Math.random() < 0.3) num1 = -num1;
    if (Math.random() < 0.3) num2 = -num2;
  }

  // Determine difficulty level
  const difficulty =
    typeof config.difficulty === 'string'
      ? config.difficulty
      : DifficultyLevel.Advanced;

  return {
    id: `problem-${problemNumber}-${Date.now()}`,
    num1,
    num2,
    answer: num1 * num2,
    difficulty,
    generatedAt: new Date()
  };
}

export type { GeneratorConfig };
