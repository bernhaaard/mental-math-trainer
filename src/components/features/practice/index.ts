/**
 * Practice feature components - Barrel export for easy imports.
 * @module components/features/practice
 */

// Solution walkthrough components
export { SolutionWalkthrough } from './SolutionWalkthrough';
export { CalculationStep } from './CalculationStep';
export { MethodComparison } from './MethodComparison';
export { MathExpression } from './MathExpression';

// Practice session components
export { ProblemDisplay } from './ProblemDisplay';
export type { ProblemDisplayProps } from './ProblemDisplay';

export { AnswerInput } from './AnswerInput';
export type { AnswerInputProps, AnswerInputHandle } from './AnswerInput';

export { FeedbackDisplay } from './FeedbackDisplay';
export type { FeedbackDisplayProps } from './FeedbackDisplay';

export { SessionConfig } from './SessionConfig';
export { SessionSummary } from './SessionSummary';

// UI components
export { Timer } from './Timer';
export type { TimerProps, TimerMode } from './Timer';

export { ProgressBar } from './ProgressBar';
export type { ProgressBarProps } from './ProgressBar';

export { DifficultySelector } from './DifficultySelector';
export { MethodSelector } from './MethodSelector';
export { NumberRangeInput } from './NumberRangeInput';

// Hint system components
export { HintDisplay } from './HintDisplay';
export type { HintDisplayProps } from './HintDisplay';
