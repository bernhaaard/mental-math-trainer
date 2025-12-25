# Mental Math Mastery Training System - Comprehensive Requirements Document

## Executive Summary

This document specifies requirements for a web-based mental math training application designed to teach computational mastery through deep mathematical understanding. The system emphasizes **quality over functionality**, **correctness over speed**, and **understanding over memorization**.

### Core Principle
Every calculation method must be mathematically sound, every solution step must be verifiable, and every explanation must reveal the underlying algebraic structure that makes the technique work.

---

## 1. Technology Stack & Architecture

### 1.1 Frontend Framework
**PRIMARY CHOICE**: Next.js (Recommended for integrated full-stack architecture)
**ALTERNATIVE**: React + Vite with separate backend considerations

**Rationale**: Next.js provides:
- Integrated backend API routes for future PostgreSQL integration
- Built-in optimization and code splitting
- Server-side rendering capabilities for better initial load
- File-based routing for clean navigation structure

**Required Technologies**:
- TypeScript (strict mode enabled)
- React 18+ with functional components and hooks
- Tailwind CSS for styling
- IndexedDB (via Dexie.js or similar) for local persistence
- React Query or SWR for state management and caching
- Recharts or similar for statistics visualization
- Zod for runtime type validation
- Vitest or Jest for testing framework
- React Testing Library for component tests

### 1.2 Application Architecture

```
/src
  /app (or /pages)           # Next.js routing
  /components
    /ui                       # Reusable UI components
    /features                 # Feature-specific components
      /practice
      /study
      /statistics
  /lib
    /core                     # Core business logic
      /methods                # Calculation method implementations
        /distributive.ts
        /near-power-10.ts
        /difference-squares.ts
        /factorization.ts
        /squaring.ts
        /near-100.ts
        /method-selector.ts   # Method selection algorithm
        /cost-calculator.ts   # Computational cost heuristics
      /solution-generator.ts  # Solution path generation
      /problem-generator.ts   # Problem generation logic
      /validator.ts           # Step-by-step validation
    /storage                  # Data persistence layer
      /statistics-store.ts
      /settings-store.ts
      /session-store.ts
    /types                    # TypeScript type definitions
    /utils                    # Utility functions
  /tests
    /unit                     # Unit tests (90%+ coverage)
    /integration              # Integration tests
    /fixtures                 # Test data and known solutions
```

### 1.3 Data Persistence Strategy

**Phase 1 (MVP)**: IndexedDB with structured schema
- User settings and preferences
- Session history (last 100 sessions)
- Problem history (with solutions and user answers)
- Performance statistics (aggregated by method, difficulty, time period)
- Study progress tracking

**Phase 2 (Future)**: PostgreSQL backend
- Architecture must be designed for easy migration
- Use repository pattern to abstract storage layer
- All database interactions through interface contracts

### 1.4 Offline-First Considerations

While not a hard requirement, the architecture should:
- Store all static content and calculation logic locally
- Queue statistics updates if offline (sync when online)
- Gracefully degrade if backend unavailable
- Consider PWA manifest for installability (optional enhancement)

### 1.5 Responsive Design Requirements

**Priority Order**:
1. Desktop (1920×1080, 1440×900, 1280×720)
2. Tablet (768×1024, 1024×768)
3. Mobile (375×667, 414×896, 390×844)

**Breakpoints**:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Critical UI Elements**:
- Practice problem display must be readable at all sizes
- Step-by-step solutions must remain scannable on mobile
- Statistics charts must adapt to viewport width
- Keyboard navigation must work on desktop

---

## 2. Mathematical Foundations & Method Specifications

### 2.1 Core Mathematical Principles

Every method implementation must encode these foundational principles:

#### 2.1.1 Distributive Property
**Algebraic Foundation**: In the ring (ℤ, +, ×), for all a, b, c ∈ ℤ:
```
a(b + c) = ab + ac
```

**Implementation Requirements**:
- Recognize base-10 polynomial structure: n = Σᵢ dᵢ·10^i
- Support arbitrary additive decompositions
- Default to place-value partition for cognitive alignment
- Validate that sum of parts equals whole

**Computational Cost Model**:
- Base cost: number of sub-multiplications × digit complexity
- Tens multiplication: cost = 0.5 (trivial with zero append)
- Single-digit multiplication: cost = 1.0
- Multi-digit multiplication: cost = (digits1 × digits2)

#### 2.1.2 Commutativity and Associativity
**Algebraic Foundation**: (ℤ\{0}, ×) forms a commutative monoid:
```
a × b = b × a               (commutativity)
(a × b) × c = a × (b × c)   (associativity)
```

**Implementation Requirements**:
- Allow factor reordering for optimal computation
- Group factors to create multiples of 10, 100, etc.
- Validate factor tree equality after regrouping

#### 2.1.3 Difference of Squares
**Algebraic Identity**: For all a, b ∈ ℤ:
```
a² - b² = (a - b)(a + b)
```

**Applicability Conditions**:
- Two numbers symmetric about midpoint: (c - k)(c + k)
- Deviation k should be small relative to center c
- Most efficient when c is a round number (50, 100, 500, etc.)

**Implementation Requirements**:
- Detect symmetry: |(num1 + num2)/2 - num1| = |(num1 + num2)/2 - num2|
- Calculate midpoint and deviation
- Validate: (c - k)(c + k) = c² - k²
- Prefer when |k| ≤ 20 and c is computationally simple

#### 2.1.4 Near Powers of 10
**Mathematical Pattern**: For n = 10^k ± ε where ε is small:
```
n × m = (10^k ± ε) × m = 10^k·m ± ε·m
```

**Implementation Requirements**:
- Identify nearest power of 10 within threshold (default: ±15)
- Calculate offset ε
- Validate that |ε| justifies the method (ε·m should be easy)
- Prefer when ε·m involves fewer or simpler operations

#### 2.1.5 Squaring Formula (Binomial Expansion)
**Algebraic Foundation**: For n = 10m + d:
```
n² = (10m + d)² = 100m² + 20md + d²
```

**Applicability Conditions**:
- Same number: a × a
- Near-same: |a - b| ≤ 5, can use n(n+k) = n² + nk

**Implementation Requirements**:
- Parse number into tens (m) and ones (d)
- Compute three terms: 100m², 20md, d²
- Validate sum equals n²
- For near-squares, validate n(n+k) = n² + nk

#### 2.1.6 Near-100 Cross Multiplication
**Algebraic Identity**: For numbers near 100:
```
(100 - a)(100 - b) = 100(100 - a - b) + ab
```

**Proof**:
```
(100 - a)(100 - b) = 10000 - 100a - 100b + ab
                    = 10000 - 100(a + b) + ab
                    = 100[100 - (a + b)] + ab
```

**Applicability Conditions**:
- Both numbers within ±15 of 100
- Offsets a, b are small enough that ab is easy to compute

**Implementation Requirements**:
- Calculate offsets: a = 100 - num1, b = 100 - num2
- Compute complement: 100 - (a + b)
- Compute product: a × b
- Validate result: 100·complement + ab

#### 2.1.7 Strategic Factorization
**Mathematical Foundation**: Fundamental Theorem of Arithmetic guarantees unique prime factorization. Commutativity and associativity allow free rearrangement.

**Factorization Heuristics**:
1. Identify factors of 2, 3, 4, 5, 6, 8, 10 (computationally cheap)
2. Prefer factorizations that yield multiples of 10
3. Group factors to minimize intermediate calculation complexity

**Implementation Requirements**:
- Factor both numbers into small components
- Use commutativity to reorder: a·b·c·d → (a·c)·(b·d) if a·c or b·d yields 10, 100, etc.
- Validate final product equals original
- Cost function: prefer regroupings that maximize multiples of 10

### 2.2 Method Selection Algorithm (Hybrid Approach)

