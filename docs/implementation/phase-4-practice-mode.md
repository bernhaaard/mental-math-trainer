# Phase 4: Practice Mode

**Objective**: Implement the complete practice mode including configuration, problem generation, session management, and solution review with drill-down.

**Exit Criteria**: Complete practice session flow functional; problems generate correctly; solutions display with expandable sub-steps.

---

## Overview

Practice Mode consists of four main screens:
1. **Configuration Screen**: Set difficulty, methods, problem count
2. **Problem Display**: Show problem, accept answer input
3. **Solution Review**: Display feedback, optimal method, alternatives
4. **Session Summary**: End-of-session statistics

---

## Problem Generator

### `src/lib/core/problem-generator.ts`

```typescript
import type { Problem, DifficultyLevel, CustomRange, MethodName } from '@/lib/types';
import { DIFFICULTY_RANGES } from '@/lib/types';
import { getMethodSelector } from './methods/method-selector';

interface GenerationConfig {
  difficulty: DifficultyLevel | CustomRange;
  methods?: MethodName[];
  allowNegatives?: boolean;
}

export class ProblemGenerator {
  private recentProblems: Problem[] = [];
  private readonly maxRecent = 5;

  /**
   * Generate a new problem based on configuration
   */
  generate(config: GenerationConfig): Problem {
    const range = this.getRange(config.difficulty);
    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
      attempts++;

      const num1 = this.randomInRange(range.num1Min, range.num1Max);
      const num2 = this.randomInRange(range.num2Min, range.num2Max);

      // Skip excluded cases
      if (this.shouldExclude(num1, num2)) continue;

      // Apply negative if configured
      const [finalNum1, finalNum2] = config.allowNegatives
        ? this.maybeApplyNegative(num1, num2)
        : [num1, num2];

      // Check method applicability if specific methods requested
      if (config.methods && config.methods.length > 0) {
        const selector = getMethodSelector();
        const ranking = selector.selectOptimalMethod(finalNum1, finalNum2);
        if (!config.methods.includes(ranking.optimal.method.name)) {
          continue; // Try again
        }
      }

      // Check diversity
      if (this.isDuplicate(finalNum1, finalNum2)) continue;

      const problem: Problem = {
        id: this.generateId(),
        num1: finalNum1,
        num2: finalNum2,
        answer: finalNum1 * finalNum2,
        difficulty: typeof config.difficulty === 'string' ? config.difficulty : 'advanced',
        generatedAt: new Date()
      };

      this.addToRecent(problem);
      return problem;
    }

    throw new Error('Failed to generate suitable problem after max attempts');
  }

  private getRange(difficulty: DifficultyLevel | CustomRange): {
    num1Min: number;
    num1Max: number;
    num2Min: number;
    num2Max: number;
  } {
    if (typeof difficulty === 'string') {
      const range = DIFFICULTY_RANGES[difficulty];
      return {
        num1Min: range.min,
        num1Max: range.max,
        num2Min: range.min,
        num2Max: range.max
      };
    }
    return difficulty;
  }

  private randomInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private shouldExclude(num1: number, num2: number): boolean {
    // Never generate trivial cases
    if (num1 === 0 || num2 === 0) return true;
    if (num1 === 1 || num2 === 1) return true;

    // Exclude exact powers of 10
    if (this.isPowerOf10(num1) || this.isPowerOf10(num2)) return true;

    return false;
  }

  private isPowerOf10(n: number): boolean {
    if (n <= 0) return false;
    while (n > 1) {
      if (n % 10 !== 0) return false;
      n = n / 10;
    }
    return true;
  }

  private maybeApplyNegative(num1: number, num2: number): [number, number] {
    if (Math.random() < 0.3) { // 30% chance
      if (Math.random() < 0.5) {
        return [-num1, num2];
      }
      return [num1, -num2];
    }
    return [num1, num2];
  }

  private isDuplicate(num1: number, num2: number): boolean {
    return this.recentProblems.some(
      p => (p.num1 === num1 && p.num2 === num2) ||
           (p.num1 === num2 && p.num2 === num1)
    );
  }

  private addToRecent(problem: Problem): void {
    this.recentProblems.push(problem);
    if (this.recentProblems.length > this.maxRecent) {
      this.recentProblems.shift();
    }
  }

  private generateId(): string {
    return `problem-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
}

export const problemGenerator = new ProblemGenerator();
```

---

## Session Manager

### `src/lib/core/session-manager.ts`

```typescript
import type {
  PracticeSession,
  SessionConfig,
  ProblemAttempt,
  Problem,
  SessionStatistics,
  MethodName,
  MethodStats
} from '@/lib/types';
import { problemGenerator } from './problem-generator';
import { selectOptimalMethod } from './methods/method-selector';

