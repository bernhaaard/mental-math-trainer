/**
 * Shared difficulty level utilities for consistent styling.
 * Uses CSS custom properties (design tokens) for better theming support.
 * @module utils/difficulty
 */

import { DifficultyLevel } from '../types';

/**
 * Color configuration for each difficulty level.
 */
export interface DifficultyColors {
  bg: string;
  text: string;
  border: string;
}

/**
 * Mapping of difficulty levels to their associated Tailwind CSS classes.
 * Uses design tokens defined in globals.css for consistent theming.
 * Used for consistent visual representation of difficulty across the app.
 */
export const DIFFICULTY_COLORS: Record<DifficultyLevel, DifficultyColors> = {
  [DifficultyLevel.Beginner]: {
    bg: 'bg-difficulty-beginner-muted',
    text: 'text-difficulty-beginner',
    border: 'border-difficulty-beginner/30'
  },
  [DifficultyLevel.Intermediate]: {
    bg: 'bg-difficulty-intermediate-muted',
    text: 'text-difficulty-intermediate',
    border: 'border-difficulty-intermediate/30'
  },
  [DifficultyLevel.Advanced]: {
    bg: 'bg-difficulty-advanced-muted',
    text: 'text-difficulty-advanced',
    border: 'border-difficulty-advanced/30'
  },
  [DifficultyLevel.Expert]: {
    bg: 'bg-difficulty-expert-muted',
    text: 'text-difficulty-expert',
    border: 'border-difficulty-expert/30'
  },
  [DifficultyLevel.Mastery]: {
    bg: 'bg-difficulty-mastery-muted',
    text: 'text-difficulty-mastery',
    border: 'border-difficulty-mastery/30'
  }
};

/**
 * Get the color classes for a specific difficulty level.
 *
 * @param level - The difficulty level
 * @returns Object containing bg, text, and border color classes
 *
 * @example
 * const colors = getDifficultyColor(DifficultyLevel.Beginner);
 * // colors.bg === 'bg-difficulty-beginner-muted'
 * // colors.text === 'text-difficulty-beginner'
 * // colors.border === 'border-difficulty-beginner/30'
 */
export function getDifficultyColor(level: DifficultyLevel): DifficultyColors {
  return DIFFICULTY_COLORS[level];
}
