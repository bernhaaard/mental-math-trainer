'use client';

/**
 * Active Practice Session Page
 * Handles the main practice loop: problem display, answer input, feedback, and navigation.
 */

import { useState, useEffect, useCallback, useReducer, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ProblemDisplay } from '@/components/features/practice/ProblemDisplay';
import { AnswerInput } from '@/components/features/practice/AnswerInput';
import { FeedbackDisplay } from '@/components/features/practice/FeedbackDisplay';
import { SolutionWalkthrough } from '@/components/features/practice/SolutionWalkthrough';
import { ProgressBar } from '@/components/features/practice/ProgressBar';
import { KeyboardShortcutHelp, KeyboardShortcut } from '@/components/ui';
import { useKeyboardShortcuts, type ShortcutConfig } from '@/lib/hooks/useKeyboardShortcuts';
import type { Problem, CustomRange } from '@/lib/types/problem';
import { DifficultyLevel } from '@/lib/types/problem';
import type { SessionConfig, ProblemAttempt, SessionStatistics, MethodStats } from '@/lib/types/session';
import { MethodName } from '@/lib/types/method';
import { MethodSelector, type MethodRanking } from '@/lib/core/methods/method-selector';

// ============================================================================
// Types and State Management
// ============================================================================

type SessionPhase = 'answering' | 'feedback' | 'reviewing' | 'paused';

interface ActiveSessionState {
  phase: SessionPhase;
  currentProblem: Problem | null;
  currentSolution: MethodRanking | null;
  problems: ProblemAttempt[];
  currentProblemStartTime: number;
  hintsUsed: number;
  showError: boolean;
}

type SessionAction =
  | { type: 'SET_PROBLEM'; problem: Problem; solution: MethodRanking }
  | { type: 'SUBMIT_ANSWER'; answer: number }
  | { type: 'SKIP_PROBLEM' }
  | { type: 'REQUEST_HINT' }
  | { type: 'VIEW_SOLUTION' }
  | { type: 'NEXT_PROBLEM' }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'SHOW_ERROR' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESUME_FROM_PAUSE' };

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
      return {
        ...state,
        phase: state.phase === 'paused' ? 'answering' : 'paused'
      };

    case 'RESUME_FROM_PAUSE':
      return {
        ...state,
        phase: 'answering'
      };

    case 'SHOW_ERROR':
      return { ...state, showError: true };

    case 'CLEAR_ERROR':
      return { ...state, showError: false };

    default:
      return state;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateProblem(config: SessionConfig, problemNumber: number): Problem {
  let num1: number;
  let num2: number;
  let difficulty: DifficultyLevel;

  if (typeof config.difficulty === 'string') {
    // Predefined difficulty level
    difficulty = config.difficulty;
    const ranges: Record<DifficultyLevel, { min: number; max: number }> = {
      [DifficultyLevel.Beginner]: { min: 2, max: 100 },
      [DifficultyLevel.Intermediate]: { min: 20, max: 400 },
      [DifficultyLevel.Advanced]: { min: 100, max: 1000 },
      [DifficultyLevel.Expert]: { min: 500, max: 10000 },
      [DifficultyLevel.Mastery]: { min: 1000, max: 1000000 }
    };
    const range = ranges[difficulty];
    num1 = generateRandomNumber(range.min, range.max);
    num2 = generateRandomNumber(range.min, range.max);
  } else {
    // Custom range
    const customRange = config.difficulty as CustomRange;
    difficulty = DifficultyLevel.Advanced; // Default for custom
    num1 = generateRandomNumber(customRange.num1Min, customRange.num1Max);
    num2 = generateRandomNumber(customRange.num2Min, customRange.num2Max);

    if (config.allowNegatives) {
      // Randomly make numbers negative
      if (Math.random() < 0.3) num1 = -num1;
      if (Math.random() < 0.3) num2 = -num2;
    }
  }

  return {
    id: `problem-${problemNumber}-${Date.now()}`,
    num1,
    num2,
    answer: num1 * num2,
    difficulty,
    generatedAt: new Date()
  };
}

