/**
 * Set Variable Node
 * Transform and set data
 */

import type { SetVariableConfig } from '../../../types';
import type { ExecutionContext } from '../../executor';
import type { NodeExecutor } from '../types';
import { interpolateVariables, evaluateExpression } from '../utils';

export const executeSetVariable: NodeExecutor<SetVariableConfig> = (
  config: SetVariableConfig,
  context: ExecutionContext
) => {
  if (!config.variables || config.variables.length === 0) {
    throw new Error('Set Variable node requires at least one variable');
  }

  const result: Record<string, unknown> = {};

  for (const variable of config.variables || []) {
    let value: unknown = variable.value;

    // Handle different types
    switch (variable.type) {
      case 'number':
        value = Number(variable.value);
        break;
      case 'boolean':
        value = variable.value.toLowerCase() === 'true';
        break;
      case 'expression':
        value = evaluateExpression(variable.value, context);
        break;
      default:
        value = interpolateVariables(variable.value, context);
    }

    context.variables[variable.key] = value;
    result[variable.key] = value;
  }

  return {
    ...context.previousNodeOutput as object,
    variables: result
  };
};

