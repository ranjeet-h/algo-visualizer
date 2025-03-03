import { useRef, useState, useEffect, useCallback } from 'react';
import { D3BinaryTreeVisualizer, D3BinaryTreeVisualizerRef } from './d3/binary-tree-visualizer';
import { BinaryTreeNode } from '../../types/visualizer';
import { VisualizationControls } from '../../common/visualization-controls';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Button, Flex, Text } from '@radix-ui/themes';
import { Tooltip } from 'react-tooltip';

export function BinaryTreeVisualizer()
{
  const [root, setRoot] = useState<BinaryTreeNode | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [valueToInsert, setValueToInsert] = useState('');
  const [valueToDelete, setValueToDelete] = useState('');
  const [animationQueue, setAnimationQueue] = useState<Array<() => void>>([]);
  const [isAutoBalancing, setIsAutoBalancing] = useState(false);
  const animationRef = useRef<number | null>(null);
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastAnimationTimestamp = useRef(0);
  const d3TreeRef = useRef<D3BinaryTreeVisualizerRef>(null);
  const [activeOperation, setActiveOperation] = useState('insert');
  const [inputValue, setInputValue] = useState('');

  // Reset animation state when component unmounts or algorithm changes
  useEffect(() =>
  {
    return () =>
    {
      if (animationRef.current)
      {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      if (highlightTimeoutRef.current)
      {
        clearTimeout(highlightTimeoutRef.current);
        highlightTimeoutRef.current = null;
      }
    };
  }, []);

  // Create a new binary tree with random values
  const createRandomTree = useCallback(() =>
  {
    const values: number[] = [];
    const count = Math.floor(Math.random() * 7) + 5; // Between 5-11 nodes

    // Generate random unique values
    while (values.length < count)
    {
      const value = Math.floor(Math.random() * 99) + 1;
      if (!values.includes(value))
      {
        values.push(value);
      }
    }

    // Reset state
    setRoot(null);
    setAnimationQueue([]);

    if (animationRef.current)
    {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (highlightTimeoutRef.current)
    {
      clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = null;
    }

    // Sort values for more balanced insertion
    values.sort((a, b) => a - b);

    // Insert values in a way that creates a more balanced tree
    const insertBalanced = (arr: number[], start: number, end: number) =>
    {
      if (start > end) return;

      const mid = Math.floor((start + end) / 2);
      handleInsert(arr[mid].toString(), false); // Insert without animation

      // Recursively insert left and right subtrees
      insertBalanced(arr, start, mid - 1);
      insertBalanced(arr, mid + 1, end);
    };

    // Use balanced insertion algorithm
    insertBalanced(values, 0, values.length - 1);

    // Reset the view after a short delay to ensure proper positioning
    setTimeout(() =>
    {
      if (d3TreeRef.current)
      {
        d3TreeRef.current.resetView();
      }
    }, 300);
  }, []);

  // Initialize with a random tree
  useEffect(() =>
  {
    createRandomTree();
  }, [createRandomTree]);

  // Animation logic
  const animate = useCallback(() =>
  {
    if (animationQueue.length === 0)
    {
      setIsAnimating(false);
      animationRef.current = null;
      return;
    }

    const now = performance.now();
    const elapsed = now - lastAnimationTimestamp.current;
    const speedFactor = Math.max(50, 800 / (speed * 1.5));

    if (elapsed < speedFactor)
    {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    // Execute the next animation step
    const nextAnimation = animationQueue[0];
    nextAnimation();

    // Update animation queue
    setAnimationQueue(prev => prev.slice(1));
    lastAnimationTimestamp.current = now;
    animationRef.current = requestAnimationFrame(animate);
  }, [animationQueue, speed]);

  // Start animation when queue changes
  useEffect(() =>
  {
    if (animationQueue.length > 0 && !isAnimating && !animationRef.current)
    {
      setIsAnimating(true);
      lastAnimationTimestamp.current = performance.now();
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [animationQueue, isAnimating, animate]);

  // Create a unique ID for each node
  const createNodeId = useCallback(() =>
  {
    return `node-${Math.random().toString(36).substring(2, 11)}`;
  }, []);

  // Check if a value already exists in the tree
  const valueExists = useCallback((node: BinaryTreeNode | null, val: string): boolean =>
  {
    if (!node) return false;
    if (node.value === val) return true;
    return valueExists(node.left, val) || valueExists(node.right, val);
  }, []);

  // Insert a node directly without animation (for tree building)
  const insertNodeDirectly = useCallback((node: BinaryTreeNode | null, value: string): BinaryTreeNode =>
  {
    if (!node)
    {
      return {
        id: createNodeId(),
        value,
        status: 'default',
        left: null,
        right: null,
        parent: null,
        height: 1,
        balanceFactor: 0
      };
    }

    // If node exists, traverse the tree to find the appropriate place
    const nodeValue = parseInt(String(node.value));
    const newValue = parseInt(String(value));

    if (newValue < nodeValue)
    {
      const newLeft = insertNodeDirectly(node.left, value);
      newLeft.parent = node;

      return {
        ...node,
        left: newLeft,
        height: Math.max((node.right?.height || 0), (newLeft?.height || 0)) + 1
      };
    }
    else if (newValue > nodeValue)
    {
      const newRight = insertNodeDirectly(node.right, value);
      newRight.parent = node;

      return {
        ...node,
        right: newRight,
        height: Math.max((node.left?.height || 0), (newRight?.height || 0)) + 1
      };
    }

    // Value already exists
    return node;
  }, [createNodeId]);

  // Handle insertion with or without animation
  const handleInsert = useCallback((value: string = valueToInsert, animate: boolean = true) =>
  {
    // Validate input
    if (!value.trim() || isNaN(parseInt(value)))
    {
      if (animate)
      {
        toast.error('Please enter a valid number');
        setValueToInsert('');
      }
      return;
    }

    // Limit to valid range (1-999)
    const numValue = parseInt(value);
    if (numValue < 1 || numValue > 999)
    {
      if (animate)
      {
        toast.error('Please enter a number between 1 and 999');
        setValueToInsert('');
      }
      return;
    }

    // If we're not animating, use the direct insertion method
    if (!animate)
    {
      // Check if the value already exists
      if (root && valueExists(root, value))
      {
        return; // Silently ignore duplicates during batch insertion
      }

      // Use the insertNodeDirectly function which handles null roots properly
      setRoot(prevRoot => insertNodeDirectly(prevRoot, value));
      return;
    }

    // For animated insertion, proceed with the existing flow
    // Cancel any ongoing animations
    if (animationRef.current)
    {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // Clear any existing highlight timeout
    if (highlightTimeoutRef.current)
    {
      clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = null;
    }

    setAnimationQueue([]);
    setIsAnimating(true);

    // Animate insertion process with visual path traversal
    const animateInsertion = (node: BinaryTreeNode | null, path: BinaryTreeNode[] = []) =>
    {
      if (!node)
      {
        // Create new node at this position
        const newNodeId = createNodeId();
        const newNode: BinaryTreeNode = {
          id: newNodeId,
          value,
          status: 'inserting',
          left: null,
          right: null,
          parent: path.length > 0 ? path[path.length - 1] : null,
          height: 1,
          balanceFactor: 0
        };

        // Update the tree with the new node
        setRoot(prevRoot =>
        {
          if (!prevRoot) return newNode;
          if (path.length === 0) return prevRoot; // Shouldn't happen

          // Clone the tree
          const updatedTree = structuredClone(prevRoot);
          let current = updatedTree;

          // Navigate to the parent node
          for (let i = 0; i < path.length - 1; i++)
          {
            const pathNode = path[i];
            const nextNode = path[i + 1];
            if (parseInt(String(nextNode.value)) < parseInt(String(pathNode.value)))
            {
              current = current.left!;
            } else
            {
              current = current.right!;
            }
          }

          // Add the new node
          const parentValue = parseInt(String(path[path.length - 1].value));
          const newValue = parseInt(String(value));
          if (newValue < parentValue)
          {
            current.left = newNode;
          } else
          {
            current.right = newNode;
          }

          return updatedTree;
        });

        // Pan to the newly inserted node after a short delay
        setTimeout(() =>
        {
          if (d3TreeRef.current)
          {
            d3TreeRef.current.panToNode(newNodeId);

            // Change the node status to 'found' (green) instead of immediately resetting
            setTimeout(() =>
            {
              setRoot(prevRoot =>
              {
                if (!prevRoot) return null;
                // Mark only the newly inserted node as found
                const updateNodeStatus = (n: BinaryTreeNode | null): BinaryTreeNode | null =>
                {
                  if (!n) return null;
                  return {
                    ...n,
                    status: n.id === newNodeId ? 'found' : 'default',
                    left: updateNodeStatus(n.left),
                    right: updateNodeStatus(n.right)
                  };
                };
                return updateNodeStatus(prevRoot);
              });

              // Set a timeout to reset the status after 3 seconds
              highlightTimeoutRef.current = setTimeout(() =>
              {
                setRoot(prevRoot =>
                {
                  if (!prevRoot) return null;
                  const resetStatus = (n: BinaryTreeNode | null): BinaryTreeNode | null =>
                  {
                    if (!n) return null;
                    return {
                      ...n,
                      status: 'default',
                      left: resetStatus(n.left),
                      right: resetStatus(n.right)
                    };
                  };
                  return resetStatus(prevRoot);
                });
                highlightTimeoutRef.current = null;
              }, 3000);

              setIsAnimating(false);
            }, 1200);
          }
        }, 400);

        return;
      }

      // Update the node status to visiting for visualization
      setRoot(prevRoot =>
      {
        if (!prevRoot) return null;

        const updateStatus = (n: BinaryTreeNode | null, targetId: string, newStatus: string): BinaryTreeNode | null =>
        {
          if (!n) return null;
          if (n.id === targetId)
          {
            return { ...n, status: newStatus as any };
          }
          return {
            ...n,
            left: updateStatus(n.left, targetId, newStatus),
            right: updateStatus(n.right, targetId, newStatus)
          };
        };

        return updateStatus(prevRoot, node.id, 'visiting');
      });

      // Pan to the current node being visited
      if (d3TreeRef.current)
      {
        d3TreeRef.current.panToNode(node.id);
      }

      // Decide which way to go and continue traversal after a delay
      setTimeout(() =>
      {
        const nodeValue = parseInt(String(node.value));
        const insertValue = parseInt(String(value));

        if (insertValue < nodeValue)
        {
          animateInsertion(node.left, [...path, node]);
        } else if (insertValue > nodeValue)
        {
          animateInsertion(node.right, [...path, node]);
        } else
        {
          // Value already exists, reset all nodes to default
          toast.warning(`Value ${value} already exists in the tree`);
          setRoot(prevRoot =>
          {
            if (!prevRoot) return null;
            const resetStatus = (n: BinaryTreeNode | null): BinaryTreeNode | null =>
            {
              if (!n) return null;
              return {
                ...n,
                status: 'default',
                left: resetStatus(n.left),
                right: resetStatus(n.right)
              };
            };
            return resetStatus(prevRoot);
          });
          setIsAnimating(false);
        }
      }, 800);
    };

    // Check if the value already exists
    if (root && valueExists(root, value))
    {
      toast.warning(`Value ${value} already exists in the tree`);
      return;
    }

    // Start the insertion animation from the root
    if (!root)
    {
      // If tree is empty, just create a new root
      const newNodeId = createNodeId();
      const newNode: BinaryTreeNode = {
        id: newNodeId,
        value,
        status: 'inserting',
        left: null,
        right: null,
        parent: null,
        height: 1,
        balanceFactor: 0
      };

      setRoot(newNode);

      // Pan to the newly created root and reset after a delay
      setTimeout(() =>
      {
        if (d3TreeRef.current)
        {
          setTimeout(() =>
          {
            setRoot(prevRoot =>
            {
              if (!prevRoot) return null;
              return { ...prevRoot, status: 'default' };
            });
            setIsAnimating(false);
          }, 1000);
        }
      }, 400);
    } else
    {
      animateInsertion(root, []);
    }

    setValueToInsert('');
  }, [valueToInsert, root, createNodeId, valueExists]);

  // Handler for searching a node
  const handleSearch = useCallback(() =>
  {
    if (!inputValue.trim())
    {
      toast.error('Please enter a value to search');
      return;
    }

    const value = inputValue.trim();

    if (!/^\d+$/.test(value))
    {
      toast.error('Please enter a valid number');
      return;
    }

    // Cancel any ongoing animations
    if (animationRef.current)
    {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setAnimationQueue([]);
    setIsAnimating(true);

    // Animate the search process
    const animateSearch = (node: BinaryTreeNode | null, path: BinaryTreeNode[] = []) =>
    {
      if (!node)
      {
        // Node not found
        toast.error(`Value ${value} not found in the tree`);
        setIsAnimating(false);
        return;
      }

      // Update the current node status to visiting
      setRoot(prevRoot =>
      {
        if (!prevRoot) return null;

        const updateStatus = (n: BinaryTreeNode | null, targetId: string, newStatus: string): BinaryTreeNode | null =>
        {
          if (!n) return null;
          if (n.id === targetId)
          {
            return { ...n, status: newStatus as any };
          }
          return {
            ...n,
            left: updateStatus(n.left, targetId, newStatus),
            right: updateStatus(n.right, targetId, newStatus)
          };
        };

        return updateStatus(prevRoot, node.id, 'visiting');
      });

      // Pan to the current node being visited
      if (d3TreeRef.current)
      {
        d3TreeRef.current.panToNode(node.id);
      }

      // Check if this is the node we're looking for
      setTimeout(() =>
      {
        if (node.value === value)
        {
          // Node found
          setRoot(prevRoot =>
          {
            if (!prevRoot) return null;

            const updateStatus = (n: BinaryTreeNode | null, targetId: string, newStatus: string): BinaryTreeNode | null =>
            {
              if (!n) return null;
              if (n.id === targetId)
              {
                return { ...n, status: newStatus as any };
              }
              return {
                ...n,
                left: updateStatus(n.left, targetId, newStatus),
                right: updateStatus(n.right, targetId, newStatus)
              };
            };

            return updateStatus(prevRoot, node.id, 'found');
          });

          toast.success(`Found value ${value} in the tree`);

          // Keep the node highlighted for 3 seconds instead of resetting immediately
          setIsAnimating(false);

          // Set a timeout to reset the status after 3 seconds
          highlightTimeoutRef.current = setTimeout(() =>
          {
            setRoot(prevRoot =>
            {
              if (!prevRoot) return null;
              const resetStatus = (n: BinaryTreeNode | null): BinaryTreeNode | null =>
              {
                if (!n) return null;
                return {
                  ...n,
                  status: 'default',
                  left: resetStatus(n.left),
                  right: resetStatus(n.right)
                };
              };
              return resetStatus(prevRoot);
            });
            highlightTimeoutRef.current = null;
          }, 3000); // Keep highlighted for 3 seconds

          return;
        }

        // Continue searching
        const nodeValue = parseInt(String(node.value));
        const searchValue = parseInt(String(value));

        if (searchValue < nodeValue)
        {
          animateSearch(node.left, [...path, node]);
        } else
        {
          animateSearch(node.right, [...path, node]);
        }
      }, 800);
    };

    if (!root)
    {
      toast.error('Tree is empty');
      return;
    }

    // Start the search animation from the root
    animateSearch(root, []);
    setInputValue('');
  }, [inputValue, root]);

  // Handler for deleting a node
  const handleDelete = useCallback(() =>
  {
    if (!valueToDelete.trim())
    {
      toast.error('Please enter a value to delete');
      return;
    }

    const value = valueToDelete.trim();

    if (!/^\d+$/.test(value))
    {
      toast.error('Please enter a valid number');
      return;
    }

    // Cancel any ongoing animations
    if (animationRef.current)
    {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setAnimationQueue([]);
    setIsAnimating(true);

    // Animate the deletion process
    const animateDelete = (node: BinaryTreeNode | null, path: BinaryTreeNode[] = []) =>
    {
      if (!node)
      {
        // Node not found
        toast.error(`Value ${value} not found in the tree`);
        setIsAnimating(false);
        return;
      }

      // Update the current node status to visiting
      setRoot(prevRoot =>
      {
        if (!prevRoot) return null;

        const updateStatus = (n: BinaryTreeNode | null, targetId: string, newStatus: string): BinaryTreeNode | null =>
        {
          if (!n) return null;
          if (n.id === targetId)
          {
            return { ...n, status: newStatus as any };
          }
          return {
            ...n,
            left: updateStatus(n.left, targetId, newStatus),
            right: updateStatus(n.right, targetId, newStatus)
          };
        };

        return updateStatus(prevRoot, node.id, 'visiting');
      });

      // Pan to the current node being visited
      if (d3TreeRef.current)
      {
        d3TreeRef.current.panToNode(node.id);
      }

      // Check if this is the node we're looking for
      setTimeout(() =>
      {
        if (node.value === value)
        {
          // Node found, mark it for deletion
          setRoot(prevRoot =>
          {
            if (!prevRoot) return null;

            const updateStatus = (n: BinaryTreeNode | null, targetId: string, newStatus: string): BinaryTreeNode | null =>
            {
              if (!n) return null;
              if (n.id === targetId)
              {
                return { ...n, status: newStatus as any };
              }
              return {
                ...n,
                left: updateStatus(n.left, targetId, newStatus),
                right: updateStatus(n.right, targetId, newStatus)
              };
            };

            return updateStatus(prevRoot, node.id, 'removing');
          });

          // Delete the node after a delay
          setTimeout(() =>
          {
            setRoot(prevRoot =>
            {
              if (!prevRoot) return null;

              // Delete the node function
              const deleteNode = (n: BinaryTreeNode | null, val: string): BinaryTreeNode | null =>
              {
                if (!n) return null;

                // If value is less than node value, delete from left subtree
                if (parseInt(String(val)) < parseInt(String(n.value)))
                {
                  const newLeft = deleteNode(n.left, val);
                  if (newLeft !== n.left)
                  {
                    if (newLeft) newLeft.parent = n;
                    return { ...n, left: newLeft };
                  }
                  return n;
                }

                // If value is greater than node value, delete from right subtree
                if (parseInt(String(val)) > parseInt(String(n.value)))
                {
                  const newRight = deleteNode(n.right, val);
                  if (newRight !== n.right)
                  {
                    if (newRight) newRight.parent = n;
                    return { ...n, right: newRight };
                  }
                  return n;
                }

                // This is the node to delete

                // If the node has no children, just delete it
                if (!n.left && !n.right)
                {
                  return null;
                }

                // If the node has only one child, replace it with the child
                if (!n.left)
                {
                  const right = n.right;
                  if (right) right.parent = n.parent;
                  return right;
                }

                if (!n.right)
                {
                  const left = n.left;
                  if (left) left.parent = n.parent;
                  return left;
                }

                // If the node has two children, find the inorder successor
                let successor = n.right;
                while (successor.left)
                {
                  successor = successor.left;
                }

                // Create a new node with the successor's value and the original node's children
                const newNode: BinaryTreeNode = {
                  ...n,
                  value: successor.value,
                  // Delete the successor from the right subtree
                  right: deleteNode(n.right, String(successor.value))
                };

                if (newNode.right) newNode.right.parent = newNode;

                return newNode;
              };

              const updatedRoot = deleteNode(prevRoot, value);
              toast.success(`Deleted value ${value} from the tree`);

              // Reset all nodes to default status
              const resetStatus = (n: BinaryTreeNode | null): BinaryTreeNode | null =>
              {
                if (!n) return null;
                return {
                  ...n,
                  status: 'default',
                  left: resetStatus(n.left),
                  right: resetStatus(n.right)
                };
              };

              return updatedRoot ? resetStatus(updatedRoot) : null;
            });

            setTimeout(() =>
            {
              setIsAnimating(false);
              if (d3TreeRef.current)
              {
                d3TreeRef.current.resetView();
              }
            }, 300);
          }, 800);

          return;
        }

        // Continue searching for the node to delete
        const nodeValue = parseInt(String(node.value));
        const deleteValue = parseInt(String(value));

        if (deleteValue < nodeValue)
        {
          animateDelete(node.left, [...path, node]);
        } else
        {
          animateDelete(node.right, [...path, node]);
        }
      }, 800);
    };

    if (!root)
    {
      toast.error('Tree is empty');
      return;
    }

    // Start the delete animation from the root
    animateDelete(root, []);
    setValueToDelete('');
  }, [valueToDelete, root]);

  // Clear the tree
  const handleClear = useCallback(() =>
  {
    // Reset state
    setRoot(null);
    setAnimationQueue([]);
    setIsAnimating(false);
    if (animationRef.current)
    {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    toast.success('Tree cleared');
  }, []);

  // Handle node click
  const handleNodeClick = useCallback((nodeId: string) =>
  {
    // Find the node to get its value
    const findNode = (node: BinaryTreeNode | null, id: string): BinaryTreeNode | null =>
    {
      if (!node) return null;
      if (node.id === id) return node;

      const leftResult = findNode(node.left, id);
      if (leftResult) return leftResult;

      return findNode(node.right, id);
    };

    const clickedNode = findNode(root, nodeId);
    if (clickedNode)
    {
      // Highlight the clicked node
      setRoot(prevRoot =>
      {
        const updateNode = (node: BinaryTreeNode | null): BinaryTreeNode | null =>
        {
          if (!node) return null;

          return {
            ...node,
            status: node.id === nodeId ? 'visiting' : 'default',
            left: updateNode(node.left),
            right: updateNode(node.right)
          };
        };

        return updateNode(prevRoot);
      });

      toast.info(`Selected node value: ${clickedNode.value}`);

      // Pan to the clicked node for better visibility
      if (d3TreeRef.current)
      {
        d3TreeRef.current.panToNode(nodeId);
      }
    }
  }, [root]);

  return (
    <div className="flex flex-col gap-4 p-4 h-full w-full bg-white">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 w-full">
        <h2 className="text-lg font-bold">Binary Tree Visualizer</h2>

        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-balance"
              checked={isAutoBalancing}
              onCheckedChange={setIsAutoBalancing}
            />
            <Label htmlFor="auto-balance">Auto Balance</Label>
          </div>
          <Tooltip content="Clear the tree" anchorSelect='#binary-tree-visualizer-clear' place='bottom' />
          <Button id='binary-tree-visualizer-clear' variant="outline" onClick={handleClear}>Clear</Button>
          <Tooltip content="Create a random tree" anchorSelect='#binary-tree-visualizer-random-tree' place='bottom' />
          <Button id='binary-tree-visualizer-random-tree' variant="outline" onClick={createRandomTree}>Random Tree</Button>
        </div>
      </div>

      <VisualizationControls
        state={{
          isPlaying: isAnimating,
          isCompleted: false,
          currentStep: animationQueue.length > 0 ? 1 : 0,
          totalSteps: animationQueue.length,
          speed: speed,
          data: [],
          algorithmName: "Binary Tree",
          algorithmType: "tree"
        }}
        onPlay={() => { }}
        onPause={() => { }}
        onReset={() => { }}
        onStep={() => { }}
        onSpeedChange={setSpeed}
      />

      <Text size="4" weight="bold">Binary Tree Operations</Text>
      <div className="flex flex-col sm:flex-row gap-4 w-full">

        <Button variant="classic" size="3" className="w-full" onClick={() => setActiveOperation('insert')}>
          Insert Node
        </Button>
        <Button variant="classic" size="3" className="w-full" onClick={() => setActiveOperation('search')}>
          Search Node
        </Button>
        <Button variant="classic" size="3" className="w-full" onClick={() => setActiveOperation('delete')}>
          Delete Node
        </Button>
        <Button variant="classic" size="3" className="w-full" onClick={createRandomTree}>
          Generate Random Tree
        </Button>
        <Button variant="classic" size="3" className="w-full" onClick={handleClear}>
          Clear Tree
        </Button>



      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full">
        {activeOperation === 'insert' && (
          <Flex direction="column" gap="2">
            <Text weight="medium">Insert Node</Text>
            <Flex gap="2">
              <Input
                type="number"
                placeholder="Enter value"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Button size="3" variant="classic" onClick={() => handleInsert(inputValue, true)} disabled={isAnimating}>
                Insert
              </Button>
            </Flex>
          </Flex>
        )}

        {activeOperation === 'search' && (
          <Flex direction="column" gap="2">
            <Text weight="medium">Search Node</Text>
            <Flex gap="2">

              <Input
                type="number"
                placeholder="Enter value"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />

              <Button variant="classic" size="3" className="w-full" onClick={handleSearch} disabled={isAnimating}>
                Search
              </Button>
            </Flex>
          </Flex>
        )}

        {activeOperation === 'delete' && (
          <Flex direction="column" gap="2">
            <Text weight="medium">Delete Node</Text>
            <Flex gap="2">
              <Input
                type="number"
                placeholder="Enter value"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Button variant="classic" size="3" className="w-full" onClick={handleDelete} disabled={isAnimating}>
                Delete
              </Button>
            </Flex>
          </Flex>
        )}
      </div>

      <div className="flex-1 w-full border rounded-lg shadow-sm bg-white overflow-hidden">
        <D3BinaryTreeVisualizer
          ref={d3TreeRef}
          root={root}
          height={500}
          onNodeClick={handleNodeClick}
        />
      </div>
    </div>
  );
} 