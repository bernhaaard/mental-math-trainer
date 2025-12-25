# Phase 6: Statistics Dashboard

**Objective**: Implement comprehensive statistics tracking, visualization, and weak area analysis.

**Exit Criteria**: Statistics persist correctly; charts display accurate data; weak areas identified; export works.

---

## Overview

The Statistics Dashboard provides:
1. **Summary Cards**: Total problems, overall accuracy, average time
2. **Accuracy Trends**: Line chart over time
3. **Method Breakdown**: Per-method performance bars
4. **Weak Areas**: Identified problems with recommendations
5. **Export**: JSON and CSV data export

---

## Statistics Store

### `src/lib/storage/statistics-store.ts`

```typescript
import type {
  UserStatistics,
  PracticeSession,
  MethodName,
  DifficultyLevel,
  CumulativeMethodStats,
  TimeSeriesPoint,
  WeakArea
} from '@/lib/types';

const DB_NAME = 'MentalMathDB';
const STATS_STORE = 'statistics';
const SESSIONS_STORE = 'sessions';

export class StatisticsStore {
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(STATS_STORE)) {
          db.createObjectStore(STATS_STORE, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(SESSIONS_STORE)) {
          const sessionStore = db.createObjectStore(SESSIONS_STORE, { keyPath: 'id' });
          sessionStore.createIndex('startedAt', 'startedAt', { unique: false });
        }
      };
    });
  }

  async saveSession(session: PracticeSession): Promise<void> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([SESSIONS_STORE], 'readwrite');
      const store = transaction.objectStore(SESSIONS_STORE);
      const request = store.put(session);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.updateAggregateStatistics(session).then(resolve).catch(reject);
      };
    });
  }

  async getStatistics(): Promise<UserStatistics> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STATS_STORE], 'readonly');
      const store = transaction.objectStore(STATS_STORE);
      const request = store.get('user-stats');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result);
        } else {
          resolve(this.emptyStatistics());
        }
      };
    });
  }

  async getRecentSessions(limit = 10): Promise<PracticeSession[]> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([SESSIONS_STORE], 'readonly');
      const store = transaction.objectStore(SESSIONS_STORE);
      const index = store.index('startedAt');
      const request = index.openCursor(null, 'prev');

      const sessions: PracticeSession[] = [];

      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor && sessions.length < limit) {
          sessions.push(cursor.value);
          cursor.continue();
        } else {
          resolve(sessions);
        }
      };
    });
  }

  private async updateAggregateStatistics(session: PracticeSession): Promise<void> {
    const current = await this.getStatistics();

    // Update totals
    current.totalProblems += session.problems.length;
    current.totalSessions += 1;

    // Recalculate accuracy
    const totalCorrect = current.totalProblems * (current.overallAccuracy / 100) +
      session.statistics.correctAnswers;
    current.overallAccuracy = (totalCorrect / current.totalProblems) * 100;

    // Update method statistics
    for (const [method, stats] of Object.entries(session.statistics.methodBreakdown)) {
      const methodName = method as MethodName;
      if (!current.methodStatistics[methodName]) {
        current.methodStatistics[methodName] = {
          method: methodName,
          problemsSolved: 0,
          correctAnswers: 0,
          accuracy: 0,
          averageTime: 0,
          trend: 'stable',
          lastPracticed: new Date()
        };
      }

      const existing = current.methodStatistics[methodName];
      existing.problemsSolved += stats.problemsSolved;
      existing.correctAnswers += stats.correctAnswers;
      existing.accuracy = (existing.correctAnswers / existing.problemsSolved) * 100;
      existing.lastPracticed = new Date();

      // Calculate trend
      existing.trend = this.calculateTrend(methodName, stats.accuracy);
    }

    // Add time series point
    current.timeSeriesData.push({
      date: session.endedAt || new Date(),
      accuracy: session.statistics.accuracy,
      problemCount: session.problems.length,
      averageTime: session.statistics.averageTime
    });

    // Keep only last 90 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    current.timeSeriesData = current.timeSeriesData.filter(
      p => new Date(p.date) > cutoff
    );

    // Identify weak areas
    current.weakAreas = this.identifyWeakAreas(current);

    // Save updated statistics
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STATS_STORE], 'readwrite');
      const store = transaction.objectStore(STATS_STORE);
      const request = store.put({ ...current, id: 'user-stats' });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  private calculateTrend(method: MethodName, recentAccuracy: number): 'improving' | 'stable' | 'declining' {
    // Simplified trend calculation
    // In production, compare last 5 sessions vs previous 5
    return 'stable';
  }

  private identifyWeakAreas(stats: UserStatistics): WeakArea[] {
    const weakAreas: WeakArea[] = [];

    // Check method accuracies
    for (const [method, methodStats] of Object.entries(stats.methodStatistics)) {
      if (methodStats.problemsSolved >= 10 && methodStats.accuracy < 80) {
        weakAreas.push({
          category: 'method',
          identifier: method,
          severity: Math.round(10 - (methodStats.accuracy / 10)),
          recommendation: `Practice ${method} more. Current accuracy: ${methodStats.accuracy.toFixed(1)}%`
        });
      }
    }

    // Sort by severity
    weakAreas.sort((a, b) => b.severity - a.severity);

    return weakAreas.slice(0, 5);
  }

  private emptyStatistics(): UserStatistics {
    return {
      totalProblems: 0,
      totalSessions: 0,
      overallAccuracy: 0,
      methodStatistics: {} as Record<MethodName, CumulativeMethodStats>,
      difficultyStatistics: {} as Record<DifficultyLevel, any>,
      timeSeriesData: [],
      weakAreas: []
    };
  }

  async exportData(): Promise<{ json: string; csv: string }> {
    const stats = await this.getStatistics();
    const sessions = await this.getRecentSessions(100);

    const exportObj = {
      exportVersion: '1.0',
      exportedAt: new Date().toISOString(),
      statistics: stats,
      sessions
    };

    const json = JSON.stringify(exportObj, null, 2);

    // Generate CSV
    const csvRows = ['timestamp,problem,user_answer,correct_answer,time_taken,method,difficulty,correct'];
    for (const session of sessions) {
      for (const attempt of session.problems) {
        const userAnswer = attempt.userAnswers[attempt.userAnswers.length - 1] || '';
        const correct = attempt.userAnswers.includes(attempt.correctAnswer);
        csvRows.push([
          attempt.problem.generatedAt,
          `${attempt.problem.num1}×${attempt.problem.num2}`,
          userAnswer,
          attempt.correctAnswer,
          attempt.timeTaken,
          attempt.solution.method,
          attempt.problem.difficulty,
          correct
        ].join(','));
      }
    }
    const csv = csvRows.join('\n');

    return { json, csv };
  }
}

export const statisticsStore = new StatisticsStore();
```

