/**
 * Custom React Hooks
 *
 * Reusable hooks for the Mental Math Trainer application.
 */

export {
  useKeyboardShortcuts,
  formatShortcutKey,
  parseShortcutKey
} from './useKeyboardShortcuts';

export type {
  ShortcutConfig,
  ShortcutCategory,
  UseKeyboardShortcutsOptions,
  UseKeyboardShortcutsReturn
} from './useKeyboardShortcuts';

export { useGoals } from './useGoals';
export type { UseGoalsReturn } from './useGoals';
