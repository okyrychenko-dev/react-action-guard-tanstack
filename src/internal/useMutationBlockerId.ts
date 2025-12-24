import { hashKey } from "@tanstack/react-query";
import { useId, useMemo } from "react";

/**
 * Generates a blocker ID for mutations, using mutationKey if available or random ID.
 * Uses TanStack Query's hashKey for stable, normalized IDs when mutationKey is provided.
 * This ensures consistent key order for objects regardless of property insertion order.
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
    () => (mutationKey ? `${prefix}-${hashKey(mutationKey)}` : `${prefix}-${randomId}`),
    [prefix, mutationKey, randomId]
  );
}
