/**
 * WorkflowCanvas - Visual Workflow Builder Canvas
 * Handles drag-drop, panning, zooming, and node connections
 */

import React, { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkflowStore } from '../../store/workflowStore';
import { WorkflowNodeComponent } from './WorkflowNode';
import { WorkflowConnection } from './WorkflowConnection';
import { WorkflowMinimap } from './WorkflowMinimap';
import type { Position, NodeType, WorkflowNode, Connection } from '../../types/workflow';

// Calculate execution order using BFS from trigger nodes
function calculateExecutionOrder(
  nodes: WorkflowNode[],
  connections: Connection[]
): Map<string, number> {
  const orderMap = new Map<string, number>();

  // Find trigger nodes (nodes with no incoming connections or trigger types)
  const triggerTypes = ['manual', 'schedule', 'webhook', 'event'];
  const incomingConnections = new Map<string, string[]>();

  connections.forEach(conn => {
    const existing = incomingConnections.get(conn.targetNodeId) || [];
    existing.push(conn.sourceNodeId);
    incomingConnections.set(conn.targetNodeId, existing);
  });

  // Start from trigger nodes
  const triggerNodes = nodes.filter(n =>
    triggerTypes.includes(n.type) || !incomingConnections.has(n.id)
  );

  // BFS to assign order
  const visited = new Set<string>();
  const queue: { nodeId: string; order: number }[] = [];

  triggerNodes.forEach((node, index) => {
    queue.push({ nodeId: node.id, order: index + 1 });
  });

  let currentOrder = triggerNodes.length;

  while (queue.length > 0) {
    const { nodeId, order } = queue.shift()!;

    if (visited.has(nodeId)) continue;
    visited.add(nodeId);

    // Only set order if not already set (keep first/lowest order)
    if (!orderMap.has(nodeId)) {
      orderMap.set(nodeId, order);
    }

    // Find outgoing connections
    const outgoing = connections.filter(c => c.sourceNodeId === nodeId);
    outgoing.forEach(conn => {
      if (!visited.has(conn.targetNodeId)) {
        currentOrder++;
        queue.push({ nodeId: conn.targetNodeId, order: currentOrder });
      }
    });
  }

  return orderMap;
}

interface WorkflowCanvasProps {
  className?: string;
}

