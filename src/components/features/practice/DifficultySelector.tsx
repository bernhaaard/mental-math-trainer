'use client';

import { DifficultyLevel, DIFFICULTY_RANGES } from '@/lib/types/problem';

interface DifficultySelectorProps {
  value: DifficultyLevel | 'custom';
  onChange: (level: DifficultyLevel | 'custom') => void;
}

// Define color keys as a type for type safety
type ColorKey = 'success' | 'primary' | 'accent' | 'warning' | 'error' | 'muted';

interface DifficultyCardData {
  level: DifficultyLevel | 'custom';
  label: string;
  description: string;
  range?: string;
  colorKey: ColorKey;
}

// Static Tailwind class mappings (dynamic classes don't work with Tailwind's purge)
const COLOR_STYLES: Record<ColorKey, { active: string; indicator: string; text: string }> = {
  success: {
    active: 'border-success bg-success/10',
    indicator: 'bg-success',
    text: 'text-success'
  },
  primary: {
    active: 'border-primary bg-primary/10',
    indicator: 'bg-primary',
    text: 'text-primary'
  },
  accent: {
    active: 'border-accent bg-accent/10',
    indicator: 'bg-accent',
    text: 'text-accent'
  },
  warning: {
    active: 'border-warning bg-warning/10',
    indicator: 'bg-warning',
    text: 'text-warning'
  },
  error: {
    active: 'border-error bg-error/10',
    indicator: 'bg-error',
    text: 'text-error'
  },
  muted: {
    active: 'border-muted-foreground bg-muted',
    indicator: 'bg-muted-foreground',
    text: 'text-muted-foreground'
  }
};

const DIFFICULTY_CARDS: DifficultyCardData[] = [
  {
    level: DifficultyLevel.Beginner,
    label: 'Beginner',
    description: 'Perfect for starting out',
    range: '2 - 100',
    colorKey: 'success'
  },
  {
    level: DifficultyLevel.Intermediate,
    label: 'Intermediate',
    description: 'Build confidence',
    range: '20 - 400',
    colorKey: 'primary'
  },
  {
    level: DifficultyLevel.Advanced,
    label: 'Advanced',
    description: 'Challenge yourself',
    range: '100 - 1,000',
    colorKey: 'accent'
  },
  {
    level: DifficultyLevel.Expert,
    label: 'Expert',
    description: 'Master the techniques',
    range: '500 - 10,000',
    colorKey: 'warning'
  },
  {
    level: DifficultyLevel.Mastery,
    label: 'Mastery',
    description: 'Ultimate challenge',
    range: '1,000 - 1,000,000',
    colorKey: 'error'
  },
  {
    level: 'custom',
    label: 'Custom',
    description: 'Set your own range',
    colorKey: 'muted'
  }
];

/**
 * DifficultySelector - Visual picker for difficulty levels
 * Displays each level as an interactive card with description and range
 */
export function DifficultySelector({ value, onChange }: DifficultySelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Difficulty Level</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {DIFFICULTY_CARDS.map((card) => {
          const isActive = value === card.level;
          const colorStyle = COLOR_STYLES[card.colorKey] ?? COLOR_STYLES.muted;

          return (
            <button
              key={card.level}
              onClick={() => onChange(card.level)}
              className={`
                relative p-4 rounded-lg border-2 transition-all
                text-left group
                focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background
                ${isActive
                  ? colorStyle.active
                  : 'border-border bg-card hover:border-muted-foreground hover:shadow-sm'}
              `}
              aria-pressed={isActive}
            >
              {/* Active indicator */}
              {isActive && (
                <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${colorStyle.indicator}`} />
              )}

              <div className="space-y-1">
                <h4 className={`
                  text-sm font-semibold
                  ${isActive ? colorStyle.text : 'text-foreground'}
                `}>
                  {card.label}
                </h4>

                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>

                {card.range && (
                  <p className={`
                    text-xs font-mono mt-2 pt-2 border-t
                    ${isActive ? 'border-current/20' : 'border-border'}
                    ${isActive ? 'text-foreground' : 'text-muted-foreground'}
                  `}>
                    Range: {card.range}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected difficulty info */}
      {value !== 'custom' && (
        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {DIFFICULTY_CARDS.find(c => c.level === value)?.label}
            </span>
            {' - '}
            Problems will use numbers from{' '}
            <span className="font-mono">
              {DIFFICULTY_RANGES[value as DifficultyLevel].min}
            </span>
            {' to '}
            <span className="font-mono">
              {DIFFICULTY_RANGES[value as DifficultyLevel].max.toLocaleString()}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
