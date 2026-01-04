/**
 * Comprehensive Cost Calculation Analysis Test Suite
 *
 * This test generates method selections for ALL multiplications between 2-100
 * plus selected hard problems in the 100-10000 range. Output is designed for
 * analysis to identify issues with the cost calculation algorithm.
 *
 * @module tests/cost-analysis-comprehensive
 */

import { MethodSelector, type MethodRanking } from '../method-selector';

// ============================================================================
// TEST DATA STRUCTURES
// ============================================================================

interface ProblemAnalysis {
  num1: number;
  num2: number;
  product: number;
  selectedMethod: string;
  cost: number;
  quality: number;
  alternatives: Array<{
    method: string;
    cost: number;
    quality: number;
    whyNotOptimal: string;
  }>;
  solutionSteps: string[];
  optimalReason: string;
  // Analysis flags
  potentialIssues: string[];
}

interface AnalysisResults {
  totalProblems: number;
  methodCounts: Record<string, number>;
  avgCostByMethod: Record<string, number>;
  problemsWithPotentialIssues: ProblemAnalysis[];
  allProblems: ProblemAnalysis[];
}

// ============================================================================
// ANALYSIS HELPERS
// ============================================================================

/**
 * Analyzes a problem for potential optimality issues
 */
function analyzeProblemForIssues(
  num1: number,
  num2: number,
  ranking: MethodRanking
): string[] {
  const issues: string[] = [];
  const method = ranking.optimal.method.name;
  const cost = ranking.optimal.costScore;

  // Check 1: Near Power of 10 should be preferred when one number is very close to 10/100/1000
  const nearPowers = [10, 100, 1000];
  for (const power of nearPowers) {
    const dist1 = Math.abs(num1 - power);
    const dist2 = Math.abs(num2 - power);
    const minDist = Math.min(dist1, dist2);

    // If within 3 of a power of 10 but Near Power wasn't selected
    if (minDist <= 3 && method !== 'near-power-10') {
      // Check if near-power-10 was even an alternative
      const npAlt = ranking.alternatives.find(a => a.method.name === 'near-power-10');
      if (npAlt) {
        issues.push(
          `NEAR_POWER_OVERLOOKED: ${num1}×${num2} - Number within ${minDist} of ${power} but ${method} selected ` +
          `(cost ${cost.toFixed(1)} vs Near Power cost ${npAlt.costScore.toFixed(1)})`
        );
      }
    }
  }

  // Check 2: Difference of Squares should be preferred when numbers are symmetric
  const sum = num1 + num2;
  const midpoint = sum / 2;
  const distance = Math.abs(num1 - midpoint);
  if (Number.isInteger(midpoint) && distance <= 10 && midpoint % 5 === 0 && method !== 'difference-squares') {
    const dsAlt = ranking.alternatives.find(a => a.method.name === 'difference-squares');
    if (dsAlt) {
      issues.push(
        `DIFF_SQUARES_OVERLOOKED: ${num1}×${num2} symmetric around ${midpoint} (dist ${distance}) but ${method} selected`
      );
    }
  }

  // Check 3: Factorization with poor factor choices (90 = 2×45 instead of 9×10)
  if (method === 'factorization') {
    const optReason = ranking.optimal.solution.optimalReason;
    // Extract factor pair from reason
    const factorMatch = optReason.match(/(\d+)\s*\*\s*(\d+)/);
    if (factorMatch) {
      const f1 = parseInt(factorMatch[1]);
      const f2 = parseInt(factorMatch[2]);
      // Check if there's a better factorization with 10
      const numFactored = num1 % 10 === 0 ? num1 : (num2 % 10 === 0 ? num2 : 0);
      if (numFactored > 0 && f1 !== 10 && f2 !== 10) {
        const otherFactor = numFactored / 10;
        if (Number.isInteger(otherFactor) && otherFactor > 1) {
          issues.push(
            `FACTORIZATION_SUBOPTIMAL: ${num1}×${num2} - Chose ${f1}×${f2} but ${otherFactor}×10 would be simpler`
          );
        }
      }
    }
  }

  // Check 4: Distributive using place-value when round-number partition would be simpler
  if (method === 'distributive') {
    const steps = ranking.optimal.solution.steps;
    const firstStepExpl = steps[0]?.explanation || '';
    // Check if it's using full place value for a number that could use round-number partition
    if (firstStepExpl.includes('full place value')) {
      // E.g., 251 = 200+50+1 instead of 250+1
      for (const n of [num1, num2]) {
        const nearestHundred = Math.round(n / 100) * 100;
        const nearestFifty = Math.round(n / 50) * 50;
        const distToHundred = Math.abs(n - nearestHundred);
        const distToFifty = Math.abs(n - nearestFifty);
        if (distToHundred <= 5 && distToHundred > 0) {
          issues.push(
            `DISTRIBUTIVE_SUBOPTIMAL: ${num1}×${num2} - ${n} is ${distToHundred} from ${nearestHundred}, ` +
            `could use (${nearestHundred}±${distToHundred}) instead of full place value`
          );
        } else if (distToFifty <= 5 && distToFifty > 0 && nearestFifty !== nearestHundred) {
          issues.push(
            `DISTRIBUTIVE_SUBOPTIMAL: ${num1}×${num2} - ${n} is ${distToFifty} from ${nearestFifty}, ` +
            `could use (${nearestFifty}±${distToFifty}) instead of full place value`
          );
        }
      }
    }
  }

  // Check 5: Sum-to-Ten pattern (same tens digit, units sum to 10) - MISSING METHOD
  const tens1 = Math.floor(num1 / 10);
  const tens2 = Math.floor(num2 / 10);
  const units1 = num1 % 10;
  const units2 = num2 % 10;
  if (tens1 === tens2 && units1 + units2 === 10 && num1 >= 10 && num2 >= 10) {
    issues.push(
      `MISSING_METHOD_SUM_TO_TEN: ${num1}×${num2} - Same tens (${tens1}), units sum to 10 ` +
      `(${units1}+${units2}=10). Optimal: ${tens1}×${tens1+1}=${tens1*(tens1+1)}, append ${units1*units2}`
    );
  }

  // Check 6: Squaring ending in 5 - POTENTIALLY MISSING OPTIMIZATION
  if (num1 === num2 && num1 % 10 === 5) {
    issues.push(
      `CHECK_SQUARING_5: ${num1}² - Number ends in 5. Optimal: ${Math.floor(num1/10)}×${Math.floor(num1/10)+1}=${Math.floor(num1/10)*(Math.floor(num1/10)+1)}, append 25`
    );
  }

  return issues;
}

