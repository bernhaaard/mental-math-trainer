# Mental Math Mastery - Development Guide

**Tech Stack**: Next.js 14+, TypeScript (strict), Tailwind CSS, IndexedDB
**Quality Standard**: 90%+ test coverage, 100% mathematical correctness

---

## Core Philosophy

**QUALITY over SPEED. CORRECTNESS over CONVENIENCE.**

A single arithmetic error is unacceptable. An unclear explanation defeats the purpose. Every line of code must serve mathematical accuracy and educational effectiveness.

### Non-Negotiables

| Requirement | Standard |
|-------------|----------|
| Mathematical correctness | 100% - every solution must be verifiable |
| TypeScript | Strict mode, zero `any` types |
| Test coverage | 90% core logic, 80% overall |
| Validation | Every generated solution passes SolutionValidator |
| Performance | Solution generation < 5 seconds |

---

## Documentation Structure

This project uses modular documentation. Consult the right guide for your task:

### Quick Reference
| Need | Document |
|------|----------|
| Technical specifications | `docs/PROJECT_REQUIREMENTS.md` |
| Project overview | `docs/OVERVIEW.md` |
| All documentation | `docs/INDEX.md` |

### Implementation Phases
| Phase | Guide | When to Use |
|-------|-------|-------------|
| 1: Foundation | `docs/implementation/phase-1-foundation.md` | Setting up TypeScript, types, validator |
| 2: Methods | `docs/implementation/phase-2-methods.md` | Implementing calculation methods |
| 3: Selector | `docs/implementation/phase-3-method-selector.md` | Method selection algorithm |
| 4: Practice | `docs/implementation/phase-4-practice-mode.md` | Practice mode UI and flow |
| 5: Study | `docs/implementation/phase-5-study-mode.md` | Study content and curriculum |
| 6: Statistics | `docs/implementation/phase-6-statistics.md` | Dashboard and analytics |
| 7: Polish | `docs/implementation/phase-7-testing-polish.md` | Final testing and optimization |

### Process Guides
| Topic | Guide | When to Use |
|-------|-------|-------------|
| Testing | `docs/guides/testing-strategy.md` | Writing and organizing tests |
| Code quality | `docs/guides/code-quality-standards.md` | TypeScript patterns, naming |
| Git workflow | `docs/guides/git-workflow-details.md` | Branches, PRs, worktrees |
| Validation | `docs/guides/mathematical-validation.md` | Ensuring correctness |
| Troubleshooting | `docs/guides/emergency-protocols.md` | When things go wrong |

### Code Examples
| Example | File | When to Use |
|---------|------|-------------|
| Validator implementation | `docs/examples/validation-system-implementation.md` | Reference implementation |
| Method template | `docs/examples/method-implementation-example.md` | Implementing new methods |
| Test patterns | `docs/examples/test-suite-example.md` | Writing comprehensive tests |

---

## Subagent Workflow

Development uses specialized agents in an iterative quality loop. Each agent has a distinct role and perspective.

### Agent Roles

```
┌─────────────────────────────────────────────────────────────────┐
│                      ORCHESTRATOR AGENT                          │
│  Creates initial issues, manages phases, coordinates workflow    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ Creates GitHub Issues
┌─────────────────────────────────────────────────────────────────┐
│                       BUILDER AGENT                              │
│  Implements features from issues, writes tests, opens PRs        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ Opens PR
┌─────────────────────────────────────────────────────────────────┐
│                    CODE REVIEWER AGENT                           │
│  Reviews for correctness, maintainability, standards             │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
              Issues Found?        No Issues
                    │                   │
                    ▼                   │
┌─────────────────────────────┐        │
│      REFINER AGENT          │        │
│  Addresses review feedback  │        │
└─────────────────────────────┘        │
          │                            │
          └────────────────────────────┤
                                       ▼
              ┌────────────────────────────────────────┐
              │                                        │
              ▼                                        ▼
┌─────────────────────────────┐    ┌─────────────────────────────┐
│     QA REVIEWER AGENT       │    │     BUG FINDER AGENT        │
│  Validates tests, coverage, │    │  Tests edge cases, security,│
│  mathematical correctness   │    │  error handling             │
└─────────────────────────────┘    └─────────────────────────────┘
              │                                        │
              └────────────┬───────────────────────────┘
                           ▼
                    Both Approve?
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
         No → Back to Refiner      Yes → Merge
```

