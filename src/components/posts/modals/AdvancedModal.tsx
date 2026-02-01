import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import {
  History,
  GitCompare,
  BarChart3,
  Users,
  Image,
  Puzzle,
  Clock,
  User,
  Check,
  X,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Eye,
  Download,
  Upload,
  Trash2,
  Plus,
  Minus,
  RefreshCw,
  Settings,
  Zap,
  TrendingUp,
  TrendingDown,
  Activity,
  MousePointer,
  Timer,
  Share2,
  MessageSquare,
  Edit3,
  Lock,
  Unlock,
  Crown,
  Star,
  Layers,
  FileImage,
  Maximize2,
  Minimize2,
  Crop,
  Filter,
  Sliders,
  Palette,
  Search,
  ExternalLink,
  Copy,
  MoreVertical,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Globe,
  Mail,
  Bell,
  Link,
  CheckCircle,
  XCircle,
  AlertTriangle,
  PlayCircle,
  PauseCircle,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import {
  EditorModal,
  ModalSection,
  FormField,
  FormRow,
  Toggle,
  Select,
  Input,
  Textarea,
  Badge,
  InfoBox,
} from './EditorModal';

interface AdvancedModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: AdvancedTab;
  hideTabs?: boolean;
}

type AdvancedTab = 'history' | 'compare' | 'analytics' | 'collaboration' | 'optimizer' | 'plugins';

// Tab titles and subtitles for single-tab mode
const advancedTabTitles: Record<string, { title: string; subtitle: string }> = {
  history: { title: 'Version History', subtitle: 'View and restore previous versions' },
  compare: { title: 'Compare Versions', subtitle: 'Compare different versions side by side' },
  analytics: { title: 'Analytics', subtitle: 'View post performance and statistics' },
  collaboration: { title: 'Collaboration', subtitle: 'Manage collaborators and comments' },
  optimizer: { title: 'Image Optimizer', subtitle: 'Optimize images for web performance' },
  plugins: { title: 'Plugins', subtitle: 'Browse and install editor plugins' },
};

// Version Types
interface Version {
  id: string;
  number: number;
  title: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  time: string;
  changes: {
    added: number;
    removed: number;
    modified: number;
  };
  type: 'auto' | 'manual' | 'publish';
  isCurrent: boolean;
  wordCount: number;
  note?: string;
}

// Analytics Types
interface AnalyticsData {
  views: number;
  viewsChange: number;
  uniqueVisitors: number;
  uniqueVisitorsChange: number;
  avgTimeOnPage: string;
  avgTimeChange: number;
  bounceRate: number;
  bounceRateChange: number;
  scrollDepth: number;
  shares: {
    facebook: number;
    twitter: number;
    linkedin: number;
    email: number;
  };
  topReferrers: { source: string; visits: number; percentage: number }[];
  topCountries: { country: string; visits: number; flag: string }[];
  deviceBreakdown: { device: string; percentage: number }[];
  readingProgress: { completed: number; partial: number; bounced: number };
}

// Collaborator Types
interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'owner' | 'editor' | 'viewer' | 'commenter';
  status: 'active' | 'pending' | 'offline';
  lastActive?: string;
  isCurrentUser?: boolean;
  color: string;
}

// Comment Types
interface Comment {
  id: string;
  author: Collaborator;
  content: string;
  timestamp: string;
  resolved: boolean;
  selection?: string;
  replies: {
    id: string;
    author: Collaborator;
    content: string;
    timestamp: string;
  }[];
}

// Image Optimizer Types
interface OptimizableImage {
  id: string;
  name: string;
  url: string;
  originalSize: number;
  optimizedSize?: number;
  width: number;
  height: number;
  format: string;
  status: 'pending' | 'optimizing' | 'optimized' | 'error';
  savings?: number;
}

// Plugin Types
interface Plugin {
  id: string;
  name: string;
  description: string;
  icon: string;
  version: string;
  author: string;
  isActive: boolean;
  hasSettings: boolean;
  category: 'editor' | 'seo' | 'media' | 'performance' | 'integration' | 'analytics';
  isNew?: boolean;
  isPremium?: boolean;
}

// Stat Card Component
const StatCard: React.FC<{
  label: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  color: string;
}> = ({ label, value, change, icon: Icon, color }) => (
  <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
    <div className="flex items-center justify-between mb-2">
      <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center', color)}>
        <Icon className="w-5 h-5" />
      </div>
      {change !== undefined && (
        <div className={clsx(
          'flex items-center gap-1 text-xs font-medium',
          change >= 0 ? 'text-green-400' : 'text-red-400'
        )}>
          {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(change)}%
        </div>
      )}
    </div>
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-xs text-slate-400 mt-1">{label}</p>
  </div>
);

// Progress Bar Component
const ProgressBar: React.FC<{ value: number; color: string; label?: string }> = ({ value, color, label }) => (
  <div className="space-y-1">
    {label && (
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-300">{value}%</span>
      </div>
    )}
    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
      <motion.div
        className={clsx('h-full rounded-full', color)}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  </div>
);

