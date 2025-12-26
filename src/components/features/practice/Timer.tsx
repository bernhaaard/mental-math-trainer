'use client';

import { useEffect, useState, useRef } from 'react';

/**
 * Timer mode: count up from 0 or count down from a limit.
 */
export type TimerMode = 'count-up' | 'count-down';

/**
 * Props for Timer component.
 */
export interface TimerProps {
  /** Timer mode */
  mode?: TimerMode;
  /** Initial time in seconds (for count-down) or starting point (for count-up) */
  initialTime?: number;
  /** Whether the timer is currently running */
  isRunning: boolean;
  /** Callback when time updates (called every second) */
  onTick?: (currentTime: number) => void;
  /** Callback when timer reaches 0 (count-down mode only) */
  onTimeUp?: () => void;
  /** Warning threshold in seconds (changes color when below this) */
  warningThreshold?: number;
  /** Whether to show the pause button */
  showPauseButton?: boolean;
  /** Callback when pause is toggled */
  onPauseToggle?: () => void;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Formats time in MM:SS format.
 */
function formatTime(seconds: number): string {
  const absSeconds = Math.abs(seconds);
  const mins = Math.floor(absSeconds / 60);
  const secs = absSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Timer component for tracking time during practice sessions.
 * Supports both count-up and count-down modes with optional warnings.
 */
export function Timer({
  mode = 'count-up',
  initialTime = 0,
  isRunning,
  onTick,
  onTimeUp,
  warningThreshold = 10,
  showPauseButton = false,
  onPauseToggle,
  size = 'md'
}: TimerProps) {
  const [time, setTime] = useState(initialTime);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Determine if we're in warning state
  const isWarning = mode === 'count-down' && time <= warningThreshold && time > 0;
  const isTimeUp = mode === 'count-down' && time <= 0;

  // Size variants
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  // Set up timer interval
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => {
          const newTime = mode === 'count-up' ? prevTime + 1 : prevTime - 1;

          // Call onTick callback
          if (onTick) {
            onTick(newTime);
          }

          // Check if time is up (count-down only)
          if (mode === 'count-down' && newTime <= 0) {
            if (onTimeUp) {
              onTimeUp();
            }
            return 0;
          }

          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, mode, onTick, onTimeUp]);

  // Reset time when initialTime changes
  useEffect(() => {
    setTime(initialTime);
  }, [initialTime]);

  return (
    <div className="flex items-center gap-3">
      {/* Timer display */}
      <div
        className={`flex items-center gap-2 rounded-lg px-3 py-2 font-mono font-bold transition-all duration-200 ${
          isTimeUp
            ? 'bg-red-500/20 text-red-400 ring-2 ring-red-500/50'
            : isWarning
            ? 'bg-orange-500/20 text-orange-400 ring-2 ring-orange-500/50 animate-pulse'
            : 'bg-gray-800/50 text-gray-300'
        } ${sizeClasses[size]}`}
      >
        {/* Clock icon */}
        <svg
          className={`${iconSizeClasses[size]} ${
            isTimeUp
              ? 'text-red-400'
              : isWarning
              ? 'text-orange-400'
              : 'text-gray-400'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>

        {/* Time display */}
        <span>{formatTime(time)}</span>
      </div>

      {/* Pause button */}
      {showPauseButton && onPauseToggle && (
        <button
          onClick={onPauseToggle}
          className="rounded-lg border border-gray-600 bg-gray-700/50 p-2 text-gray-300 transition-all duration-200 hover:border-gray-500 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          aria-label={isRunning ? 'Pause timer' : 'Resume timer'}
        >
          {isRunning ? (
            <svg
              className={iconSizeClasses[size]}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : (
            <svg
              className={iconSizeClasses[size]}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </button>
      )}

      {/* Accessibility label */}
      <div className="sr-only" role="timer" aria-live="polite" aria-atomic="true">
        {isTimeUp ? (
          'Time is up'
        ) : isWarning ? (
          `Warning: ${time} seconds remaining`
        ) : (
          `${mode === 'count-up' ? 'Elapsed' : 'Remaining'} time: ${formatTime(time)}`
        )}
      </div>
    </div>
  );
}
