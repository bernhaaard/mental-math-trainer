/**
 * Analysis module - Tools for analyzing user statistics and generating recommendations.
 * @module core/analysis
 */

export {
  analyzeMethodProficiency,
  calculateMethodProficiency,
  getMethodDisplayName,
  getStrongestMethods,
  getWeakestMethods,
  createAnalyzerConfig,
  defaultAnalyzerConfig,
  type MethodProficiency,
  type MethodRecommendation,
  type MethodAnalysisResult,
  type AnalyzerConfig,
} from './method-analyzer';
