/**
 * Real-time & Monitoring Components
 * 1. Live Activity Stream
 * 2. Interactive System Map
 * 3. Anomaly Detection Alerts
 * 4. Custom Alert Rules
 * 5. Incident Timeline
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  XCircle,
  Bell,
  BellRing,
  Zap,
  Server,
  Database,
  Cloud,
  Globe,
  Wifi,
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
  Plus,
  Trash2,
  Edit,
  Play,
  Pause,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Filter,
  Search,
  MoreHorizontal,
  Link2,
  Unlink,
  ArrowRight,
  Circle,
  GitCommit,
  MessageSquare,
  User,
  Settings,
  Shield,
  Lock,
  Unlock,
  Download,
  Upload,
  FileText,
  Code,
  Terminal,
  Bug,
  Lightbulb,
  Target,
  Crosshair,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
  Input,
} from '../../design-system';

// ============================================================================
// 1. LIVE ACTIVITY STREAM
// ============================================================================

interface ActivityEvent {
  id: string;
  type: 'user' | 'system' | 'security' | 'deployment' | 'error' | 'integration';
  action: string;
  description: string;
  timestamp: Date;
  user?: string;
  app?: string;
  severity?: 'info' | 'warning' | 'error' | 'success';
  metadata?: Record<string, any>;
}

const mockLiveEvents: ActivityEvent[] = [
  { id: '1', type: 'user', action: 'Login', description: 'john.doe@company.com logged in from Chrome/macOS', timestamp: new Date(), user: 'john.doe@company.com', severity: 'info' },
  { id: '2', type: 'deployment', action: 'Deploy', description: 'Task Manager v2.4.2 deployed to production', timestamp: new Date(Date.now() - 30000), app: 'Task Manager', severity: 'success' },
  { id: '3', type: 'security', action: 'Alert', description: 'Unusual API activity detected from IP 192.168.1.45', timestamp: new Date(Date.now() - 60000), severity: 'warning' },
  { id: '4', type: 'error', action: 'Error', description: 'Database connection timeout in Analytics Pro', timestamp: new Date(Date.now() - 120000), app: 'Analytics Pro', severity: 'error' },
  { id: '5', type: 'integration', action: 'Sync', description: 'Salesforce sync completed - 1,234 records updated', timestamp: new Date(Date.now() - 180000), severity: 'success' },
  { id: '6', type: 'system', action: 'Backup', description: 'Automated backup completed successfully', timestamp: new Date(Date.now() - 240000), severity: 'success' },
];

export function LiveActivityStream() {
  const [events, setEvents] = useState<ActivityEvent[]>(mockLiveEvents);
  const [isPaused, setIsPaused] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const streamRef = useRef<HTMLDivElement>(null);

  // Simulate real-time events
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const newEvent: ActivityEvent = {
        id: Date.now().toString(),
        type: ['user', 'system', 'security', 'deployment', 'error', 'integration'][Math.floor(Math.random() * 6)] as ActivityEvent['type'],
        action: ['Login', 'Deploy', 'Update', 'Create', 'Delete', 'Sync'][Math.floor(Math.random() * 6)],
        description: `New activity detected at ${new Date().toLocaleTimeString()}`,
        timestamp: new Date(),
        severity: ['info', 'warning', 'error', 'success'][Math.floor(Math.random() * 4)] as ActivityEvent['severity'],
      };

      setEvents(prev => [newEvent, ...prev.slice(0, 49)]);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const getEventIcon = (type: ActivityEvent['type']) => {
    const icons = {
      user: <User className="w-4 h-4" />,
      system: <Server className="w-4 h-4" />,
      security: <Shield className="w-4 h-4" />,
      deployment: <Upload className="w-4 h-4" />,
      error: <Bug className="w-4 h-4" />,
      integration: <Link2 className="w-4 h-4" />,
    };
    return icons[type];
  };

  const getSeverityColor = (severity?: ActivityEvent['severity']) => {
    const colors = {
      info: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      warning: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
      error: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
      success: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    };
    return colors[severity || 'info'];
  };

  const filteredEvents = filter === 'all' ? events : events.filter(e => e.type === filter);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Activity className="w-5 h-5 text-green-500" />
              {!isPaused && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">Live Activity Stream</h3>
            <Badge variant={isPaused ? 'warning' : 'success'} size="sm">
              {isPaused ? 'Paused' : 'Live'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg px-2 py-1 bg-white dark:bg-neutral-800"
            >
              <option value="all">All Events</option>
              <option value="user">User</option>
              <option value="system">System</option>
              <option value="security">Security</option>
              <option value="deployment">Deployment</option>
              <option value="error">Errors</option>
              <option value="integration">Integration</option>
            </select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardBody className="p-0 max-h-[400px] overflow-y-auto" ref={streamRef}>
        <AnimatePresence>
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="flex items-start gap-3 p-3 border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
            >
              <div className={`p-2 rounded-lg ${getSeverityColor(event.severity)}`}>
                {getEventIcon(event.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-neutral-900 dark:text-white text-sm">{event.action}</span>
                  <Badge variant="secondary" size="xs">{event.type}</Badge>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">{event.description}</p>
                <p className="text-xs text-neutral-400 mt-1">
                  {event.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardBody>
    </Card>
  );
}

// ============================================================================
// 2. INTERACTIVE SYSTEM MAP
// ============================================================================

interface SystemNode {
  id: string;
  name: string;
  type: 'app' | 'database' | 'cache' | 'cdn' | 'api' | 'service';
  status: 'healthy' | 'degraded' | 'critical' | 'offline';
  connections: string[];
  metrics: {
    cpu: number;
    memory: number;
    requests: number;
    latency: number;
  };
  position: { x: number; y: number };
}

const mockSystemNodes: SystemNode[] = [
  { id: 'lb', name: 'Load Balancer', type: 'service', status: 'healthy', connections: ['api1', 'api2'], metrics: { cpu: 25, memory: 40, requests: 15000, latency: 5 }, position: { x: 50, y: 20 } },
  { id: 'api1', name: 'API Server 1', type: 'api', status: 'healthy', connections: ['db', 'cache'], metrics: { cpu: 45, memory: 60, requests: 8000, latency: 45 }, position: { x: 25, y: 50 } },
  { id: 'api2', name: 'API Server 2', type: 'api', status: 'degraded', connections: ['db', 'cache'], metrics: { cpu: 78, memory: 85, requests: 7000, latency: 120 }, position: { x: 75, y: 50 } },
  { id: 'db', name: 'Database', type: 'database', status: 'healthy', connections: [], metrics: { cpu: 35, memory: 70, requests: 5000, latency: 12 }, position: { x: 35, y: 80 } },
  { id: 'cache', name: 'Redis Cache', type: 'cache', status: 'healthy', connections: [], metrics: { cpu: 15, memory: 45, requests: 25000, latency: 2 }, position: { x: 65, y: 80 } },
];

export function InteractiveSystemMap() {
  const [nodes] = useState<SystemNode[]>(mockSystemNodes);
  const [selectedNode, setSelectedNode] = useState<SystemNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const getNodeIcon = (type: SystemNode['type']) => {
    const icons = {
      app: <Globe className="w-5 h-5" />,
      database: <Database className="w-5 h-5" />,
      cache: <Zap className="w-5 h-5" />,
      cdn: <Cloud className="w-5 h-5" />,
      api: <Server className="w-5 h-5" />,
      service: <Settings className="w-5 h-5" />,
    };
    return icons[type];
  };

  const getStatusColor = (status: SystemNode['status']) => {
    const colors = {
      healthy: 'bg-green-500',
      degraded: 'bg-yellow-500',
      critical: 'bg-red-500',
      offline: 'bg-neutral-400',
    };
    return colors[status];
  };

  const getNodeBgColor = (status: SystemNode['status']) => {
    const colors = {
      healthy: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700',
      degraded: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700',
      critical: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700',
      offline: 'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600',
    };
    return colors[status];
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-neutral-900 dark:text-white">System Topology</h3>
          </div>
          <div className="flex items-center gap-2">
            {['healthy', 'degraded', 'critical', 'offline'].map((status) => (
              <div key={status} className="flex items-center gap-1 text-xs text-neutral-500">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(status as SystemNode['status'])}`} />
                <span className="capitalize">{status}</span>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="relative h-[300px] bg-neutral-50 dark:bg-neutral-800/50 rounded-xl overflow-hidden">
          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {nodes.map(node =>
              node.connections.map(targetId => {
                const target = nodes.find(n => n.id === targetId);
                if (!target) return null;
                const isHighlighted = hoveredNode === node.id || hoveredNode === targetId;
                return (
                  <line
                    key={`${node.id}-${targetId}`}
                    x1={`${node.position.x}%`}
                    y1={`${node.position.y}%`}
                    x2={`${target.position.x}%`}
                    y2={`${target.position.y}%`}
                    stroke={isHighlighted ? '#3b82f6' : '#d1d5db'}
                    strokeWidth={isHighlighted ? 2 : 1}
                    strokeDasharray={isHighlighted ? '0' : '4'}
                    className="transition-all duration-300"
                  />
                );
              })
            )}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => (
            <motion.div
              key={node.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer`}
              style={{ left: `${node.position.x}%`, top: `${node.position.y}%` }}
              whileHover={{ scale: 1.1 }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => setSelectedNode(node)}
            >
              <div className={`p-3 rounded-xl border-2 ${getNodeBgColor(node.status)} transition-all ${hoveredNode === node.id ? 'shadow-lg' : ''}`}>
                <div className="flex items-center gap-2">
                  {getNodeIcon(node.type)}
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(node.status)} ${node.status !== 'offline' ? 'animate-pulse' : ''}`} />
                </div>
              </div>
              <p className="text-xs text-center mt-1 font-medium text-neutral-700 dark:text-neutral-300">{node.name}</p>
            </motion.div>
          ))}
        </div>

        {/* Selected Node Details */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getNodeIcon(selectedNode.type)}
                  <span className="font-semibold text-neutral-900 dark:text-white">{selectedNode.name}</span>
                  <Badge variant={selectedNode.status === 'healthy' ? 'success' : selectedNode.status === 'degraded' ? 'warning' : 'danger'} size="sm">
                    {selectedNode.status}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedNode(null)}>
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">{selectedNode.metrics.cpu}%</p>
                  <p className="text-xs text-neutral-500">CPU</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">{selectedNode.metrics.memory}%</p>
                  <p className="text-xs text-neutral-500">Memory</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">{(selectedNode.metrics.requests / 1000).toFixed(1)}k</p>
                  <p className="text-xs text-neutral-500">Requests/min</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">{selectedNode.metrics.latency}ms</p>
                  <p className="text-xs text-neutral-500">Latency</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardBody>
    </Card>
  );
}

