'use client';

import * as React from 'react';
import { useEffect, useRef, useCallback } from 'react';
import { KeyboardShortcut } from './KeyboardKey';
import type { ShortcutConfig, ShortcutCategory } from '@/lib/hooks/useKeyboardShortcuts';
import { parseShortcutKey } from '@/lib/hooks/useKeyboardShortcuts';

/**
 * Category display information
 */
interface CategoryInfo {
  label: string;
  description: string;
  icon: React.ReactNode;
}

/**
 * Category metadata for display
 */
const CATEGORY_INFO: Record<ShortcutCategory, CategoryInfo> = {
  navigation: {
    label: 'Navigation',
    description: 'Move through the session',
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 5l7 7-7 7"
        />
      </svg>
    ),
  },
  input: {
    label: 'Input',
    description: 'Answer and interact with problems',
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
        />
      </svg>
    ),
  },
  session: {
    label: 'Session',
    description: 'Control the practice session',
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
};

/**
 * Props for the KeyboardShortcutHelp component
 */
export interface KeyboardShortcutHelpProps {
  /**
   * Whether the modal is open
   */
  isOpen: boolean;

  /**
   * Callback to close the modal
   */
  onClose: () => void;

  /**
   * Shortcuts grouped by category
   */
  shortcuts: Record<ShortcutCategory, ShortcutConfig[]>;

  /**
   * Title of the modal
   * @default 'Keyboard Shortcuts'
   */
  title?: string;
}

/**
 * Modal overlay showing all available keyboard shortcuts
 * Grouped by category with key combination displays
 *
 * Features:
 * - Close with Escape key
 * - Click outside to close
 * - Focus trap for accessibility
 * - Screen reader announcements
 *
 * @example
 * ```tsx
 * const { getGroupedShortcuts } = useKeyboardShortcuts(shortcuts);
 *
 * <KeyboardShortcutHelp
 *   isOpen={showHelp}
 *   onClose={() => setShowHelp(false)}
 *   shortcuts={getGroupedShortcuts()}
 * />
 * ```
 */
export const KeyboardShortcutHelp: React.FC<KeyboardShortcutHelpProps> = ({
  isOpen,
  onClose,
  shortcuts,
  title = 'Keyboard Shortcuts',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Handle Escape key to close
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    },
    [onClose]
  );

  // Handle click outside to close
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Focus management and escape key listener
  useEffect(() => {
    if (!isOpen) return;

    // Focus the close button when opening
    closeButtonRef.current?.focus();

    // Add escape key listener
    window.addEventListener('keydown', handleKeyDown);

    // Prevent body scroll when modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, handleKeyDown]);

  // Don't render if not open
  if (!isOpen) return null;

  // Get categories that have shortcuts
  const activeCategories = (
    Object.keys(shortcuts) as ShortcutCategory[]
  ).filter((category) => shortcuts[category].length > 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="keyboard-shortcuts-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-lg max-h-[85vh] overflow-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl"
        role="document"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2
            id="keyboard-shortcuts-title"
            className="text-xl font-semibold text-gray-900 dark:text-gray-100"
          >
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            aria-label="Close keyboard shortcuts"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {activeCategories.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No keyboard shortcuts available.
            </p>
          ) : (
            activeCategories.map((category) => {
              const info = CATEGORY_INFO[category];
              const categoryShortcuts = shortcuts[category];

              return (
                <section key={category} aria-labelledby={`category-${category}`}>
                  {/* Category Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-gray-500 dark:text-gray-400">
                      {info.icon}
                    </span>
                    <h3
                      id={`category-${category}`}
                      className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide"
                    >
                      {info.label}
                    </h3>
                  </div>

                  {/* Shortcuts List */}
                  <ul className="space-y-2">
                    {categoryShortcuts.map((shortcut, index) => {
                      const keyParts = parseShortcutKey(shortcut);

                      return (
                        <li
                          key={`${shortcut.key}-${index}`}
                          className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                        >
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {shortcut.description}
                          </span>
                          <KeyboardShortcut keys={keyParts} size="sm" />
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Press <KeyboardShortcut keys={['?']} size="sm" /> anytime to show
            this help
          </p>
        </div>
      </div>
    </div>
  );
};

KeyboardShortcutHelp.displayName = 'KeyboardShortcutHelp';
