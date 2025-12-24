import {
  type QueryKey,
  type UseInfiniteQueryResult,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { useBlockingManager, useQueryBlockerId } from "../internal";
import { resolveBlockingReason } from "../utils";
import type { UseBlockingInfiniteQueryOptions } from "./useBlockingInfiniteQuery.types";

/**
 * A wrapper around TanStack Query's `useInfiniteQuery` that integrates with the UI blocking system.
 *
 * This hook provides the same API as `useInfiniteQuery` with additional blocking configuration.
 * It automatically manages UI blocking based on infinite query states (loading, fetching pages, error).
 *
 * @typeParam TQueryFnData - The type of data returned by the query function
 * @typeParam TError - The type of error that can be thrown
 * @typeParam TData - The type of data returned by the hook (after select transformation)
 * @typeParam TQueryKey - The type of the query key
 * @typeParam TPageParam - The type of the page parameter
 *
 * @param options - Infinite query options including blocking configuration
 * @returns Infinite query result object from TanStack Query
 */
export function useBlockingInfiniteQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(
  options: UseBlockingInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>
): UseInfiniteQueryResult<TData, TError> {
  const { blockingConfig, ...queryOptions } = options;
  const query = useInfiniteQuery(queryOptions);

  const blockerId = useQueryBlockerId("infinite-query", options.queryKey);

  const {
    scope,
    reason = "Loading more data...",
    reasonOnLoading,
    reasonOnFetching,
    reasonOnError,
    priority = 10,
    timeout,
    onTimeout,
    onLoading = true,
    onFetching = false,
    onError = false,
  } = blockingConfig;

  const isFetchingButNotLoading =
    (query.isFetching || query.isFetchingNextPage || query.isFetchingPreviousPage) &&
    !query.isLoading;

  const shouldBlock =
    (onLoading && query.isLoading) ||
    (onFetching && isFetchingButNotLoading) ||
    (onError && query.isError);

  const currentReason = resolveBlockingReason({
    defaultReason: reason,
    stateReasons: [
      { condition: query.isLoading, reason: reasonOnLoading },
      { condition: isFetchingButNotLoading, reason: reasonOnFetching },
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
      timeout,
      onTimeout,
    },
    [
      query.isLoading,
      query.isFetching,
      query.isFetchingNextPage,
      query.isFetchingPreviousPage,
      query.isError,
      query.status,
      query.hasNextPage,
      query.hasPreviousPage,
      blockingConfig,
      options.queryKey,
    ]
  );

  return query;
}