export function WorkflowCanvas({ className }: WorkflowCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Position | null>(null);
  const [mousePosition, setMousePosition] = useState<Position>({ x: 0, y: 0 });

  const {
    currentWorkflow,
    canvas,
    setZoom,
    setPan,
    selectNode,
    deselectAll,
    addNode,
    addConnection,
    stopConnecting,
    setHoveredPort,
    startSelection,
    updateSelection,
    endSelection,
    selectNodes,
    setDragging,
  } = useWorkflowStore();

  // Update canvas size on resize
  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current) {
        setCanvasSize({
          width: canvasRef.current.clientWidth,
          height: canvasRef.current.clientHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Handle wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setZoom(canvas.zoom + delta);
  }, [canvas.zoom, setZoom]);

  // Handle mouse down for panning or selection
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target !== canvasRef.current) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left - canvas.pan.x) / canvas.zoom;
    const y = (e.clientY - rect.top - canvas.pan.y) / canvas.zoom;

    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      // Middle click or Alt+click for panning
      setIsPanning(true);
      setPanStart({ x: e.clientX - canvas.pan.x, y: e.clientY - canvas.pan.y });
    } else if (e.button === 0 && e.shiftKey) {
      // Shift+click for selection box
      startSelection({ x, y });
    } else if (e.button === 0) {
      // Regular click to deselect
      deselectAll();
    }
  }, [canvas.pan, canvas.zoom, deselectAll, startSelection]);

  // Handle mouse move for panning, selection, or connection preview
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left - canvas.pan.x) / canvas.zoom;
    const y = (e.clientY - rect.top - canvas.pan.y) / canvas.zoom;
    setMousePosition({ x, y });

    if (isPanning && panStart) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }

    if (canvas.isSelecting) {
      updateSelection({ x, y });
    }
  }, [isPanning, panStart, canvas.pan, canvas.zoom, canvas.isSelecting, setPan, updateSelection]);

  // Handle mouse up
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setIsPanning(false);
      setPanStart(null);
    }

    if (canvas.isSelecting && canvas.selectionBox) {
      // Find nodes within selection box
      const { start, end } = canvas.selectionBox;
      const minX = Math.min(start.x, end.x);
      const maxX = Math.max(start.x, end.x);
      const minY = Math.min(start.y, end.y);
      const maxY = Math.max(start.y, end.y);

      const selectedIds = currentWorkflow?.nodes
        .filter((node) => {
          const nodeX = node.position.x;
          const nodeY = node.position.y;
          const nodeWidth = node.size?.width || 200;
          const nodeHeight = node.size?.height || 80;
          return (
            nodeX >= minX &&
            nodeX + nodeWidth <= maxX &&
            nodeY >= minY &&
            nodeY + nodeHeight <= maxY
          );
        })
        .map((n) => n.id) || [];

      selectNodes(selectedIds);
      endSelection();
    }

    if (canvas.connectingFrom) {
      // Check if we're hovering over a valid port to complete the connection
      if (canvas.hoveredPort) {
        const { nodeId: targetNodeId, portId: targetPortId, portType: targetPortType } = canvas.hoveredPort;
        const { nodeId: sourceNodeId, portId: sourcePortId, portType: sourcePortType } = canvas.connectingFrom;

        // Validate connection: different nodes and different port types
        if (sourceNodeId !== targetNodeId && sourcePortType !== targetPortType) {
          if (sourcePortType === 'output') {
            // Dragging from output to input
            addConnection(sourceNodeId, sourcePortId, targetNodeId, targetPortId);
          } else {
            // Dragging from input to output
            addConnection(targetNodeId, targetPortId, sourceNodeId, sourcePortId);
          }
        }
        setHoveredPort(null);
      }
      stopConnecting();
    }

    setDragging(false);
  }, [isPanning, canvas.isSelecting, canvas.selectionBox, canvas.connectingFrom, canvas.hoveredPort, currentWorkflow?.nodes, selectNodes, endSelection, stopConnecting, setDragging, addConnection, setHoveredPort]);

  // Handle drop for new nodes
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const nodeType = e.dataTransfer.getData('nodeType') as NodeType;
    if (!nodeType) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left - canvas.pan.x) / canvas.zoom;
    const y = (e.clientY - rect.top - canvas.pan.y) / canvas.zoom;

    addNode(nodeType, { x, y });
  }, [canvas.pan, canvas.zoom, addNode]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete selected nodes
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (canvas.selectedNodeIds.length > 0) {
          e.preventDefault();
          useWorkflowStore.getState().deleteSelectedNodes();
        }
      }

      // Escape to deselect
      if (e.key === 'Escape') {
        deselectAll();
        stopConnecting();
      }

      // Cmd/Ctrl + A to select all
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault();
        const allIds = currentWorkflow?.nodes.map((n) => n.id) || [];
        selectNodes(allIds);
      }

      // Cmd/Ctrl + C to copy
      if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
        e.preventDefault();
        useWorkflowStore.getState().copyNodes();
      }

      // Cmd/Ctrl + V to paste
      if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
        e.preventDefault();
        useWorkflowStore.getState().pasteNodes();
      }

      // Cmd/Ctrl + X to cut
      if ((e.metaKey || e.ctrlKey) && e.key === 'x') {
        e.preventDefault();
        useWorkflowStore.getState().cutNodes();
      }

      // Cmd/Ctrl + Z to undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        useWorkflowStore.getState().undo();
      }

      // Cmd/Ctrl + Shift + Z to redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        useWorkflowStore.getState().redo();
      }

      // + to zoom in
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        useWorkflowStore.getState().zoomIn();
      }

      // - to zoom out
      if (e.key === '-') {
        e.preventDefault();
        useWorkflowStore.getState().zoomOut();
      }

      // 0 to reset view
      if (e.key === '0') {
        e.preventDefault();
        useWorkflowStore.getState().resetView();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canvas.selectedNodeIds, currentWorkflow?.nodes, deselectAll, selectNodes, stopConnecting]);

  // Calculate execution order for all nodes
  const executionOrderMap = useMemo(() => {
    if (!currentWorkflow) return new Map<string, number>();
    return calculateExecutionOrder(currentWorkflow.nodes, currentWorkflow.connections);
  }, [currentWorkflow?.nodes, currentWorkflow?.connections]);

  if (!currentWorkflow) {
    return (
      <div className={`flex items-center justify-center h-full bg-neutral-50 dark:bg-neutral-900 ${className}`}>
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
            <svg className="w-12 h-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
            No Workflow Selected
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400">
            Create a new workflow or select an existing one to start editing
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={canvasRef}
      className={`relative overflow-hidden bg-neutral-50 dark:bg-neutral-900 ${className}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{ cursor: isPanning ? 'grabbing' : canvas.connectingFrom ? 'crosshair' : 'default' }}
    >
      {/* Grid Background */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle, rgba(100,100,100,0.15) 1px, transparent 1px)
          `,
          backgroundSize: `${20 * canvas.zoom}px ${20 * canvas.zoom}px`,
          backgroundPosition: `${canvas.pan.x % (20 * canvas.zoom)}px ${canvas.pan.y % (20 * canvas.zoom)}px`,
        }}
      />

      {/* Canvas Content */}
      <div
        className="absolute"
        style={{
          transform: `translate(${canvas.pan.x}px, ${canvas.pan.y}px) scale(${canvas.zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {/* Connections Layer */}
        <svg
          className="absolute top-0 left-0 overflow-visible pointer-events-none"
          style={{ width: '10000px', height: '10000px' }}
        >
          {currentWorkflow.connections.map((connection) => (
            <WorkflowConnection
              key={connection.id}
              connection={connection}
              nodes={currentWorkflow.nodes}
              isSelected={canvas.selectedConnectionIds.includes(connection.id)}
            />
          ))}

          {/* Connection Preview */}
          {canvas.connectingFrom && (
            <ConnectionPreview
              fromNode={currentWorkflow.nodes.find((n) => n.id === canvas.connectingFrom?.nodeId)}
              fromPortId={canvas.connectingFrom.portId}
              fromPortType={canvas.connectingFrom.portType}
              mousePosition={mousePosition}
            />
          )}
        </svg>

        {/* Nodes Layer */}
        <AnimatePresence>
          {currentWorkflow.nodes.map((node) => (
            <WorkflowNodeComponent
              key={node.id}
              node={node}
              isSelected={canvas.selectedNodeIds.includes(node.id)}
              isHovered={canvas.hoveredNodeId === node.id}
              isConnecting={canvas.connectingFrom !== null}
              onSelect={() => selectNode(node.id)}
              canvasZoom={canvas.zoom}
              executionOrder={executionOrderMap.get(node.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Selection Box */}
      {canvas.isSelecting && canvas.selectionBox && (
        <div
          className="absolute border-2 border-primary-500 bg-primary-500/10 pointer-events-none"
          style={{
            left: Math.min(canvas.selectionBox.start.x, canvas.selectionBox.end.x) * canvas.zoom + canvas.pan.x,
            top: Math.min(canvas.selectionBox.start.y, canvas.selectionBox.end.y) * canvas.zoom + canvas.pan.y,
            width: Math.abs(canvas.selectionBox.end.x - canvas.selectionBox.start.x) * canvas.zoom,
            height: Math.abs(canvas.selectionBox.end.y - canvas.selectionBox.start.y) * canvas.zoom,
          }}
        />
      )}

      {/* Minimap */}
      <WorkflowMinimap
        nodes={currentWorkflow.nodes}
        connections={currentWorkflow.connections}
        viewportSize={canvasSize}
        zoom={canvas.zoom}
        pan={canvas.pan}
        onPanChange={setPan}
      />

      {/* Zoom Controls */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-1">
        <button
          onClick={() => useWorkflowStore.getState().zoomOut()}
          className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 min-w-[50px] text-center">
          {Math.round(canvas.zoom * 100)}%
        </span>
        <button
          onClick={() => useWorkflowStore.getState().zoomIn()}
          className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700" />
        <button
          onClick={() => useWorkflowStore.getState().fitToScreen()}
          className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md transition-colors"
          title="Fit to Screen"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>

      {/* Help Text */}
      <div className="absolute bottom-4 right-4 text-xs text-neutral-400 dark:text-neutral-500">
        <span className="bg-white/80 dark:bg-neutral-800/80 px-2 py-1 rounded">
          Scroll to zoom | Alt+drag to pan | Shift+drag to select
        </span>
      </div>
    </div>
  );
}

// Connection Preview Component
function ConnectionPreview({
  fromNode,
  fromPortId,
  fromPortType,
  mousePosition,
}: {
  fromNode: any;
  fromPortId: string;
  fromPortType: 'input' | 'output';
  mousePosition: Position;
}) {
  if (!fromNode) return null;

  const nodeWidth = fromNode.size?.width || 200;
  const nodeHeight = fromNode.size?.height || 80;

  let startX: number, startY: number;

  if (fromPortType === 'output') {
    startX = fromNode.position.x + nodeWidth;
    startY = fromNode.position.y + nodeHeight / 2;
  } else {
    startX = fromNode.position.x;
    startY = fromNode.position.y + nodeHeight / 2;
  }

  const endX = mousePosition.x;
  const endY = mousePosition.y;

  // Bezier curve control points
  const midX = (startX + endX) / 2;
  const controlOffset = Math.abs(endX - startX) * 0.5;

  const path = fromPortType === 'output'
    ? `M ${startX} ${startY} C ${startX + controlOffset} ${startY}, ${endX - controlOffset} ${endY}, ${endX} ${endY}`
    : `M ${startX} ${startY} C ${startX - controlOffset} ${startY}, ${endX + controlOffset} ${endY}, ${endX} ${endY}`;

  return (
    <path
      d={path}
      stroke="rgb(99, 102, 241)"
      strokeWidth={2}
      strokeDasharray="5,5"
      fill="none"
      className="pointer-events-none"
    />
  );
}

export default WorkflowCanvas;