**Algorithm Flow**:
```typescript
function selectOptimalMethod(num1: number, num2: number): MethodRanking {
  const applicableMethods: MethodWithCost[] = [];
  
  // Test each method for applicability
  for (const method of ALL_METHODS) {
    if (method.isApplicable(num1, num2)) {
      const cost = method.computeCost(num1, num2);
      const quality = method.qualityScore(num1, num2);
      applicableMethods.push({ method, cost, quality });
    }
  }
  
  // Sort by composite score (cost + quality factors)
  applicableMethods.sort((a, b) => {
    const scoreA = a.cost * 0.6 + (1 - a.quality) * 0.4;
    const scoreB = b.cost * 0.6 + (1 - b.quality) * 0.4;
    return scoreA - scoreB;
  });
  
  // Return top 3 methods with explanations
  return {
    optimal: applicableMethods[0],
    alternatives: applicableMethods.slice(1, 3),
    reasoning: generateComparisonExplanation(applicableMethods)
  };
}
```

**Computational Cost Model**:

Each method calculates cost based on:
- **Step Count**: Number of intermediate calculations
- **Operation Complexity**: Single-digit vs multi-digit operations
- **Cognitive Load**: Memory chunks required (target: ≤7)
- **Magnitude Handling**: Working with large numbers increases cost

**Cost Formula Template**:
```
Cost = (step_count × 1.0) + 
       (digit_complexity × 0.8) + 
       (memory_chunks × 0.5) + 
       (magnitude_penalty × 0.3)
```

**Quality Score Factors**:
- **Method Elegance**: Does it exploit symmetry or structure?
- **Explanation Clarity**: How intuitive is the decomposition?
- **Educational Value**: Does it teach a transferable pattern?

**Priority Heuristics When Costs Are Close** (within 10%):
1. Difference of squares (most elegant when applicable)
2. Near-100 (teaches deficit thinking)
3. Squaring formulas (reinforces binomial patterns)
4. Near powers of 10 (emphasizes base-10 structure)
5. Factorization (teaches multiplicative manipulation)
6. Distributive (always works, foundational)

**Edge Case Handling**:

| Case | Example | Method Selection |
|------|---------|------------------|
| Exactly 100 | 100 × 95 | Near-100 with note that a=0 |
| Multiple methods tie | 45 × 55 | Show both difference-squares and factorization |
| No good method | 347 × 923 | Combine methods or force least-bad with warning |
| Trivial (×10^k) | 45 × 1000 | Omit from problem generation |
| One factor is 0 or 1 | 47 × 0 | Omit from problem generation |

### 2.3 Solution Path Generation Requirements

#### 2.3.1 Level 2 Explanation (Practice Mode)

**Required Components**:
1. **Method Identification**: "Using [Method Name] because [brief reason]"
2. **Algebraic Identity Citation**: State the relevant formula/property
3. **Step-by-Step Decomposition**: Each transformation explicitly shown
4. **Sub-calculation Arithmetic**: Show intermediate results
5. **Validation**: Final answer explicitly stated

**Example Template**:
```
Problem: 47 × 53

Method: Difference of Squares
Reason: Numbers are symmetric around 50 (deviation of 3)

Identity: a² - b² = (a - b)(a + b)

Steps:
1. Recognize symmetry: 47 = 50 - 3, 53 = 50 + 3
2. Apply identity: (50 - 3)(50 + 3) = 50² - 3²
3. Calculate squares:
   - 50² = 2500
   - 3² = 9
4. Subtract: 2500 - 9 = 2491

Answer: 2491
```

#### 2.3.2 Level 3 Explanation (Study Mode)

**Required Components** (in addition to Level 2):
1. **Mathematical Foundation**: Explain the underlying algebraic structure
2. **Why It Works**: Prove the identity or property used
3. **Geometric Interpretation** (when applicable): Visual understanding
4. **Cognitive Strategy**: Why this decomposition minimizes mental load
5. **Generalization**: How the pattern extends to other numbers

**Example Addition to Template**:
```
Mathematical Foundation:
The difference of squares identity a² - b² = (a - b)(a + b) is a 
fundamental algebraic factorization. It holds in any commutative ring.

Proof:
(a - b)(a + b) = a² + ab - ba - b²
               = a² + ab - ab - b²  [commutativity: ab = ba]
               = a² - b²

Geometric Interpretation:
A square of side a with a smaller square of side b removed has area
a² - b². This region can be rearranged into a rectangle with 
dimensions (a - b) × (a + b), proving the identity geometrically.

Cognitive Strategy:
When two numbers are equidistant from a center point c, writing them
as (c - k) and (c + k) transforms multiplication into "center squared
minus deviation squared." This is computationally cheaper because:
- Squaring feels more natural than arbitrary multiplication
- Subtraction of small numbers is easier than large multiplications
- The pattern is memorable and transferable

Generalization:
For any two numbers with mean μ and difference 2d:
(μ - d)(μ + d) = μ² - d²

This works best when:
- μ is a round number (10, 50, 100, 500, etc.)
- d is small (typically ≤20)
- You can quickly square both μ and d
```

#### 2.3.3 Sub-calculation Drill-Down System

**Requirements**:
- Every calculation step must be expandable
- Drill-down reveals constituent operations
- Maximum depth: 3 levels for reasonable complexity
- Each level validates correctness

**Example Hierarchy**:
```
Level 0 (Visible): 847 × 900 = 762,300

Level 1 (Drill-down): 
  847 × 900 = 847 × (9 × 100)
            = (847 × 9) × 100
            = 7,623 × 100
            = 762,300

Level 2 (Deeper drill-down on 847 × 9):
  847 × 9 = (800 + 47) × 9
          = 800 × 9 + 47 × 9
          = 7,200 + 423
          = 7,623

Level 3 (Deepest drill-down on 47 × 9):
  47 × 9 = (40 + 7) × 9
         = 40 × 9 + 7 × 9
         = 360 + 63
         = 423
```

**Implementation Strategy**:
```typescript
interface CalculationStep {
  expression: string;
  result: number;
  explanation: string;
  subSteps?: CalculationStep[];  // Recursive drill-down
  validated: boolean;              // Verified correct
}

function generateDrillDown(
  a: number, 
  b: number, 
  maxDepth: number = 3
): CalculationStep {
  // Base case: single-digit multiplication
  if (a < 10 && b < 10) {
    return {
      expression: `${a} × ${b}`,
      result: a * b,
      explanation: "Single-digit multiplication (memorized)",
      validated: true
    };
  }
  
  // Recursive case: apply distributive property
  // ... (decompose and recurse)
}
```

#### 2.3.4 Alternative Method Comparison

**Requirements**:
- Show complete solution for optimal method
- Show complete solutions for top 2-3 alternatives
- Provide explicit comparison explaining why optimal is better

**Comparison Template**:
```
Problem: 98 × 87

Optimal Method: Near-100 Cross Multiplication
Cost Score: 4.2 | Steps: 3 | Cognitive Load: Low

Alternative 1: Distributive Property (Place Value)
Cost Score: 6.8 | Steps: 5 | Cognitive Load: Medium
Why Not Optimal: More intermediate calculations, larger numbers to handle

Alternative 2: Factorization
Cost Score: 7.5 | Steps: 6 | Cognitive Load: Medium-High
Why Not Optimal: No obvious factors yield multiples of 10

Comparison Summary:
Near-100 is optimal because both numbers are very close to 100 
(within 15), allowing the elegant deficit calculation:
(100-2)(100-13) = 100(85) + 26 = 8,526

This requires only:
1. Two small subtractions (100-98=2, 100-87=13)
2. One small addition (2+13=15)
3. One subtraction from 100 (100-15=85)
4. One small multiplication (2×13=26)
5. One addition (8,500+26=8,526)

Compare this to distributive property which would require:
1. Partition 98 = 90 + 8
2. Compute 90 × 87 = 7,830
3. Compute 8 × 87 = 696
4. Add 7,830 + 696 = 8,526

The near-100 method exploits the special structure of numbers near 100,
reducing cognitive load by working with small offsets rather than
large partial products.
```

### 2.4 Validation & Correctness Requirements

**Critical Requirement**: Every generated solution must be 100% correct. A single arithmetic error is unacceptable.

**Validation Strategy**:

1. **Forward Validation**: Compute the problem directly
```typescript
const directResult = num1 * num2;
```

2. **Method-Specific Validation**: Verify each step follows mathematical rules
```typescript
function validateDifferenceOfSquares(
  num1: number, 
  num2: number, 
  steps: CalculationStep[]
): ValidationResult {
  const sum = num1 + num2;
  const midpoint = sum / 2;
  const deviation = (num2 - num1) / 2;
  
  // Verify symmetry
  assert(num1 === midpoint - deviation);
  assert(num2 === midpoint + deviation);
  
  // Verify identity application
  const identityResult = midpoint ** 2 - deviation ** 2;
  assert(identityResult === directResult);
  
  // Verify each step in chain
  for (const step of steps) {
    assert(evaluateExpression(step.expression) === step.result);
  }
  
  return { valid: true, errors: [] };
}
```

