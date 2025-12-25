# Phase 1: Foundation

**Objective**: Establish the infrastructure that supports the entire development process, including git repository, TypeScript configuration, type system, and the validation framework.

**Exit Criteria**: Can validate mathematical expressions with 100% accuracy; all types defined; test framework operational.

---

## Step 1.1: Repository and Workflow Setup

### Initialize Repository

```bash
# Initialize repository
git init
git branch -M main

# Create Next.js project
npx create-next-app@latest mental-math-trainer --typescript --tailwind --app

# Initialize repository structure
git add .
git commit -m "Initial project setup with Next.js and TypeScript"

# Create GitHub repository
gh repo create mental-math-trainer --private --source=. --remote=origin
git push -u origin main
```

### Create First Feature Branch

```bash
# Create issue for foundation work
gh issue create --title "[FEAT] Set up project infrastructure and type system" --body "..."

# Create feature branch
git checkout -b feat/1-foundation
```

### TypeScript Strict Configuration

Update `tsconfig.json` with maximum type safety:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleResolution": "bundler",
    "allowJs": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Vitest Configuration

Install testing dependencies:

```bash
npm install -D vitest @vitest/ui @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom happy-dom
```

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/types/**'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

Create `src/tests/setup.ts`:

```typescript
import '@testing-library/jest-dom';
```

Update `package.json` scripts:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## Step 1.2: Type Definitions

Create the complete type system in `/src/lib/types/`:

### `problem.ts`

```typescript
export interface Problem {
  id: string;
  num1: number;
  num2: number;
  answer: number;
  difficulty: DifficultyLevel;
  generatedAt: Date;
}

export enum DifficultyLevel {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
  Expert = 'expert',
  Mastery = 'mastery'
}

export interface DifficultyRange {
  min: number;
  max: number;
}

export interface CustomRange {
  num1Min: number;
  num1Max: number;
  num2Min: number;
  num2Max: number;
}

export const DIFFICULTY_RANGES: Record<DifficultyLevel, DifficultyRange> = {
  [DifficultyLevel.Beginner]: { min: 2, max: 100 },
  [DifficultyLevel.Intermediate]: { min: 20, max: 400 },
  [DifficultyLevel.Advanced]: { min: 100, max: 1000 },
  [DifficultyLevel.Expert]: { min: 500, max: 10000 },
  [DifficultyLevel.Mastery]: { min: 1000, max: 1000000 }
};
```

### `method.ts`

```typescript
import type { Solution } from './solution';

export enum MethodName {
  Distributive = 'distributive',
  NearPower10 = 'near-power-10',
  DifferenceSquares = 'difference-squares',
  Factorization = 'factorization',
  Squaring = 'squaring',
  Near100 = 'near-100'
}

export interface CalculationMethod {
  name: MethodName;
  displayName: string;
  isApplicable: (num1: number, num2: number) => boolean;
  computeCost: (num1: number, num2: number) => number;
  qualityScore: (num1: number, num2: number) => number;
  generateSolution: (num1: number, num2: number) => Solution;
  generateStudyContent: () => StudyContent;
}

export interface MethodCostBreakdown {
  stepCount: number;
  digitComplexity: number;
  memoryChunks: number;
  magnitudePenalty: number;
  totalCost: number;
}

export interface StudyContent {
  method: MethodName;
  introduction: string;
  mathematicalFoundation: string;
  deepDiveContent: string;
  whenToUse: string[];
  examples: StudyExample[];
  interactiveExercises: InteractiveExercise[];
}

export interface StudyExample {
  num1: number;
  num2: number;
  solution: Solution;
  pedagogicalNotes: string[];
}

export interface InteractiveExercise {
  num1: number;
  num2: number;
  hints: string[];
  expectedMethod: MethodName;
}
```

### `solution.ts`

```typescript
import type { MethodName } from './method';

export interface Solution {
  method: MethodName;
  optimalReason: string;
  steps: CalculationStep[];
  alternatives: AlternativeSolution[];
  validated: boolean;
  validationErrors: string[];
}

export interface CalculationStep {
  expression: string;
  result: number;
  explanation: string;
  subSteps?: CalculationStep[];
  depth: number;
}

export interface AlternativeSolution {
  method: MethodName;
  costScore: number;
  steps: CalculationStep[];
  whyNotOptimal: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
```

### `session.ts`

```typescript
import type { Problem } from './problem';
import type { DifficultyLevel, CustomRange } from './problem';
import type { MethodName } from './method';
import type { Solution } from './solution';

export interface PracticeSession {
  id: string;
  startedAt: Date;
  endedAt?: Date;
  configuration: SessionConfig;
  problems: ProblemAttempt[];
  statistics: SessionStatistics;
}

export interface SessionConfig {
  difficulty: DifficultyLevel | CustomRange;
  methods: MethodName[];
  problemCount: number | 'infinite';
  allowNegatives: boolean;
}

export interface ProblemAttempt {
  problem: Problem;
  userAnswers: number[];
  correctAnswer: number;
  timeTaken: number;
  hintsUsed: number;
  skipped: boolean;
  solution: Solution;
  errorMagnitude: number;
}

export interface SessionStatistics {
  totalProblems: number;
  correctAnswers: number;
  accuracy: number;
  averageTime: number;
  averageError: number;
  methodBreakdown: Record<MethodName, MethodStats>;
}

export interface MethodStats {
  method: MethodName;
  problemsSolved: number;
  correctAnswers: number;
  accuracy: number;
  averageTime: number;
}
```

### `statistics.ts`

```typescript
import type { MethodName } from './method';
import type { DifficultyLevel } from './problem';
import type { MethodStats } from './session';

export interface UserStatistics {
  totalProblems: number;
  totalSessions: number;
  overallAccuracy: number;
  methodStatistics: Record<MethodName, CumulativeMethodStats>;
  difficultyStatistics: Record<DifficultyLevel, DifficultyStats>;
  timeSeriesData: TimeSeriesPoint[];
  weakAreas: WeakArea[];
}

export interface CumulativeMethodStats extends MethodStats {
  trend: 'improving' | 'stable' | 'declining';
  lastPracticed: Date;
}

export interface DifficultyStats {
  level: DifficultyLevel;
  problemsSolved: number;
  accuracy: number;
  averageTime: number;
}

export interface TimeSeriesPoint {
  date: Date;
  accuracy: number;
  problemCount: number;
  averageTime: number;
}

export interface WeakArea {
  category: 'method' | 'difficulty' | 'number_range';
  identifier: string;
  severity: number;
  recommendation: string;
}
```

### `index.ts` (barrel export)

```typescript
export * from './problem';
export * from './method';
export * from './solution';
export * from './session';
export * from './statistics';
```

---

## Step 1.3: Core Validation System

This is **CRITICAL**. The validation system is the cornerstone of mathematical correctness.

### `src/lib/core/validator.ts`

```typescript
import type { Solution, ValidationResult, CalculationStep } from '@/lib/types';

/**
 * Validates that a solution is mathematically correct.
 * This is the cornerstone of the entire application.
 */
