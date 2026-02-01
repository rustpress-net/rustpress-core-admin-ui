/**
 * WorkflowConnection - Renders connection lines between nodes
 * Uses bezier curves with smooth animations and prominent arrows
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Connection, WorkflowNode } from '../../types/workflow';
import { useWorkflowStore } from '../../store/workflowStore';

interface WorkflowConnectionProps {
  connection: Connection;
  nodes: WorkflowNode[];
  isSelected: boolean;
  executionOrder?: number; // Optional execution order number
}

// Helper to calculate point on bezier curve at t (0-1)
function getBezierPoint(
  t: number,
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number }
) {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;

  return {
    x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
    y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y,
  };
}

// Helper to calculate tangent/derivative at point t on bezier curve
function getBezierTangent(
  t: number,
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number }
) {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;

  const dx = 3 * mt2 * (p1.x - p0.x) + 6 * mt * t * (p2.x - p1.x) + 3 * t2 * (p3.x - p2.x);
  const dy = 3 * mt2 * (p1.y - p0.y) + 6 * mt * t * (p2.y - p1.y) + 3 * t2 * (p3.y - p2.y);

  return { dx, dy };
}

export function WorkflowConnection({ connection, nodes, isSelected, executionOrder }: WorkflowConnectionProps) {
  const { deleteConnection, canvas } = useWorkflowStore();

  const sourceNode = nodes.find((n) => n.id === connection.sourceNodeId);
  const targetNode = nodes.find((n) => n.id === connection.targetNodeId);

  if (!sourceNode || !targetNode) return null;

  // Calculate port positions
  const sourceWidth = sourceNode.size?.width || 200;
  const sourceHeight = sourceNode.size?.height || 80;
  const targetWidth = targetNode.size?.width || 200;
  const targetHeight = targetNode.size?.height || 80;

  // Find port indices for vertical offset
  const sourcePortIndex = sourceNode.outputs.findIndex((p) => p.id === connection.sourcePortId);
  const targetPortIndex = targetNode.inputs.findIndex((p) => p.id === connection.targetPortId);
  const sourcePortOffset = sourcePortIndex * 12;
  const targetPortOffset = targetPortIndex * 12;

  // Start point (right side of source node)
  const startX = sourceNode.position.x + sourceWidth;
  const startY = sourceNode.position.y + sourceHeight / 2 + sourcePortOffset;

  // End point (left side of target node)
  const endX = targetNode.position.x;
  const endY = targetNode.position.y + targetHeight / 2 + targetPortOffset;

  // Calculate bezier control points for smooth curves
  const deltaX = Math.abs(endX - startX);
  const controlOffset = Math.max(50, deltaX * 0.4);

  // Control points for bezier calculation
  const p0 = { x: startX, y: startY };
  const p1 = { x: startX + controlOffset, y: startY };
  const p2 = { x: endX - controlOffset, y: endY };
  const p3 = { x: endX, y: endY };

  // Path with bezier curves
  const path = `M ${startX} ${startY} C ${startX + controlOffset} ${startY}, ${endX - controlOffset} ${endY}, ${endX} ${endY}`;

  // Calculate mid-point arrow position and rotation
  const midArrow = useMemo(() => {
    const midPoint = getBezierPoint(0.5, p0, p1, p2, p3);
    const tangent = getBezierTangent(0.5, p0, p1, p2, p3);
    const angle = Math.atan2(tangent.dy, tangent.dx) * (180 / Math.PI);
    return { point: midPoint, angle };
  }, [startX, startY, endX, endY, controlOffset]);

  // Calculate end arrow angle
  const endArrow = useMemo(() => {
    const tangent = getBezierTangent(1, p0, p1, p2, p3);
    const angle = Math.atan2(tangent.dy, tangent.dx) * (180 / Math.PI);
    return { angle };
  }, [startX, startY, endX, endY, controlOffset]);

  // Determine connection color based on type or status - using hex values for SVG compatibility
  const getConnectionColor = () => {
    if (connection.condition?.type === 'expression') {
      return { stroke: '#f59e0b', fill: '#f59e0b' }; // amber-500
    }
    if (isSelected) {
      return { stroke: '#6366f1', fill: '#6366f1' }; // primary-500
    }
    return { stroke: '#737373', fill: '#737373' }; // neutral-500
  };

  const colors = getConnectionColor();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Select connection or delete on click
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteConnection(connection.id);
  };

  // Arrow size - larger for better visibility
  const arrowSize = isSelected ? 14 : 12;
  const arrowWidth = isSelected ? 8 : 6;

  return (
    <g className="cursor-pointer" onClick={handleClick} onDoubleClick={handleDoubleClick}>
      {/* SVG Defs for arrow markers */}
      <defs>
        <marker
          id={`arrowhead-${connection.id}`}
          markerWidth={arrowSize}
          markerHeight={arrowSize}
          refX={arrowSize - 2}
          refY={arrowSize / 2}
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <polygon
            points={`0,0 ${arrowSize},${arrowSize / 2} 0,${arrowSize}`}
            fill={colors.fill}
          />
        </marker>
      </defs>

      {/* Invisible wider path for easier selection */}
      <path
        d={path}
        stroke="transparent"
        strokeWidth={24}
        fill="none"
        className="pointer-events-auto"
      />

      {/* Glow effect when selected */}
      {isSelected && (
        <motion.path
          d={path}
          stroke="rgb(99, 102, 241)"
          strokeWidth={8}
          strokeOpacity={0.25}
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4 }}
        />
      )}

      {/* Main connection line - thicker for visibility */}
      <motion.path
        d={path}
        stroke={colors.stroke}
        strokeWidth={isSelected ? 3 : 2.5}
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />

      {/* Mid-point directional arrow */}
      <g transform={`translate(${midArrow.point.x}, ${midArrow.point.y}) rotate(${midArrow.angle})`}>
        <polygon
          points={`${-arrowSize / 2},-${arrowWidth / 2} ${arrowSize / 2},0 ${-arrowSize / 2},${arrowWidth / 2}`}
          fill={colors.fill}
        />
      </g>

      {/* End arrow - larger and more prominent */}
      <g transform={`translate(${endX}, ${endY}) rotate(${endArrow.angle})`}>
        <polygon
          points={`${-arrowSize},-${arrowWidth} 0,0 ${-arrowSize},${arrowWidth}`}
          fill={colors.fill}
        />
        {/* Arrow border for better visibility */}
        <polygon
          points={`${-arrowSize},-${arrowWidth} 0,0 ${-arrowSize},${arrowWidth}`}
          stroke={isSelected ? '#4f46e5' : '#525252'}
          strokeWidth={0.5}
          fill="none"
        />
      </g>

      {/* Animated flow dots - always show for better understanding */}
      <motion.circle
        r={4}
        fill={colors.fill}
        initial={{ offsetDistance: '0%' }}
        animate={{ offsetDistance: '100%' }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          offsetPath: `path('${path}')`,
        }}
      />

      {/* Second flow dot with delay for continuous flow effect */}
      <motion.circle
        r={3}
        fill={colors.fill}
        opacity={0.6}
        initial={{ offsetDistance: '0%' }}
        animate={{ offsetDistance: '100%' }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'linear',
          delay: 1.25,
        }}
        style={{
          offsetPath: `path('${path}')`,
        }}
      />

      {/* Connection label */}
      {connection.label && (
        <g>
          <rect
            x={(startX + endX) / 2 - 30}
            y={(startY + endY) / 2 - 22}
            width={60}
            height={18}
            rx={4}
            fill="#ffffff"
            stroke={colors.stroke}
            strokeWidth={1}
          />
          <text
            x={(startX + endX) / 2}
            y={(startY + endY) / 2 - 10}
            textAnchor="middle"
            fill="#404040"
            fontSize={11}
            fontWeight={500}
            style={{ pointerEvents: 'none' }}
          >
            {connection.label}
          </text>
        </g>
      )}

      {/* Execution order badge */}
      {executionOrder !== undefined && (
        <g>
          <circle
            cx={midArrow.point.x}
            cy={midArrow.point.y - 18}
            r={10}
            fill="#6366f1"
          />
          <text
            x={midArrow.point.x}
            y={midArrow.point.y - 14}
            textAnchor="middle"
            fill="#ffffff"
            fontSize={10}
            fontWeight={700}
            style={{ pointerEvents: 'none' }}
          >
            {executionOrder}
          </text>
        </g>
      )}
    </g>
  );
}

export default WorkflowConnection;
