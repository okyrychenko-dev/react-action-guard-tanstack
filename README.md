# @okyrychenko-dev/react-action-guard-tanstack

[![npm version](https://img.shields.io/npm/v/@okyrychenko-dev/react-action-guard-tanstack.svg)](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard-tanstack)
[![npm downloads](https://img.shields.io/npm/dm/@okyrychenko-dev/react-action-guard-tanstack.svg)](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard-tanstack)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> TanStack Query integration for React Action Guard - seamless UI blocking for queries and mutations

## Features

- 🔄 **Automatic UI blocking** based on query and mutation states
- 🎯 **Scope-based blocking** for granular control
- 📊 **Priority system** for managing multiple blockers
- 💬 **Dynamic reasons** - different messages for different states
- 🔒 **Type-safe** with full TypeScript support
- ⚡ **Seamless TanStack Query integration** - supports all TanStack Query hooks
- 🧹 **Automatic cleanup** on component unmount
- 🪝 **4 specialized hooks** - `useBlockingQuery`, `useBlockingMutation`, `useBlockingInfiniteQuery`, `useBlockingQueries`
- 🎨 **Clean architecture** - shared utilities for maintainability

## Installation

```bash
npm install @okyrychenko-dev/react-action-guard-tanstack @okyrychenko-dev/react-action-guard @tanstack/react-query zustand
# or
yarn add @okyrychenko-dev/react-action-guard-tanstack @okyrychenko-dev/react-action-guard @tanstack/react-query zustand
# or
pnpm add @okyrychenko-dev/react-action-guard-tanstack @okyrychenko-dev/react-action-guard @tanstack/react-query zustand
```

This package requires the following peer dependencies:

- [@okyrychenko-dev/react-action-guard](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard) - The core UI blocking library
- [@tanstack/react-query](https://tanstack.com/query) - TanStack Query for data fetching
- [React](https://react.dev/) ^17.0.0 || ^18.0.0
- [Zustand](https://zustand-demo.pmnd.rs/) - State management (peer dependency of react-action-guard)

## Quick Start

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useBlockingQuery,
  useBlockingMutation,
  useBlockingInfiniteQuery,
  useBlockingQueries
} from '@okyrychenko-dev/react-action-guard-tanstack';

// Wrap your app with QueryClientProvider
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
    </QueryClientProvider>
  );
}

// Single query
function UserProfile() {
  const query = useBlockingQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    blockingConfig: {
      scope: 'profile',
      reason: 'Loading profile...',
    }
  });

  return <div>{query.data?.name}</div>;
}

// Mutation
function CreateUserForm() {
  const mutation = useBlockingMutation({
    mutationFn: createUser,
    blockingConfig: {
      scope: 'user-form',
      reason: 'Creating user...',
    }
  });

  return (
    <button onClick={() => mutation.mutate({ name: 'John' })}>
      Create User
    </button>
  );
}

// Infinite query
function PostList() {
  const query = useBlockingInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam }) => fetchPosts(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    blockingConfig: {
      scope: 'posts',
      reasonOnLoading: 'Loading posts...',
      reasonOnFetching: 'Loading more...',
    }
  });

  return (
    <div>
      {query.data?.pages.map((page) =>
        page.posts.map(post => <div key={post.id}>{post.title}</div>)
      )}
      {query.hasNextPage && (
        <button onClick={() => query.fetchNextPage()}>Load More</button>
      )}
    </div>
  );
}

// Multiple queries
function Dashboard() {
  const results = useBlockingQueries(
    [
      { queryKey: ['user'], queryFn: fetchUser },
      { queryKey: ['stats'], queryFn: fetchStats },
      { queryKey: ['notifications'], queryFn: fetchNotifications },
    ],
    {
      scope: 'dashboard',
      reason: 'Loading dashboard...',
    }
  );

  const [userQuery, statsQuery, notificationsQuery] = results;

  return (
    <div>
      <h1>{userQuery.data?.name}</h1>
      <p>Stats: {statsQuery.data?.total}</p>
      <p>Notifications: {notificationsQuery.data?.length}</p>
    </div>
  );
}
```

## API Reference

### `useBlockingQuery`

A wrapper around TanStack Query's `useQuery` that integrates with the UI blocking system.

#### Basic Usage

```tsx
import { useBlockingQuery } from '@okyrychenko-dev/react-action-guard-tanstack';

