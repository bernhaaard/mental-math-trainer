/**
 * Study mode feature components.
 * @module components/features/study
 */

// Interactive components for study mode
export { HintDisplay } from './HintDisplay';
export type { HintDisplayProps, Hint } from './HintDisplay';

export { StudyExample } from './StudyExample';
export type { StudyExampleProps } from './StudyExample';

export { InteractiveExercise } from './InteractiveExercise';
export type { InteractiveExerciseProps } from './InteractiveExercise';

export { ExampleCarousel } from './ExampleCarousel';
export type { ExampleCarouselProps } from './ExampleCarousel';

export { ExerciseProgress } from './ExerciseProgress';
export type {
  ExerciseProgressProps,
  ExerciseItem,
  ExerciseStatus,
  ExerciseDifficulty
} from './ExerciseProgress';

// Content display components
export { MethodIntroduction } from './MethodIntroduction';
export type { MethodIntroductionProps } from './MethodIntroduction';

export { MathematicalFoundation } from './MathematicalFoundation';
export type {
  MathematicalFoundationProps,
  ProofStep,
  Proof
} from './MathematicalFoundation';

export { DeepDiveContent } from './DeepDiveContent';
export type {
  DeepDiveContentProps,
  DeepDiveSection,
  HistoricalNote,
  AlgebraConnection
} from './DeepDiveContent';

// Navigation and tab components
export { StudyTabNavigation, StudyTabPanel } from './StudyTabNavigation';
export type {
  StudyTabNavigationProps,
  StudyTabPanelProps,
  StudyTab,
  TabConfig
} from './StudyTabNavigation';

// Progress indicator for study completion
export { ProgressIndicator } from './ProgressIndicator';
export type {
  ProgressIndicatorProps,
  SectionProgress,
  SectionStatus
} from './ProgressIndicator';
