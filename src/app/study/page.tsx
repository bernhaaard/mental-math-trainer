'use client';

/**
 * Study Mode Main Page
 *
 * Displays a grid of calculation method cards with icons, descriptions,
 * and difficulty indicators. Users can explore each method's educational
 * content by clicking on the cards.
 */

import Link from 'next/link';
import { MethodName } from '@/lib/types/method';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/**
 * Configuration for each calculation method displayed on the study page.
 */
interface MethodConfig {
  name: MethodName;
  displayName: string;
  description: string;
  icon: React.ReactNode;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  difficultyVariant: 'success' | 'warning' | 'error';
  order: number;
}

/**
 * SVG icon for the Distributive Property method.
 */
function DistributiveIcon(): React.ReactElement {
  return (
    <svg
      className="h-8 w-8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <line x1="7" y1="14" x2="7" y2="21" />
      <line x1="4" y1="17.5" x2="10" y2="17.5" />
      <line x1="17" y1="14" x2="17" y2="21" />
      <line x1="14" y1="17.5" x2="20" y2="17.5" />
    </svg>
  );
}

/**
 * SVG icon for the Difference of Squares method.
 */
function DifferenceSquaresIcon(): React.ReactElement {
  return (
    <svg
      className="h-8 w-8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="8" height="8" />
      <rect x="13" y="13" width="8" height="8" />
      <line x1="6" y1="13" x2="6" y2="19" />
      <line x1="3" y1="16" x2="9" y2="16" />
    </svg>
  );
}

/**
 * SVG icon for the Near Powers of 10 method.
 */
function NearPower10Icon(): React.ReactElement {
  return (
    <svg
      className="h-8 w-8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fontSize="10"
        fill="currentColor"
        stroke="none"
      >
        10
      </text>
    </svg>
  );
}

/**
 * SVG icon for the Squaring method.
 */
function SquaringIcon(): React.ReactElement {
  return (
    <svg
      className="h-8 w-8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <text
        x="12"
        y="15"
        textAnchor="middle"
        fontSize="8"
        fill="currentColor"
        stroke="none"
      >
        x
      </text>
      <text
        x="17"
        y="10"
        textAnchor="middle"
        fontSize="6"
        fill="currentColor"
        stroke="none"
      >
        2
      </text>
    </svg>
  );
}

/**
 * SVG icon for the Near 100 method.
 */
function Near100Icon(): React.ReactElement {
  return (
    <svg
      className="h-8 w-8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <text
        x="12"
        y="15"
        textAnchor="middle"
        fontSize="7"
        fill="currentColor"
        stroke="none"
      >
        100
      </text>
    </svg>
  );
}

/**
 * SVG icon for the Factorization method.
 */
function FactorizationIcon(): React.ReactElement {
  return (
    <svg
      className="h-8 w-8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="18" r="3" />
      <line x1="12" y1="9" x2="6" y2="15" />
      <line x1="12" y1="9" x2="18" y2="15" />
    </svg>
  );
}

/**
 * Method configurations in the recommended learning order.
 */
const METHODS: MethodConfig[] = [
  {
    name: MethodName.Distributive,
    displayName: 'Distributive Property',
    description:
      'The foundational technique for mental math. Split numbers by place value and multiply parts separately.',
    icon: <DistributiveIcon />,
    difficulty: 'Beginner',
    difficultyVariant: 'success',
    order: 1
  },
  {
    name: MethodName.DifferenceSquares,
    displayName: 'Difference of Squares',
    description:
      'Exploit symmetry around a midpoint. Perfect for numbers like 47 x 53 (both 3 away from 50).',
    icon: <DifferenceSquaresIcon />,
    difficulty: 'Intermediate',
    difficultyVariant: 'warning',
    order: 2
  },
  {
    name: MethodName.NearPower10,
    displayName: 'Near Powers of 10',
    description:
      'Leverage the ease of multiplying by 10, 100, or 1000 when one number is close to these values.',
    icon: <NearPower10Icon />,
    difficulty: 'Beginner',
    difficultyVariant: 'success',
    order: 3
  },
  {
    name: MethodName.Squaring,
    displayName: 'Squaring',
    description:
      'Special techniques for multiplying a number by itself. Uses (a +/- b)^2 identity.',
    icon: <SquaringIcon />,
    difficulty: 'Intermediate',
    difficultyVariant: 'warning',
    order: 4
  },
  {
    name: MethodName.Near100,
    displayName: 'Near 100',
    description:
      'A powerful technique for multiplying numbers close to 100. Express as deviations and apply formula.',
    icon: <Near100Icon />,
    difficulty: 'Intermediate',
    difficultyVariant: 'warning',
    order: 5
  },
  {
    name: MethodName.Factorization,
    displayName: 'Factorization',
    description:
      'Break numbers into factors and rearrange for easier intermediate products.',
    icon: <FactorizationIcon />,
    difficulty: 'Advanced',
    difficultyVariant: 'error',
    order: 6
  }
];

/**
 * Renders a single method card with icon, description, and difficulty badge.
 */
