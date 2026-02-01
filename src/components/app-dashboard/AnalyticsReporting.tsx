/**
 * Analytics & Reporting Components
 * 6. Custom Dashboard Builder
 * 7. Saved Report Templates
 * 8. Export to PDF/Excel
 * 9. Trend Forecasting
 * 10. Funnel Analysis
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  LayoutGrid,
  Plus,
  Trash2,
  Edit,
  Save,
  Download,
  FileText,
  FileSpreadsheet,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Users,
  DollarSign,
  Target,
  Zap,
  Eye,
  Settings,
  Copy,
  Share2,
  Star,
  StarOff,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Filter,
  Layers,
  Move,
  Maximize2,
  Minimize2,
  ArrowRight,
  ArrowDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
} from '../../design-system';

// ============================================================================
// 6. CUSTOM DASHBOARD BUILDER
// ============================================================================

interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'list' | 'map' | 'gauge';
  title: string;
  size: 'small' | 'medium' | 'large';
  config: Record<string, any>;
}

interface CustomDashboard {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  createdAt: Date;
  updatedAt: Date;
  isDefault: boolean;
}

const availableWidgets = [
  { type: 'metric', icon: <Target className="w-4 h-4" />, label: 'Metric Card' },
  { type: 'chart', icon: <LineChart className="w-4 h-4" />, label: 'Line Chart' },
  { type: 'bar', icon: <BarChart3 className="w-4 h-4" />, label: 'Bar Chart' },
  { type: 'pie', icon: <PieChart className="w-4 h-4" />, label: 'Pie Chart' },
  { type: 'table', icon: <LayoutGrid className="w-4 h-4" />, label: 'Data Table' },
  { type: 'gauge', icon: <Activity className="w-4 h-4" />, label: 'Gauge' },
];

const mockWidgets: DashboardWidget[] = [
  { id: '1', type: 'metric', title: 'Total Users', size: 'small', config: { value: 2847, change: 12.5, color: 'blue' } },
  { id: '2', type: 'metric', title: 'Revenue', size: 'small', config: { value: 48592, change: 8.3, color: 'green' } },
  { id: '3', type: 'chart', title: 'Traffic Overview', size: 'large', config: { type: 'line', data: [] } },
  { id: '4', type: 'gauge', title: 'System Health', size: 'medium', config: { value: 94, max: 100 } },
];

export function CustomDashboardBuilder() {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(mockWidgets);
  const [isEditing, setIsEditing] = useState(false);
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);

  const addWidget = (type: string) => {
    const newWidget: DashboardWidget = {
      id: Date.now().toString(),
      type: type as DashboardWidget['type'],
      title: `New ${type} Widget`,
      size: 'medium',
      config: {},
    };
    setWidgets([...widgets, newWidget]);
    setShowWidgetPicker(false);
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const getWidgetSizeClass = (size: DashboardWidget['size']) => {
    const sizes = {
      small: 'col-span-1',
      medium: 'col-span-2',
      large: 'col-span-3',
    };
    return sizes[size];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-neutral-900 dark:text-white">Dashboard Builder</h3>
          </div>
          <div className="flex items-center gap-2">
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setShowWidgetPicker(true)}
              >
                Add Widget
              </Button>
            )}
            <Button
              variant={isEditing ? 'primary' : 'outline'}
              size="sm"
              leftIcon={isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Save Layout' : 'Edit'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        {/* Widget Picker Modal */}
        <AnimatePresence>
          {showWidgetPicker && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setShowWidgetPicker(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-neutral-800 rounded-xl p-6 max-w-md w-full mx-4"
                onClick={e => e.stopPropagation()}
              >
                <h4 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-white">Add Widget</h4>
                <div className="grid grid-cols-2 gap-3">
                  {availableWidgets.map((widget) => (
                    <button
                      key={widget.type}
                      onClick={() => addWidget(widget.type)}
                      className="flex items-center gap-3 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                    >
                      <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-700">
                        {widget.icon}
                      </div>
                      <span className="font-medium text-neutral-700 dark:text-neutral-300">{widget.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Widget Grid */}
        <div className="grid grid-cols-3 gap-4">
          {widgets.map((widget) => (
            <motion.div
              key={widget.id}
              layout
              className={`${getWidgetSizeClass(widget.size)} relative group`}
              whileHover={isEditing ? { scale: 1.02 } : {}}
            >
              <div className={`h-32 rounded-xl border-2 ${isEditing ? 'border-dashed border-primary-300 dark:border-primary-700' : 'border-neutral-200 dark:border-neutral-700'} bg-neutral-50 dark:bg-neutral-800 p-4 transition-all`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{widget.title}</span>
                  {isEditing && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded">
                        <Move className="w-3 h-3 text-neutral-500" />
                      </button>
                      <button className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded">
                        <Settings className="w-3 h-3 text-neutral-500" />
                      </button>
                      <button
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                        onClick={() => removeWidget(widget.id)}
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-center h-16 text-neutral-400">
                  {widget.type === 'metric' && <Target className="w-8 h-8" />}
                  {widget.type === 'chart' && <LineChart className="w-8 h-8" />}
                  {widget.type === 'gauge' && <Activity className="w-8 h-8" />}
                  {widget.type === 'table' && <LayoutGrid className="w-8 h-8" />}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

// ============================================================================
// 7. SAVED REPORT TEMPLATES
// ============================================================================

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'analytics' | 'security' | 'usage' | 'financial' | 'custom';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    recipients: string[];
  };
  lastGenerated?: Date;
  starred: boolean;
  createdBy: string;
  sections: string[];
}

const mockTemplates: ReportTemplate[] = [
  {
    id: '1',
    name: 'Weekly Usage Report',
    description: 'Comprehensive overview of application usage patterns',
    type: 'usage',
    schedule: { frequency: 'weekly', time: '09:00', recipients: ['team@company.com'] },
    lastGenerated: new Date(Date.now() - 86400000),
    starred: true,
    createdBy: 'admin@company.com',
    sections: ['User Activity', 'API Usage', 'Storage', 'Performance'],
  },
  {
    id: '2',
    name: 'Monthly Security Audit',
    description: 'Security compliance and vulnerability assessment',
    type: 'security',
    schedule: { frequency: 'monthly', time: '06:00', recipients: ['security@company.com', 'cto@company.com'] },
    lastGenerated: new Date(Date.now() - 604800000),
    starred: true,
    createdBy: 'security@company.com',
    sections: ['Access Logs', 'Threat Detection', 'Compliance Status', 'Recommendations'],
  },
  {
    id: '3',
    name: 'Executive Dashboard',
    description: 'High-level metrics for leadership review',
    type: 'analytics',
    schedule: { frequency: 'weekly', time: '08:00', recipients: ['executives@company.com'] },
    starred: false,
    createdBy: 'admin@company.com',
    sections: ['KPIs', 'Growth Metrics', 'Revenue', 'User Acquisition'],
  },
  {
    id: '4',
    name: 'Cost Analysis',
    description: 'Detailed breakdown of infrastructure costs',
    type: 'financial',
    schedule: { frequency: 'monthly', time: '10:00', recipients: ['finance@company.com'] },
    starred: false,
    createdBy: 'finance@company.com',
    sections: ['Cloud Costs', 'License Fees', 'Support Costs', 'Projections'],
  },
];

export function SavedReportTemplates() {
  const [templates, setTemplates] = useState<ReportTemplate[]>(mockTemplates);
  const [selectedType, setSelectedType] = useState<string>('all');

  const toggleStar = (id: string) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, starred: !t.starred } : t));
  };

  const getTypeIcon = (type: ReportTemplate['type']) => {
    const icons = {
      analytics: <BarChart3 className="w-4 h-4" />,
      security: <Activity className="w-4 h-4" />,
      usage: <Users className="w-4 h-4" />,
      financial: <DollarSign className="w-4 h-4" />,
      custom: <Layers className="w-4 h-4" />,
    };
    return icons[type];
  };

  const getTypeColor = (type: ReportTemplate['type']) => {
    const colors = {
      analytics: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      security: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
      usage: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      financial: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
      custom: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
    };
    return colors[type];
  };

  const filteredTemplates = selectedType === 'all'
    ? templates
    : templates.filter(t => t.type === selectedType);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold text-neutral-900 dark:text-white">Report Templates</h3>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg px-2 py-1 bg-white dark:bg-neutral-800"
            >
              <option value="all">All Types</option>
              <option value="analytics">Analytics</option>
              <option value="security">Security</option>
              <option value="usage">Usage</option>
              <option value="financial">Financial</option>
            </select>
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              New Template
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardBody className="space-y-3">
        {filteredTemplates.map((template) => (
          <motion.div
            key={template.id}
            layout
            className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getTypeColor(template.type)}`}>
                  {getTypeIcon(template.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-neutral-900 dark:text-white">{template.name}</h4>
                    <button onClick={() => toggleStar(template.id)}>
                      {template.starred ? (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      ) : (
                        <StarOff className="w-4 h-4 text-neutral-400" />
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-neutral-500">{template.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-neutral-500 mb-3">
              {template.schedule && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {template.schedule.frequency} at {template.schedule.time}
                </span>
              )}
              {template.lastGenerated && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Last: {template.lastGenerated.toLocaleDateString()}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {template.sections.map((section) => (
                  <Badge key={section} variant="secondary" size="xs">{section}</Badge>
                ))}
              </div>
              <Button variant="primary" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                Generate
              </Button>
            </div>
          </motion.div>
        ))}
      </CardBody>
    </Card>
  );
}

// ============================================================================
// 8. EXPORT TO PDF/EXCEL
// ============================================================================

interface ExportJob {
  id: string;
  name: string;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: Date;
  completedAt?: Date;
  fileSize?: string;
  downloadUrl?: string;
}

const mockExportJobs: ExportJob[] = [
  { id: '1', name: 'Monthly Usage Report', format: 'pdf', status: 'completed', progress: 100, createdAt: new Date(Date.now() - 3600000), completedAt: new Date(Date.now() - 3500000), fileSize: '2.4 MB', downloadUrl: '#' },
  { id: '2', name: 'User Data Export', format: 'excel', status: 'processing', progress: 67, createdAt: new Date(Date.now() - 300000) },
  { id: '3', name: 'API Analytics', format: 'csv', status: 'pending', progress: 0, createdAt: new Date(Date.now() - 60000) },
  { id: '4', name: 'Security Audit Log', format: 'json', status: 'failed', progress: 45, createdAt: new Date(Date.now() - 7200000) },
];

export function ExportManager() {
  const [jobs, setJobs] = useState<ExportJob[]>(mockExportJobs);
  const [showNewExport, setShowNewExport] = useState(false);

  const getFormatIcon = (format: ExportJob['format']) => {
    const icons = {
      pdf: <FileText className="w-4 h-4 text-red-500" />,
      excel: <FileSpreadsheet className="w-4 h-4 text-green-500" />,
      csv: <FileText className="w-4 h-4 text-blue-500" />,
      json: <FileText className="w-4 h-4 text-yellow-500" />,
    };
    return icons[format];
  };

  const getStatusBadge = (status: ExportJob['status']) => {
    const variants: Record<ExportJob['status'], 'success' | 'warning' | 'danger' | 'secondary'> = {
      completed: 'success',
      processing: 'warning',
      pending: 'secondary',
      failed: 'danger',
    };
    return <Badge variant={variants[status]} size="sm">{status}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-cyan-500" />
            <h3 className="font-semibold text-neutral-900 dark:text-white">Export Manager</h3>
          </div>
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowNewExport(true)}>
            New Export
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        {/* Export Options */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { format: 'pdf', label: 'PDF Report', icon: <FileText className="w-5 h-5" />, color: 'bg-red-100 text-red-600' },
            { format: 'excel', label: 'Excel Workbook', icon: <FileSpreadsheet className="w-5 h-5" />, color: 'bg-green-100 text-green-600' },
            { format: 'csv', label: 'CSV Data', icon: <FileText className="w-5 h-5" />, color: 'bg-blue-100 text-blue-600' },
            { format: 'json', label: 'JSON Export', icon: <FileText className="w-5 h-5" />, color: 'bg-yellow-100 text-yellow-600' },
          ].map((option) => (
            <button
              key={option.format}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-primary-500 transition-all"
            >
              <div className={`p-3 rounded-lg ${option.color}`}>
                {option.icon}
              </div>
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{option.label}</span>
            </button>
          ))}
        </div>

        {/* Recent Exports */}
        <h4 className="text-sm font-medium text-neutral-500 mb-3">Recent Exports</h4>
        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex items-center gap-4 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800"
            >
              {getFormatIcon(job.format)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-neutral-900 dark:text-white truncate">{job.name}</span>
                  {getStatusBadge(job.status)}
                </div>
                {job.status === 'processing' && (
                  <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${job.progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                )}
                {job.status === 'completed' && job.fileSize && (
                  <span className="text-xs text-neutral-500">{job.fileSize}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {job.status === 'completed' && (
                  <Button variant="primary" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                    Download
                  </Button>
                )}
                {job.status === 'failed' && (
                  <Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-4 h-4" />}>
                    Retry
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

// ============================================================================
// 9. TREND FORECASTING
// ============================================================================

interface ForecastData {
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  timeframe: string;
  historicalData: number[];
  forecastData: number[];
}

const mockForecasts: ForecastData[] = [
  { metric: 'Active Users', currentValue: 2847, predictedValue: 3420, confidence: 87, trend: 'up', changePercent: 20.1, timeframe: 'Next 30 days', historicalData: [2100, 2250, 2400, 2550, 2700, 2847], forecastData: [2900, 3050, 3200, 3350, 3420] },
  { metric: 'API Calls', currentValue: 1200000, predictedValue: 1450000, confidence: 82, trend: 'up', changePercent: 20.8, timeframe: 'Next 30 days', historicalData: [900000, 980000, 1050000, 1120000, 1160000, 1200000], forecastData: [1280000, 1350000, 1400000, 1430000, 1450000] },
  { metric: 'Monthly Cost', currentValue: 4280, predictedValue: 4850, confidence: 91, trend: 'up', changePercent: 13.3, timeframe: 'Next 30 days', historicalData: [3800, 3950, 4050, 4150, 4220, 4280], forecastData: [4400, 4550, 4700, 4800, 4850] },
  { metric: 'Error Rate', currentValue: 0.12, predictedValue: 0.08, confidence: 78, trend: 'down', changePercent: -33.3, timeframe: 'Next 30 days', historicalData: [0.25, 0.22, 0.18, 0.15, 0.13, 0.12], forecastData: [0.11, 0.10, 0.09, 0.085, 0.08] },
];

export function TrendForecasting() {
  const [forecasts] = useState<ForecastData[]>(mockForecasts);
  const [selectedMetric, setSelectedMetric] = useState<ForecastData | null>(forecasts[0]);

  const formatValue = (value: number, metric: string) => {
    if (metric === 'Monthly Cost') return `$${value.toLocaleString()}`;
    if (metric === 'Error Rate') return `${value}%`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-neutral-900 dark:text-white">AI Trend Forecasting</h3>
            <Badge variant="secondary" size="sm">Predictive</Badge>
          </div>
          <Button variant="ghost" size="sm" leftIcon={<RefreshCw className="w-4 h-4" />}>
            Refresh Predictions
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        {/* Metric Cards */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {forecasts.map((forecast) => (
            <button
              key={forecast.metric}
              onClick={() => setSelectedMetric(forecast)}
              className={`p-4 rounded-xl border transition-all ${
                selectedMetric?.metric === forecast.metric
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-300'
              }`}
            >
              <p className="text-sm text-neutral-500 mb-1">{forecast.metric}</p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-neutral-900 dark:text-white">
                  {formatValue(forecast.predictedValue, forecast.metric)}
                </span>
                <span className={`text-sm font-medium ${forecast.trend === 'up' ? 'text-green-500' : forecast.trend === 'down' ? 'text-red-500' : 'text-neutral-500'}`}>
                  {forecast.trend === 'up' ? '↑' : forecast.trend === 'down' ? '↓' : '→'} {Math.abs(forecast.changePercent)}%
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">Confidence: {forecast.confidence}%</p>
            </button>
          ))}
        </div>

        {/* Forecast Chart Placeholder */}
        {selectedMetric && (
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-semibold text-neutral-900 dark:text-white">{selectedMetric.metric} Forecast</h4>
                <p className="text-sm text-neutral-500">{selectedMetric.timeframe}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-xs text-neutral-500">Historical</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-xs text-neutral-500">Predicted</span>
                </div>
              </div>
            </div>

            {/* Simple visualization */}
            <div className="h-40 flex items-end gap-1">
              {selectedMetric.historicalData.map((value, i) => (
                <div
                  key={`h-${i}`}
                  className="flex-1 bg-blue-500 rounded-t"
                  style={{ height: `${(value / Math.max(...selectedMetric.historicalData, ...selectedMetric.forecastData)) * 100}%` }}
                />
              ))}
              {selectedMetric.forecastData.map((value, i) => (
                <div
                  key={`f-${i}`}
                  className="flex-1 bg-purple-500 rounded-t opacity-70"
                  style={{ height: `${(value / Math.max(...selectedMetric.historicalData, ...selectedMetric.forecastData)) * 100}%` }}
                />
              ))}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-neutral-500">Current</p>
                <p className="text-lg font-bold text-neutral-900 dark:text-white">
                  {formatValue(selectedMetric.currentValue, selectedMetric.metric)}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Predicted</p>
                <p className="text-lg font-bold text-purple-600">
                  {formatValue(selectedMetric.predictedValue, selectedMetric.metric)}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Confidence</p>
                <p className="text-lg font-bold text-green-600">{selectedMetric.confidence}%</p>
              </div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// ============================================================================
// 10. FUNNEL ANALYSIS
// ============================================================================

interface FunnelStep {
  id: string;
  name: string;
  count: number;
  conversionRate: number;
  dropoffRate: number;
  avgTime: string;
}

interface Funnel {
  id: string;
  name: string;
  description: string;
  steps: FunnelStep[];
  totalConversion: number;
  period: string;
}

const mockFunnel: Funnel = {
  id: '1',
  name: 'User Onboarding',
  description: 'New user registration to first action funnel',
  period: 'Last 30 days',
  totalConversion: 23.4,
  steps: [
    { id: '1', name: 'Landing Page Visit', count: 45000, conversionRate: 100, dropoffRate: 0, avgTime: '0s' },
    { id: '2', name: 'Sign Up Started', count: 18500, conversionRate: 41.1, dropoffRate: 58.9, avgTime: '45s' },
    { id: '3', name: 'Email Verified', count: 15200, conversionRate: 82.2, dropoffRate: 17.8, avgTime: '2m 30s' },
    { id: '4', name: 'Profile Completed', count: 12800, conversionRate: 84.2, dropoffRate: 15.8, avgTime: '3m 15s' },
    { id: '5', name: 'First Action', count: 10530, conversionRate: 82.3, dropoffRate: 17.7, avgTime: '5m 45s' },
  ],
};

export function FunnelAnalysis() {
  const [funnel] = useState<Funnel>(mockFunnel);
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);

  const maxCount = Math.max(...funnel.steps.map(s => s.count));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-neutral-900 dark:text-white">Funnel Analysis</h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" size="sm">{funnel.period}</Badge>
            <Button variant="ghost" size="sm" leftIcon={<Settings className="w-4 h-4" />}>
              Configure
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        {/* Funnel Header */}
        <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-neutral-900 dark:text-white">{funnel.name}</h4>
              <p className="text-sm text-neutral-500">{funnel.description}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary-600">{funnel.totalConversion}%</p>
              <p className="text-sm text-neutral-500">Overall Conversion</p>
            </div>
          </div>
        </div>

        {/* Funnel Visualization */}
        <div className="space-y-4">
          {funnel.steps.map((step, index) => (
            <motion.div
              key={step.id}
              className="relative"
              onMouseEnter={() => setHoveredStep(step.id)}
              onMouseLeave={() => setHoveredStep(null)}
            >
              <div className="flex items-center gap-4">
                {/* Step Number */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold text-sm">
                  {index + 1}
                </div>

                {/* Funnel Bar */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-neutral-900 dark:text-white">{step.name}</span>
                    <span className="text-sm text-neutral-500">{step.count.toLocaleString()} users</span>
                  </div>
                  <div className="relative h-8 bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 to-primary-400 rounded-lg"
                      initial={{ width: 0 }}
                      animate={{ width: `${(step.count / maxCount) * 100}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    />
                    <div className="absolute inset-0 flex items-center justify-end pr-3">
                      <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                        {step.conversionRate}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dropoff Indicator */}
              {index < funnel.steps.length - 1 && (
                <div className="ml-12 my-2 flex items-center gap-2 text-sm">
                  <ArrowDown className="w-4 h-4 text-red-500" />
                  <span className="text-red-500 font-medium">{step.dropoffRate}% dropoff</span>
                  <span className="text-neutral-400">• Avg time: {step.avgTime}</span>
                </div>
              )}

              {/* Hover Details */}
              <AnimatePresence>
                {hoveredStep === step.id && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-0 bg-white dark:bg-neutral-800 shadow-lg rounded-lg p-3 z-10 border border-neutral-200 dark:border-neutral-700"
                  >
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-neutral-500">Users</p>
                        <p className="font-bold text-neutral-900 dark:text-white">{step.count.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Conversion</p>
                        <p className="font-bold text-green-600">{step.conversionRate}%</p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Dropoff</p>
                        <p className="font-bold text-red-600">{step.dropoffRate}%</p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Avg Time</p>
                        <p className="font-bold text-neutral-900 dark:text-white">{step.avgTime}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
