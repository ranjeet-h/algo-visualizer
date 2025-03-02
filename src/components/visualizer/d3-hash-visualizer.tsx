import { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { HashTableEntry } from '../../types/visualizer';

interface D3HashVisualizerProps {
  entries: HashTableEntry[];
  buckets: (HashTableEntry[])[];
  height?: number;
  showCollisions?: boolean;
  onEntryClick?: (key: string) => void;
  visualStyle?: 'table' | 'buckets';
  colorTheme?: 'default' | 'rainbow' | 'gradient';
  showAnimation?: boolean;
}

export function D3HashVisualizer({
  entries,
  buckets,
  height = 400,
  showCollisions = true,
  onEntryClick,
  visualStyle = 'table',
  colorTheme = 'default',
  showAnimation = true,
}: D3HashVisualizerProps) {
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

  // Get color based on theme and status
  const getColor = useCallback((entry: HashTableEntry, index: number): string => {
    const baseColor = (() => {
      if (entry.status === 'active') return '#10b981'; // Green
      if (entry.status === 'collision') return '#ef4444'; // Red
      
      switch (colorTheme) {
        case 'rainbow':
          return d3.interpolateRainbow(index / (entries.length || 1));
        case 'gradient':
          return d3.interpolateBlues(0.3 + (index / (entries.length || 1)) * 0.7);
        default:
          return '#3b82f6'; // Blue
      }
    })();
    
    return baseColor;
  }, [colorTheme, entries.length]);

  // Render table visualization
  const renderTableVisualization = useCallback((
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    width: number,
    innerHeight: number
  ) => {
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    
    // Create main group element
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Calculate cell dimensions
    const numRows = buckets.length;
    const cellHeight = Math.min(40, (innerHeight - 40) / numRows);
    const bucketLabelWidth = 60;
    const cellWidth = Math.min(120, (innerWidth - bucketLabelWidth) / 2);
    
    // Create bucket index labels
    g.selectAll('.bucket-label')
      .data(buckets)
      .enter()
      .append('text')
      .attr('class', 'bucket-label')
      .attr('x', 20)
      .attr('y', (_, i) => i * cellHeight + cellHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '12px')
      .text((_, i) => `Bucket ${i}`);
    
    // Create bucket containers
    const bucketGroups = g.selectAll('.bucket')
      .data(buckets)
      .enter()
      .append('g')
      .attr('class', 'bucket')
      .attr('transform', (_, i) => `translate(${bucketLabelWidth}, ${i * cellHeight})`);
    
    // Draw bucket backgrounds
    bucketGroups
      .append('rect')
      .attr('width', innerWidth - bucketLabelWidth)
      .attr('height', cellHeight)
      .attr('fill', (_d, i) => i % 2 === 0 ? '#f9fafb' : '#f3f4f6')
      .attr('stroke', '#e5e7eb')
      .attr('rx', 4);
    
    // Draw entries for each bucket
    bucketGroups.each(function(bucket, bucketIndex) {
      const bucketGroup = d3.select(this);
      
      if (bucket.length === 0) {
        // Empty bucket
        bucketGroup
          .append('text')
          .attr('x', (innerWidth - bucketLabelWidth) / 2)
          .attr('y', cellHeight / 2)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-size', '10px')
          .attr('fill', '#9ca3af')
          .text('Empty');
      } else {
        // Entries
        const entryWidth = Math.min(cellWidth, (innerWidth - bucketLabelWidth) / bucket.length);
        
        const entryGroups = bucketGroup.selectAll('.entry')
          .data(bucket)
          .enter()
          .append('g')
          .attr('class', 'entry')
          .attr('transform', (_, i) => `translate(${i * entryWidth}, 0)`)
          .style('cursor', 'pointer')
          .on('click', (_, d) => {
            if (onEntryClick) onEntryClick(d.key);
          });
        
        // Entry background
        entryGroups
          .append('rect')
          .attr('width', entryWidth)
          .attr('height', cellHeight)
          .attr('fill', (d, i) => getColor(d, bucketIndex * 100 + i))
          .attr('opacity', 0.7)
          .attr('stroke', '#d1d5db')
          .attr('rx', 2);
        
        // Entry key-value display
        entryGroups
          .append('text')
          .attr('x', entryWidth / 2)
          .attr('y', cellHeight / 2 - 6)
          .attr('text-anchor', 'middle')
          .attr('font-size', '10px')
          .attr('fill', '#1f2937')
          .text(d => `${d.key}`);
        
        entryGroups
          .append('text')
          .attr('x', entryWidth / 2)
          .attr('y', cellHeight / 2 + 6)
          .attr('text-anchor', 'middle')
          .attr('font-size', '10px')
          .attr('fill', '#1f2937')
          .text(d => `${d.value}`);
      }
    });
    
    // Add header
    g.append('text')
      .attr('x', width / 2)
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('Hash Table');
  }, [buckets, entries, getColor, onEntryClick]);

  // Render bucket visualization
  const renderBucketVisualization = useCallback((
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    width: number,
    innerHeight: number
  ) => {
    const margin = { top: 40, right: 20, bottom: 20, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    
    // Create main group element
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Calculate dimensions
    const numBuckets = buckets.length;
    const bucketWidth = innerWidth / numBuckets;
    const maxBucketSize = Math.max(...buckets.map(b => b.length));
    const maxEntryHeight = 50;
    const entryHeight = Math.min(maxEntryHeight, (innerHeight - 60) / (maxBucketSize || 1));
    const entryWidth = bucketWidth * 0.8;
    
    // Create bucket groups
    const bucketGroups = g.selectAll('.bucket')
      .data(buckets)
      .enter()
      .append('g')
      .attr('class', 'bucket')
      .attr('transform', (_, i) => `translate(${i * bucketWidth + bucketWidth / 2 - entryWidth / 2}, 0)`);
    
    // Bucket labels
    bucketGroups
      .append('text')
      .attr('x', entryWidth / 2)
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text((_, i) => `Bucket ${i}`);
    
    // Bucket containers
    bucketGroups
      .append('rect')
      .attr('width', entryWidth)
      .attr('height', innerHeight - 40)
      .attr('fill', '#f9fafb')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-dasharray', '3,3')
      .attr('rx', 4);
    
    // Add entries to each bucket
    bucketGroups.each(function(bucket, bucketIndex) {
      const bucketGroup = d3.select(this);
      
      if (bucket.length === 0) {
        // Empty bucket
        bucketGroup
          .append('text')
          .attr('x', entryWidth / 2)
          .attr('y', (innerHeight - 40) / 2)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-size', '10px')
          .attr('fill', '#9ca3af')
          .text('Empty');
      } else {
        // Entries
        const entryGroups = bucketGroup.selectAll('.entry')
          .data(bucket)
          .enter()
          .append('g')
          .attr('class', 'entry')
          .attr('transform', (_, i) => `translate(${entryWidth * 0.1}, ${10 + i * (entryHeight + 5)})`)
          .style('cursor', 'pointer')
          .on('click', (_, d) => {
            if (onEntryClick) onEntryClick(d.key);
          });
        
        // Create animated entries
        if (showAnimation) {
          entryGroups
            .attr('opacity', 0)
            .transition()
            .duration(500)
            .delay((_, i) => i * 100)
            .attr('opacity', 1);
        }
        
        // Entry background
        entryGroups
          .append('rect')
          .attr('width', entryWidth * 0.8)
          .attr('height', entryHeight)
          .attr('fill', (d, i) => getColor(d, bucketIndex * 100 + i))
          .attr('stroke', '#d1d5db')
          .attr('rx', 4);
        
        // Entry key-value display
        entryGroups
          .append('text')
          .attr('x', entryWidth * 0.4)
          .attr('y', entryHeight / 2 - 5)
          .attr('text-anchor', 'middle')
          .attr('font-size', '10px')
          .attr('fill', 'white')
          .text(d => `Key: ${d.key}`);
        
        entryGroups
          .append('text')
          .attr('x', entryWidth * 0.4)
          .attr('y', entryHeight / 2 + 8)
          .attr('text-anchor', 'middle')
          .attr('font-size', '10px')
          .attr('fill', 'white')
          .text(d => `Value: ${d.value}`);
        
        // Collision indicators
        if (showCollisions && bucket.length > 1) {
          bucketGroup
            .append('text')
            .attr('x', entryWidth / 2)
            .attr('y', -30)
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .attr('fill', '#ef4444')
            .text(`${bucket.length} items (collision)`);
        }
      }
    });
    
    // Add header
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', -25)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('Hash Table Buckets');
  }, [buckets, getColor, onEntryClick, showAnimation, showCollisions]);

  // Main visualization effect
  useEffect(() => {
    if (!svgRef.current || containerWidth === 0) return;

    const width = containerWidth;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const innerHeight = height;

    // Choose visualization based on style
    if (visualStyle === 'table') {
      renderTableVisualization(svg, width, innerHeight);
    } else {
      renderBucketVisualization(svg, width, innerHeight);
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

    // Add hover effects for entries
    svg.selectAll('.entry')
      .on('mouseover', (_event, d) => {
        tooltip
          .style('opacity', 1)
          .html(`Key: ${(d as HashTableEntry).key}<br>Value: ${(d as HashTableEntry).value}<br>Status: ${(d as HashTableEntry).status || 'default'}`);
      })
      .on('mousemove', (event) => {
        tooltip
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 20) + 'px');
      })
      .on('mouseout', () => {
        tooltip.style('opacity', 0);
      });

    return () => {
      // Cleanup tooltip when component unmounts
      d3.select('body').select('.tooltip').remove();
    };
  }, [containerWidth, height, visualStyle, renderTableVisualization, renderBucketVisualization]);

  return (
    <div className="d3-hash-visualizer w-full" ref={containerRef}>
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