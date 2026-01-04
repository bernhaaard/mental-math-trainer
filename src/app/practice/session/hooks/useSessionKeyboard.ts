'use client';

/**
 * Session Keyboard Shortcuts Hook
 * Handles keyboard shortcuts for the practice session.
 */

import { useMemo, useCallback, useRef } from 'react';
import { useKeyboardShortcuts, type ShortcutConfig } from '@/lib/hooks/useKeyboardShortcuts';
import type { SessionPhase, SessionAction } from './useSessionState';

// ============================================================================
// Types
// ============================================================================

export interface UseSessionKeyboardOptions {
  phase: SessionPhase;
  isSessionEnded: boolean;
  shouldEndSession: boolean;
  showShortcutHelp: boolean;
  // Handlers
  onNext: () => void;
  onViewSolution: () => void;
  onCloseShortcutHelp: () => void;
  onCloseWalkthrough: () => void;
  onSkip: () => void;
  onRequestHint: () => void;
  onTogglePause: () => void;
  onEndSession: () => void;
  onToggleShortcutHelp: () => void;
  dispatch: React.Dispatch<SessionAction>;
}

export interface UseSessionKeyboardReturn {
  getGroupedShortcuts: () => Record<string, ShortcutConfig[]>;
  announcementRef: React.RefObject<HTMLDivElement | null>;
  announceToScreenReader: (message: string) => void;
}

// ============================================================================
// Hook
// ============================================================================

export function useSessionKeyboard(options: UseSessionKeyboardOptions): UseSessionKeyboardReturn {
  const {
    phase,
    isSessionEnded,
    shouldEndSession,
    showShortcutHelp,
    onNext,
    onViewSolution,
    onCloseShortcutHelp,
    onCloseWalkthrough,
    onSkip,
    onRequestHint,
    onTogglePause,
    onEndSession,
    onToggleShortcutHelp,
    dispatch
  } = options;

  // Screen reader announcement ref
  const announcementRef = useRef<HTMLDivElement>(null);

  // Screen reader announcement helper
  const announceToScreenReader = useCallback((message: string) => {
    if (announcementRef.current) {
      announcementRef.current.textContent = message;
    }
  }, []);

  // Keyboard shortcuts configuration
  // These are memoized to prevent unnecessary re-renders
  const keyboardShortcuts: ShortcutConfig[] = useMemo(() => {
    const shortcuts: ShortcutConfig[] = [
      // Navigation shortcuts
      {
        key: 'n',
        action: () => {
          if (phase === 'feedback' || phase === 'reviewing') {
            onNext();
            announceToScreenReader('Moving to next problem');
          }
        },
        description: 'Next problem',
        category: 'navigation',
        enabled: phase === 'feedback' || phase === 'reviewing'
      },
      {
        key: 's',
        action: () => {
          if (phase === 'feedback') {
            onViewSolution();
            announceToScreenReader('Viewing solution');
          }
        },
        description: 'View solution',
        category: 'navigation',
        enabled: phase === 'feedback'
      },

      // Input shortcuts
      {
        key: 'Escape',
        action: () => {
          if (showShortcutHelp) {
            onCloseShortcutHelp();
            announceToScreenReader('Closed keyboard shortcuts help');
          } else if (phase === 'reviewing') {
            onCloseWalkthrough();
            announceToScreenReader('Closed solution walkthrough');
          } else if (phase === 'paused') {
            dispatch({ type: 'RESUME_FROM_PAUSE' });
            announceToScreenReader('Session resumed');
          } else if (phase === 'answering') {
            onSkip();
            announceToScreenReader('Problem skipped');
          }
        },
        description: 'Skip problem / Close modal',
        category: 'input',
        allowInInput: true,
        enabled: true
      },
      {
        key: 'h',
        action: () => {
          if (phase === 'answering') {
            onRequestHint();
            announceToScreenReader('Hint requested');
          }
        },
        description: 'Request hint',
        category: 'input',
        enabled: phase === 'answering'
      },

      // Session shortcuts
      {
        key: ' ', // Space bar
        action: () => {
          if (phase !== 'reviewing' && !showShortcutHelp) {
            onTogglePause();
            announceToScreenReader(phase === 'paused' ? 'Session resumed' : 'Session paused');
          }
        },
        description: 'Pause/Resume session',
        category: 'session',
        enabled: phase !== 'reviewing' && !showShortcutHelp
      },
      {
        key: 'q',
        action: () => {
          if (!showShortcutHelp) {
            onEndSession();
            announceToScreenReader('Session ended');
          }
        },
        description: 'End session',
        category: 'session',
        enabled: !showShortcutHelp
      },
      {
        key: 'q',
        ctrl: true,
        action: () => {
          onEndSession();
          announceToScreenReader('Session ended');
        },
        description: 'End session',
        category: 'session',
        enabled: true
      },
      {
        key: '?',
        action: () => {
          onToggleShortcutHelp();
          announceToScreenReader(showShortcutHelp ? 'Closed keyboard shortcuts' : 'Opened keyboard shortcuts');
        },
        description: 'Show keyboard shortcuts',
        category: 'session',
        enabled: true
      }
    ];

    return shortcuts;
  }, [
    phase,
    showShortcutHelp,
    onNext,
    onViewSolution,
    onCloseShortcutHelp,
    onCloseWalkthrough,
    onSkip,
    onRequestHint,
    onTogglePause,
    onEndSession,
    onToggleShortcutHelp,
    dispatch,
    announceToScreenReader
  ]);

  // Initialize keyboard shortcuts hook
  const { getGroupedShortcuts } = useKeyboardShortcuts(keyboardShortcuts, {
    enabled: !isSessionEnded && !shouldEndSession
    // Note: Screen reader announcements are handled within individual shortcut actions
  });

  return {
    getGroupedShortcuts,
    announcementRef,
    announceToScreenReader
  };
}
