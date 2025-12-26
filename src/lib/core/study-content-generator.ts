/**
 * Study Content Generator
 * @module core/study-content-generator
 *
 * Generates educational content for each calculation method, including
 * introductions, mathematical foundations, examples, and interactive exercises.
 *
 * This module serves as the content engine for Study Mode, providing:
 * - Curated content for each method at three levels (intro, foundation, deep-dive)
 * - Generated examples with real solutions from the method implementations
 * - Progressive exercises with hints to guide learning
 */

import type { StudyContent, StudyExample, InteractiveExercise, Solution } from '../types';
import { MethodName } from '../types';
import { MethodSelector } from './methods/method-selector';

// ============================================================================
// STUDY CONTENT DATA
// ============================================================================

/**
 * Study content for all calculation methods.
 *
 * Each method has:
 * - introduction: Brief explanation for beginners
 * - mathematicalFoundation: Algebraic proofs and principles
 * - deepDiveContent: Advanced theory for curious learners
 * - whenToUse: Practical guidance on method selection
 * - prerequisites: Methods that should be learned first
 * - nextMethods: Natural progression after mastering this method
 */
const STUDY_CONTENT: Record<MethodName, Omit<StudyContent, 'examples' | 'interactiveExercises'>> = {
  [MethodName.Distributive]: {
    method: MethodName.Distributive,
    introduction: `
The distributive property is the foundational technique for mental math. It states that multiplication distributes over addition: **a(b + c) = ab + ac**.

This property is not just a trick—it's one of the defining axioms of algebra. Every mental math technique ultimately relies on this principle.

When you multiply 47 × 53, you're really computing (40 + 7) × 53, which becomes 40×53 + 7×53. Each sub-problem is simpler than the original.
    `.trim(),

    mathematicalFoundation: `
In abstract algebra, the distributive property is one of the axioms that define a **ring** structure. For integers (ℤ, +, ×):

**Axiom**: ∀ a, b, c ∈ ℤ: a(b + c) = ab + ac

This means multiplication "respects" addition—the result of multiplying a sum equals the sum of multiplying each part.

**Base-10 Polynomial View**: Any integer in base-10 can be viewed as a polynomial where x = 10:
- 347 = 3(10²) + 4(10¹) + 7(10⁰) = 3x² + 4x + 7

When you multiply two numbers, you're multiplying polynomials. The distributive property lets you expand term by term.
    `.trim(),

    deepDiveContent: `
### Ring Theory Foundation

The distributive property is so fundamental that it's one of the axioms defining a ring. A ring (R, +, ×) must satisfy:
1. (R, +) is an abelian group
2. (R, ×) is a monoid
3. Multiplication distributes over addition: a(b+c) = ab + ac and (a+b)c = ac + bc

### Why Place-Value Partition Works

When you partition 347 as (300 + 40 + 7), you're decomposing the polynomial into its monomial basis. Each term represents a single "power of ten" component.

The distributive property guarantees that **any** additive decomposition works. We prefer place-value because:
1. It aligns with how our numeral system represents numbers
2. It's cognitively natural—we read numbers left-to-right by place
3. It creates sub-problems with trailing zeros (easy to compute)

### Historical Note

The distributive property was used implicitly in ancient Babylonian mathematics (circa 2000 BCE) for multiplication. The algebraic formalization came much later with the development of abstract algebra in the 19th century.
    `.trim(),

    whenToUse: [
      'When no other method applies efficiently',
      'For numbers without special structure (not near powers of 10, not symmetric)',
      'As a fallback for any multiplication',
      'When learning—it teaches the fundamental principle behind all methods'
    ],

    prerequisites: [],
    nextMethods: [MethodName.NearPower10, MethodName.Factorization]
  },

  [MethodName.DifferenceSquares]: {
    method: MethodName.DifferenceSquares,
    introduction: `
The difference of squares is one of the most elegant algebraic patterns: **a² - b² = (a - b)(a + b)**.

When two numbers are symmetric around a midpoint—like 47 and 53 (both 3 away from 50)—you can transform the multiplication into "midpoint squared minus deviation squared."

47 × 53 = (50 - 3)(50 + 3) = 50² - 3² = 2500 - 9 = 2491

This works because squaring is often easier than arbitrary multiplication, especially when the midpoint is a round number.
    `.trim(),

    mathematicalFoundation: `
**Identity**: a² - b² = (a - b)(a + b)

**Proof**:
(a - b)(a + b)
= a(a + b) - b(a + b)      [distributive property]
= a² + ab - ba - b²         [distributive property]
= a² + ab - ab - b²         [commutativity: ab = ba]
= a² - b²                   [additive inverse]

**Geometric Interpretation**: A square of side *a* with a smaller square of side *b* removed has area a² - b². This L-shaped region can be rearranged into a rectangle with dimensions (a-b) × (a+b).
    `.trim(),

    deepDiveContent: `
### Algebraic Structure

The difference of squares factorization is a special case of factoring in polynomial rings. Over the integers, it shows that a² - b² is **never prime** (except when |a - b| = 1 or |a + b| = 1).

### Connection to Complex Numbers

In the complex numbers, we can extend this: a² + b² = (a + bi)(a - bi). This is why the sum of squares doesn't factor over the reals but does over the complex numbers.

### Generalization

The pattern extends to higher powers:
- a³ - b³ = (a - b)(a² + ab + b²)
- a⁴ - b⁴ = (a² - b²)(a² + b²) = (a-b)(a+b)(a² + b²)

### Cognitive Strategy

When you see two numbers, calculate their average μ and half-difference d:
- μ = (num1 + num2) / 2
- d = |num2 - num1| / 2
- Product = μ² - d²

This works best when μ is round (10, 50, 100) and d is small.
    `.trim(),

    whenToUse: [
      'Numbers symmetric around a midpoint',
      'Deviation from midpoint is small (at most 20)',
      'Midpoint is a round number (10, 50, 100, 500...)',
      'Examples: 47×53, 96×104, 43×57, 88×112'
    ],

    prerequisites: [MethodName.Distributive],
    nextMethods: [MethodName.Squaring]
  },

  [MethodName.NearPower10]: {
    method: MethodName.NearPower10,
    introduction: `
Numbers close to powers of 10 (like 98, 102, 997, 1003) allow us to exploit the base-10 structure of our number system.

When one number is near 100, write it as 100 ± offset:
- 98 × 47 = (100 - 2) × 47 = 100×47 - 2×47 = 4700 - 94 = 4606

Multiplying by 100 is trivial (just append zeros), so the hard part becomes a small multiplication (2 × 47).
    `.trim(),

    mathematicalFoundation: `
**Pattern**: For n = 10^k ± ε where ε is small:
n × m = (10^k ± ε) × m = 10^k·m ± ε·m

**Why It Works**: Our positional number system makes multiplication by powers of 10 trivial—you're just shifting digits left. So if we can express a number as "power of 10 plus/minus small offset," we reduce the problem to:
1. A trivial shift (multiply by 10^k)
2. A small multiplication (ε × m)
3. An addition or subtraction

**Algebraic View**: This is just the distributive property where we strategically choose the decomposition to create a power of 10.
    `.trim(),

    deepDiveContent: `
### Base-10 Structure

Our number system uses base 10 with place values 10⁰, 10¹, 10², etc. This means:
- Multiplying by 10 = shift left one position
- Multiplying by 100 = shift left two positions
- etc.

This structural property doesn't exist for arbitrary bases. In binary (base 2), multiplying by powers of 2 is trivial. In decimal, powers of 10 are trivial.

### Optimal Threshold

Empirically, the method is worthwhile when:
- |offset| is at most 15 (small enough for easy multiplication)
- |offset| × other_number is cognitively simpler than the original problem

### Extension to Other Bases

In base b, numbers near b^k are similarly easy. This is why programmers often use powers of 2 (32, 64, 128) for sizing—multiplication and division become bit shifts.
    `.trim(),

    whenToUse: [
      'One number is within ±15 of a power of 10',
      'The offset × other number is easy to compute',
      'Examples: 98×47, 102×35, 997×23, 1003×44'
    ],

    prerequisites: [MethodName.Distributive],
    nextMethods: [MethodName.Near100]
  },

  [MethodName.Squaring]: {
    method: MethodName.Squaring,
    introduction: `
Squaring (multiplying a number by itself) has special shortcuts because of the binomial expansion: **(a + b)² = a² + 2ab + b²**.

For 73²: Write 73 as 70 + 3
73² = (70 + 3)² = 70² + 2(70)(3) + 3² = 4900 + 420 + 9 = 5329

This reduces squaring to three simpler operations: one easy square (70²), one doubling, and one small square.
    `.trim(),

    mathematicalFoundation: `
**Binomial Expansion**: (a + b)² = a² + 2ab + b²

**Proof**:
(a + b)² = (a + b)(a + b)
= a(a + b) + b(a + b)     [distributive]
= a² + ab + ba + b²       [distributive]
= a² + 2ab + b²           [commutativity: ab = ba]

**Application to Base-10**: For n = 10m + d (where m is tens, d is ones):
n² = (10m + d)²
= 100m² + 20md + d²
= 100m² + 20md + d²

Each term is easy:
- 100m² = (10m)² = just square the tens digit and append 00
- 20md = double m×d and append 0
- d² = single digit square (memorized)
    `.trim(),

    deepDiveContent: `
### Special Case: Numbers Ending in 5

For numbers ending in 5 (like 25, 35, 45...), there's a special shortcut:
n5² = n(n+1) followed by 25

Example: 35² = 3×4 followed by 25 = 1225
Example: 75² = 7×8 followed by 25 = 5625

**Proof**: (10n + 5)² = 100n² + 100n + 25 = 100n(n+1) + 25

### Near-Squares: n × (n+k)

When multiplying numbers that are close (like 73 × 75), use:
n(n + k) = n² + nk

73 × 75 = 73² + 73×2 = 5329 + 146 = 5475

### Algebraic Structure

The formula (a+b)² = a² + 2ab + b² is the k=2 case of the binomial theorem:
(a+b)^n = Σ(k=0 to n) C(n,k) × a^(n-k) × b^k

This generalizes to any power, though mental math typically uses only n=2.
    `.trim(),

    whenToUse: [
      'Same number multiplication (n × n)',
      'Near-same numbers (n × (n+1) or n × (n+2))',
      'Numbers ending in 5 (special shortcut)',
      'Examples: 73², 25², 48×50, 67×69'
    ],

    prerequisites: [MethodName.Distributive, MethodName.DifferenceSquares],
    nextMethods: []
  },

  [MethodName.Near100]: {
    method: MethodName.Near100,
    introduction: `
When both numbers are close to 100, the "cross multiplication" or "deficit method" provides an elegant shortcut.

For 97 × 94:
- Both numbers are near 100: 97 = 100-3, 94 = 100-6
- Cross: 97-6 = 91 (or equivalently, 94-3 = 91)
- Multiply deficits: 3 × 6 = 18
- Result: 9118

The pattern: (100-a)(100-b) = 100(100-a-b) + ab
    `.trim(),

    mathematicalFoundation: `
**Identity**: (100 - a)(100 - b) = 100(100 - a - b) + ab

**Proof**:
(100 - a)(100 - b)
= 10000 - 100a - 100b + ab       [FOIL/distributive]
= 10000 - 100(a + b) + ab        [factor out 100]
= 100[100 - (a + b)] + ab        [factor]

**Why It Works**: The 100² term (10000) combines with the cross terms (-100a - 100b) to give 100(100-a-b). The remaining term (ab) is just the product of the deficits, which are small numbers.

**Interpretation**: You're computing "base × 100 + adjustment" where:
- base = either number minus the other's deficit = 100 - a - b
- adjustment = product of deficits = a × b
    `.trim(),

    deepDiveContent: `
### Generalization to Any Base

The method works for any base B:
(B - a)(B - b) = B(B - a - b) + ab

For numbers near 50: (50-a)(50-b) = 50(50-a-b) + ab
For numbers near 1000: (1000-a)(1000-b) = 1000(1000-a-b) + ab

### Handling Numbers Over 100

For numbers like 103 and 98, use signed offsets:
- 103 = 100 + 3 (offset = -3)
- 98 = 100 - 2 (offset = +2)

Formula: 100 + (-3) + (-2) = 95 for base
Offset product: (-3) × (+2) = -6
Result: 9500 - 6 = 10094

### Vedic Mathematics Origin

This technique is popularized in Vedic mathematics as "nikhilam" (subtraction from the base). While attributed to ancient Indian texts, its modern formulation is from the 20th century.
    `.trim(),

    whenToUse: [
      'Both numbers within ±15 of 100',
      'Works best when both deficits are small single digits',
      'Can extend to numbers near 50, 1000, etc.',
      'Examples: 97×94, 103×98, 88×96, 112×108'
    ],

    prerequisites: [MethodName.Distributive, MethodName.NearPower10],
    nextMethods: []
  },

  [MethodName.Factorization]: {
    method: MethodName.Factorization,
    introduction: `
Strategic factorization exploits the **commutativity and associativity** of multiplication. You can factor numbers into smaller pieces and regroup them to create convenient multiples of 10.

For 25 × 48:
- Factor: 25 × 48 = 25 × (4 × 12) = (25 × 4) × 12 = 100 × 12 = 1200

By spotting that 25 × 4 = 100, we've transformed a complex multiplication into a trivial one.
    `.trim(),

    mathematicalFoundation: `
**Foundational Properties**:
- Commutativity: a × b = b × a
- Associativity: (a × b) × c = a × (b × c)

These properties guarantee that any rearrangement of factors gives the same result.

**Fundamental Theorem of Arithmetic**: Every integer > 1 has a unique prime factorization. This means we can always decompose numbers into prime factors and regroup them.

**Strategy**: Look for factor pairs that create multiples of 10:
- 2 × 5 = 10
- 4 × 25 = 100
- 8 × 125 = 1000
- 5 × 20 = 100
    `.trim(),

    deepDiveContent: `
### Group Theory Perspective

The set of positive rationals under multiplication forms an abelian (commutative) group. This means:
1. Any multiplication can be computed in any order
2. Any grouping gives the same result
3. We can "move" factors freely between numbers

### Useful Factor Pairs

Memorize these combinations:
- 2 × 5 = 10
- 4 × 25 = 100
- 8 × 125 = 1000
- 5 × 2 = 10
- 25 × 4 = 100
- 50 × 2 = 100
- 20 × 5 = 100

### When to Factor

Look for factorization when:
1. One number is divisible by 25 (and other has factor of 4)
2. One number is divisible by 5 (and other has even factor)
3. Numbers have complementary factors that yield 10^k
    `.trim(),

    whenToUse: [
      'Numbers have factors that combine to 10, 100, etc.',
      'Look for: 25×4, 5×2, 50×2, 125×8',
      'Examples: 25×48, 35×24, 125×56, 16×125'
    ],

    prerequisites: [MethodName.Distributive],
    nextMethods: []
  }
};

