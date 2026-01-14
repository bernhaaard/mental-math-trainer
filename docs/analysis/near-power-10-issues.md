# Near Power of 10 Method Cost Calculation Issues

**Date**: 2026-01-04
**Issue Count**: 35 cases where Near Power of 10 should have been selected

## Executive Summary

The `costForNumber` function in `src/lib/core/methods/near-power-10.ts` calculates cost incorrectly for multiples of 10 (20, 30, 90, etc.). It treats 90 as "10 away from 100" but ignores that 90 = 9 x 10, and multiplying by 10 is FREE.

## Problem Analysis

### Current Cost Formula (Lines 89-93)

```typescript
private costForNumber(n: number): number {
  const { power, diff } = this.findNearestPowerOf10(n);
  return Math.abs(diff) + this.countDigits(power) * 0.5;
}
```

For 90 (nearest power is 100, diff = -10):
- Current cost: `|10| + countDigits(100) * 0.5 = 10 + 1.5 = 11.5`

**The problem**: This formula ignores that:
- 90 = 9 x 10
- Multiplying by 10 is cognitively FREE (just append a zero)
- The actual cognitive cost is just multiplying by 9

## Key Examples

| Problem | Current NP10 Cost | Should Be Cost | Current Winner | Should Win |
|---------|-------------------|----------------|----------------|------------|
| 317 x 90 | 11.5 | ~4.5 | Factorization | Near Power 10 |
| 2 x 90 | ~9.0 | ~4.5 | Distributive | Near Power 10 |
| 12 x 20 | N/A | ~1.0 | Factorization | Near Power 10 |
| 16 x 90 | N/A | ~4.5 | Factorization | Near Power 10 |

## Proposed Fix

Recognize clean multiples of powers of 10:

```typescript
private costForNumber(n: number): number {
  const abs = Math.abs(n);

  // Check for clean multiples of powers of 10 (20, 30, 40, ..., 200, 300, ...)
  for (const power of [1000, 100, 10]) {
    if (abs % power === 0) {
      const core = abs / power;
      if (core >= 1 && core <= 9) {
        // Cost = just the single-digit multiplication (zeros are FREE)
        return core <= 5 ? core * 0.3 : core * 0.5;
      }
    }
  }

  // Existing logic for numbers near (not multiples of) powers of 10
  const { power, diff } = this.findNearestPowerOf10(n);
  return Math.abs(diff) * 0.7;  // Remove digit penalty
}
```

## Key Insight

**Multiplying by powers of 10 is cognitively free.** The cost formula must recognize:
- 90 = 9 x 10, not "100 - 10"
- 20 = 2 x 10, cost = cost(2) + 0
- 300 = 3 x 100, cost = cost(3) + 0

## Files to Modify

- `src/lib/core/methods/near-power-10.ts` - `costForNumber` function (lines 89-93)