---

## Chart Components

### Accuracy Trend Chart

```typescript
// src/components/features/statistics/AccuracyTrendChart.tsx
// Uses recharts library

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { TimeSeriesPoint } from '@/lib/types';

interface AccuracyTrendChartProps {
  data: TimeSeriesPoint[];
}

export function AccuracyTrendChart({ data }: AccuracyTrendChartProps) {
  const chartData = data.map(point => ({
    date: new Date(point.date).toLocaleDateString(),
    accuracy: point.accuracy
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <XAxis dataKey="date" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="accuracy"
          stroke="#3b82f6"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

### Method Breakdown Chart

```typescript
// src/components/features/statistics/MethodBreakdownChart.tsx

import type { CumulativeMethodStats, MethodName } from '@/lib/types';

interface MethodBreakdownChartProps {
  data: Record<MethodName, CumulativeMethodStats>;
}

export function MethodBreakdownChart({ data }: MethodBreakdownChartProps) {
  const methods = Object.values(data).sort((a, b) => b.accuracy - a.accuracy);

  return (
    <div className="space-y-3">
      {methods.map(method => (
        <div key={method.method} className="flex items-center gap-4">
          <div className="w-32 text-sm">{formatMethodName(method.method)}</div>
          <div className="flex-1 bg-slate-700 rounded-full h-4 overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all"
              style={{ width: `${method.accuracy}%` }}
            />
          </div>
          <div className="w-16 text-right text-sm">
            {method.accuracy.toFixed(1)}%
          </div>
          <div className="w-12 text-right text-xs text-slate-400">
            {method.problemsSolved}
          </div>
        </div>
      ))}
    </div>
  );
}

