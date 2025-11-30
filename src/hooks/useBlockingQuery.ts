import { type QueryKey, type UseQueryResult, useQuery } from "@tanstack/react-query";
import { useBlockingManager, useQueryBlockerId } from "../internal";
import { resolveBlockingReason } from "../utils";
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

  const blockerId = useQueryBlockerId("query", options.queryKey);

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

  const currentReason = resolveBlockingReason({
    defaultReason: reason,
    stateReasons: [
      { condition: query.isLoading, reason: reasonOnLoading },
      { condition: query.isFetching && !query.isLoading, reason: reasonOnFetching },
      { condition: query.isError, reason: reasonOnError },
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
    [
      query.isLoading,
      query.isFetching,
      query.isError,
      query.status,
      query.dataUpdatedAt,
      blockingConfig,
      options.queryKey,
    ]
  );

  return query;
}
