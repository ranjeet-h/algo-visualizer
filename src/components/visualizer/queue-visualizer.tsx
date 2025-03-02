import { useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Plus, Minus, RotateCw, Eye } from 'lucide-react';
import { BaseVisualizer } from './base-visualizer';
import { VisualizationControls } from './visualization-controls';
import { D3StackQueueVisualizer, StackQueueItem } from './d3-stack-queue-visualizer';

export function QueueVisualizer() {
  // Queue state
  const [queue, setQueue] = useState<StackQueueItem[]>([
    { value: 10, status: 'default' },
    { value: 20, status: 'default' },
    { value: 30, status: 'default' },
  ]);
  const [newItemValue, setNewItemValue] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [animationInProgress, setAnimationInProgress] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  
  // Visualization state for controls
  const [visualizationState, setVisualizationState] = useState({
    isPlaying: false,
    isCompleted: false,
    currentStep: 0,
    totalSteps: 0,
    speed: 1,
    data: [],
    algorithmName: 'Queue',
    algorithmType: 'data-structure',
  });
  
  // Reset queue to initial state
  const resetQueue = useCallback(() => {
    setQueue([
      { value: 10, status: 'default' },
      { value: 20, status: 'default' },
      { value: 30, status: 'default' },
    ]);
    setSelectedItem(null);
    setNewItemValue('');
    setAnimationInProgress(false);
  }, []);
  
  // Enqueue operation - add item to back of queue
  const handleEnqueue = async () => {
    if (!newItemValue || animationInProgress) return;
    
    setAnimationInProgress(true);
    const value = parseInt(newItemValue);
    
    // Create new item with 'pushing' animation status
    const newItem: StackQueueItem = { value, status: 'pushing' };
    
    // Add to back of queue (end of array)
    setQueue([...queue, newItem]);
    setNewItemValue('');
    
    // Animate the enqueue operation
    await new Promise(resolve => setTimeout(resolve, 1000 / speed));
    
    // Update status to default after animation
    setQueue(prev => {
      const updated = [...prev];
      if (updated.length) {
        updated[updated.length - 1] = { ...updated[updated.length - 1], status: 'default' };
      }
      return updated;
    });
    
    setAnimationInProgress(false);
  };
  
  // Dequeue operation - remove item from front of queue
  const handleDequeue = async () => {
    if (!queue.length || animationInProgress) return;
    
    setAnimationInProgress(true);
    
    // Mark the front item as 'popping' for animation
    setQueue(prev => {
      const updated = [...prev];
      if (updated.length) {
        updated[0] = { ...updated[0], status: 'popping' };
      }
      return updated;
    });
    
    // Animate the dequeue operation
    await new Promise(resolve => setTimeout(resolve, 1000 / speed));
    
    // Remove the front item
    setQueue(prev => prev.slice(1));
    setSelectedItem(null);
    
    setAnimationInProgress(false);
  };
  
  // Peek operation - highlight front item
  const handlePeek = async () => {
    if (!queue.length || animationInProgress) return;
    
    setAnimationInProgress(true);
    
    // Set the front item as 'active' to highlight it
    setQueue(prev => {
      const updated = [...prev];
      if (updated.length) {
        // First reset any existing active items
        const resetItems = updated.map(item => 
          item.status === 'active' ? { ...item, status: 'default' as const } : item
        );
        
        // Then set the front item to active
        resetItems[0] = { 
          ...resetItems[0], 
          status: 'active' as const 
        };
        
        return resetItems;
      }
      return prev;
    });
    
    // Animate the peek operation
    await new Promise(resolve => setTimeout(resolve, 1500 / speed));
    
    // Reset the item status
    setQueue(prev => {
      const updated = [...prev];
      if (updated.length) {
        updated[0] = { 
          ...updated[0], 
          status: 'default' 
        };
      }
      return updated;
    });
    
    setAnimationInProgress(false);
  };
  
  // Handle item selection
  const handleItemClick = useCallback((index: number) => {
    if (animationInProgress) return;
    setSelectedItem(prevSelected => prevSelected === index ? null : index);
  }, [animationInProgress]);
  
  // Visualization control handlers
  const handlePlay = useCallback(() => {
    setVisualizationState(prev => ({...prev, isPlaying: true}));
  }, []);

  const handlePause = useCallback(() => {
    setVisualizationState(prev => ({...prev, isPlaying: false}));
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleStep = useCallback((_forward: boolean) => {
    // In a queue, we don't have steps to navigate through
    // This would be used for algorithm visualization
  }, []);

  const handleSpeedChange = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
    setVisualizationState(prev => ({...prev, speed: newSpeed}));
  }, []);
  
  return (
    <BaseVisualizer 
      title="Queue" 
      description="First-In-First-Out (FIFO) data structure"
      timeComplexity="O(1)"
      spaceComplexity="O(n)"
    >
      <div className="flex flex-col h-full">
        {/* Queue Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Queue Operations</CardTitle>
            <CardDescription>
              Add or remove items from the queue. 
              Remember: First In, First Out (FIFO)!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex flex-col gap-2">
                <Label htmlFor="newItemValue">Value</Label>
                <Input
                  id="newItemValue"
                  type="number"
                  value={newItemValue}
                  onChange={(e) => setNewItemValue(e.target.value)}
                  placeholder="Enter value"
                  className="w-24"
                  disabled={animationInProgress}
                />
              </div>
              
              <Button 
                onClick={handleEnqueue} 
                disabled={animationInProgress || !newItemValue}
                className="flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Enqueue
              </Button>
              
              <Button 
                onClick={handleDequeue} 
                disabled={animationInProgress || !queue.length}
                variant="secondary"
                className="flex items-center"
              >
                <Minus className="h-4 w-4 mr-2" />
                Dequeue
              </Button>
              
              <Button 
                onClick={handlePeek} 
                disabled={animationInProgress || !queue.length}
                variant="outline"
                className="flex items-center"
              >
                <Eye className="h-4 w-4 mr-2" />
                Peek Front
              </Button>
              
              <Button 
                onClick={resetQueue} 
                disabled={animationInProgress}
                variant="outline"
                className="flex items-center ml-auto"
              >
                <RotateCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Queue Visualization */}
        <Card className="flex-grow overflow-hidden">
          <CardContent className="p-6 h-full relative">
            <div className="w-full h-full">
              <D3StackQueueVisualizer 
                items={queue}
                type="queue"
                height={400}
                onItemClick={handleItemClick}
                selectedItem={selectedItem}
                animationInProgress={animationInProgress}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Animation Controls */}
        <div className="mt-4">
          <VisualizationControls 
            state={visualizationState}
            onPlay={handlePlay}
            onPause={handlePause}
            onReset={resetQueue}
            onStep={handleStep}
            onSpeedChange={handleSpeedChange}
          />
        </div>
      </div>
    </BaseVisualizer>
  );
} 