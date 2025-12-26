import * as React from 'react';

/**
 * Option for Select component
 */
export interface SelectOption {
  /**
   * Display label for the option
   */
  label: string;

  /**
   * Value of the option
   */
  value: string;

  /**
   * Whether the option is disabled
   * @default false
   */
  disabled?: boolean;
}

/**
 * Props for the Select component
 */
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /**
   * Options to display in the select
   */
  options: SelectOption[];

  /**
   * Label text for the select
   */
  label?: string;

  /**
   * Helper text displayed below the select
   */
  helperText?: string;

  /**
   * Error message to display
   */
  error?: string;

  /**
   * Whether the select is in an error state
   * @default false
   */
  hasError?: boolean;

  /**
   * Placeholder text when no option is selected
   */
  placeholder?: string;
}

/**
 * Reusable Select/dropdown component with label and error states
 *
 * @example
 * ```tsx
 * <Select
 *   label="Difficulty Level"
 *   placeholder="Select difficulty"
 *   options={[
 *     { label: 'Beginner', value: 'beginner' },
 *     { label: 'Intermediate', value: 'intermediate' }
 *   ]}
 *   value={selectedValue}
 *   onChange={handleChange}
 * />
 * ```
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      label,
      helperText,
      error,
      hasError = false,
      placeholder,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;
    const helperTextId = `${selectId}-helper`;
    const errorId = `${selectId}-error`;

    const baseStyles =
      'flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

    const errorStyles = hasError || error ? 'border-error focus-visible:ring-error' : 'border-border';

    const combinedClassName = `${baseStyles} ${errorStyles} ${className}`.trim();

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium mb-2 text-foreground"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={combinedClassName}
          aria-invalid={hasError || !!error}
          aria-describedby={
            error ? errorId : helperText ? helperTextId : undefined
          }
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
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

Select.displayName = 'Select';
