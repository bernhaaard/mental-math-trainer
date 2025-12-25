# PR Review Workflow - Agent-Based Quality Gates

## Overview

All PRs go through a rigorous 3-agent review process. **ANY issue found by ANY agent blocks merge until fixed.** No exceptions.

## Review Agents

### 1. Critical Code Reviewer
**Focus:** Code quality, type safety, correctness, maintainability
**Prompt:** `.claude/prompts/critical-code-reviewer.md`
**Blocking Issues:**
- Any `any` type
- Missing error handling
- Logic errors
- Type safety violations
- Code duplication
- Missing documentation

### 2. Security Reviewer
**Focus:** Vulnerabilities, injection attacks, data exposure
**Prompt:** `.claude/prompts/security-reviewer.md`
**Blocking Issues:**
- Any vulnerability (critical or high)
- Unsafe input handling
- Expression evaluation risks
- Data exposure
- Missing validation

### 3. Critical Bug Finder
**Focus:** Edge cases, boundary conditions, failure modes
**Prompt:** `.claude/prompts/critical-bug-finder.md`
**Blocking Issues:**
- Any critical or high bug
- Mathematical incorrectness
- Unhandled edge cases
- Crash conditions

## Review Process

```
PR Created
    │
    ▼
┌─────────────────────────────────────────┐
│     PARALLEL AGENT REVIEWS              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │  Code   │ │Security │ │   Bug   │   │
│  │Reviewer │ │Reviewer │ │ Finder  │   │
│  └────┬────┘ └────┬────┘ └────┬────┘   │
│       │           │           │         │
│       ▼           ▼           ▼         │
│  [Issues?]   [Issues?]   [Issues?]      │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ ANY ISSUES FOUND?                       │
│                                         │
│ YES ─────────────────────────────────►  │
│  │                                      │
│  ▼                                      │
│ Refiner Agent fixes ALL issues          │
│  │                                      │
│  ▼                                      │
│ Re-run ALL reviews (no shortcuts)       │
│  │                                      │
│  └──────────────────────► Loop back     │
│                                         │
│ NO ──────────────────────────────────►  │
│  │                                      │
│  ▼                                      │
│ ALL THREE AGENTS APPROVE                │
│  │                                      │
│  ▼                                      │
│ MERGE TO MAIN                           │
└─────────────────────────────────────────┘
```

## Approval Criteria

A PR can ONLY merge when:

1. **Code Reviewer says:** "APPROVED - No blockers or critical issues"
2. **Security Reviewer says:** "SECURE - No critical or high-risk issues"
3. **Bug Finder says:** "CLEAN - No critical or high bugs"
4. **CI passes:** All tests pass, coverage thresholds met

## Issue Resolution Loop

When ANY issue is found:

1. **Collect all issues** from all three reviewers
2. **Refiner agent** addresses EVERY issue systematically
3. **Commit fixes** with references to specific issues
4. **Re-run ALL THREE reviews** - no partial reviews
5. **Repeat** until all three approve

## Human Escalation Triggers

Require human review ONLY when:

- [ ] Architectural decision with long-term implications
- [ ] Multiple valid approaches with trade-offs
- [ ] Security concern requiring domain expertise
- [ ] Requirement ambiguity affecting implementation
- [ ] Third-party integration decisions
- [ ] Performance vs correctness trade-off

## Review Commands

Run reviews using Task tool with specialized agents:

```
# Code Review
Task(subagent_type="code-reviewer", prompt="Review PR #X following .claude/prompts/critical-code-reviewer.md")

# Security Review
Task(subagent_type="penetration-tester", prompt="Review PR #X following .claude/prompts/security-reviewer.md")

# Bug Finding
Task(subagent_type="debugger", prompt="Review PR #X following .claude/prompts/critical-bug-finder.md")
```

## Quality Standards

### Zero Tolerance
- `any` types
- Missing error handling
- Security vulnerabilities
- Mathematical errors
- Unhandled edge cases

### Strict Standards
- 90% test coverage for core logic
- 80% test coverage overall
- All public APIs documented
- No code duplication
- Functions under 30 lines

### Best Practices
- Self-documenting code
- Consistent naming
- Early returns
- Proper TypeScript patterns

## Review Checklist Summary

Before approving, each reviewer must verify:

**Code Reviewer:**
- [ ] Type safety complete
- [ ] Error handling complete
- [ ] Code quality standards met
- [ ] Logic correctness verified
- [ ] Documentation present

**Security Reviewer:**
- [ ] Input validation complete
- [ ] No injection vulnerabilities
- [ ] Expression evaluation secure
- [ ] No data exposure
- [ ] Dependencies verified

**Bug Finder:**
- [ ] Boundary conditions tested
- [ ] Edge cases handled
- [ ] Mathematical correctness verified
- [ ] State management correct
- [ ] Error recovery works
