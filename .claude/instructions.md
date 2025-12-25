# Mental Math Mastery - Project Instructions

Educational application for teaching mental math through deep mathematical understanding.

**Quality > Speed. Correctness > Convenience.**

---

## Critical Requirements

| Requirement | Standard |
|-------------|----------|
| Mathematical accuracy | 100% - every solution must be correct |
| Test coverage | 90% core, 80% overall |
| TypeScript | Strict mode, zero `any` types |
| Validation | All solutions pass SolutionValidator |
| PR approval | QA Reviewer + Bug Finder required |

---

## Documentation Map

| Need | Document |
|------|----------|
| Development workflow | `CLAUDE.md` |
| Full specifications | `docs/PROJECT_REQUIREMENTS.md` |
| All docs navigation | `docs/INDEX.md` |
| Implementation details | `docs/implementation/phase-*.md` |
| Process guides | `docs/guides/*.md` |
| Code examples | `docs/examples/*.md` |
| Agent prompts | `.claude/prompts/*.md` |

---

## Calculation Methods (6 total)

Each must implement correct algebraic foundation:

1. **Distributive**: a(b + c) = ab + ac
2. **Difference of Squares**: a² - b² = (a-b)(a+b)
3. **Near Power of 10**: Exploit base-10 structure
4. **Factorization**: Strategic factor regrouping
5. **Squaring**: Binomial expansion (a ± d)²
6. **Near-100**: Cross multiplication technique

---

## Git Workflow

```
Branch: feat/<issue#>-description or fix/<issue#>-description
Commit: "feat: description (#42)"
```

- Draft PRs opened early
- No direct commits to main
- Squash merge after both approvals

---

## Testing Standards

- Unit tests: 95% coverage per method
- Known solutions: Validate correctness
- Integration: Complete user flows
- Manual: Spot-check pedagogy quality

---

## Agent Workflow

Issues created by:
- **Orchestrator**: Initial features
- **Review/Test agents**: Bugs and improvements

Builder implements → Code Reviewer reviews → Refiner fixes → QA + Bug Finder approve → Merge

---

## When in Doubt

1. Check `docs/INDEX.md` for navigation
2. Read `CLAUDE.md` for workflow
3. Consult `docs/PROJECT_REQUIREMENTS.md` for specs
4. Check `docs/guides/emergency-protocols.md` for troubleshooting