function calculateStatistics(problems: ProblemAttempt[]): SessionStatistics {
  if (problems.length === 0) {
    return {
      totalProblems: 0,
      correctAnswers: 0,
      accuracy: 0,
      averageTime: 0,
      averageError: 0,
      methodBreakdown: {}
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
    methodBreakdown
  };
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
  // Config is loaded synchronously via lazy initialization, so we can start as true
  // This flag is used to ensure we don't generate problems before hydration
  const [configLoaded, setConfigLoaded] = useState(typeof window !== 'undefined');

  // Keyboard shortcuts help modal state
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);

  // Screen reader announcement ref
  const announcementRef = useRef<HTMLDivElement>(null);

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

  const [state, dispatch] = useReducer(sessionReducer, undefined, () => ({
    phase: 'answering' as SessionPhase,
    currentProblem: null,
    currentSolution: null,
    problems: [],
    currentProblemStartTime: Date.now(),
    hintsUsed: 0,
    showError: false
  }));

  const [sessionTimer, setSessionTimer] = useState(0);
  const [problemElapsedTime, setProblemElapsedTime] = useState(0);
  const [isSessionEnded, setIsSessionEnded] = useState(false);

  // Generate next problem
  const generateNextProblem = useCallback(() => {
    const problemNumber = state.problems.length + 1;
    const problem = generateProblem(config, problemNumber);

    try {
      const solution = methodSelector.selectOptimalMethod(problem.num1, problem.num2);
      dispatch({ type: 'SET_PROBLEM', problem, solution });
    } catch (error) {
      console.error('Failed to generate solution:', error);
      // Try again with new numbers
      const newProblem = generateProblem(config, problemNumber);
      try {
        const solution = methodSelector.selectOptimalMethod(newProblem.num1, newProblem.num2);
        dispatch({ type: 'SET_PROBLEM', problem: newProblem, solution });
      } catch (retryError) {
        console.error('Failed to generate solution on retry:', retryError);
      }
    }
  }, [config, methodSelector, state.problems.length]);

  // Initialize first problem (only after config is loaded)
  useEffect(() => {
    if (configLoaded && !state.currentProblem && !isSessionEnded) {
      generateNextProblem();
    }
  }, [configLoaded, state.currentProblem, isSessionEnded, generateNextProblem]);

  // Session timer
  useEffect(() => {
    if (state.phase === 'paused' || isSessionEnded) return;

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

  // Format time
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Session Complete!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          You completed {state.problems.length} problems with {statistics.accuracy.toFixed(1)}% accuracy.
        </p>
        <div className="space-x-4">
          <button
            onClick={() => router.push('/practice')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Start New Session
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium rounded-lg transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (!state.currentProblem || !state.currentSolution) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12" role="status" aria-live="polite">
        <div className="animate-pulse" aria-hidden="true">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto mb-4" />
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded w-full max-w-md mx-auto" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 mt-4">
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
      {/* Session Header with Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="flex items-center gap-4">
          {/* Session Timer */}
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-mono">{formatTime(sessionTimer)}</span>
          </div>

          {/* Progress */}
          {totalProblems && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {state.problems.length} / {totalProblems} completed
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Keyboard Shortcuts Help Button */}
          <button
            onClick={handleToggleShortcutHelp}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
            <h2 id="pause-dialog-title" className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Session Paused
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Take a break! Your progress is saved.
            </p>
            <button
              onClick={handleTogglePause}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
            <div className="text-3xl font-bold font-mono text-gray-900 dark:text-gray-100">
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
            onSubmit={handleSubmitAnswer}
            onSkip={handleSkip}
            onRequestHint={handleRequestHint}
            disabled={state.phase !== 'answering'}
            allowSkip={true}
            allowHints={true}
            hintsUsed={state.hintsUsed}
            showError={state.showError}
            autoFocus={true}
          />

          {/* Keyboard shortcuts hint */}
          <div className="text-center text-sm text-gray-400 dark:text-gray-500">
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
