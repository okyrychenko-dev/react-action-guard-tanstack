import type { InfiniteData, UseQueryResult } from "@tanstack/react-query";
import { expect, it } from "vitest";
import { useBlockingInfiniteQuery } from "../useBlockingInfiniteQuery";
import { useBlockingMutation } from "../useBlockingMutation";
import { useBlockingQueries } from "../useBlockingQueries";
import { useBlockingQuery } from "../useBlockingQuery";

type IsEqual<A, B> =
  (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

declare function assertType<T extends true>(): void;

function tuple<T extends unknown[]>(...values: T): T {
  return values;
}

it("preserves query select inference", () => {
  function useTypedQuery() {
    return useBlockingQuery({
      queryKey: tuple("user"),
      queryFn: async () => ({ id: 1, name: "Ada" }),
      select: (data) => data.name,
      blockingConfig: {
        scope: "query",
      },
    });
  }

  type QueryResult = ReturnType<typeof useTypedQuery>;

  assertType<IsEqual<QueryResult, UseQueryResult<string, Error>>>();
  assertType<IsEqual<QueryResult["data"], string | undefined>>();
});

it("preserves infinite query data shape", () => {
  function useTypedInfiniteQuery() {
    return useBlockingInfiniteQuery({
      queryKey: tuple("feed"),
      queryFn: async ({ pageParam }: { pageParam: number }) => ({
        items: [pageParam],
        nextPage: pageParam + 1,
      }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => lastPage.nextPage,
      blockingConfig: {
        scope: "infinite",
      },
    });
  }

  type InfiniteResult = ReturnType<typeof useTypedInfiniteQuery>;
  type PageData = {
    items: number[];
    nextPage: number;
  };

  assertType<IsEqual<InfiniteResult["data"], InfiniteData<PageData> | undefined>>();
});

it("preserves mutation variable and result inference", () => {
  function useTypedMutation() {
    return useBlockingMutation({
      mutationFn: async (variables: { id: string }): Promise<{ ok: true; id: string }> => {
        return {
          ok: true,
          id: variables.id,
        };
      },
      onMutate: async (variables) => ({
        snapshotId: variables.id,
      }),
      blockingConfig: {
        scope: "mutation",
      },
    });
  }

  type MutationResult = ReturnType<typeof useTypedMutation>;

  assertType<IsEqual<Parameters<MutationResult["mutate"]>[0], { id: string }>>();
  assertType<IsEqual<MutationResult["data"], { ok: true; id: string } | undefined>>();
  assertType<IsEqual<MutationResult["variables"], { id: string } | undefined>>();
});

it("preserves tuple inference for parallel queries", () => {
  function useTypedQueries() {
    return useBlockingQueries(
      tuple(
        {
          queryKey: tuple("user"),
          queryFn: async () => ({ id: 1, name: "Ada" }),
          select: (data: { id: number; name: string }) => data.name,
        },
        {
          queryKey: tuple("posts"),
          queryFn: async () => [{ id: 1, title: "Hello" }],
        },
      ),
      {
        scope: "queries",
      }
    );
  }

  type QueryResults = ReturnType<typeof useTypedQueries>;

  assertType<IsEqual<QueryResults[0]["data"], string | undefined>>();
  assertType<
    IsEqual<QueryResults[1]["data"], Array<{ id: number; title: string }> | undefined>
  >();

  expect(true).toBe(true);
});
