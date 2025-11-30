# @okyrychenko-dev/react-action-guard-tanstack

[![npm version](https://img.shields.io/npm/v/@okyrychenko-dev/react-action-guard-tanstack.svg)](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard-tanstack)
[![npm downloads](https://img.shields.io/npm/dm/@okyrychenko-dev/react-action-guard-tanstack.svg)](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard-tanstack)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> TanStack Query integration for React Action Guard - seamless UI blocking for queries and mutations

## Features

- 🔄 Automatic UI blocking based on query and mutation states
- 🎯 Scope-based blocking for granular control
- 📊 Priority system for managing multiple blockers
- 💬 Dynamic reasons - different messages for different states
- 🔒 Type-safe with full TypeScript support
- ⚡ Seamless TanStack Query integration - supports all TanStack Query hooks
- 🧹 Automatic cleanup on component unmount
- 🪝 4 specialized hooks - `useBlockingQuery`, `useBlockingMutation`, `useBlockingInfiniteQuery`, `useBlockingQueries`
- 🌳 Tree-shakeable - import only what you need
- 🎨 Clean architecture - shared utilities for maintainability

## Installation

```bash
npm install @okyrychenko-dev/react-action-guard-tanstack @okyrychenko-dev/react-action-guard @tanstack/react-query zustand
# or
yarn add @okyrychenko-dev/react-action-guard-tanstack @okyrychenko-dev/react-action-guard @tanstack/react-query zustand
# or
pnpm add @okyrychenko-dev/react-action-guard-tanstack @okyrychenko-dev/react-action-guard @tanstack/react-query zustand
```

This package requires the following peer dependencies:

- [@okyrychenko-dev/react-action-guard](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard) ^0.3.0 - The core UI blocking library
- [@tanstack/react-query](https://tanstack.com/query) ^5.0.0 - TanStack Query for data fetching
- [React](https://react.dev/) ^17.0.0 || ^18.0.0
- [Zustand](https://zustand-demo.pmnd.rs/) - State management (peer dependency of react-action-guard)

## Quick Start

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBlockingQuery, useBlockingMutation } from '@okyrychenko-dev/react-action-guard-tanstack';
import { useIsBlocked } from '@okyrychenko-dev/react-action-guard';

// Setup QueryClient
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
    </QueryClientProvider>
  );
}

// Use in your components
function UserProfile() {
  const query = useBlockingQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    blockingConfig: {
      scope: 'profile',
      reason: 'Loading profile...',
    }
  });

  const isBlocked = useIsBlocked('profile');

  return (
    <div>
      {isBlocked && <LoadingSpinner />}
      {query.data && <UserInfo user={query.data} />}
    </div>
  );
}
```

## API Reference

### Hooks

#### `useBlockingQuery(options)`

A wrapper around TanStack Query's `useQuery` that integrates with the UI blocking system.

**Parameters:**

- `options: UseBlockingQueryOptions<TData, TError>` - All standard `useQuery` options plus:
  - `blockingConfig: QueryBlockingConfig` - Blocking configuration
    - `scope?: string | string[]` - Scope(s) to block
    - `reason?: string` - Default message (default: `'Loading data...'`)
    - `priority?: number` - Priority level (default: `10`)
    - `onLoading?: boolean` - Block during initial loading (default: `true`)
    - `onFetching?: boolean` - Block during background fetching (default: `false`)
    - `onError?: boolean` - Block when query fails (default: `false`)
    - `reasonOnLoading?: string` - Message for loading state
    - `reasonOnFetching?: string` - Message for fetching state
    - `reasonOnError?: string` - Message for error state

**Returns:** `UseQueryResult<TData, TError>` - Standard TanStack Query result

**Example:**

```tsx
function MyComponent() {
  const query = useBlockingQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    blockingConfig: {
      scope: 'global',
      reasonOnLoading: 'Loading users...',
      reasonOnFetching: 'Refreshing users...',
      reasonOnError: 'Failed to load users',
      onLoading: true,
      onFetching: false,
      onError: true,
    }
  });

  return <div>{/* your UI */}</div>;
}
```

#### `useBlockingMutation(options)`

A wrapper around TanStack Query's `useMutation` that integrates with the UI blocking system.

**Parameters:**

- `options: UseBlockingMutationOptions<TData, TError, TVariables>` - All standard `useMutation` options plus:
  - `blockingConfig: MutationBlockingConfig` - Blocking configuration
    - `scope?: string | string[]` - Scope(s) to block
    - `reason?: string` - Default message (default: `'Saving changes...'`)
    - `priority?: number` - Priority level (default: `30`)
    - `onError?: boolean` - Block when mutation fails (default: `false`)
    - `reasonOnPending?: string` - Message for pending state
    - `reasonOnError?: string` - Message for error state (requires `onError: true`)

**Returns:** `UseMutationResult<TData, TError, TVariables>` - Standard TanStack Query result

**Example:**

```tsx
function MyComponent() {
  const mutation = useBlockingMutation({
    mutationFn: createUser,
    blockingConfig: {
      scope: 'user-form',
      reasonOnPending: 'Creating user...',
      reasonOnError: 'Failed to create user',
      onError: true,
    }
  });

  return (
    <button onClick={() => mutation.mutate({ name: 'John' })}>
      Create User
    </button>
  );
}
```

#### `useBlockingInfiniteQuery(options)`

A wrapper around TanStack Query's `useInfiniteQuery` that integrates with the UI blocking system.

**Parameters:**

- `options: UseBlockingInfiniteQueryOptions<TData, TError, TPageParam>` - All standard `useInfiniteQuery` options plus:
  - `blockingConfig: InfiniteQueryBlockingConfig` - Blocking configuration
    - `scope?: string | string[]` - Scope(s) to block
    - `reason?: string` - Default message (default: `'Loading more data...'`)
    - `priority?: number` - Priority level (default: `10`)
    - `onLoading?: boolean` - Block during initial loading (default: `true`)
    - `onFetching?: boolean` - Block during fetching next/previous page (default: `false`)
    - `onError?: boolean` - Block when query fails (default: `false`)
    - `reasonOnLoading?: string` - Message for loading state
    - `reasonOnFetching?: string` - Message for fetching state
    - `reasonOnError?: string` - Message for error state

**Returns:** `UseInfiniteQueryResult<TData, TError>` - Standard TanStack Query result

**Example:**

```tsx
function InfiniteList() {
  const query = useBlockingInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam }) => fetchPosts(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    blockingConfig: {
      scope: 'post-list',
      reasonOnLoading: 'Loading posts...',
      reasonOnFetching: 'Loading more posts...',
      onLoading: true,
      onFetching: true,
    }
  });

  return (
    <div>
      {query.data?.pages.map((page, i) => (
        <div key={i}>
          {page.posts.map(post => (
            <div key={post.id}>{post.title}</div>
          ))}
        </div>
      ))}
      {query.hasNextPage && (
        <button onClick={() => query.fetchNextPage()}>
          Load More
        </button>
      )}
    </div>
  );
}
```

#### `useBlockingQueries(queries, blockingConfig)`

A wrapper around TanStack Query's `useQueries` that integrates with the UI blocking system.

**Parameters:**

- `queries: Array<UseBlockingQueriesOptions>` - Array of query options (same as `useQueries`)
- `blockingConfig: QueriesBlockingConfig` - Unified blocking configuration for all queries
  - `scope?: string | string[]` - Scope(s) to block
  - `reason?: string` - Default message (default: `'Loading queries...'`)
  - `priority?: number` - Priority level (default: `10`)
  - `onLoading?: boolean` - Block when any query is loading (default: `true`)
  - `onFetching?: boolean` - Block when any query is fetching (default: `false`)
  - `onError?: boolean` - Block when any query fails (default: `false`)
  - `reasonOnLoading?: string` - Message for loading state
  - `reasonOnFetching?: string` - Message for fetching state
  - `reasonOnError?: string` - Message for error state

**Returns:** Array of `UseQueryResult` - Standard TanStack Query results

**Example:**

```tsx
function Dashboard() {
  const results = useBlockingQueries(
    [
      { queryKey: ['user'], queryFn: fetchUser },
      { queryKey: ['posts'], queryFn: fetchPosts },
      { queryKey: ['comments'], queryFn: fetchComments },
    ],
    {
      scope: 'dashboard',
      reasonOnLoading: 'Loading dashboard...',
      reasonOnFetching: 'Refreshing data...',
      onLoading: true,
    }
  );

  const [userQuery, postsQuery, commentsQuery] = results;

  return (
    <div>
      <div>User: {userQuery.data?.name}</div>
      <div>Posts: {postsQuery.data?.length}</div>
      <div>Comments: {commentsQuery.data?.length}</div>
    </div>
  );
}
```

## Tree Shaking

The library is fully tree-shakeable. Import only the hooks you need to keep your bundle size small:

```tsx
// Only imports the hook you need
import { useBlockingQuery } from '@okyrychenko-dev/react-action-guard-tanstack';