// ============================================================================
// EXAMPLE PAIRS FOR EACH METHOD
// ============================================================================

/**
 * Predefined example pairs for each method.
 * These are carefully chosen to demonstrate the method's strengths.
 */
const EXAMPLE_PAIRS: Record<MethodName, Array<[number, number]>> = {
  [MethodName.Distributive]: [[47, 89], [23, 67], [34, 56]],
  [MethodName.DifferenceSquares]: [[47, 53], [96, 104], [43, 57]],
  [MethodName.NearPower10]: [[98, 47], [102, 35], [997, 23]],
  [MethodName.Squaring]: [[73, 73], [25, 25], [67, 67]],
  [MethodName.Near100]: [[97, 94], [103, 98], [88, 96]],
  [MethodName.Factorization]: [[25, 48], [35, 24], [125, 56]]
};

/**
 * Pedagogical notes for each method's examples.
 */
const PEDAGOGICAL_NOTES: Record<MethodName, string[]> = {
  [MethodName.Distributive]: [
    'Notice how we partition the first number to simplify the multiplication.',
    'Each partial product is easier to compute than the original problem.',
    'The final addition combines our partial results.'
  ],
  [MethodName.DifferenceSquares]: [
    'First identify the midpoint between the two numbers.',
    'Calculate how far each number is from the midpoint.',
    'Apply the formula: midpoint² - deviation².'
  ],
  [MethodName.NearPower10]: [
    'Identify which number is close to a power of 10.',
    'Express that number as power_of_10 ± small_offset.',
    'The multiplication by power of 10 is trivial—just shift digits.'
  ],
  [MethodName.Squaring]: [
    'Decompose the number into tens and ones.',
    'Apply the binomial formula: (a+b)² = a² + 2ab + b².',
    'Each term is simpler than the original square.'
  ],
  [MethodName.Near100]: [
    'Calculate each number\'s deficit from 100.',
    'The base is found by subtracting one deficit from the other number.',
    'The adjustment is the product of the deficits.'
  ],
  [MethodName.Factorization]: [
    'Look for factors that combine to make round numbers.',
    'Rearrange factors using commutativity and associativity.',
    'The regrouped problem is much simpler to compute.'
  ]
};

