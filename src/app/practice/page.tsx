'use client';

/**
 * Practice Mode Entry Point
 * Manages the entire practice session lifecycle:
 * 1. Configuration (SessionConfig)
 * 2. Active practice (redirects to session/page)
 * 3. Session summary and statistics
 */

import { useReducer, useCallback, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type {
  SessionConfig as SessionConfigType,
  ProblemAttempt,
  SessionStatistics
} from '@/lib/types/session';
import { MethodName } from '@/lib/types/method';
import { DifficultyLevel } from '@/lib/types/problem';
import { SessionConfig, type InitialConfigValues } from '@/components/features/practice/SessionConfig';
import { SessionSummary } from '@/components/features/practice/SessionSummary';

// Session state machine
type SessionStatus = 'configuring' | 'active' | 'reviewing' | 'complete';

interface SessionState {
  status: SessionStatus;
  config: SessionConfigType | null;
  currentProblemIndex: number;
  problems: ProblemAttempt[];
  startTime: Date | null;
}

type SessionAction =
  | { type: 'START_SESSION'; config: SessionConfigType }
  | { type: 'COMPLETE_PROBLEM'; attempt: ProblemAttempt }
  | { type: 'END_SESSION' }
  | { type: 'RESET_SESSION' };

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'START_SESSION':
      return {
        ...state,
        status: 'active',
        config: action.config,
        currentProblemIndex: 0,
        problems: [],
        startTime: new Date()
      };

    case 'COMPLETE_PROBLEM':
      const newProblems = [...state.problems, action.attempt];
      const shouldEnd =
        state.config?.problemCount !== 'infinite' &&
        newProblems.length >= (state.config?.problemCount || 0);

      return {
        ...state,
        problems: newProblems,
        currentProblemIndex: state.currentProblemIndex + 1,
        status: shouldEnd ? 'complete' : 'active'
      };

    case 'END_SESSION':
      return {
        ...state,
        status: 'complete'
      };

    case 'RESET_SESSION':
      return {
        status: 'configuring',
        config: null,
        currentProblemIndex: 0,
        problems: [],
        startTime: null
      };

    default:
      return state;
  }
}

const initialState: SessionState = {
  status: 'configuring',
  config: null,
  currentProblemIndex: 0,
  problems: [],
  startTime: null
};

/**
 * Valid difficulty level values for URL parameter parsing.
 */
const VALID_DIFFICULTY_VALUES: Record<string, DifficultyLevel> = {
  beginner: DifficultyLevel.Beginner,
  intermediate: DifficultyLevel.Intermediate,
  advanced: DifficultyLevel.Advanced,
  expert: DifficultyLevel.Expert,
  mastery: DifficultyLevel.Mastery
};

/**
 * Valid method name values for URL parameter parsing.
 */
const VALID_METHOD_VALUES: Record<string, MethodName> = {
  distributive: MethodName.Distributive,
  'near-power-10': MethodName.NearPower10,
  'difference-squares': MethodName.DifferenceSquares,
  factorization: MethodName.Factorization,
  squaring: MethodName.Squaring,
  'near-100': MethodName.Near100
};

/**
 * Parses URL query parameters into initial configuration values.
 * Returns undefined for invalid or missing parameters.
 */
function parseUrlParams(searchParams: URLSearchParams): InitialConfigValues {
  const result: InitialConfigValues = {};

  // Parse difficulty parameter
  const difficultyParam = searchParams.get('difficulty');
  if (difficultyParam) {
    const normalizedDifficulty = difficultyParam.toLowerCase();
    if (normalizedDifficulty in VALID_DIFFICULTY_VALUES) {
      result.difficulty = VALID_DIFFICULTY_VALUES[normalizedDifficulty];
    }
  }

  // Parse methods parameter (comma-separated list)
  // Also support 'method' (singular) as an alias for study page links
  const methodsParam = searchParams.get('methods') || searchParams.get('method');
  if (methodsParam) {
    const methodNames = methodsParam.split(',').map(m => m.trim().toLowerCase());
    const validMethods: MethodName[] = [];

    for (const methodName of methodNames) {
      const method = VALID_METHOD_VALUES[methodName];
      if (method !== undefined) {
        validMethods.push(method);
      }
    }

    if (validMethods.length > 0) {
      result.methods = validMethods;
    }
  }

  // Parse problem count parameter
  const countParam = searchParams.get('count');
  if (countParam) {
    if (countParam.toLowerCase() === 'infinite') {
      result.problemCount = 'infinite';
    } else {
      const count = parseInt(countParam, 10);
      // Validate count is a positive number within reasonable bounds
      if (!isNaN(count) && count > 0 && count <= 1000) {
        result.problemCount = count;
      }
    }
  }

  // Parse allow negatives parameter
  const negativesParam = searchParams.get('negatives');
  if (negativesParam) {
    const normalizedValue = negativesParam.toLowerCase();
    if (normalizedValue === 'true' || normalizedValue === '1') {
      result.allowNegatives = true;
    } else if (normalizedValue === 'false' || normalizedValue === '0') {
      result.allowNegatives = false;
    }
  }

  return result;
}

