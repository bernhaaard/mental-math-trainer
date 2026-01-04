/**
 * Progressive Hints Module
 * @module core/hints
 *
 * Provides a progressive hint system for struggling learners that
 * gradually reveals solution steps without giving away the answer.
 */

export { HintSystem, hintSystem } from './hint-system';
export {
  HintLevel,
  type Hint,
  type HintResult,
  type HintState,
  type HintConfig,
  DEFAULT_HINT_CONFIG
} from './types';