// Internal utilities are not bundled unless used
import { useBlockingMutation } from '@okyrychenko-dev/react-action-guard-tanstack';
```

The package is configured with `"sideEffects": false`, allowing modern bundlers (Webpack, Rollup, Vite) to eliminate unused code automatically.

**Bundle sizes** (approximate):
- Full library: ~6.3 KB (ESM, minified)
- Single hook: ~2-3 KB (with shared utilities)

## TypeScript

The package is written in TypeScript and includes full type definitions.

```typescript
import type {
  // Hook options types
  UseBlockingQueryOptions,
  UseBlockingMutationOptions,
  UseBlockingInfiniteQueryOptions,
  UseBlockingQueriesOptions,

  // Config types
  QueryBlockingConfig,
  MutationBlockingConfig,
  InfiniteQueryBlockingConfig,
  QueriesBlockingConfig,

  // Base types
  BaseBlockingConfig,
} from '@okyrychenko-dev/react-action-guard-tanstack';

// Usage with type parameters
interface User {
  id: number;
  name: string;
  email: string;
}

const query = useBlockingQuery<User>({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
  blockingConfig: {
    scope: 'user',
    reason: 'Loading user...',
  }
});
// query.data is User | undefined

const mutation = useBlockingMutation<
  User,           // Response type
  Error,          // Error type
  { name: string } // Variables type
