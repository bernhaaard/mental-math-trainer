import * as React from 'react';

/**
 * Props for the Progress component
 */
export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Current progress value (0-100)
   */
  value: number;

  /**
   * Maximum value
   * @default 100
   */
  max?: number;

  /**
   * Optional label to display
   */
  label?: string;

  /**
   * Whether to show percentage text
   * @default false
   */
  showPercentage?: boolean;
}

/**
 * Progress bar component for displaying completion percentage
 *
 * @example
 * ```tsx
 * <Progress value={75} showPercentage />
 * <Progress value={50} label="Session Progress" />
 * ```
 */
export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value,
      max = 100,
      label,
      showPercentage = false,
      className = '',
      ...props
    },
    ref
  ) => {
    // Ensure value is within bounds
    const normalizedValue = Math.min(Math.max(value, 0), max);
    const percentage = (normalizedValue / max) * 100;

    return (
      <div ref={ref} className={`w-full ${className}`.trim()} {...props}>
        {(label || showPercentage) && (
          <div className="flex justify-between items-center mb-2">
            {label && (
              <span className="text-sm font-medium text-foreground">
                {label}
              </span>
            )}
            {showPercentage && (
              <span className="text-sm font-medium text-muted-foreground">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-valuenow={normalizedValue}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
        >
          <div
            className="h-full bg-primary transition-all duration-300 ease-in-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';
