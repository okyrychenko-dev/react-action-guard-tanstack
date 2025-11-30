export interface UseBlockingManagerOptions {
  /** Unique identifier for this blocker */
  blockerId: string;
  /** Whether the UI should be blocked */
  shouldBlock: boolean;
  /** Scope(s) to block */
  scope?: string | ReadonlyArray<string>;
  /** Blocking reason message */
  reason: string;
  /** Priority level for this blocker */
  priority: number;
}
