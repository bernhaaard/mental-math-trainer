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
## The Distributive Property: The Foundation of Mental Math

The distributive property is the single most important mathematical principle for mental calculation. It states that multiplication distributes over addition:

**a(b + c) = ab + ac**

This elegant identity is not merely a computational trick—it is one of the defining axioms of algebra itself. Every mental math technique you will ever learn ultimately relies on this principle. When you understand the distributive property deeply, you gain access to the fundamental mechanism that makes all mental calculation possible.

### What Does "Distributive" Mean?

The word "distributive" comes from the Latin *distribuere*, meaning "to divide up" or "to assign in portions." When we multiply a number by a sum, we are "distributing" that multiplication across each addend. Think of it like this: if you need to give 7 cookies to each of 40 + 3 = 43 children, you can either multiply 7 × 43 directly, or you can give 7 cookies to each group separately (7 × 40 = 280 cookies for the first group, 7 × 3 = 21 cookies for the second) and add the results.

### Historical Context and Origins

The distributive property has been used implicitly since ancient times. Babylonian mathematicians (circa 2000 BCE) used clay tablets to record multiplication procedures that relied on breaking numbers into parts—a method that would not work without the distributive property. Ancient Egyptian scribes performed "Russian peasant multiplication" by repeatedly doubling and adding, which exploits distributivity. Greek mathematicians like Euclid (circa 300 BCE) described geometric proofs that demonstrated the distributive property using areas of rectangles.

However, the formal algebraic statement of the distributive property came much later. It was only in the 19th century, with the development of abstract algebra by mathematicians like Evariste Galois, Richard Dedekind, and Emmy Noether, that the distributive property was recognized as one of the fundamental axioms defining algebraic structures called "rings."

### Why It's Useful for Mental Math

The power of the distributive property lies in **reduction**: it allows you to replace one difficult calculation with two or more simpler ones. Consider the problem 47 × 53:

- Direct calculation requires holding multiple partial products in memory
- Using distributive property: 47 × 53 = (40 + 7) × 53 = 40 × 53 + 7 × 53

Now we have:
- 40 × 53 = 2120 (multiply 4 × 53 = 212, then append a zero)
- 7 × 53 = 371 (smaller multiplication)
- 2120 + 371 = 2491 (simple addition)

Each sub-problem is cognitively easier than the original problem.

### Real-World Applications

The distributive property appears everywhere in practical mathematics:

1. **Shopping calculations**: If an item costs $12.99 and you want 5, compute 5 × $13.00 - 5 × $0.01 = $65.00 - $0.05 = $64.95

2. **Tip calculation**: To calculate 15% of $47, compute 10% ($4.70) + 5% ($2.35) = $7.05

3. **Construction and measurement**: A room that is 23 feet by 17 feet has area (20 + 3) × 17 = 340 + 51 = 391 square feet

4. **Financial planning**: Compound interest calculations break down using distributive property patterns

5. **Computer science**: Multiplication algorithms in processors use distributive-style decomposition to handle multi-digit operations

### The Universal Fallback

Perhaps the most important characteristic of the distributive property is its **universality**. Unlike specialized techniques (difference of squares, near-100 method), the distributive property works for ANY multiplication problem. This makes it the essential fallback method—when no elegant shortcut applies, you can always rely on place-value decomposition using the distributive property.
    `.trim(),

    mathematicalFoundation: `
## Mathematical Foundation: From Axioms to Practice

### The Formal Definition

In abstract algebra, the distributive property is one of the axioms that define a **ring** structure. For integers (Z, +, ×), we have:

**Left Distributive Law**: For all a, b, c in Z: a(b + c) = ab + ac

**Right Distributive Law**: For all a, b, c in Z: (a + b)c = ac + bc

These two laws together ensure that multiplication "respects" addition—the result of multiplying a sum equals the sum of multiplying each part separately.

### Formal Proof from Field Axioms

We can prove the distributive property holds for integers by starting from the Peano axioms for natural numbers and extending to integers. Here is a sketch of the key ideas:

**Step 1**: For natural numbers, define multiplication recursively:
- a × 0 = 0
- a × S(b) = a × b + a, where S(b) is the successor of b

**Step 2**: Prove distributivity by induction on c:
- Base case (c = 0): a(b + 0) = ab = ab + 0 = ab + a × 0 (verified)
- Inductive step: Assume a(b + c) = ab + ac. Prove for S(c):
  a(b + S(c)) = a(S(b + c)) = a(b + c) + a = (ab + ac) + a = ab + (ac + a) = ab + a × S(c) (verified)

This proof establishes that the distributive property is not arbitrary but follows necessarily from how multiplication is defined.

### The Base-10 Polynomial Interpretation

Any integer in base-10 can be viewed as a polynomial evaluated at x = 10:

**347 = 3(10^2) + 4(10^1) + 7(10^0) = 3x^2 + 4x + 7, where x = 10**

This polynomial representation is profound because it reveals why place-value partition works so naturally. When you write 347 as 300 + 40 + 7, you are simply decomposing the polynomial into its monomial components.

When you multiply two numbers, you're multiplying two polynomials. The distributive property lets you expand these polynomials term by term using the FOIL-like pattern:

(ax + b)(cx + d) = acx^2 + adx + bcx + bd = acx^2 + (ad + bc)x + bd

This is exactly what happens in long multiplication—each digit gets multiplied by each other digit, with appropriate place-value positioning.

### Geometric Interpretation: The Area Model

The distributive property has a beautiful geometric meaning. Consider the rectangle with dimensions a × (b + c):

The total area is a(b + c). But we can also partition the rectangle into two smaller rectangles:
- One with area a × b = ab
- One with area a × c = ac

Since the total area must equal the sum of the parts: a(b + c) = ab + ac

This geometric visualization makes the distributive property intuitively obvious—it's simply the statement that the whole equals the sum of its parts.

### Connection to Matrix Multiplication

The distributive property extends to matrices, where it becomes crucial for linear algebra. For matrices A, B, C of compatible dimensions:

A(B + C) = AB + AC

This property is essential for solving systems of equations, computing transformations in graphics, and machine learning algorithms that rely on matrix operations.
    `.trim(),

    deepDiveContent: `
## Deep Dive: Advanced Concepts and Historical Connections

### Ring Theory Foundation

The distributive property is so fundamental that it's one of the three groups of axioms defining a ring. A **ring** (R, +, ×) must satisfy:

1. **(R, +) is an abelian group**:
   - Closure: a + b is in R
   - Associativity: (a + b) + c = a + (b + c)
   - Identity: There exists 0 such that a + 0 = a
   - Inverses: For all a, there exists (-a) such that a + (-a) = 0
   - Commutativity: a + b = b + a

2. **(R, ×) is a monoid**:
   - Closure: a × b is in R
   - Associativity: (a × b) × c = a × (b × c)
   - Identity: There exists 1 such that a × 1 = a

3. **Multiplication distributes over addition**:
   - Left: a(b + c) = ab + ac
   - Right: (a + b)c = ac + bc

Without the distributive property, the integers wouldn't form a ring, and most of algebra as we know it would collapse.

### Alternative Decomposition Strategies

While place-value is the default, other decompositions can be more efficient for specific numbers:

**Subtractive decomposition**: For numbers near round values
- 47 = 50 - 3
- 47 × 53 = (50 - 3) × 53 = 2650 - 159 = 2491

**Factored decomposition**: When factors are available
- 48 × 25 = (12 × 4) × 25 = 12 × (4 × 25) = 12 × 100 = 1200

**Mixed decomposition**: Combining techniques
- 99 × 47 = (100 - 1) × 47 = 4700 - 47 = 4653

The key insight is that the distributive property is **method-agnostic**—it works for any decomposition. Expertise in mental math comes from recognizing which decomposition minimizes cognitive load for each specific problem.

### Historical Mathematicians and the Distributive Property

**Al-Khwarizmi (780-850 CE)**: The Persian mathematician whose name gives us "algorithm" wrote extensively about algebraic methods. His work *Al-Jabr* (from which we get "algebra") used distributive-type reasoning to solve equations.

**Leonhard Euler (1707-1783)**: The prolific Swiss mathematician formalized many algebraic identities involving distributivity. His work on number theory and series expansions relied heavily on distributing multiplication across sums.

**Emmy Noether (1882-1935)**: Often called the "mother of modern algebra," Noether's work on abstract algebraic structures established the modern framework where the distributive property appears as an axiom.

### Connection to Polynomial Rings

Mental math using the distributive property is literally polynomial multiplication in disguise. Consider:

**67 × 34**

In polynomial notation (where x = 10):
- 67 = 6x + 7
- 34 = 3x + 4

Multiply:
(6x + 7)(3x + 4) = 18x^2 + 24x + 21x + 28 = 18x^2 + 45x + 28

Evaluate at x = 10:
18(100) + 45(10) + 28 = 1800 + 450 + 28 = 2278 (verified)

### Why This Method Minimizes Cognitive Load

Cognitive science research on mental arithmetic reveals several principles:

1. **Working memory limits**: Humans can hold approximately 7 ± 2 items in working memory. Breaking a multiplication into smaller parts keeps each sub-problem within these limits.

2. **Chunking**: By decomposing numbers at place-value boundaries, we create natural "chunks" that align with our mental representation of numbers.

3. **Familiar facts**: Partial products like 4 × 53 or 7 × 53 often reduce to multiplication facts we've memorized or can compute easily.

4. **Error checking**: With multiple partial products, we can verify each step independently before combining them.

### The Trachtenberg System

In the mid-20th century, Jakow Trachtenberg developed a system of rapid mental calculation while imprisoned in a Nazi concentration camp. His system relies heavily on distributive-property decompositions. The Trachtenberg System demonstrates that the distributive property, when systematically applied, can yield calculation speeds rivaling mechanical calculators.
    `.trim(),

    whenToUse: [
      'When no other method applies efficiently—the distributive property is the universal fallback',
      'For numbers without special structure (not near powers of 10, not symmetric around a midpoint)',
      'When one number is "nice" (like 50, 25, 12) and you want to distribute it across the other',
      'As a learning tool—mastering this method teaches the foundation for all other techniques',
      'For numbers where place-value decomposition creates easy partial products (e.g., 47 = 40 + 7)',
      'When the first number has a small ones digit (1, 2, 3) making the second partial product trivial',
      'For checking answers computed by other methods—distributive always works',
      'When you need to explain your calculation to someone else—the logic is transparent',
      'For problems like 23 × 45: decompose as (20 + 3) × 45 = 900 + 135 = 1035',
      'When subtractive decomposition helps: 89 × 12 = (90 - 1) × 12 = 1080 - 12 = 1068'
    ],
    whenNotToUse: [
      'When both numbers are symmetric around a nice midpoint (use Difference of Squares)',
      'When one number is very close to a power of 10 (use Near Powers of 10)',
      'When multiplying a number by itself (use Squaring method)',
      'When both numbers are near 100 (use Near-100 method)'
    ],
    commonMistakes: [
      'Forgetting to add trailing zeros when multiplying by tens/hundreds',
      'Losing track of intermediate results when computing multiple partial products',
      'Using additive partition when subtractive would be easier'
    ],
    practiceStrategies: [
      'Start with single-digit multipliers before advancing to two-digit by two-digit',
      'Practice recognizing when subtractive partitions are easier',
      'Drill basic products until they become automatic'
    ],

    prerequisites: [],
    nextMethods: [MethodName.NearPower10, MethodName.Factorization]
  },

  [MethodName.DifferenceSquares]: {
    method: MethodName.DifferenceSquares,
    introduction: `
## The Difference of Squares: Elegant Symmetry in Mental Math

The difference of squares is one of the most elegant and powerful patterns in all of mathematics. It states:

**a^2 - b^2 = (a - b)(a + b)**

When you recognize that two numbers are symmetric around a midpoint—like 47 and 53 (both 3 away from 50)—you can transform what seems like an arbitrary multiplication into a simple calculation: "midpoint squared minus deviation squared."

**47 × 53 = (50 - 3)(50 + 3) = 50^2 - 3^2 = 2500 - 9 = 2491**

This technique works because squaring is often easier than arbitrary multiplication, especially when the midpoint is a round number like 50, 100, or any power of 10.

### What Makes This Method Special?

The difference of squares is not just a computational trick—it reveals a deep symmetry in the structure of numbers. When two numbers are equidistant from a central point, their product equals the square of that central point minus the square of the distance. This is a profound statement about the geometry of numbers.

### Historical Context and Origins

The difference of squares identity has been known since ancient times. Greek mathematicians, including Euclid, understood this relationship geometrically—a square of side *a* with a smaller square of side *b* removed leaves an L-shaped "gnomon" whose area can be rearranged into a rectangle of dimensions (a-b) × (a+b).

Babylonian mathematicians (circa 1800 BCE) used this identity to solve what we would now call quadratic equations. They recognized that finding two numbers with a given sum and product was equivalent to finding the sides of a rectangle, which could be related to squares through this identity.

