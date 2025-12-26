import * as React from 'react';

/**
 * Input component variants
 */
export type InputVariant = 'default' | 'large';

/**
 * Props for the Input component
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Visual variant of the input
   * @default 'default'
   */
  variant?: InputVariant;

  /**
   * Label text for the input
   */
  label?: string;

  /**
   * Helper text displayed below the input
   */
  helperText?: string;

  /**
   * Error message to display
   */
  error?: string;

  /**
   * Whether the input is in an error state
   * @default false
   */
  hasError?: boolean;
}

/**
 * Reusable Input component with label, helper text, and error states
 *
 * @example
 * ```tsx
 * <Input
 *   type="number"
 *   label="Your Answer"
 *   placeholder="Enter answer"
 *   error="Answer is incorrect"
 *   hasError
 * />
 * ```
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'default',
      label,
      helperText,
      error,
      hasError = false,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const helperTextId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    const baseStyles =
      'flex w-full rounded-lg border bg-background px-3 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

    const variantStyles: Record<InputVariant, string> = {
      default: 'h-10 py-2 text-base',
      large: 'h-16 py-4 text-2xl font-semibold text-center'
    };

    const errorStyles = hasError || error ? 'border-error focus-visible:ring-error' : 'border-border';

    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${errorStyles} ${className}`.trim();

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium mb-2 text-foreground"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={combinedClassName}
          aria-invalid={hasError || !!error}
          aria-describedby={
            error ? errorId : helperText ? helperTextId : undefined
          }
          {...props}
        />
        {helperText && !error && (
          <p id={helperTextId} className="mt-1.5 text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
        {error && (
          <p id={errorId} className="mt-1.5 text-sm text-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
