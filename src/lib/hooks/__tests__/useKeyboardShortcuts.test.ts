import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useKeyboardShortcuts,
  formatShortcutKey,
  parseShortcutKey,
  type ShortcutConfig
} from '../useKeyboardShortcuts';

// Mock navigator for platform detection
const originalNavigator = global.navigator;

describe('useKeyboardShortcuts', () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('hook initialization', () => {
    it('should register keydown event listener on mount', () => {
      const shortcuts: ShortcutConfig[] = [
        {
          key: 'Enter',
          action: vi.fn(),
          description: 'Submit',
          category: 'input'
        }
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function),
        { capture: true }
      );
    });

    it('should remove event listener on unmount', () => {
      const shortcuts: ShortcutConfig[] = [
        {
          key: 'Enter',
          action: vi.fn(),
          description: 'Submit',
          category: 'input'
        }
      ];

      const { unmount } = renderHook(() => useKeyboardShortcuts(shortcuts));
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function),
        { capture: true }
      );
    });

    it('should not register event listener when disabled', () => {
      const shortcuts: ShortcutConfig[] = [
        {
          key: 'Enter',
          action: vi.fn(),
          description: 'Submit',
          category: 'input'
        }
      ];

      renderHook(() =>
        useKeyboardShortcuts(shortcuts, { enabled: false })
      );

      expect(addEventListenerSpy).not.toHaveBeenCalled();
    });
  });

  describe('shortcut triggering', () => {
    it('should call action when matching key is pressed', () => {
      const action = vi.fn();
      const shortcuts: ShortcutConfig[] = [
        {
          key: 'h',
          action,
          description: 'Get help',
          category: 'input'
        }
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      // Get the handler function that was passed to addEventListener
      const handler = addEventListenerSpy.mock.calls[0][1] as EventListener;

      // Create and dispatch a keyboard event
      const event = new KeyboardEvent('keydown', {
        key: 'h',
        bubbles: true
      });
      Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
      Object.defineProperty(event, 'stopPropagation', { value: vi.fn() });

      act(() => {
        handler(event);
      });

      expect(action).toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('should handle case-insensitive key matching', () => {
      const action = vi.fn();
      const shortcuts: ShortcutConfig[] = [
        {
          key: 'H', // uppercase in config
          action,
          description: 'Get help',
          category: 'input'
        }
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));
      const handler = addEventListenerSpy.mock.calls[0][1] as EventListener;

      const event = new KeyboardEvent('keydown', {
        key: 'h', // lowercase in event
        bubbles: true
      });
      Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
      Object.defineProperty(event, 'stopPropagation', { value: vi.fn() });

      act(() => {
        handler(event);
      });

      expect(action).toHaveBeenCalled();
    });

    it('should not trigger action when shortcut is disabled', () => {
      const action = vi.fn();
      const shortcuts: ShortcutConfig[] = [
        {
          key: 'h',
          action,
          description: 'Get help',
          category: 'input',
          enabled: false
        }
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));
      const handler = addEventListenerSpy.mock.calls[0][1] as EventListener;

      const event = new KeyboardEvent('keydown', {
        key: 'h',
        bubbles: true
      });

      act(() => {
        handler(event);
      });

      expect(action).not.toHaveBeenCalled();
    });

    it('should trigger action with Ctrl modifier', () => {
      const action = vi.fn();
      const shortcuts: ShortcutConfig[] = [
        {
          key: 'q',
          ctrl: true,
          action,
          description: 'Quit',
          category: 'session'
        }
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));
      const handler = addEventListenerSpy.mock.calls[0][1] as EventListener;

      const event = new KeyboardEvent('keydown', {
        key: 'q',
        ctrlKey: true,
        bubbles: true
      });
      Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
      Object.defineProperty(event, 'stopPropagation', { value: vi.fn() });

      act(() => {
        handler(event);
      });

      expect(action).toHaveBeenCalled();
    });

    it('should trigger action with Meta key (Cmd on Mac)', () => {
      const action = vi.fn();
      const shortcuts: ShortcutConfig[] = [
        {
          key: 'q',
          ctrl: true,
          action,
          description: 'Quit',
          category: 'session'
        }
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));
      const handler = addEventListenerSpy.mock.calls[0][1] as EventListener;

      const event = new KeyboardEvent('keydown', {
        key: 'q',
        metaKey: true, // Cmd key on Mac
        bubbles: true
      });
      Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
      Object.defineProperty(event, 'stopPropagation', { value: vi.fn() });

      act(() => {
        handler(event);
      });

      expect(action).toHaveBeenCalled();
    });

    it('should not trigger when Ctrl is required but not pressed', () => {
      const action = vi.fn();
      const shortcuts: ShortcutConfig[] = [
        {
          key: 'q',
          ctrl: true,
          action,
          description: 'Quit',
          category: 'session'
        }
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));
      const handler = addEventListenerSpy.mock.calls[0][1] as EventListener;

      const event = new KeyboardEvent('keydown', {
        key: 'q',
        ctrlKey: false,
        bubbles: true
      });

      act(() => {
        handler(event);
      });

      expect(action).not.toHaveBeenCalled();
    });

    it('should trigger action with Shift modifier', () => {
      const action = vi.fn();
      const shortcuts: ShortcutConfig[] = [
        {
          key: '?',
          shift: true,
          action,
          description: 'Help',
          category: 'session'
        }
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));
      const handler = addEventListenerSpy.mock.calls[0][1] as EventListener;

      const event = new KeyboardEvent('keydown', {
        key: '?',
        shiftKey: true,
        bubbles: true
      });
      Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
      Object.defineProperty(event, 'stopPropagation', { value: vi.fn() });

      act(() => {
        handler(event);
      });

      expect(action).toHaveBeenCalled();
    });

    it('should trigger action with Alt modifier', () => {
      const action = vi.fn();
      const shortcuts: ShortcutConfig[] = [
        {
          key: 'h',
          alt: true,
          action,
          description: 'Help',
          category: 'session'
        }
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));
      const handler = addEventListenerSpy.mock.calls[0][1] as EventListener;

      const event = new KeyboardEvent('keydown', {
        key: 'h',
        altKey: true,
        bubbles: true
      });
      Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
      Object.defineProperty(event, 'stopPropagation', { value: vi.fn() });

      act(() => {
        handler(event);
      });

      expect(action).toHaveBeenCalled();
    });

    it('should call onShortcutTriggered callback', () => {
      const action = vi.fn();
      const onShortcutTriggered = vi.fn();
      const shortcuts: ShortcutConfig[] = [
        {
          key: 'h',
          action,
          description: 'Get help',
          category: 'input'
        }
      ];

      renderHook(() =>
        useKeyboardShortcuts(shortcuts, { onShortcutTriggered })
      );
      const handler = addEventListenerSpy.mock.calls[0][1] as EventListener;

      const event = new KeyboardEvent('keydown', {
        key: 'h',
        bubbles: true
      });
      Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
      Object.defineProperty(event, 'stopPropagation', { value: vi.fn() });

      act(() => {
        handler(event);
      });

      expect(onShortcutTriggered).toHaveBeenCalledWith(shortcuts[0]);
    });

    it('should only trigger first matching shortcut', () => {
      const action1 = vi.fn();
      const action2 = vi.fn();
      const shortcuts: ShortcutConfig[] = [
        {
          key: 'h',
          action: action1,
          description: 'Help 1',
          category: 'input'
        },
        {
          key: 'h',
          action: action2,
          description: 'Help 2',
          category: 'input'
        }
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));
      const handler = addEventListenerSpy.mock.calls[0][1] as EventListener;

      const event = new KeyboardEvent('keydown', {
        key: 'h',
        bubbles: true
      });
      Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
      Object.defineProperty(event, 'stopPropagation', { value: vi.fn() });

      act(() => {
        handler(event);
      });

      expect(action1).toHaveBeenCalled();
      expect(action2).not.toHaveBeenCalled();
    });
  });

  describe('input focus handling', () => {
    it('should not trigger shortcuts when input is focused (default behavior)', () => {
      const action = vi.fn();
      const shortcuts: ShortcutConfig[] = [
        {
          key: 'h',
          action,
          description: 'Help',
          category: 'input'
          // allowInInput is false by default
        }
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));
      const handler = addEventListenerSpy.mock.calls[0][1] as EventListener;

      // Create a mock input element and set it as active
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      const event = new KeyboardEvent('keydown', {
        key: 'h',
        bubbles: true
      });

      act(() => {
        handler(event);
      });

      expect(action).not.toHaveBeenCalled();

      // Cleanup
      document.body.removeChild(input);
    });

    it('should trigger shortcuts when input is focused if allowInInput is true', () => {
      const action = vi.fn();
      const shortcuts: ShortcutConfig[] = [
        {
          key: 'Escape',
          action,
          description: 'Cancel',
          category: 'input',
          allowInInput: true
        }
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));
      const handler = addEventListenerSpy.mock.calls[0][1] as EventListener;

      // Create a mock input element and set it as active
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true
      });
      Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
      Object.defineProperty(event, 'stopPropagation', { value: vi.fn() });

      act(() => {
        handler(event);
      });

      expect(action).toHaveBeenCalled();

      // Cleanup
      document.body.removeChild(input);
    });
  });

  describe('getShortcutsByCategory', () => {
    it('should return shortcuts for a specific category', () => {
      const shortcuts: ShortcutConfig[] = [
        { key: 'n', action: vi.fn(), description: 'Next', category: 'navigation' },
        { key: 'h', action: vi.fn(), description: 'Help', category: 'input' },
        { key: 'q', action: vi.fn(), description: 'Quit', category: 'session' }
      ];

      const { result } = renderHook(() => useKeyboardShortcuts(shortcuts));

      const navShortcuts = result.current.getShortcutsByCategory('navigation');
      expect(navShortcuts).toHaveLength(1);
      expect(navShortcuts[0]?.key).toBe('n');
      expect(result.current.getShortcutsByCategory('input')).toHaveLength(1);
      expect(result.current.getShortcutsByCategory('session')).toHaveLength(1);
    });

    it('should exclude disabled shortcuts', () => {
      const shortcuts: ShortcutConfig[] = [
        { key: 'n', action: vi.fn(), description: 'Next', category: 'navigation' },
        { key: 'p', action: vi.fn(), description: 'Prev', category: 'navigation', enabled: false }
      ];

      const { result } = renderHook(() => useKeyboardShortcuts(shortcuts));

      const navShortcuts = result.current.getShortcutsByCategory('navigation');
      expect(navShortcuts).toHaveLength(1);
      expect(navShortcuts[0]?.key).toBe('n');
    });
  });

  describe('getGroupedShortcuts', () => {
    it('should return shortcuts grouped by category', () => {
      const shortcuts: ShortcutConfig[] = [
        { key: 'n', action: vi.fn(), description: 'Next', category: 'navigation' },
        { key: 's', action: vi.fn(), description: 'Solution', category: 'navigation' },
        { key: 'h', action: vi.fn(), description: 'Help', category: 'input' },
        { key: 'q', action: vi.fn(), description: 'Quit', category: 'session' }
      ];

      const { result } = renderHook(() => useKeyboardShortcuts(shortcuts));
      const grouped = result.current.getGroupedShortcuts();

      expect(grouped.navigation).toHaveLength(2);
      expect(grouped.input).toHaveLength(1);
      expect(grouped.session).toHaveLength(1);
    });

    it('should return empty arrays for categories with no shortcuts', () => {
      const shortcuts: ShortcutConfig[] = [
        { key: 'n', action: vi.fn(), description: 'Next', category: 'navigation' }
      ];

      const { result } = renderHook(() => useKeyboardShortcuts(shortcuts));
      const grouped = result.current.getGroupedShortcuts();

      expect(grouped.navigation).toHaveLength(1);
      expect(grouped.input).toHaveLength(0);
      expect(grouped.session).toHaveLength(0);
    });
  });
});