### Why It's Useful for Mental Math

The difference of squares is particularly powerful for mental calculation because:

1. **Squaring is easier than general multiplication**: Squares have special patterns and can often be computed directly. For example, 50^2 = 2500 is trivial.

2. **Small deviations mean small corrections**: When the deviation is small (like 3 in our example), the correction term (3^2 = 9) is tiny and easy to subtract.

3. **Round midpoints are common**: Many naturally occurring multiplication problems have midpoints near round numbers, making this method widely applicable.

4. **One-step simplification**: Unlike distributive property which creates multiple partial products to add, difference of squares often requires just one subtraction.

### Real-World Applications

1. **Quick estimation**: For products near a round number, get a close estimate instantly
2. **Financial calculations**: Computing products of interest rates near base values
3. **Construction and design**: Calculating areas when dimensions are symmetric around a target
4. **Physics**: Many formulas involve differences of squares (kinetic energy differences, etc.)
5. **Statistics**: Variance calculations involve squared differences
    `.trim(),

    mathematicalFoundation: `
## Mathematical Foundation: The Algebra of Symmetry

### The Fundamental Identity

**Theorem**: For any real numbers a and b:

**a^2 - b^2 = (a - b)(a + b)**

### Complete Proof

Starting with the right-hand side:

(a - b)(a + b)

**Step 1**: Apply the distributive property (FOIL method):
= a(a + b) - b(a + b)

**Step 2**: Distribute each term:
= a × a + a × b - b × a - b × b
= a^2 + ab - ba - b^2

**Step 3**: Apply commutativity (ab = ba):
= a^2 + ab - ab - b^2

**Step 4**: Simplify (ab - ab = 0):
= a^2 - b^2  QED

### Application to Multiplication

When we have two numbers num1 and num2 symmetric around midpoint m:
- num1 = m - d (d units below the midpoint)
- num2 = m + d (d units above the midpoint)

Then:
num1 × num2 = (m - d)(m + d) = m^2 - d^2

This transforms arbitrary multiplication into:
1. Squaring the midpoint (often easy)
2. Squaring the deviation (small number, easy)
3. One subtraction

### Geometric Interpretation: The Visual Proof

The difference of squares has a beautiful geometric meaning. Consider a square with side length *a*:

1. Draw a square with side *a* (area = a^2)
2. Remove a smaller square with side *b* from one corner (removing area b^2)
3. The remaining L-shaped region has area a^2 - b^2

Now, here's the insight: that L-shaped region can be **rearranged**:
1. Cut the L into two rectangles
2. One rectangle has dimensions a × (a-b)
3. The other has dimensions b × (a-b), which we can reposition
4. Together, they form a rectangle of dimensions (a-b) × (a+b)

Area of rectangle = (a-b) × (a+b) = a^2 - b^2

### The Formula for Midpoint and Deviation

Given two numbers num1 and num2:

**Midpoint**: m = (num1 + num2) / 2
**Deviation**: d = |num2 - num1| / 2

**Product formula**: num1 × num2 = m^2 - d^2

**Derivation**:
- num1 = m - d
- num2 = m + d
- num1 × num2 = (m - d)(m + d) = m^2 - d^2

### Connection to Quadratic Equations

The difference of squares is intimately connected to solving quadratic equations. Consider:

x^2 - c = 0

This factors as:
x^2 - (sqrt(c))^2 = 0
(x - sqrt(c))(x + sqrt(c)) = 0

So x = ±sqrt(c). This is why the difference of squares appears in the quadratic formula.

### The Conjugate Relationship

In the difference of squares identity, the expressions (a - b) and (a + b) are called **conjugates**. This concept extends to more advanced mathematics:

**In complex numbers**: (a + bi)(a - bi) = a^2 + b^2

**In surds**: (a + sqrt(b))(a - sqrt(b)) = a^2 - b

Understanding conjugates in the context of difference of squares prepares you for these more advanced applications.
    `.trim(),

    deepDiveContent: `
## Deep Dive: Advanced Connections and Theory

### Algebraic Structure and Factorization

The difference of squares factorization reveals important properties about the structure of integers:

**Theorem**: For integers a > b > 0, the number a^2 - b^2 is **never prime** unless:
- |a - b| = 1, OR
- |a + b| = 1

**Proof**: Since a^2 - b^2 = (a-b)(a+b), and both factors are greater than 1 when a - b > 1 and a + b > 1, the number has non-trivial factors and is therefore composite.

### Connection to Complex Numbers

The difference of squares identity has a beautiful partner in the complex numbers:

**Real numbers**: a^2 - b^2 = (a - b)(a + b)
**Complex numbers**: a^2 + b^2 = (a + bi)(a - bi)

The **sum** of squares doesn't factor over the real numbers (it has no real roots), but it does factor over the complex numbers. This is why we sometimes say "the complex numbers are algebraically closed"—every polynomial factors completely.

### Generalization: Higher Power Differences

The pattern of differences extends to higher powers:

**Difference of cubes**:
a^3 - b^3 = (a - b)(a^2 + ab + b^2)

**Sum of cubes**:
a^3 + b^3 = (a + b)(a^2 - ab + b^2)

**Difference of fourth powers**:
a^4 - b^4 = (a^2 - b^2)(a^2 + b^2) = (a-b)(a+b)(a^2 + b^2)

### The Cognitive Strategy: Visual Pattern Recognition

When approaching a multiplication problem, train your eye to spot symmetric patterns:

**Step 1**: Calculate the average (midpoint)
- 47 and 53 → average is 50
- 96 and 104 → average is 100
- 38 and 42 → average is 40

**Step 2**: Check if the average is "nice"
- Is it a multiple of 10? Of 50? Of 100?
- Can you easily square it?

**Step 3**: Calculate the deviation
- How far is each number from the midpoint?
- Is this deviation small (single digit is ideal)?

**Step 4**: Apply the formula
- Midpoint squared minus deviation squared

### Historical Mathematicians and This Identity

**Euclid (c. 300 BCE)**: In *Elements*, Euclid proves this identity geometrically (Book II, Proposition 5). His proof uses the gnomon (L-shaped figure) construction.

**Diophantus (c. 250 CE)**: The Alexandrian mathematician used difference of squares in his work on number theory, particularly in finding Pythagorean triples.

**Brahmagupta (598-668 CE)**: The Indian mathematician used this identity in his work on solving quadratic equations.

### Connection to Pythagorean Triples

Every Pythagorean triple (a, b, c) where a^2 + b^2 = c^2 can be generated using the difference of squares:

For integers m > n > 0:
- a = m^2 - n^2
- b = 2mn
- c = m^2 + n^2

This generates ALL primitive Pythagorean triples! The difference of squares is hiding inside every right triangle with integer sides.

### Why Round Midpoints Matter: Cognitive Analysis

Psychological research on mental arithmetic shows:

1. **Anchor numbers**: Round numbers (10, 50, 100) serve as cognitive anchors. We naturally estimate relative to these values.

2. **Squaring fluency**: Most people can square multiples of 10 instantly (30^2 = 900, 50^2 = 2500). This makes round midpoints ideal.

3. **Subtraction ease**: Subtracting a small square (1, 4, 9, 16, 25...) from a round result is cognitively simple.

### When Difference of Squares Beats Other Methods

**Comparison with Distributive Property** for 47 × 53:

Distributive:
(40 + 7) × 53 = 40 × 53 + 7 × 53 = 2120 + 371 = 2491
(3 mental operations: two multiplications, one addition)

Difference of Squares:
50^2 - 3^2 = 2500 - 9 = 2491
(2 mental operations: two squares, one subtraction)

The difference of squares wins when:
- Midpoint is round (easy to square)
- Deviation is small (small square, easy subtraction)
- Numbers are clearly symmetric

### Error Prevention and Verification

**Common errors**:
1. Wrong midpoint: (47+53)/2 = 50, not 49 or 51
2. Wrong deviation: Each number is 3 away, not 6
3. Adding instead of subtracting: It's m^2 - d^2, never m^2 + d^2
4. Squaring errors: Double-check your squares

**Verification strategies**:
1. Check that m - d = smaller number
2. Check that m + d = larger number
3. Estimate: Answer should be slightly less than m^2
4. Last digit check: Verify the ones digit is correct
    `.trim(),

    whenToUse: [
      '**Primary Pattern**: Two numbers symmetric around a midpoint (equidistant from their average)',
      '**Ideal Midpoints**: Round numbers like 10, 20, 25, 50, 100, 500, 1000',
      '**Deviation Threshold**: Best when deviation is small (1-10), usable up to about 20',
      '**Perfect Examples**: 47×53 (mid=50, dev=3), 96×104 (mid=100, dev=4), 38×42 (mid=40, dev=2)',
      '**Good Examples**: 43×57 (mid=50, dev=7), 88×112 (mid=100, dev=12), 24×36 (mid=30, dev=6)',
      '**Quick Check**: Add the numbers; if sum is double a nice number, this method works',
      '**Avoid When**: Midpoint is awkward (like 47.5) or deviation is large (like 25)',
      '**Comparison**: Faster than distributive when midpoint is round and deviation is small',
      '**Verification**: Answer must be less than midpoint squared (since we subtract)',
      '**Mental Process**: Average → Square → Deviation → Square → Subtract'
    ],
    whenNotToUse: [
      'When numbers are not symmetric around any clean midpoint',
      'When the midpoint is awkward to square (like 47)',
      'When the distance from midpoint is too large (>10)'
    ],
    commonMistakes: [
      'Not verifying that both numbers are equidistant from the midpoint',
      'Forgetting to square the distance before subtracting',
      'Confusing this with Near-100 method'
    ],
    practiceStrategies: [
      'Drill instant recognition of symmetric pairs',
      'Memorize squares 1-10 and key values: 25, 50, 75, 100',
      'Practice computing sums quickly to find midpoints'
    ],

    prerequisites: [MethodName.Distributive],
    nextMethods: [MethodName.Squaring]
  },

  [MethodName.NearPower10]: {
    method: MethodName.NearPower10,
    introduction: `
## What is the Near Powers of 10 Method?

The Near Powers of 10 method is a powerful mental math technique that exploits a fundamental property of our decimal number system: **multiplying by powers of 10 is trivial**. When one of the numbers in a multiplication is close to 10, 100, 1000, or any power of 10, we can decompose it into that power plus or minus a small offset, dramatically simplifying the calculation.

### The Core Insight

Consider multiplying 98 × 47. If you try to compute this directly, you face a challenging two-digit by two-digit multiplication. But observe that 98 is just 2 away from 100:

**98 × 47 = (100 - 2) × 47 = 100 × 47 - 2 × 47 = 4700 - 94 = 4606**

The genius of this method lies in the transformation: we've converted one "hard" multiplication (98 × 47) into one "trivial" multiplication (100 × 47 = 4700, just append zeros) and one "easy" multiplication (2 × 47 = 94, a single-digit times two-digit).

### Historical Context and Origins

The exploitation of decimal structure for mental calculation has ancient roots. Traders and merchants in various cultures discovered that calculations near round numbers were simpler—a practical discovery born from everyday commerce rather than formal mathematics.

In ancient Babylon (circa 2000 BCE), while they used a base-60 system, similar principles applied near multiples of 60. Indian mathematicians in the Vedic tradition (as popularized in the 20th century by Bharati Krishna Tirthaji) formalized these techniques under the sutra "Nikhilam Sutra" (subtraction from the base).

The method gained renewed attention in the 20th century as mental math competitions and educational reform movements sought to teach number sense rather than rote memorization.

### Why This Method is Powerful for Mental Math

1. **Cognitive Load Reduction**: Multiplying by powers of 10 requires zero cognitive effort—you simply append zeros or shift the decimal point. This leaves your mental energy for the smaller calculation.

2. **Universal Applicability**: Every multiplication problem has at least one number that can be expressed as a power of 10 plus or minus some offset. The question is whether that offset is small enough to be useful.

3. **Composability**: This technique combines naturally with other methods. For instance, after computing 100 × 47 = 4700, you might use the distributive property to compute 2 × 47 as 2 × 40 + 2 × 7 = 80 + 14 = 94.

4. **Error Reduction**: The structure of this method provides a built-in sanity check. You know the answer must be close to the power-of-10 product (4700 in our example), making gross errors immediately obvious.

### Real-World Applications

- **Shopping and Budgeting**: Quickly estimating costs when items are priced near round numbers (a common retail strategy—$9.99 instead of $10.00)
- **Currency Exchange**: Many exchange rates hover near powers of 10 (e.g., approximately 100 yen per dollar)
- **Scientific Estimation**: Quickly checking calculations where one quantity is approximately a power of 10
- **Engineering Approximations**: Rapid ballpark calculations in design and analysis
    `.trim(),

    mathematicalFoundation: `
