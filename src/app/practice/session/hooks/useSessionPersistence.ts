'use client';

/**
 * Session Persistence Hook
 * Handles sessionStorage persistence and restoration (Issue #37).
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { SessionConfig, ProblemAttempt, PracticeSession } from '@/lib/types/session';
import type { DifficultyLevel } from '@/lib/types/problem';
import type { ActiveSessionState, SessionAction, SessionPhase } from './useSessionState';
import type { MethodRanking } from '@/lib/core/methods/method-selector';
import { saveSession } from '@/lib/storage/statistics-store';
import { calculateStatistics } from '../utils/calculateStatistics';

// ============================================================================
// Constants
// ============================================================================

// Key for persisting session state in sessionStorage (Issue #37)
export const SESSION_STATE_STORAGE_KEY = 'practiceSessionState';
export const SESSION_CONFIG_STORAGE_KEY = 'practiceSessionConfig';

// ============================================================================
// Types
// ============================================================================

// Interface for persisted session state (serializable version)
export interface PersistedSessionState {
  phase: SessionPhase;
  previousPhase: SessionPhase | null;
  currentProblem: import('@/lib/types/problem').Problem | null;
  currentSolution: MethodRanking | null;
  problems: ProblemAttempt[];
  hintsUsed: number;
  sessionTimer: number;
  sessionStartTime: string; // ISO string for Date serialization
  config: SessionConfig;
}

export interface UseSessionPersistenceOptions {
  state: ActiveSessionState;
  dispatch: React.Dispatch<SessionAction>;
  sessionTimer: number;
  setSessionTimer: React.Dispatch<React.SetStateAction<number>>;
  isSessionEnded: boolean;
  sessionSavedRef: React.MutableRefObject<boolean>;
  sessionStartTimeRef: React.MutableRefObject<Date>;
}

export interface UseSessionPersistenceReturn {
  config: SessionConfig;
  configLoaded: boolean;
  stateRestored: boolean;
  hasValidConfig: boolean | null;
}

// Default configuration
const DEFAULT_CONFIG: SessionConfig = {
  difficulty: 'beginner' as unknown as DifficultyLevel,
  methods: [],
  problemCount: 10,
  allowNegatives: false
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Clear persisted session state from sessionStorage (Issue #37)
 */
export function clearPersistedSessionState(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(SESSION_STATE_STORAGE_KEY);
  }
}

// ============================================================================
// Hook
// ============================================================================

