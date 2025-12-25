/**
 * Problem type definitions for mental math training.
 * @module types/problem
 */

/**
 * Difficulty levels for problem generation.
 * Each level corresponds to a range of numbers used in multiplication problems.
 */
export enum DifficultyLevel {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
  Expert = 'expert',
  Mastery = 'mastery'
}

/**
 * Numeric range definition with min and max bounds.
 */
export interface DifficultyRange {
  /** Minimum value (inclusive) */
  min: number;
  /** Maximum value (inclusive) */
  max: number;
}

/**
 * Custom user-defined range for problem generation.
 * Allows independent control of both operand ranges.
 */
export interface CustomRange {
  /** Minimum value for the first operand */
  num1Min: number;
  /** Maximum value for the first operand */
  num1Max: number;
  /** Minimum value for the second operand */
  num2Min: number;
  /** Maximum value for the second operand */
  num2Max: number;
}

/**
 * Predefined difficulty ranges mapping each level to number ranges.
 * These define the bounds for random number generation at each difficulty.
 */
export const DIFFICULTY_RANGES: Record<DifficultyLevel, DifficultyRange> = {
  [DifficultyLevel.Beginner]: { min: 2, max: 100 },
  [DifficultyLevel.Intermediate]: { min: 20, max: 400 },
  [DifficultyLevel.Advanced]: { min: 100, max: 1000 },
  [DifficultyLevel.Expert]: { min: 500, max: 10000 },
  [DifficultyLevel.Mastery]: { min: 1000, max: 1000000 }
};

/**
 * A multiplication problem with metadata.
 * Represents a single problem presented to the user.
 */
export interface Problem {
  /** Unique identifier for this problem */
  id: string;
  /** First operand in the multiplication */
  num1: number;
  /** Second operand in the multiplication */
  num2: number;
  /** Correct answer (num1 × num2) */
  answer: number;
  /** Difficulty level of this problem */
  difficulty: DifficultyLevel;
  /** Timestamp when the problem was generated */
  generatedAt: Date;
}
