'use client';

/**
 * Session Timer Hook
 * Handles session timer and problem elapsed time tracking.
 */

import { useState, useEffect, useCallback } from 'react';
import type { SessionPhase } from './useSessionState';

// ============================================================================
// Types
// ============================================================================

export interface UseSessionTimerOptions {
  phase: SessionPhase;
  currentProblemStartTime: number;
  isSessionEnded: boolean;
  initialSessionTimer?: number;
}

export interface UseSessionTimerReturn {
  sessionTimer: number;
  setSessionTimer: React.Dispatch<React.SetStateAction<number>>;
  problemElapsedTime: number;
  formatTime: (seconds: number) => string;
}

// ============================================================================
// Hook
// ============================================================================

export function useSessionTimer(options: UseSessionTimerOptions): UseSessionTimerReturn {
  const { phase, currentProblemStartTime, isSessionEnded, initialSessionTimer = 0 } = options;

  const [sessionTimer, setSessionTimer] = useState(initialSessionTimer);
  const [problemElapsedTime, setProblemElapsedTime] = useState(0);

  // Session timer - only runs during 'answering' phase
  // Pauses during feedback, reviewing, and paused phases (Issue #30)
  useEffect(() => {
    // Timer should only run when actively answering a problem
    const isTimerActive = phase === 'answering' && !isSessionEnded;

    if (!isTimerActive) return;

    const interval = setInterval(() => {
      setSessionTimer(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, isSessionEnded]);

  // Problem elapsed time tracker
  // Uses interval callback (async) to update state, avoiding sync setState in effect
  useEffect(() => {
    if (phase !== 'answering' || isSessionEnded) {
      return;
    }

    // Start counting from the problem start time
    const startTime = currentProblemStartTime;

    const interval = setInterval(() => {
      setProblemElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, currentProblemStartTime, isSessionEnded]);

  // Format time (seconds to MM:SS)
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    sessionTimer,
    setSessionTimer,
    problemElapsedTime,
    formatTime
  };
}