## The Mathematical Foundation

### The Fundamental Identity

For any number **n** that can be expressed as a power of 10 plus or minus a small offset:

**n = 10^k ± ε** where ε is small

The multiplication **n × m** becomes:

**(10^k ± ε) × m = 10^k × m ± ε × m**

This is a direct application of the **distributive property** of multiplication over addition (or subtraction).

### Formal Proof

**Theorem**: For any integers a, b, k where k ≥ 0:

**(10^k + a) × b = 10^k × b + a × b**

**Proof**:
1. Let n = 10^k + a (expressing the first number as power of 10 plus offset)
2. n × b = (10^k + a) × b
3. By the distributive property of multiplication over addition:
   (10^k + a) × b = 10^k × b + a × b  ∎

The same holds for subtraction:

**(10^k - a) × b = 10^k × b - a × b**

**Proof**:
1. Let n = 10^k - a
2. n × b = (10^k - a) × b
3. Rewrite as: (10^k + (-a)) × b
4. By distributive property: 10^k × b + (-a) × b = 10^k × b - a × b  ∎

### Connection to Our Base-10 Number System

The power of this method comes directly from the **positional notation** of our decimal system. In base-10:

- The number 347 represents: 3 × 10² + 4 × 10¹ + 7 × 10⁰
- Multiplying by 10 shifts each digit left: 347 × 10 = 3470
- This is equivalent to: 3 × 10³ + 4 × 10² + 7 × 10¹ + 0 × 10⁰

**Key Insight**: Multiplication by 10^k is a **structural operation** (digit shifting), not an arithmetic operation. It requires no computation—only understanding of place value.

### Visual Representation (Described)

Imagine a number line marked at 0, 10, 100, 1000, etc. Numbers near these landmarks have a special property: their distance from the landmark is small compared to the landmark itself.

For 98:
- Landmark: 100
- Distance: 2 (to the left)
- Representation: 100 - 2

When we multiply 98 × 47:
- We "project" 98 onto the landmark (100)
- We compute 100 × 47 (trivial shift)
- We "correct" for the distance: 2 × 47 (small multiplication)
- Final answer: landmark product - correction

This visual model helps explain why the method works: we're decomposing the problem into a "main term" (at the landmark) and a "correction term" (the offset).

### The Role of Absolute and Relative Distance

The method's efficiency depends on two factors:

1. **Absolute distance** (|offset|): Must be small enough that offset × other_number is easy
2. **Relative distance** (|offset| / 10^k): Determines the size of the correction relative to the main term

For 98 (2 away from 100): |offset| = 2, relative distance = 2%
For 997 (3 away from 1000): |offset| = 3, relative distance = 0.3%

The smaller the relative distance, the more "leverage" we get from the power-of-10 multiplication.
    `.trim(),

    deepDiveContent: `
## Deep Dive: Why Base-10 Makes This Method Powerful

### The Structure of Positional Number Systems

Every positional number system with base *b* has the property that multiplication by *b^k* is trivial. In base-10, this means:

- × 10 = append one zero (shift left one position)
- × 100 = append two zeros (shift left two positions)
- × 1000 = append three zeros (shift left three positions)

This is **not a coincidence**—it's a structural necessity of positional notation. The place value of digit *d* in position *p* is *d × b^p*. Multiplying by *b* simply increments all positions by 1.

### Comparison: What If We Used Different Bases?

In binary (base-2), powers of 2 are trivial:
- 7 × 8 = 7 × 2³ = shift 7 left by 3 bits = 56
- Programmers exploit this constantly with bit shifting

In hexadecimal (base-16), powers of 16 are trivial:
- Mental math with hex benefits from numbers near 16, 256, 4096...

The decimal system (base-10) is a historical artifact (likely from counting on fingers), not mathematically optimal. But since we use it, we exploit its structure.

### Connection to Logarithms and Scientific Notation

The Near Powers of 10 method is intimately connected to **logarithmic thinking**:

- log₁₀(98) ≈ 1.99 (very close to 2 = log₁₀(100))
- log₁₀(997) ≈ 2.998 (very close to 3 = log₁₀(1000))

In scientific notation:
- 98 = 0.98 × 10²
- 997 = 0.997 × 10³

The "near power of 10" property is equivalent to having a mantissa close to 1.0 in scientific notation. This connection explains why scientists and engineers find this method intuitive—they already think in orders of magnitude.

### Historical Context: Vedic Mathematics

The Vedic mathematics tradition, particularly as compiled by Bharati Krishna Tirthaji in the early 20th century, includes the "Nikhilam Sutra" (subtraction from the base). This sutra states:

> "All from 9 and the last from 10"

This refers to finding the complement of a number from a power of 10. For 98, the complement from 100 is 02 (found by "all from 9, last from 10": 9-9=0, 10-8=2).

While the historical authenticity of these "ancient Vedic" origins is debated by scholars, the mathematical techniques are sound and practical.

### Why the Threshold of 15 Works

Cognitive research suggests that humans can reliably hold about 4 "chunks" of information in working memory. When the offset is ≤15:

1. The offset itself is a single chunk (two digits at most)
2. The power-of-10 product is stored as a chunk (just the other number with zeros)
3. The offset product (offset × other_number) typically produces a 2-3 digit result (one chunk)
4. The final addition/subtraction is one chunk

When offsets exceed 15, the intermediate products grow to 3+ digits, increasing memory load and error rates.

### Comparison with Standard Multiplication

Consider 102 × 37:

**Standard method** (grade school algorithm):
- 102 × 7 = 714
- 102 × 30 = 3060
- Sum: 3774
- Requires: 2 multiplications, 1 addition, tracking place values

**Near Powers of 10 method**:
- 102 = 100 + 2
- 100 × 37 = 3700 (trivial)
- 2 × 37 = 74
- Sum: 3700 + 74 = 3774
- Requires: 1 trivial shift, 1 easy multiplication, 1 easy addition

The cognitive load of the Near Powers method is significantly lower because the "trivial" multiplication carries no cost.

### Edge Cases and Limitations

**When the method is suboptimal:**

1. **Both numbers near powers of 10**: Use the Near-100 method instead (more efficient)
2. **Large offset with small other number**: e.g., 85 × 3—direct calculation (255) is faster
3. **Numbers equidistant from midpoint**: Difference of squares may be better

**Handling carry and borrow:**

When subtracting, watch for cases where the correction is larger than the ones/tens of the main product:
- 98 × 47 = 4700 - 94 = 4606 (need to borrow from 47 to get 46, then 100 - 94 = 6)

### Extension: The "Overshoot" Variant

Sometimes it's easier to use a power of 10 that's *smaller* than the number:

For 103 × 47:
- 103 = 100 + 3
- 100 × 47 = 4700
- 3 × 47 = 141
- Sum: 4700 + 141 = 4841

The sign of the correction (add vs. subtract) depends on whether the number is above or below the power of 10. Always think: "power of 10 ± offset" and track the sign carefully.
    `.trim(),

    whenToUse: [
      '**Primary Trigger**: One number is within ±15 of a power of 10 (10, 100, 1000, etc.)',
      '**Ideal Numbers**: 98, 99, 101, 102, 997, 998, 1001, 1002, 1003...',
      '**Good Numbers**: 95-105, 990-1010, 85-115 (offset 5-15)',
      '**Borderline**: 85, 115, 980, 1020 (offset approaching 20—evaluate if offset × other is easy)',
      '**Avoid When**: Both numbers are near 100 (use Near-100 method instead)',
      '**Avoid When**: Numbers are symmetric around a midpoint (use Difference of Squares)',
      '**Best Performance**: When the offset × other_number is easy (e.g., 2 × anything, 5 × anything, 3 × small number)'
    ],
    whenNotToUse: [
      'When neither number is close to a power of 10',
      'When both numbers are near 100 (use Near-100 method)',
      'When numbers are symmetric around a midpoint (use Difference of Squares)'
    ],
    commonMistakes: [
      'Forgetting to add/subtract the correction term',
      'Adding when you should subtract (or vice versa)',
      'Using the wrong power of 10'
    ],
    practiceStrategies: [
      'Start with numbers ending in 9 or 1 where correction equals the other number',
      'Practice instant recognition: see 98 and think "100 - 2"',
      'Drill the power multiplication until automatic'
    ],

    prerequisites: [MethodName.Distributive],
    nextMethods: [MethodName.Near100]
  },

  [MethodName.Squaring]: {
    method: MethodName.Squaring,
    introduction: `
## What is Squaring?

Squaring—multiplying a number by itself—is one of the most fundamental operations in mathematics, and it has remarkably elegant shortcuts that make mental calculation not just possible but genuinely enjoyable. When we square a number n, we compute n × n, written as n². The result is always positive (since negative times negative is positive), and it grows rapidly: 10² = 100, 100² = 10,000, 1000² = 1,000,000.

### Historical Context and Origins

The study of square numbers dates back to the ancient Pythagoreans (circa 500 BCE), who represented them as dots arranged in square patterns—hence the name "square numbers." The Babylonians (circa 2000 BCE) used tables of squares for multiplication, exploiting the remarkable identity:

**ab = [(a+b)² - (a-b)²] / 4**

This "quarter-square" method was the primary multiplication technique in many ancient civilizations before the development of our modern algorithms. Medieval Islamic mathematicians, particularly Al-Khwarizmi (whose name gives us the word "algorithm"), developed sophisticated methods for computing squares as part of their foundational work on algebra.

The binomial expansion we use today—(a + b)² = a² + 2ab + b²—was formalized much later in Europe, though the underlying pattern was understood by mathematicians across cultures for centuries.

### Why Squaring is Easier Than General Multiplication

Squaring has several properties that make it simpler to compute mentally:

1. **Symmetry**: Since both factors are the same number, you only need to "know" one number. This reduces the cognitive load of tracking two different quantities.

2. **Predictable Patterns**: Square numbers follow recognizable digit patterns. For example, squares always end in 0, 1, 4, 5, 6, or 9—never 2, 3, 7, or 8.

3. **Special Formulas**: The binomial expansion (a+b)² = a² + 2ab + b² reduces squaring to three simpler operations that combine additively.

4. **Numbers Ending in 5**: These have an incredibly simple shortcut where you need only memorize one rule.

### Real-World Applications

- **Estimating Areas**: A room that's "about 15 feet square" has area 15² = 225 square feet
- **Distance Calculations**: The Pythagorean theorem (a² + b² = c²) requires squaring
- **Statistics**: Standard deviation calculations involve squaring differences from the mean
- **Physics**: Kinetic energy (½mv²) and gravitational potential (proportional to 1/r²) both involve squares
- **Finance**: Compound interest over multiple periods involves powers (which build on squaring)
- **Computer Graphics**: Distance calculations and collision detection rely heavily on squared distances

### The Core Technique

The foundation of mental squaring is the binomial expansion formula:

**(a + b)² = a² + 2ab + b²**

For any two-digit number, we split it into tens and ones:

**Example: 73²**
- Write 73 as 70 + 3
- Apply the formula: (70 + 3)² = 70² + 2(70)(3) + 3²
- Calculate each term: 4900 + 420 + 9 = 5329

Each component is manageable mentally:
- 70² = 4900 (just square 7 and append two zeros)
- 2 × 70 × 3 = 420 (double 7×3=21, append one zero)
- 3² = 9 (memorized)

The key insight is that we've transformed one "hard" mental calculation into three simpler ones that we add together.
    `.trim(),

    mathematicalFoundation: `
## The Binomial Expansion Formula

### Core Identity

**(a + b)² = a² + 2ab + b²**

This identity is the mathematical foundation of all squaring shortcuts. Let's prove it rigorously from first principles.

### Algebraic Proof

Starting from the definition of squaring:

(a + b)² = (a + b)(a + b)

Apply the distributive property (FOIL):

= (a + b) × a + (a + b) × b     [Distributive: x(y+z) = xy + xz]
= a × a + b × a + a × b + b × b  [Distributive again]
= a² + ab + ab + b²              [Definition of squaring; ab = ba]
= a² + 2ab + b²                  [Combining like terms]

**Q.E.D.**

### Geometric Proof

Visualize a square with side length (a + b). Its total area is (a + b)².

Now mentally divide this square into four regions by drawing a horizontal and vertical line at distance a from one corner:

1. **Top-left region**: A square with side a, having area a²
2. **Top-right region**: A rectangle with dimensions a × b, having area ab
3. **Bottom-left region**: A rectangle with dimensions b × a, having area ab (same as region 2)
4. **Bottom-right region**: A square with side b, having area b²

**Total area** = a² + ab + ab + b² = a² + 2ab + b²

This geometric interpretation explains why the formula works: the two "ab" rectangles represent the cross-terms in the expansion, and they appear twice because the decomposition creates two congruent rectangles.

### The Subtraction Variant

There's also an identity for (a - b)²:

**(a - b)² = a² - 2ab + b²**

