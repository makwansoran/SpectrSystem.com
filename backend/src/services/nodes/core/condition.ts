/**
 * Condition Node
 * Branch based on conditions
 */

import type { ConditionConfig } from '../../../types';
import type { ExecutionContext } from '../../executor';
import type { NodeExecutorWithBranch } from '../types';
import { getNestedValue, evaluateCondition } from '../utils';

export const executeCondition: NodeExecutorWithBranch<ConditionConfig> = (
  config: ConditionConfig,
  context: ExecutionContext
) => {
  if (!config.field) {
    throw new Error('Condition node requires a field');
  }

  const { field, operator, value } = config;

  // Get the field value from previous node output
  const fieldValue = getNestedValue(context.previousNodeOutput, field);
  const conditionMet = evaluateCondition(fieldValue, operator, value);

  return {
    output: {
      condition: {
        field,
        operator,
        value,
        fieldValue,
        result: conditionMet
      },
      data: context.previousNodeOutput
    },
    branch: conditionMet ? 'true' : 'false'
  };
};