function MethodCard({ method }: { method: MethodConfig }): React.ReactElement {
  return (
    <Link
      href={`/study/${method.name}`}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
      aria-label={`Study ${method.displayName} method`}
    >
      <Card
        variant="outlined"
        className="h-full transition-all duration-200 hover:shadow-lg hover:border-primary/50 hover:scale-[1.02] cursor-pointer"
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {method.icon}
              </div>
              <div>
                <h3 className="font-semibold text-lg text-card-foreground">
                  {method.displayName}
                </h3>
                <Badge variant={method.difficultyVariant} className="mt-1">
                  {method.difficulty}
                </Badge>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              #{method.order}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {method.description}
          </p>
        </CardContent>
        <CardFooter className="pt-2">
          <span className="text-sm font-medium text-primary hover:underline">
            Start learning
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}

/**
 * Learning path data for the visual progression display.
 */
const LEARNING_PATH = [
  {
    num: 1,
    name: MethodName.Distributive,
    label: 'Distributive Property',
    level: 'Foundation'
  },
  {
    num: 2,
    name: MethodName.DifferenceSquares,
    label: 'Difference of Squares',
    level: 'Pattern Recognition'
  },
  {
    num: 3,
    name: MethodName.NearPower10,
    label: 'Near Powers of 10',
    level: 'Optimization'
  },
  {
    num: 4,
    name: MethodName.Squaring,
    label: 'Squaring',
    level: 'Specialization'
  },
  {
    num: 5,
    name: MethodName.Near100,
    label: 'Near 100',
    level: 'Advanced'
  },
  {
    num: 6,
    name: MethodName.Factorization,
    label: 'Factorization',
    level: 'Mastery'
  }
];

/**
 * Learning path component showing the recommended progression as connected cards.
 */
function LearningPath(): React.ReactElement {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Recommended Learning Path
      </h2>
      <div className="relative">
        {/* Connection line for desktop */}
        <div
          className="absolute top-1/2 left-0 right-0 h-0.5 bg-border hidden md:block"
          aria-hidden="true"
        />

        <div className="flex flex-col md:flex-row gap-4 md:gap-2 overflow-x-auto pb-4">
          {LEARNING_PATH.map((method, index, arr) => (
            <Link
              key={method.name}
              href={`/study/${method.name}`}
              className="flex-shrink-0 relative group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
              aria-label={`Learn ${method.label} - ${method.level} level`}
            >
              <Card
                variant="outlined"
                className="w-full md:w-40 p-4 hover:border-primary transition-colors"
              >
                <div className="flex md:flex-col items-center gap-3 md:gap-2 text-center">
                  <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-sm group-hover:scale-110 transition-transform">
                    {method.num}
                  </div>
                  <div className="flex-1 md:flex-none">
                    <p className="font-medium text-foreground text-sm">
                      {method.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {method.level}
                    </p>
                  </div>
                  {index < arr.length - 1 && (
                    <svg
                      className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
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
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        We recommend learning methods in this order, starting with the
        foundational Distributive Property and building toward more specialized
        techniques.
      </p>
    </section>
  );
}

/**
 * Study Mode main page component.
 */
export default function StudyPage(): React.ReactElement {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mb-6">
          <svg
            className="w-10 h-10 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Master Mental Math
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Learn powerful calculation techniques that will transform how you think
          about numbers. Each method builds on the last, creating a foundation for
          mathematical fluency.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="flex justify-center gap-8 mb-12">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">6</div>
          <div className="text-sm text-muted-foreground">Methods to Learn</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-success">&infin;</div>
          <div className="text-sm text-muted-foreground">Problems to Practice</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-warning">1</div>
          <div className="text-sm text-muted-foreground">Journey</div>
        </div>
      </div>

      {/* Learning Path */}
      <LearningPath />

      {/* Method Cards Grid */}
      <section aria-label="Calculation methods">
        <h2 className="sr-only">Available Methods</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {METHODS.sort((a, b) => a.order - b.order).map((method) => (
            <MethodCard key={method.name} method={method} />
          ))}
        </div>
      </section>

      {/* Advanced Topics */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Advanced Topics
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/study/compare"
            className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
          >
            <Card
              variant="outlined"
              className="relative overflow-hidden h-full transition-all duration-200 hover:shadow-lg hover:border-primary/50 hover:scale-[1.02] cursor-pointer group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <CardHeader className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-card-foreground">
                        Compare Methods
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Side-by-side comparison with decision flowchart
                      </p>
                    </div>
                  </div>
                  <Badge variant="info">Advanced</Badge>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-sm text-muted-foreground">
                  Learn when to use each method with our comparison table,
                  decision flowchart, and method-vs-method breakdowns.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link
            href="/study/combining"
            className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
          >
            <Card
              variant="outlined"
              className="relative overflow-hidden h-full transition-all duration-200 hover:shadow-lg hover:border-primary/50 hover:scale-[1.02] cursor-pointer group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-warning/5 to-transparent" />
              <CardHeader className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-card-foreground">
                        Combining Techniques
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Chain methods for complex problems
                      </p>
                    </div>
                  </div>
                  <Badge variant="warning">Expert</Badge>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-sm text-muted-foreground">
                  Chain multiple methods together for complex problems.
                  Includes worked examples and practice exercises.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Quick Start Tips */}
      <section className="mt-12 rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground mb-4">
          Tips for Effective Learning
        </h2>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <svg
              className="h-5 w-5 text-success flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>
              <strong className="text-foreground">
                Understand the math, not just the steps.
              </strong>{' '}
              Each method is built on algebraic identities that you should
              internalize.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <svg
              className="h-5 w-5 text-success flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>
              <strong className="text-foreground">
                Practice pattern recognition.
              </strong>{' '}
              The skill is seeing which method applies to a given problem.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <svg
              className="h-5 w-5 text-success flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>
              <strong className="text-foreground">
                Start with worked examples.
              </strong>{' '}
              Follow along with the step-by-step solutions before trying on your
              own.
            </span>
          </li>
        </ul>
      </section>

      {/* Navigation to Practice */}
      <div className="mt-8 flex justify-center">
        <Link href="/practice">
          <Button variant="primary" size="lg">
            Ready to Practice?
          </Button>
        </Link>
      </div>
    </div>
  );
}
