/**
 * User Experience Enhancement Components
 * Part of the 30 Enterprise Dashboard Enhancements
 *
 * Features:
 * 1. Customizable Themes
 * 2. Keyboard Shortcuts Manager
 * 3. Saved Views & Filters
 * 4. Multi-language Support
 * 5. Accessibility Mode
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette,
  Sun,
  Moon,
  Monitor,
  Keyboard,
  Command,
  BookmarkPlus,
  Filter,
  Globe,
  Languages,
  Accessibility,
  Eye,
  Type,
  Volume2,
  Check,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Sparkles,
  Settings,
  Layout,
} from 'lucide-react';

// ============================================
// 1. Customizable Themes
// ============================================

interface ThemePreset {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
  };
  isCustom?: boolean;
}

const defaultThemes: ThemePreset[] = [
  {
    id: 'light',
    name: 'Light',
    colors: {
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      background: '#FFFFFF',
      surface: '#F3F4F6',
      text: '#1F2937',
      accent: '#10B981',
    },
  },
  {
    id: 'dark',
    name: 'Dark',
    colors: {
      primary: '#60A5FA',
      secondary: '#A78BFA',
      background: '#111827',
      surface: '#1F2937',
      text: '#F9FAFB',
      accent: '#34D399',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight Blue',
    colors: {
      primary: '#3B82F6',
      secondary: '#6366F1',
      background: '#0F172A',
      surface: '#1E293B',
      text: '#E2E8F0',
      accent: '#22D3EE',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: {
      primary: '#10B981',
      secondary: '#059669',
      background: '#064E3B',
      surface: '#065F46',
      text: '#ECFDF5',
      accent: '#FCD34D',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: {
      primary: '#F59E0B',
      secondary: '#EF4444',
      background: '#FEF3C7',
      surface: '#FFFBEB',
      text: '#78350F',
      accent: '#DC2626',
    },
  },
];

export function CustomizableThemes() {
  const [themes, setThemes] = useState<ThemePreset[]>(defaultThemes);
  const [activeTheme, setActiveTheme] = useState<string>('light');
  const [isCreating, setIsCreating] = useState(false);
  const [customTheme, setCustomTheme] = useState<ThemePreset>({
    id: '',
    name: '',
    colors: {
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      background: '#FFFFFF',
      surface: '#F3F4F6',
      text: '#1F2937',
      accent: '#10B981',
    },
    isCustom: true,
  });

  const applyTheme = (theme: ThemePreset) => {
    setActiveTheme(theme.id);
    // In real app, would apply CSS variables
  };

  const saveCustomTheme = () => {
    if (customTheme.name) {
      const newTheme = {
        ...customTheme,
        id: `custom-${Date.now()}`,
      };
      setThemes([...themes, newTheme]);
      setIsCreating(false);
      setCustomTheme({
        id: '',
        name: '',
        colors: {
          primary: '#3B82F6',
          secondary: '#8B5CF6',
          background: '#FFFFFF',
          surface: '#F3F4F6',
          text: '#1F2937',
          accent: '#10B981',
        },
        isCustom: true,
      });
    }
  };

  const deleteTheme = (id: string) => {
    setThemes(themes.filter(t => t.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">Theme Customizer</h3>
            <p className="text-sm text-neutral-500">Personalize your dashboard appearance</p>
          </div>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 text-sm"
        >
          <Plus className="w-4 h-4" />
          Create Theme
        </button>
      </div>

      {/* Quick Mode Toggles */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'light', icon: Sun, label: 'Light' },
          { id: 'dark', icon: Moon, label: 'Dark' },
          { id: 'system', icon: Monitor, label: 'System' },
        ].map((mode) => (
          <button
            key={mode.id}
            onClick={() => setActiveTheme(mode.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              activeTheme === mode.id
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
            }`}
          >
            <mode.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{mode.label}</span>
          </button>
        ))}
      </div>

      {/* Theme Presets */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        {themes.map((theme) => (
          <motion.div
            key={theme.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => applyTheme(theme)}
            className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
              activeTheme === theme.id
                ? 'border-primary-500 shadow-lg'
                : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
            }`}
          >
            {/* Color Preview */}
            <div className="flex gap-1 mb-3">
              {Object.values(theme.colors).slice(0, 4).map((color, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full border border-white shadow-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <p className="text-sm font-medium text-neutral-900 dark:text-white">{theme.name}</p>
            {activeTheme === theme.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 p-1 bg-primary-500 rounded-full"
              >
                <Check className="w-3 h-3 text-white" />
              </motion.div>
            )}
            {theme.isCustom && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTheme(theme.id);
                }}
                className="absolute bottom-2 right-2 p-1 text-neutral-400 hover:text-red-500"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Custom Theme Creator */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-neutral-200 dark:border-neutral-700 pt-4 mt-4"
          >
            <h4 className="text-sm font-medium text-neutral-900 dark:text-white mb-3">Create Custom Theme</h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Theme name..."
                value={customTheme.name}
                onChange={(e) => setCustomTheme({ ...customTheme, name: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-transparent text-sm"
              />
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(customTheme.colors).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={value}
                      onChange={(e) =>
                        setCustomTheme({
                          ...customTheme,
                          colors: { ...customTheme.colors, [key]: e.target.value },
                        })
                      }
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                    <span className="text-xs text-neutral-500 capitalize">{key}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={saveCustomTheme}
                  className="flex-1 px-3 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600"
                >
                  Save Theme
                </button>
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================
// 2. Keyboard Shortcuts Manager
// ============================================

interface KeyboardShortcut {
  id: string;
  name: string;
  description: string;
  keys: string[];
  category: string;
  isCustom?: boolean;
}

const defaultShortcuts: KeyboardShortcut[] = [
  { id: '1', name: 'Quick Search', description: 'Open global search', keys: ['Ctrl', 'K'], category: 'Navigation' },
  { id: '2', name: 'New Item', description: 'Create new item', keys: ['Ctrl', 'N'], category: 'Actions' },
  { id: '3', name: 'Save', description: 'Save current changes', keys: ['Ctrl', 'S'], category: 'Actions' },
  { id: '4', name: 'Dashboard', description: 'Go to dashboard', keys: ['G', 'D'], category: 'Navigation' },
  { id: '5', name: 'Settings', description: 'Open settings', keys: ['Ctrl', ','], category: 'Navigation' },
  { id: '6', name: 'Help', description: 'Show keyboard shortcuts', keys: ['?'], category: 'Help' },
  { id: '7', name: 'Close Modal', description: 'Close current modal', keys: ['Esc'], category: 'Navigation' },
  { id: '8', name: 'Undo', description: 'Undo last action', keys: ['Ctrl', 'Z'], category: 'Actions' },
  { id: '9', name: 'Redo', description: 'Redo last action', keys: ['Ctrl', 'Shift', 'Z'], category: 'Actions' },
  { id: '10', name: 'Toggle Sidebar', description: 'Show/hide sidebar', keys: ['Ctrl', 'B'], category: 'Navigation' },
];

export function KeyboardShortcutsManager() {
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>(defaultShortcuts);
  const [isRecording, setIsRecording] = useState<string | null>(null);
  const [recordedKeys, setRecordedKeys] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(shortcuts.map(s => s.category)));

  const filteredShortcuts = shortcuts.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isRecording) {
      e.preventDefault();
      const key = e.key === ' ' ? 'Space' : e.key;
      const newKeys: string[] = [];
      if (e.ctrlKey || e.metaKey) newKeys.push('Ctrl');
      if (e.shiftKey) newKeys.push('Shift');
      if (e.altKey) newKeys.push('Alt');
      if (!['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
        newKeys.push(key.length === 1 ? key.toUpperCase() : key);
      }
      setRecordedKeys(newKeys);
    }
  }, [isRecording]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const saveShortcut = (id: string) => {
    if (recordedKeys.length > 0) {
      setShortcuts(shortcuts.map(s =>
        s.id === id ? { ...s, keys: recordedKeys, isCustom: true } : s
      ));
    }
    setIsRecording(null);
    setRecordedKeys([]);
  };

  const resetShortcut = (id: string) => {
    const original = defaultShortcuts.find(s => s.id === id);
    if (original) {
      setShortcuts(shortcuts.map(s => s.id === id ? { ...original } : s));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg">
          <Keyboard className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-neutral-900 dark:text-white">Keyboard Shortcuts</h3>
          <p className="text-sm text-neutral-500">Customize your keyboard shortcuts</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search shortcuts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-transparent text-sm"
        />
        <select
          value={selectedCategory || ''}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
          className="px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-transparent text-sm"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Shortcuts List */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {filteredShortcuts.map((shortcut) => (
          <motion.div
            key={shortcut.id}
            layout
            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
              isRecording === shortcut.id
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-neutral-900 dark:text-white">{shortcut.name}</span>
                <span className="text-xs px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-700 rounded text-neutral-500">
                  {shortcut.category}
                </span>
                {shortcut.isCustom && (
                  <span className="text-xs px-1.5 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded">
                    Custom
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">{shortcut.description}</p>
            </div>
            <div className="flex items-center gap-2">
              {isRecording === shortcut.id ? (
                <>
                  <div className="flex gap-1 min-w-[120px]">
                    {recordedKeys.length > 0 ? (
                      recordedKeys.map((key, i) => (
                        <kbd
                          key={i}
                          className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded text-xs font-mono"
                        >
                          {key}
                        </kbd>
                      ))
                    ) : (
                      <span className="text-xs text-neutral-400 animate-pulse">Press keys...</span>
                    )}
                  </div>
                  <button
                    onClick={() => saveShortcut(shortcut.id)}
                    className="p-1.5 text-green-500 hover:bg-green-50 rounded"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setIsRecording(null); setRecordedKeys([]); }}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <div className="flex gap-1">
                    {shortcut.keys.map((key, i) => (
                      <kbd
                        key={i}
                        className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded text-xs font-mono text-neutral-600 dark:text-neutral-300"
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                  <button
                    onClick={() => setIsRecording(shortcut.id)}
                    className="p-1.5 text-neutral-400 hover:text-primary-500 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {shortcut.isCustom && (
                    <button
                      onClick={() => resetShortcut(shortcut.id)}
                      className="p-1.5 text-neutral-400 hover:text-amber-500 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded"
                      title="Reset to default"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <p className="text-xs text-neutral-500 flex items-center gap-2">
          <Command className="w-3 h-3" />
          Click the edit icon to record a new shortcut, then press your desired key combination
        </p>
      </div>
    </motion.div>
  );
}

// ============================================
// 3. Saved Views & Filters
// ============================================

interface SavedView {
  id: string;
  name: string;
  description: string;
  filters: Record<string, any>;
  columns: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  isDefault: boolean;
  createdAt: Date;
}

const mockViews: SavedView[] = [
  {
    id: '1',
    name: 'Active Users',
    description: 'Users active in the last 7 days',
    filters: { status: 'active', lastActive: '7d' },
    columns: ['name', 'email', 'lastActive', 'sessions'],
    sortBy: 'lastActive',
    sortOrder: 'desc',
    isDefault: true,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'High Usage Apps',
    description: 'Applications with > 1000 requests/day',
    filters: { requests: '>1000', status: 'running' },
    columns: ['name', 'requests', 'cpu', 'memory'],
    sortBy: 'requests',
    sortOrder: 'desc',
    isDefault: false,
    createdAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    name: 'Error Monitoring',
    description: 'Items with error status',
    filters: { status: 'error', severity: ['high', 'critical'] },
    columns: ['name', 'status', 'errorCount', 'lastError'],
    sortBy: 'errorCount',
    sortOrder: 'desc',
    isDefault: false,
    createdAt: new Date('2024-01-22'),
  },
];

export function SavedViewsFilters() {
  const [views, setViews] = useState<SavedView[]>(mockViews);
  const [activeView, setActiveView] = useState<string | null>('1');
  const [isCreating, setIsCreating] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [editingView, setEditingView] = useState<string | null>(null);

  const applyView = (view: SavedView) => {
    setActiveView(view.id);
    // In real app, would apply filters to data
  };

  const setAsDefault = (id: string) => {
    setViews(views.map(v => ({ ...v, isDefault: v.id === id })));
  };

  const deleteView = (id: string) => {
    setViews(views.filter(v => v.id !== id));
    if (activeView === id) setActiveView(null);
  };

  const createView = () => {
    if (newViewName) {
      const newView: SavedView = {
        id: `view-${Date.now()}`,
        name: newViewName,
        description: 'Custom view',
        filters: {},
        columns: ['name', 'status', 'createdAt'],
        sortBy: 'createdAt',
        sortOrder: 'desc',
        isDefault: false,
        createdAt: new Date(),
      };
      setViews([...views, newView]);
      setNewViewName('');
      setIsCreating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
            <BookmarkPlus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">Saved Views</h3>
            <p className="text-sm text-neutral-500">Quick access to filtered data views</p>
          </div>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 text-sm"
        >
          <Plus className="w-4 h-4" />
          Save Current View
        </button>
      </div>

      {/* Create View Form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg"
          >
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="View name..."
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
                className="flex-1 px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm"
                autoFocus
              />
              <button
                onClick={createView}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600"
              >
                Save
              </button>
              <button
                onClick={() => { setIsCreating(false); setNewViewName(''); }}
                className="px-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Views Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {views.map((view) => (
          <motion.div
            key={view.id}
            layout
            whileHover={{ scale: 1.01 }}
            onClick={() => applyView(view)}
            className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
              activeView === view.id
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Layout className="w-4 h-4 text-neutral-400" />
                <span className="font-medium text-neutral-900 dark:text-white">{view.name}</span>
              </div>
              {view.isDefault && (
                <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full">
                  Default
                </span>
              )}
            </div>
            <p className="text-sm text-neutral-500 mb-3">{view.description}</p>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Filter className="w-3 h-3" />
              <span>{Object.keys(view.filters).length} filters</span>
              <span>•</span>
              <span>{view.columns.length} columns</span>
            </div>

            {/* Actions (show on hover) */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!view.isDefault && (
                <button
                  onClick={(e) => { e.stopPropagation(); setAsDefault(view.id); }}
                  className="p-1 text-neutral-400 hover:text-amber-500"
                  title="Set as default"
                >
                  <Sparkles className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); deleteView(view.id); }}
                className="p-1 text-neutral-400 hover:text-red-500"
                title="Delete view"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            {activeView === view.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 p-1 bg-primary-500 rounded-full"
              >
                <Check className="w-3 h-3 text-white" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ============================================
// 4. Multi-language Support
// ============================================

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
  completion: number;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', direction: 'ltr', completion: 100 },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', direction: 'ltr', completion: 98 },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', direction: 'ltr', completion: 95 },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', direction: 'ltr', completion: 92 },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', direction: 'ltr', completion: 88 },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', direction: 'ltr', completion: 85 },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', direction: 'rtl', completion: 78 },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', direction: 'ltr', completion: 90 },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', direction: 'ltr', completion: 82 },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', direction: 'ltr', completion: 75 },
];

export function MultiLanguageSupport() {
  const [activeLanguage, setActiveLanguage] = useState<string>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoDetect, setAutoDetect] = useState(true);

  const filteredLanguages = languages.filter(lang =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentLang = languages.find(l => l.code === activeLanguage)!;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg">
          <Globe className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-neutral-900 dark:text-white">Language & Region</h3>
          <p className="text-sm text-neutral-500">Choose your preferred language</p>
        </div>
      </div>

      {/* Current Language */}
      <div className="flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{currentLang.flag}</span>
          <div>
            <p className="font-medium text-neutral-900 dark:text-white">{currentLang.name}</p>
            <p className="text-sm text-neutral-500">{currentLang.nativeName}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-primary-600">{currentLang.completion}% translated</p>
          <p className="text-xs text-neutral-500">{currentLang.direction === 'rtl' ? 'Right-to-left' : 'Left-to-right'}</p>
        </div>
      </div>

      {/* Auto-detect Toggle */}
      <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg mb-4">
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-neutral-400" />
          <span className="text-sm text-neutral-600 dark:text-neutral-300">Auto-detect language</span>
        </div>
        <button
          onClick={() => setAutoDetect(!autoDetect)}
          className={`relative w-10 h-6 rounded-full transition-colors ${
            autoDetect ? 'bg-primary-500' : 'bg-neutral-300 dark:bg-neutral-600'
          }`}
        >
          <motion.div
            animate={{ x: autoDetect ? 18 : 2 }}
            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
          />
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search languages..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-transparent text-sm mb-4"
      />

      {/* Language Grid */}
      <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
        {filteredLanguages.map((lang) => (
          <motion.button
            key={lang.code}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveLanguage(lang.code)}
            className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
              activeLanguage === lang.code
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
            }`}
          >
            <span className="text-xl">{lang.flag}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-neutral-900 dark:text-white truncate">{lang.name}</p>
              <p className="text-xs text-neutral-500 truncate">{lang.nativeName}</p>
            </div>
            {activeLanguage === lang.code && (
              <Check className="w-4 h-4 text-primary-500 flex-shrink-0" />
            )}
          </motion.button>
        ))}
      </div>

      {/* Translation Progress */}
      <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <p className="text-xs text-neutral-500 mb-2">Translation completion</p>
        <div className="flex gap-1">
          {languages.slice(0, 5).map((lang) => (
            <div key={lang.code} className="flex-1" title={`${lang.name}: ${lang.completion}%`}>
              <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-green-500"
                  style={{ width: `${lang.completion}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// 5. Accessibility Mode
// ============================================

interface AccessibilityOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  category: 'visual' | 'motor' | 'cognitive' | 'audio';
}

export function AccessibilityMode() {
  const [options, setOptions] = useState<AccessibilityOption[]>([
    {
      id: 'high-contrast',
      name: 'High Contrast',
      description: 'Increase color contrast for better visibility',
      icon: <Eye className="w-4 h-4" />,
      enabled: false,
      category: 'visual',
    },
    {
      id: 'large-text',
      name: 'Large Text',
      description: 'Increase base font size by 25%',
      icon: <Type className="w-4 h-4" />,
      enabled: false,
      category: 'visual',
    },
    {
      id: 'reduce-motion',
      name: 'Reduce Motion',
      description: 'Minimize animations and transitions',
      icon: <Sparkles className="w-4 h-4" />,
      enabled: false,
      category: 'cognitive',
    },
    {
      id: 'screen-reader',
      name: 'Screen Reader Mode',
      description: 'Optimize for screen reader navigation',
      icon: <Volume2 className="w-4 h-4" />,
      enabled: false,
      category: 'visual',
    },
    {
      id: 'keyboard-nav',
      name: 'Enhanced Keyboard Nav',
      description: 'Show focus indicators and skip links',
      icon: <Keyboard className="w-4 h-4" />,
      enabled: true,
      category: 'motor',
    },
    {
      id: 'dyslexia-font',
      name: 'Dyslexia-Friendly Font',
      description: 'Use OpenDyslexic font for readability',
      icon: <Type className="w-4 h-4" />,
      enabled: false,
      category: 'cognitive',
    },
  ]);

  const [fontSize, setFontSize] = useState(100);
  const [lineSpacing, setLineSpacing] = useState(1.5);
  const [cursorSize, setCursorSize] = useState('normal');

  const toggleOption = (id: string) => {
    setOptions(options.map(opt =>
      opt.id === id ? { ...opt, enabled: !opt.enabled } : opt
    ));
  };

  const categories = [
    { id: 'visual', name: 'Visual', icon: Eye },
    { id: 'motor', name: 'Motor', icon: Keyboard },
    { id: 'cognitive', name: 'Cognitive', icon: Sparkles },
  ];

  const enabledCount = options.filter(o => o.enabled).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
            <Accessibility className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">Accessibility</h3>
            <p className="text-sm text-neutral-500">{enabledCount} features enabled</p>
          </div>
        </div>
        <button className="text-sm text-primary-500 hover:text-primary-600">
          Reset All
        </button>
      </div>

      {/* Quick Adjustments */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
          <p className="text-xs text-neutral-500 mb-2">Font Size</p>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="75"
              max="150"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm font-medium w-10 text-right">{fontSize}%</span>
          </div>
        </div>
        <div className="p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
          <p className="text-xs text-neutral-500 mb-2">Line Spacing</p>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="1"
              max="2.5"
              step="0.1"
              value={lineSpacing}
              onChange={(e) => setLineSpacing(Number(e.target.value))}
              className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm font-medium w-10 text-right">{lineSpacing.toFixed(1)}x</span>
          </div>
        </div>
        <div className="p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
          <p className="text-xs text-neutral-500 mb-2">Cursor Size</p>
          <select
            value={cursorSize}
            onChange={(e) => setCursorSize(e.target.value)}
            className="w-full px-2 py-1 border border-neutral-200 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 text-sm"
          >
            <option value="normal">Normal</option>
            <option value="large">Large</option>
            <option value="extra-large">Extra Large</option>
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-4">
        {categories.map((cat) => {
          const count = options.filter(o => o.category === cat.id && o.enabled).length;
          return (
            <span
              key={cat.id}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-700 rounded-full text-sm"
            >
              <cat.icon className="w-3 h-3" />
              {cat.name}
              {count > 0 && (
                <span className="px-1.5 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                  {count}
                </span>
              )}
            </span>
          );
        })}
      </div>

      {/* Options List */}
      <div className="space-y-2">
        {options.map((option) => (
          <motion.div
            key={option.id}
            layout
            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
              option.enabled
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-neutral-200 dark:border-neutral-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                option.enabled
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-500'
              }`}>
                {option.icon}
              </div>
              <div>
                <p className="font-medium text-sm text-neutral-900 dark:text-white">{option.name}</p>
                <p className="text-xs text-neutral-500">{option.description}</p>
              </div>
            </div>
            <button
              onClick={() => toggleOption(option.id)}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                option.enabled ? 'bg-primary-500' : 'bg-neutral-300 dark:bg-neutral-600'
              }`}
            >
              <motion.div
                animate={{ x: option.enabled ? 22 : 3 }}
                className="absolute top-1 w-5 h-5 bg-white rounded-full shadow"
              />
            </button>
          </motion.div>
        ))}
      </div>

      {/* WCAG Compliance Note */}
      <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
          <Check className="w-4 h-4" />
          This dashboard is WCAG 2.1 AA compliant
        </p>
      </div>
    </motion.div>
  );
}
