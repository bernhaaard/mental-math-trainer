/**
 * StudyTabNavigation component - Tab bar for navigating study mode sections.
 * @module components/features/study/StudyTabNavigation
 */

'use client';

import * as React from 'react';
import { useCallback, useRef } from 'react';

/**
 * Available tab identifiers for study mode
 */
export type StudyTab = 'introduction' | 'foundation' | 'deepdive' | 'examples' | 'practice';

/**
 * Configuration for a single tab
 */
export interface TabConfig {
  /** Unique identifier for the tab */
  id: StudyTab;
  /** Display label for the tab */
  label: string;
  /** Icon to display (optional) */
  icon?: React.ReactNode;
  /** Whether the tab is disabled */
  disabled?: boolean;
  /** Badge content (e.g., count or status) */
  badge?: string | number;
}

/**
 * Props for the StudyTabNavigation component
 */
export interface StudyTabNavigationProps {
  /** Currently active tab */
  activeTab: StudyTab;
  /** Callback when tab changes */
  onTabChange: (tab: StudyTab) => void;
  /** Custom tab configurations (optional - uses defaults if not provided) */
  tabs?: TabConfig[];
  /** Additional CSS class names */
  className?: string;
}

/**
 * Default tab configurations
 */
const DEFAULT_TABS: TabConfig[] = [
  {
    id: 'introduction',
    label: 'Introduction',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
    )
  },
  {
    id: 'foundation',
    label: 'Foundation',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
      </svg>
    )
  },
  {
    id: 'deepdive',
    label: 'Deep Dive',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
          clipRule="evenodd"
        />
      </svg>
    )
  },
  {
    id: 'examples',
    label: 'Examples',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
      </svg>
    )
  },
  {
    id: 'practice',
    label: 'Practice',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
          clipRule="evenodd"
        />
      </svg>
    )
  }
];

/**
 * Tab navigation component with keyboard support and accessibility features.
 * Supports arrow key navigation between tabs.
 */
export function StudyTabNavigation({
  activeTab,
  onTabChange,
  tabs = DEFAULT_TABS,
  className = ''
}: StudyTabNavigationProps) {
  const tabListRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<StudyTab, HTMLButtonElement>>(new Map());

  // Get list of enabled tabs for keyboard navigation
  const enabledTabs = tabs.filter((tab) => !tab.disabled);

  // Find current tab index in enabled tabs
  const currentIndex = enabledTabs.findIndex((tab) => tab.id === activeTab);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      let newIndex = currentIndex;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : enabledTabs.length - 1;
          break;
        case 'ArrowRight':
          event.preventDefault();
          newIndex = currentIndex < enabledTabs.length - 1 ? currentIndex + 1 : 0;
          break;
        case 'Home':
          event.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          event.preventDefault();
          newIndex = enabledTabs.length - 1;
          break;
        default:
          return;
      }

      const newTab = enabledTabs[newIndex];
      if (newTab) {
        onTabChange(newTab.id);
        // Focus the new tab
        const tabElement = tabRefs.current.get(newTab.id);
        if (tabElement) {
          tabElement.focus();
        }
      }
    },
    [currentIndex, enabledTabs, onTabChange]
  );

  /**
   * Store ref for each tab button
   */
  const setTabRef = useCallback((tab: StudyTab, element: HTMLButtonElement | null) => {
    if (element) {
      tabRefs.current.set(tab, element);
    } else {
      tabRefs.current.delete(tab);
    }
  }, []);

  return (
    <div className={`w-full ${className}`.trim()}>
      {/* Tab list container */}
      <div
        ref={tabListRef}
        role="tablist"
        aria-label="Study mode sections"
        className="flex items-center gap-1 p-1 rounded-lg bg-muted/50 border border-border overflow-x-auto"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const isDisabled = tab.disabled === true;

          return (
            <button
              key={tab.id}
              ref={(el) => setTabRef(tab.id, el)}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              aria-disabled={isDisabled}
              tabIndex={isActive ? 0 : -1}
              disabled={isDisabled}
              onClick={() => !isDisabled && onTabChange(tab.id)}
              onKeyDown={handleKeyDown}
              className={`
                relative flex items-center gap-2 px-4 py-2.5 rounded-md font-medium text-sm
                whitespace-nowrap transition-all duration-200
                focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background
                ${
                  isActive
                    ? 'bg-card text-foreground shadow-sm'
                    : isDisabled
                      ? 'text-muted-foreground/50 cursor-not-allowed'
                      : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                }
              `}
            >
              {/* Icon */}
              {tab.icon && (
                <span
                  className={`flex-shrink-0 ${
                    isActive ? 'text-accent' : isDisabled ? 'text-muted-foreground/50' : ''
                  }`}
                >
                  {tab.icon}
                </span>
              )}

              {/* Label */}
              <span>{tab.label}</span>

              {/* Badge */}
              {tab.badge !== undefined && (
                <span
                  className={`
                    ml-1 px-1.5 py-0.5 text-xs font-semibold rounded-full
                    ${
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-muted text-muted-foreground'
                    }
                  `}
                >
                  {tab.badge}
                </span>
              )}

              {/* Active indicator */}
              {isActive && (
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-accent rounded-full"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Screen reader instructions */}
      <div className="sr-only" aria-live="polite">
        Use left and right arrow keys to navigate between tabs. Press Enter or Space to activate a
        tab.
      </div>
    </div>
  );
}

/**
 * Tab panel component for content associated with a tab
 */
export interface StudyTabPanelProps {
  /** The tab this panel is associated with */
  tabId: StudyTab;
  /** Whether this panel is currently active */
  isActive: boolean;
  /** The content to render */
  children: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Container for tab panel content with proper ARIA attributes
 */
export function StudyTabPanel({
  tabId,
  isActive,
  children,
  className = ''
}: StudyTabPanelProps) {
  if (!isActive) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${tabId}`}
      aria-labelledby={`tab-${tabId}`}
      tabIndex={0}
      className={`focus:outline-none ${className}`.trim()}
    >
      {children}
    </div>
  );
}
