/**
 * Calculation Methods Barrel Export
 * Re-exports all calculation method classes and utilities.
 */

// Base method
export { BaseMethod } from './base-method';

// Individual method implementations
export { DistributiveMethod } from './distributive';
export { DifferenceSquaresMethod } from './difference-squares';
export { NearPower10Method } from './near-power-10';
export { FactorizationMethod } from './factorization';
export { SquaringMethod } from './squaring';
export { Near100Method } from './near-100';
export { SumToTenMethod } from './sum-to-ten';
export { SquaringEnd5Method } from './squaring-end-5';

// Method registry and selector
export { getMethodInstances } from './method-registry';
export { MethodSelector } from './method-selector';
export type { MethodRanking } from './method-selector';
