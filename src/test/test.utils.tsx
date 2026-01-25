import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act } from "@testing-library/react";
import { ReactElement, ReactNode } from "react";

/**
 * Helper to execute an async function with proper act() wrapping
 * while preserving type information.
 */
export async function actAsync<T>(fn: () => Promise<T>): Promise<T> {
  return await act(async () => {
    return await fn();
  });
}

// Helper to create a wrapper with QueryClient
export function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false,
      },
    },
  });

  return function ({ children }: { children: ReactNode }): ReactElement {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}
