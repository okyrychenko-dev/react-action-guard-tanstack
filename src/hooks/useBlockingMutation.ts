import { type UseMutationResult, useMutation } from "@tanstack/react-query";
import { useBlockingManager, useMutationBlockerId } from "../internal";
import { resolveBlockingReason } from "../utils";
import type { UseBlockingMutationOptions } from "./useBlockingMutation.types";

/**
 * A wrapper around TanStack Query's `useMutation` that integrates with the UI blocking system.
 *
 * This hook provides the same API as `useMutation` with additional blocking configuration.
 * It automatically manages UI blocking during mutation execution and optionally on errors.
 *
 * @typeParam TData - The type of data returned by the mutation
 * @typeParam TError - The type of error that can be thrown
 * @typeParam TVariables - The type of variables passed to the mutation
 * @typeParam TContext - The type of context for optimistic updates
 *
 * @param options - Mutation options including blocking configuration
 * @returns Mutation result object from TanStack Query
 */
export function useBlockingMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>(
  options: UseBlockingMutationOptions<TData, TError, TVariables, TContext>
): UseMutationResult<TData, TError, TVariables, TContext> {
  const { blockingConfig, mutationKey, ...mutationOptions } = options;
  const mutation = useMutation({ mutationKey, ...mutationOptions });

  const blockerId = useMutationBlockerId("mutation", mutationKey);

  const {
    scope,
    reason = "Saving changes...",
    reasonOnPending,
    reasonOnError,
    priority = 30,
    timeout,
    onTimeout,
    onError = false,
  } = blockingConfig;

  const shouldBlock = mutation.isPending || (onError && mutation.isError);

  const currentReason = resolveBlockingReason({
    defaultReason: reason,
    stateReasons: [
      { condition: mutation.isPending, reason: reasonOnPending },
      { condition: mutation.isError, reason: reasonOnError },
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
    [mutation.isPending, mutation.isError, mutation.status, blockingConfig]
  );

  return mutation;
}