// ============================================================================
// 3. ANOMALY DETECTION ALERTS
// ============================================================================

interface Anomaly {
  id: string;
  type: 'traffic' | 'performance' | 'security' | 'usage' | 'cost';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: Date;
  metric: string;
  expected: number;
  actual: number;
  deviation: number;
  status: 'active' | 'investigating' | 'resolved' | 'dismissed';
  aiConfidence: number;
}

const mockAnomalies: Anomaly[] = [
  { id: '1', type: 'traffic', title: 'Unusual traffic spike', description: 'API requests 340% above normal baseline', severity: 'high', detectedAt: new Date(Date.now() - 300000), metric: 'requests/min', expected: 5000, actual: 22000, deviation: 340, status: 'investigating', aiConfidence: 94 },
  { id: '2', type: 'performance', title: 'Response time degradation', description: 'P95 latency increased significantly', severity: 'medium', detectedAt: new Date(Date.now() - 600000), metric: 'p95_latency_ms', expected: 150, actual: 450, deviation: 200, status: 'active', aiConfidence: 87 },
  { id: '3', type: 'security', title: 'Failed login attempts surge', description: 'Multiple failed attempts from single IP range', severity: 'critical', detectedAt: new Date(Date.now() - 120000), metric: 'failed_logins', expected: 10, actual: 847, deviation: 8370, status: 'investigating', aiConfidence: 98 },
  { id: '4', type: 'cost', title: 'Unexpected cost increase', description: 'Cloud spend 45% above projected budget', severity: 'medium', detectedAt: new Date(Date.now() - 3600000), metric: 'daily_cost_usd', expected: 450, actual: 652, deviation: 45, status: 'active', aiConfidence: 82 },
];

