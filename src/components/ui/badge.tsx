import * as React from 'react';

/**
 * Badge component variants
 */
export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

/**
 * Props for the Badge component
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Visual variant of the badge
   * @default 'default'
   */
  variant?: BadgeVariant;

  /**
   * Content to display in the badge
   */
  children: React.ReactNode;
}

/**
 * Small badge/tag component for status indicators and labels
 *
 * @example
 * ```tsx
 * <Badge variant="success">Correct</Badge>
 * <Badge variant="error">Incorrect</Badge>
 * <Badge variant="info">Beginner</Badge>
 * ```
 */
export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ variant = 'default', className = '', children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors';

    const variantStyles: Record<BadgeVariant, string> = {
      default: 'bg-secondary text-secondary-foreground',
      success: 'bg-success text-success-foreground',
      warning: 'bg-warning text-warning-foreground',
      error: 'bg-error text-error-foreground',
      info: 'bg-accent text-accent-foreground'
    };

    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${className}`.trim();

    return (
      <div ref={ref} className={combinedClassName} {...props}>
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';
