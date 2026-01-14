/**
 * SolutionWalkthrough component - Main container for step-by-step solution review.
 * @module components/features/practice/SolutionWalkthrough
 */

'use client';

import { memo, useState, useEffect, useRef } from 'react';
import type { Solution } from '@/lib/types/solution';
import type { MethodName } from '@/lib/types/method';
import { CalculationStep } from './CalculationStep';
import { MethodComparison } from './MethodComparison';

interface SolutionWalkthroughProps {
  /** The problem being solved (num1 × num2) */
  problem: {
    num1: number;
    num2: number;
    answer: number;
  };
  /** The optimal solution */
  solution: Solution;
  /** Cost score for optimal solution */
  optimalCost: number;
  /** Quality score for optimal solution */
  optimalQuality: number;
  /** Alternative solutions for comparison */
  alternatives?: Array<{
    method: MethodName;
    solution: {
      method: MethodName;
      costScore: number;
      steps: Solution['steps'];
      whyNotOptimal: string;
    };
    costScore: number;
    qualityScore: number;
  }>;
  /** Callback when walkthrough is closed */
  onClose?: () => void;
}

/**
 * Displays a complete step-by-step walkthrough of a solution with navigation controls,
 * method comparison, and optional auto-advance mode.
 * Wrapped in React.memo to prevent unnecessary re-renders when props haven't changed.
 */
export const SolutionWalkthrough = memo(function SolutionWalkthrough({
  problem,
  solution,
  optimalCost,
  optimalQuality,
  alternatives = [],
  onClose
}: SolutionWalkthroughProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showAllSteps, setShowAllSteps] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  // Refs for focus management
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalSteps = solution.steps.length;

  // Auto-focus the close button when the walkthrough opens for keyboard navigation
  useEffect(() => {
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, []);

  // Auto-advance functionality
  useEffect(() => {
    if (!autoAdvance || showAllSteps) return;

    const timer = setTimeout(() => {
      if (currentStepIndex < totalSteps - 1) {
        setCurrentStepIndex(prev => prev + 1);
      } else {
        setAutoAdvance(false);
      }
    }, 3000); // 3 seconds per step

    return () => clearTimeout(timer);
  }, [autoAdvance, currentStepIndex, totalSteps, showAllSteps]);

  const goToNextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const toggleShowAll = () => {
    setShowAllSteps(prev => !prev);
    if (autoAdvance) setAutoAdvance(false);
  };

  const toggleAutoAdvance = () => {
    setAutoAdvance(prev => !prev);
    if (showAllSteps) setShowAllSteps(false);
  };

  // Helper to get display name for method
  const getMethodDisplayName = (methodName: MethodName): string => {
    const displayNames: Record<MethodName, string> = {
      distributive: 'Distributive Property',
      'near-power-10': 'Near Powers of 10',
      'difference-squares': 'Difference of Squares',
      factorization: 'Factorization',
      squaring: 'Squaring',
      'near-100': 'Near 100',
      'sum-to-ten': 'Sum to Ten',
      'squaring-end-5': 'Squaring End in 5',
      'multiply-by-111': 'Multiply by 111',
      'near-squares': 'Near Squares'
    };
    return displayNames[methodName];
  };

  return (
    <div
      ref={containerRef}
      className="max-w-4xl mx-auto"
      role="region"
      aria-label="Solution walkthrough"
    >
      {/* Header */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Solution Walkthrough
            </h2>
            <div className="flex items-center gap-3 text-lg">
              <span className="font-mono font-semibold text-primary">
                {problem.num1}
              </span>
              <span className="text-accent">×</span>
              <span className="font-mono font-semibold text-primary">
                {problem.num2}
              </span>
              <span className="text-muted-foreground">=</span>
              <span className="font-mono font-semibold text-success">
                {problem.answer.toLocaleString()}
              </span>
            </div>
          </div>
          {onClose && (
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Close walkthrough (Press Escape or N for next problem)"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Method info */}
        <div className="bg-accent/10 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-semibold text-foreground">
              {getMethodDisplayName(solution.method)}
            </h3>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {solution.optimalReason}
          </p>
        </div>
      </div>

      {/* Navigation controls */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Step navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousStep}
              disabled={currentStepIndex === 0 || showAllSteps}
              className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </span>
            </button>

            <div className="px-4 py-2 bg-muted rounded-lg">
              <span className="text-sm font-medium text-foreground">
                {showAllSteps ? 'All Steps' : `Step ${currentStepIndex + 1} of ${totalSteps}`}
              </span>
            </div>

            <button
              onClick={goToNextStep}
              disabled={currentStepIndex === totalSteps - 1 || showAllSteps}
              className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <span className="flex items-center gap-2">
                Next
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          </div>

          {/* View controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleShowAll}
              className={`px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${
                showAllSteps
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {showAllSteps ? 'Step by Step' : 'Show All'}
            </button>

            <button
              onClick={toggleAutoAdvance}
              disabled={showAllSteps}
              className={`px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed ${
                autoAdvance
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <span className="flex items-center gap-2">
                {autoAdvance ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Pause
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Auto
                  </>
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {!showAllSteps && (
          <div className="mt-4">
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Steps display */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Calculation Steps
        </h3>

        {showAllSteps ? (
          // Show all steps
          <div className="space-y-2">
            {solution.steps.map((step, index) => (
              <CalculationStep
                key={index}
                step={step}
                stepNumber={index + 1}
                autoExpand={true}
              />
            ))}
          </div>
        ) : (
          // Show current step only
          <div>
            {solution.steps[currentStepIndex] && (
              <CalculationStep
                step={solution.steps[currentStepIndex]}
                stepNumber={currentStepIndex + 1}
                isActive={true}
                autoExpand={false}
              />
            )}
          </div>
        )}
      </div>

      {/* Method comparison toggle */}
      {alternatives.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="w-full px-6 py-4 bg-card border border-border rounded-lg hover:bg-muted/30 transition-colors focus:outline-none focus:ring-2 focus:ring-accent flex items-center justify-between"
          >
            <span className="text-lg font-semibold text-foreground">
              Compare with Alternative Methods
            </span>
            <svg
              className={`w-6 h-6 text-muted-foreground transition-transform duration-200 ${
                showComparison ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showComparison && (
            <div className="mt-4 bg-card border border-border rounded-lg p-6">
              <MethodComparison
                optimalSolution={solution}
                optimalCost={optimalCost}
                optimalQuality={optimalQuality}
                alternatives={alternatives}
              />
            </div>
          )}
        </div>
      )}

      {/* Validation status */}
      {solution.validated && (
        <div className="bg-success/10 border border-success rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-success">
              This solution has been mathematically validated
            </span>
          </div>
        </div>
      )}

      {!solution.validated && solution.validationErrors.length > 0 && (
        <div className="bg-error/10 border border-error rounded-lg p-4">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-error mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-error mb-1">
                Validation errors detected:
              </p>
              <ul className="text-sm text-error/80 list-disc list-inside">
                {solution.validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
