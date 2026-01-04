'use client';

/**
 * DailyProgressSection Component
 *
 * A client-side wrapper for DailyProgress that can be used in server components.
 * Displays daily goal progress with a settings link.
 */

import { useState } from 'react';
import { DailyProgress } from './DailyProgress';
import { GoalSettings } from './GoalSettings';

/**
 * Props for DailyProgressSection
 */
export interface DailyProgressSectionProps {
  /** Optional CSS class name */
  className?: string;
}

/**
 * Section component that displays daily progress with optional settings panel.
 * This is a client component wrapper for use in the home page.
 */
export function DailyProgressSection({ className = '' }: DailyProgressSectionProps) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className={`w-full max-w-md ${className}`.trim()}>
      <DailyProgress className="mb-4" />

      <button
        onClick={() => setShowSettings(!showSettings)}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        aria-expanded={showSettings}
      >
        {showSettings ? 'Hide settings' : 'Adjust daily goal'}
      </button>

      {showSettings && (
        <div className="mt-4">
          <GoalSettings onSave={() => setShowSettings(false)} />
        </div>
      )}
    </div>
  );
}
