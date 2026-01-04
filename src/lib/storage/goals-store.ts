/**
 * Goals and Streaks Storage using IndexedDB
 *
 * Provides persistent storage for daily goals and streak tracking.
 * Manages goal progress, streak calculations, and daily resets.
 */

import type { GoalsState, DailyGoal } from '../types/goals';
import { DEFAULT_DAILY_GOAL } from '../types/goals';

const DB_NAME = 'mental-math-trainer';
const DB_VERSION = 2; // Increment to add goals store
const GOALS_STORE = 'goals';

/**
 * Get the default user ID (for single-user local storage)
 */
const DEFAULT_USER_ID = 'local-user';

/**
 * Get today's date as a YYYY-MM-DD string
 */
export function getTodayDateString(): string {
  const today = new Date();
  const dateString = today.toISOString().split('T')[0];
  // Assertion is safe because ISO string always has 'T' separator
  return dateString as string;
}

/**
 * Opens the IndexedDB database, creating/upgrading stores if needed.
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create statistics store (from existing schema)
      if (!db.objectStoreNames.contains('statistics')) {
        db.createObjectStore('statistics', { keyPath: 'userId' });
      }

      // Create sessions store with index on date (from existing schema)
      if (!db.objectStoreNames.contains('sessions')) {
        const sessionsStore = db.createObjectStore('sessions', {
          keyPath: 'id',
        });
        sessionsStore.createIndex('startedAt', 'startedAt', { unique: false });
      }

      // Create goals store
      if (!db.objectStoreNames.contains(GOALS_STORE)) {
        db.createObjectStore(GOALS_STORE, { keyPath: 'userId' });
      }
    };
  });
}

/**
 * Create empty goals state for a new user
 */
function createEmptyGoalsState(): GoalsState {
  const today = getTodayDateString();
  return {
    userId: DEFAULT_USER_ID,
    dailyGoal: {
      targetProblems: DEFAULT_DAILY_GOAL,
      completedToday: 0,
      date: today,
    },
    streak: {
      currentStreak: 0,
      longestStreak: 0,
      lastPracticeDate: null,
      lastGoalMetDate: null,
    },
  };
}

/**
 * Check if a date is yesterday relative to today
 */
function isYesterday(dateString: string | null): boolean {
  if (!dateString) return false;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0] === dateString;
}

/**
 * Check if a date is today
 */
function isToday(dateString: string | null): boolean {
  if (!dateString) return false;
  return getTodayDateString() === dateString;
}

/**
 * Get user's goals state from storage
 */
export async function getGoalsState(): Promise<GoalsState> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(GOALS_STORE, 'readonly');
    const store = transaction.objectStore(GOALS_STORE);
    const request = store.get(DEFAULT_USER_ID);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const result = request.result as GoalsState | undefined;
      const state = result ?? createEmptyGoalsState();

      // Reset daily progress if it's a new day
      const today = getTodayDateString();
      if (state.dailyGoal.date !== today) {
        // Check if streak should be maintained or reset
        const hadPracticedYesterday = isYesterday(state.streak.lastGoalMetDate);

        if (!hadPracticedYesterday && state.streak.currentStreak > 0) {
          // Streak is broken - reset current streak but preserve longest
          state.streak.currentStreak = 0;
        }

        // Reset daily counter
        state.dailyGoal.completedToday = 0;
        state.dailyGoal.date = today;
      }

      resolve(state);
    };
  });
}

/**
 * Save goals state to storage
 */
export async function saveGoalsState(state: GoalsState): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(GOALS_STORE, 'readwrite');
    const store = transaction.objectStore(GOALS_STORE);
    const request = store.put(state);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Record completed problems and update streak accordingly.
 * This should be called when a practice session ends.
 *
 * @param problemsCompleted - Number of problems completed in the session
 * @returns Updated goals state
 */
export async function recordProblemsCompleted(
  problemsCompleted: number
): Promise<GoalsState> {
  const state = await getGoalsState();
  const today = getTodayDateString();

  // Sanitize input to prevent negative progress
  const sanitizedCount = Math.max(0, Math.floor(problemsCompleted));

  // Update completed count
  state.dailyGoal.completedToday += sanitizedCount;
  state.dailyGoal.date = today;

  // Update last practice date
  state.streak.lastPracticeDate = today;

  // Check if daily goal was just met (transition from below to at/above target)
  const wasGoalMet = state.streak.lastGoalMetDate === today;
  const isGoalMetNow = state.dailyGoal.completedToday >= state.dailyGoal.targetProblems;

  if (!wasGoalMet && isGoalMetNow) {
    // Goal was just met for the first time today
    const yesterdayMetGoal = isYesterday(state.streak.lastGoalMetDate);
    const todayIsFirstDay = state.streak.lastGoalMetDate === null;

    if (yesterdayMetGoal || todayIsFirstDay) {
      // Continue or start streak
      state.streak.currentStreak += 1;
    } else if (!isToday(state.streak.lastGoalMetDate)) {
      // Streak was broken, start new streak
      state.streak.currentStreak = 1;
    }

    // Update longest streak if current exceeds it
    if (state.streak.currentStreak > state.streak.longestStreak) {
      state.streak.longestStreak = state.streak.currentStreak;
    }

    // Mark goal as met today
    state.streak.lastGoalMetDate = today;
  }

  await saveGoalsState(state);
  return state;
}

/**
 * Update the daily goal target
 *
 * @param newTarget - New target number of problems per day
 * @returns Updated goals state
 */
export async function updateDailyGoalTarget(
  newTarget: number
): Promise<GoalsState> {
  const state = await getGoalsState();
  state.dailyGoal.targetProblems = Math.max(1, Math.min(100, Math.round(newTarget)));
  await saveGoalsState(state);
  return state;
}

/**
 * Get current daily progress as a percentage
 */
export function getProgressPercentage(dailyGoal: DailyGoal): number {
  if (dailyGoal.targetProblems <= 0) return 100;
  const percentage = (dailyGoal.completedToday / dailyGoal.targetProblems) * 100;
  return Math.min(100, Math.round(percentage));
}

/**
 * Check if the daily goal has been met
 */
export function isDailyGoalMet(dailyGoal: DailyGoal): boolean {
  return dailyGoal.completedToday >= dailyGoal.targetProblems;
}

/**
 * Get remaining problems to meet daily goal
 */
export function getRemainingProblems(dailyGoal: DailyGoal): number {
  return Math.max(0, dailyGoal.targetProblems - dailyGoal.completedToday);
}

/**
 * Clear all goals data (for testing/reset)
 */
export async function clearGoalsData(): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(GOALS_STORE, 'readwrite');
    const store = transaction.objectStore(GOALS_STORE);
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
