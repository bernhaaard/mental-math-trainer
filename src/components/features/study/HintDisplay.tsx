/**
 * HintDisplay component - Shows hints progressively with animated reveal.
 * @module components/features/study/HintDisplay
 */

'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';

/**
 * A single hint with its content
 */
export interface Hint {
  /** The hint text content */
  content: string;
  /** Optional hint number (defaults to index + 1) */
  number?: number;
}

export interface HintDisplayProps {
  /** Array of hints to display progressively */
  hints: string[];
  /** Number of hints currently revealed */
  revealedCount: number;
  /** Callback when user requests the next hint */
  onRevealNext?: () => void;
  /** Whether all hints have been revealed */
  allRevealed?: boolean;
  /** Optional custom class name */
  className?: string;
}

/**
 * Displays hints progressively with visual distinction between revealed and hidden.
 * Supports animated reveal and numbered hints.
 */
export function HintDisplay({
  hints,
  revealedCount,
  onRevealNext,
  allRevealed = false,
  className = ''
}: HintDisplayProps) {
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track when a new hint is revealed to trigger animation
  useEffect(() => {
    if (revealedCount > 0) {
      const newlyRevealedIndex = revealedCount - 1;
      setAnimatingIndex(newlyRevealedIndex);

      // Clear animation state after animation completes
      const timer = setTimeout(() => {
        setAnimatingIndex(null);
      }, 500);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [revealedCount]);

  // Handle keyboard interaction for reveal button
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onRevealNext && !allRevealed) {
        onRevealNext();
      }
    }
  };

  const totalHints = hints.length;
  const remainingHints = totalHints - revealedCount;

  return (
    <div
      ref={containerRef}
      className={`space-y-3 ${className}`}
      role="region"
      aria-label="Hints section"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Hints
        </h3>
        <span className="text-xs text-muted-foreground">
          {revealedCount} of {totalHints} revealed
        </span>
      </div>

      {/* Hints list */}
      <div className="space-y-2">
        {hints.map((hint, index) => {
          const isRevealed = index < revealedCount;
          const isAnimating = index === animatingIndex;
          const hintNumber = index + 1;

          return (
            <div
              key={index}
              className={`
                relative rounded-lg border p-4 transition-all duration-300
                ${isRevealed
                  ? 'border-accent/40 bg-accent/5'
                  : 'border-border bg-card/50'
                }
                ${isAnimating ? 'animate-fadeIn' : ''}
              `}
              aria-hidden={!isRevealed}
            >
              {/* Hint number badge */}
              <div className="flex items-start gap-3">
                <span
                  className={`
                    flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold
                    ${isRevealed
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted text-muted-foreground'
                    }
                  `}
                >
                  {hintNumber}
                </span>

                {/* Hint content or placeholder */}
                <div className="flex-1 min-w-0">
                  {isRevealed ? (
                    <p className="text-sm text-foreground leading-relaxed">
                      {hint}
                    </p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground italic">
                        Hidden hint
                      </span>
                      {/* Lock icon */}
                      <svg
                        className="h-4 w-4 text-muted-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reveal next hint button */}
      {!allRevealed && onRevealNext && (
        <button
          onClick={onRevealNext}
          onKeyDown={handleKeyDown}
          className="w-full rounded-lg border-2 border-dashed border-accent/30 bg-accent/5 px-4 py-3 text-sm font-medium text-accent transition-all duration-200 hover:border-accent/50 hover:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          aria-label={`Reveal hint ${revealedCount + 1} of ${totalHints}`}
        >
          <span className="flex items-center justify-center gap-2">
            <svg
              className="h-5 w-5"
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
            Show Hint {revealedCount + 1}
            {remainingHints > 1 && (
              <span className="text-xs text-accent/70">
                ({remainingHints} remaining)
              </span>
            )}
          </span>
        </button>
      )}

      {/* All hints revealed message */}
      {allRevealed && (
        <div className="rounded-lg bg-muted/50 px-4 py-3 text-center text-sm text-muted-foreground">
          All hints have been revealed
        </div>
      )}
    </div>
  );
}
