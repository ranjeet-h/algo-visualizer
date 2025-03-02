import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate random integer between min and max (inclusive)
export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate an array of random integers
export function generateRandomArray(length: number, min: number, max: number): number[] {
  return Array.from({ length }, () => getRandomInt(min, max));
}

// Deep clone an object
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Sleep function for animations
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Format time in ms to seconds display
export function formatTime(ms: number): string {
  return `${(ms / 1000).toFixed(2)}s`;
}

// Calculate animation speed in ms based on speed setting (1-10)
export function getAnimationSpeed(speed: number): number {
  // Map speed 1-10 to a time delay 1000ms-50ms (slower to faster)
  return 1050 - (speed * 100);
}



export const dataStructures = [
  {
    title: 'Arrays',
  },
  {
    title: 'Linked Lists',
    children: [
      { title: 'Singly Linked List' },
      { title: 'Doubly Linked List' },
      { title: 'Circular Linked List' },
    ],
  },
  {
    title: 'Stacks & Queues',
    children: [
      { title: 'Stack' },
      { title: 'Queue' },
      { title: 'Deque' },
    ],
  },
  {
    title: 'Hash-Based',
    children: [
      { title: 'Hash Map' },
      { title: 'Hash Set' },
    ],
  },
  {
    title: 'Trees',
    children: [
      { title: 'Binary Tree' },
      { title: 'Binary Search Tree' },
      { title: 'AVL Tree' },
      { title: 'Red-Black Tree' },
      { title: 'Trie' },
      { title: 'Segment Tree' },
      { title: 'Fenwick Tree' },
    ],
  },
  {
    title: 'Graphs',
    children: [
      { title: 'Undirected Graph' },
      { title: 'Directed Graph' },
      { title: 'Weighted Graph' },
    ],
  },
  {
    title: 'Heaps',
    children: [
      { title: 'Min-Heap' },
      { title: 'Max-Heap' },
    ],
  },
  {
    title: 'Advanced Collections',
    children: [
      { title: 'Balanced Tree Sets' },
      { title: 'Hash-based Sets' },
      { title: 'Balanced Tree Maps' },
      { title: 'Hash-based Maps' },
    ],
  },
];

export const algorithms = [
  {
    title: 'Sorting',
    children: [
      { title: 'Bubble Sort' },
      { title: 'Selection Sort' },
      { title: 'Insertion Sort' },
      { title: 'Merge Sort' },
      { title: 'Quick Sort' },
      { title: 'Heap Sort' },
      { title: 'Counting Sort' },
      { title: 'Radix Sort' },
      { title: 'Bucket Sort' },
    ],
  },
  {
    title: 'Searching',
    children: [
      { title: 'Linear Search' },
      { title: 'Binary Search' },
      { title: 'Interpolation Search' },
      { title: 'Jump Search' },
      { title: 'Exponential Search' },
    ],
  },
  {
    title: 'Dynamic Programming',
    children: [
      { title: 'Recursion' },
      { title: 'Memoization' },
      { title: 'Tabulation' },
      { title: 'Knapsack Problem' },
      { title: 'Longest Common Subsequence' },
    ],
  },
  {
    title: 'Greedy Algorithms',
    children: [
      { title: 'Activity Selection' },
      { title: 'Huffman Coding' },
    ],
  },
  {
    title: 'Graph Algorithms',
    children: [
      { title: 'BFS' },
      { title: 'DFS' },
      { title: "Dijkstra's Algorithm" },
      { title: "Prim's Algorithm" },
      { title: "Kruskal's Algorithm" },
      { title: 'Bellman-Ford Algorithm' },
      { title: 'Floyd-Warshall Algorithm' },
      { title: 'Topological Sort' },
      { title: 'Strongly Connected Components' },
    ],
  },
  {
    title: 'Tree Traversals',
    children: [
      { title: 'Inorder Traversal' },
      { title: 'Preorder Traversal' },
      { title: 'Postorder Traversal' },
      { title: 'Level Order Traversal' },
      { title: 'BFS for Trees' },
      { title: 'DFS for Trees' },
    ],
  },
  {
    title: 'String Algorithms',
    children: [
      { title: 'KMP Algorithm' },
      { title: 'Rabin-Karp Algorithm' },
      { title: 'String Matching' },
      { title: 'Palindrome Checks' },
    ],
  },
  {
    title: 'Mathematics',
    children: [
      { title: 'Prime Numbers' },
      { title: 'Factorials' },
      { title: 'GCD' },
      { title: 'LCM' },
      { title: 'Fibonacci Sequence' },
      { title: 'Closest Pair of Points' },
    ],
  },
  {
    title: 'Bit Manipulation',
    children: [
      { title: 'Bitwise Operations' },
      { title: 'Bitwise Tricks' },
    ],
  },
  {
    title: 'Backtracking',
    children: [
      { title: 'N-Queens' },
      { title: 'Sudoku Solver' },
      { title: 'Subset Sum' },
    ],
  },
];