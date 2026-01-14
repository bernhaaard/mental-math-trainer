'use client';

/**
 * Individual Method Study Page
 *
 * Dynamic route that displays educational content for a specific calculation
 * method. Includes tabbed navigation for Introduction, Foundation, Deep Dive,
 * Examples, and Practice sections.
 */

import { useState, useCallback, useMemo } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { MethodName, type StudyContent } from '@/lib/types/method';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Import all calculation method implementations
import { DistributiveMethod } from '@/lib/core/methods/distributive';
import { DifferenceSquaresMethod } from '@/lib/core/methods/difference-squares';
import { NearPower10Method } from '@/lib/core/methods/near-power-10';
import { SquaringMethod } from '@/lib/core/methods/squaring';
import { Near100Method } from '@/lib/core/methods/near-100';
import { FactorizationMethod } from '@/lib/core/methods/factorization';
import { SumToTenMethod } from '@/lib/core/methods/sum-to-ten';
import { SquaringEnd5Method } from '@/lib/core/methods/squaring-end-5';
import { MultiplyBy111Method } from '@/lib/core/methods/multiply-by-111';
import { NearSquaresMethod } from '@/lib/core/methods/near-squares';

/**
 * Tab identifiers for navigation.
 */
type TabId = 'introduction' | 'foundation' | 'deep-dive' | 'tips' | 'examples' | 'practice';

/**
 * Tab configuration interface.
 */
interface Tab {
  id: TabId;
  label: string;
  shortLabel: string;
}

/**
 * Available tabs with their display labels.
 */
const TABS: Tab[] = [
  { id: 'introduction', label: 'Introduction', shortLabel: 'Intro' },
  { id: 'foundation', label: 'Mathematical Foundation', shortLabel: 'Foundation' },
  { id: 'deep-dive', label: 'Deep Dive', shortLabel: 'Deep Dive' },
  { id: 'tips', label: 'Tips & Mistakes', shortLabel: 'Tips' },
  { id: 'examples', label: 'Examples', shortLabel: 'Examples' },
  { id: 'practice', label: 'Practice', shortLabel: 'Practice' }
];

/**
 * Method navigation order for previous/next navigation.
 */
const METHOD_ORDER: MethodName[] = [
  MethodName.Distributive,
  MethodName.DifferenceSquares,
  MethodName.NearPower10,
  MethodName.Squaring,
  MethodName.Near100,
  MethodName.Factorization,
  MethodName.SumToTen,
  MethodName.SquaringEndIn5,
  MethodName.MultiplyBy111,
  MethodName.NearSquares
];

/**
 * Maps method names to their display names.
 */
const METHOD_DISPLAY_NAMES: Record<MethodName, string> = {
  [MethodName.Distributive]: 'Distributive Property',
  [MethodName.DifferenceSquares]: 'Difference of Squares',
  [MethodName.NearPower10]: 'Near Powers of 10',
  [MethodName.Squaring]: 'Squaring',
  [MethodName.Near100]: 'Near 100',
  [MethodName.Factorization]: 'Factorization',
  [MethodName.SumToTen]: 'Sum to Ten',
  [MethodName.SquaringEndIn5]: 'Squaring Numbers Ending in 5',
  [MethodName.MultiplyBy111]: 'Multiply by 111',
  [MethodName.NearSquares]: 'Near Squares'
};

/**
 * Validates a method slug against known method names.
 */
function isValidMethodSlug(slug: string): slug is MethodName {
  return Object.values(MethodName).includes(slug as MethodName);
}

/**
 * Gets the study content for a given method.
 */
function getStudyContent(methodName: MethodName): StudyContent {
  const methodMap = {
    [MethodName.Distributive]: new DistributiveMethod(),
    [MethodName.DifferenceSquares]: new DifferenceSquaresMethod(),
    [MethodName.NearPower10]: new NearPower10Method(),
    [MethodName.Squaring]: new SquaringMethod(),
    [MethodName.Near100]: new Near100Method(),
    [MethodName.Factorization]: new FactorizationMethod(),
    [MethodName.SumToTen]: new SumToTenMethod(),
    [MethodName.SquaringEndIn5]: new SquaringEnd5Method(),
    [MethodName.MultiplyBy111]: new MultiplyBy111Method(),
    [MethodName.NearSquares]: new NearSquaresMethod()
  };

  return methodMap[methodName].generateStudyContent();
}

