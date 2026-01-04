'use client';

/**
 * Active Practice Session Page
 * Handles the main practice loop: problem display, answer input, feedback, and navigation.
 */

import { useState, useEffect, useCallback, useReducer, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProblemDisplay } from '@/components/features/practice/ProblemDisplay';
import { AnswerInput, type AnswerInputHandle } from '@/components/features/practice/AnswerInput';
import { FeedbackDisplay } from '@/components/features/practice/FeedbackDisplay';
import { SolutionWalkthrough } from '@/components/features/practice/SolutionWalkthrough';
import { ProgressBar } from '@/components/features/practice/ProgressBar';
import { HintDisplay } from '@/components/features/practice/HintDisplay';
import { KeyboardShortcutHelp, KeyboardShortcut } from '@/components/ui';
import { useKeyboardShortcuts, type ShortcutConfig } from '@/lib/hooks/useKeyboardShortcuts';
import type { Problem } from '@/lib/types/problem';
import { DifficultyLevel } from '@/lib/types/problem';
import type { SessionConfig, ProblemAttempt, SessionStatistics, MethodStats, PracticeSession } from '@/lib/types/session';
import { MethodName } from '@/lib/types/method';
import { MethodSelector, type MethodRanking } from '@/lib/core/methods/method-selector';
import { generateMethodAwareProblem } from '@/lib/core/problem-generator';
import { saveSession } from '@/lib/storage/statistics-store';
import { HintSystem, type HintResult, type HintState, HintLevel } from '@/lib/core/hints';

// ============================================================================
// Types and State Management
// ============================================================================

type SessionPhase = 'answering' | 'feedback' | 'reviewing' | 'paused';

interface ActiveSessionState {
  phase: SessionPhase;
  previousPhase: SessionPhase | null; // Track phase before pausing for proper resume
  currentProblem: Problem | null;
  currentSolution: MethodRanking | null;
  problems: ProblemAttempt[];
  currentProblemStartTime: number;
  hintsUsed: number;
  showError: boolean;
  generationError: boolean; // Issue #39: Track failed problem generation
  // Progressive hints state (Issue #70)
  hintResult: HintResult | null;
  hintState: HintState;
}

// Key for persisting session state in sessionStorage (Issue #37)
const SESSION_STATE_STORAGE_KEY = 'practiceSessionState';

// Interface for persisted session state (serializable version)
interface PersistedSessionState {
  phase: SessionPhase;
  previousPhase: SessionPhase | null;
  currentProblem: Problem | null;
  currentSolution: MethodRanking | null;
  problems: ProblemAttempt[];
  hintsUsed: number;
  sessionTimer: number;
  sessionStartTime: string; // ISO string for Date serialization
  config: SessionConfig;
  // Progressive hints state (Issue #70)
  hintResult: HintResult | null;
  hintState: HintState;
}

type SessionAction =
  | { type: 'SET_PROBLEM'; problem: Problem; solution: MethodRanking; hintResult: HintResult }
  | { type: 'SUBMIT_ANSWER'; answer: number }
  | { type: 'SKIP_PROBLEM' }
  | { type: 'REQUEST_HINT'; newHintState: HintState }
  | { type: 'VIEW_SOLUTION' }
  | { type: 'NEXT_PROBLEM' }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'SHOW_ERROR' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESUME_FROM_PAUSE' }
  | { type: 'RESTORE_STATE'; restoredState: Partial<ActiveSessionState> }
  | { type: 'SET_GENERATION_ERROR' } // Issue #39: Handle failed generation
  | { type: 'CLEAR_GENERATION_ERROR' };

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
        showError: false,
        // Reset hint state for new problem (Issue #70)
        hintResult: action.hintResult,
        hintState: {
          currentLevel: HintLevel.None,
          revealedHints: [],
          hasMoreHints: action.hintResult.maxHints > 0,
          totalHints: action.hintResult.maxHints
        }
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
        hintsUsed: state.hintsUsed + 1,
        // Update progressive hint state (Issue #70)
        hintState: action.newHintState
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
        currentSolution: null,
        // Reset hint state for next problem (Issue #70)
        hintResult: null,
        hintState: {
          currentLevel: HintLevel.None,
          revealedHints: [],
          hasMoreHints: false,
          totalHints: 0
        }
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
// Helper Functions
// ============================================================================

