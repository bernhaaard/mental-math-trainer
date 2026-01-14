/**
 * Statistics Storage using IndexedDB
 *
 * Provides persistent storage for user statistics, session history,
 * and performance data.
 */

import type { UserStatistics, WeakArea } from '../types/statistics';
import type { PracticeSession } from '../types/session';
import { MethodName } from '../types/method';
import { DifficultyLevel } from '../types/problem';

const DB_NAME = 'mental-math-trainer';
const DB_VERSION = 2;
const STATS_STORE = 'statistics';
const SESSIONS_STORE = 'sessions';

/**
 * Opens the IndexedDB database, creating stores if needed.
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create statistics store
      if (!db.objectStoreNames.contains(STATS_STORE)) {
        db.createObjectStore(STATS_STORE, { keyPath: 'userId' });
      }

      // Create sessions store with index on date
      if (!db.objectStoreNames.contains(SESSIONS_STORE)) {
        const sessionsStore = db.createObjectStore(SESSIONS_STORE, {
          keyPath: 'id',
        });
        sessionsStore.createIndex('startedAt', 'startedAt', { unique: false });
      }
    };
  });
}

/**
 * Get the default user ID (for single-user local storage)
 */
const DEFAULT_USER_ID = 'local-user';

/**
 * Create empty statistics for a new user
 */
function createEmptyStatistics(): UserStatistics {
  return {
    userId: DEFAULT_USER_ID,
    totalProblems: 0,
    totalSessions: 0,
    overallAccuracy: 0,
    methodStatistics: {},
    difficultyStatistics: {},
    timeSeriesData: [],
    weakAreas: [],
  };
}

/**
 * Get user statistics from storage
 */
export async function getUserStatistics(): Promise<UserStatistics> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STATS_STORE, 'readonly');
    const store = transaction.objectStore(STATS_STORE);
    const request = store.get(DEFAULT_USER_ID);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const result = request.result as UserStatistics | undefined;
      resolve(result ?? createEmptyStatistics());
    };
  });
}

/**
 * Save user statistics to storage
 */
export async function saveUserStatistics(stats: UserStatistics): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STATS_STORE, 'readwrite');
    const store = transaction.objectStore(STATS_STORE);
    const request = store.put(stats);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Save a completed practice session and update cumulative statistics
 */
export async function saveSession(session: PracticeSession): Promise<void> {
  const db = await openDatabase();

  // Save the session
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(SESSIONS_STORE, 'readwrite');
    const store = transaction.objectStore(SESSIONS_STORE);
    const request = store.put(session);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });

  // Update cumulative statistics
  await updateCumulativeStats(session);
}

/**
 * Update cumulative statistics based on a completed session
 */
