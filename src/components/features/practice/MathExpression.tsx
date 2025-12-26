/**
 * MathExpression component - Renders mathematical expressions with proper formatting.
 * @module components/features/practice/MathExpression
 */

'use client';

import type { ReactNode } from 'react';

interface MathExpressionProps {
  /** The mathematical expression to render */
  expression: string;
  /** Optional CSS class for styling */
  className?: string;
  /** Whether to highlight the expression (e.g., for current step) */
  highlighted?: boolean;
}

/**
 * Renders a mathematical expression with proper formatting and styling.
 * Converts operators to proper symbols and applies appropriate styling.
 */
export function MathExpression({
  expression,
  className = '',
  highlighted = false
}: MathExpressionProps) {
  // Format the expression with proper mathematical symbols
  const formatExpression = (expr: string): ReactNode[] => {
    const parts: ReactNode[] = [];
    let currentNumber = '';
    let currentKey = 0;

    const flushNumber = () => {
      if (currentNumber) {
        parts.push(
          <span
            key={currentKey++}
            className="text-primary font-semibold"
          >
            {currentNumber}
          </span>
        );
        currentNumber = '';
      }
    };

    for (let i = 0; i < expr.length; i++) {
      const char = expr.charAt(i);

      // Check if it's a digit, decimal point, or negative sign at start of number
      const prevChar = i > 0 ? expr.charAt(i - 1) : '';
      if (/[0-9.]/.test(char) || (char === '-' && (i === 0 || /[\s(+\-*/]/.test(prevChar)))) {
        currentNumber += char;
      } else {
        flushNumber();

        // Handle operators and special characters
        switch (char) {
          case '*':
          case '×':
            parts.push(
              <span key={currentKey++} className="text-accent font-bold px-1">
                ×
              </span>
            );
            break;
          case '-':
            parts.push(
              <span key={currentKey++} className="text-accent font-bold px-1">
                −
              </span>
            );
            break;
          case '+':
            parts.push(
              <span key={currentKey++} className="text-accent font-bold px-1">
                +
              </span>
            );
            break;
          case '/':
            parts.push(
              <span key={currentKey++} className="text-accent font-bold px-1">
                ÷
              </span>
            );
            break;
          case '=':
            parts.push(
              <span key={currentKey++} className="text-muted-foreground font-bold px-2">
                =
              </span>
            );
            break;
          case '(':
          case ')':
            parts.push(
              <span key={currentKey++} className="text-foreground font-bold">
                {char}
              </span>
            );
            break;
          case ' ':
            // Skip spaces as we're adding them with padding
            break;
          default:
            // Any other character (shouldn't happen with valid expressions)
            parts.push(
              <span key={currentKey++}>
                {char}
              </span>
            );
        }
      }
    }

    flushNumber();
    return parts;
  };

  return (
    <code
      className={`
        font-mono text-lg inline-flex items-center
        ${highlighted ? 'bg-accent/10 px-3 py-1 rounded-md' : ''}
        ${className}
      `}
    >
      {formatExpression(expression)}
    </code>
  );
}
