import { useUIBlockingStore } from "@okyrychenko-dev/react-action-guard";
import { type DependencyList, useEffect } from "react";
import { UseBlockingManagerOptions } from "./useBlockingManager.types";

/**
 * Manages blocker lifecycle (add/remove) with automatic cleanup.
 * Centralizes the common blocker management logic used across all blocking hooks.
 *
 * This hook handles:
 * - Adding/removing blockers based on shouldBlock condition
 * - Automatic cleanup on unmount
 * - Dependency tracking for re-evaluation
 *
 * @param options - Configuration for blocker management
 * @param deps - Dependency array for the effect (similar to useEffect)
 */
export function useBlockingManager(
  { blockerId, shouldBlock, scope, reason, priority }: UseBlockingManagerOptions,
  deps: DependencyList
): void {
  const { addBlocker, removeBlocker } = useUIBlockingStore((state) => ({
    addBlocker: state.addBlocker,
    removeBlocker: state.removeBlocker,
  }));

  useEffect(() => {
    if (shouldBlock) {
      addBlocker(blockerId, { scope, reason, priority });
    } else {
      removeBlocker(blockerId);
    }

    return () => {
      removeBlocker(blockerId);
    };
  }, [addBlocker, blockerId, priority, reason, removeBlocker, scope, shouldBlock, ...deps]);
}
