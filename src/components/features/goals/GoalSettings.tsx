'use client';

/**
 * GoalSettings Component
 *
 * Allows users to configure their daily practice goal.
 */

import { useState, useCallback } from 'react';
import { useGoals } from '@/lib/hooks';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MIN_DAILY_GOAL, MAX_DAILY_GOAL } from '@/lib/types/goals';

/**
 * Props for GoalSettings component
 */
export interface GoalSettingsProps {
  /** Optional CSS class name */
  className?: string;
  /** Callback when settings are saved */
  onSave?: () => void;
}

/**
 * Preset goal options for quick selection
 */
const GOAL_PRESETS = [5, 10, 15, 20, 30, 50];

/**
 * GoalSettings component for configuring daily practice goals.
 *
 * @example
 * ```tsx
 * <GoalSettings onSave={() => console.log('Saved!')} />
 * ```
 */
export function GoalSettings({ className = '', onSave }: GoalSettingsProps) {
  const { dailyGoal, setGoalTarget, isLoading } = useGoals();
  const [customValue, setCustomValue] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const currentTarget = dailyGoal?.targetProblems ?? 10;

  const handlePresetClick = useCallback(
    async (value: number) => {
      setIsSaving(true);
      try {
        await setGoalTarget(value);
        onSave?.();
      } finally {
        setIsSaving(false);
      }
    },
    [setGoalTarget, onSave]
  );

  const handleCustomSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const value = parseInt(customValue, 10);
      if (isNaN(value) || value < MIN_DAILY_GOAL || value > MAX_DAILY_GOAL) {
        return;
      }
      setIsSaving(true);
      try {
        await setGoalTarget(value);
        setCustomValue('');
        onSave?.();
      } finally {
        setIsSaving(false);
      }
    },
    [customValue, setGoalTarget, onSave]
  );

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="h-6 w-40 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="h-20 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className} data-testid="goal-settings">
      <CardHeader>
        <h3 className="text-lg font-semibold text-card-foreground">
          Daily Goal Settings
        </h3>
        <p className="text-sm text-muted-foreground">
          Current goal: {currentTarget} problems per day
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Preset buttons */}
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              Quick select
            </p>
            <div className="flex flex-wrap gap-2">
              {GOAL_PRESETS.map((value) => (
                <Button
                  key={value}
                  variant={currentTarget === value ? 'primary' : 'outline'}
                  size="sm"
                  disabled={isSaving}
                  onClick={() => handlePresetClick(value)}
                  aria-pressed={currentTarget === value}
                >
                  {value}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom value input */}
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              Custom goal
            </p>
            <form onSubmit={handleCustomSubmit} className="flex gap-2">
              <input
                type="number"
                min={MIN_DAILY_GOAL}
                max={MAX_DAILY_GOAL}
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                placeholder={`${MIN_DAILY_GOAL}-${MAX_DAILY_GOAL}`}
                disabled={isSaving}
                className="w-24 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Custom daily goal"
              />
              <Button
                type="submit"
                variant="outline"
                size="sm"
                disabled={
                  isSaving ||
                  !customValue ||
                  parseInt(customValue, 10) < MIN_DAILY_GOAL ||
                  parseInt(customValue, 10) > MAX_DAILY_GOAL
                }
              >
                Set
              </Button>
            </form>
          </div>

          {/* Help text */}
          <p className="text-xs text-muted-foreground">
            Your streak increases when you complete your daily goal.
            Set a realistic target to build a consistent practice habit.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
