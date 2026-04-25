import type { ReactNode } from 'react';

/**
 * Shared subtitle component used across hero sections to ensure consistent centering,
 * maximum width, and vertical spacing.
 */
export function PageSubtitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={`hero-subtitle mx-auto text-center max-w-2xl ${className || ''}`}>
      {children}
    </p>
  );
}
