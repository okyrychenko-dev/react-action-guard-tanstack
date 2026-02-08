import { useUIBlockingStore } from "@okyrychenko-dev/react-action-guard";
import { useEffect, useRef } from "react";
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
  }: UseBlockingManagerOptions
): void {
  const { addBlocker, updateBlocker, removeBlocker } = useUIBlockingStore((state) => ({
    addBlocker: state.addBlocker,
    updateBlocker: state.updateBlocker,
    removeBlocker: state.removeBlocker,
  }));

  // Track if blocker was added in the current effect lifecycle
  const wasBlockedRef = useRef(false);

  useEffect(() => {
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
  ]);
}