3. **Backward Validation**: Start from answer, verify each reverse step is legal
```typescript
function backwardValidate(
  finalAnswer: number,
  steps: CalculationStep[]
): boolean {
  let current = finalAnswer;
  
  for (let i = steps.length - 1; i >= 0; i--) {
    const step = steps[i];
    // Verify that applying inverse operation yields previous step
    if (!canReverseTo(current, step.expression)) {
      return false;
    }
    current = reverseStep(current, step);
  }
  
  return current === (num1 * num2);
}
```

4. **Cross-Method Validation**: Verify multiple methods yield same answer
```typescript
function crossValidate(num1: number, num2: number): boolean {
  const methods = getAllApplicableMethods(num1, num2);
  const results = methods.map(m => m.solve(num1, num2));
  return results.every(r => r === results[0]);
}
```

**Test Suite Requirements**:

Maintain test fixtures with known correct solutions:
```typescript
const KNOWN_SOLUTIONS = [
  { num1: 47, num2: 53, answer: 2491, methods: ['difference-squares'] },
  { num1: 98, num2: 87, answer: 8526, methods: ['near-100', 'distributive'] },
  { num1: 73, num2: 73, answer: 5329, methods: ['squaring'] },
  // ... hundreds more covering all edge cases
];
```

Run exhaustive validation:
- Test all methods against known solutions
- Generate random problems and cross-validate
- Test boundary conditions (max ranges, negative numbers)
- Test edge cases (powers of 10, perfect squares, etc.)

---

## 3. Difficulty Levels & Problem Generation

### 3.1 Difficulty Range Specifications

| Level | Range | Description | Expected User Proficiency |
|-------|-------|-------------|--------------------------|
| **Beginner** | 2-100 × 2-100 | Foundation building | Learning basic decomposition |
| **Intermediate** | 20-400 × 20-400 | Skill development | Comfortable with 2-digit methods |
| **Advanced** | 100-1,000 × 100-1,000 | Pattern recognition | Recognizing optimal methods quickly |
| **Expert** | 500-10,000 × 500-10,000 | Mastery refinement | Handling large numbers fluently |
| **Mastery** | 1,000-1,000,000 × 1,000-1,000,000 | True expertise | Complex multi-step calculations |

**Hard Limit**: 1,000,000,000 × 1,000,000,000 (performance ceiling)

### 3.2 Problem Generation Algorithm

**Weighted Distribution Within Range**:
```typescript
interface DifficultyWeights {
  easy: number;      // Lower end of range
  medium: number;    // Middle of range
  hard: number;      // Upper end of range
  extreme: number;   // Edge cases near limits
}

const DEFAULT_WEIGHTS: DifficultyWeights = {
  easy: 0.25,
  medium: 0.50,
  hard: 0.20,
  extreme: 0.05
};
```

