# Mental Math Mastery Training System - Project Overview

## 📋 What You Have

I've created two comprehensive documents totaling **~50,000 words** of detailed specifications and implementation guidance:

### 1. **PROJECT_REQUIREMENTS.md** (~30,000 words)
The complete technical specification covering:
- Full technology stack and architecture
- Mathematical foundations for all 6 calculation methods
- Detailed algorithms with proofs and derivations
- Complete UI/UX specifications
- Data models and persistence strategy
- Testing requirements and validation protocols
- Implementation priorities and milestones

### 2. **claude.md** (~20,000 words)
Comprehensive instructions for Claude Code covering:
- Development philosophy (quality-first approach)
- Detailed subagent workflow (Builder → Reviewer → Refiner → Tester loop)
- Step-by-step implementation guide
- Complete code examples and templates
- Quality gates and checkpoints
- Testing strategies
- Best practices and standards

---

## 🎯 Key Features Specified

### Core Functionality
- **6 Calculation Methods**:
  1. Distributive Property (foundational)
  2. Near Powers of 10
  3. Difference of Squares
  4. Strategic Factorization
  5. Squaring Techniques
  6. Near-100 Cross Multiplication

- **Hybrid Method Selection**: Calculates computational cost for each applicable method, shows top 2-3 with explanations

- **Complete Solution Generation**: Step-by-step solutions with drill-down sub-calculations

- **Three Modes**:
  - **Practice Mode**: Configurable sessions with immediate feedback
  - **Study Mode**: Interactive progressive curriculum with deep dives
  - **Statistics Dashboard**: Comprehensive performance tracking

### Quality Standards
- **100% Mathematical Correctness**: Every solution validated
- **90%+ Test Coverage**: Comprehensive testing of core logic
- **Type-Safe**: Full TypeScript strict mode
- **Performance**: < 5s solution generation for numbers up to 1B × 1B
- **Accessibility**: Keyboard navigation, responsive design

---

## 🚀 How to Use These Documents

### For Claude Code

The development process begins with proper infrastructure. You create a new project directory and initialize it as a git repository that will track every change through branches, commits, and pull requests. The two comprehensive documents—PROJECT_REQUIREMENTS.md and claude.md—go into this directory as the foundational specifications that guide all implementation decisions.

When you launch Claude Code in the directory, you provide an initial prompt that establishes the development methodology. You tell Claude Code to read both documents thoroughly, understanding not just what to build but *how* to build it through the subagent workflow. The workflow operates through git infrastructure with each feature beginning as a GitHub Issue that defines scope and acceptance criteria, proceeding through a dedicated feature branch where implementation happens through atomic commits, and completing with a pull request that requires approval from both a QA Reviewer and a Bug Finder before merging to main.

The initial prompt should communicate several critical points to Claude Code. The project prioritizes quality over speed and correctness over convenience, meaning that taking three rounds of review to get a feature right is better than rushing a feature through review with subtle bugs. Every calculation must be mathematically accurate with one hundred percent validation success—a single arithmetic error in a generated solution is unacceptable in an educational application. The subagent workflow isn't optional ceremony but rather the forcing function that makes quality non-negotiable by requiring multiple perspectives to approve each piece of code before it becomes part of the main codebase.

### Iterative Development Process

Claude Code proceeds through six phases that build the application incrementally while maintaining quality at each step. **Phase 1** establishes the foundation with project setup, the complete type system, and the validation framework that will verify every solution generated throughout the application's lifetime. This phase creates the infrastructure—git repository, issue tracking, branch protection rules—that supports the entire development process. **Phase 2** implements all six calculation methods with comprehensive testing and the method selection algorithm that chooses optimal approaches based on computational cost and structural patterns.

**Phase 3** builds the practice mode where users configure sessions, solve problems, and review solutions with detailed explanations and drill-down sub-calculations. **Phase 4** creates the study mode with interactive content that teaches the mathematical foundations behind each method through progressive curriculum and examples. **Phase 5** implements the statistics dashboard with charts, weak area identification, and data export, plus documentation and responsive design refinement. **Phase 6** completes testing with the comprehensive test suite, performance benchmarks, manual validation, and final polish.

Each phase operates through the git workflow with features developed in isolated branches that eventually merge to main through pull requests that require approval. The cycle repeats: Builder Agent creates an issue and implements the feature through atomic commits, Code Reviewer examines the implementation and requests changes if needed, Refiner Agent addresses critiques systematically, and both QA Reviewer and Bug Finder must explicitly approve before the feature merges.

