'use client';

import { MethodName } from '@/lib/types/method';

interface MethodSelectorProps {
  value: MethodName[];
  onChange: (methods: MethodName[]) => void;
}

interface MethodCardData {
  method: MethodName;
  displayName: string;
  shortDescription: string;
  example: string;
}

const METHOD_CARDS: MethodCardData[] = [
  {
    method: MethodName.Distributive,
    displayName: 'Distributive Property',
    shortDescription: 'Break numbers into parts and multiply separately',
    example: '47 × 53 = (40 + 7) × 53'
  },
  {
    method: MethodName.NearPower10,
    displayName: 'Near Powers of 10',
    shortDescription: 'Use proximity to 10, 100, 1000, etc.',
    example: '47 × 100 = 47 × (100)'
  },
  {
    method: MethodName.DifferenceSquares,
    displayName: 'Difference of Squares',
    shortDescription: 'Use (a-b)(a+b) = a² - b² pattern',
    example: '47 × 53 = 50² - 3²'
  },
  {
    method: MethodName.Factorization,
    displayName: 'Factorization',
    shortDescription: 'Break down into prime factors',
    example: '24 × 35 = (8×3) × (7×5)'
  },
  {
    method: MethodName.Squaring,
    displayName: 'Squaring',
    shortDescription: 'Special techniques for n × n',
    example: '73² = (70 + 3)²'
  },
  {
    method: MethodName.Near100,
    displayName: 'Near 100',
    shortDescription: 'Optimized for numbers close to 100',
    example: '98 × 87 = (100-2) × (100-13)'
  }
];

/**
 * MethodSelector - Checkbox group for selecting calculation methods
 * Allows users to choose which methods they want to practice
 */
export function MethodSelector({ value, onChange }: MethodSelectorProps) {
  const isAllSelected = value.length === 0; // Empty array means "all methods"
  const selectedCount = value.length;

  const handleToggleMethod = (method: MethodName) => {
    if (value.includes(method)) {
      // Remove method - but keep at least one
      const newValue = value.filter(m => m !== method);
      onChange(newValue.length > 0 ? newValue : [method]);
    } else {
      // Add method
      onChange([...value, method]);
    }
  };

  const handleSelectAll = () => {
    onChange([]); // Empty array means all methods
  };

  const handleClearAll = () => {
    // Keep only the first method (Distributive is always available)
    onChange([MethodName.Distributive]);
  };

  return (
    <div className="space-y-4">
      {/* Header with bulk actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Calculation Methods
        </h3>

        <div className="flex gap-2">
          <button
            onClick={handleSelectAll}
            disabled={isAllSelected}
            className="
              px-3 py-1 text-xs font-medium rounded-md
              bg-secondary text-secondary-foreground
              hover:bg-secondary/80
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
              focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background
            "
          >
            All Methods
          </button>

          <button
            onClick={handleClearAll}
            disabled={selectedCount === 1}
            className="
              px-3 py-1 text-xs font-medium rounded-md
              bg-secondary text-secondary-foreground
              hover:bg-secondary/80
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
              focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background
            "
          >
            Clear
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
        <p className="text-xs text-foreground">
          {isAllSelected ? (
            <>
              <span className="font-medium">System will choose optimal methods</span>
              {' - '}
              The algorithm will select the best technique for each problem
            </>
          ) : selectedCount === 1 ? (
            <>
              <span className="font-medium">Practicing 1 method</span>
              {' - '}
              All problems will use {METHOD_CARDS.find(m => m.method === value[0])?.displayName ?? 'selected method'}
            </>
          ) : (
            <>
              <span className="font-medium">Practicing {selectedCount} methods</span>
              {' - '}
              System will choose from selected methods based on problem structure
            </>
          )}
        </p>
      </div>

      {/* Method checkboxes */}
      <div className="space-y-2">
        {METHOD_CARDS.map((card) => {
          const isSelected = isAllSelected || value.includes(card.method);

          return (
            <label
              key={card.method}
              className={`
                flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer
                transition-all group
                ${isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-muted-foreground hover:shadow-sm'}
              `}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleToggleMethod(card.method)}
                disabled={isAllSelected}
                className="
                  mt-0.5 w-4 h-4 rounded border-2 border-border
                  text-primary focus:ring-2 focus:ring-ring focus:ring-offset-1
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors
                "
              />

              <div className="flex-1 min-w-0">
                <h4 className={`
                  text-sm font-semibold mb-1
                  ${isSelected ? 'text-primary' : 'text-foreground'}
                `}>
                  {card.displayName}
                </h4>

                <p className="text-xs text-muted-foreground mb-2">
                  {card.shortDescription}
                </p>

                <p className="text-xs font-mono text-muted-foreground/80 bg-muted/30 px-2 py-1 rounded inline-block">
                  {card.example}
                </p>
              </div>
            </label>
          );
        })}
      </div>

      {/* Validation warning */}
      {!isAllSelected && selectedCount === 0 && (
        <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
          <p className="text-sm text-warning">
            Please select at least one method
          </p>
        </div>
      )}
    </div>
  );
}
