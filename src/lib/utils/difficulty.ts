/**
 * Shared difficulty level utilities for consistent styling.
 * @module utils/difficulty
 */

import { DifficultyLevel } from '../types';

/**
 * Color configuration for each difficulty level.
 */
export interface DifficultyColors {
  bg: string;
  text: string;
}

/**
 * Mapping of difficulty levels to their associated Tailwind CSS classes.
 * Used for consistent visual representation of difficulty across the app.
 */
export const DIFFICULTY_COLORS: Record<DifficultyLevel, DifficultyColors> = {
  [DifficultyLevel.Beginner]: { bg: 'bg-green-500/20', text: 'text-green-300' },
  [DifficultyLevel.Intermediate]: { bg: 'bg-blue-500/20', text: 'text-blue-300' },
  [DifficultyLevel.Advanced]: { bg: 'bg-purple-500/20', text: 'text-purple-300' },
  [DifficultyLevel.Expert]: { bg: 'bg-red-500/20', text: 'text-red-300' },
  [DifficultyLevel.Mastery]: { bg: 'bg-orange-500/20', text: 'text-orange-300' }
};

/**
 * Get the color classes for a specific difficulty level.
 *
 * @param level - The difficulty level
 * @returns Object containing bg and text color classes
 *
 * @example
 * const colors = getDifficultyColor(DifficultyLevel.Beginner);
 * // colors.bg === 'bg-green-500/20'
 * // colors.text === 'text-green-300'
 */
export function getDifficultyColor(level: DifficultyLevel): DifficultyColors {
  return DIFFICULTY_COLORS[level];
}