export class SessionManager {
  private currentSession: PracticeSession | null = null;
  private currentProblemIndex = 0;
  private problemStartTime = 0;

  /**
   * Start a new practice session
   */
  startSession(config: SessionConfig): PracticeSession {
    const problems: ProblemAttempt[] = [];

    // Pre-generate problems if finite count
    if (typeof config.problemCount === 'number') {
      for (let i = 0; i < config.problemCount; i++) {
        const problem = problemGenerator.generate({
          difficulty: config.difficulty,
          methods: config.methods,
          allowNegatives: config.allowNegatives
        });

        const ranking = selectOptimalMethod(problem.num1, problem.num2);

        problems.push({
          problem,
          userAnswers: [],
          correctAnswer: problem.answer,
          timeTaken: 0,
          hintsUsed: 0,
          skipped: false,
          solution: ranking.optimal.solution,
          errorMagnitude: 0
        });
      }
    }

    this.currentSession = {
      id: this.generateSessionId(),
      startedAt: new Date(),
      configuration: config,
      problems,
      statistics: this.emptyStatistics()
    };

    this.currentProblemIndex = 0;
    this.problemStartTime = Date.now();

    return this.currentSession;
  }

  /**
   * Get current problem
   */
  getCurrentProblem(): ProblemAttempt | null {
    if (!this.currentSession) return null;
    return this.currentSession.problems[this.currentProblemIndex] ?? null;
  }

  /**
   * Submit an answer for current problem
   */
  submitAnswer(answer: number): {
    correct: boolean;
    attemptsRemaining: number;
    errorMagnitude: number;
  } {
    const problem = this.getCurrentProblem();
    if (!problem) throw new Error('No current problem');

    problem.userAnswers.push(answer);
    const correct = answer === problem.correctAnswer;
    problem.errorMagnitude = Math.abs(answer - problem.correctAnswer);

    if (correct || problem.userAnswers.length >= 3) {
      problem.timeTaken = Date.now() - this.problemStartTime;
    }

    return {
      correct,
      attemptsRemaining: Math.max(0, 3 - problem.userAnswers.length),
      errorMagnitude: problem.errorMagnitude
    };
  }

  /**
   * Record hint usage
   */
  useHint(): void {
    const problem = this.getCurrentProblem();
    if (problem) {
      problem.hintsUsed++;
    }
  }

  /**
   * Skip current problem
   */
  skipProblem(): void {
    const problem = this.getCurrentProblem();
    if (problem) {
      problem.skipped = true;
      problem.timeTaken = Date.now() - this.problemStartTime;
    }
  }

  /**
   * Move to next problem
   */
  nextProblem(): ProblemAttempt | null {
    if (!this.currentSession) return null;

    this.currentProblemIndex++;
    this.problemStartTime = Date.now();

    // Generate new problem if infinite mode
    if (this.currentSession.configuration.problemCount === 'infinite' &&
        this.currentProblemIndex >= this.currentSession.problems.length) {
      const problem = problemGenerator.generate({
        difficulty: this.currentSession.configuration.difficulty,
        methods: this.currentSession.configuration.methods,
        allowNegatives: this.currentSession.configuration.allowNegatives
      });

      const ranking = selectOptimalMethod(problem.num1, problem.num2);

      this.currentSession.problems.push({
        problem,
        userAnswers: [],
        correctAnswer: problem.answer,
        timeTaken: 0,
        hintsUsed: 0,
        skipped: false,
        solution: ranking.optimal.solution,
        errorMagnitude: 0
      });
    }

    return this.getCurrentProblem();
  }

  /**
   * End current session
   */
  endSession(): PracticeSession {
    if (!this.currentSession) throw new Error('No active session');

    this.currentSession.endedAt = new Date();
    this.currentSession.statistics = this.calculateStatistics(this.currentSession);

    const session = this.currentSession;
    this.currentSession = null;
    return session;
  }

  /**
   * Get session progress
   */
  getProgress(): { current: number; total: number | 'infinite'; percentage: number } {
    if (!this.currentSession) return { current: 0, total: 0, percentage: 0 };

    const total = this.currentSession.configuration.problemCount;
    const current = this.currentProblemIndex + 1;

    return {
      current,
      total,
      percentage: typeof total === 'number' ? (current / total) * 100 : 0
    };
  }

