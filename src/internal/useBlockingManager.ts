import { useUIBlockingStore } from "@okyrychenko-dev/react-action-guard";
import { type DependencyList, useEffect, useRef } from "react";
import { UseBlockingManagerOptions } from "./useBlockingManager.types";

/**
 * Manages blocker lifecycle (add/remove) with automatic cleanup.
 * Centralizes the common blocker management logic used across all blocking hooks.
 *
 * This hook handles:
 * - Adding/removing blockers based on shouldBlock condition
 * - Automatic cleanup on unmount
 * - Dependency tracking for re-evaluation
 * - Race condition protection for rapid state changes
 *
 * @param options - Configuration for blocker management
 * @param deps - Dependency array for the effect (similar to useEffect)
 */
export function useBlockingManager(
  {
    blockerId,
    shouldBlock,
    scope,
    reason,
    priority,
    timeout,
    onTimeout,
  }: UseBlockingManagerOptions,
  deps: DependencyList
): void {
  const { addBlocker, updateBlocker, removeBlocker } = useUIBlockingStore((state) => ({
    addBlocker: state.addBlocker,
    updateBlocker: state.updateBlocker,
    removeBlocker: state.removeBlocker,
  }));

  // Track if blocker was added in the current effect lifecycle
  const wasBlockedRef = useRef(false);
  // Track if effect is still mounted to prevent race conditions
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    if (shouldBlock) {
      if (wasBlockedRef.current) {
        updateBlocker(blockerId, { scope, reason, priority });
      } else {
        addBlocker(blockerId, { scope, reason, priority, timeout, onTimeout });
        wasBlockedRef.current = true;
      }
    } else if (wasBlockedRef.current) {
      removeBlocker(blockerId);
      wasBlockedRef.current = false;
    }

    return () => {
      isMountedRef.current = false;
      if (wasBlockedRef.current) {
        removeBlocker(blockerId);
        wasBlockedRef.current = false;
      }
    };
  }, [
    addBlocker,
    updateBlocker,
    blockerId,
    priority,
    reason,
    removeBlocker,
    scope,
    shouldBlock,
    timeout,
    onTimeout,
    ...deps,
  ]);
}