export function AnomalyDetectionAlerts() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>(mockAnomalies);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getSeverityColor = (severity: Anomaly['severity']) => {
    const colors = {
      low: 'bg-blue-500',
      medium: 'bg-yellow-500',
      high: 'bg-orange-500',
      critical: 'bg-red-500',
    };
    return colors[severity];
  };

  const getTypeIcon = (type: Anomaly['type']) => {
    const icons = {
      traffic: <Activity className="w-4 h-4" />,
      performance: <Zap className="w-4 h-4" />,
      security: <Shield className="w-4 h-4" />,
      usage: <TrendingUp className="w-4 h-4" />,
      cost: <Target className="w-4 h-4" />,
    };
    return icons[type];
  };

  const handleStatusChange = (id: string, newStatus: Anomaly['status']) => {
    setAnomalies(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-neutral-900 dark:text-white">AI Anomaly Detection</h3>
            <Badge variant="danger" size="sm">{anomalies.filter(a => a.status === 'active').length} Active</Badge>
          </div>
          <Button variant="ghost" size="sm" leftIcon={<RefreshCw className="w-4 h-4" />}>
            Scan Now
          </Button>
        </div>
      </CardHeader>
      <CardBody className="space-y-3">
        {anomalies.map((anomaly) => (
          <motion.div
            key={anomaly.id}
            className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden"
          >
            <div
              className="p-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
              onClick={() => setExpandedId(expandedId === anomaly.id ? null : anomaly.id)}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getSeverityColor(anomaly.severity)} text-white`}>
                  {getTypeIcon(anomaly.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-neutral-900 dark:text-white">{anomaly.title}</span>
                    <Badge variant={anomaly.severity === 'critical' ? 'danger' : anomaly.severity === 'high' ? 'warning' : 'secondary'} size="xs">
                      {anomaly.severity.toUpperCase()}
                    </Badge>
                    <Badge variant="secondary" size="xs">
                      AI: {anomaly.aiConfidence}%
                    </Badge>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{anomaly.description}</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Detected {Math.round((Date.now() - anomaly.detectedAt.getTime()) / 60000)} min ago
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={anomaly.status === 'resolved' ? 'success' : anomaly.status === 'investigating' ? 'warning' : 'danger'} size="sm">
                    {anomaly.status}
                  </Badge>
                  <ChevronDown className={`w-4 h-4 transition-transform ${expandedId === anomaly.id ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedId === anomaly.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50"
                >
                  <div className="p-4">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-white dark:bg-neutral-800 rounded-lg">
                        <p className="text-sm text-neutral-500">Expected</p>
                        <p className="text-xl font-bold text-neutral-900 dark:text-white">{anomaly.expected.toLocaleString()}</p>
                        <p className="text-xs text-neutral-400">{anomaly.metric}</p>
                      </div>
                      <div className="text-center p-3 bg-white dark:bg-neutral-800 rounded-lg">
                        <p className="text-sm text-neutral-500">Actual</p>
                        <p className="text-xl font-bold text-red-600">{anomaly.actual.toLocaleString()}</p>
                        <p className="text-xs text-neutral-400">{anomaly.metric}</p>
                      </div>
                      <div className="text-center p-3 bg-white dark:bg-neutral-800 rounded-lg">
                        <p className="text-sm text-neutral-500">Deviation</p>
                        <p className="text-xl font-bold text-orange-600">+{anomaly.deviation}%</p>
                        <p className="text-xs text-neutral-400">from baseline</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleStatusChange(anomaly.id, 'investigating')}
                        disabled={anomaly.status === 'investigating'}
                      >
                        Investigate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(anomaly.id, 'resolved')}
                      >
                        Mark Resolved
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusChange(anomaly.id, 'dismissed')}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </CardBody>
    </Card>
  );
}

