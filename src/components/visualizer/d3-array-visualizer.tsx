import { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { ArrayItem } from '../../types/visualizer';

// Define data structure types for D3
interface SimulationNode {
  id: number;
  value: number;
  radius: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface SimulationLink {
  source: number | SimulationNode;
  target: number | SimulationNode;
  value: number;
}

// Define extended ArrayItem for D3 force simulations
interface ExtendedArrayItem extends ArrayItem {
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface D3ArrayVisualizerProps {
  data: ArrayItem[];
  height?: number;
  visualStyle?: 'bars' | 'bubbles' | 'forcedGraph' | 'heatmap';
  colorTheme?: 'default' | 'rainbow' | 'gradient';
  showAnimation?: boolean;
}

export function D3ArrayVisualizer({
  data,
  height = 300,
  visualStyle = 'bars',
  colorTheme = 'default',
  showAnimation = true,
}: D3ArrayVisualizerProps) {
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

  // Get color based on theme and value
  const getColor = useCallback((index: number, value: number, maxValue: number): string => {
    let percentage = 0;
    switch (colorTheme) {
      case 'rainbow':
        return d3.interpolateRainbow(index / data.length);
      case 'gradient':
        percentage = value / maxValue;
        return d3.interpolateViridis(percentage);
      default:
        return d3.interpolateBlues(0.5 + (value / maxValue) * 0.5);
    }
  }, [colorTheme, data.length]);

  // Main visualization effect
  useEffect(() => {
    if (!svgRef.current || !data.length || containerWidth === 0) return;

    const width = containerWidth;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const maxValue = Math.max(...data.map(item => Number(item.value)));

    // Create main group element
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleBand()
      .domain(data.map((_, i) => i.toString()))
      .range([0, innerWidth])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, maxValue])
      .range([innerHeight, 0]);

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('text-anchor', 'middle')
      .style('font-size', '10px');

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .selectAll('text')
      .style('font-size', '10px');

    // Render based on visualization style
    if (visualStyle === 'bars') {
      const bars = g.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', (_, i) => xScale(i.toString()) || 0)
        .attr('width', xScale.bandwidth())
        .attr('fill', (d, i) => getColor(i, Number(d.value), maxValue))
        .attr('rx', 4)
        .attr('ry', 4);

      if (showAnimation) {
        bars
          .attr('y', innerHeight)
          .attr('height', 0)
          .transition()
          .duration(800)
          .delay((_, i) => i * 50)
          .attr('y', d => yScale(Number(d.value)))
          .attr('height', d => innerHeight - yScale(Number(d.value)));
      } else {
        bars
          .attr('y', d => yScale(Number(d.value)))
          .attr('height', d => innerHeight - yScale(Number(d.value)));
      }

      // Add value labels
      g.selectAll('.value-label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'value-label')
        .attr('x', (_, i) => (xScale(i.toString()) || 0) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(Number(d.value)) - 5)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .text(d => d.value);
    }
    else if (visualStyle === 'bubbles') {
      // Create bubble chart
      const radiusScale = d3.scaleSqrt()
        .domain([0, maxValue])
        .range([5, Math.min(xScale.bandwidth(), 40)]);

      // Define node type for simulation
      type BubbleNode = ExtendedArrayItem;

      // Create force simulation
      const simulation = d3.forceSimulation<BubbleNode>()
        .force('x', d3.forceX<BubbleNode>(innerWidth / 2).strength(0.05))
        .force('y', d3.forceY<BubbleNode>(innerHeight / 2).strength(0.05))
        .force('collide', d3.forceCollide<BubbleNode>(d => radiusScale(Number(d.value)) + 1));

      const bubbles = g.selectAll<SVGCircleElement, BubbleNode>('.bubble')
        .data(data as BubbleNode[])
        .enter()
        .append('circle')
        .attr('class', 'bubble')
        .attr('r', d => radiusScale(Number(d.value)))
        .attr('fill', (d, i) => getColor(i, Number(d.value), maxValue))
        .attr('stroke', '#fff')
        .attr('stroke-width', 1)
        .attr('cx', innerWidth / 2)
        .attr('cy', innerHeight / 2);

      // Add value labels inside bubbles
      const labels = g.selectAll<SVGTextElement, BubbleNode>('.bubble-label')
        .data(data as BubbleNode[])
        .enter()
        .append('text')
        .attr('class', 'bubble-label')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', d => `${Math.min(16, radiusScale(Number(d.value)) / 2)}px`)
        .attr('fill', 'white')
        .text(d => d.value);

      // Add index labels
      const indexLabels = g.selectAll<SVGTextElement, BubbleNode>('.index-label')
        .data(data as BubbleNode[])
        .enter()
        .append('text')
        .attr('class', 'index-label')
        .attr('text-anchor', 'middle')
        .attr('font-size', '9px')
        .attr('fill', '#666')
        .text((_, i) => i);

      // Update positions on each simulation tick
      simulation.nodes(data as BubbleNode[]).on('tick', () => {
        bubbles
          .attr('cx', d => d.x || 0)
          .attr('cy', d => d.y || 0);

        labels
          .attr('x', d => d.x || 0)
          .attr('y', d => d.y || 0);

        indexLabels
          .attr('x', d => d.x || 0)
          .attr('y', d => (d.y || 0) + radiusScale(Number(d.value)) + 12);
      });
    }
    else if (visualStyle === 'forcedGraph') {
      // Create nodes and links for a force-directed graph
      const nodes: SimulationNode[] = data.map((d, i) => ({ 
        id: i, 
        value: Number(d.value), 
        radius: Math.max(10, (Number(d.value) / maxValue) * 25) 
      }));
      
      const links: SimulationLink[] = [];
      // Create links between nodes (connect each node to the next one)
      for (let i = 0; i < nodes.length - 1; i++) {
        links.push({
          source: i,
          target: i + 1,
          value: Math.min(nodes[i].value, nodes[i + 1].value) / maxValue
        });
      }

      // Create a force simulation
      const simulation = d3.forceSimulation<SimulationNode>(nodes)
        .force('link', d3.forceLink<SimulationNode, SimulationLink>(links).id(d => d.id).distance(80))
        .force('charge', d3.forceManyBody().strength(-100))
        .force('center', d3.forceCenter(innerWidth / 2, innerHeight / 2))
        .force('collision', d3.forceCollide<SimulationNode>().radius(d => d.radius + 2));

      // Create the links
      const link = g.selectAll<SVGLineElement, SimulationLink>('.link')
        .data(links)
        .enter()
        .append('line')
        .attr('class', 'link')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', d => Math.max(1, d.value * 5));

      // Create the nodes
      const node = g.selectAll<SVGCircleElement, SimulationNode>('.node')
        .data(nodes)
        .enter()
        .append('circle')
        .attr('class', 'node')
        .attr('r', d => d.radius)
        .attr('fill', (d, i) => getColor(i, d.value, maxValue))
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .call(d3.drag<SVGCircleElement, SimulationNode>()
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
            d.fx = null;
            d.fy = null;
          }));

      // Add value labels
      const labels = g.selectAll<SVGTextElement, SimulationNode>('.node-label')
        .data(nodes)
        .enter()
        .append('text')
        .attr('class', 'node-label')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '10px')
        .attr('fill', 'white')
        .text(d => d.value);

      // Add index labels around nodes
      const indexLabels = g.selectAll<SVGTextElement, SimulationNode>('.index-label')
        .data(nodes)
        .enter()
        .append('text')
        .attr('class', 'index-label')
        .attr('text-anchor', 'middle')
        .attr('font-size', '9px')
        .attr('fill', '#666')
        .attr('pointer-events', 'none')
        .text(d => d.id);

      // Update positions on each simulation tick
      simulation.on('tick', () => {
        link
          .attr('x1', d => (d.source as SimulationNode).x || 0)
          .attr('y1', d => (d.source as SimulationNode).y || 0)
          .attr('x2', d => (d.target as SimulationNode).x || 0)
          .attr('y2', d => (d.target as SimulationNode).y || 0);

        node
          .attr('cx', d => d.x || 0)
          .attr('cy', d => d.y || 0);

        labels
          .attr('x', d => d.x || 0)
          .attr('y', d => d.y || 0);

        indexLabels
          .attr('x', d => d.x || 0)
          .attr('y', d => (d.y || 0) + (d.radius + 12));
      });
    }
    else if (visualStyle === 'heatmap') {
      // Create a heatmap visualization
      const cellSize = Math.min(
        innerWidth / data.length,
        innerHeight / 2
      );
      
      // Create a row of cells
      const cells = g.selectAll('.cell')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'cell')
        .attr('x', (_, i) => i * cellSize)
        .attr('y', innerHeight / 2 - cellSize / 2)
        .attr('width', cellSize)
        .attr('height', cellSize)
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);

      if (showAnimation) {
        cells
          .attr('fill-opacity', 0)
          .transition()
          .duration(800)
          .delay((_, i) => i * 50)
          .attr('fill', (d, i) => getColor(i, Number(d.value), maxValue))
          .attr('fill-opacity', 1);
      } else {
        cells
          .attr('fill', (d, i) => getColor(i, Number(d.value), maxValue));
      }

      // Add value labels
      g.selectAll('.cell-value')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'cell-value')
        .attr('x', (_, i) => i * cellSize + cellSize / 2)
        .attr('y', innerHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', Math.min(16, cellSize / 2))
        .attr('fill', 'white')
        .text(d => d.value);

      // Add index labels
      g.selectAll('.cell-index')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'cell-index')
        .attr('x', (_, i) => i * cellSize + cellSize / 2)
        .attr('y', innerHeight / 2 - cellSize / 2 - 5)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .text((_, i) => i);

      // Add a color legend
      const legendWidth = innerWidth;
      const legendHeight = 20;
      
      const legendScale = d3.scaleLinear()
        .domain([0, maxValue])
        .range([0, legendWidth]);
      
      // Create color scale for legend
      const legendColors = [
        getColor(0, 0, maxValue),
        getColor(Math.floor(data.length / 2), Math.floor(maxValue / 2), maxValue),
        getColor(data.length - 1, maxValue, maxValue)
      ];
      
      const legendColorScale = d3.scaleLinear<string>()
        .domain([0, 0.5, 1])
        .range(legendColors)
        .interpolate(d3.interpolateRgb);
      
      const legend = g.append('g')
        .attr('transform', `translate(0, ${innerHeight - legendHeight - 10})`);
      
      const legendGradient = legend.append('defs')
        .append('linearGradient')
        .attr('id', 'legend-gradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');
      
      legendGradient.selectAll('stop')
        .data([0, 0.25, 0.5, 0.75, 1])
        .enter()
        .append('stop')
        .attr('offset', d => d * 100 + '%')
        .attr('stop-color', d => legendColorScale(d));
      
      legend.append('rect')
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .style('fill', 'url(#legend-gradient)');
      
      legend.append('g')
        .attr('transform', `translate(0, ${legendHeight})`)
        .call(d3.axisBottom(legendScale).ticks(5))
        .selectAll('text')
        .style('font-size', '10px');
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

    // Add event listeners based on visualization style
    if (visualStyle === 'bars') {
      g.selectAll<SVGRectElement, ArrayItem>('.bar')
        .on('mouseover', (_event, d) => {
          const index = data.indexOf(d);
          tooltip
            .style('opacity', 1)
            .html(`Value: ${d.value}<br>Index: ${index}`);
        })
        .on('mousemove', (event) => {
          tooltip
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 20) + 'px');
        })
        .on('mouseout', () => {
          tooltip.style('opacity', 0);
        });
    } else if (visualStyle === 'bubbles') {
      g.selectAll<SVGCircleElement, ArrayItem>('.bubble')
        .on('mouseover', (_event, d) => {
          const index = data.indexOf(d);
          tooltip
            .style('opacity', 1)
            .html(`Value: ${d.value}<br>Index: ${index}`);
        })
        .on('mousemove', (event) => {
          tooltip
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 20) + 'px');
        })
        .on('mouseout', () => {
          tooltip.style('opacity', 0);
        });
    }

    return () => {
      // Cleanup tooltip when component unmounts
      d3.select('body').select('.tooltip').remove();
    };
  }, [data, containerWidth, height, visualStyle, colorTheme, showAnimation, getColor]);

  return (
    <div className="d3-array-visualizer w-full" ref={containerRef}>
      <svg 
        ref={svgRef} 
        width="100%" 
        height={height}
        className="w-full h-full overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  );
} 