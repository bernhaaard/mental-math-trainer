'use client';

/**
 * GuidedTourProvider Component
 *
 * A client-side wrapper that includes the GuidedTour component.
 * This is necessary because the RootLayout is a server component.
 */

import { GuidedTour } from './GuidedTour';

/**
 * Props for the GuidedTourProvider component.
 */
export interface GuidedTourProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that wraps children and includes the GuidedTour.
 */
export function GuidedTourProvider({
  children
}: GuidedTourProviderProps): React.ReactElement {
  return (
    <>
      {children}
      <GuidedTour />
    </>
  );
}

export default GuidedTourProvider;