**Proof**:
(a - b)² = (a - b)(a - b)
        = a² - ab - ab + b²      [FOIL with negative sign]
        = a² - 2ab + b²          [Combining terms]

This variant is useful when a number is close to a round number from below. For example:

**47² using subtraction:**
- Write 47 as 50 - 3
- (50 - 3)² = 50² - 2(50)(3) + 3² = 2500 - 300 + 9 = 2209

### Application to Base-10 Numbers

For any two-digit number n, we can write n = 10m + d where:
- m is the tens digit (e.g., for 73, m = 7)
- d is the ones digit (e.g., for 73, d = 3)

Then:
n² = (10m + d)²
   = (10m)² + 2(10m)(d) + d²
   = 100m² + 20md + d²

**Interpretation of each term:**

| Term | Meaning | Computation | Example (73²) |
|------|---------|-------------|---------------|
| 100m² | Square of tens, shifted | m² with "00" appended | 49 → 4900 |
| 20md | Cross term, doubled | 2×m×d with "0" appended | 2×7×3 = 42 → 420 |
| d² | Square of ones | Single digit square (memorized) | 9 |

**Sum: 4900 + 420 + 9 = 5329**

### Memorization: Single-Digit Squares

For efficient mental squaring, these should be instant recall:

| n | n² |
|---|-----|
| 1 | 1 |
| 2 | 4 |
| 3 | 9 |
| 4 | 16 |
| 5 | 25 |
| 6 | 36 |
| 7 | 49 |
| 8 | 64 |
| 9 | 81 |

With these memorized, squaring any two-digit number becomes mechanical application of the formula.

### Connection to the Difference of Squares

Squaring and the difference of squares are two sides of the same coin. Recall:

**a² - b² = (a-b)(a+b)**

Rearranging: **a² = (a-b)(a+b) + b²**

This means we can compute any square by finding two numbers that multiply to give a simpler product, then adding a correction. For example:

**47²** using difference of squares:
- Choose b = 3 so that (a-b) = 44 and (a+b) = 50
- 47² = 44 × 50 + 3² = 2200 + 9 = 2209
    `.trim(),

    deepDiveContent: `
## Special Case: Numbers Ending in 5

Numbers ending in 5 have a beautiful shortcut that makes squaring almost trivial—one of the most elegant patterns in mental mathematics.

### The Rule

**To square any number ending in 5:**
1. Take all digits before the 5 (call this n)
2. Multiply n by (n + 1)
3. Append "25" to the result

**Formula**: (10n + 5)² = 100 × n × (n+1), then append 25

### Worked Examples

| Number | n | n × (n+1) | Result |
|--------|---|-----------|--------|
| 15² | 1 | 1 × 2 = 2 | **225** |
| 25² | 2 | 2 × 3 = 6 | **625** |
| 35² | 3 | 3 × 4 = 12 | **1225** |
| 45² | 4 | 4 × 5 = 20 | **2025** |
| 55² | 5 | 5 × 6 = 30 | **3025** |
| 65² | 6 | 6 × 7 = 42 | **4225** |
| 75² | 7 | 7 × 8 = 56 | **5625** |
| 85² | 8 | 8 × 9 = 72 | **7225** |
| 95² | 9 | 9 × 10 = 90 | **9025** |
| 105² | 10 | 10 × 11 = 110 | **11025** |
| 115² | 11 | 11 × 12 = 132 | **13225** |
| 125² | 12 | 12 × 13 = 156 | **15625** |

### Why Does This Work? (Proof)

(10n + 5)² = (10n)² + 2(10n)(5) + 5²
           = 100n² + 100n + 25
           = 100(n² + n) + 25
           = 100 × n(n + 1) + 25

The key insight is that n² + n factors as n(n+1). Since one of any two consecutive integers is even, n(n+1) is always even, making 100 × n(n+1) always end in "00". Adding 25 gives us our final answer ending in "25".

### Historical Note

This shortcut was known to Vedic mathematicians and is called "Ekadhikena Purvena" (one more than the previous one). It appears in medieval Indian mathematical texts and was popularized in the 20th century by the Vedic mathematics movement.

---

## The Difference of Squares Connection

Squaring is intimately connected to the difference of squares identity. This connection provides an alternative approach that's sometimes easier.

### The Key Identity

From **a² - b² = (a-b)(a+b)**, we can rearrange to get:

**a² = (a-b)(a+b) + b²**

This means: to square any number a, choose a convenient b such that either (a-b) or (a+b) is a round number.

### Examples

**47²** (choosing b = 3):
- a - b = 47 - 3 = 44
- a + b = 47 + 3 = 50
- 47² = 44 × 50 + 9 = 2200 + 9 = **2209**

**73²** (choosing b = 3):
- a - b = 73 - 3 = 70
- a + b = 73 + 3 = 76
- 73² = 70 × 76 + 9 = 5320 + 9 = **5329**

**99²** (choosing b = 1):
- a - b = 99 - 1 = 98
- a + b = 99 + 1 = 100
- 99² = 98 × 100 + 1 = 9800 + 1 = **9801**

---

## Near-Square Multiplication

When you need to multiply numbers that are close together (but not equal), squaring provides a powerful stepping stone.

### Identity 1: n × (n + k) = n² + kn

**Example: 73 × 75**
- This is 73 × (73 + 2)
- = 73² + 2 × 73
- = 5329 + 146
- = **5475**

### Identity 2: Using Difference of Squares via Midpoint

Alternatively, find the midpoint and use difference of squares:

**73 × 75** (midpoint is 74):
- 73 × 75 = (74 - 1)(74 + 1)
- = 74² - 1²
- = 5476 - 1
- = **5475**

This approach is often faster when the midpoint is easy to square.

### When to Use Which

| Situation | Best Approach |
|-----------|---------------|
| Both numbers easy to square | Use n × (n+k) = n² + kn |
| Midpoint is round or easy | Use (m-d)(m+d) = m² - d² |
| One number ends in 5 | Square it, then adjust |

---

## Historical Method: Quarter Squares

Before calculators and even before paper-and-pencil algorithms were standardized, mathematicians used "quarter-square tables" for all multiplication. This method exploits squaring to perform any multiplication.

### The Quarter-Square Identity

**a × b = [(a+b)² - (a-b)²] / 4**

**Proof**:
(a+b)² = a² + 2ab + b²
(a-b)² = a² - 2ab + b²

Subtracting: (a+b)² - (a-b)² = 4ab

Therefore: ab = [(a+b)² - (a-b)²] / 4

### How It Was Used

Mathematicians maintained tables of **quarter-squares** (n²/4 for all n up to some limit). To multiply a × b:

1. Look up (a+b)²/4 in the table
2. Look up (a-b)²/4 in the table (or |a-b|²/4 if a < b)
3. Subtract the second from the first

**Example: 17 × 23**
- a + b = 40, quarter-square = 400
- a - b = 6, quarter-square = 9
- 17 × 23 = 400 - 9 = **391**

This method was used extensively from antiquity through the 19th century!

---

## Algebraic Structure: The Binomial Theorem

The formula (a+b)² = a² + 2ab + b² is a special case of the general **Binomial Theorem**:

**(a + b)^n = Sum of C(n,k) × a^(n-k) × b^k** for k from 0 to n

Where C(n,k) = n! / (k!(n-k)!) are the **binomial coefficients**.

### Pascal's Triangle

The binomial coefficients form Pascal's Triangle:

n=0:         1
n=1:        1 1
n=2:       1 2 1
n=3:      1 3 3 1
n=4:     1 4 6 4 1

For n = 2: coefficients are [1, 2, 1], giving us (a+b)² = **1**·a² + **2**·ab + **1**·b²

### Higher Powers (Advanced)

While mental math typically stops at n=2, knowing the pattern helps:

- (a+b)³ = a³ + 3a²b + 3ab² + b³ (coefficients: 1, 3, 3, 1)
- (a+b)⁴ = a⁴ + 4a³b + 6a²b² + 4ab³ + b⁴ (coefficients: 1, 4, 6, 4, 1)

---

## Memory Techniques for Common Squares

Professional mental calculators memorize squares up to 100 or beyond. Here are patterns to accelerate memorization:

### Complements to 50

Numbers equidistant from 50 have a predictable pattern:

| Pair | Calculation | Pattern |
|------|-------------|---------|
| 49², 51² | 2401, 2601 | Differ by 200 |
| 48², 52² | 2304, 2704 | Differ by 400 |
| 47², 53² | 2209, 2809 | Differ by 600 |

**Rule**: (50-n)² and (50+n)² differ by 200n

### Complements to 100

Using (a-b)² = a² - 2ab + b²:

| n | (100-n)² | Calculation |
|---|----------|-------------|
| 99 | 9801 | 10000 - 200 + 1 |
| 98 | 9604 | 10000 - 400 + 4 |
| 97 | 9409 | 10000 - 600 + 9 |
| 96 | 9216 | 10000 - 800 + 16 |
| 95 | 9025 | 10000 - 1000 + 25 |

### Digit Sum Test

A perfect square (mod 9) can only equal 0, 1, 4, or 7. This means:

**If the digit sum of a number doesn't reduce to 0, 1, 4, or 7, it's NOT a perfect square.**

Example: Is 1234 a perfect square?
- Digit sum: 1 + 2 + 3 + 4 = 10 → 1 + 0 = 1 (could be)
- Is 1235 a perfect square?
- Digit sum: 1 + 2 + 3 + 5 = 11 → 1 + 1 = 2 (definitely not)

---

## Practice Strategy: Building Mastery

### Level 1: Numbers Ending in 5
Start here—the shortcut is foolproof and builds confidence.
- 15², 25², 35², 45², 55², 65², 75², 85², 95²

### Level 2: Two-Digit Numbers Using Binomial
Apply (a+b)² = a² + 2ab + b² systematically.
- Numbers 11-19, 21-29, 31-39...

### Level 3: Memorize 1-25 Squares
These appear most frequently and should become instant recall.

### Level 4: Near-Round Numbers
Use (50±n)² or (100-n)² patterns.
- 48², 49², 51², 52², 97², 98², 99²

### Level 5: Difference of Squares Approach
Practice choosing the right b to make (a-b) or (a+b) round.
- For 47²: choose b=3 → 44 × 50 + 9
- For 73²: choose b=3 → 70 × 76 + 9

The goal is **flexibility**: for any number, recognize multiple approaches and choose the one that minimizes mental effort for you personally.
    `.trim(),

    whenToUse: [
      '**Primary Use Case**: Same number multiplication (n × n)—squaring',
      '**Numbers Ending in 5**: Use the n(n+1) followed by 25 shortcut (e.g., 35², 75², 85²)',
      '**Numbers Near Round Numbers**: Use (round ± offset)² with addition or subtraction variant',
      '**Near-Same Numbers**: For n × (n+2), use n² + 2n or difference of squares via midpoint',
      '**As a Building Block**: Quarter-square identity enables any multiplication via squaring',
      '**Ideal Examples**: 35², 47², 73², 85², 99², 48×52 (via midpoint 50), 67×69 (via 68² - 1)'
    ],
    whenNotToUse: [
      'When multiplying two different numbers (use other methods)',
      'When the number is far from any convenient round number'
    ],
    commonMistakes: [
      'Forgetting the 2 in the 2ab term',
      'Getting the sign wrong in the 2ab term',
      'Forgetting that b² is always added'
    ],
    practiceStrategies: [
      'Memorize squares 1-10 until they are instant',
      'Memorize squares of multiples of 10',
      'Practice the "ends in 5" pattern'
    ],

    prerequisites: [MethodName.Distributive, MethodName.DifferenceSquares],
    nextMethods: []
  },

  [MethodName.Near100]: {
    method: MethodName.Near100,
    introduction: `
## What is the Near-100 Method?

The Near-100 Method (also known as the "deficit method," "cross multiplication," or the "Vedic nikhilam technique") is an elegant shortcut for multiplying two numbers that are both close to 100. When both multiplicands hover around 100, this method reduces the problem to a simple subtraction and a small single-digit multiplication.

### The Core Insight

Consider multiplying **97 × 94**. Both numbers are close to 100:
- 97 is **3 below** 100 (deficit of 3)
- 94 is **6 below** 100 (deficit of 6)

Instead of performing a full two-digit multiplication, we use a two-step shortcut:

**Step 1 - The Base**: Subtract one number's deficit from the other number:
- 97 - 6 = **91** (or equivalently, 94 - 3 = 91)

**Step 2 - The Adjustment**: Multiply the deficits:
- 3 × 6 = **18**

**Result**: Combine the base (91) and adjustment (18) → **9118**

We've transformed a complex multiplication into: one subtraction, one tiny multiplication (3 × 6), and concatenation.

### Historical Context and Origins