### Agent Prompt Files

Each agent has detailed instructions in `.claude/prompts/`:

| Agent | Prompt File | Primary Responsibility |
|-------|-------------|------------------------|
| Orchestrator | `orchestrator-agent.md` | Creates issues, manages phases |
| Builder | `builder-agent.md` | Implements from issues |
| Code Reviewer | `code-reviewer-agent.md` | Reviews correctness |
| Refiner | `refiner-agent.md` | Addresses feedback |
| QA Reviewer | `qa-reviewer-agent.md` | Validates tests |
| Bug Finder | `bug-finder-agent.md` | Finds edge cases |

### Issue Creation Flow

Issues are created by:
1. **Orchestrator**: Initial feature issues defining scope
2. **Code Reviewer**: Improvement issues found during review
3. **QA Reviewer**: Testing gap issues
4. **Bug Finder**: Bug and edge case issues

Builder Agent picks up issues and implements them—never creates own scope.

---

## Git Workflow

### Branch Naming

```
<type>/<issue-number>-<short-description>
```

| Type | Purpose | Example |
|------|---------|---------|
| `feat/` | New features | `feat/42-validation-system` |
| `fix/` | Bug fixes | `fix/43-negative-handling` |
| `refactor/` | Restructuring | `refactor/44-cost-calc` |
| `test/` | Test improvements | `test/45-edge-cases` |

### Commit Messages

```bash
git commit -m "feat: add expression validator (#42)"
git commit -m "fix: handle negative numbers (#42)"
git commit -m "test: add boundary value tests (#42)"
```

Always reference issue number.

### PR Requirements

Every PR requires:
- Linked issue (auto-closes on merge)
- All tests passing
- Coverage thresholds met
- Two approvals: QA Reviewer + Bug Finder

### Critical Rules

- No direct commits to main
- No PR merges without both approvals
- Failed tests block merge
- Coverage below threshold blocks merge
- No `any` types block merge

---

## Quality Gates

### Coverage Thresholds

| Component | Minimum |
|-----------|---------|
| Core calculation methods | 95% |
| Validation system | 95% |
| Method selector | 90% |
| Overall | 80% |

### Phase Exit Criteria

**Phase 1 (Foundation)**:
- TypeScript compiles without errors
- Validator catches all error types
- Core types complete, no `any`

**Phase 2 (Methods)**:
- All 6 methods implemented
- 100% validation pass rate
- 100 random problems verified per method

**Phase 3 (Selector)**:
- Optimal method chosen for test cases
- Cross-validation confirms consistency
- Performance < 100ms

**Phases 4-7**: See respective guide documents.

---

## Project Structure

```
mental-math-trainer/
├── src/
│   ├── app/                    # Next.js pages
│   │   ├── practice/
│   │   ├── study/
│   │   └── statistics/
│   ├── components/
│   │   ├── ui/                 # Reusable components
│   │   └── features/           # Feature-specific
│   ├── lib/
│   │   ├── core/               # Business logic
│   │   │   ├── methods/        # 6 calculation methods
│   │   │   └── validator.ts    # Solution validation
│   │   ├── storage/            # IndexedDB
│   │   └── types/              # TypeScript definitions
│   └── tests/
│       ├── unit/
│       └── integration/
├── docs/
│   ├── implementation/         # Phase guides
│   ├── guides/                 # Process guides
│   └── examples/               # Reference code
├── .claude/
│   └── prompts/                # Agent prompts
└── .github/
    ├── ISSUE_TEMPLATE/
    └── workflows/              # CI configuration
```