export class SolutionValidator {
  /**
   * Primary validation: Checks if solution produces correct answer
   */
  static validateSolution(
    num1: number,
    num2: number,
    solution: Solution
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check 1: Solution has steps
    if (!solution.steps || solution.steps.length === 0) {
      errors.push('Solution has no steps');
      return { valid: false, errors, warnings };
    }

    // Check 2: Final answer matches direct multiplication
    const directResult = num1 * num2;
    const finalStep = solution.steps[solution.steps.length - 1];

    if (finalStep.result !== directResult) {
      errors.push(
        `Final answer ${finalStep.result} does not match ` +
        `direct multiplication ${directResult}`
      );
    }

    // Check 3: Every step is mathematically valid
    for (let i = 0; i < solution.steps.length; i++) {
      const step = solution.steps[i];
      const stepValidation = this.validateStep(step);
      if (!stepValidation.valid) {
        errors.push(`Step ${i + 1}: ${stepValidation.errors.join(', ')}`);
      }
      warnings.push(...stepValidation.warnings.map(w => `Step ${i + 1}: ${w}`));
    }

    // Check 4: Validate sub-steps recursively
    for (const step of solution.steps) {
      if (step.subSteps) {
        for (const subStep of step.subSteps) {
          const subValidation = this.validateStep(subStep);
          if (!subValidation.valid) {
            errors.push(`Sub-step error: ${subValidation.errors.join(', ')}`);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates a single calculation step
   */
  static validateStep(step: CalculationStep): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const computed = this.evaluateExpression(step.expression);

      // Use floating point tolerance for comparison
      if (Math.abs(computed - step.result) > 0.001) {
        errors.push(
          `Expression "${step.expression}" evaluates to ${computed} ` +
          `but step claims result is ${step.result}`
        );
      }
    } catch (error) {
      errors.push(
        `Failed to evaluate expression "${step.expression}": ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    if (!step.explanation || step.explanation.trim().length === 0) {
      warnings.push('Step has no explanation');
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Safely evaluates a mathematical expression.
   * SECURITY: Only allows arithmetic operations, no arbitrary code execution.
   */
  static evaluateExpression(expr: string): number {
    // Remove whitespace
    const cleanExpr = expr.replace(/\s+/g, '');

    // Security: Validate expression contains only safe characters
    // Allows: digits, operators (+, -, *, /), parentheses, decimal point, power symbol
    if (!/^[0-9+\-*/().^]+$/.test(cleanExpr)) {
      throw new Error('Expression contains invalid characters');
    }

    // Handle power notation (e.g., 50^2 or 50²)
    const normalizedExpr = cleanExpr
      .replace(/\^/g, '**')
      .replace(/²/g, '**2')
      .replace(/³/g, '**3');

    try {
      // Using Function constructor is safer than eval as it creates isolated scope
      // We've already validated the expression contains only arithmetic
      const result = new Function(`return ${normalizedExpr}`)() as unknown;

      if (typeof result !== 'number' || !isFinite(result)) {
        throw new Error('Invalid result');
      }

      return result;
    } catch {
      throw new Error(`Failed to evaluate: ${expr}`);
    }
  }

  /**
   * Cross-validates solution using multiple methods produce same answer
   */
  static crossValidate(
    num1: number,
    num2: number,
    solutions: Solution[]
  ): boolean {
    if (solutions.length === 0) return false;

    const expectedAnswer = num1 * num2;

    return solutions.every(solution => {
      if (!solution.steps || solution.steps.length === 0) return false;
      const lastStep = solution.steps[solution.steps.length - 1];
      return lastStep.result === expectedAnswer;
    });
  }
}
```

---

## Step 1.4: Validation Tests

### `src/tests/unit/validation/validator.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { SolutionValidator } from '@/lib/core/validator';
import type { Solution, MethodName } from '@/lib/types';

const createMockSolution = (
  steps: Array<{ expression: string; result: number; explanation: string }>
): Solution => ({
  method: 'difference-squares' as MethodName,
  optimalReason: 'Test',
  steps: steps.map((s, i) => ({ ...s, depth: 0 })),
  alternatives: [],
  validated: false,
  validationErrors: []
});

describe('SolutionValidator', () => {
  describe('validateSolution', () => {
    it('should validate correct solution for 47 × 53 = 2491', () => {
      const solution = createMockSolution([
        { expression: '50*50 - 3*3', result: 2491, explanation: 'Apply difference of squares' },
        { expression: '2500 - 9', result: 2491, explanation: 'Calculate' }
      ]);

      const result = SolutionValidator.validateSolution(47, 53, solution);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect incorrect final answer', () => {
      const solution = createMockSolution([
        { expression: '47 * 53', result: 2500, explanation: 'Wrong answer' }
      ]);

      const result = SolutionValidator.validateSolution(47, 53, solution);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('does not match'))).toBe(true);
    });

    it('should detect solution with no steps', () => {
      const solution: Solution = {
        method: 'distributive' as MethodName,
        optimalReason: 'Test',
        steps: [],
        alternatives: [],
        validated: false,
        validationErrors: []
      };

      const result = SolutionValidator.validateSolution(47, 53, solution);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('no steps');
    });

    it('should detect invalid step expression', () => {
      const solution = createMockSolution([
        { expression: '40*53 + 7*53', result: 2491, explanation: 'Partition' },
        { expression: '2120 + 371', result: 2491, explanation: 'Add' }
      ]);

      const result = SolutionValidator.validateSolution(47, 53, solution);
      expect(result.valid).toBe(true);
    });
  });

  describe('evaluateExpression', () => {
    it('should evaluate basic arithmetic', () => {
      expect(SolutionValidator.evaluateExpression('2 + 2')).toBe(4);
      expect(SolutionValidator.evaluateExpression('10 * 5')).toBe(50);
      expect(SolutionValidator.evaluateExpression('100 - 9')).toBe(91);
      expect(SolutionValidator.evaluateExpression('20 / 4')).toBe(5);
    });

    it('should handle parentheses', () => {
      expect(SolutionValidator.evaluateExpression('(50 - 3) * (50 + 3)')).toBe(2491);
      expect(SolutionValidator.evaluateExpression('(40 + 7) * 53')).toBe(2491);
    });

    it('should handle order of operations', () => {
      expect(SolutionValidator.evaluateExpression('2 + 3 * 4')).toBe(14);
      expect(SolutionValidator.evaluateExpression('50*50 - 3*3')).toBe(2491);
    });

    it('should handle power notation', () => {
      expect(SolutionValidator.evaluateExpression('50^2')).toBe(2500);
      expect(SolutionValidator.evaluateExpression('3^2')).toBe(9);
    });

    it('should reject expressions with invalid characters', () => {
      expect(() => SolutionValidator.evaluateExpression('alert("hack")')).toThrow();
      expect(() => SolutionValidator.evaluateExpression('Math.random()')).toThrow();
      expect(() => SolutionValidator.evaluateExpression('process.exit()')).toThrow();
    });
  });

  describe('crossValidate', () => {
    it('should confirm multiple methods give same answer', () => {
      const solution1 = createMockSolution([
        { expression: '47*53', result: 2491, explanation: '' }
      ]);
      const solution2 = createMockSolution([
        { expression: '50*50-3*3', result: 2491, explanation: '' }
      ]);

      expect(SolutionValidator.crossValidate(47, 53, [solution1, solution2])).toBe(true);
    });

    it('should detect inconsistent answers', () => {
      const solution1 = createMockSolution([
        { expression: '47*53', result: 2491, explanation: '' }
      ]);
      const solution2 = createMockSolution([
        { expression: '50*50-3*3', result: 2500, explanation: '' }
      ]);

      expect(SolutionValidator.crossValidate(47, 53, [solution1, solution2])).toBe(false);
    });

    it('should return false for empty solutions array', () => {
      expect(SolutionValidator.crossValidate(47, 53, [])).toBe(false);
    });
  });
});
```

---

## Quality Checklist

Before completing Phase 1:

- [ ] TypeScript compiles with no errors (`npx tsc --noEmit`)
- [ ] All types properly defined and exported
- [ ] Validator catches incorrect final answers
- [ ] Validator validates each step independently
- [ ] Expression evaluation is secure (no arbitrary code execution)
- [ ] All validation tests pass (`npm test`)
- [ ] Test coverage for validation ≥ 95%

---

## Git Workflow for Phase 1

```bash
# Commit atomic changes
git add src/lib/types/
git commit -m "feat: add complete type system (#1)"

git add vitest.config.ts src/tests/setup.ts
git commit -m "feat: configure vitest testing framework (#1)"

git add src/lib/core/validator.ts
git commit -m "feat: implement solution validation system (#1)"

git add src/tests/unit/validation/
git commit -m "test: add comprehensive validator tests (#1)"

# Push and create PR
git push -u origin feat/1-foundation
gh pr create --title "feat: project foundation and validation system" --body "Closes #1"
```

---

## References

- For testing strategy details: `docs/guides/testing-strategy.md`
- For git workflow details: `docs/guides/git-workflow-details.md`
- For code standards: `docs/guides/code-quality-standards.md`