/**
 * Generate a problem suitable for the selected methods.
 * Uses the method-aware problem generator to create problems that
 * will benefit from the user's selected calculation methods.
 */
function generateProblem(config: SessionConfig, problemNumber: number): Problem {
  return generateMethodAwareProblem(
    {
      difficulty: config.difficulty,
      allowNegatives: config.allowNegatives
    },
    config.methods,
    problemNumber
  );
}

function calculateStatistics(problems: ProblemAttempt[]): SessionStatistics {
  if (problems.length === 0) {
    return {
      totalProblems: 0,
      correctAnswers: 0,
      accuracy: 0,
      averageTime: 0,
      averageError: 0,
      methodBreakdown: {},
      // Hint statistics (Issue #70)
      totalHintsUsed: 0,
      problemsWithHints: 0,
      averageHintsPerProblem: 0
    };
  }

  const correctAnswers = problems.filter(
    p => !p.skipped && p.userAnswers[0] === p.correctAnswer
  ).length;

  const accuracy = (correctAnswers / problems.length) * 100;
  const totalTime = problems.reduce((sum, p) => sum + p.timeTaken, 0);
  const averageTime = totalTime / problems.length;

  const incorrectProblems = problems.filter(
    p => !p.skipped && p.userAnswers[0] !== p.correctAnswer
  );
  const averageError =
    incorrectProblems.length > 0
      ? incorrectProblems.reduce((sum, p) => sum + p.errorMagnitude, 0) /
        incorrectProblems.length
      : 0;

  // Calculate hint statistics (Issue #70)
  const totalHintsUsed = problems.reduce((sum, p) => sum + p.hintsUsed, 0);
  const problemsWithHints = problems.filter(p => p.hintsUsed > 0).length;
  const averageHintsPerProblem = problems.length > 0
    ? totalHintsUsed / problems.length
    : 0;

  // Calculate method breakdown
  const methodBreakdown: Partial<Record<MethodName, MethodStats>> = {};

  problems.forEach(problem => {
    const method = problem.solution.method;
    if (!methodBreakdown[method]) {
      methodBreakdown[method] = {
        method,
        problemsSolved: 0,
        correctAnswers: 0,
        accuracy: 0,
        averageTime: 0
      };
    }

    const stats = methodBreakdown[method]!;
    stats.problemsSolved++;

    if (!problem.skipped && problem.userAnswers[0] === problem.correctAnswer) {
      stats.correctAnswers++;
    }
  });

  // Calculate averages
  Object.values(methodBreakdown).forEach(stats => {
    if (stats) {
      const methodProblems = problems.filter(p => p.solution.method === stats.method);
      stats.accuracy = (stats.correctAnswers / stats.problemsSolved) * 100;
      stats.averageTime = methodProblems.reduce((sum, p) => sum + p.timeTaken, 0) / methodProblems.length;
    }
  });

  return {
    totalProblems: problems.length,
    correctAnswers,
    accuracy,
    averageTime,
    averageError,
    methodBreakdown,
    // Hint statistics (Issue #70)
    totalHintsUsed,
    problemsWithHints,
    averageHintsPerProblem
  };
}

/**
 * Clear persisted session state from sessionStorage (Issue #37)
 */
function clearPersistedSessionState(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(SESSION_STATE_STORAGE_KEY);
  }
}

// ============================================================================
// Main Component
// ============================================================================

const DEFAULT_CONFIG: SessionConfig = {
  difficulty: DifficultyLevel.Beginner,
  methods: [],
  problemCount: 10,
  allowNegatives: false
};

