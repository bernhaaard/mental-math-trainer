/**
 * Type definitions for the progressive hint system.
 * @module core/hints/types
 */

import type { MethodName } from '../../types/method';
import type { CalculationStep } from '../../types/solution';

/**
 * Hint levels that progressively reveal more information.
 * Each level builds upon the previous one.
 */
export enum HintLevel {
  /** No hint requested yet */
  None = 0,
  /** First hint: Reveals the recommended calculation method */
  Method = 1,
  /** Second hint: Shows the first calculation step */
  FirstStep = 2,
  /** Third hint: Shows additional steps (up to half) */
  MoreSteps = 3,
  /** Fourth hint: Shows most steps (leaving only final calculation) */
  NearlyComplete = 4
}

/**
 * A single hint that can be displayed to the user.
 */
export interface Hint {
  /** The hint level this represents */
  level: HintLevel;
  /** Title of the hint (e.g., "Method Hint", "First Step") */
  title: string;
  /** The hint content to display */
  content: string;
  /** Optional detailed explanation */
  explanation?: string;
  /** The calculation steps revealed at this level (if applicable) */
  revealedSteps?: CalculationStep[];
}

/**
 * Result of generating hints for a problem.
 */
export interface HintResult {
  /** The method being used for hints */
  method: MethodName;
  /** Display name of the method */
  methodDisplayName: string;
  /** All available hints for this problem */
  hints: Hint[];
  /** Maximum number of hints available */
  maxHints: number;
  /** Why this method was chosen (for educational value) */
  methodReason: string;
}

/**
 * State for tracking hint usage within a session.
 */
export interface HintState {
  /** Current hint level (0 = no hints used) */
  currentLevel: HintLevel;
  /** All hints that have been revealed */
  revealedHints: Hint[];
  /** Whether more hints are available */
  hasMoreHints: boolean;
  /** Total hints available for current problem */
  totalHints: number;
}

/**
 * Configuration options for hint generation.
 */
export interface HintConfig {
  /** Whether to include mathematical explanations in hints */
  includeExplanations?: boolean;
  /** Maximum number of hints to generate (default: 4) */
  maxHints?: number;
  /** Whether to adapt hints based on problem difficulty */
  adaptToDifficulty?: boolean;
}

/**
 * Default hint configuration.
 */
export const DEFAULT_HINT_CONFIG: Required<HintConfig> = {
  includeExplanations: true,
  maxHints: 4,
  adaptToDifficulty: true
};