---

## The Six Calculation Methods

| Method | When Optimal | Example |
|--------|--------------|---------|
| Distributive | Fallback / general | Any multiplication |
| Near Power of 10 | One number near 10/100/1000 | 98 × 47 |
| Difference of Squares | Symmetric around midpoint | 47 × 53 |
| Factorization | Numbers with small factors | 24 × 35 |
| Squaring | Same number twice | 73 × 73 |
| Near-100 | Both numbers near 100 | 98 × 87 |

Each method must:
1. Implement `isApplicable()` correctly
2. Generate solutions that pass validation
3. Provide clear educational explanations
4. Have comprehensive test coverage

See `docs/implementation/phase-2-methods.md` for complete implementation details.

---

## Validation System

The `SolutionValidator` is the cornerstone of correctness.

### What It Validates

1. **Final answer** matches direct multiplication
2. **Each step** evaluates correctly
3. **Sub-steps** are mathematically sound
4. **Expressions** are safe (no injection)

### Usage Pattern

```typescript
const solution = method.generateSolution(num1, num2);
const validation = SolutionValidator.validateSolution(num1, num2, solution);

if (!validation.valid) {
  throw new Error(`Invalid solution: ${validation.errors.join('; ')}`);
}
```

See `docs/guides/mathematical-validation.md` for details.

---

## Development Commands

```bash
# Development
npm run dev           # Start development server
npm run build         # Build for production
npm run lint          # Run ESLint

# Testing
npm test              # Run all tests
npm run test:coverage # With coverage report
npm test -- --watch   # Watch mode

# Git workflow
gh issue create       # Create new issue
gh pr create          # Create pull request
gh pr view            # View PR status
```

---

## Emergency Protocols

### Validation Failure

1. **STOP** - Don't ship invalid solutions
2. Identify failing step from error message
3. Review mathematical foundation in PROJECT_REQUIREMENTS.md
4. Fix implementation, add regression test
5. Verify with manual spot-check

### Tests Not Passing

1. Read test code carefully
2. Determine if test or implementation is wrong
3. Fix the correct one with clear commit message
4. Never disable tests

### Stuck on Problem

1. Re-read PROJECT_REQUIREMENTS.md
2. Check if following agent workflow correctly
3. Break into smaller pieces
4. Return to mathematical fundamentals

See `docs/guides/emergency-protocols.md` for detailed troubleshooting.

---

## Workflow Execution

### Starting a Feature

1. Orchestrator creates issue with acceptance criteria
2. Builder picks up issue, creates branch
3. Builder implements with tests
4. Builder opens PR

### During Review

1. Code Reviewer examines PR
2. If issues: Refiner addresses, requests re-review
3. Cycle until Code Reviewer approves
4. QA Reviewer + Bug Finder review in parallel
5. If issues: back to Refiner
6. Both approve → merge

### Completing a Phase

1. Verify all exit criteria met
2. Document completion
3. Orchestrator creates issues for next phase
4. Announce phase transition

---

## Success Criteria

The project is complete when:

**Functional**:
- All 6 methods work correctly
- Method selector chooses optimal approach
- Practice mode fully functional
- Study mode complete with content
- Statistics dashboard accurate
- Data persists across sessions

**Quality**:
- 90% core / 80% overall coverage
- Zero validation errors
- All solutions mathematically correct
- Performance benchmarks met
- Responsive across devices

**Process**:
- All features passed through agent workflow
- No outstanding critiques
- Clean git history
- Documentation complete

---

## Final Reminder

**Quality takes precedence over speed.**

When faced with a choice:
- Choose correctness over quickness
- Choose understanding over assumptions
- Choose comprehensive tests over "good enough"
- Choose explicit types over `any`
- Choose validation over trust

Every generated solution must be mathematically correct. Every explanation must reveal the underlying algebraic structure. Every user interaction must guide toward deeper mathematical understanding.
