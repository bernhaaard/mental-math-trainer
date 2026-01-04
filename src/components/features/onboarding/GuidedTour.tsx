'use client';

/**
 * GuidedTour Component
 *
 * Provides a quick start guided tour for new users.
 * Highlights key UI elements and explains app features.
 *
 * Features:
 * - First-time user detection via localStorage
 * - Step-by-step tooltips with navigation
 * - Skip and complete tour options
 * - Ability to restart tour from settings
 */

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';

/**
 * Storage key for tour completion status.
 */
const TOUR_COMPLETED_KEY = 'mental-math-tour-completed';

/**
 * Storage key for indicating tour has been started.
 */
const TOUR_STARTED_KEY = 'mental-math-tour-started';

/**
 * Configuration for a single tour step.
 */
export interface TourStep {
  /**
   * Unique identifier for the step.
   */
  id: string;

  /**
   * Title displayed in the tooltip.
   */
  title: string;

  /**
   * Description content for the step.
   */
  description: string;

  /**
   * CSS selector for the target element to highlight.
   * If null, the tooltip will be centered on screen (for welcome/finish steps).
   */
  targetSelector: string | null;

  /**
   * Preferred position of the tooltip relative to target.
   */
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

/**
 * Props for the GuidedTour component.
 */
export interface GuidedTourProps {
  /**
   * Whether to force show the tour regardless of localStorage state.
   * Useful for testing or restart functionality.
   */
  forceShow?: boolean;

  /**
   * Callback when tour is completed.
   */
  onComplete?: () => void;

  /**
   * Callback when tour is skipped.
   */
  onSkip?: () => void;
}

/**
 * Default tour steps for the Mental Math Mastery app.
 */
const DEFAULT_TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Mental Math Mastery!',
    description:
      "We're excited to help you master mental math calculations. This quick tour will show you how to get the most out of the app. Let's get started!",
    targetSelector: null,
    position: 'center'
  },
  {
    id: 'navigation',
    title: 'Navigation',
    description:
      'Use the navigation bar to switch between Practice, Study, and Statistics. You can access any section at any time.',
    targetSelector: 'header nav, header #mobile-menu',
    position: 'bottom'
  },
  {
    id: 'practice',
    title: 'Practice Mode',
    description:
      'Start practicing mental math here! Choose your difficulty level, select specific calculation methods, and track your progress with timed sessions.',
    targetSelector: 'a[href="/practice"]',
    position: 'bottom'
  },
  {
    id: 'study',
    title: 'Study Methods',
    description:
      'Learn the 6 powerful calculation techniques: Distributive Property, Difference of Squares, Near Powers of 10, Squaring, Near 100, and Factorization.',
    targetSelector: 'a[href="/study"]',
    position: 'bottom'
  },
  {
    id: 'statistics',
    title: 'Track Your Progress',
    description:
      'View your statistics to see accuracy trends, identify weak areas, and track improvement over time. Your data is stored locally in your browser.',
    targetSelector: 'a[href="/statistics"]',
    position: 'bottom'
  },
  {
    id: 'complete',
    title: "You're All Set!",
    description:
      "You're ready to start your mental math journey. We recommend beginning with the Study section to learn the methods, then Practice to build your skills. Good luck!",
    targetSelector: null,
    position: 'center'
  }
];

/**
 * Safe localStorage getter that handles private browsing mode and disabled storage.
 * Returns null if localStorage is unavailable.
 */
function safeLocalStorageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    // localStorage unavailable (private browsing, storage disabled, etc.)
    return null;
  }
}

/**
 * Safe localStorage setter that handles private browsing mode and disabled storage.
 * Silently fails if localStorage is unavailable.
 */
function safeLocalStorageSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // localStorage unavailable (private browsing, storage disabled, etc.)
  }
}

/**
 * Safe localStorage remover that handles private browsing mode and disabled storage.
 * Silently fails if localStorage is unavailable.
 */
function safeLocalStorageRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // localStorage unavailable (private browsing, storage disabled, etc.)
  }
}

/**
 * Checks if the tour has been completed by the user.
 */
export function isTourCompleted(): boolean {
  if (typeof window === 'undefined') return true;
  return safeLocalStorageGet(TOUR_COMPLETED_KEY) === 'true';
}

/**
 * Marks the tour as completed in localStorage.
 */
export function markTourCompleted(): void {
  if (typeof window === 'undefined') return;
  safeLocalStorageSet(TOUR_COMPLETED_KEY, 'true');
}

/**
 * Resets the tour completion status to show the tour again.
 */
export function resetTourStatus(): void {
  if (typeof window === 'undefined') return;
  safeLocalStorageRemove(TOUR_COMPLETED_KEY);
  safeLocalStorageRemove(TOUR_STARTED_KEY);
}

/**
 * Checks if this is the first visit (tour never started).
 */
export function isFirstVisit(): boolean {
  if (typeof window === 'undefined') return false;
  return safeLocalStorageGet(TOUR_STARTED_KEY) !== 'true';
}

