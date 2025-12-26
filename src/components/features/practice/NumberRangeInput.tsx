'use client';

import type { CustomRange } from '@/lib/types/problem';
import { ABSOLUTE_MAX_VALUE, ABSOLUTE_MIN_VALUE } from '@/lib/types/problem';
import { useMemo } from 'react';

interface NumberRangeInputProps {
  value: CustomRange;
  onChange: (range: CustomRange) => void;
  allowNegatives: boolean;
}

interface ValidationErrors {
  num1Min?: string;
  num1Max?: string;
  num2Min?: string;
  num2Max?: string;
}

/**
 * Compute validation errors from props (pure function, no side effects)
 */
function computeErrors(value: CustomRange, absoluteMin: number, absoluteMax: number): ValidationErrors {
  const errors: ValidationErrors = {};

  // Validate num1 range
  if (value.num1Min < absoluteMin) {
    errors.num1Min = `Minimum must be at least ${absoluteMin}`;
  }
  if (value.num1Max > absoluteMax) {
    errors.num1Max = `Maximum must be at most ${absoluteMax.toLocaleString()}`;
  }
  if (value.num1Min >= value.num1Max) {
    errors.num1Min = 'Minimum must be less than maximum';
  }

  // Validate num2 range
  if (value.num2Min < absoluteMin) {
    errors.num2Min = `Minimum must be at least ${absoluteMin}`;
  }
  if (value.num2Max > absoluteMax) {
    errors.num2Max = `Maximum must be at most ${absoluteMax.toLocaleString()}`;
  }
  if (value.num2Min >= value.num2Max) {
    errors.num2Min = 'Minimum must be less than maximum';
  }

  return errors;
}

/**
 * NumberRangeInput - Custom number range configuration component
 * Allows users to specify min/max bounds for both operands independently
 */
export function NumberRangeInput({ value, onChange, allowNegatives }: NumberRangeInputProps) {
  const absoluteMin = allowNegatives ? ABSOLUTE_MIN_VALUE : 1;
  const absoluteMax = ABSOLUTE_MAX_VALUE;

  // Derive errors from props instead of using state + effect
  const errors = useMemo(
    () => computeErrors(value, absoluteMin, absoluteMax),
    [value, absoluteMin, absoluteMax]
  );

  const handleChange = (field: keyof CustomRange, inputValue: string) => {
    const numValue = parseInt(inputValue, 10);
    if (isNaN(numValue)) return;

    const newRange: CustomRange = {
      ...value,
      [field]: numValue
    };

    onChange(newRange);
  };

  return (
    <div className="space-y-6">
      {/* First Operand Range */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">First Number Range</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="num1Min" className="block text-sm font-medium text-muted-foreground mb-1">
              Minimum
            </label>
            <input
              id="num1Min"
              type="number"
              value={value.num1Min}
              onChange={(e) => handleChange('num1Min', e.target.value)}
              min={absoluteMin}
              max={absoluteMax}
              className={`
                w-full px-3 py-2 rounded-lg
                bg-card border-2
                text-foreground
                transition-colors
                focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                ${errors.num1Min
                  ? 'border-error focus:ring-error'
                  : 'border-border hover:border-muted-foreground'}
              `}
            />
            {errors.num1Min && (
              <p className="mt-1 text-xs text-error">{errors.num1Min}</p>
            )}
          </div>

          <div>
            <label htmlFor="num1Max" className="block text-sm font-medium text-muted-foreground mb-1">
              Maximum
            </label>
            <input
              id="num1Max"
              type="number"
              value={value.num1Max}
              onChange={(e) => handleChange('num1Max', e.target.value)}
              min={absoluteMin}
              max={absoluteMax}
              className={`
                w-full px-3 py-2 rounded-lg
                bg-card border-2
                text-foreground
                transition-colors
                focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                ${errors.num1Max
                  ? 'border-error focus:ring-error'
                  : 'border-border hover:border-muted-foreground'}
              `}
            />
            {errors.num1Max && (
              <p className="mt-1 text-xs text-error">{errors.num1Max}</p>
            )}
          </div>
        </div>
      </div>

      {/* Second Operand Range */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Second Number Range</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="num2Min" className="block text-sm font-medium text-muted-foreground mb-1">
              Minimum
            </label>
            <input
              id="num2Min"
              type="number"
              value={value.num2Min}
              onChange={(e) => handleChange('num2Min', e.target.value)}
              min={absoluteMin}
              max={absoluteMax}
              className={`
                w-full px-3 py-2 rounded-lg
                bg-card border-2
                text-foreground
                transition-colors
                focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                ${errors.num2Min
                  ? 'border-error focus:ring-error'
                  : 'border-border hover:border-muted-foreground'}
              `}
            />
            {errors.num2Min && (
              <p className="mt-1 text-xs text-error">{errors.num2Min}</p>
            )}
          </div>

          <div>
            <label htmlFor="num2Max" className="block text-sm font-medium text-muted-foreground mb-1">
              Maximum
            </label>
            <input
              id="num2Max"
              type="number"
              value={value.num2Max}
              onChange={(e) => handleChange('num2Max', e.target.value)}
              min={absoluteMin}
              max={absoluteMax}
              className={`
                w-full px-3 py-2 rounded-lg
                bg-card border-2
                text-foreground
                transition-colors
                focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                ${errors.num2Max
                  ? 'border-error focus:ring-error'
                  : 'border-border hover:border-muted-foreground'}
              `}
            />
            {errors.num2Max && (
              <p className="mt-1 text-xs text-error">{errors.num2Max}</p>
            )}
          </div>
        </div>
      </div>

      {/* Validation Summary */}
      {Object.keys(errors).length > 0 && (
        <div className="p-3 rounded-lg bg-error/10 border border-error/30">
          <p className="text-sm font-medium text-error">
            Please correct the errors above before continuing
          </p>
        </div>
      )}
    </div>
  );
}