This technique has been popularized as part of **Vedic Mathematics**, a system attributed to ancient Indian mathematical texts. The method is associated with the "Nikhilam Sutra," one of 16 sutras (aphorisms) that Bharati Krishna Tirthaji claimed to have rediscovered from ancient Vedic texts in the early 20th century.

The Nikhilam Sutra translates roughly as **"All from 9 and the last from 10"**—a mnemonic for finding a number's complement from a power of 10:
- To find the complement of 97 from 100: 9-9=0, 10-7=3, so the deficit is 03
- To find the complement of 94 from 100: 9-9=0, 10-4=6, so the deficit is 06

While the historical provenance of "ancient Vedic origin" is debated among scholars, the mathematical validity and practical utility of the technique is undeniable.

### Why This Method is Uniquely Powerful

1. **Cognitive Efficiency**: The Near-100 method exploits the fact that 100 is a "landmark" number in our decimal system. Numbers near 100 have small, manageable deficits.

2. **Symmetry Exploitation**: When both numbers are near the same base, their relationship to that base can be computed in parallel, reducing working memory load.

3. **Small Number Multiplication**: The deficit product (the adjustment term) involves small single-digit numbers, which are easy to compute mentally.

4. **Built-in Verification**: The result should be close to 10,000 (which is 100 × 100). Any answer far from 10,000 signals an error immediately.

### Real-World Applications

- **Mental Estimation**: Quickly compute products in everyday scenarios where numbers cluster near 100 (percentages, scores, etc.)
- **Financial Calculations**: Interest rates, tax percentages, and discounts often involve numbers near 100
- **Academic Testing**: Standardized test scores often fall in the 80-100 range
- **Scientific Ratios**: Many scientific constants and conversion factors hover near powers of 10
    `.trim(),

    mathematicalFoundation: `
## The Mathematical Foundation

### The Fundamental Identity

For two numbers both near 100, expressed as **100 - a** and **100 - b** where a and b are the deficits:

**(100 - a)(100 - b) = 100(100 - a - b) + ab**

Or equivalently:

**(100 - a)(100 - b) = (100 - a - b) × 100 + ab**

The first term gives us the "hundreds" portion; the second gives us the "units" portion.

### Complete Formal Proof

**Theorem**: For any integers a, b:
**(100 - a)(100 - b) = 100(100 - a - b) + ab**

**Proof**:

Starting with the left-hand side:
(100 - a)(100 - b)

**Step 1**: Apply the FOIL method (distributive property):
= 100 × 100 - 100 × b - a × 100 + a × b
= 10000 - 100b - 100a + ab

**Step 2**: Factor out 100 from the first three terms:
= 10000 - 100(a + b) + ab

**Step 3**: Rewrite 10000 as 100 × 100:
= 100 × 100 - 100(a + b) + ab

**Step 4**: Factor out 100 from the first two terms:
= 100 × (100 - a - b) + ab
= 100(100 - a - b) + ab  ∎

### Why the "Cross Subtraction" Works

The formula 100(100 - a - b) + ab can be understood as:

- **First part**: Take either number and subtract the other's deficit
  - (100 - a) - b = 100 - a - b = 100 - (a + b)
  - (100 - b) - a = 100 - b - a = 100 - (a + b)

Both give the same result! This is the "base" value.

- **Second part**: Multiply the deficits
  - a × b

The base value, multiplied by 100, plus the deficit product gives the final answer.

### Handling Numbers Above 100 (Surpluses)

When a number is **above** 100, it has a **negative deficit** (or "surplus"):

