import type { ReactNode } from 'react';
import { PageSubtitle } from './PageSubtitle';

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  children?: ReactNode;
  centered?: boolean;
}

/**
 * Shared PageHero component to ensure consistent typography and alignment
 * across marketing and functional pages.
 */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
  centered = true,
}: PageHeroProps) {
  return (
    <section className={`page-hero ${centered ? 'text-center' : ''} reveal compact-hero centered-hero-copy`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h1 className="hero-title">{title}</h1>
      {subtitle && <PageSubtitle>{subtitle}</PageSubtitle>}
      {children}
    </section>
  );
}
