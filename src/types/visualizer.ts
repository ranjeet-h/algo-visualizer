// Basic visualization state
export interface VisualizationState {
  isPlaying: boolean;
  isCompleted: boolean;
  currentStep: number;
  totalSteps: number;
  speed: number;
  data: unknown; // Generic data that will be typed more specifically in each visualization
}

// Visualization Controls Props
export interface VisualizationControlsProps {
  state: VisualizationState;
  onPlay: () => void;
  onPause: () => void;
  onStep: (forward: boolean) => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
}

// Data structure interfaces

// Array Item
export interface ArrayItem {
  value: number | string;
  status?: 'default' | 'active' | 'comparing' | 'sorted' | 'highlighted' | 'swapping';
  id?: number | string; // Optional unique identifier for tracking items across updates
}

// Linked List Node
export interface LinkedListNode {
  value: number | string;
  status?: 'default' | 'active' | 'comparing' | 'highlighted';
  next?: number; // Index to next node or null
  prev?: number; // Index to previous node (for doubly linked lists) or null
}

// Tree Node
export interface TreeNode {
  id: number;
  value: number | string;
  status?: 'default' | 'active' | 'comparing' | 'highlighted';
  left?: number; // Index to left child or null
  right?: number; // Index to right child or null
  parent?: number; // Index to parent or null
  balanceFactor?: number; // For AVL trees
  color?: 'red' | 'black'; // For Red-Black trees
}

// Graph Node
export interface GraphNode {
  id: number;
  value: number | string;
  status?: 'default' | 'active' | 'visited' | 'processing' | 'highlighted';
  position?: { x: number; y: number }; // For graph visualization
}

// Graph Edge
export interface GraphEdge {
  from: number;
  to: number;
  weight?: number; // For weighted graphs
  status?: 'default' | 'active' | 'highlighted';
  directed?: boolean;
}

// Stack/Queue Item
export interface StackQueueItem {
  value: number | string;
  status?: 'default' | 'active' | 'pushing' | 'popping';
}

// Hash Table Entry
export interface HashTableEntry {
  key: string;
  value: string | number | boolean | null;
  status?: 'default' | 'active' | 'collision';
}

// Algorithm step description
export interface AlgorithmStep {
  description: string;
  codeHighlight?: number[]; // Line numbers to highlight in code
  dataState: Record<string, unknown>; // The state of the data structure at this step
}

// Algorithm code explanation
export interface CodeExplanation {
  code: string;
  language: string;
  lineExplanations: Record<number, string>; // Maps line numbers to explanations
}

// Visualization actions
export type VisualizationAction =
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'RESET' }
  | { type: 'STEP_FORWARD' }
  | { type: 'STEP_BACKWARD' }
  | { type: 'SET_SPEED'; payload: number }
  | { type: 'JUMP_TO_STEP'; payload: number }; 