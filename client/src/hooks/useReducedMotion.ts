import { useSyncExternalStore } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function getMediaQuery(): MediaQueryList | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.matchMedia(REDUCED_MOTION_QUERY);
}

function subscribe(onChange: () => void): () => void {
  const query = getMediaQuery();
  if (!query) {
    return () => undefined;
  }
  query.addEventListener('change', onChange);
  return () => {
    query.removeEventListener('change', onChange);
  };
}

function getSnapshot(): boolean {
  return getMediaQuery()?.matches ?? false;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Whether the user asked the OS/browser for reduced motion. Live: it updates when the setting
 * changes. Animations should render their final state immediately when this is true.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Non-hook check for code outside React (event handlers, imperative animations). */
export function prefersReducedMotion(): boolean {
  return getSnapshot();
}
