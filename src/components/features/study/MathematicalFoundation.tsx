/**
 * MathematicalFoundation component - Renders mathematical proofs and formulas for a method.
 * @module components/features/study/MathematicalFoundation
 */

'use client';

import * as React from 'react';

/**
 * A proof step in a mathematical demonstration
 */
export interface ProofStep {
  /** The mathematical expression or statement */
  expression: string;
  /** Explanation or justification for this step */
  justification: string;
  /** Whether this is the conclusion of the proof */
  isConclusion?: boolean;
}

/**
 * A complete mathematical proof
 */
export interface Proof {
  /** Title or name of the proof */
  title: string;
  /** The theorem or identity being proved */
  theorem: string;
  /** Steps in the proof */
  steps: ProofStep[];
}

/**
 * Props for the MathematicalFoundation component
 */
export interface MathematicalFoundationProps {
  /** The mathematical foundation text content */
  content: string;
  /** Key formulas to highlight */
  keyFormulas?: string[];
  /** Mathematical proofs to display */
  proofs?: Proof[];
  /** Additional CSS class names */
  className?: string;
}

/**
 * Parses content with math notation and formatting.
 * Supports: **bold**, *italic*, `code`, and inline math notation
 */
function parseFoundationContent(content: string): React.ReactNode[] {
  const lines = content.trim().split('\n');
  const result: React.ReactNode[] = [];
  let currentParagraph: string[] = [];

  const flushParagraph = (keyPrefix: string) => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(' ');
      result.push(
        <p
          key={`para-${keyPrefix}`}
          className="text-foreground/90 leading-relaxed mb-4"
        >
          {parseInlineMath(text)}
        </p>
      );
      currentParagraph = [];
    }
  };

  lines.forEach((line, lineIndex) => {
    const trimmedLine = line.trim();

    // Empty line signals paragraph break
    if (trimmedLine === '') {
      flushParagraph(`${lineIndex}`);
      return;
    }

    // Handle headers
    if (trimmedLine.startsWith('### ')) {
      flushParagraph(`${lineIndex}-pre`);
      result.push(
        <h4
          key={`h4-${lineIndex}`}
          className="text-base font-semibold text-foreground mt-6 mb-3"
        >
          {trimmedLine.slice(4)}
        </h4>
      );
      return;
    }

    if (trimmedLine.startsWith('## ')) {
      flushParagraph(`${lineIndex}-pre`);
      result.push(
        <h3
          key={`h3-${lineIndex}`}
          className="text-lg font-bold text-foreground mt-8 mb-4"
        >
          {trimmedLine.slice(3)}
        </h3>
      );
      return;
    }

    // Accumulate regular text
    currentParagraph.push(trimmedLine);
  });

  // Flush any remaining paragraph
  flushParagraph('final');

  return result;
}

/**
 * Parses inline math notation and other formatting in text.
 * Math expressions in backticks or Greek letters are styled as code.
 */
function parseInlineMath(text: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];

  // Pattern for inline code/math, bold, italic, and special math symbols
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|[a-z]²|[a-z]³|∀|∈|ℤ|→|⇒|≤|≥|≠|×|÷|±|∞)/gi;

  let lastIndex = 0;
  let partIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      result.push(
        <React.Fragment key={`text-${partIndex}`}>
          {text.slice(lastIndex, match.index)}
        </React.Fragment>
      );
      partIndex++;
    }

    const matchedText = match[0];

    if (matchedText.startsWith('`') && matchedText.endsWith('`')) {
      // Inline code/math
      result.push(
        <code
          key={`code-${partIndex}`}
          className="px-1.5 py-0.5 rounded bg-muted font-mono text-sm text-primary"
        >
          {matchedText.slice(1, -1)}
        </code>
      );
    } else if (matchedText.startsWith('**') && matchedText.endsWith('**')) {
      // Bold text
      result.push(
        <strong key={`bold-${partIndex}`} className="font-semibold text-foreground">
          {matchedText.slice(2, -2)}
        </strong>
      );
    } else if (matchedText.startsWith('*') && matchedText.endsWith('*')) {
      // Italic text
      result.push(
        <em key={`italic-${partIndex}`} className="italic">
          {matchedText.slice(1, -1)}
        </em>
      );
    } else {
      // Mathematical symbols - style as math
      result.push(
        <span
          key={`math-${partIndex}`}
          className="font-mono text-primary"
        >
          {matchedText}
        </span>
      );
    }

    partIndex++;
    lastIndex = match.index + matchedText.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    result.push(
      <React.Fragment key={`text-${partIndex}`}>
        {text.slice(lastIndex)}
      </React.Fragment>
    );
  }

  return result.length > 0 ? result : [text];
}

