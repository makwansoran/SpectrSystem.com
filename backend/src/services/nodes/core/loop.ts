/**
 * Loop Node
 * Iterate over items
 */

import type { LoopConfig, Workflow, WorkflowNode, WorkflowEdge, NodeExecutionResult } from '../../../types';
import type { ExecutionContext } from '../../executor';
import { evaluateExpression } from '../utils';

// Note: Loop node needs access to workflow and results, so it's a special case
export async function executeLoop(
  config: LoopConfig,
  context: ExecutionContext,
  node: WorkflowNode,
  workflow: Workflow,
  results: NodeExecutionResult[],
  getConnectedNodes: (nodeId: string, edges: WorkflowEdge[], nodes: WorkflowNode[]) => WorkflowNode[],
  executeNode: (node: WorkflowNode, workflow: Workflow, context: ExecutionContext, results: NodeExecutionResult[]) => Promise<void>
): Promise<unknown> {
  const itemsExpression = config.items || '$input.data';
  const items = evaluateExpression(itemsExpression, context);

  if (!Array.isArray(items)) {
    throw new Error('Loop items must be an array');
  }

  console.log(`    🔄 Loop: Processing ${items.length} items`);

  const loopResults: unknown[] = [];
  const originalPreviousOutput = context.previousNodeOutput;

  // Get connected nodes
  const connectedNodes = getConnectedNodes(node.id, workflow.edges, workflow.nodes);

  // Set up loop context
  const originalLoopContext = context.loopContext;
  context.loopContext = {
    nodeId: node.id,
    items,
    currentIndex: 0
  };

  try {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      context.loopContext.currentIndex = i;

      // Set loop variables
      const itemVariable = config.itemVariable || 'item';
      context.variables[itemVariable] = item;
      if (config.indexVariable) {
        context.variables[config.indexVariable] = i;
      }

      // Set current item as previous output
      context.previousNodeOutput = item;

      // Execute connected nodes for this item
      for (const nextNode of connectedNodes) {
        await executeNode(nextNode, workflow, context, results);
      }

      loopResults.push({
        index: i,
        item,
        processed: true
      });
    }
  } finally {
    // Restore original context
    context.loopContext = originalLoopContext;
    context.previousNodeOutput = originalPreviousOutput;
    context.executedNodes.add(node.id);

    // Mark all nodes executed in the loop
    for (const connectedNode of connectedNodes) {
      context.executedNodes.add(connectedNode.id);
    }
  }

  return {
    looped: true,
    itemCount: items.length,
    results: loopResults,
    items
  };
}