function formatMethodName(method: MethodName): string {
  const names: Record<MethodName, string> = {
    'distributive': 'Distributive',
    'difference-squares': 'Diff. Squares',
    'near-power-10': 'Near 10^k',
    'squaring': 'Squaring',
    'near-100': 'Near 100',
    'factorization': 'Factorization'
  };
  return names[method];
}
```

---

## Dashboard Page

```typescript
// src/app/statistics/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { statisticsStore } from '@/lib/storage/statistics-store';
import { AccuracyTrendChart } from '@/components/features/statistics/AccuracyTrendChart';
import { MethodBreakdownChart } from '@/components/features/statistics/MethodBreakdownChart';
import type { UserStatistics } from '@/lib/types';

export default function StatisticsPage() {
  const [stats, setStats] = useState<UserStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      await statisticsStore.initialize();
      const data = await statisticsStore.getStatistics();
      setStats(data);
      setLoading(false);
    }
    loadStats();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!stats) return <div>No statistics available</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Your Performance</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <SummaryCard
          label="Total Problems"
          value={stats.totalProblems.toLocaleString()}
        />
        <SummaryCard
          label="Overall Accuracy"
          value={`${stats.overallAccuracy.toFixed(1)}%`}
        />
        <SummaryCard
          label="Sessions"
          value={stats.totalSessions.toString()}
        />
      </div>

      {/* Accuracy Trend */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Accuracy Over Time</h2>
        <AccuracyTrendChart data={stats.timeSeriesData} />
      </section>

      {/* Method Breakdown */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Performance by Method</h2>
        <MethodBreakdownChart data={stats.methodStatistics} />
      </section>

      {/* Weak Areas */}
      {stats.weakAreas.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Areas for Improvement</h2>
          <div className="space-y-3">
            {stats.weakAreas.map(area => (
              <div key={area.identifier} className="p-4 bg-amber-900/30 rounded-lg">
                <p className="font-medium">{area.identifier}</p>
                <p className="text-sm text-slate-300">{area.recommendation}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Export */}
      <section>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          Export Statistics
        </button>
      </section>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-6 bg-slate-800 rounded-lg">
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-slate-400">{label}</div>
    </div>
  );
}

async function handleExport() {
  const { json, csv } = await statisticsStore.exportData();

  // Download JSON
  const jsonBlob = new Blob([json], { type: 'application/json' });
  const jsonUrl = URL.createObjectURL(jsonBlob);
  const jsonLink = document.createElement('a');
  jsonLink.href = jsonUrl;
  jsonLink.download = 'mental-math-stats.json';
  jsonLink.click();
}
```

---

## Quality Checklist

Before completing Phase 6:

- [ ] Statistics persist across browser sessions
- [ ] Charts render correctly with real data
- [ ] Method breakdown shows all practiced methods
- [ ] Weak areas correctly identified (accuracy < 80%)
- [ ] Export produces valid JSON and CSV
- [ ] Time series limits to 90 days

---

## References

- UI specifications: `docs/PROJECT_REQUIREMENTS.md` Section 4.5
- Data models: `docs/PROJECT_REQUIREMENTS.md` Section 5
