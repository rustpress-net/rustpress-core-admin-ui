/**
 * Recent Apps Page - Enterprise Edition
 * View and manage recently used applications
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Search,
  Calendar,
  Play,
  Star,
  StarOff,
  MoreHorizontal,
  Trash2,
  Filter,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  TrendingUp,
  Timer,
  BarChart2,
} from 'lucide-react';
import {
  PageHeader,
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
} from '../../design-system';

interface RecentApp {
  id: string;
  name: string;
  icon: string;
  description: string;
  lastUsed: Date;
  duration: string;
  sessions: number;
  category: string;
  isFavorite: boolean;
}

const mockRecent: RecentApp[] = [
  { id: '1', name: 'Task Manager', icon: '📋', description: 'Project task management', lastUsed: new Date(Date.now() - 1000 * 60 * 5), duration: '45m', sessions: 3, category: 'Productivity', isFavorite: true },
  { id: '2', name: 'Notes Pro', icon: '📝', description: 'Rich text notes', lastUsed: new Date(Date.now() - 1000 * 60 * 30), duration: '22m', sessions: 2, category: 'Productivity', isFavorite: true },
  { id: '3', name: 'Calendar', icon: '📅', description: 'Schedule management', lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 2), duration: '15m', sessions: 4, category: 'Productivity', isFavorite: false },
  { id: '4', name: 'Analytics Dashboard', icon: '📊', description: 'Data analytics', lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 5), duration: '1h 12m', sessions: 1, category: 'Analytics', isFavorite: true },
  { id: '5', name: 'File Manager', icon: '📁', description: 'Cloud storage', lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 8), duration: '8m', sessions: 2, category: 'Utilities', isFavorite: false },
  { id: '6', name: 'Email Client', icon: '📧', description: 'Email management', lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 24), duration: '35m', sessions: 5, category: 'Communication', isFavorite: false },
  { id: '7', name: 'Code Editor', icon: '👨‍💻', description: 'IDE for development', lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), duration: '3h 45m', sessions: 2, category: 'Development', isFavorite: true },
  { id: '8', name: 'Chat', icon: '💬', description: 'Team messaging', lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), duration: '1h 5m', sessions: 8, category: 'Communication', isFavorite: false },
  { id: '9', name: 'Video Call', icon: '📹', description: 'Video conferencing', lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), duration: '2h 30m', sessions: 1, category: 'Communication', isFavorite: false },
  { id: '10', name: 'Kanban Board', icon: '📌', description: 'Visual project board', lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), duration: '55m', sessions: 3, category: 'Productivity', isFavorite: false },
];

const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
};

const groupByDate = (apps: RecentApp[]): { [key: string]: RecentApp[] } => {
  const groups: { [key: string]: RecentApp[] } = {
    'Today': [],
    'Yesterday': [],
    'This Week': [],
    'Earlier': [],
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  apps.forEach(app => {
    if (app.lastUsed >= today) {
      groups['Today'].push(app);
    } else if (app.lastUsed >= yesterday) {
      groups['Yesterday'].push(app);
    } else if (app.lastUsed >= weekAgo) {
      groups['This Week'].push(app);
    } else {
      groups['Earlier'].push(app);
    }
  });

  return groups;
};

export default function Recent() {
  const [recentApps, setRecentApps] = useState<RecentApp[]>(mockRecent);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');
  const [sortOrder, setSortOrder] = useState<'recent' | 'duration' | 'sessions'>('recent');

  const filteredApps = recentApps
    .filter(app =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === 'recent') return b.lastUsed.getTime() - a.lastUsed.getTime();
      if (sortOrder === 'sessions') return b.sessions - a.sessions;
      return 0;
    });

  const groupedApps = groupByDate(filteredApps);

  const toggleFavorite = (id: string) => {
    setRecentApps(recentApps.map(app =>
      app.id === id ? { ...app, isFavorite: !app.isFavorite } : app
    ));
  };

  const clearHistory = () => {
    setRecentApps([]);
  };

  const removeFromHistory = (id: string) => {
    setRecentApps(recentApps.filter(app => app.id !== id));
  };

  // Stats
  const totalSessions = recentApps.reduce((sum, app) => sum + app.sessions, 0);
  const uniqueApps = recentApps.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recent Apps"
        description="Your recently used applications"
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('timeline')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'timeline'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                    : 'text-neutral-500'
                }`}
              >
                <Clock className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                    : 'text-neutral-500'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={clearHistory}
            >
              Clear History
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-3xl font-bold">{uniqueApps}</p>
              <p className="text-sm text-white/70">Apps this week</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-5 text-white"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <BarChart2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-3xl font-bold">{totalSessions}</p>
              <p className="text-sm text-white/70">Total sessions</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Timer className="w-6 h-6" />
            </div>
            <div>
              <p className="text-3xl font-bold">8h 45m</p>
              <p className="text-sm text-white/70">Total usage time</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search recent apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500">Sort by:</span>
          {(['recent', 'duration', 'sessions'] as const).map((sort) => (
            <button
              key={sort}
              onClick={() => setSortOrder(sort)}
              className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                sortOrder === sort
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
              }`}
            >
              {sort}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline View */}
      {viewMode === 'timeline' ? (
        <div className="space-y-8">
          {Object.entries(groupedApps).map(([group, apps]) => {
            if (apps.length === 0) return null;
            return (
              <motion.div
                key={group}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary-500" />
                  {group}
                  <Badge variant="secondary" size="sm">{apps.length}</Badge>
                </h3>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-0 bottom-0 w-px bg-neutral-200 dark:bg-neutral-700" />

                  <div className="space-y-4">
                    {apps.map((app, index) => (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative flex items-center gap-4 pl-12"
                      >
                        {/* Timeline dot */}
                        <div className="absolute left-4 w-4 h-4 rounded-full bg-primary-500 border-4 border-white dark:border-neutral-900" />

                        <Card className="flex-1 group hover:shadow-md transition-shadow">
                          <CardBody className="p-4">
                            <div className="flex items-center gap-4">
                              <div className="text-3xl">{app.icon}</div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-neutral-900 dark:text-white">{app.name}</h4>
                                  {app.isFavorite && <Star className="w-4 h-4 text-amber-500 fill-current" />}
                                </div>
                                <p className="text-sm text-neutral-500">{app.description}</p>
                              </div>
                              <div className="hidden md:flex items-center gap-4 text-sm text-neutral-500">
                                <span className="flex items-center gap-1">
                                  <Timer className="w-4 h-4" />
                                  {app.duration}
                                </span>
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="w-4 h-4" />
                                  {app.sessions} sessions
                                </span>
                              </div>
                              <span className="text-xs text-neutral-400 whitespace-nowrap">
                                {formatTimeAgo(app.lastUsed)}
                              </span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="primary" size="sm" leftIcon={<Play className="w-4 h-4" />}>
                                  Launch
                                </Button>
                                <button
                                  onClick={() => toggleFavorite(app.id)}
                                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                >
                                  {app.isFavorite ? (
                                    <Star className="w-4 h-4 text-amber-500 fill-current" />
                                  ) : (
                                    <StarOff className="w-4 h-4 text-neutral-400" />
                                  )}
                                </button>
                                <button
                                  onClick={() => removeFromHistory(app.id)}
                                  className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <Card>
          <CardBody className="p-0">
            <table className="w-full">
              <thead className="bg-neutral-50 dark:bg-neutral-800/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-neutral-500">App</th>
                  <th className="text-left p-4 text-sm font-medium text-neutral-500">Category</th>
                  <th className="text-left p-4 text-sm font-medium text-neutral-500">Duration</th>
                  <th className="text-left p-4 text-sm font-medium text-neutral-500">Sessions</th>
                  <th className="text-left p-4 text-sm font-medium text-neutral-500">Last Used</th>
                  <th className="text-right p-4 text-sm font-medium text-neutral-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {filteredApps.map((app, index) => (
                  <motion.tr
                    key={app.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{app.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-neutral-900 dark:text-white">{app.name}</span>
                            {app.isFavorite && <Star className="w-3 h-3 text-amber-500 fill-current" />}
                          </div>
                          <span className="text-sm text-neutral-500">{app.description}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary" size="sm">{app.category}</Badge>
                    </td>
                    <td className="p-4 text-sm text-neutral-600 dark:text-neutral-400">{app.duration}</td>
                    <td className="p-4 text-sm text-neutral-600 dark:text-neutral-400">{app.sessions}</td>
                    <td className="p-4 text-sm text-neutral-500">{formatTimeAgo(app.lastUsed)}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="primary" size="sm">Launch</Button>
                        <button
                          onClick={() => removeFromHistory(app.id)}
                          className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

      {filteredApps.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Clock className="w-16 h-16 mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">No recent apps</h3>
          <p className="text-neutral-500">Apps you use will appear here</p>
        </motion.div>
      )}
    </div>
  );
}
