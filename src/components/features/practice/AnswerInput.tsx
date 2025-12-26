'use client';

import {
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  FormEvent,
  KeyboardEvent
} from 'react';

/**
 * Props for AnswerInput component.
 */
export interface AnswerInputProps {
  /** Callback when user submits an answer */
  onSubmit: (answer: number) => void;
  /** Callback when user skips the problem */
  onSkip: () => void;
  /** Callback when user requests a hint */
  onRequestHint?: () => void;
  /** Whether the input is disabled (e.g., while checking answer) */
  disabled?: boolean;
  /** Whether to show the skip button */
  allowSkip?: boolean;
  /** Whether to show the hint button */
  allowHints?: boolean;
  /** Number of hints already used for this problem */
  hintsUsed?: number;
  /** Trigger error animation (controlled by parent) */
  showError?: boolean;
  /** Auto-focus the input on mount */
  autoFocus?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Key to trigger reset (change this to clear input for new problem) */
  resetKey?: string | number;
}

/**
 * Handle exposed by AnswerInput for imperative actions.
 */
export interface AnswerInputHandle {
  /** Clear the input field */
  clear: () => void;
  /** Focus the input field */
  focus: () => void;
  /** Get current input value */
  getValue: () => string;
}

/**
 * AnswerInput component provides input controls for user answers.
 * Features number-only input, keyboard support, and various action buttons.
 *
 * Can be used with a ref to imperatively control the input:
 * ```tsx
 * const inputRef = useRef<AnswerInputHandle>(null);
 * inputRef.current?.clear();
 * inputRef.current?.focus();
 * ```
 */
export const AnswerInput = forwardRef<AnswerInputHandle, AnswerInputProps>(
  function AnswerInput(
    {
      onSubmit,
      onSkip,
      onRequestHint,
      disabled = false,
      allowSkip = true,
      allowHints = true,
      hintsUsed = 0,
      showError = false,
      autoFocus = true,
      placeholder = 'Enter your answer',
      resetKey
    },
    ref
  ) {
    const [value, setValue] = useState<string>('');
    const [isShaking, setIsShaking] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Expose imperative handle
    useImperativeHandle(ref, () => ({
      clear: () => {
        setValue('');
        inputRef.current?.focus();
      },
      focus: () => {
        inputRef.current?.focus();
      },
      getValue: () => value
    }));

    // Auto-focus on mount
    useEffect(() => {
      if (autoFocus && inputRef.current) {
        inputRef.current.focus();
      }
    }, [autoFocus]);

    // Track previous resetKey to detect changes and reset value
    const prevResetKeyRef = useRef(resetKey);
    useEffect(() => {
      // Only reset if resetKey actually changed (not on initial render)
      if (prevResetKeyRef.current !== resetKey) {
        prevResetKeyRef.current = resetKey;
        // Use callback form and focus in same tick via ref
        setValue('');
        if (autoFocus && inputRef.current) {
          inputRef.current.focus();
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resetKey]);

    // Track previous showError to trigger shake animation
    const prevShowErrorRef = useRef(showError);
    const shakeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
      // Trigger shake only when showError transitions from false to true
      if (showError && !prevShowErrorRef.current) {
        // Clear any existing timeout
        if (shakeTimeoutRef.current) {
          clearTimeout(shakeTimeoutRef.current);
        }
        setIsShaking(true);
        shakeTimeoutRef.current = setTimeout(() => setIsShaking(false), 500);
      }
      prevShowErrorRef.current = showError;

      return () => {
        if (shakeTimeoutRef.current) {
          clearTimeout(shakeTimeoutRef.current);
        }
      };
    }, [showError]);

  /**
   * Handle input change - only allow valid number input.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Allow empty string, minus sign, and valid numbers
    if (newValue === '' || newValue === '-') {
      setValue(newValue);
      return;
    }

    // Validate it's a valid integer
    if (/^-?\d+$/.test(newValue)) {
      setValue(newValue);
    }
  };

  /**
   * Handle form submission.
   */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (disabled || value === '' || value === '-') {
      return;
    }

    const answer = parseInt(value, 10);

    if (isNaN(answer)) {
      return;
    }

    onSubmit(answer);
  };

  /**
   * Handle Enter key press.
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !disabled && value !== '' && value !== '-') {
      handleSubmit(e as unknown as FormEvent);
    }
  };

  /**
   * Clear the input field.
   */
  const handleClear = () => {
    setValue('');
    inputRef.current?.focus();
  };

  /**
   * Handle hint request.
   */
  const handleHintRequest = () => {
    if (onRequestHint) {
      onRequestHint();
    }
  };

  const canSubmit = value !== '' && value !== '-' && !disabled;

  return (
    <div className="space-y-4">
      {/* Input field */}
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            aria-label="Your answer"
            className={`w-full rounded-xl border-2 bg-gray-800/50 px-6 py-6 text-center font-mono text-4xl font-bold text-gray-100 placeholder-gray-600 backdrop-blur-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 sm:text-5xl md:text-6xl ${
              showError
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                : 'border-gray-700 hover:border-gray-600'
            } ${isShaking ? 'animate-shake' : ''}`}
          />

          {/* Clear button */}
          {value !== '' && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              aria-label="Clear input"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </form>

      {/* Action buttons */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Submit button */}
        <button
          onClick={(e) => handleSubmit(e as unknown as FormEvent)}
          disabled={!canSubmit}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-500 hover:to-blue-400 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:cursor-not-allowed disabled:from-gray-700 disabled:to-gray-700 disabled:opacity-50 disabled:shadow-none sm:col-span-2 lg:col-span-2"
          aria-label="Submit answer"
        >
          <span className="flex items-center justify-center gap-2">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Submit Answer
          </span>
        </button>

        {/* Hint button */}
        {allowHints && onRequestHint && (
          <button
            onClick={handleHintRequest}
            disabled={disabled}
            className="rounded-xl border-2 border-purple-500/30 bg-purple-500/10 px-6 py-4 font-semibold text-purple-300 transition-all duration-200 hover:border-purple-500/50 hover:bg-purple-500/20 focus:outline-none focus:ring-4 focus:ring-purple-500/50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={`Request hint (${hintsUsed} used)`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              Hint
              {hintsUsed > 0 && (
                <span className="text-sm">({hintsUsed})</span>
              )}
            </span>
          </button>
        )}

        {/* Skip button */}
        {allowSkip && (
          <button
            onClick={onSkip}
            disabled={disabled}
            className="rounded-xl border-2 border-gray-600 bg-gray-700/50 px-6 py-4 font-semibold text-gray-300 transition-all duration-200 hover:border-gray-500 hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-500/50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Skip this problem"
          >
            <span className="flex items-center justify-center gap-2">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Skip
            </span>
          </button>
        )}
      </div>

      {/* Keyboard hint */}
      <p className="text-center text-sm text-gray-500">
        Press <kbd className="rounded bg-gray-700 px-2 py-1 font-mono text-xs">Enter</kbd> to submit
      </p>
    </div>
  );
  }
);