/**
 * Inner component that uses useSearchParams.
 * Wrapped in Suspense by the parent component.
 */
function PracticePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  // Parse URL parameters into initial configuration values
  const initialConfigValues = useMemo(() => {
    return parseUrlParams(searchParams);
  }, [searchParams]);

  // Handle redirect when session becomes active
  // Using useEffect to avoid calling router.push during render
  useEffect(() => {
    if (state.status === 'active') {
      router.push('/practice/session');
    }
  }, [state.status, router]);

  // Start session and redirect to active session page
  const handleStartSession = useCallback((config: SessionConfigType) => {
    dispatch({ type: 'START_SESSION', config });
    // Store config in sessionStorage for the session page to use
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('practiceSessionConfig', JSON.stringify(config));
    }
    router.push('/practice/session');
  }, [router]);

  const handlePracticeAgain = useCallback(() => {
    dispatch({ type: 'RESET_SESSION' });
  }, []);

  // Calculate statistics when session is complete
  const calculateStatistics = (): SessionStatistics => {
    const { problems } = state;

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

    // Calculate method breakdown
    interface MethodBreakdownStats {
      method: MethodName;
      problemsSolved: number;
      correctAnswers: number;
      accuracy: number;
      averageTime: number;
      totalTime?: number; // Internal tracking field, optional
    }
    const methodBreakdown: Partial<Record<MethodName, MethodBreakdownStats>> = {};

    problems.forEach(problem => {
      const method = problem.solution.method;
      if (!methodBreakdown[method]) {
        methodBreakdown[method] = {
          method,
          problemsSolved: 0,
          correctAnswers: 0,
          accuracy: 0,
          averageTime: 0,
          totalTime: 0
        };
      }

      const stats = methodBreakdown[method]!;
      stats.problemsSolved++;
      stats.totalTime = (stats.totalTime ?? 0) + problem.timeTaken;

      if (!problem.skipped && problem.userAnswers[0] === problem.correctAnswer) {
        stats.correctAnswers++;
      }
    });

    // Calculate averages for each method
    Object.values(methodBreakdown).forEach(stats => {
      if (stats) {
        stats.accuracy = (stats.correctAnswers / stats.problemsSolved) * 100;
        stats.averageTime = (stats.totalTime ?? 0) / stats.problemsSolved;
        delete stats.totalTime; // Remove temporary field
      }
    });

    // Calculate hint statistics (Issue #70)
    const totalHintsUsed = problems.reduce((sum, p) => sum + p.hintsUsed, 0);
    const problemsWithHints = problems.filter(p => p.hintsUsed > 0).length;
    const averageHintsPerProblem = problems.length > 0
      ? totalHintsUsed / problems.length
      : 0;

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
  };

  // Render based on session status
  if (state.status === 'complete') {
    const statistics = calculateStatistics();

    return (
      <SessionSummary
        statistics={statistics}
        problems={state.problems}
        onPracticeAgain={handlePracticeAgain}
      />
    );
  }

  if (state.status === 'configuring') {
    return (
      <SessionConfig
        onStartSession={handleStartSession}
        initialValues={initialConfigValues}
      />
    );
  }

  // Active session - useEffect above handles the redirect to /practice/session
  // Show loading state while redirect is in progress
  return (
    <div className="max-w-4xl mx-auto text-center py-12">
      <div className="animate-pulse">
        <div className="h-8 bg-muted rounded w-48 mx-auto mb-4" />
        <div className="h-24 bg-muted rounded w-full max-w-md mx-auto" />
      </div>
      <p className="text-muted-foreground mt-4">
        Loading session...
      </p>
    </div>
  );
}

/**
 * Loading fallback for Suspense boundary.
 */
function PracticePageLoading() {
  return (
    <div className="max-w-4xl mx-auto text-center py-12">
      <div className="animate-pulse">
        <div className="h-8 bg-muted rounded w-48 mx-auto mb-4" />
        <div className="h-24 bg-muted rounded w-full max-w-md mx-auto" />
      </div>
      <p className="text-muted-foreground mt-4">
        Loading...
      </p>
    </div>
  );
}

/**
 * Main Practice Page Component.
 * Wraps the content in Suspense to handle useSearchParams properly.
 *
 * Supported URL Parameters:
 * - difficulty: beginner | intermediate | advanced | expert | mastery
 * - methods: comma-separated list (e.g., distributive,squaring,near-100)
 * - method: single method (alias for methods, used by study page links)
 * - count: number (1-1000) or 'infinite'
 * - negatives: true | false
 *
 * Examples:
 * - /practice?difficulty=intermediate&methods=squaring,distributive&count=15
 * - /practice?method=distributive (from study page link)
 */
export default function PracticePage() {
  return (
    <Suspense fallback={<PracticePageLoading />}>
      <PracticePageContent />
    </Suspense>
  );
}
