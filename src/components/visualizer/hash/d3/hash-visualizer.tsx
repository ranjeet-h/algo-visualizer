import { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';

interface HashTableEntry {
  key: string;
  value: string | number | boolean | null;
  status?: 'default' | 'active' | 'collision' | 'processing' | 'deleted';
}

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
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Setup resize observer to track container width changes
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Get initial width
    const width = containerRef.current.clientWidth;
    setContainerWidth(width);
    setIsMobile(width < 640); // 640px is the sm breakpoint in Tailwind
    
    // Create resize observer
    const resizeObserver = new ResizeObserver(entries => {
      if (!entries[0]) return;
      const { width } = entries[0].contentRect;
      setContainerWidth(width);
      setIsMobile(width < 640);
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
    svg: d3.Selection<any, unknown, null, undefined>,
    width: number,
    innerHeight: number
  ) => {
    const margin = { 
      top: 20, 
      right: isMobile ? 10 : 20, 
      bottom: 20, 
      left: isMobile ? 10 : 20 
    };
    const innerWidth = width - margin.left - margin.right;
    
    // Create main group element
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Calculate cell dimensions
    const numRows = buckets.length;
    const cellHeight = Math.min(40, (innerHeight - 40) / numRows);
    const bucketLabelWidth = isMobile ? 30 : 60;
    
    // For mobile, we'll use a more compact layout
    if (isMobile) {
      // Title
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', -5)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text('Hash Table');
      
      // Create bucket rows with index
      const bucketRows = g.selectAll('.bucket-row')
        .data(buckets)
        .enter()
        .append('g')
        .attr('class', 'bucket-row')
        .attr('transform', (_, i) => `translate(0, ${i * cellHeight})`);
      
      // Draw row backgrounds (alternating)
      bucketRows
        .append('rect')
        .attr('width', innerWidth)
        .attr('height', cellHeight)
        .attr('fill', (_d, i) => i % 2 === 0 ? '#f9fafb' : '#f3f4f6')
        .attr('stroke', '#e5e7eb')
        .attr('rx', 3);
      
      // Bucket index labels
      bucketRows
        .append('text')
        .attr('x', 15)
        .attr('y', cellHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .text((_, i) => `#${i}`);
      
      // Draw entries for each bucket
      bucketRows.each(function(bucket, bucketIndex) {
        const bucketRow = d3.select(this);
        
        if (bucket.length === 0) {
          // Empty bucket
          bucketRow
            .append('text')
            .attr('x', bucketLabelWidth + 10)
            .attr('y', cellHeight / 2)
            .attr('dominant-baseline', 'middle')
            .attr('font-size', '9px')
            .attr('fill', '#9ca3af')
            .text('Empty');
        } else {
          // Entries as colored pills
          const entryWidth = Math.min(60, (innerWidth - bucketLabelWidth) / bucket.length);
          
          bucket.forEach((entry, i) => {
            const entryGroup = bucketRow.append('g')
              .attr('transform', `translate(${bucketLabelWidth + i * entryWidth}, 0)`)
              .style('cursor', 'pointer')
              .on('click', () => {
                if (onEntryClick) onEntryClick(entry.key);
              });
            
            // Entry pill background
            entryGroup.append('rect')
              .attr('x', 5)
              .attr('y', cellHeight * 0.2)
              .attr('width', entryWidth - 10)
              .attr('height', cellHeight * 0.6)
              .attr('rx', 10)
              .attr('fill', getColor(entry, bucketIndex * 100 + i))
              .attr('stroke', '#d1d5db')
              .attr('stroke-width', entry.status === 'active' ? 2 : 0.5);
            
            // Key display  
            entryGroup.append('text')
              .attr('x', entryWidth / 2)
              .attr('y', cellHeight / 2)
              .attr('text-anchor', 'middle')
              .attr('dominant-baseline', 'middle')
              .attr('font-size', '8px')
              .attr('font-weight', 'bold')
              .attr('fill', 'white')
              .text(() => {
                const keyStr = String(entry.key);
                return keyStr.length > 5 ? keyStr.substring(0, 4) + '…' : keyStr;
              });
          });
        }
      });
    } else {
      // Desktop layout (original code)
      const cellWidth = Math.min(120, (innerWidth - bucketLabelWidth) / 2);
    
      // Create bucket index labels
      g.selectAll('.bucket-label')
        .data(buckets)
        .enter()
        .append('text')
        .attr('class', 'bucket-label')
        .attr('x', bucketLabelWidth / 2)
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
    }
  }, [buckets, entries, getColor, onEntryClick, isMobile]);

  // Render bucket visualization
  const renderBucketVisualization = useCallback((
    svg: d3.Selection<any, unknown, null, undefined>,
    width: number,
    innerHeight: number
  ) => {
    const margin = { 
      top: 40, 
      right: isMobile ? 5 : 20, 
      bottom: 20, 
      left: isMobile ? 5 : 20 
    };
    const innerWidth = width - margin.left - margin.right;
    
    // Create main group element
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Special mobile vertical layout
    if (isMobile) {
      // Title
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', -20)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text('Hash Buckets');
      
      // In mobile view, we stack buckets vertically
      const bucketHeight = 70; // Fixed height per bucket
      const bucketWidth = innerWidth;
      const padding = 10;
      
      // Create vertical bucket layout
      const bucketGroups = g.selectAll('.bucket')
        .data(buckets)
        .enter()
        .append('g')
        .attr('class', 'bucket')
        .attr('transform', (_, i) => `translate(0, ${i * (bucketHeight + padding)})`);
      
      // Bucket backgrounds with larger touch targets
      bucketGroups
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', bucketWidth)
        .attr('height', bucketHeight)
        .attr('fill', '#f9fafb')
        .attr('stroke', '#e5e7eb')
        .attr('rx', 5);
      
      // Make bucket labels more prominent
      bucketGroups
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 26)
        .attr('height', 20)
        .attr('fill', '#e2e8f0')
        .attr('rx', 3);
        
      bucketGroups
        .append('text')
        .attr('x', 13)
        .attr('y', 13)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .attr('fill', '#475569')
        .text((_, i) => `#${i}`);
      
      // Draw entries for each bucket
      bucketGroups.each(function(bucket, bucketIndex) {
        const bucketGroup = d3.select(this);
        
        if (bucket.length === 0) {
          // Empty bucket
          bucketGroup
            .append('text')
            .attr('x', bucketWidth / 2)
            .attr('y', bucketHeight / 2 + 5)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('font-size', '9px')
            .attr('fill', '#9ca3af')
            .text('Empty');
        } else {
          // Horizontal layout for entries within bucket
          const entriesContainer = bucketGroup.append('g')
            .attr('transform', `translate(10, 25)`);
          
          const entryWidth = Math.min(50, (bucketWidth - 20) / bucket.length);
          const entryHeight = 35;
          
          // Entry groups
          const entryGroups = entriesContainer.selectAll('.entry')
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
            .attr('width', entryWidth - 4)
            .attr('height', entryHeight)
            .attr('rx', 3)
            .attr('fill', (d, i) => getColor(d, bucketIndex * 100 + i))
            .attr('opacity', 0.8)
            .attr('stroke', '#d1d5db');
          
          // Key display
          entryGroups
            .append('text')
            .attr('x', (entryWidth - 4) / 2)
            .attr('y', 12)
            .attr('text-anchor', 'middle')
            .attr('font-size', '8px')
            .attr('font-weight', 'bold')
            .attr('fill', 'white')
            .text(d => {
              const keyText = String(d.key);
              return keyText.length > 4 ? keyText.substring(0, 3) + '…' : keyText;
            });
          
          // Value display
          entryGroups
            .append('text')
            .attr('x', (entryWidth - 4) / 2)
            .attr('y', 24)
            .attr('text-anchor', 'middle')
            .attr('font-size', '8px')
            .attr('fill', 'white')
            .text(d => {
              const valueText = String(d.value);
              return valueText.length > 4 ? valueText.substring(0, 3) + '…' : valueText;
            });
          
          // Show collision indicator
          if (bucket.length > 1) {
            // Create a small badge for collisions that stays inside the bucket
            const collisionBadge = bucketGroup.append('g')
              .attr('class', 'collision-badge')
              .attr('transform', `translate(${bucketWidth - 45}, 8)`);
              
              // Badge background
              collisionBadge.append('rect')
                .attr('width', 40)
                .attr('height', 16)
                .attr('rx', 8)
                .attr('fill', '#fee2e2')
                .attr('stroke', '#ef4444')
                .attr('stroke-width', 0.5);
                
              // Badge text - properly centered
              collisionBadge.append('text')
                .attr('x', 20)
                .attr('y', 8)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'central') // Use central for better vertical centering
                .attr('font-size', '8px')
                .attr('font-weight', 'bold')
                .attr('fill', '#ef4444')
                .text(`${bucket.length}×⚠️`);
          }
        }
      });
    } else {
      // Desktop layout (original code)
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
        .attr('height', (d) => {
          const bucketHeight = d.length > 0 
            ? d.length * entryHeight 
            : entryHeight;
          return bucketHeight + 20; // Add padding
        })
        .attr('fill', '#f9fafb')
        .attr('stroke', '#e5e7eb')
        .attr('rx', 4);
      
      // Draw entries for each bucket
      bucketGroups.each(function(bucket, bucketIndex) {
        const bucketGroup = d3.select(this);
        
        if (bucket.length === 0) {
          // Empty bucket
          bucketGroup
            .append('text')
            .attr('x', entryWidth / 2)
            .attr('y', entryHeight / 2 + 10)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('font-size', '10px')
            .attr('fill', '#9ca3af')
            .text('Empty');
        } else {
          // Entry groups
          const entryGroups = bucketGroup.selectAll('.entry')
            .data(bucket)
            .enter()
            .append('g')
            .attr('class', 'entry')
            .attr('transform', (_, i) => `translate(${entryWidth * 0.1}, ${i * entryHeight + 10})`)
            .style('cursor', 'pointer')
            .on('click', (_, d) => {
              if (onEntryClick) onEntryClick(d.key);
            });
          
          // Entry background
          entryGroups
            .append('rect')
            .attr('width', entryWidth * 0.8)
            .attr('height', entryHeight * 0.8)
            .attr('fill', (d, i) => getColor(d, bucketIndex * 100 + i))
            .attr('opacity', 0.7)
            .attr('stroke', '#d1d5db')
            .attr('rx', 4);
          
          // Entry key-value display
          entryGroups
            .append('text')
            .attr('x', entryWidth * 0.4)
            .attr('y', entryHeight * 0.3)
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .attr('fill', '#1f2937')
            .text(d => d.key);
          
          entryGroups
            .append('text')
            .attr('x', entryWidth * 0.4)
            .attr('y', entryHeight * 0.6)
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .attr('fill', '#1f2937')
            .text(d => d.value);
        }
      });
      
      // Add header
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', -30)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('padding-bottom', '40px')
        .text('Hash Buckets');
    }
  }, [buckets, entries, getColor, onEntryClick, isMobile]);

  // Main visualization effect
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || containerWidth === 0) return;
    
    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();
    
    const svg = d3.select(svgRef.current);
    
    // Calculate appropriate height based on data and container width
    let responsiveHeight = height;
    
    // For mobile bucket view, calculate the needed height based on number of buckets
    if (isMobile && visualStyle === 'buckets') {
      const bucketHeight = 70; // Fixed height per bucket
      const padding = 10;
      const totalBuckets = buckets.length;
      // Calculate minimum height needed to display all buckets plus margins
      // Add extra padding (80) to ensure all buckets are fully visible
      const neededHeight = totalBuckets * (bucketHeight + padding) + 80;
      responsiveHeight = Math.max(height, neededHeight);
      
      // Update the SVG height
      svg.attr('height', responsiveHeight);
    } else {
      responsiveHeight = isMobile 
        ? Math.min(height, window.innerHeight * 0.6) 
        : height;
    }
    
    // Set SVG dimensions
    svg
      .attr('width', containerWidth)
      .attr('height', responsiveHeight);
      
    // Create a group for all content that can be zoomed
    const mainGroup = svg.append('g');
    
    // Add zoom behavior for mobile
    if (isMobile) {
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.8, 3]) // Allow zooming from 0.8x to 3x
        .on('zoom', (event) => {
          mainGroup.attr('transform', event.transform);
        });
        
      // Use 'as any' to bypass the type check since we know this is valid
      (svg as any).call(zoom)
        .on("dblclick.zoom", null); // Disable double-click zoom
        
      // Add zoom hint text
      svg.append('text')
        .attr('x', containerWidth / 2)
        .attr('y', 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '8px')
        .attr('fill', '#64748B')
        .text('Pinch to zoom');
    }
    
    // Draw visualization based on style
    if (visualStyle === 'table') {
      renderTableVisualization(mainGroup, containerWidth, responsiveHeight);
    } else {
      renderBucketVisualization(mainGroup, containerWidth, responsiveHeight);
    }

    // Add animation if enabled
    if (showAnimation) {
      svg.selectAll('.entry')
        .attr('opacity', 0)
        .transition()
        .duration(300)
        .delay((_, i) => i * 50)
        .attr('opacity', 1);
    }
    
    // Highlight collisions if enabled
    if (showCollisions) {
      buckets.forEach((bucket, bucketIndex) => {
        if (bucket.length > 1) {
          // Add 'has-collision' class to the bucket element
          svg.select(`.bucket:nth-child(${bucketIndex + 1})`)
            .classed('has-collision', true);
            
          if (visualStyle === 'buckets') {
            svg.select(`.bucket:nth-child(${bucketIndex + 1})`)
              .append('text')
              .attr('x', isMobile ? 10 : 20)
              .attr('y', isMobile ? -5 : -25)
              .attr('text-anchor', 'start')
              .attr('font-size', isMobile ? '8px' : '10px')
              .attr('fill', '#ef4444')
              .text(isMobile ? `` : `${bucket.length} items (collision)`);
          }
        }
      });
    }
  }, [
    containerWidth,
    buckets,
    entries,
    visualStyle,
    height,
    renderTableVisualization,
    renderBucketVisualization,
    isMobile,
    showAnimation,
    showCollisions
  ]);

  return (
    <div 
      ref={containerRef} 
      className={`w-full ${isMobile && visualStyle === 'buckets' ? 'overflow-y-auto' : 'overflow-auto'}`}
      style={{ 
        minHeight: `${height}px`,
        maxHeight: isMobile && visualStyle === 'buckets' ? '80vh' : undefined,
        WebkitOverflowScrolling: 'touch' // Smooth scrolling on iOS
      }}
    >
      <svg
        ref={svgRef}
        className="d3-hash-visualizer"
        width="100%"
        height={height}
        style={{ 
          minWidth: isMobile ? '260px' : '500px',
          overflow: 'visible',
          touchAction: isMobile ? 'pan-y' : undefined
        }}
      />
      {isMobile && visualStyle === 'buckets' && (
        <div className="text-xs text-center text-muted-foreground mt-2 mb-4">
          Scroll to view all buckets
        </div>
      )}
    </div>
  );
} 