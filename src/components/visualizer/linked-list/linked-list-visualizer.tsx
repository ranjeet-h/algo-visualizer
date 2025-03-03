import { useState, useCallback, useEffect } from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Tabs, TabsList, TabsTrigger } from '../../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { RotateCw, Plus, X } from 'lucide-react';
import { BaseVisualizer } from '../common/base-visualizer';
import { VisualizationControls } from '../common/visualization-controls';
import { D3LinkedListVisualizer, SinglyLinkedListNode, DoublyLinkedListNode } from './d3/linked-list-visualizer';
import { Button } from '@radix-ui/themes';

// We can represent circular lists using the same node structures, 
// but make sure the last node's next points to the head

type LinkedListType = 'singly' | 'doubly' | 'circular';

interface LinkedListVisualizerProps {
  type?: LinkedListType;
}

export function LinkedListVisualizer({ type = 'singly' }: LinkedListVisualizerProps) {
  // State for the linked list
  const [listType, setListType] = useState<LinkedListType>(type);
  const [nodes, setNodes] = useState<(SinglyLinkedListNode | DoublyLinkedListNode)[]>([]);
  const [head, setHead] = useState<number | null>(null);
  const [tail, setTail] = useState<number | null>(null);
  const [newNodeValue, setNewNodeValue] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [speed, setSpeed] = useState<number>(1);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  
  // Visualization state for controls
  const [visualizationState, setVisualizationState] = useState({
    isPlaying: false,
    isCompleted: false,
    currentStep: 0,
    totalSteps: 0,
    speed: 1,
    data: [],
    algorithmName: `${listType.charAt(0).toUpperCase() + listType.slice(1)} Linked List`,
    algorithmType: 'data-structure',
  });
  
  // Initialize with some data
  useEffect(() => {
    resetList();
    
    // Update the visualization state's algorithm name when list type changes
    setVisualizationState(prev => ({
      ...prev,
      algorithmName: `${listType.charAt(0).toUpperCase() + listType.slice(1)} Linked List`
    }));
  }, [listType]);

  // Reset the list with initial values based on the type
  const resetList = useCallback(() => {
    let initialNodes: (SinglyLinkedListNode | DoublyLinkedListNode)[] = [];
    
    // Create initial nodes based on list type
    if (listType === 'singly') {
      initialNodes = [
        { value: 10, status: 'default', next: 1 },
        { value: 20, status: 'default', next: 2 },
        { value: 30, status: 'default', next: 3 },
        { value: 40, status: 'default', next: null }
      ] as SinglyLinkedListNode[];
    } else if (listType === 'doubly') {
      initialNodes = [
        { value: 10, status: 'default', next: 1, prev: null },
        { value: 20, status: 'default', next: 2, prev: 0 },
        { value: 30, status: 'default', next: 3, prev: 1 },
        { value: 40, status: 'default', next: null, prev: 2 }
      ] as DoublyLinkedListNode[];
    } else if (listType === 'circular') {
      initialNodes = [
        { value: 10, status: 'default', next: 1 },
        { value: 20, status: 'default', next: 2 },
        { value: 30, status: 'default', next: 3 },
        { value: 40, status: 'default', next: 0 } // Circular points back to head
      ] as SinglyLinkedListNode[];
    }
    
    setNodes(initialNodes);
    setHead(initialNodes.length > 0 ? 0 : null);
    setTail(initialNodes.length > 0 ? initialNodes.length - 1 : null);
    setSelectedNode(null);
    setNewNodeValue('');
  }, [listType]);

  // Handle adding a node at the head
  const handleAddToHead = async () => {
    if (!newNodeValue || isAnimating) return;
    
    setIsAnimating(true);
    
    const value = parseInt(newNodeValue);
    let newNode: SinglyLinkedListNode | DoublyLinkedListNode;
    
    if (listType === 'singly' || listType === 'circular') {
      newNode = { value, status: 'inserted', next: head } as SinglyLinkedListNode;
    } else {
      newNode = { value, status: 'inserted', next: head, prev: null } as DoublyLinkedListNode;
      
      // Update previous pointer of the old head
      if (head !== null) {
        const updatedNodes = [...nodes];
        const oldHead = updatedNodes[head] as DoublyLinkedListNode;
        if ('prev' in oldHead) {
          oldHead.prev = 0;
        }
        setNodes(updatedNodes);
      }
    }
    
    // Insert new node
    const updatedNodes = [newNode, ...nodes];
    setNodes(updatedNodes);
    setHead(0);
    
    // Update indices in the next and prev pointers
    const adjustedNodes = updatedNodes.map((node) => {
      const adjustedNode = {...node};
      if (adjustedNode.next !== null) adjustedNode.next = adjustedNode.next + 1;
      if ('prev' in adjustedNode && 
          adjustedNode.prev !== null && 
          adjustedNode.prev !== undefined) {
        (adjustedNode as DoublyLinkedListNode).prev = (adjustedNode as DoublyLinkedListNode).prev! + 1;
      }
      return adjustedNode;
    });
    
    // If it's a circular list, update the tail's next pointer
    if (listType === 'circular' && tail !== null) {
      adjustedNodes[tail + 1].next = 0;
    }
    
    setNodes(adjustedNodes);
    setTail(tail !== null ? tail + 1 : 0);
    setNewNodeValue('');
    
    // Animate the new node
    await new Promise(resolve => setTimeout(resolve, 1000 / speed));
    
    const finalNodes = [...adjustedNodes];
    finalNodes[0].status = 'default';
    setNodes(finalNodes);
    setIsAnimating(false);
  };

  // Handle adding a node at the tail
  const handleAddToTail = async () => {
    if (!newNodeValue || isAnimating) return;
    
    setIsAnimating(true);
    
    const value = parseInt(newNodeValue);
    let newNode: SinglyLinkedListNode | DoublyLinkedListNode;
    
    if (listType === 'singly') {
      newNode = { value, status: 'inserted', next: null } as SinglyLinkedListNode;
    } else if (listType === 'doubly') {
      newNode = { value, status: 'inserted', next: null, prev: tail } as DoublyLinkedListNode;
    } else { // circular
      newNode = { value, status: 'inserted', next: head } as SinglyLinkedListNode;
    }
    
    const updatedNodes = [...nodes];
    
    // Update the current tail's next pointer
    if (tail !== null) {
      updatedNodes[tail].next = nodes.length;
    }
    
    updatedNodes.push(newNode);
    setNodes(updatedNodes);
    
    if (head === null) {
      setHead(0);
    }
    
    setTail(updatedNodes.length - 1);
    setNewNodeValue('');
    
    // Animate the new node
    await new Promise(resolve => setTimeout(resolve, 1000 / speed));
    
    const finalNodes = [...updatedNodes];
    finalNodes[finalNodes.length - 1].status = 'default';
    setNodes(finalNodes);
    setIsAnimating(false);
  };

  // Handle removing from head
  const handleRemoveFromHead = async () => {
    if (head === null || isAnimating) return;
    
    setIsAnimating(true);
    
    const updatedNodes = [...nodes];
    updatedNodes[head].status = 'deleted';
    setNodes(updatedNodes);
    
    await new Promise(resolve => setTimeout(resolve, 1000 / speed));
    
    const newHead = updatedNodes[head].next;
    
    if (newHead !== null) {
      // If it's a doubly linked list, update prev pointer
      if (listType === 'doubly') {
        const nextNode = updatedNodes[newHead] as DoublyLinkedListNode;
        if ('prev' in nextNode) {
          nextNode.prev = null;
        }
      }
      
      // Remove the head
      const remainingNodes = updatedNodes.filter((_, idx) => idx !== head);
      
      // Adjust indices in next and prev pointers
      const adjustedNodes = remainingNodes.map((node) => {
        const adjustedNode = { ...node };
        if (adjustedNode.next !== null) adjustedNode.next = adjustedNode.next > head ? adjustedNode.next - 1 : adjustedNode.next;
        if ('prev' in adjustedNode && adjustedNode.prev !== null) {
          adjustedNode.prev = adjustedNode.prev > head ? adjustedNode.prev - 1 : adjustedNode.prev;
        }
        return adjustedNode;
      });
      
      // If it's a circular list, update the tail's next pointer
      if (listType === 'circular' && tail !== null) {
        const newTail = tail > head ? tail - 1 : tail;
        adjustedNodes[newTail].next = 0;
      }
      
      setNodes(adjustedNodes);
      setHead(0);
      setTail(tail !== null && tail > head ? tail - 1 : (tail === head ? null : tail));
    } else {
      // The list is empty after removal
      setNodes([]);
      setHead(null);
      setTail(null);
    }
    
    setIsAnimating(false);
  };

  // Handle removing from tail
  const handleRemoveFromTail = async () => {
    if (tail === null || isAnimating) return;
    
    setIsAnimating(true);
    
    const updatedNodes = [...nodes];
    updatedNodes[tail].status = 'deleted';
    setNodes(updatedNodes);
    
    await new Promise(resolve => setTimeout(resolve, 1000 / speed));
    
    if (head === tail) {
      // Only one node in the list
      setNodes([]);
      setHead(null);
      setTail(null);
    } else {
      // Find the new tail
      let newTail = null;
      for (let i = 0; i < nodes.length; i++) {
        if (i !== tail && nodes[i].next === tail) {
          newTail = i;
          break;
        }
      }
      
      const remainingNodes = updatedNodes.filter((_, idx) => idx !== tail);
      
      // Update the new tail's next pointer
      if (newTail !== null) {
        if (listType === 'singly' || listType === 'doubly') {
          remainingNodes[newTail].next = null;
        } else if (listType === 'circular') {
          remainingNodes[newTail].next = head;
        }
      }
      
      setNodes(remainingNodes);
      setTail(newTail);
    }
    
    setIsAnimating(false);
  };

  // Visualization controls handlers
  const handlePlay = useCallback(() => {
    setVisualizationState(prev => ({...prev, isPlaying: true}));
  }, []);

  const handlePause = useCallback(() => {
    setVisualizationState(prev => ({...prev, isPlaying: false}));
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleStep = useCallback((_forward: boolean) => {
    // In a linked list, we don't have steps to navigate through
    // This would be used for traversal algorithms
  }, []);

  const handleSpeedChange = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
    setVisualizationState(prev => ({...prev, speed: newSpeed}));
  }, []);

  // Handle node click from D3 visualization
  const handleNodeClick = useCallback((index: number) => {
    setSelectedNode(index === selectedNode ? null : index);
  }, [selectedNode]);

  return (
    <BaseVisualizer title={`${listType.charAt(0).toUpperCase() + listType.slice(1)} Linked List`}>
      <div className="flex flex-col h-full">
        {/* Type selector */}
        <div className="mb-6">
          <Tabs value={listType} onValueChange={(value) => setListType(value as LinkedListType)}>
            <TabsList className="grid w-full grid-cols-3 mt-2 mb-[-15px] gap-2">
              <TabsTrigger value="singly" className="cursor-pointer border">Singly</TabsTrigger>
              <TabsTrigger value="doubly" className="cursor-pointer border">Doubly</TabsTrigger>
              <TabsTrigger value="circular" className="cursor-pointer border">Circular</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Controls */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Operations</CardTitle>
            <CardDescription>Add or remove nodes from the linked list</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:flex-wrap sm:gap-4">
              {/* Node value input - full width on mobile */}
              <div className="flex flex-col w-full sm:w-auto">
                <Label htmlFor="newNodeValue" className="mb-2">Node Value</Label>
                <Input
                  id="newNodeValue"
                  type="number"
                  value={newNodeValue}
                  onChange={(e) => setNewNodeValue(e.target.value)}
                  placeholder="Enter value"
                  className="w-full sm:w-[190px]"
                />
              </div>
              
              {/* Add operations - stack on mobile, side by side on desktop */}
              <div className="grid grid-cols-1 sm:mt-7 sm:grid-cols-2 gap-2 w-full sm:w-auto">
                <Button onClick={handleAddToHead} disabled={isAnimating || !newNodeValue} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Head
                </Button>
                <Button onClick={handleAddToTail} disabled={isAnimating || !newNodeValue} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Tail
                </Button>
              </div>
                            
              {/* Remove operations - stack on mobile, side by side on desktop */}
              <div className="grid grid-cols-1 sm:mt-7 sm:grid-cols-3 gap-2 w-full sm:w-auto">
                <Button onClick={handleRemoveFromHead} disabled={isAnimating || head === null} className="w-full">
                  <X className="h-4 w-4 mr-2" />
                  Remove Head
                </Button>
                <Button onClick={handleRemoveFromTail} disabled={isAnimating || tail === null} className="w-full">
                  <X className="h-4 w-4 mr-2" />
                  Remove Tail
                </Button>
                <Button onClick={resetList} variant="outline" className="w-full">
                  <RotateCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Visualization */}
        <Card className="flex-grow overflow-hidden">
          <CardContent className="p-2 sm:p-6 h-full relative">
            <div className="w-full h-full">
              {/* D3 Visualization */}
              <D3LinkedListVisualizer 
                nodes={nodes}
                head={head}
                tail={tail}
                selectedNode={selectedNode}
                type={listType}
                height={300}
                onNodeClick={handleNodeClick}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Animation speed control */}
        <div className="mt-4">
          <VisualizationControls 
            state={visualizationState}
            onPlay={handlePlay}
            onPause={handlePause}
            onReset={resetList}
            onStep={handleStep}
            onSpeedChange={handleSpeedChange}
          />
        </div>
      </div>
    </BaseVisualizer>
  );
} 