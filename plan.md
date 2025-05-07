# Algo-Visualized: Project Plan & Progress

This document tracks the implementation progress of data structures and algorithms for the Algo-Visualized project.

## Key
- `[x]` - Implemented & Visualized
- `[p]` - UI Element Exists (Implementation/Visualization Pending or In Progress)
- `[ ]` - Planned / To Do

## I. Data Structures

### A. Basic Linear Structures
- [x] Arrays
- Stacks & Queues
    - [x] Stack
    - [x] Queue
    - [p] Deque (Double-Ended Queue)
- Linked Lists
    - [x] Singly Linked List
    - [p] Doubly Linked List
    - [p] Circular Linked List

### B. Hash-Based Structures
- [x] Hash Map (Hash Table)
- [x] Hash Set

### C. Trees
- Core Trees
    - [x] Binary Tree
    - [x] Binary Search Tree (BST)
- Self-Balancing Trees
    - [x] AVL Tree
    - [p] Red-Black Tree
- Specialized Trees
    - [p] Trie
    - [p] Segment Tree
    - [p] Fenwick Tree (Binary Indexed Tree)
- Heaps
    - [x] Min-Heap
    - [x] Max-Heap

### D. Graphs
- Representation
    - [p] Undirected Graph
    - [p] Directed Graph
    - [p] Weighted Graph

### E. Advanced Collections
- [p] Balanced Tree Sets
- [p] Balanced Tree Maps
  *(Note: Hash-based sets/maps are covered under Hash-Based Structures)*

## II. Algorithms

### A. Sorting Algorithms
- Comparison Sorts
    - [x] Bubble Sort
    - [x] Selection Sort
    - [x] Insertion Sort
    - [x] Merge Sort
    - [x] Quick Sort
    - [p] Heap Sort
- Non-Comparison Sorts
    - [p] Counting Sort
    - [p] Radix Sort
    - [p] Bucket Sort

### B. Searching Algorithms
- [p] Linear Search
- [p] Binary Search
- Specialized Searches
    - [p] Interpolation Search
    - [p] Jump Search
    - [p] Exponential Search

### C. Graph Algorithms
- Traversal
    - [p] Breadth-First Search (BFS)
    - [p] Depth-First Search (DFS)
- Shortest Path
    - [p] Dijkstra's Algorithm
    - [p] Bellman-Ford Algorithm
    - [p] Floyd-Warshall Algorithm (All-Pairs Shortest Paths)
- Minimum Spanning Tree (MST)
    - [p] Prim's Algorithm
    - [p] Kruskal's Algorithm
- Other
    - [p] Topological Sort
    - [p] Strongly Connected Components (SCC)

### D. Tree Algorithms
- Traversals
    - [p] Inorder Traversal
    - [p] Preorder Traversal
    - [p] Postorder Traversal
    - [p] Level Order Traversal (BFS for Trees)
    - [p] DFS for Trees

### E. Dynamic Programming (DP)
- Core Concepts
    - [p] Recursion (as a basis for DP)
    - [p] Memoization
    - [p] Tabulation
- Classic Problems
    - [p] Knapsack Problem
    - [p] Longest Common Subsequence (LCS)

### F. Greedy Algorithms
- [p] Activity Selection Problem
- [p] Huffman Coding

### G. String Algorithms
- Matching
    - [p] KMP (Knuth-Morris-Pratt) Algorithm
    - [p] Rabin-Karp Algorithm
    - [p] String Matching (General)
- Other
    - [p] Palindrome Checks

### H. Backtracking
- [p] N-Queens Problem
- [p] Sudoku Solver
- [p] Subset Sum Problem

### I. Mathematical Algorithms
- Number Theory
    - [p] Prime Numbers (Sieve, Primality Test)
    - [p] Factorials
    - [p] GCD (Greatest Common Divisor - Euclidean Algorithm)
    - [p] LCM (Least Common Multiple)
- Sequences
    - [p] Fibonacci Sequence
- Computational Geometry
    - [p] Closest Pair of Points

### J. Bit Manipulation
- [p] Bitwise Operations
- [p] Bitwise Tricks

## III. General Project Features & Enhancements

- [ ] User accounts to save custom configurations
- [ ] Comprehensive explanations for each data structure and algorithm visualization
- [ ] Display of Time and Space Complexity information for each visualization
- [ ] Robust interactive controls for all operations
- [ ] Clear step-by-step visualization of processes
- [ ] **Code Tab:** For each visualization, include a tab displaying the implementation code (e.g., TypeScript/JavaScript) in a read-only code editor UI for user study.
- [ ] Consistent UI/UX across all visualizers

## IV. Development & Review Tasks

- [ ] Review existing `[x]` implementations for completeness, correctness, and edge cases.
- [ ] For items marked `[p]`, implement the core logic and D3.js visualization.
- [ ] Add comprehensive test cases for all implemented data structures and algorithms.
- [ ] Ensure all necessary imports and dependencies are correctly handled for new components.
- [ ] Optimize D3.js rendering for performance, especially with large datasets.
- [ ] Ensure responsive design for all components and visualizations.
- [ ] Write documentation for new components and update existing documentation. 