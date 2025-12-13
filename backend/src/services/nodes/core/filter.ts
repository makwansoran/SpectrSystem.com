/**
 * Filter Node
 * Filter items by condition
 */

import type { FilterConfig } from '../../../types';
import type { ExecutionContext } from '../../executor';
import type { NodeExecutor } from '../types';
import { getNestedValue, evaluateCondition } from '../utils';

export const executeFilter: NodeExecutor<FilterConfig> = (
  config: FilterConfig,
  context: ExecutionContext
) => {
  if (!config.field) {
    throw new Error('Filter node requires a field');
  }

  const input = context.previousNodeOutput;

  // If input is an array, filter it
  if (Array.isArray(input)) {
    const filtered = input.filter((item: unknown) => {
      const fieldValue = getNestedValue(item, config.field);
      return evaluateCondition(fieldValue, config.operator, config.value);
    });

    return {
      filtered: true,
      originalCount: input.length,
      filteredCount: filtered.length,
      items: filtered
    };
  }

  // If input is an object with arrays, filter those arrays
  if (input && typeof input === 'object' && !Array.isArray(input)) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      if (Array.isArray(value)) {
        const filtered = value.filter((item: unknown) => {
          const fieldValue = getNestedValue(item, config.field);
          return evaluateCondition(fieldValue, config.operator, config.value);
        });
        result[key] = filtered;
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  // If input doesn't match expected format, check if it matches the condition
  const fieldValue = getNestedValue(input, config.field);
  const matches = evaluateCondition(fieldValue, config.operator, config.value);

  return matches ? input : null;
};

