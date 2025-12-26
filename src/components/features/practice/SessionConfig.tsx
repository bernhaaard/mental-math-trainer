'use client';

import { useState } from 'react';
import { DifficultyLevel, type CustomRange } from '@/lib/types/problem';
import { MethodName } from '@/lib/types/method';
import type { SessionConfig as SessionConfigType } from '@/lib/types/session';
import { DifficultySelector } from './DifficultySelector';
import { NumberRangeInput } from './NumberRangeInput';
import { MethodSelector } from './MethodSelector';

interface SessionConfigProps {
  onStartSession: (config: SessionConfigType) => void;
}

type TimerMode = 'none' | 'per-problem' | 'session';

const DEFAULT_CUSTOM_RANGE: CustomRange = {
  num1Min: 10,
  num1Max: 100,
  num2Min: 10,
  num2Max: 100
};

const PROBLEM_COUNT_OPTIONS = [
  { value: 10, label: '10 Problems' },
  { value: 25, label: '25 Problems' },
  { value: 50, label: '50 Problems' },
  { value: 'infinite' as const, label: 'Infinite Practice' }
];

/**
 * SessionConfig - Main configuration screen for practice sessions
 * Allows users to customize difficulty, methods, problem count, and other settings
 */
export function SessionConfig({ onStartSession }: SessionConfigProps) {
  // Core configuration state
  const [difficultyType, setDifficultyType] = useState<DifficultyLevel | 'custom'>(DifficultyLevel.Beginner);
  const [customRange, setCustomRange] = useState<CustomRange>(DEFAULT_CUSTOM_RANGE);
  const [selectedMethods, setSelectedMethods] = useState<MethodName[]>([]);
  const [problemCount, setProblemCount] = useState<number | 'infinite'>(25);
  const [allowNegatives, setAllowNegatives] = useState(false);

  // UI state
  const [showWalkthrough, setShowWalkthrough] = useState(true);
  const [timerMode, setTimerMode] = useState<TimerMode>('none');

  const handleDifficultyChange = (level: DifficultyLevel | 'custom') => {
    setDifficultyType(level);

    // If switching from custom to predefined, adjust negative numbers if needed
    if (level !== 'custom' && allowNegatives) {
      setAllowNegatives(false);
    }
  };

  const handleStartSession = () => {
    const config: SessionConfigType = {
      difficulty: difficultyType === 'custom' ? customRange : difficultyType,
      methods: selectedMethods,
      problemCount,
      allowNegatives: difficultyType === 'custom' && allowNegatives
    };

    onStartSession(config);
  };

  const isConfigValid = () => {
    // Check if at least one method is selected (empty array means all methods, which is valid)
    if (selectedMethods.length === 0) {
      // Empty is valid (means all methods)
      return true;
    }

    // If custom range, validate it has sensible values
    if (difficultyType === 'custom') {
      const { num1Min, num1Max, num2Min, num2Max } = customRange;

      if (num1Min >= num1Max || num2Min >= num2Max) {
        return false;
      }

      if (allowNegatives) {
        // Allow negative numbers
        if (num1Min < -1_000_000_000 || num1Max > 1_000_000_000) {
          return false;
        }
        if (num2Min < -1_000_000_000 || num2Max > 1_000_000_000) {
          return false;
        }
      } else {
        // Ensure positive numbers
        if (num1Min < 1 || num2Min < 1) {
          return false;
        }
      }
    }

    return true;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Configure Practice Session
        </h1>
        <p className="text-muted-foreground">
          Customize your mental math training experience
        </p>
      </div>

      {/* Main configuration sections */}
      <div className="space-y-6">
        {/* Difficulty Selection */}
        <section className="p-6 rounded-xl bg-card border-2 border-border shadow-sm">
          <DifficultySelector
            value={difficultyType}
            onChange={handleDifficultyChange}
          />

          {/* Custom Range Input (conditionally shown) */}
          {difficultyType === 'custom' && (
            <div className="mt-6 pt-6 border-t border-border">
              <NumberRangeInput
                value={customRange}
                onChange={setCustomRange}
                allowNegatives={allowNegatives}
              />
            </div>
          )}
        </section>

        {/* Method Selection */}
        <section className="p-6 rounded-xl bg-card border-2 border-border shadow-sm">
          <MethodSelector
            value={selectedMethods}
            onChange={setSelectedMethods}
          />
        </section>

        {/* Problem Count */}
        <section className="p-6 rounded-xl bg-card border-2 border-border shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Number of Problems
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PROBLEM_COUNT_OPTIONS.map((option) => {
              const isSelected = problemCount === option.value;

              return (
                <button
                  key={String(option.value)}
                  onClick={() => setProblemCount(option.value)}
                  className={`
                    px-4 py-3 rounded-lg border-2 font-medium text-sm
                    transition-all
                    focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background
                    ${isSelected
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card text-foreground hover:border-muted-foreground hover:shadow-sm'}
                  `}
                  aria-pressed={isSelected}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Additional Options */}
        <section className="p-6 rounded-xl bg-card border-2 border-border shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Additional Options
          </h3>

          <div className="space-y-4">
            {/* Allow Negatives Toggle (only for custom range) */}
            {difficultyType === 'custom' && (
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={allowNegatives}
                  onChange={(e) => setAllowNegatives(e.target.checked)}
                  className="
                    mt-0.5 w-5 h-5 rounded border-2 border-border
                    text-primary focus:ring-2 focus:ring-ring focus:ring-offset-1
                    transition-colors
                  "
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    Allow Negative Numbers
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Include negative values in problem generation
                  </div>
                </div>
              </label>
            )}

            {/* Show Walkthrough Toggle */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={showWalkthrough}
                onChange={(e) => setShowWalkthrough(e.target.checked)}
                className="
                  mt-0.5 w-5 h-5 rounded border-2 border-border
                  text-primary focus:ring-2 focus:ring-ring focus:ring-offset-1
                  transition-colors
                "
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  Show Solution Walkthroughs
                </div>
                <div className="text-xs text-muted-foreground">
                  Display step-by-step solutions after each problem
                </div>
              </div>
            </label>

            {/* Timer Mode */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-foreground">Timer Mode</div>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'none' as const, label: 'No Timer', description: 'Practice at your own pace' },
                  { value: 'per-problem' as const, label: 'Per Problem', description: 'Track time for each problem' },
                  { value: 'session' as const, label: 'Session Timer', description: 'Overall session time' }
                ].map((option) => {
                  const isSelected = timerMode === option.value;

                  return (
                    <button
                      key={option.value}
                      onClick={() => setTimerMode(option.value)}
                      className={`
                        flex-1 min-w-[140px] px-3 py-2 rounded-lg border-2 text-left
                        transition-all
                        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background
                        ${isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-card hover:border-muted-foreground'}
                      `}
                      aria-pressed={isSelected}
                    >
                      <div className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                        {option.label}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {option.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Start Session Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={handleStartSession}
          disabled={!isConfigValid()}
          className="
            px-8 py-4 rounded-xl font-semibold text-lg
            bg-primary text-primary-foreground
            hover:bg-primary/90
            disabled:opacity-50 disabled:cursor-not-allowed
            shadow-lg hover:shadow-xl
            transition-all
            focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background
          "
        >
          Start Practice Session
        </button>
      </div>

      {/* Configuration Summary */}
      {isConfigValid() && (
        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
            Session Summary
          </h4>
          <div className="text-sm text-foreground space-y-1">
            <div>
              <span className="text-muted-foreground">Difficulty:</span>{' '}
              <span className="font-medium">
                {difficultyType === 'custom' ? 'Custom Range' : difficultyType}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Methods:</span>{' '}
              <span className="font-medium">
                {selectedMethods.length === 0 ? 'All Methods (System Choice)' : `${selectedMethods.length} Selected`}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Problems:</span>{' '}
              <span className="font-medium">
                {problemCount === 'infinite' ? 'Infinite' : problemCount}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Timer:</span>{' '}
              <span className="font-medium">
                {timerMode === 'none' ? 'Disabled' : timerMode === 'per-problem' ? 'Per Problem' : 'Session'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
