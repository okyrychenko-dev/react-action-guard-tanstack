import type { QueryKey, UseQueryOptions } from "@tanstack/react-query";

/**
 * Base configuration for query blocking
 */
interface BaseQueryBlockingConfig {
  /**
   * Scope(s) to block. Can be a single string or array of strings.
   * Use scopes to control which parts of your UI should be blocked.
   */
  scope?: string | ReadonlyArray<string>;
  /**
   * Priority level for this blocker (default: 10).
   * Higher priority blockers take precedence when multiple blockers are active.
   */
  priority?: number;
  /**
   * Default message for all states. Falls back to "Loading data..." if not specified.
   * Can be overridden by specific state reasons (reasonOnLoading, reasonOnFetching, reasonOnError).
   */
  reason?: string;
}

/**
 * Configuration for query blocking with dynamic reasons.
 * Supports different messages for loading, fetching, and error states.
 */
export interface QueryBlockingConfig extends BaseQueryBlockingConfig {
  /**
   * Whether to block during initial loading (default: true).
   * Set to false to skip blocking during the first data fetch.
   */
  onLoading?: boolean;
  /**
   * Whether to block during background fetching (default: false).
   * Set to true to block when refetching data in the background.
   */
  onFetching?: boolean;
  /**
   * Whether to block on error (default: false).
   * Set to true to keep UI blocked when query fails.
   */
  onError?: boolean;
  /**
   * Message to show during initial loading.
   * Falls back to `reason` if not specified.
   */
  reasonOnLoading?: string;
  /**
   * Message to show during background fetching.
   * Falls back to `reason` if not specified.
   */
  reasonOnFetching?: string;
  /**
   * Message to show when query fails.
   * Falls back to `reason` if not specified.
   */
  reasonOnError?: string;
}

/**
 * Options for useBlockingQuery hook.
 * Extends TanStack Query's UseQueryOptions with blocking configuration.
 *
 * @typeParam TQueryFnData - The type of data returned by the query function
 * @typeParam TError - The type of error that can be thrown
 * @typeParam TData - The type of data returned by the hook (after select transformation)
 * @typeParam TQueryKey - The type of the query key
 */
export interface UseBlockingQueryOptions<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> extends UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> {
  /**
   * Configuration for UI blocking behavior during query execution.
   */
  blockingConfig: QueryBlockingConfig;
}