/**
 * Common mistakes for each method.
 */
const COMMON_MISTAKES: Record<MethodName, string[]> = {
  [MethodName.Distributive]: [
    'Forgetting to add all partial products.',
    'Making arithmetic errors in the sub-multiplications.',
    'Using additive partition when subtractive would be simpler.'
  ],
  [MethodName.DifferenceSquares]: [
    'Calculating the midpoint incorrectly.',
    'Forgetting that both numbers must be equidistant from midpoint.',
    'Subtracting the deviation squared instead of adding it (or vice versa).'
  ],
  [MethodName.NearPower10]: [
    'Choosing the wrong power of 10.',
    'Getting the sign wrong when the number is above or below the power.',
    'Making errors in the small multiplication step.'
  ],
  [MethodName.Squaring]: [
    'Forgetting the 2ab term (doubling the middle product).',
    'Squaring the wrong digit values.',
    'Adding instead of appending zeros to intermediate results.'
  ],
  [MethodName.Near100]: [
    'Confusing deficits (below 100) with surpluses (above 100).',
    'Getting the sign wrong when mixing numbers above and below 100.',
    'Forgetting to add the deficit product as a two-digit number.'
  ],
  [MethodName.Factorization]: [
    'Choosing factors that don\'t simplify the problem.',
    'Making errors when regrouping factors.',
    'Not recognizing useful factor pairs like 25×4=100.'
  ]
};

