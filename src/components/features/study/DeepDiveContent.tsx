/**
 * DeepDiveContent component - Extended educational content with collapsible sections.
 * @module components/features/study/DeepDiveContent
 */

'use client';

import * as React from 'react';
import { useState, useCallback } from 'react';

/**
 * A collapsible section within the deep dive content
 */
export interface DeepDiveSection {
  /** Unique identifier for the section */
  id: string;
  /** Title displayed in the section header */
  title: string;
  /** Icon type to display (optional) */
  icon?: 'history' | 'algebra' | 'connection' | 'advanced' | 'tip';
  /** Whether this section is expanded by default */
  defaultExpanded?: boolean;
  /** The content to display when expanded */
  content: string;
}

/**
 * Historical note about the mathematical method
 */
export interface HistoricalNote {
  /** Title of the historical note */
  title: string;
  /** Time period or date */
  period?: string;
  /** The historical content */
  content: string;
  /** Source or attribution */
  source?: string;
}

/**
 * Connection to abstract algebra or advanced mathematics
 */
export interface AlgebraConnection {
  /** Name of the algebraic concept */
  concept: string;
  /** Explanation of how it relates to the method */
  explanation: string;
  /** Whether this is an advanced topic */
  isAdvanced?: boolean;
}

/**
 * Props for the DeepDiveContent component
 */
export interface DeepDiveContentProps {
  /** Main deep dive content text */
  content: string;
  /** Collapsible sections for advanced topics */
  sections?: DeepDiveSection[];
  /** Historical notes about the method */
  historicalNotes?: HistoricalNote[];
  /** Connections to abstract algebra */
  algebraConnections?: AlgebraConnection[];
  /** Additional CSS class names */
  className?: string;
}

/**
 * Gets the icon component for a section type
 */
function getSectionIcon(icon: DeepDiveSection['icon']): React.ReactNode {
  switch (icon) {
    case 'history':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'algebra':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
        </svg>
      );
    case 'connection':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'advanced':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
        </svg>
      );
    case 'tip':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      );
    default:
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v12H6V4z"
            clipRule="evenodd"
          />
        </svg>
      );
  }
}

/**
 * Parses content with simple formatting
 */
function parseContent(content: string): React.ReactNode[] {
  const lines = content.trim().split('\n');
  const result: React.ReactNode[] = [];
  let currentParagraph: string[] = [];

  const flushParagraph = (keyPrefix: string) => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(' ');
      result.push(
        <p key={`para-${keyPrefix}`} className="text-foreground/90 leading-relaxed mb-3">
          {parseInlineFormatting(text)}
        </p>
      );
      currentParagraph = [];
    }
  };

  lines.forEach((line, lineIndex) => {
    const trimmedLine = line.trim();

    if (trimmedLine === '') {
      flushParagraph(`${lineIndex}`);
      return;
    }

    if (trimmedLine.startsWith('### ')) {
      flushParagraph(`${lineIndex}-pre`);
      result.push(
        <h4 key={`h4-${lineIndex}`} className="text-base font-semibold text-foreground mt-4 mb-2">
          {trimmedLine.slice(4)}
        </h4>
      );
      return;
    }

    if (trimmedLine.startsWith('## ')) {
      flushParagraph(`${lineIndex}-pre`);
      result.push(
        <h3 key={`h3-${lineIndex}`} className="text-lg font-bold text-foreground mt-6 mb-3">
          {trimmedLine.slice(3)}
        </h3>
      );
      return;
    }

    currentParagraph.push(trimmedLine);
  });

  flushParagraph('final');
  return result;
}

/**
 * Parses inline formatting (bold, italic, code)
 */
function parseInlineFormatting(text: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;

  let lastIndex = 0;
  let partIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(
        <React.Fragment key={`text-${partIndex}`}>
          {text.slice(lastIndex, match.index)}
        </React.Fragment>
      );
      partIndex++;
    }

    const matchedText = match[0];

    if (matchedText.startsWith('**') && matchedText.endsWith('**')) {
      result.push(
        <strong key={`bold-${partIndex}`} className="font-semibold text-foreground">
          {matchedText.slice(2, -2)}
        </strong>
      );
    } else if (matchedText.startsWith('*') && matchedText.endsWith('*')) {
      result.push(
        <em key={`italic-${partIndex}`} className="italic">
          {matchedText.slice(1, -1)}
        </em>
      );
    } else if (matchedText.startsWith('`') && matchedText.endsWith('`')) {
      result.push(
        <code
          key={`code-${partIndex}`}
          className="px-1.5 py-0.5 rounded bg-muted font-mono text-sm text-primary"
        >
          {matchedText.slice(1, -1)}
        </code>
      );
    }

    partIndex++;
    lastIndex = match.index + matchedText.length;
  }

  if (lastIndex < text.length) {
    result.push(
      <React.Fragment key={`text-${partIndex}`}>{text.slice(lastIndex)}</React.Fragment>
    );
  }

  return result.length > 0 ? result : [text];
}

