'use client';

import { useEffect, useCallback, useRef } from 'react';

/**
 * Categories for organizing keyboard shortcuts in the help modal
 */
export type ShortcutCategory = 'navigation' | 'input' | 'session';

/**
 * Configuration for a single keyboard shortcut
 */
export interface ShortcutConfig {
  /**
   * The key to listen for (e.g., 'Enter', 'Escape', 'h', '?')
   * Uses KeyboardEvent.key values
   */
  key: string;

  /**
   * Whether the Ctrl/Cmd key must be pressed
   * @default false
   */
  ctrl?: boolean;

  /**
   * Whether the Shift key must be pressed
   * @default false
   */
  shift?: boolean;

  /**
   * Whether the Alt/Option key must be pressed
   * @default false
   */
  alt?: boolean;

  /**
   * The action to perform when the shortcut is triggered
   */
  action: () => void;

  /**
   * Human-readable description of what the shortcut does
   */
  description: string;

  /**
   * Category for grouping shortcuts in the help modal
   */
  category: ShortcutCategory;

  /**
   * Whether this shortcut should work when an input/textarea is focused
   * @default false
   */
  allowInInput?: boolean;

  /**
   * Whether this shortcut is currently enabled
   * @default true
   */
  enabled?: boolean;
}

/**
 * Options for the useKeyboardShortcuts hook
 */
export interface UseKeyboardShortcutsOptions {
  /**
   * Whether the entire keyboard shortcuts system is enabled
   * @default true
   */
  enabled?: boolean;

  /**
   * Callback when a shortcut is triggered (for analytics or accessibility announcements)
   */
  onShortcutTriggered?: (shortcut: ShortcutConfig) => void;
}

/**
 * Return type of the useKeyboardShortcuts hook
 */
export interface UseKeyboardShortcutsReturn {
  /**
   * All registered shortcuts
   */
  shortcuts: ShortcutConfig[];

  /**
   * Get shortcuts filtered by category
   */
  getShortcutsByCategory: (category: ShortcutCategory) => ShortcutConfig[];

  /**
   * Get all enabled shortcuts grouped by category
   */
  getGroupedShortcuts: () => Record<ShortcutCategory, ShortcutConfig[]>;
}

/**
 * Checks if the current active element is an input or textarea
 */
function isInputFocused(): boolean {
  const activeElement = document.activeElement;
  if (!activeElement) return false;

  const tagName = activeElement.tagName.toLowerCase();
  const isInput = tagName === 'input' || tagName === 'textarea';
  const isContentEditable = (activeElement as HTMLElement).isContentEditable;

  return isInput || isContentEditable;
}

/**
 * Normalizes a key string for comparison (handles case sensitivity)
 */
function normalizeKey(key: string): string {
  // Single character keys should be case-insensitive
  if (key.length === 1) {
    return key.toLowerCase();
  }
  // Special keys like 'Enter', 'Escape' should match exactly
  return key;
}

/**
 * Checks if a keyboard event matches a shortcut configuration
 */
function eventMatchesShortcut(event: KeyboardEvent, shortcut: ShortcutConfig): boolean {
  // Check modifier keys
  if (shortcut.ctrl && !(event.ctrlKey || event.metaKey)) return false;
  if (shortcut.shift && !event.shiftKey) return false;
  if (shortcut.alt && !event.altKey) return false;

  // If modifier is not required, make sure it's not pressed (except for ctrl/meta which is special)
  // This prevents accidental triggers when using browser shortcuts
  if (!shortcut.ctrl && !shortcut.alt && event.altKey) return false;

  // Normalize and compare keys
  const eventKey = normalizeKey(event.key);
  const shortcutKey = normalizeKey(shortcut.key);

  return eventKey === shortcutKey;
}

/**
 * Hook for managing keyboard shortcuts in the practice mode
 *
 * Features:
 * - Prevents shortcuts from triggering when typing in inputs (unless explicitly allowed)
 * - Uses event.preventDefault() appropriately
 * - Supports modifier keys (Ctrl, Shift, Alt)
 * - Announces actions to screen readers via callback
 * - Avoids conflicts with browser shortcuts
 *
 * @example
 * ```tsx
 * const shortcuts: ShortcutConfig[] = [
 *   { key: 'Enter', action: handleSubmit, description: 'Submit answer', category: 'input' },
 *   { key: 'Escape', action: handleSkip, description: 'Skip problem', category: 'input' },
 * ];
 *
 * const { getGroupedShortcuts } = useKeyboardShortcuts(shortcuts, {
 *   onShortcutTriggered: (shortcut) => announceToScreenReader(shortcut.description)
 * });
 * ```
 */
