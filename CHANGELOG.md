# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-01-26

### Added

- Initial release
- `useBlockingQuery` hook - TanStack Query `useQuery` wrapper with UI blocking
- `useBlockingMutation` hook - TanStack Query `useMutation` wrapper with UI blocking
- Scope-based blocking system
- Priority-based blocker management
- Dynamic reasons support:
  - Query states: `reasonOnLoading`, `reasonOnFetching`, `reasonOnError`
  - Mutation states: `reasonOnPending`, `reasonOnError`
- Type-safe configuration with discriminated unions for mutation blocking
- Full TypeScript support with comprehensive JSDoc documentation
- Automatic blocker cleanup on component unmount
- Deterministic blocker IDs based on query/mutation keys
- Fallback hierarchy for reason messages
- Support for multiple scopes per blocker

### Features

- **Query Blocking**: Control blocking during initial loading, background fetching, and error states
- **Mutation Blocking**: Control blocking during pending and error states
- **Type Safety**: TypeScript prevents invalid configurations (e.g., `reasonOnError` without `onError: true`)
- **Flexibility**: Works seamlessly with all TanStack Query features (callbacks, optimistic updates, etc.)
- **Priority System**: Higher priority blockers (default: mutations=30, queries=10) take precedence
- **Clean API**: Same API as TanStack Query with additional `blockingConfig` parameter

### Documentation

- Comprehensive README with examples
- JSDoc comments for all public APIs
- TypeScript type definitions with detailed annotations
- 41 unit tests with 95%+ coverage
