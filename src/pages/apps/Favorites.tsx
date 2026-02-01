/**
 * Favorites Page - Enterprise Edition
 * Manage and access favorite applications
 */

import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Star,
  StarOff,
  Search,
  Grid3X3,
  List,
  Play,
  Settings,
  MoreHorizontal,
  Plus,
  Trash2,
  ExternalLink,
  Clock,
  Users,
  TrendingUp,
  Folder,
  FolderPlus,
  Edit,
  GripVertical,
} from 'lucide-react';
import {
  PageHeader,
  Card,
  CardBody,
  Button,
  Badge,
} from '../../design-system';

interface FavoriteApp {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  lastUsed: string;
  usageCount: number;
  isFavorite: boolean;
  color: string;
}

interface FavoriteFolder {
  id: string;
  name: string;
  apps: string[];
  color: string;
}

const mockFavorites: FavoriteApp[] = [
  { id: '1', name: 'Task Manager', icon: '📋', description: 'Manage tasks and projects', category: 'Productivity', lastUsed: '2 min ago', usageCount: 245, isFavorite: true, color: 'from-blue-500 to-indigo-600' },
  { id: '2', name: 'Notes Pro', icon: '📝', description: 'Rich text note taking', category: 'Productivity', lastUsed: '15 min ago', usageCount: 189, isFavorite: true, color: 'from-amber-500 to-orange-600' },
  { id: '3', name: 'Calendar', icon: '📅', description: 'Schedule and events', category: 'Productivity', lastUsed: '1 hour ago', usageCount: 156, isFavorite: true, color: 'from-green-500 to-emerald-600' },
  { id: '4', name: 'Analytics', icon: '📊', description: 'Data visualization', category: 'Analytics', lastUsed: '3 hours ago', usageCount: 98, isFavorite: true, color: 'from-purple-500 to-pink-600' },
  { id: '5', name: 'File Manager', icon: '📁', description: 'Cloud file storage', category: 'Utilities', lastUsed: '1 day ago', usageCount: 134, isFavorite: true, color: 'from-cyan-500 to-blue-600' },
  { id: '6', name: 'Code Editor', icon: '👨‍💻', description: 'IDE for developers', category: 'Development', lastUsed: '2 days ago', usageCount: 87, isFavorite: true, color: 'from-slate-600 to-slate-800' },
];

const mockFolders: FavoriteFolder[] = [
  { id: 'f1', name: 'Work Essentials', apps: ['1', '2', '3'], color: 'bg-blue-500' },
  { id: 'f2', name: 'Dev Tools', apps: ['6'], color: 'bg-purple-500' },
];

export default function Favorites() {
  const [favorites, setFavorites] = useState<FavoriteApp[]>(mockFavorites);
  const [folders, setFolders] = useState<FavoriteFolder[]>(mockFolders);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const filteredFavorites = favorites.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = !selectedFolder || folders.find(f => f.id === selectedFolder)?.apps.includes(app.id);
    return matchesSearch && matchesFolder;
  });

  const removeFavorite = (id: string) => {
    setFavorites(favorites.filter(app => app.id !== id));
  };

  const createFolder = () => {
    if (newFolderName.trim()) {
      const newFolder: FavoriteFolder = {
        id: `f${Date.now()}`,
        name: newFolderName,
        apps: [],
        color: ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-amber-500'][Math.floor(Math.random() * 4)],
      };
      setFolders([...folders, newFolder]);
      setNewFolderName('');
      setShowCreateFolder(false);
    }
  };

  const launchApp = (app: FavoriteApp) => {
    console.log('Launching app:', app.name);
    // Would navigate to app
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Favorites"
        description="Quick access to your favorite applications"
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                    : 'text-neutral-500'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
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
              variant="primary"
              size="sm"
              leftIcon={<FolderPlus className="w-4 h-4" />}
              onClick={() => setShowCreateFolder(true)}
            >
              New Folder
            </Button>
          </div>
        }
      />

      {/* Search and Folders */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search favorites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Folder Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedFolder(null)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              !selectedFolder
                ? 'bg-primary-500 text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            <Star className="w-4 h-4" />
            All Favorites
          </button>
          {folders.map(folder => (
            <button
              key={folder.id}
              onClick={() => setSelectedFolder(folder.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                selectedFolder === folder.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              <Folder className="w-4 h-4" />
              {folder.name}
              <Badge variant="secondary" size="xs">{folder.apps.length}</Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Create Folder Modal */}
      <AnimatePresence>
        {showCreateFolder && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card>
              <CardBody className="p-4">
                <div className="flex items-center gap-4">
                  <FolderPlus className="w-8 h-8 text-primary-500" />
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Folder name..."
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && createFolder()}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      autoFocus
                    />
                  </div>
                  <Button variant="primary" size="sm" onClick={createFolder}>Create</Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowCreateFolder(false)}>Cancel</Button>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Favorites Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredFavorites.map((app, index) => (
              <motion.div
                key={app.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${app.color}`} />
                  <CardBody className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-4xl">{app.icon}</div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFavorite(app.id);
                          }}
                          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-amber-500 transition-all"
                        >
                          <Star className="w-4 h-4 fill-current" />
                        </button>
                        <button className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 transition-all">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">{app.name}</h3>
                    <p className="text-sm text-neutral-500 mb-3 line-clamp-2">{app.description}</p>

                    <div className="flex items-center justify-between text-xs text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {app.lastUsed}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {app.usageCount} uses
                      </span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => launchApp(app)}
                      className={`w-full mt-4 py-2 rounded-lg bg-gradient-to-r ${app.color} text-white font-medium text-sm flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity`}
                    >
                      <Play className="w-4 h-4" />
                      Launch
                    </motion.button>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {filteredFavorites.map((app, index) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center gap-4 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group"
                >
                  <div className="cursor-grab text-neutral-300 hover:text-neutral-400">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center text-2xl`}>
                    {app.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-neutral-900 dark:text-white">{app.name}</h3>
                    <p className="text-sm text-neutral-500 truncate">{app.description}</p>
                  </div>
                  <div className="hidden md:flex items-center gap-6 text-sm text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {app.lastUsed}
                    </span>
                    <span>{app.usageCount} uses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Play className="w-4 h-4" />}
                      onClick={() => launchApp(app)}
                    >
                      Launch
                    </Button>
                    <button
                      onClick={() => removeFavorite(app.id)}
                      className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-amber-500"
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {filteredFavorites.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Star className="w-16 h-16 mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">No favorites found</h3>
          <p className="text-neutral-500 mb-6">Start adding apps to your favorites for quick access</p>
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
            Browse Apps
          </Button>
        </motion.div>
      )}
    </div>
  );
}
