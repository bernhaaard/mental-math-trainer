'use client';

/**
 * Statistics Dashboard Page
 *
 * Displays comprehensive user progress analytics including:
 * - Overall stats (problems, sessions, accuracy)
 * - Method performance breakdown with trends
 * - Difficulty level progress
 * - Performance trend visualization over time
 * - Identified weak areas with recommendations
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, type BadgeVariant } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getUserStatistics } from '@/lib/storage/statistics-store';
import type {
  UserStatistics,
  CumulativeMethodStats,
  DifficultyStats,
  TimeSeriesPoint,
  WeakArea
} from '@/lib/types/statistics';
import { MethodName } from '@/lib/types/method';
import { DifficultyLevel } from '@/lib/types/problem';
import { formatTimeSeconds } from '@/lib/utils';

/**
 * Display names for calculation methods.
 */
const METHOD_DISPLAY_NAMES: Record<MethodName, string> = {
  [MethodName.Distributive]: 'Distributive Property',
  [MethodName.NearPower10]: 'Near Powers of 10',
  [MethodName.DifferenceSquares]: 'Difference of Squares',
  [MethodName.Factorization]: 'Factorization',
  [MethodName.Squaring]: 'Squaring',
  [MethodName.Near100]: 'Near 100'
};

/**
 * Display names for difficulty levels.
 */
const DIFFICULTY_DISPLAY_NAMES: Record<DifficultyLevel, string> = {
  [DifficultyLevel.Beginner]: 'Beginner',
  [DifficultyLevel.Intermediate]: 'Intermediate',
  [DifficultyLevel.Advanced]: 'Advanced',
  [DifficultyLevel.Expert]: 'Expert',
  [DifficultyLevel.Mastery]: 'Mastery'
};

/**
 * Difficulty level order for display.
 */
const DIFFICULTY_ORDER: DifficultyLevel[] = [
  DifficultyLevel.Beginner,
  DifficultyLevel.Intermediate,
  DifficultyLevel.Advanced,
  DifficultyLevel.Expert,
  DifficultyLevel.Mastery
];

/**
 * Formats a date as a relative string (e.g., "2 days ago").
 */
function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
}

/**
 * Gets badge variant based on accuracy percentage.
 */
function getAccuracyVariant(accuracy: number): BadgeVariant {
  if (accuracy >= 80) return 'success';
  if (accuracy >= 60) return 'warning';
  return 'error';
}

/**
 * Gets trend icon based on trend direction.
 */
function TrendIcon({
  trend
}: {
  trend: 'improving' | 'stable' | 'declining';
}): React.ReactElement {
  if (trend === 'improving') {
    return (
      <svg
        className="h-4 w-4 text-success"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-label="Improving"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    );
  } else if (trend === 'declining') {
    return (
      <svg
        className="h-4 w-4 text-error"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-label="Declining"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 14l-7 7m0 0l-7-7m7 7V3"
        />
      </svg>
    );
  }
  return (
    <svg
      className="h-4 w-4 text-muted-foreground"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-label="Stable"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 12h14"
      />
    </svg>
  );
}

/**
 * Loading skeleton component for cards.
 */
function LoadingSkeleton(): React.ReactElement {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header skeleton */}
      <div className="h-8 w-48 bg-secondary rounded" />

      {/* Stats cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-secondary rounded-lg" />
        ))}
      </div>

      {/* Method cards skeleton */}
      <div className="h-6 w-40 bg-secondary rounded" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-48 bg-secondary rounded-lg" />
        ))}
      </div>
    </div>
  );
}

/**
 * Empty state component shown when no statistics exist.
 */
function EmptyState(): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary mb-6">
        <svg
          className="h-12 w-12 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">
        No Statistics Yet
      </h2>
      <p className="text-muted-foreground max-w-md mb-8">
        Complete some practice sessions to start tracking your progress. Your
        accuracy, speed, and improvement trends will appear here.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/practice">
          <Button variant="primary" size="lg">
            Start Practicing
          </Button>
        </Link>
        <Link href="/study">
          <Button variant="outline" size="lg">
            Study Methods First
          </Button>
        </Link>
      </div>
    </div>
  );
}

/**
 * Overall statistics card component.
 */
