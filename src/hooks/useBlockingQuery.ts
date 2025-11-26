import { useUIBlockingStore } from "@okyrychenko-dev/react-action-guard";
import { type QueryKey, type UseQueryResult, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import type { UseBlockingQueryOptions } from "./useBlockingQuery.types";

/**
 * A wrapper around TanStack Query's `useQuery` that integrates with the UI blocking system.
 *
 * This hook provides the same API as `useQuery` with additional blocking configuration.
 * It automatically manages UI blocking based on query states (loading, fetching, error).
 *
 * @typeParam TQueryFnData - The type of data returned by the query function
 * @typeParam TError - The type of error that can be thrown
 * @typeParam TData - The type of data returned by the hook (after select transformation)
 * @typeParam TQueryKey - The type of the query key
 *
 * @param options - Query options including blocking configuration
 * @returns Query result object from TanStack Query
 */
export function useBlockingQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseBlockingQueryOptions<TQueryFnData, TError, TData, TQueryKey>
): UseQueryResult<TData, TError> {
  const { blockingConfig, ...queryOptions } = options;
  const query = useQuery(queryOptions);

  const blockerId = useMemo(() => `query-${JSON.stringify(options.queryKey)}`, [options.queryKey]);

  const { addBlocker, removeBlocker } = useUIBlockingStore((state) => ({
    addBlocker: state.addBlocker,
    removeBlocker: state.removeBlocker,
  }));

  useEffect(() => {
    const {
      scope,
      reason = "Loading data...",
      reasonOnLoading,
      reasonOnFetching,
      reasonOnError,
      priority = 10,
      onLoading = true,
      onFetching = false,
      onError = false,
    } = blockingConfig;

    const shouldBlock =
      (onLoading && query.isLoading) ||
      (onFetching && query.isFetching && !query.isLoading) ||
      (onError && query.isError);

    if (shouldBlock) {
      // Determine the appropriate reason based on current state
      let currentReason: string = reason;
      if (query.isLoading && reasonOnLoading !== undefined) {
        currentReason = reasonOnLoading;
      } else if (query.isFetching && !query.isLoading && reasonOnFetching !== undefined) {
        currentReason = reasonOnFetching;
      } else if (query.isError && reasonOnError !== undefined) {
        currentReason = reasonOnError;
      }

      addBlocker(blockerId, { scope, reason: currentReason, priority });
    } else {
      removeBlocker(blockerId);
    }

    return () => {
      removeBlocker(blockerId);
    };
  }, [
    query.isLoading,
    query.isFetching,
    query.isError,
    query.status,
    query.dataUpdatedAt,
    blockingConfig,
    blockerId,
    addBlocker,
    removeBlocker,
    options.queryKey,
  ]);

  return query;
}
