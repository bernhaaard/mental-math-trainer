import * as React from 'react';

/**
 * Size variants for the keyboard key
 */
export type KeyboardKeySize = 'sm' | 'md' | 'lg';

/**
 * Props for the KeyboardKey component
 */
export interface KeyboardKeyProps {
  /**
   * The key label to display (e.g., 'Enter', 'Ctrl', 'Q')
   */
  children: React.ReactNode;

  /**
   * Size of the key
   * @default 'md'
   */
  size?: KeyboardKeySize;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Styled component for displaying keyboard keys
 * Designed to look like an actual keyboard key with a pressed/3D effect
 *
 * Supports dark/light mode and various sizes
 *
 * @example
 * ```tsx
 * <KeyboardKey>Enter</KeyboardKey>
 * <KeyboardKey size="sm">Ctrl</KeyboardKey>
 * <KeyboardKey size="lg">Space</KeyboardKey>
 * ```
 */
export const KeyboardKey = React.forwardRef<HTMLElement, KeyboardKeyProps>(
  ({ children, size = 'md', className = '' }, ref) => {
    const sizeStyles: Record<KeyboardKeySize, string> = {
      sm: 'min-w-[1.5rem] h-5 px-1 text-xs',
      md: 'min-w-[2rem] h-6 px-1.5 text-sm',
      lg: 'min-w-[2.5rem] h-8 px-2 text-base',
    };

    const baseStyles = [
      // Layout
      'inline-flex items-center justify-center',
      // Typography
      'font-mono font-medium',
      // Border and shape - creates keyboard key appearance
      'rounded-md',
      // Light mode styling
      'bg-gray-100 text-gray-700',
      'border border-gray-300',
      'border-b-2 border-b-gray-400',
      // Dark mode styling
      'dark:bg-gray-700 dark:text-gray-200',
      'dark:border-gray-600',
      'dark:border-b-gray-500',
      // Shadow for depth
      'shadow-sm',
      // Prevent text selection
      'select-none',
    ].join(' ');

    const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${className}`.trim();

    return (
      <kbd ref={ref} className={combinedClassName}>
        {children}
      </kbd>
    );
  }
);

KeyboardKey.displayName = 'KeyboardKey';

/**
 * Props for the KeyboardShortcut component
 */
export interface KeyboardShortcutProps {
  /**
   * Array of key parts to display (e.g., ['Ctrl', 'Q'])
   */
  keys: string[];

  /**
   * Size of the keys
   * @default 'md'
   */
  size?: KeyboardKeySize;

  /**
   * Additional CSS classes for the container
   */
  className?: string;
}

/**
 * Component for displaying a keyboard shortcut with multiple keys
 * Joins keys with a '+' separator
 *
 * @example
 * ```tsx
 * <KeyboardShortcut keys={['Ctrl', 'Q']} />
 * <KeyboardShortcut keys={['Enter']} size="sm" />
 * ```
 */
export const KeyboardShortcut: React.FC<KeyboardShortcutProps> = ({
  keys,
  size = 'md',
  className = '',
}) => {
  if (keys.length === 0) return null;

  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`.trim()}>
      {keys.map((key, index) => (
        <React.Fragment key={`${key}-${index}`}>
          <KeyboardKey size={size}>{key}</KeyboardKey>
          {index < keys.length - 1 && (
            <span className="text-gray-400 dark:text-gray-500 text-xs mx-0.5">
              +
            </span>
          )}
        </React.Fragment>
      ))}
    </span>
  );
};

KeyboardShortcut.displayName = 'KeyboardShortcut';
