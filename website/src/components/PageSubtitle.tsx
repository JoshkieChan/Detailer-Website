import type { ReactNode } from 'react';

/**
 * Shared subtitle component used across hero sections to ensure consistent centering,
 * maximum width, and vertical spacing.
 */
export function PageSubtitle({ children }: { children: ReactNode }) {
  return (
    <p className="hero-subtitle mx-auto text-center max-w-2xl">
      {children}
    </p>
  );
}
