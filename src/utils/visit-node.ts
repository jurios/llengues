import { TSESTree } from '@typescript-eslint/typescript-estree';

interface NodeWithType extends TSESTree.BaseNode {
  type: string;
}

export function visitNode<T>(
  node: TSESTree.BaseNode,
  fn: (node: TSESTree.BaseNode) => T,
): T | TSESTree.BaseNode {
  let entries;

  if (Array.isArray(node)) {
    entries = node.entries();
  } else if (node && typeof node === 'object' && typeof (node as NodeWithType).type === 'string') {
    entries = Object.entries(node);
  } else {
    return node;
  }

  for (const [key, child] of entries) {
    node[key] = visitNode(child, fn);
  }

  if (Array.isArray(node)) {
    return node;
  }

  return fn(node) || node;
}
