/**
 * Maps `items` through `fn` with at most `limit` calls in flight, and returns the results in the
 * order of `items`. A worker pool rather than fixed waves, so one slow item doesn't hold up the
 * rest. Rejects with the first error, like Promise.all.
 */
export async function runWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;

  const worker = async (): Promise<void> => {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index] as T, index);
    }
  };

  const workers = Math.min(Math.max(1, Math.floor(limit)), items.length);
  await Promise.all(Array.from({ length: workers }, worker));
  return results;
}
