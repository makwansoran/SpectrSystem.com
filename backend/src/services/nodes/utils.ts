/**
 * Shared utilities for node execution
 */

import type { ExecutionContext } from '../executor';

/**
 * Interpolate variables in a string
 * Supports {{variable}} and {{$node.nodeId.field}} syntax
 */
export function interpolateVariables(str: string, context: ExecutionContext): string {
  return str.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const trimmedPath = path.trim();

    // Handle $node references
    if (trimmedPath.startsWith('$node.')) {
      const parts = trimmedPath.substring(6).split('.');
      const nodeId = parts[0];
      const fieldPath = parts.slice(1).join('.');
      const nodeOutput = context.allNodeOutputs[nodeId];
      if (nodeOutput) {
        const value = getNestedValue(nodeOutput, fieldPath);
        return String(value ?? match);
      }
      return match;
    }

    // Handle $input reference (previous node output)
    if (trimmedPath.startsWith('$input.')) {
      const fieldPath = trimmedPath.substring(7);
      const value = getNestedValue(context.previousNodeOutput, fieldPath);
      return String(value ?? match);
    }

    // Handle variable reference
    if (context.variables[trimmedPath] !== undefined) {
      return String(context.variables[trimmedPath]);
    }

    return match;
  });
}

/**
 * Get a nested value from an object using dot notation
 */
export function getNestedValue(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== 'object') return undefined;

  const parts = path.split('.');
  let current: any = obj;

  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }

  return current;
}

/**
 * Evaluate a simple JavaScript expression
 * Note: In production, use a proper sandbox
 */
export function evaluateExpression(expression: string, context: ExecutionContext): unknown {
  try {
    // Create a safe evaluation context
    const evalContext = {
      $input: context.previousNodeOutput,
      $vars: context.variables,
      $nodes: context.allNodeOutputs,
      JSON,
      Math,
      String,
      Number,
      Boolean,
      Array,
      Object,
      Date
    };

    // Simple expression evaluation
    const fn = new Function(...Object.keys(evalContext), `return ${expression}`);
    return fn(...Object.values(evalContext));
  } catch (error) {
    console.warn(`Expression evaluation failed: ${expression}`, error);
    return expression;
  }
}

/**
 * Evaluate a condition
 */
export function evaluateCondition(fieldValue: unknown, operator: string, value: string): boolean {
  switch (operator) {
    case 'equals':
      return String(fieldValue) === value;
    case 'not_equals':
      return String(fieldValue) !== value;
    case 'contains':
      return String(fieldValue).includes(value);
    case 'greater_than':
      return Number(fieldValue) > Number(value);
    case 'less_than':
      return Number(fieldValue) < Number(value);
    case 'is_empty':
      return fieldValue === null || fieldValue === undefined || fieldValue === '';
    case 'is_not_empty':
      return fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
    default:
      return false;
  }
}

