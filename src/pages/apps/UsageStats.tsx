/**
 * Usage Stats Page - Enterprise Edition
 * Comprehensive analytics dashboard for app usage monitoring
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Users,
  AppWindow,
  Clock,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Globe,
  Cpu,
  HardDrive,
  Wifi,
  Zap,
  Target,
  Award,
  MousePointer,
  Timer,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  PageHeader,
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
} from '../../design-system';

interface UsageMetric {
  label: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: React.ElementType;
  color: string;
}

interface AppUsage {
  id: string;
  name: string;
  icon: string;
  sessions: number;
  users: number;
  avgDuration: string;
  trend: number;
}

interface TimeSeriesData {
  time: string;
  value: number;
}

export default function UsageStats() {
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'quarter'>('week');
  const [isLoading, setIsLoading] = useState(false);

  // Key metrics
  const metrics: UsageMetric[] = [
    {
      label: 'Total Sessions',
      value: '24,589',
      change: 12.5,
      changeLabel: 'vs last period',
      icon: Activity,
      color: 'text-blue-500',
    },
    {
      label: 'Active Users',
      value: '1,847',
      change: 8.3,
      changeLabel: 'vs last period',
      icon: Users,
      color: 'text-green-500',
    },
    {
      label: 'Avg Session Duration',
      value: '12m 34s',
      change: -2.1,
      changeLabel: 'vs last period',
      icon: Clock,
      color: 'text-purple-500',
    },
    {
      label: 'Apps Launched',
      value: '8,432',
      change: 15.7,
      changeLabel: 'vs last period',
      icon: AppWindow,
      color: 'text-amber-500',
    },
  ];

  // Top apps by usage
  const topApps: AppUsage[] = [
    { id: '1', name: 'Task Manager', icon: '📋', sessions: 4521, users: 892, avgDuration: '18m', trend: 12 },
    { id: '2', name: 'Notes Pro', icon: '📝', sessions: 3892, users: 756, avgDuration: '24m', trend: 8 },
    { id: '3', name: 'Calendar', icon: '📅', sessions: 3456, users: 1203, avgDuration: '8m', trend: -3 },
    { id: '4', name: 'File Manager', icon: '📁', sessions: 2987, users: 654, avgDuration: '15m', trend: 5 },
    { id: '5', name: 'Analytics', icon: '📊', sessions: 2341, users: 432, avgDuration: '32m', trend: 22 },
    { id: '6', name: 'Chat', icon: '💬', sessions: 2156, users: 567, avgDuration: '45m', trend: 18 },
    { id: '7', name: 'Code Editor', icon: '👨‍💻', sessions: 1876, users: 234, avgDuration: '1h 12m', trend: 15 },
    { id: '8', name: 'Email Client', icon: '📧', sessions: 1654, users: 432, avgDuration: '22m', trend: -5 },
  ];

  // Hourly usage data
  const hourlyData: TimeSeriesData[] = Array.from({ length: 24 }, (_, i) => ({
    time: `${i.toString().padStart(2, '0')}:00`,
    value: Math.floor(Math.random() * 500) + 100 + (i >= 9 && i <= 18 ? 300 : 0),
  }));

  // User engagement breakdown
  const engagementData = [
    { label: 'Power Users', value: 15, color: 'bg-indigo-500' },
    { label: 'Regular Users', value: 45, color: 'bg-blue-500' },
    { label: 'Occasional', value: 28, color: 'bg-cyan-500' },
    { label: 'New Users', value: 12, color: 'bg-emerald-500' },
  ];

  // Device breakdown
  const deviceData = [
    { label: 'Desktop', value: 62, icon: '🖥️' },
    { label: 'Mobile', value: 28, icon: '📱' },
    { label: 'Tablet', value: 10, icon: '📱' },
  ];

  // Peak hours
  const peakHours = [
    { hour: '10:00 AM', sessions: 892 },
    { hour: '2:00 PM', sessions: 876 },
    { hour: '11:00 AM', sessions: 834 },
    { hour: '3:00 PM', sessions: 798 },
  ];

  // Performance metrics
  const performanceMetrics = [
    { label: 'Avg Load Time', value: '1.2s', target: '< 2s', status: 'good' },
    { label: 'Error Rate', value: '0.12%', target: '< 1%', status: 'good' },
    { label: 'API Response', value: '145ms', target: '< 200ms', status: 'good' },
    { label: 'Uptime', value: '99.97%', target: '99.9%', status: 'excellent' },
  ];

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usage Statistics"
        description="Monitor application usage, user engagement, and performance metrics"
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
              {(['today', 'week', 'month', 'quarter'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                    dateRange === range
                      ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
            <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
              Export
            </Button>
          </div>
        }
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full">
              <CardBody className="p-5">
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-700 ${metric.color}`}>
                    <metric.icon className="w-5 h-5" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    metric.change >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {metric.change >= 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {Math.abs(metric.change)}%
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {metric.value}
                  </p>
                  <p className="text-sm text-neutral-500 mt-1">{metric.label}</p>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Usage Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-neutral-900 dark:text-white">Usage Over Time</h3>
              <Badge variant="info" size="sm">Live</Badge>
            </div>
          </CardHeader>
          <CardBody>
            <div className="h-64 flex items-end gap-1">
              {hourlyData.map((data, index) => (
                <motion.div
                  key={data.time}
                  initial={{ height: 0 }}
                  animate={{ height: `${(data.value / 800) * 100}%` }}
                  transition={{ delay: index * 0.02, duration: 0.5 }}
                  className="flex-1 bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-sm hover:from-primary-600 hover:to-primary-500 transition-colors cursor-pointer group relative"
                >
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {data.time}: {data.value} sessions
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-neutral-500">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>23:00</span>
            </div>
          </CardBody>
        </Card>

        {/* User Engagement */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-neutral-900 dark:text-white">User Engagement</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {engagementData.map((segment, index) => (
                <motion.div
                  key={segment.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">{segment.label}</span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">{segment.value}%</span>
                  </div>
                  <div className="h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${segment.value}%` }}
                      transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                      className={`h-full ${segment.color} rounded-full`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
              <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Device Distribution</h4>
              <div className="flex items-center gap-4">
                {deviceData.map((device) => (
                  <div key={device.label} className="text-center">
                    <span className="text-2xl">{device.icon}</span>
                    <p className="text-lg font-bold text-neutral-900 dark:text-white mt-1">{device.value}%</p>
                    <p className="text-xs text-neutral-500">{device.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Apps */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-neutral-900 dark:text-white">Top Applications</h3>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {topApps.slice(0, 6).map((app, index) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  <span className="text-2xl">{app.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 dark:text-white">{app.name}</p>
                    <p className="text-sm text-neutral-500">
                      {app.sessions.toLocaleString()} sessions • {app.users} users
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">{app.avgDuration}</p>
                    <p className={`text-xs flex items-center justify-end gap-1 ${
                      app.trend >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {app.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(app.trend)}%
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Performance & Peak Hours */}
        <div className="space-y-6">
          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-neutral-900 dark:text-white">Performance Metrics</h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-4">
                {performanceMetrics.map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-neutral-500">{metric.label}</span>
                      <span className={`w-2 h-2 rounded-full ${
                        metric.status === 'excellent' ? 'bg-green-500' :
                        metric.status === 'good' ? 'bg-blue-500' : 'bg-amber-500'
                      }`} />
                    </div>
                    <p className="text-xl font-bold text-neutral-900 dark:text-white">{metric.value}</p>
                    <p className="text-xs text-neutral-400 mt-1">Target: {metric.target}</p>
                  </motion.div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Peak Hours */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-neutral-900 dark:text-white">Peak Usage Hours</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {peakHours.map((peak, index) => (
                  <motion.div
                    key={peak.hour}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-bold text-primary-600 dark:text-primary-400">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-neutral-900 dark:text-white">{peak.hour}</span>
                        <span className="text-sm text-neutral-500">{peak.sessions} sessions</span>
                      </div>
                      <div className="h-1.5 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(peak.sessions / 900) * 100}%` }}
                          transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                          className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