// ============================================================================
// EXERCISE PAIRS FOR EACH METHOD
// ============================================================================

/**
 * Exercise pairs for each method, organized by difficulty.
 */
interface ExerciseConfig {
  nums: [number, number];
  difficulty: 'easy' | 'medium' | 'hard';
}

const EXERCISE_PAIRS: Record<MethodName, ExerciseConfig[]> = {
  [MethodName.Distributive]: [
    { nums: [12, 13], difficulty: 'easy' },
    { nums: [34, 27], difficulty: 'medium' },
    { nums: [78, 43], difficulty: 'hard' }
  ],
  [MethodName.DifferenceSquares]: [
    { nums: [48, 52], difficulty: 'easy' },
    { nums: [47, 53], difficulty: 'medium' },
    { nums: [88, 112], difficulty: 'hard' }
  ],
  [MethodName.NearPower10]: [
    { nums: [99, 12], difficulty: 'easy' },
    { nums: [102, 47], difficulty: 'medium' },
    { nums: [998, 35], difficulty: 'hard' }
  ],
  [MethodName.Squaring]: [
    { nums: [15, 15], difficulty: 'easy' },
    { nums: [45, 45], difficulty: 'medium' },
    { nums: [73, 73], difficulty: 'hard' }
  ],
  [MethodName.Near100]: [
    { nums: [99, 98], difficulty: 'easy' },
    { nums: [97, 94], difficulty: 'medium' },
    { nums: [88, 93], difficulty: 'hard' }
  ],
  [MethodName.Factorization]: [
    { nums: [25, 12], difficulty: 'easy' },
    { nums: [25, 48], difficulty: 'medium' },
    { nums: [125, 56], difficulty: 'hard' }
  ]
};

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Generates complete study content for a calculation method.
 *
 * This function combines the static educational content with dynamically
 * generated examples and exercises. Examples use real solutions from the
 * method implementations.
 *
 * @param method - The calculation method to generate content for
 * @returns Complete study content including examples and exercises
 */