/**
 * Collapsible section component
 */
function CollapsibleSection({
  section,
  isExpanded,
  onToggle
}: {
  section: DeepDiveSection;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between bg-card hover:bg-muted/30 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-inset"
        aria-expanded={isExpanded}
        aria-controls={`section-content-${section.id}`}
      >
        <div className="flex items-center gap-3">
          <span className="text-accent">{getSectionIcon(section.icon)}</span>
          <span className="font-medium text-foreground text-left">{section.title}</span>
        </div>
        <svg
          className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div
          id={`section-content-${section.id}`}
          className="px-4 py-4 bg-muted/10 border-t border-border"
        >
          {parseContent(section.content)}
        </div>
      )}
    </div>
  );
}

/**
 * Historical note card component
 */
function HistoricalNoteCard({ note }: { note: HistoricalNote }) {
  return (
    <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <svg
            className="w-5 h-5 text-amber-500"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-2">
            <h4 className="font-semibold text-amber-600">{note.title}</h4>
            {note.period && (
              <span className="text-xs text-amber-500/80 font-mono">{note.period}</span>
            )}
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">{note.content}</p>
          {note.source && (
            <p className="mt-2 text-xs text-muted-foreground italic">Source: {note.source}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Algebra connection card component
 */
function AlgebraConnectionCard({ connection }: { connection: AlgebraConnection }) {
  return (
    <div
      className={`p-4 rounded-lg border ${
        connection.isAdvanced
          ? 'bg-purple-500/5 border-purple-500/20'
          : 'bg-accent/5 border-accent/20'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <svg
            className={`w-5 h-5 ${connection.isAdvanced ? 'text-purple-500' : 'text-accent'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4
              className={`font-semibold ${
                connection.isAdvanced ? 'text-purple-600' : 'text-accent'
              }`}
            >
              {connection.concept}
            </h4>
            {connection.isAdvanced && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-500/20 text-purple-500">
                Advanced
              </span>
            )}
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">{connection.explanation}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Renders extended educational content with collapsible sections,
 * historical notes, and connections to abstract algebra.
 */
export function DeepDiveContent({
  content,
  sections = [],
  historicalNotes = [],
  algebraConnections = [],
  className = ''
}: DeepDiveContentProps) {
  // Track which sections are expanded
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    sections.forEach((section) => {
      if (section.defaultExpanded) {
        initial.add(section.id);
      }
    });
    return initial;
  });

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedSections(new Set(sections.map((s) => s.id)));
  }, [sections]);

  const collapseAll = useCallback(() => {
    setExpandedSections(new Set());
  }, []);

  return (
    <div className={`space-y-8 ${className}`.trim()}>
      {/* Main content */}
      <div className="prose prose-sm max-w-none">{parseContent(content)}</div>

      {/* Collapsible sections */}
      {sections.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Advanced Topics</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={expandAll}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded px-2 py-1"
                aria-label="Expand all sections"
              >
                Expand All
              </button>
              <span className="text-muted-foreground">|</span>
              <button
                onClick={collapseAll}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded px-2 py-1"
                aria-label="Collapse all sections"
              >
                Collapse All
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {sections.map((section) => (
              <CollapsibleSection
                key={section.id}
                section={section}
                isExpanded={expandedSections.has(section.id)}
                onToggle={() => toggleSection(section.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Historical notes */}
      {historicalNotes.length > 0 && (
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <svg
              className="w-5 h-5 text-amber-500"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z"
                clipRule="evenodd"
              />
            </svg>
            Historical Notes
          </h3>
          <div className="space-y-3">
            {historicalNotes.map((note, index) => (
              <HistoricalNoteCard key={`note-${index}`} note={note} />
            ))}
          </div>
        </div>
      )}

      {/* Algebra connections */}
      {algebraConnections.length > 0 && (
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <svg
              className="w-5 h-5 text-accent"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
            Connections to Abstract Algebra
          </h3>
          <div className="space-y-3">
            {algebraConnections.map((connection, index) => (
              <AlgebraConnectionCard key={`connection-${index}`} connection={connection} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