function StatCard({
  title,
  value,
  subtitle,
  icon
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
}): React.ReactElement {
  return (
    <Card variant="default">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Method performance card component.
 */
function MethodCard({
  methodName,
  stats
}: {
  methodName: MethodName;
  stats: CumulativeMethodStats;
}): React.ReactElement {
  const displayName = METHOD_DISPLAY_NAMES[methodName];
  const lastPracticed = new Date(stats.lastPracticed);

  return (
    <Card variant="outlined" className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">{displayName}</h3>
          <div className="flex items-center gap-2">
            <TrendIcon trend={stats.trend} />
            <Badge variant={getAccuracyVariant(stats.accuracy)}>
              {Math.round(stats.accuracy)}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Accuracy</span>
              <span className="font-medium text-foreground">
                {Math.round(stats.accuracy)}%
              </span>
            </div>
            <Progress value={stats.accuracy} />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Problems</p>
              <p className="font-medium text-foreground">
                {stats.problemsSolved}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Correct</p>
              <p className="font-medium text-foreground">
                {stats.correctAnswers}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Avg. Time</p>
              <p className="font-medium text-foreground">
                {formatTimeSeconds(stats.averageTime)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Last Practiced</p>
              <p className="font-medium text-foreground">
                {formatRelativeDate(lastPracticed)}
              </p>
            </div>
          </div>

          <Link
            href={`/study/${methodName}`}
            className="block text-sm text-primary hover:underline"
          >
            Review this method
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Difficulty breakdown section component.
 */
function DifficultyBreakdown({
  difficultyStats
}: {
  difficultyStats: Partial<Record<DifficultyLevel, DifficultyStats>>;
}): React.ReactElement {
  const practicedLevels = DIFFICULTY_ORDER.filter(
    (level) => difficultyStats[level]
  );

  if (practicedLevels.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No difficulty levels practiced yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {practicedLevels.map((level) => {
        const stats = difficultyStats[level]!;
        const displayName = DIFFICULTY_DISPLAY_NAMES[level];

        return (
          <div key={level} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">
                  {displayName}
                </span>
                <Badge variant={getAccuracyVariant(stats.accuracy)} className="text-xs">
                  {Math.round(stats.accuracy)}%
                </Badge>
              </div>
              <span className="text-sm text-muted-foreground">
                {stats.problemsSolved} problems
              </span>
            </div>
            <Progress value={stats.accuracy} />
          </div>
        );
      })}
    </div>
  );
}

/**
 * Performance trend chart component (CSS-based visualization).
 */
function PerformanceTrendChart({
  data
}: {
  data: TimeSeriesPoint[];
}): React.ReactElement {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        No trend data available yet
      </div>
    );
  }

  // Sort data by date
  const sortedData = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Get last 14 days of data
  const recentData = sortedData.slice(-14);
  const maxAccuracy = 100;
  const maxProblems = Math.max(...recentData.map((d) => d.problemCount), 1);

  return (
    <div className="space-y-4">
      {/* Accuracy Chart */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-2">
          Daily Accuracy
        </h4>
        <div className="flex items-end gap-1 h-32">
          {recentData.map((point, index) => {
            const height = (point.accuracy / maxAccuracy) * 100;
            const date = new Date(point.date);
            const dayLabel = date.toLocaleDateString('en-US', {
              weekday: 'short'
            });

            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center group"
                title={`${date.toLocaleDateString()}: ${Math.round(point.accuracy)}% (${point.problemCount} problems)`}
              >
                <div className="w-full bg-secondary rounded-t relative flex-1 flex items-end">
                  <div
                    className="w-full bg-primary rounded-t transition-all group-hover:bg-primary/80"
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground mt-1 truncate w-full text-center">
                  {dayLabel[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Problems Count Chart */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-2">
          Problems Solved
        </h4>
        <div className="flex items-end gap-1 h-20">
          {recentData.map((point, index) => {
            const height = (point.problemCount / maxProblems) * 100;

            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center group"
                title={`${point.problemCount} problems`}
              >
                <div className="w-full bg-secondary rounded-t relative flex-1 flex items-end">
                  <div
                    className="w-full bg-accent rounded-t transition-all group-hover:bg-accent/80"
                    style={{ height: `${Math.max(height, 5)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded" />
          <span>Accuracy %</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-accent rounded" />
          <span>Problems</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Weak areas section component.
 */
function WeakAreasSection({
  weakAreas
}: {
  weakAreas: WeakArea[];
}): React.ReactElement {
  if (weakAreas.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mx-auto mb-4">
          <svg
            className="h-8 w-8 text-success"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="font-medium text-foreground mb-1">Great Progress!</h3>
        <p className="text-sm text-muted-foreground">
          No significant weak areas detected. Keep up the excellent work!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {weakAreas.map((area, index) => {
        const severityPercent = Math.round(area.severity * 100);
        const severityVariant: BadgeVariant =
          severityPercent > 50 ? 'error' : severityPercent > 25 ? 'warning' : 'info';

        // Determine link based on category
        let actionLink = '/practice';
        let actionText = 'Practice';
        if (area.category === 'method') {
          actionLink = `/study/${area.identifier}`;
          actionText = 'Study Method';
        } else if (area.category === 'difficulty') {
          actionLink = '/practice';
          actionText = 'Practice This Level';
        }

        return (
          <Card key={index} variant="outlined">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-warning"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span className="font-medium text-foreground capitalize">
                    {area.category === 'method'
                      ? METHOD_DISPLAY_NAMES[area.identifier as MethodName] ||
                        area.identifier.replace(/-/g, ' ')
                      : area.category === 'difficulty'
                        ? DIFFICULTY_DISPLAY_NAMES[
                            area.identifier as DifficultyLevel
                          ] || area.identifier
                        : area.identifier}
                  </span>
                </div>
                <Badge variant={severityVariant}>
                  {severityPercent}% severity
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {area.recommendation}
              </p>
              <Link href={actionLink}>
                <Button variant="outline" size="sm">
                  {actionText}
                </Button>
              </Link>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/**
 * Statistics Dashboard main component.
 */
export default function StatisticsPage(): React.ReactElement {
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStatistics() {
      try {
        const stats = await getUserStatistics();
        setStatistics(stats);
      } catch (err) {
        setError('Failed to load statistics. Please try again.');
        console.error('Error loading statistics:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStatistics();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error/10 mb-4">
            <svg
              className="h-8 w-8 text-error"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Error Loading Statistics
          </h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Check if user has any statistics
  const hasStatistics = statistics && statistics.totalProblems > 0;

  if (!hasStatistics) {
    return (
      <div className="max-w-6xl mx-auto">
        <EmptyState />
      </div>
    );
  }

  const methodEntries = Object.entries(statistics.methodStatistics) as [
    MethodName,
    CumulativeMethodStats
  ][];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Your Progress
        </h1>
        <p className="text-muted-foreground">
          Track your mental math journey and identify areas for improvement.
        </p>
      </div>

      {/* Overall Stats Cards */}
      <section className="mb-8" aria-label="Overall statistics">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            title="Total Problems"
            value={statistics.totalProblems.toLocaleString()}
            subtitle={`Across ${statistics.totalSessions} session${statistics.totalSessions !== 1 ? 's' : ''}`}
            icon={
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            }
          />
          <StatCard
            title="Total Sessions"
            value={statistics.totalSessions}
            icon={
              <svg
                className="h-6 w-6"
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
            }
          />
          <StatCard
            title="Overall Accuracy"
            value={`${Math.round(statistics.overallAccuracy)}%`}
            subtitle={
              statistics.overallAccuracy >= 80
                ? 'Excellent!'
                : statistics.overallAccuracy >= 60
                  ? 'Good progress'
                  : 'Keep practicing'
            }
            icon={
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
        </div>
      </section>

      {/* Method Performance Section */}
      {methodEntries.length > 0 && (
        <section className="mb-8" aria-label="Method performance">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Method Performance
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {methodEntries.map(([methodName, stats]) => (
              <MethodCard key={methodName} methodName={methodName} stats={stats} />
            ))}
          </div>
        </section>
      )}

      {/* Two-column layout for charts and difficulties */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {/* Performance Trend Chart */}
        <section aria-label="Performance trend">
          <Card variant="default">
            <CardHeader>
              <h2 className="text-xl font-semibold text-foreground">
                Performance Trend
              </h2>
              <p className="text-sm text-muted-foreground">
                Your accuracy and activity over the last 14 days
              </p>
            </CardHeader>
            <CardContent>
              <PerformanceTrendChart data={statistics.timeSeriesData} />
            </CardContent>
          </Card>
        </section>

        {/* Difficulty Breakdown */}
        <section aria-label="Difficulty breakdown">
          <Card variant="default">
            <CardHeader>
              <h2 className="text-xl font-semibold text-foreground">
                Difficulty Breakdown
              </h2>
              <p className="text-sm text-muted-foreground">
                Your accuracy at each difficulty level
              </p>
            </CardHeader>
            <CardContent>
              <DifficultyBreakdown
                difficultyStats={statistics.difficultyStatistics}
              />
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Weak Areas Section */}
      <section className="mb-8" aria-label="Areas for improvement">
        <Card variant="default">
          <CardHeader>
            <h2 className="text-xl font-semibold text-foreground">
              Areas for Improvement
            </h2>
            <p className="text-sm text-muted-foreground">
              Identified weak spots with personalized recommendations
            </p>
          </CardHeader>
          <CardContent>
            <WeakAreasSection weakAreas={statistics.weakAreas} />
          </CardContent>
        </Card>
      </section>

      {/* Quick Actions */}
      <section
        className="flex flex-col sm:flex-row gap-4 justify-center"
        aria-label="Quick actions"
      >
        <Link href="/practice">
          <Button variant="primary" size="lg">
            Continue Practicing
          </Button>
        </Link>
        <Link href="/study">
          <Button variant="outline" size="lg">
            Study Methods
          </Button>
        </Link>
      </section>
    </div>
  );
}
