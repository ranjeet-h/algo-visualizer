import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { cn } from '../../lib/utils';

interface BaseVisualizerProps {
  title?: string;
  description?: string;
  controls?: ReactNode;
  sidebar?: ReactNode;
  children: ReactNode;
  timeComplexity?: string;
  spaceComplexity?: string;
}

export function BaseVisualizer({
  controls,
  sidebar,
  children,
  timeComplexity = "O(n log n)",
  spaceComplexity = "O(n)"
}: BaseVisualizerProps) {

  const [activeTab, setActiveTab] = useState<'visualization' | 'information'>('visualization');
  const [isConfigCollapsed, setConfigCollapsed] = useState(true);

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      {/* Main Content */}
      <div className={cn(
        "flex flex-col gap-4 items-start w-full"
      )}>
        {/* Visualization Section */}
        <motion.div 
          className="bg-card rounded-xl border border-border shadow-sm w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Tabs 
            value={activeTab} 
            onValueChange={(v) => setActiveTab(v as 'visualization' | 'information')}
            className="w-full"
          >
            <div className="border-b border-border px-4">
              <TabsList className="w-full justify-start h-12 bg-transparent p-0">
                <TabsTrigger 
                  value="visualization"
                  className={cn(
                    "cursor-pointer rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-12",
                    "text-muted-foreground data-[state=active]:text-foreground"
                  )}
                >
                  Visualization
                </TabsTrigger>
                <TabsTrigger 
                  value="information"
                  className={cn(
                    "cursor-pointer rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-12",
                    "text-muted-foreground data-[state=active]:text-foreground"
                  )}
                >
                  Information
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="visualization" className="p-0 m-0">
              {/* Configuration Section - Collapsible, now at the top */}
              {sidebar && (
                <div className="px-6 pt-6">
                  <div className="w-full mb-6">
                    <button
                      onClick={() => setConfigCollapsed(!isConfigCollapsed)}
                      className="flex items-center justify-between w-full p-4 bg-muted rounded-lg mb-4 text-left border cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <Settings size={12} />
                        </span>
                        <h3 className="text-lg font-semibold">Configuration</h3>
                        <p className="text-sm text-muted-foreground">Click to configure the visualization parameters</p>
                      </div>
                      <div>
                        {isConfigCollapsed ? 
                          <ChevronDown className="h-5 w-5 text-muted-foreground" /> : 
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        }
                      </div>
                    </button>
                    
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ 
                        height: isConfigCollapsed ? 0 : "auto",
                        opacity: isConfigCollapsed ? 0 : 1
                      }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "overflow-hidden",
                        isConfigCollapsed && "pointer-events-none"
                      )}
                    >
                      <div className="bg-card p-4 border border-border rounded-lg">
                        {sidebar}
                      </div>
                    </motion.div>
                  </div>
                  
                  {!isConfigCollapsed && <Separator className="mb-6" />}
                </div>
              )}

              {/* Main Visualization Content */}
              <div className="p-6 pt-0 min-h-[400px]">
                {children}
              </div>

              {/* Controls Section */}
              {controls && (
                <div className="p-6 pt-0">
                  <Separator className="mb-6" />
                  {controls}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="information" className="m-0">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">About this visualization</h3>
                <p className="text-muted-foreground mb-4">
                  This visualization helps you understand how arrays work and how different algorithms operate on them.
                  Use the controls to manipulate the visualization and observe the changes in real-time.
                </p>
                
                <h4 className="text-lg font-medium mb-2 mt-6">How to use</h4>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  <li>Use the configuration section to adjust visualization parameters</li>
                  <li>Use the playback controls to step through the algorithm</li>
                  <li>Adjust the speed slider to control how fast the animation runs</li>
                  <li>Try different array sizes and values to see how the algorithm behaves</li>
                </ul>
                
                <h4 className="text-lg font-medium mb-2 mt-6">Performance characteristics</h4>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-background p-4 rounded-lg border border-border">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Time Complexity</div>
                    <div className="text-lg font-semibold">{timeComplexity}</div>
                  </div>
                  <div className="bg-background p-4 rounded-lg border border-border">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Space Complexity</div>
                    <div className="text-lg font-semibold">{spaceComplexity}</div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
} 