For 103: deficit = -3 (it's 3 above 100)
For 97: deficit = +3 (it's 3 below 100)

The formula still works with signed arithmetic:

**103 × 97**:
- a = -3 (surplus of 3)
- b = +3 (deficit of 3)

Using the formula:
- Base: 100 - (-3) - 3 = 100 + 3 - 3 = 100
- Adjustment: (-3) × 3 = -9

Result: 100 × 100 + (-9) = 10000 - 9 = 9991

**Verification**: 103 × 97 = (100 + 3)(100 - 3) = 100² - 3² = 10000 - 9 = 9991 ✓

### Mixed Case: One Above, One Below

When one number is above 100 and one is below:

**104 × 96**:
- 104 has surplus 4 (deficit = -4)
- 96 has deficit 4 (deficit = +4)

- Base: 100 - (-4) - 4 = 100 + 4 - 4 = 100
- Adjustment: (-4) × 4 = -16

Result: 100 × 100 - 16 = 10000 - 16 = 9984

This is also a **difference of squares** case: (100+4)(100-4) = 100² - 4² = 9984.

### Connection to the Difference of Squares

When the deficits are equal in magnitude but opposite in sign (one above, one below by the same amount), the Near-100 method reduces to the difference of squares:

**(100 + d)(100 - d) = 100² - d²**

This shows the deep connection between different mental math methods—they're all applications of the same underlying algebraic identities.

### Visual Representation (Described)

Imagine a **number line** centered at 100:
- Numbers to the left of 100 have positive deficits
- Numbers to the right of 100 have negative deficits (surpluses)

For 97 × 94:
- 97 is at position -3 (relative to 100)
- 94 is at position -6 (relative to 100)

The **cross subtraction** moves 97 by 94's offset (-6), landing at 91.
The **adjustment** is the product of offsets: (-3) × (-6) = +18.

Result: 91|18 = 9118 (where | denotes concatenation of the base with the adjustment).
    `.trim(),

    deepDiveContent: `
## Deep Dive: The Mathematics and History

### Generalization to Any Base

The Near-100 method generalizes to any base **B**:

**(B - a)(B - b) = B(B - a - b) + ab**

**For Base 50**:
(50 - a)(50 - b) = 50(50 - a - b) + ab

Example: 47 × 48 (both near 50)
- a = 3, b = 2
- Base: 50 - 3 - 2 = 45
- Adjustment: 3 × 2 = 6
- Result: 45 × 50 + 6 = 2250 + 6 = 2256 ✓

**For Base 1000**:
(1000 - a)(1000 - b) = 1000(1000 - a - b) + ab

Example: 997 × 994
- a = 3, b = 6
- Base: 1000 - 3 - 6 = 991
- Adjustment: 3 × 6 = 18
- Result: 991 × 1000 + 18 = 991018 ✓

### The Role of Place Value in Result Assembly

When combining the base and adjustment, place value matters:

For base 100: Base contributes to positions 100+ (multiplied by 100)
Adjustment contributes to positions 1-99 (added directly)

**Critical**: The adjustment must fit in the appropriate place value slots.

For 97 × 94:
- Base: 91 → contributes 9100
- Adjustment: 18 → contributes 18
- Result: 9100 + 18 = 9118

If the adjustment has more digits than expected (e.g., 3 digits for base 100), you need to carry:

For 88 × 85:
- a = 12, b = 15
- Base: 100 - 12 - 15 = 73
- Adjustment: 12 × 15 = 180 (three digits!)

Handle the carry:
- 180 = 1 × 100 + 80
- Add the carry to the base: 73 + 1 = 74
- Result: 7400 + 80 = 7480 ✓

### The Vedic Mathematics Connection

In the Vedic mathematics system, this technique is derived from the **Nikhilam Sutra**:

> "Nikhilam Navatascharamam Dashatah"
> (All from 9 and the last from 10)

This sutra provides a shortcut for finding complements:

To find the complement of 97 from 100:
- All digits except the last: 10 - 1 - 9 = 0
- Last digit: 10 - 7 = 3
- Complement: 03

This works because 100 - 97 = 3, and the sutra gives a digit-by-digit procedure.

**Historical Note**: Bharati Krishna Tirthaji published "Vedic Mathematics" in 1965, claiming these methods came from appendices to the Atharvaveda. Historians have not found these original sources, but the mathematical techniques themselves are valid applications of standard algebra.

### Cognitive Load Analysis

Why is this method easier than standard multiplication?

**Standard multiplication of 97 × 94**:
1. Compute 97 × 4 = 388 (requires 2 sub-multiplications)
2. Compute 97 × 90 = 8730 (requires 2 sub-multiplications, place value)
3. Add 388 + 8730 = 9118 (multi-digit addition with carries)

Total: 4 multiplications, 1 complex addition

**Near-100 method for 97 × 94**:
1. Compute deficits: 3 and 6 (trivial subtractions)
2. Cross subtract: 97 - 6 = 91 (simple subtraction)
3. Multiply deficits: 3 × 6 = 18 (single-digit multiplication)
4. Combine: 9118 (concatenation)

Total: 2 trivial subtractions, 1 simple subtraction, 1 tiny multiplication

The Near-100 method wins because:
- Deficits are small numbers (easier to manipulate)
- Only one "real" multiplication (single-digit × single-digit)
- The structure exploits our base-10 system

### Extension: Three or More Numbers Near 100

The technique can be extended, though it becomes more complex:

**(100-a)(100-b)(100-c) = ...**

In practice, you'd apply the method twice:
1. First, multiply two numbers using Near-100
2. Then multiply the result by the third number using another method

### Comparison with Near Powers of 10

**Near Powers of 10**: One number near a power of 10
- Formula: (100 ± a) × b = 100b ± ab
- Best when: One number near power of 10, other is arbitrary

**Near 100**: Both numbers near 100 (or same base)
- Formula: (100-a)(100-b) = 100(100-a-b) + ab
- Best when: Both numbers near same base

**When to use which**:
- 98 × 47: Use Near Powers of 10 (only 98 is near 100)
- 98 × 97: Use Near-100 (both near 100)
- 98 × 102: Use Near-100 (both near 100)

### Special Cases and Patterns

**Same number (squaring)**: (100-a)² = 100(100-2a) + a²
Example: 97² = 100(94) + 9 = 9409

**Symmetric around 100**: (100+a)(100-a) = 10000 - a²
Example: 103 × 97 = 10000 - 9 = 9991

**Both above 100**: (100+a)(100+b) = 100(100+a+b) + ab
Example: 103 × 105:
- Base: 100 + 3 + 5 = 108
- Adjustment: 3 × 5 = 15
- Result: 10800 + 15 = 10815

### Error Prevention Strategies

1. **Sign Tracking**: Carefully track whether each number is above or below the base
2. **Reasonableness Check**: Result should be close to 100 × 100 = 10000
3. **Deficit Verification**: 100 - deficit should equal the original number
4. **Cross-Check**: Try the cross subtraction both ways (should give same base)
5. **Adjustment Size**: For base 100, adjustment should be at most 2 digits (unless deficits are large)

### Mental Procedure Checklist

1. Identify that both numbers are near 100 (within ±20)
2. Calculate each deficit (100 minus the number)
3. Cross-subtract: first number minus second deficit (or vice versa)
4. Multiply deficits
5. Handle signs if any surplus (number above 100)
6. Combine: base × 100 + adjustment
7. Verify reasonableness
    `.trim(),

    whenToUse: [
      '**Primary Trigger**: Both numbers are within ±20 of 100',
      '**Ideal Case**: Both numbers between 80-99 (small positive deficits, easy arithmetic)',
      '**Good Case**: Numbers in range 85-115 (manageable deficits/surpluses)',
      '**Works Well**: 97×94, 98×96, 88×92, 103×105, 97×102',
      '**Borderline**: Numbers like 75 or 125 (deficits of 25 make adjustment harder)',
      '**Avoid When**: Only one number is near 100 (use Near Powers of 10 instead)',
      '**Extends To**: Numbers near 50 (47×48), near 1000 (997×994), or any convenient base',
      '**Special Case**: Numbers symmetric around 100 (e.g., 103×97) reduce to difference of squares'
    ],
    whenNotToUse: [
      'When only one number is near 100 (use Near Powers of 10)',
      'When numbers are far from 100 (more than 15 away)',
      'When the product of deviations is hard to compute'
    ],
    commonMistakes: [
      'Forgetting the sign of deviations',
      'Errors computing ab when signs differ',
      'Not padding single-digit products'
    ],
    practiceStrategies: [
      'Start with symmetric pairs where the middle term is zero',
      'Practice identifying deviations instantly',
      'Drill the three cases: symmetric, both-below, both-above'
    ],

    prerequisites: [MethodName.Distributive, MethodName.NearPower10],
    nextMethods: []
  },

  [MethodName.Factorization]: {
    method: MethodName.Factorization,
    introduction: `
## What is the Factorization Method?

The Factorization Method exploits the **commutativity and associativity** of multiplication to transform a difficult problem into an easy one. By breaking numbers into their factors and strategically regrouping them, we can often create "friendly" intermediate products—especially multiples of 10, 100, or 1000—that make the final calculation trivial.

### The Core Insight

Consider multiplying **25 × 48**. At first glance, this seems like a standard two-digit multiplication. But observe:

**25 × 48 = 25 × (4 × 12) = (25 × 4) × 12 = 100 × 12 = 1200**

We've transformed a challenging multiplication into a trivial one! The key insight is that 25 × 4 = 100, and multiplying by 100 is as easy as appending two zeros.

This works because multiplication is both **commutative** (a × b = b × a) and **associative** ((a × b) × c = a × (b × c)). These properties guarantee that we can rearrange and regroup factors any way we like without changing the result.

### Historical Context and Origins

The art of strategic factorization has ancient roots. Merchants and traders throughout history discovered that certain number combinations were "friendlier" than others. The mathematical formalization of these techniques came later.

**The Fundamental Theorem of Arithmetic**, proven rigorously by Gauss in the early 19th century, states that every integer greater than 1 can be uniquely represented as a product of prime numbers (up to ordering). This theorem guarantees that factorization is always possible and unambiguous.

Ancient civilizations recognized special numbers like 60 (the Babylonian base, which has factors 2, 3, 4, 5, 6, 10, 12, 15, 20, 30) and 100 (our "century" marker) as particularly useful for calculations. The decimal system's reliance on powers of 10 makes factors of 10 especially valuable.

### Why This Method is Powerful for Mental Math

1. **Exploits Number Structure**: Rather than fighting the numbers, we work with their natural structure. Numbers divisible by 5 or 25 "want" to combine with factors of 2 or 4.

2. **Reduces Cognitive Load**: Once you spot a friendly factor pair (like 25 × 4 = 100), the problem collapses to something trivial.

3. **Universally Applicable**: Nearly every multiplication problem has some factorization that simplifies it. The skill is in recognizing the right decomposition quickly.

4. **Builds Number Sense**: Practicing factorization deepens your understanding of how numbers relate to each other.

### Real-World Applications

- **Pricing Calculations**: "25 items at $48 each" becomes 100 × 12 = $1200
- **Time Conversions**: 15 hours × 4 = 60 hours (using 15 × 4 = 60)
- **Measurement Scaling**: 25cm × 40 = 1000cm = 10m (using 25 × 4 × 10)
- **Percentage Calculations**: 25% of 240 = (1/4) × 240 = 60 (using factorization of 25% as 1/4)
- **Scientific Notation**: Regrouping factors helps maintain clean powers of 10

### Quick Divisibility Rules for Spotting Factors

To use this method effectively, you need to quickly identify factors:

| Divisible by | Quick Test |
|--------------|------------|
| 2 | Last digit is even (0, 2, 4, 6, 8) |
| 3 | Digit sum divisible by 3 |
| 4 | Last two digits divisible by 4 |
| 5 | Ends in 0 or 5 |
| 6 | Divisible by both 2 and 3 |
| 8 | Last three digits divisible by 8 |
| 9 | Digit sum divisible by 9 |
| 10 | Ends in 0 |
| 25 | Ends in 00, 25, 50, or 75 |

These tests let you instantly recognize factorization opportunities.
    `.trim(),

    mathematicalFoundation: `
## The Mathematical Foundation

### The Fundamental Properties

The factorization method relies on two fundamental properties of multiplication:

**1. Commutativity**: a × b = b × a

The order of factors doesn't matter. This lets us "swap" numbers to bring complementary factors together.

**2. Associativity**: (a × b) × c = a × (b × c)

The grouping of factors doesn't matter. This lets us "regroup" numbers to create convenient products.

**Combined Power**: Together, these properties mean that for any finite set of factors, we can multiply them in any order and any grouping, always getting the same result.

### Formal Proof of Regrouping

**Theorem**: For any integers a, b, c, d where b = c × d:
a × b = a × (c × d) = (a × c) × d

**Proof**:
1. Start with a × b where b = c × d
2. Substitute: a × (c × d)
3. By associativity: (a × c) × d
4. Therefore a × b = (a × c) × d  ∎

**Example Application**:
- 25 × 48 where 48 = 4 × 12
- 25 × (4 × 12) = (25 × 4) × 12 = 100 × 12 = 1200

### The Fundamental Theorem of Arithmetic

**Theorem (Fundamental Theorem of Arithmetic)**: Every integer greater than 1 either is a prime number itself or can be represented as a product of prime numbers, and this representation is unique up to the order of the factors.

**Significance**: This theorem guarantees that factorization is:
1. Always possible (every number can be broken down)
2. Unambiguous (there's only one way to do it with primes)
3. Finite (the factorization process terminates)

**Prime Factorization Examples**:
- 48 = 2⁴ × 3 = 2 × 2 × 2 × 2 × 3
- 25 = 5²
- 125 = 5³
- 24 = 2³ × 3 = 8 × 3

### Why Factor Pairs of 10^k are Special

In our base-10 number system, powers of 10 are structurally privileged:

**10 = 2 × 5**

This means any product containing both a factor of 2 and a factor of 5 can be regrouped to create a factor of 10.

**100 = 2² × 5² = 4 × 25**

Any product with 4 (= 2²) and 25 (= 5²) can be regrouped to create 100.

**1000 = 2³ × 5³ = 8 × 125**

Any product with 8 (= 2³) and 125 (= 5³) can be regrouped to create 1000.

**The Pattern**: 10^k = 2^k × 5^k

This explains why these specific factor pairs are "magic":
- 2 × 5 = 10
- 4 × 25 = 100
- 8 × 125 = 1000
- 16 × 625 = 10000

### Visual Representation: Factor Trees

Imagine each number as a tree with its prime factors as leaves:

**48 = 2 × 24 = 2 × 2 × 12 = 2 × 2 × 2 × 6 = 2 × 2 × 2 × 2 × 3**

The tree structure shows that 48 contains four 2s and one 3.

When multiplying 25 × 48:
- 25 contributes: 5, 5
- 48 contributes: 2, 2, 2, 2, 3

We can pair two 5s with two 2s to make 100:
(5 × 2) × (5 × 2) × (2 × 2 × 3) = 10 × 10 × 12 = 100 × 12 = 1200

### Mathematical Structures: Monoids and Groups

The positive integers under multiplication form a **commutative monoid**:
1. **Closed**: Product of two positive integers is a positive integer
2. **Associative**: (a × b) × c = a × (b × c)
3. **Identity**: 1 × a = a × 1 = a
4. **Commutative**: a × b = b × a

The positive rationals under multiplication form an **abelian group**, adding:
5. **Inverse**: Every element a has an inverse 1/a such that a × (1/a) = 1

These structures guarantee that our manipulations are always valid—we can reorder, regroup, and factor without changing results.
    `.trim(),

    deepDiveContent: `
## The Complete Factor Pair Reference

### Essential Factor Pairs to Memorize

These combinations create powers of 10 and should become automatic:

**Creating 10:**
| Factor 1 | Factor 2 | Product |
|----------|----------|---------|
| 2 | 5 | 10 |

**Creating 100:**
| Factor 1 | Factor 2 | Product |
|----------|----------|---------|
| 4 | 25 | 100 |
| 2 | 50 | 100 |
| 5 | 20 | 100 |
| 10 | 10 | 100 |

**Creating 1000:**
| Factor 1 | Factor 2 | Product |
|----------|----------|---------|
| 8 | 125 | 1000 |
| 4 | 250 | 1000 |
| 5 | 200 | 1000 |
| 25 | 40 | 1000 |
| 50 | 20 | 1000 |

**Other Useful Pairs:**
| Factor 1 | Factor 2 | Product |
|----------|----------|---------|
| 12 | 25 | 300 |
| 15 | 20 | 300 |
| 25 | 8 | 200 |
| 25 | 12 | 300 |
| 25 | 16 | 400 |
| 25 | 20 | 500 |

---

## Divisibility Rules in Depth

### Divisibility by 2
**Rule**: A number is divisible by 2 if its last digit is even (0, 2, 4, 6, or 8).
**Why**: In place value, all positions except units contribute multiples of 10, which are always divisible by 2.

### Divisibility by 3
**Rule**: A number is divisible by 3 if the sum of its digits is divisible by 3.
**Why**: 10 ≡ 1 (mod 3), so each digit contributes its face value to the sum.
**Example**: 48 → 4 + 8 = 12 → 1 + 2 = 3 → divisible by 3

### Divisibility by 4
**Rule**: A number is divisible by 4 if its last two digits form a number divisible by 4.
**Why**: 100 is divisible by 4, so only the last two digits matter.
**Example**: 148 → 48 ÷ 4 = 12 → divisible by 4

### Divisibility by 5
**Rule**: A number is divisible by 5 if it ends in 0 or 5.
**Why**: 10 is divisible by 5, so only the units digit matters.

### Divisibility by 8
**Rule**: A number is divisible by 8 if its last three digits form a number divisible by 8.
**Why**: 1000 is divisible by 8, so only the last three digits matter.
**Example**: 3048 → 048 = 48 → 48 ÷ 8 = 6 → divisible by 8

### Divisibility by 9
**Rule**: A number is divisible by 9 if the sum of its digits is divisible by 9.
**Why**: Same reasoning as divisibility by 3.
**Example**: 243 → 2 + 4 + 3 = 9 → divisible by 9

### Divisibility by 25
**Rule**: A number is divisible by 25 if its last two digits are 00, 25, 50, or 75.
**Why**: 100 is divisible by 25 (100 = 4 × 25), and these are the only two-digit multiples of 25.

---

## Pattern Recognition: When to Use Factorization

### Pattern 1: One Number Divisible by 25

When you see a number divisible by 25 (ends in 00, 25, 50, 75), look for a factor of 4 in the other number.

**Example: 25 × 48**
- 25 is divisible by 25
- 48 = 4 × 12 (48 is divisible by 4)
- Regroup: (25 × 4) × 12 = 100 × 12 = **1200**

**Example: 75 × 16**
- 75 = 3 × 25 (contains factor of 25)
- 16 = 4 × 4 (contains factor of 4)
- Regroup: 3 × (25 × 4) × 4 = 3 × 100 × 4 = **1200**

### Pattern 2: One Number Divisible by 5

When you see a number ending in 0 or 5, look for an even factor in the other number.

**Example: 35 × 24**
- 35 = 5 × 7
- 24 = 2 × 12
- Regroup: 7 × (5 × 2) × 12 = 7 × 10 × 12 = 70 × 12 = **840**

**Example: 15 × 24**
- 15 = 5 × 3
- 24 = 2 × 12
- Regroup: 3 × (5 × 2) × 12 = 3 × 10 × 12 = 30 × 12 = **360**

### Pattern 3: One Number is 125 (or Multiple)

Look for factors of 8.

**Example: 125 × 56**
- 125 = 5³
- 56 = 8 × 7 = 2³ × 7
- Regroup: (125 × 8) × 7 = 1000 × 7 = **7000**

**Example: 125 × 72**
- 125 = 5³
- 72 = 8 × 9
- Regroup: (125 × 8) × 9 = 1000 × 9 = **9000**

### Pattern 4: Both Numbers Have Complementary Factors

Sometimes neither number has an obvious factor of 25 or 125, but together they create 10^k.

**Example: 35 × 18**
- 35 = 5 × 7
- 18 = 2 × 9
- Regroup: 7 × (5 × 2) × 9 = 7 × 10 × 9 = 70 × 9 = **630**

---

## Why Certain Factors are "Friendlier"

### Cognitive Load of Different Multiplications

Not all multiplications are equally difficult mentally:

**Easy** (low cognitive load):
- × 2 (just double)
- × 5 (half, then × 10)
- × 10, 100, 1000 (append zeros)
- × 11 (duplicate and add)
- × 9 (× 10, then subtract original)

**Medium**:
- × 3, × 4, × 6
- × 25 (÷ 4, then × 100)
- × 12 (× 10 + × 2)

**Hard**:
- × 7, × 8
- × 13-19 (require decomposition)
- Arbitrary two-digit numbers

The goal of factorization is to replace hard multiplications with easy ones.

### The 25 × 4 = 100 Trick

This is perhaps the most useful factorization trick because:
1. 25 is common (quarter of 100, common in pricing)
2. 4 is common (even numbers often have factor of 4)
3. 100 is trivial to multiply by

**Mental procedure**: When you see 25 × n:
- If n is divisible by 4: n ÷ 4 × 100
- Example: 25 × 48 = 48 ÷ 4 × 100 = 12 × 100 = 1200

### The 125 × 8 = 1000 Trick

Less common but powerful for larger numbers:
- 125 × 8 = 1000
- 125 = 5³, and you need 2³ = 8 to complete 10³ = 1000

**Example**: 125 × 64 = 125 × 8 × 8 = 1000 × 8 = 8000

---

## Advanced Technique: Multi-Step Factorization

Sometimes you need to apply factorization multiple times.

**Example: 75 × 48**

**Method 1** (factor 75):
- 75 = 3 × 25
- 48 = 4 × 12
- 75 × 48 = 3 × 25 × 4 × 12 = 3 × 100 × 12 = 3 × 1200 = **3600**

**Method 2** (factor 48):
- 75 = 25 × 3
- 48 = 4 × 12
- 75 × 48 = 25 × 3 × 4 × 12 = (25 × 4) × (3 × 12) = 100 × 36 = **3600**

Both give the same answer, but method 1 might be easier because 3 × 1200 is simple.

**Example: 35 × 18**

- 35 = 5 × 7
- 18 = 2 × 9
- 35 × 18 = 5 × 7 × 2 × 9 = (5 × 2) × (7 × 9) = 10 × 63 = **630**

---

## Memory Techniques for Common Factorizations

### The "Powers of 2 and 5" Mental Map

| 2^n | 5^n | 10^n |
|-----|-----|------|
| 2 | 5 | 10 |
| 4 | 25 | 100 |
| 8 | 125 | 1000 |
| 16 | 625 | 10000 |
| 32 | 3125 | 100000 |

Key insight: 2^n × 5^n = 10^n

### Fraction Equivalents

Understanding decimal equivalents helps:
- 1/4 = 0.25, so × 25 = × (1/4) × 100
- 1/8 = 0.125, so × 125 = × (1/8) × 1000
- 1/5 = 0.2, so × 5 = × (1/5) × 25 = (÷ 5) × 25

---

## Historical Context: Ancient Factorization

### Babylonian Mathematics

The Babylonians (circa 2000 BCE) used base-60, which has many factors (2, 3, 4, 5, 6, 10, 12, 15, 20, 30). This made factorization natural for them. Their number 60 has 12 divisors compared to 10's mere 4 divisors.

### Egyptian Multiplication

Ancient Egyptians used "doubling and halving" methods that are essentially factorization. To multiply by 35, they would:
- 35 = 32 + 2 + 1 = 2⁵ + 2¹ + 2⁰
- Then add the appropriate doubles

### Medieval "Aliquot Parts"

Medieval merchants memorized "aliquot parts"—proper divisors of numbers. For 100:
- Aliquot parts: 1, 2, 4, 5, 10, 20, 25, 50
- These are exactly the numbers useful for factorization with 100!

---

## Practice Problems with Explanations

### Easy: 25 × 12
- 12 = 4 × 3
- 25 × 12 = 25 × 4 × 3 = 100 × 3 = **300**

### Medium: 35 × 24
- 35 = 5 × 7
- 24 = 2 × 12
- 35 × 24 = 5 × 7 × 2 × 12 = 10 × 7 × 12 = 10 × 84 = **840**

### Hard: 125 × 56
- 56 = 8 × 7
- 125 × 56 = 125 × 8 × 7 = 1000 × 7 = **7000**

### Challenge: 75 × 32
- 75 = 25 × 3
- 32 = 4 × 8
- 75 × 32 = 25 × 3 × 4 × 8 = (25 × 4) × 3 × 8 = 100 × 24 = **2400**

---

## Connection to Other Methods

### Factorization + Distributive

Sometimes you factor partially, then use distributive:

**Example: 35 × 23**
- 35 = 5 × 7
- 23 = 20 + 3
- 35 × 23 = 5 × 7 × (20 + 3) = 35 × 20 + 35 × 3 = 700 + 105 = **805**

Or: 35 × 23 = (5 × 7) × 23 = 5 × (7 × 23) = 5 × 161 = **805**

### Factorization + Near Powers of 10

**Example: 25 × 99**
- 99 = 100 - 1
- 25 × 99 = 25 × (100 - 1) = 2500 - 25 = **2475**

Here we use near-power-of-10 after recognizing that 25 × 100 is easy.

The best mental calculators fluidly combine methods, choosing the approach that minimizes cognitive load for each specific problem.
    `.trim(),

    whenToUse: [
      '**Primary Trigger**: One number is divisible by 25 (ends in 00, 25, 50, 75) and the other has a factor of 4',
      '**Secondary Trigger**: One number is divisible by 5 and the other is even (contains factor of 2)',
      '**Advanced Trigger**: One number is 125 (or multiple) and other is divisible by 8',
      '**Ideal Numbers**: 25×48, 25×36, 35×24, 45×16, 75×32, 125×56',
      '**Good Numbers**: Any pair where 5s and 2s can pair to make 10s (35×18, 15×24)',
      '**Suboptimal Numbers**: Numbers with no common factor structure (37×41)—use distributive instead',
      '**Key Factor Pairs**: 2×5=10, 4×25=100, 8×125=1000, 25×4=100, 50×2=100, 20×5=100'
    ],
    whenNotToUse: [
      'When numbers are prime or have only large factors',
      'When another method is more direct',
      'When the intermediate products are not simpler'
    ],
    commonMistakes: [
      'Choosing factors that do not simplify the calculation',
      'Forgetting which intermediate product you calculated',
      'Incorrect factorization'
    ],
    practiceStrategies: [
      'Memorize useful factorizations for numbers 10-50',
      'Practice instant factor recognition',
      'Drill the halving-doubling technique'
    ],

    prerequisites: [MethodName.Distributive],
    nextMethods: []
  },

  [MethodName.SumToTen]: {
    method: MethodName.SumToTen,
    introduction: `
## Sum to Ten: A Powerful Pattern-Based Shortcut

When two numbers have the same tens digit and their units digits sum to 10, there's a beautiful shortcut. For example, 23 × 27: both have tens digit 2, and 3 + 7 = 10.

The formula: **tens × (tens + 1), then append the product of units**.

For 23 × 27: 2 × 3 = 6, then 3 × 7 = 21, giving us **621**.
    `.trim(),
    mathematicalFoundation: `
### Why It Works

Let the numbers be (10t + u₁) and (10t + u₂) where u₁ + u₂ = 10.

(10t + u₁)(10t + u₂) = 100t² + 10t(u₁ + u₂) + u₁u₂
                     = 100t² + 10t(10) + u₁u₂
                     = 100t² + 100t + u₁u₂
                     = 100t(t + 1) + u₁u₂

This shows the result is t(t+1) in the hundreds position, with u₁u₂ as the units portion.
    `.trim(),
    deepDiveContent: `
### Extensions and Variations

This pattern works for 3-digit numbers too: 123 × 127 = 12 × 13 = 156, then 3 × 7 = 21, so 15621.

The key insight is recognizing the pattern in real-world problems. Mental math champions scan for this pattern before applying other methods.
    `.trim(),
    whenToUse: ['Numbers with same tens digit and units summing to 10'],
    whenNotToUse: ['When units digits do not sum to 10', 'When tens digits differ'],
    commonMistakes: ['Forgetting to multiply tens by (tens + 1)', 'Not checking that units sum to 10'],
    practiceStrategies: ['Practice recognizing sum-to-ten patterns quickly', 'Start with 2-digit numbers before 3-digit'],
    prerequisites: [MethodName.Distributive],
    nextMethods: []
  },

  [MethodName.SquaringEndIn5]: {
    method: MethodName.SquaringEndIn5,
    introduction: `
## Squaring Numbers Ending in 5

Any number ending in 5, when squared, follows a simple pattern: multiply the prefix by (prefix + 1), then append 25.

For 35²: 3 × 4 = 12, append 25 → **1225**.
For 75²: 7 × 8 = 56, append 25 → **5625**.
    `.trim(),
    mathematicalFoundation: `
### Algebraic Proof

Let n = 10a + 5 (a number ending in 5, where a is the prefix).

n² = (10a + 5)² = 100a² + 100a + 25 = 100a(a + 1) + 25

This shows the result is a(a+1) × 100, plus 25 at the end.
    `.trim(),
    deepDiveContent: `
### Speed and Efficiency

This method is extremely fast—just one multiplication followed by appending 25. It's one of the first shortcuts mental math practitioners memorize because of its reliability and speed.
    `.trim(),
    whenToUse: ['Any number ending in 5 being squared'],
    whenNotToUse: ['When multiplying different numbers', 'When the number does not end in 5'],
    commonMistakes: ['Forgetting to add 1 to the prefix', 'Not appending 25'],
    practiceStrategies: ['Drill until automatic', 'Extend to 3-digit numbers'],
    prerequisites: [],
    nextMethods: [MethodName.Squaring]
  },

  [MethodName.MultiplyBy111]: {
    method: MethodName.MultiplyBy111,
    introduction: `
## Multiply by 111: The Triple Pattern

Multiplying by 111 creates a beautiful repeating pattern. For single digits, it's simple: 7 × 111 = 777.

For two-digit numbers, add adjacent digits with carries: 23 × 111 = 2553.
    `.trim(),
    mathematicalFoundation: `
### Why 111 Works

111 = 100 + 10 + 1, so n × 111 = n × 100 + n × 10 + n = n00 + n0 + n.

For 23: 2300 + 230 + 23 = 2553.

The digit pattern emerges from overlapping additions at each place value.
    `.trim(),
    deepDiveContent: `
### Extending to Larger Numbers

The pattern extends to 3-digit numbers too, though carries become more complex. The key is adding adjacent digits systematically from right to left.
    `.trim(),
    whenToUse: ['When one factor is 111'],
    whenNotToUse: ['When neither number is 111 or close to it'],
    commonMistakes: ['Missing carries when digits sum to 10 or more'],
    practiceStrategies: ['Start with single digits', 'Practice carrying'],
    prerequisites: [MethodName.Distributive],
    nextMethods: []
  },

  [MethodName.NearSquares]: {
    method: MethodName.NearSquares,
    introduction: `
## Near Squares: Leveraging Perfect Squares

When you need to calculate n × (n + k) where k is small, use the identity:
n × (n + k) = n² + kn

For 20 × 22: 20² + 2×20 = 400 + 40 = **440**.
    `.trim(),
    mathematicalFoundation: `
### The Identity

n × (n + k) = n² + kn

This is simply the distributive property: n(n + k) = n·n + n·k = n² + kn.

It's efficient when you know n² and kn is easy to calculate.
    `.trim(),
    deepDiveContent: `
### Choosing When to Use

This method shines when:
1. n² is a known perfect square (or easily calculated)
2. k is small (1, 2, 3, 4, 5)
3. kn is a round number or easy to compute
    `.trim(),
    whenToUse: ['Numbers close to perfect squares', 'When one factor is n and other is n+k with small k'],
    whenNotToUse: ['When numbers are far apart', 'When neither is near a perfect square'],
    commonMistakes: ['Miscalculating n²', 'Forgetting to add kn'],
    practiceStrategies: ['Memorize perfect squares to 20', 'Practice n² + kn mentally'],
    prerequisites: [MethodName.Squaring],
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
  [MethodName.Squaring]: [[35, 35], [47, 47], [85, 85]],
  [MethodName.Near100]: [[97, 94], [103, 98], [88, 92]],
  [MethodName.Factorization]: [[25, 48], [35, 24], [125, 56]],
  [MethodName.SumToTen]: [[23, 27], [34, 36], [68, 62]],
  [MethodName.SquaringEndIn5]: [[25, 25], [35, 35], [75, 75]],
  [MethodName.MultiplyBy111]: [[111, 23], [45, 111], [111, 67]],
  [MethodName.NearSquares]: [[20, 22], [49, 51], [30, 32]]
};

/**
 * Pedagogical notes for each method's examples.
 */
const PEDAGOGICAL_NOTES: Record<MethodName, string[]> = {
  [MethodName.Distributive]: [
    'Step 1: Recognize the structure of the first number. Look at place values: 23 = 20 + 3, or consider if it is near a round number: 47 is close to 50.',
    'Step 2: Choose your decomposition strategy. Place-value (47 = 40 + 7) is the default; subtractive (47 = 50 - 3) works when the number is close to a round value.',
    'Step 3: Apply the distributive property: (a + b) × c = a × c + b × c. Write out both partial products before calculating.',
    'Step 4: Compute the first partial product. For 40 × 53, think: 4 × 53 = 212, then append one zero to get 2120.',
    'Step 5: Compute the second partial product. For 7 × 53, you can use another decomposition: 7 × 50 + 7 × 3 = 350 + 21 = 371.',
    'Step 6: Add the partial products: 2120 + 371 = 2491. Verify the addition is correct—this is where many errors occur.',
    'Key insight: Breaking one difficult multiplication into two simpler ones reduces cognitive load, even though you do more operations.',
    'Verification: Your answer should be close to a rough estimate. 47 × 53 is about 50 × 50 = 2500, so 2491 is reasonable.'
  ],
  [MethodName.DifferenceSquares]: [
    'Step 1: Recognize the pattern. When you see two numbers, immediately compute their average: (47 + 53) / 2 = 50.',
    'Step 2: Check if this average is a "nice" number (multiple of 10, or easy to square). If yes, this method will work well.',
    'Step 3: Verify symmetry. Both numbers must be the same distance from the midpoint: 47 is 3 below 50, 53 is 3 above 50. Perfect.',
    'Step 4: Apply the formula: midpoint² - deviation² = 50² - 3² = 2500 - 9.',
    'Step 5: Square the midpoint. For round numbers this is trivial: 50² = 2500. Have common squares memorized.',
    'Step 6: Square the deviation. For small deviations, this is easy: 3² = 9. Single-digit squares should be instant recall.',
    'Step 7: Subtract: 2500 - 9 = 2491. This final subtraction is usually simple because the deviation squared is small.',
    'Key insight: This method wins when the midpoint is round and the deviation is small—only two squares and one subtraction.',
    'Verification: Your answer must be LESS than midpoint² (since we subtract). If 47 × 53 > 2500, something is wrong.'
  ],
  [MethodName.NearPower10]: [
    'Step 1: Identify which number is close to a power of 10 (10, 100, 1000, etc.).',
    'Step 2: Express that number as power_of_10 ± small_offset. For 98, write (100 - 2). For 102, write (100 + 2).',
    'Step 3: Apply the distributive property: (100 ± offset) × other = 100 × other ± offset × other.',
    'Step 4: The multiplication by power of 10 is trivial—just append zeros! 100 × 47 = 4700.',
    'Step 5: Compute the small correction: offset × other. This should be easier than the original problem.',
    'Step 6: Add or subtract the correction based on whether the offset was positive or negative.',
    'Verification: Your answer should be close to the power-of-10 product. If it is far off, check your work.'
  ],
  [MethodName.Squaring]: [
    'Step 1: Check if the number ends in 5. If so, use the special shortcut: multiply the digits before 5 by (themselves + 1), then append 25.',
    'Step 2: For other numbers, decompose into tens (a) and ones (b). For 47, this is 40 + 7.',
    'Step 3: Apply the binomial formula: (a+b)² = a² + 2ab + b². You will compute three separate terms.',
    'Step 4: Calculate a² (the tens squared). For 40², this is 1600. Just square 4 and append two zeros.',
    'Step 5: Calculate 2ab (the cross term, doubled). For 2×40×7 = 560. Double the product of tens digit and ones digit, then append one zero.',
    'Step 6: Calculate b² (the ones squared). For 7², this is 49. You should have this memorized.',
    'Step 7: Add all three terms: a² + 2ab + b². For 47²: 1600 + 560 + 49 = 2209.',
    'Alternative: Use difference of squares if it simplifies things. For 47², you could do 44×50 + 9 = 2200 + 9 = 2209.'
  ],
  [MethodName.Near100]: [
    'Step 1: Verify both numbers are close to 100 (within ±20 is ideal).',
    'Step 2: Calculate each number\'s deficit from 100. For numbers above 100, the deficit is negative.',
    'Step 3: Cross-subtract: Take either number and subtract the other\'s deficit. Both ways give the same base!',
    'Step 4: Multiply the deficits together. This is the adjustment term.',
    'Step 5: Handle signs carefully—if one number is above 100 and one below, the adjustment may be negative.',
    'Step 6: Combine: base × 100 + adjustment. If adjustment is 2 digits, just concatenate; if 3 digits, carry the extra.',
    'Verification: Result should be close to 10,000 (since 100 × 100 = 10,000). Any answer far from this signals an error.'
  ],
  [MethodName.Factorization]: [
    'Step 1: Scan both numbers for "friendly" factors. Look for: 25, 50, 125 (powers of 5) and 2, 4, 8 (powers of 2).',
    'Step 2: Use divisibility rules to quickly identify factors. Check if numbers end in 0 or 5 (divisible by 5), are even (divisible by 2), or have last two digits divisible by 4.',
    'Step 3: Identify factor pairs that make powers of 10. Key pairs: 2×5=10, 4×25=100, 8×125=1000.',
    'Step 4: Factor one or both numbers to expose the useful factors. For 48, write as 4×12 to expose the factor of 4.',
    'Step 5: Regroup factors to create the power of 10. For 25×48 = 25×(4×12), regroup as (25×4)×12 = 100×12.',
    'Step 6: Multiply by the power of 10 (trivial—just append zeros), then multiply by the remaining factor.',
    'Step 7: For 100×12 = 1200. The original 25×48 is now solved with minimal mental effort.',
    'Verification: Your answer should be reasonable. For 25×48, estimate: 25×50=1250, so 1200 makes sense.'
  ],
  [MethodName.SumToTen]: [
    'Step 1: Verify the pattern: same tens digit, units sum to 10.',
    'Step 2: Multiply tens digit by (tens digit + 1).',
    'Step 3: Multiply the units digits together.',
    'Step 4: Combine: hundreds from step 2, units from step 3.'
  ],
  [MethodName.SquaringEndIn5]: [
    'Step 1: Identify the prefix (digits before the 5).',
    'Step 2: Multiply prefix by (prefix + 1).',
    'Step 3: Append 25 to get the final answer.'
  ],
  [MethodName.MultiplyBy111]: [
    'Step 1: Think of 111 as 100 + 10 + 1.',
    'Step 2: For single digits, result is the digit repeated three times.',
    'Step 3: For multi-digit numbers, add adjacent digits with carries.'
  ],
  [MethodName.NearSquares]: [
    'Step 1: Identify the base number n and the offset k.',
    'Step 2: Calculate n² (should be memorized or easy to compute).',
    'Step 3: Add k × n to get the final answer.'
  ]
};

/**
 * Common mistakes for each method.
 */
const COMMON_MISTAKES: Record<MethodName, string[]> = {
  [MethodName.Distributive]: [
    'Forgetting to add all partial products. After computing 40 × 53 and 7 × 53, you MUST add them together.',
    'Making arithmetic errors in the sub-multiplications. Double-check: 4 × 53 = 212, so 40 × 53 = 2120 (not 212).',
    'Forgetting to append zeros when multiplying by multiples of 10. 40 × 53 = 4 × 53 × 10 = 2120, not 212.',
    'Using additive partition when subtractive would be simpler. For 89 × 12, try (90 - 1) × 12 instead of (80 + 9) × 12.',
    'Breaking down the wrong number. Choose the number that decomposes most cleanly for the given problem.',
    'Addition errors when combining partial products. 2120 + 371 requires careful mental tracking; consider adding hundreds first.',
    'Not verifying reasonableness. Your answer should be close to a rough estimate (e.g., 47 × 53 is roughly 50 × 50 = 2500).',
    'Decomposing into awkward parts. 47 = 40 + 7 is better than 47 = 30 + 17 because 40 and 7 are easier to multiply.'
  ],
  [MethodName.DifferenceSquares]: [
    'Calculating the midpoint incorrectly. For 47 × 53, midpoint = (47 + 53) / 2 = 50, NOT 49 or 51.',
    'Using the full gap instead of the half-gap as deviation. The gap is 6, but deviation = gap / 2 = 3.',
    'Forgetting that both numbers must be equidistant from midpoint. If they are not equal distances, this method does not apply directly.',
    'Adding the deviation squared instead of subtracting. The formula is ALWAYS midpoint² - deviation², never +.',
    'Squaring errors. Make sure 3² = 9, not 6. Have single-digit squares memorized perfectly.',
    'Using this method when the midpoint is awkward. If 47 × 52, midpoint = 49.5, which is not ideal for mental squaring.',
    'Not recognizing when numbers are symmetric. Practice spotting pairs like 38+42=80 (midpoint 40) quickly.',
    'Subtraction errors at the end. 2500 - 9 = 2491, not 2509 or 2490. Take care with borrowing when needed.',
    'Confusing this with other methods. Difference of squares requires symmetry around a midpoint; Near-100 has different criteria.'
  ],
  [MethodName.NearPower10]: [
    'Choosing the wrong power of 10. For 98, use 100; for 997, use 1000. Pick the closest power.',
    'Getting the sign wrong: If the number is BELOW the power (98 < 100), you SUBTRACT the correction. If ABOVE (102 > 100), you ADD.',
    'Forgetting to multiply the offset by the OTHER number. The correction is offset × other, not just the offset.',
    'Miscounting zeros when multiplying by powers of 10. Double-check: 100 × 47 = 4700 (two zeros).',
    'Making arithmetic errors in the offset multiplication. Take your time with 2 × 47 = 94.',
    'Subtracting when the correction is larger than the last digits (e.g., 4700 - 94 requires borrowing to get 4606).',
    'Using this method when both numbers are near 100—the Near-100 method would be more efficient.'
  ],
  [MethodName.Squaring]: [
    'Forgetting the 2ab term. The formula is (a+b)² = a² + **2**ab + b². The middle term must be DOUBLED. This is the most common error.',
    'Forgetting to double the cross term. Remember: 2ab, not ab. If you compute a×b, you must multiply by 2.',
    'Squaring the wrong digit values. For 47, you need 40² (not 4²) and 7² (not 70²).',
    'Adding instead of appending zeros. 40² = 1600, not 160. The square of 40 is 4² with two zeros appended = 1600.',
    'Miscounting zeros in the middle term. For 2×40×7 = 2×280 = 560, make sure you append the right number of zeros.',
    'Using addition shortcut incorrectly for numbers ending in 5. Remember: n5² = n×(n+1) followed by 25, not n² followed by 25.',
    'Arithmetic errors in single-digit squares. Make sure you have 1-9 squares memorized perfectly.',
    'Forgetting to verify. Quick check: for 47², the answer should be close to 50² = 2500 but smaller. 2209 is reasonable.'
  ],
  [MethodName.Near100]: [
    'Confusing deficits (below 100) with surpluses (above 100). Below 100 = positive deficit; above 100 = negative deficit.',
    'Getting the sign wrong when mixing numbers above and below 100. Remember: (-3) × (+4) = -12.',
    'Forgetting to treat the adjustment as a two-digit number. For 97 × 94: adjustment is 18, not 8.',
    'Not carrying when the adjustment exceeds 99. For 88 × 85: adjustment is 12 × 15 = 180, which requires a carry.',
    'Cross-subtracting incorrectly. Double-check: 97 - 6 should equal 94 - 3, both give 91.',
    'Forgetting to verify the result is close to 10,000. If your answer is 918 instead of 9118, you dropped a digit.',
    'Using this method when only ONE number is near 100—use Near Powers of 10 instead.',
    'Mixing up which deficit belongs to which number during cross-subtraction.'
  ],
  [MethodName.Factorization]: [
    'Choosing factors that do not simplify the problem. Not all factorizations are helpful. Aim for factor pairs that create 10, 100, or 1000.',
    'Not recognizing useful factor pairs. Memorize: 2×5=10, 4×25=100, 8×125=1000. These are the "magic" combinations.',
    'Failing to check divisibility. Before factoring, verify that your assumed factor actually divides evenly. 48÷4=12 (good), but 50÷4=12.5 (bad).',
    'Factoring the wrong number. Sometimes the other number has the friendly factor. Check both numbers for 25, 50, 125, etc.',
    'Making arithmetic errors when regrouping. After regrouping, verify that your factors still multiply to the original numbers.',
    'Forgetting leftover factors. If 48 = 4×12, and you use the 4, you must still multiply by 12 at the end.',
    'Overcomplicating the factorization. Sometimes one simple split is enough. For 25×48, you only need 48=4×12.',
    'Missing complementary factors. For 35×18, both numbers contribute to the 10: 35=5×7 and 18=2×9, so (5×2)×7×9 = 10×63 = 630.',
    'Using factorization when another method is faster. For 25×99, the near-power-of-10 method (25×100-25=2475) beats factorization.'
  ],
  [MethodName.SumToTen]: [
    'Not verifying that units sum to exactly 10.',
    'Forgetting to multiply tens by (tens + 1), not just squaring.',
    'Wrong combination of the two parts in the final answer.'
  ],
  [MethodName.SquaringEndIn5]: [
    'Forgetting to add 1 to the prefix before multiplying.',
    'Appending 5 instead of 25.',
    'Applying to numbers that do not end in 5.'
  ],
  [MethodName.MultiplyBy111]: [
    'Missing carries when adjacent digits sum to 10 or more.',
    'Applying to the wrong number.',
    'Forgetting middle digit additions for 2+ digit numbers.'
  ],
  [MethodName.NearSquares]: [
    'Miscalculating n² (the base square).',
    'Forgetting to add k×n to the square.',
    'Using this method when k is too large to be efficient.'
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
  ],
  [MethodName.SumToTen]: [
    { nums: [23, 27], difficulty: 'easy' },
    { nums: [34, 36], difficulty: 'medium' },
    { nums: [68, 62], difficulty: 'hard' }
  ],
  [MethodName.SquaringEndIn5]: [
    { nums: [15, 15], difficulty: 'easy' },
    { nums: [35, 35], difficulty: 'medium' },
    { nums: [95, 95], difficulty: 'hard' }
  ],
  [MethodName.MultiplyBy111]: [
    { nums: [111, 5], difficulty: 'easy' },
    { nums: [111, 23], difficulty: 'medium' },
    { nums: [111, 67], difficulty: 'hard' }
  ],
  [MethodName.NearSquares]: [
    { nums: [10, 12], difficulty: 'easy' },
    { nums: [20, 22], difficulty: 'medium' },
    { nums: [49, 51], difficulty: 'hard' }
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