export function useSessionPersistence(
  options: UseSessionPersistenceOptions
): UseSessionPersistenceReturn {
  const {
    state,
    dispatch,
    sessionTimer,
    setSessionTimer,
    isSessionEnded,
    sessionSavedRef,
    sessionStartTimeRef
  } = options;

  const router = useRouter();

  // Track whether we have a valid config from sessionStorage
  // null = still checking, true = valid config found, false = no config (redirect needed)
  const [hasValidConfig, setHasValidConfig] = useState<boolean | null>(null);

  // Config is loaded synchronously via lazy initialization, so we can start as true
  // This flag is used to ensure we don't generate problems before hydration
  const [configLoaded, setConfigLoaded] = useState(typeof window !== 'undefined');

  // Track if state has been restored from sessionStorage (Issue #37)
  const [stateRestored, setStateRestored] = useState(false);

  // Session configuration - loaded from sessionStorage using lazy initialization
  const [config] = useState<SessionConfig>(() => {
    if (typeof window !== 'undefined') {
      const storedConfig = sessionStorage.getItem(SESSION_CONFIG_STORAGE_KEY);
      if (storedConfig) {
        try {
          return JSON.parse(storedConfig) as SessionConfig;
        } catch (error) {
          console.error('Failed to parse session config:', error);
        }
      }
    }
    return DEFAULT_CONFIG;
  });

  // Mark config as loaded after hydration (for SSR compatibility)
  useEffect(() => {
    if (!configLoaded) {
      setConfigLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check for valid configuration and redirect if not found
  // This handles direct navigation to /practice/session without going through configuration
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedConfig = sessionStorage.getItem(SESSION_CONFIG_STORAGE_KEY);

    if (!storedConfig) {
      // No config found - redirect to practice configuration page
      setHasValidConfig(false);
      router.replace('/practice');
      return;
    }

    try {
      const parsed = JSON.parse(storedConfig) as SessionConfig;
      // Validate that the config has required fields
      if (!parsed.difficulty || !Array.isArray(parsed.methods)) {
        setHasValidConfig(false);
        router.replace('/practice');
        return;
      }
      setHasValidConfig(true);
    } catch {
      // Invalid JSON - redirect
      setHasValidConfig(false);
      router.replace('/practice');
    }
  }, [router]);

  // Restore session state from sessionStorage on mount (Issue #37)
  useEffect(() => {
    if (typeof window === 'undefined' || stateRestored || hasValidConfig !== true) return;

    try {
      const saved = sessionStorage.getItem(SESSION_STATE_STORAGE_KEY);
      if (saved) {
        const parsed: PersistedSessionState = JSON.parse(saved);

        // Verify the config matches (don't restore if user started a new session with different config)
        const configMatches =
          JSON.stringify(parsed.config) === JSON.stringify(config);

        if (configMatches && parsed.problems.length > 0) {
          // Restore state
          dispatch({
            type: 'RESTORE_STATE',
            restoredState: {
              phase: parsed.phase,
              previousPhase: parsed.previousPhase,
              currentProblem: parsed.currentProblem,
              currentSolution: parsed.currentSolution,
              problems: parsed.problems,
              hintsUsed: parsed.hintsUsed,
              currentProblemStartTime: Date.now() // Reset to prevent time drift
            }
          });

          // Restore timer
          setSessionTimer(parsed.sessionTimer);

          // Restore session start time
          sessionStartTimeRef.current = new Date(parsed.sessionStartTime);

          console.log('Session state restored from browser navigation');
        }
      }
    } catch (error) {
      console.error('Failed to restore session state:', error);
      // Clear corrupted state
      clearPersistedSessionState();
    }

    setStateRestored(true);
  }, [config, stateRestored, hasValidConfig, dispatch, setSessionTimer, sessionStartTimeRef]);

  // Persist session state to sessionStorage periodically (Issue #37)
  useEffect(() => {
    if (typeof window === 'undefined' || !stateRestored) return;
    if (isSessionEnded) {
      // Clear persisted state when session ends
      clearPersistedSessionState();
      return;
    }

    // Only persist if we have meaningful progress
    if (state.problems.length === 0 && !state.currentProblem) return;

    const stateToSave: PersistedSessionState = {
      phase: state.phase,
      previousPhase: state.previousPhase,
      currentProblem: state.currentProblem,
      currentSolution: state.currentSolution,
      problems: state.problems,
      hintsUsed: state.hintsUsed,
      sessionTimer,
      sessionStartTime: sessionStartTimeRef.current.toISOString(),
      config
    };

    try {
      sessionStorage.setItem(SESSION_STATE_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Failed to persist session state:', error);
    }
  }, [state, sessionTimer, config, isSessionEnded, stateRestored, sessionStartTimeRef]);

  // Warn about losing progress on beforeunload (Issue #37)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only warn if there's progress to lose and session isn't ended
      if (state.problems.length > 0 && !isSessionEnded) {
        e.preventDefault();
        // Modern browsers require returnValue to be set
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.problems.length, isSessionEnded]);

  // Calculate whether session should end based on problem count
  const shouldEndSession = config.problemCount !== 'infinite' &&
    state.problems.length >= config.problemCount;

  // Save session to IndexedDB when it ends
  useEffect(() => {
    if ((isSessionEnded || shouldEndSession) && !sessionSavedRef.current && state.problems.length > 0) {
      sessionSavedRef.current = true;

      // Clear persisted session state when session ends (Issue #37)
      clearPersistedSessionState();

      const session: PracticeSession = {
        id: `session-${Date.now()}`,
        startedAt: sessionStartTimeRef.current,
        endedAt: new Date(),
        configuration: config,
        problems: state.problems,
        statistics: calculateStatistics(state.problems)
      };

      // Save session to IndexedDB (fire and forget)
      saveSession(session).catch(err => {
        console.error('Failed to save session:', err);
      });
    }
  }, [isSessionEnded, shouldEndSession, state.problems, config, sessionSavedRef, sessionStartTimeRef]);

  return {
    config,
    configLoaded,
    stateRestored,
    hasValidConfig
  };
}
