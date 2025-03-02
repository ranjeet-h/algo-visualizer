import { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';

// Define item type for stack and queue operations
export interface StackQueueItem {
  value: number | string;
  status: 'default' | 'active' | 'pushing' | 'popping' | 'selected';
}

// D3 simulation node type
interface D3Node {
  id: number;
  value: number | string;
  status: string;
  isHead?: boolean;  // For queue operations - front of the queue
  isTail?: boolean;  // For queue operations - back of the queue
  isTop?: boolean;   // For stack operations - top of the stack
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface D3StackQueueVisualizerProps {
  items: StackQueueItem[];
  type: 'stack' | 'queue' | 'deque';
  height?: number;
  onItemClick?: (index: number) => void;
  selectedItem?: number | null;
  animationInProgress?: boolean;
}

export function D3StackQueueVisualizer({
  items,
  type,
  height = 300,
  onItemClick,
  selectedItem = null,
  animationInProgress = false,
}: D3StackQueueVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  // Setup resize observer to track container width changes
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Get initial width
    setContainerWidth(containerRef.current.clientWidth);
    
    // Create resize observer
    const resizeObserver = new ResizeObserver(entries => {
      if (!entries[0]) return;
      const { width } = entries[0].contentRect;
      setContainerWidth(width);
    });
    
    // Start observing
    resizeObserver.observe(containerRef.current);
    
    // Cleanup
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Get color based on node status
  const getItemColor = useCallback((status: string, isSelected: boolean): string => {
    if (isSelected) return '#FFD700'; // Gold for selected items
    
    switch (status) {
      case 'active':
        return '#3B82F6'; // Blue
      case 'pushing':
        return '#10B981'; // Green
      case 'popping':
        return '#EF4444'; // Red
      default:
        return '#6366F1'; // Indigo for default
    }
  }, []);

  // Convert data to D3 simulation data
  const prepareSimulationData = useCallback(() => {
    // Create D3 nodes
    const d3Nodes: D3Node[] = items.map((item, index) => {
      // For stack, top is the last item
      const isTop = type === 'stack' && index === items.length - 1;
      
      // For queue, head is the first item, tail is the last item
      const isHead = (type === 'queue' || type === 'deque') && index === 0;
      const isTail = (type === 'queue' || type === 'deque') && index === items.length - 1;
      
      return {
        id: index,
        value: item.value,
        status: item.status,
        isTop,
        isHead,
        isTail,
      };
    });

    return { nodes: d3Nodes };
  }, [items, type]);

  // Main visualization effect
  useEffect(() => {
    if (!svgRef.current || !items.length || containerWidth === 0) return;

    const width = containerWidth;
    const simulationData = prepareSimulationData();

    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    
    // Set viewBox to ensure the SVG scales properly
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create main group element
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add visualization type text
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', '#64748B')
      .text(`${type.charAt(0).toUpperCase() + type.slice(1)} Visualization`);

    // For stack visualization - vertical layout
    if (type === 'stack') {
      const boxWidth = Math.min(innerWidth, 200);
      const boxHeight = Math.min(50, innerHeight / (items.length + 1));
      const xPosition = innerWidth / 2 - boxWidth / 2;
      
      // Create container for the stack
      g.append('rect')
        .attr('x', xPosition)
        .attr('y', 10)
        .attr('width', boxWidth)
        .attr('height', innerHeight - 20)
        .attr('fill', 'none')
        .attr('stroke', '#E2E8F0')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .attr('rx', 5)
        .attr('ry', 5);
      
      // Add bottom platform for the stack
      g.append('rect')
        .attr('x', xPosition)
        .attr('y', innerHeight - 10)
        .attr('width', boxWidth)
        .attr('height', 10)
        .attr('fill', '#94A3B8')
        .attr('rx', 2)
        .attr('ry', 2);
      
      // Create a group for each item in the stack
      const itemGroups = g.selectAll<SVGGElement, D3Node>('.stack-item')
        .data(simulationData.nodes)
        .enter()
        .append('g')
        .attr('class', 'stack-item')
        .attr('cursor', 'pointer')
        .on('click', (event, d) => {
          if (onItemClick) {
            event.stopPropagation();
            onItemClick(d.id);
          }
        });
      
      // Calculate positions - stack grows from bottom to top
      simulationData.nodes.forEach((node, i) => {
        const reversedIndex = items.length - 1 - i;
        node.x = xPosition + boxWidth / 2;
        node.y = innerHeight - 20 - (reversedIndex + 1) * boxHeight - reversedIndex * 10;
      });
      
      // Add rectangles for items
      itemGroups.append('rect')
        .attr('x', d => d.x! - boxWidth / 2)
        .attr('y', d => d.y! - boxHeight / 2)
        .attr('width', boxWidth)
        .attr('height', boxHeight)
        .attr('fill', d => getItemColor(d.status, d.id === selectedItem))
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('opacity', d => animationInProgress && d.status === 'popping' ? 0.7 : 1);
      
      // Add animation for popping items
      itemGroups.filter(d => d.status === 'popping')
        .select('rect')
        .transition()
        .duration(1000)
        .attr('x', d => d.x! - boxWidth / 2 + 100)
        .attr('opacity', 0);
      
      // Add text for values
      itemGroups.append('text')
        .attr('x', d => d.x!)
        .attr('y', d => d.y!)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('fill', 'white')
        .text(d => d.value);
      
      // Add index indicators
      itemGroups.append('text')
        .attr('x', d => d.x! - boxWidth / 2 - 10)
        .attr('y', d => d.y!)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '12px')
        .attr('fill', '#64748B')
        .text((_, i) => items.length - 1 - i);
      
      // Add top indicator
      itemGroups.filter(d => d.isTop === true)
        .append('text')
        .attr('x', d => d.x! + boxWidth / 2 + 10)
        .attr('y', d => d.y!)
        .attr('text-anchor', 'start')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('fill', '#EF4444')
        .text('TOP');
    } 
    // For queue and deque visualization - horizontal layout
    else {
      const boxHeight = Math.min(80, innerHeight / 2);
      const boxWidth = Math.min(80, innerWidth / (items.length + 1));
      const yPosition = innerHeight / 2 - boxHeight / 2;
      
      // Create container for the queue/deque
      g.append('rect')
        .attr('x', 10)
        .attr('y', yPosition)
        .attr('width', innerWidth - 20)
        .attr('height', boxHeight)
        .attr('fill', 'none')
        .attr('stroke', '#E2E8F0')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .attr('rx', 5)
        .attr('ry', 5);
      
      // Create a group for each item in the queue/deque
      const itemGroups = g.selectAll<SVGGElement, D3Node>('.queue-item')
        .data(simulationData.nodes)
        .enter()
        .append('g')
        .attr('class', 'queue-item')
        .attr('cursor', 'pointer')
        .on('click', (event, d) => {
          if (onItemClick) {
            event.stopPropagation();
            onItemClick(d.id);
          }
        });
      
      // Calculate positions
      const spacing = Math.min(30, (innerWidth - 40) / Math.max(items.length, 1));
      simulationData.nodes.forEach((node, i) => {
        node.x = 20 + (i + 0.5) * spacing;
        node.y = yPosition + boxHeight / 2;
      });
      
      // Add circles for items
      itemGroups.append('circle')
        .attr('cx', d => d.x!)
        .attr('cy', d => d.y!)
        .attr('r', Math.min(boxWidth, boxHeight) / 3)
        .attr('fill', d => getItemColor(d.status, d.id === selectedItem))
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .attr('opacity', d => {
          if (animationInProgress) {
            if (d.status === 'popping' && type === 'queue') return 0.7;
            if (d.status === 'pushing' && type === 'deque') return 0.7;
          }
          return 1;
        });
      
      // Add animation for operations
      // For queue - dequeue from front (head)
      if (type === 'queue') {
        itemGroups.filter(d => d.status === 'popping')
          .select('circle')
          .transition()
          .duration(1000)
          .attr('cx', d => d.x! - 100)
          .attr('opacity', 0);
      }
      // For deque - can add/remove from both ends
      else if (type === 'deque') {
        // Animation for removal depends on if it's head or tail
        itemGroups.filter(d => d.status === 'popping' && d.isHead === true)
          .select('circle')
          .transition()
          .duration(1000)
          .attr('cx', d => d.x! - 100)
          .attr('opacity', 0);
          
        itemGroups.filter(d => d.status === 'popping' && d.isTail === true)
          .select('circle')
          .transition()
          .duration(1000)
          .attr('cx', d => d.x! + 100)
          .attr('opacity', 0);
      }
      
      // Add text for values
      itemGroups.append('text')
        .attr('x', d => d.x!)
        .attr('y', d => d.y!)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('fill', 'white')
        .text(d => d.value);
      
      // Add index indicators below
      itemGroups.append('text')
        .attr('x', d => d.x!)
        .attr('y', d => d.y! + boxHeight / 2 + 15)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', '#64748B')
        .text((d) => `[${d.id}]`);
      
      // Add front/head indicator
      itemGroups.filter(d => d.isHead === true)
        .append('text')
        .attr('x', d => d.x!)
        .attr('y', d => d.y! - boxHeight / 2 - 15)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('fill', '#3B82F6')
        .text(type === 'deque' ? 'HEAD' : 'FRONT');
      
      // Add back/tail indicator
      itemGroups.filter(d => d.isTail === true)
        .append('text')
        .attr('x', d => d.x!)
        .attr('y', d => d.y! - boxHeight / 2 - 15)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('fill', '#EC4899')
        .text(type === 'deque' ? 'TAIL' : 'BACK');
        
      // Add arrows between items for queue and deque
      if (items.length > 1) {
        const arrowGroup = g.append('g').attr('class', 'arrows');
        
        for (let i = 0; i < simulationData.nodes.length - 1; i++) {
          const current = simulationData.nodes[i];
          const next = simulationData.nodes[i + 1];
          
          // Forward arrow (for both queue and deque)
          arrowGroup.append('line')
            .attr('x1', current.x! + 15)
            .attr('y1', current.y!)
            .attr('x2', next.x! - 15)
            .attr('y2', next.y!)
            .attr('stroke', '#94A3B8')
            .attr('stroke-width', 1.5)
            .attr('marker-end', 'url(#arrow-forward)');
            
          // Backward arrow (only for deque)
          if (type === 'deque') {
            arrowGroup.append('line')
              .attr('x1', next.x! - 15)
              .attr('y1', next.y! + 10)
              .attr('x2', current.x! + 15)
              .attr('y2', current.y! + 10)
              .attr('stroke', '#94A3B8')
              .attr('stroke-width', 1.5)
              .attr('marker-end', 'url(#arrow-backward)');
          }
        }
        
        // Add arrow markers
        const defs = svg.append('defs');
        
        defs.append('marker')
          .attr('id', 'arrow-forward')
          .attr('viewBox', '0 -5 10 10')
          .attr('refX', 8)
          .attr('refY', 0)
          .attr('markerWidth', 6)
          .attr('markerHeight', 6)
          .attr('orient', 'auto')
          .append('path')
          .attr('d', 'M0,-5L10,0L0,5')
          .attr('fill', '#94A3B8');
          
        if (type === 'deque') {
          defs.append('marker')
            .attr('id', 'arrow-backward')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 8)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', '#94A3B8');
        }
      }
    }
    
    // Add tooltip functionality
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 1000);
      
    // Add hover effects
    g.selectAll<SVGElement, D3Node>('.stack-item, .queue-item')
      .on('mouseover', (event, d) => {
        let tooltipContent = `Value: ${d.value}<br>Index: ${d.id}<br>Status: ${d.status}`;
        
        if (type === 'stack' && d.isTop) 
          tooltipContent += '<br>Position: TOP';
          
        if ((type === 'queue' || type === 'deque') && d.isHead) 
          tooltipContent += `<br>Position: ${type === 'deque' ? 'HEAD' : 'FRONT'}`;
          
        if ((type === 'queue' || type === 'deque') && d.isTail) 
          tooltipContent += `<br>Position: ${type === 'deque' ? 'TAIL' : 'BACK'}`;
        
        tooltip
          .style('opacity', 1)
          .html(tooltipContent);
          
        // Highlight the element
        d3.select(event.currentTarget).select('rect, circle')
          .transition()
          .duration(200)
          .attr('stroke', '#FFD700')
          .attr('stroke-width', 3);
      })
      .on('mousemove', (event) => {
        tooltip
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 20) + 'px');
      })
      .on('mouseout', (event) => {
        tooltip.style('opacity', 0);
        
        // Reset highlight
        d3.select(event.currentTarget).select('rect, circle')
          .transition()
          .duration(200)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);
      });

    return () => {
      // Cleanup tooltip when component unmounts
      d3.select('body').select('.tooltip').remove();
    };
  }, [items, type, containerWidth, height, getItemColor, prepareSimulationData, onItemClick, selectedItem, animationInProgress]);

  // If there are no items, show an empty state
  if (items.length === 0) {
    return (
      <div 
        ref={containerRef}
        className="d3-stack-queue-visualizer w-full flex items-center justify-center"
        style={{ height: `${height}px` }}
      >
        <div className="text-center text-muted-foreground">
          <p className="text-lg">Empty {type === 'stack' ? 'Stack' : type === 'queue' ? 'Queue' : 'Deque'}</p>
          <p className="text-sm">Add items to visualize the {type}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="d3-stack-queue-visualizer w-full"
    >
      <svg 
        ref={svgRef} 
        width="100%" 
        height={height}
        className="w-full overflow-visible"
      />
    </div>
  );
} 