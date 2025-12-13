/**
 * Code Node
 * Run custom JavaScript
 */

import type { CodeConfig } from '../../../types';
import type { ExecutionContext } from '../../executor';
import type { NodeExecutor } from '../types';

export const executeCode: NodeExecutor<CodeConfig> = (
  config: CodeConfig,
  context: ExecutionContext
) => {
  if (!config.code || config.code.trim().length === 0) {
    throw new Error('Code node requires code to execute');
  }

  console.log(`    💻 Running custom code`);

  try {
    const evalContext = {
      $input: context.previousNodeOutput,
      $vars: context.variables,
      $nodes: context.allNodeOutputs,
      console: {
        log: (...args: any[]) => console.log('      [Code]', ...args),
        warn: (...args: any[]) => console.warn('      [Code]', ...args),
        error: (...args: any[]) => console.error('      [Code]', ...args),
      },
      JSON,
      Math,
      String,
      Number,
      Boolean,
      Array,
      Object,
      Date
    };

    const fn = new Function(...Object.keys(evalContext), config.code);
    const result = fn(...Object.values(evalContext));

    return result !== undefined ? result : context.previousNodeOutput;
  } catch (error: any) {
    throw new Error(`Code execution failed: ${error.message}`);
  }
};

