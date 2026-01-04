'use client';

/**
 * Session State Management Hook
 * Handles reducer, state types, and actions for the practice session.
 */

import { useReducer, useCallback, useState, useRef } from 'react';
import type { Problem } from '@/lib/types/problem';
import type { ProblemAttempt } from '@/lib/types/session';
import type { MethodRanking } from '@/lib/core/methods/method-selector';

// ============================================================================
// Types
// ============================================================================

export type SessionPhase = 'answering' | 'feedback' | 'reviewing' | 'paused';

export interface ActiveSessionState {
  phase: SessionPhase;
  previousPhase: SessionPhase | null; // Track phase before pausing for proper resume
  currentProblem: Problem | null;
  currentSolution: MethodRanking | null;
  problems: ProblemAttempt[];
  currentProblemStartTime: number;
  hintsUsed: number;
  showError: boolean;
  generationError: boolean; // Issue #39: Track failed problem generation
}

export type SessionAction =
  | { type: 'SET_PROBLEM'; problem: Problem; solution: MethodRanking }
  | { type: 'SUBMIT_ANSWER'; answer: number }
  | { type: 'SKIP_PROBLEM' }
  | { type: 'REQUEST_HINT' }
  | { type: 'VIEW_SOLUTION' }
  | { type: 'NEXT_PROBLEM' }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'SHOW_ERROR' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESUME_FROM_PAUSE' }
  | { type: 'RESTORE_STATE'; restoredState: Partial<ActiveSessionState> }
  | { type: 'SET_GENERATION_ERROR' } // Issue #39: Handle failed generation
  | { type: 'CLEAR_GENERATION_ERROR' };

// ============================================================================
// Reducer
// ============================================================================

function sessionReducer(state: ActiveSessionState, action: SessionAction): ActiveSessionState {
  switch (action.type) {
    case 'SET_PROBLEM':
      return {
        ...state,
        phase: 'answering',
        currentProblem: action.problem,
        currentSolution: action.solution,
        currentProblemStartTime: Date.now(),
        hintsUsed: 0,
        showError: false
      };

    case 'SUBMIT_ANSWER': {
      if (!state.currentProblem || !state.currentSolution) return state;

      const timeTaken = Date.now() - state.currentProblemStartTime;
      const isCorrect = action.answer === state.currentProblem.answer;

      const attempt: ProblemAttempt = {
        problem: state.currentProblem,
        userAnswers: [action.answer],
        correctAnswer: state.currentProblem.answer,
        timeTaken,
        hintsUsed: state.hintsUsed,
        skipped: false,
        solution: state.currentSolution.optimal.solution,
        errorMagnitude: Math.abs(action.answer - state.currentProblem.answer)
      };

      return {
        ...state,
        phase: 'feedback',
        problems: [...state.problems, attempt],
        showError: !isCorrect
      };
    }

    case 'SKIP_PROBLEM': {
      if (!state.currentProblem || !state.currentSolution) return state;

      const timeTaken = Date.now() - state.currentProblemStartTime;

      const attempt: ProblemAttempt = {
        problem: state.currentProblem,
        userAnswers: [],
        correctAnswer: state.currentProblem.answer,
        timeTaken,
        hintsUsed: state.hintsUsed,
        skipped: true,
        solution: state.currentSolution.optimal.solution,
        errorMagnitude: 0
      };

      return {
        ...state,
        phase: 'feedback',
        problems: [...state.problems, attempt]
      };
    }

    case 'REQUEST_HINT':
      return {
        ...state,
        hintsUsed: state.hintsUsed + 1
      };

    case 'VIEW_SOLUTION':
      return {
        ...state,
        phase: 'reviewing'
      };

    case 'NEXT_PROBLEM':
      return {
        ...state,
        phase: 'answering',
        currentProblem: null,
        currentSolution: null
      };

    case 'TOGGLE_PAUSE':
      if (state.phase === 'paused') {
        // Resuming: restore previous phase
        return {
          ...state,
          phase: state.previousPhase || 'answering',
          previousPhase: null
        };
      } else {
        // Pausing: save current phase
        return {
          ...state,
          previousPhase: state.phase,
          phase: 'paused'
        };
      }

    case 'RESUME_FROM_PAUSE':
      return {
        ...state,
        phase: state.previousPhase || 'answering',
        previousPhase: null
      };

    case 'SHOW_ERROR':
      return { ...state, showError: true };

    case 'CLEAR_ERROR':
      return { ...state, showError: false };

    case 'RESTORE_STATE':
      return {
        ...state,
        ...action.restoredState
      };

    case 'SET_GENERATION_ERROR':
      return { ...state, generationError: true };

    case 'CLEAR_GENERATION_ERROR':
      return { ...state, generationError: false };

    default:
      return state;
  }
}

// ============================================================================
// Initial State
// ============================================================================

const createInitialState = (): ActiveSessionState => ({
  phase: 'answering',
  previousPhase: null,
  currentProblem: null,
  currentSolution: null,
  problems: [],
  currentProblemStartTime: Date.now(),
  hintsUsed: 0,
  showError: false,
  generationError: false
});

// ============================================================================
// Hook
// ============================================================================

export interface UseSessionStateReturn {
  state: ActiveSessionState;
  dispatch: React.Dispatch<SessionAction>;
  isSessionEnded: boolean;
  setIsSessionEnded: React.Dispatch<React.SetStateAction<boolean>>;
  sessionSavedRef: React.MutableRefObject<boolean>;
  sessionStartTimeRef: React.MutableRefObject<Date>;
  handlers: {
    handleSubmitAnswer: (answer: number) => void;
    handleSkip: () => void;
    handleRequestHint: () => void;
    handleViewSolution: () => void;
    handleTogglePause: () => void;
    handleCloseWalkthrough: () => void;
    handleEndSession: () => void;
  };
}

export function useSessionState(): UseSessionStateReturn {
  const [state, dispatch] = useReducer(sessionReducer, undefined, createInitialState);
  const [isSessionEnded, setIsSessionEnded] = useState(false);

  // Track if session has been saved to prevent duplicate saves
  const sessionSavedRef = useRef(false);

  // Track session start time
  const sessionStartTimeRef = useRef<Date>(new Date());

  // Handlers
  const handleSubmitAnswer = useCallback((answer: number) => {
    dispatch({ type: 'SUBMIT_ANSWER', answer });
  }, []);

  const handleSkip = useCallback(() => {
    dispatch({ type: 'SKIP_PROBLEM' });
  }, []);

  const handleRequestHint = useCallback(() => {
    dispatch({ type: 'REQUEST_HINT' });
  }, []);

  const handleViewSolution = useCallback(() => {
    dispatch({ type: 'VIEW_SOLUTION' });
  }, []);

  const handleTogglePause = useCallback(() => {
    dispatch({ type: 'TOGGLE_PAUSE' });
  }, []);

  const handleCloseWalkthrough = useCallback(() => {
    dispatch({ type: 'NEXT_PROBLEM' });
  }, []);

  const handleEndSession = useCallback(() => {
    setIsSessionEnded(true);
  }, []);

  return {
    state,
    dispatch,
    isSessionEnded,
    setIsSessionEnded,
    sessionSavedRef,
    sessionStartTimeRef,
    handlers: {
      handleSubmitAnswer,
      handleSkip,
      handleRequestHint,
      handleViewSolution,
      handleTogglePause,
      handleCloseWalkthrough,
      handleEndSession
    }
  };
}
