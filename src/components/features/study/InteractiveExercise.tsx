/**
 * InteractiveExercise component - Practice problem within study mode.
 * @module components/features/study/InteractiveExercise
 */

'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  FormEvent,
  KeyboardEvent
} from 'react';
import type { InteractiveExercise as InteractiveExerciseType } from '@/lib/types/method';
import type { Solution } from '@/lib/types/solution';
import { MathExpression } from '../practice/MathExpression';
import { CalculationStep } from '../practice/CalculationStep';
import { HintDisplay } from './HintDisplay';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface InteractiveExerciseProps {
  /** The exercise configuration */
  exercise: InteractiveExerciseType;
  /** The complete solution to reveal when needed */
  solution: Solution;
  /** Callback when exercise is completed (correct answer) */
  onComplete?: (hintsUsed: number, attempts: number) => void;
  /** Callback when exercise is skipped */
  onSkip?: () => void;
  /** Optional exercise number for display */
  exerciseNumber?: number;
  /** Difficulty label */
  difficulty?: 'easy' | 'medium' | 'hard';
  /** Optional custom class name */
  className?: string;
}

type ExerciseState = 'active' | 'correct' | 'incorrect' | 'revealed';

/**
 * Interactive exercise component with:
 * - Problem display
 * - Answer input
 * - Progressive hint system
 * - Feedback on correct/incorrect
 * - Solution reveal option
 */
