/**
 * Shared types for node execution
 */

import type { ExecutionContext } from '../executor';

export type NodeExecutor<T = any> = (
  config: T,
  context: ExecutionContext
) => Promise<unknown> | unknown;

export type NodeExecutorWithBranch<T = any> = (
  config: T,
  context: ExecutionContext
) => Promise<{ output: unknown; branch: string }> | { output: unknown; branch: string };