function MyComponent() {
  const query = useBlockingQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    blockingConfig: {
      scope: 'global',
      reason: 'Loading users...',
      priority: 10,
      onLoading: true,
      onFetching: false,
      onError: false,
    }
  });

  return <div>{/* your UI */}</div>;
}
```

#### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `scope` | `string \| ReadonlyArray<string>` | `undefined` | Scope(s) to block |
| `reason` | `string` | `'Loading data...'` | Default message for all states |
| `priority` | `number` | `10` | Priority level (higher = more important) |
| `onLoading` | `boolean` | `true` | Block during initial loading |
| `onFetching` | `boolean` | `false` | Block during background fetching |
| `onError` | `boolean` | `false` | Block when query fails |

#### Dynamic Reasons

Show different messages for different query states:

```tsx
const query = useBlockingQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
  blockingConfig: {
    scope: 'user-profile',
    // Specific messages for each state
    reasonOnLoading: 'Loading user profile...',
    reasonOnFetching: 'Refreshing data...',
    reasonOnError: 'Failed to load user',
    // Fallback for any state without specific reason
    reason: 'Processing...',
    onLoading: true,
    onFetching: true,
    onError: true,
  }
});
```

**Reason Priority:**
1. State-specific reason (`reasonOnLoading`, `reasonOnFetching`, `reasonOnError`)
2. General `reason`
3. Default (`'Loading data...'`)

#### Advanced Examples

**Multiple scopes:**

```tsx
const query = useBlockingQuery({
  queryKey: ['products', categoryId],
  queryFn: () => fetchProducts(categoryId),
  blockingConfig: {
    scope: ['product-list', 'sidebar', 'filters'],
    reason: 'Loading products...',
  }
});
```

**Block only on background refetch:**

```tsx
const query = useBlockingQuery({
  queryKey: ['live-data'],
  queryFn: fetchLiveData,
  refetchInterval: 5000,
  blockingConfig: {
    scope: 'dashboard',
    onLoading: false,  // Don't block initial load
    onFetching: true,  // Block on background refetch
    reasonOnFetching: 'Updating data...',
  }
});
```

**Block on errors:**

```tsx
const query = useBlockingQuery({
  queryKey: ['critical-data'],
  queryFn: fetchCriticalData,
  blockingConfig: {
    scope: 'app',
    onError: true,
    reasonOnError: 'Failed to load critical data',
  }
});
```

### `useBlockingMutation`

A wrapper around TanStack Query's `useMutation` that integrates with the UI blocking system.

#### Basic Usage

```tsx
import { useBlockingMutation } from '@okyrychenko-dev/react-action-guard-tanstack';

function MyComponent() {
  const mutation = useBlockingMutation({
    mutationFn: createUser,
    blockingConfig: {
      scope: 'global',
      reason: 'Saving changes...',
      priority: 30,
      onError: false,
    }
  });

  return (
    <button onClick={() => mutation.mutate({ name: 'John' })}>
      Create User
    </button>
  );
}
```

#### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `scope` | `string \| ReadonlyArray<string>` | `undefined` | Scope(s) to block |
| `reason` | `string` | `'Saving changes...'` | Default message for all states |
| `priority` | `number` | `30` | Priority level (higher = more important) |
| `onError` | `boolean` | `false` | Block when mutation fails |

#### Dynamic Reasons

Show different messages for pending and error states:

```tsx
const mutation = useBlockingMutation({
  mutationFn: updateUser,
  blockingConfig: {
    scope: 'user-form',
    // Specific messages for each state
    reasonOnPending: 'Saving user data...',
    reasonOnError: 'Failed to save user',
    // Fallback for any state without specific reason
    reason: 'Processing...',
    onError: true,
  }
});
```

**Type-safe configuration:**

When `onError: false` (default), `reasonOnError` is not available (TypeScript prevents it):

```tsx
// ✅ Valid - onError is false, no reasonOnError
const mutation = useBlockingMutation({
  mutationFn: updateUser,
  blockingConfig: {
    scope: 'form',
    reasonOnPending: 'Saving...',
  }
});

// ❌ TypeScript error - reasonOnError requires onError: true
const mutation = useBlockingMutation({
  mutationFn: updateUser,
  blockingConfig: {
    scope: 'form',
    reasonOnError: 'Error!', // Error: reasonOnError not allowed
  }
});

