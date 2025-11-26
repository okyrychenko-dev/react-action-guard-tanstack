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
- ⚡ **Seamless TanStack Query integration** - same API as useQuery/useMutation
- 🧹 **Automatic cleanup** on component unmount
- 🪝 **Hooks-based API** for React applications

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
import { useBlockingQuery, useBlockingMutation } from '@okyrychenko-dev/react-action-guard-tanstack';

// Wrap your app with QueryClientProvider
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
    </QueryClientProvider>
  );
}

// Use in your components
function UserList() {
  const query = useBlockingQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    blockingConfig: {
      scope: 'global',
      reason: 'Loading users...',
    }
  });

  const mutation = useBlockingMutation({
    mutationFn: createUser,
    blockingConfig: {
      scope: 'global',
      reason: 'Creating user...',
    }
  });

  return (
    <div>
      {query.data?.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
      <button onClick={() => mutation.mutate({ name: 'John' })}>
        Add User
      </button>
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

## TypeScript

Full TypeScript support with proper type inference:

```typescript
import { useBlockingQuery, useBlockingMutation } from '@okyrychenko-dev/react-action-guard-tanstack';
import type {
  QueryBlockingConfig,
  MutationBlockingConfig
} from '@okyrychenko-dev/react-action-guard-tanstack';

interface User {
  id: number;
  name: string;
  email: string;
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

### useBlockingQuery

1. Wraps TanStack Query's `useQuery`
2. Monitors query state changes (loading, fetching, error)
3. Automatically adds/removes blockers based on configuration
4. Uses query key for deterministic blocker ID
5. Cleans up blockers on unmount

### useBlockingMutation

1. Wraps TanStack Query's `useMutation`
2. Monitors mutation state changes (pending, error)
3. Automatically adds/removes blockers based on configuration
4. Uses mutation key (if provided) for deterministic blocker ID, otherwise generates unique ID
5. Cleans up blockers on unmount

## Best Practices

1. **Use scopes wisely** - Define scopes for different parts of your UI
2. **Set appropriate priorities** - Mutations typically have higher priority than queries
3. **Use dynamic reasons** - Provide context-specific messages for better UX
4. **Block on errors selectively** - Only block on critical errors that require user attention
5. **Avoid blocking background fetches** unless necessary - Let users continue working

## License

MIT

## Author

Olexii Kyrychenko <alexey.kirichenko@gmail.com>

## Repository

[https://github.com/okyrychenko-dev/react-action-guard-tanstack](https://github.com/okyrychenko-dev/react-action-guard-tanstack)
