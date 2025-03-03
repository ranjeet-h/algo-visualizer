# Visualizer Components

This directory contains components for visualizing various data structures and algorithms.

## Folder Structure

```
/visualizer
├── /array             # Array visualization components
│   ├── /d3            # D3.js implementation for array visualization
│   └── ...
├── /stack-queue       # Stack, Queue, and Deque visualization components
│   ├── /d3            # D3.js implementation for stack and queue visualization
│   └── ...
├── /linked-list       # Linked List visualization components
│   ├── /d3            # D3.js implementation for linked list visualization
│   └── ...
├── /hash              # Hash Table and Hash Set visualization components
│   ├── /d3            # D3.js implementation for hash visualization
│   └── ...
├── /common            # Shared components used across different visualizers
│   └── ...
├── /types             # TypeScript type definitions for visualizers
│   └── ...
└── index.ts           # Main export file
```

## Main Components

- `BaseVisualizer`: A container component that provides a consistent layout for all visualizers
- `VisualizationControls`: Controls for playing, pausing, and stepping through visualizations

## Implementation Details

Each visualizer module consists of:

1. A main React component that handles the state and logic
2. A D3.js implementation that handles the rendering
3. Type definitions for the data structures

## Adding New Visualizers

To add a new visualizer:

1. Create a new directory for the visualizer (e.g., `/tree` for tree visualizations)
2. Create a D3 implementation in the `/d3` subdirectory
3. Create the main React component
4. Export the component from the main `index.ts` file 