// ✅ Valid - onError is true, reasonOnError is allowed
const mutation = useBlockingMutation({
  mutationFn: updateUser,
  blockingConfig: {
    scope: 'form',
    onError: true,
    reasonOnPending: 'Saving...',
    reasonOnError: 'Failed to save',
  }
});
```

#### Advanced Examples

**Block on errors:**

```tsx
const mutation = useBlockingMutation({
  mutationFn: deleteUser,
  blockingConfig: {
    scope: 'user-list',
    onError: true,
    reasonOnPending: 'Deleting user...',
    reasonOnError: 'Failed to delete user',
  }
});
```

**Multiple scopes with priority:**

```tsx
const mutation = useBlockingMutation({
  mutationFn: saveSettings,
  blockingConfig: {
    scope: ['settings-form', 'sidebar', 'global'],
    priority: 50,  // High priority
    reason: 'Saving settings...',
  }
});
```

**With TanStack Query callbacks:**

```tsx
const mutation = useBlockingMutation({
  mutationFn: createPost,
  blockingConfig: {
    scope: 'post-form',
    reasonOnPending: 'Creating post...',
  },
  onSuccess: (data) => {
    console.log('Post created:', data);
  },
  onError: (error) => {
    console.error('Failed to create post:', error);
  },
});
```

**Using mutateAsync:**

```tsx
const mutation = useBlockingMutation({
  mutationFn: uploadFile,
  blockingConfig: {
    scope: 'upload',
    reasonOnPending: 'Uploading file...',
  }
});

async function handleUpload(file: File) {
  try {
    const result = await mutation.mutateAsync(file);
    console.log('Upload successful:', result);
  } catch (error) {
    console.error('Upload failed:', error);
  }
}
```

### `useBlockingInfiniteQuery`

A wrapper around TanStack Query's `useInfiniteQuery` that integrates with the UI blocking system. Perfect for infinite scrolling and pagination.

#### Basic Usage

```tsx
import { useBlockingInfiniteQuery } from '@okyrychenko-dev/react-action-guard-tanstack';

