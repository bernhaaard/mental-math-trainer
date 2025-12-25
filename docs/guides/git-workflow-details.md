# Git Workflow Details

This guide provides the complete git workflow for the Mental Math Trainer development process.

---

## Branch Strategy

### Main Branch

- **Protected**: No direct commits
- **Merge method**: Squash and merge only
- **Requirements**: PR approval from 2 reviewers
- **Contents**: Production-ready code only

### Feature Branches

**Naming convention**: `<type>/<issue-number>-<short-description>`

| Type | Purpose | Example |
|------|---------|---------|
| `feat/` | New features | `feat/42-validation-system` |
| `fix/` | Bug fixes | `fix/57-negative-handling` |
| `refactor/` | Code restructuring | `refactor/31-method-selector` |
| `test/` | Test additions | `test/48-method-coverage` |
| `docs/` | Documentation | `docs/22-api-reference` |

---

## Complete Workflow

### 1. Create GitHub Issue

Before starting work, create an issue:

```bash
gh issue create \
  --title "[FEAT] Implement validation system" \
  --body "## Description
Implement the core validation system for verifying mathematical correctness.

## Acceptance Criteria
- [ ] Validates expression results
- [ ] Detects incorrect final answers
- [ ] Cross-validates multiple methods
- [ ] Test coverage ≥ 95%

## Related Requirements
PROJECT_REQUIREMENTS.md Section 2.4"
```

Note the issue number (e.g., #42).

### 2. Create Feature Branch

```bash
# Ensure main is up to date
git checkout main
git pull origin main

# Create feature branch
git checkout -b feat/42-validation-system
```

### 3. Develop with Atomic Commits

Make focused commits that do one thing:

```bash
# Add type definitions
git add src/lib/types/solution.ts
git commit -m "feat: add validation result types (#42)"

# Add validator implementation
git add src/lib/core/validator.ts
git commit -m "feat: implement solution validator (#42)"

# Add tests
git add src/tests/unit/validation/
git commit -m "test: add comprehensive validator tests (#42)"
```

### 4. Push and Create PR

```bash
# Push branch
git push -u origin feat/42-validation-system

# Create PR
gh pr create \
  --title "feat: implement validation system" \
  --body "## Description
Implements the core validation system for mathematical correctness.

Closes #42

## Changes
- Added ValidationResult type
- Implemented SolutionValidator class
- Added comprehensive tests

## Testing
- [x] Unit tests added
- [x] Coverage: 97%
- [x] Manual validation complete

## Review Requirements
- [ ] QA Reviewer
- [ ] Bug Finder"
```

### 5. Address Review Feedback

When reviewers request changes:

```bash
# Make fixes
git add src/lib/core/validator.ts
git commit -m "fix: handle null edge case in validator (#42)"

# Push fixes
git push origin feat/42-validation-system

# Reply to review comments in GitHub
```

### 6. Merge and Cleanup

After both reviewers approve:

```bash
# Squash merge through GitHub UI or:
gh pr merge --squash

# Delete feature branch
git checkout main
git pull origin main
git branch -d feat/42-validation-system
git push origin --delete feat/42-validation-system
```

---

## Commit Message Format

```
<type>: <description> (#<issue>)

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code restructuring (no behavior change) |
| `test` | Adding/updating tests |
| `docs` | Documentation only |
| `style` | Formatting (no code change) |
| `perf` | Performance improvement |
| `chore` | Maintenance tasks |

### Examples

```bash
# Feature
git commit -m "feat: add difference of squares method (#12)"

# Bug fix
git commit -m "fix: correct negative number handling in near-100 (#34)"

# Refactor
git commit -m "refactor: extract cost calculation to separate module (#45)"

# Test
git commit -m "test: add exhaustive validation tests (#42)"
```

---

## Git Worktrees for Parallel Development

When working on multiple features simultaneously:

### Create Worktree

```bash
# From main repository
git worktree add ../mental-math-feat-validation feat/42-validation

# Now you have:
# mental-math-trainer/          <- main branch
# mental-math-feat-validation/  <- feat/42-validation branch
```

### Work in Worktree

```bash
cd ../mental-math-feat-validation
# Make changes, commit, push as normal
```

### Remove When Done

```bash
cd ../mental-math-trainer
git worktree remove ../mental-math-feat-validation
```

---

## Handling Conflicts

### Before Creating PR

```bash
# Update main
git checkout main
git pull origin main

# Rebase your branch
git checkout feat/42-validation
git rebase main

# If conflicts:
# 1. Edit conflicted files
# 2. git add <files>
# 3. git rebase --continue

# Force push (only on YOUR feature branch)
git push --force-with-lease origin feat/42-validation
```

### During PR Review

If main updated while your PR is open:

```bash
git checkout feat/42-validation
git fetch origin main
git rebase origin/main
git push --force-with-lease origin feat/42-validation
```

---

## Branch Protection Rules

Configure via GitHub Settings or CLI:

```bash
# Enable branch protection
gh api -X PUT /repos/{owner}/{repo}/branches/main/protection \
  -f required_status_checks='{"strict":true,"contexts":["test"]}' \
  -f enforce_admins=true \
  -f required_pull_request_reviews='{"required_approving_review_count":2}' \
  -f restrictions=null
```

### Required Settings

- ✅ Require pull request reviews (2 approvers)
- ✅ Require status checks to pass
- ✅ Require conversation resolution
- ✅ Include administrators
- ✅ Require linear history (squash only)
- ❌ Allow force pushes (disabled)
- ❌ Allow deletions (disabled)

---

## PR Review Process

### As Author

1. Mark PR as ready when implementation complete
2. Request review from assigned reviewers
3. Address all feedback promptly
4. Keep PR updated with main
5. Don't merge until both approvers sign off

### As Reviewer

1. Review within 24 hours of request
2. Use inline comments for specific issues
3. Categorize feedback:
   - 🔴 **Blocking**: Must fix before merge
   - 🟡 **Suggestion**: Should consider
   - 🟢 **Nitpick**: Optional improvement
4. Approve only when all blocking issues resolved
5. Re-review after changes

---

## Emergency Procedures

### Reverting a Bad Merge

```bash
# Find the merge commit
git log --oneline main

# Revert the merge
git checkout main
git pull origin main
git revert -m 1 <merge-commit-hash>
git push origin main
```

### Recovering Deleted Branch

```bash
# Find the branch head
git reflog

# Recreate branch
git checkout -b feat/42-recovery <commit-hash>
```

---

## Quick Reference

```bash
# Daily workflow
git checkout main && git pull origin main
git checkout -b feat/XX-description
# ... work ...
git add . && git commit -m "feat: description (#XX)"
git push -u origin feat/XX-description
gh pr create

# Updating from main
git fetch origin main && git rebase origin/main

# After PR merge
git checkout main && git pull origin main
git branch -d feat/XX-description
```
