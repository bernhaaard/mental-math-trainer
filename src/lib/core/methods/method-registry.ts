/**
 * Method Registry - Singleton instances of all calculation methods
 * @module core/methods/method-registry
 *
 * Provides a centralized registry of calculation method instances to avoid
 * creating new instances each time they are needed. This improves performance
 * by reusing method objects and their cached state.
 */

import type { CalculationMethod } from '../../types';
import { DistributiveMethod } from './distributive';
import { DifferenceSquaresMethod } from './difference-squares';
import { NearPower10Method } from './near-power-10';
import { FactorizationMethod } from './factorization';
import { SquaringMethod } from './squaring';
import { Near100Method } from './near-100';
import { SumToTenMethod } from './sum-to-ten';
import { SquaringEnd5Method } from './squaring-end-5';

/**
 * Singleton instances of all calculation methods.
 * Created once at module load time.
 */
const methodInstances: CalculationMethod[] = [
  new DistributiveMethod(),
  new DifferenceSquaresMethod(),
  new NearPower10Method(),
  new FactorizationMethod(),
  new SquaringMethod(),
  new Near100Method(),
  new SumToTenMethod(),
  new SquaringEnd5Method()
];

/**
 * Returns the singleton instances of all calculation methods.
 * These instances are reused across the application to avoid
 * unnecessary object creation and to benefit from internal caching.
 *
 * Returns a defensive copy to prevent external mutation of the registry.
 *
 * @returns Array of all calculation method instances
 */
export function getMethodInstances(): CalculationMethod[] {
  return [...methodInstances];
}