function InfiniteList() {
  const query = useBlockingInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam }) => fetchPosts(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    blockingConfig: {
      scope: 'post-list',
      reason: 'Loading posts...',
      onLoading: true,
      onFetching: false,
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

#### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `scope` | `string \| ReadonlyArray<string>` | `undefined` | Scope(s) to block |
| `reason` | `string` | `'Loading more data...'` | Default message for all states |
| `priority` | `number` | `10` | Priority level (higher = more important) |
| `onLoading` | `boolean` | `true` | Block during initial loading |
| `onFetching` | `boolean` | `false` | Block during fetching next/previous page |
| `onError` | `boolean` | `false` | Block when query fails |

#### Dynamic Reasons

```tsx
const query = useBlockingInfiniteQuery({
  queryKey: ['messages'],
  queryFn: ({ pageParam }) => fetchMessages(pageParam),
  initialPageParam: 0,
  getNextPageParam: (lastPage) => lastPage.nextId,
  blockingConfig: {
    scope: 'chat',
    reasonOnLoading: 'Loading messages...',
    reasonOnFetching: 'Loading more messages...',
    reasonOnError: 'Failed to load messages',
    onLoading: true,
    onFetching: true,
    onError: true,
  }
});
```

#### Advanced Examples

**Block only when fetching next page:**

```tsx
const query = useBlockingInfiniteQuery({
  queryKey: ['products', category],
  queryFn: ({ pageParam }) => fetchProducts(category, pageParam),
  initialPageParam: 1,
  getNextPageParam: (lastPage) => lastPage.nextPage,
  blockingConfig: {
    scope: 'product-grid',
    onLoading: false,  // Don't block initial load
    onFetching: true,  // Block when loading more
    reasonOnFetching: 'Loading more products...',
  }
});
```

**With bidirectional pagination:**

```tsx
const query = useBlockingInfiniteQuery({
  queryKey: ['timeline'],
  queryFn: ({ pageParam, direction }) => fetchTimelineItems(pageParam, direction),
  initialPageParam: 0,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
  getPreviousPageParam: (firstPage) => firstPage.prevCursor,
  blockingConfig: {
    scope: 'timeline',
    reasonOnFetching: 'Loading more items...',
    onFetching: true,
  }
});
```

### `useBlockingQueries`

A wrapper around TanStack Query's `useQueries` that integrates with the UI blocking system. Perfect for executing multiple queries in parallel with unified blocking behavior.

#### Basic Usage

```tsx
import { useBlockingQueries } from '@okyrychenko-dev/react-action-guard-tanstack';

function Dashboard() {
  const results = useBlockingQueries(
    [
      { queryKey: ['user'], queryFn: fetchUser },
      { queryKey: ['posts'], queryFn: fetchPosts },
      { queryKey: ['comments'], queryFn: fetchComments },
    ],
    {
      scope: 'dashboard',
      reason: 'Loading dashboard...',
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

#### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `scope` | `string \| ReadonlyArray<string>` | `undefined` | Scope(s) to block |
| `reason` | `string` | `'Loading queries...'` | Default message for all states |
| `priority` | `number` | `10` | Priority level (higher = more important) |
| `onLoading` | `boolean` | `true` | Block when any query is loading |
| `onFetching` | `boolean` | `false` | Block when any query is fetching |
| `onError` | `boolean` | `false` | Block when any query fails |

#### Dynamic Reasons

```tsx
const results = useBlockingQueries(
  [
    { queryKey: ['profile'], queryFn: fetchProfile },
    { queryKey: ['settings'], queryFn: fetchSettings },
    { queryKey: ['notifications'], queryFn: fetchNotifications },
  ],
  {
    scope: 'settings-page',
    reasonOnLoading: 'Loading user data...',
    reasonOnFetching: 'Refreshing data...',
    reasonOnError: 'Failed to load some data',
    onLoading: true,
    onFetching: false,
    onError: true,
  }
);
```

#### Advanced Examples

**Block only when all queries are loading:**

```tsx
// Note: useBlockingQueries blocks when ANY query matches the condition
// For custom logic, use multiple useBlockingQuery hooks instead
const results = useBlockingQueries(
  [
    { queryKey: ['critical-data'], queryFn: fetchCriticalData },
    { queryKey: ['optional-data'], queryFn: fetchOptionalData },
  ],
  {
    scope: 'app',
    onLoading: true,
    reason: 'Loading essential data...',
  }
);
```

**With different query options:**

```tsx
const results = useBlockingQueries(
  [
    {
      queryKey: ['user', userId],
      queryFn: () => fetchUser(userId),
      staleTime: 60000,
    },
    {
      queryKey: ['permissions', userId],
      queryFn: () => fetchPermissions(userId),
      retry: 3,
    },
    {
      queryKey: ['preferences', userId],
      queryFn: () => fetchPreferences(userId),
      enabled: !!userId,
    },
  ],
  {
    scope: 'user-panel',
    reasonOnLoading: 'Loading user information...',
    onLoading: true,
  }
);
```

**Multiple scopes:**

```tsx
const results = useBlockingQueries(
  [
    { queryKey: ['nav-items'], queryFn: fetchNavItems },
    { queryKey: ['footer-links'], queryFn: fetchFooterLinks },
  ],
  {
    scope: ['navigation', 'layout', 'global'],
    reason: 'Loading layout...',
  }
);
```

## TypeScript

Full TypeScript support with proper type inference:

```typescript
import {
  useBlockingQuery,
  useBlockingMutation,
  useBlockingInfiniteQuery,
  useBlockingQueries
} from '@okyrychenko-dev/react-action-guard-tanstack';
import type {
  QueryBlockingConfig,
  MutationBlockingConfig,
  InfiniteQueryBlockingConfig,
  QueriesBlockingConfig
} from '@okyrychenko-dev/react-action-guard-tanstack';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
}

interface PostsPage {
  posts: Post[];
  nextCursor: number;
}

// Query with type inference
const query = useBlockingQuery<User[]>({
  queryKey: ['users'],
  queryFn: fetchUsers,
  blockingConfig: {
    scope: 'users',
    reason: 'Loading users...',
  }
});
// query.data is User[] | undefined

// Mutation with types
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

mutation.mutate({ name: 'John' });

// Infinite query with types
const infiniteQuery = useBlockingInfiniteQuery<
  PostsPage,      // QueryFnData type
  Error,          // Error type
  PostsPage,      // Data type
  ['posts'],      // QueryKey type
  number          // PageParam type
>({
  queryKey: ['posts'],
  queryFn: ({ pageParam }) => fetchPosts(pageParam),
  initialPageParam: 0,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
  blockingConfig: {
    scope: 'post-list',
    reasonOnLoading: 'Loading posts...',
  }
});
// infiniteQuery.data?.pages is PostsPage[]

// Multiple queries with types
const results = useBlockingQueries(
  [
    {
      queryKey: ['user', userId] as const,
      queryFn: () => fetchUser(userId),
    },
    {
      queryKey: ['posts', userId] as const,
      queryFn: () => fetchUserPosts(userId),
    },
  ],
  {
    scope: 'user-dashboard',
    reasonOnLoading: 'Loading dashboard...',
  }
);
// results[0].data is User | undefined
// results[1].data is Post[] | undefined
```

## Priority System

Higher priority blockers take precedence when multiple blockers are active:

```tsx
// Low priority (query)
const query = useBlockingQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  blockingConfig: {
    scope: 'global',
    priority: 10,  // Default for queries
    reason: 'Loading...',
  }
});

