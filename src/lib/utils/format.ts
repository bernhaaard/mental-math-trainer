/**
 * Shared formatting utilities for time and display values.
 * @module utils/format
 */

/**
 * Format milliseconds as MM:SS string.
 * Useful for session timers and elapsed time displays.
 *
 * @param ms - Time in milliseconds
 * @returns Formatted time string in MM:SS format
 *
 * @example
 * formatTime(65000) // "1:05"
 * formatTime(3661000) // "61:01"
 */
export function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Format milliseconds as seconds with one decimal place.
 * Useful for displaying response times and averages.
 *
 * @param ms - Time in milliseconds
 * @returns Formatted time string with 's' suffix (e.g., "2.5s")
 *
 * @example
 * formatTimeSeconds(2500) // "2.5s"
 * formatTimeSeconds(1234) // "1.2s"
 */
export function formatTimeSeconds(ms: number): string {
  return (ms / 1000).toFixed(1) + 's';
}
