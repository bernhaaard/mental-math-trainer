/**
 * Shared formatting utilities for time and display values.
 *
 * **IMPORTANT API NOTE**: All time formatting functions in this module
 * accept time values in **milliseconds**, not seconds. This is consistent
 * with JavaScript's Date.now() and performance.now() APIs.
 *
 * If you have a time value in seconds, multiply by 1000 before passing
 * to these functions: `formatTime(seconds * 1000)`
 *
 * @module utils/format
 */

/**
 * Format milliseconds as MM:SS string.
 * Useful for session timers and elapsed time displays.
 *
 * **Note**: This function accepts **milliseconds**, not seconds.
 * This matches JavaScript's native time APIs (Date.now(), performance.now()).
 *
 * @param ms - Time in **milliseconds** (e.g., 65000 for 1 minute 5 seconds)
 * @returns Formatted time string in MM:SS format (e.g., "1:05")
 *
 * @example
 * // Basic usage with milliseconds
 * formatTime(65000)    // "1:05" (1 minute, 5 seconds)
 * formatTime(3661000)  // "61:01" (1 hour, 1 minute, 1 second)
 * formatTime(0)        // "0:00"
 *
 * @example
 * // If you have seconds, convert first
 * const seconds = 65;
 * formatTime(seconds * 1000)  // "1:05"
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
 * **Note**: This function accepts **milliseconds**, not seconds.
 * This matches JavaScript's native time APIs (Date.now(), performance.now()).
 *
 * @param ms - Time in **milliseconds** (e.g., 2500 for 2.5 seconds)
 * @returns Formatted time string with 's' suffix (e.g., "2.5s")
 *
 * @example
 * // Basic usage with milliseconds
 * formatTimeSeconds(2500)  // "2.5s"
 * formatTimeSeconds(1234)  // "1.2s"
 * formatTimeSeconds(0)     // "0.0s"
 *
 * @example
 * // If you have seconds, convert first
 * const seconds = 2.5;
 * formatTimeSeconds(seconds * 1000)  // "2.5s"
 */
export function formatTimeSeconds(ms: number): string {
  return (ms / 1000).toFixed(1) + 's';
}