// High priority (mutation)
const mutation = useBlockingMutation({
  mutationFn: saveData,
  blockingConfig: {
    scope: 'global',
    priority: 30,  // Default for mutations
    reason: 'Saving...',
  }
});

// If both are active, 'Saving...' will be shown (higher priority)
```

## How It Works

All hooks follow a consistent pattern:

1. **Wrap TanStack Query hook** - Seamlessly integrate with the original hook's API
2. **Monitor state changes** - Track loading, fetching, error, and other relevant states
3. **Dynamic reason resolution** - Select appropriate message based on current state
4. **Automatic blocker management** - Add/remove blockers via shared `useBlockingManager`
5. **Stable IDs** - Generate deterministic IDs using query/mutation keys
6. **Automatic cleanup** - Remove blockers on component unmount

### Architecture

The library uses a clean, maintainable architecture:

```
src/
├── hooks/              # Public API hooks
│   ├── useBlockingQuery.ts
│   ├── useBlockingMutation.ts
│   ├── useBlockingInfiniteQuery.ts
│   └── useBlockingQueries.ts
├── internal/           # Internal utilities (not exported)
│   ├── useBlockingManager.ts    # Centralized blocker lifecycle management
│   ├── useQueryBlockerId.ts     # Deterministic ID for queries
│   ├── useMutationBlockerId.ts  # Deterministic ID for mutations
│   └── useRandomBlockerId.ts    # Random ID for useQueries
└── utils/              # Pure utility functions
    └── reasonResolver.ts         # Dynamic reason selection logic
```

**Benefits:**
- **DRY** - No code duplication across hooks
- **Maintainable** - Changes in one place affect all hooks
- **Testable** - Pure functions are easy to test
- **Type-safe** - Full TypeScript support throughout

## Best Practices

1. **Use scopes wisely** - Define scopes for different parts of your UI
   ```tsx
   // Good - specific scopes
   useBlockingQuery({
     blockingConfig: { scope: 'user-profile' }
   });

   // Avoid - overly broad scope
   useBlockingQuery({
     blockingConfig: { scope: 'global' }
   });
   ```

2. **Set appropriate priorities** - Mutations typically have higher priority than queries
   ```tsx
   // Query - lower priority (default: 10)
   useBlockingQuery({ blockingConfig: { priority: 10 } });

   // Mutation - higher priority (default: 30)
   useBlockingMutation({ blockingConfig: { priority: 30 } });
   ```

3. **Use dynamic reasons** - Provide context-specific messages for better UX
   ```tsx
   useBlockingQuery({
     blockingConfig: {
       reasonOnLoading: 'Loading user profile...',
       reasonOnFetching: 'Refreshing data...',
       reasonOnError: 'Failed to load profile',
     }
   });
   ```

4. **Block on errors selectively** - Only block on critical errors that require user attention
   ```tsx
   // Critical data - block on error
   useBlockingQuery({
     blockingConfig: {
       onError: true,
       reasonOnError: 'Critical data failed to load'
     }
   });

   // Optional data - don't block on error
   useBlockingQuery({
     blockingConfig: { onError: false }
   });
   ```

5. **Avoid blocking background fetches** unless necessary - Let users continue working
   ```tsx
   useBlockingQuery({
     refetchInterval: 30000,
     blockingConfig: {
       onLoading: true,    // Block initial load
       onFetching: false,  // Don't block background refetch
     }
   });
   ```

6. **Choose the right hook** for your use case
   - `useBlockingQuery` - Single query
   - `useBlockingMutation` - Create/update/delete operations
   - `useBlockingInfiniteQuery` - Infinite scrolling, pagination
   - `useBlockingQueries` - Multiple parallel queries with unified blocking

7. **Leverage TypeScript** - Use type parameters for better type inference
   ```tsx
   interface User { id: number; name: string; }

   const query = useBlockingQuery<User>({
     queryKey: ['user'],
     queryFn: fetchUser,
     blockingConfig: { scope: 'user' }
   });
   // query.data is User | undefined (fully typed)
   ```

## License

MIT

## Author

Olexii Kyrychenko <alexey.kirichenko@gmail.com>

## Repository

[https://github.com/okyrychenko-dev/react-action-guard-tanstack](https://github.com/okyrychenko-dev/react-action-guard-tanstack)
