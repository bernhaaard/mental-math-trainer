/**
 * Core Library Barrel Export
 * Re-exports all core functionality for convenient imports.
 */

// Validation
export { SolutionValidator } from './validator';
export { validateStep } from './step-validator';
export type { StepValidationResult } from './step-validator';

// Expression evaluation
export { evaluateExpression } from './expression-evaluator';

// Problem generation
export { generateMethodAwareProblem } from './problem-generator';
export type { GeneratorConfig } from './problem-generator';

// Study content
export {
  generateStudyContent,
  generateExamples,
  generateExercises,
  generateHints,
  getStaticStudyContent,
  getPrerequisites,
  getNextMethods,
  getLearningOrder
} from './study-content-generator';

// Re-export methods module
export * from './methods';