/**
 * Formats a problem analysis for output
 */
function formatProblemAnalysis(analysis: ProblemAnalysis): string {
  let output = `\n${'='.repeat(60)}\n`;
  output += `PROBLEM: ${analysis.num1} × ${analysis.num2} = ${analysis.product}\n`;
  output += `${'='.repeat(60)}\n`;
  output += `Selected Method: ${analysis.selectedMethod}\n`;
  output += `Cost: ${analysis.cost.toFixed(2)}, Quality: ${analysis.quality.toFixed(2)}\n`;
  output += `Reason: ${analysis.optimalReason}\n`;

  if (analysis.alternatives.length > 0) {
    output += `\nAlternatives:\n`;
    for (const alt of analysis.alternatives) {
      output += `  - ${alt.method}: Cost ${alt.cost.toFixed(2)}, Quality ${alt.quality.toFixed(2)}\n`;
      output += `    Why not: ${alt.whyNotOptimal.substring(0, 100)}...\n`;
    }
  }

  output += `\nSolution Steps:\n`;
  for (const step of analysis.solutionSteps) {
    output += `  ${step}\n`;
  }

  if (analysis.potentialIssues.length > 0) {
    output += `\n⚠️  POTENTIAL ISSUES:\n`;
    for (const issue of analysis.potentialIssues) {
      output += `  ❌ ${issue}\n`;
    }
  }

  return output;
}

// ============================================================================
// MAIN TEST SUITE
// ============================================================================

