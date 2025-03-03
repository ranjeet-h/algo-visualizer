import { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';

// Define node types for different linked list types
export interface ListNode {
  value: number;
  status: 'default' | 'active' | 'selected' | 'comparing' | 'inserted' | 'deleted';
}

export interface SinglyLinkedListNode extends ListNode {
  next: number | null; // Index of the next node, null if it's the tail
}

export interface DoublyLinkedListNode extends ListNode {
  next: number | null; // Index of the next node, null if it's the tail
  prev: number | null; // Index of the previous node, null if it's the head
}

// D3 simulation node type
interface D3Node {
  id: number;
  value: number;
  status: string;
  radius: number;
  isHead: boolean;
  isTail: boolean;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

// D3 simulation link type
interface D3Link {
  source: number | D3Node;
  target: number | D3Node;
  isForward: boolean;
  isBackward: boolean;
  isCircular: boolean;
}

interface D3LinkedListVisualizerProps {
  nodes: (SinglyLinkedListNode | DoublyLinkedListNode)[];
  head: number | null;
  tail: number | null;
  selectedNode: number | null;
  type: 'singly' | 'doubly' | 'circular';
  height?: number;
  onNodeClick?: (index: number) => void;
}

export function D3LinkedListVisualizer({
  nodes,
  head,
  tail,
  selectedNode,
  type,
  height = 300,
  onNodeClick,
}: D3LinkedListVisualizerProps) {
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
  const getNodeColor = useCallback((status: string, isSelected: boolean): string => {
    if (isSelected) return '#FFD700'; // Gold for selected nodes
    
    switch (status) {
      case 'active':
        return '#3B82F6'; // Blue
      case 'comparing':
        return '#8B5CF6'; // Purple
      case 'inserted':
        return '#10B981'; // Green
      case 'deleted':
        return '#EF4444'; // Red
      default:
        return '#6366F1'; // Indigo for default
    }
  }, []);

  // Convert linked list data to D3 simulation data
  const prepareSimulationData = useCallback(() => {
    // Create D3 nodes
    const d3Nodes: D3Node[] = nodes.map((node, index) => ({
      id: index,
      value: node.value,
      status: node.status,
      // Scale node radius based on container width for mobile responsiveness
      radius: containerWidth < 500 ? 22 : 30, 
      isHead: index === head,
      isTail: index === tail,
    }));

    // Create D3 links based on the linked list type
    const d3Links: D3Link[] = [];

    // Forward links (all types)
    for (let i = 0; i < nodes.length; i++) {
      const next = nodes[i].next;
      if (next !== null) {
        d3Links.push({
          source: i,
          target: next,
          isForward: true,
          isBackward: false,
          isCircular: type === 'circular' && next < i,
        });
      }
    }

    // Backward links (only for doubly linked list)
    if (type === 'doubly') {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i] as DoublyLinkedListNode;
        if ('prev' in node && node.prev !== null) {
          d3Links.push({
            source: i,
            target: node.prev,
            isForward: false,
            isBackward: true,
            isCircular: false,
          });
        }
      }
    }

    return { nodes: d3Nodes, links: d3Links };
  }, [nodes, head, tail, type, containerWidth]);

  // Main visualization effect
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !nodes.length) return;

    // Get current dimensions
    const width = containerWidth;
    // Adjust height based on screen size
    const actualHeight = Math.min(height, containerWidth < 500 ? width * 0.9 : height);
    
    // Clear existing visualization
    d3.select(svgRef.current).selectAll('*').remove();

    // Create new SVG with responsive viewBox
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', actualHeight)
      .attr('viewBox', `0 0 ${width} ${actualHeight}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Setup margin and inner dimensions
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = actualHeight - margin.top - margin.bottom;

    // Create main group element
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
      
    // Add zoom and pan capabilities - especially helpful on mobile
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2.5]) // Limit zoom scale
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
      
    // Initialize with a slight zoom out on small screens to show everything
    if (containerWidth < 500 && nodes.length > 3) {
      svg.call(zoom).call(
        zoom.transform, 
        d3.zoomIdentity.scale(0.8).translate(width * 0.1, 0)
      );
    } else {
      svg.call(zoom);
    }
    
    // Enable double-tap to reset zoom on mobile
    let lastTapTime = 0;
    svg.on('touchend', () => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTapTime;
      if (tapLength < 300 && tapLength > 0) {
        // Double tap detected - reset zoom
        svg.transition().duration(300).call(
          zoom.transform, 
          d3.zoomIdentity
        );
      }
      lastTapTime = currentTime;
    });

    // Prepare data for visualization
    const simulationData = prepareSimulationData();

    // Create force simulation with adjusted strengths for mobile
    const forceStrength = containerWidth < 500 ? -200 : -300;
    const linkDistance = containerWidth < 500 ? 80 : 100;
    
    const simulation = d3.forceSimulation<D3Node>(simulationData.nodes)
      .force('link', d3.forceLink<D3Node, D3Link>(simulationData.links)
        .id(d => d.id)
        .distance(linkDistance))
      .force('charge', d3.forceManyBody().strength(forceStrength))
      .force('center', d3.forceCenter(innerWidth / 2, innerHeight / 2))
      .force('x', d3.forceX(innerWidth / 2).strength(0.1))
      .force('y', d3.forceY(innerHeight / 2).strength(0.1))
      .force('collision', d3.forceCollide<D3Node>().radius(d => d.radius + 10));

    // Apply a horizontal layout for the linked list
    if (type !== 'circular') {
      // For singly and doubly linked lists, try to arrange nodes horizontally
      simulationData.nodes.forEach((node, i) => {
        node.fx = (i * (innerWidth / (nodes.length + 1))) + margin.left;
        node.fy = innerHeight / 2;
      });
    }

    // Linear gradient for links
    const defs = svg.append('defs');
    
    // Forward link gradient
    const forwardGradient = defs.append('linearGradient')
      .attr('id', 'forward-gradient')
      .attr('gradientUnits', 'userSpaceOnUse');
      
    forwardGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#6366F1');
      
    forwardGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#3B82F6');

    // Backward link gradient
    const backwardGradient = defs.append('linearGradient')
      .attr('id', 'backward-gradient')
      .attr('gradientUnits', 'userSpaceOnUse');
      
    backwardGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#F59E0B');
      
    backwardGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#F97316');

    // Create the arrow markers
    defs.append('marker')
      .attr('id', 'arrowhead-forward')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20) // Position from the end of the line
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#3B82F6');

    defs.append('marker')
      .attr('id', 'arrowhead-backward')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20) // Position from the end of the line
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#F97316');

    // Create curved links
    const link = g.selectAll<SVGPathElement, D3Link>('.link')
      .data(simulationData.links)
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('stroke', d => {
        if (d.isBackward) return 'url(#backward-gradient)';
        return 'url(#forward-gradient)';
      })
      .attr('stroke-width', 2)
      .attr('fill', 'none')
      .attr('marker-end', d => {
        if (d.isBackward) return 'url(#arrowhead-backward)';
        return 'url(#arrowhead-forward)';
      })
      .attr('opacity', 0.8);

    // Node group
    const nodeGroup = g.selectAll<SVGGElement, D3Node>('.node-group')
      .data(simulationData.nodes)
      .enter()
      .append('g')
      .attr('class', 'node-group')
      .call(d3.drag<SVGGElement, D3Node>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          // Keep nodes fixed horizontally for non-circular lists
          if (type !== 'circular') {
            d.fy = null;
          } else {
            d.fx = null;
            d.fy = null;
          }
        }))
      .on('click', (event, d) => {
        if (onNodeClick) {
          event.stopPropagation();
          onNodeClick(d.id);
        }
      });

    // Create nodes (circles)
    nodeGroup.append('circle')
      .attr('r', d => d.radius)
      .attr('fill', d => getNodeColor(d.status, d.id === selectedNode))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer');

    // Add shadow effect for nodes
    nodeGroup.insert('circle', 'circle')
      .attr('r', d => d.radius)
      .attr('fill', 'none')
      .attr('stroke', d => {
        if (d.isHead && d.isTail) return 'rgba(249, 115, 22, 0.5)'; // Head and tail
        if (d.isHead) return 'rgba(59, 130, 246, 0.5)'; // Head
        if (d.isTail) return 'rgba(236, 72, 153, 0.5)'; // Tail
        return 'rgba(0, 0, 0, 0.1)';
      })
      .attr('stroke-width', 4)
      .attr('stroke-dasharray', d => d.isHead || d.isTail ? '4 2' : '0')
      .attr('opacity', 0.8);

    // Add value text
    nodeGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', 'white')
      .attr('font-weight', 'bold')
      .attr('font-size', containerWidth < 500 ? '10px' : '14px')
      .text(d => d.value)
      .attr('pointer-events', 'none');

    // Add index text below node
    nodeGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('y', d => d.radius + 16)
      .attr('font-size', '12px')
      .attr('fill', '#64748B')
      .text(d => `[${d.id}]`);

    // Add head/tail indicators
    nodeGroup.filter(d => d.isHead)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', d => -(d.radius + (containerWidth < 500 ? 8 : 12)))
      .attr('fill', 'currentColor')
      .attr('font-size', containerWidth < 500 ? '10px' : '12px')
      .attr('font-weight', 'bold')
      .text('HEAD')
      .attr('pointer-events', 'none');

    nodeGroup.filter(d => d.isTail)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', d => -(d.radius + (containerWidth < 500 ? 8 : 12)))
      .attr('fill', 'currentColor')
      .attr('font-size', containerWidth < 500 ? '10px' : '12px')
      .attr('font-weight', 'bold')
      .text('TAIL')
      .attr('pointer-events', 'none');

    // Update positions on each simulation tick
    simulation.on('tick', () => {
      // Update link positions with curved paths
      link.attr('d', d => {
        const source: any = d.source as D3Node;
        const target: any = d.target as D3Node;
        
        // Handle circular links
        if (d.isCircular) {
          // Create an arced path for circular references
          const dx = target.x! - source.x!;
          const dy = target.y! - source.y!;
          const dr = Math.sqrt(dx * dx + dy * dy) * 2;
          return `M${source.x},${source.y}A${dr},${dr} 0 0,1 ${target.x},${target.y}`;
        }
        
        // For doubly linked list, create slightly curved paths
        if (type === 'doubly') {
          const offset = d.isBackward ? 10 : -10;
          return `M${source.x},${source.y + offset} Q${(source.x! + target.x!) / 2},${((source.y! + target.y!) / 2) + offset * 3} ${target.x},${target.y + offset}`;
        }
        
        // Regular straight lines for singly linked list
        return `M${source.x},${source.y} L${target.x},${target.y}`;
      });

      // Update node positions
      nodeGroup.attr('transform', d => `translate(${d.x},${d.y})`);

      // We'll skip updating gradient coordinates which are non-essential
      // and were causing TypeScript errors
    });

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

    // Add hover effect for nodes
    nodeGroup
      .on('mouseover', (event, d) => {
        const nodeInfo = nodes[d.id];
        let tooltipContent = `Value: ${d.value}<br>Index: ${d.id}<br>Status: ${d.status}`;
        
        if (d.isHead) tooltipContent += '<br>Position: HEAD';
        if (d.isTail) tooltipContent += '<br>Position: TAIL';
        
        if (type === 'singly' || type === 'circular') {
          tooltipContent += `<br>Next: ${nodeInfo.next !== null ? nodeInfo.next : 'null'}`;
        } else if (type === 'doubly') {
          const doublyNode = nodeInfo as DoublyLinkedListNode;
          tooltipContent += `<br>Next: ${nodeInfo.next !== null ? nodeInfo.next : 'null'}`;
          tooltipContent += `<br>Prev: ${doublyNode.prev !== null ? doublyNode.prev : 'null'}`;
        }
        
        tooltip
          .style('opacity', 1)
          .html(tooltipContent);
          
        // Highlight the node
        d3.select(event.currentTarget).select('circle')
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
        d3.select(event.currentTarget).select('circle')
          .transition()
          .duration(200)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);
      });

    return () => {
      // Cleanup tooltip and simulation when component unmounts
      d3.select('body').select('.tooltip').remove();
      simulation.stop();
    };
  }, [nodes, head, tail, selectedNode, type, containerWidth, height, getNodeColor, prepareSimulationData, onNodeClick]);

  // If there are no nodes, show an empty state
  if (nodes.length === 0) {
    return (
      <div 
        ref={containerRef}
        className="d3-linked-list-visualizer w-full flex items-center justify-center"
        style={{ height: `${height}px` }}
      >
        <div className="text-center text-muted-foreground">
          <p className="text-lg">Empty List</p>
          <p className="text-sm">Add nodes to visualize the linked list</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="d3-linked-list-visualizer w-full"
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