/**
 * Renders a mathematical proof with steps
 */
function ProofBlock({ proof }: { proof: Proof }) {
  return (
    <div className="my-6 rounded-lg border border-border overflow-hidden">
      {/* Proof header */}
      <div className="bg-secondary/50 px-4 py-3 border-b border-border">
        <h4 className="font-semibold text-foreground flex items-center gap-2">
          <svg
            className="w-4 h-4 text-accent"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          {proof.title}
        </h4>
      </div>

      {/* Theorem statement */}
      <div className="px-4 py-3 bg-accent/5 border-b border-border">
        <p className="text-sm text-muted-foreground mb-1">Theorem:</p>
        <code className="font-mono text-primary">{proof.theorem}</code>
      </div>

      {/* Proof steps */}
      <div className="p-4">
        <p className="text-sm text-muted-foreground mb-3">Proof:</p>
        <div className="space-y-3">
          {proof.steps.map((step, index) => (
            <div
              key={`step-${index}`}
              className={`flex gap-3 ${
                step.isConclusion ? 'pt-3 border-t border-border' : ''
              }`}
            >
              {/* Step number or conclusion marker */}
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                {step.isConclusion ? (
                  <span className="text-success font-bold" aria-label="Conclusion">
                    QED
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground font-mono">
                    {index + 1}.
                  </span>
                )}
              </div>

              {/* Step content */}
              <div className="flex-1 min-w-0">
                <code
                  className={`block font-mono text-sm mb-1 ${
                    step.isConclusion
                      ? 'text-success font-semibold'
                      : 'text-foreground'
                  }`}
                >
                  {step.expression}
                </code>
                <p className="text-xs text-muted-foreground italic">
                  {step.justification}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Renders mathematical foundation content including proofs, formulas,
 * and explanatory text with proper math notation styling.
 */
export function MathematicalFoundation({
  content,
  keyFormulas = [],
  proofs = [],
  className = ''
}: MathematicalFoundationProps) {
  return (
    <div className={`space-y-6 ${className}`.trim()}>
      {/* Key formulas highlight box */}
      {keyFormulas.length > 0 && (
        <div
          className="p-5 rounded-lg bg-primary/5 border border-primary/20"
          role="region"
          aria-label="Key Formulas"
        >
          <h3 className="flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-wide mb-4">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Key Formulas
          </h3>
          <div className="space-y-3">
            {keyFormulas.map((formula, index) => (
              <div
                key={`formula-${index}`}
                className="px-4 py-3 rounded-md bg-card border border-border"
                role="math"
                aria-label={`Formula ${index + 1}: ${formula}`}
              >
                <code className="font-mono text-base text-primary">
                  {formula}
                </code>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="prose prose-sm max-w-none">
        {parseFoundationContent(content)}
      </div>

      {/* Proofs section */}
      {proofs.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Mathematical Proofs
          </h3>
          {proofs.map((proof, index) => (
            <ProofBlock key={`proof-${index}`} proof={proof} />
          ))}
        </div>
      )}

      {/* Algebraic expression examples section */}
      <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Notation Guide:</strong> Expressions in{' '}
              <code className="px-1 py-0.5 rounded bg-muted font-mono text-xs text-primary">
                highlighted text
              </code>{' '}
              represent mathematical expressions. Greek letters and special symbols
              follow standard mathematical conventions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