---

## 🔍 Key Design Decisions

### Tech Stack

The technology choices reflect both pragmatic engineering considerations and the goal of building a maintainable application. **Next.js 14+** provides integrated full-stack capabilities with API routes that will support the eventual PostgreSQL backend while offering server-side rendering for better initial load performance. **TypeScript in strict mode** enforces type safety at compile time, catching entire classes of errors before the code even runs and making refactoring safer through the type system's ability to identify all call sites when signatures change. **Tailwind CSS** enables rapid UI development while maintaining consistency through utility classes, with dark mode as the default theme because developers and students often prefer reduced eye strain during extended practice sessions. **IndexedDB** handles local-first data storage through the Dexie.js library that provides a more ergonomic API than the raw IndexedDB interface, with the architecture designed for easy migration to **PostgreSQL** later when multi-device sync becomes important. **Vitest plus React Testing Library** provides the testing infrastructure with fast execution and excellent React component testing support.

### Mathematical Approach

The method selection algorithm uses a **hybrid approach** that calculates computational cost for each applicable method and combines this with quality scoring to determine the optimal approach. Cost reflects how many steps and how much cognitive load a method requires—multiplying by powers of ten is cheap because it's just appending zeros, while general multiplication through place-value partition requires multiple sub-calculations. Quality reflects how elegant or educational a method is for specific numbers—difference of squares exploits beautiful algebraic symmetry and teaches valuable pattern recognition even if it's not always the absolute fastest approach.

The explanation system operates at **multiple levels** to serve different learning contexts. Practice mode explanations cite the algebraic identity being used and show arithmetic for each sub-step, creating transparency without overwhelming the user with theory. Study mode explanations include the full mathematical foundation with proofs, geometric interpretations, and discussions of why the technique works at a fundamental level. This multilevel approach recognizes that sometimes you need to solve a problem quickly, while other times you want to understand deeply why a technique works.

**Complete validation** ensures mathematical correctness through automated verification that checks every step in every generated solution. The validation system evaluates expressions to confirm they produce the claimed results, verifies that step sequences connect logically, and cross-validates that different methods produce identical answers for the same problem. This validation isn't optional or subject to being disabled for performance—it runs on every solution before the application presents it to users, making mathematical errors essentially impossible in production.

The system always shows the **optimal method plus two alternatives** so users understand not just which approach works best but *why* it works best compared to other valid approaches. This comparative presentation teaches judgment and pattern recognition rather than just mechanical technique application.

### Quality Assurance

The **subagent loop** creates continuous review and refinement through distinct roles that examine code from different perspectives. The Builder implements features while thinking about functionality, the Code Reviewer examines correctness and maintainability, the Refiner addresses critiques systematically, the QA Reviewer validates testing and mathematical accuracy, and the Bug Finder actively tries to break the implementation through adversarial testing. Each role operates through the git workflow with reviews happening in pull requests that create documented trails of feedback and fixes.

**Test coverage requirements** set the standard at ninety percent for core logic and eighty percent overall because these thresholds represent where we gain confidence that regressions will be caught. Core logic—the calculation methods, solution generation, and validation systems—requires higher coverage because errors here would be catastrophic in an educational application. The coverage percentage is verified automatically and pull requests cannot merge if coverage drops below the threshold.

**Validation happens at multiple levels** including automated verification of every solution step, a test suite of known correct solutions that methods must reproduce exactly, and manual spot-checks where reviewers work through random samples by hand to confirm accuracy. Performance benchmarking ensures solution generation completes within five seconds even for the largest numbers the system supports, creating a smooth user experience without perceptible delays.

---

## 📊 Specification Statistics

### PROJECT_REQUIREMENTS.md
- **10 major sections**
- **4 appendices**
- Complete mathematical proofs
- Full type definitions
- Comprehensive test plans
- Known solution test cases

### claude.md
- **Detailed subagent workflow**
- **Step-by-step implementation guide**
- **Complete code examples**
- Example test suites
- Quality gates and checklists
- Emergency protocols

---

## ⚠️ Critical Requirements

