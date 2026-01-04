/**
 * Calculation method type definitions.
 * @module types/method
 */

import type { Solution } from './solution';

/**
 * Names of available mental math calculation methods.
 */
export enum MethodName {
  Distributive = 'distributive',
  NearPower10 = 'near-power-10',
  DifferenceSquares = 'difference-squares',
  Factorization = 'factorization',
  Squaring = 'squaring',
  Near100 = 'near-100',
  SumToTen = 'sum-to-ten',
  SquaringEndIn5 = 'squaring-end-5'
}

/**
 * Interface for a calculation method implementation.
 * Each method must implement these functions to be usable by the system.
 */
export interface CalculationMethod {
  /** Unique identifier for this method */
  name: MethodName;
  /** Human-readable display name */
  displayName: string;
  /** Determines if this method can be applied to the given numbers */
  isApplicable: (num1: number, num2: number) => boolean;
  /** Computes the cognitive cost of using this method */
  computeCost: (num1: number, num2: number) => number;
  /** Computes a quality score (0-1) for how well suited this method is */
  qualityScore: (num1: number, num2: number) => number;
  /** Generates a step-by-step solution using this method */
  generateSolution: (num1: number, num2: number) => Solution;
  /** Generates educational content explaining this method */
  generateStudyContent: () => StudyContent;
}

/**
 * Breakdown of cognitive costs for a calculation method.
 */
export interface MethodCostBreakdown {
  /** Number of discrete calculation steps */
  stepCount: number;
  /** Complexity factor based on digit counts */
  digitComplexity: number;
  /** Number of intermediate values to hold in memory */
  memoryChunks: number;
  /** Penalty for dealing with very large/small numbers */
  magnitudePenalty: number;
  /** Combined total cost score */
  totalCost: number;
}

/**
 * Educational content for teaching a calculation method.
 */
export interface StudyContent {
  /** Which method this content is for */
  method: MethodName;
  /** Brief introduction to the method */
  introduction: string;
  /** Deeper explanation of the mathematical principles */
  mathematicalFoundation: string;
  /** Extended educational content for advanced learners */
  deepDiveContent: string;
  /** List of scenarios where this method excels */
  whenToUse: string[];
  /** List of scenarios where this method should NOT be used */
  whenNotToUse: string[];
  /** Common mistakes learners make and how to avoid them */
  commonMistakes: string[];
  /** Tips and strategies for effective practice */
  practiceStrategies: string[];
  /** Worked examples demonstrating the method */
  examples: StudyExample[];
  /** Practice exercises for the learner */
  interactiveExercises: InteractiveExercise[];
  /** Methods that should be learned before this one */
  prerequisites: MethodName[];
  /** Suggested methods to learn after mastering this one */
  nextMethods: MethodName[];
}

/**
 * A worked example for study mode.
 */
export interface StudyExample {
  /** First operand */
  num1: number;
  /** Second operand */
  num2: number;
  /** Complete solution with steps */
  solution: Solution;
  /** Teaching notes for this example */
  pedagogicalNotes: string[];
  /** Common mistakes to avoid when using this method */
  commonMistakes: string[];
}

/**
 * An interactive exercise for practice within study mode.
 */
export interface InteractiveExercise {
  /** First operand */
  num1: number;
  /** Second operand */
  num2: number;
  /** Progressive hints to help the learner */
  hints: string[];
  /** The method this exercise is teaching */
  expectedMethod: MethodName;
}