export function InteractiveExercise({
  exercise,
  solution,
  onComplete,
  onSkip,
  exerciseNumber,
  difficulty,
  className = ''
}: InteractiveExerciseProps) {
  const [state, setState] = useState<ExerciseState>('active');
  const [inputValue, setInputValue] = useState('');
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showError, setShowError] = useState(false);
  const [showSolutionSteps, setShowSolutionSteps] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const { num1, num2, hints } = exercise;
  const correctAnswer = num1 * num2;

  // Focus input on mount and state changes
  useEffect(() => {
    if (state === 'active' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [state]);

  // Handle shake animation reset
  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => setShowError(false), 500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [showError]);

  // Handle input change - only allow valid integers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || value === '-' || /^-?\d+$/.test(value)) {
      setInputValue(value);
    }
  };

  // Handle answer submission
  const handleSubmit = useCallback((e?: FormEvent) => {
    if (e) e.preventDefault();

    if (inputValue === '' || inputValue === '-') {
      return;
    }

    const userAnswer = parseInt(inputValue, 10);
    if (isNaN(userAnswer)) {
      return;
    }

    setAttempts(prev => prev + 1);

    if (userAnswer === correctAnswer) {
      setState('correct');
      if (onComplete) {
        onComplete(hintsRevealed, attempts + 1);
      }
    } else {
      setState('incorrect');
      setShowError(true);
      // Auto-reset after showing error feedback
      setTimeout(() => {
        setState('active');
        setInputValue('');
        inputRef.current?.focus();
      }, 1500);
    }
  }, [inputValue, correctAnswer, hintsRevealed, attempts, onComplete]);

  // Handle keyboard input
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  // Reveal next hint
  const handleRevealHint = useCallback(() => {
    if (hintsRevealed < hints.length) {
      setHintsRevealed(prev => prev + 1);
    }
  }, [hintsRevealed, hints.length]);

  // Reveal complete solution
  const handleRevealSolution = useCallback(() => {
    setState('revealed');
    setShowSolutionSteps(true);
  }, []);

  // Try again after solution reveal
  const handleTryAgain = useCallback(() => {
    setState('active');
    setInputValue('');
    setShowSolutionSteps(false);
    inputRef.current?.focus();
  }, []);

  // Clear input
  const handleClear = useCallback(() => {
    setInputValue('');
    inputRef.current?.focus();
  }, []);

  // Difficulty badge color
  const difficultyColors = {
    easy: 'bg-green-500/20 text-green-400 border-green-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    hard: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  const isActive = state === 'active';
  const isCorrect = state === 'correct';
  const isIncorrect = state === 'incorrect';
  const isRevealed = state === 'revealed';
  const allHintsRevealed = hintsRevealed >= hints.length;

  return (
    <Card
      variant="elevated"
      className={`overflow-hidden ${className}`}
    >
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {exerciseNumber !== undefined && (
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Exercise {exerciseNumber}
              </span>
            )}
            {difficulty && (
              <span
                className={`rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${difficultyColors[difficulty]}`}
              >
                {difficulty}
              </span>
            )}
          </div>

          {/* Attempt counter */}
          {attempts > 0 && (
            <span className="text-xs text-muted-foreground">
              Attempts: {attempts}
            </span>
          )}
        </div>

        {/* Problem Statement */}
        <div className="mt-4 flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">Calculate:</p>
          <MathExpression
            expression={`${num1} × ${num2}`}
            className="text-3xl font-bold"
            highlighted={false}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Answer Input Section */}
        {(isActive || isIncorrect) && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={isIncorrect}
                placeholder="Your answer"
                aria-label="Your answer"
                className={`
                  w-full rounded-xl border-2 bg-gray-800/50 px-6 py-6 text-center font-mono text-4xl font-bold text-gray-100 placeholder-gray-600 backdrop-blur-sm transition-all duration-200
                  focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20
                  disabled:cursor-not-allowed disabled:opacity-50
                  ${showError
                    ? 'animate-shake border-red-500 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-gray-700 hover:border-gray-600'
                  }
                `}
              />

              {/* Clear button */}
              {inputValue !== '' && !isIncorrect && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  aria-label="Clear input"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={inputValue === '' || inputValue === '-' || isIncorrect}
                className="col-span-2"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Check Answer
              </Button>
            </div>

            {/* Keyboard hint */}
            <p className="text-center text-sm text-gray-500">
              Press <kbd className="rounded bg-gray-700 px-2 py-1 font-mono text-xs">Enter</kbd> to submit
            </p>
          </form>
        )}

        {/* Incorrect Feedback */}
        {isIncorrect && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-red-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="font-semibold">Not quite right. Try again!</span>
            </div>
          </div>
        )}

        {/* Correct Feedback */}
        {isCorrect && (
          <div className="space-y-4">
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <svg className="h-8 w-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-lg font-bold text-green-400">Correct!</span>
                <span className="font-mono text-2xl font-bold text-foreground">
                  {correctAnswer.toLocaleString()}
                </span>
                <div className="mt-2 text-sm text-muted-foreground">
                  {hintsRevealed === 0 && attempts === 1 && (
                    <span>Perfect! No hints needed.</span>
                  )}
                  {hintsRevealed > 0 && (
                    <span>Hints used: {hintsRevealed}</span>
                  )}
                  {attempts > 1 && (
                    <span className="ml-2">Attempts: {attempts}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Show solution breakdown button */}
            <button
              onClick={() => setShowSolutionSteps(!showSolutionSteps)}
              className="w-full rounded-lg border-2 border-dashed border-border bg-card px-4 py-3 text-sm font-medium transition-all duration-200 hover:border-accent/50 hover:bg-accent/5 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
            >
              {showSolutionSteps ? 'Hide Solution Steps' : 'View Solution Steps'}
            </button>
          </div>
        )}

        {/* Revealed State */}
        {isRevealed && (
          <div className="space-y-4">
            <div className="rounded-lg border border-accent/30 bg-accent/10 p-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <span className="text-sm text-muted-foreground">The answer is:</span>
                <span className="font-mono text-3xl font-bold text-accent">
                  {correctAnswer.toLocaleString()}
                </span>
              </div>
            </div>

            <Button
              onClick={handleTryAgain}
              variant="outline"
              size="lg"
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Solution Steps */}
        {showSolutionSteps && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Solution Steps
            </h4>
            {solution.steps.map((step, index) => (
              <CalculationStep
                key={index}
                step={step}
                stepNumber={index + 1}
                autoExpand={true}
              />
            ))}
          </div>
        )}

        {/* Hints Section - only show when active */}
        {isActive && hints.length > 0 && (
          <HintDisplay
            hints={hints}
            revealedCount={hintsRevealed}
            onRevealNext={handleRevealHint}
            allRevealed={allHintsRevealed}
          />
        )}

        {/* Bottom Actions */}
        {isActive && (
          <div className="flex gap-3 pt-2">
            {/* Show Solution Button - only after using hints or multiple attempts */}
            {(hintsRevealed >= 2 || attempts >= 3) && (
              <Button
                onClick={handleRevealSolution}
                variant="ghost"
                size="md"
                className="flex-1"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Reveal Solution
              </Button>
            )}

            {/* Skip Button */}
            {onSkip && (
              <Button
                onClick={onSkip}
                variant="ghost"
                size="md"
                className="flex-1"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Skip
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