export default function ActiveSessionPage() {
  const router = useRouter();
  const [methodSelector] = useState(() => new MethodSelector());

  // Track whether we have a valid config from sessionStorage
  // null = still checking, true = valid config found, false = no config (redirect needed)
  const [hasValidConfig, setHasValidConfig] = useState<boolean | null>(null);

  // Config is loaded synchronously via lazy initialization, so we can start as true
  // This flag is used to ensure we don't generate problems before hydration
  const [configLoaded, setConfigLoaded] = useState(typeof window !== 'undefined');

  // Track if state has been restored from sessionStorage (Issue #37)
  const [stateRestored, setStateRestored] = useState(false);

  // Keyboard shortcuts help modal state
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);

  // Screen reader announcement ref
  const announcementRef = useRef<HTMLDivElement>(null);

  // Answer input ref for focus management
  const answerInputRef = useRef<AnswerInputHandle>(null);

  // Track if session has been saved to prevent duplicate saves
  const sessionSavedRef = useRef(false);

  // Track session start time
  const sessionStartTimeRef = useRef<Date>(new Date());

  // Session configuration - loaded from sessionStorage using lazy initialization
  const [config] = useState<SessionConfig>(() => {
    if (typeof window !== 'undefined') {
      const storedConfig = sessionStorage.getItem('practiceSessionConfig');
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

    const storedConfig = sessionStorage.getItem('practiceSessionConfig');

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

  // Initialize hint system (Issue #70)
  const [hintSystem] = useState(() => new HintSystem());

  const [state, dispatch] = useReducer(sessionReducer, undefined, () => ({
    phase: 'answering' as SessionPhase,
    previousPhase: null,
    currentProblem: null,
    currentSolution: null,
    problems: [],
    currentProblemStartTime: Date.now(),
    hintsUsed: 0,
    showError: false,
    generationError: false,
    // Progressive hints initial state (Issue #70)
    hintResult: null,
    hintState: {
      currentLevel: HintLevel.None,
      revealedHints: [],
      hasMoreHints: false,
      totalHints: 0
    }
  }));

  const [sessionTimer, setSessionTimer] = useState(0);
  const [problemElapsedTime, setProblemElapsedTime] = useState(0);
  const [isSessionEnded, setIsSessionEnded] = useState(false);

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
              currentProblemStartTime: Date.now(), // Reset to prevent time drift
              // Restore hint state (Issue #70)
              hintResult: parsed.hintResult,
              hintState: parsed.hintState
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
  }, [config, stateRestored, hasValidConfig]);

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
      config,
      // Persist hint state (Issue #70)
      hintResult: state.hintResult,
      hintState: state.hintState
    };

    try {
      sessionStorage.setItem(SESSION_STATE_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Failed to persist session state:', error);
    }
  }, [state, sessionTimer, config, isSessionEnded, stateRestored]);

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

  // Generate next problem
  const generateNextProblem = useCallback(() => {
    // Clear any previous generation error
    dispatch({ type: 'CLEAR_GENERATION_ERROR' });

    const problemNumber = state.problems.length + 1;
    const problem = generateProblem(config, problemNumber);

    try {
      // Pass config.methods to restrict method selection to user's chosen methods
      const solution = methodSelector.selectOptimalMethod(
        problem.num1,
        problem.num2,
        config.methods
      );
      // Generate hints for the problem (Issue #70)
      const hintResult = hintSystem.generateHints(solution, problem.num1, problem.num2);
      dispatch({ type: 'SET_PROBLEM', problem, solution, hintResult });
    } catch (error) {
      console.error('Failed to generate solution:', error);
      // Try again with new numbers
      const newProblem = generateProblem(config, problemNumber);
      try {
        const solution = methodSelector.selectOptimalMethod(
          newProblem.num1,
          newProblem.num2,
          config.methods
        );
        // Generate hints for the problem (Issue #70)
        const hintResult = hintSystem.generateHints(solution, newProblem.num1, newProblem.num2);
        dispatch({ type: 'SET_PROBLEM', problem: newProblem, solution, hintResult });
      } catch (retryError) {
        console.error('Failed to generate solution on retry:', retryError);
        // Issue #39: Show error state instead of infinite loading
        dispatch({ type: 'SET_GENERATION_ERROR' });
      }
    }
  }, [config, methodSelector, hintSystem, state.problems.length]);

  // Initialize first problem (only after config is loaded and state restoration is done)
  useEffect(() => {
    if (configLoaded && stateRestored && !state.currentProblem && !isSessionEnded) {
      generateNextProblem();
    }
  }, [configLoaded, stateRestored, state.currentProblem, isSessionEnded, generateNextProblem]);

  // Session timer - only runs during 'answering' phase
  // Pauses during feedback, reviewing, and paused phases (Issue #30)
  useEffect(() => {
    // Timer should only run when actively answering a problem
    const isTimerActive = state.phase === 'answering' && !isSessionEnded;

    if (!isTimerActive) return;

    const interval = setInterval(() => {
      setSessionTimer(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [state.phase, isSessionEnded]);

  // Problem elapsed time tracker
  // Uses interval callback (async) to update state, avoiding sync setState in effect
  useEffect(() => {
    if (state.phase !== 'answering' || isSessionEnded) {
      return;
    }

    // Start counting from the problem start time
    const startTime = state.currentProblemStartTime;

    const interval = setInterval(() => {
      setProblemElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [state.phase, state.currentProblemStartTime, isSessionEnded]);

  // Derive whether session should end - computed during render, no effect needed
  // The actual state update is handled in handleNext
  const shouldEndSession = config.problemCount !== 'infinite' &&
    state.problems.length >= config.problemCount;

  // Focus management: Return focus to input when entering 'answering' phase
  // This ensures keyboard navigation flows properly between phases
  useEffect(() => {
    if (state.phase === 'answering' && state.currentProblem && !isSessionEnded) {
      // Use a small delay to ensure the input is rendered and ready
      const timeoutId = setTimeout(() => {
        answerInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
    return undefined;
  }, [state.phase, state.currentProblem, isSessionEnded]);

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
  }, [isSessionEnded, shouldEndSession, state.problems, config]);

  // Handlers
  const handleSubmitAnswer = useCallback((answer: number) => {
    dispatch({ type: 'SUBMIT_ANSWER', answer });
  }, []);

  const handleSkip = useCallback(() => {
    dispatch({ type: 'SKIP_PROBLEM' });
  }, []);

  const handleRequestHint = useCallback(() => {
    // Calculate new hint state using the HintSystem (Issue #70)
    if (state.hintResult) {
      const newHintState = hintSystem.revealNextHint(state.hintState, state.hintResult);
      dispatch({ type: 'REQUEST_HINT', newHintState });
    }
  }, [hintSystem, state.hintResult, state.hintState]);

  const handleViewSolution = useCallback(() => {
    dispatch({ type: 'VIEW_SOLUTION' });
  }, []);

  const handleNext = useCallback(() => {
    if (
      config.problemCount !== 'infinite' &&
      state.problems.length >= config.problemCount
    ) {
      setIsSessionEnded(true);
    } else {
      dispatch({ type: 'NEXT_PROBLEM' });
      generateNextProblem();
    }
  }, [config.problemCount, state.problems.length, generateNextProblem]);

  const handleEndSession = useCallback(() => {
    setIsSessionEnded(true);
  }, []);

  const handleTogglePause = useCallback(() => {
    dispatch({ type: 'TOGGLE_PAUSE' });
  }, []);

  const handleCloseWalkthrough = useCallback(() => {
    dispatch({ type: 'NEXT_PROBLEM' });
  }, []);

  // Toggle shortcut help modal
  const handleToggleShortcutHelp = useCallback(() => {
    setShowShortcutHelp(prev => !prev);
  }, []);

  // Close shortcut help modal
  const handleCloseShortcutHelp = useCallback(() => {
    setShowShortcutHelp(false);
  }, []);

  // Screen reader announcement helper
  const announceToScreenReader = useCallback((message: string) => {
    if (announcementRef.current) {
      announcementRef.current.textContent = message;
    }
  }, []);

  // Keyboard shortcuts configuration
  // These are memoized to prevent unnecessary re-renders
  const keyboardShortcuts: ShortcutConfig[] = useMemo(() => {
    const shortcuts: ShortcutConfig[] = [
      // Navigation shortcuts
      {
        key: 'n',
        action: () => {
          if (state.phase === 'feedback' || state.phase === 'reviewing') {
            handleNext();
            announceToScreenReader('Moving to next problem');
          }
        },
        description: 'Next problem',
        category: 'navigation',
        enabled: state.phase === 'feedback' || state.phase === 'reviewing'
      },
      {
        key: 's',
        action: () => {
          if (state.phase === 'feedback') {
            handleViewSolution();
            announceToScreenReader('Viewing solution');
          }
        },
        description: 'View solution',
        category: 'navigation',
        enabled: state.phase === 'feedback'
      },

      // Input shortcuts
      {
        key: 'Escape',
        action: () => {
          if (showShortcutHelp) {
            handleCloseShortcutHelp();
            announceToScreenReader('Closed keyboard shortcuts help');
          } else if (state.phase === 'reviewing') {
            handleCloseWalkthrough();
            announceToScreenReader('Closed solution walkthrough');
          } else if (state.phase === 'paused') {
            dispatch({ type: 'RESUME_FROM_PAUSE' });
            announceToScreenReader('Session resumed');
          } else if (state.phase === 'answering') {
            handleSkip();
            announceToScreenReader('Problem skipped');
          }
        },
        description: 'Skip problem / Close modal',
        category: 'input',
        allowInInput: true,
        enabled: true
      },
      {
        key: 'h',
        action: () => {
          if (state.phase === 'answering') {
            handleRequestHint();
            announceToScreenReader('Hint requested');
          }
        },
        description: 'Request hint',
        category: 'input',
        enabled: state.phase === 'answering'
      },

      // Session shortcuts
      {
        key: ' ', // Space bar
        action: () => {
          if (state.phase !== 'reviewing' && !showShortcutHelp) {
            handleTogglePause();
            announceToScreenReader(state.phase === 'paused' ? 'Session resumed' : 'Session paused');
          }
        },
        description: 'Pause/Resume session',
        category: 'session',
        enabled: state.phase !== 'reviewing' && !showShortcutHelp
      },
      {
        key: 'q',
        action: () => {
          if (!showShortcutHelp) {
            handleEndSession();
            announceToScreenReader('Session ended');
          }
        },
        description: 'End session',
        category: 'session',
        enabled: !showShortcutHelp
      },
      {
        key: 'q',
        ctrl: true,
        action: () => {
          handleEndSession();
          announceToScreenReader('Session ended');
        },
        description: 'End session',
        category: 'session',
        enabled: true
      },
      {
        key: '?',
        action: () => {
          handleToggleShortcutHelp();
          announceToScreenReader(showShortcutHelp ? 'Closed keyboard shortcuts' : 'Opened keyboard shortcuts');
        },
        description: 'Show keyboard shortcuts',
        category: 'session',
        enabled: true
      }
    ];

    return shortcuts;
  }, [
    state.phase,
    showShortcutHelp,
    handleNext,
    handleViewSolution,
    handleCloseShortcutHelp,
    handleCloseWalkthrough,
    handleSkip,
    handleRequestHint,
    handleTogglePause,
    handleEndSession,
    handleToggleShortcutHelp,
    announceToScreenReader
  ]);

  // Initialize keyboard shortcuts hook
  const { getGroupedShortcuts } = useKeyboardShortcuts(keyboardShortcuts, {
    enabled: !isSessionEnded && !shouldEndSession
    // Note: Screen reader announcements are handled within individual shortcut actions
  });

  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Session ended - redirect to summary
  if (isSessionEnded || shouldEndSession) {
    // Store session data and redirect
    const statistics = calculateStatistics(state.problems);

    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Session Complete!
        </h1>
        <p className="text-muted-foreground mb-8">
          You completed {state.problems.length} problems with {statistics.accuracy.toFixed(1)}% accuracy.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/practice">
            <Button variant="primary" size="lg">
              Start New Session
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Show loading state while checking for config or if redirecting
  if (hasValidConfig === null || hasValidConfig === false) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12" role="status" aria-live="polite">
        <div className="animate-pulse" aria-hidden="true">
          <div className="h-8 bg-muted rounded w-48 mx-auto mb-4" />
          <div className="h-24 bg-muted rounded w-full max-w-md mx-auto" />
        </div>
        <p className="text-muted-foreground mt-4">
          {hasValidConfig === false ? 'Redirecting to configuration...' : 'Loading session...'}
        </p>
        <span className="sr-only">
          {hasValidConfig === false ? 'No configuration found, redirecting' : 'Loading session, please wait'}
        </span>
      </div>
    );
  }

  // Issue #39: Error state for failed problem generation
  if (state.generationError) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12" role="alert" aria-live="assertive">
        <div className="mb-6">
          <svg
            className="w-16 h-16 mx-auto text-destructive"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Problem Generation Failed
        </h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          We couldn&apos;t generate a suitable problem for your selected methods.
          This can happen with unusual method combinations.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="primary"
            onClick={generateNextProblem}
          >
            Try Again
          </Button>
          <Link href="/practice">
            <Button variant="secondary">
              Change Settings
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Loading state for problem generation
  if (!state.currentProblem || !state.currentSolution) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12" role="status" aria-live="polite">
        <div className="animate-pulse" aria-hidden="true">
          <div className="h-8 bg-muted rounded w-48 mx-auto mb-4" />
          <div className="h-24 bg-muted rounded w-full max-w-md mx-auto" />
        </div>
        <p className="text-muted-foreground mt-4">
          Generating problem...
        </p>
        <span className="sr-only">Loading next problem, please wait</span>
      </div>
    );
  }

  const currentAttempt = state.problems[state.problems.length - 1];
  const isCorrect = currentAttempt?.userAnswers[0] === currentAttempt?.correctAnswer;
  const problemNumber = state.problems.length + (state.phase === 'answering' ? 1 : 0);
  const totalProblems = config.problemCount === 'infinite' ? undefined : config.problemCount;

  return (
    <div className="max-w-4xl mx-auto space-y-6" role="main" aria-label="Practice session">
      {/* Breadcrumb (Issue #38) */}
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm">
          <li>
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
          </li>
          <li className="text-muted-foreground">/</li>
          <li>
            <Link
              href="/practice"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Practice
            </Link>
          </li>
          <li className="text-muted-foreground">/</li>
          <li className="text-foreground font-medium">Session</li>
        </ol>
      </nav>

      {/* Session Header with Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card rounded-lg shadow-md p-4">
        <div className="flex items-center gap-4">
          {/* Session Timer */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-mono">{formatTime(sessionTimer)}</span>
          </div>

          {/* Progress */}
          {totalProblems && (
            <div className="text-sm text-muted-foreground">
              {state.problems.length} / {totalProblems} completed
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Keyboard Shortcuts Help Button */}
          <button
            onClick={handleToggleShortcutHelp}
            className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            aria-label="Keyboard shortcuts"
            title="Keyboard shortcuts (?)"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* Pause Button */}
          <button
            onClick={handleTogglePause}
            className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            aria-label={state.phase === 'paused' ? 'Resume session (Space)' : 'Pause session (Space)'}
            title={state.phase === 'paused' ? 'Resume (Space)' : 'Pause (Space)'}
          >
            {state.phase === 'paused' ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>

          {/* End Session Button */}
          <button
            onClick={handleEndSession}
            className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="End session (Q)"
          >
            End Session
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {totalProblems && (
        <ProgressBar
          completed={state.problems.length}
          total={totalProblems}
          correct={state.problems.filter(p => !p.skipped && p.userAnswers[0] === p.correctAnswer).length}
          accuracy={state.problems.length > 0
            ? (state.problems.filter(p => !p.skipped && p.userAnswers[0] === p.correctAnswer).length / state.problems.length) * 100
            : 0}
          averageTime={state.problems.length > 0
            ? state.problems.reduce((sum, p) => sum + p.timeTaken, 0) / state.problems.length / 1000
            : undefined}
          showDetails={true}
        />
      )}

      {/* Paused Overlay */}
      {state.phase === 'paused' && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pause-dialog-title"
        >
          <div className="bg-card rounded-lg shadow-xl p-8 text-center">
            <h2 id="pause-dialog-title" className="text-2xl font-bold text-foreground mb-4">
              Session Paused
            </h2>
            <p className="text-muted-foreground mb-6">
              Take a break! Your progress is saved.
            </p>
            <button
              onClick={handleTogglePause}
              className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              autoFocus
            >
              Resume Session
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {state.phase === 'reviewing' && state.currentSolution ? (
        <SolutionWalkthrough
          problem={{
            num1: state.currentProblem.num1,
            num2: state.currentProblem.num2,
            answer: state.currentProblem.answer
          }}
          solution={state.currentSolution.optimal.solution}
          optimalCost={state.currentSolution.optimal.costScore}
          optimalQuality={state.currentSolution.optimal.qualityScore}
          alternatives={state.currentSolution.alternatives.map(alt => ({
            method: alt.method.name,
            solution: {
              method: alt.method.name,
              costScore: alt.costScore,
              steps: alt.solution.steps,
              whyNotOptimal: alt.whyNotOptimal
            },
            costScore: alt.costScore,
            qualityScore: alt.qualityScore
          }))}
          onClose={handleCloseWalkthrough}
        />
      ) : state.phase === 'feedback' && currentAttempt ? (
        <div className="space-y-6">
          {/* Show the problem for context */}
          <div className="text-center">
            <div className="text-3xl font-bold font-mono text-foreground">
              {state.currentProblem.num1} × {state.currentProblem.num2}
            </div>
          </div>

          <FeedbackDisplay
            isCorrect={isCorrect}
            userAnswer={currentAttempt.userAnswers[0] || 0}
            correctAnswer={currentAttempt.correctAnswer}
            timeTaken={Math.floor(currentAttempt.timeTaken / 1000)}
            onViewSolution={handleViewSolution}
            onNext={handleNext}
            autoFocus={true}
          />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Problem Display */}
          <ProblemDisplay
            problem={state.currentProblem}
            problemNumber={problemNumber}
            totalProblems={totalProblems}
            timeElapsed={problemElapsedTime}
            showMethodHint={state.hintsUsed > 0}
            optimalMethod={state.currentSolution.optimal.method.name}
            isActive={state.phase === 'answering'}
          />

          {/* Answer Input */}
          <AnswerInput
            ref={answerInputRef}
            onSubmit={handleSubmitAnswer}
            onSkip={handleSkip}
            onRequestHint={handleRequestHint}
            disabled={state.phase !== 'answering'}
            allowSkip={true}
            allowHints={state.hintState.hasMoreHints || state.hintState.currentLevel === HintLevel.None}
            hintsUsed={state.hintsUsed}
            showError={state.showError}
            autoFocus={true}
            resetKey={state.currentProblem?.id}
          />

          {/* Progressive Hints Display (Issue #70) */}
          {state.hintState.currentLevel > HintLevel.None && (
            <HintDisplay
              hintState={state.hintState}
              hintResult={state.hintResult}
              onRequestHint={handleRequestHint}
              disabled={state.phase !== 'answering'}
              compact={false}
            />
          )}

          {/* Keyboard shortcuts hint */}
          <div className="text-center text-sm text-muted-foreground">
            Press <KeyboardShortcut keys={['?']} size="sm" /> for keyboard shortcuts
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutHelp
        isOpen={showShortcutHelp}
        onClose={handleCloseShortcutHelp}
        shortcuts={getGroupedShortcuts()}
      />

      {/* Screen Reader Announcements */}
      <div
        ref={announcementRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    </div>
  );
}
