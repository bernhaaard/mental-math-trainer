/**
 * Difficulty Utilities Tests
 * @module utils/__tests__/difficulty.test
 */

import { describe, it, expect } from 'vitest';
import { getDifficultyColor, DIFFICULTY_COLORS, DifficultyColors } from '../difficulty';
import { DifficultyLevel } from '../../types';

describe('getDifficultyColor', () => {
  describe('returns correct colors for each difficulty level', () => {
    it('should return green colors for Beginner', () => {
      const colors = getDifficultyColor(DifficultyLevel.Beginner);
      expect(colors.bg).toBe('bg-green-500/20');
      expect(colors.text).toBe('text-green-300');
    });

    it('should return blue colors for Intermediate', () => {
      const colors = getDifficultyColor(DifficultyLevel.Intermediate);
      expect(colors.bg).toBe('bg-blue-500/20');
      expect(colors.text).toBe('text-blue-300');
    });

    it('should return purple colors for Advanced', () => {
      const colors = getDifficultyColor(DifficultyLevel.Advanced);
      expect(colors.bg).toBe('bg-purple-500/20');
      expect(colors.text).toBe('text-purple-300');
    });

    it('should return red colors for Expert', () => {
      const colors = getDifficultyColor(DifficultyLevel.Expert);
      expect(colors.bg).toBe('bg-red-500/20');
      expect(colors.text).toBe('text-red-300');
    });

    it('should return orange colors for Mastery', () => {
      const colors = getDifficultyColor(DifficultyLevel.Mastery);
      expect(colors.bg).toBe('bg-orange-500/20');
      expect(colors.text).toBe('text-orange-300');
    });
  });

  describe('return type', () => {
    it('should return an object with bg and text properties', () => {
      const colors = getDifficultyColor(DifficultyLevel.Beginner);
      expect(colors).toHaveProperty('bg');
      expect(colors).toHaveProperty('text');
      expect(typeof colors.bg).toBe('string');
      expect(typeof colors.text).toBe('string');
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

  it('each color entry should have bg and text properties', () => {
    Object.values(DIFFICULTY_COLORS).forEach((colors: DifficultyColors) => {
      expect(colors).toHaveProperty('bg');
      expect(colors).toHaveProperty('text');
      expect(colors.bg).toMatch(/^bg-/);
      expect(colors.text).toMatch(/^text-/);
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
  });
});
