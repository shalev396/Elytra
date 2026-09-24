/**
 * Shared React Query options. Import a `staleTime` from here in every `useQuery` instead of
 * relying on the default (0), which refetches on every mount.
 */

/** ms until private (signed-in user) data is considered stale; mutations invalidate it anyway */
export const QUERY_STALE_TIME_PRIVATE_MS = 60 * 1000;
