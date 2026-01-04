/**
 * Calculate Statistics Utility
 * Computes session statistics from problem attempts.
 */

import type { ProblemAttempt, SessionStatistics, MethodStats } from '@/lib/types/session';
import type { MethodName } from '@/lib/types/method';

/**
 * Calculate comprehensive statistics from a list of problem attempts.
 * @param problems - The list of problem attempts from the session
 * @returns SessionStatistics object with accuracy, timing, and method breakdown
 */
export function calculateStatistics(problems: ProblemAttempt[]): SessionStatistics {
  if (problems.length === 0) {
    return {
      totalProblems: 0,
      correctAnswers: 0,
      accuracy: 0,
      averageTime: 0,
      averageError: 0,
      methodBreakdown: {},
      totalHintsUsed: 0,
      problemsWithHints: 0,
      averageHintsPerProblem: 0
    };
  }

  const correctAnswers = problems.filter(
    p => !p.skipped && p.userAnswers[0] === p.correctAnswer
  ).length;

  const accuracy = (correctAnswers / problems.length) * 100;
  const totalTime = problems.reduce((sum, p) => sum + p.timeTaken, 0);
  const averageTime = totalTime / problems.length;

  const incorrectProblems = problems.filter(
    p => !p.skipped && p.userAnswers[0] !== p.correctAnswer
  );
  const averageError =
    incorrectProblems.length > 0
      ? incorrectProblems.reduce((sum, p) => sum + p.errorMagnitude, 0) /
        incorrectProblems.length
      : 0;

  // Calculate method breakdown
  const methodBreakdown: Partial<Record<MethodName, MethodStats>> = {};

  problems.forEach(problem => {
    const method = problem.solution.method;
    if (!methodBreakdown[method]) {
      methodBreakdown[method] = {
        method,
        problemsSolved: 0,
        correctAnswers: 0,
        accuracy: 0,
        averageTime: 0
      };
    }

    const stats = methodBreakdown[method]!;
    stats.problemsSolved++;

    if (!problem.skipped && problem.userAnswers[0] === problem.correctAnswer) {
      stats.correctAnswers++;
    }
  });

  // Calculate averages
  Object.values(methodBreakdown).forEach(stats => {
    if (stats) {
      const methodProblems = problems.filter(p => p.solution.method === stats.method);
      stats.accuracy = (stats.correctAnswers / stats.problemsSolved) * 100;
      stats.averageTime = methodProblems.reduce((sum, p) => sum + p.timeTaken, 0) / methodProblems.length;
    }
  });

  // Calculate hint statistics
  const totalHintsUsed = problems.reduce((sum, p) => sum + (p.hintsUsed || 0), 0);
  const problemsWithHints = problems.filter(p => (p.hintsUsed || 0) > 0).length;
  const averageHintsPerProblem = problems.length > 0 ? totalHintsUsed / problems.length : 0;

  return {
    totalProblems: problems.length,
    correctAnswers,
    accuracy,
    averageTime,
    averageError,
    methodBreakdown,
    totalHintsUsed,
    problemsWithHints,
    averageHintsPerProblem
  };
}