// ============================================================================
// 4. CUSTOM ALERT RULES
// ============================================================================

interface AlertRule {
  id: string;
  name: string;
  description: string;
  metric: string;
  condition: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  duration: number; // minutes
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: ('email' | 'slack' | 'webhook' | 'sms')[];
  enabled: boolean;
  lastTriggered?: Date;
  triggerCount: number;
}

const mockAlertRules: AlertRule[] = [
  { id: '1', name: 'High CPU Usage', description: 'Alert when CPU exceeds 80%', metric: 'cpu_percent', condition: 'gt', threshold: 80, duration: 5, severity: 'high', channels: ['email', 'slack'], enabled: true, lastTriggered: new Date(Date.now() - 86400000), triggerCount: 12 },
  { id: '2', name: 'Memory Critical', description: 'Memory usage above 90%', metric: 'memory_percent', condition: 'gt', threshold: 90, duration: 2, severity: 'critical', channels: ['email', 'slack', 'sms'], enabled: true, lastTriggered: new Date(Date.now() - 172800000), triggerCount: 3 },
  { id: '3', name: 'API Errors Spike', description: 'Error rate exceeds 5%', metric: 'error_rate', condition: 'gt', threshold: 5, duration: 1, severity: 'high', channels: ['slack', 'webhook'], enabled: true, triggerCount: 8 },
  { id: '4', name: 'Low Disk Space', description: 'Disk usage above 85%', metric: 'disk_percent', condition: 'gt', threshold: 85, duration: 10, severity: 'medium', channels: ['email'], enabled: false, triggerCount: 0 },
];

