# Emergency Protocols

This guide addresses common problems and their solutions.

---

## Validation Failure

**Symptom**: A method generates a solution that fails validation.

### Immediate Actions

1. **Stop development on that method**
2. **Do not ship invalid solutions**
3. **Investigate systematically**

### Investigation Steps

```typescript
// 1. Capture the failing case
const num1 = 47, num2 = 53;
const solution = method.generateSolution(num1, num2);
const validation = SolutionValidator.validateSolution(num1, num2, solution);

// 2. Log detailed information
console.log('Problem:', num1, '×', num2, '=', num1 * num2);
console.log('Method:', method.name);
console.log('Validation errors:', validation.errors);
console.log('Steps:', JSON.stringify(solution.steps, null, 2));

// 3. Manually verify each step
solution.steps.forEach((step, i) => {
  const computed = SolutionValidator.evaluateExpression(step.expression);
  console.log(`Step ${i}: ${step.expression} = ${computed} (claimed: ${step.result})`);
});
```

### Common Causes

| Cause | Solution |
|-------|----------|
| Expression doesn't match result | Fix the expression generation |
| Operator precedence issue | Add parentheses for clarity |
| Sign handling bug | Review negative number logic |
| Off-by-one in calculation | Trace through algorithm manually |

### Resolution

1. Fix the root cause in the method implementation
2. Add a test case for the failing input
3. Re-run all tests for that method
4. Manually verify several similar problems

---

## Tests Won't Pass

**Symptom**: Tests fail despite code appearing correct.

### Diagnostic Steps

```bash
# Run single test with verbose output
npm test -- --reporter=verbose path/to/failing.test.ts

# Run with debugging
npm test -- --inspect-brk
```

### Common Causes

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| Expected X but got undefined | Missing return | Add return statement |
| Floating point mismatch | Precision error | Use tolerance in comparison |
| Timeout | Infinite loop | Add iteration limit |
| Import error | Circular dependency | Restructure modules |

### When Test is Wrong

Sometimes the test is incorrect:

1. Verify the expected value by hand calculation
2. If test is wrong, fix it with clear commit message:
   ```bash
   git commit -m "fix: correct expected value in diff-squares test (#42)

   Previous test expected 2492 but 47×53 = 2491"
   ```

---

## Method Not Applicable When Expected

**Symptom**: `isApplicable()` returns false for numbers that should work.

### Debugging

```typescript
const method = selector.getMethod('difference-squares');
console.log('Is applicable:', method?.isApplicable(47, 53));

// Check the conditions manually
const sum = 47 + 53; // 100
const midpoint = sum / 2; // 50
const deviation = Math.abs(53 - 47) / 2; // 3
console.log('Midpoint:', midpoint);
console.log('Deviation:', deviation);
console.log('Sum is even:', sum % 2 === 0);
```

### Common Issues

| Method | Common Issue | Solution |
|--------|--------------|----------|
| difference-squares | Threshold too strict | Adjust deviation threshold |
| near-100 | One number not near enough | Check threshold value |
| factorization | No good factors found | Improve factor search |
| near-power-10 | Wrong nearest power | Fix nearest power calculation |

---

## Performance Problems

**Symptom**: Solution generation takes too long.

### Profiling

```typescript
const start = performance.now();
const result = selectOptimalMethod(num1, num2);
console.log(`Time: ${performance.now() - start}ms`);
```

### Common Causes

| Cause | Solution |
|-------|----------|
| Deep recursion | Add memoization or depth limit |
| Repeated calculations | Cache intermediate results |
| Brute force search | Use smarter algorithm |
| Creating many objects | Reuse objects where possible |

### Optimization Checklist

- [ ] Profile before optimizing
- [ ] Add memoization for repeated calculations
- [ ] Limit recursion depth
- [ ] Avoid creating unnecessary objects in loops
- [ ] Never sacrifice correctness for speed

---

## TypeScript Errors

**Symptom**: TypeScript compilation fails.

### Common Errors

```typescript
// Error: Property 'x' does not exist on type 'Y'
// Solution: Add the property or use correct type
interface Y {
  x: number; // Add missing property
}

// Error: Type 'X' is not assignable to type 'Y'
// Solution: Check types match or add type assertion
const value = someValue as ExpectedType;

// Error: Object is possibly 'undefined'
// Solution: Add null check
if (obj) {
  obj.property;
}
```

### Avoiding `any`

```typescript
// Instead of any:
function process(data: any) { }

// Use unknown and narrow:
function process(data: unknown) {
  if (typeof data === 'object' && data !== null && 'steps' in data) {
    // Now TypeScript knows data has 'steps'
  }
}
```

---

## Database/Storage Errors

**Symptom**: IndexedDB operations fail.

### Recovery Steps

```typescript
// 1. Check if DB exists
const databases = await indexedDB.databases();
console.log('Databases:', databases);

// 2. Delete corrupted database
await indexedDB.deleteDatabase('MentalMathDB');

// 3. Reinitialize
await statisticsStore.initialize();
```

### Preventing Data Loss

- Always wrap DB operations in try/catch
- Implement graceful degradation (work without persistence)
- Add export functionality for backup

---

## Git Problems

### Stuck in Bad State

```bash
# Reset uncommitted changes
git checkout -- .

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

### Merge Conflict

```bash
# 1. See conflicted files
git status

# 2. Edit files to resolve conflicts (remove <<<<, ====, >>>>)

# 3. Mark resolved
git add <file>

# 4. Continue
git rebase --continue  # if rebasing
git commit             # if merging
```

### Recover Deleted Branch

```bash
# Find the commit
git reflog

# Recreate branch
git checkout -b recovered-branch <commit-hash>
```

---

## Escalation

If you're truly stuck:

1. **Document the problem** completely
2. **Collect logs** and error messages
3. **Create minimal reproduction** case
4. **Step back** - re-read requirements and mathematical foundations
5. **Take a break** - fresh eyes often help

---

## Prevention

### Code Review Catches Issues

Ensure every PR has:
- Correct implementation review
- Edge case consideration
- Test coverage check

### Continuous Integration

CI should:
- Run all tests
- Check coverage thresholds
- Block merges on failure

### Regular Validation

Periodically:
- Run exhaustive random tests
- Manually verify sample solutions
- Check for performance regressions
