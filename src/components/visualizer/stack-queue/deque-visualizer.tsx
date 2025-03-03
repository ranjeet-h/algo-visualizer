import { useState, useCallback } from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Minus, RotateCw, Eye, ArrowRight, ArrowLeft } from 'lucide-react';
import { BaseVisualizer } from '../common/base-visualizer';
import { VisualizationControls } from '../common/visualization-controls';
import { D3StackQueueVisualizer, StackQueueItem } from './d3/stack-queue-visualizer';
import { Button } from '@radix-ui/themes';

export function DequeVisualizer() {
  // Deque state
  const [deque, setDeque] = useState<StackQueueItem[]>([
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
    algorithmName: 'Deque',
    algorithmType: 'data-structure',
  });
  
  // Reset deque to initial state
  const resetDeque = useCallback(() => {
    setDeque([
      { value: 10, status: 'default' },
      { value: 20, status: 'default' },
      { value: 30, status: 'default' },
    ]);
    setSelectedItem(null);
    setNewItemValue('');
    setAnimationInProgress(false);
  }, []);
  
  // Add to Front operation
  const handleAddToFront = async () => {
    if (!newItemValue || animationInProgress) return;
    
    setAnimationInProgress(true);
    const value = parseInt(newItemValue);
    
    // Create new item with 'pushing' animation status
    const newItem: StackQueueItem = { value, status: 'pushing' };
    
    // Add to front of deque
    setDeque([newItem, ...deque]);
    setNewItemValue('');
    
    // Animate the operation
    await new Promise(resolve => setTimeout(resolve, 1000 / speed));
    
    // Update status to default after animation
    setDeque(prev => {
      const updated = [...prev];
      if (updated.length) {
        updated[0] = { ...updated[0], status: 'default' };
      }
      return updated;
    });
    
    setAnimationInProgress(false);
  };
  
  // Add to Back operation
  const handleAddToBack = async () => {
    if (!newItemValue || animationInProgress) return;
    
    setAnimationInProgress(true);
    const value = parseInt(newItemValue);
    
    // Create new item with 'pushing' animation status
    const newItem: StackQueueItem = { value, status: 'pushing' };
    
    // Add to back of deque
    setDeque([...deque, newItem]);
    setNewItemValue('');
    
    // Animate the operation
    await new Promise(resolve => setTimeout(resolve, 1000 / speed));
    
    // Update status to default after animation
    setDeque(prev => {
      const updated = [...prev];
      if (updated.length) {
        updated[updated.length - 1] = { ...updated[updated.length - 1], status: 'default' };
      }
      return updated;
    });
    
    setAnimationInProgress(false);
  };
  
  // Remove from Front operation
  const handleRemoveFromFront = async () => {
    if (!deque.length || animationInProgress) return;
    
    setAnimationInProgress(true);
    
    // Mark the front item as 'popping' for animation
    setDeque(prev => {
      const updated = [...prev];
      if (updated.length) {
        updated[0] = { ...updated[0], status: 'popping' };
      }
      return updated;
    });
    
    // Animate the operation
    await new Promise(resolve => setTimeout(resolve, 1000 / speed));
    
    // Remove the front item
    setDeque(prev => prev.slice(1));
    setSelectedItem(null);
    
    setAnimationInProgress(false);
  };
  
  // Remove from Back operation
  const handleRemoveFromBack = async () => {
    if (!deque.length || animationInProgress) return;
    
    setAnimationInProgress(true);
    
    // Mark the back item as 'popping' for animation
    setDeque(prev => {
      const updated = [...prev];
      if (updated.length) {
        updated[updated.length - 1] = { ...updated[updated.length - 1], status: 'popping' };
      }
      return updated;
    });
    
    // Animate the operation
    await new Promise(resolve => setTimeout(resolve, 1000 / speed));
    
    // Remove the back item
    setDeque(prev => prev.slice(0, -1));
    setSelectedItem(null);
    
    setAnimationInProgress(false);
  };
  
  // Peek Front operation
  const handlePeekFront = async () => {
    if (!deque.length || animationInProgress) return;
    
    setAnimationInProgress(true);
    
    // Set the front item as 'active' to highlight it
    setDeque(prev => {
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
    setDeque(prev => {
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
  
  // Peek Back operation
  const handlePeekBack = async () => {
    if (!deque.length || animationInProgress) return;
    
    setAnimationInProgress(true);
    
    // Set the back item as 'active' to highlight it
    setDeque(prev => {
      const updated = [...prev];
      if (updated.length) {
        // First reset any existing active items
        const resetItems = updated.map(item => 
          item.status === 'active' ? { ...item, status: 'default' as const } : item
        );
        
        // Then set the back item to active
        resetItems[resetItems.length - 1] = { 
          ...resetItems[resetItems.length - 1], 
          status: 'active' as const 
        };
        
        return resetItems;
      }
      return prev;
    });
    
    // Animate the peek operation
    await new Promise(resolve => setTimeout(resolve, 1500 / speed));
    
    // Reset the item status
    setDeque(prev => {
      const updated = [...prev];
      if (updated.length) {
        updated[updated.length - 1] = { 
          ...updated[updated.length - 1], 
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
    // In a deque, we don't have steps to navigate through
    // This would be used for algorithm visualization
  }, []);

  const handleSpeedChange = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
    setVisualizationState(prev => ({...prev, speed: newSpeed}));
  }, []);
  
  return (
    <BaseVisualizer 
      title="Deque" 
      description="Double-Ended Queue - supports insertion and removal from both ends"
      timeComplexity="O(1)"
      spaceComplexity="O(n)"
    >
      <div className="flex flex-col h-full">
        {/* Controls */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Operations</CardTitle>
            <CardDescription>
              Add or remove items from either end of the deque.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {/* Input for new value - full width on mobile */}
              <div className="flex flex-col gap-2 w-full">
                <Label htmlFor="newItemValue" className="mb-1">Value</Label>
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <Input
                    id="newItemValue"
                    type="number"
                    value={newItemValue}
                    onChange={(e) => setNewItemValue(e.target.value)}
                    placeholder="Enter value"
                    className="w-full sm:w-[190px]"
                    disabled={animationInProgress}
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                    <Button 
                      size="3"
                      variant="classic"
                      onClick={handleAddToFront} 
                      disabled={animationInProgress || !newItemValue}
                      className="w-full flex items-center justify-center"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Add to Front
                    </Button>
                    
                    <Button 
                      size="3"
                      variant="classic"
                      onClick={handleAddToBack} 
                      disabled={animationInProgress || !newItemValue}
                      className="w-full flex items-center justify-center"
                    >
                      Add to Back
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Operations - stacked on mobile, flex on desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap gap-2">
                <Button 
                  size="3"
                  onClick={handleRemoveFromFront} 
                  disabled={animationInProgress || !deque.length}
                  variant="classic"
                  className="w-full sm:w-auto flex items-center justify-center"
                >
                  <Minus className="h-4 w-4 mr-2" />
                  Remove Front
                </Button>
                
                <Button 
                  size="3"
                  onClick={handleRemoveFromBack} 
                  disabled={animationInProgress || !deque.length}
                  variant="classic"
                  className="w-full sm:w-auto flex items-center justify-center"
                >
                  <Minus className="h-4 w-4 mr-2" />
                  Remove Back
                </Button>
                
                <Button 
                  size="3"
                  onClick={handlePeekFront} 
                  disabled={animationInProgress || !deque.length}
                  variant="classic"
                  className="w-full sm:w-auto flex items-center justify-center"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Peek Front
                </Button>
                
                <Button 
                  size="3"
                  onClick={handlePeekBack} 
                  disabled={animationInProgress || !deque.length}
                  variant="classic"
                  className="w-full sm:w-auto flex items-center justify-center"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Peek Back
                </Button>
                
                <Button 
                  size="3"
                  onClick={resetDeque} 
                  disabled={animationInProgress}
                  variant="classic"
                  className="w-full sm:w-auto flex items-center justify-center md:ml-auto"
                >
                  <RotateCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Deque Visualization */}
        <Card className="flex-grow overflow-hidden">
          <CardContent className="p-2 sm:p-6 h-full relative">
            <div className="w-full h-full">
              <D3StackQueueVisualizer 
                items={deque}
                type="deque"
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
            onReset={resetDeque}
            onStep={handleStep}
            onSpeedChange={handleSpeedChange}
          />
        </div>
      </div>
    </BaseVisualizer>
  );
} 