export function CustomAlertRules() {
  const [rules, setRules] = useState<AlertRule[]>(mockAlertRules);
  const [showNewRule, setShowNewRule] = useState(false);

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const getConditionLabel = (condition: AlertRule['condition']) => {
    const labels = { gt: '>', lt: '<', eq: '=', gte: '≥', lte: '≤' };
    return labels[condition];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-neutral-900 dark:text-white">Alert Rules</h3>
            <Badge variant="secondary" size="sm">{rules.filter(r => r.enabled).length} Active</Badge>
          </div>
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowNewRule(true)}>
            New Rule
          </Button>
        </div>
      </CardHeader>
      <CardBody className="space-y-3">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`p-4 rounded-xl border ${rule.enabled ? 'border-neutral-200 dark:border-neutral-700' : 'border-neutral-100 dark:border-neutral-800 opacity-60'} transition-all`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-neutral-900 dark:text-white">{rule.name}</span>
                  <Badge
                    variant={rule.severity === 'critical' ? 'danger' : rule.severity === 'high' ? 'warning' : 'secondary'}
                    size="xs"
                  >
                    {rule.severity}
                  </Badge>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">{rule.description}</p>
                <div className="flex items-center gap-4 text-xs text-neutral-500">
                  <span className="font-mono bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                    {rule.metric} {getConditionLabel(rule.condition)} {rule.threshold}
                  </span>
                  <span>for {rule.duration}min</span>
                  <span>Triggered {rule.triggerCount}x</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {rule.channels.map((channel) => (
                    <Badge key={channel} variant="secondary" size="xs">{channel}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <button
                  onClick={() => toggleRule(rule.id)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${rule.enabled ? 'bg-green-500' : 'bg-neutral-300 dark:bg-neutral-600'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${rule.enabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}

// ============================================================================
// 5. INCIDENT TIMELINE
// ============================================================================

interface IncidentEvent {
  id: string;
  type: 'detected' | 'acknowledged' | 'investigating' | 'identified' | 'fix_deployed' | 'monitoring' | 'resolved' | 'postmortem';
  timestamp: Date;
  description: string;
  user?: string;
  automated?: boolean;
}

interface Incident {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved';
  startedAt: Date;
  resolvedAt?: Date;
  affectedServices: string[];
  events: IncidentEvent[];
  rootCause?: string;
  impactSummary?: string;
}

const mockIncidents: Incident[] = [
  {
    id: '1',
    title: 'Database Connection Failures',
    severity: 'high',
    status: 'resolved',
    startedAt: new Date(Date.now() - 7200000),
    resolvedAt: new Date(Date.now() - 3600000),
    affectedServices: ['API Server', 'Analytics Pro', 'CRM Suite'],
    rootCause: 'Connection pool exhaustion due to slow queries',
    impactSummary: '45 minutes of degraded service, 2.3% of requests affected',
    events: [
      { id: '1', type: 'detected', timestamp: new Date(Date.now() - 7200000), description: 'Anomaly detection triggered: Database error rate spike', automated: true },
      { id: '2', type: 'acknowledged', timestamp: new Date(Date.now() - 7140000), description: 'Incident acknowledged by on-call engineer', user: 'john.doe@company.com' },
      { id: '3', type: 'investigating', timestamp: new Date(Date.now() - 7000000), description: 'Investigation started - checking database logs and metrics', user: 'john.doe@company.com' },
      { id: '4', type: 'identified', timestamp: new Date(Date.now() - 6000000), description: 'Root cause identified: Connection pool exhaustion from slow queries in analytics service', user: 'jane.smith@company.com' },
      { id: '5', type: 'fix_deployed', timestamp: new Date(Date.now() - 4500000), description: 'Fix deployed: Increased connection pool size and optimized slow queries', user: 'jane.smith@company.com' },
      { id: '6', type: 'monitoring', timestamp: new Date(Date.now() - 4200000), description: 'Fix verified, monitoring for stability', user: 'john.doe@company.com' },
      { id: '7', type: 'resolved', timestamp: new Date(Date.now() - 3600000), description: 'Incident resolved - all services operating normally', user: 'john.doe@company.com' },
    ],
  },
];

export function IncidentTimeline() {
  const [incidents] = useState<Incident[]>(mockIncidents);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(mockIncidents[0]);

  const getEventIcon = (type: IncidentEvent['type']) => {
    const icons = {
      detected: <AlertCircle className="w-4 h-4" />,
      acknowledged: <Eye className="w-4 h-4" />,
      investigating: <Search className="w-4 h-4" />,
      identified: <Lightbulb className="w-4 h-4" />,
      fix_deployed: <Upload className="w-4 h-4" />,
      monitoring: <Activity className="w-4 h-4" />,
      resolved: <CheckCircle className="w-4 h-4" />,
      postmortem: <FileText className="w-4 h-4" />,
    };
    return icons[type];
  };

  const getEventColor = (type: IncidentEvent['type']) => {
    const colors = {
      detected: 'bg-red-500',
      acknowledged: 'bg-yellow-500',
      investigating: 'bg-blue-500',
      identified: 'bg-purple-500',
      fix_deployed: 'bg-cyan-500',
      monitoring: 'bg-orange-500',
      resolved: 'bg-green-500',
      postmortem: 'bg-neutral-500',
    };
    return colors[type];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitCommit className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-neutral-900 dark:text-white">Incident Timeline</h3>
          </div>
          <Button variant="ghost" size="sm">View All Incidents</Button>
        </div>
      </CardHeader>
      <CardBody>
        {selectedIncident && (
          <>
            {/* Incident Header */}
            <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-neutral-900 dark:text-white">{selectedIncident.title}</h4>
                  <p className="text-sm text-neutral-500">
                    Duration: {selectedIncident.resolvedAt
                      ? `${Math.round((selectedIncident.resolvedAt.getTime() - selectedIncident.startedAt.getTime()) / 60000)} minutes`
                      : 'Ongoing'}
                  </p>
                </div>
                <Badge variant={selectedIncident.status === 'resolved' ? 'success' : 'danger'} size="sm">
                  {selectedIncident.status}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedIncident.affectedServices.map((service) => (
                  <Badge key={service} variant="secondary" size="xs">{service}</Badge>
                ))}
              </div>
              {selectedIncident.rootCause && (
                <div className="text-sm">
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">Root Cause: </span>
                  <span className="text-neutral-600 dark:text-neutral-400">{selectedIncident.rootCause}</span>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="relative pl-6">
              <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-neutral-200 dark:bg-neutral-700" />
              {selectedIncident.events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative mb-4 last:mb-0"
                >
                  <div className={`absolute -left-4 w-4 h-4 rounded-full ${getEventColor(event.type)} flex items-center justify-center text-white`}>
                    <div className="w-2 h-2">{getEventIcon(event.type)}</div>
                  </div>
                  <div className="ml-4 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-neutral-500 uppercase">{event.type.replace('_', ' ')}</span>
                      {event.automated && <Badge variant="secondary" size="xs">Automated</Badge>}
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">{event.description}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-neutral-400">
                      <span>{event.timestamp.toLocaleTimeString()}</span>
                      {event.user && <span>• {event.user}</span>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}
