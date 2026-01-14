# Distributive Method Partition Selection Issues

**Date**: 2026-01-04
**Issue**: 3+ digit numbers use place-value decomposition instead of round-number partitions

## Executive Summary

The `chooseOptimalPartition` function in `src/lib/core/methods/distributive.ts` immediately falls back to `decomposeFullPlaceValue` for any 3+ digit number, bypassing all round-number optimization logic.

**Example**: For 251 x 36, the method uses (200+50+1) x 36 instead of the simpler (250+1) x 36.

## Problem Analysis

### Current Logic Flow (Lines 286-340)

```typescript
private chooseOptimalPartition(n: number): Partition {
  const digitCount = this.countDigits(n);

  // For 3+ digit numbers, use full place-value decomposition
  if (digitCount >= 3) {
    const parts = this.decomposeFullPlaceValue(n);
    return { type: 'multi-additive', ... };  // ALWAYS returns here!
  }

  // Round-number checking code below is NEVER REACHED for 3+ digits!
  const lowerRound = Math.floor(n / 10) * 10;
  // ...
}
```

## Key Examples

| Problem | Current Partition | Optimal Partition | Cognitive Steps |
|---------|-------------------|-------------------|-----------------|
| 251 x 36 | (200 + 50 + 1) x 36 | (250 + 1) x 36 | 5 vs 3 |
| 499 x 17 | (400 + 90 + 9) x 17 | (500 - 1) x 17 | 5 vs 3 |
| 999 x 37 | (900 + 90 + 9) x 37 | (1000 - 1) x 37 | 5 vs 3 |
| 748 x 23 | (700 + 40 + 8) x 23 | (750 - 2) x 23 | 5 vs 3 |
| 126 x 45 | (100 + 20 + 6) x 45 | (125 + 1) x 45 | 5 vs 3 |

### Why 250 x 36 is Easy
- 25 x 36 = 900
- Append 0 = 9000
- Much simpler than 200 x 36 + 50 x 36 + 1 x 36

## Proposed Fix

### Priority 1: Remove Early 3+ Digit Bailout

Remove the early return for 3+ digit numbers at lines 291-305. Apply the same round-number optimization logic to all number sizes.

### Priority 2: Expand Round Number Candidates

Check multiples of 10, 25, 50, 100, 250, 500, 1000:

```typescript
private findNearbyRoundNumbers(n: number): number[] {
  const roundNumbers: number[] = [];
  const bases = [10, 25, 50, 100, 250, 500, 1000];
  const maxDistance = Math.max(10, Math.floor(n * 0.05));

  for (const base of bases) {
    if (base > n * 2) continue;
    const lower = Math.floor(n / base) * base;
    const upper = lower + base;

    if (lower > 0 && n - lower <= maxDistance) roundNumbers.push(lower);
    if (upper - n <= maxDistance) roundNumbers.push(upper);
  }

  return [...new Set(roundNumbers)].sort((a, b) =>
    Math.abs(n - a) - Math.abs(n - b)
  );
}
```

### Priority 3: Implement Cognitive Cost Comparison

Replace fixed thresholds (distance <= 5) with actual cognitive cost comparison between partition strategies.

## Before/After Comparison

### 251 x 36

**BEFORE**: (200 + 50 + 1) x 36
- 200 x 36 = 7200
- 50 x 36 = 1800
- 1 x 36 = 36
- 7200 + 1800 + 36 = 9036
- **Steps**: 3 mult, 2 add

**AFTER**: (250 + 1) x 36
- 250 x 36 = 9000 (25 x 36 = 900, append 0)
- 1 x 36 = 36
- 9000 + 36 = 9036
- **Steps**: 2 mult, 1 add

**Expected improvement**: 30-50% reduction in cognitive steps for numbers near round values.

## Files to Modify

- `src/lib/core/methods/distributive.ts`
  - `chooseOptimalPartition` function (lines 286-340)
  - Add new `findNearbyRoundNumbers` helper
  - Add `estimatePartitionCost` function
