import { useMemo } from "react";
import type { QueryKey } from "@tanstack/react-query";

/**
 * Generates a deterministic blocker ID based on query key.
 * Uses JSON stringification for stable IDs across re-renders.
 *
 * @param prefix - Prefix for the blocker ID (e.g., "query", "mutation")
 * @param queryKey - TanStack Query key to serialize
 * @returns Memoized blocker ID
 */
export function useQueryBlockerId(prefix: string, queryKey: QueryKey): string {
  return useMemo(() => `${prefix}-${JSON.stringify(queryKey)}`, [prefix, queryKey]);
}
