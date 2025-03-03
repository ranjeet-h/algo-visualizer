import { useState, useEffect } from 'react';
import { 
  Menu, X, ChevronRight, LayoutGrid, Code2, Braces, Search, Settings, HelpCircle, List, Link, Layers, 
  GitBranch, Network, ArrowUpDown, SortAsc, 
  SortDesc, Shuffle, Hash, Database,
  Binary, BarChart, FileSearch, Code, Clock, 
  Sigma, Puzzle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { dataStructures, algorithms } from '../../lib/utils';
import React from 'react';
import { Button } from '@radix-ui/themes';

interface MainLayoutProps {
  children: React.ReactNode;
  onSelect: (category: string, item: string) => void;
}

interface NavItem {
  name: string;
  icon: React.ReactNode;
  description: string;
  children?: NavItem[];
}

interface CategoryData {
  icon: React.ReactNode;
  description: string;
  items: NavItem[];
}

export function MainLayout({ children, onSelect }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeItem, setActiveItem] = useState<{category: string, item: string} | null>(null);

  // Helper function to get an icon for a given title
  const getIcon = (title: string) => {
    const icons: Record<string, React.ReactNode> = {
      // Data Structures
      'Arrays': <List className="h-4 w-4" />,
      'Linked Lists': <Link className="h-4 w-4" />,
      'Singly Linked List': <Link className="h-4 w-4" />,
      'Doubly Linked List': <Link className="h-4 w-4" />,
      'Circular Linked List': <Link className="h-4 w-4" />,
      'Stacks & Queues': <Layers className="h-4 w-4" />,
      'Stack': <Layers className="h-4 w-4" />,
      'Queue': <ArrowUpDown className="h-4 w-4" />,
      'Deque': <ArrowUpDown className="h-4 w-4" />,
      'Hash-Based': <Hash className="h-4 w-4" />,
      'Hash Map': <Hash className="h-4 w-4" />,
      'Hash Set': <Hash className="h-4 w-4" />,
      'Trees': <GitBranch className="h-4 w-4" />,
      'Binary Tree': <GitBranch className="h-4 w-4" />,
      'Binary Search Tree': <GitBranch className="h-4 w-4" />,
      'AVL Tree': <GitBranch className="h-4 w-4" />,
      'Red-Black Tree': <GitBranch className="h-4 w-4" />,
      'Trie': <GitBranch className="h-4 w-4" />,
      'Segment Tree': <GitBranch className="h-4 w-4" />,
      'Fenwick Tree': <GitBranch className="h-4 w-4" />,
      'Graphs': <Network className="h-4 w-4" />,
      'Undirected Graph': <Network className="h-4 w-4" />,
      'Directed Graph': <Network className="h-4 w-4" />,
      'Weighted Graph': <Network className="h-4 w-4" />,
      'Heaps': <Database className="h-4 w-4" />,
      'Min-Heap': <Database className="h-4 w-4" />,
      'Max-Heap': <Database className="h-4 w-4" />,
      'Advanced Collections': <Database className="h-4 w-4" />,
      'Balanced Tree Sets': <Database className="h-4 w-4" />,
      'Hash-based Sets': <Hash className="h-4 w-4" />,
      'Balanced Tree Maps': <Database className="h-4 w-4" />,
      'Hash-based Maps': <Hash className="h-4 w-4" />,
      
      // Algorithms
      'Sorting': <SortAsc className="h-4 w-4" />,
      'Bubble Sort': <SortAsc className="h-4 w-4" />,
      'Selection Sort': <SortDesc className="h-4 w-4" />,
      'Insertion Sort': <SortAsc className="h-4 w-4" />,
      'Merge Sort': <GitBranch className="h-4 w-4" />,
      'Quick Sort': <Shuffle className="h-4 w-4" />,
      'Heap Sort': <Database className="h-4 w-4" />,
      'Counting Sort': <BarChart className="h-4 w-4" />,
      'Radix Sort': <BarChart className="h-4 w-4" />,
      'Bucket Sort': <BarChart className="h-4 w-4" />,
      'Searching': <FileSearch className="h-4 w-4" />,
      'Linear Search': <FileSearch className="h-4 w-4" />,
      'Binary Search': <FileSearch className="h-4 w-4" />,
      'Interpolation Search': <FileSearch className="h-4 w-4" />,
      'Jump Search': <FileSearch className="h-4 w-4" />,
      'Exponential Search': <FileSearch className="h-4 w-4" />,
      'Dynamic Programming': <Binary className="h-4 w-4" />,
      'Recursion': <Binary className="h-4 w-4" />,
      'Memoization': <Binary className="h-4 w-4" />,
      'Tabulation': <BarChart className="h-4 w-4" />,
      'Knapsack Problem': <Binary className="h-4 w-4" />,
      'Longest Common Subsequence': <Binary className="h-4 w-4" />,
      'Greedy Algorithms': <Code className="h-4 w-4" />,
      'Activity Selection': <Clock className="h-4 w-4" />,
      'Huffman Coding': <Code className="h-4 w-4" />,
      'Graph Algorithms': <Network className="h-4 w-4" />,
      'BFS': <Network className="h-4 w-4" />,
      'DFS': <Network className="h-4 w-4" />,
      "Dijkstra's Algorithm": <Network className="h-4 w-4" />,
      "Prim's Algorithm": <Network className="h-4 w-4" />,
      "Kruskal's Algorithm": <Network className="h-4 w-4" />,
      'Bellman-Ford Algorithm': <Network className="h-4 w-4" />,
      'Floyd-Warshall Algorithm': <Network className="h-4 w-4" />,
      'Topological Sort': <Network className="h-4 w-4" />,
      'Strongly Connected Components': <Network className="h-4 w-4" />,
      'Tree Traversals': <GitBranch className="h-4 w-4" />,
      'Inorder Traversal': <GitBranch className="h-4 w-4" />,
      'Preorder Traversal': <GitBranch className="h-4 w-4" />,
      'Postorder Traversal': <GitBranch className="h-4 w-4" />,
      'Level Order Traversal': <GitBranch className="h-4 w-4" />,
      'BFS for Trees': <GitBranch className="h-4 w-4" />,
      'DFS for Trees': <GitBranch className="h-4 w-4" />,
      'String Algorithms': <Code className="h-4 w-4" />,
      'KMP Algorithm': <Code className="h-4 w-4" />,
      'Rabin-Karp Algorithm': <Code className="h-4 w-4" />,
      'String Matching': <Code className="h-4 w-4" />,
      'Palindrome Checks': <Code className="h-4 w-4" />,
      'Mathematics': <Sigma className="h-4 w-4" />,
      'Prime Numbers': <Sigma className="h-4 w-4" />,
      'Factorials': <Sigma className="h-4 w-4" />,
      'GCD': <Sigma className="h-4 w-4" />,
      'LCM': <Sigma className="h-4 w-4" />,
      'Fibonacci Sequence': <Sigma className="h-4 w-4" />,
      'Closest Pair of Points': <Sigma className="h-4 w-4" />,
      'Bit Manipulation': <Binary className="h-4 w-4" />,
      'Bitwise Operations': <Binary className="h-4 w-4" />,
      'Bitwise Tricks': <Binary className="h-4 w-4" />,
      'Backtracking': <Puzzle className="h-4 w-4" />,
      'N-Queens': <Puzzle className="h-4 w-4" />,
      'Sudoku Solver': <Puzzle className="h-4 w-4" />,
      'Subset Sum': <Puzzle className="h-4 w-4" />,
    };
    
    return icons[title] || <Code2 className="h-4 w-4" />;
  };

  // Helper function to get a short description for a given title
  const getDescription = (title: string) => {
    const descriptions: Record<string, string> = {
      // Data Structures
      'Arrays': 'Sequence of elements stored in contiguous memory',
      'Linked Lists': 'Sequence of elements with pointers to next element',
      'Singly Linked List': 'Each node points to the next node',
      'Doubly Linked List': 'Each node points to both next and previous nodes',
      'Circular Linked List': 'Last node points back to the first node',
      'Stacks & Queues': 'Abstract data types with specific access patterns',
      'Stack': 'LIFO data structure with push/pop operations',
      'Queue': 'FIFO data structure with enqueue/dequeue operations',
      'Deque': 'Double-ended queue allowing insertion/removal at both ends',
      'Hash-Based': 'Data structures using hash functions for efficient access',
      'Hash Map': 'Key-value store using hash function for O(1) access',
      'Hash Set': 'Collection of unique elements using hash function',
      'Trees': 'Hierarchical structure with parent-child relationships',
      'Binary Tree': 'Tree where each node has at most two children',
      'Binary Search Tree': 'Binary tree with ordered nodes for efficient search',
      'AVL Tree': 'Self-balancing binary search tree',
      'Red-Black Tree': 'Self-balancing binary search tree with coloring',
      'Trie': 'Tree-like data structure for efficient string operations',
      'Segment Tree': 'Tree for storing intervals or segments',
      'Fenwick Tree': 'Data structure for efficient range queries',
      'Graphs': 'Collection of nodes connected by edges',
      'Undirected Graph': 'Graph with bidirectional edges',
      'Directed Graph': 'Graph with directional edges',
      'Weighted Graph': 'Graph with values assigned to edges',
      'Heaps': 'Specialized tree-based data structure',
      'Min-Heap': 'Heap where parent node is smaller than or equal to children',
      'Max-Heap': 'Heap where parent node is greater than or equal to children',
      'Advanced Collections': 'Specialized data structures for specific operations',
      'Balanced Tree Sets': 'Set implementation using balanced trees',
      'Hash-based Sets': 'Set implementation using hash tables',
      'Balanced Tree Maps': 'Map implementation using balanced trees',
      'Hash-based Maps': 'Map implementation using hash tables',
      
      // Algorithms
      'Sorting': 'Algorithms to arrange elements in a specific order',
      'Bubble Sort': 'Simple sorting algorithm with O(n²) time complexity',
      'Selection Sort': 'Simple sorting algorithm with consistent O(n²) time',
      'Insertion Sort': 'Efficient for small data sets with O(n²) worst-case',
      'Merge Sort': 'Stable, divide-and-conquer algorithm with O(n log n) time',
      'Quick Sort': 'Efficient divide-and-conquer algorithm with O(n log n) average time',
      'Heap Sort': 'Comparison-based sort using heap data structure',
      'Counting Sort': 'Integer sorting algorithm with O(n+k) time complexity',
      'Radix Sort': 'Non-comparative integer sorting algorithm',
      'Bucket Sort': 'Sorting by distributing elements across buckets',
      'Searching': 'Algorithms for finding elements in data structures',
      'Linear Search': 'Simple search checking each element sequentially',
      'Binary Search': 'Efficient search in sorted arrays with O(log n) time',
      'Interpolation Search': 'Improved binary search for uniformly distributed data',
      'Jump Search': 'Search algorithm for sorted arrays with O(√n) time',
      'Exponential Search': 'Search in unbounded/infinite arrays',
      'Dynamic Programming': 'Method for solving complex problems by breaking into subproblems',
      'Recursion': 'Method where function calls itself to solve problems',
      'Memoization': 'Optimization technique using caching of results',
      'Tabulation': 'Bottom-up dynamic programming approach',
      'Knapsack Problem': 'Optimization problem for maximizing value with constraints',
      'Longest Common Subsequence': 'Finding the longest subsequence in sequences',
      'Greedy Algorithms': 'Algorithms making locally optimal choices at each stage',
      'Activity Selection': 'Problem of selecting non-overlapping activities',
      'Huffman Coding': 'Algorithm for lossless data compression',
      'Graph Algorithms': 'Algorithms for solving graph-related problems',
      'BFS': 'Breadth-first search traversal of a graph',
      'DFS': 'Depth-first search traversal of a graph',
      "Dijkstra's Algorithm": 'Algorithm for finding shortest paths in weighted graphs',
      "Prim's Algorithm": 'Algorithm for finding minimum spanning tree',
      "Kruskal's Algorithm": 'Algorithm for finding minimum spanning tree',
      'Bellman-Ford Algorithm': 'Algorithm for shortest paths with negative weights',
      'Floyd-Warshall Algorithm': 'Algorithm for all-pairs shortest paths',
      'Topological Sort': 'Linear ordering of vertices in a directed graph',
      'Strongly Connected Components': 'Finding maximal strongly connected subgraphs',
      'Tree Traversals': 'Algorithms for visiting all nodes in a tree',
      'Inorder Traversal': 'Left-Root-Right tree traversal',
      'Preorder Traversal': 'Root-Left-Right tree traversal',
      'Postorder Traversal': 'Left-Right-Root tree traversal',
      'Level Order Traversal': 'Breadth-first tree traversal',
      'BFS for Trees': 'Breadth-first search traversal of a tree',
      'DFS for Trees': 'Depth-first search traversal of a tree',
      'String Algorithms': 'Algorithms for string manipulation and searching',
      'KMP Algorithm': 'Pattern matching algorithm with O(n+m) time',
      'Rabin-Karp Algorithm': 'String-searching algorithm using hashing',
      'String Matching': 'Finding occurrences of patterns in strings',
      'Palindrome Checks': 'Checking if a string reads the same backward as forward',
      'Mathematics': 'Mathematical algorithms and concepts',
      'Prime Numbers': 'Algorithms related to prime number generation and testing',
      'Factorials': 'Computing and working with factorials',
      'GCD': 'Finding the greatest common divisor of numbers',
      'LCM': 'Finding the least common multiple of numbers',
      'Fibonacci Sequence': 'Generating and working with Fibonacci numbers',
      'Closest Pair of Points': 'Finding pair of points with smallest distance',
      'Bit Manipulation': 'Algorithms using binary operations',
      'Bitwise Operations': 'Using AND, OR, XOR and other bit operations',
      'Bitwise Tricks': 'Optimization techniques using bit manipulation',
      'Backtracking': 'Algorithm for finding all solutions by trying possibilities',
      'N-Queens': 'Problem of placing N queens on an N×N chessboard',
      'Sudoku Solver': 'Algorithm to solve Sudoku puzzles',
      'Subset Sum': 'Problem of finding subset with sum equal to target'
    };
    
    return descriptions[title] || 'Algorithm or data structure';
  };

  // Convert data structures from utils.ts to the format needed for the sidebar
  const dsItems: NavItem[] = dataStructures.map(ds => {
    const navItem: NavItem = {
      name: ds.title,
      icon: getIcon(ds.title),
      description: getDescription(ds.title)
    };
    
    if (ds.children) {
      navItem.children = ds.children.map(child => ({
        name: child.title,
        icon: getIcon(child.title),
        description: getDescription(child.title)
      }));
    }
    
    return navItem;
  });

  // Convert algorithms from utils.ts to the format needed for the sidebar
  const algoItems: NavItem[] = algorithms.map(algo => {
    const navItem: NavItem = {
      name: algo.title,
      icon: getIcon(algo.title),
      description: getDescription(algo.title)
    };
    
    if (algo.children) {
      navItem.children = algo.children.map(child => ({
        name: child.title,
        icon: getIcon(child.title),
        description: getDescription(child.title)
      }));
    }
    
    return navItem;
  });

  const categories: Record<string, CategoryData> = {
    'Data Structures': {
      icon: <LayoutGrid className="h-5 w-5" />,
      description: 'Building blocks for efficient data organization',
      items: dsItems
    },
    'Algorithms': {
      icon: <Code2 className="h-5 w-5" />,
      description: 'Efficient procedures for computational tasks',
      items: algoItems
    }
  };

  useEffect(() => {
    // Expand the algorithm category on initial load for a better UX
    // if (!selectedCategory) {
    //   setSelectedCategory('Algorithms');
    // }

    if (window.innerWidth > 768) {
      setIsSidebarOpen(true);
    }

    // Handle sidebar visibility on mobile
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSelect = (category: string, item: string) => {
    onSelect(category, item);
    setActiveItem({ category, item });
    
    // On mobile, close the sidebar after selection
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // Filter items based on search query
  const filteredCategories = Object.entries(categories).map(([category, data]) => ({
    category,
    icon: data.icon,
    description: data.description,
    items: data.items.filter(item => 
      searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="min-h-screen">
      {/* Header - New Addition */}
      <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-4 sticky top-0 z-40">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden bg-background/80 backdrop-blur-sm border border-border rounded-lg p-2 hover:bg-accent transition-colors"
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            
            <div className="hidden md:flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Braces className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-xl font-bold">Algorithm Visualizer</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative w-64 hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-10 h-9" 
                placeholder="Search algorithms..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            

            <Separator orientation="vertical" className="h-8" />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full h-8 w-8 p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>AL</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Backdrop */}
      <AnimatePresence> 
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1, type: "spring", damping: 20, mass: 0.5, stiffness: 100, restDelta: 0.01 }}
            
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
        <div className='flex'>
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isSidebarOpen ? 0 : -300 }}
        transition={{ type: "tween", duration: 0.1 }}
        className={cn(
          "fixed top-0 left-0 h-[calc(100vh-4rem)] w-[300px] bg-card border-r border-border z-30",
          "transform transition-transform duration-300 ease-in-out",
          "md:relative md:transform-none md:min-w-[300px] md:w-[300px] md:flex-shrink-0"
        )}
      >
        {/* Search input for mobile */}
        <div className="p-4 border-b border-border md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              className="pl-10 h-9" 
              placeholder="Search algorithms..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="p-4 space-y-4 overflow-y-auto h-full">
          {filteredCategories.map(({ category, icon, description, items }) => (
            <div key={category} className="space-y-1">
              <button
                onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                className={cn(
                  "border w-full flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer",
                  "hover:bg-accent/60 hover:shadow-sm",
                  selectedCategory === category ? "bg-accent/40" : ""
                )}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={cn(
                    "p-2 rounded-lg flex-shrink-0 ",
                    selectedCategory === category ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    {icon}
                  </div>
                  <div className="text-left min-w-0">
                    <span className="font-medium block truncate">{category}</span>
                    <span className="text-xs text-muted-foreground truncate block">{description}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="outline" className="text-xs">
                    {items.length}
                  </Badge>
                  <ChevronRight 
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      selectedCategory === category ? "rotate-90" : ""
                    )} 
                  />
                </div>
              </button>

              <AnimatePresence>
                {selectedCategory === category && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden w-full"
                  >
                    <div className="pl-5 pr-2 space-y-1.5 py-1 w-full">
                      {items.map((item) => (
                        <React.Fragment key={item.name}>
                          <motion.button
                            onClick={() => 'children' in item ? null : handleSelect(category, item.name)}
                            className={cn(
                              "w-full text-left p-2 text-sm rounded-lg transition-all flex items-center gap-2 group cursor-pointer",
                              "hover:bg-accent hover:shadow-sm hover:border-primary hover:border-1",
                              activeItem?.category === category && activeItem?.item === item.name 
                                ? "bg-primary/10 text-primary font-medium" 
                                : "text-foreground"
                            )}
                            whileHover={{ x: 5 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          >
                            <div className={cn(
                              "p-1.5 rounded-md flex-shrink-0",
                              activeItem?.category === category && activeItem?.item === item.name 
                                ? "bg-primary/20 text-primary" 
                                : "bg-muted/40 text-muted-foreground group-hover:bg-muted/60"
                            )}>
                              {item.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="block truncate">{item.name}</span>
                              <span className="text-xs text-muted-foreground block mt-0.5 truncate">
                                {item.description}
                              </span>
                            </div>
                            {category === 'Algorithms' && item.name.includes('Sort') && (
                              <Badge className="ml-auto text-xs bg-primary/10 text-primary hover:bg-primary/20 flex-shrink-0">
                                Sort
                              </Badge>
                            )}
                            {'children' in item && item.children && (
                              <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto flex-shrink-0" />
                            )}
                            {activeItem?.category === category && activeItem?.item === item.name && !('children' in item) && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="ml-auto flex-shrink-0"
                              >
                                <Badge variant="success" className="w-2 h-2 rounded-full p-0" />
                              </motion.div>
                            )}
                          </motion.button>
                          
                          {/* Render children if any */}
                          {'children' in item && item.children && Array.isArray(item.children) && (
                            <div className="pl-6 space-y-1 mt-1 mb-2">
                              {item.children.map((child: NavItem) => (
                                <motion.button
                                  key={child.name}
                                  onClick={() => handleSelect(category, child.name)}
                                  className={cn(
                                    "w-full text-left p-2 text-sm rounded-lg transition-all flex items-center gap-2 group cursor-pointer",
                                    "hover:bg-accent hover:shadow-sm hover:border-primary hover:border-1",
                                    activeItem?.category === category && activeItem?.item === child.name 
                                      ? "bg-primary/10 text-primary font-medium" 
                                      : "text-foreground"
                                  )}
                                  whileHover={{ x: 5 }}
                                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                >
                                  <div className={cn(
                                    "p-1.5 rounded-md flex-shrink-0",
                                    activeItem?.category === category && activeItem?.item === child.name 
                                      ? "bg-primary/20 text-primary" 
                                      : "bg-muted/40 text-muted-foreground group-hover:bg-muted/60"
                                  )}>
                                    {child.icon}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className="block truncate">{child.name}</span>
                                    <span className="text-xs text-muted-foreground block mt-0.5 truncate">
                                      {child.description}
                                    </span>
                                  </div>
                                  {activeItem?.category === category && activeItem?.item === child.name && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="ml-auto flex-shrink-0"
                                    >
                                      <Badge variant="success" className="w-2 h-2 rounded-full p-0" />
                                    </motion.div>
                                  )}
                                </motion.button>
                              ))}
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          
          {filteredCategories.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <div className="text-muted-foreground mb-2">No results found</div>
              <p className="text-sm text-muted-foreground">
                Try searching for something else or clear the search
              </p>
              <Button
                variant="classic"
                size="1"
                className="mt-4"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      <main className={cn(
        "w-full",
        "pl-0 md:pl-4"
      )}>
        {children}
      </main>
    </div>
    </div>
  );
} 