/**
 * Merge Node
 * Combine multiple inputs
 */

import type { MergeConfig } from '../../../types';
import type { Workflow, WorkflowNode } from '../../../types';
import type { ExecutionContext } from '../../executor';
import type { NodeExecutor } from '../types';

export const executeMerge: NodeExecutor<MergeConfig & { node: WorkflowNode; workflow: Workflow }> = async (
  config: MergeConfig & { node: WorkflowNode; workflow: Workflow },
  context: ExecutionContext
) => {
  const { node, workflow, mode } = config;

  // Get all nodes that connect to this merge node
  const incomingEdges = workflow.edges.filter(edge => edge.target === node.id);
  const incomingNodes = incomingEdges
    .map(edge => workflow.nodes.find(n => n.id === edge.source))
    .filter((n): n is WorkflowNode => n !== undefined);

  // Get outputs from all incoming nodes that have already executed
  const inputs: unknown[] = [];
  for (const incomingNode of incomingNodes) {
    const nodeOutput = context.allNodeOutputs[incomingNode.id];
    if (nodeOutput !== undefined) {
      inputs.push(nodeOutput);
    }
  }

  // Also include current previous output
  if (context.previousNodeOutput !== undefined && !inputs.includes(context.previousNodeOutput)) {
    inputs.push(context.previousNodeOutput);
  }

  const mergeMode = mode || 'merge';

  switch (mergeMode) {
    case 'merge':
      const merged: Record<string, unknown> = {};
      for (const input of inputs) {
        if (input && typeof input === 'object' && !Array.isArray(input)) {
          Object.assign(merged, input);
        } else if (input !== null && input !== undefined) {
          merged[`value${inputs.indexOf(input)}`] = input;
        }
      }
      return Object.keys(merged).length > 0 ? merged : context.previousNodeOutput;

    case 'append':
      const appended: unknown[] = [];
      for (const input of inputs) {
        if (Array.isArray(input)) {
          appended.push(...input);
        } else {
          appended.push(input);
        }
      }
      return appended;

    case 'multiplex':
      return inputs.length > 0 ? inputs : [context.previousNodeOutput];

    default:
      return inputs.length > 0 ? inputs[inputs.length - 1] : context.previousNodeOutput;
  }
};