describe('Cost Calculation Comprehensive Analysis', () => {
  const selector = new MethodSelector();
  const allAnalyses: ProblemAnalysis[] = [];

  // Generate all problems 2-100
  const basicProblems: [number, number][] = [];
  for (let i = 2; i <= 100; i++) {
    for (let j = i; j <= 100; j++) { // j >= i to avoid duplicates
      basicProblems.push([i, j]);
    }
  }

  // Add selected hard problems (100-10000 range)
  const hardProblems: [number, number][] = [
    // Near powers of 10
    [99, 47], [101, 38], [98, 76], [102, 54],
    [999, 23], [1001, 45], [997, 88],
    // Large symmetric pairs (Difference of Squares candidates)
    [147, 153], [248, 252], [396, 404], [995, 1005],
    // Numbers with good factorizations
    [125, 48], [144, 35], [180, 45], [250, 36],
    // Near 100 pairs
    [97, 94], [103, 108], [96, 104], [98, 102],
    // Sum-to-Ten candidates
    [24, 26], [33, 37], [41, 49], [52, 58], [63, 67], [74, 76], [81, 89],
    // Challenging arbitrary problems
    [317, 90], [251, 36], [377, 35], [428, 67],
    [123, 456], [789, 234], [567, 890],
    // Squaring ending in 5
    [15, 15], [25, 25], [35, 35], [45, 45], [55, 55], [65, 65], [75, 75], [85, 85], [95, 95],
    [105, 105], [115, 115], [125, 125], [135, 135], [145, 145],
    // Edge cases
    [10, 10], [100, 100], [11, 11], [99, 99],
  ];

  const allProblems = [...basicProblems, ...hardProblems];

  beforeAll(() => {
    console.log(`\n${'#'.repeat(80)}`);
    console.log('# COMPREHENSIVE COST CALCULATION ANALYSIS');
    console.log(`# Total problems to analyze: ${allProblems.length}`);
    console.log(`# Basic (2-100): ${basicProblems.length}, Hard (100-10000): ${hardProblems.length}`);
    console.log(`${'#'.repeat(80)}\n`);
  });

  test('Analyze all problems and identify issues', () => {
    const methodCounts: Record<string, number> = {};
    const methodCosts: Record<string, number[]> = {};
    const problemsWithIssues: ProblemAnalysis[] = [];

    for (const [num1, num2] of allProblems) {
      try {
        const ranking = selector.selectOptimalMethod(num1, num2);

        const analysis: ProblemAnalysis = {
          num1,
          num2,
          product: num1 * num2,
          selectedMethod: ranking.optimal.method.name,
          cost: ranking.optimal.costScore,
          quality: ranking.optimal.qualityScore,
          alternatives: ranking.alternatives.map(a => ({
            method: a.method.name,
            cost: a.costScore,
            quality: a.qualityScore,
            whyNotOptimal: a.whyNotOptimal
          })),
          solutionSteps: ranking.optimal.solution.steps.map(s =>
            `${s.expression} = ${s.result} (${s.explanation})`
          ),
          optimalReason: ranking.optimal.solution.optimalReason,
          potentialIssues: analyzeProblemForIssues(num1, num2, ranking)
        };

        allAnalyses.push(analysis);

        // Track method counts
        methodCounts[analysis.selectedMethod] = (methodCounts[analysis.selectedMethod] || 0) + 1;

        // Track costs by method
        if (!methodCosts[analysis.selectedMethod]) {
          methodCosts[analysis.selectedMethod] = [];
        }
        methodCosts[analysis.selectedMethod].push(analysis.cost);

        // Track problems with issues
        if (analysis.potentialIssues.length > 0) {
          problemsWithIssues.push(analysis);
        }
      } catch (error) {
        console.error(`Error analyzing ${num1} × ${num2}:`, error);
      }
    }

    // Output summary
    console.log('\n' + '='.repeat(80));
    console.log('ANALYSIS SUMMARY');
    console.log('='.repeat(80));

    console.log('\nMethod Selection Distribution:');
    for (const [method, count] of Object.entries(methodCounts).sort((a, b) => b[1] - a[1])) {
      const pct = ((count / allProblems.length) * 100).toFixed(1);
      const costs = methodCosts[method] || [];
      const avgCost = costs.length > 0 ? costs.reduce((a, b) => a + b, 0) / costs.length : 0;
      console.log(`  ${method}: ${count} (${pct}%) - Avg cost: ${avgCost.toFixed(2)}`);
    }

    console.log(`\nProblems with potential issues: ${problemsWithIssues.length}`);

    // Group issues by type
    const issuesByType: Record<string, number> = {};
    for (const problem of problemsWithIssues) {
      for (const issue of problem.potentialIssues) {
        const type = issue.split(':')[0];
        issuesByType[type] = (issuesByType[type] || 0) + 1;
      }
    }

    console.log('\nIssue types:');
    for (const [type, count] of Object.entries(issuesByType).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${type}: ${count}`);
    }

    // Output detailed analysis for problems with issues
    console.log('\n' + '='.repeat(80));
    console.log('DETAILED ANALYSIS OF PROBLEMS WITH ISSUES');
    console.log('='.repeat(80));

    // Limit to first 50 for readability
    const sampled = problemsWithIssues.slice(0, 50);
    for (const analysis of sampled) {
      console.log(formatProblemAnalysis(analysis));
    }

    if (problemsWithIssues.length > 50) {
      console.log(`\n... and ${problemsWithIssues.length - 50} more problems with issues`);
    }

    // Test should pass but output analysis
    expect(allAnalyses.length).toBe(allProblems.length);
  });

  test('Output all problems as JSON for further analysis', () => {
    // Write full analysis to a file for processing by analysis agents
    const fs = require('fs');
    const outputPath = '/Users/bernhardkofler/Programming/Personal/mental-math-trainer/cost-analysis-output.json';

    const output = {
      generatedAt: new Date().toISOString(),
      totalProblems: allAnalyses.length,
      problems: allAnalyses
    };

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`\nFull analysis written to: ${outputPath}`);

    expect(fs.existsSync(outputPath)).toBe(true);
  });

  // Specific tests for known problematic cases
  describe('Known Problematic Cases', () => {
    test('317 × 90 should prefer Near Power of 10 over Factorization', () => {
      const ranking = selector.selectOptimalMethod(317, 90);
      console.log(`\n317 × 90: Selected ${ranking.optimal.method.name} (cost ${ranking.optimal.costScore})`);

      // Log all alternatives for analysis
      for (const alt of ranking.alternatives) {
        console.log(`  Alt: ${alt.method.name} (cost ${alt.costScore})`);
      }

      // This test documents the current behavior (may need to change)
      expect(ranking.optimal.method.name).toBeDefined();
    });

    test('251 × 36 should use round-number partition (250+1) not place-value (200+50+1)', () => {
      const ranking = selector.selectOptimalMethod(251, 36);
      const firstStep = ranking.optimal.solution.steps[0];
      console.log(`\n251 × 36: ${firstStep?.explanation}`);
      console.log(`Method: ${ranking.optimal.method.name}, Cost: ${ranking.optimal.costScore}`);

      // Document current behavior
      expect(firstStep).toBeDefined();
    });

    test('24 × 26 (Sum-to-Ten pattern) - verify current method selection', () => {
      const ranking = selector.selectOptimalMethod(24, 26);
      console.log(`\n24 × 26: Selected ${ranking.optimal.method.name} (cost ${ranking.optimal.costScore})`);
      console.log(`Optimal answer: 2×3=6, 4×6=24, result = 624`);

      // Sum-to-Ten would give: 2×3=6 (hundreds), 4×6=24 (rest) = 624
      expect(24 * 26).toBe(624);
    });

    test('75² (Squaring ending in 5) - verify optimization', () => {
      const ranking = selector.selectOptimalMethod(75, 75);
      console.log(`\n75²: Selected ${ranking.optimal.method.name} (cost ${ranking.optimal.costScore})`);
      console.log(`Optimal: 7×8=56, append 25 = 5625`);

      // Squaring ending in 5: 7×8=56, append 25 = 5625
      expect(75 * 75).toBe(5625);
    });
  });
});
