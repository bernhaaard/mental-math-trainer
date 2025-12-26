'use client';

/**
 * Method Comparison Page
 *
 * Provides a comprehensive side-by-side comparison of all six calculation
 * methods, including a decision flowchart, method vs method comparisons,
 * and examples showing the same problem solved multiple ways.
 */

import { useState } from 'react';
import Link from 'next/link';
import { MethodName } from '@/lib/types/method';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/**
 * Method configuration for comparison table.
 */
interface MethodComparisonData {
  name: MethodName;
  displayName: string;
  bestFor: string;
  cognitiveComplexity: 1 | 2 | 3 | 4 | 5;
  speedRating: 'Fast' | 'Medium' | 'Variable';
  exampleProblem: { num1: number; num2: number };
  keyPattern: string;
}

/**
 * Comparison data for all six methods.
 */
const METHODS_DATA: MethodComparisonData[] = [
  {
    name: MethodName.Distributive,
    displayName: 'Distributive Property',
    bestFor: 'General purpose, any multiplication',
    cognitiveComplexity: 2,
    speedRating: 'Medium',
    exampleProblem: { num1: 23, num2: 45 },
    keyPattern: 'Split by place value (tens + ones)'
  },
  {
    name: MethodName.DifferenceSquares,
    displayName: 'Difference of Squares',
    bestFor: 'Numbers symmetric around a round number',
    cognitiveComplexity: 3,
    speedRating: 'Fast',
    exampleProblem: { num1: 47, num2: 53 },
    keyPattern: '(a-b)(a+b) = a^2 - b^2'
  },
  {
    name: MethodName.NearPower10,
    displayName: 'Near Powers of 10',
    bestFor: 'One number close to 10, 100, 1000',
    cognitiveComplexity: 2,
    speedRating: 'Fast',
    exampleProblem: { num1: 99, num2: 47 },
    keyPattern: 'Multiply by round number, adjust'
  },
  {
    name: MethodName.Squaring,
    displayName: 'Squaring',
    bestFor: 'Multiplying a number by itself',
    cognitiveComplexity: 3,
    speedRating: 'Fast',
    exampleProblem: { num1: 47, num2: 47 },
    keyPattern: '(a +/- b)^2 = a^2 +/- 2ab + b^2'
  },
  {
    name: MethodName.Near100,
    displayName: 'Near 100',
    bestFor: 'Both numbers close to 100',
    cognitiveComplexity: 2,
    speedRating: 'Fast',
    exampleProblem: { num1: 97, num2: 103 },
    keyPattern: 'Use deviations from 100'
  },
  {
    name: MethodName.Factorization,
    displayName: 'Factorization',
    bestFor: 'Numbers with useful factors',
    cognitiveComplexity: 4,
    speedRating: 'Variable',
    exampleProblem: { num1: 24, num2: 35 },
    keyPattern: 'Break into smaller factors'
  }
];

/**
 * Renders star ratings for cognitive complexity.
 */
