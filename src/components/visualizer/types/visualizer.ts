export interface ArrayItem {
  value: number;
  status: 'default' | 'comparing' | 'swapping' | 'sorted' | 'highlighted';
  id: string;
}

export interface GraphNode {
  id: string;
  value: string | number;
  status: 'default' | 'visiting' | 'visited' | 'current' | 'start' | 'end';
}

export interface GraphEdge {
  source: string;
  target: string;
  value: number;
  status: 'default' | 'traversing' | 'traversed';
}

export interface HashItem {
  key: string; 
  value: string | number;
  status: 'default' | 'inserting' | 'searching' | 'found' | 'removing' | 'collision';
}

export interface TreeNode {
  id: string;
  value: number | string;
  status: 'default' | 'visiting' | 'visited' | 'inserting' | 'found' | 'removing' | 'current';
}

export interface BinaryTreeNode extends TreeNode {
  left: BinaryTreeNode | null;
  right: BinaryTreeNode | null;
  parent?: BinaryTreeNode | null;
  height?: number; // Used for AVL trees
  balanceFactor?: number; // Used for AVL trees
  color?: 'red' | 'black'; // Used for Red-Black trees
}

export type DataStructureType = 
  | 'array'
  | 'linked-list'
  | 'stack'
  | 'queue'
  | 'deque'
  | 'tree'
  | 'graph'
  | 'hash-table'
  | 'hash-set';

export type AlgorithmType =
  | 'sorting'
  | 'searching'
  | 'traversal'
  | 'pathfinding'
  | 'data-structure'; 