async function updateCumulativeStats(session: PracticeSession): Promise<void> {
  const stats = await getUserStatistics();

  // Update totals
  stats.totalProblems += session.statistics.totalProblems;
  stats.totalSessions += 1;

  // Recalculate overall accuracy (weighted average)
  const previousTotal = stats.totalProblems - session.statistics.totalProblems;
  if (previousTotal > 0) {
    stats.overallAccuracy =
      (stats.overallAccuracy * previousTotal +
        session.statistics.accuracy * session.statistics.totalProblems) /
      stats.totalProblems;
  } else {
    stats.overallAccuracy = session.statistics.accuracy;
  }

  // Update method statistics
  const methodBreakdown = session.statistics.methodBreakdown;
  for (const methodKey of Object.keys(methodBreakdown) as MethodName[]) {
    const methodStats = methodBreakdown[methodKey];
    if (!methodStats) continue;

    const existing = stats.methodStatistics[methodKey];

    if (existing) {
      // Update existing stats
      const newTotal = existing.problemsSolved + methodStats.problemsSolved;
      existing.accuracy =
        (existing.accuracy * existing.problemsSolved +
          methodStats.accuracy * methodStats.problemsSolved) /
        newTotal;
      existing.problemsSolved = newTotal;
      existing.correctAnswers += methodStats.correctAnswers;
      existing.averageTime =
        (existing.averageTime *
          (existing.problemsSolved - methodStats.problemsSolved) +
          methodStats.averageTime * methodStats.problemsSolved) /
        newTotal;
      existing.lastPracticed = new Date();
      // Simple trend calculation based on recent accuracy
      existing.trend =
        methodStats.accuracy > existing.accuracy
          ? 'improving'
          : methodStats.accuracy < existing.accuracy - 5
            ? 'declining'
            : 'stable';
    } else {
      // Create new entry
      stats.methodStatistics[methodKey] = {
        ...methodStats,
        trend: 'stable',
        lastPracticed: new Date(),
      };
    }
  }

  // Update difficulty statistics
  for (const problem of session.problems) {
    const level = problem.problem.difficulty;
    const existing = stats.difficultyStatistics[level];
    const isCorrect =
      !problem.skipped && problem.userAnswers[0] === problem.correctAnswer;

    if (existing) {
      const newTotal = existing.problemsSolved + 1;
      existing.accuracy =
        (existing.accuracy * existing.problemsSolved + (isCorrect ? 100 : 0)) /
        newTotal;
      existing.problemsSolved = newTotal;
      existing.averageTime =
        (existing.averageTime * (newTotal - 1) + problem.timeTaken) / newTotal;
    } else {
      stats.difficultyStatistics[level] = {
        level,
        problemsSolved: 1,
        accuracy: isCorrect ? 100 : 0,
        averageTime: problem.timeTaken,
      };
    }
  }

  // Add time series data point
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const existingPoint = stats.timeSeriesData.find(
    (p) => new Date(p.date).toDateString() === today.toDateString()
  );

  if (existingPoint) {
    // Update existing point
    const newTotal =
      existingPoint.problemCount + session.statistics.totalProblems;
    existingPoint.accuracy =
      (existingPoint.accuracy * existingPoint.problemCount +
        session.statistics.accuracy * session.statistics.totalProblems) /
      newTotal;
    existingPoint.problemCount = newTotal;
    existingPoint.averageTime =
      (existingPoint.averageTime *
        (newTotal - session.statistics.totalProblems) +
        session.statistics.averageTime * session.statistics.totalProblems) /
      newTotal;
  } else {
    stats.timeSeriesData.push({
      date: today,
      accuracy: session.statistics.accuracy,
      problemCount: session.statistics.totalProblems,
      averageTime: session.statistics.averageTime,
    });
  }

  // Keep only last 30 days of data
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  stats.timeSeriesData = stats.timeSeriesData.filter(
    (p) => new Date(p.date) >= thirtyDaysAgo
  );

  // Calculate weak areas
  stats.weakAreas = calculateWeakAreas(stats);

  await saveUserStatistics(stats);
}

/**
 * Calculate weak areas based on statistics
 */
function calculateWeakAreas(stats: UserStatistics): WeakArea[] {
  const weakAreas: WeakArea[] = [];

  // Check for weak methods (accuracy < 70%)
  for (const methodKey of Object.keys(stats.methodStatistics) as MethodName[]) {
    const methodStats = stats.methodStatistics[methodKey];
    if (
      methodStats &&
      methodStats.accuracy < 70 &&
      methodStats.problemsSolved >= 5
    ) {
      weakAreas.push({
        category: 'method',
        identifier: methodKey,
        severity: (70 - methodStats.accuracy) / 70,
        recommendation: `Practice the ${methodKey.replace(/-/g, ' ')} method more. Try the Study Mode for tips.`,
      });
    }
  }

  // Check for weak difficulties (accuracy < 60%)
  for (const levelKey of Object.keys(
    stats.difficultyStatistics
  ) as DifficultyLevel[]) {
    const diffStats = stats.difficultyStatistics[levelKey];
    if (diffStats && diffStats.accuracy < 60 && diffStats.problemsSolved >= 5) {
      weakAreas.push({
        category: 'difficulty',
        identifier: levelKey,
        severity: (60 - diffStats.accuracy) / 60,
        recommendation: `${levelKey} difficulty needs more practice. Consider reviewing easier levels first.`,
      });
    }
  }

  // Sort by severity (most severe first)
  return weakAreas.sort((a, b) => b.severity - a.severity).slice(0, 5);
}

/**
 * Get recent sessions (last 10)
 */
export async function getRecentSessions(
  limit: number = 10
): Promise<PracticeSession[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(SESSIONS_STORE, 'readonly');
    const store = transaction.objectStore(SESSIONS_STORE);
    const index = store.index('startedAt');
    const request = index.openCursor(null, 'prev');

    const sessions: PracticeSession[] = [];

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor && sessions.length < limit) {
        sessions.push(cursor.value as PracticeSession);
        cursor.continue();
      } else {
        resolve(sessions);
      }
    };
  });
}

/**
 * Clear all statistics (for testing/reset)
 */
export async function clearAllStatistics(): Promise<void> {
  const db = await openDatabase();

  await Promise.all([
    new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STATS_STORE, 'readwrite');
      const store = transaction.objectStore(STATS_STORE);
      const request = store.clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    }),
    new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(SESSIONS_STORE, 'readwrite');
      const store = transaction.objectStore(SESSIONS_STORE);
      const request = store.clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    }),
  ]);
}