**Generation Strategy**:
1. Select method(s) based on user configuration
2. Determine sub-range based on difficulty weights
3. Generate number pair that exemplifies selected method
4. Validate that method is actually optimal (not just applicable)
5. Ensure diversity (don't repeat similar patterns consecutively)

**Method-Specific Generation**:

Each method has a generator function:
```typescript
interface MethodGenerator {
  name: string;
  generate(min: number, max: number): [number, number];
  ensuresApplicability(): boolean;
}

const DifferenceOfSquaresGenerator: MethodGenerator = {
  name: 'difference-squares',
  generate(min, max) {
    // Find suitable midpoint within range
    const midpoint = randomInRange(
      Math.ceil(min / 2),
      Math.floor(max / 2)
    );
    
    // Choose deviation (prefer smaller for elegance)
    const maxDeviation = Math.min(20, midpoint - min, max - midpoint);
    const deviation = weightedRandom(1, maxDeviation, weights);
    
    return [midpoint - deviation, midpoint + deviation];
  },
  ensuresApplicability() {
    return true;  // Always generates applicable pairs
  }
};
```

**Diversity Enforcement**:
- Track last 5 problems
- Avoid repeating same method type consecutively
- Vary difficulty within selected range
- Ensure mix of number sizes (small, medium, large within range)

### 3.3 Negative Number Support

**Configuration**:
- Default: OFF (positive integers only)
- Activation: User toggle in advanced/expert/mastery modes
- Behavior: Either factor can be negative (not both, to avoid double negative)

**Generation with Negatives**:
```typescript
function generateWithNegatives(
  min: number, 
  max: number, 
  allowNegative: boolean
): [number, number] {
  let [num1, num2] = generatePositivePair(min, max);
  
  if (allowNegative && Math.random() < 0.3) {  // 30% chance
    if (Math.random() < 0.5) {
      num1 = -num1;
    } else {
      num2 = -num2;
    }
  }
  
  return [num1, num2];
}
```

**Solution Adaptation**:
- Methods work identically (mathematical identities hold for negatives)
- Explanation notes sign handling: "Since one factor is negative, final result will be negative"
- Validation ensures sign correctness

### 3.4 Excluded Cases

**Never Generate**:
- Multiplication by 0
- Multiplication by 1
- Multiplication by exact powers of 10 (10, 100, 1000, etc.)
- Both factors identical and small (< 10), unless specifically practicing squaring

---

## 4. User Interface Specifications

### 4.1 Design System

**Color Palette** (Dark Mode Default):
```css
:root {
  --bg-primary: #0f172a;       /* slate-900 */
  --bg-secondary: #1e293b;     /* slate-800 */
  --bg-tertiary: #334155;      /* slate-700 */
  
  --text-primary: #f1f5f9;     /* slate-100 */
  --text-secondary: #cbd5e1;   /* slate-300 */
  --text-muted: #94a3b8;       /* slate-400 */
  
  --accent-primary: #3b82f6;   /* blue-500 */
  --accent-hover: #2563eb;     /* blue-600 */
  --accent-active: #1d4ed8;    /* blue-700 */
  
  --success: #10b981;          /* green-500 */
  --error: #ef4444;            /* red-500 */
  --warning: #f59e0b;          /* amber-500 */
  --info: #06b6d4;             /* cyan-500 */
  
  --border: #475569;           /* slate-600 */
  --border-light: #64748b;     /* slate-500 */
}
```

**Typography**:
- Font: Inter or system-ui fallback
- Base size: 16px (1rem)
- Scale: 1.25 (major third)
  - xs: 0.64rem (10px)
  - sm: 0.8rem (13px)
  - base: 1rem (16px)
  - lg: 1.25rem (20px)
  - xl: 1.563rem (25px)
  - 2xl: 1.953rem (31px)
  - 3xl: 2.441rem (39px)
  - 4xl: 3.052rem (49px)

**Spacing System**:
- Based on 4px grid
- 1 unit = 0.25rem = 4px
- Common: 4, 8, 12, 16, 24, 32, 48, 64px

**Component Hierarchy**:
1. Layout (Page containers, navigation)
2. Sections (Major UI divisions)
3. Cards (Grouped content)
4. Components (Interactive elements)
5. Typography (Text elements)

### 4.2 Navigation Structure

```
┌─────────────────────────────────────┐
│  Mental Math Mastery               │
│  [Study] [Practice] [Stats] [Help] │
└─────────────────────────────────────┘

Main Menu:
  ├─ Study Mode
  │    ├─ Introduction to Methods
  │    ├─ Distributive Property
  │    ├─ Near Powers of 10
  │    ├─ Difference of Squares
  │    ├─ Factorization Strategies
  │    ├─ Squaring Techniques
  │    └─ Near-100 Method
  │
  ├─ Practice Mode
  │    ├─ Configuration Screen
  │    │    ├─ Difficulty Level
  │    │    ├─ Method Selection
  │    │    ├─ Problem Count
  │    │    ├─ Negative Numbers Toggle
  │    │    └─ Start Button
  │    │
  │    ├─ Practice Session
  │    │    ├─ Problem Display
  │    │    ├─ Answer Input
  │    │    ├─ Hint Button
  │    │    ├─ Skip Button
  │    │    └─ Progress Indicator
  │    │
  │    └─ Solution Review
  │         ├─ Correctness Feedback
  │         ├─ Optimal Method Explanation
  │         ├─ Alternative Methods
  │         ├─ Step-by-Step Solution
  │         └─ Next/Finish Button
  │
  ├─ Statistics Dashboard
  │    ├─ Overall Performance Summary
  │    ├─ Method-Specific Statistics
  │    ├─ Accuracy Trends (Charts)
  │    ├─ Time Performance
  │    ├─ Error Analysis
  │    ├─ Weak Areas Identification
  │    └─ Export Data Button
  │
  └─ Help & Documentation
       ├─ Getting Started Guide
       ├─ Keyboard Shortcuts
       ├─ UI Navigation Help
       └─ About / Credits
```

### 4.3 Practice Mode UI Flow

**Configuration Screen**:
```
┌──────────────────────────────────────────────────┐
│  Configure Practice Session                     │
├──────────────────────────────────────────────────┤
│                                                  │
│  Difficulty Level:                               │
│  [Beginner] [Intermediate] [Advanced]            │
│  [Expert] [Mastery]                              │
│                                                  │
│  Or set custom range:                            │
│  First number:  [____] to [____]                │
│  Second number: [____] to [____]                │
│                                                  │
│  Methods to Practice:                            │
│  ☑ All Methods (Mixed)                          │
│  ☐ Distributive Property                        │
│  ☐ Near Powers of 10                            │
│  ☐ Difference of Squares                        │
│  ☐ Factorization                                │
│  ☐ Squaring Techniques                          │
│  ☐ Near-100 Method                              │
│                                                  │
│  Problems in session: [  5 ▼]                   │
│  ☐ Infinite mode (continue until stop)          │
│  ☐ Allow negative numbers (Advanced+)           │
│                                                  │
│  [        Start Practice Session        ]       │
└──────────────────────────────────────────────────┘
```

**Practice Session Screen**:
```
┌──────────────────────────────────────────────────┐
│  Problem 3 of 10              Time: 0:23        │
│  [████████░░░░░░░░░░] 30%                       │
├──────────────────────────────────────────────────┤
│                                                  │
│                    347 × 923                     │
│                                                  │
│                  ┌──────────┐                   │
│                  │          │                   │
│                  └──────────┘                   │
│              (Enter your answer)                 │
│                                                  │
│  Attempts: ●○○                                  │
│                                                  │
│  [  Hint  ]  [  Skip  ]       [ Submit ]       │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Solution Review Screen**:
```
┌──────────────────────────────────────────────────┐
│  ✓ Correct!  (or ✗ Incorrect)                   │
│  Your answer: 320,281    Time: 23s              │
├──────────────────────────────────────────────────┤
│                                                  │
│  Optimal Method: Near Powers of 10              │
│  (Cost: 4.2 | Complexity: Medium)               │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │ Why This Method:                           │ │
│  │ 347 is close to 350 (50 × 7), allowing    │ │
│  │ us to use near-multiples simplification.  │ │
│  │                                            │ │
│  │ Step-by-Step:                              │ │
│  │ 1. Recognize 923 ≈ 900 + 23                │ │
│  │ 2. Apply: 347×900 + 347×23                 │ │
│  │ 3. Calculate 347×9 = 3,123 → ×100          │ │
│  │    [▶ Show sub-steps]                      │ │
│  │ 4. Calculate 347×23 = ...                  │ │
│  │    [▶ Show sub-steps]                      │ │
│  │ 5. Add: 312,300 + 7,981 = 320,281         │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  Alternative Methods ▼                           │
│  [View Distributive] [View Factorization]       │
│                                                  │
│  [     Next Problem     ]  [  End Session  ]    │
└──────────────────────────────────────────────────┘
```

### 4.4 Study Mode UI

**Method Page Template**:
```
┌──────────────────────────────────────────────────┐
│  ← Back to Study Menu                           │
├──────────────────────────────────────────────────┤
│                                                  │
│  Difference of Squares Method                    │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │ Mathematical Foundation                     │ │
│  │                                            │ │
│  │ The identity a² - b² = (a-b)(a+b) is one  │ │
│  │ of the most elegant algebraic patterns... │ │
│  │                                            │ │
│  │ [▼ Show Deep Dive: Ring Theory & Proofs]  │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  When to Use This Method:                        │
│  • Numbers symmetric around a midpoint           │
│  • Deviation from midpoint is small (≤20)        │
│  • Midpoint is a round number (10, 50, 100...)  │
│                                                  │
│  Example 1: 47 × 53                              │
│  [Full walkthrough with interactive elements]    │
│                                                  │
│  Example 2: 96 × 104                             │
│  [Full walkthrough]                              │
│                                                  │
│  Try It Yourself:                                │
│  Solve: 43 × 57                                  │
│  [Answer input with validation]                  │
│                                                  │
│  [  Previous Method  ]  [  Next Method  ]       │
└──────────────────────────────────────────────────┘
```

### 4.5 Statistics Dashboard

**Layout**:
```
┌──────────────────────────────────────────────────┐
│  Your Performance                               │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │  1,247   │ │  87.3%   │ │  18.5s   │        │
│  │ Problems │ │ Accuracy │ │ Avg Time │        │
│  └──────────┘ └──────────┘ └──────────┘        │
│                                                  │
│  Accuracy Over Time:                             │
│  ┌────────────────────────────────────────────┐ │
│  │         [Line chart showing trend]         │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  Performance by Method:                          │
│  ┌────────────────────────────────────────────┐ │
│  │ Distributive        92% │█████████░│ 342   │ │
│  │ Near Power-10       85% │████████░░│ 198   │ │
│  │ Diff of Squares     91% │█████████░│ 156   │ │
│  │ Factorization       79% │████████░░│ 223   │ │
│  │ Squaring            88% │█████████░│ 167   │ │
│  │ Near-100            94% │█████████░│ 161   │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  Weak Areas:                                     │
│  • Factorization needs practice (79% accuracy)   │
│  • Slower on Expert level (avg 42s vs 18s)      │
│                                                  │
│  [  Export Statistics  ]                        │
└──────────────────────────────────────────────────┘
```

### 4.6 Keyboard Navigation

**Global Shortcuts**:
- `s` - Study Mode
- `p` - Practice Mode
- `t` - Statistics (sTatistics)
- `h` - Help
- `?` - Show keyboard shortcuts overlay
- `Esc` - Go back / Close modal

**Practice Session Shortcuts**:
- `Enter` - Submit answer
- `Tab` - Focus next input/button
- `Shift+Tab` - Focus previous
- `Ctrl+H` - Show hint
- `Ctrl+S` - Skip problem
- `Ctrl+Q` - Quit session

**Solution Review Shortcuts**:
- `Space` - Next problem
- `e` - End session
- `a` - View alternative methods
- `d` - Toggle drill-down

### 4.7 Responsive Behavior

**Mobile Adaptations** (< 640px):
- Single column layout
- Larger touch targets (48px minimum)
- Simplified navigation (hamburger menu)
- Step-by-step solutions stack vertically
- Charts adapt to portrait orientation

**Tablet Adaptations** (640px - 1024px):
- Two-column layout where applicable
- Side-by-side comparisons remain readable
- Navigation in horizontal bar

**Desktop Optimizations** (> 1024px):
- Three-column layouts for dense information
- Side-by-side method comparisons
- Expanded drill-down trees
- Richer data visualizations

---

## 5. Data Models & Persistence

### 5.1 Core Type Definitions

```typescript
// Core calculation types
interface Problem {
  id: string;
  num1: number;
  num2: number;
  answer: number;
  difficulty: DifficultyLevel;
  generatedAt: Date;
}

interface CalculationMethod {
  name: MethodName;
  displayName: string;
  isApplicable: (num1: number, num2: number) => boolean;
  computeCost: (num1: number, num2: number) => number;
  qualityScore: (num1: number, num2: number) => number;
  generateSolution: (num1: number, num2: number) => Solution;
  generateStudyContent: () => StudyContent;
}

interface Solution {
  method: MethodName;
  optimalReason: string;
  steps: CalculationStep[];
  alternatives: AlternativeSolution[];
  validated: boolean;
  validationErrors: string[];
}

interface CalculationStep {
  expression: string;
  result: number;
  explanation: string;
  subSteps?: CalculationStep[];
  depth: number;
}

interface AlternativeSolution {
  method: MethodName;
  costScore: number;
  steps: CalculationStep[];
  whyNotOptimal: string;
}

// Session and history types
interface PracticeSession {
  id: string;
  startedAt: Date;
  endedAt?: Date;
  configuration: SessionConfig;
  problems: ProblemAttempt[];
  statistics: SessionStatistics;
}

interface SessionConfig {
  difficulty: DifficultyLevel | CustomRange;
  methods: MethodName[];
  problemCount: number | 'infinite';
  allowNegatives: boolean;
}

interface CustomRange {
  num1Min: number;
  num1Max: number;
  num2Min: number;
  num2Max: number;
}

interface ProblemAttempt {
  problem: Problem;
  userAnswers: number[];  // Up to 3 attempts
  correctAnswer: number;
  timeTaken: number;  // milliseconds
  hintsUsed: number;
  skipped: boolean;
  solution: Solution;
  errorMagnitude: number;  // |userAnswer - correctAnswer|
}

interface SessionStatistics {
  totalProblems: number;
  correctAnswers: number;
  accuracy: number;  // percentage
  averageTime: number;
  averageError: number;
  methodBreakdown: Map<MethodName, MethodStats>;
}

interface MethodStats {
  method: MethodName;
  problemsSolved: number;
  correctAnswers: number;
  accuracy: number;
  averageTime: number;
}

// Study mode types
interface StudyContent {
  method: MethodName;
  introduction: string;
  mathematicalFoundation: string;
  deepDiveContent: string;  // Toggleable advanced content
  whenToUse: string[];
  examples: StudyExample[];
  interactiveExercises: InteractiveExercise[];
}

interface StudyExample {
  problem: Problem;
  fullWalkthrough: Solution;
  pedagogicalNotes: string[];
}

interface InteractiveExercise {
  problem: Problem;
  hints: string[];
  expectedMethod: MethodName;
  validationFeedback: (userAnswer: number) => string;
}

// Statistics types
interface UserStatistics {
  userId: string;
  totalProblems: number;
  totalSessions: number;
  overallAccuracy: number;
  methodStatistics: Map<MethodName, CumulativeMethodStats>;
  difficultyStatistics: Map<DifficultyLevel, DifficultyStats>;
  timeSeriesData: TimeSeriesPoint[];
  weakAreas: WeakArea[];
}

interface CumulativeMethodStats extends MethodStats {
  trend: 'improving' | 'stable' | 'declining';
  lastPracticed: Date;
}

interface DifficultyStats {
  level: DifficultyLevel;
  problemsSolved: number;
  accuracy: number;
  averageTime: number;
}

interface TimeSeriesPoint {
  date: Date;
  accuracy: number;
  problemCount: number;
  averageTime: number;
}

interface WeakArea {
  category: 'method' | 'difficulty' | 'number_range';
  identifier: string;
  severity: number;  // 0-10 scale
  recommendation: string;
}

// Enums
enum DifficultyLevel {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
  Expert = 'expert',
  Mastery = 'mastery'
}

enum MethodName {
  Distributive = 'distributive',
  NearPower10 = 'near-power-10',
  DifferenceSquares = 'difference-squares',
  Factorization = 'factorization',
  Squaring = 'squaring',
  Near100 = 'near-100'
}
```

### 5.2 IndexedDB Schema

```typescript
// Database schema using Dexie.js
class MentalMathDB extends Dexie {
  sessions!: Table<PracticeSession>;
  problems!: Table<Problem>;
  statistics!: Table<UserStatistics>;
  studyProgress!: Table<StudyProgress>;
  settings!: Table<UserSettings>;

  constructor() {
    super('MentalMathDB');
    
    this.version(1).stores({
      sessions: 'id, startedAt, configuration.difficulty',
      problems: 'id, generatedAt, difficulty',
      statistics: 'userId',
      studyProgress: 'method, completedAt',
      settings: 'key'
    });
  }
}

// Storage limits
const STORAGE_LIMITS = {
  maxSessions: 100,  // Keep last 100 sessions
  maxProblems: 10000,  // Keep last 10k problems
  aggregationThreshold: 90,  // Days before aggregating old data
};

// Data retention policy
async function cleanupOldData() {
  const db = new MentalMathDB();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - STORAGE_LIMITS.aggregationThreshold);
  
  // Aggregate old sessions into statistics
  const oldSessions = await db.sessions
    .where('startedAt')
    .below(cutoffDate)
    .toArray();
  
  if (oldSessions.length > 0) {
    await aggregateSessionsToStats(oldSessions);
    await db.sessions
      .where('startedAt')
      .below(cutoffDate)
      .delete();
  }
}
```

### 5.3 Export Format

**JSON Export Structure**:
```json
{
  "exportVersion": "1.0",
  "exportedAt": "2025-01-15T10:30:00Z",
  "user": {
    "userId": "user-uuid",
    "statistics": {
      "totalProblems": 1247,
      "totalSessions": 89,
      "overallAccuracy": 87.3,
      "methodStatistics": {
        "distributive": {...},
        "near-power-10": {...}
      }
    }
  },
  "sessions": [
    {
      "id": "session-uuid",
      "startedAt": "2025-01-15T09:00:00Z",
      "configuration": {...},
      "problems": [...]
    }
  ],
  "studyProgress": [...]
}
```

**CSV Export** (for spreadsheet analysis):
- One row per problem attempt
- Columns: timestamp, problem, user_answer, correct_answer, time_taken, method_used, difficulty, accuracy

---

## 6. Testing Requirements

### 6.1 Unit Test Coverage

**Priority 1: Core Logic (100% Coverage Required)**:
- Method selection algorithm
- Solution generation for each method
- Step validation and verification
- Problem generation
- Cost calculation functions

**Test Files Structure**:
```
/tests/unit/
  /methods/
    distributive.test.ts
    near-power-10.test.ts
    difference-squares.test.ts
    factorization.test.ts
    squaring.test.ts
    near-100.test.ts
    method-selector.test.ts
  /validation/
    step-validator.test.ts
    solution-validator.test.ts
    cross-validator.test.ts
  /generation/
    problem-generator.test.ts
    difficulty-weighting.test.ts
