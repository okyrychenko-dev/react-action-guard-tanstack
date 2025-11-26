import { useUIBlockingStore } from "@okyrychenko-dev/react-action-guard";
import { type UseMutationResult, useMutation } from "@tanstack/react-query";
import { useEffect, useId, useMemo } from "react";
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

  const id = useId();
  // Use mutationKey for deterministic ID if available, otherwise use random ID
  const blockerId = useMemo(
    () => (mutationKey ? `mutation-${JSON.stringify(mutationKey)}` : `mutation-${id}`),
    [mutationKey, id]
  );

  const { addBlocker, removeBlocker } = useUIBlockingStore((state) => ({
    addBlocker: state.addBlocker,
    removeBlocker: state.removeBlocker,
  }));

  useEffect(() => {
    const {
      scope,
      reason = "Saving changes...",
      reasonOnPending,
      reasonOnError,
      priority = 30,
      onError = false,
    } = blockingConfig;

    const shouldBlock = mutation.isPending || (onError && mutation.isError);

    if (shouldBlock) {
      // Determine the appropriate reason based on current state
      let currentReason: string = reason;
      if (mutation.isPending && reasonOnPending !== undefined) {
        currentReason = reasonOnPending;
      } else if (mutation.isError && reasonOnError !== undefined) {
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
    mutation.isPending,
    mutation.isError,
    mutation.status,
    blockerId,
    addBlocker,
    removeBlocker,
    blockingConfig,
  ]);

  return mutation;
}
