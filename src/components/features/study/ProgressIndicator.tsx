/**
 * ProgressIndicator component - Shows completion status for study sections.
 * @module components/features/study/ProgressIndicator
 */

'use client';

import * as React from 'react';
import type { StudyTab } from './StudyTabNavigation';

/**
 * Completion status for a study section
 */
export type SectionStatus = 'not-started' | 'in-progress' | 'completed';

/**
 * Progress data for a single section
 */
export interface SectionProgress {
  /** The section identifier */
  section: StudyTab;
  /** Current status of the section */
  status: SectionStatus;
  /** Percentage complete (0-100) */
  percentComplete: number;
  /** Time spent in this section (in seconds) */
  timeSpent?: number;
  /** Last accessed timestamp */
  lastAccessed?: Date;
}

/**
 * Props for the ProgressIndicator component
 */
export interface ProgressIndicatorProps {
  /** Progress data for each section */
  sections: SectionProgress[];
  /** Display mode: 'compact' for minimal, 'full' for detailed */
  displayMode?: 'compact' | 'full';
  /** Whether to show section labels */
  showLabels?: boolean;
  /** Callback when a section is clicked */
  onSectionClick?: (section: StudyTab) => void;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Get display name for a study section
 */
function getSectionLabel(section: StudyTab): string {
  const labels: Record<StudyTab, string> = {
    introduction: 'Introduction',
    foundation: 'Foundation',
    deepdive: 'Deep Dive',
    examples: 'Examples',
    practice: 'Practice'
  };
  return labels[section];
}

/**
 * Get status icon based on completion status
 */
function getStatusIcon(status: SectionStatus, _percentComplete: number): React.ReactNode {
  if (status === 'completed') {
    return (
      <svg
        className="w-4 h-4 text-success"
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
    );
  }

  if (status === 'in-progress') {
    return (
      <svg
        className="w-4 h-4 text-accent"
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
    );
  }

  // Not started
  return (
    <svg
      className="w-4 h-4 text-muted-foreground"
      fill="none"
      viewBox="0 0 20 20"
      stroke="currentColor"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="7" strokeWidth="2" />
    </svg>
  );
}

/**
 * Get color classes based on status
 */
function getStatusColor(status: SectionStatus): string {
  switch (status) {
    case 'completed':
      return 'bg-success';
    case 'in-progress':
      return 'bg-accent';
    default:
      return 'bg-muted-foreground/30';
  }
}

/**
 * Format time in a human-readable format
 */
function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

/**
 * Calculate overall progress from section data
 */
function calculateOverallProgress(sections: SectionProgress[]): number {
  if (sections.length === 0) return 0;
  const totalPercent = sections.reduce((sum, section) => sum + section.percentComplete, 0);
  return Math.round(totalPercent / sections.length);
}

/**
 * Compact progress indicator showing just the overall percentage
 */
function CompactIndicator({
  sections,
  showLabels,
  onSectionClick,
  className
}: ProgressIndicatorProps) {
  const overallProgress = calculateOverallProgress(sections);

  return (
    <div className={`flex items-center gap-3 ${className ?? ''}`.trim()}>
      {/* Progress bar */}
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-accent transition-all duration-500"
          style={{ width: `${overallProgress}%` }}
          role="progressbar"
          aria-valuenow={overallProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Overall progress: ${overallProgress}%`}
        />
      </div>

      {/* Percentage */}
      <span className="text-sm font-semibold text-foreground tabular-nums min-w-[3rem] text-right">
        {overallProgress}%
      </span>

      {/* Section dots */}
      <div className="flex items-center gap-1" aria-label="Section completion status">
        {sections.map((section) => (
          <button
            key={section.section}
            onClick={() => onSectionClick?.(section.section)}
            className={`
              w-2.5 h-2.5 rounded-full transition-all duration-200
              ${getStatusColor(section.status)}
              ${onSectionClick ? 'cursor-pointer hover:scale-125' : 'cursor-default'}
              focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background
            `}
            aria-label={`${getSectionLabel(section.section)}: ${section.status === 'completed' ? 'completed' : section.status === 'in-progress' ? 'in progress' : 'not started'}`}
            title={showLabels ? getSectionLabel(section.section) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Full progress indicator showing detailed section breakdown
 */
function FullIndicator({
  sections,
  onSectionClick,
  className
}: ProgressIndicatorProps) {
  const overallProgress = calculateOverallProgress(sections);
  const totalTimeSpent = sections.reduce((sum, s) => sum + (s.timeSpent ?? 0), 0);
  const completedSections = sections.filter((s) => s.status === 'completed').length;

  return (
    <div className={`space-y-4 ${className ?? ''}`.trim()}>
      {/* Overall progress header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="relative w-12 h-12 flex items-center justify-center"
            role="img"
            aria-label={`${overallProgress}% complete`}
          >
            {/* Background circle */}
            <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-muted"
              />
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${overallProgress}, 100`}
                className="text-accent transition-all duration-500"
              />
            </svg>
            <span className="text-xs font-bold text-foreground">{overallProgress}%</span>
          </div>
          <div>
            <p className="font-semibold text-foreground">Study Progress</p>
            <p className="text-sm text-muted-foreground">
              {completedSections} of {sections.length} sections completed
            </p>
          </div>
        </div>

        {totalTimeSpent > 0 && (
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Time spent</p>
            <p className="font-semibold text-foreground">{formatTime(totalTimeSpent)}</p>
          </div>
        )}
      </div>

      {/* Section breakdown */}
      <div className="space-y-2">
        {sections.map((section) => (
          <div
            key={section.section}
            className={`
              rounded-lg border border-border bg-card p-3 transition-colors
              ${onSectionClick ? 'cursor-pointer hover:bg-muted/30' : ''}
            `}
            onClick={() => onSectionClick?.(section.section)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSectionClick?.(section.section);
              }
            }}
            role={onSectionClick ? 'button' : undefined}
            tabIndex={onSectionClick ? 0 : undefined}
            aria-label={
              onSectionClick
                ? `Go to ${getSectionLabel(section.section)}, ${section.percentComplete}% complete`
                : undefined
            }
          >
            <div className="flex items-center gap-3">
              {/* Status icon */}
              {getStatusIcon(section.status, section.percentComplete)}

              {/* Section info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-foreground">
                    {getSectionLabel(section.section)}
                  </span>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {section.percentComplete}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getStatusColor(section.status)}`}
                    style={{ width: `${section.percentComplete}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Additional info */}
            {(section.timeSpent !== undefined || section.lastAccessed) && (
              <div className="flex items-center gap-4 mt-2 ml-7 text-xs text-muted-foreground">
                {section.timeSpent !== undefined && section.timeSpent > 0 && (
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {formatTime(section.timeSpent)}
                  </span>
                )}
                {section.lastAccessed && (
                  <span>
                    Last accessed:{' '}
                    {section.lastAccessed.toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div
        className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2"
        aria-label="Progress legend"
      >
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-muted-foreground/30" aria-hidden="true" />
          <span>Not Started</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-accent" aria-hidden="true" />
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-success" aria-hidden="true" />
          <span>Completed</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Displays completion status for study sections with visual progress bars
 * and checkmarks. Supports compact and full display modes.
 */
export function ProgressIndicator({
  sections,
  displayMode = 'compact',
  showLabels = true,
  onSectionClick,
  className = ''
}: ProgressIndicatorProps) {
  if (displayMode === 'compact') {
    return (
      <CompactIndicator
        sections={sections}
        displayMode={displayMode}
        showLabels={showLabels}
        onSectionClick={onSectionClick}
        className={className}
      />
    );
  }

  return (
    <FullIndicator
      sections={sections}
      displayMode={displayMode}
      showLabels={showLabels}
      onSectionClick={onSectionClick}
      className={className}
    />
  );
}