describe('formatShortcutKey', () => {
  beforeEach(() => {
    // Mock navigator for non-Mac platform
    Object.defineProperty(global, 'navigator', {
      value: { userAgent: 'Windows' },
      writable: true
    });
  });

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true
    });
  });

  it('should format simple key', () => {
    expect(formatShortcutKey({ key: 'h', action: vi.fn(), description: '', category: 'input' }))
      .toBe('H');
  });

  it('should format special key', () => {
    expect(formatShortcutKey({ key: 'Enter', action: vi.fn(), description: '', category: 'input' }))
      .toBe('Enter');
  });

  it('should format key with Ctrl modifier', () => {
    expect(formatShortcutKey({ key: 'q', ctrl: true, action: vi.fn(), description: '', category: 'input' }))
      .toBe('Ctrl+Q');
  });

  it('should format key with multiple modifiers', () => {
    expect(formatShortcutKey({ key: 's', ctrl: true, shift: true, action: vi.fn(), description: '', category: 'input' }))
      .toBe('Ctrl+Shift+S');
  });

  it('should format key with Alt modifier', () => {
    expect(formatShortcutKey({ key: 'h', alt: true, action: vi.fn(), description: '', category: 'input' }))
      .toBe('Alt+H');
  });
});

describe('parseShortcutKey', () => {
  beforeEach(() => {
    // Mock navigator for non-Mac platform
    Object.defineProperty(global, 'navigator', {
      value: { userAgent: 'Windows' },
      writable: true
    });
  });

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true
    });
  });

  it('should parse simple key into array', () => {
    expect(parseShortcutKey({ key: 'h', action: vi.fn(), description: '', category: 'input' }))
      .toEqual(['H']);
  });

  it('should parse key with Ctrl modifier', () => {
    expect(parseShortcutKey({ key: 'q', ctrl: true, action: vi.fn(), description: '', category: 'input' }))
      .toEqual(['Ctrl', 'Q']);
  });

  it('should parse key with multiple modifiers', () => {
    expect(parseShortcutKey({ key: 's', ctrl: true, shift: true, alt: true, action: vi.fn(), description: '', category: 'input' }))
      .toEqual(['Ctrl', 'Alt', 'Shift', 'S']);
  });

  it('should preserve special key names', () => {
    expect(parseShortcutKey({ key: 'Escape', action: vi.fn(), description: '', category: 'input' }))
      .toEqual(['Escape']);
  });
});