```

**Example Test Template**:
```typescript
describe('DifferenceOfSquaresMethod', () => {
  describe('isApplicable', () => {
    it('should detect symmetric pairs', () => {
      expect(method.isApplicable(47, 53)).toBe(true);
      expect(method.isApplicable(96, 104)).toBe(true);
    });

    it('should reject non-symmetric pairs', () => {
      expect(method.isApplicable(47, 54)).toBe(false);
    });

    it('should handle exact midpoints', () => {
      expect(method.isApplicable(50, 50)).toBe(true);
    });
  });

  describe('generateSolution', () => {
    it('should produce correct solution for 47 × 53', () => {
      const solution = method.generateSolution(47, 53);
      
      expect(solution.steps.length).toBeGreaterThan(0);
      expect(solution.validated).toBe(true);
      expect(solution.validationErrors).toHaveLength(0);
      
      // Validate final answer
      const finalStep = solution.steps[solution.steps.length - 1];
      expect(finalStep.result).toBe(2491);
      
      // Validate intermediate steps
      expect(solution.steps[0].explanation).toContain('midpoint');
      expect(solution.steps[1].expression).toContain('50² - 3²');
    });

    it('should handle negative numbers', () => {
      const solution = method.generateSolution(-47, 53);
      expect(solution.steps[solution.steps.length - 1].result).toBe(-2491);
    });

    it('should include all required explanation components', () => {
      const solution = method.generateSolution(47, 53);
      
      expect(solution.optimalReason).toBeTruthy();
      expect(solution.steps.every(s => s.explanation)).toBe(true);
    });
  });

  describe('validation', () => {
    it('should validate every intermediate step', () => {
      const solution = method.generateSolution(47, 53);
      
      for (const step of solution.steps) {
        const computed = evaluateExpression(step.expression);
        expect(computed).toBe(step.result);
      }
    });

    it('should match direct multiplication', () => {
      const testCases = [
        [47, 53],
        [96, 104],
        [43, 57],
        [88, 112]
      ];

      for (const [a, b] of testCases) {
        const solution = method.generateSolution(a, b);
        const finalResult = solution.steps[solution.steps.length - 1].result;
        expect(finalResult).toBe(a * b);
      }
    });
  });
});
```

**Known Solutions Test Suite**:
```typescript
const KNOWN_SOLUTIONS: TestCase[] = [
  {
    num1: 47, num2: 53, answer: 2491,
    expectedMethod: 'difference-squares',
    steps: [
      { expr: '(50-3)(50+3)', result: 2491 },
      { expr: '50² - 3²', result: 2491 },
      { expr: '2500 - 9', result: 2491 }
    ]
  },
  {
    num1: 98, num2: 87, answer: 8526,
    expectedMethod: 'near-100',
    steps: [
      { expr: '(100-2)(100-13)', result: 8526 },
      { expr: '100(85) + 26', result: 8526 },
      { expr: '8500 + 26', result: 8526 }
    ]
  },
  // ... hundreds more test cases
];

