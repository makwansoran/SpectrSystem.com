/**
 * Store Data Node
 * Save data to storage
 */

import type { StoreDataConfig } from '../../../types';
import type { ExecutionContext } from '../../executor';
import type { NodeExecutor } from '../types';
import { setDataStoreValue } from '../../../database';
import { interpolateVariables } from '../utils';

export const executeStoreData: NodeExecutor<StoreDataConfig> = (
  config: StoreDataConfig,
  context: ExecutionContext
) => {
  if (!config.key) {
    throw new Error('Store Data node requires a key');
  }

  const key = interpolateVariables(config.key, context);

  let value: unknown;
  if (config.value) {
    const interpolated = interpolateVariables(config.value, context);
    try {
      value = JSON.parse(interpolated);
    } catch {
      value = interpolated !== config.value ? interpolated : config.value;
    }
  } else {
    value = context.previousNodeOutput;
  }

  const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
  setDataStoreValue(key, stringValue);

  return {
    stored: true,
    key,
    value,
    previousData: context.previousNodeOutput
  };
};