// Diff Line Component
const DiffLine: React.FC<{ type: 'added' | 'removed' | 'unchanged'; content: string; lineNumber: number }> = ({
  type,
  content,
  lineNumber,
}) => (
  <div className={clsx(
    'flex font-mono text-sm',
    type === 'added' && 'bg-green-500/10',
    type === 'removed' && 'bg-red-500/10'
  )}>
    <span className="w-12 text-right pr-3 text-slate-600 select-none border-r border-slate-700">
      {lineNumber}
    </span>
    <span className={clsx(
      'w-6 text-center select-none',
      type === 'added' && 'text-green-400 bg-green-500/20',
      type === 'removed' && 'text-red-400 bg-red-500/20',
      type === 'unchanged' && 'text-slate-600'
    )}>
      {type === 'added' ? '+' : type === 'removed' ? '-' : ' '}
    </span>
    <span className={clsx(
      'flex-1 px-3 whitespace-pre-wrap',
      type === 'added' && 'text-green-300',
      type === 'removed' && 'text-red-300',
      type === 'unchanged' && 'text-slate-400'
    )}>
      {content}
    </span>
  </div>
);

export const AdvancedModal: React.FC<AdvancedModalProps> = ({ isOpen, onClose, initialTab, hideTabs = false }) => {
  const [activeTab, setActiveTab] = useState<AdvancedTab>(initialTab || 'history');

  // Sync activeTab with initialTab prop changes (fixes single-tab mode)
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Get title and subtitle based on single-tab mode
  const currentTabInfo = advancedTabTitles[activeTab] || { title: 'Advanced', subtitle: 'Version history, analytics, collaboration' };
  const modalTitle = hideTabs ? currentTabInfo.title : 'Advanced';
  const modalSubtitle = hideTabs ? currentTabInfo.subtitle : 'Version history, analytics, collaboration';
  const [searchQuery, setSearchQuery] = useState('');

  // Version History State
  const [versions, setVersions] = useState<Version[]>([
    {
      id: '1',
      number: 12,
      title: 'Current Version',
      author: { name: 'John Doe', avatar: '' },
      date: 'Jan 21, 2025',
      time: '10:30 AM',
      changes: { added: 45, removed: 12, modified: 8 },
      type: 'manual',
      isCurrent: true,
      wordCount: 2456,
      note: 'Added new section on performance optimization',
    },
    {
      id: '2',
      number: 11,
      title: 'Auto-saved version',
      author: { name: 'John Doe', avatar: '' },
      date: 'Jan 21, 2025',
      time: '10:15 AM',
      changes: { added: 23, removed: 5, modified: 3 },
      type: 'auto',
      isCurrent: false,
      wordCount: 2423,
    },
    {
      id: '3',
      number: 10,
      title: 'Published version',
      author: { name: 'Jane Smith', avatar: '' },
      date: 'Jan 20, 2025',
      time: '4:30 PM',
      changes: { added: 156, removed: 34, modified: 22 },
      type: 'publish',
      isCurrent: false,
      wordCount: 2405,
      note: 'Initial publication',
    },
    {
      id: '4',
      number: 9,
      title: 'Draft revision',
      author: { name: 'John Doe', avatar: '' },
      date: 'Jan 20, 2025',
      time: '2:15 PM',
      changes: { added: 89, removed: 45, modified: 15 },
      type: 'manual',
      isCurrent: false,
      wordCount: 2283,
    },
    {
      id: '5',
      number: 8,
      title: 'Auto-saved version',
      author: { name: 'John Doe', avatar: '' },
      date: 'Jan 20, 2025',
      time: '1:00 PM',
      changes: { added: 34, removed: 12, modified: 5 },
      type: 'auto',
      isCurrent: false,
      wordCount: 2239,
    },
  ]);
  const [selectedVersions, setSelectedVersions] = useState<string[]>(['1', '3']);

  // Analytics State
  const [analyticsData] = useState<AnalyticsData>({
    views: 12847,
    viewsChange: 23,
    uniqueVisitors: 8932,
    uniqueVisitorsChange: 15,
    avgTimeOnPage: '4:32',
    avgTimeChange: 8,
    bounceRate: 34,
    bounceRateChange: -5,
    scrollDepth: 72,
    shares: {
      facebook: 234,
      twitter: 189,
      linkedin: 156,
      email: 89,
    },
    topReferrers: [
      { source: 'Google', visits: 4523, percentage: 45 },
      { source: 'Twitter', visits: 2134, percentage: 21 },
      { source: 'Facebook', visits: 1567, percentage: 15 },
      { source: 'LinkedIn', visits: 987, percentage: 10 },
      { source: 'Direct', visits: 636, percentage: 6 },
    ],
    topCountries: [
      { country: 'United States', visits: 4523, flag: '🇺🇸' },
      { country: 'United Kingdom', visits: 2134, flag: '🇬🇧' },
      { country: 'Germany', visits: 1567, flag: '🇩🇪' },
      { country: 'Canada', visits: 987, flag: '🇨🇦' },
      { country: 'Australia', visits: 636, flag: '🇦🇺' },
    ],
    deviceBreakdown: [
      { device: 'Desktop', percentage: 58 },
      { device: 'Mobile', percentage: 35 },
      { device: 'Tablet', percentage: 7 },
    ],
    readingProgress: {
      completed: 45,
      partial: 35,
      bounced: 20,
    },
  });
  const [analyticsRange, setAnalyticsRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // Collaboration State
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: '',
      role: 'owner',
      status: 'active',
      isCurrentUser: true,
      color: 'bg-purple-500',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      avatar: '',
      role: 'editor',
      status: 'active',
      lastActive: 'Editing now',
      color: 'bg-blue-500',
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      avatar: '',
      role: 'commenter',
      status: 'offline',
      lastActive: '2 hours ago',
      color: 'bg-green-500',
    },
    {
      id: '4',
      name: 'Sarah Williams',
      email: 'sarah@example.com',
      avatar: '',
      role: 'viewer',
      status: 'pending',
      color: 'bg-yellow-500',
    },
  ]);

  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: collaborators[1],
      content: 'Should we add more examples to this section?',
      timestamp: '10 minutes ago',
      resolved: false,
      selection: 'performance optimization techniques',
      replies: [
        {
          id: '1a',
          author: collaborators[0],
          content: 'Good idea! I\'ll add a code snippet.',
          timestamp: '5 minutes ago',
        },
      ],
    },
    {
      id: '2',
      author: collaborators[2],
      content: 'The introduction could be more engaging.',
      timestamp: '1 hour ago',
      resolved: true,
      replies: [],
    },
  ]);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Collaborator['role']>('viewer');
  const [isLocked, setIsLocked] = useState(false);

  // Image Optimizer State
  const [images, setImages] = useState<OptimizableImage[]>([
    {
      id: '1',
      name: 'hero-image.jpg',
      url: '',
      originalSize: 2456000,
      optimizedSize: 456000,
      width: 1920,
      height: 1080,
      format: 'JPEG',
      status: 'optimized',
      savings: 81,
    },
    {
      id: '2',
      name: 'feature-screenshot.png',
      url: '',
      originalSize: 1234000,
      optimizedSize: 234000,
      width: 1440,
      height: 900,
      format: 'PNG',
      status: 'optimized',
      savings: 81,
    },
    {
      id: '3',
      name: 'diagram.svg',
      url: '',
      originalSize: 45000,
      width: 800,
      height: 600,
      format: 'SVG',
      status: 'pending',
    },
    {
      id: '4',
      name: 'photo-gallery-1.jpg',
      url: '',
      originalSize: 3456000,
      width: 2400,
      height: 1600,
      format: 'JPEG',
      status: 'pending',
    },
  ]);

  const [optimizerSettings, setOptimizerSettings] = useState({
    quality: 80,
    maxWidth: 1920,
    maxHeight: 1080,
    convertToWebP: true,
    preserveExif: false,
    lazyLoad: true,
    responsiveImages: true,
  });

  // Plugins State
  const [plugins, setPlugins] = useState<Plugin[]>([
    {
      id: '1',
      name: 'Code Syntax Highlighter',
      description: 'Beautiful syntax highlighting for code blocks with 100+ language support',
      icon: '🎨',
      version: '2.3.1',
      author: 'CodeMaster',
      isActive: true,
      hasSettings: true,
      category: 'editor',
    },
    {
      id: '2',
      name: 'Table of Contents',
      description: 'Automatically generate a floating table of contents from headings',
      icon: '📑',
      version: '1.5.0',
      author: 'NavigatorPro',
      isActive: true,
      hasSettings: true,
      category: 'editor',
    },
    {
      id: '3',
      name: 'SEO Analyzer Pro',
      description: 'Advanced SEO analysis with competitor insights and keyword tracking',
      icon: '🔍',
      version: '3.0.0',
      author: 'SEO Tools',
      isActive: true,
      hasSettings: true,
      category: 'seo',
      isPremium: true,
    },
    {
      id: '4',
      name: 'Image CDN',
      description: 'Serve images through a global CDN with automatic optimization',
      icon: '🖼️',
      version: '1.2.0',
      author: 'FastMedia',
      isActive: false,
      hasSettings: true,
      category: 'media',
      isNew: true,
    },
    {
      id: '5',
      name: 'Performance Monitor',
      description: 'Track page load times and Core Web Vitals in real-time',
      icon: '⚡',
      version: '2.1.0',
      author: 'SpeedFreaks',
      isActive: false,
      hasSettings: true,
      category: 'performance',
    },
    {
      id: '6',
      name: 'Social Auto-Post',
      description: 'Automatically share new posts to social media platforms',
      icon: '📤',
      version: '1.8.0',
      author: 'SocialSync',
      isActive: true,
      hasSettings: true,
      category: 'integration',
    },
    {
      id: '7',
      name: 'Reading Analytics',
      description: 'Track scroll depth, reading time, and engagement heatmaps',
      icon: '📊',
      version: '1.4.2',
      author: 'InsightLab',
      isActive: true,
      hasSettings: true,
      category: 'analytics',
    },
    {
      id: '8',
      name: 'Markdown Importer',
      description: 'Import content from Markdown files with frontmatter support',
      icon: '📝',
      version: '1.0.0',
      author: 'MarkdownTools',
      isActive: false,
      hasSettings: false,
      category: 'editor',
      isNew: true,
    },
  ]);

  const [pluginFilter, setPluginFilter] = useState<'all' | Plugin['category']>('all');

  const tabs = [
    { id: 'history' as const, label: 'Version History', icon: History },
    { id: 'compare' as const, label: 'Compare', icon: GitCompare },
    { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
    { id: 'collaboration' as const, label: 'Collaboration', icon: Users },
    { id: 'optimizer' as const, label: 'Image Optimizer', icon: Image },
    { id: 'plugins' as const, label: 'Plugins', icon: Puzzle },
  ];

  // Format file size
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Toggle plugin active state
  const togglePlugin = (pluginId: string) => {
    setPlugins(plugins.map(p =>
      p.id === pluginId ? { ...p, isActive: !p.isActive } : p
    ));
  };

  // Optimize image
  const optimizeImage = (imageId: string) => {
    setImages(images.map(img => {
      if (img.id === imageId) {
        return { ...img, status: 'optimizing' };
      }
      return img;
    }));

    // Simulate optimization
    setTimeout(() => {
      setImages(imgs => imgs.map(img => {
        if (img.id === imageId) {
          const optimizedSize = Math.round(img.originalSize * 0.2);
          return {
            ...img,
            status: 'optimized',
            optimizedSize,
            savings: Math.round((1 - optimizedSize / img.originalSize) * 100),
          };
        }
        return img;
      }));
    }, 2000);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'history':
        return (
          <div className="space-y-6">
            {/* History Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Select
                  value="all"
                  onChange={() => {}}
                  options={[
                    { value: 'all', label: 'All versions' },
                    { value: 'manual', label: 'Manual saves' },
                    { value: 'auto', label: 'Auto-saves' },
                    { value: 'publish', label: 'Published' },
                  ]}
                />
                <span className="text-sm text-slate-400">{versions.length} versions</span>
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-white transition-colors">
                <Plus className="w-4 h-4" />
                Save Version
              </button>
            </div>

            {/* Version List */}
            <div className="space-y-2">
              {versions.map((version) => (
                <motion.div
                  key={version.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={clsx(
                    'p-4 rounded-lg border transition-all cursor-pointer',
                    version.isCurrent
                      ? 'bg-purple-500/10 border-purple-500/50'
                      : selectedVersions.includes(version.id)
                      ? 'bg-slate-800/80 border-slate-600'
                      : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                  )}
                  onClick={() => {
                    if (selectedVersions.includes(version.id)) {
                      setSelectedVersions(selectedVersions.filter(v => v !== version.id));
                    } else if (selectedVersions.length < 2) {
                      setSelectedVersions([...selectedVersions, version.id]);
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={clsx(
                        'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold',
                        version.type === 'publish' ? 'bg-green-500/20 text-green-400' :
                        version.type === 'manual' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-slate-700 text-slate-400'
                      )}>
                        v{version.number}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white">{version.title}</p>
                          {version.isCurrent && (
                            <Badge variant="success">Current</Badge>
                          )}
                          {version.type === 'publish' && (
                            <Badge variant="primary">Published</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {version.author.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {version.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {version.time}
                          </span>
                        </div>
                        {version.note && (
                          <p className="text-xs text-slate-500 mt-2 italic">"{version.note}"</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Changes */}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-green-400">+{version.changes.added}</span>
                        <span className="text-red-400">-{version.changes.removed}</span>
                        <span className="text-yellow-400">~{version.changes.modified}</span>
                      </div>

                      {/* Word count */}
                      <span className="text-xs text-slate-500">{version.wordCount} words</span>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-700 rounded transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!version.isCurrent && (
                          <button
                            className="p-1.5 text-slate-500 hover:text-green-400 hover:bg-green-500/10 rounded transition-colors"
                            title="Restore"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-700 rounded transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Auto-save Settings */}
            <ModalSection title="Auto-Save Settings" icon={Settings}>
              <div className="space-y-4">
                <Toggle
                  label="Enable auto-save"
                  description="Automatically save changes periodically"
                  checked={true}
                  onChange={() => {}}
                />
                <FormRow>
                  <FormField label="Save interval">
                    <Select
                      value="60"
                      onChange={() => {}}
                      options={[
                        { value: '30', label: '30 seconds' },
                        { value: '60', label: '1 minute' },
                        { value: '120', label: '2 minutes' },
                        { value: '300', label: '5 minutes' },
                      ]}
                    />
                  </FormField>
                  <FormField label="Max versions to keep">
                    <Select
                      value="50"
                      onChange={() => {}}
                      options={[
                        { value: '25', label: '25 versions' },
                        { value: '50', label: '50 versions' },
                        { value: '100', label: '100 versions' },
                        { value: '-1', label: 'Unlimited' },
                      ]}
                    />
                  </FormField>
                </FormRow>
              </div>
            </ModalSection>
          </div>
        );

      case 'compare':
        return (
          <div className="space-y-6">
            {/* Version Selector */}
            <div className="flex items-center gap-4 bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex-1">
                <label className="text-xs text-slate-500 mb-1 block">Compare from</label>
                <Select
                  value={selectedVersions[1] || ''}
                  onChange={(value) => setSelectedVersions([selectedVersions[0], value])}
                  options={versions.map(v => ({
                    value: v.id,
                    label: `v${v.number} - ${v.title} (${v.date})`,
                  }))}
                />
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <ArrowLeft className="w-4 h-4" />
                <ArrowRight className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-500 mb-1 block">Compare to</label>
                <Select
                  value={selectedVersions[0] || ''}
                  onChange={(value) => setSelectedVersions([value, selectedVersions[1]])}
                  options={versions.map(v => ({
                    value: v.id,
                    label: `v${v.number} - ${v.title} (${v.date})`,
                  }))}
                />
              </div>
              <button
                onClick={() => setSelectedVersions([selectedVersions[1], selectedVersions[0]])}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                title="Swap versions"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Diff Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
                <div className="flex items-center gap-2 text-green-400 mb-1">
                  <Plus className="w-4 h-4" />
                  <span className="font-medium">Added</span>
                </div>
                <p className="text-2xl font-bold text-green-400">156 lines</p>
              </div>
              <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/30">
                <div className="flex items-center gap-2 text-red-400 mb-1">
                  <Minus className="w-4 h-4" />
                  <span className="font-medium">Removed</span>
                </div>
                <p className="text-2xl font-bold text-red-400">34 lines</p>
              </div>
              <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/30">
                <div className="flex items-center gap-2 text-yellow-400 mb-1">
                  <Edit3 className="w-4 h-4" />
                  <span className="font-medium">Modified</span>
                </div>
                <p className="text-2xl font-bold text-yellow-400">22 sections</p>
              </div>
            </div>

            {/* Diff View */}
            <ModalSection title="Changes" icon={GitCompare} defaultOpen>
              <div className="space-y-4">
                {/* View Toggle */}
                <div className="flex gap-2 p-1 bg-slate-800/50 rounded-lg w-fit">
                  <button className="px-3 py-1.5 bg-purple-600 text-white rounded text-sm">
                    Unified
                  </button>
                  <button className="px-3 py-1.5 text-slate-400 hover:text-white rounded text-sm">
                    Split
                  </button>
                </div>

                {/* Diff Content */}
                <div className="bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden">
                  <div className="border-b border-slate-700 px-4 py-2 bg-slate-800/50">
                    <p className="text-sm text-slate-400">Section: Introduction</p>
                  </div>
                  <div className="overflow-x-auto">
                    <DiffLine type="unchanged" content="# Building Modern Web Applications" lineNumber={1} />
                    <DiffLine type="unchanged" content="" lineNumber={2} />
                    <DiffLine type="removed" content="This guide will teach you how to build web apps." lineNumber={3} />
                    <DiffLine type="added" content="This comprehensive guide will teach you everything you need to know about building modern, scalable web applications using the latest technologies and best practices." lineNumber={3} />
                    <DiffLine type="unchanged" content="" lineNumber={4} />
                    <DiffLine type="added" content="## What You'll Learn" lineNumber={5} />
                    <DiffLine type="added" content="" lineNumber={6} />
                    <DiffLine type="added" content="- React fundamentals and advanced patterns" lineNumber={7} />
                    <DiffLine type="added" content="- TypeScript for type-safe development" lineNumber={8} />
                    <DiffLine type="added" content="- Performance optimization techniques" lineNumber={9} />
                    <DiffLine type="unchanged" content="" lineNumber={10} />
                  </div>
                </div>

                {/* More sections */}
                <div className="bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden">
                  <div className="border-b border-slate-700 px-4 py-2 bg-slate-800/50">
                    <p className="text-sm text-slate-400">Section: Performance</p>
                  </div>
                  <div className="overflow-x-auto">
                    <DiffLine type="added" content="## Performance Optimization" lineNumber={45} />
                    <DiffLine type="added" content="" lineNumber={46} />
                    <DiffLine type="added" content="Performance is crucial for user experience. Here are key strategies:" lineNumber={47} />
                    <DiffLine type="added" content="" lineNumber={48} />
                    <DiffLine type="added" content="### Code Splitting" lineNumber={49} />
                    <DiffLine type="added" content="" lineNumber={50} />
                    <DiffLine type="added" content="Use dynamic imports to split your code into smaller chunks that are loaded on demand." lineNumber={51} />
                  </div>
                </div>
              </div>
            </ModalSection>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 text-slate-400 hover:text-white transition-colors">
                Export Diff
              </button>
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors">
                Restore v{versions.find(v => v.id === selectedVersions[1])?.number}
              </button>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            {/* Time Range Selector */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2 p-1 bg-slate-800/50 rounded-lg">
                {[
                  { value: '7d', label: '7 Days' },
                  { value: '30d', label: '30 Days' },
                  { value: '90d', label: '90 Days' },
                  { value: 'all', label: 'All Time' },
                ].map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setAnalyticsRange(range.value as typeof analyticsRange)}
                    className={clsx(
                      'px-3 py-1.5 rounded text-sm transition-colors',
                      analyticsRange === range.value
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    )}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-white transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
              <StatCard
                label="Total Views"
                value={analyticsData.views.toLocaleString()}
                change={analyticsData.viewsChange}
                icon={Eye}
                color="bg-blue-500/20 text-blue-400"
              />
              <StatCard
                label="Unique Visitors"
                value={analyticsData.uniqueVisitors.toLocaleString()}
                change={analyticsData.uniqueVisitorsChange}
                icon={Users}
                color="bg-green-500/20 text-green-400"
              />
              <StatCard
                label="Avg. Time on Page"
                value={analyticsData.avgTimeOnPage}
                change={analyticsData.avgTimeChange}
                icon={Timer}
                color="bg-purple-500/20 text-purple-400"
              />
              <StatCard
                label="Bounce Rate"
                value={`${analyticsData.bounceRate}%`}
                change={analyticsData.bounceRateChange}
                icon={Activity}
                color="bg-yellow-500/20 text-yellow-400"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-6">
              {/* Reading Progress */}
              <ModalSection title="Reading Progress" icon={Activity} defaultOpen>
                <div className="space-y-4">
                  <div className="h-48 bg-slate-900/50 rounded-lg border border-slate-700 flex items-center justify-center">
                    <div className="flex items-end gap-8 h-32">
                      {[
                        { label: 'Completed', value: analyticsData.readingProgress.completed, color: 'bg-green-500' },
                        { label: 'Partial', value: analyticsData.readingProgress.partial, color: 'bg-yellow-500' },
                        { label: 'Bounced', value: analyticsData.readingProgress.bounced, color: 'bg-red-500' },
                      ].map((item) => (
                        <div key={item.label} className="flex flex-col items-center gap-2">
                          <div
                            className={clsx('w-16 rounded-t-lg transition-all', item.color)}
                            style={{ height: `${item.value * 1.2}px` }}
                          />
                          <span className="text-xs text-slate-400">{item.label}</span>
                          <span className="text-sm font-medium text-white">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <ProgressBar value={analyticsData.scrollDepth} color="bg-purple-500" label="Avg. Scroll Depth" />
                </div>
              </ModalSection>

              {/* Device Breakdown */}
              <ModalSection title="Device Breakdown" icon={MousePointer} defaultOpen>
                <div className="space-y-4">
                  {analyticsData.deviceBreakdown.map((device) => (
                    <div key={device.device} className="flex items-center gap-4">
                      <span className="w-20 text-sm text-slate-400">{device.device}</span>
                      <div className="flex-1">
                        <ProgressBar
                          value={device.percentage}
                          color={
                            device.device === 'Desktop' ? 'bg-blue-500' :
                            device.device === 'Mobile' ? 'bg-green-500' : 'bg-yellow-500'
                          }
                        />
                      </div>
                      <span className="w-12 text-right text-sm text-white">{device.percentage}%</span>
                    </div>
                  ))}
                </div>
              </ModalSection>
            </div>

            {/* Social Shares */}
            <ModalSection title="Social Shares" icon={Share2} defaultOpen>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { name: 'Facebook', value: analyticsData.shares.facebook, color: 'bg-blue-600' },
                  { name: 'Twitter', value: analyticsData.shares.twitter, color: 'bg-sky-500' },
                  { name: 'LinkedIn', value: analyticsData.shares.linkedin, color: 'bg-blue-700' },
                  { name: 'Email', value: analyticsData.shares.email, color: 'bg-slate-600' },
                ].map((platform) => (
                  <div key={platform.name} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center mb-2', platform.color)}>
                      <Share2 className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-white">{platform.value}</p>
                    <p className="text-xs text-slate-400">{platform.name}</p>
                  </div>
                ))}
              </div>
            </ModalSection>

            {/* Traffic Sources */}
            <div className="grid grid-cols-2 gap-6">
              <ModalSection title="Top Referrers" icon={Link} defaultOpen>
                <div className="space-y-3">
                  {analyticsData.topReferrers.map((referrer, index) => (
                    <div key={referrer.source} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded bg-slate-700 flex items-center justify-center text-xs text-slate-400">
                        {index + 1}
                      </span>
                      <span className="flex-1 text-sm text-white">{referrer.source}</span>
                      <span className="text-sm text-slate-400">{referrer.visits.toLocaleString()}</span>
                      <span className="w-12 text-right text-sm text-slate-500">{referrer.percentage}%</span>
                    </div>
                  ))}
                </div>
              </ModalSection>

              <ModalSection title="Top Countries" icon={Globe} defaultOpen>
                <div className="space-y-3">
                  {analyticsData.topCountries.map((country, index) => (
                    <div key={country.country} className="flex items-center gap-3">
                      <span className="text-xl">{country.flag}</span>
                      <span className="flex-1 text-sm text-white">{country.country}</span>
                      <span className="text-sm text-slate-400">{country.visits.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </ModalSection>
            </div>
          </div>
        );

      case 'collaboration':
        return (
          <div className="space-y-6">
            {/* Lock Status */}
            <div className={clsx(
              'flex items-center justify-between p-4 rounded-lg border',
              isLocked
                ? 'bg-yellow-500/10 border-yellow-500/30'
                : 'bg-slate-800/50 border-slate-700'
            )}>
              <div className="flex items-center gap-3">
                {isLocked ? (
                  <Lock className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Unlock className="w-5 h-5 text-green-400" />
                )}
                <div>
                  <p className="text-sm text-white font-medium">
                    {isLocked ? 'Document is locked' : 'Document is unlocked'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {isLocked
                      ? 'Only the owner can edit while locked'
                      : 'Collaborators with edit access can make changes'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLocked(!isLocked)}
                className={clsx(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isLocked
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                )}
              >
                {isLocked ? 'Unlock' : 'Lock'}
              </button>
            </div>

            {/* Collaborators */}
            <ModalSection title="Collaborators" icon={Users} defaultOpen>
              <div className="space-y-3">
                {collaborators.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700"
                  >
                    <div className="relative">
                      <div className={clsx(
                        'w-10 h-10 rounded-full flex items-center justify-center text-white font-medium',
                        collaborator.color
                      )}>
                        {collaborator.name.charAt(0)}
                      </div>
                      <div className={clsx(
                        'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-800',
                        collaborator.status === 'active' ? 'bg-green-500' :
                        collaborator.status === 'pending' ? 'bg-yellow-500' : 'bg-slate-500'
                      )} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-white font-medium truncate">{collaborator.name}</p>
                        {collaborator.isCurrentUser && (
                          <Badge variant="secondary">You</Badge>
                        )}
                        {collaborator.role === 'owner' && (
                          <Crown className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{collaborator.email}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {collaborator.lastActive && (
                        <span className={clsx(
                          'text-xs',
                          collaborator.status === 'active' ? 'text-green-400' : 'text-slate-500'
                        )}>
                          {collaborator.lastActive}
                        </span>
                      )}

                      <Select
                        value={collaborator.role}
                        onChange={(value) => {
                          setCollaborators(collaborators.map(c =>
                            c.id === collaborator.id ? { ...c, role: value as Collaborator['role'] } : c
                          ));
                        }}
                        options={[
                          { value: 'owner', label: 'Owner' },
                          { value: 'editor', label: 'Editor' },
                          { value: 'commenter', label: 'Commenter' },
                          { value: 'viewer', label: 'Viewer' },
                        ]}
                        disabled={collaborator.isCurrentUser}
                      />

                      {!collaborator.isCurrentUser && (
                        <button className="p-1.5 text-slate-500 hover:text-red-400 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Invite */}
                <div className="flex gap-2 mt-4">
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter email to invite..."
                    className="flex-1"
                  />
                  <Select
                    value={inviteRole}
                    onChange={(value) => setInviteRole(value as Collaborator['role'])}
                    options={[
                      { value: 'editor', label: 'Editor' },
                      { value: 'commenter', label: 'Commenter' },
                      { value: 'viewer', label: 'Viewer' },
                    ]}
                  />
                  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm transition-colors">
                    Invite
                  </button>
                </div>
              </div>
            </ModalSection>

            {/* Comments */}
            <ModalSection title="Comments" icon={MessageSquare} defaultOpen>
              <div className="space-y-4">
                {/* Filter */}
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm">
                    All ({comments.length})
                  </button>
                  <button className="px-3 py-1.5 text-slate-400 hover:text-white rounded-lg text-sm">
                    Open ({comments.filter(c => !c.resolved).length})
                  </button>
                  <button className="px-3 py-1.5 text-slate-400 hover:text-white rounded-lg text-sm">
                    Resolved ({comments.filter(c => c.resolved).length})
                  </button>
                </div>

                {/* Comments List */}
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={clsx(
                        'rounded-lg border overflow-hidden',
                        comment.resolved
                          ? 'bg-slate-800/30 border-slate-700/50'
                          : 'bg-slate-800/50 border-slate-700'
                      )}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={clsx(
                              'w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium',
                              comment.author.color
                            )}>
                              {comment.author.name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-white">{comment.author.name}</span>
                                <span className="text-xs text-slate-500">{comment.timestamp}</span>
                              </div>
                              {comment.selection && (
                                <p className="text-xs text-purple-400 mt-1 bg-purple-500/10 px-2 py-0.5 rounded inline-block">
                                  "{comment.selection}"
                                </p>
                              )}
                              <p className={clsx(
                                'text-sm mt-2',
                                comment.resolved ? 'text-slate-500' : 'text-slate-300'
                              )}>
                                {comment.content}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setComments(comments.map(c =>
                                c.id === comment.id ? { ...c, resolved: !c.resolved } : c
                              ));
                            }}
                            className={clsx(
                              'p-1.5 rounded transition-colors',
                              comment.resolved
                                ? 'text-green-400 bg-green-500/10'
                                : 'text-slate-500 hover:text-green-400 hover:bg-green-500/10'
                            )}
                            title={comment.resolved ? 'Reopen' : 'Resolve'}
                          >
                            {comment.resolved ? <CheckCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Replies */}
                        {comment.replies.length > 0 && (
                          <div className="ml-11 mt-3 space-y-3 border-l-2 border-slate-700 pl-4">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex items-start gap-2">
                                <div className={clsx(
                                  'w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium',
                                  reply.author.color
                                )}>
                                  {reply.author.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-white">{reply.author.name}</span>
                                    <span className="text-xs text-slate-500">{reply.timestamp}</span>
                                  </div>
                                  <p className="text-sm text-slate-400 mt-1">{reply.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Reply Input */}
                      {!comment.resolved && (
                        <div className="border-t border-slate-700 p-3 bg-slate-900/50">
                          <Input placeholder="Write a reply..." className="text-sm" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </ModalSection>

            {/* Share Link */}
            <ModalSection title="Share Link" icon={Link}>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value="https://rustpress.io/edit/abc123?token=xyz789"
                    readOnly
                    className="flex-1 font-mono text-sm"
                  />
                  <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <Toggle
                    label="Anyone with link can view"
                    checked={true}
                    onChange={() => {}}
                  />
                </div>

                <InfoBox variant="info">
                  Anyone with this link will be able to view the document. They won't be able to edit unless you invite them.
                </InfoBox>
              </div>
            </ModalSection>
          </div>
        );

      case 'optimizer':
        return (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <p className="text-2xl font-bold text-white">{images.length}</p>
                <p className="text-xs text-slate-400">Total Images</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <p className="text-2xl font-bold text-green-400">
                  {images.filter(i => i.status === 'optimized').length}
                </p>
                <p className="text-xs text-slate-400">Optimized</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <p className="text-2xl font-bold text-white">
                  {formatSize(images.reduce((acc, img) => acc + img.originalSize, 0))}
                </p>
                <p className="text-xs text-slate-400">Original Size</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <p className="text-2xl font-bold text-green-400">
                  {formatSize(images.reduce((acc, img) => acc + (img.optimizedSize || img.originalSize), 0))}
                </p>
                <p className="text-xs text-slate-400">After Optimization</p>
              </div>
            </div>

            {/* Image List */}
            <ModalSection title="Images" icon={FileImage} defaultOpen>
              <div className="space-y-3">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                  >
                    <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      {image.url ? (
                        <img src={image.url} alt="" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <FileImage className="w-8 h-8 text-slate-500" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{image.name}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        <span>{image.width} x {image.height}</span>
                        <span>{image.format}</span>
                        <span>{formatSize(image.originalSize)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {image.status === 'optimized' && image.savings && (
                        <div className="text-right">
                          <p className="text-sm text-green-400 font-medium">-{image.savings}%</p>
                          <p className="text-xs text-slate-500">{formatSize(image.optimizedSize!)}</p>
                        </div>
                      )}

                      {image.status === 'optimizing' && (
                        <div className="flex items-center gap-2 text-purple-400">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Optimizing...</span>
                        </div>
                      )}

                      {image.status === 'pending' && (
                        <button
                          onClick={() => optimizeImage(image.id)}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm transition-colors"
                        >
                          Optimize
                        </button>
                      )}

                      {image.status === 'optimized' && (
                        <Badge variant="success">Optimized</Badge>
                      )}

                      <button className="p-1.5 text-slate-500 hover:text-white transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors">
                Optimize All Images
              </button>
            </ModalSection>

            {/* Optimization Settings */}
            <ModalSection title="Optimization Settings" icon={Sliders}>
              <div className="space-y-4">
                <FormField label="Quality">
                  <div className="space-y-2">
                    <input
                      type="range"
                      min={1}
                      max={100}
                      value={optimizerSettings.quality}
                      onChange={(e) => setOptimizerSettings({ ...optimizerSettings, quality: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Smaller file</span>
                      <span>{optimizerSettings.quality}%</span>
                      <span>Better quality</span>
                    </div>
                  </div>
                </FormField>

                <FormRow>
                  <FormField label="Max Width">
                    <Input
                      type="number"
                      value={optimizerSettings.maxWidth}
                      onChange={(e) => setOptimizerSettings({ ...optimizerSettings, maxWidth: parseInt(e.target.value) })}
                    />
                  </FormField>
                  <FormField label="Max Height">
                    <Input
                      type="number"
                      value={optimizerSettings.maxHeight}
                      onChange={(e) => setOptimizerSettings({ ...optimizerSettings, maxHeight: parseInt(e.target.value) })}
                    />
                  </FormField>
                </FormRow>

                <Toggle
                  label="Convert to WebP"
                  description="Convert images to WebP for better compression"
                  checked={optimizerSettings.convertToWebP}
                  onChange={(checked) => setOptimizerSettings({ ...optimizerSettings, convertToWebP: checked })}
                />

                <Toggle
                  label="Preserve EXIF data"
                  description="Keep camera and location metadata"
                  checked={optimizerSettings.preserveExif}
                  onChange={(checked) => setOptimizerSettings({ ...optimizerSettings, preserveExif: checked })}
                />

                <Toggle
                  label="Enable lazy loading"
                  description="Load images as they enter the viewport"
                  checked={optimizerSettings.lazyLoad}
                  onChange={(checked) => setOptimizerSettings({ ...optimizerSettings, lazyLoad: checked })}
                />

                <Toggle
                  label="Generate responsive images"
                  description="Create multiple sizes for different devices"
                  checked={optimizerSettings.responsiveImages}
                  onChange={(checked) => setOptimizerSettings({ ...optimizerSettings, responsiveImages: checked })}
                />
              </div>
            </ModalSection>
          </div>
        );

      case 'plugins':
        return (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search plugins..."
                  className="pl-10"
                />
              </div>
              <Select
                value={pluginFilter}
                onChange={(value) => setPluginFilter(value as typeof pluginFilter)}
                options={[
                  { value: 'all', label: 'All Categories' },
                  { value: 'editor', label: 'Editor' },
                  { value: 'seo', label: 'SEO' },
                  { value: 'media', label: 'Media' },
                  { value: 'performance', label: 'Performance' },
                  { value: 'integration', label: 'Integration' },
                  { value: 'analytics', label: 'Analytics' },
                ]}
              />
            </div>

            {/* Active Plugins */}
            <ModalSection
              title={`Active Plugins (${plugins.filter(p => p.isActive).length})`}
              icon={CheckCircle}
              defaultOpen
            >
              <div className="space-y-3">
                {plugins.filter(p => p.isActive).map((plugin) => (
                  <div
                    key={plugin.id}
                    className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                  >
                    <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center text-2xl">
                      {plugin.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-white font-medium">{plugin.name}</p>
                        {plugin.isPremium && (
                          <Badge variant="warning">
                            <Star className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                        {plugin.isNew && (
                          <Badge variant="primary">New</Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 truncate">{plugin.description}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span>v{plugin.version}</span>
                        <span>by {plugin.author}</span>
                        <span className="capitalize">{plugin.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {plugin.hasSettings && (
                        <button className="p-2 text-slate-500 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                          <Settings className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => togglePlugin(plugin.id)}
                        className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors"
                      >
                        Disable
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </ModalSection>

            {/* Available Plugins */}
            <ModalSection
              title={`Available Plugins (${plugins.filter(p => !p.isActive).length})`}
              icon={Puzzle}
              defaultOpen
            >
              <div className="space-y-3">
                {plugins
                  .filter(p => !p.isActive)
                  .filter(p => pluginFilter === 'all' || p.category === pluginFilter)
                  .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((plugin) => (
                    <div
                      key={plugin.id}
                      className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50"
                    >
                      <div className="w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center text-2xl opacity-70">
                        {plugin.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-slate-300 font-medium">{plugin.name}</p>
                          {plugin.isPremium && (
                            <Badge variant="warning">
                              <Star className="w-3 h-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                          {plugin.isNew && (
                            <Badge variant="primary">New</Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 truncate">{plugin.description}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-600">
                          <span>v{plugin.version}</span>
                          <span>by {plugin.author}</span>
                          <span className="capitalize">{plugin.category}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => togglePlugin(plugin.id)}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                      >
                        Enable
                      </button>
                    </div>
                  ))}
              </div>
            </ModalSection>

            {/* Browse More */}
            <div className="text-center py-4">
              <button className="inline-flex items-center gap-2 px-4 py-2 text-purple-400 hover:text-purple-300 transition-colors">
                <ExternalLink className="w-4 h-4" />
                Browse Plugin Marketplace
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <EditorModal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      subtitle={modalSubtitle}
      icon={Zap}
      iconColor="text-orange-400"
      size={hideTabs ? 'lg' : 'xl'}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as AdvancedTab)}
      hideTabs={hideTabs}
      showSearch={activeTab === 'plugins'}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search..."
      showHelp
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Info className="w-4 h-4" />
            <span>Advanced settings for power users</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      }
    >
      {renderContent()}
    </EditorModal>
  );
};

export default AdvancedModal;