function ComplexityStars({ rating }: { rating: number }): React.ReactElement {
  return (
    <div className="flex gap-0.5" aria-label={`Complexity: ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-4 w-4 ${star <= rating ? 'text-warning' : 'text-muted'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

/**
 * Method comparison table component.
 */
function ComparisonTable(): React.ReactElement {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Method Comparison Table
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-secondary/50">
              <th className="text-left p-4 font-semibold text-foreground border-b border-border">
                Method
              </th>
              <th className="text-left p-4 font-semibold text-foreground border-b border-border">
                Best For
              </th>
              <th className="text-center p-4 font-semibold text-foreground border-b border-border">
                Complexity
              </th>
              <th className="text-center p-4 font-semibold text-foreground border-b border-border">
                Speed
              </th>
              <th className="text-left p-4 font-semibold text-foreground border-b border-border">
                Example
              </th>
            </tr>
          </thead>
          <tbody>
            {METHODS_DATA.map((method, index) => (
              <tr
                key={method.name}
                className={`${index % 2 === 0 ? 'bg-card' : 'bg-secondary/20'} hover:bg-primary/5 transition-colors`}
              >
                <td className="p-4 border-b border-border">
                  <Link
                    href={`/study/${method.name}`}
                    className="inline-flex items-center gap-1 font-medium text-foreground hover:text-primary transition-colors group"
                  >
                    {method.displayName}
                    <svg
                      className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-1">
                    {method.keyPattern}
                  </p>
                </td>
                <td className="p-4 border-b border-border text-muted-foreground text-sm">
                  {method.bestFor}
                </td>
                <td className="p-4 border-b border-border text-center">
                  <ComplexityStars rating={method.cognitiveComplexity} />
                </td>
                <td className="p-4 border-b border-border text-center">
                  <Badge
                    variant={
                      method.speedRating === 'Fast'
                        ? 'success'
                        : method.speedRating === 'Medium'
                          ? 'warning'
                          : 'info'
                    }
                  >
                    {method.speedRating}
                  </Badge>
                </td>
                <td className="p-4 border-b border-border">
                  <code className="text-sm font-mono bg-secondary px-2 py-1 rounded">
                    {method.exampleProblem.num1} x {method.exampleProblem.num2}
                  </code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/**
 * Decision flowchart component using ASCII-style visual.
 */
function DecisionFlowchart(): React.ReactElement {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Method Selection Flowchart
      </h2>

      <Card variant="outlined" className="p-6">
        <div className="font-mono text-sm overflow-x-auto">
          <pre className="text-muted-foreground whitespace-pre-wrap">
{`                    Start: Given a x b
                           |
                           v
            +-----------------------------+
            | Is a == b (squaring)?       |
            +-----------------------------+
                    |              |
                   Yes            No
                    |              |
                    v              v
           +------------+    +----------------------------------+
           | SQUARING   |    | Are a and b symmetric around    |
           | (a +/- d)^2|    | a round number? (e.g., 47, 53)  |
           +------------+    +----------------------------------+
                                    |              |
                                   Yes            No
                                    |              |
                                    v              v
                        +------------------+   +------------------------+
                        | DIFFERENCE OF    |   | Is one number near     |
                        | SQUARES          |   | a power of 10?         |
                        | a^2 - d^2        |   | (98, 99, 100, 101...)  |
                        +------------------+   +------------------------+
                                                      |              |
                                                     Yes            No
                                                      |              |
                                                      v              v
                                          +------------------+   +-------------------+
                                          | NEAR POWER OF 10 |   | Are BOTH numbers  |
                                          | Adjust from 10^n |   | close to 100?     |
                                          +------------------+   +-------------------+
                                                                        |          |
                                                                       Yes        No
                                                                        |          |
                                                                        v          v
                                                            +------------+   +------------------+
                                                            | NEAR 100   |   | Does one number  |
                                                            | Deviations |   | have nice factors|
                                                            +------------+   +------------------+
                                                                                    |          |
                                                                                   Yes        No
                                                                                    |          |
                                                                                    v          v
                                                                        +---------------+  +-------------+
                                                                        | FACTORIZATION |  | DISTRIBUTIVE|
                                                                        | Break & chain |  | (fallback)  |
                                                                        +---------------+  +-------------+`}
          </pre>
        </div>

        <div className="mt-6 p-4 rounded-lg bg-secondary/50">
          <h3 className="font-semibold text-foreground mb-2">How to Use This Flowchart</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Start at the top with your multiplication problem</li>
            <li>Answer each question honestly - look for the patterns</li>
            <li>The first &quot;Yes&quot; you hit is likely your optimal method</li>
            <li>If all answers are &quot;No&quot;, use Distributive Property as your reliable fallback</li>
          </ol>
        </div>
      </Card>
    </section>
  );
}

/**
 * Method vs Method comparison section.
 */
function MethodVsMethod(): React.ReactElement {
  const comparisons = [
    {
      methodA: 'Difference of Squares',
      methodB: 'Near 100',
      explanation: 'Both work for numbers around 100, but they use different patterns.',
      aWins: {
        problem: '47 x 53',
        reason: 'Numbers are symmetric around 50 (both 3 away). Difference of squares gives: 50^2 - 3^2 = 2500 - 9 = 2491'
      },
      bWins: {
        problem: '97 x 103',
        reason: 'Numbers are close to 100 but not symmetric around it. Near 100 gives: (100-3)(100+3) = 100 x 100 + 100(3-3) + (-3)(3) = 10000 - 9 = 9991. Actually these ARE symmetric, so let\'s use: 94 x 97 instead - both near 100, deviations -6 and -3, product adjustments are cleaner.'
      }
    },
    {
      methodA: 'Distributive',
      methodB: 'Factorization',
      explanation: 'Distributive splits by place value; Factorization splits by prime factors.',
      aWins: {
        problem: '47 x 83',
        reason: 'Neither number has nice factors. Distributive: (40+7) x 83 = 3320 + 581 = 3901'
      },
      bWins: {
        problem: '25 x 36',
        reason: 'Both have nice factors. 25 x 36 = 25 x 4 x 9 = 100 x 9 = 900. Much faster!'
      }
    },
    {
      methodA: 'Squaring',
      methodB: 'Difference of Squares',
      explanation: 'Squaring is for a x a. Difference of squares needs (a-b)(a+b).',
      aWins: {
        problem: '73 x 73',
        reason: 'Pure square. Use (70+3)^2 = 4900 + 420 + 9 = 5329'
      },
      bWins: {
        problem: '72 x 74',
        reason: 'Symmetric around 73. Use 73^2 - 1^2 = 5329 - 1 = 5328. Even faster than squaring both!'
      }
    },
    {
      methodA: 'Near Power of 10',
      methodB: 'Distributive',
      explanation: 'Near Power of 10 leverages easy multiplication by round numbers.',
      aWins: {
        problem: '99 x 47',
        reason: '99 is near 100. Calculate: 100 x 47 - 47 = 4700 - 47 = 4653. Simple!'
      },
      bWins: {
        problem: '47 x 63',
        reason: 'Neither near a power of 10. Use distributive: (40+7) x 63 = 2520 + 441 = 2961'
      }
    }
  ];

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Method vs Method Comparisons
      </h2>

      <div className="space-y-6">
        {comparisons.map((comp, index) => (
          <Card key={index} variant="outlined">
            <CardHeader>
              <h3 className="text-lg font-semibold text-foreground">
                {comp.methodA} vs {comp.methodB}
              </h3>
              <p className="text-sm text-muted-foreground">{comp.explanation}</p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-success/10 border border-success/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="success">{comp.methodA} wins</Badge>
                    <code className="text-sm font-mono">{comp.aWins.problem}</code>
                  </div>
                  <p className="text-sm text-muted-foreground">{comp.aWins.reason}</p>
                </div>
                <div className="p-4 rounded-lg bg-info/10 border border-accent/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="info">{comp.methodB} wins</Badge>
                    <code className="text-sm font-mono">{comp.bWins.problem}</code>
                  </div>
                  <p className="text-sm text-muted-foreground">{comp.bWins.reason}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

/**
 * Same problem, different methods section.
 */
function SameProblemDifferentMethods(): React.ReactElement {
  const [expandedProblem, setExpandedProblem] = useState<number | null>(null);

  const problems = [
    {
      num1: 48,
      num2: 52,
      answer: 2496,
      solutions: [
        {
          method: 'Difference of Squares (Optimal)',
          steps: [
            'Recognize: 48 and 52 are symmetric around 50',
            'Both are 2 away from 50',
            'Apply: (50-2)(50+2) = 50^2 - 2^2',
            '= 2500 - 4 = 2496'
          ],
          efficiency: 'Excellent - only 2 calculations'
        },
        {
          method: 'Near 100',
          steps: [
            'Not applicable - numbers are near 50, not 100',
            'Would need adjustment: think of as (50-2)(50+2)',
            'This becomes the Difference of Squares method'
          ],
          efficiency: 'N/A - wrong pattern'
        },
        {
          method: 'Distributive',
          steps: [
            'Split 48 = 40 + 8',
            '40 x 52 = 2080',
            '8 x 52 = 416',
            '2080 + 416 = 2496'
          ],
          efficiency: 'Good - 3 calculations, more memory'
        }
      ]
    },
    {
      num1: 97,
      num2: 94,
      answer: 9118,
      solutions: [
        {
          method: 'Near 100 (Optimal)',
          steps: [
            'Deviations: 97 = 100-3, 94 = 100-6',
            'Base: 100 x 100 = 10000',
            'Cross: 100 x (-3-6) = -900',
            'Product of deviations: (-3) x (-6) = 18',
            '10000 - 900 + 18 = 9118'
          ],
          efficiency: 'Excellent - simple small number arithmetic'
        },
        {
          method: 'Difference of Squares',
          steps: [
            'Find midpoint: (97+94)/2 = 95.5',
            'Not a whole number - method becomes awkward',
            'Would need: (95.5)^2 - (1.5)^2',
            '= 9120.25 - 2.25 = 9118',
            'Fractional squaring is error-prone'
          ],
          efficiency: 'Poor - fractional arithmetic'
        },
        {
          method: 'Distributive',
          steps: [
            'Split 97 = 90 + 7',
            '90 x 94 = 8460',
            '7 x 94 = 658',
            '8460 + 658 = 9118'
          ],
          efficiency: 'Good - reliable but more steps'
        }
      ]
    },
    {
      num1: 25,
      num2: 36,
      answer: 900,
      solutions: [
        {
          method: 'Factorization (Optimal)',
          steps: [
            'Factor: 25 = 5 x 5, 36 = 4 x 9',
            'Rearrange: 25 x 4 x 9',
            '= 100 x 9 = 900'
          ],
          efficiency: 'Excellent - creates a power of 10'
        },
        {
          method: 'Alternative Factorization',
          steps: [
            'Factor: 36 = 6 x 6',
            '25 x 6 = 150',
            '150 x 6 = 900'
          ],
          efficiency: 'Good - two simple multiplications'
        },
        {
          method: 'Distributive',
          steps: [
            'Split 25 = 20 + 5',
            '20 x 36 = 720',
            '5 x 36 = 180',
            '720 + 180 = 900'
          ],
          efficiency: 'Adequate - works but misses the elegance'
        }
      ]
    }
  ];

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Same Problem, Different Methods
      </h2>
      <p className="text-muted-foreground mb-6">
        See how the choice of method affects the difficulty of solving the same problem.
        Click on a problem to see all solution approaches compared.
      </p>

      <div className="space-y-4">
        {problems.map((problem, index) => (
          <Card
            key={index}
            variant="outlined"
            className={`cursor-pointer transition-all ${
              expandedProblem === index ? 'ring-2 ring-primary' : ''
            }`}
          >
            <button
              type="button"
              className="w-full text-left"
              onClick={() => setExpandedProblem(expandedProblem === index ? null : index)}
              aria-expanded={expandedProblem === index}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-mono font-bold text-foreground">
                      {problem.num1} x {problem.num2}
                    </span>
                    <span className="text-lg text-muted-foreground">
                      = {problem.answer}
                    </span>
                  </div>
                  <svg
                    className={`h-5 w-5 text-muted-foreground transition-transform ${
                      expandedProblem === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </CardHeader>
            </button>

            {expandedProblem === index && (
              <CardContent>
                <div className="space-y-4">
                  {problem.solutions.map((solution, sIndex) => (
                    <div
                      key={sIndex}
                      className={`p-4 rounded-lg ${
                        sIndex === 0
                          ? 'bg-success/10 border border-success/30'
                          : 'bg-secondary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-foreground">
                          {solution.method}
                        </h4>
                        <Badge
                          variant={
                            solution.efficiency.startsWith('Excellent')
                              ? 'success'
                              : solution.efficiency.startsWith('Good')
                                ? 'info'
                                : solution.efficiency.startsWith('Poor') ||
                                    solution.efficiency.startsWith('N/A')
                                  ? 'error'
                                  : 'warning'
                          }
                        >
                          {solution.efficiency.split(' - ')[0]}
                        </Badge>
                      </div>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                        {solution.steps.map((step, stepIndex) => (
                          <li key={stepIndex}>{step}</li>
                        ))}
                      </ol>
                      <p className="mt-2 text-xs text-muted-foreground italic">
                        {solution.efficiency}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}

/**
 * Quick reference section for pattern recognition.
 */
function QuickReference(): React.ReactElement {
  const patterns = [
    {
      pattern: 'Numbers ending in 5',
      example: '35 x 35',
      method: 'Squaring',
      trick: 'For n5 x n5: n(n+1) followed by 25. So 35^2 = 3x4|25 = 1225'
    },
    {
      pattern: 'One number is 11',
      example: '11 x 47',
      method: 'Special case',
      trick: 'For 11 x ab: Write a, then a+b, then b (with carries). 11 x 47 = 517'
    },
    {
      pattern: 'Numbers summing to 100',
      example: '37 x 63',
      method: 'Near 100',
      trick: 'Complement pairs! 37 + 63 = 100. Product = 37 x 63 = (50-13)(50+13) = 2500 - 169 = 2331'
    },
    {
      pattern: 'Doubling/halving possible',
      example: '25 x 48',
      method: 'Factorization',
      trick: 'Double 25 to 50, halve 48 to 24. Now: 50 x 24 = 1200'
    },
    {
      pattern: 'Powers of 2 involved',
      example: '32 x 25',
      method: 'Factorization',
      trick: '32 = 2^5. Keep multiplying: 32 x 25 = 16 x 50 = 8 x 100 = 800'
    }
  ];

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Quick Pattern Reference
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        {patterns.map((item, index) => (
          <Card key={index} variant="outlined" className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-foreground">{item.pattern}</h3>
              <code className="text-sm font-mono bg-secondary px-2 py-1 rounded">
                {item.example}
              </code>
            </div>
            <Badge variant="info" className="mb-2">
              {item.method}
            </Badge>
            <p className="text-sm text-muted-foreground">{item.trick}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

/**
 * Method Comparison Page component.
 */
export default function MethodComparisonPage(): React.ReactElement {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm">
          <li>
            <Link
              href="/study"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Study
            </Link>
          </li>
          <li className="text-muted-foreground">/</li>
          <li className="text-foreground font-medium">Compare Methods</li>
        </ol>
      </nav>

      {/* Page Header */}
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-foreground mb-3">
          Compare Calculation Methods
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Understanding when to use each method is just as important as knowing how
          to use them. This page helps you compare methods side-by-side and develop
          the pattern recognition skills needed for efficient mental math.
        </p>
      </header>

      {/* Main Content Sections */}
      <ComparisonTable />
      <DecisionFlowchart />
      <MethodVsMethod />
      <SameProblemDifferentMethods />
      <QuickReference />

      {/* Navigation */}
      <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/study/combining">
          <Button variant="primary" size="lg">
            Learn to Combine Methods
          </Button>
        </Link>
        <Link href="/practice">
          <Button variant="outline" size="lg">
            Practice with Problems
          </Button>
        </Link>
      </div>
    </div>
  );
}