>({
  mutationFn: (variables) => createUser(variables),
  blockingConfig: {
    scope: 'user-form',
    reasonOnPending: 'Creating user...',
  }
});
```

## Use Cases

### Loading States

```tsx
function DataLoader() {
  const query = useBlockingQuery({
    queryKey: ['data'],
    queryFn: fetchData,
    blockingConfig: {
      scope: 'content',
      reasonOnLoading: 'Loading data...',
      onLoading: true,
    }
  });

  // ... rest of component
}
```

### Form Submission

```tsx
import { useBlockingMutation, useIsBlocked } from '@okyrychenko-dev/react-action-guard-tanstack';

function UserForm() {
  const mutation = useBlockingMutation({
    mutationFn: submitForm,
    blockingConfig: {
      scope: 'form',
      reasonOnPending: 'Submitting form...',
      reasonOnError: 'Failed to submit',
      onError: true,
    }
  });

  const isBlocked = useIsBlocked('form');

  const handleSubmit = async (data) => {
    await mutation.mutateAsync(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input disabled={isBlocked} />
      <button disabled={isBlocked}>Submit</button>
    </form>
  );
}
```

### Infinite Scrolling

```tsx
import { useBlockingInfiniteQuery } from '@okyrychenko-dev/react-action-guard-tanstack';

function InfinitePostList() {
  const query = useBlockingInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam }) => fetchPosts(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    blockingConfig: {
      scope: 'post-list',
      reasonOnLoading: 'Loading posts...',
      reasonOnFetching: 'Loading more posts...',
      onLoading: true,
      onFetching: true,
    }
  });

  return (
    <div>
      {query.data?.pages.map((page) =>
        page.posts.map(post => <PostCard key={post.id} post={post} />)
      )}
      {query.hasNextPage && (
        <button onClick={() => query.fetchNextPage()}>
          Load More
        </button>
      )}
    </div>
  );
}
```

### Multiple Parallel Queries

```tsx
import { useBlockingQueries } from '@okyrychenko-dev/react-action-guard-tanstack';

