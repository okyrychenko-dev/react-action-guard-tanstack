import { useId, useMemo } from "react";

/**
 * Generates a blocker ID for mutations, using mutationKey if available or random ID.
 * Ensures deterministic IDs when mutationKey is provided for better debugging.
 *
 * @param prefix - Prefix for the blocker ID (default: "mutation")
 * @param mutationKey - Optional mutation key for deterministic IDs
 * @returns Memoized blocker ID
 */
export function useMutationBlockerId(
  prefix = "mutation",
  mutationKey?: ReadonlyArray<unknown>
): string {
  const randomId = useId();
  return useMemo(
    () => (mutationKey ? `${prefix}-${JSON.stringify(mutationKey)}` : `${prefix}-${randomId}`),
    [prefix, mutationKey, randomId]
  );
}