describe('Known Solutions Validation', () => {
  KNOWN_SOLUTIONS.forEach(testCase => {
    it(`correctly solves ${testCase.num1} × ${testCase.num2}`, () => {
      const methods = selectOptimalMethod(testCase.num1, testCase.num2);
      const solution = methods.optimal.method.generateSolution(
        testCase.num1,
        testCase.num2
      );

      expect(methods.optimal.method.name).toBe(testCase.expectedMethod);
      expect(solution.validated).toBe(true);
      
      const finalAnswer = solution.steps[solution.steps.length - 1].result;
      expect(finalAnswer).toBe(testCase.answer);
    });
  });
});
```

### 6.2 Integration Tests

**User Flow Tests**:
```typescript
describe('Practice Session Flow', () => {
  it('should complete a full session successfully', async () => {
    // Configure session
    const config: SessionConfig = {
      difficulty: DifficultyLevel.Intermediate,
      methods: [MethodName.DifferenceSquares],
      problemCount: 5,
      allowNegatives: false
    };

    // Start session
    const session = await startPracticeSession(config);
    expect(session.problems).toHaveLength(5);

    // Attempt each problem
    for (const problem of session.problems) {
      const attempt = await submitAnswer(
        session.id,
        problem.id,
        problem.answer
      );
      
      expect(attempt.userAnswers[0]).toBe(problem.answer);
      expect(attempt.solution.validated).toBe(true);
    }

    // End session
    const completed = await endSession(session.id);
    expect(completed.statistics.accuracy).toBe(100);
  });

  it('should handle incorrect answers with retries', async () => {
    const problem = generateProblem({...});
    const wrongAnswer = problem.answer + 100;

    // First attempt (wrong)
    let result = await submitAnswer(sessionId, problem.id, wrongAnswer);
    expect(result.correct).toBe(false);
    expect(result.attemptsRemaining).toBe(2);

    // Second attempt (still wrong)
    result = await submitAnswer(sessionId, problem.id, wrongAnswer);
    expect(result.attemptsRemaining).toBe(1);

    // Third attempt (correct)
    result = await submitAnswer(sessionId, problem.id, problem.answer);
    expect(result.correct).toBe(true);
  });
});
```

### 6.3 Performance Tests

**Solution Generation Performance**:
```typescript
describe('Performance Benchmarks', () => {
  it('should generate solutions quickly for small numbers', () => {
    const start = performance.now();
    
    for (let i = 0; i < 100; i++) {
      const problem = generateProblem({
        difficulty: DifficultyLevel.Beginner
      });
      selectOptimalMethod(problem.num1, problem.num2);
    }
    
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(1000);  // 100 solutions in < 1s
  });

  it('should handle large numbers within time limit', () => {
    const problem = { num1: 847293, num2: 923847 };
    
    const start = performance.now();
    const solution = selectOptimalMethod(problem.num1, problem.num2);
    const elapsed = performance.now() - start;
    
    expect(elapsed).toBeLessThan(5000);  // < 5s for large numbers
    expect(solution.optimal.solution.validated).toBe(true);
  });
});
```

### 6.4 Continuous Validation

**Runtime Validation Checks**:
```typescript
// Every generated solution must pass these checks
function validateSolutionInProduction(
  problem: Problem,
  solution: Solution
): ValidationResult {
  const checks: ValidationCheck[] = [
    // 1. Final answer matches direct multiplication
    () => {
      const lastStep = solution.steps[solution.steps.length - 1];
      return lastStep.result === problem.num1 * problem.num2;
    },

    // 2. Every step is mathematically valid
    () => {
      return solution.steps.every(step => {
        const computed = evaluateExpression(step.expression);
        return computed === step.result;
      });
    },

    // 3. Step sequence is logically connected
    () => {
      for (let i = 1; i < solution.steps.length; i++) {
        const prev = solution.steps[i - 1];
        const curr = solution.steps[i];
        
        if (!isLogicalProgression(prev, curr)) {
          return false;
        }
      }
      return true;
    },

    // 4. Method was correctly identified as applicable
    () => {
      const method = getMethod(solution.method);
      return method.isApplicable(problem.num1, problem.num2);
    }
  ];

  const results = checks.map(check => {
    try {
      return { passed: check(), error: null };
    } catch (error) {
      return { passed: false, error };
    }
  });

  return {
    valid: results.every(r => r.passed),
    failedChecks: results.filter(r => !r.passed)
  };
}