export function generateStudyContent(method: MethodName): StudyContent {
  const baseContent = STUDY_CONTENT[method];

  return {
    ...baseContent,
    examples: generateExamples(method),
    interactiveExercises: generateExercises(method)
  };
}

/**
 * Generates worked examples for a calculation method.
 *
 * Each example includes a real solution generated by the method selector,
 * along with pedagogical notes and common mistakes to avoid.
 *
 * @param method - The calculation method to generate examples for
 * @returns Array of study examples with solutions
 */
export function generateExamples(method: MethodName): StudyExample[] {
  const pairs = EXAMPLE_PAIRS[method];
  const notes = PEDAGOGICAL_NOTES[method];
  const mistakes = COMMON_MISTAKES[method];

  const selector = new MethodSelector();

  return pairs.map(([num1, num2]) => {
    // Generate a real solution using the method selector
    const ranking = selector.selectOptimalMethod(num1, num2);

    // Find the solution from the requested method, or use optimal if not available
    let solution: Solution;
    if (ranking.optimal.method.name === method) {
      solution = ranking.optimal.solution;
    } else {
      const alternative = ranking.alternatives.find(alt => alt.method.name === method);
      if (alternative) {
        solution = alternative.solution;
      } else {
        // Fall back to optimal solution with a note
        solution = ranking.optimal.solution;
      }
    }

    return {
      num1,
      num2,
      solution,
      pedagogicalNotes: notes,
      commonMistakes: mistakes
    };
  });
}

