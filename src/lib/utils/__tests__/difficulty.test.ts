/**
 * Difficulty Utilities Tests
 * @module utils/__tests__/difficulty.test
 *
 * Tests the design token-based difficulty color system.
 */

import { describe, it, expect } from 'vitest';
import { getDifficultyColor, DIFFICULTY_COLORS, DifficultyColors } from '../difficulty';
import { DifficultyLevel } from '../../types';

describe('getDifficultyColor', () => {
  describe('returns correct design token classes for each difficulty level', () => {
    it('should return beginner design token classes for Beginner', () => {
      const colors = getDifficultyColor(DifficultyLevel.Beginner);
      expect(colors.bg).toBe('bg-difficulty-beginner-muted');
      expect(colors.text).toBe('text-difficulty-beginner');
      expect(colors.border).toBe('border-difficulty-beginner/30');
    });

    it('should return intermediate design token classes for Intermediate', () => {
      const colors = getDifficultyColor(DifficultyLevel.Intermediate);
      expect(colors.bg).toBe('bg-difficulty-intermediate-muted');
      expect(colors.text).toBe('text-difficulty-intermediate');
      expect(colors.border).toBe('border-difficulty-intermediate/30');
    });

    it('should return advanced design token classes for Advanced', () => {
      const colors = getDifficultyColor(DifficultyLevel.Advanced);
      expect(colors.bg).toBe('bg-difficulty-advanced-muted');
      expect(colors.text).toBe('text-difficulty-advanced');
      expect(colors.border).toBe('border-difficulty-advanced/30');
    });

    it('should return expert design token classes for Expert', () => {
      const colors = getDifficultyColor(DifficultyLevel.Expert);
      expect(colors.bg).toBe('bg-difficulty-expert-muted');
      expect(colors.text).toBe('text-difficulty-expert');
      expect(colors.border).toBe('border-difficulty-expert/30');
    });

    it('should return mastery design token classes for Mastery', () => {
      const colors = getDifficultyColor(DifficultyLevel.Mastery);
      expect(colors.bg).toBe('bg-difficulty-mastery-muted');
      expect(colors.text).toBe('text-difficulty-mastery');
      expect(colors.border).toBe('border-difficulty-mastery/30');
    });
  });

  describe('return type', () => {
    it('should return an object with bg, text, and border properties', () => {
      const colors = getDifficultyColor(DifficultyLevel.Beginner);
      expect(colors).toHaveProperty('bg');
      expect(colors).toHaveProperty('text');
      expect(colors).toHaveProperty('border');
      expect(typeof colors.bg).toBe('string');
      expect(typeof colors.text).toBe('string');
      expect(typeof colors.border).toBe('string');
    });
  });

  describe('consistency with DIFFICULTY_COLORS constant', () => {
    it('should return the same values as DIFFICULTY_COLORS for Beginner', () => {
      expect(getDifficultyColor(DifficultyLevel.Beginner)).toEqual(
        DIFFICULTY_COLORS[DifficultyLevel.Beginner]
      );
    });

    it('should return the same values as DIFFICULTY_COLORS for Intermediate', () => {
      expect(getDifficultyColor(DifficultyLevel.Intermediate)).toEqual(
        DIFFICULTY_COLORS[DifficultyLevel.Intermediate]
      );
    });

    it('should return the same values as DIFFICULTY_COLORS for Advanced', () => {
      expect(getDifficultyColor(DifficultyLevel.Advanced)).toEqual(
        DIFFICULTY_COLORS[DifficultyLevel.Advanced]
      );
    });

    it('should return the same values as DIFFICULTY_COLORS for Expert', () => {
      expect(getDifficultyColor(DifficultyLevel.Expert)).toEqual(
        DIFFICULTY_COLORS[DifficultyLevel.Expert]
      );
    });

    it('should return the same values as DIFFICULTY_COLORS for Mastery', () => {
      expect(getDifficultyColor(DifficultyLevel.Mastery)).toEqual(
        DIFFICULTY_COLORS[DifficultyLevel.Mastery]
      );
    });
  });
});

describe('DIFFICULTY_COLORS constant', () => {
  it('should have entries for all difficulty levels', () => {
    const levels = Object.values(DifficultyLevel);
    levels.forEach((level) => {
      expect(DIFFICULTY_COLORS[level]).toBeDefined();
    });
  });

  it('should have 5 difficulty levels defined', () => {
    expect(Object.keys(DIFFICULTY_COLORS).length).toBe(5);
  });

  it('each color entry should have bg, text, and border properties using design tokens', () => {
    Object.values(DIFFICULTY_COLORS).forEach((colors: DifficultyColors) => {
      expect(colors).toHaveProperty('bg');
      expect(colors).toHaveProperty('text');
      expect(colors).toHaveProperty('border');
      expect(colors.bg).toMatch(/^bg-difficulty-/);
      expect(colors.text).toMatch(/^text-difficulty-/);
      expect(colors.border).toMatch(/^border-difficulty-/);
    });
  });

  describe('color progression', () => {
    it('should use distinct colors for each level', () => {
      const bgColors = Object.values(DIFFICULTY_COLORS).map((c) => c.bg);
      const uniqueBgColors = new Set(bgColors);
      expect(uniqueBgColors.size).toBe(5);
    });

    it('should use distinct text colors for each level', () => {
      const textColors = Object.values(DIFFICULTY_COLORS).map((c) => c.text);
      const uniqueTextColors = new Set(textColors);
      expect(uniqueTextColors.size).toBe(5);
    });

    it('should use distinct border colors for each level', () => {
      const borderColors = Object.values(DIFFICULTY_COLORS).map((c) => c.border);
      const uniqueBorderColors = new Set(borderColors);
      expect(uniqueBorderColors.size).toBe(5);
    });
  });
});
