import { type QueryKey, useQueries } from "@tanstack/react-query";
import { useBlockingManager, useRandomBlockerId } from "../internal";
import { resolveBlockingReason } from "../utils";
import type { QueriesBlockingConfig, UseBlockingQueriesOptions } from "./useBlockingQueries.types";

/**
 * A wrapper around TanStack Query's `useQueries` that integrates with the UI blocking system.
 *
 * This hook provides the same API as `useQueries` with additional blocking configuration.
 * It automatically manages UI blocking based on the combined state of multiple queries.
 *
 * @typeParam TQueryFnData - The type of data returned by the query function
 * @typeParam TError - The type of error that can be thrown
 * @typeParam TData - The type of data returned by the hook (after select transformation)
 * @typeParam TQueryKey - The type of the query key
 *
 * @param queries - Array of query options
 * @param blockingConfig - Configuration for UI blocking behavior
 * @returns Array of query result objects from TanStack Query
 */
export function useBlockingQueries<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  queries: ReadonlyArray<UseBlockingQueriesOptions<TQueryFnData, TError, TData, TQueryKey>>,
  blockingConfig: QueriesBlockingConfig
) {
  const results = useQueries({
    queries,
  });

  const blockerId = useRandomBlockerId();

  const {
    scope,
    reason = "Loading queries...",
    reasonOnLoading,
    reasonOnFetching,
    reasonOnError,
    priority = 10,
    onLoading = true,
    onFetching = false,
    onError = false,
  } = blockingConfig;

  const loadingCount = results.filter((r) => r.isLoading).length;
  const fetchingCount = results.filter((r) => r.isFetching && !r.isLoading).length;
  const errorCount = results.filter((r) => r.isError).length;

  const shouldBlock =
    (onLoading && loadingCount > 0) ||
    (onFetching && fetchingCount > 0) ||
    (onError && errorCount > 0);

  const currentReason = resolveBlockingReason({
    defaultReason: reason,
    stateReasons: [
      { condition: loadingCount > 0, reason: reasonOnLoading },
      { condition: fetchingCount > 0, reason: reasonOnFetching },
      { condition: errorCount > 0, reason: reasonOnError },
    ],
  });

  useBlockingManager(
    {
      blockerId,
      shouldBlock,
      scope,
      reason: currentReason,
      priority,
    },
    [results, blockingConfig]
  );

  return results;
}
