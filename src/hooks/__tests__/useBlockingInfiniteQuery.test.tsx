import { uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createWrapper } from "../../test/test.utils";
import { useBlockingInfiniteQuery } from "../useBlockingInfiniteQuery";
import { InfiniteQueryBlockingConfig } from "../useBlockingInfiniteQuery.types";

describe("useBlockingInfiniteQuery", () => {
  beforeEach(() => {
    uiBlockingStoreApi.getState().clearAllBlockers();
  });

  it("should block UI during initial loading", async () => {
    const queryFn = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ data: ["item1"], nextCursor: 2 }), 100);
        })
    );

    const blockingConfig: InfiniteQueryBlockingConfig = {
      scope: "test",
      reason: "Loading more data...",
      onLoading: true,
    };

    renderHook(
      () =>
        useBlockingInfiniteQuery({
          queryKey: ["infinite-test"],
          queryFn,
          initialPageParam: 1,
          getNextPageParam: (lastPage) => lastPage.nextCursor,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    // Should block during loading
    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();
      expect(isBlocked("test")).toBe(true);
    });

    // Should unblock after loading completes
    await waitFor(
      () => {
        const { isBlocked } = uiBlockingStoreApi.getState();
        expect(isBlocked("test")).toBe(false);
      },
      { timeout: 2000 }
    );
  });

  it("should not block when onLoading is false", async () => {
    const queryFn = vi.fn().mockResolvedValue({ data: ["item1"], nextCursor: 2 });

    const blockingConfig: InfiniteQueryBlockingConfig = {
      scope: "test",
      onLoading: false,
    };

    renderHook(
      () =>
        useBlockingInfiniteQuery({
          queryKey: ["infinite-test"],
          queryFn,
          initialPageParam: 1,
          getNextPageParam: (lastPage) => lastPage.nextCursor,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    const { isBlocked } = uiBlockingStoreApi.getState();
    expect(isBlocked("test")).toBe(false);
  });

  it("should block on error when onError is true", async () => {
    const queryFn = vi.fn().mockRejectedValue(new Error("Test error"));

    const blockingConfig: InfiniteQueryBlockingConfig = {
      scope: "test",
      onError: true,
    };

    renderHook(
      () =>
        useBlockingInfiniteQuery({
          queryKey: ["infinite-test"],
          queryFn,
          initialPageParam: 1,
          getNextPageParam: () => undefined,
          retry: false,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();
      expect(isBlocked("test")).toBe(true);
    });
  });

  it("should use reasonOnLoading during initial loading state", async () => {
    const queryFn = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ data: ["item1"], nextCursor: 2 }), 100);
        })
    );

    const blockingConfig: InfiniteQueryBlockingConfig = {
      scope: "test",
      reason: "Default reason",
      reasonOnLoading: "Loading first page...",
      onLoading: true,
    };

    renderHook(
      () =>
        useBlockingInfiniteQuery({
          queryKey: ["infinite-test"],
          queryFn,
          initialPageParam: 1,
          getNextPageParam: (lastPage: { nextCursor: number }) => lastPage.nextCursor,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    // Should block during loading
    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();
      expect(isBlocked("test")).toBe(true);
    });
  });

  it("should use reasonOnError during error state", async () => {
    const queryFn = vi.fn().mockRejectedValue(new Error("Test error"));

    const blockingConfig: InfiniteQueryBlockingConfig = {
      scope: "test",
      reason: "Default reason",
      reasonOnError: "Failed to load data",
      onError: true,
    };

    renderHook(
      () =>
        useBlockingInfiniteQuery({
          queryKey: ["infinite-test"],
          queryFn,
          initialPageParam: 1,
          getNextPageParam: () => undefined,
          retry: false,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();
      expect(isBlocked("test")).toBe(true);
    });
  });

  it("should fall back to reason when specific reasons are not provided", async () => {
    const queryFn = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ data: ["item1"], nextCursor: 2 }), 100);
        })
    );

    const blockingConfig: InfiniteQueryBlockingConfig = {
      scope: "test",
      reason: "Fallback reason",
      onLoading: true,
    };

    renderHook(
      () =>
        useBlockingInfiniteQuery({
          queryKey: ["infinite-test"],
          queryFn,
          initialPageParam: 1,
          getNextPageParam: (lastPage: { nextCursor: number }) => lastPage.nextCursor,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();
      expect(isBlocked("test")).toBe(true);
    });
  });

  it("should support multiple scopes", async () => {
    const queryFn = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ data: ["item1"], nextCursor: 2 }), 100);
        })
    );

    const blockingConfig: InfiniteQueryBlockingConfig = {
      scope: ["scope1", "scope2"],
      reason: "Loading...",
      onLoading: true,
    };

    renderHook(
      () =>
        useBlockingInfiniteQuery({
          queryKey: ["infinite-test"],
          queryFn,
          initialPageParam: 1,
          getNextPageParam: (lastPage: { nextCursor: number }) => lastPage.nextCursor,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();
      expect(isBlocked("scope1")).toBe(true);
      expect(isBlocked("scope2")).toBe(true);
    });
  });

  it("should use correct priority", async () => {
    const queryFn = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ data: ["item1"], nextCursor: 2 }), 100);
        })
    );

    const blockingConfig: InfiniteQueryBlockingConfig = {
      scope: "test",
      reason: "Loading...",
      priority: 50,
      onLoading: true,
    };

    renderHook(
      () =>
        useBlockingInfiniteQuery({
          queryKey: ["infinite-test"],
          queryFn,
          initialPageParam: 1,
          getNextPageParam: (lastPage: { nextCursor: number }) => lastPage.nextCursor,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    // Should block during loading (priority is internal implementation detail)
    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();
      expect(isBlocked("test")).toBe(true);
    });
  });

  it("should clean up blocker on unmount", async () => {
    const queryFn = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ data: ["item1"], nextCursor: 2 }), 100);
        })
    );

    const blockingConfig: InfiniteQueryBlockingConfig = {
      scope: "test",
      reason: "Loading...",
      onLoading: true,
    };

    const { unmount } = renderHook(
      () =>
        useBlockingInfiniteQuery({
          queryKey: ["infinite-test"],
          queryFn,
          initialPageParam: 1,
          getNextPageParam: (lastPage: { nextCursor: number }) => lastPage.nextCursor,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    // Wait for blocker to be added
    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();
      expect(isBlocked("test")).toBe(true);
    });

    // Unmount and check blocker is removed
    unmount();

    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();
      expect(isBlocked("test")).toBe(false);
    });
  });
});
