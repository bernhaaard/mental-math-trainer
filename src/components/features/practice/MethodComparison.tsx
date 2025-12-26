/**
 * MethodComparison component - Displays comparison between optimal and alternative methods.
 * @module components/features/practice/MethodComparison
 */

'use client';

import { useState } from 'react';
import type { Solution, AlternativeSolution } from '@/lib/types/solution';
import { MethodName } from '@/lib/types/method';
import { CalculationStep } from './CalculationStep';

interface MethodComparisonProps {
  /** The optimal solution */
  optimalSolution: Solution;
  /** Cost score for the optimal solution */
  optimalCost: number;
  /** Quality score for the optimal solution */
  optimalQuality: number;
  /** Alternative solutions to compare */
  alternatives: Array<{
    method: MethodName;
    solution: AlternativeSolution;
    costScore: number;
    qualityScore: number;
  }>;
}

/**
 * Helper component to render score with visual indicator.
 * Defined outside of MethodComparison to avoid creating a new component on each render.
 */
function ScoreIndicator({ score, label, optimal = false }: { score: number; label: string; optimal?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground uppercase tracking-wide">
        {label}:
      </span>
      <div className="flex items-center gap-2">
        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              optimal ? 'bg-success' : 'bg-warning'
            }`}
            style={{ width: `${Math.min(100, (score / 10) * 100)}%` }}
          />
        </div>
        <span className={`text-sm font-mono font-semibold ${
          optimal ? 'text-success' : 'text-foreground'
        }`}>
          {score.toFixed(1)}
        </span>
      </div>
    </div>
  );
}

/**
 * Displays a comparison between the optimal method and alternative methods,
 * showing why each alternative wasn't chosen and their relative cost/quality scores.
 */
export function MethodComparison({
  optimalSolution,
  optimalCost,
  optimalQuality,
  alternatives
}: MethodComparisonProps) {
  const [expandedAlternatives, setExpandedAlternatives] = useState<Set<number>>(new Set());

  const toggleAlternative = (index: number) => {
    const newExpanded = new Set(expandedAlternatives);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedAlternatives(newExpanded);
  };

  // Helper to get display name for method
  const getMethodDisplayName = (methodName: MethodName): string => {
    const displayNames: Record<MethodName, string> = {
      [MethodName.Distributive]: 'Distributive Property',
      [MethodName.NearPower10]: 'Near Powers of 10',
      [MethodName.DifferenceSquares]: 'Difference of Squares',
      [MethodName.Factorization]: 'Factorization',
      [MethodName.Squaring]: 'Squaring',
      [MethodName.Near100]: 'Near 100'
    };
    return displayNames[methodName];
  };

  return (
    <div className="space-y-6">
      {/* Optimal method section */}
      <div className="rounded-lg border-2 border-success bg-success/5 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <h3 className="text-lg font-semibold text-success">
                Optimal Method
              </h3>
            </div>
            <p className="text-xl font-bold text-foreground">
              {getMethodDisplayName(optimalSolution.method)}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success text-success-foreground text-sm font-semibold">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Best Choice
          </div>
        </div>

        <p className="text-sm text-foreground/80 mb-4 leading-relaxed">
          {optimalSolution.optimalReason}
        </p>

        <div className="space-y-2">
          <ScoreIndicator score={optimalCost} label="Cost" optimal />
          <ScoreIndicator score={optimalQuality * 10} label="Quality" optimal />
        </div>
      </div>

      {/* Alternative methods */}
      {alternatives.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Alternative Methods
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            These methods also work, but require more computational steps or are less elegant for these specific numbers.
          </p>

          <div className="space-y-3">
            {alternatives.map((alt, index) => {
              const isExpanded = expandedAlternatives.has(index);

              return (
                <div
                  key={index}
                  className="rounded-lg border border-border bg-card overflow-hidden"
                >
                  {/* Alternative header */}
                  <button
                    onClick={() => toggleAlternative(index)}
                    className="w-full p-4 text-left hover:bg-muted/30 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-inset"
                    aria-expanded={isExpanded}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base font-semibold text-foreground">
                            {getMethodDisplayName(alt.method)}
                          </span>
                          <svg
                            className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {alt.solution.whyNotOptimal}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      <ScoreIndicator score={alt.costScore} label="Cost" />
                      <ScoreIndicator score={alt.qualityScore * 10} label="Quality" />
                    </div>
                  </button>

                  {/* Alternative steps (expandable) */}
                  {isExpanded && (
                    <div className="border-t border-border p-4 bg-muted/20">
                      <h4 className="text-sm font-semibold text-foreground mb-3">
                        Solution steps for this method:
                      </h4>
                      <div className="space-y-2">
                        {alt.solution.steps.map((step, stepIndex) => (
                          <CalculationStep
                            key={stepIndex}
                            step={step}
                            stepNumber={stepIndex + 1}
                            autoExpand={false}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {alternatives.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">
            No alternative methods are applicable for these numbers.
          </p>
        </div>
      )}
    </div>
  );
}
