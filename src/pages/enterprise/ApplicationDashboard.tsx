/**
 * Enterprise Application Dashboard
 * Comprehensive dashboard with 50 enterprise features for app management
 * Reuses design-system components from CMS Dashboard for consistency
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  Users,
  Play,
  Settings,
  Download,
  Activity,
  Zap,
  Package,
  BarChart3,
  FileText,
  Shield,
  Key,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Upload,
  GitBranch,
  GitMerge,
  Server,
  Database,
  Wifi,
  WifiOff,
  Globe,
  Link,
  Webhook,
  Code,
  Cpu,
  HardDrive,
  MemoryStick,
  Gauge,
  LineChart,
  Search,
  MoreHorizontal,
  Plus,
  Check,
  HelpCircle,
  MessageSquare,
  CreditCard,
  DollarSign,
  Receipt,
  Wallet,
  FileCheck,
  ShieldCheck,
  Fingerprint,
  Scan,
  Workflow,
  Archive,
  Pause,
  PlayCircle,
  RotateCcw,
  ClipboardList,
  CalendarClock,
  UserPlus,
  UsersRound,
  Rocket,
} from 'lucide-react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  PageHeader,
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
  Grid,
  AnimatedGrid,
  StaticDashboardGrid,
  GridItem,
  MetricCard,
  ActivityFeed,
  ActivityTimeline,
  ProgressCard,
  ScheduleWidget,
  NotificationWidget,
  StatComparison,
  SparklineChart,
  SystemHealthMonitor,
  UptimeStatusIndicator,
  QuickStatsRow,
  staggerContainer,
  staggerItem,
  fadeInUp,
} from '../../design-system';
import { useAppStore } from '../../store/appStore';
import { useDashboardStore } from '../../store/dashboardStore';

// Import 30 Enterprise Enhancement Components
// Real-Time & Monitoring (5 features)
import {
  LiveActivityStream,
  InteractiveSystemMap,
  AnomalyDetectionAlerts,
  CustomAlertRules,
  IncidentTimeline,
} from '../../components/app-dashboard/RealTimeMonitoring';

// Analytics & Reporting (5 features)
import {
  CustomDashboardBuilder,
  SavedReportTemplates,
  ExportManager,
  TrendForecasting,
  FunnelAnalysis,
} from '../../components/app-dashboard/AnalyticsReporting';

// Security & Compliance (5 features)
import {
  ThreatIntelligenceFeed,
  PenetrationTestResults,
  ComplianceChecklist,
  DataClassificationMap,
  AccessReviewWorkflows,
} from '../../components/app-dashboard/SecurityCompliance';

// User Experience (5 features)
import {
  CustomizableThemes,
  KeyboardShortcutsManager,
  SavedViewsFilters,
  MultiLanguageSupport,
  AccessibilityMode,
} from '../../components/app-dashboard/UserExperience';

// Integration & API (5 features)
import {
  GraphQLPlayground,
  WebhookTester,
  APIKeyManagement,
  IntegrationHealthDashboard,
  DataPipelineMonitor,
} from '../../components/app-dashboard/IntegrationAPI';

// AI/ML Features (5 features)
import {
  AIChatbotAssistant,
  SmartRecommendations,
  PredictiveMaintenance,
  AutoScalingAdvisor,
  LogAnalysisAI,
} from '../../components/app-dashboard/AIFeatures';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface AppMetric {
  title: string;
  value: number | string;
  change: { value: number; trend: 'up' | 'down'; label: string };
  icon: React.ReactNode;
  iconColor: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'accent';
  sparkline: number[];
}

interface AppHealth {
  appId: string;
  name: string;
  status: 'healthy' | 'degraded' | 'critical' | 'offline';
  uptime: number;
  responseTime: number;
  errorRate: number;
  lastChecked: string;
}

interface SecurityAlert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  app: string;
  timestamp: string;
  status: 'open' | 'investigating' | 'resolved';
}

interface UserActivity {
  id: string;
  user: string;
  action: string;
  app: string;
  timestamp: string;
  ipAddress: string;
  device: string;
}

interface Integration {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  dataVolume: string;
}

interface License {
  id: string;
  appName: string;
  type: 'perpetual' | 'subscription' | 'trial';
  seats: number;
  usedSeats: number;
  expiresAt: string;
  cost: number;
}

interface ScheduledTask {
  id: string;
  name: string;
  type: string;
  schedule: string;
  nextRun: string;
  lastRun: string;
  status: 'active' | 'paused' | 'failed';
}

interface Deployment {
  id: string;
  appName: string;
  version: string;
  environment: 'production' | 'staging' | 'development';
  status: 'deployed' | 'deploying' | 'failed' | 'rollback';
  timestamp: string;
  deployedBy: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

// Metrics compatible with design-system MetricCard
const appMetrics: AppMetric[] = [
  {
    title: 'Total Applications',
    value: 24,
    change: { value: 14.3, trend: 'up', label: 'vs last month' },
    icon: <Package className="w-5 h-5" />,
    iconColor: 'primary',
    sparkline: [12, 15, 18, 20, 22, 24, 21, 23, 24],
  },
  {
    title: 'Active Users',
    value: 2847,
    change: { value: 12.5, trend: 'up', label: 'vs last month' },
    icon: <Users className="w-5 h-5" />,
    iconColor: 'success',
    sparkline: [2100, 2300, 2450, 2600, 2750, 2847, 2800, 2820, 2847],
  },
  {
    title: 'API Calls (24h)',
    value: 1200000,
    change: { value: 8.3, trend: 'up', label: 'vs yesterday' },
    icon: <Zap className="w-5 h-5" />,
    iconColor: 'warning',
    sparkline: [900000, 1000000, 1100000, 1150000, 1180000, 1200000, 1150000, 1180000, 1200000],
  },
  {
    title: 'Avg Response Time',
    value: '124ms',
    change: { value: -12.7, trend: 'down', label: 'improved' },
    icon: <Gauge className="w-5 h-5" />,
    iconColor: 'info',
    sparkline: [180, 165, 150, 140, 130, 124, 128, 125, 124],
  },
];

// Quick stats for app dashboard
const appQuickStats = [
  { label: 'Healthy Apps', value: 20, icon: <CheckCircle className="w-4 h-4" />, color: 'success' as const },
  { label: 'Degraded', value: 3, icon: <AlertTriangle className="w-4 h-4" />, color: 'warning' as const },
  { label: 'Critical', value: 1, icon: <AlertCircle className="w-4 h-4" />, color: 'danger' as const },
  { label: 'Offline', value: 0, icon: <XCircle className="w-4 h-4" />, color: 'info' as const },
];

// Activity items for ActivityFeed
const appActivityItems = [
  {
    id: '1',
    type: 'create' as const,
    title: 'New deployment completed',
    description: 'Task Manager v2.4.1 deployed to production',
    timestamp: '15 minutes ago',
    user: { name: 'CI/CD Pipeline' },
  },
  {
    id: '2',
    type: 'update' as const,
    title: 'User permissions updated',
    description: 'Admin role assigned to john.doe@company.com',
    timestamp: '45 minutes ago',
    user: { name: 'Admin' },
  },
  {
    id: '3',
    type: 'comment' as const,
    title: 'Security alert resolved',
    description: 'API rate limit issue fixed',
    timestamp: '2 hours ago',
    user: { name: 'Security Team' },
  },
  {
    id: '4',
    type: 'publish' as const,
    title: 'Integration connected',
    description: 'Salesforce CRM integration enabled',
    timestamp: '3 hours ago',
    user: { name: 'Integration Bot' },
  },
];

// Progress items for resource usage
const resourceProgressItems = [
  { label: 'CPU Usage', value: 45, max: 100, color: 'primary' as const },
  { label: 'Memory', value: 68, max: 100, color: 'warning' as const },
  { label: 'Storage', value: 47, max: 100, color: 'success' as const },
  { label: 'Bandwidth', value: 78, max: 100, color: 'info' as const },
];

// Schedule items for ScheduleWidget
const appScheduleItems = [
  { id: '1', title: 'Daily Backup', time: '2:00 AM', type: 'task' as const },
  { id: '2', title: 'Security Scan', time: '3:00 AM', type: 'reminder' as const },
  { id: '3', title: 'User Sync', time: 'Every 15 min', type: 'task' as const },
];

// Notifications for security alerts
const securityNotifications = [
  { id: '1', title: 'Critical: Unusual login pattern', description: 'Multiple failed attempts from IP 192.168.1.45', type: 'error' as const, timestamp: '5 min ago', read: false },
  { id: '2', title: 'API rate limit exceeded', description: 'Analytics Pro exceeded threshold', type: 'warning' as const, timestamp: '15 min ago', read: false },
  { id: '3', title: 'SSL certificate expiring', description: 'HR Portal cert expires in 14 days', type: 'warning' as const, timestamp: '1 hour ago', read: true },
  { id: '4', title: 'Outdated dependency resolved', description: 'lodash vulnerability patched', type: 'success' as const, timestamp: '2 hours ago', read: true },
];

const mockAppHealth: AppHealth[] = [
  { appId: 'task-manager', name: 'Task Manager', status: 'healthy', uptime: 99.99, responseTime: 85, errorRate: 0.01, lastChecked: '2 min ago' },
  { appId: 'notes', name: 'Notes', status: 'healthy', uptime: 99.95, responseTime: 92, errorRate: 0.03, lastChecked: '2 min ago' },
  { appId: 'calendar', name: 'Calendar', status: 'degraded', uptime: 99.87, responseTime: 156, errorRate: 0.15, lastChecked: '2 min ago' },
  { appId: 'crm', name: 'CRM Suite', status: 'healthy', uptime: 99.98, responseTime: 110, errorRate: 0.02, lastChecked: '2 min ago' },
  { appId: 'analytics', name: 'Analytics Pro', status: 'healthy', uptime: 99.92, responseTime: 134, errorRate: 0.05, lastChecked: '2 min ago' },
  { appId: 'inventory', name: 'Inventory System', status: 'critical', uptime: 98.50, responseTime: 450, errorRate: 2.3, lastChecked: '2 min ago' },
  { appId: 'hr-portal', name: 'HR Portal', status: 'healthy', uptime: 99.96, responseTime: 98, errorRate: 0.02, lastChecked: '2 min ago' },
  { appId: 'finance', name: 'Finance Manager', status: 'offline', uptime: 0, responseTime: 0, errorRate: 100, lastChecked: '2 min ago' },
];

const mockSecurityAlerts: SecurityAlert[] = [
  { id: '1', severity: 'critical', title: 'Unusual login pattern detected', description: 'Multiple failed login attempts from IP 192.168.1.45', app: 'CRM Suite', timestamp: '5 min ago', status: 'investigating' },
  { id: '2', severity: 'high', title: 'API rate limit exceeded', description: 'Application exceeded 10,000 requests/minute threshold', app: 'Analytics Pro', timestamp: '15 min ago', status: 'open' },
  { id: '3', severity: 'medium', title: 'SSL certificate expiring soon', description: 'Certificate expires in 14 days', app: 'HR Portal', timestamp: '1 hour ago', status: 'open' },
  { id: '4', severity: 'low', title: 'Outdated dependency detected', description: 'lodash@4.17.15 has known vulnerabilities', app: 'Task Manager', timestamp: '2 hours ago', status: 'resolved' },
  { id: '5', severity: 'high', title: 'Data export request', description: 'Large data export (>1GB) initiated by user', app: 'Finance Manager', timestamp: '3 hours ago', status: 'investigating' },
];

const mockUserActivity: UserActivity[] = [
  { id: '1', user: 'john.doe@company.com', action: 'Logged in', app: 'CRM Suite', timestamp: '2 min ago', ipAddress: '192.168.1.100', device: 'Chrome / macOS' },
  { id: '2', user: 'jane.smith@company.com', action: 'Created new record', app: 'Task Manager', timestamp: '5 min ago', ipAddress: '192.168.1.101', device: 'Firefox / Windows' },
  { id: '3', user: 'mike.wilson@company.com', action: 'Downloaded report', app: 'Analytics Pro', timestamp: '8 min ago', ipAddress: '192.168.1.102', device: 'Safari / iOS' },
  { id: '4', user: 'sarah.johnson@company.com', action: 'Updated settings', app: 'HR Portal', timestamp: '12 min ago', ipAddress: '192.168.1.103', device: 'Edge / Windows' },
  { id: '5', user: 'admin@company.com', action: 'Modified permissions', app: 'System', timestamp: '15 min ago', ipAddress: '192.168.1.1', device: 'Chrome / Linux' },
  { id: '6', user: 'dev.team@company.com', action: 'Deployed update', app: 'Notes', timestamp: '20 min ago', ipAddress: '10.0.0.50', device: 'API Client' },
];

const mockIntegrations: Integration[] = [
  { id: '1', name: 'Salesforce', type: 'CRM', status: 'connected', lastSync: '5 min ago', dataVolume: '2.3 GB' },
  { id: '2', name: 'Slack', type: 'Communication', status: 'connected', lastSync: 'Real-time', dataVolume: '156 MB' },
  { id: '3', name: 'AWS S3', type: 'Storage', status: 'connected', lastSync: '1 min ago', dataVolume: '45.2 GB' },
  { id: '4', name: 'Stripe', type: 'Payment', status: 'connected', lastSync: 'Real-time', dataVolume: '890 KB' },
  { id: '5', name: 'HubSpot', type: 'Marketing', status: 'error', lastSync: '2 hours ago', dataVolume: '1.1 GB' },
  { id: '6', name: 'Jira', type: 'Project Management', status: 'connected', lastSync: '10 min ago', dataVolume: '456 MB' },
  { id: '7', name: 'Google Workspace', type: 'Productivity', status: 'connected', lastSync: 'Real-time', dataVolume: '12.8 GB' },
  { id: '8', name: 'Zendesk', type: 'Support', status: 'disconnected', lastSync: 'Never', dataVolume: '0 B' },
];

const mockLicenses: License[] = [
  { id: '1', appName: 'CRM Suite', type: 'subscription', seats: 100, usedSeats: 87, expiresAt: '2025-12-31', cost: 1500 },
  { id: '2', appName: 'Analytics Pro', type: 'subscription', seats: 50, usedSeats: 45, expiresAt: '2025-06-30', cost: 800 },
  { id: '3', appName: 'HR Portal', type: 'perpetual', seats: 200, usedSeats: 156, expiresAt: 'Never', cost: 5000 },
  { id: '4', appName: 'Finance Manager', type: 'subscription', seats: 25, usedSeats: 23, expiresAt: '2025-03-15', cost: 450 },
  { id: '5', appName: 'Inventory System', type: 'trial', seats: 10, usedSeats: 8, expiresAt: '2025-02-28', cost: 0 },
];

const mockScheduledTasks: ScheduledTask[] = [
  { id: '1', name: 'Daily Backup', type: 'Backup', schedule: 'Every day at 2:00 AM', nextRun: 'In 8 hours', lastRun: '16 hours ago', status: 'active' },
  { id: '2', name: 'Weekly Report Generation', type: 'Report', schedule: 'Every Monday at 6:00 AM', nextRun: 'In 3 days', lastRun: '4 days ago', status: 'active' },
  { id: '3', name: 'User Sync', type: 'Sync', schedule: 'Every 15 minutes', nextRun: 'In 8 minutes', lastRun: '7 minutes ago', status: 'active' },
  { id: '4', name: 'Cache Cleanup', type: 'Maintenance', schedule: 'Every hour', nextRun: 'In 45 minutes', lastRun: '15 minutes ago', status: 'active' },
  { id: '5', name: 'Security Scan', type: 'Security', schedule: 'Every day at 3:00 AM', nextRun: 'In 9 hours', lastRun: '15 hours ago', status: 'paused' },
  { id: '6', name: 'Data Archive', type: 'Archive', schedule: 'First of month at 1:00 AM', nextRun: 'In 12 days', lastRun: '18 days ago', status: 'failed' },
];

const mockDeployments: Deployment[] = [
  { id: '1', appName: 'Task Manager', version: 'v2.4.1', environment: 'production', status: 'deployed', timestamp: '2 hours ago', deployedBy: 'CI/CD Pipeline' },
  { id: '2', appName: 'Notes', version: 'v1.8.0', environment: 'staging', status: 'deploying', timestamp: 'In progress', deployedBy: 'dev.team@company.com' },
  { id: '3', appName: 'CRM Suite', version: 'v5.2.3', environment: 'production', status: 'deployed', timestamp: '1 day ago', deployedBy: 'admin@company.com' },
  { id: '4', appName: 'Analytics Pro', version: 'v3.1.0-beta', environment: 'development', status: 'deployed', timestamp: '3 hours ago', deployedBy: 'CI/CD Pipeline' },
  { id: '5', appName: 'Inventory System', version: 'v1.5.2', environment: 'production', status: 'rollback', timestamp: '30 min ago', deployedBy: 'admin@company.com' },
];

// ============================================================================
// HELPER COMPONENTS (Minimal - most moved to design-system)
// ============================================================================

// Status Badge - kept for detailed status display
const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { color: string; icon: React.ReactNode }> = {
    healthy: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle className="w-3 h-3" /> },
    degraded: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <AlertTriangle className="w-3 h-3" /> },
    critical: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <AlertCircle className="w-3 h-3" /> },
    offline: { color: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400', icon: <WifiOff className="w-3 h-3" /> },
    connected: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <Wifi className="w-3 h-3" /> },
    disconnected: { color: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400', icon: <WifiOff className="w-3 h-3" /> },
    error: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <XCircle className="w-3 h-3" /> },
    active: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <PlayCircle className="w-3 h-3" /> },
    paused: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <Pause className="w-3 h-3" /> },
    failed: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <XCircle className="w-3 h-3" /> },
    deployed: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle className="w-3 h-3" /> },
    deploying: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: <RefreshCw className="w-3 h-3 animate-spin" /> },
    rollback: { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: <RotateCcw className="w-3 h-3" /> },
    open: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <AlertCircle className="w-3 h-3" /> },
    investigating: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <Search className="w-3 h-3" /> },
    resolved: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle className="w-3 h-3" /> },
  };

  const { color, icon } = config[status] || config.offline;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Severity Badge - kept for security alerts
const SeverityBadge = ({ severity }: { severity: string }) => {
  const colors: Record<string, string> = {
    critical: 'bg-red-500 text-white',
    high: 'bg-orange-500 text-white',
    medium: 'bg-yellow-500 text-white',
    low: 'bg-blue-500 text-white',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${colors[severity]}`}>
      {severity}
    </span>
  );
};

// Simple Progress Bar - kept for inline progress display
const ProgressBar = ({ value, max, color = 'bg-primary-500' }: { value: number; max: number; color?: string }) => {
  const percentage = (value / max) * 100;
  const bgColor = percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-yellow-500' : color;

  return (
    <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`h-full ${bgColor} rounded-full`}
      />
    </div>
  );
};

// Quick Action Button
const QuickAction = ({ icon, label, onClick, color = 'bg-primary-500' }: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: string;
}) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
  >
    <div className={`p-3 rounded-xl ${color} text-white`}>
      {icon}
    </div>
    <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">{label}</span>
  </motion.button>
);

// ============================================================================
// SECTION COMPONENTS
// ============================================================================

// 1. App Health Monitoring Section
const AppHealthSection = () => (
  <Card>
    <CardBody>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-500" />
          <h3 className="font-semibold text-neutral-900 dark:text-white">Application Health</h3>
        </div>
        <Button variant="ghost" size="sm">View All</Button>
      </div>
      <div className="space-y-3">
        {mockAppHealth.slice(0, 6).map((app) => (
          <div key={app.appId} className="flex items-center gap-4 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-neutral-900 dark:text-white truncate">{app.name}</span>
                <StatusBadge status={app.status} />
              </div>
              <div className="flex items-center gap-4 mt-1 text-xs text-neutral-500">
                <span>Uptime: {app.uptime}%</span>
                <span>Response: {app.responseTime}ms</span>
                <span>Errors: {app.errorRate}%</span>
              </div>
            </div>
            <Button variant="ghost" size="sm"><MoreHorizontal className="w-4 h-4" /></Button>
          </div>
        ))}
      </div>
    </CardBody>
  </Card>
);

// 2. Security Alerts Section
const SecurityAlertsSection = () => (
  <Card>
    <CardBody>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold text-neutral-900 dark:text-white">Security Alerts</h3>
          <Badge variant="danger" size="sm">5</Badge>
        </div>
        <Button variant="ghost" size="sm">View All</Button>
      </div>
      <div className="space-y-3">
        {mockSecurityAlerts.map((alert) => (
          <div key={alert.id} className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-start gap-3">
              <SeverityBadge severity={alert.severity} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-900 dark:text-white">{alert.title}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{alert.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
                  <span>{alert.app}</span>
                  <span>•</span>
                  <span>{alert.timestamp}</span>
                  <StatusBadge status={alert.status} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardBody>
  </Card>
);

// 3. User Activity Section
const UserActivitySection = () => (
  <Card>
    <CardBody>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-neutral-900 dark:text-white">User Activity</h3>
        </div>
        <Button variant="ghost" size="sm">View Audit Log</Button>
      </div>
      <div className="space-y-2">
        {mockUserActivity.map((activity) => (
          <div key={activity.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-sm font-medium">
              {activity.user.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-medium text-neutral-900 dark:text-white">{activity.user.split('@')[0]}</span>
                <span className="text-neutral-500 dark:text-neutral-400"> {activity.action} in </span>
                <span className="font-medium text-neutral-900 dark:text-white">{activity.app}</span>
              </p>
              <p className="text-xs text-neutral-500">{activity.timestamp} • {activity.device}</p>
            </div>
          </div>
        ))}
      </div>
    </CardBody>
  </Card>
);

// 4. Integrations Section
const IntegrationsSection = () => (
  <Card>
    <CardBody>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Link className="w-5 h-5 text-purple-500" />
          <h3 className="font-semibold text-neutral-900 dark:text-white">Integrations</h3>
        </div>
        <Button variant="ghost" size="sm" leftIcon={<Plus className="w-4 h-4" />}>Add</Button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {mockIntegrations.slice(0, 6).map((integration) => (
          <div key={integration.id} className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-neutral-900 dark:text-white text-sm">{integration.name}</span>
              <StatusBadge status={integration.status} />
            </div>
            <div className="text-xs text-neutral-500">
              <p>{integration.type}</p>
              <p>Last sync: {integration.lastSync}</p>
            </div>
          </div>
        ))}
      </div>
    </CardBody>
  </Card>
);

// 5. License Management Section
const LicenseSection = () => (
  <Card>
    <CardBody>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-neutral-900 dark:text-white">License Management</h3>
        </div>
        <Button variant="ghost" size="sm">Manage</Button>
      </div>
      <div className="space-y-4">
        {mockLicenses.map((license) => (
          <div key={license.id} className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-neutral-900 dark:text-white">{license.appName}</span>
              <Badge variant={license.type === 'trial' ? 'warning' : license.type === 'subscription' ? 'primary' : 'success'} size="sm">
                {license.type}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm text-neutral-500 mb-2">
              <span>{license.usedSeats} / {license.seats} seats</span>
              <span>Expires: {license.expiresAt}</span>
            </div>
            <ProgressBar value={license.usedSeats} max={license.seats} color="bg-primary-500" />
          </div>
        ))}
      </div>
    </CardBody>
  </Card>
);

// 6. Scheduled Tasks Section
const ScheduledTasksSection = () => (
  <Card>
    <CardBody>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-cyan-500" />
          <h3 className="font-semibold text-neutral-900 dark:text-white">Scheduled Tasks</h3>
        </div>
        <Button variant="ghost" size="sm" leftIcon={<Plus className="w-4 h-4" />}>New Task</Button>
      </div>
      <div className="space-y-2">
        {mockScheduledTasks.map((task) => (
          <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <div className={`p-2 rounded-lg ${
              task.type === 'Backup' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
              task.type === 'Security' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
              task.type === 'Sync' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
              'bg-neutral-100 dark:bg-neutral-800 text-neutral-600'
            }`}>
              {task.type === 'Backup' ? <Archive className="w-4 h-4" /> :
               task.type === 'Security' ? <Shield className="w-4 h-4" /> :
               task.type === 'Sync' ? <RefreshCw className="w-4 h-4" /> :
               <Clock className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-neutral-900 dark:text-white">{task.name}</span>
                <StatusBadge status={task.status} />
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">{task.schedule}</p>
            </div>
            <div className="text-right text-xs text-neutral-500">
              <p>Next: {task.nextRun}</p>
            </div>
          </div>
        ))}
      </div>
    </CardBody>
  </Card>
);

// 6b. Interactive Workflows Section
const WorkflowsSection = () => {
  const [workflows, setWorkflows] = useState([
    { id: 1, name: 'User Onboarding', triggers: 3, actions: 8, status: 'active', runs: 156, lastRun: '5 min ago' },
    { id: 2, name: 'Approval Request', triggers: 1, actions: 4, status: 'active', runs: 89, lastRun: '1 hour ago' },
    { id: 3, name: 'Data Backup', triggers: 1, actions: 3, status: 'active', runs: 365, lastRun: '2 hours ago' },
    { id: 4, name: 'Alert Notification', triggers: 5, actions: 2, status: 'paused', runs: 234, lastRun: '1 day ago' },
  ]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({ name: '', triggers: 1, actions: 1 });
  const [editingId, setEditingId] = useState<number | null>(null);

  const toggleWorkflowStatus = (id: number) => {
    setWorkflows(workflows.map(w =>
      w.id === id ? { ...w, status: w.status === 'active' ? 'paused' : 'active' } : w
    ));
  };

  const deleteWorkflow = (id: number) => {
    setWorkflows(workflows.filter(w => w.id !== id));
  };

  const createWorkflow = () => {
    if (newWorkflow.name.trim()) {
      const newId = Math.max(...workflows.map(w => w.id)) + 1;
      setWorkflows([...workflows, {
        id: newId,
        name: newWorkflow.name,
        triggers: newWorkflow.triggers,
        actions: newWorkflow.actions,
        status: 'active',
        runs: 0,
        lastRun: 'Never'
      }]);
      setNewWorkflow({ name: '', triggers: 1, actions: 1 });
      setShowCreateModal(false);
    }
  };

  const runWorkflow = (id: number) => {
    setWorkflows(workflows.map(w =>
      w.id === id ? { ...w, runs: w.runs + 1, lastRun: 'Just now' } : w
    ));
  };

  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Workflow className="w-5 h-5 text-violet-500" />
            <h3 className="font-semibold text-neutral-900 dark:text-white">Workflows</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowCreateModal(true)}
          >
            Create
          </Button>
        </div>

        {/* Create Workflow Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 rounded-lg border-2 border-dashed border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/20"
            >
              <h4 className="font-medium text-neutral-900 dark:text-white mb-3">New Workflow</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">Workflow Name</label>
                  <input
                    type="text"
                    value={newWorkflow.name}
                    onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                    placeholder="e.g., Customer Notification"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Triggers</label>
                    <input
                      type="number"
                      min="1"
                      value={newWorkflow.triggers}
                      onChange={(e) => setNewWorkflow({ ...newWorkflow, triggers: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Actions</label>
                    <input
                      type="number"
                      min="1"
                      value={newWorkflow.actions}
                      onChange={(e) => setNewWorkflow({ ...newWorkflow, actions: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                  <Button variant="primary" size="sm" onClick={createWorkflow}>Create Workflow</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          {workflows.map((workflow) => (
            <motion.div
              key={workflow.id}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-neutral-900 dark:text-white">{workflow.name}</span>
                <div className="flex items-center gap-2">
                  <StatusBadge status={workflow.status} />
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => runWorkflow(workflow.id)}
                      disabled={workflow.status === 'paused'}
                      className="!p-1"
                    >
                      <Play className="w-3.5 h-3.5 text-green-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleWorkflowStatus(workflow.id)}
                      className="!p-1"
                    >
                      {workflow.status === 'active'
                        ? <Pause className="w-3.5 h-3.5 text-yellow-500" />
                        : <PlayCircle className="w-3.5 h-3.5 text-green-500" />
                      }
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteWorkflow(workflow.id)}
                      className="!p-1"
                    >
                      <XCircle className="w-3.5 h-3.5 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-neutral-500">
                <span>{workflow.triggers} triggers</span>
                <span>{workflow.actions} actions</span>
                <span>{workflow.runs} runs</span>
                <span className="text-neutral-400">Last: {workflow.lastRun}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {workflows.length === 0 && (
          <div className="text-center py-8 text-neutral-500">
            <Workflow className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>No workflows yet. Create your first workflow!</p>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

// 7. Deployments Section
const DeploymentsSection = () => (
  <Card>
    <CardBody>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-indigo-500" />
          <h3 className="font-semibold text-neutral-900 dark:text-white">Recent Deployments</h3>
        </div>
        <Button variant="ghost" size="sm">View History</Button>
      </div>
      <div className="space-y-3">
        {mockDeployments.map((deployment) => (
          <div key={deployment.id} className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
            <div className={`p-2 rounded-lg ${
              deployment.environment === 'production' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
              deployment.environment === 'staging' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' :
              'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
            }`}>
              {deployment.environment === 'production' ? <Globe className="w-4 h-4" /> :
               deployment.environment === 'staging' ? <Server className="w-4 h-4" /> :
               <Code className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-neutral-900 dark:text-white">{deployment.appName}</span>
                <span className="text-xs text-neutral-500">{deployment.version}</span>
                <StatusBadge status={deployment.status} />
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                {deployment.environment} • {deployment.timestamp} • {deployment.deployedBy}
              </p>
            </div>
            <Button variant="ghost" size="sm"><MoreHorizontal className="w-4 h-4" /></Button>
          </div>
        ))}
      </div>
    </CardBody>
  </Card>
);

// 8. Resource Usage Section
const ResourceUsageSection = () => {
  const resources = [
    { name: 'CPU Usage', value: 45, max: 100, unit: '%', icon: <Cpu className="w-4 h-4" />, color: 'bg-blue-500' },
    { name: 'Memory', value: 12.4, max: 32, unit: 'GB', icon: <MemoryStick className="w-4 h-4" />, color: 'bg-purple-500' },
    { name: 'Storage', value: 234, max: 500, unit: 'GB', icon: <HardDrive className="w-4 h-4" />, color: 'bg-amber-500' },
    { name: 'Bandwidth', value: 78, max: 100, unit: 'Mbps', icon: <Wifi className="w-4 h-4" />, color: 'bg-green-500' },
  ];

  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold text-neutral-900 dark:text-white">Resource Usage</h3>
          </div>
          <Button variant="ghost" size="sm">Details</Button>
        </div>
        <div className="space-y-4">
          {resources.map((resource) => (
            <div key={resource.name}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                  {resource.icon}
                  <span>{resource.name}</span>
                </div>
                <span className="text-sm font-medium text-neutral-900 dark:text-white">
                  {resource.value} / {resource.max} {resource.unit}
                </span>
              </div>
              <ProgressBar value={resource.value} max={resource.max} color={resource.color} />
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

// 9. Compliance Dashboard Section
const ComplianceSection = () => {
  const compliance = [
    { name: 'GDPR', status: 'compliant', score: 98, lastAudit: '2025-01-15' },
    { name: 'SOC 2', status: 'compliant', score: 95, lastAudit: '2025-01-10' },
    { name: 'HIPAA', status: 'partial', score: 87, lastAudit: '2024-12-20' },
    { name: 'ISO 27001', status: 'compliant', score: 92, lastAudit: '2025-01-05' },
  ];

  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-neutral-900 dark:text-white">Compliance Status</h3>
          </div>
          <Button variant="ghost" size="sm">Reports</Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {compliance.map((item) => (
            <div key={item.name} className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-neutral-900 dark:text-white">{item.name}</span>
                <Badge variant={item.status === 'compliant' ? 'success' : 'warning'} size="sm">
                  {item.score}%
                </Badge>
              </div>
              <p className="text-xs text-neutral-500">Last audit: {item.lastAudit}</p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

// 10. API Analytics Section
const ApiAnalyticsSection = () => {
  const endpoints = [
    { path: '/api/users', calls: 45230, avgTime: '45ms', errors: 12 },
    { path: '/api/apps', calls: 32100, avgTime: '62ms', errors: 5 },
    { path: '/api/auth', calls: 28500, avgTime: '38ms', errors: 23 },
    { path: '/api/data', calls: 21000, avgTime: '125ms', errors: 8 },
  ];

  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-neutral-900 dark:text-white">API Analytics</h3>
          </div>
          <Button variant="ghost" size="sm">Full Report</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-500 border-b border-neutral-200 dark:border-neutral-700">
                <th className="pb-2 font-medium">Endpoint</th>
                <th className="pb-2 font-medium text-right">Calls</th>
                <th className="pb-2 font-medium text-right">Avg Time</th>
                <th className="pb-2 font-medium text-right">Errors</th>
              </tr>
            </thead>
            <tbody>
              {endpoints.map((endpoint) => (
                <tr key={endpoint.path} className="border-b border-neutral-100 dark:border-neutral-800">
                  <td className="py-2 font-mono text-xs text-neutral-700 dark:text-neutral-300">{endpoint.path}</td>
                  <td className="py-2 text-right text-neutral-900 dark:text-white">{endpoint.calls.toLocaleString()}</td>
                  <td className="py-2 text-right text-neutral-900 dark:text-white">{endpoint.avgTime}</td>
                  <td className="py-2 text-right">
                    <span className={endpoint.errors > 10 ? 'text-red-500' : 'text-green-500'}>{endpoint.errors}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
};

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

export default function ApplicationDashboard() {
  const navigate = useNavigate();
  const { installedApps, getActiveApps, launchApp, appStats } = useAppStore();
  const { systemMetrics, uptimeStatus, updateSystemMetrics } = useDashboardStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Simulate real-time system metrics update (reusing CMS pattern)
  useEffect(() => {
    const interval = setInterval(() => {
      updateSystemMetrics({
        cpu: Math.floor(Math.random() * 40) + 20,
        memory: Math.floor(Math.random() * 30) + 50,
        disk: Math.floor(Math.random() * 20) + 60,
        network: Math.floor(Math.random() * 100),
        timestamp: Date.now(),
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [updateSystemMetrics]);

  const latestMetrics = systemMetrics[systemMetrics.length - 1];

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  // Quick actions similar to CMS Dashboard pattern
  const quickActions = [
    { label: 'New App', href: '/apps/store', icon: <Plus className="w-5 h-5" />, color: 'bg-primary-500' },
    { label: 'Add User', href: '/apps/access', icon: <UserPlus className="w-5 h-5" />, color: 'bg-blue-500' },
    { label: 'Deploy', href: '/apps/deploy', icon: <Upload className="w-5 h-5" />, color: 'bg-success-500' },
    { label: 'Security', href: '/apps/security', icon: <Shield className="w-5 h-5" />, color: 'bg-danger-500' },
    { label: 'Reports', href: '/apps/reports', icon: <BarChart3 className="w-5 h-5" />, color: 'bg-accent-500' },
    { label: 'Settings', href: '/settings', icon: <Settings className="w-5 h-5" />, color: 'bg-warning-500' },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-6"
    >
      {/* Header - Same pattern as CMS Dashboard */}
      <PageHeader
        title="Enterprise App Dashboard"
        description="Comprehensive application management and monitoring"
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              leftIcon={<RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
            <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
              Export
            </Button>
            <RouterLink to="/apps/store">
              <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                Add App
              </Button>
            </RouterLink>
          </div>
        }
      />

      {/* Metrics Grid - Using design-system MetricCard */}
      <AnimatedGrid columns={4} gap="md">
        {appMetrics.map((metric, index) => (
          <motion.div key={metric.title} variants={staggerItem}>
            <MetricCard {...metric} />
          </motion.div>
        ))}
      </AnimatedGrid>

      {/* Quick Stats Row - Reusing CMS QuickStatsRow component */}
      <Grid columns={4} gap="md">
        <motion.div variants={fadeInUp} className="col-span-3">
          <QuickStatsRow stats={appQuickStats} />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <Card>
            <CardBody className="p-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">99.97%</div>
                <p className="text-sm text-neutral-500">System Uptime</p>
                <p className="text-xs text-neutral-400 mt-1">Last 30 days</p>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </Grid>

      {/* Quick Actions - CMS Dashboard style */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Quick Actions
            </h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {quickActions.map((action) => (
                <RouterLink
                  key={action.label}
                  to={action.href}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors group"
                >
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    {action.icon}
                  </div>
                  <span className="text-xs font-medium text-neutral-700 dark:text-neutral-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {action.label}
                  </span>
                </RouterLink>
              ))}
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Tabs Navigation */}
      <motion.div variants={fadeInUp}>
        <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-700 overflow-x-auto pb-px">
          {[
            { id: 'overview', label: 'Overview', icon: <LayoutGrid className="w-4 h-4" /> },
            { id: 'health', label: 'Health & Performance', icon: <Activity className="w-4 h-4" /> },
            { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
            { id: 'users', label: 'Users & Access', icon: <Users className="w-4 h-4" /> },
            { id: 'integrations', label: 'Integrations', icon: <Link className="w-4 h-4" /> },
            { id: 'deployments', label: 'Deployments', icon: <Rocket className="w-4 h-4" /> },
            { id: 'billing', label: 'Billing', icon: <CreditCard className="w-4 h-4" /> },
            { id: 'automation', label: 'Automation', icon: <Workflow className="w-4 h-4" /> },
            // New Enterprise Enhancement Tabs
            { id: 'realtime', label: 'Real-Time', icon: <Zap className="w-4 h-4" /> },
            { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'compliance', label: 'Compliance+', icon: <FileCheck className="w-4 h-4" /> },
            { id: 'experience', label: 'Experience', icon: <Settings className="w-4 h-4" /> },
            { id: 'api', label: 'API Tools', icon: <Code className="w-4 h-4" /> },
            { id: 'ai', label: 'AI/ML', icon: <Cpu className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <Grid columns={3} gap="md">
              {/* Activity Feed - Reusing CMS component */}
              <motion.div variants={fadeInUp} className="col-span-2">
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                      Recent Activity
                    </h3>
                  </CardHeader>
                  <CardBody className="p-0">
                    <ActivityFeed
                      activities={appActivityItems}
                      maxItems={5}
                    />
                  </CardBody>
                </Card>
              </motion.div>

              {/* Schedule Widget - Reusing CMS component */}
              <motion.div variants={fadeInUp}>
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                      Scheduled Tasks
                    </h3>
                  </CardHeader>
                  <CardBody className="p-0">
                    <ScheduleWidget items={appScheduleItems} />
                  </CardBody>
                </Card>
              </motion.div>

              {/* Resource Usage - Reusing ProgressCard */}
              <motion.div variants={fadeInUp}>
                <ProgressCard
                  title="Resource Usage"
                  items={resourceProgressItems}
                />
              </motion.div>

              {/* Security Notifications - Reusing NotificationWidget */}
              <motion.div variants={fadeInUp}>
                <NotificationWidget
                  notifications={securityNotifications}
                  onMarkAllRead={() => console.log('Mark all read')}
                />
              </motion.div>

              {/* System Health - Reusing SystemHealthMonitor */}
              <motion.div variants={fadeInUp}>
                {latestMetrics && (
                  <SystemHealthMonitor
                    metrics={latestMetrics}
                    variant="circular"
                    showOverallStatus
                  />
                )}
              </motion.div>

              {/* Stats Comparison - Reusing StatComparison */}
              <motion.div variants={fadeInUp} className="col-span-3">
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                      Week-over-Week Comparison
                    </h3>
                  </CardHeader>
                  <CardBody>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <StatComparison
                        title="Active Users"
                        currentValue={2847}
                        previousValue={2534}
                        format="number"
                        period="vs last week"
                      />
                      <StatComparison
                        title="API Calls"
                        currentValue={1200000}
                        previousValue={1100000}
                        format="number"
                        period="vs last week"
                      />
                      <StatComparison
                        title="Error Rate"
                        currentValue={0.12}
                        previousValue={0.18}
                        format="percentage"
                        period="vs last week"
                      />
                      <StatComparison
                        title="Avg Response"
                        currentValue={124}
                        previousValue={142}
                        format="number"
                        period="vs last week"
                      />
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            </Grid>
          )}

          {activeTab === 'health' && (
            <Grid columns={2} gap="md">
              {/* System Health Monitor - Reusing CMS component */}
              <motion.div variants={fadeInUp}>
                {latestMetrics && (
                  <SystemHealthMonitor
                    metrics={latestMetrics}
                    variant="circular"
                    showOverallStatus
                  />
                )}
              </motion.div>

              {/* Uptime Status - Reusing CMS component */}
              <motion.div variants={fadeInUp}>
                <UptimeStatusIndicator
                  status={uptimeStatus}
                  showUptimeBar
                  showResponseTime
                  showLastIncident
                  onRefresh={() => console.log('Refreshing status...')}
                  onViewStatusPage={() => window.open('/status', '_blank')}
                />
              </motion.div>

              {/* Resource Usage - Reusing ProgressCard */}
              <motion.div variants={fadeInUp}>
                <ProgressCard
                  title="Resource Usage"
                  items={resourceProgressItems}
                />
              </motion.div>

              {/* API Analytics Section */}
              <ApiAnalyticsSection />

              {/* Sparkline Charts - Reusing CMS SparklineChart */}
              <motion.div variants={fadeInUp} className="col-span-2">
                <StaticDashboardGrid columns={4}>
                  <SparklineChart
                    data={[45, 52, 48, 55, 62, 58, 65, 72, 68, 75, 82, 88]}
                    label="CPU Usage"
                    value={45}
                    change={-5}
                    changeLabel="vs yesterday"
                    color="primary"
                    showArea
                    animated
                  />
                  <SparklineChart
                    data={[65, 68, 72, 70, 75, 78, 80, 76, 74, 72, 70, 68]}
                    label="Memory"
                    value={68}
                    change={3}
                    changeLabel="vs yesterday"
                    color="warning"
                    showArea
                    animated
                  />
                  <SparklineChart
                    data={[40, 42, 44, 43, 45, 46, 47, 46, 47, 47, 47, 47]}
                    label="Storage"
                    value={47}
                    change={2}
                    changeLabel="vs yesterday"
                    color="success"
                    showArea
                    animated
                  />
                  <SparklineChart
                    data={[70, 75, 80, 78, 82, 85, 80, 78, 76, 78, 80, 78]}
                    label="Bandwidth"
                    value={78}
                    change={8}
                    changeLabel="vs yesterday"
                    color="accent"
                    showArea
                    animated
                  />
                </StaticDashboardGrid>
              </motion.div>
            </Grid>
          )}

          {activeTab === 'security' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SecurityAlertsSection />
              <ComplianceSection />
              <Card>
                <CardBody>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Fingerprint className="w-5 h-5 text-violet-500" />
                      <h3 className="font-semibold text-neutral-900 dark:text-white">Access Control</h3>
                    </div>
                    <Button variant="ghost" size="sm">Configure</Button>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Multi-Factor Authentication', enabled: true, users: '98%' },
                      { label: 'Single Sign-On (SSO)', enabled: true, users: '100%' },
                      { label: 'IP Whitelisting', enabled: true, users: 'N/A' },
                      { label: 'Session Management', enabled: true, users: 'N/A' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                        <span className="font-medium text-neutral-900 dark:text-white">{item.label}</span>
                        <div className="flex items-center gap-3">
                          {item.users !== 'N/A' && <span className="text-sm text-neutral-500">{item.users}</span>}
                          <Badge variant={item.enabled ? 'success' : 'warning'} size="sm">
                            {item.enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Scan className="w-5 h-5 text-rose-500" />
                      <h3 className="font-semibold text-neutral-900 dark:text-white">Vulnerability Scan</h3>
                    </div>
                    <Button variant="primary" size="sm">Run Scan</Button>
                  </div>
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 mb-4">
                      <ShieldCheck className="w-10 h-10" />
                    </div>
                    <p className="text-lg font-semibold text-neutral-900 dark:text-white">No Critical Vulnerabilities</p>
                    <p className="text-sm text-neutral-500 mt-1">Last scan: 2 hours ago</p>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UserActivitySection />
              <Card>
                <CardBody>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <UsersRound className="w-5 h-5 text-blue-500" />
                      <h3 className="font-semibold text-neutral-900 dark:text-white">User Overview</h3>
                    </div>
                    <Button variant="ghost" size="sm" leftIcon={<UserPlus className="w-4 h-4" />}>Invite</Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">2,847</p>
                      <p className="text-sm text-blue-600/70 dark:text-blue-400/70">Total Users</p>
                    </div>
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">1,234</p>
                      <p className="text-sm text-green-600/70 dark:text-green-400/70">Active Today</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {['Administrator', 'Editor', 'Viewer', 'Developer'].map((role, i) => (
                      <div key={role} className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                        <span className="text-neutral-700 dark:text-neutral-300">{role}</span>
                        <span className="text-sm font-medium text-neutral-900 dark:text-white">
                          {[12, 45, 156, 28][i]} users
                        </span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
              <Card className="lg:col-span-2">
                <CardBody>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-amber-500" />
                      <h3 className="font-semibold text-neutral-900 dark:text-white">Permission Templates</h3>
                    </div>
                    <Button variant="ghost" size="sm" leftIcon={<Plus className="w-4 h-4" />}>Create Template</Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { name: 'Full Access', apps: 24, users: 12, color: 'bg-red-500' },
                      { name: 'Standard User', apps: 8, users: 156, color: 'bg-blue-500' },
                      { name: 'Read Only', apps: 5, users: 45, color: 'bg-green-500' },
                    ].map((template) => (
                      <div key={template.name} className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-3 h-3 rounded-full ${template.color}`} />
                          <span className="font-medium text-neutral-900 dark:text-white">{template.name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-neutral-500">
                          <span>{template.apps} apps</span>
                          <span>{template.users} users</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <IntegrationsSection />
              <Card>
                <CardBody>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Webhook className="w-5 h-5 text-orange-500" />
                      <h3 className="font-semibold text-neutral-900 dark:text-white">Webhooks</h3>
                    </div>
                    <Button variant="ghost" size="sm" leftIcon={<Plus className="w-4 h-4" />}>Add</Button>
                  </div>
                  <div className="space-y-3">
                    {[
                      { url: 'https://api.slack.com/hooks/...', events: ['user.created', 'app.deployed'], status: 'active' },
                      { url: 'https://hooks.zapier.com/...', events: ['data.exported'], status: 'active' },
                      { url: 'https://n8n.company.com/...', events: ['error.critical'], status: 'paused' },
                    ].map((hook, i) => (
                      <div key={i} className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-700">
                        <div className="flex items-center justify-between mb-2">
                          <code className="text-xs text-neutral-600 dark:text-neutral-400 truncate max-w-[200px]">{hook.url}</code>
                          <StatusBadge status={hook.status} />
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {hook.events.map((event) => (
                            <span key={event} className="px-2 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-800 rounded">
                              {event}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
              <ApiAnalyticsSection />
              <Card>
                <CardBody>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-teal-500" />
                      <h3 className="font-semibold text-neutral-900 dark:text-white">Data Sync Status</h3>
                    </div>
                    <Button variant="ghost" size="sm">Configure</Button>
                  </div>
                  <div className="space-y-4">
                    {[
                      { source: 'Salesforce → CRM', lastSync: '5 min ago', records: '12,450', status: 'synced' },
                      { source: 'HubSpot → Marketing', lastSync: '2 hours ago', records: '8,230', status: 'error' },
                      { source: 'Jira → Tasks', lastSync: '10 min ago', records: '3,100', status: 'synced' },
                    ].map((sync, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${sync.status === 'synced' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-neutral-900 dark:text-white">{sync.source}</p>
                          <p className="text-xs text-neutral-500">{sync.records} records • {sync.lastSync}</p>
                        </div>
                        <Button variant="ghost" size="sm"><RefreshCw className="w-4 h-4" /></Button>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {activeTab === 'deployments' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DeploymentsSection />
              <Card>
                <CardBody>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-5 h-5 text-violet-500" />
                      <h3 className="font-semibold text-neutral-900 dark:text-white">Environments</h3>
                    </div>
                    <Button variant="ghost" size="sm">Manage</Button>
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: 'Production', url: 'app.company.com', status: 'healthy', version: 'v2.4.1' },
                      { name: 'Staging', url: 'staging.company.com', status: 'deploying', version: 'v2.5.0-rc1' },
                      { name: 'Development', url: 'dev.company.com', status: 'healthy', version: 'v2.5.0-dev' },
                    ].map((env) => (
                      <div key={env.name} className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              env.name === 'Production' ? 'bg-green-500' :
                              env.name === 'Staging' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`} />
                            <span className="font-medium text-neutral-900 dark:text-white">{env.name}</span>
                          </div>
                          <StatusBadge status={env.status} />
                        </div>
                        <div className="flex items-center justify-between text-sm text-neutral-500">
                          <span>{env.url}</span>
                          <span>{env.version}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
              <Card className="lg:col-span-2">
                <CardBody>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <GitMerge className="w-5 h-5 text-indigo-500" />
                      <h3 className="font-semibold text-neutral-900 dark:text-white">Release Pipeline</h3>
                    </div>
                    <Button variant="primary" size="sm" leftIcon={<Play className="w-4 h-4" />}>Start Deployment</Button>
                  </div>
                  <div className="flex items-center justify-between py-8">
                    {['Build', 'Test', 'Security Scan', 'Staging', 'Approval', 'Production'].map((stage, i) => (
                      <div key={stage} className="flex items-center">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            i < 3 ? 'bg-green-500 text-white' :
                            i === 3 ? 'bg-yellow-500 text-white animate-pulse' :
                            'bg-neutral-200 dark:bg-neutral-700 text-neutral-500'
                          }`}>
                            {i < 3 ? <Check className="w-5 h-5" /> :
                             i === 3 ? <RefreshCw className="w-5 h-5 animate-spin" /> :
                             <span className="text-sm font-medium">{i + 1}</span>}
                          </div>
                          <span className="text-xs mt-2 text-neutral-600 dark:text-neutral-400">{stage}</span>
                        </div>
                        {i < 5 && (
                          <div className={`w-12 h-0.5 mx-2 ${
                            i < 3 ? 'bg-green-500' : 'bg-neutral-200 dark:bg-neutral-700'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LicenseSection />
              <Card>
                <CardBody>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-emerald-500" />
                      <h3 className="font-semibold text-neutral-900 dark:text-white">Cost Overview</h3>
                    </div>
                    <Button variant="ghost" size="sm">Details</Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">$4,280</p>
                      <p className="text-sm text-emerald-600/70 dark:text-emerald-400/70">This Month</p>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">$48,560</p>
                      <p className="text-sm text-blue-600/70 dark:text-blue-400/70">Year to Date</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { category: 'Subscriptions', amount: 2750, percentage: 64 },
                      { category: 'Usage Fees', amount: 890, percentage: 21 },
                      { category: 'Support', amount: 450, percentage: 11 },
                      { category: 'Add-ons', amount: 190, percentage: 4 },
                    ].map((item) => (
                      <div key={item.category}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-neutral-700 dark:text-neutral-300">{item.category}</span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">${item.amount}</span>
                        </div>
                        <ProgressBar value={item.percentage} max={100} color="bg-emerald-500" />
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      <h3 className="font-semibold text-neutral-900 dark:text-white">Budget Alerts</h3>
                    </div>
                    <Button variant="ghost" size="sm">Configure</Button>
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: 'Monthly Budget', current: 4280, limit: 5000, status: 'warning' },
                      { name: 'API Calls', current: 890000, limit: 1000000, status: 'ok' },
                      { name: 'Storage', current: 234, limit: 500, status: 'ok' },
                    ].map((alert) => (
                      <div key={alert.name} className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-neutral-900 dark:text-white">{alert.name}</span>
                          <Badge variant={alert.status === 'warning' ? 'warning' : 'success'} size="sm">
                            {Math.round((alert.current / alert.limit) * 100)}% used
                          </Badge>
                        </div>
                        <ProgressBar
                          value={alert.current}
                          max={alert.limit}
                          color={alert.status === 'warning' ? 'bg-amber-500' : 'bg-green-500'}
                        />
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-indigo-500" />
                      <h3 className="font-semibold text-neutral-900 dark:text-white">Recent Invoices</h3>
                    </div>
                    <Button variant="ghost" size="sm">View All</Button>
                  </div>
                  <div className="space-y-2">
                    {[
                      { id: 'INV-2025-001', date: 'Jan 1, 2025', amount: 4280, status: 'paid' },
                      { id: 'INV-2024-012', date: 'Dec 1, 2024', amount: 4600, status: 'paid' },
                      { id: 'INV-2024-011', date: 'Nov 1, 2024', amount: 4150, status: 'paid' },
                    ].map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-white">{invoice.id}</p>
                          <p className="text-xs text-neutral-500">{invoice.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-neutral-900 dark:text-white">${invoice.amount}</p>
                          <Badge variant="success" size="xs">{invoice.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {activeTab === 'automation' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ScheduledTasksSection />
              <WorkflowsSection />
              <Card>
                <CardBody>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-500" />
                      <h3 className="font-semibold text-neutral-900 dark:text-white">Event Triggers</h3>
                    </div>
                    <Button variant="ghost" size="sm">Configure</Button>
                  </div>
                  <div className="space-y-2">
                    {[
                      { event: 'user.created', workflows: 3, lastTriggered: '5 min ago' },
                      { event: 'app.deployed', workflows: 2, lastTriggered: '2 hours ago' },
                      { event: 'error.critical', workflows: 4, lastTriggered: '1 day ago' },
                      { event: 'data.exported', workflows: 1, lastTriggered: '3 hours ago' },
                      { event: 'license.expiring', workflows: 2, lastTriggered: '1 week ago' },
                    ].map((trigger) => (
                      <div key={trigger.event} className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                        <code className="text-sm text-neutral-700 dark:text-neutral-300">{trigger.event}</code>
                        <div className="flex items-center gap-3 text-xs text-neutral-500">
                          <span>{trigger.workflows} workflows</span>
                          <span>{trigger.lastTriggered}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-cyan-500" />
                      <h3 className="font-semibold text-neutral-900 dark:text-white">Automated Reports</h3>
                    </div>
                    <Button variant="ghost" size="sm" leftIcon={<Plus className="w-4 h-4" />}>New Report</Button>
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: 'Weekly Usage Report', schedule: 'Every Monday', recipients: 5, format: 'PDF' },
                      { name: 'Monthly Security Audit', schedule: 'First of month', recipients: 3, format: 'PDF' },
                      { name: 'Daily Error Summary', schedule: 'Every day', recipients: 8, format: 'Email' },
                    ].map((report) => (
                      <div key={report.name} className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-white">{report.name}</p>
                          <p className="text-xs text-neutral-500">{report.schedule} • {report.recipients} recipients</p>
                        </div>
                        <Badge variant="info" size="sm">{report.format}</Badge>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {/* ============================================ */}
          {/* NEW ENTERPRISE ENHANCEMENT TABS (30 features) */}
          {/* ============================================ */}

          {/* Real-Time & Monitoring Tab (5 features) */}
          {activeTab === 'realtime' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LiveActivityStream />
                <AnomalyDetectionAlerts />
              </div>
              <InteractiveSystemMap />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CustomAlertRules />
                <IncidentTimeline />
              </div>
            </div>
          )}

          {/* Analytics & Reporting Tab (5 features) */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <CustomDashboardBuilder />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SavedReportTemplates />
                <ExportManager />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TrendForecasting />
                <FunnelAnalysis />
              </div>
            </div>
          )}

          {/* Security & Compliance+ Tab (5 features) */}
          {activeTab === 'compliance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ThreatIntelligenceFeed />
                <PenetrationTestResults />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ComplianceChecklist />
                <DataClassificationMap />
              </div>
              <AccessReviewWorkflows />
            </div>
          )}

          {/* User Experience Tab (5 features) */}
          {activeTab === 'experience' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CustomizableThemes />
                <KeyboardShortcutsManager />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SavedViewsFilters />
                <MultiLanguageSupport />
              </div>
              <AccessibilityMode />
            </div>
          )}

          {/* API Tools Tab (5 features) */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <GraphQLPlayground />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <WebhookTester />
                <APIKeyManagement />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <IntegrationHealthDashboard />
                <DataPipelineMonitor />
              </div>
            </div>
          )}

          {/* AI/ML Features Tab (5 features) */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AIChatbotAssistant />
                <SmartRecommendations />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PredictiveMaintenance />
                <AutoScalingAdvisor />
              </div>
              <LogAnalysisAI />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
