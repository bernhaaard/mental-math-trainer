/**
 * ExampleCarousel component - Navigate through multiple examples.
 * @module components/features/study/ExampleCarousel
 */

'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  KeyboardEvent
} from 'react';
import type { StudyExample as StudyExampleType } from '@/lib/types/method';
import { StudyExample } from './StudyExample';
import { Button } from '@/components/ui/button';

export interface ExampleCarouselProps {
  /** Array of examples to display */
  examples: StudyExampleType[];
  /** Optional starting index */
  initialIndex?: number;
  /** Callback when example changes */
  onExampleChange?: (index: number) => void;
  /** Whether to auto-expand steps in examples */
  autoExpandSteps?: boolean;
  /** Optional custom class name */
  className?: string;
}

/**
 * Carousel component for navigating through multiple worked examples.
 * Supports:
 * - Previous/Next buttons
 * - Dot indicators for position
 * - Keyboard navigation (left/right arrows)
 * - Swipe support indication
 */
export function ExampleCarousel({
  examples,
  initialIndex = 0,
  onExampleChange,
  autoExpandSteps = false,
  className = ''
}: ExampleCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalExamples = examples.length;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < totalExamples - 1;

  // Get current example safely - array access is bounds-checked above
  const currentExample = totalExamples > 0 ? examples[currentIndex] : undefined;

  // Navigate to specific index
  const goToIndex = useCallback((index: number, direction?: 'left' | 'right') => {
    if (index < 0 || index >= totalExamples || isAnimating) {
      return;
    }

    const actualDirection = direction || (index > currentIndex ? 'left' : 'right');
    setSlideDirection(actualDirection);
    setIsAnimating(true);

    // Small delay for animation
    setTimeout(() => {
      setCurrentIndex(index);
      if (onExampleChange) {
        onExampleChange(index);
      }

      setTimeout(() => {
        setIsAnimating(false);
        setSlideDirection(null);
      }, 50);
    }, 150);
  }, [currentIndex, totalExamples, isAnimating, onExampleChange]);

  // Navigate to previous example
  const goToPrevious = useCallback(() => {
    if (hasPrevious) {
      goToIndex(currentIndex - 1, 'right');
    }
  }, [currentIndex, hasPrevious, goToIndex]);

  // Navigate to next example
  const goToNext = useCallback(() => {
    if (hasNext) {
      goToIndex(currentIndex + 1, 'left');
    }
  }, [currentIndex, hasNext, goToIndex]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        goToPrevious();
        break;
      case 'ArrowRight':
        e.preventDefault();
        goToNext();
        break;
      case 'Home':
        e.preventDefault();
        goToIndex(0);
        break;
      case 'End':
        e.preventDefault();
        goToIndex(totalExamples - 1);
        break;
      default:
        break;
    }
  }, [goToPrevious, goToNext, goToIndex, totalExamples]);

  // Focus management for keyboard navigation
  useEffect(() => {
    const container = containerRef.current;
    if (container && document.activeElement === document.body) {
      container.focus();
    }
  }, [currentIndex]);

  if (totalExamples === 0 || currentExample === undefined) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">No examples available</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label={`Example carousel, showing example ${currentIndex + 1} of ${totalExamples}`}
      aria-roledescription="carousel"
    >
      {/* Navigation Header */}
      <div className="mb-4 flex items-center justify-between">
        {/* Previous Button */}
        <Button
          onClick={goToPrevious}
          disabled={!hasPrevious || isAnimating}
          variant="outline"
          size="md"
          aria-label="Previous example"
        >
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="hidden sm:inline">Previous</span>
        </Button>

        {/* Position Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {currentIndex + 1} / {totalExamples}
          </span>
        </div>

        {/* Next Button */}
        <Button
          onClick={goToNext}
          disabled={!hasNext || isAnimating}
          variant="outline"
          size="md"
          aria-label="Next example"
        >
          <span className="hidden sm:inline">Next</span>
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Button>
      </div>

      {/* Example Content with Animation */}
      <div
        className={`
          transition-all duration-150 ease-in-out
          ${isAnimating && slideDirection === 'left' ? 'translate-x-[-10px] opacity-50' : ''}
          ${isAnimating && slideDirection === 'right' ? 'translate-x-[10px] opacity-50' : ''}
          ${!isAnimating ? 'translate-x-0 opacity-100' : ''}
        `}
        role="group"
        aria-roledescription="slide"
        aria-label={`Example ${currentIndex + 1} of ${totalExamples}`}
      >
        <StudyExample
          example={currentExample}
          exampleNumber={currentIndex + 1}
          autoExpandSteps={autoExpandSteps}
        />
      </div>

      {/* Dot Indicators */}
      {totalExamples > 1 && (
        <div
          className="mt-6 flex items-center justify-center gap-2"
          role="tablist"
          aria-label="Example navigation"
        >
          {examples.map((_, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              disabled={isAnimating}
              className={`
                h-3 w-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
                ${index === currentIndex
                  ? 'bg-accent scale-110'
                  : 'bg-muted hover:bg-muted-foreground/50'
                }
              `}
              role="tab"
              aria-selected={index === currentIndex}
              aria-label={`Go to example ${index + 1}`}
              tabIndex={index === currentIndex ? 0 : -1}
            />
          ))}
        </div>
      )}

      {/* Keyboard Navigation Hint */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <kbd className="rounded bg-muted px-2 py-1 font-mono text-xs">
            <svg className="inline h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </kbd>
          <kbd className="rounded bg-muted px-2 py-1 font-mono text-xs">
            <svg className="inline h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </kbd>
          <span>to navigate</span>
        </span>

        {/* Swipe indicator for touch devices */}
        <span className="hidden touch-auto sm:flex items-center gap-1">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          <span>swipe to browse</span>
        </span>
      </div>
    </div>
  );
}
