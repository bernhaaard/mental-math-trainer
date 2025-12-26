'use client';

/**
 * Combining Techniques Page
 *
 * Teaches advanced strategies for combining multiple calculation methods
 * to solve complex multiplication problems. Includes recognition patterns,
 * common combinations, worked examples, and practice exercises.
 */

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/**
 * Worked example with step-by-step solution.
 */
interface WorkedExample {
  num1: number;
  num2: number;
  answer: number;
  title: string;
  methodsCombined: string[];
  steps: {
    description: string;
    calculation: string;
    result: string;
    methodUsed: string;
  }[];
  keyInsight: string;
}

/**
 * When to Combine Methods section.
 */
function WhenToCombine(): React.ReactElement {
  const patterns = [
    {
      title: 'Large numbers with structure',
      description: 'When a number is large but has hidden patterns that can be exploited by factoring first.',
      example: '125 x 32 - factor 32 into powers of 2, then use near-power-10 ideas',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      )
    },
    {
      title: 'Near-round with adjustment',
      description: 'When one number is near a power of 10 but the other requires internal simplification.',
      example: '98 x 45 - use near-100 for 98, but you may factor 45 for easier adjustment',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      )
    },
    {
      title: 'Symmetric requiring squaring',
      description: 'When numbers are symmetric around a non-trivial midpoint that itself needs calculation.',
      example: '48 x 52 - difference of squares around 50, but 50^2 uses squaring techniques',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      title: 'Multi-step factorization',
      description: 'When breaking into factors creates sub-problems that are easier with specialized methods.',
      example: '75 x 44 - factor to get 75 x 4 x 11 = 300 x 11, then use the 11 trick',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    }
  ];

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-foreground mb-6">
        When to Combine Methods
      </h2>
      <p className="text-muted-foreground mb-6">
        Single methods work well for problems that fit their patterns perfectly. But real-world
        mental math often presents problems that are best solved by chaining multiple techniques.
        Look for these signals:
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {patterns.map((pattern, index) => (
          <Card key={index} variant="outlined" className="p-4">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {pattern.icon}
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{pattern.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{pattern.description}</p>
                <code className="text-xs bg-secondary px-2 py-1 rounded">
                  {pattern.example}
                </code>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

/**
 * Common Combinations section.
 */
function CommonCombinations(): React.ReactElement {
  const combinations = [
    {
      name: 'Factorization + Distributive',
      description: 'Factor one number, then use distributive on the other for the sub-multiplication.',
      when: 'One number has clear factors, the other is "messy"',
      example: '15 x 47',
      process: 'Factor 15 = 3 x 5. Calculate 47 x 5 = 235 (distribute as 45 x 5 + 2 x 5). Then 235 x 3 = 705.'
    },
    {
      name: 'Near Power of 10 + Simple Multiplication',
      description: 'Use the round number, then calculate the adjustment separately.',
      when: 'One number is 1-3 away from a power of 10',
      example: '98 x 67',
      process: '100 x 67 = 6700. Adjustment: 2 x 67 = 134. Result: 6700 - 134 = 6566.'
    },
    {
      name: 'Difference of Squares + Squaring',
      description: 'Apply difference of squares formula, then use squaring technique for the midpoint.',
      when: 'Numbers are symmetric, and the midpoint square is non-trivial',
      example: '47 x 53',
      process: 'Midpoint is 50, deviation is 3. Use 50^2 - 3^2. For 50^2 = 2500 (trivial). Result: 2500 - 9 = 2491.'
    },
    {
      name: 'Near 100 + Cross Multiplication',
      description: 'Express as deviations from 100, then use the Near 100 formula with careful arithmetic.',
      when: 'Both numbers are within 10-15 of 100',
      example: '97 x 104',
      process: 'Deviations: -3 and +4. Base: 100 x 100 = 10000. Adjustment: 100 x (4-3) = 100. Cross: (-3) x (+4) = -12. Total: 10000 + 100 - 12 = 10088.'
    },
    {
      name: 'Factorization + Powers of 2',
      description: 'Extract powers of 2 to enable repeated doubling/halving.',
      when: 'One number has factors of 2 or 4 or 8',
      example: '32 x 45',
      process: '32 = 2^5. Strategy: 45 x 32 = 45 x 2 x 2 x 2 x 2 x 2 = 90 x 16 = 1440.'
    }
  ];

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Common Method Combinations
      </h2>

      <div className="space-y-4">
        {combinations.map((combo, index) => (
          <Card key={index} variant="outlined">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{combo.name}</h3>
                  <p className="text-sm text-muted-foreground">{combo.description}</p>
                </div>
                <Badge variant="info">{combo.example}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-secondary/50">
                  <h4 className="text-sm font-semibold text-foreground mb-1">When to use</h4>
                  <p className="text-sm text-muted-foreground">{combo.when}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <h4 className="text-sm font-semibold text-foreground mb-1">Process</h4>
                  <p className="text-sm text-muted-foreground">{combo.process}</p>
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
 * Worked Examples section with detailed step-by-step solutions.
 */
function WorkedExamples(): React.ReactElement {
  const [expandedExample, setExpandedExample] = useState<number | null>(0);

  const examples: WorkedExample[] = [
    {
      num1: 48,
      num2: 52,
      answer: 2496,
      title: 'Difference of Squares + Squaring',
      methodsCombined: ['Difference of Squares', 'Mental Squaring'],
      steps: [
        {
          description: 'Recognize the symmetric pattern',
          calculation: '48 and 52 are both 2 away from 50',
          result: 'Midpoint = 50, Deviation = 2',
          methodUsed: 'Pattern Recognition'
        },
        {
          description: 'Apply difference of squares formula',
          calculation: '48 x 52 = (50 - 2)(50 + 2) = 50^2 - 2^2',
          result: '50^2 - 4',
          methodUsed: 'Difference of Squares'
        },
        {
          description: 'Calculate the square of 50',
          calculation: '50^2 = 2500',
          result: '2500',
          methodUsed: 'Mental Squaring (trivial case)'
        },
        {
          description: 'Calculate the deviation squared',
          calculation: '2^2 = 4',
          result: '4',
          methodUsed: 'Basic arithmetic'
        },
        {
          description: 'Subtract to get final answer',
          calculation: '2500 - 4',
          result: '2496',
          methodUsed: 'Mental subtraction'
        }
      ],
      keyInsight: 'The power of difference of squares is that it converts multiplication into squaring and subtraction - both easier mental operations.'
    },
    {
      num1: 125,
      num2: 32,
      answer: 4000,
      title: 'Factorization + Powers of 2',
      methodsCombined: ['Factorization', 'Power of 2 manipulation'],
      steps: [
        {
          description: 'Recognize factor structures',
          calculation: '125 = 5^3 (or 1000/8), 32 = 2^5',
          result: 'Both have special factor patterns',
          methodUsed: 'Factorization recognition'
        },
        {
          description: 'Rearrange for easier calculation',
          calculation: '125 x 32 = 125 x 8 x 4 = 1000 x 4',
          result: '1000 x 4',
          methodUsed: 'Factorization'
        },
        {
          description: 'Alternatively: use complementary factors',
          calculation: '125 x 8 = 1000 (because 125 = 1000/8)',
          result: '1000',
          methodUsed: 'Known fact: 125 x 8 = 1000'
        },
        {
          description: 'Complete the calculation',
          calculation: '1000 x 4 = 4000',
          result: '4000',
          methodUsed: 'Trivial multiplication by 4'
        }
      ],
      keyInsight: 'Recognizing that 125 x 8 = 1000 is a key mental math fact. When you see 125, immediately think about how 8s can be pulled from the other number.'
    },
    {
      num1: 97,
      num2: 54,
      answer: 5238,
      title: 'Near Power of 10 + Distributive Adjustment',
      methodsCombined: ['Near Power of 10', 'Distributive Property'],
      steps: [
        {
          description: 'Recognize 97 is close to 100',
          calculation: '97 = 100 - 3',
          result: 'Deviation = -3',
          methodUsed: 'Near Power of 10 setup'
        },
        {
          description: 'Calculate base product',
          calculation: '100 x 54 = 5400',
          result: '5400',
          methodUsed: 'Trivial power-of-10 multiplication'
        },
        {
          description: 'Calculate adjustment',
          calculation: '3 x 54 needs to be calculated',
          result: 'Use distributive for 3 x 54',
          methodUsed: 'Setup for adjustment'
        },
        {
          description: 'Apply distributive to adjustment',
          calculation: '3 x 54 = 3 x 50 + 3 x 4 = 150 + 12 = 162',
          result: '162',
          methodUsed: 'Distributive Property'
        },
        {
          description: 'Subtract adjustment from base',
          calculation: '5400 - 162 = 5238',
          result: '5238',
          methodUsed: 'Mental subtraction'
        }
      ],
      keyInsight: 'The adjustment calculation (3 x 54) is itself a multiplication that benefits from the distributive property. Chaining methods is natural when you let each step use whatever technique fits best.'
    },
    {
      num1: 75,
      num2: 44,
      answer: 3300,
      title: 'Factorization Chain with 11 Trick',
      methodsCombined: ['Factorization', '11 multiplication trick'],
      steps: [
        {
          description: 'Factor both numbers',
          calculation: '75 = 3 x 25, 44 = 4 x 11',
          result: 'Multiple useful factors',
          methodUsed: 'Factorization'
        },
        {
          description: 'Rearrange strategically',
          calculation: '75 x 44 = 75 x 4 x 11 = 300 x 11',
          result: '300 x 11',
          methodUsed: 'Factor rearrangement'
        },
        {
          description: 'Calculate 75 x 4',
          calculation: '75 x 4 = 300 (75 x 2 x 2 = 150 x 2 = 300)',
          result: '300',
          methodUsed: 'Doubling'
        },
        {
          description: 'Apply 11 multiplication trick',
          calculation: 'For 300 x 11: write 3, then 3+0, then 0+0, then 0 = 3300',
          result: '3300',
          methodUsed: '11 multiplication shortcut'
        }
      ],
      keyInsight: 'Factoring out 11 when possible is powerful because multiplying by 11 has a simple pattern: for any number, add adjacent digits with carries.'
    },
    {
      num1: 63,
      num2: 57,
      answer: 3591,
      title: 'Difference of Squares with Non-Trivial Midpoint',
      methodsCombined: ['Difference of Squares', 'Squaring near round number'],
      steps: [
        {
          description: 'Identify symmetric pattern',
          calculation: '(63 + 57) / 2 = 60, deviation = 3',
          result: 'Midpoint = 60, each number is 3 away',
          methodUsed: 'Pattern Recognition'
        },
        {
          description: 'Apply difference of squares',
          calculation: '63 x 57 = (60 + 3)(60 - 3) = 60^2 - 3^2',
          result: '60^2 - 9',
          methodUsed: 'Difference of Squares'
        },
        {
          description: 'Calculate 60 squared',
          calculation: '60^2 = 3600',
          result: '3600',
          methodUsed: 'Squaring (6^2 x 100)'
        },
        {
          description: 'Subtract deviation squared',
          calculation: '3600 - 9 = 3591',
          result: '3591',
          methodUsed: 'Mental subtraction'
        }
      ],
      keyInsight: 'Even when the midpoint is not a multiple of 10, it might still be easier to square than to do the original multiplication. Always check for symmetry first.'
    }
  ];

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Detailed Worked Examples
      </h2>
      <p className="text-muted-foreground mb-6">
        Study these examples carefully. Each demonstrates how multiple methods combine
        to solve problems more efficiently than any single method could alone.
      </p>

      <div className="space-y-4">
        {examples.map((example, index) => (
          <Card
            key={index}
            variant="outlined"
            className={expandedExample === index ? 'ring-2 ring-primary' : ''}
          >
            <button
              type="button"
              className="w-full text-left"
              onClick={() => setExpandedExample(expandedExample === index ? null : index)}
              aria-expanded={expandedExample === index}
            >
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-mono font-bold text-foreground">
                      {example.num1} x {example.num2}
                    </span>
                    <span className="text-lg text-muted-foreground">
                      = {example.answer}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="success">{example.title}</Badge>
                    <svg
                      className={`h-5 w-5 text-muted-foreground transition-transform ${
                        expandedExample === index ? 'rotate-180' : ''
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
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {example.methodsCombined.map((method, mIndex) => (
                    <Badge key={mIndex} variant="info">
                      {method}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
            </button>

            {expandedExample === index && (
              <CardContent>
                <div className="space-y-3 mb-6">
                  {example.steps.map((step, stepIndex) => (
                    <div
                      key={stepIndex}
                      className="flex gap-4 p-3 rounded-lg bg-secondary/30"
                    >
                      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                        {stepIndex + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-foreground">
                            {step.description}
                          </h4>
                          <Badge variant="default" className="flex-shrink-0">
                            {step.methodUsed}
                          </Badge>
                        </div>
                        <code className="block text-sm font-mono text-primary mt-1">
                          {step.calculation}
                        </code>
                        <p className="text-sm text-muted-foreground mt-1">
                          Result: <strong className="text-foreground">{step.result}</strong>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-lg bg-success/10 border border-success/30">
                  <h4 className="font-semibold text-foreground mb-2">Key Insight</h4>
                  <p className="text-sm text-muted-foreground">{example.keyInsight}</p>
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
 * Practice exercises section.
 */
function PracticeExercises(): React.ReactElement {
  const [showHints, setShowHints] = useState<Record<number, boolean>>({});
  const [showAnswers, setShowAnswers] = useState<Record<number, boolean>>({});

  const exercises = [
    {
      num1: 96,
      num2: 104,
      answer: 9984,
      hint: 'Both numbers are close to 100 AND symmetric around 100. Which method(s) apply?',
      solution: 'Difference of squares: 100^2 - 4^2 = 10000 - 16 = 9984. Or Near 100: deviations -4 and +4, cross product -16, so 10000 - 16 = 9984.'
    },
    {
      num1: 45,
      num2: 88,
      answer: 3960,
      hint: '88 = 8 x 11. Can you use the 11 trick? Also, 45 has nice factors.',
      solution: 'Factor: 45 x 88 = 45 x 8 x 11 = 360 x 11. For 360 x 11: 3, 3+6=9, 6+0=6, 0 = 3960.'
    },
    {
      num1: 67,
      num2: 73,
      answer: 4891,
      hint: 'These numbers are symmetric around 70. Use difference of squares, then square 70.',
      solution: 'Difference of squares: (70-3)(70+3) = 70^2 - 9 = 4900 - 9 = 4891.'
    },
    {
      num1: 125,
      num2: 24,
      answer: 3000,
      hint: 'Remember that 125 x 8 = 1000. Can you extract an 8 from 24?',
      solution: '24 = 8 x 3, so 125 x 24 = 125 x 8 x 3 = 1000 x 3 = 3000.'
    },
    {
      num1: 98,
      num2: 37,
      answer: 3626,
      hint: '98 is 100-2. Calculate 100 x 37, then subtract 2 x 37.',
      solution: 'Near 100: 100 x 37 = 3700. Adjustment: 2 x 37 = 74. Answer: 3700 - 74 = 3626.'
    },
    {
      num1: 64,
      num2: 25,
      answer: 1600,
      hint: '64 = 2^6 and 25 = 100/4. Look for factor combinations.',
      solution: '25 x 64 = 25 x 4 x 16 = 100 x 16 = 1600. Or: 64 x 25 = 16 x 100 = 1600.'
    }
  ];

  const toggleHint = (index: number): void => {
    setShowHints((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleAnswer = (index: number): void => {
    setShowAnswers((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Practice Combining Methods
      </h2>
      <p className="text-muted-foreground mb-6">
        Try these problems yourself. For each one, think about which methods might combine
        well before revealing the hint. Calculate your answer before checking the solution.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {exercises.map((exercise, index) => (
          <Card key={index} variant="outlined" className="p-4">
            <div className="text-center mb-4">
              <span className="text-2xl font-mono font-bold text-foreground">
                {exercise.num1} x {exercise.num2}
              </span>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => toggleHint(index)}
                className="w-full text-sm text-primary hover:underline"
              >
                {showHints[index] ? 'Hide Hint' : 'Show Hint'}
              </button>

              {showHints[index] && (
                <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 text-sm text-muted-foreground">
                  {exercise.hint}
                </div>
              )}

              <button
                type="button"
                onClick={() => toggleAnswer(index)}
                className="w-full text-sm text-primary hover:underline"
              >
                {showAnswers[index] ? 'Hide Answer' : 'Show Answer'}
              </button>

              {showAnswers[index] && (
                <div className="p-3 rounded-lg bg-success/10 border border-success/30 text-sm">
                  <p className="font-bold text-foreground mb-1">
                    Answer: {exercise.answer}
                  </p>
                  <p className="text-muted-foreground">{exercise.solution}</p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

/**
 * Mental strategies section.
 */
function MentalStrategies(): React.ReactElement {
  const strategies = [
    {
      title: 'Always scan for patterns first',
      description: 'Before computing anything, take a moment to look at both numbers. Check for: symmetry, nearness to powers of 10, useful factors, or special endings (5, 25, etc.).'
    },
    {
      title: 'Know your anchor facts',
      description: 'Memorize key facts like 125 x 8 = 1000, 25 x 4 = 100, 11 x n pattern. These become launching points for combined strategies.'
    },
    {
      title: 'Chain small steps',
      description: 'Each method transforms the problem. If one method gets you part of the way, look for another method to finish. The sequence matters less than reaching simpler sub-problems.'
    },
    {
      title: 'Validate intermediate results',
      description: 'After each step, quickly sanity-check your result. Is it in the right ballpark? This catches errors before they compound.'
    },
    {
      title: 'Practice method transitions',
      description: 'Get comfortable switching methods mid-calculation. The mental skill is recognizing when one approach has simplified the problem enough for another to take over.'
    }
  ];

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Mental Strategies for Combining
      </h2>

      <div className="space-y-4">
        {strategies.map((strategy, index) => (
          <div key={index} className="flex gap-4 p-4 rounded-lg bg-secondary/30">
            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
              {index + 1}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{strategy.title}</h3>
              <p className="text-sm text-muted-foreground">{strategy.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Combining Techniques Page component.
 */
export default function CombiningTechniquesPage(): React.ReactElement {
  return (
    <div className="max-w-5xl mx-auto">
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
          <li className="text-foreground font-medium">Combining Techniques</li>
        </ol>
      </nav>

      {/* Page Header */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold text-foreground">
            Combining Calculation Techniques
          </h1>
          <Badge variant="warning">Advanced</Badge>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Master the art of chaining multiple mental math methods together. Real-world
          problems rarely fit a single pattern perfectly - learn to recognize when
          combining techniques leads to elegant solutions.
        </p>
      </header>

      {/* Main Content Sections */}
      <WhenToCombine />
      <CommonCombinations />
      <WorkedExamples />
      <MentalStrategies />
      <PracticeExercises />

      {/* Navigation */}
      <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/study/compare">
          <Button variant="outline" size="lg">
            Compare Individual Methods
          </Button>
        </Link>
        <Link href="/practice">
          <Button variant="primary" size="lg">
            Practice Mixed Problems
          </Button>
        </Link>
      </div>
    </div>
  );
}
