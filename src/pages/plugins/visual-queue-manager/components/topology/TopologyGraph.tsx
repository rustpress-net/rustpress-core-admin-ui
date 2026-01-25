/**
 * Topology Graph Component
 * Visual representation of exchanges, queues, and bindings
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  GitBranch,
  Layers,
  ArrowRightLeft,
  Radio,
  Share2,
  Hash,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Eye,
  EyeOff,
  Filter,
  Download,
} from 'lucide-react';
import { cn } from '../../../../../design-system/utils';
import { useQueueManagerStore } from '../../stores/queueManagerStore';
import type { Exchange, Queue, Binding, ExchangeType } from '../../types';

interface TopologyGraphProps {
  className?: string;
}

interface Node {
  id: string;
  type: 'exchange' | 'queue';
  name: string;
  x: number;
  y: number;
  data: Exchange | Queue;
}

interface Edge {
  id: string;
  source: string;
  target: string;
  routingKey: string;
}

const exchangeTypeIcons: Record<ExchangeType, React.ReactNode> = {
  direct: <ArrowRightLeft className="w-4 h-4" />,
  fanout: <Radio className="w-4 h-4" />,
  topic: <Share2 className="w-4 h-4" />,
  headers: <Hash className="w-4 h-4" />,
  'x-delayed-message': <GitBranch className="w-4 h-4" />,
  'x-consistent-hash': <GitBranch className="w-4 h-4" />,
};

const exchangeColors: Record<ExchangeType, { bg: string; border: string; text: string }> = {
  direct: { bg: 'fill-blue-100 dark:fill-blue-900/30', border: 'stroke-blue-500', text: 'text-blue-600' },
  fanout: { bg: 'fill-purple-100 dark:fill-purple-900/30', border: 'stroke-purple-500', text: 'text-purple-600' },
  topic: { bg: 'fill-green-100 dark:fill-green-900/30', border: 'stroke-green-500', text: 'text-green-600' },
  headers: { bg: 'fill-orange-100 dark:fill-orange-900/30', border: 'stroke-orange-500', text: 'text-orange-600' },
  'x-delayed-message': { bg: 'fill-pink-100 dark:fill-pink-900/30', border: 'stroke-pink-500', text: 'text-pink-600' },
  'x-consistent-hash': { bg: 'fill-cyan-100 dark:fill-cyan-900/30', border: 'stroke-cyan-500', text: 'text-cyan-600' },
};

export function TopologyGraph({ className }: TopologyGraphProps) {
  const { exchanges, queues, bindings } = useQueueManagerStore();

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'exchange' | 'queue'>('all');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Calculate node positions
  const { nodes, edges } = useMemo(() => {
    const nodeList: Node[] = [];
    const edgeList: Edge[] = [];

    // Position exchanges on the left
    exchanges.forEach((exchange, index) => {
      if (filterType === 'queue') return;
      nodeList.push({
        id: exchange.id,
        type: 'exchange',
        name: exchange.name,
        x: 150,
        y: 100 + index * 120,
        data: exchange,
      });
    });

    // Position queues on the right
    queues.forEach((queue, index) => {
      if (filterType === 'exchange') return;
      nodeList.push({
        id: queue.id,
        type: 'queue',
        name: queue.name,
        x: 550,
        y: 100 + index * 100,
        data: queue,
      });
    });

    // Create edges from bindings
    bindings.forEach((binding) => {
      const sourceNode = nodeList.find(n => n.id === binding.source);
      const targetNode = nodeList.find(n => n.id === binding.destination);
      if (sourceNode && targetNode) {
        edgeList.push({
          id: binding.id,
          source: binding.source,
          target: binding.destination,
          routingKey: binding.routingKey,
        });
      }
    });

    return { nodes: nodeList, edges: edgeList };
  }, [exchanges, queues, bindings, filterType]);

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.2, 2));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.2, 0.5));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getNodePosition = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  };

  const renderEdge = (edge: Edge) => {
    const source = getNodePosition(edge.source);
    const target = getNodePosition(edge.target);

    // Calculate control points for curved path
    const midX = (source.x + target.x) / 2;
    const path = `M ${source.x + 60} ${source.y} C ${midX} ${source.y}, ${midX} ${target.y}, ${target.x - 60} ${target.y}`;

    const isSelected = selectedNode === edge.source || selectedNode === edge.target;

    return (
      <g key={edge.id}>
        {/* Edge path */}
        <path
          d={path}
          fill="none"
          className={cn(
            'transition-all',
            isSelected
              ? 'stroke-primary-500 stroke-2'
              : 'stroke-neutral-300 dark:stroke-neutral-600 stroke-1'
          )}
          markerEnd="url(#arrowhead)"
        />
        {/* Routing key label */}
        {showLabels && edge.routingKey && (
          <text
            x={midX}
            y={(source.y + target.y) / 2 - 8}
            textAnchor="middle"
            className="text-xs fill-neutral-500 dark:fill-neutral-400"
          >
            {edge.routingKey}
          </text>
        )}
      </g>
    );
  };

  const renderExchangeNode = (node: Node) => {
    const exchange = node.data as Exchange;
    const colors = exchangeColors[exchange.type];
    const isSelected = selectedNode === node.id;

    return (
      <g
        key={node.id}
        transform={`translate(${node.x - 60}, ${node.y - 30})`}
        onClick={() => setSelectedNode(isSelected ? null : node.id)}
        className="cursor-pointer"
      >
        {/* Node shape - Diamond for exchange */}
        <motion.polygon
          points="60,0 120,30 60,60 0,30"
          className={cn(colors.bg, colors.border, 'stroke-2 transition-all')}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: isSelected ? 1.1 : 1,
            opacity: 1,
          }}
        />
        {/* Icon */}
        <foreignObject x="45" y="15" width="30" height="30">
          <div className={cn('flex items-center justify-center', colors.text)}>
            {exchangeTypeIcons[exchange.type]}
          </div>
        </foreignObject>
        {/* Label */}
        {showLabels && (
          <text
            x="60"
            y="75"
            textAnchor="middle"
            className="text-xs font-medium fill-neutral-700 dark:fill-neutral-300"
          >
            {node.name.length > 15 ? `${node.name.slice(0, 15)}...` : node.name}
          </text>
        )}
        {/* Type badge */}
        <text
          x="60"
          y="88"
          textAnchor="middle"
          className="text-[10px] fill-neutral-500 capitalize"
        >
          {exchange.type}
        </text>
      </g>
    );
  };

  const renderQueueNode = (node: Node) => {
    const queue = node.data as Queue;
    const isSelected = selectedNode === node.id;

    return (
      <g
        key={node.id}
        transform={`translate(${node.x - 60}, ${node.y - 25})`}
        onClick={() => setSelectedNode(isSelected ? null : node.id)}
        className="cursor-pointer"
      >
        {/* Node shape - Rectangle for queue */}
        <motion.rect
          width="120"
          height="50"
          rx="8"
          className={cn(
            'fill-primary-100 dark:fill-primary-900/30 stroke-primary-500 stroke-2 transition-all'
          )}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: isSelected ? 1.1 : 1,
            opacity: 1,
          }}
        />
        {/* Icon */}
        <foreignObject x="10" y="12" width="24" height="24">
          <div className="flex items-center justify-center text-primary-600">
            <Layers className="w-5 h-5" />
          </div>
        </foreignObject>
        {/* Queue info */}
        <text
          x="40"
          y="22"
          className="text-xs font-medium fill-neutral-700 dark:fill-neutral-300"
        >
          {node.name.length > 12 ? `${node.name.slice(0, 12)}...` : node.name}
        </text>
        <text
          x="40"
          y="38"
          className="text-[10px] fill-neutral-500"
        >
          {queue.messagesTotal} msgs • {queue.consumers} cons
        </text>
        {/* Label below */}
        {showLabels && (
          <text
            x="60"
            y="65"
            textAnchor="middle"
            className="text-[10px] fill-neutral-500 capitalize"
          >
            {queue.type} queue
          </text>
        )}
      </g>
    );
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
            title="Reset View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700 mx-1" />
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={cn(
              'p-2 rounded-lg text-neutral-600 dark:text-neutral-400',
              showLabels
                ? 'bg-neutral-100 dark:bg-neutral-800'
                : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
            )}
            title={showLabels ? 'Hide Labels' : 'Show Labels'}
          >
            {showLabels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500">Filter:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as typeof filterType)}
            className="h-8 px-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 border-0 text-sm"
          >
            <option value="all">All</option>
            <option value="exchange">Exchanges Only</option>
            <option value="queue">Queues Only</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <span>{exchanges.length} exchanges</span>
          <span>•</span>
          <span>{queues.length} queues</span>
          <span>•</span>
          <span>{bindings.length} bindings</span>
        </div>
      </div>

      {/* Graph Canvas */}
      <div
        className="flex-1 overflow-hidden bg-neutral-50 dark:bg-neutral-950"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          width="100%"
          height="100%"
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
        >
          {/* Defs for markers */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                className="fill-neutral-400 dark:fill-neutral-500"
              />
            </marker>
            {/* Grid pattern */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                className="stroke-neutral-200 dark:stroke-neutral-800"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>

          {/* Background grid */}
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Transform group for zoom and pan */}
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Edges */}
            {edges.map(renderEdge)}

            {/* Nodes */}
            {nodes.map(node =>
              node.type === 'exchange'
                ? renderExchangeNode(node)
                : renderQueueNode(node)
            )}
          </g>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rotate-45 bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500" />
          <span className="text-xs text-neutral-600 dark:text-neutral-400">Exchange</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-4 rounded bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-500" />
          <span className="text-xs text-neutral-600 dark:text-neutral-400">Queue</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-neutral-400" />
          <span className="text-xs text-neutral-600 dark:text-neutral-400">Binding</span>
        </div>
      </div>
    </div>
  );
}

export default TopologyGraph;
