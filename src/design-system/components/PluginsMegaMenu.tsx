/**
 * RustPress Plugins MegaMenu Component
 * Enhanced mega menu for quick access to installed plugins with search and discovery
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Puzzle,
  ChevronDown,
  ChevronRight,
  Users,
  BarChart3,
  Globe,
  ShoppingCart,
  Search,
  Mail,
  Zap,
  Box,
  Settings,
  Plus,
  ArrowRight,
  Sparkles,
  Shield,
  Database,
  Image,
  FileText,
  MessageSquare,
  CreditCard,
  Layers,
  Palette,
  Download,
  Star,
  TrendingUp,
  Clock,
  Check,
  X,
  Filter,
  Grid3X3,
  List,
  ExternalLink,
  RefreshCw,
  Power,
  PowerOff,
  Package,
  Heart,
  LayoutGrid,
  Rows3,
  FolderTree,
} from 'lucide-react';
import { cn } from '../utils';
import { usePluginStore, InstalledPlugin } from '../../store/pluginStore';
import { Badge } from './Badge';

// Icon mapping for plugins
const iconMap: Record<string, React.ElementType> = {
  Users,
  BarChart: BarChart3,
  BarChart3,
  Globe,
  ShoppingCart,
  Search,
  Mail,
  Zap,
  Box,
  Settings,
  Shield,
  Database,
  Image,
  FileText,
  MessageSquare,
  CreditCard,
  Layers,
  Palette,
  Puzzle,
  TrendingUp,
  Clock,
  Star,
};

// Category configuration with colors and icons
const categoryConfig: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  utility: { label: 'Utility', icon: Zap, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  analytics: { label: 'Analytics', icon: BarChart3, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  content: { label: 'Content', icon: FileText, color: 'text-green-500', bgColor: 'bg-green-500/10' },
  ecommerce: { label: 'E-Commerce', icon: ShoppingCart, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  seo: { label: 'SEO', icon: Search, color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' },
  forms: { label: 'Forms', icon: MessageSquare, color: 'text-pink-500', bgColor: 'bg-pink-500/10' },
  security: { label: 'Security', icon: Shield, color: 'text-red-500', bgColor: 'bg-red-500/10' },
  media: { label: 'Media', icon: Image, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  social: { label: 'Social', icon: Users, color: 'text-indigo-500', bgColor: 'bg-indigo-500/10' },
  performance: { label: 'Performance', icon: TrendingUp, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
};

// Available plugins for discovery (simulated marketplace)
const availablePlugins = [
  { id: 'backup-pro', name: 'Backup Pro', category: 'utility', description: 'Automated backups with cloud sync', rating: 4.8, downloads: 15000, icon: 'Database' },
  { id: 'cache-master', name: 'Cache Master', category: 'performance', description: 'Advanced caching for blazing speed', rating: 4.9, downloads: 25000, icon: 'Zap' },
  { id: 'social-share', name: 'Social Share Pro', category: 'social', description: 'Beautiful social sharing buttons', rating: 4.7, downloads: 18000, icon: 'Users' },
  { id: 'security-guard', name: 'Security Guard', category: 'security', description: 'Enterprise security & firewall', rating: 4.9, downloads: 32000, icon: 'Shield' },
  { id: 'image-optimizer', name: 'Image Optimizer', category: 'media', description: 'Auto-optimize images on upload', rating: 4.6, downloads: 22000, icon: 'Image' },
  { id: 'form-builder', name: 'Form Builder Pro', category: 'forms', description: 'Drag & drop form builder', rating: 4.8, downloads: 28000, icon: 'MessageSquare' },
];

type ViewMode = 'grid' | 'list' | 'category' | 'favorites';
type TabType = 'installed' | 'discover';

export interface PluginsMegaMenuProps {
  className?: string;
}

// Local storage key for favorites
const FAVORITES_KEY = 'rustpress-plugin-favorites';

export function PluginsMegaMenu({ className }: PluginsMegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeTab, setActiveTab] = useState<TabType>('installed');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { installedPlugins, getActivePlugins, activatePlugin, deactivatePlugin, installPlugin } = usePluginStore();

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  // Toggle favorite
  const toggleFavorite = useCallback((pluginId: string) => {
    setFavorites(prev =>
      prev.includes(pluginId)
        ? prev.filter(id => id !== pluginId)
        : [...prev, pluginId]
    );
  }, []);
  const activePlugins = useMemo(() => getActivePlugins(), [installedPlugins]);

  // Filter plugins based on search and category
  const filteredPlugins = useMemo(() => {
    let plugins = activeTab === 'installed' ? installedPlugins : availablePlugins;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      plugins = plugins.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      plugins = plugins.filter(p => p.category === selectedCategory);
    }

    return plugins;
  }, [installedPlugins, activeTab, searchQuery, selectedCategory]);

  // Group plugins by category
  const pluginsByCategory = useMemo(() => {
    const grouped: Record<string, (InstalledPlugin | typeof availablePlugins[0])[]> = {};
    filteredPlugins.forEach((plugin) => {
      const category = plugin.category || 'utility';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(plugin);
    });
    return grouped;
  }, [filteredPlugins]);

  const categories = Object.keys(pluginsByCategory);

  // Focus search on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !triggerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isOpen]);

  const handlePluginClick = useCallback(
    (plugin: InstalledPlugin | typeof availablePlugins[0]) => {
      setIsOpen(false);
      if ('menuHref' in plugin && plugin.menuHref) {
        navigate(plugin.menuHref);
      } else {
        navigate(`/plugins/${plugin.id}`);
      }
    },
    [navigate]
  );

  const handleViewAll = useCallback(() => {
    setIsOpen(false);
    navigate('/plugins');
  }, [navigate]);

  const handleAddNew = useCallback(() => {
    setIsOpen(false);
    navigate('/plugins/add');
  }, [navigate]);

  const handleInstall = useCallback((plugin: typeof availablePlugins[0]) => {
    installPlugin({
      id: plugin.id,
      name: plugin.name,
      slug: plugin.id,
      description: plugin.description,
      version: '1.0.0',
      author: 'RustPress Marketplace',
      active: true,
      icon: plugin.icon,
      category: plugin.category,
      isRustPlugin: false,
    });
  }, [installPlugin]);

  const handleToggleActive = useCallback((plugin: InstalledPlugin) => {
    if (plugin.active) {
      deactivatePlugin(plugin.id);
    } else {
      activatePlugin(plugin.id);
    }
  }, [activatePlugin, deactivatePlugin]);

  const getPluginIcon = (iconName: string) => {
    return iconMap[iconName] || Puzzle;
  };

  const isInstalled = useCallback((pluginId: string) => {
    return installedPlugins.some(p => p.id === pluginId);
  }, [installedPlugins]);

  return (
    <div className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2',
          'px-3 py-2 rounded-xl',
          'text-sm font-medium',
          'text-neutral-600 dark:text-neutral-300',
          'hover:bg-neutral-100 dark:hover:bg-neutral-800',
          'hover:text-neutral-900 dark:hover:text-white',
          'transition-colors duration-150',
          isOpen && 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Puzzle className="w-4 h-4" />
        <span className="hidden md:inline">Plugins</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
        {activePlugins.length > 0 && (
          <Badge variant="primary" size="xs" className="hidden sm:flex">
            {activePlugins.length}
          </Badge>
        )}
      </button>

      {/* Megamenu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            className={cn(
              'fixed top-16 left-0 right-0 mt-0',
              'lg:left-[280px]',
              'max-h-[calc(100vh-5rem)]',
              'rounded-b-2xl lg:rounded-2xl lg:mt-2 lg:mr-4',
              'bg-white dark:bg-neutral-900',
              'border-x border-b lg:border border-neutral-200 dark:border-neutral-800',
              'shadow-2xl dark:shadow-neutral-950/50',
              'z-megamenu',
              'overflow-hidden flex flex-col'
            )}
          >
            {/* Header with Search */}
            <div className="flex-shrink-0 p-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-900/30">
                    <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                      Plugins
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {installedPlugins.length} installed, {activePlugins.length} active
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddNew}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-lg',
                      'text-sm font-medium',
                      'text-primary-600 dark:text-primary-400',
                      'bg-primary-50 dark:bg-primary-900/20',
                      'hover:bg-primary-100 dark:hover:bg-primary-900/30',
                      'transition-colors'
                    )}
                  >
                    <Plus className="w-4 h-4" />
                    Add New
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 mb-4 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                <button
                  onClick={() => setActiveTab('installed')}
                  className={cn(
                    'flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all',
                    activeTab === 'installed'
                      ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  )}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Package className="w-4 h-4" />
                    Installed ({installedPlugins.length})
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('discover')}
                  className={cn(
                    'flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all',
                    activeTab === 'discover'
                      ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  )}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    Discover
                  </span>
                </button>
              </div>

              {/* Search and Filters */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search plugins..."
                    className={cn(
                      'w-full h-10 pl-10 pr-10 rounded-lg',
                      'text-sm',
                      'bg-neutral-100 dark:bg-neutral-800',
                      'text-neutral-900 dark:text-white',
                      'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
                      'border border-transparent',
                      'focus:outline-none focus:border-primary-500',
                      'focus:ring-2 focus:ring-primary-500/20',
                      'transition-all'
                    )}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    >
                      <X className="w-3 h-3 text-neutral-400" />
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <div className="relative">
                  <select
                    value={selectedCategory || ''}
                    onChange={(e) => setSelectedCategory(e.target.value || null)}
                    className={cn(
                      'h-10 pl-3 pr-8 rounded-lg appearance-none cursor-pointer',
                      'text-sm',
                      'bg-neutral-100 dark:bg-neutral-800',
                      'text-neutral-900 dark:text-white',
                      'border border-transparent',
                      'focus:outline-none focus:border-primary-500',
                      'transition-all'
                    )}
                  >
                    <option value="">All Categories</option>
                    {Object.entries(categoryConfig).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'p-2 rounded transition-all',
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
                    )}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'p-2 rounded transition-all',
                      viewMode === 'list'
                        ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
                    )}
                    title="List View"
                  >
                    <Rows3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('category')}
                    className={cn(
                      'p-2 rounded transition-all',
                      viewMode === 'category'
                        ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
                    )}
                    title="By Category"
                  >
                    <FolderTree className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('favorites')}
                    className={cn(
                      'p-2 rounded transition-all relative',
                      viewMode === 'favorites'
                        ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
                    )}
                    title="Favorites"
                  >
                    <Heart className={cn('w-4 h-4', viewMode === 'favorites' && 'fill-current text-red-500')} />
                    {favorites.length > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-medium">
                        {favorites.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-glow">
              {(() => {
                // Get plugins to display based on view mode
                const displayPlugins = viewMode === 'favorites'
                  ? filteredPlugins.filter(p => favorites.includes(p.id))
                  : filteredPlugins;

                if (displayPlugins.length === 0) {
                  // Empty State
                  return (
                    <div className="text-center py-12">
                      {viewMode === 'favorites' ? (
                        <>
                          <Heart className="w-12 h-12 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" />
                          <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                            No favorite plugins
                          </h4>
                          <p className="text-sm text-neutral-400 dark:text-neutral-500 mb-4">
                            Click the heart icon on plugins to add them to favorites
                          </p>
                        </>
                      ) : (
                        <>
                          <Puzzle className="w-12 h-12 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" />
                          <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                            {searchQuery ? 'No plugins found' : activeTab === 'installed' ? 'No Installed Plugins' : 'No Plugins Available'}
                          </h4>
                          <p className="text-sm text-neutral-400 dark:text-neutral-500 mb-4">
                            {searchQuery ? 'Try adjusting your search or filters' : 'Browse the marketplace to find plugins'}
                          </p>
                          {!searchQuery && (
                            <button
                              onClick={handleAddNew}
                              className={cn(
                                'inline-flex items-center gap-2 px-4 py-2 rounded-lg',
                                'text-sm font-medium',
                                'text-white bg-primary-600',
                                'hover:bg-primary-700',
                                'transition-colors'
                              )}
                            >
                              <Plus className="w-4 h-4" />
                              Browse Plugins
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  );
                }

                // Render plugin card (shared between views)
                const renderPluginCard = (plugin: typeof displayPlugins[0], isCompact = false) => {
                  const PluginIcon = getPluginIcon(plugin.icon);
                  const isInstalledPlugin = 'active' in plugin;
                  const installed = isInstalledPlugin || isInstalled(plugin.id);
                  const config = categoryConfig[plugin.category] || categoryConfig.utility;
                  const isFavorite = favorites.includes(plugin.id);

                  return (
                    <motion.div
                      key={plugin.id}
                      whileHover={{ scale: isCompact ? 1 : 1.02 }}
                      className={cn(
                        'relative rounded-xl cursor-pointer group',
                        'bg-neutral-50 dark:bg-neutral-800/50',
                        'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                        'border border-neutral-200/50 dark:border-neutral-700/50',
                        'hover:border-neutral-300 dark:hover:border-neutral-600',
                        'transition-all',
                        isCompact ? 'p-3' : 'p-4'
                      )}
                      onClick={() => handlePluginClick(plugin)}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'flex-shrink-0 rounded-xl',
                            isInstalledPlugin && (plugin as InstalledPlugin).isRustPlugin
                              ? 'bg-orange-100 dark:bg-orange-900/30'
                              : config.bgColor,
                            isCompact ? 'p-2' : 'p-2.5'
                          )}
                        >
                          <PluginIcon
                            className={cn(
                              isInstalledPlugin && (plugin as InstalledPlugin).isRustPlugin
                                ? 'text-orange-600 dark:text-orange-400'
                                : config.color,
                              isCompact ? 'w-4 h-4' : 'w-5 h-5'
                            )}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={cn('font-semibold text-neutral-800 dark:text-neutral-200', isCompact ? 'text-xs' : 'text-sm')}>
                              {plugin.name}
                            </p>
                            {isInstalledPlugin && (plugin as InstalledPlugin).isRustPlugin && (
                              <Badge variant="warning" size="xs">Rust</Badge>
                            )}
                          </div>
                          {!isCompact && (
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                              {plugin.description}
                            </p>
                          )}
                          <div className={cn('flex items-center gap-2 flex-wrap', isCompact ? 'mt-1' : 'mt-2')}>
                            <Badge variant="secondary" size="xs" className={config.color}>
                              {config.label}
                            </Badge>
                            {isInstalledPlugin && (
                              <span className="text-xs text-neutral-400">v{(plugin as InstalledPlugin).version}</span>
                            )}
                            {!isInstalledPlugin && 'rating' in plugin && !isCompact && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                <span className="text-xs text-neutral-600 dark:text-neutral-400">{plugin.rating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(plugin.id);
                        }}
                        className={cn(
                          'absolute top-2 right-2 p-1.5 rounded-lg transition-all',
                          isFavorite
                            ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                            : 'text-neutral-300 dark:text-neutral-600 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                        )}
                        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Heart className={cn('w-3.5 h-3.5', isFavorite && 'fill-current')} />
                      </button>

                      {/* Quick Actions */}
                      <div className={cn('absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity', isCompact ? 'top-8' : 'top-10')}>
                        {isInstalledPlugin ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleActive(plugin as InstalledPlugin);
                            }}
                            className={cn(
                              'p-1.5 rounded-lg transition-colors',
                              (plugin as InstalledPlugin).active
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500'
                            )}
                            title={(plugin as InstalledPlugin).active ? 'Deactivate' : 'Activate'}
                          >
                            {(plugin as InstalledPlugin).active ? <Power className="w-3.5 h-3.5" /> : <PowerOff className="w-3.5 h-3.5" />}
                          </button>
                        ) : installed ? (
                          <Badge variant="success" size="xs">
                            <Check className="w-3 h-3 mr-1" />
                            Installed
                          </Badge>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInstall(plugin as typeof availablePlugins[0]);
                            }}
                            className="p-1.5 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
                            title="Install"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Active Indicator */}
                      {isInstalledPlugin && (plugin as InstalledPlugin).active && (
                        <div className={cn('absolute right-2', isCompact ? 'bottom-2' : 'bottom-3')}>
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        </div>
                      )}
                    </motion.div>
                  );
                };

                // Render list item
                const renderListItem = (plugin: typeof displayPlugins[0]) => {
                  const PluginIcon = getPluginIcon(plugin.icon);
                  const isInstalledPlugin = 'active' in plugin;
                  const config = categoryConfig[plugin.category] || categoryConfig.utility;
                  const isFavorite = favorites.includes(plugin.id);

                  return (
                    <motion.div
                      key={plugin.id}
                      whileHover={{ x: 4 }}
                      className={cn(
                        'flex items-center gap-4 p-3 rounded-xl cursor-pointer group',
                        'hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
                        'transition-all'
                      )}
                      onClick={() => handlePluginClick(plugin)}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(plugin.id);
                        }}
                        className={cn(
                          'flex-shrink-0 p-1 rounded transition-colors',
                          isFavorite ? 'text-red-500' : 'text-neutral-300 dark:text-neutral-600 hover:text-red-400'
                        )}
                      >
                        <Heart className={cn('w-4 h-4', isFavorite && 'fill-current')} />
                      </button>
                      <div
                        className={cn(
                          'flex-shrink-0 p-2.5 rounded-xl',
                          isInstalledPlugin && (plugin as InstalledPlugin).isRustPlugin
                            ? 'bg-orange-100 dark:bg-orange-900/30'
                            : config.bgColor
                        )}
                      >
                        <PluginIcon
                          className={cn(
                            'w-5 h-5',
                            isInstalledPlugin && (plugin as InstalledPlugin).isRustPlugin
                              ? 'text-orange-600 dark:text-orange-400'
                              : config.color
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                            {plugin.name}
                          </p>
                          {isInstalledPlugin && (plugin as InstalledPlugin).isRustPlugin && (
                            <Badge variant="warning" size="xs">Rust</Badge>
                          )}
                          <Badge variant="secondary" size="xs" className={config.color}>
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                          {plugin.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {isInstalledPlugin ? (
                          <>
                            <span className="text-xs text-neutral-400">v{(plugin as InstalledPlugin).version}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleActive(plugin as InstalledPlugin);
                              }}
                              className={cn(
                                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                                (plugin as InstalledPlugin).active
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                              )}
                            >
                              {(plugin as InstalledPlugin).active ? 'Active' : 'Inactive'}
                            </button>
                          </>
                        ) : (
                          <>
                            {'rating' in plugin && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                <span className="text-xs text-neutral-600 dark:text-neutral-400">{plugin.rating}</span>
                              </div>
                            )}
                            {isInstalled(plugin.id) ? (
                              <Badge variant="success" size="sm">Installed</Badge>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleInstall(plugin as typeof availablePlugins[0]);
                                }}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
                              >
                                Install
                              </button>
                            )}
                          </>
                        )}
                        <ArrowRight className="w-4 h-4 text-neutral-300 dark:text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </motion.div>
                  );
                };

                // Render based on view mode
                if (viewMode === 'grid' || viewMode === 'favorites') {
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {displayPlugins.map((plugin) => renderPluginCard(plugin))}
                    </div>
                  );
                }

                if (viewMode === 'list') {
                  return (
                    <div className="space-y-2">
                      {displayPlugins.map((plugin) => renderListItem(plugin))}
                    </div>
                  );
                }

                if (viewMode === 'category') {
                  // Group by category
                  const grouped: Record<string, typeof displayPlugins> = {};
                  displayPlugins.forEach((plugin) => {
                    const cat = plugin.category || 'utility';
                    if (!grouped[cat]) grouped[cat] = [];
                    grouped[cat].push(plugin);
                  });

                  return (
                    <div className="space-y-6">
                      {Object.entries(grouped).map(([category, plugins]) => {
                        const config = categoryConfig[category] || {
                          label: category.charAt(0).toUpperCase() + category.slice(1),
                          icon: Puzzle,
                          color: 'text-neutral-500',
                          bgColor: 'bg-neutral-500/10',
                        };
                        const CategoryIcon = config.icon;

                        return (
                          <div key={category}>
                            {/* Category Header */}
                            <div className="flex items-center gap-2 mb-3">
                              <div className={cn('p-1.5 rounded-lg', config.bgColor)}>
                                <CategoryIcon className={cn('w-4 h-4', config.color)} />
                              </div>
                              <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                {config.label}
                              </span>
                              <Badge variant="secondary" size="xs">
                                {plugins.length}
                              </Badge>
                            </div>

                            {/* Plugin Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {plugins.map((plugin) => renderPluginCard(plugin, true))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                }

                return null;
              })()}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleViewAll}
                  className={cn(
                    'flex items-center gap-2',
                    'text-sm font-medium',
                    'text-neutral-600 dark:text-neutral-400',
                    'hover:text-neutral-900 dark:hover:text-white',
                    'transition-colors'
                  )}
                >
                  <Settings className="w-4 h-4" />
                  Manage All Plugins
                </button>
                <div className="flex items-center gap-4 text-xs text-neutral-400 dark:text-neutral-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    Rust: {installedPlugins.filter((p) => p.isRustPlugin).length}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Active: {activePlugins.length}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-neutral-400" />
                    Total: {installedPlugins.length}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Additional component for sidebar integration
export function PluginsSidebarSubmenu() {
  const { installedPlugins, getActivePlugins } = usePluginStore();
  const activePlugins = useMemo(() => getActivePlugins(), [installedPlugins]);
  const navigate = useNavigate();

  // Group by category
  const pluginsByCategory = useMemo(() => {
    const grouped: Record<string, InstalledPlugin[]> = {};
    activePlugins.forEach((plugin) => {
      const category = plugin.category || 'utility';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(plugin);
    });
    return grouped;
  }, [activePlugins]);

  return (
    <div className="space-y-4">
      {Object.entries(pluginsByCategory).map(([category, plugins]) => {
        const config = categoryConfig[category] || categoryConfig.utility;
        const CategoryIcon = config.icon;

        return (
          <div key={category}>
            <div className="flex items-center gap-2 px-3 mb-2">
              <CategoryIcon className={cn('w-3.5 h-3.5', config.color)} />
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                {config.label}
              </span>
            </div>
            <div className="space-y-0.5">
              {plugins.map((plugin) => {
                const PluginIcon = iconMap[plugin.icon] || Puzzle;
                return (
                  <button
                    key={plugin.id}
                    onClick={() => navigate(plugin.menuHref || `/plugins/${plugin.slug}`)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg',
                      'text-sm text-neutral-600 dark:text-neutral-400',
                      'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                      'hover:text-neutral-900 dark:hover:text-white',
                      'transition-colors'
                    )}
                  >
                    <PluginIcon className="w-4 h-4" />
                    <span className="truncate">{plugin.menuLabel || plugin.name}</span>
                    {plugin.isRustPlugin && (
                      <Badge variant="warning" size="xs" className="ml-auto">R</Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default PluginsMegaMenu;
