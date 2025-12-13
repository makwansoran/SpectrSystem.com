/**
 * Sort Node
 * Sort items
 */

import type { SortConfig } from '../../../types';
import type { ExecutionContext } from '../../executor';
import type { NodeExecutor } from '../types';
import { getNestedValue } from '../utils';

export const executeSort: NodeExecutor<SortConfig> = (
  config: SortConfig,
  context: ExecutionContext
) => {
  if (!config.field) {
    throw new Error('Sort node requires a field');
  }

  const input = context.previousNodeOutput;

  // If input is an array, sort it
  if (Array.isArray(input)) {
    const sorted = [...input].sort((a: unknown, b: unknown) => {
      const aValue = getNestedValue(a, config.field);
      const bValue = getNestedValue(b, config.field);

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      let comparison = 0;
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else {
        const aStr = String(aValue);
        const bStr = String(bValue);
        comparison = aStr.localeCompare(bStr);
      }

      return config.direction === 'desc' ? -comparison : comparison;
    });

    return {
      sorted: true,
      direction: config.direction,
      items: sorted
    };
  }

  // If input is an object with arrays, sort those arrays
  if (input && typeof input === 'object' && !Array.isArray(input)) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      if (Array.isArray(value)) {
        const sorted = [...value].sort((a: unknown, b: unknown) => {
          const aValue = getNestedValue(a, config.field);
          const bValue = getNestedValue(b, config.field);

          if (aValue === undefined || aValue === null) return 1;
          if (bValue === undefined || bValue === null) return -1;

          let comparison = 0;
          if (typeof aValue === 'number' && typeof bValue === 'number') {
            comparison = aValue - bValue;
          } else if (typeof aValue === 'string' && typeof bValue === 'string') {
            comparison = aValue.localeCompare(bValue);
          } else {
            const aStr = String(aValue);
            const bStr = String(bValue);
            comparison = aStr.localeCompare(bStr);
          }

          return config.direction === 'desc' ? -comparison : comparison;
        });
        result[key] = sorted;
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  return input;
};

