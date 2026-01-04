'use client';

/**
 * Active Practice Session Page
 * Handles the main practice loop: problem display, answer input, feedback, and navigation.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProblemDisplay } from '@/components/features/practice/ProblemDisplay';
import { AnswerInput, type AnswerInputHandle } from '@/components/features/practice/AnswerInput';
import { FeedbackDisplay } from '@/components/features/practice/FeedbackDisplay';
import { SolutionWalkthrough } from '@/components/features/practice/SolutionWalkthrough';
import { ProgressBar } from '@/components/features/practice/ProgressBar';
import { KeyboardShortcutHelp, KeyboardShortcut } from '@/components/ui';
import type { Problem } from '@/lib/types/problem';
import type { SessionConfig } from '@/lib/types/session';
import { MethodSelector } from '@/lib/core/methods/method-selector';
import { generateMethodAwareProblem } from '@/lib/core/problem-generator';
import { saveSession } from '@/lib/storage/statistics-store';
import { recordProblemsCompleted } from '@/lib/storage/goals-store';

// Import extracted hooks and utilities
import {
  useSessionState,
  useSessionTimer,
  useSessionPersistence,
  useSessionKeyboard
} from './hooks';
import { calculateStatistics } from './utils';

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

// ============================================================================
// Main Component
// ============================================================================

export default function ActiveSessionPage() {
  const [methodSelector] = useState(() => new MethodSelector());

  // Keyboard shortcuts help modal state
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);

  // Answer input ref for focus management
  const answerInputRef = useRef<AnswerInputHandle>(null);

  // Use extracted state management hook
  const {
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
  } = useSessionState();

  // Use extracted timer hook
  const {
    sessionTimer,
    setSessionTimer,
    problemElapsedTime,
    formatTime
  } = useSessionTimer({
    phase: state.phase,
    currentProblemStartTime: state.currentProblemStartTime,
    isSessionEnded
  });

  // Use extracted persistence hook
  const {
    config,
    configLoaded,
    stateRestored,
    hasValidConfig
  } = useSessionPersistence({
    state,
    dispatch,
    sessionTimer,
    setSessionTimer,
    isSessionEnded,
    sessionSavedRef,
    sessionStartTimeRef
  });

  // Calculate whether session should end based on problem count
  const shouldEndSession = config.problemCount !== 'infinite' &&
    state.problems.length >= config.problemCount;

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
      dispatch({ type: 'SET_PROBLEM', problem, solution });
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
        dispatch({ type: 'SET_PROBLEM', problem: newProblem, solution });
      } catch (retryError) {
        console.error('Failed to generate solution on retry:', retryError);
        // Issue #39: Show error state instead of infinite loading
        dispatch({ type: 'SET_GENERATION_ERROR' });
      }
    }
  }, [config, methodSelector, state.problems.length, dispatch]);

  // Initialize first problem (only after config is loaded and state restoration is done)
  useEffect(() => {
    if (configLoaded && stateRestored && !state.currentProblem && !isSessionEnded) {
      generateNextProblem();
    }
  }, [configLoaded, stateRestored, state.currentProblem, isSessionEnded, generateNextProblem]);

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

  // Record completed problems for daily goals when session ends
  useEffect(() => {
    if ((isSessionEnded || shouldEndSession) && !sessionSavedRef.current && state.problems.length > 0) {
      // Record completed problems for daily goals
      recordProblemsCompleted(state.problems.length).catch(err => {
        console.error('Failed to record daily goal progress:', err);
      });
    }
  }, [isSessionEnded, shouldEndSession, state.problems.length]);

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
  }, [config.problemCount, state.problems.length, generateNextProblem, setIsSessionEnded, dispatch]);

  // Toggle shortcut help modal
  const handleToggleShortcutHelp = useCallback(() => {
    setShowShortcutHelp(prev => !prev);
  }, []);

  // Close shortcut help modal
  const handleCloseShortcutHelp = useCallback(() => {
    setShowShortcutHelp(false);
  }, []);

  // Use extracted keyboard shortcuts hook
  const {
    getGroupedShortcuts,
    announcementRef
  } = useSessionKeyboard({
    phase: state.phase,
    isSessionEnded,
    shouldEndSession: shouldEndSession,
    showShortcutHelp,
    onNext: handleNext,
    onViewSolution: handleViewSolution,
    onCloseShortcutHelp: handleCloseShortcutHelp,
    onCloseWalkthrough: handleCloseWalkthrough,
    onSkip: handleSkip,
    onRequestHint: handleRequestHint,
    onTogglePause: handleTogglePause,
    onEndSession: handleEndSession,
    onToggleShortcutHelp: handleToggleShortcutHelp,
    dispatch
  });

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
              {state.currentProblem.num1} x {state.currentProblem.num2}
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
            allowHints={true}
            hintsUsed={state.hintsUsed}
            showError={state.showError}
            autoFocus={true}
            resetKey={state.currentProblem?.id}
          />

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
