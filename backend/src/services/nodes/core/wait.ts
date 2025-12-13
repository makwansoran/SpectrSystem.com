/**
 * Wait Node
 * Delay execution
 */

import type { WaitConfig } from '../../../types';
import type { ExecutionContext } from '../../executor';
import type { NodeExecutor } from '../types';

export const executeWait: NodeExecutor<WaitConfig> = async (
  config: WaitConfig,
  context: ExecutionContext
) => {
  let milliseconds = config.duration || 0;

  // Convert to milliseconds based on unit
  switch (config.unit) {
    case 'seconds':
      milliseconds = config.duration * 1000;
      break;
    case 'minutes':
      milliseconds = config.duration * 60 * 1000;
      break;
    case 'hours':
      milliseconds = config.duration * 60 * 60 * 1000;
      break;
    default:
      milliseconds = config.duration;
  }

  // Max wait time: 1 hour
  if (milliseconds > 3600000) {
    throw new Error('Wait duration cannot exceed 1 hour');
  }

  console.log(`    ⏳ Waiting ${milliseconds}ms`);

  await new Promise(resolve => setTimeout(resolve, milliseconds));

  return {
    ...(context.previousNodeOutput as object),
    waited: milliseconds,
    resumed: new Date().toISOString()
  };
};

