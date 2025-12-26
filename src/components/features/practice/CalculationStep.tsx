/**
 * CalculationStep component - Displays a single step in a calculation with expandable sub-steps.
 * @module components/features/practice/CalculationStep
 */

'use client';

import { useState } from 'react';
import type { CalculationStep as CalculationStepType } from '@/lib/types/solution';
import { MathExpression } from './MathExpression';

interface CalculationStepProps {
  /** The calculation step to display */
  step: CalculationStepType;
  /** Whether this step is currently active/highlighted */
  isActive?: boolean;
  /** Step number for display (e.g., "Step 1") */
  stepNumber?: number;
  /** Whether to auto-expand sub-steps */
  autoExpand?: boolean;
}

// Static indent classes - Tailwind requires complete class names at build time
const INDENT_CLASSES: Record<number, string> = {
  0: '',
  1: 'ml-6',
  2: 'ml-12',
  3: 'ml-12', // Cap at ml-12 for deeply nested steps
};

/**
 * Displays a single calculation step with its expression, result, explanation,
 * and optional expandable sub-steps with proper visual hierarchy.
 */
export function CalculationStep({
  step,
  isActive = false,
  stepNumber,
  autoExpand = false
}: CalculationStepProps) {
  const [isExpanded, setIsExpanded] = useState(autoExpand);
  const hasSubSteps = step.subSteps && step.subSteps.length > 0;

  // Calculate indentation based on depth using static class mapping
  const indentClass = INDENT_CLASSES[Math.min(step.depth, 3)] || '';

  return (
    <div className={`relative ${indentClass}`}>
      {/* Connection line for sub-steps */}
      {step.depth > 0 && (
        <div
          className="absolute left-[-20px] top-0 bottom-0 w-[2px] bg-border"
          aria-hidden="true"
        />
      )}

      {/* Main step container */}
      <div
        className={`
          relative rounded-lg border transition-all duration-200
          ${isActive
            ? 'border-accent bg-accent/5 shadow-md'
            : 'border-border bg-card hover:border-muted-foreground/30'
          }
          ${step.depth > 0 ? 'my-2' : 'my-4'}
          p-4
        `}
      >
        {/* Step header with number */}
        {stepNumber !== undefined && step.depth === 0 && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Step {stepNumber}
            </span>
            {isActive && (
              <span className="text-xs font-medium text-accent">
                • Current
              </span>
            )}
          </div>
        )}

        {/* Mathematical expression */}
        <div className="mb-3">
          <MathExpression
            expression={step.expression}
            highlighted={isActive}
            className="text-xl"
          />
        </div>

        {/* Result */}
        <div className="mb-2 flex items-baseline gap-2">
          <span className="text-sm text-muted-foreground">Result:</span>
          <span className="font-mono text-lg font-semibold text-primary">
            {step.result.toLocaleString()}
          </span>
        </div>

        {/* Explanation */}
        <p className="text-sm text-foreground/90 leading-relaxed">
          {step.explanation}
        </p>

        {/* Expand/collapse button for sub-steps */}
        {hasSubSteps && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded px-2 py-1"
            aria-expanded={isExpanded}
          >
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${
                isExpanded ? 'rotate-90' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            {isExpanded ? 'Hide' : 'Show'} detailed breakdown
            <span className="text-muted-foreground">
              ({step.subSteps?.length} sub-step{step.subSteps?.length !== 1 ? 's' : ''})
            </span>
          </button>
        )}
      </div>

      {/* Sub-steps */}
      {hasSubSteps && isExpanded && (
        <div className="mt-2 pl-6 border-l-2 border-border/50">
          {step.subSteps!.map((subStep, index) => (
            <CalculationStep
              key={index}
              step={subStep}
              autoExpand={autoExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}
