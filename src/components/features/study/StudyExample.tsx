/**
 * StudyExample component - Displays a worked example problem with step-by-step solution.
 * @module components/features/study/StudyExample
 */

'use client';

import { useState, KeyboardEvent } from 'react';
import type { StudyExample as StudyExampleType } from '@/lib/types/method';
import { CalculationStep } from '../practice/CalculationStep';
import { MathExpression } from '../practice/MathExpression';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export interface StudyExampleProps {
  /** The worked example to display */
  example: StudyExampleType;
  /** Optional example number for display */
  exampleNumber?: number;
  /** Whether to auto-expand all steps */
  autoExpandSteps?: boolean;
  /** Optional custom class name */
  className?: string;
}

/**
 * Common mistakes that are highlighted as warnings
 */
interface CommonMistake {
  title: string;
  description: string;
}

/**
 * Displays a worked example problem with:
 * - Problem statement (num1 x num2)
 * - Step-by-step solution walkthrough
 * - Pedagogical notes in callout boxes
 * - Common mistakes highlighted as warnings
 */
export function StudyExample({
  example,
  exampleNumber,
  autoExpandSteps = false,
  className = ''
}: StudyExampleProps) {
  const [showSolution, setShowSolution] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);

  const { num1, num2, solution, pedagogicalNotes } = example;
  const answer = num1 * num2;

  // Extract common mistakes from pedagogical notes that start with "Mistake:" or "Common mistake:"
  const commonMistakes: CommonMistake[] = [];
  const regularNotes: string[] = [];

  pedagogicalNotes.forEach(note => {
    const mistakeMatch = note.match(/^(?:Common )?[Mm]istake:\s*(.+)/);
    if (mistakeMatch && mistakeMatch[1]) {
      commonMistakes.push({
        title: 'Common Mistake',
        description: mistakeMatch[1]
      });
    } else {
      regularNotes.push(note);
    }
  });

  // Handle keyboard navigation for steps
  const handleStepKeyDown = (e: KeyboardEvent, index: number) => {
    if (e.key === 'ArrowDown' && index < solution.steps.length - 1) {
      e.preventDefault();
      setActiveStepIndex(index + 1);
    } else if (e.key === 'ArrowUp' && index > 0) {
      e.preventDefault();
      setActiveStepIndex(index - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveStepIndex(activeStepIndex === index ? null : index);
    }
  };

  return (
    <Card variant="elevated" className={`overflow-hidden ${className}`}>
      {/* Problem Header */}
      <CardHeader className="bg-gradient-to-r from-accent/10 to-primary/10">
        <div className="flex items-center justify-between">
          {exampleNumber !== undefined && (
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Example {exampleNumber}
            </span>
          )}
          <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent">
            {solution.method.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </span>
        </div>

        {/* Problem Statement */}
        <div className="mt-4 flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">Calculate:</p>
          <div className="flex items-center gap-4">
            <MathExpression
              expression={`${num1} × ${num2}`}
              className="text-3xl font-bold"
              highlighted={false}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Why This Method */}
        <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="mt-0.5 h-5 w-5 shrink-0 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-accent">
                Why This Method Works
              </h4>
              <p className="mt-1 text-sm text-foreground/80 leading-relaxed">
                {solution.optimalReason}
              </p>
            </div>
          </div>
        </div>

        {/* Show/Hide Solution Toggle */}
        <button
          onClick={() => setShowSolution(!showSolution)}
          className="w-full rounded-lg border-2 border-dashed border-border bg-card px-4 py-4 text-center font-medium transition-all duration-200 hover:border-accent/50 hover:bg-accent/5 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          aria-expanded={showSolution}
          aria-controls="solution-steps"
        >
          <span className="flex items-center justify-center gap-2">
            <svg
              className={`h-5 w-5 transition-transform duration-200 ${showSolution ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            {showSolution ? 'Hide Solution' : 'Show Step-by-Step Solution'}
          </span>
        </button>

        {/* Solution Steps */}
        {showSolution && (
          <div
            id="solution-steps"
            className="space-y-4"
            role="list"
            aria-label="Solution steps"
          >
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Solution Steps
            </h4>

            {solution.steps.map((step, index) => (
              <div
                key={index}
                role="listitem"
                tabIndex={0}
                onKeyDown={(e) => handleStepKeyDown(e, index)}
                className="focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded-lg"
              >
                <CalculationStep
                  step={step}
                  stepNumber={index + 1}
                  isActive={activeStepIndex === index}
                  autoExpand={autoExpandSteps}
                />
              </div>
            ))}

            {/* Final Answer */}
            <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">
                  Final Answer:
                </span>
                <span className="font-mono text-2xl font-bold text-primary">
                  {answer.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Pedagogical Notes */}
        {regularNotes.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Key Insights
            </h4>
            <div className="space-y-2">
              {regularNotes.map((note, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-border bg-muted/30 p-4"
                >
                  <div className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm text-foreground/90 leading-relaxed">
                      {note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Common Mistakes Warning */}
        {commonMistakes.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Watch Out For
            </h4>
            <div className="space-y-2">
              {commonMistakes.map((mistake, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-warning/30 bg-warning/10 p-4"
                  role="alert"
                >
                  <div className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 h-5 w-5 shrink-0 text-warning"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <div>
                      <h5 className="text-sm font-semibold text-warning">
                        {mistake.title}
                      </h5>
                      <p className="mt-1 text-sm text-foreground/80 leading-relaxed">
                        {mistake.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