function UserDashboard({ userId }) {
  const results = useBlockingQueries(
    [
      { queryKey: ['user', userId], queryFn: () => fetchUser(userId) },
      { queryKey: ['posts', userId], queryFn: () => fetchUserPosts(userId) },
      { queryKey: ['stats', userId], queryFn: () => fetchUserStats(userId) },
    ],
    {
      scope: 'user-dashboard',
      reasonOnLoading: 'Loading dashboard...',
      onLoading: true,
    }
  );

  const [userQuery, postsQuery, statsQuery] = results;

  return (
    <div>
      <h1>{userQuery.data?.name}</h1>
      <p>Posts: {postsQuery.data?.length}</p>
      <p>Total views: {statsQuery.data?.views}</p>
    </div>
  );
}
```

### Global Loading Overlay

```tsx
import { useIsBlocked } from '@okyrychenko-dev/react-action-guard';

function App() {
  const isGloballyBlocked = useIsBlocked('global');

  return (
    <div>
      {isGloballyBlocked && <LoadingOverlay />}
      <YourApp />
    </div>
  );
}

function SomeComponent() {
  const query = useBlockingQuery({
    queryKey: ['critical-data'],
    queryFn: fetchCriticalData,
    blockingConfig: {
      scope: 'global', // Blocks entire app
      reasonOnLoading: 'Loading critical data...',
    }
  });

  return <div>Content</div>;
}
```

### Multi-Step Process with Priority

```tsx
function MultiStepWizard() {
  const [step, setStep] = useState(1);

  // Higher priority for payment step
  const paymentMutation = useBlockingMutation({
    mutationFn: processPayment,
    blockingConfig: {
      scope: ['navigation', 'form'],
      reasonOnPending: 'Processing payment...',
      priority: 100, // High priority
    }
  });

  // Lower priority for other steps
  const saveDraftMutation = useBlockingMutation({
    mutationFn: saveDraft,
    blockingConfig: {
      scope: 'navigation',
      reasonOnPending: 'Saving draft...',
      priority: 50, // Lower priority
    }
  });

  return <div>Step {step}</div>;
}
```

### Background Refetch Without Blocking

```tsx
function LiveData() {
  const query = useBlockingQuery({
    queryKey: ['live-data'],
    queryFn: fetchLiveData,
    refetchInterval: 5000, // Refetch every 5 seconds
    blockingConfig: {
      scope: 'dashboard',
      onLoading: true,   // Block initial load
      onFetching: false, // Don't block background refetch
      reasonOnLoading: 'Loading data...',
    }
  });

  return <div>Data: {query.data?.value}</div>;
}
```

### Conditional Error Blocking

```tsx
function CriticalDataLoader() {
  const query = useBlockingQuery({
    queryKey: ['critical-data'],
    queryFn: fetchCriticalData,
    blockingConfig: {
      scope: 'app',
      onError: true, // Block UI on error
      reasonOnLoading: 'Loading critical data...',
      reasonOnError: 'Critical error - please refresh',
    }
  });

  return <div>Content</div>;
}
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Build the package
npm run build

# Type checking
npm run typecheck

# Lint code
npm run lint

# Fix lint errors
npm run lint:fix

# Format code
npm run format

# Watch mode for development
npm run dev
```

## Contributing

Contributions are welcome! Please ensure:

1. All tests pass (`npm run test`)
2. Code is properly typed (`npm run typecheck`)
3. Linting passes (`npm run lint`)
4. Code is formatted (`npm run format`)

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a detailed list of changes in each version.

## License

MIT © Olexii Kyrychenko
