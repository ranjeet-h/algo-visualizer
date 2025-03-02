import { useState, useCallback, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { RotateCw, Plus, Search, X, Hash, AlertTriangle } from 'lucide-react';
import { BaseVisualizer } from './base-visualizer';
import { VisualizationControls } from './visualization-controls';
import { D3HashVisualizer } from './d3-hash-visualizer';

// Extended hash table entry with custom statuses
interface HashTableEntry {
  key: string;
  value: string | number | boolean | null;
  status?: 'default' | 'active' | 'collision' | 'processing' | 'deleted';
}

type HashTableType = 'map' | 'set';

interface HashVisualizerProps {
  type?: HashTableType;
  bucketSize?: number;
}

export function HashVisualizer({ type = 'map', bucketSize = 8 }: HashVisualizerProps) {
  // State for the hash table
  const [hashType, setHashType] = useState<HashTableType>(type);
  const [entries, setEntries] = useState<HashTableEntry[]>([]);
  const [buckets, setBuckets] = useState<HashTableEntry[][]>([]);
  const [newKey, setNewKey] = useState<string>('');
  const [newValue, setNewValue] = useState<string>('');
  const [searchKey, setSearchKey] = useState<string>('');
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [visualStyle, setVisualStyle] = useState<'table' | 'buckets'>('buckets');
  const [colorTheme] = useState<'default' | 'rainbow' | 'gradient'>('default');
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
    algorithmName: `Hash ${hashType === 'map' ? 'Map' : 'Set'}`,
    algorithmType: 'data-structure',
  });
  
  // Initialize with some data
  useEffect(() => {
    resetHashTable();
    
    // Update the visualization state's algorithm name when hash type changes
    setVisualizationState(prev => ({
      ...prev,
      algorithmName: `Hash ${hashType === 'map' ? 'Map' : 'Set'}`
    }));
  }, [hashType]);

  // Simple hash function for demonstration
  const hashFunction = useCallback((key: string): number => {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash + key.charCodeAt(i) * (i + 1)) % bucketSize;
    }
    return hash;
  }, [bucketSize]);

  // Reset the hash table with initial values
  const resetHashTable = useCallback(() => {
    // Create empty buckets
    const newBuckets: HashTableEntry[][] = Array(bucketSize).fill(null).map(() => []);
    
    // Add some initial data
    const initialData: [string, string | number][] = [
      ['name', 'John'],
      ['age', 25],
      ['city', 'New York'],
      ['country', 'USA'],
      ['job', 'Developer'],
    ];
    
    const newEntries: HashTableEntry[] = [];
    
    initialData.forEach(([key, value]) => {
      const entry: HashTableEntry = { 
        key, 
        value, 
        status: 'default'
      };
      
      const bucketIndex = hashFunction(key);
      newBuckets[bucketIndex].push(entry);
      
      // Mark as collision if bucket already has items
      if (newBuckets[bucketIndex].length > 1) {
        newBuckets[bucketIndex].forEach(item => {
          item.status = 'collision';
        });
      }
      
      newEntries.push(entry);
    });
    
    setBuckets(newBuckets);
    setEntries(newEntries);
    setNewKey('');
    setNewValue('');
    setSearchKey('');
    setSelectedEntry(null);
    setIsAnimating(false);
  }, [hashFunction, bucketSize]);

  // Handle adding a new entry
  const handleAddEntry = async () => {
    if (!newKey || (hashType === 'map' && !newValue) || isAnimating) return;
    
    // Check if key already exists
    if (entries.some(entry => entry.key === newKey)) {
      alert(`The key "${newKey}" already exists in the hash table.`);
      return;
    }
    
    setIsAnimating(true);
    
    // Create new entry
    const newEntry: HashTableEntry = {
      key: newKey,
      value: hashType === 'map' ? newValue : true,
      status: 'active'
    };
    
    // Calculate hash and add to appropriate bucket
    const bucketIndex = hashFunction(newKey);
    
    // Clone buckets and update
    const updatedBuckets = [...buckets];
    
    // Add entry to bucket
    updatedBuckets[bucketIndex] = [...updatedBuckets[bucketIndex], newEntry];
    
    // Mark as collision if bucket already has items
    if (updatedBuckets[bucketIndex].length > 1) {
      updatedBuckets[bucketIndex].forEach(item => {
        item.status = 'collision';
      });
    }
    
    setBuckets(updatedBuckets);
    setEntries([...entries, newEntry]);
    setSelectedEntry(newKey);
    setNewKey('');
    setNewValue('');
    
    // Animate the new entry
    await new Promise(resolve => setTimeout(resolve, 1000 / speed));
    
    // Reset the status after animation
    const finalBuckets = [...updatedBuckets];
    finalBuckets[bucketIndex] = finalBuckets[bucketIndex].map(item => ({
      ...item,
      status: finalBuckets[bucketIndex].length > 1 ? 'collision' : 'default'
    }));
    
    setBuckets(finalBuckets);
    setIsAnimating(false);
  };

  // Handle removing an entry
  const handleRemoveEntry = async (keyToRemove: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // Find the entry
    const entryIndex = entries.findIndex(entry => entry.key === keyToRemove);
    if (entryIndex === -1) {
      setIsAnimating(false);
      return;
    }
    
    // Calculate bucket index
    const bucketIndex = hashFunction(keyToRemove);
    
    // Clone buckets and entries
    const updatedBuckets = [...buckets];
    const updatedEntries = [...entries];
    
    // Mark entry for removal animation
    const entryInBucketIndex = updatedBuckets[bucketIndex].findIndex(entry => entry.key === keyToRemove);
    if (entryInBucketIndex !== -1) {
      updatedBuckets[bucketIndex][entryInBucketIndex].status = 'deleted';
      updatedEntries[entryIndex].status = 'deleted';
    }
    
    setBuckets(updatedBuckets);
    setEntries(updatedEntries);
    
    // Animate the removal
    await new Promise(resolve => setTimeout(resolve, 1000 / speed));
    
    // Remove entry from bucket and entries list
    updatedBuckets[bucketIndex] = updatedBuckets[bucketIndex].filter(entry => entry.key !== keyToRemove);
    
    // Update collision status for remaining items in bucket
    if (updatedBuckets[bucketIndex].length <= 1) {
      updatedBuckets[bucketIndex].forEach(item => {
        item.status = 'default';
      });
    }
    
    const finalEntries = updatedEntries.filter(entry => entry.key !== keyToRemove);
    
    setBuckets(updatedBuckets);
    setEntries(finalEntries);
    setSelectedEntry(null);
    setIsAnimating(false);
  };

  // Handle searching for an entry
  const handleSearch = async () => {
    if (!searchKey || isAnimating) return;
    
    setIsAnimating(true);
    
    // Calculate bucket index
    const bucketIndex = hashFunction(searchKey);
    
    // Clone buckets
    const updatedBuckets = [...buckets];
    
    // Reset all entries to default/collision status
    updatedBuckets.forEach(bucket => {
      bucket.forEach(entry => {
        entry.status = bucket.length > 1 ? 'collision' : 'default';
      });
    });
    
    // Highlight the bucket
    updatedBuckets[bucketIndex] = updatedBuckets[bucketIndex].map(entry => ({
      ...entry,
      status: 'active'
    }));
    
    setBuckets(updatedBuckets);
    
    // Animate the search
    await new Promise(resolve => setTimeout(resolve, 1000 / speed));
    
    // Find the entry in the bucket
    const foundEntryIndex = updatedBuckets[bucketIndex].findIndex(entry => entry.key === searchKey);
    
    if (foundEntryIndex !== -1) {
      // Entry found - keep it active, reset others
      updatedBuckets[bucketIndex] = updatedBuckets[bucketIndex].map((entry, idx) => ({
        ...entry,
        status: idx === foundEntryIndex ? 'active' : (updatedBuckets[bucketIndex].length > 1 ? 'collision' : 'default')
      }));
      
      setSelectedEntry(searchKey);
      alert(`Found entry with key "${searchKey}" in bucket ${bucketIndex}.`);
    } else {
      // Entry not found - reset all to default
      updatedBuckets[bucketIndex] = updatedBuckets[bucketIndex].map(entry => ({
        ...entry,
        status: updatedBuckets[bucketIndex].length > 1 ? 'collision' : 'default'
      }));
      
      alert(`No entry with key "${searchKey}" found in the hash table.`);
    }
    
    setBuckets(updatedBuckets);
    setIsAnimating(false);
  };

  // Handle entry click from visualization
  const handleEntryClick = useCallback((key: string) => {
    setSelectedEntry(prevSelected => prevSelected === key ? null : key);
    
    // Find the entry
    const entry = entries.find(e => e.key === key);
    if (entry) {
      alert(hashType === 'map' 
        ? `Key: ${entry.key}, Value: ${entry.value}` 
        : `Key: ${entry.key}`
      );
    }
  }, [entries, hashType]);

  // Visualization controls handlers
  const handlePlay = useCallback(() => {
    setVisualizationState(prev => ({...prev, isPlaying: true}));
  }, []);

  const handlePause = useCallback(() => {
    setVisualizationState(prev => ({...prev, isPlaying: false}));
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleStep = useCallback((_forward: boolean) => {
    // In a hash table, we don't have steps to navigate through
    // This would be used for traversal algorithms
  }, []);

  const handleSpeedChange = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
    setVisualizationState(prev => ({...prev, speed: newSpeed}));
  }, []);

  return (
    <BaseVisualizer title={`Hash ${hashType === 'map' ? 'Map' : 'Set'}`}>
      <div className="flex flex-col h-full">
        {/* Type selector */}
        <div className="mb-6">
          <Tabs value={hashType} onValueChange={(value) => setHashType(value as HashTableType)}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="map">Hash Map</TabsTrigger>
              <TabsTrigger value="set">Hash Set</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Operations</CardTitle>
            <CardDescription>Add, remove, or search for entries in the hash table</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-end gap-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="newKey">Key</Label>
                  <Input
                    id="newKey"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="Enter key"
                    className="w-32"
                  />
                </div>
                
                {hashType === 'map' && (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="newValue">Value</Label>
                    <Input
                      id="newValue"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      placeholder="Enter value"
                      className="w-32"
                    />
                  </div>
                )}
                
                <Button 
                  onClick={handleAddEntry} 
                  disabled={isAnimating || !newKey || (hashType === 'map' && !newValue)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </Button>
              </div>
              
              <Separator orientation="vertical" className="h-10" />
              
              <div className="flex items-end gap-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="searchKey">Search Key</Label>
                  <Input
                    id="searchKey"
                    value={searchKey}
                    onChange={(e) => setSearchKey(e.target.value)}
                    placeholder="Enter key"
                    className="w-32"
                  />
                </div>
                
                <Button 
                  onClick={handleSearch} 
                  disabled={isAnimating || !searchKey}
                  variant="secondary"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                
                <Button 
                  onClick={() => selectedEntry && handleRemoveEntry(selectedEntry)} 
                  disabled={isAnimating || !selectedEntry}
                  variant="destructive"
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove Selected
                </Button>
                
                <Button onClick={resetHashTable} variant="outline">
                  <RotateCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Visualization Style */}
        <div className="mb-6">
          <Tabs value={visualStyle} onValueChange={(value) => setVisualStyle(value as 'table' | 'buckets')}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="buckets">Bucket View</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Visualization */}
        <Card className="flex-grow overflow-hidden">
          <CardContent className="p-6 h-full relative">
            {/* Hash Function Info */}
            <div className="mb-4 p-2 bg-muted rounded-md flex items-center">
              <Hash className="h-4 w-4 mr-2 text-primary" />
              <span className="text-sm text-muted-foreground">
                Hash function: <code className="bg-background px-1 py-0.5 rounded">h(key) = sum(key.charCode(i) * (i+1)) % {bucketSize}</code>
              </span>
              
              {entries.some(entry => {
                const index = hashFunction(entry.key);
                return buckets[index].length > 1;
              }) && (
                <div className="ml-auto flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1 text-orange-500" />
                  <span className="text-xs text-orange-500">Collisions detected</span>
                </div>
              )}
            </div>
            
            <div className="w-full h-full">
              {/* D3 Visualization */}
              <D3HashVisualizer 
                entries={entries as any}
                buckets={buckets as any}
                height={380}
                showCollisions={true}
                onEntryClick={handleEntryClick}
                visualStyle={visualStyle}
                colorTheme={colorTheme}
                showAnimation={true}
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
            onReset={resetHashTable}
            onStep={handleStep}
            onSpeedChange={handleSpeedChange}
          />
        </div>
      </div>
    </BaseVisualizer>
  );
}