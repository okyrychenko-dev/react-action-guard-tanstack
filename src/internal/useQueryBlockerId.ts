import { type QueryKey, hashKey } from "@tanstack/react-query";
import { useMemo } from "react";

/**
 * Generates a deterministic blocker ID based on query key.
 * Uses TanStack Query's hashKey for stable, normalized IDs across re-renders.
 * This ensures consistent key order for objects regardless of property insertion order.
 *
 * @param prefix - Prefix for the blocker ID (e.g., "query", "mutation")
 * @param queryKey - TanStack Query key to serialize
 * @returns Memoized blocker ID
 */
export function useQueryBlockerId(prefix: string, queryKey: QueryKey): string {
  return useMemo(() => `${prefix}-${hashKey(queryKey)}`, [prefix, queryKey]);
}
