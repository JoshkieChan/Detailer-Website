import { track } from '@vercel/analytics';

type EventProps = Record<string, string | number | boolean>;

export function trackEvent(name: string, props?: EventProps) {
  try {
    track(name, props);
  } catch {
    // Ignore analytics failures so CTAs and page rendering never break.
  }
}