/**
 * Marks that the tour has been started.
 */
export function markTourStarted(): void {
  if (typeof window === 'undefined') return;
  safeLocalStorageSet(TOUR_STARTED_KEY, 'true');
}

/**
 * Custom hook to check if component is mounted on client.
 * Uses useSyncExternalStore for hydration-safe mounting detection.
 */
function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

/**
 * Determines initial visibility state for the tour.
 */
function shouldShowTour(forceShow: boolean): boolean {
  if (typeof window === 'undefined') return false;
  if (forceShow) return true;
  return isFirstVisit() && !isTourCompleted();
}

/**
 * Props for the TourTooltip component.
 */
interface TourTooltipProps {
  step: TourStep;
  currentStepIndex: number;
  totalSteps: number;
  targetRect: DOMRect | null;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onComplete: () => void;
}

/**
 * Tooltip component that displays tour step content.
 */
function TourTooltip({
  step,
  currentStepIndex,
  totalSteps,
  targetRect,
  onNext,
  onPrev,
  onSkip,
  onComplete
}: TourTooltipProps): React.ReactElement {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;
  const isCentered = step.position === 'center' || !targetRect;

  // Calculate tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    if (isCentered) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: '400px',
        width: '90vw'
      };
    }

    if (!targetRect) {
      return {};
    }

    const padding = 16;
    const tooltipWidth = 320;
    const tooltipHeight = 200; // Approximate

    let top: number;
    let left: number;

    switch (step.position) {
      case 'bottom':
        top = targetRect.bottom + padding;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case 'top':
        top = targetRect.top - tooltipHeight - padding;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.left - tooltipWidth - padding;
        break;
      case 'right':
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.right + padding;
        break;
      default:
        top = targetRect.bottom + padding;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
    }

    // Keep tooltip within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < padding) left = padding;
    if (left + tooltipWidth > viewportWidth - padding) {
      left = viewportWidth - tooltipWidth - padding;
    }
    if (top < padding) top = padding;
    if (top + tooltipHeight > viewportHeight - padding) {
      top = viewportHeight - tooltipHeight - padding;
    }

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${tooltipWidth}px`
    };
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowRight':
        case 'Enter':
          event.preventDefault();
          if (isLastStep) {
            onComplete();
          } else {
            onNext();
          }
          break;
        case 'ArrowLeft':
          event.preventDefault();
          if (!isFirstStep) {
            onPrev();
          }
          break;
        case 'Escape':
          event.preventDefault();
          onSkip();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFirstStep, isLastStep, onNext, onPrev, onSkip, onComplete]);

  // Focus tooltip when it appears
  useEffect(() => {
    tooltipRef.current?.focus();
  }, [currentStepIndex]);

  return (
    <div
      ref={tooltipRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
      aria-describedby="tour-description"
      tabIndex={-1}
      className="z-[10001] bg-card border border-border rounded-lg shadow-xl p-6 outline-none animate-in fade-in duration-200"
      style={getTooltipStyle()}
    >
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStepIndex
                  ? 'bg-primary'
                  : index < currentStepIndex
                    ? 'bg-primary/50'
                    : 'bg-muted'
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          {currentStepIndex + 1} of {totalSteps}
        </span>
      </div>

      {/* Content */}
      <h2
        id="tour-title"
        className="text-lg font-semibold text-foreground mb-2"
      >
        {step.title}
      </h2>
      <p
        id="tour-description"
        className="text-sm text-muted-foreground mb-6 leading-relaxed"
      >
        {step.description}
      </p>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSkip}
          aria-label="Skip tour"
        >
          Skip Tour
        </Button>

        <div className="flex gap-2">
          {!isFirstStep && (
            <Button
              variant="outline"
              size="sm"
              onClick={onPrev}
              aria-label="Previous step"
            >
              Previous
            </Button>
          )}
          {isLastStep ? (
            <Button
              variant="primary"
              size="sm"
              onClick={onComplete}
              aria-label="Complete tour"
            >
              Get Started
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={onNext}
              aria-label="Next step"
            >
              Next
            </Button>
          )}
        </div>
      </div>

      {/* Keyboard hint */}
      <p className="text-xs text-muted-foreground mt-4 text-center">
        Use arrow keys to navigate, Esc to skip
      </p>
    </div>
  );
}

/**
 * Spotlight overlay component that highlights the target element.
 */
function SpotlightOverlay({
  targetRect,
  onClick
}: {
  targetRect: DOMRect | null;
  onClick: () => void;
}): React.ReactElement {
  if (!targetRect) {
    // Full overlay without spotlight for centered tooltips
    return (
      <div
        className="fixed inset-0 z-[10000] bg-black/60"
        onClick={onClick}
        aria-hidden="true"
      />
    );
  }

  const padding = 8;
  const spotlightStyle: React.CSSProperties = {
    position: 'fixed',
    top: targetRect.top - padding,
    left: targetRect.left - padding,
    width: targetRect.width + padding * 2,
    height: targetRect.height + padding * 2,
    borderRadius: '8px'
  };

  return (
    <>
      {/* Dark overlay with cutout */}
      <div
        className="fixed inset-0 z-[10000]"
        onClick={onClick}
        aria-hidden="true"
        style={{
          background: `linear-gradient(to bottom,
            rgba(0,0,0,0.6) 0%,
            rgba(0,0,0,0.6) 100%)`,
          clipPath: `polygon(
            0% 0%,
            0% 100%,
            ${spotlightStyle.left}px 100%,
            ${spotlightStyle.left}px ${spotlightStyle.top}px,
            ${(spotlightStyle.left as number) + (spotlightStyle.width as number)}px ${spotlightStyle.top}px,
            ${(spotlightStyle.left as number) + (spotlightStyle.width as number)}px ${(spotlightStyle.top as number) + (spotlightStyle.height as number)}px,
            ${spotlightStyle.left}px ${(spotlightStyle.top as number) + (spotlightStyle.height as number)}px,
            ${spotlightStyle.left}px 100%,
            100% 100%,
            100% 0%
          )`
        }}
      />
      {/* Spotlight border */}
      <div
        className="fixed z-[10000] border-2 border-primary ring-4 ring-primary/30 pointer-events-none"
        style={spotlightStyle}
        aria-hidden="true"
      />
    </>
  );
}

/**
 * GuidedTour component that provides an interactive walkthrough.
 */
export function GuidedTour({
  forceShow = false,
  onComplete,
  onSkip
}: GuidedTourProps): React.ReactElement | null {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const tourInitializedRef = useRef(false);
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Use custom hook for hydration-safe mounting detection
  const mounted = useMounted();

  // Create portal container element for safe DOM rendering
  useEffect(() => {
    if (!mounted) return;

    // Create a dedicated container for the portal
    const container = document.createElement('div');
    container.id = 'guided-tour-portal';
    document.body.appendChild(container);
    setPortalContainer(container);

    return () => {
      // Clean up the container on unmount
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };
  }, [mounted]);

  const steps = DEFAULT_TOUR_STEPS;
  const currentStep = steps[currentStepIndex];

  // Handle tour visibility based on conditions
  // This effect syncs the external state (localStorage) with React state
  // Using setTimeout to defer state updates and avoid the lint warning about
  // synchronous setState in effects
  useEffect(() => {
    if (!mounted || tourInitializedRef.current) return;

    // Mark as initialized to prevent re-running (using ref to avoid triggering re-render)
    tourInitializedRef.current = true;

    const shouldShow = shouldShowTour(forceShow);

    if (shouldShow) {
      markTourStarted();

      // Use setTimeout to defer state update (async callback pattern)
      // forceShow uses a minimal delay, first-time users get a longer delay
      const delay = forceShow ? 0 : 500;
      delayTimerRef.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    }

    return () => {
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
      }
    };
  }, [mounted, forceShow]);

  // Find and track target element
  useEffect(() => {
    if (!isVisible || !currentStep) return;

    const updateTargetRect = () => {
      if (!currentStep.targetSelector) {
        setTargetRect(null);
        return;
      }

      // Try each selector (comma-separated)
      const selectors = currentStep.targetSelector.split(',').map(s => s.trim());
      let element: Element | null = null;

      for (const selector of selectors) {
        element = document.querySelector(selector);
        if (element) break;
      }

      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);

        // Scroll element into view if needed
        if (
          rect.top < 100 ||
          rect.bottom > window.innerHeight - 100
        ) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      } else {
        setTargetRect(null);
      }
    };

    // Initial update
    updateTargetRect();

    // Update on resize and scroll
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);

    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
    };
  }, [isVisible, currentStep]);

  // Prevent body scroll when tour is active
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  const handleNext = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [currentStepIndex, steps.length]);

  const handlePrev = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const handleSkip = useCallback(() => {
    markTourCompleted();
    setIsVisible(false);
    onSkip?.();
  }, [onSkip]);

  const handleComplete = useCallback(() => {
    markTourCompleted();
    setIsVisible(false);
    onComplete?.();
  }, [onComplete]);

  // Don't render on server, when not visible, or when portal container is not ready
  if (!mounted || !isVisible || !currentStep || !portalContainer) {
    return null;
  }

  // Use portal to render in dedicated container for safe DOM manipulation
  return createPortal(
    <>
      <SpotlightOverlay targetRect={targetRect} onClick={() => {}} />
      <TourTooltip
        step={currentStep}
        currentStepIndex={currentStepIndex}
        totalSteps={steps.length}
        targetRect={targetRect}
        onNext={handleNext}
        onPrev={handlePrev}
        onSkip={handleSkip}
        onComplete={handleComplete}
      />
    </>,
    portalContainer
  );
}

export default GuidedTour;
