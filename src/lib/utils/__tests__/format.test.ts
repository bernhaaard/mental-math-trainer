/**
 * Format Utilities Tests
 * @module utils/__tests__/format.test
 */

import { describe, it, expect } from 'vitest';
import { formatTime, formatTimeSeconds } from '../format';

describe('formatTime', () => {
  describe('basic formatting', () => {
    it('should format 0 milliseconds as 0:00', () => {
      expect(formatTime(0)).toBe('0:00');
    });

    it('should format milliseconds less than a minute', () => {
      expect(formatTime(1000)).toBe('0:01');
      expect(formatTime(30000)).toBe('0:30');
      expect(formatTime(59000)).toBe('0:59');
    });

    it('should format exactly one minute', () => {
      expect(formatTime(60000)).toBe('1:00');
    });

    it('should format minutes and seconds', () => {
      expect(formatTime(65000)).toBe('1:05');
      expect(formatTime(90000)).toBe('1:30');
      expect(formatTime(125000)).toBe('2:05');
    });
  });

  describe('large values', () => {
    it('should format values over an hour', () => {
      // 1 hour, 1 minute, 1 second = 3661000ms
      expect(formatTime(3661000)).toBe('61:01');
    });

    it('should format very large values', () => {
      // 2 hours = 7200000ms = 120 minutes
      expect(formatTime(7200000)).toBe('120:00');
    });
  });

  describe('edge cases', () => {
    it('should handle sub-second values (rounds down)', () => {
      expect(formatTime(500)).toBe('0:00');
      expect(formatTime(999)).toBe('0:00');
      expect(formatTime(1500)).toBe('0:01');
    });

    it('should pad single-digit seconds with leading zero', () => {
      expect(formatTime(1000)).toBe('0:01');
      expect(formatTime(61000)).toBe('1:01');
      expect(formatTime(69000)).toBe('1:09');
    });

    it('should not pad minutes with leading zero', () => {
      expect(formatTime(60000)).toBe('1:00');
      expect(formatTime(540000)).toBe('9:00');
    });
  });

  describe('realistic session times', () => {
    it('should format typical practice session durations', () => {
      // 5 minutes 30 seconds
      expect(formatTime(330000)).toBe('5:30');
      // 15 minutes 45 seconds
      expect(formatTime(945000)).toBe('15:45');
      // 30 minutes
      expect(formatTime(1800000)).toBe('30:00');
    });
  });
});

describe('formatTimeSeconds', () => {
  describe('basic formatting', () => {
    it('should format 0 milliseconds', () => {
      expect(formatTimeSeconds(0)).toBe('0.0s');
    });

    it('should format milliseconds to seconds with one decimal', () => {
      expect(formatTimeSeconds(1000)).toBe('1.0s');
      expect(formatTimeSeconds(2500)).toBe('2.5s');
      expect(formatTimeSeconds(1234)).toBe('1.2s');
    });
  });

  describe('rounding behavior', () => {
    it('should round to one decimal place', () => {
      expect(formatTimeSeconds(1250)).toBe('1.3s'); // rounds up
      expect(formatTimeSeconds(1240)).toBe('1.2s'); // rounds down
      expect(formatTimeSeconds(1245)).toBe('1.2s'); // banker's rounding or standard
    });
  });

  describe('edge cases', () => {
    it('should handle sub-100ms values', () => {
      expect(formatTimeSeconds(50)).toBe('0.1s');
      expect(formatTimeSeconds(99)).toBe('0.1s');
    });

    it('should handle very small values', () => {
      expect(formatTimeSeconds(1)).toBe('0.0s');
      expect(formatTimeSeconds(49)).toBe('0.0s');
    });

    it('should handle large values', () => {
      expect(formatTimeSeconds(10000)).toBe('10.0s');
      expect(formatTimeSeconds(65000)).toBe('65.0s');
    });
  });

  describe('realistic response times', () => {
    it('should format typical problem response times', () => {
      // Fast response: 1.5 seconds
      expect(formatTimeSeconds(1500)).toBe('1.5s');
      // Average response: 3.2 seconds
      expect(formatTimeSeconds(3200)).toBe('3.2s');
      // Slow response: 8.7 seconds
      expect(formatTimeSeconds(8700)).toBe('8.7s');
    });
  });
});
