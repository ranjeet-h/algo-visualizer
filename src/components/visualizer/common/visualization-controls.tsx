import { useState, useEffect, useCallback, memo } from "react";
import { Pause, Play, RotateCcw, SkipBack, SkipForward, Clock, Info } from "lucide-react";
import { ArrayItem } from "../types/visualizer";
import { motion } from "framer-motion";
import { Badge } from "../../ui/badge";
import { Button, Slider } from "@radix-ui/themes";
import { Tooltip } from "react-tooltip";

// Simple debounce function
const debounce = <F extends (...args: any[]) => any>(
  func: F,
  wait: number
): ((...args: Parameters<F>) => void) =>
{
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<F>)
  {
    if (timeout)
    {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() =>
    {
      func(...args);
    }, wait);
  };
};

interface VisualizationControlsProps
{
  state: {
    isPlaying: boolean;
    isCompleted: boolean;
    currentStep: number;
    totalSteps: number;
    speed: number;
    data: ArrayItem[];
    // Added dynamic properties for algorithm/data structure context
    algorithmName?: string;
    timeComplexity?: string;
    spaceComplexity?: string;
    algorithmType?: "sorting" | "searching" | "graph" | "tree" | string;
    customControls?: {
      name: string;
      type: "toggle" | "slider" | "button";
      value: any;
      min?: number;
      max?: number;
      step?: number;
      onChange?: (value: any) => void;
    }[];
  };
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onStep: (forward: boolean) => void;
  onSpeedChange: (speed: number) => void;
}