export function useKeyboardShortcuts(
  shortcuts: ShortcutConfig[],
  options: UseKeyboardShortcutsOptions = {}
): UseKeyboardShortcutsReturn {
  const { enabled = true, onShortcutTriggered } = options;

  // Use ref to avoid stale closures
  const shortcutsRef = useRef(shortcuts);
  const onShortcutTriggeredRef = useRef(onShortcutTriggered);

  // Update refs in an effect to avoid accessing refs during render
  useEffect(() => {
    shortcutsRef.current = shortcuts;
    onShortcutTriggeredRef.current = onShortcutTriggered;
  });

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const inputFocused = isInputFocused();

      for (const shortcut of shortcutsRef.current) {
        // Skip disabled shortcuts
        if (shortcut.enabled === false) continue;

        // Skip if input is focused and shortcut doesn't allow it
        if (inputFocused && !shortcut.allowInInput) continue;

        // Check if event matches shortcut
        if (eventMatchesShortcut(event, shortcut)) {
          // Prevent default browser behavior
          event.preventDefault();

          // Stop propagation to prevent parent handlers
          event.stopPropagation();

          // Execute the action
          shortcut.action();

          // Notify callback for accessibility announcements
          if (onShortcutTriggeredRef.current) {
            onShortcutTriggeredRef.current(shortcut);
          }

          // Only trigger first matching shortcut
          break;
        }
      }
    },
    [enabled]
  );

  // Attach event listener
  useEffect(() => {
    if (!enabled) return;

    // Use capture phase to intercept events before other handlers
    window.addEventListener('keydown', handleKeyDown, { capture: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [enabled, handleKeyDown]);

  // Utility functions
  const getShortcutsByCategory = useCallback(
    (category: ShortcutCategory): ShortcutConfig[] => {
      return shortcuts.filter(
        (s) => s.category === category && s.enabled !== false
      );
    },
    [shortcuts]
  );

  const getGroupedShortcuts = useCallback((): Record<
    ShortcutCategory,
    ShortcutConfig[]
  > => {
    const grouped: Record<ShortcutCategory, ShortcutConfig[]> = {
      navigation: [],
      input: [],
      session: [],
    };

    for (const shortcut of shortcuts) {
      if (shortcut.enabled !== false) {
        grouped[shortcut.category].push(shortcut);
      }
    }

    return grouped;
  }, [shortcuts]);

  return {
    shortcuts,
    getShortcutsByCategory,
    getGroupedShortcuts,
  };
}

/**
 * Format a shortcut configuration into a human-readable key combination
 *
 * @example
 * formatShortcutKey({ key: 'q', ctrl: true }) // 'Ctrl+Q'
 * formatShortcutKey({ key: 'Enter' }) // 'Enter'
 */
export function formatShortcutKey(shortcut: ShortcutConfig): string {
  const parts: string[] = [];

  if (shortcut.ctrl) {
    // Use Cmd on Mac, Ctrl elsewhere
    parts.push(typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent) ? 'Cmd' : 'Ctrl');
  }

  if (shortcut.alt) {
    parts.push(typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent) ? 'Option' : 'Alt');
  }

  if (shortcut.shift) {
    parts.push('Shift');
  }

  // Capitalize single-character keys
  const key = shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key;
  parts.push(key);

  return parts.join('+');
}

/**
 * Parse a shortcut key combination into separate parts
 *
 * @example
 * parseShortcutKey({ key: 'q', ctrl: true }) // ['Ctrl', 'Q']
 * parseShortcutKey({ key: 'Enter' }) // ['Enter']
 */
export function parseShortcutKey(shortcut: ShortcutConfig): string[] {
  const parts: string[] = [];

  if (shortcut.ctrl) {
    parts.push(typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent) ? 'Cmd' : 'Ctrl');
  }

  if (shortcut.alt) {
    parts.push(typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent) ? 'Option' : 'Alt');
  }

  if (shortcut.shift) {
    parts.push('Shift');
  }

  // Capitalize single-character keys
  const key = shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key;
  parts.push(key);

  return parts;
}
