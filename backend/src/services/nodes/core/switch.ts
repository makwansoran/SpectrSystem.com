/**
 * Switch Node
 * Route to multiple outputs
 */

import type { SwitchConfig } from '../../../types';
import type { ExecutionContext } from '../../executor';
import type { NodeExecutorWithBranch } from '../types';
import { getNestedValue } from '../utils';

export const executeSwitch: NodeExecutorWithBranch<SwitchConfig> = (
  config: SwitchConfig,
  context: ExecutionContext
) => {
  const fieldValue = getNestedValue(context.previousNodeOutput, config.field);

  // Check each rule
  for (const rule of config.rules || []) {
    const operator = rule.operator || 'equals';
    let matches = false;

    switch (operator) {
      case 'equals':
        matches = String(fieldValue) === rule.value;
        break;
      case 'contains':
        matches = String(fieldValue).includes(rule.value);
        break;
      case 'greater_than':
        matches = Number(fieldValue) > Number(rule.value);
        break;
      case 'less_than':
        matches = Number(fieldValue) < Number(rule.value);
        break;
    }

    if (matches) {
      return {
        output: context.previousNodeOutput,
        branch: `output${rule.output}`
      };
    }
  }

  // Use default output if no rule matches
  const defaultOutput = config.defaultOutput !== undefined ? config.defaultOutput : 0;
  return {
    output: context.previousNodeOutput,
    branch: `output${defaultOutput}`
  };
};

