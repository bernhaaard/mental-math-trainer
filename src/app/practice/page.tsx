'use client';

/**
 * Practice Mode Entry Point
 * Manages the entire practice session lifecycle:
 * 1. Configuration (SessionConfig)
 * 2. Active practice (redirects to session/page)
 * 3. Session summary and statistics
 */

import { useReducer, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type {
  SessionConfig as SessionConfigType,
  ProblemAttempt,
  SessionStatistics
} from '@/lib/types/session';
import type { MethodName } from '@/lib/types/method';
import { SessionConfig } from '@/components/features/practice/SessionConfig';
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

export default function PracticePage() {
  const router = useRouter();
  const [state, dispatch] = useReducer(sessionReducer, initialState);

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

    return {
      totalProblems: problems.length,
      correctAnswers,
      accuracy,
      averageTime,
      averageError,
      methodBreakdown
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
    return <SessionConfig onStartSession={handleStartSession} />;
  }

  // Active session - should have been redirected to /practice/session
  // If we get here, redirect
  router.push('/practice/session');

  return (
    <div className="max-w-4xl mx-auto text-center py-12">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto mb-4" />
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded w-full max-w-md mx-auto" />
      </div>
      <p className="text-gray-500 dark:text-gray-400 mt-4">
        Loading session...
      </p>
    </div>
  );
}
