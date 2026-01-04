import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import {
  GuidedTour,
  GuidedTourProvider,
  isTourCompleted,
  markTourCompleted,
  resetTourStatus,
  isFirstVisit,
  markTourStarted
} from '../index';

// Mock createPortal for testing
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');
  return {
    ...actual,
    createPortal: (node: React.ReactNode) => node
  };
});

describe('GuidedTour', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.style.overflow = '';
  });

  describe('localStorage helper functions', () => {
    describe('isTourCompleted', () => {
      it('should return false when tour has not been completed', () => {
        expect(isTourCompleted()).toBe(false);
      });

      it('should return true when tour has been completed', () => {
        localStorage.setItem('mental-math-tour-completed', 'true');
        expect(isTourCompleted()).toBe(true);
      });
    });

    describe('markTourCompleted', () => {
      it('should set tour completed flag in localStorage', () => {
        markTourCompleted();
        expect(localStorage.getItem('mental-math-tour-completed')).toBe('true');
      });
    });

    describe('resetTourStatus', () => {
      it('should remove both tour completed and started flags', () => {
        localStorage.setItem('mental-math-tour-completed', 'true');
        localStorage.setItem('mental-math-tour-started', 'true');

        resetTourStatus();

        expect(localStorage.getItem('mental-math-tour-completed')).toBeNull();
        expect(localStorage.getItem('mental-math-tour-started')).toBeNull();
      });
    });

    describe('isFirstVisit', () => {
      it('should return true when tour has never been started', () => {
        expect(isFirstVisit()).toBe(true);
      });

      it('should return false when tour has been started', () => {
        localStorage.setItem('mental-math-tour-started', 'true');
        expect(isFirstVisit()).toBe(false);
      });
    });

    describe('markTourStarted', () => {
      it('should set tour started flag in localStorage', () => {
        markTourStarted();
        expect(localStorage.getItem('mental-math-tour-started')).toBe('true');
      });
    });
  });

  describe('visibility', () => {
    it('should not show tour when completed', async () => {
      markTourCompleted();

      render(<GuidedTour />);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should not show tour when not first visit', async () => {
      markTourStarted();

      render(<GuidedTour />);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should show tour on first visit', async () => {
      render(<GuidedTour />);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should show tour when forceShow is true', async () => {
      markTourCompleted();

      render(<GuidedTour forceShow={true} />);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('tour content', () => {
    it('should display welcome step first', async () => {
      render(<GuidedTour forceShow />);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByText('Welcome to Mental Math Mastery!')).toBeInTheDocument();
      expect(screen.getByText(/quick tour/i)).toBeInTheDocument();
    });

    it('should display step progress indicator', async () => {
      render(<GuidedTour forceShow />);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByText('1 of 6')).toBeInTheDocument();
    });

    it('should show keyboard navigation hint', async () => {
      render(<GuidedTour forceShow />);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByText(/arrow keys to navigate/i)).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('should navigate to next step when Next button is clicked', async () => {
      render(<GuidedTour forceShow />);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByText('1 of 6')).toBeInTheDocument();

      const nextButton = screen.getByRole('button', { name: /next/i });
      await act(async () => {
        fireEvent.click(nextButton);
      });

      expect(screen.getByText('2 of 6')).toBeInTheDocument();
      expect(screen.getByText('Navigation')).toBeInTheDocument();
    });

    it('should navigate to previous step when Previous button is clicked', async () => {
      render(<GuidedTour forceShow />);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      // Go to step 2
      const nextButton = screen.getByRole('button', { name: /next/i });
      await act(async () => {
        fireEvent.click(nextButton);
      });

      expect(screen.getByText('2 of 6')).toBeInTheDocument();

      // Go back to step 1
      const prevButton = screen.getByRole('button', { name: /previous/i });
      await act(async () => {
        fireEvent.click(prevButton);
      });

      expect(screen.getByText('1 of 6')).toBeInTheDocument();
    });

    it('should not show Previous button on first step', async () => {
      render(<GuidedTour forceShow />);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument();
    });

    it('should show Get Started button on last step', async () => {
      render(<GuidedTour forceShow />);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      // Navigate to last step (6 steps total)
      for (let i = 0; i < 5; i++) {
        const nextButton = screen.getByRole('button', { name: /next/i });
        await act(async () => {
          fireEvent.click(nextButton);
        });
      }

      expect(screen.getByText('6 of 6')).toBeInTheDocument();
      // Button has aria-label "Complete tour" but displays "Get Started"
      expect(screen.getByRole('button', { name: /complete tour/i })).toBeInTheDocument();
      expect(screen.getByText('Get Started')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /next step/i })).not.toBeInTheDocument();
    });
  });

  describe('keyboard navigation', () => {
    it('should navigate to next step with ArrowRight key', async () => {
      render(<GuidedTour forceShow />);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByText('1 of 6')).toBeInTheDocument();

      await act(async () => {
        fireEvent.keyDown(document, { key: 'ArrowRight' });
      });

      expect(screen.getByText('2 of 6')).toBeInTheDocument();
    });

    it('should navigate to next step with Enter key', async () => {
      render(<GuidedTour forceShow />);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByText('1 of 6')).toBeInTheDocument();

      await act(async () => {
        fireEvent.keyDown(document, { key: 'Enter' });
      });

      expect(screen.getByText('2 of 6')).toBeInTheDocument();
    });

    it('should navigate to previous step with ArrowLeft key', async () => {
      render(<GuidedTour forceShow />);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      // First navigate to step 2
      await act(async () => {
        fireEvent.keyDown(document, { key: 'ArrowRight' });
      });

      expect(screen.getByText('2 of 6')).toBeInTheDocument();

      // Then go back
      await act(async () => {
        fireEvent.keyDown(document, { key: 'ArrowLeft' });
      });

      expect(screen.getByText('1 of 6')).toBeInTheDocument();
    });

    it('should skip tour with Escape key', async () => {
      const onSkip = vi.fn();
      render(<GuidedTour forceShow onSkip={onSkip} />);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      await act(async () => {
        fireEvent.keyDown(document, { key: 'Escape' });
      });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(onSkip).toHaveBeenCalledTimes(1);
    });
  });

  describe('skip and complete actions', () => {
    it('should close tour and call onSkip when Skip Tour is clicked', async () => {
      const onSkip = vi.fn();
      render(<GuidedTour forceShow onSkip={onSkip} />);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      const skipButton = screen.getByRole('button', { name: /skip tour/i });
      await act(async () => {
        fireEvent.click(skipButton);
      });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(onSkip).toHaveBeenCalledTimes(1);
      expect(isTourCompleted()).toBe(true);
    });

    it('should close tour and call onComplete when completed', async () => {
      const onComplete = vi.fn();
      render(<GuidedTour forceShow onComplete={onComplete} />);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      // Navigate to last step
      for (let i = 0; i < 5; i++) {
        const nextButton = screen.getByRole('button', { name: /next/i });
        await act(async () => {
          fireEvent.click(nextButton);
        });
      }

      // Button has aria-label "Complete tour"
      const completeButton = screen.getByRole('button', { name: /complete tour/i });
      await act(async () => {
        fireEvent.click(completeButton);
      });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(isTourCompleted()).toBe(true);
    });
  });

  describe('accessibility', () => {
    it('should have proper dialog role', async () => {
      render(<GuidedTour forceShow />);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should have aria-labelledby pointing to title', async () => {
      render(<GuidedTour forceShow />);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'tour-title');

      const title = document.getElementById('tour-title');
      expect(title).toBeInTheDocument();
    });

    it('should have aria-describedby pointing to description', async () => {
      render(<GuidedTour forceShow />);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-describedby', 'tour-description');

      const description = document.getElementById('tour-description');
      expect(description).toBeInTheDocument();
    });

    it('should have accessible button labels', async () => {
      render(<GuidedTour forceShow />);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByRole('button', { name: /skip tour/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next step/i })).toBeInTheDocument();
    });
  });

  describe('body scroll lock', () => {
    it('should prevent body scroll when tour is visible', async () => {
      render(<GuidedTour forceShow />);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll when tour is closed', async () => {
      render(<GuidedTour forceShow />);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      const skipButton = screen.getByRole('button', { name: /skip tour/i });
      await act(async () => {
        fireEvent.click(skipButton);
      });

      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('tour steps content', () => {
    it('should have welcome step content', async () => {
      render(<GuidedTour forceShow />);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByText('Welcome to Mental Math Mastery!')).toBeInTheDocument();
    });

    it('should have navigation step content', async () => {
      render(<GuidedTour forceShow />);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      // Navigate to step 2
      const nextButton = screen.getByRole('button', { name: /next/i });
      await act(async () => {
        fireEvent.click(nextButton);
      });

      expect(screen.getByText('Navigation')).toBeInTheDocument();
      expect(screen.getByText(/navigation bar/i)).toBeInTheDocument();
    });

    it('should have practice mode step content', async () => {
      render(<GuidedTour forceShow />);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      // Navigate to step 3
      for (let i = 0; i < 2; i++) {
        const nextButton = screen.getByRole('button', { name: /next/i });
        await act(async () => {
          fireEvent.click(nextButton);
        });
      }

      expect(screen.getByText('Practice Mode')).toBeInTheDocument();
      expect(screen.getByText(/difficulty level/i)).toBeInTheDocument();
    });

    it('should have study methods step content', async () => {
      render(<GuidedTour forceShow />);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      // Navigate to step 4
      for (let i = 0; i < 3; i++) {
        const nextButton = screen.getByRole('button', { name: /next/i });
        await act(async () => {
          fireEvent.click(nextButton);
        });
      }

      expect(screen.getByText('Study Methods')).toBeInTheDocument();
      expect(screen.getByText(/6 powerful calculation techniques/i)).toBeInTheDocument();
    });

    it('should have statistics step content', async () => {
      render(<GuidedTour forceShow />);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      // Navigate to step 5
      for (let i = 0; i < 4; i++) {
        const nextButton = screen.getByRole('button', { name: /next/i });
        await act(async () => {
          fireEvent.click(nextButton);
        });
      }

      expect(screen.getByText('Track Your Progress')).toBeInTheDocument();
      expect(screen.getByText(/statistics/i)).toBeInTheDocument();
    });

    it('should have completion step content', async () => {
      render(<GuidedTour forceShow />);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      // Navigate to step 6
      for (let i = 0; i < 5; i++) {
        const nextButton = screen.getByRole('button', { name: /next/i });
        await act(async () => {
          fireEvent.click(nextButton);
        });
      }

      expect(screen.getByText("You're All Set!")).toBeInTheDocument();
      expect(screen.getByText(/mental math journey/i)).toBeInTheDocument();
    });
  });
});

describe('GuidedTourProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should render children', () => {
    render(
      <GuidedTourProvider>
        <div data-testid="child">Child content</div>
      </GuidedTourProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should include GuidedTour component', async () => {
    render(
      <GuidedTourProvider>
        <div>Content</div>
      </GuidedTourProvider>
    );

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Tour should show for first-time visitors
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
