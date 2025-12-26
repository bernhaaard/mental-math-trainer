/**
 * MethodIntroduction component - Renders the introduction section for a calculation method.
 * @module components/features/study/MethodIntroduction
 */

'use client';

import * as React from 'react';
import { MethodName } from '@/lib/types/method';

/**
 * Link to a related method for navigation
 */
interface MethodLink {
  /** The method to link to */
  method: MethodName;
  /** Display name for the link */
  displayName: string;
}

/**
 * Props for the MethodIntroduction component
 */
export interface MethodIntroductionProps {
  /** The introduction text content (supports markdown-like formatting) */
  introduction: string;
  /** List of scenarios where this method excels */
  whenToUse: string[];
  /** Methods that should be learned before this one */
  prerequisites?: MethodLink[];
  /** Recommended methods to learn after mastering this one */
  nextMethods?: MethodLink[];
  /** Callback when a method link is clicked */
  onMethodLinkClick?: (method: MethodName) => void;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Parses simple markdown-like text and returns formatted React elements.
 * Supports: **bold**, *italic*, `code`, headers (##, ###)
 */
function parseFormattedText(text: string): React.ReactNode[] {
  const lines = text.trim().split('\n');
  const result: React.ReactNode[] = [];

  lines.forEach((line, lineIndex) => {
    const trimmedLine = line.trim();

    // Skip empty lines but add spacing
    if (trimmedLine === '') {
      result.push(<div key={`space-${lineIndex}`} className="h-4" />);
      return;
    }

    // Handle headers
    if (trimmedLine.startsWith('### ')) {
      result.push(
        <h4
          key={`h4-${lineIndex}`}
          className="text-base font-semibold text-foreground mt-4 mb-2"
        >
          {trimmedLine.slice(4)}
        </h4>
      );
      return;
    }

    if (trimmedLine.startsWith('## ')) {
      result.push(
        <h3
          key={`h3-${lineIndex}`}
          className="text-lg font-semibold text-foreground mt-6 mb-3"
        >
          {trimmedLine.slice(3)}
        </h3>
      );
      return;
    }

    // Parse inline formatting
    const parsedLine = parseInlineFormatting(trimmedLine, lineIndex);
    result.push(
      <p key={`p-${lineIndex}`} className="text-foreground/90 leading-relaxed mb-2">
        {parsedLine}
      </p>
    );
  });

  return result;
}

/**
 * Parses inline formatting within a line of text.
 * Supports: **bold**, *italic*, `code`
 */
function parseInlineFormatting(text: string, keyPrefix: number): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  const currentText = text;
  let partIndex = 0;

  // Pattern to match **bold**, *italic*, or `code`
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(currentText)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      result.push(
        <React.Fragment key={`${keyPrefix}-text-${partIndex}`}>
          {currentText.slice(lastIndex, match.index)}
        </React.Fragment>
      );
      partIndex++;
    }

    const matchedText = match[0];

    if (matchedText.startsWith('**') && matchedText.endsWith('**')) {
      // Bold text
      result.push(
        <strong
          key={`${keyPrefix}-bold-${partIndex}`}
          className="font-semibold text-foreground"
        >
          {matchedText.slice(2, -2)}
        </strong>
      );
    } else if (matchedText.startsWith('*') && matchedText.endsWith('*')) {
      // Italic text
      result.push(
        <em key={`${keyPrefix}-italic-${partIndex}`} className="italic">
          {matchedText.slice(1, -1)}
        </em>
      );
    } else if (matchedText.startsWith('`') && matchedText.endsWith('`')) {
      // Inline code
      result.push(
        <code
          key={`${keyPrefix}-code-${partIndex}`}
          className="px-1.5 py-0.5 rounded bg-muted font-mono text-sm text-accent"
        >
          {matchedText.slice(1, -1)}
        </code>
      );
    }

    partIndex++;
    lastIndex = match.index + matchedText.length;
  }

  // Add remaining text after the last match
  if (lastIndex < currentText.length) {
    result.push(
      <React.Fragment key={`${keyPrefix}-text-${partIndex}`}>
        {currentText.slice(lastIndex)}
      </React.Fragment>
    );
  }

  return result.length > 0 ? result : [text];
}

/**
 * Renders the introduction section for a calculation method with formatted text,
 * "When to Use" bullet points, and navigation links to related methods.
 */
export function MethodIntroduction({
  introduction,
  whenToUse,
  prerequisites = [],
  nextMethods = [],
  onMethodLinkClick,
  className = ''
}: MethodIntroductionProps) {
  const handleMethodClick = (method: MethodName) => {
    if (onMethodLinkClick) {
      onMethodLinkClick(method);
    }
  };

  return (
    <div className={`space-y-6 ${className}`.trim()}>
      {/* Introduction text */}
      <div className="prose prose-sm max-w-none">
        {parseFormattedText(introduction)}
      </div>

      {/* When to Use section */}
      {whenToUse.length > 0 && (
        <div className="mt-8">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
            <svg
              className="w-5 h-5 text-success"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            When to Use This Method
          </h3>
          <ul className="space-y-2" role="list">
            {whenToUse.map((item, index) => (
              <li
                key={`when-${index}`}
                className="flex items-start gap-3 text-foreground/90"
              >
                <span
                  className="mt-2 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-accent"
                  aria-hidden="true"
                />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Prerequisites section */}
      {prerequisites.length > 0 && (
        <div className="mt-6 p-4 rounded-lg bg-warning/10 border border-warning/30">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-warning mb-3">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Prerequisites
          </h4>
          <p className="text-sm text-foreground/80 mb-3">
            Understanding these methods first will help:
          </p>
          <div className="flex flex-wrap gap-2">
            {prerequisites.map((prereq) => (
              <button
                key={prereq.method}
                onClick={() => handleMethodClick(prereq.method)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warning/20 text-warning hover:bg-warning/30 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-warning focus:ring-offset-2 focus:ring-offset-background"
                aria-label={`Go to ${prereq.displayName} method`}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                {prereq.displayName}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Next Methods section */}
      {nextMethods.length > 0 && (
        <div className="mt-6 p-4 rounded-lg bg-accent/10 border border-accent/30">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-accent mb-3">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            What to Learn Next
          </h4>
          <p className="text-sm text-foreground/80 mb-3">
            After mastering this method, explore:
          </p>
          <div className="flex flex-wrap gap-2">
            {nextMethods.map((next) => (
              <button
                key={next.method}
                onClick={() => handleMethodClick(next.method)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/20 text-accent hover:bg-accent/30 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                aria-label={`Go to ${next.displayName} method`}
              >
                {next.displayName}
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