// Automatically run on every solution generation
function generateSolutionWithValidation(
  num1: number,
  num2: number
): Solution {
  const solution = generateSolutionInternal(num1, num2);
  const validation = validateSolutionInProduction(
    { num1, num2, answer: num1 * num2 },
    solution
  );

  if (!validation.valid) {
    // Log error and fall back to simple distributive
    console.error('Solution validation failed:', validation.failedChecks);
    return generateFallbackSolution(num1, num2);
  }

  return solution;
}
```

---

## 7. Development Workflow & Quality Assurance

### 7.1 Git Workflow and Branch Management

The development process operates through a structured git workflow that uses **git worktrees** for parallel development and **GitHub Issues** for task management. Every feature moves through the same rigorous pipeline: branch creation, implementation, code review, testing, and pull request approval before merging to main. This isn't bureaucratic overhead—it's the infrastructure that transforms the iterative quality loop into a concrete, auditable process.

**Repository Structure**:
The repository maintains a clean main branch that represents production-ready code at all times. Feature development happens in isolated branches that follow a strict naming convention: `<type>/<issue-number>-<description>`. The type prefix indicates the nature of the work—`feat/` for new features, `fix/` for bug corrections, `refactor/` for structural improvements without behavior changes, `test/` for test additions or improvements. The issue number creates traceability from requirements through implementation to deployment.

**Git Worktrees for Parallel Development**:
When multiple features need development simultaneously, git worktrees allow different branches to exist in separate directories without constant branch switching. The main repository lives in `mental-math-trainer/` and contains the main branch. Feature worktrees live in sibling directories like `mental-math-trainer-feat-validation/` where development proceeds independently. This mirrors how distributed teams work, with different developers on different features, except here different agents work in different worktrees.

Creating a worktree is straightforward: `git worktree add ../mental-math-trainer-feat-validation feat/42-validation-system` creates a new directory with the feature branch checked out. Work proceeds in that directory with normal git operations—commits, pushes, pulls. When the feature completes and merges, remove the worktree with `git worktree remove ../mental-math-trainer-feat-validation`.

**GitHub Issues as Task Definitions**:
Every piece of work starts with a GitHub Issue that defines the scope, acceptance criteria, and testing requirements. The Builder Agent creates these issues at the start of each feature, using a standard template that ensures consistency. The issue describes what needs to be built and how success will be measured. Throughout development, commits reference the issue number to maintain traceability. When the pull request merges, the issue closes automatically, creating a complete audit trail from requirement to implementation.

**Branch Protection and Merge Requirements**:
The main branch should be protected with branch protection rules that enforce the quality gates. Direct commits to main are prohibited—all changes must come through pull requests. Each pull request requires approval from two specialized reviewers: a QA Reviewer who validates testing and correctness, and a Bug Finder who scrutinizes edge cases and error handling. The continuous integration system must pass all tests before merge is allowed. Test coverage must meet the threshold—90% for core logic, 80% overall—or the merge is blocked.

**Commit Discipline**:
Commits should be atomic and focused, accomplishing one thing completely. The commit message format follows the convention: `<type>: <description> (#<issue>)`. The type matches the branch type—feat, fix, refactor, test. The description explains what changed in present tense: "add expression validator" not "added expression validator." The issue reference creates the link back to the task definition. This discipline makes the git history readable and useful; future developers can understand why changes were made by reading commit messages and following the issue links.

### 7.2 Pull Request Review Process

The pull request process is where the iterative quality loop becomes concrete. Each PR moves through a defined sequence of reviews, with clear criteria for approval at each stage. The process prioritizes correctness over speed; a PR that takes three rounds of review to get right is better than a PR that merges quickly with subtle bugs.

**Pull Request Lifecycle**:
The Builder Agent opens a draft pull request as soon as the feature branch exists, even before implementation is complete. This gives visibility into work in progress and allows early feedback. The draft PR stays open during development, with commits pushing regularly to show progress. Once the Builder believes the implementation is complete, they mark the PR as "Ready for Review" and request review from the Code Reviewer Agent.

The Code Reviewer examines the changes through GitHub's review interface, leaving inline comments on specific lines where issues exist. The review categorizes issues by severity: critical issues that must be fixed before merge, improvement opportunities that should be addressed, and observations that don't require changes. The review concludes with one of three decisions: "Approve" if no issues exist (rare on first pass), "Request Changes" if problems need fixing, or "Comment" if feedback is provided without blocking approval.

When changes are requested, the PR goes to the Refiner Agent who addresses each critique systematically. The Refiner makes focused commits that reference specific review comments—"fix: handle null case in validator (addresses review comment)" creates a clear connection between feedback and fix. Once all critiques are addressed, the PR goes back to the Code Reviewer for another pass. This cycle continues until the Code Reviewer approves.

After Code Reviewer approval, the PR needs two specialized reviews. The QA Reviewer Agent examines the testing strategy, verifies that tests actually validate what they claim to validate, checks that coverage meets requirements, and manually validates that solutions are mathematically correct. The Bug Finder Agent takes an adversarial approach, actively trying to break the implementation by testing edge cases, boundary conditions, and error paths. Both specialized reviewers must explicitly approve the PR before it can merge.

If either specialized reviewer finds issues, the PR returns to the Refiner Agent. The cycle continues—refine, review, test—until both approve. Only when all three reviewers have approved does the PR merge to main through a squash merge that creates a clean history. The feature branch is deleted after merge, and the associated GitHub Issue closes automatically.

**Review Standards and Expectations**:
Reviews should be thorough but constructive, identifying real problems rather than nitpicking style preferences. Each critique must cite specific line numbers, explain the issue clearly, and provide actionable guidance for fixing it. The reviewer prioritizes correctness over elegance; code that works reliably is better than code that looks clever but has subtle edge cases. When a reviewer identifies a bug, they explain why it's a bug—what input would cause failure, what the expected behavior should be, how to test the fix.

The QA Reviewer focuses on validation—does this code actually do what it claims? Are tests comprehensive? Would these tests catch a regression if someone later modifies this code? The Bug Finder thinks adversarially—what could go wrong? What inputs would break this? What happens if external dependencies fail? Both reviewers must balance thoroughness with pragmatism; perfection is impossible, but correctness is required.

### 7.3 Subagent Development Process

### 7.3 Subagent Development Process

**Iterative Quality Loop**:
┌─────────────────────────────────────────────┐
│  Builder Agent                              │
│  - Implements feature based on requirements │
│  - Writes initial code                      │
│  - Adds basic tests                         │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│  Code Reviewer Agent                        │
│  - Checks adherence to requirements         │
│  - Reviews code quality and patterns        │
│  - Identifies potential bugs                │
│  - Verifies type safety                     │
│  - Creates critique document                │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│  Refiner Agent                              │
│  - Addresses all critique points            │
│  - Improves code quality                    │
│  - Adds missing error handling              │
│  - Enhances tests                           │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│  Second Review Agent                        │
│  - Re-evaluates refined code                │
│  - Checks if critiques were addressed       │
│  - Identifies any remaining issues          │
└────────────┬────────────────────────────────┘
             │
             ├──[Issues remain]──┐
             │                   │
             ▼                   │
┌─────────────────────────────  │
│  Second Refiner               │
│  - Fixes remaining issues     │
└────────────┬──────────────────┘
             │
             └─────────[Loop back to reviewer]
             
             ▼
     [No issues found]
             │
             ▼
┌─────────────────────────────────────────────┐
│  QA Tester Agent                            │
│  - Runs full test suite                     │
│  - Checks test coverage                     │
│  - Performs manual validation               │
│  - Tests edge cases                         │
│  - Creates test report                      │
└────────────┬────────────────────────────────┘
             │
             ├──[Tests fail or coverage < 90%]──┐
             │                                   │
             ▼                                   │
┌─────────────────────────────                 │
│  Builder Agent (Fix Mode)                    │
│  - Fixes failing tests                       │
│  - Adds missing test coverage                │
└────────────┬─────────────────────────────────┘
             │
             └──[Return to Code Reviewer]

             ▼
     [All tests pass, coverage ≥ 90%]
             │
             ▼
        ✅ APPROVED
```

**Exit Conditions**:
- All tests passing
- Test coverage ≥ 90% for core logic, ≥ 80% overall
- No unresolved code review critiques
- No validation errors in solution generation
- Performance benchmarks met
- Manual spot-checks successful

### 7.2 Code Review Checklist

**Reviewer Agent Evaluation Criteria**:

1. **Correctness** (Weight: 40%)
   - [ ] All calculations produce correct results
   - [ ] Every solution step is mathematically valid
   - [ ] Edge cases are handled properly
   - [ ] Type safety is enforced
   - [ ] No runtime errors possible

2. **Code Quality** (Weight: 25%)
   - [ ] Functions are pure where possible
   - [ ] Clear separation of concerns
   - [ ] DRY principle followed
   - [ ] SOLID principles applied appropriately
   - [ ] Meaningful variable and function names
   - [ ] Appropriate use of design patterns

3. **Testing** (Weight: 20%)
   - [ ] Comprehensive unit tests
   - [ ] Integration tests for user flows
   - [ ] Test coverage meets requirements
   - [ ] Edge cases are tested
   - [ ] Performance benchmarks in place

4. **Documentation** (Weight: 10%)
   - [ ] Complex logic is commented
   - [ ] Function signatures have JSDoc
   - [ ] Architecture decisions documented
   - [ ] README is up to date

5. **Performance** (Weight: 5%)
   - [ ] No unnecessary re-renders
   - [ ] Efficient algorithms chosen
   - [ ] Memoization where appropriate
   - [ ] Database queries optimized

**Critique Document Template**:
```markdown
# Code Review: [Feature Name]

## Summary
- Overall Assessment: [PASS / NEEDS REVISION / MAJOR ISSUES]
- Correctness Score: X/10
- Quality Score: X/10
- Test Coverage: X%

## Critical Issues (Must Fix)
1. [Issue description]
   - Location: [file:line]
   - Impact: [High/Medium/Low]
   - Recommendation: [Specific fix]

## Improvement Opportunities
1. [Suggestion]
   - Rationale: [Why this would be better]

## Positive Observations
- [What was done well]

## Next Steps
- [ ] Address all critical issues
- [ ] Consider improvement opportunities
- [ ] Re-submit for second review
```

### 7.3 Manual Validation Checkpoints

**Periodic Manual Testing**:

1. **After Method Implementation**:
   - Manually solve 5 problems using the method
   - Compare to generated solution
   - Verify explanation clarity
   - Check mathematical accuracy

2. **After Solution Generator Refactor**:
   - Generate 20 random problems across difficulty levels
   - Manually verify each solution
   - Check for any nonsensical explanations
   - Validate alternative method comparisons

3. **Before Release**:
   - Complete full practice session as end user
   - Check all UI flows
   - Verify statistics tracking
   - Test keyboard navigation
   - Check responsive behavior on mobile device

**Manual Test Protocol**:
```markdown
# Manual Validation Checklist

## Solution Accuracy
For each method:
- [ ] Generate 3 easy problems - verify solutions
- [ ] Generate 3 medium problems - verify solutions  
- [ ] Generate 3 hard problems - verify solutions
- [ ] Generate 3 edge cases - verify handling

## UI/UX Flow
- [ ] Can navigate entire app with keyboard only
- [ ] All buttons and inputs are accessible
- [ ] Error states display correctly
- [ ] Loading indicators appear when expected
- [ ] Mobile layout is usable

## Data Persistence
- [ ] Statistics save correctly
- [ ] Session history is maintained
- [ ] Settings persist across reloads
- [ ] Export produces valid file

## Performance
- [ ] Solutions generate in < 5s for large numbers
- [ ] No lag in UI interactions
- [ ] Smooth animations (if any)
- [ ] Charts render without delay
```

---

## 8. Implementation Priorities & Milestones

### Phase 1: Core Foundation (Week 1)
- [ ] Project setup (Next.js + TypeScript)
- [ ] Type definitions
- [ ] Basic UI shell (navigation, layout)
- [ ] IndexedDB integration
- [ ] Distributive method implementation
- [ ] Unit tests for distributive method
- [ ] Problem generator (basic)
- [ ] Validation system

**Exit Criteria**: Can generate and solve problems using distributive method with 100% accuracy

### Phase 2: Additional Methods (Week 2)
- [ ] Near-power-10 method
- [ ] Difference of squares method
- [ ] Factorization method
- [ ] Squaring method
- [ ] Near-100 method
- [ ] Unit tests for all methods (100% coverage)
- [ ] Method selection algorithm
- [ ] Alternative method comparison

**Exit Criteria**: All six methods working correctly, selection algorithm choosing optimal method

### Phase 3: Practice Mode (Week 3)
- [ ] Configuration screen
- [ ] Problem display UI
- [ ] Answer input and validation
- [ ] Hint system
- [ ] Solution review screen
- [ ] Drill-down sub-calculations
- [ ] Session management
- [ ] Statistics tracking

**Exit Criteria**: Complete practice session flow functional

### Phase 4: Study Mode (Week 4)
- [ ] Study mode navigation
- [ ] Content pages for each method
- [ ] Interactive examples
- [ ] Try-it-yourself exercises
- [ ] Deep dive sections
- [ ] Progressive curriculum structure

**Exit Criteria**: Complete study mode with all methods documented

### Phase 5: Statistics & Polish (Week 5)
- [ ] Statistics dashboard
- [ ] Data visualization (charts)
- [ ] Weak areas analysis
- [ ] Export functionality
- [ ] Help documentation
- [ ] Keyboard shortcuts
- [ ] Responsive design refinement
- [ ] Performance optimization

**Exit Criteria**: Full application complete and polished

### Phase 6: Testing & Validation (Week 6)
- [ ] Comprehensive test suite (≥90% coverage)
- [ ] Integration tests
- [ ] Performance benchmarks
- [ ] Cross-browser testing
- [ ] Manual validation
- [ ] Bug fixes
- [ ] Documentation finalization

**Exit Criteria**: All tests passing, no known bugs, ready for use

---

## 9. Success Criteria

### Functional Requirements
✅ All six calculation methods implemented correctly
✅ Method selection chooses optimal approach
✅ Solution generation produces 100% accurate results
✅ Every solution step is mathematically valid
✅ Practice mode fully functional
✅ Study mode comprehensive and educational
✅ Statistics tracking working
✅ Data persists across sessions

### Quality Requirements
✅ Test coverage ≥ 90% for core logic
✅ Zero validation errors in production
✅ No arithmetic mistakes in solutions
✅ Clear, understandable explanations
✅ Fast solution generation (< 5s for large numbers)
✅ Responsive design works on all target devices

### User Experience Requirements
✅ Intuitive navigation
✅ Keyboard accessibility
✅ Dark mode implemented
✅ Helpful error messages
✅ Smooth performance
✅ Clear visual hierarchy

---

## 10. Future Enhancements (Post-MVP)

### Technical Enhancements
- PostgreSQL backend integration
- User authentication
- Cloud sync
- PWA with full offline support
- Advanced caching strategies

### Feature Additions
- Division methods
- Addition/subtraction techniques
- Square roots and powers
- Percentage calculations
- Custom user techniques
- Collaborative practice mode
- Leaderboards
- Achievement system
- Speed challenge mode
- Adaptive difficulty

### Content Expansion
- More example problems
- Video explanations
- Gamification elements
- Progress badges
- Learning paths
- Community-contributed problems

---

## Appendix A: Mathematical Proofs & Derivations

### A.1 Distributive Property Proof
In any ring (R, +, ×), the distributive property is an axiom. For integers:

**Given**: (ℤ, +, ×) forms a ring
**Axiom**: ∀ a, b, c ∈ ℤ: a(b + c) = ab + ac

This cannot be "proved" as it's definitional, but we can verify it holds:
```
Example: 5(3 + 4) = 5(7) = 35
         5(3) + 5(4) = 15 + 20 = 35 ✓
```

### A.2 Difference of Squares Derivation
**Theorem**: a² - b² = (a - b)(a + b)

**Proof**:
```
(a - b)(a + b)
= a(a + b) - b(a + b)        [distributive property]
= (a·a + a·b) - (b·a + b·b)  [distributive property]
= a² + ab - ba - b²           [definition of squaring]
= a² + ab - ab - b²           [commutativity: ab = ba]
= a² - b²                     [additive inverse] ∎
```

### A.3 Near-100 Formula Derivation
**Formula**: (100 - a)(100 - b) = 100(100 - a - b) + ab

**Proof**:
```
(100 - a)(100 - b)
= 100·100 - 100·b - a·100 + a·b     [distributive property]
= 10000 - 100b - 100a + ab          [simplify]
= 10000 - 100(b + a) + ab           [factor out 100]
= 10000 - 100(a + b) + ab           [commutativity]
= 100[100 - (a + b)] + ab           [factor] ∎
```

### A.4 Binomial Squaring Derivation
**Formula**: (a + b)² = a² + 2ab + b²

**Proof**:
```
(a + b)²
= (a + b)(a + b)                    [definition of squaring]
= a(a + b) + b(a + b)               [distributive property]
= (a·a + a·b) + (b·a + b·b)        [distributive property]
= a² + ab + ba + b²                 [simplify]
= a² + ab + ab + b²                 [commutativity: ba = ab]
= a² + 2ab + b²                     [combine like terms] ∎
```

**Application to base-10**:
For n = 10m + d:
```
n² = (10m + d)²
   = (10m)² + 2(10m)(d) + d²
   = 100m² + 20md + d² ∎
```

---

## Appendix B: Computational Cost Models

### B.1 Operation Complexity Ratings

| Operation | Digits | Cost | Rationale |
|-----------|--------|------|-----------|
| Single-digit mult | 1×1 | 1.0 | Memorized |
| Single × double | 1×2 | 2.0 | Two single-digit mults |
| Double × double | 2×2 | 4.0 | Four single-digit mults |
| Triple × triple | 3×3 | 9.0 | Nine single-digit mults |
| Multiply by 10^k | any | 0.1 | Trivial (append zeros) |
| Addition | any | 0.5 | Easier than multiplication |
| Squaring | any | 0.8 | Slightly easier than mult |

### B.2 Method Cost Formulas

**Distributive Property**:
```
Cost = (num_partitions × avg_partition_complexity) + sum_cost
     ≈ 2 × 3.0 + 0.5 = 6.5
```

**Difference of Squares**:
```
Cost = 2 × square_cost + subtraction_cost
     = 2 × 0.8 + 0.5 = 2.1
```

**Near Powers of 10**:
```
Cost = trivial_mult_cost + small_mult_cost + addition_cost
     = 0.1 + 2.0 + 0.5 = 2.6
```

---

## Appendix C: Known Test Cases

Comprehensive test suite available in `/tests/fixtures/known-solutions.json`

Sample entries:
```json
[
  {
    "num1": 47,
    "num2": 53,
    "answer": 2491,
    "optimal_method": "difference-squares",
    "alternative_methods": ["distributive", "factorization"]
  },
  {
    "num1": 98,
    "num2": 87,
    "answer": 8526,
    "optimal_method": "near-100",
    "alternative_methods": ["distributive"]
  }
]
```

---

**End of Requirements Document**

This document represents the complete technical specification for the Mental Math Mastery Training System. All requirements, algorithms, and quality standards must be strictly adhered to during implementation.
