import { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import * as d3 from 'd3';
import { BinaryTreeNode } from '../../../types/visualizer';
import { Button } from '@radix-ui/themes';
import { ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

interface D3BinaryTreeVisualizerProps {
  root: BinaryTreeNode | null;
  height?: number;
  onNodeClick?: (nodeId: string) => void;
}

// Export these methods to be callable from the parent component
export interface D3BinaryTreeVisualizerRef {
  panToNode: (nodeId: string) => void;
  resetView: () => void;
}

export const D3BinaryTreeVisualizer = forwardRef<D3BinaryTreeVisualizerRef, D3BinaryTreeVisualizerProps>(
  ({ root, height = 400, onNodeClick }, ref) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [zoomLevel, setZoomLevel] = useState(1);
    const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
    const treeDataRef = useRef<d3.HierarchyPointNode<BinaryTreeNode>[] | null>(null);
    
    // Calculate the maximum depth of the tree
    const calculateTreeDepth = (node: BinaryTreeNode | null): number => {
      if (!node) return 0;
      return 1 + Math.max(calculateTreeDepth(node.left), calculateTreeDepth(node.right));
    };
    
    // Calculate the maximum width of the tree at any level
    const calculateTreeWidth = (node: BinaryTreeNode | null): number => {
      if (!node) return 0;
      
      // Count nodes at each level and return the maximum
      const countNodesAtLevel = (n: BinaryTreeNode | null, level: number, targetLevel: number): number => {
        if (!n) return 0;
        if (level === targetLevel) return 1;
        return countNodesAtLevel(n.left, level + 1, targetLevel) + countNodesAtLevel(n.right, level + 1, targetLevel);
      };
      
      const depth = calculateTreeDepth(node);
      let maxWidth = 0;
      
      for (let i = 0; i < depth; i++) {
        const width = countNodesAtLevel(node, 0, i);
        maxWidth = Math.max(maxWidth, width);
      }
      
      return maxWidth;
    };

    // Expose methods to parent component via ref
    useImperativeHandle(ref, () => ({
      panToNode: (nodeId: string) => {
        if (!svgRef.current || !zoomBehaviorRef.current || !treeDataRef.current) return;
        
        // Find the node with the matching ID
        const nodeData = treeDataRef.current.find(d => d.data.id === nodeId);
        if (!nodeData) return;
        
        const svg = d3.select(svgRef.current);
        const containerWidth = containerRef.current?.clientWidth || 600;
        const containerHeight = containerRef.current?.clientHeight || 400;
        
        // Get current transform
        const currentTransform = d3.zoomTransform(svgRef.current);
        
        // Calculate the transform to center on this node
        // We want to maintain the current zoom level
        const scale = currentTransform.k;
        const translateX = (containerWidth / 2) - (nodeData.y * scale);
        const translateY = (containerHeight / 2) - (nodeData.x * scale);
        
        // Animate to the node
        svg.transition()
          .duration(750)
          .call(zoomBehaviorRef.current.transform,
            d3.zoomIdentity
              .translate(translateX, translateY)
              .scale(scale)
          );
      },
      resetView: () => {
        handleResetZoom();
      }
    }));

    // Handle window resize
    useEffect(() => {
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Create the visualization
    useEffect(() => {
      if (!svgRef.current || !containerRef.current) return;

      // Preserve current transformation if available
      let currentTransform: d3.ZoomTransform | null = null;
      if (zoomBehaviorRef.current && svgRef.current) {
        currentTransform = d3.zoomTransform(svgRef.current);
      }

      // Clear previous content
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      // Get container dimensions
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;

      // If no tree data, show empty state
      if (!root) {
        svg
          .attr("width", "100%")
          .attr("height", "100%")
          .append("text")
          .attr("x", "50%")
          .attr("y", "50%")
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .style("font-size", "1.2rem")
          .style("fill", "#333333")
          .text("Empty Tree");
        return;
      }

      // Calculate tree dimensions
      const treeDepth = calculateTreeDepth(root);
      const treeWidth = calculateTreeWidth(root);
      
      // Determine if we're on mobile
      const isMobile = windowWidth < 768;
      
      // Set up dimensions based on tree size and container
      const margin = { top: 40, right: 80, bottom: 40, left: 80 };
      
      // Determine node spacing based on tree size and viewport
      const nodeSize = isMobile ? 18 : 22;
      const nodeRadius = nodeSize / 2;
      
      // Calculate horizontal and vertical spacing
      // Adjusted for better visibility based on tree size
      const baseHorizontalSpacing = nodeSize * 3;
      const baseVerticalSpacing = nodeSize * 4;
      
      // Scale spacing based on container dimensions and tree size
      // This ensures smaller trees are still well-spaced while larger trees fit better
      const horizontalSpacingFactor = Math.min(2, Math.max(1, 5 / Math.max(1, treeWidth)));
      const verticalSpacingFactor = Math.min(2, Math.max(1, 4 / Math.max(1, treeDepth)));
      
      const horizontalSpacing = baseHorizontalSpacing * horizontalSpacingFactor;
      const verticalSpacing = baseVerticalSpacing * verticalSpacingFactor;
      
      // Calculate SVG dimensions that will ensure the tree fits
      // Set sensible caps on the SVG size to avoid extremely large SVGs that make zooming confusing
      const svgWidth = Math.min(3000, Math.max(containerWidth, (horizontalSpacing * Math.max(3, treeWidth + 1)) + margin.left + margin.right));
      const svgHeight = Math.min(2000, Math.max(containerHeight, (verticalSpacing * Math.max(3, treeDepth + 1)) + margin.top + margin.bottom));
      
      // Set SVG dimensions and viewBox for responsiveness
      svg
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

      // Create the main group for the tree
      const mainGroup = svg.append("g");
      
      // Create a zoom behavior
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.2, 4]) // Allow zooming from 0.2x to 4x
        .on("zoom", (event) => {
          mainGroup.attr("transform", event.transform);
          setZoomLevel(event.transform.k);
        });
      
      // Store the zoom behavior for external controls
      zoomBehaviorRef.current = zoom;
      
      // Apply zoom behavior to SVG
      svg.call(zoom);
      
      // Disable double-click zoom (can be confusing)
      svg.on("dblclick.zoom", null);
      
      // Add pinch-to-zoom hint for mobile
      if (isMobile) {
        svg.append('text')
          .attr('x', containerWidth / 2)
          .attr('y', 15)
          .attr('text-anchor', 'middle')
          .attr('font-size', '10px')
          .attr('fill', '#64748B')
          .text('Pinch to zoom');
      }
      
      // Create a horizontal tree layout
      const treeLayout = d3.tree<BinaryTreeNode>()
        .size([svgHeight * 0.6, svgWidth * 0.6])
        .nodeSize([verticalSpacing, horizontalSpacing])
        .separation((a, b) => a.parent === b.parent ? 1.2 : 1.8);

      // Convert BinaryTreeNode to d3 hierarchy
      const hierarchy = d3.hierarchy(root, d => {
        const children: BinaryTreeNode[] = [];
        if (d.left) children.push(d.left);
        if (d.right) children.push(d.right);
        return children;
      });

      // Compute the tree layout
      const treeData = treeLayout(hierarchy);
      treeDataRef.current = treeData.descendants();

      // If we have a previous transform, use it, otherwise calculate an initial one
      // that centers the whole tree
      if (currentTransform && currentTransform.k !== 1) {
        // Use the existing transform if we have one
        svg.call(zoom.transform, currentTransform);
      } else {
        // Calculate initial transform to center the tree and make it fully visible
        // First, get the bounds of the tree
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        
        treeDataRef.current.forEach(node => {
          // Account for node radius in the bounds calculation
          minX = Math.min(minX, node.x - nodeRadius);
          maxX = Math.max(maxX, node.x + nodeRadius);
          minY = Math.min(minY, node.y - nodeRadius);
          maxY = Math.max(maxY, node.y + nodeRadius);
        });
        
        // Add padding around the tree (increase for better visibility)
        const padding = Math.max(nodeSize * 4, 100);
        minX -= padding;
        maxX += padding;
        minY -= padding;
        maxY += padding;
        
        // Calculate scale to fit the tree in the container
        const treeWidth = maxX - minX;
        const treeHeight = maxY - minY;
        
        // Calculate the scale based on both dimensions with a margin
        const scaleX = (containerWidth - margin.left - margin.right) / treeWidth;
        const scaleY = (containerHeight - margin.top - margin.bottom) / treeHeight;
        
        // Find the limiting dimension, with a safe scaling factor
        // For trees, we often want to scale a bit smaller to ensure visibility
        const scale = Math.min(scaleX, scaleY) * 0.9;
        
        // Ensure the scale is within reasonable bounds
        const finalScale = Math.min(Math.max(scale, 0.4), 1.0);
        
        // Calculate center position of the tree
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        
        // Create a transform that centers the tree and scales it to fit
        const initialTransform = d3.zoomIdentity
          .translate(containerWidth / 2 - centerX * finalScale, containerHeight / 2 - centerY * finalScale)
          .scale(finalScale);
        
        // Apply the transform with a brief transition for a smoother experience
        svg.transition()
          .duration(300)
          .call(zoom.transform, initialTransform);
      }

      // Draw links
      mainGroup.selectAll(".link")
        .data(treeData.links())
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", d3.linkHorizontal<d3.HierarchyPointLink<BinaryTreeNode>, d3.HierarchyPointNode<BinaryTreeNode>>()
          .x(d => d.y) // x and y are swapped for horizontal layout
          .y(d => d.x)
        )
        .style("fill", "none")
        .style("stroke", "#cbd5e1")
        .style("stroke-width", 2);

      // Create node groups
      const nodeGroups = mainGroup.selectAll(".node")
        .data(treeData.descendants())
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("id", d => `node-${d.data.id}`)
        .attr("transform", d => `translate(${d.y},${d.x})`) // x and y are swapped for horizontal layout
        .style("cursor", "pointer")
        .on("click", (event, d) => {
          // Prevent the click from triggering zoom
          event.stopPropagation();
          
          if (onNodeClick) {
            onNodeClick(d.data.id);
          }
        });

      // Add circle for each node
      nodeGroups.append("circle")
        .attr("r", nodeRadius)
        .style("fill", d => {
          switch (d.data.status) {
            case 'visiting': return '#3b82f6'; // Blue
            case 'inserting': return '#22c55e'; // Green
            case 'removing': return '#ef4444'; // Red
            case 'found': return '#f59e0b'; // Amber
            default: return '#f8fafc'; // Default light background
          }
        })
        .style("stroke", d => {
          switch (d.data.status) {
            case 'visiting': return '#2563eb'; // Darker blue
            case 'inserting': return '#16a34a'; // Darker green
            case 'removing': return '#dc2626'; // Darker red
            case 'found': return '#d97706'; // Darker amber
            default: return '#94a3b8'; // Default border
          }
        })
        .style("stroke-width", 2);

      // Add text for node value
      nodeGroups.append("text")
        .attr("dy", ".3em")
        .attr("text-anchor", "middle")
        .style("font-size", isMobile ? "12px" : "14px")
        .style("font-weight", "bold")
        .style("fill", d => {
          switch (d.data.status) {
            case 'visiting':
            case 'inserting':
            case 'removing':
            case 'found':
              return '#ffffff';
            default:
              return '#334155';
          }
        })
        .text(d => d.data.value);

      // Add balance factor or height if auto-balancing is enabled
      if (root.height !== undefined) {
        nodeGroups.append("text")
          .attr("dy", isMobile ? -15 : -18)
          .attr("text-anchor", "middle")
          .style("font-size", isMobile ? "10px" : "12px")
          .style("fill", "#64748b")
          .text(d => {
            if (d.data.balanceFactor !== undefined) {
              return `BF: ${d.data.balanceFactor}`;
            }
            return `H: ${d.data.height || 1}`;
          });
      }
      
      // Add animation to make nodes appear gradually
      nodeGroups
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .delay((_, i) => i * 50)
        .attr("opacity", 1);
        
    }, [root, height, windowWidth, onNodeClick]);

    // Zoom control handlers
    const handleZoomIn = () => {
      if (!svgRef.current || !zoomBehaviorRef.current) return;
      
      const svg = d3.select(svgRef.current);
      const newZoomLevel = Math.min(zoomLevel * 1.3, 4);
      
      svg.transition()
        .duration(300)
        .call(zoomBehaviorRef.current.scaleTo, newZoomLevel);
    };

    const handleZoomOut = () => {
      if (!svgRef.current || !zoomBehaviorRef.current) return;
      
      const svg = d3.select(svgRef.current);
      const newZoomLevel = Math.max(zoomLevel / 1.3, 0.2);
      
      svg.transition()
        .duration(300)
        .call(zoomBehaviorRef.current.scaleTo, newZoomLevel);
    };

    const handleResetZoom = () => {
      if (!svgRef.current || !zoomBehaviorRef.current || !containerRef.current || !treeDataRef.current || treeDataRef.current.length === 0) {
        return;
      }
      
      const svg = d3.select(svgRef.current);
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      // Calculate the bounds of the tree
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      const nodeRadius = (windowWidth < 768 ? 18 : 22) / 2;
      
      treeDataRef.current.forEach(node => {
        // Account for node radius in the bounds calculation
        minX = Math.min(minX, node.x - nodeRadius);
        maxX = Math.max(maxX, node.x + nodeRadius);
        minY = Math.min(minY, node.y - nodeRadius);
        maxY = Math.max(maxY, node.y + nodeRadius);
      });
      
      // Add padding around the tree
      const padding = Math.max(nodeRadius * 8, 100);
      minX -= padding;
      maxX += padding;
      minY -= padding;
      maxY += padding;
      
      // Calculate tree dimensions
      const treeWidth = maxX - minX;
      const treeHeight = maxY - minY;
      
      // Calculate the scale based on both dimensions with a margin
      const scaleX = (containerWidth - 160) / treeWidth; // Account for margins
      const scaleY = (containerHeight - 80) / treeHeight;
      
      // Find the limiting dimension with a slight reduction for safety
      const scale = Math.min(scaleX, scaleY) * 0.9;
      
      // Ensure the scale is within reasonable bounds
      const finalScale = Math.min(Math.max(scale, 0.4), 1.0);
      
      // Calculate center position of the tree
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      
      // Create a transform that centers the tree and scales it to fit
      const transform = d3.zoomIdentity
        .translate(containerWidth / 2 - centerX * finalScale, containerHeight / 2 - centerY * finalScale)
        .scale(finalScale);
      
      // Apply the transform with a transition for a smoother experience
      svg.transition()
        .duration(750)
        .call(zoomBehaviorRef.current.transform, transform);
    };

    return (
      <div ref={containerRef} className="w-full flex flex-col bg-white" style={{ height: height }}>
        <div className="flex justify-end gap-1 p-2">
          <Button
            variant="outline"
            size="1"
            onClick={handleZoomIn}
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="1"
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="1" 
            onClick={handleResetZoom}
            title="Reset Zoom"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-hidden" style={{ height: 'calc(100% - 48px)' }}>
          <svg 
            ref={svgRef} 
            width="100%" 
            height="100%" 
            className="touch-manipulation"
          ></svg>
        </div>
      </div>
    );
  }
); 