  private calculateStatistics(session: PracticeSession): SessionStatistics {
    const completed = session.problems.filter(p => !p.skipped && p.userAnswers.length > 0);
    const correct = completed.filter(p =>
      p.userAnswers.includes(p.correctAnswer)
    );

    const methodBreakdown: Record<MethodName, MethodStats> = {} as Record<MethodName, MethodStats>;

    for (const attempt of completed) {
      const method = attempt.solution.method;
      if (!methodBreakdown[method]) {
        methodBreakdown[method] = {
          method,
          problemsSolved: 0,
          correctAnswers: 0,
          accuracy: 0,
          averageTime: 0
        };
      }

      methodBreakdown[method].problemsSolved++;
      if (attempt.userAnswers.includes(attempt.correctAnswer)) {
        methodBreakdown[method].correctAnswers++;
      }
    }

    // Calculate accuracy and average time for each method
    for (const method of Object.keys(methodBreakdown) as MethodName[]) {
      const stats = methodBreakdown[method];
      stats.accuracy = stats.problemsSolved > 0
        ? (stats.correctAnswers / stats.problemsSolved) * 100
        : 0;

      const methodProblems = completed.filter(p => p.solution.method === method);
      stats.averageTime = methodProblems.length > 0
        ? methodProblems.reduce((sum, p) => sum + p.timeTaken, 0) / methodProblems.length
        : 0;
    }

    return {
      totalProblems: session.problems.length,
      correctAnswers: correct.length,
      accuracy: completed.length > 0 ? (correct.length / completed.length) * 100 : 0,
      averageTime: completed.length > 0
        ? completed.reduce((sum, p) => sum + p.timeTaken, 0) / completed.length
        : 0,
      averageError: completed.length > 0
        ? completed.reduce((sum, p) => sum + p.errorMagnitude, 0) / completed.length
        : 0,
      methodBreakdown
    };
  }

  private emptyStatistics(): SessionStatistics {
    return {
      totalProblems: 0,
      correctAnswers: 0,
      accuracy: 0,
      averageTime: 0,
      averageError: 0,
      methodBreakdown: {} as Record<MethodName, MethodStats>
    };
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
}

export const sessionManager = new SessionManager();
```

---

## React Components (Outline)

### Configuration Screen

```typescript
// src/components/features/practice/ConfigurationScreen.tsx

interface ConfigurationScreenProps {
  onStartSession: (config: SessionConfig) => void;
}

// Features:
// - Difficulty level buttons (Beginner through Mastery)
// - Custom range inputs for advanced users
// - Method selection checkboxes
// - Problem count selector (5, 10, 20, Infinite)
// - Negative numbers toggle (Advanced+ only)
// - Start button
```

### Problem Display

```typescript
// src/components/features/practice/ProblemDisplay.tsx

interface ProblemDisplayProps {
  problem: Problem;
  attemptNumber: number;
  onSubmit: (answer: number) => void;
  onHint: () => void;
  onSkip: () => void;
}

// Features:
// - Large problem display (num1 × num2)
// - Answer input field
// - Attempt indicators (3 dots)
// - Hint and Skip buttons
// - Timer display
// - Progress bar
```

### Solution Review

```typescript
// src/components/features/practice/SolutionReview.tsx

interface SolutionReviewProps {
  attempt: ProblemAttempt;
  onNext: () => void;
  onEnd: () => void;
}

// Features:
// - Correct/Incorrect feedback
// - User answer vs correct answer
// - Optimal method display
// - Step-by-step solution
// - Expandable sub-steps (drill-down)
// - Alternative methods comparison
// - Next/End buttons
```

### Step Drill-Down Component

```typescript
// src/components/features/practice/StepDrillDown.tsx

interface StepDrillDownProps {
  step: CalculationStep;
  defaultExpanded?: boolean;
}

// Features:
// - Expression and result display
// - Explanation text
// - Expand/collapse for sub-steps
// - Recursive rendering for nested sub-steps
// - Visual depth indicators
```

---

## Quality Checklist

Before completing Phase 4:

- [ ] Problem generation respects difficulty ranges
- [ ] Excluded cases (0, 1, powers of 10) never generated
- [ ] Session management tracks all attempts correctly
- [ ] Statistics calculate accurately
- [ ] Solution review displays all information
- [ ] Drill-down expands correctly
- [ ] Progress tracking works for both finite and infinite modes

---

## References

- UI specifications: `docs/PROJECT_REQUIREMENTS.md` Section 4.3
- Data models: `docs/PROJECT_REQUIREMENTS.md` Section 5
- Testing strategy: `docs/guides/testing-strategy.md`
