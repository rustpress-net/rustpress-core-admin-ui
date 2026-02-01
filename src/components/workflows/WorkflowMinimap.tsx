/**
 * WorkflowMinimap - Bird's eye view navigation for the canvas
 */

import React, { useMemo, useCallback } from 'react';
import type { WorkflowNode, Connection, Position } from '../../types/workflow';

interface WorkflowMinimapProps {
  nodes: WorkflowNode[];
  connections: Connection[];
  viewportSize: { width: number; height: number };
  zoom: number;
  pan: Position;
  onPanChange: (pan: Position) => void;
}

export function WorkflowMinimap({
  nodes,
  connections,
  viewportSize,
  zoom,
  pan,
  onPanChange,
}: WorkflowMinimapProps) {
  const minimapSize = { width: 180, height: 120 };
  const padding = 20;

  // Calculate bounds of all nodes
  const bounds = useMemo(() => {
    if (nodes.length === 0) {
      return { minX: 0, minY: 0, maxX: 1000, maxY: 800 };
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    nodes.forEach((node) => {
      const width = node.size?.width || 200;
      const height = node.size?.height || 80;
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + width);
      maxY = Math.max(maxY, node.position.y + height);
    });

    // Add padding
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    return { minX, minY, maxX, maxY };
  }, [nodes]);

  // Calculate scale to fit content in minimap
  const scale = useMemo(() => {
    const contentWidth = bounds.maxX - bounds.minX;
    const contentHeight = bounds.maxY - bounds.minY;
    return Math.min(
      (minimapSize.width - 10) / contentWidth,
      (minimapSize.height - 10) / contentHeight
    );
  }, [bounds]);

  // Transform coordinates to minimap space
  const toMinimap = useCallback((x: number, y: number) => ({
    x: (x - bounds.minX) * scale + 5,
    y: (y - bounds.minY) * scale + 5,
  }), [bounds, scale]);

  // Calculate viewport rectangle
  const viewportRect = useMemo(() => {
    const x = (-pan.x / zoom - bounds.minX) * scale + 5;
    const y = (-pan.y / zoom - bounds.minY) * scale + 5;
    const width = (viewportSize.width / zoom) * scale;
    const height = (viewportSize.height / zoom) * scale;
    return { x, y, width, height };
  }, [pan, zoom, viewportSize, bounds, scale]);

  // Handle click on minimap to pan
  const handleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert minimap coordinates to canvas coordinates
    const canvasX = (x - 5) / scale + bounds.minX;
    const canvasY = (y - 5) / scale + bounds.minY;

    // Center the viewport on the clicked point
    const newPanX = -(canvasX * zoom - viewportSize.width / 2);
    const newPanY = -(canvasY * zoom - viewportSize.height / 2);

    onPanChange({ x: newPanX, y: newPanY });
  }, [scale, bounds, zoom, viewportSize, onPanChange]);

  if (nodes.length === 0) return null;

  return (
    <div className="absolute top-4 right-4 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      <svg
        width={minimapSize.width}
        height={minimapSize.height}
        className="cursor-crosshair"
        onClick={handleClick}
      >
        {/* Background */}
        <rect
          width={minimapSize.width}
          height={minimapSize.height}
          className="fill-neutral-100 dark:fill-neutral-900"
        />

        {/* Connections */}
        {connections.map((conn) => {
          const source = nodes.find((n) => n.id === conn.sourceNodeId);
          const target = nodes.find((n) => n.id === conn.targetNodeId);
          if (!source || !target) return null;

          const sourcePos = toMinimap(
            source.position.x + (source.size?.width || 200),
            source.position.y + (source.size?.height || 80) / 2
          );
          const targetPos = toMinimap(
            target.position.x,
            target.position.y + (target.size?.height || 80) / 2
          );

          return (
            <line
              key={conn.id}
              x1={sourcePos.x}
              y1={sourcePos.y}
              x2={targetPos.x}
              y2={targetPos.y}
              className="stroke-neutral-400 dark:stroke-neutral-500"
              strokeWidth={0.5}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const pos = toMinimap(node.position.x, node.position.y);
          const width = ((node.size?.width || 200) * scale);
          const height = ((node.size?.height || 80) * scale);

          return (
            <rect
              key={node.id}
              x={pos.x}
              y={pos.y}
              width={Math.max(width, 4)}
              height={Math.max(height, 2)}
              rx={1}
              className={
                node.category === 'trigger'
                  ? 'fill-green-500'
                  : node.category === 'action'
                  ? 'fill-blue-500'
                  : node.category === 'logic'
                  ? 'fill-amber-500'
                  : node.category === 'transform'
                  ? 'fill-purple-500'
                  : 'fill-neutral-500'
              }
            />
          );
        })}

        {/* Viewport Rectangle */}
        <rect
          x={viewportRect.x}
          y={viewportRect.y}
          width={viewportRect.width}
          height={viewportRect.height}
          fill="none"
          stroke="rgb(99, 102, 241)"
          strokeWidth={1.5}
          strokeDasharray="2,2"
          rx={2}
        />
      </svg>
    </div>
  );
}

export default WorkflowMinimap;
