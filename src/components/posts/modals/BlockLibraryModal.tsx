/**
 * BlockLibraryModal - Enterprise Block Library Modal
 *
 * Comprehensive modal for animations, templates, and media library
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  FileText,
  Image,
  Layout,
  Grid,
  Columns,
  Square,
  Play,
  Pause,
  Eye,
  Plus,
  Search,
  Filter,
  Star,
  Clock,
  Download,
  Heart,
  Folder,
  FolderOpen,
  ChevronRight,
  Check,
  X,
  Zap,
  Move,
  RotateCw,
  Scale,
  Layers,
  MousePointer,
  ArrowRight,
  Repeat,
  Shuffle,
  Volume2,
  Upload,
  Link,
  Trash2,
  Edit,
  Copy,
  ExternalLink,
  AlertCircle,
  Info,
  Quote,
  List,
  Code,
  Type,
  MoreHorizontal,
} from 'lucide-react';
import clsx from 'clsx';
import {
  EditorModal,
  ModalSection,
  FormField,
  FormRow,
  Toggle,
  Select,
  Input,
  Badge,
  InfoBox,
} from './EditorModal';

interface BlockLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertBlock: (block: string) => void;
  defaultTab?: 'blocks' | 'animations' | 'templates' | 'media';
  initialTab?: 'blocks' | 'animations' | 'templates' | 'media';
  hideTabs?: boolean;
}

// Tab type alias
type TabType = 'blocks' | 'animations' | 'templates' | 'media';

// Tab titles and subtitles for single-tab mode
const tabTitles: Record<string, { title: string; subtitle: string }> = {
  blocks: { title: 'Content Blocks', subtitle: 'Add paragraphs, headings, images, and more' },
  animations: { title: 'Animations', subtitle: 'Add entrance, exit, and scroll animations' },
  templates: { title: 'Templates', subtitle: 'Browse and insert pre-built templates' },
  media: { title: 'Media Library', subtitle: 'Browse and insert media files' },
};

// Content Block Types
const contentBlocks = [
  { id: 'paragraph', name: 'Paragraph', icon: 'FileText', description: 'Start writing with plain text', category: 'text' },
  { id: 'heading', name: 'Heading', icon: 'Type', description: 'Large section heading (H2-H6)', category: 'text' },
  { id: 'subheading', name: 'Subheading', icon: 'Type', description: 'Smaller heading for sections', category: 'text' },
  { id: 'quote', name: 'Quote', icon: 'Quote', description: 'Highlight quoted text', category: 'text' },
  { id: 'list', name: 'List', icon: 'List', description: 'Bulleted or numbered list', category: 'text' },
  { id: 'code', name: 'Code Block', icon: 'Code', description: 'Display formatted code', category: 'text' },
  { id: 'image', name: 'Image', icon: 'Image', description: 'Upload or embed an image', category: 'media' },
  { id: 'gallery', name: 'Gallery', icon: 'Grid', description: 'Display multiple images in a grid', category: 'media' },
  { id: 'video', name: 'Video', icon: 'Play', description: 'Embed video from URL', category: 'media' },
  { id: 'audio', name: 'Audio', icon: 'Volume2', description: 'Embed audio player', category: 'media' },
  { id: 'file', name: 'File', icon: 'Download', description: 'Add downloadable file', category: 'media' },
  { id: 'embed', name: 'Embed', icon: 'ExternalLink', description: 'Embed content from other sites', category: 'embed' },
  { id: 'table', name: 'Table', icon: 'Grid', description: 'Insert a data table', category: 'layout' },
  { id: 'columns', name: 'Columns', icon: 'Columns', description: 'Create multi-column layout', category: 'layout' },
  { id: 'divider', name: 'Divider', icon: 'MoreHorizontal', description: 'Horizontal line separator', category: 'layout' },
  { id: 'spacer', name: 'Spacer', icon: 'Square', description: 'Add vertical spacing', category: 'layout' },
  { id: 'button', name: 'Button', icon: 'MousePointer', description: 'Add a call-to-action button', category: 'interactive' },
  { id: 'accordion', name: 'Accordion', icon: 'ChevronRight', description: 'Collapsible content sections', category: 'interactive' },
  { id: 'tabs', name: 'Tabs', icon: 'Folder', description: 'Tabbed content panels', category: 'interactive' },
  { id: 'alert', name: 'Alert/Notice', icon: 'AlertCircle', description: 'Highlighted notice box', category: 'interactive' },
  { id: 'card', name: 'Card', icon: 'Square', description: 'Contained content card', category: 'layout' },
  { id: 'html', name: 'Custom HTML', icon: 'Code', description: 'Insert raw HTML code', category: 'advanced' },
];

// Block categories
const blockCategories = [
  { id: 'all', label: 'All Blocks', count: contentBlocks.length },
  { id: 'text', label: 'Text', count: contentBlocks.filter(b => b.category === 'text').length },
  { id: 'media', label: 'Media', count: contentBlocks.filter(b => b.category === 'media').length },
  { id: 'layout', label: 'Layout', count: contentBlocks.filter(b => b.category === 'layout').length },
  { id: 'interactive', label: 'Interactive', count: contentBlocks.filter(b => b.category === 'interactive').length },
  { id: 'embed', label: 'Embed', count: contentBlocks.filter(b => b.category === 'embed').length },
  { id: 'advanced', label: 'Advanced', count: contentBlocks.filter(b => b.category === 'advanced').length },
];

// Animation Categories
const animationCategories = [
  { id: 'entrance', label: 'Entrance', icon: ArrowRight, count: 12 },
  { id: 'exit', label: 'Exit', icon: X, count: 10 },
  { id: 'emphasis', label: 'Emphasis', icon: Zap, count: 8 },
  { id: 'motion-path', label: 'Motion Path', icon: Move, count: 6 },
  { id: 'rotation', label: 'Rotation', icon: RotateCw, count: 5 },
  { id: 'scale', label: 'Scale', icon: Scale, count: 7 },
  { id: 'scroll', label: 'Scroll', icon: MousePointer, count: 8 },
];

// Animation Library (55+)
const animations = [
  // Entrance
  { id: 'fade-in', name: 'Fade In', category: 'entrance', duration: 500, preview: 'opacity: 0 → 1' },
  { id: 'fade-in-up', name: 'Fade In Up', category: 'entrance', duration: 500, preview: 'opacity + translateY' },
  { id: 'fade-in-down', name: 'Fade In Down', category: 'entrance', duration: 500, preview: 'opacity + translateY' },
  { id: 'fade-in-left', name: 'Fade In Left', category: 'entrance', duration: 500, preview: 'opacity + translateX' },
  { id: 'fade-in-right', name: 'Fade In Right', category: 'entrance', duration: 500, preview: 'opacity + translateX' },
  { id: 'slide-in-up', name: 'Slide In Up', category: 'entrance', duration: 400, preview: 'translateY: 100% → 0' },
  { id: 'slide-in-down', name: 'Slide In Down', category: 'entrance', duration: 400, preview: 'translateY: -100% → 0' },
  { id: 'slide-in-left', name: 'Slide In Left', category: 'entrance', duration: 400, preview: 'translateX: -100% → 0' },
  { id: 'slide-in-right', name: 'Slide In Right', category: 'entrance', duration: 400, preview: 'translateX: 100% → 0' },
  { id: 'zoom-in', name: 'Zoom In', category: 'entrance', duration: 500, preview: 'scale: 0 → 1' },
  { id: 'bounce-in', name: 'Bounce In', category: 'entrance', duration: 750, preview: 'scale with bounce' },
  { id: 'flip-in', name: 'Flip In', category: 'entrance', duration: 600, preview: 'rotateX: 90deg → 0' },
  // Exit
  { id: 'fade-out', name: 'Fade Out', category: 'exit', duration: 500, preview: 'opacity: 1 → 0' },
  { id: 'fade-out-up', name: 'Fade Out Up', category: 'exit', duration: 500, preview: 'opacity + translateY' },
  { id: 'fade-out-down', name: 'Fade Out Down', category: 'exit', duration: 500, preview: 'opacity + translateY' },
  { id: 'slide-out-up', name: 'Slide Out Up', category: 'exit', duration: 400, preview: 'translateY: 0 → -100%' },
  { id: 'slide-out-down', name: 'Slide Out Down', category: 'exit', duration: 400, preview: 'translateY: 0 → 100%' },
  { id: 'zoom-out', name: 'Zoom Out', category: 'exit', duration: 500, preview: 'scale: 1 → 0' },
  { id: 'bounce-out', name: 'Bounce Out', category: 'exit', duration: 750, preview: 'scale with bounce' },
  { id: 'flip-out', name: 'Flip Out', category: 'exit', duration: 600, preview: 'rotateX: 0 → 90deg' },
  { id: 'hinge', name: 'Hinge', category: 'exit', duration: 2000, preview: 'rotate + fall' },
  { id: 'roll-out', name: 'Roll Out', category: 'exit', duration: 800, preview: 'rotate + translateX' },
  // Emphasis
  { id: 'pulse', name: 'Pulse', category: 'emphasis', duration: 1000, preview: 'scale: 1 → 1.05 → 1' },
  { id: 'shake', name: 'Shake', category: 'emphasis', duration: 800, preview: 'translateX oscillate' },
  { id: 'bounce', name: 'Bounce', category: 'emphasis', duration: 1000, preview: 'translateY bounce' },
  { id: 'flash', name: 'Flash', category: 'emphasis', duration: 1000, preview: 'opacity: 1 → 0 → 1' },
  { id: 'rubber-band', name: 'Rubber Band', category: 'emphasis', duration: 1000, preview: 'scaleX/Y stretch' },
  { id: 'swing', name: 'Swing', category: 'emphasis', duration: 1000, preview: 'rotate oscillate' },
  { id: 'tada', name: 'Tada', category: 'emphasis', duration: 1000, preview: 'scale + rotate' },
  { id: 'wobble', name: 'Wobble', category: 'emphasis', duration: 1000, preview: 'rotate + translateX' },
  // Motion Path
  { id: 'path-circle', name: 'Circle Path', category: 'motion-path', duration: 2000, preview: 'circular motion' },
  { id: 'path-wave', name: 'Wave Path', category: 'motion-path', duration: 2000, preview: 'sine wave motion' },
  { id: 'path-zigzag', name: 'Zigzag Path', category: 'motion-path', duration: 2000, preview: 'zigzag motion' },
  { id: 'path-spiral', name: 'Spiral Path', category: 'motion-path', duration: 3000, preview: 'spiral motion' },
  { id: 'path-infinity', name: 'Infinity Path', category: 'motion-path', duration: 3000, preview: 'figure-8 motion' },
  { id: 'path-custom', name: 'Custom Path', category: 'motion-path', duration: 2000, preview: 'SVG path motion' },
  // Rotation
  { id: 'rotate-in', name: 'Rotate In', category: 'rotation', duration: 600, preview: 'rotate: 200deg → 0' },
  { id: 'rotate-out', name: 'Rotate Out', category: 'rotation', duration: 600, preview: 'rotate: 0 → 200deg' },
  { id: 'spin', name: 'Spin', category: 'rotation', duration: 1000, preview: 'rotate: 0 → 360deg' },
  { id: 'flip-x', name: 'Flip X', category: 'rotation', duration: 600, preview: 'rotateX: 0 → 180deg' },
  { id: 'flip-y', name: 'Flip Y', category: 'rotation', duration: 600, preview: 'rotateY: 0 → 180deg' },
  // Scale
  { id: 'grow', name: 'Grow', category: 'scale', duration: 300, preview: 'scale: 1 → 1.1' },
  { id: 'shrink', name: 'Shrink', category: 'scale', duration: 300, preview: 'scale: 1 → 0.9' },
  { id: 'pulse-grow', name: 'Pulse Grow', category: 'scale', duration: 500, preview: 'scale: 1 → 1.1 → 1' },
  { id: 'heartbeat', name: 'Heartbeat', category: 'scale', duration: 1000, preview: 'scale: 1 → 1.3 → 1' },
  { id: 'pop', name: 'Pop', category: 'scale', duration: 300, preview: 'scale: 0.9 → 1.1 → 1' },
  { id: 'squeeze', name: 'Squeeze', category: 'scale', duration: 500, preview: 'scaleX/Y alternate' },
  { id: 'stretch', name: 'Stretch', category: 'scale', duration: 500, preview: 'scaleY: 1 → 1.2 → 1' },
  // Scroll
  { id: 'scroll-fade', name: 'Scroll Fade', category: 'scroll', duration: 500, preview: 'fade on scroll' },
  { id: 'scroll-slide-up', name: 'Scroll Slide Up', category: 'scroll', duration: 500, preview: 'slide up on scroll' },
  { id: 'scroll-zoom', name: 'Scroll Zoom', category: 'scroll', duration: 500, preview: 'zoom on scroll' },
  { id: 'scroll-parallax', name: 'Parallax', category: 'scroll', duration: 0, preview: 'parallax effect' },
  { id: 'scroll-reveal', name: 'Scroll Reveal', category: 'scroll', duration: 600, preview: 'reveal on scroll' },
  { id: 'scroll-sticky', name: 'Sticky Scroll', category: 'scroll', duration: 0, preview: 'sticky on scroll' },
  { id: 'scroll-progress', name: 'Progress Bar', category: 'scroll', duration: 0, preview: 'progress indicator' },
  { id: 'scroll-counter', name: 'Number Counter', category: 'scroll', duration: 2000, preview: 'count up on scroll' },
];

// Template Categories
const templateCategories = [
  { id: 'landing', label: 'Landing Pages', count: 15 },
  { id: 'blog', label: 'Blog Posts', count: 12 },
  { id: 'product', label: 'Product Pages', count: 8 },
  { id: 'portfolio', label: 'Portfolio', count: 10 },
  { id: 'about', label: 'About Pages', count: 6 },
  { id: 'contact', label: 'Contact Pages', count: 5 },
  { id: 'sections', label: 'Sections', count: 25 },
];

// Templates
const templates = [
  { id: 't1', name: 'Hero Section', category: 'sections', thumbnail: '/templates/hero.png', isPro: false },
  { id: 't2', name: 'Feature Grid', category: 'sections', thumbnail: '/templates/features.png', isPro: false },
  { id: 't3', name: 'Testimonials', category: 'sections', thumbnail: '/templates/testimonials.png', isPro: false },
  { id: 't4', name: 'Pricing Table', category: 'sections', thumbnail: '/templates/pricing.png', isPro: true },
  { id: 't5', name: 'Team Section', category: 'sections', thumbnail: '/templates/team.png', isPro: false },
  { id: 't6', name: 'CTA Banner', category: 'sections', thumbnail: '/templates/cta.png', isPro: false },
  { id: 't7', name: 'Blog Grid', category: 'blog', thumbnail: '/templates/blog-grid.png', isPro: false },
  { id: 't8', name: 'Article Layout', category: 'blog', thumbnail: '/templates/article.png', isPro: false },
  { id: 't9', name: 'Product Card', category: 'product', thumbnail: '/templates/product.png', isPro: true },
  { id: 't10', name: 'Landing Hero', category: 'landing', thumbnail: '/templates/landing.png', isPro: true },
];

export const BlockLibraryModal: React.FC<BlockLibraryModalProps> = ({
  isOpen,
  onClose,
  onInsertBlock,
  defaultTab = 'blocks',
  initialTab,
  hideTabs = false,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab || defaultTab);

  // Sync activeTab with initialTab prop changes (fixes single-tab mode)
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Get title and subtitle based on single-tab mode
  const currentTabInfo = tabTitles[activeTab] || { title: 'Block Library', subtitle: 'Animations, templates, and media' };
  const modalTitle = hideTabs ? currentTabInfo.title : 'Block Library';
  const modalSubtitle = hideTabs ? currentTabInfo.subtitle : 'Animations, templates, and media';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [previewAnimation, setPreviewAnimation] = useState<string | null>(null);
  const [selectedAnimation, setSelectedAnimation] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [favoriteAnimations, setFavoriteAnimations] = useState<string[]>([]);
  const [recentAnimations, setRecentAnimations] = useState<string[]>([]);

  // Animation settings
  const [animationSettings, setAnimationSettings] = useState({
    duration: 500,
    delay: 0,
    easing: 'ease-out',
    repeat: 1,
    repeatDelay: 0,
    direction: 'normal' as 'normal' | 'reverse' | 'alternate',
    fillMode: 'forwards' as 'none' | 'forwards' | 'backwards' | 'both',
    trigger: 'load' as 'load' | 'scroll' | 'hover' | 'click',
    scrollOffset: 100,
  });

  // Media library state
  const [mediaView, setMediaView] = useState<'grid' | 'list'>('grid');
  const [mediaSort, setMediaSort] = useState('date');
  const [mediaFilter, setMediaFilter] = useState('all');
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);

  // Sample media items
  const mediaItems = [
    { id: 'm1', name: 'hero-image.jpg', type: 'image', size: '1.2 MB', dimensions: '1920x1080', date: '2024-01-15' },
    { id: 'm2', name: 'product-photo.png', type: 'image', size: '850 KB', dimensions: '800x800', date: '2024-01-14' },
    { id: 'm3', name: 'team-banner.jpg', type: 'image', size: '2.1 MB', dimensions: '2560x1440', date: '2024-01-13' },
    { id: 'm4', name: 'promo-video.mp4', type: 'video', size: '15.5 MB', dimensions: '1920x1080', date: '2024-01-12' },
    { id: 'm5', name: 'logo.svg', type: 'image', size: '12 KB', dimensions: 'Vector', date: '2024-01-11' },
    { id: 'm6', name: 'background.jpg', type: 'image', size: '3.2 MB', dimensions: '3840x2160', date: '2024-01-10' },
  ];

  // Filtered animations
  const filteredAnimations = useMemo(() => {
    let result = animations;

    if (selectedCategory) {
      result = result.filter(a => a.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(a =>
        a.name.toLowerCase().includes(query) ||
        a.category.toLowerCase().includes(query)
      );
    }

    return result;
  }, [selectedCategory, searchQuery]);

  // Filtered templates
  const filteredTemplates = useMemo(() => {
    let result = templates;

    if (selectedCategory) {
      result = result.filter(t => t.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
      );
    }

    return result;
  }, [selectedCategory, searchQuery]);

  const toggleFavorite = (id: string) => {
    setFavoriteAnimations(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const insertAnimation = () => {
    if (selectedAnimation) {
      const animation = animations.find(a => a.id === selectedAnimation);
      if (animation) {
        const cssClass = `animate-${animation.id}`;
        const inlineStyle = `animation: ${animation.id} ${animationSettings.duration}ms ${animationSettings.easing} ${animationSettings.delay}ms ${animationSettings.repeat === -1 ? 'infinite' : animationSettings.repeat} ${animationSettings.direction} ${animationSettings.fillMode}`;

        onInsertBlock(`<div class="${cssClass}" style="${inlineStyle}">\n  <!-- Your content here -->\n</div>`);

        // Add to recent
        setRecentAnimations(prev => [animation.id, ...prev.filter(id => id !== animation.id)].slice(0, 10));
        onClose();
      }
    }
  };

  const tabs = [
    { id: 'blocks', label: 'Content Blocks', icon: Layers, badge: contentBlocks.length },
    { id: 'animations', label: 'Animations', icon: Sparkles, badge: '55+' },
    { id: 'templates', label: 'Templates', icon: Layout, badge: templates.length },
    { id: 'media', label: 'Media Library', icon: Image, badge: mediaItems.length },
  ];

  // Block category state
  const [selectedBlockCategory, setSelectedBlockCategory] = useState<string>('all');

  // Filtered blocks
  const filteredBlocks = useMemo(() => {
    let result = contentBlocks;

    if (selectedBlockCategory && selectedBlockCategory !== 'all') {
      result = result.filter(b => b.category === selectedBlockCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(b =>
        b.name.toLowerCase().includes(query) ||
        b.description.toLowerCase().includes(query)
      );
    }

    return result;
  }, [selectedBlockCategory, searchQuery]);

  // Sidebar content
  const renderSidebar = () => {
    if (activeTab === 'blocks') {
      return (
        <div className="p-4">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Categories
          </h3>
          <nav className="space-y-1">
            {blockCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedBlockCategory(cat.id)}
                className={clsx(
                  'w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors',
                  selectedBlockCategory === cat.id
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                )}
              >
                <span>{cat.label}</span>
                <span className="text-xs text-gray-500">{cat.count}</span>
              </button>
            ))}
          </nav>

          <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">Pro Tip</h4>
            <p className="text-xs text-blue-600 dark:text-blue-300">
              Use keyboard shortcut <kbd className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-[10px]">/</kbd> in the editor to quickly insert blocks.
            </p>
          </div>
        </div>
      );
    }

    if (activeTab === 'animations') {
      return (
        <div className="p-4">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Categories
          </h3>
          <nav className="space-y-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={clsx(
                'w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors',
                !selectedCategory
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              )}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                All Animations
              </span>
              <span className="text-xs text-gray-500">{animations.length}</span>
            </button>

            {animationCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={clsx(
                  'w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors',
                  selectedCategory === cat.id
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                )}
              >
                <span className="flex items-center gap-2">
                  <cat.icon className="w-4 h-4" />
                  {cat.label}
                </span>
                <span className="text-xs text-gray-500">{cat.count}</span>
              </button>
            ))}
          </nav>

          {favoriteAnimations.length > 0 && (
            <>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-6 mb-3">
                Favorites
              </h3>
              <div className="space-y-1">
                {favoriteAnimations.slice(0, 5).map(id => {
                  const anim = animations.find(a => a.id === id);
                  return anim ? (
                    <button
                      key={id}
                      onClick={() => setSelectedAnimation(id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <Star className="w-4 h-4 text-amber-500" />
                      {anim.name}
                    </button>
                  ) : null;
                })}
              </div>
            </>
          )}

          {recentAnimations.length > 0 && (
            <>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-6 mb-3">
                Recent
              </h3>
              <div className="space-y-1">
                {recentAnimations.slice(0, 5).map(id => {
                  const anim = animations.find(a => a.id === id);
                  return anim ? (
                    <button
                      key={id}
                      onClick={() => setSelectedAnimation(id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <Clock className="w-4 h-4 text-gray-400" />
                      {anim.name}
                    </button>
                  ) : null;
                })}
              </div>
            </>
          )}
        </div>
      );
    }

    if (activeTab === 'templates') {
      return (
        <div className="p-4">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Categories
          </h3>
          <nav className="space-y-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={clsx(
                'w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors',
                !selectedCategory
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              )}
            >
              <span className="flex items-center gap-2">
                <Layout className="w-4 h-4" />
                All Templates
              </span>
              <span className="text-xs text-gray-500">{templates.length}</span>
            </button>

            {templateCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={clsx(
                  'w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors',
                  selectedCategory === cat.id
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                )}
              >
                <span className="flex items-center gap-2">
                  <Folder className="w-4 h-4" />
                  {cat.label}
                </span>
                <span className="text-xs text-gray-500">{cat.count}</span>
              </button>
            ))}
          </nav>
        </div>
      );
    }

    if (activeTab === 'media') {
      return (
        <div className="p-4">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Media Types
          </h3>
          <nav className="space-y-1">
            {[
              { id: 'all', label: 'All Media', icon: Folder },
              { id: 'image', label: 'Images', icon: Image },
              { id: 'video', label: 'Videos', icon: Play },
              { id: 'audio', label: 'Audio', icon: Volume2 },
              { id: 'document', label: 'Documents', icon: FileText },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setMediaFilter(item.id)}
                className={clsx(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors',
                  mediaFilter === item.id
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-6">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Upload className="w-4 h-4" />
              Upload Media
            </button>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 mt-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
              <Link className="w-4 h-4" />
              Import from URL
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <EditorModal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      subtitle={modalSubtitle}
      icon={Sparkles}
      iconColor="purple"
      size={hideTabs ? 'lg' : 'xl'}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tab) => {
        setActiveTab(tab as typeof activeTab);
        setSelectedCategory(null);
        setSearchQuery('');
      }}
      hideTabs={hideTabs}
      showSearch
      searchPlaceholder={`Search ${activeTab}...`}
      onSearch={setSearchQuery}
      sidebarContent={hideTabs ? undefined : renderSidebar()}
      sidebarWidth={240}
      showSave={activeTab === 'animations' && !!selectedAnimation}
      saveLabel="Insert Animation"
      onSave={insertAnimation}
    >
      {/* Content Blocks Tab */}
      {activeTab === 'blocks' && (
        <div className="space-y-6">
          {/* Block Grid */}
          <div className="grid grid-cols-3 gap-4">
            {filteredBlocks.map(block => {
              const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
                FileText,
                Type,
                Quote,
                List,
                Code,
                Image,
                Grid,
                Play,
                Volume2,
                Download,
                ExternalLink,
                Columns,
                MoreHorizontal,
                Square,
                MousePointer,
                ChevronRight,
                Folder,
                AlertCircle,
              };
              const IconComponent = iconMap[block.icon] || FileText;

              return (
                <motion.div
                  key={block.id}
                  whileHover={{ scale: 1.02 }}
                  className="relative p-4 border rounded-xl cursor-pointer transition-all border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
                  onClick={() => {
                    // Generate HTML for the block type
                    let html = '';
                    switch (block.id) {
                      case 'paragraph':
                        html = '<p>Start writing your paragraph here...</p>';
                        break;
                      case 'heading':
                        html = '<h2>Your Heading</h2>';
                        break;
                      case 'subheading':
                        html = '<h3>Your Subheading</h3>';
                        break;
                      case 'quote':
                        html = '<blockquote>Your quote here...</blockquote>';
                        break;
                      case 'list':
                        html = '<ul>\n  <li>First item</li>\n  <li>Second item</li>\n  <li>Third item</li>\n</ul>';
                        break;
                      case 'code':
                        html = '<pre><code>// Your code here</code></pre>';
                        break;
                      case 'image':
                        html = '<figure>\n  <img src="" alt="Image description" />\n  <figcaption>Image caption</figcaption>\n</figure>';
                        break;
                      case 'gallery':
                        html = '<div class="gallery">\n  <img src="" alt="" />\n  <img src="" alt="" />\n  <img src="" alt="" />\n</div>';
                        break;
                      case 'video':
                        html = '<video controls>\n  <source src="" type="video/mp4" />\n</video>';
                        break;
                      case 'audio':
                        html = '<audio controls>\n  <source src="" type="audio/mpeg" />\n</audio>';
                        break;
                      case 'file':
                        html = '<a href="" download class="file-download">Download File</a>';
                        break;
                      case 'embed':
                        html = '<iframe src="" width="100%" height="400" frameborder="0"></iframe>';
                        break;
                      case 'table':
                        html = '<table>\n  <thead>\n    <tr><th>Header 1</th><th>Header 2</th></tr>\n  </thead>\n  <tbody>\n    <tr><td>Cell 1</td><td>Cell 2</td></tr>\n  </tbody>\n</table>';
                        break;
                      case 'columns':
                        html = '<div class="columns">\n  <div class="column">Column 1</div>\n  <div class="column">Column 2</div>\n</div>';
                        break;
                      case 'divider':
                        html = '<hr />';
                        break;
                      case 'spacer':
                        html = '<div class="spacer" style="height: 40px;"></div>';
                        break;
                      case 'button':
                        html = '<a href="#" class="button">Click Me</a>';
                        break;
                      case 'accordion':
                        html = '<details>\n  <summary>Click to expand</summary>\n  <p>Hidden content here...</p>\n</details>';
                        break;
                      case 'tabs':
                        html = '<div class="tabs">\n  <div class="tab active">Tab 1</div>\n  <div class="tab">Tab 2</div>\n</div>';
                        break;
                      case 'alert':
                        html = '<div class="alert alert-info">\n  <strong>Note:</strong> Your message here.\n</div>';
                        break;
                      case 'card':
                        html = '<div class="card">\n  <h3>Card Title</h3>\n  <p>Card content goes here...</p>\n</div>';
                        break;
                      case 'html':
                        html = '<!-- Custom HTML -->\n<div>\n  Your custom HTML here\n</div>';
                        break;
                      default:
                        html = `<div>${block.name}</div>`;
                    }
                    onInsertBlock(html);
                    onClose();
                  }}
                >
                  {/* Block Icon */}
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg mb-3 flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>

                  <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                    {block.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {block.description}
                  </p>

                  {/* Category badge */}
                  <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full capitalize">
                    {block.category}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {filteredBlocks.length === 0 && (
            <div className="text-center py-12">
              <Layers className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">No blocks found</h3>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try adjusting your search or filter</p>
            </div>
          )}
        </div>
      )}

      {/* Animations Tab */}
      {activeTab === 'animations' && (
        <div className="space-y-6">
          {/* Animation Grid */}
          <div className="grid grid-cols-4 gap-4">
            {filteredAnimations.map(animation => (
              <motion.div
                key={animation.id}
                whileHover={{ scale: 1.02 }}
                className={clsx(
                  'relative p-4 border rounded-xl cursor-pointer transition-all',
                  selectedAnimation === animation.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                )}
                onClick={() => setSelectedAnimation(animation.id)}
                onMouseEnter={() => setPreviewAnimation(animation.id)}
                onMouseLeave={() => setPreviewAnimation(null)}
              >
                {/* Favorite button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(animation.id);
                  }}
                  className="absolute top-2 right-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Star
                    className={clsx(
                      'w-4 h-4',
                      favoriteAnimations.includes(animation.id)
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-gray-400'
                    )}
                  />
                </button>

                {/* Animation Preview Box */}
                <div className="w-full h-20 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  <motion.div
                    className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded"
                    animate={previewAnimation === animation.id ? {
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0],
                      opacity: [1, 0.8, 1],
                    } : {}}
                    transition={{ duration: animation.duration / 1000, repeat: Infinity }}
                  />
                </div>

                <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                  {animation.name}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {animation.preview}
                </p>

                {selectedAnimation === animation.id && (
                  <div className="absolute inset-0 border-2 border-blue-500 rounded-xl pointer-events-none">
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Animation Settings Panel */}
          {selectedAnimation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Animation Settings
              </h3>

              <div className="grid grid-cols-4 gap-4">
                <FormField label="Duration (ms)">
                  <Input
                    type="number"
                    value={animationSettings.duration}
                    onChange={(v) => setAnimationSettings(s => ({ ...s, duration: parseInt(v) || 0 }))}
                    min={0}
                    max={10000}
                    step={100}
                  />
                </FormField>

                <FormField label="Delay (ms)">
                  <Input
                    type="number"
                    value={animationSettings.delay}
                    onChange={(v) => setAnimationSettings(s => ({ ...s, delay: parseInt(v) || 0 }))}
                    min={0}
                    max={5000}
                    step={100}
                  />
                </FormField>

                <FormField label="Easing">
                  <Select
                    value={animationSettings.easing}
                    onChange={(v) => setAnimationSettings(s => ({ ...s, easing: v }))}
                    options={[
                      { value: 'ease', label: 'Ease' },
                      { value: 'ease-in', label: 'Ease In' },
                      { value: 'ease-out', label: 'Ease Out' },
                      { value: 'ease-in-out', label: 'Ease In Out' },
                      { value: 'linear', label: 'Linear' },
                      { value: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', label: 'Bounce' },
                    ]}
                  />
                </FormField>

                <FormField label="Repeat">
                  <Input
                    type="number"
                    value={animationSettings.repeat}
                    onChange={(v) => setAnimationSettings(s => ({ ...s, repeat: parseInt(v) || 1 }))}
                    min={-1}
                    max={100}
                  />
                </FormField>

                <FormField label="Direction">
                  <Select
                    value={animationSettings.direction}
                    onChange={(v) => setAnimationSettings(s => ({ ...s, direction: v as any }))}
                    options={[
                      { value: 'normal', label: 'Normal' },
                      { value: 'reverse', label: 'Reverse' },
                      { value: 'alternate', label: 'Alternate' },
                    ]}
                  />
                </FormField>

                <FormField label="Fill Mode">
                  <Select
                    value={animationSettings.fillMode}
                    onChange={(v) => setAnimationSettings(s => ({ ...s, fillMode: v as any }))}
                    options={[
                      { value: 'none', label: 'None' },
                      { value: 'forwards', label: 'Forwards' },
                      { value: 'backwards', label: 'Backwards' },
                      { value: 'both', label: 'Both' },
                    ]}
                  />
                </FormField>

                <FormField label="Trigger">
                  <Select
                    value={animationSettings.trigger}
                    onChange={(v) => setAnimationSettings(s => ({ ...s, trigger: v as any }))}
                    options={[
                      { value: 'load', label: 'On Load' },
                      { value: 'scroll', label: 'On Scroll' },
                      { value: 'hover', label: 'On Hover' },
                      { value: 'click', label: 'On Click' },
                    ]}
                  />
                </FormField>

                {animationSettings.trigger === 'scroll' && (
                  <FormField label="Scroll Offset (px)">
                    <Input
                      type="number"
                      value={animationSettings.scrollOffset}
                      onChange={(v) => setAnimationSettings(s => ({ ...s, scrollOffset: parseInt(v) || 0 }))}
                      min={0}
                      max={500}
                    />
                  </FormField>
                )}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-3 gap-6">
          {filteredTemplates.map(template => (
            <motion.div
              key={template.id}
              whileHover={{ scale: 1.02 }}
              className={clsx(
                'relative group border rounded-xl overflow-hidden cursor-pointer transition-all',
                selectedTemplate === template.id
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              )}
              onClick={() => setSelectedTemplate(template.id)}
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 relative">
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <Layout className="w-12 h-12" />
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors">
                    <Eye className="w-4 h-4 text-gray-700" />
                  </button>
                  <button className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Pro badge */}
                {template.isPro && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="warning">PRO</Badge>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h4 className="font-medium text-gray-900 dark:text-white">{template.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 capitalize">
                  {template.category}
                </p>
              </div>

              {selectedTemplate === template.id && (
                <div className="absolute top-2 left-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Media Library Tab */}
      {activeTab === 'media' && (
        <div className="space-y-4">
          {/* Media toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMediaView('grid')}
                className={clsx(
                  'p-2 rounded-lg transition-colors',
                  mediaView === 'grid' ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMediaView('list')}
                className={clsx(
                  'p-2 rounded-lg transition-colors',
                  mediaView === 'list' ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <Layers className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={mediaSort}
                onChange={setMediaSort}
                options={[
                  { value: 'date', label: 'Date' },
                  { value: 'name', label: 'Name' },
                  { value: 'size', label: 'Size' },
                ]}
              />
            </div>
          </div>

          {/* Media Grid */}
          {mediaView === 'grid' ? (
            <div className="grid grid-cols-4 gap-4">
              {mediaItems.map(item => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  className={clsx(
                    'relative group border rounded-xl overflow-hidden cursor-pointer',
                    selectedMedia.includes(item.id)
                      ? 'border-blue-500 ring-2 ring-blue-500/20'
                      : 'border-gray-200 dark:border-gray-700'
                  )}
                  onClick={() => {
                    setSelectedMedia(prev =>
                      prev.includes(item.id)
                        ? prev.filter(id => id !== item.id)
                        : [...prev, item.id]
                    );
                  }}
                >
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    {item.type === 'image' ? (
                      <Image className="w-12 h-12 text-gray-400" />
                    ) : item.type === 'video' ? (
                      <Play className="w-12 h-12 text-gray-400" />
                    ) : (
                      <FileText className="w-12 h-12 text-gray-400" />
                    )}
                  </div>

                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button className="p-2 bg-white rounded-lg hover:bg-gray-100">
                      <Eye className="w-4 h-4 text-gray-700" />
                    </button>
                    <button className="p-2 bg-white rounded-lg hover:bg-gray-100">
                      <Edit className="w-4 h-4 text-gray-700" />
                    </button>
                    <button className="p-2 bg-red-500 rounded-lg hover:bg-red-600">
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">{item.size}</p>
                  </div>

                  {selectedMedia.includes(item.id) && (
                    <div className="absolute top-2 left-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="w-12 px-4 py-3">
                      <input type="checkbox" className="rounded" />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">File</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dimensions</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {mediaItems.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedMedia.includes(item.id)}
                          onChange={() => {
                            setSelectedMedia(prev =>
                              prev.includes(item.id)
                                ? prev.filter(id => id !== item.id)
                                : [...prev, item.id]
                            );
                          }}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                            <Image className="w-5 h-5 text-gray-400" />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 capitalize">{item.type}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{item.size}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{item.dimensions}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{item.date}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                            <Copy className="w-4 h-4 text-gray-400" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Selection info */}
          {selectedMedia.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <span className="text-sm text-blue-700 dark:text-blue-400">
                {selectedMedia.length} item(s) selected
              </span>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                  Copy URLs
                </button>
                <button
                  onClick={() => {
                    const items = mediaItems.filter(m => selectedMedia.includes(m.id));
                    const html = items.map(i => `<img src="${i.name}" alt="" />`).join('\n');
                    onInsertBlock(html);
                    onClose();
                  }}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Insert Selected
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </EditorModal>
  );
};

export default BlockLibraryModal;