/**
 * Gets adjacent methods for navigation.
 */
function getAdjacentMethods(currentMethod: MethodName): {
  previous: MethodName | null;
  next: MethodName | null;
} {
  const currentIndex = METHOD_ORDER.indexOf(currentMethod);
  const previousMethod = currentIndex > 0 ? METHOD_ORDER[currentIndex - 1] : null;
  const nextMethod =
    currentIndex < METHOD_ORDER.length - 1 ? METHOD_ORDER[currentIndex + 1] : null;
  return {
    previous: previousMethod ?? null,
    next: nextMethod ?? null
  };
}

/**
 * Renders markdown-like content with proper formatting.
 * Handles headers, paragraphs, lists, and inline code.
 */
function ContentRenderer({ content }: { content: string }): React.ReactElement {
  const lines = content.trim().split('\n');
  const elements: React.ReactElement[] = [];
  let currentParagraph: string[] = [];
  let inList = false;
  let listItems: string[] = [];

  const flushParagraph = (): void => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(' ').trim();
      if (text) {
        elements.push(
          <p
            key={`p-${elements.length}`}
            className="text-muted-foreground leading-relaxed mb-4"
          >
            {formatInlineCode(text)}
          </p>
        );
      }
      currentParagraph = [];
    }
  };

  const flushList = (): void => {
    if (listItems.length > 0) {
      elements.push(
        <ul
          key={`ul-${elements.length}`}
          className="list-disc list-inside space-y-2 mb-4 text-muted-foreground"
        >
          {listItems.map((item, i) => (
            <li key={i}>{formatInlineCode(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  /**
   * Formats inline code and math expressions.
   */
  function formatInlineCode(text: string): React.ReactNode {
    // Split on backticks for inline code
    const parts = text.split(/`([^`]+)`/);
    if (parts.length === 1) {
      return text;
    }
    return parts.map((part, i) =>
      i % 2 === 1 ? (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground font-mono text-sm"
        >
          {part}
        </code>
      ) : (
        part
      )
    );
  }

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    // Empty line - flush current content
    if (!trimmedLine) {
      if (!inList) {
        flushParagraph();
      }
      return;
    }

    // H3 Header (###)
    if (trimmedLine.startsWith('### ')) {
      flushParagraph();
      flushList();
      elements.push(
        <h3
          key={`h3-${elements.length}`}
          className="text-lg font-semibold text-foreground mt-6 mb-3"
        >
          {trimmedLine.slice(4)}
        </h3>
      );
      return;
    }

    // H2 Header (##)
    if (trimmedLine.startsWith('## ')) {
      flushParagraph();
      flushList();
      elements.push(
        <h2
          key={`h2-${elements.length}`}
          className="text-xl font-semibold text-foreground mt-8 mb-4"
        >
          {trimmedLine.slice(3)}
        </h2>
      );
      return;
    }

    // List item (- or *)
    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      flushParagraph();
      if (!inList) {
        inList = true;
      }
      listItems.push(trimmedLine.slice(2));
      return;
    }

    // Numbered list item
    if (/^\d+\.\s/.test(trimmedLine)) {
      flushParagraph();
      if (!inList) {
        inList = true;
      }
      listItems.push(trimmedLine.replace(/^\d+\.\s/, ''));
      return;
    }

    // Regular text - accumulate in paragraph
    if (inList && listItems.length > 0) {
      // If we're in a list and hit regular text, this might be a continuation
      // or new content. Flush the list first.
      flushList();
    }
    currentParagraph.push(trimmedLine);
  });

  // Flush remaining content
  flushParagraph();
  flushList();

  return <>{elements}</>;
}

/**
 * Tab button component.
 */
function TabButton({
  tab,
  isActive,
  onClick
}: {
  tab: Tab;
  isActive: boolean;
  onClick: () => void;
}): React.ReactElement {
  const baseClasses =
    'px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';
  const activeClasses = 'bg-primary text-primary-foreground';
  const inactiveClasses = 'text-muted-foreground hover:text-foreground hover:bg-secondary';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${tab.id}`}
      id={`tab-${tab.id}`}
    >
      <span className="hidden sm:inline">{tab.label}</span>
      <span className="sm:hidden">{tab.shortLabel}</span>
    </button>
  );
}

/**
 * Introduction tab content.
 */
function IntroductionTab({
  content,
  whenToUse,
  whenNotToUse
}: {
  content: StudyContent;
  whenToUse: string[];
  whenNotToUse: string[];
}): React.ReactElement {
  return (
    <div>
      <ContentRenderer content={content.introduction} />

      {whenToUse.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            When to Use This Method
          </h3>
          <ul className="space-y-3">
            {whenToUse.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
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
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {whenNotToUse.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            When NOT to Use This Method
          </h3>
          <ul className="space-y-3">
            {whenNotToUse.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <svg
                  className="h-5 w-5 text-error flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Foundation tab content.
 */
function FoundationTab({ content }: { content: string }): React.ReactElement {
  return (
    <div className="prose prose-invert max-w-none">
      <ContentRenderer content={content} />
    </div>
  );
}

/**
 * Deep Dive tab content.
 */
function DeepDiveTab({ content }: { content: string }): React.ReactElement {
  return (
    <div className="prose prose-invert max-w-none">
      <ContentRenderer content={content} />
    </div>
  );
}

/**
 * Tips & Mistakes tab content.
 * Displays common mistakes and practice strategies.
 */
function TipsTab({
  commonMistakes,
  practiceStrategies
}: {
  commonMistakes: string[];
  practiceStrategies: string[];
}): React.ReactElement {
  return (
    <div>
      {/* Common Mistakes Section */}
      {commonMistakes.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <svg
              className="h-5 w-5 text-error"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            Common Mistakes to Avoid
          </h3>
          <div className="space-y-3">
            {commonMistakes.map((mistake, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-error/5 border border-error/20"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-error/10 text-error text-sm font-medium flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="text-muted-foreground">{mistake}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Practice Strategies Section */}
      {practiceStrategies.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <svg
              className="h-5 w-5 text-success"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            Practice Strategies
          </h3>
          <div className="space-y-3">
            {practiceStrategies.map((strategy, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-success/5 border border-success/20"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-success/10 text-success text-sm font-medium flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="text-muted-foreground">{strategy}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {commonMistakes.length === 0 && practiceStrategies.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Tips and practice strategies will be added soon.</p>
        </div>
      )}
    </div>
  );
}

/**
 * Examples tab content.
 * Shows worked examples for the method.
 */
function ExamplesTab({ methodName }: { methodName: MethodName }): React.ReactElement {
  // Define example problems for each method
  const exampleProblems: Record<MethodName, Array<{ num1: number; num2: number }>> = {
    [MethodName.Distributive]: [
      { num1: 23, num2: 45 },
      { num1: 47, num2: 28 },
      { num1: 56, num2: 32 }
    ],
    [MethodName.DifferenceSquares]: [
      { num1: 47, num2: 53 },
      { num1: 48, num2: 52 },
      { num1: 23, num2: 27 }
    ],
    [MethodName.NearPower10]: [
      { num1: 98, num2: 47 },
      { num1: 102, num2: 35 },
      { num1: 99, num2: 86 }
    ],
    [MethodName.Squaring]: [
      { num1: 47, num2: 47 },
      { num1: 73, num2: 73 },
      { num1: 98, num2: 98 }
    ],
    [MethodName.Near100]: [
      { num1: 97, num2: 103 },
      { num1: 94, num2: 97 },
      { num1: 104, num2: 107 }
    ],
    [MethodName.Factorization]: [
      { num1: 24, num2: 35 },
      { num1: 15, num2: 48 },
      { num1: 36, num2: 25 }
    ],
    [MethodName.SumToTen]: [
      { num1: 23, num2: 27 },
      { num1: 34, num2: 36 },
      { num1: 68, num2: 62 }
    ],
    [MethodName.SquaringEndIn5]: [
      { num1: 25, num2: 25 },
      { num1: 35, num2: 35 },
      { num1: 75, num2: 75 }
    ],
    [MethodName.MultiplyBy111]: [
      { num1: 111, num2: 23 },
      { num1: 45, num2: 111 },
      { num1: 111, num2: 67 }
    ],
    [MethodName.NearSquares]: [
      { num1: 20, num2: 22 },
      { num1: 49, num2: 51 },
      { num1: 30, num2: 32 }
    ]
  };

  const examples = exampleProblems[methodName];

  return (
    <div>
      <p className="text-muted-foreground mb-6">
        Work through these examples to see how the method is applied step by step.
        Click on an example to see the full solution breakdown.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {examples.map(({ num1, num2 }, index) => (
          <Link
            key={index}
            href={`/practice?example=${num1}x${num2}&method=${methodName}`}
            className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
          >
            <Card
              variant="outlined"
              className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/50 cursor-pointer"
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-mono font-bold text-foreground mb-2">
                    {num1} x {num2}
                  </p>
                  <p className="text-lg text-muted-foreground">
                    = {num1 * num2}
                  </p>
                  <Badge variant="info" className="mt-3">
                    Example {index + 1}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8 p-4 rounded-lg bg-secondary/50 border border-border">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Tip:</strong> Try to solve each
          problem mentally before clicking to see the solution. This builds the
          pattern recognition skills you need for mental math mastery.
        </p>
      </div>
    </div>
  );
}

/**
 * Practice tab content.
 * Provides quick practice problems for the specific method.
 */
function PracticeTab({ methodName }: { methodName: MethodName }): React.ReactElement {
  return (
    <div className="text-center py-8">
      <svg
        className="h-16 w-16 text-primary mx-auto mb-4"
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

      <h3 className="text-xl font-semibold text-foreground mb-2">
        Ready to Practice?
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Test your understanding with practice problems specifically designed for
        the {METHOD_DISPLAY_NAMES[methodName]} method.
      </p>

      <Link href={`/practice?method=${methodName}`}>
        <Button variant="primary" size="lg">
          Start Practice Session
        </Button>
      </Link>

      <p className="mt-4 text-sm text-muted-foreground">
        Problems will be tailored to situations where this method is optimal.
      </p>
    </div>
  );
}

/**
 * Method study page component.
 */
export default function MethodStudyPage(): React.ReactElement {
  const params = useParams();
  const [activeTab, setActiveTab] = useState<TabId>('introduction');

  // Validate method parameter
  const methodSlug = params.method as string;

  if (!isValidMethodSlug(methodSlug)) {
    notFound();
  }

  const methodName = methodSlug as MethodName;
  const displayName = METHOD_DISPLAY_NAMES[methodName];

  // Get study content
  const studyContent = useMemo(() => getStudyContent(methodName), [methodName]);

  // Get adjacent methods for navigation
  const { previous, next } = useMemo(
    () => getAdjacentMethods(methodName),
    [methodName]
  );

  // Calculate progress through the curriculum
  const currentIndex = METHOD_ORDER.indexOf(methodName);
  const progressPercent = ((currentIndex + 1) / METHOD_ORDER.length) * 100;

  // Tab change handler
  const handleTabChange = useCallback((tabId: TabId) => {
    setActiveTab(tabId);
  }, []);

  // Keyboard navigation for tabs (Issue #36: Move DOM focus to new tab)
  const handleTabKeyDown = useCallback(
    (event: React.KeyboardEvent, tabId: TabId) => {
      const currentTabIndex = TABS.findIndex((t) => t.id === tabId);
      let newTabId: TabId | undefined;

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        const nextIndex = (currentTabIndex + 1) % TABS.length;
        const nextTab = TABS[nextIndex];
        if (nextTab) {
          newTabId = nextTab.id;
          setActiveTab(nextTab.id);
        }
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        const prevIndex = (currentTabIndex - 1 + TABS.length) % TABS.length;
        const prevTab = TABS[prevIndex];
        if (prevTab) {
          newTabId = prevTab.id;
          setActiveTab(prevTab.id);
        }
      }

      // Move DOM focus to the newly selected tab button
      if (newTabId) {
        // Use requestAnimationFrame to ensure DOM has updated
        requestAnimationFrame(() => {
          const newTabElement = document.getElementById(`tab-${newTabId}`);
          if (newTabElement) {
            newTabElement.focus();
          }
        });
      }
    },
    []
  );

  return (
    <div className="max-w-4xl mx-auto">
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
          <li className="text-foreground font-medium">{displayName}</li>
        </ol>
      </nav>

      {/* Page Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-foreground">{displayName}</h1>
          <Badge
            variant={
              currentIndex < 2 ? 'success' : currentIndex < 4 ? 'warning' : 'error'
            }
          >
            {currentIndex < 2
              ? 'Beginner'
              : currentIndex < 4
                ? 'Intermediate'
                : 'Advanced'}
          </Badge>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-4">
          <Progress
            value={progressPercent}
            label={`Method ${currentIndex + 1} of ${METHOD_ORDER.length}`}
            showPercentage
            className="flex-1"
          />
        </div>
      </header>

      {/* Tab Navigation */}
      <div
        className="mb-6 flex flex-wrap gap-2 border-b border-border pb-4"
        role="tablist"
        aria-label="Study content sections"
      >
        {TABS.map((tab) => (
          <div
            key={tab.id}
            onKeyDown={(e) => handleTabKeyDown(e, tab.id)}
          >
            <TabButton
              tab={tab}
              isActive={activeTab === tab.id}
              onClick={() => handleTabChange(tab.id)}
            />
          </div>
        ))}
      </div>

      {/* Tab Content */}
      <div
        id={`tabpanel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        tabIndex={0}
        className="min-h-[400px]"
      >
        <Card variant="default" className="p-6">
          {activeTab === 'introduction' && (
            <IntroductionTab
              content={studyContent}
              whenToUse={studyContent.whenToUse}
              whenNotToUse={studyContent.whenNotToUse}
            />
          )}
          {activeTab === 'foundation' && (
            <FoundationTab content={studyContent.mathematicalFoundation} />
          )}
          {activeTab === 'deep-dive' && (
            <DeepDiveTab content={studyContent.deepDiveContent} />
          )}
          {activeTab === 'tips' && (
            <TipsTab
              commonMistakes={studyContent.commonMistakes}
              practiceStrategies={studyContent.practiceStrategies}
            />
          )}
          {activeTab === 'examples' && <ExamplesTab methodName={methodName} />}
          {activeTab === 'practice' && <PracticeTab methodName={methodName} />}
        </Card>
      </div>

      {/* Previous/Next Navigation */}
      <nav
        className="mt-8 flex items-center justify-between"
        aria-label="Method navigation"
      >
        <div>
          {previous && (
            <Link
              href={`/study/${previous}`}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
            >
              <svg
                className="h-5 w-5 transition-transform group-hover:-translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span>
                <span className="text-xs block">Previous</span>
                <span className="font-medium text-foreground">
                  {METHOD_DISPLAY_NAMES[previous]}
                </span>
              </span>
            </Link>
          )}
        </div>

        <Link
          href="/study"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          All Methods
        </Link>

        <div>
          {next && (
            <Link
              href={`/study/${next}`}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group text-right"
            >
              <span>
                <span className="text-xs block">Next</span>
                <span className="font-medium text-foreground">
                  {METHOD_DISPLAY_NAMES[next]}
                </span>
              </span>
              <svg
                className="h-5 w-5 transition-transform group-hover:translate-x-1"
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
          )}
        </div>
      </nav>
    </div>
  );
}