### Non-Negotiable
1. **Mathematical Correctness**: Zero tolerance for arithmetic errors
2. **Type Safety**: Strict TypeScript, no `any` types
3. **Test Coverage**: 90%+ for core logic
4. **Validation**: Every solution must pass validation
5. **Quality Process**: Follow subagent workflow exactly

### Iterative Quality Loop
```
Builder → Reviewer → Refiner → Reviewer → Refiner → Tester
              ↑                                        ↓
              ←────────────── [If issues] ←────────────
```

Exit only when:
- All tests pass
- Coverage ≥ 90%
- No critiques remain
- Manual validation succeeds

---

## 💡 What Makes This Specification Unique

1. **Mathematical Rigor**: Complete algebraic foundations with proofs
2. **Validation First**: Built-in correctness verification
3. **Educational Focus**: Teaches "why" not just "how"
4. **Quality Process**: Iterative review and refinement
5. **Comprehensive**: Every detail specified
6. **Testable**: Complete test strategy with known solutions

---

## 📖 Document Structure Quick Reference

### PROJECT_REQUIREMENTS.md Structure
```
1. Technology Stack & Architecture
2. Mathematical Foundations & Methods
3. Difficulty Levels & Problem Generation
4. User Interface Specifications
5. Data Models & Persistence
6. Testing Requirements
7. Development Workflow & QA
8. Implementation Priorities
9. Success Criteria
10. Future Enhancements
Appendices: Proofs, Cost Models, Test Cases
```

### claude.md Structure
```
- Development Philosophy
- Required Reading
- Subagent Workflow (detailed)
- Project Structure
- Implementation Guide (Phase 1-3 detailed)
- Quality Gates
- Best Practices
- Completion Criteria
- Emergency Protocols
```

---

## 🎓 Mathematical Methods Included

Each method includes:
- Algebraic foundation and proofs
- Applicability conditions
- Cost calculation model
- Solution generation algorithm
- Study content with deep dives

### Example: Difference of Squares
```
Mathematical Identity: a² - b² = (a - b)(a + b)
Proof: Included
When to Use: Numbers symmetric around midpoint
Cost Model: 2 × square_cost + subtraction
Example: 47 × 53 = (50-3)(50+3) = 50² - 3² = 2491
```

---

## 🔧 Next Steps

1. **Review Documents**: Read both files thoroughly
2. **Prepare Environment**: Ensure Claude Code is available
3. **Set Up Project**: Create directory with both documents
4. **Launch Development**: Give Claude Code the initial prompt
5. **Monitor Progress**: Check that subagent workflow is followed
6. **Provide Feedback**: Review each phase completion

---

## 📝 Customization Notes

If you want to adjust specifications:

**In PROJECT_REQUIREMENTS.md**:
- Difficulty ranges (Section 3.1)
- UI design system (Section 4.1)
- Test coverage requirements (Section 6)

**In claude.md**:
- Subagent workflow iterations
- Quality gates
- Implementation priorities

---

## ✅ Validation Checklist

Before starting development, ensure:
- [ ] Both documents read completely
- [ ] Subagent workflow understood
- [ ] Quality standards clear
- [ ] Mathematical foundations reviewed
- [ ] Type system comprehended
- [ ] Testing strategy understood

---

## 🎯 Success Metrics

The project is complete when:
- ✅ All 6 methods working correctly
- ✅ Method selection optimal
- ✅ 100% validation success rate
- ✅ 90%+ test coverage
- ✅ All user flows functional
- ✅ Statistics tracking accurate
- ✅ Responsive UI polished
- ✅ Documentation complete

---

## 📞 Support

If Claude Code encounters issues:
1. Re-read relevant section in PROJECT_REQUIREMENTS.md
2. Check subagent workflow compliance
3. Review mathematical foundations
4. Consult emergency protocols in claude.md
5. Verify quality gates are being met

---

## 🏆 Final Notes

These documents represent a **production-ready specification** for a mathematically rigorous educational application. Every detail has been carefully considered:

- **Mathematical correctness** is paramount
- **Quality standards** are non-negotiable
- **Testing requirements** ensure reliability
- **Subagent workflow** guarantees iterative refinement
- **Comprehensive documentation** enables successful implementation

The specification is detailed enough that following it precisely will result in a high-quality, educational, mathematically correct mental math training system.

**Build something excellent!** 🚀

---

*Documents created: December 2025*
*Total specification length: ~50,000 words*
*Estimated development time: 6 weeks with quality-first approach*