/**
 * Generates interactive exercises for a calculation method.
 *
 * Exercises are organized by difficulty level and include progressive
 * hints to guide learners without giving away the answer.
 *
 * @param method - The calculation method to generate exercises for
 * @returns Array of interactive exercises
 */
export function generateExercises(method: MethodName): InteractiveExercise[] {
  const exercises = EXERCISE_PAIRS[method];

  return exercises.map((ex) => ({
    num1: ex.nums[0],
    num2: ex.nums[1],
    hints: generateHints(method, ex.nums[0], ex.nums[1]),
    expectedMethod: method
  }));
}

/**
 * Generates progressive hints for a specific problem using a given method.
 *
 * Hints are designed to guide without giving away the answer:
 * 1. First hint: Identify the pattern or structure
 * 2. Second hint: Suggest the first step
 * 3. Third hint: Provide more specific guidance
 *
 * @param method - The calculation method to use
 * @param num1 - First multiplicand
 * @param num2 - Second multiplicand
 * @returns Array of progressive hints
 */
export function generateHints(method: MethodName, num1: number, num2: number): string[] {
  switch (method) {
    case MethodName.Distributive: {
      const tens = Math.floor(num1 / 10) * 10;
      const ones = num1 - tens;
      const nearRound = Math.round(num1 / 10) * 10;
      const isCloseToRound = Math.abs(num1 - nearRound) <= 5 && nearRound !== tens;

      if (isCloseToRound) {
        const diff = num1 - nearRound;
        return [
          `Notice that ${num1} is close to a round number. Which round number?`,
          `${num1} is ${Math.abs(diff)} away from ${nearRound}. Express it as ${nearRound} ${diff > 0 ? '+' : '-'} ${Math.abs(diff)}.`,
          `Apply the distributive property: ${nearRound} × ${num2} ${diff > 0 ? '+' : '-'} ${Math.abs(diff)} × ${num2} = ?`
        ];
      }

      return [
        `How can you break ${num1} into simpler parts using place value?`,
        `Try partitioning: ${num1} = ${tens} + ${ones}`,
        `Apply the distributive property: ${tens} × ${num2} + ${ones} × ${num2} = ?`
      ];
    }

    case MethodName.DifferenceSquares: {
      const midpoint = (num1 + num2) / 2;
      const deviation = Math.abs(num2 - num1) / 2;
      return [
        `What is the midpoint between ${num1} and ${num2}?`,
        `The midpoint is ${midpoint}. How far is each number from the midpoint?`,
        `Apply the difference of squares: ${midpoint}² - ${deviation}² = ?`
      ];
    }

    case MethodName.NearPower10: {
      // Find which number is closer to a power of 10
      const powers = [10, 100, 1000, 10000];
      let nearestPower = 100;
      let nearestNum = num1;
      let minDist = Infinity;

      for (const power of powers) {
        const dist1 = Math.abs(num1 - power);
        const dist2 = Math.abs(num2 - power);
        if (dist1 < minDist) {
          minDist = dist1;
          nearestPower = power;
          nearestNum = num1;
        }
        if (dist2 < minDist) {
          minDist = dist2;
          nearestPower = power;
          nearestNum = num2;
        }
      }

      const offset = nearestNum - nearestPower;
      const other = nearestNum === num1 ? num2 : num1;
      const sign = offset >= 0 ? '+' : '-';
      const absOffset = Math.abs(offset);

      return [
        `Which number is closest to a power of 10 (10, 100, 1000...)?`,
        `Express ${nearestNum} as ${nearestPower} ${sign} ${absOffset}.`,
        `Calculate: ${nearestPower} × ${other} ${sign} ${absOffset} × ${other} = ?`
      ];
    }

    case MethodName.Squaring: {
      const tens = Math.floor(num1 / 10);
      const ones = num1 % 10;
      const tensValue = tens * 10;

      if (ones === 5) {
        return [
          `Notice that ${num1} ends in 5. There's a special shortcut for squaring numbers ending in 5.`,
          `For n5², calculate n × (n+1) and append 25.`,
          `${tens} × ${tens + 1} = ${tens * (tens + 1)}, so ${num1}² = ${tens * (tens + 1)}25`
        ];
      }

      return [
        `Break ${num1} into ${tensValue} + ${ones}. What formula can you use?`,
        `Apply (a + b)² = a² + 2ab + b²`,
        `${tensValue}² + 2×${tensValue}×${ones} + ${ones}² = ?`
      ];
    }

    case MethodName.Near100: {
      const deficit1 = 100 - num1;
      const deficit2 = 100 - num2;
      const absDeficit1 = Math.abs(deficit1);
      const absDeficit2 = Math.abs(deficit2);
      const adjustSign = deficit2 >= 0 ? '-' : '+';

      return [
        `How far is each number from 100?`,
        `${num1} is ${absDeficit1} ${deficit1 >= 0 ? 'below' : 'above'} 100, and ${num2} is ${absDeficit2} ${deficit2 >= 0 ? 'below' : 'above'} 100.`,
        `Base: ${num1} ${adjustSign} ${absDeficit2} = ${num1 - deficit2}. Adjustment: ${absDeficit1} × ${absDeficit2} = ${absDeficit1 * absDeficit2}. Combine them!`
      ];
    }

    case MethodName.Factorization: {
      // Try to find useful factors
      const factor25 = num1 % 25 === 0 ? num1 : (num2 % 25 === 0 ? num2 : null);
      const factor5 = num1 % 5 === 0 ? num1 : (num2 % 5 === 0 ? num2 : null);

      if (factor25 !== null) {
        const other = factor25 === num1 ? num2 : num1;
        const has4 = other % 4 === 0;

        if (has4) {
          return [
            `One number is divisible by 25. Can you find a factor in the other number to make 100?`,
            `25 × 4 = 100. Look for a factor of 4 in ${other}.`,
            `Regroup: (25 × 4) × remaining_factor = 100 × remaining_factor`
          ];
        }
      }

      if (factor5 !== null) {
        const other = factor5 === num1 ? num2 : num1;
        const isEven = other % 2 === 0;

        if (isEven) {
          return [
            `One number is divisible by 5. Can you find a factor in the other to make 10?`,
            `5 × 2 = 10. Look for a factor of 2 in ${other}.`,
            `Regroup to create a multiple of 10, then multiply.`
          ];
        }
      }

      return [
        `Look for factors that combine to make round numbers (10, 100, 1000).`,
        `Try factoring each number and regrouping.`,
        `Remember: 2×5=10, 4×25=100, 8×125=1000`
      ];
    }

    default:
      return [
        'Break the problem into smaller parts.',
        'Check your arithmetic carefully.',
        'Verify your final answer.'
      ];
  }
}

