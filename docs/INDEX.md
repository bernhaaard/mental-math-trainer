# Documentation Index

Complete navigation map for Mental Math Mastery project documentation.

---

## Quick Start

| Document | Purpose |
|----------|---------|
| [CLAUDE.md](../CLAUDE.md) | Main development guide and orchestration |
| [OVERVIEW.md](./OVERVIEW.md) | Quick project overview and key concepts |
| [PROJECT_REQUIREMENTS.md](./PROJECT_REQUIREMENTS.md) | Complete technical specifications |

---

## Implementation Phases

Step-by-step guides for each development phase.

| Phase | Document | Description |
|-------|----------|-------------|
| 1 | [phase-1-foundation.md](./implementation/phase-1-foundation.md) | TypeScript setup, types, validation system |
| 2 | [phase-2-methods.md](./implementation/phase-2-methods.md) | All 6 calculation method implementations |
| 3 | [phase-3-method-selector.md](./implementation/phase-3-method-selector.md) | Method selection algorithm |
| 4 | [phase-4-practice-mode.md](./implementation/phase-4-practice-mode.md) | Practice UI and session management |
| 5 | [phase-5-study-mode.md](./implementation/phase-5-study-mode.md) | Study content and curriculum |
| 6 | [phase-6-statistics.md](./implementation/phase-6-statistics.md) | Dashboard and analytics |
| 7 | [phase-7-testing-polish.md](./implementation/phase-7-testing-polish.md) | Final testing and optimization |

---

## Process Guides

How to do things the right way.

| Topic | Document | When to Use |
|-------|----------|-------------|
| Testing | [testing-strategy.md](./guides/testing-strategy.md) | Writing unit/integration tests |
| Code Quality | [code-quality-standards.md](./guides/code-quality-standards.md) | TypeScript patterns, naming |
| Git Workflow | [git-workflow-details.md](./guides/git-workflow-details.md) | Branches, PRs, worktrees |
| Validation | [mathematical-validation.md](./guides/mathematical-validation.md) | Ensuring correctness |
| Troubleshooting | [emergency-protocols.md](./guides/emergency-protocols.md) | When things go wrong |

---

## Code Examples

Reference implementations and templates.

| Example | Document | Use For |
|---------|----------|---------|
| Validator | [validation-system-implementation.md](./examples/validation-system-implementation.md) | SolutionValidator reference |
| Method Template | [method-implementation-example.md](./examples/method-implementation-example.md) | Implementing calculation methods |
| Test Suite | [test-suite-example.md](./examples/test-suite-example.md) | Comprehensive test patterns |

---

## Agent Prompts

Located in `.claude/prompts/`:

| Agent | File | Role |
|-------|------|------|
| Orchestrator | `orchestrator-agent.md` | Creates issues, manages phases |
| Builder | `builder-agent.md` | Implements from issues |
| Code Reviewer | `code-reviewer-agent.md` | Reviews for correctness |
| Refiner | `refiner-agent.md` | Addresses review feedback |
| QA Reviewer | `qa-reviewer-agent.md` | Validates tests and coverage |
| Bug Finder | `bug-finder-agent.md` | Finds edge cases and bugs |

---

## GitHub Templates

Located in `.github/`:

| Template | File | Purpose |
|----------|------|---------|
| Feature Issue | `ISSUE_TEMPLATE/feature.md` | New feature requests |
| Bug Report | `ISSUE_TEMPLATE/bug.md` | Bug reports |
| Pull Request | `PULL_REQUEST_TEMPLATE.md` | PR description template |
| CI Workflow | `workflows/ci.yml` | Automated testing |

---

## Navigation by Task

### "I need to implement a new feature"
1. Read [CLAUDE.md](../CLAUDE.md) for workflow overview
2. Check relevant [phase guide](./implementation/)
3. Use [code examples](./examples/) as reference
4. Follow [testing strategy](./guides/testing-strategy.md)

### "I need to review code"
1. Read your [agent prompt](../.claude/prompts/)
2. Check [code-quality-standards.md](./guides/code-quality-standards.md)
3. Verify [mathematical validation](./guides/mathematical-validation.md)

### "Something is broken"
1. Start with [emergency-protocols.md](./guides/emergency-protocols.md)
2. Check [mathematical-validation.md](./guides/mathematical-validation.md)
3. Review relevant [phase guide](./implementation/)

### "I need to understand the math"
1. Read [PROJECT_REQUIREMENTS.md](./PROJECT_REQUIREMENTS.md) mathematical foundations
2. Check [phase-2-methods.md](./implementation/phase-2-methods.md) for implementations
3. Review [method-implementation-example.md](./examples/method-implementation-example.md)

### "I need to set up git workflow"
1. Read [git-workflow-details.md](./guides/git-workflow-details.md)
2. Check GitHub templates in `.github/`
3. Review CI workflow in `.github/workflows/`

---

## Document Maintenance

When updating documentation:
- Keep this index in sync with actual files
- Update cross-references when moving files
- Maintain consistent formatting across documents
- Add new documents to appropriate sections above
