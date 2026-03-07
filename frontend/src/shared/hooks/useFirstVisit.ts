import { useRef } from 'react';

const visitedPages = new Set<string>();

/**
 * Returns true only on the first mount of a component with the given key
 * within the current browser session (resets on page refresh).
 * Useful for skipping entry animations on subsequent visits.
 */
export function useFirstVisit(pageKey: string): boolean {
  const isFirst = useRef<boolean | null>(null);

  if (isFirst.current === null) {
    isFirst.current = !visitedPages.has(pageKey);
    visitedPages.add(pageKey);
  }

  return isFirst.current;
}