/**
 * Gets the study content data for a method without generating examples.
 *
 * Useful for accessing static content like prerequisites and next methods
 * without the overhead of solution generation.
 *
 * @param method - The calculation method
 * @returns Static study content (without examples/exercises)
 */
export function getStaticStudyContent(
  method: MethodName
): Omit<StudyContent, 'examples' | 'interactiveExercises'> {
  return STUDY_CONTENT[method];
}

/**
 * Gets all prerequisite methods for a given method.
 *
 * @param method - The calculation method
 * @returns Array of prerequisite method names
 */
export function getPrerequisites(method: MethodName): MethodName[] {
  return STUDY_CONTENT[method].prerequisites;
}

/**
 * Gets the suggested next methods after mastering a given method.
 *
 * @param method - The calculation method
 * @returns Array of next method names
 */
export function getNextMethods(method: MethodName): MethodName[] {
  return STUDY_CONTENT[method].nextMethods;
}

/**
 * Gets all method names in suggested learning order.
 *
 * The order respects prerequisites, ensuring learners progress
 * from foundational to advanced methods.
 *
 * @returns Array of method names in learning order
 */
export function getLearningOrder(): MethodName[] {
  return [
    MethodName.Distributive,      // Foundation - no prerequisites
    MethodName.NearPower10,       // Builds on distributive
    MethodName.Factorization,     // Builds on distributive
    MethodName.DifferenceSquares, // Builds on distributive
    MethodName.Near100,           // Builds on distributive + near-power-10
    MethodName.Squaring           // Builds on distributive + difference-squares
  ];
}