export const VisualizationControls = memo(function VisualizationControls({
  state,
  onPlay,
  onPause,
  onReset,
  onStep,
  onSpeedChange,
}: VisualizationControlsProps)
{
  const {
    isPlaying,
    currentStep,
    totalSteps,
    speed,
    data,
    algorithmName = "Algorithm",
    timeComplexity,
    spaceComplexity,
    algorithmType,
    customControls
  } = state;

  // Maintain internal state for slider to prevent circular updates
  const [internalSpeed, setInternalSpeed] = useState(speed);

  // Update internal speed when prop changes
  useEffect(() =>
  {
    setInternalSpeed(speed);
  }, [speed]);

  // Memoized callbacks
  const handleStepBackward = useCallback(() => onStep(false), [onStep]);
  const handleStepForward = useCallback(() => onStep(true), [onStep]);

  // Debounced speed change handler
  const handleSpeedChange = useCallback(
    debounce((value: number[]) =>
    {
      const newSpeed = value[0];
      setInternalSpeed(newSpeed);
      onSpeedChange(newSpeed);
    }, 300),
    [onSpeedChange]
  );

  // Calculate progress percent
  const progressPercent = totalSteps ? (currentStep / totalSteps) * 100 : 0;

  // Dynamic colors based on algorithm type
  const getAlgorithmTypeColor = () =>
  {
    switch (algorithmType)
    {
      case "sorting": return "bg-blue-500/10 text-blue-500";
      case "searching": return "bg-green-500/10 text-green-500";
      case "graph": return "bg-purple-500/10 text-purple-500";
      case "tree": return "bg-amber-500/10 text-amber-500";
      default: return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <motion.div
      className="flex flex-col gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Algorithm info header */}
      {algorithmName && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium">{algorithmName}</h3>
            {algorithmType && (
              <Badge variant="outline" className={`text-xs px-2 py-0 h-5 ${getAlgorithmTypeColor()}`}>
                {algorithmType}
              </Badge>
            )}
          </div>

          {(timeComplexity || spaceComplexity) && (
            <>
              <Tooltip content={`${timeComplexity ? `Time: ${timeComplexity}` : ''} ${spaceComplexity ? `Space: ${spaceComplexity}` : ''}`} anchorSelect="visualization-button-info" />

              <Button id="visualization-button-info" variant="ghost" size="1" className="h-6 w-6 p-0 rounded-full">
                <Info className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      )}

      {/* Progress bar and step counter */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 bg-background rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          <motion.div
            className="absolute top-0 right-0 bottom-0 w-2 bg-primary/50 rounded-full"
            style={{ left: `${progressPercent}%` }}
            animate={{
              boxShadow: isPlaying
                ? ["0 0 0px 0px rgba(var(--primary), 0.3)", "0 0 5px 2px rgba(var(--primary), 0.3)"]
                : "0 0 0px 0px rgba(var(--primary), 0)"
            }}
            transition={{
              duration: 1,
              repeat: isPlaying ? Infinity : 0,
              repeatType: "reverse"
            }}
          />
        </div>

        <motion.div
          className="text-xs font-medium whitespace-nowrap"
          animate={{ scale: isPlaying ? [1, 1.05, 1] : 1 }}
          transition={{ duration: 1, repeat: isPlaying ? Infinity : 0 }}
        >
          <span className="text-foreground">{currentStep}</span>
          <span className="text-muted-foreground">/{totalSteps}</span>
        </motion.div>
      </div>

      {/* Controls container */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Playback controls */}
        <div className="flex gap-1 items-center bg-background rounded-lg p-2 shadow-sm">
          <Button
            size="1"
            variant="classic"
            onClick={onReset}
            disabled={isPlaying || data.length === 0}
            title="Reset"
            className="h-7 w-7 rounded-md"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="1"
            variant="classic"
            onClick={handleStepBackward}
            disabled={isPlaying || currentStep <= 0 || data.length === 0}
            title="Step backward"
            className="h-7 w-7 rounded-md"
          >
            <SkipBack className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="1"
            variant={isPlaying ? "ghost" : "classic"}
            onClick={isPlaying ? onPause : onPlay}
            disabled={data.length === 0}
            title={isPlaying ? "Pause" : "Play"}
            className={`h-7 w-7 rounded-md transition-all duration-200 ${isPlaying ? "" : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
          >
            <motion.div
              animate={{
                scale: isPlaying ? [1, 1.2, 1] : 1,
                rotate: isPlaying ? 0 : [0, -10, 0]
              }}
              transition={{
                duration: isPlaying ? 1 : 0.3,
                repeat: isPlaying ? Infinity : 0,
                ease: "easeInOut"
              }}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </motion.div>
          </Button>
          <Button
            size="1"
            variant="classic"
            onClick={handleStepForward}
            disabled={isPlaying || currentStep >= totalSteps || data.length === 0}
            title="Step forward"
            className="h-7 w-7 rounded-md"
          >
            <SkipForward className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Speed control */}
        <div className="flex items-center bg-background rounded-lg p-2 shadow-sm flex-1 min-w-[180px]">
          <div className="flex items-center gap-2 w-full">
            <motion.div
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{
                duration: 4,
                repeat: isPlaying ? Infinity : 0,
                ease: "linear"
              }}
              className="text-muted-foreground"
            >
              <Clock className="h-3.5 w-3.5" />
            </motion.div>

            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-muted-foreground mr-1">Speed</span>
              <Slider
                className="flex-1"
                value={[internalSpeed]}
                min={1}
                max={10}
                step={1}
                onValueChange={handleSpeedChange}
                disabled={isPlaying}
              />
              <span className="text-xs font-medium">{internalSpeed}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom algorithm-specific controls */}
      {customControls && customControls.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {customControls.map((control, index) => (
            <div key={index} className="flex items-center bg-background rounded-lg p-2 shadow-sm">
              <span className="text-xs text-muted-foreground mr-2">{control.name}</span>
              {control.type === 'slider' && (
                <Slider
                  className="w-[100px]"
                  value={[control.value]}
                  min={control.min || 0}
                  max={control.max || 10}
                  step={control.step || 1}
                  onValueChange={(value) => control.onChange && control.onChange(value[0])}
                  disabled={isPlaying}
                />
              )}
              {/* Other custom control types can be added here */}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}); 