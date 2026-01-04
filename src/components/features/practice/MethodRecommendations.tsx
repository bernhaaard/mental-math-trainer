'use client';

/**
 * MethodRecommendations - Displays personalized method recommendations
 * based on user statistics analysis.
 */

import { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getUserStatistics } from '@/lib/storage/statistics-store';
import {
  analyzeMethodProficiency,
  type MethodAnalysisResult,
  type MethodRecommendation,
} from '@/lib/core/analysis';
import { MethodName } from '@/lib/types/method';
import type { UserStatistics } from '@/lib/types/statistics';

/**
 * Props for the MethodRecommendations component.
 */
interface MethodRecommendationsProps {
  /** Callback when a recommendation is selected for focused practice */
  onSelectMethod: (method: MethodName) => void;
  /** Optional className for styling */
  className?: string;
}

/**
 * Get the color class for a proficiency score.
 */
function getProficiencyColor(score: number): string {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-warning';
  return 'text-error';
}

/**
 * Get the background color class for a proficiency bar.
 */
function getProficiencyBarColor(score: number): string {
  if (score >= 80) return 'bg-success';
  if (score >= 60) return 'bg-warning';
  return 'bg-error';
}

/**
 * Get the badge variant for a recommendation reason.
 */
function getReasonBadgeVariant(
  reason: string
): 'default' | 'success' | 'warning' | 'error' | 'info' {
  if (reason.includes('Declining')) return 'error';
  if (reason.includes('Low Accuracy')) return 'warning';
  if (reason.includes('Speed')) return 'info';
  if (reason.includes('Not Yet')) return 'default';
  return 'warning';
}

/**
 * Single recommendation card component.
 */
function RecommendationCard({
  recommendation,
  onSelect,
}: {
  recommendation: MethodRecommendation;
  onSelect: (method: MethodName) => void;
}) {
  const { method, displayName, reason, explanation, proficiency, priority } = recommendation;

  return (
    <button
      onClick={() => onSelect(method)}
      className="w-full text-left p-4 rounded-lg border-2 border-border bg-card hover:border-primary
                 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-ring
                 focus:ring-offset-2 focus:ring-offset-background group"
      aria-label={`Practice ${displayName}. ${reason}: ${explanation}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs font-bold text-muted-foreground"
              aria-label={`Priority ${priority}`}
            >
              #{priority}
            </span>
            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {displayName}
            </h4>
          </div>
          <Badge variant={getReasonBadgeVariant(reason)} className="mb-2">
            {reason}
          </Badge>
          <p className="text-sm text-muted-foreground">{explanation}</p>
        </div>
        <div className="flex-shrink-0 w-16 text-center">
          {proficiency.hasReliableData ? (
            <>
              <div
                className={`text-2xl font-bold ${getProficiencyColor(proficiency.overallScore)}`}
              >
                {proficiency.overallScore}
              </div>
              <div className="text-xs text-muted-foreground">score</div>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold text-muted-foreground">--</div>
              <div className="text-xs text-muted-foreground">no data</div>
            </>
          )}
        </div>
      </div>
      {proficiency.hasReliableData && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Accuracy</span>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full transition-all ${getProficiencyBarColor(proficiency.accuracyScore)}`}
                  style={{ width: `${proficiency.accuracyScore}%` }}
                />
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Speed</span>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full transition-all ${getProficiencyBarColor(proficiency.speedScore)}`}
                  style={{ width: `${proficiency.speedScore}%` }}
                />
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Trend</span>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full transition-all ${proficiency.trendScore >= 50 ? 'bg-success' : 'bg-error'}`}
                  style={{ width: `${proficiency.trendScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </button>
  );
}

/**
 * Loading skeleton for the recommendations.
 */
function RecommendationsLoading() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading recommendations">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-4 rounded-lg border-2 border-border bg-card animate-pulse"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-6 bg-muted rounded" />
                <div className="h-5 w-32 bg-muted rounded" />
              </div>
              <div className="h-5 w-24 bg-muted rounded mb-2" />
              <div className="h-4 w-full bg-muted rounded" />
            </div>
            <div className="w-16">
              <div className="h-8 w-12 bg-muted rounded mx-auto" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Empty state when no recommendations available.
 */
function EmptyRecommendations({ message }: { message: string }) {
  return (
    <div className="text-center py-8 px-4 rounded-lg border-2 border-dashed border-border">
      <div className="text-4xl mb-3" aria-hidden="true">
        📊
      </div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

/**
 * MethodRecommendations component displays personalized practice recommendations
 * based on the user's performance statistics.
 */
export function MethodRecommendations({
  onSelectMethod,
  className = '',
}: MethodRecommendationsProps) {
  const [analysis, setAnalysis] = useState<MethodAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stats: UserStatistics = await getUserStatistics();
      const result = analyzeMethodProficiency(stats);
      setAnalysis(result);
    } catch (err) {
      setError('Failed to load recommendations. Please try again.');
      console.error('Error loading recommendations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const handleSelectMethod = useCallback(
    (method: MethodName) => {
      onSelectMethod(method);
    },
    [onSelectMethod]
  );

  return (
    <Card variant="outlined" className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Recommended Practice
            </h3>
            <p className="text-sm text-muted-foreground">
              {analysis?.dataStatusMessage || 'Personalized suggestions based on your performance'}
            </p>
          </div>
          {!loading && (
            <button
              onClick={loadRecommendations}
              className="text-sm text-primary hover:text-primary/80 transition-colors
                         focus:outline-none focus:underline"
              aria-label="Refresh recommendations"
            >
              Refresh
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading && <RecommendationsLoading />}

        {error && (
          <div className="text-center py-4 px-4 rounded-lg bg-error/10 border border-error/20">
            <p className="text-error">{error}</p>
            <button
              onClick={loadRecommendations}
              className="mt-2 text-sm text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && analysis && (
          <>
            {analysis.recommendations.length === 0 ? (
              <EmptyRecommendations message={analysis.dataStatusMessage} />
            ) : (
              <div className="space-y-3">
                {analysis.recommendations.map((rec) => (
                  <RecommendationCard
                    key={rec.method}
                    recommendation={rec}
                    onSelect={handleSelectMethod}
                  />
                ))}
              </div>
            )}

            {/* Overall proficiency overview */}
            {analysis.hasEnoughData && (
              <div className="mt-6 pt-4 border-t border-border">
                <h4 className="text-sm font-semibold text-foreground mb-3">
                  All Methods Overview
                </h4>
                <div className="space-y-2">
                  {analysis.proficiencies
                    .filter((p) => p.problemsSolved > 0)
                    .sort((a, b) => b.overallScore - a.overallScore)
                    .map((proficiency) => (
                      <div
                        key={proficiency.method}
                        className="flex items-center gap-3"
                      >
                        <span className="text-sm text-muted-foreground w-36 truncate">
                          {proficiency.displayName}
                        </span>
                        <div className="flex-1">
                          <Progress
                            value={proficiency.overallScore}
                            max={100}
                            className="h-2"
                          />
                        </div>
                        <span
                          className={`text-sm font-medium w-8 text-right ${getProficiencyColor(proficiency.overallScore)}`}
                        >
                          {proficiency.overallScore}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
