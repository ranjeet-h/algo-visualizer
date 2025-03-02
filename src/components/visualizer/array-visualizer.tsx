/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useMemo, useRef } from 'react';
import { ArrayItem } from '../../types/visualizer';
import { VisualizationControls } from './visualization-controls';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';
import { Slider } from '../ui/slider';
import { Input } from '../ui/input';
import { 
  RefreshCw, 
  Shuffle, 
  Info, 
  Settings, 
  BarChart, 
  Palette,
  Network,
  Thermometer
} from 'lucide-react';
import { BaseVisualizer } from './base-visualizer';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Checkbox } from '../ui/checkbox';
import { D3ArrayVisualizer } from './d3-array-visualizer';

interface ArrayVisualizerProps {
  initialArray?: number[];
}

export function ArrayVisualizer({ initialArray = [5, 2, 8, 1, 9, 3, 7, 4, 6] }: ArrayVisualizerProps) {
  const [array, setArray] = useState<ArrayItem[]>(initialArray.map(value => ({ value, status: 'default' })));
  const [speed, setSpeed] = useState(1);
  const [arraySize, setArraySize] = useState(initialArray.length);
  const [visualStyle, setVisualStyle] = useState<'bars' | 'bubbles' | 'forcedGraph' | 'heatmap'>('bars');
  const [colorTheme, setColorTheme] = useState<'default' | 'rainbow' | 'gradient'>('default');
  const [useD3, setUseD3] = useState<boolean>(true);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('bubbleSort');
  
  // Algorithm state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  
  // References for animation
  const animationRef = useRef<number | null>(null);
  const stepsRef = useRef<Array<ArrayItem[]>>([]);
  
  // Algorithm definitions with complexity information
  const algorithms = useMemo(() => ({
    bubbleSort: {
      name: 'Bubble Sort',
      type: 'sorting',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)',
      description: 'A simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.'
    },
    selectionSort: {
      name: 'Selection Sort',
      type: 'sorting',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)',
      description: 'A sorting algorithm that divides the input list into two parts: a sorted sublist and an unsorted sublist, repeatedly finding the minimum element from the unsorted sublist and moving it to the sorted sublist.'
    },
    insertionSort: {
      name: 'Insertion Sort',
      type: 'sorting',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)',
      description: 'A simple sorting algorithm that builds the final sorted array one item at a time, efficiently for small data sets.'
    },
    mergeSort: {
      name: 'Merge Sort',
      type: 'sorting',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(n)',
      description: 'An efficient, stable, comparison-based, divide and conquer sorting algorithm, with guaranteed O(n log n) time complexity.'
    },
    quickSort: {
      name: 'Quick Sort',
      type: 'sorting',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(log n)',
      description: 'An efficient divide-and-conquer sorting algorithm that works by selecting a pivot element and partitioning the array around it.'
    }
  }), []);

  // Get current algorithm info
  const currentAlgorithm = algorithms[selectedAlgorithm as keyof typeof algorithms] || algorithms.bubbleSort;

  const generateRandomArray = useCallback((size: number) => {
    return Array.from({ length: size }, () => Math.floor(Math.random() * 50) + 1);
  }, []);

  const resetArray = useCallback(() => {
    const newArray: ArrayItem[] = generateRandomArray(arraySize).map(value => ({ value, status: 'default' }));
    setArray(newArray);
    setIsPlaying(false);
    setIsCompleted(false);
    setCurrentStep(0);
    setTotalSteps(0);
    stepsRef.current = [newArray];
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, [arraySize, generateRandomArray]);

  const handleSizeChange = useCallback((value: number) => {
    setArraySize(value);
    const newArray = generateRandomArray(value).map(value => ({ value, status: 'default' }));
    setArray(newArray as ArrayItem[]);
    setIsPlaying(false);
    setIsCompleted(false);
    setCurrentStep(0);
    setTotalSteps(0);
    stepsRef.current = [newArray as ArrayItem[]];
  }, [generateRandomArray]);

  const getColorByTheme = useCallback((index: number, value: number, maxValue: number) => {
    let percentage = 0;
    switch (colorTheme) {
      case 'rainbow':
        return `hsl(${(index / array.length) * 360}, 80%, 60%)`;
      case 'gradient':
        percentage = value / maxValue;
        return `hsl(${200 - percentage * 200}, 80%, ${50 + percentage * 20}%)`;
      default:
        return 'hsl(var(--primary))';
    }
  }, [array.length, colorTheme]);

  // For now, let's only implement bubble sort for demonstration
  const bubbleSort = useCallback(() => {
    const steps: Array<ArrayItem[]> = [];
    const copy: ArrayItem[] = array.map(item => ({
      value: item.value,
      status: 'default'
    }));
    steps.push([...copy]);
    
    const n = copy.length;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        // Highlight the elements being compared
        copy[j].status = 'comparing';
        copy[j + 1].status = 'comparing';
        steps.push(copy.map(item => ({...item})));
        
        if (copy[j].value > copy[j + 1].value) {
          // Swap elements
          copy[j].status = 'swapping';
          copy[j + 1].status = 'swapping';
          steps.push(copy.map(item => ({...item})));
          
          const temp = {...copy[j]};
          copy[j] = {...copy[j + 1]};
          copy[j + 1] = temp;
          steps.push(copy.map(item => ({...item})));
        }
        
        // Reset status of the compared elements
        copy[j].status = 'default';
        copy[j + 1].status = 'default';
      }
      
      // Mark the last element as sorted
      copy[n - i - 1].status = 'sorted';
      steps.push(copy.map(item => ({...item})));
    }
    
    // Mark all elements as sorted
    for (let i = 0; i < n; i++) {
      copy[i].status = 'sorted';
    }
    steps.push(copy.map(item => ({...item})));
    
    return steps;
  }, [array]);

  // Selection Sort implementation
  const selectionSort = useCallback(() => {
    const steps: Array<ArrayItem[]> = [];
    const copy: ArrayItem[] = array.map(item => ({
      value: item.value,
      status: 'default'
    }));
    steps.push([...copy]);
    
    const n = copy.length;
    for (let i = 0; i < n - 1; i++) {
      let minIndex = i;
      copy[i].status = 'comparing';
      steps.push(copy.map(item => ({...item})));
      
      for (let j = i + 1; j < n; j++) {
        copy[j].status = 'comparing';
        steps.push(copy.map(item => ({...item})));
        
        if (copy[j].value < copy[minIndex].value) {
          if (minIndex !== i) {
            copy[minIndex].status = 'default';
          }
          minIndex = j;
        } else {
          copy[j].status = 'default';
        }
        steps.push(copy.map(item => ({...item})));
      }
      
      // Swap elements if a smaller element was found
      if (minIndex !== i) {
        copy[i].status = 'swapping';
        copy[minIndex].status = 'swapping';
        steps.push(copy.map(item => ({...item})));
        
        const temp = {...copy[i]};
        copy[i] = {...copy[minIndex]};
        copy[minIndex] = temp;
        steps.push(copy.map(item => ({...item})));
      }
      
      copy[i].status = 'sorted';
      if (minIndex !== i) {
        copy[minIndex].status = 'default';
      }
      steps.push(copy.map(item => ({...item})));
    }
    
    // Mark the last element as sorted
    copy[n - 1].status = 'sorted';
    steps.push(copy.map(item => ({...item})));
    
    return steps;
  }, [array]);

  // Get the current sort algorithm based on selection
  const getCurrentSortAlgorithm = useCallback(() => {
    switch (selectedAlgorithm) {
      case 'selectionSort':
        return selectionSort;
      case 'insertionSort':
      case 'mergeSort': 
      case 'quickSort':
        // For demo, we'll use bubble sort for now
        // In a real implementation, you would add the actual algorithms
        return bubbleSort;
      case 'bubbleSort':
      default:
        return bubbleSort;
    }
  }, [selectedAlgorithm, bubbleSort, selectionSort]);

  const playVisualization = useCallback(() => {
    if (isPlaying || isCompleted) return;
    
    setIsPlaying(true);
    
    // Generate steps if not already generated
    if (stepsRef.current.length <= 1) {
      const sortAlgorithm = getCurrentSortAlgorithm();
      stepsRef.current = sortAlgorithm();
      setTotalSteps(stepsRef.current.length - 1);
    }
    
    let step = currentStep;
    const speedFactor = 500 / speed; // Adjust speed (lower is faster)
    
    const animate = () => {
      const timestamp = Date.now();
      
      if (!animationRef.current || timestamp - (animationRef.current as any) >= speedFactor) {
        if (step < stepsRef.current.length - 1) {
          step++;
          setCurrentStep(step);
          setArray(stepsRef.current[step]);
          animationRef.current = timestamp as any;
        } else {
          // Animation complete
          setIsCompleted(true);
          setIsPlaying(false);
          animationRef.current = null;
          return;
        }
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, [isPlaying, isCompleted, currentStep, getCurrentSortAlgorithm, speed]);

  const pauseVisualization = useCallback(() => {
    if (!isPlaying) return;
    
    setIsPlaying(false);
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, [isPlaying]);

  const stepVisualization = useCallback(() => {
    if (isCompleted || currentStep >= stepsRef.current.length - 1) return;
    
    // Generate steps if not already generated
    if (stepsRef.current.length <= 1) {
      const sortAlgorithm = getCurrentSortAlgorithm();
      stepsRef.current = sortAlgorithm();
      setTotalSteps(stepsRef.current.length - 1);
    }
    
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    setArray(stepsRef.current[nextStep]);
    
    if (nextStep === stepsRef.current.length - 1) {
      setIsCompleted(true);
    }
  }, [currentStep, getCurrentSortAlgorithm, isCompleted]);

  const resetVisualization = useCallback(() => {
    const newArray: ArrayItem[] = generateRandomArray(arraySize).map(value => ({
      value,
      status: 'default'
    }));
    setArray(newArray);
    setIsPlaying(false);
    setIsCompleted(false);
    setCurrentStep(0);
    setTotalSteps(0);
    stepsRef.current = [newArray];
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, [arraySize, generateRandomArray]);

  const renderArrayBars = useMemo(() => {
    const maxValue = Math.max(...array.map((item: ArrayItem) => Number(item.value)));
    
    if (useD3) {
      return (
        <div className="h-[300px] p-4">
          <D3ArrayVisualizer
            data={array}
            visualStyle={visualStyle}
            colorTheme={colorTheme}
            showAnimation={true}
            height={300}
          />
        </div>
      );
    }
    
    // Legacy non-D3 visualizations below
    if (visualStyle === 'bars') {
      return (
        <div className="flex items-end justify-center gap-2 h-[300px] p-4">
          {array.map((item, index) => (
            <TooltipProvider key={`${index}-${item.value}`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    className="flex flex-col items-center gap-2"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <motion.div
                      className="w-12 rounded-t-lg"
                      style={{
                        height: `${(Number(item.value) / maxValue) * 200}px`,
                        backgroundColor: getColorByTheme(index, Number(item.value), maxValue),
                      }}
                      whileHover={{ scale: 1.1 }}
                    />
                    <span className="text-sm font-medium">{item.value}</span>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Value: {item.value}</p>
                  <p>Index: {index}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      );
    }
    
    if (visualStyle === 'bubbles') {
      return (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
          {array.map((item, index) => (
            <motion.div
              key={`${index}-${item.value}`}
              className="relative aspect-square rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: getColorByTheme(index, Number(item.value), maxValue),
                fontSize: `${Math.max(16, Math.min(24, (Number(item.value) / maxValue) * 28))}px`,
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <Badge className="absolute top-2 right-2 text-xs">{index}</Badge>
              <span className="font-bold text-white drop-shadow-md">{item.value}</span>
            </motion.div>
          ))}
        </div>
      );
    }
    
    // Default to chart
    return (
      <div className="w-full h-[300px] p-4">
        <div className="relative w-full h-full flex items-end justify-between">
          {array.map((item, index) => (
            <TooltipProvider key={`${index}-${item.value}`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    className="relative flex-grow mx-1"
                    initial={{ height: 0 }}
                    animate={{ height: `${(Number(item.value) / maxValue) * 100}%` }}
                    transition={{ type: "spring", stiffness: 100, delay: index * 0.05 }}
                  >
                    <div 
                      className="absolute inset-0 rounded-t-md"
                      style={{ backgroundColor: getColorByTheme(index, Number(item.value), maxValue) }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 -mb-6 text-center text-xs">{item.value}</div>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Value: {item.value}</p>
                  <p>Index: {index}</p>
                  <p>Percentage: {Math.round((Number(item.value) / maxValue) * 100)}%</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
        <Separator className="mt-8" />
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>0</span>
          <span>{Math.floor(maxValue / 4)}</span>
          <span>{Math.floor(maxValue / 2)}</span>
          <span>{Math.floor(maxValue * 3 / 4)}</span>
          <span>{maxValue}</span>
        </div>
      </div>
    );
  }, [array, visualStyle, colorTheme, getColorByTheme, useD3]);

  const sidebarContent = (
    <div className="w-full space-y-6">
      <div>
        <h3 className="font-medium mb-3">Algorithm Selection</h3>
        <Tabs 
          defaultValue={selectedAlgorithm} 
          className="w-full" 
          onValueChange={(value) => {
            setSelectedAlgorithm(value);
            resetVisualization();
          }}
        >
          <TabsList className="grid grid-cols-3 mb-2">
            <TabsTrigger value="bubbleSort">Bubble</TabsTrigger>
            <TabsTrigger value="selectionSort">Selection</TabsTrigger>
            <TabsTrigger value="quickSort">Quick</TabsTrigger>
          </TabsList>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="insertionSort">Insertion</TabsTrigger>
            <TabsTrigger value="mergeSort">Merge</TabsTrigger>
          </TabsList>
          
          <p className="text-xs text-muted-foreground mb-4">
            {currentAlgorithm.description}
          </p>
        </Tabs>
      </div>
      
      <Card>
        <CardContent className="p-4 space-y-6">
          <Tabs defaultValue="array" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="array">Array</TabsTrigger>
              <TabsTrigger value="visual">Visual</TabsTrigger>
            </TabsList>
            
            <TabsContent value="array" className="space-y-4 mt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="array-size">Array Size</Label>
                  <Badge variant="outline">{arraySize}</Badge>
                </div>
                <Slider
                  id="array-size"
                  value={[arraySize]}
                  onValueChange={(value) => handleSizeChange(value[0])}
                  min={5}
                  max={25}
                  step={1}
                  className="w-full bg-gray-200"
                />
                <Progress value={(arraySize / 25) * 100} className="h-2" />
              </div>

              <div className="flex gap-2 max-w-md">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetArray}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setArray([...array].sort(() => Math.random() - 0.5).map(item => ({ ...item, status: 'default' })))}
                >
                  <Shuffle className="h-4 w-4 mr-2" />
                  Shuffle
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-array">Custom Array</Label>
                <Input
                  id="custom-array"
                  placeholder="e.g. 5,2,8,1,9"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const values = e.target.value.split(',').map(value => parseFloat(value)).filter((n: number) => !isNaN(n));
                    if (values.length > 0) {
                      setArray(values.map(value => ({ value, status: 'default' })));
                      setArraySize(values.length);
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">Enter comma-separated numbers</p>
              </div>
            </TabsContent>
            
            <TabsContent value="visual" className="space-y-4 mt-4">
              <div className="flex justify-between items-center mb-4">
                <Label>Visualization Engine</Label>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="d3-toggle" className="text-sm cursor-pointer">
                    {useD3 ? "D3.js (Advanced)" : "Basic"}
                  </Label>
                  <Checkbox
                    id="d3-toggle"
                    checked={useD3}
                    onCheckedChange={(checked) => setUseD3(checked as boolean)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Display Style</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant={visualStyle === 'bars' ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setVisualStyle('bars')}
                  >
                    <BarChart className="h-4 w-4 mr-2" />
                    Bars
                  </Button>
                  <Button 
                    variant={visualStyle === 'bubbles' ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setVisualStyle('bubbles')}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Bubbles
                  </Button>
                </div>
                
                {useD3 && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button 
                      variant={visualStyle === 'forcedGraph' ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setVisualStyle('forcedGraph')}
                    >
                      <Network className="h-4 w-4 mr-2" />
                      Network
                    </Button>
                    <Button 
                      variant={visualStyle === 'heatmap' ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setVisualStyle('heatmap')}
                    >
                      <Thermometer className="h-4 w-4 mr-2" />
                      Heatmap
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Color Theme</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant={colorTheme === 'default' ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setColorTheme('default')}
                  >
                    <Palette className="h-4 w-4 mr-2" />
                    Default
                  </Button>
                  <Button 
                    variant={colorTheme === 'rainbow' ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setColorTheme('rainbow')}
                  >
                    <Palette className="h-4 w-4 mr-2" />
                    Rainbow
                  </Button>
                  <Button 
                    variant={colorTheme === 'gradient' ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setColorTheme('gradient')}
                  >
                    <Palette className="h-4 w-4 mr-2" />
                    Gradient
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <BaseVisualizer
      sidebar={sidebarContent}
      controls={
        <VisualizationControls
          state={{
            isPlaying,
            isCompleted,
            currentStep,
            totalSteps,
            speed,
            data: array,
            algorithmName: currentAlgorithm.name,
            timeComplexity: currentAlgorithm.timeComplexity,
            spaceComplexity: currentAlgorithm.spaceComplexity,
            algorithmType: currentAlgorithm.type
          }}
          onPlay={playVisualization}
          onPause={pauseVisualization}
          onStep={stepVisualization}
          onReset={resetVisualization}
          onSpeedChange={setSpeed}
        />
      }
      timeComplexity={currentAlgorithm.timeComplexity}
      spaceComplexity={currentAlgorithm.spaceComplexity}
    >
      <Card className="w-full h-full">
        <CardHeader className="pb-0">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl flex items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Visualize array data with different display styles and color themes.</p>
                      {useD3 && <p className="text-xs text-muted-foreground mt-1">Powered by D3.js for advanced visualizations</p>}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
              <CardDescription>
                {array.length} items • {visualStyle} view • {colorTheme} theme
                {useD3 && <span> • <Badge variant="outline" className="ml-1">D3.js</Badge></span>}
                {isCompleted && <span> • <Badge variant="success" className="ml-1">Sorted!</Badge></span>}
                {isPlaying && <span> • <Badge variant="secondary" className="ml-1">Running...</Badge></span>}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <BarChart className="h-3 w-3" /> {Math.max(...array.map(item => Number(item.value)))}
              </Badge>
              {totalSteps > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Step {currentStep}/{totalSteps}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderArrayBars}
        </CardContent>
      </Card>
    </BaseVisualizer>
  );
} 