/**
 * RustBuilder - Full-Featured Visual Page Builder
 * A comprehensive drag-and-drop page editor similar to Elementor
 * With real-time preview including theme header, footer, and sidebar
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import {
  ArrowLeft, Save, Eye, Settings, Undo, Redo, Smartphone, Tablet, Monitor,
  Loader2, Plus, Trash2, Copy, GripVertical, ChevronRight, ChevronDown,
  Type, Image, Video, Square, Columns, Box, Layout, MousePointer,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Underline,
  List, ListOrdered, Link, Code, Quote, Minus, CircleDot, FormInput,
  Mail, Phone, MapPin, Calendar, Clock, Star, Heart, Share2, Download,
  Play, Pause, Volume2, Maximize2, Minimize2, RotateCcw, Layers, Palette,
  Move, Lock, Unlock, EyeOff, Paintbrush, Sliders, Grid, Zap, X,
  ChevronLeft, PanelLeftClose, PanelRightClose, FileText, Globe, Search,
  Menu, MoreVertical, ExternalLink, Sparkles, Wand2, SlidersHorizontal,
  LayoutGrid, LayoutList, Navigation, Sidebar, Component,
  Table, BarChart, PieChart, LineChart, Database, ShoppingCart, CreditCard,
  User, Users, MessageSquare, ThumbsUp, Award, Target, Bookmark, Tag,
  Folder, File, Upload, CloudUpload, RefreshCw, Check, AlertCircle,
  Wrench
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import BlockConfigModal from '../components/pagebuilder/config/BlockConfigModal';
import { isComplexBlock, hasConfigComponent } from '../components/pagebuilder/config/BlockConfigRegistry';

// =============================================================================
// TYPES
// =============================================================================

// Block settings following RustBuilder API format
interface BlockSettings {
  // Content settings
  text?: string;
  level?: number | string;
  src?: string;
  alt?: string;
  url?: string;
  target?: string;
  placeholder?: string;

  // Style settings
  color?: string;
  backgroundColor?: string;
  background?: string;
  textAlign?: string;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  lineHeight?: string;

  // Layout settings
  padding?: string;
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
  margin?: string;
  marginTop?: string;
  marginBottom?: string;
  marginLeft?: string;
  marginRight?: string;

  // Border settings
  borderWidth?: string;
  borderStyle?: string;
  borderColor?: string;
  borderRadius?: string;

  // Dimension settings
  width?: string;
  height?: string;
  minHeight?: string;
  maxWidth?: string;

  // Flex/Grid settings
  display?: string;
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
  gap?: string;
  columns?: number;

  // Effects
  opacity?: number;
  boxShadow?: string;
  transform?: string;
  transition?: string;

  // Form block settings
  formFields?: { id: string; type: string; label: string; name: string; placeholder?: string; required: boolean; options?: string[]; validation?: any }[];
  formAction?: string;
  submitButtonText?: string;
  submitButtonColor?: string;

  // Gallery/Carousel settings
  images?: { id: string; src: string; alt: string; caption?: string }[];
  slides?: { id: string; image: string; title?: string; text?: string; button?: { text: string; url: string } }[];
  layout?: 'grid' | 'masonry' | 'justified' | 'mosaic' | 'carousel';
  autoplay?: boolean;
  interval?: number;
  enableLightbox?: boolean;

  // Pricing settings
  price?: string;
  period?: string;
  features?: { id: string; text: string; included: boolean }[] | string[];
  isFeatured?: boolean;
  badgeText?: string;

  // Countdown settings
  targetDate?: string;
  showDays?: boolean;
  showHours?: boolean;
  showMinutes?: boolean;
  showSeconds?: boolean;

  // Testimonial settings
  quote?: string;
  author?: string;
  avatar?: string;
  rating?: number;

  // Accordion/Tabs settings
  items?: { id: string; title: string; content: string }[];
  tabs?: { id: string; title: string; content: string }[];

  // Menu settings
  menuItems?: { id: string; label: string; url: string; target?: string; children?: any[] }[];

  // Custom properties
  [key: string]: any;
}

interface Block {
  id: string;
  type: string;
  settings: BlockSettings;
  children?: Block[];
  locked?: boolean;
  hidden?: boolean;
}

interface ThemeData {
  id: string;
  slug: string;
  name: string;
  manifest?: {
    colors?: Record<string, string>;
    fonts?: Record<string, string>;
  };
  partials?: {
    header?: string;
    footer?: string;
    sidebar?: string;
  };
}

interface SidebarOption {
  id: string;
  name: string;
  location: string;
}

interface PageSettings {
  showHeader: boolean;
  showFooter: boolean;
  showSidebar: boolean;
  sidebarId: string | null;
  sidebarPosition: 'left' | 'right' | 'none';
  containerWidth: string;
  headerStyle: 'default' | 'transparent' | 'minimal';
  footerStyle: 'default' | 'minimal' | 'expanded';
}

type Viewport = 'desktop' | 'tablet' | 'mobile';
type Panel = 'blocks' | 'layers' | 'settings' | 'styles' | 'templates' | 'pageSettings' | null;

// =============================================================================
// BLOCK DEFINITIONS
// =============================================================================

const BLOCK_CATEGORIES = [
  {
    id: 'layout',
    name: 'Layout',
    icon: Layout,
    blocks: [
      { type: 'section', name: 'Section', icon: Square, description: 'Full-width container' },
      { type: 'container', name: 'Container', icon: Box, description: 'Centered container' },
      { type: 'row', name: 'Row', icon: Columns, description: 'Horizontal row' },
      { type: 'column', name: 'Column', icon: Sidebar, description: 'Flexible column' },
      { type: 'grid', name: 'Grid', icon: Grid, description: 'CSS Grid layout' },
    ]
  },
  {
    id: 'basic',
    name: 'Basic',
    icon: Type,
    blocks: [
      { type: 'heading', name: 'Heading', icon: Type, description: 'H1-H6 heading' },
      { type: 'paragraph', name: 'Paragraph', icon: AlignLeft, description: 'Text paragraph' },
      { type: 'button', name: 'Button', icon: MousePointer, description: 'Call to action' },
      { type: 'image', name: 'Image', icon: Image, description: 'Image with options' },
      { type: 'video', name: 'Video', icon: Video, description: 'Video embed' },
      { type: 'divider', name: 'Divider', icon: Minus, description: 'Horizontal line' },
      { type: 'spacer', name: 'Spacer', icon: Move, description: 'Vertical space' },
    ]
  },
  {
    id: 'content',
    name: 'Content',
    icon: FileText,
    blocks: [
      { type: 'richtext', name: 'Rich Text', icon: FileText, description: 'Formatted text' },
      { type: 'list', name: 'List', icon: List, description: 'Bullet/numbered list' },
      { type: 'quote', name: 'Quote', icon: Quote, description: 'Blockquote' },
      { type: 'code', name: 'Code', icon: Code, description: 'Code snippet' },
      { type: 'table', name: 'Table', icon: Table, description: 'Data table' },
      { type: 'accordion', name: 'Accordion', icon: ChevronDown, description: 'Collapsible content' },
      { type: 'tabs', name: 'Tabs', icon: Folder, description: 'Tabbed content' },
    ]
  },
  {
    id: 'media',
    name: 'Media',
    icon: Image,
    blocks: [
      { type: 'gallery', name: 'Gallery', icon: LayoutGrid, description: 'Image gallery' },
      { type: 'carousel', name: 'Carousel', icon: Play, description: 'Image slider' },
      { type: 'audio', name: 'Audio', icon: Volume2, description: 'Audio player' },
      { type: 'embed', name: 'Embed', icon: Code, description: 'External embed' },
      { type: 'icon', name: 'Icon', icon: Star, description: 'Icon element' },
      { type: 'lottie', name: 'Lottie', icon: Sparkles, description: 'Lottie animation' },
    ]
  },
  {
    id: 'interactive',
    name: 'Interactive',
    icon: MousePointer,
    blocks: [
      { type: 'form', name: 'Form', icon: FormInput, description: 'Contact form' },
      { type: 'input', name: 'Input', icon: FormInput, description: 'Form input' },
      { type: 'textarea', name: 'Textarea', icon: AlignLeft, description: 'Text area' },
      { type: 'select', name: 'Select', icon: ChevronDown, description: 'Dropdown' },
      { type: 'checkbox', name: 'Checkbox', icon: Check, description: 'Checkbox' },
      { type: 'radio', name: 'Radio', icon: CircleDot, description: 'Radio button' },
      { type: 'searchbox', name: 'Search', icon: Search, description: 'Search box' },
    ]
  },
  {
    id: 'widgets',
    name: 'Widgets',
    icon: Component,
    blocks: [
      { type: 'socialicons', name: 'Social Icons', icon: Share2, description: 'Social links' },
      { type: 'testimonial', name: 'Testimonial', icon: Quote, description: 'Customer review' },
      { type: 'pricing', name: 'Pricing', icon: CreditCard, description: 'Pricing table' },
      { type: 'countdown', name: 'Countdown', icon: Clock, description: 'Timer' },
      { type: 'progress', name: 'Progress', icon: Target, description: 'Progress bar' },
      { type: 'counter', name: 'Counter', icon: BarChart, description: 'Animated number' },
      { type: 'map', name: 'Map', icon: MapPin, description: 'Google Map' },
    ]
  },
  {
    id: 'navigation',
    name: 'Navigation',
    icon: Navigation,
    blocks: [
      { type: 'menu', name: 'Menu', icon: Menu, description: 'Navigation menu' },
      { type: 'breadcrumb', name: 'Breadcrumb', icon: ChevronRight, description: 'Breadcrumbs' },
      { type: 'pagination', name: 'Pagination', icon: MoreVertical, description: 'Page numbers' },
      { type: 'anchor', name: 'Anchor', icon: Link, description: 'Scroll anchor' },
      { type: 'backtotop', name: 'Back to Top', icon: ChevronLeft, description: 'Scroll button' },
    ]
  },
  {
    id: 'dynamic',
    name: 'Dynamic',
    icon: Database,
    blocks: [
      { type: 'posts', name: 'Posts', icon: FileText, description: 'Post list' },
      { type: 'postmeta', name: 'Post Meta', icon: Tag, description: 'Post metadata' },
      { type: 'author', name: 'Author', icon: User, description: 'Author box' },
      { type: 'comments', name: 'Comments', icon: MessageSquare, description: 'Comments list' },
      { type: 'related', name: 'Related', icon: Layers, description: 'Related posts' },
    ]
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const generateId = () => `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Create a new block with default settings - compatible with RustBuilder API
const createBlock = (type: string): Block => {
  const defaults: Record<string, { settings: BlockSettings; children?: Block[] }> = {
    // Layout blocks
    section: { settings: { backgroundColor: '#ffffff', paddingTop: '60px', paddingBottom: '60px', width: '100%' }, children: [] },
    container: { settings: { maxWidth: '1200px', marginLeft: 'auto', marginRight: 'auto', paddingLeft: '20px', paddingRight: '20px' }, children: [] },
    row: { settings: { display: 'flex', gap: '20px', flexDirection: 'row', flexWrap: 'wrap' }, children: [] },
    column: { settings: { display: 'flex', flexDirection: 'column', width: '50%', minHeight: '100px' }, children: [] },
    grid: { settings: { display: 'grid', columns: 3, gap: '20px' }, children: [] },

    // Basic blocks
    heading: { settings: { text: 'Add your heading here', level: 2, fontSize: '32px', fontWeight: '700', color: '#1f2937' } },
    paragraph: { settings: { text: 'Add your paragraph text here. Click to edit and start typing.', fontSize: '16px', lineHeight: '1.6', color: '#4b5563' } },
    button: { settings: { text: 'Click Here', url: '#', target: '_self', backgroundColor: '#3b82f6', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', fontWeight: '600' } },
    image: { settings: { src: '/placeholder.jpg', alt: 'Image', width: '100%', borderRadius: '8px' } },
    video: { settings: { src: '', type: 'youtube', autoplay: false, width: '100%' } },
    divider: { settings: { borderWidth: '1px', borderStyle: 'solid', borderColor: '#e5e7eb', marginTop: '20px', marginBottom: '20px' } },
    spacer: { settings: { height: '40px' } },

    // Content blocks
    richtext: { settings: { text: '<p>Rich text content here...</p>' } },
    list: { settings: { items: ['Item 1', 'Item 2', 'Item 3'], type: 'bullet' } },
    quote: { settings: { text: 'This is a blockquote', author: 'Author Name', fontSize: '18px', fontStyle: 'italic' } },
    code: { settings: { code: '// Your code here', language: 'javascript' } },
    table: { settings: { rows: 3, columns: 3 } },
    accordion: { settings: { items: [{ title: 'Accordion Title', content: 'Content here' }] } },
    tabs: { settings: { tabs: [{ title: 'Tab 1', content: 'Tab content' }] } },

    // Media blocks
    gallery: { settings: { images: [], columns: 3, gap: '10px' } },
    carousel: { settings: { images: [], autoplay: true, interval: 5000 } },
    audio: { settings: { src: '' } },
    embed: { settings: { url: '', type: 'iframe' } },
    icon: { settings: { icon: 'star', size: '24px', color: '#3b82f6' } },
    lottie: { settings: { src: '', loop: true, autoplay: true } },

    // Interactive blocks
    form: { settings: { action: '', method: 'POST' }, children: [] },
    input: { settings: { type: 'text', placeholder: 'Enter text...', name: '' } },
    textarea: { settings: { placeholder: 'Enter text...', rows: 4 } },
    select: { settings: { options: ['Option 1', 'Option 2'], placeholder: 'Select...' } },
    checkbox: { settings: { label: 'Checkbox label', checked: false } },
    radio: { settings: { label: 'Radio label', name: 'radio-group' } },
    searchbox: { settings: { placeholder: 'Search...' } },

    // Widget blocks
    socialicons: { settings: { icons: ['facebook', 'twitter', 'instagram'], size: '24px' } },
    testimonial: { settings: { quote: 'Great product!', author: 'John Doe', avatar: '', rating: 5 } },
    pricing: { settings: { title: 'Basic', price: '$9.99', period: '/month', features: ['Feature 1', 'Feature 2'] } },
    countdown: { settings: { targetDate: new Date(Date.now() + 86400000).toISOString() } },
    progress: { settings: { value: 75, max: 100, showLabel: true } },
    counter: { settings: { value: 1000, duration: 2000, prefix: '', suffix: '+' } },
    map: { settings: { lat: 0, lng: 0, zoom: 12 } },

    // Navigation blocks
    menu: { settings: { items: [{ label: 'Home', url: '/' }] } },
    breadcrumb: { settings: { separator: '/' } },
    pagination: { settings: { currentPage: 1, totalPages: 10 } },
    anchor: { settings: { id: 'anchor-id' } },
    backtotop: { settings: { icon: 'arrow-up', position: 'bottom-right' } },

    // Dynamic blocks
    posts: { settings: { count: 3, columns: 3, showExcerpt: true } },
    postmeta: { settings: { show: ['date', 'author', 'category'] } },
    author: { settings: { showAvatar: true, showBio: true } },
    comments: { settings: { orderBy: 'date', order: 'desc' } },
    related: { settings: { count: 3, showThumbnail: true } },
  };

  const config = defaults[type] || { settings: {} };

  return {
    id: generateId(),
    type,
    settings: config.settings,
    children: config.children,
  };
};

// Convert settings to inline CSS styles
const settingsToStyle = (settings: BlockSettings): React.CSSProperties => {
  const style: React.CSSProperties = {};

  // Background
  if (settings.backgroundColor) style.backgroundColor = settings.backgroundColor;
  if (settings.background) style.background = settings.background;

  // Typography
  if (settings.color) style.color = settings.color;
  if (settings.fontSize) style.fontSize = settings.fontSize;
  if (settings.fontWeight) style.fontWeight = settings.fontWeight as any;
  if (settings.fontFamily) style.fontFamily = settings.fontFamily;
  if (settings.lineHeight) style.lineHeight = settings.lineHeight;
  if (settings.textAlign) style.textAlign = settings.textAlign as any;

  // Padding
  if (settings.padding) style.padding = settings.padding;
  if (settings.paddingTop) style.paddingTop = settings.paddingTop;
  if (settings.paddingBottom) style.paddingBottom = settings.paddingBottom;
  if (settings.paddingLeft) style.paddingLeft = settings.paddingLeft;
  if (settings.paddingRight) style.paddingRight = settings.paddingRight;

  // Margin
  if (settings.margin) style.margin = settings.margin;
  if (settings.marginTop) style.marginTop = settings.marginTop;
  if (settings.marginBottom) style.marginBottom = settings.marginBottom;
  if (settings.marginLeft) style.marginLeft = settings.marginLeft;
  if (settings.marginRight) style.marginRight = settings.marginRight;

  // Border
  if (settings.borderWidth) style.borderWidth = settings.borderWidth;
  if (settings.borderStyle) style.borderStyle = settings.borderStyle as any;
  if (settings.borderColor) style.borderColor = settings.borderColor;
  if (settings.borderRadius) style.borderRadius = settings.borderRadius;

  // Dimensions
  if (settings.width) style.width = settings.width;
  if (settings.height) style.height = settings.height;
  if (settings.minHeight) style.minHeight = settings.minHeight;
  if (settings.maxWidth) style.maxWidth = settings.maxWidth;

  // Flex/Grid
  if (settings.display) style.display = settings.display as any;
  if (settings.flexDirection) style.flexDirection = settings.flexDirection as any;
  if (settings.justifyContent) style.justifyContent = settings.justifyContent as any;
  if (settings.alignItems) style.alignItems = settings.alignItems as any;
  if (settings.gap) style.gap = settings.gap;

  // Effects
  if (settings.opacity !== undefined) style.opacity = settings.opacity;
  if (settings.boxShadow) style.boxShadow = settings.boxShadow;
  if (settings.transform) style.transform = settings.transform;
  if (settings.transition) style.transition = settings.transition;

  return style;
};

// =============================================================================
// DROP ZONE COMPONENT
// =============================================================================

const DropZone: React.FC<{
  position: number;
  containerId?: string;
  isActive: boolean;
  onDrop: (type: string, position: number, containerId?: string) => void;
  onDragOver: (position: number, containerId?: string) => void;
  onDragLeave: () => void;
  label?: string;
}> = ({ position, containerId, isActive, onDrop, onDragOver, onDragLeave, label }) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      className={clsx(
        'relative transition-all duration-200',
        isHovering ? 'py-6' : 'py-1',
      )}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy';
        setIsHovering(true);
        onDragOver(position, containerId);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsHovering(false);
        onDragLeave();
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const blockType = e.dataTransfer.getData('blockType');
        if (blockType) {
          onDrop(blockType, position, containerId);
        }
        setIsHovering(false);
      }}
    >
      <div
        className={clsx(
          'flex items-center justify-center rounded-lg border-2 border-dashed transition-all duration-200',
          isHovering
            ? 'border-blue-500 bg-blue-500/10 h-16'
            : isActive
              ? 'border-blue-400/50 bg-blue-400/5 h-2'
              : 'border-transparent h-0'
        )}
      >
        {isHovering && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 text-blue-500 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>{label || 'Drop here'}</span>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// DRAGGABLE BLOCK ITEM COMPONENT
// =============================================================================

const DraggableBlockItem: React.FC<{
  block: Block;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (block: Block) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onConfigure?: () => void;
  viewport: Viewport;
  onAddToContainer?: (type: string, containerId: string, position?: number) => void;
  isDragging?: boolean;
}> = ({ block, selected, onSelect, onUpdate, onDelete, onDuplicate, onConfigure, viewport, onAddToContainer, isDragging }) => {
  const dragControls = useDragControls();
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [childDropPosition, setChildDropPosition] = useState<number | null>(null);

  const handleSettingsChange = (updates: Partial<BlockSettings>) => {
    onUpdate({ ...block, settings: { ...block.settings, ...updates } });
  };

  const renderBlockContent = () => {
    const { settings } = block;

    switch (block.type) {
      case 'heading':
        const HeadingTag = `h${settings.level || 2}` as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => {
              handleSettingsChange({ text: e.currentTarget.textContent || '' });
              setIsEditing(false);
            }}
            onDoubleClick={() => setIsEditing(true)}
            className="outline-none"
            style={{
              fontSize: settings.fontSize,
              fontWeight: settings.fontWeight as any,
              color: settings.color,
              textAlign: settings.textAlign as any,
            }}
          >
            {settings.text || 'Heading'}
          </HeadingTag>
        );

      case 'paragraph':
        return (
          <p
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => {
              handleSettingsChange({ text: e.currentTarget.textContent || '' });
              setIsEditing(false);
            }}
            onDoubleClick={() => setIsEditing(true)}
            className="outline-none"
            style={{
              fontSize: settings.fontSize,
              lineHeight: settings.lineHeight,
              color: settings.color,
              textAlign: settings.textAlign as any,
            }}
          >
            {settings.text || 'Paragraph text'}
          </p>
        );

      case 'button':
        return (
          <button
            className="inline-block cursor-pointer"
            onClick={(e) => e.preventDefault()}
            onDoubleClick={() => setIsEditing(true)}
            style={{
              backgroundColor: settings.backgroundColor,
              color: settings.color,
              padding: settings.padding,
              borderRadius: settings.borderRadius,
              fontWeight: settings.fontWeight as any,
            }}
          >
            {isEditing ? (
              <input
                type="text"
                value={settings.text || 'Button'}
                onChange={(e) => handleSettingsChange({ text: e.target.value })}
                onBlur={() => setIsEditing(false)}
                autoFocus
                className="bg-transparent border-none outline-none text-inherit font-inherit"
              />
            ) : (
              settings.text || 'Button'
            )}
          </button>
        );

      case 'image':
        return settings.src && settings.src !== '/placeholder.jpg' ? (
          <img
            src={settings.src}
            alt={settings.alt || ''}
            className="max-w-full h-auto"
            style={{ borderRadius: settings.borderRadius }}
          />
        ) : (
          <div className="flex items-center justify-center bg-gray-100 rounded-lg p-8 min-h-[200px]">
            <div className="text-center text-gray-500">
              <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Click to add image</p>
            </div>
          </div>
        );

      case 'video':
        return settings.src ? (
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <iframe
              src={settings.src}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex items-center justify-center bg-gray-900 rounded-lg p-8 aspect-video">
            <div className="text-center text-gray-400">
              <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Click to add video</p>
            </div>
          </div>
        );

      case 'divider':
        return (
          <hr
            style={{
              borderWidth: settings.borderWidth,
              borderStyle: settings.borderStyle as any,
              borderColor: settings.borderColor,
              margin: `${settings.marginTop || '20px'} 0 ${settings.marginBottom || '20px'} 0`,
            }}
          />
        );

      case 'spacer':
        return <div style={{ height: settings.height || '40px' }} className="bg-gray-100/50" />;

      case 'section':
      case 'container':
      case 'row':
      case 'column':
      case 'grid':
        const isLayoutHorizontal = block.type === 'row' || (block.settings.display === 'flex' && block.settings.flexDirection === 'row');

        const handleChildDrop = (type: string, position: number) => {
          if (onAddToContainer) {
            onAddToContainer(type, block.id, position);
          } else {
            // Fallback: add directly to children
            const newBlock = createBlock(type);
            const children = block.children || [];
            const newChildren = [...children];
            newChildren.splice(position, 0, newBlock);
            onUpdate({ ...block, children: newChildren });
          }
        };

        return (
          <div
            className={clsx(
              'min-h-[60px] relative',
              isLayoutHorizontal ? 'flex flex-wrap gap-2' : ''
            )}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const blockType = e.dataTransfer.getData('blockType');
              if (blockType && (!block.children || block.children.length === 0)) {
                handleChildDrop(blockType, 0);
              }
            }}
          >
            {block.children && block.children.length > 0 ? (
              <>
                {/* First drop zone */}
                <DropZone
                  position={0}
                  containerId={block.id}
                  isActive={isDragging || false}
                  onDrop={handleChildDrop}
                  onDragOver={(pos) => setChildDropPosition(pos)}
                  onDragLeave={() => setChildDropPosition(null)}
                  label={`Insert at start of ${block.type}`}
                />

                {block.children.map((child, index) => (
                  <React.Fragment key={child.id}>
                    <DraggableBlockItem
                      block={child}
                      selected={false}
                      onSelect={() => {}}
                      onUpdate={(updated) => {
                        const newChildren = [...(block.children || [])];
                        newChildren[index] = updated;
                        onUpdate({ ...block, children: newChildren });
                      }}
                      onDelete={() => {
                        const newChildren = (block.children || []).filter((_, i) => i !== index);
                        onUpdate({ ...block, children: newChildren });
                      }}
                      onDuplicate={() => {
                        const newChildren = [...(block.children || [])];
                        newChildren.splice(index + 1, 0, { ...child, id: generateId() });
                        onUpdate({ ...block, children: newChildren });
                      }}
                      viewport={viewport}
                      onAddToContainer={onAddToContainer}
                      isDragging={isDragging}
                    />

                    {/* Drop zone after each child */}
                    <DropZone
                      position={index + 1}
                      containerId={block.id}
                      isActive={isDragging || false}
                      onDrop={handleChildDrop}
                      onDragOver={(pos) => setChildDropPosition(pos)}
                      onDragLeave={() => setChildDropPosition(null)}
                      label={`Insert after ${child.type}`}
                    />
                  </React.Fragment>
                ))}
              </>
            ) : (
              <div
                className={clsx(
                  'flex items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors min-h-[100px]',
                  isDragging ? 'border-blue-400 bg-blue-50 text-blue-500' : 'border-gray-300 text-gray-400'
                )}
              >
                <Plus className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">
                  {isDragging ? `Drop inside ${block.type}` : `Add blocks to ${block.type}`}
                </span>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="p-4 bg-gray-100 rounded text-gray-500 text-sm">
            {block.type} block
          </div>
        );
    }
  };

  if (block.hidden) return null;

  return (
    <Reorder.Item
      value={block}
      id={block.id}
      dragListener={false}
      dragControls={dragControls}
      className={clsx(
        'relative group transition-all',
        selected && 'ring-2 ring-blue-500 ring-offset-2',
        isHovered && !selected && 'ring-2 ring-blue-300 ring-offset-1',
        block.locked && 'opacity-75'
      )}
      style={settingsToStyle(block.settings)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Block Toolbar */}
      <AnimatePresence>
        {(selected || isHovered) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -top-10 left-0 z-50 flex items-center gap-1 bg-gray-900 rounded-lg shadow-lg p-1"
          >
            <div
              className="flex items-center gap-1 px-2 text-xs text-white font-medium cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => {
                e.preventDefault();
                dragControls.start(e);
              }}
            >
              <GripVertical className="w-3 h-3" />
              {block.type}
            </div>
            <div className="w-px h-4 bg-gray-700" />
            {hasConfigComponent(block.type) && onConfigure && (
              <button
                onClick={(e) => { e.stopPropagation(); onConfigure(); }}
                className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded"
                title="Configure"
              >
                <Wrench className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
              title="Duplicate"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {renderBlockContent()}
    </Reorder.Item>
  );
};

// =============================================================================
// LIVE PREVIEW MODAL
// =============================================================================

const LivePreviewModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  blocks: Block[];
  viewport: Viewport;
  pageSettings: PageSettings;
  themeData: ThemeData | null;
}> = ({ isOpen, onClose, blocks, viewport, pageSettings, themeData }) => {
  const [previewViewport, setPreviewViewport] = useState<Viewport>(viewport);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const getViewportStyles = () => {
    switch (previewViewport) {
      case 'mobile':
        return { width: '375px', height: '667px' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      default:
        return { width: '100%', height: '100%' };
    }
  };

  // Generate the preview HTML with theme context
  const generatePreviewHTML = () => {
    const themeColors = themeData?.manifest?.colors || {
      primary: '#3b82f6',
      secondary: '#64748b',
      background: '#ffffff',
      text: '#1f2937',
    };

    const themeFonts = themeData?.manifest?.fonts || {
      heading: 'Inter, sans-serif',
      body: 'Inter, sans-serif',
    };

    // Default header HTML
    const defaultHeader = `
      <header style="background: ${themeColors.background}; border-bottom: 1px solid #e5e7eb; padding: 16px 24px;">
        <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 24px; font-weight: 700; color: ${themeColors.primary};">
            RustPress
          </div>
          <nav style="display: flex; gap: 24px;">
            <a href="#" style="color: ${themeColors.text}; text-decoration: none;">Home</a>
            <a href="#" style="color: ${themeColors.text}; text-decoration: none;">About</a>
            <a href="#" style="color: ${themeColors.text}; text-decoration: none;">Services</a>
            <a href="#" style="color: ${themeColors.text}; text-decoration: none;">Contact</a>
          </nav>
        </div>
      </header>
    `;

    // Default footer HTML
    const defaultFooter = `
      <footer style="background: #1f2937; color: #9ca3af; padding: 48px 24px; margin-top: auto;">
        <div style="max-width: 1200px; margin: 0 auto;">
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px;">
            <div>
              <h4 style="color: white; font-weight: 600; margin-bottom: 16px;">About</h4>
              <p style="font-size: 14px; line-height: 1.6;">Building modern web experiences with RustPress.</p>
            </div>
            <div>
              <h4 style="color: white; font-weight: 600; margin-bottom: 16px;">Links</h4>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin-bottom: 8px;"><a href="#" style="color: #9ca3af; text-decoration: none; font-size: 14px;">Documentation</a></li>
                <li style="margin-bottom: 8px;"><a href="#" style="color: #9ca3af; text-decoration: none; font-size: 14px;">API Reference</a></li>
                <li style="margin-bottom: 8px;"><a href="#" style="color: #9ca3af; text-decoration: none; font-size: 14px;">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 style="color: white; font-weight: 600; margin-bottom: 16px;">Legal</h4>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin-bottom: 8px;"><a href="#" style="color: #9ca3af; text-decoration: none; font-size: 14px;">Privacy Policy</a></li>
                <li style="margin-bottom: 8px;"><a href="#" style="color: #9ca3af; text-decoration: none; font-size: 14px;">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 style="color: white; font-weight: 600; margin-bottom: 16px;">Contact</h4>
              <p style="font-size: 14px; line-height: 1.6;">hello@rustpress.io</p>
            </div>
          </div>
          <div style="border-top: 1px solid #374151; margin-top: 32px; padding-top: 24px; text-align: center; font-size: 14px;">
            &copy; ${new Date().getFullYear()} RustPress. All rights reserved.
          </div>
        </div>
      </footer>
    `;

    // Default sidebar HTML
    const defaultSidebar = `
      <aside style="width: 280px; padding: 24px; background: #f9fafb; border-${pageSettings.sidebarPosition === 'left' ? 'right' : 'left'}: 1px solid #e5e7eb;">
        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 12px; color: ${themeColors.text};">Search</h3>
          <input type="text" placeholder="Search..." style="width: 100%; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 6px;" />
        </div>
        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 12px; color: ${themeColors.text};">Categories</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><a href="#" style="color: ${themeColors.text}; text-decoration: none;">Technology</a></li>
            <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><a href="#" style="color: ${themeColors.text}; text-decoration: none;">Design</a></li>
            <li style="padding: 8px 0;"><a href="#" style="color: ${themeColors.text}; text-decoration: none;">Business</a></li>
          </ul>
        </div>
        <div>
          <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 12px; color: ${themeColors.text};">Recent Posts</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="padding: 8px 0;"><a href="#" style="color: ${themeColors.text}; text-decoration: none; font-size: 14px;">Getting Started with RustPress</a></li>
            <li style="padding: 8px 0;"><a href="#" style="color: ${themeColors.text}; text-decoration: none; font-size: 14px;">Building Your First Theme</a></li>
          </ul>
        </div>
      </aside>
    `;

    // Render blocks to HTML
    const renderBlockToHTML = (block: Block): string => {
      const style = Object.entries(settingsToStyle(block.settings))
        .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
        .join('; ');

      switch (block.type) {
        case 'heading':
          const level = block.settings.level || 2;
          return `<h${level} style="${style}">${block.settings.text || 'Heading'}</h${level}>`;
        case 'paragraph':
          return `<p style="${style}">${block.settings.text || 'Paragraph text'}</p>`;
        case 'button':
          return `<a href="${block.settings.url || '#'}" target="${block.settings.target || '_self'}" style="${style}; display: inline-block; text-decoration: none;">${block.settings.text || 'Button'}</a>`;
        case 'image':
          return block.settings.src && block.settings.src !== '/placeholder.jpg'
            ? `<img src="${block.settings.src}" alt="${block.settings.alt || ''}" style="${style}; max-width: 100%;" />`
            : `<div style="background: #f3f4f6; padding: 48px; text-align: center; border-radius: 8px;"><span style="color: #9ca3af;">Image placeholder</span></div>`;
        case 'divider':
          return `<hr style="${style}" />`;
        case 'spacer':
          return `<div style="${style}"></div>`;
        case 'section':
        case 'container':
        case 'row':
        case 'column':
        case 'grid':
          const childrenHTML = (block.children || []).map(renderBlockToHTML).join('');
          return `<div style="${style}">${childrenHTML || '<div style="min-height: 60px;"></div>'}</div>`;
        default:
          return `<div style="${style}; padding: 16px; background: #f3f4f6; border-radius: 4px;">${block.type} block</div>`;
      }
    };

    const contentHTML = blocks.map(renderBlockToHTML).join('');

    // Build the full page
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: ${themeFonts.body};
            color: ${themeColors.text};
            background: ${themeColors.background};
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }
          h1, h2, h3, h4, h5, h6 {
            font-family: ${themeFonts.heading};
          }
          a { color: ${themeColors.primary}; }
          .main-content {
            flex: 1;
            display: flex;
            max-width: ${pageSettings.containerWidth};
            margin: 0 auto;
            width: 100%;
          }
          .page-content {
            flex: 1;
            padding: 24px;
          }
          @media (max-width: 768px) {
            .main-content { flex-direction: column; }
            aside { width: 100% !important; border: none !important; border-top: 1px solid #e5e7eb !important; }
          }
        </style>
      </head>
      <body>
        ${pageSettings.showHeader ? (themeData?.partials?.header || defaultHeader) : ''}

        <div class="main-content">
          ${pageSettings.showSidebar && pageSettings.sidebarPosition === 'left' ? (themeData?.partials?.sidebar || defaultSidebar) : ''}

          <main class="page-content">
            ${contentHTML || '<div style="text-align: center; padding: 48px; color: #9ca3af;">No content yet. Add blocks to see them here.</div>'}
          </main>

          ${pageSettings.showSidebar && pageSettings.sidebarPosition === 'right' ? (themeData?.partials?.sidebar || defaultSidebar) : ''}
        </div>

        ${pageSettings.showFooter ? (themeData?.partials?.footer || defaultFooter) : ''}
      </body>
      </html>
    `;
  };

  useEffect(() => {
    if (isOpen && iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(generatePreviewHTML());
        doc.close();
      }
    }
  }, [isOpen, blocks, pageSettings, themeData, previewViewport]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full h-full flex flex-col bg-gray-900"
      >
        {/* Preview Header */}
        <div className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              <span className="text-sm">Close Preview</span>
            </button>
            <div className="h-6 w-px bg-gray-700" />
            <span className="text-white font-medium">Live Preview</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Viewport Switcher */}
            <div className="flex items-center bg-gray-700 rounded-lg p-1">
              {[
                { key: 'desktop', icon: Monitor, label: 'Desktop' },
                { key: 'tablet', icon: Tablet, label: 'Tablet' },
                { key: 'mobile', icon: Smartphone, label: 'Mobile' },
              ].map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => setPreviewViewport(key as Viewport)}
                  className={clsx(
                    'p-2 rounded transition-colors',
                    previewViewport === key ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  )}
                  title={label}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (iframeRef.current) {
                  const doc = iframeRef.current.contentDocument;
                  if (doc) {
                    doc.open();
                    doc.write(generatePreviewHTML());
                    doc.close();
                  }
                }
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm">Refresh</span>
            </button>
          </div>
        </div>

        {/* Preview Container */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gray-950 overflow-auto">
          <div
            className="bg-white shadow-2xl transition-all duration-300 overflow-hidden"
            style={{
              ...getViewportStyles(),
              borderRadius: previewViewport === 'desktop' ? '0' : '24px',
              border: previewViewport !== 'desktop' ? '8px solid #1f2937' : 'none',
            }}
          >
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0"
              title="Page Preview"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// =============================================================================
// PAGE SETTINGS PANEL
// =============================================================================

const PageSettingsPanel: React.FC<{
  settings: PageSettings;
  onUpdate: (settings: Partial<PageSettings>) => void;
  availableSidebars: SidebarOption[];
}> = ({ settings, onUpdate, availableSidebars }) => {
  return (
    <div className="space-y-4">
      <div className="border-b border-gray-700 pb-4">
        <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3 flex items-center gap-2">
          <Layout className="w-3.5 h-3.5" /> Layout Options
        </h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showHeader}
              onChange={(e) => onUpdate({ showHeader: e.target.checked })}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-300">Show Header</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showFooter}
              onChange={(e) => onUpdate({ showFooter: e.target.checked })}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-300">Show Footer</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showSidebar}
              onChange={(e) => onUpdate({ showSidebar: e.target.checked })}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-300">Show Sidebar</span>
          </label>
        </div>
      </div>

      {settings.showSidebar && (
        <div className="border-b border-gray-700 pb-4">
          <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">Sidebar Position</h4>
          <div className="flex gap-2">
            {(['left', 'right'] as const).map((pos) => (
              <button
                key={pos}
                onClick={() => onUpdate({ sidebarPosition: pos })}
                className={clsx(
                  'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors',
                  settings.sidebarPosition === pos
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-400 hover:text-white'
                )}
              >
                {pos.charAt(0).toUpperCase() + pos.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {settings.showSidebar && (
        <div className="border-b border-gray-700 pb-4">
          <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">Select Sidebar</h4>
          <select
            value={settings.sidebarId || ''}
            onChange={(e) => onUpdate({ sidebarId: e.target.value || null })}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white"
          >
            <option value="">Choose a sidebar...</option>
            {availableSidebars.map((sidebar) => (
              <option key={sidebar.id} value={sidebar.id}>{sidebar.name}</option>
            ))}
          </select>
          {availableSidebars.length === 0 && (
            <p className="text-xs text-gray-500 mt-2">
              No sidebars found. <a href="/admin/appearance/sidebar" className="text-blue-400 hover:underline">Create one</a>
            </p>
          )}
        </div>
      )}

      <div className="pb-4">
        <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">Container Width</h4>
        <select
          value={settings.containerWidth}
          onChange={(e) => onUpdate({ containerWidth: e.target.value })}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="100%">Full Width</option>
          <option value="1400px">Extra Large (1400px)</option>
          <option value="1200px">Large (1200px)</option>
          <option value="960px">Medium (960px)</option>
          <option value="720px">Small (720px)</option>
        </select>
      </div>
    </div>
  );
};

// =============================================================================
// STYLE EDITOR PANEL
// =============================================================================

const StyleEditor: React.FC<{
  block: Block | null;
  onUpdate: (settings: Partial<BlockSettings>) => void;
}> = ({ block, onUpdate }) => {
  if (!block) {
    return (
      <div className="p-4 text-center text-gray-500">
        <Sliders className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Select an element to edit styles</p>
      </div>
    );
  }

  const settings = block.settings;

  const updateSetting = (key: string, value: any) => {
    onUpdate({ [key]: value });
  };

  return (
    <div className="space-y-4">
      {/* Content */}
      {(block.type === 'heading' || block.type === 'paragraph' || block.type === 'button') && (
        <div className="border-b border-gray-700 pb-4">
          <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" /> Content
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Text</label>
              <input
                type="text"
                value={settings.text || ''}
                onChange={(e) => updateSetting('text', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
              />
            </div>
            {block.type === 'heading' && (
              <div>
                <label className="text-xs text-gray-500 block mb-1">Heading Level</label>
                <select
                  value={settings.level || 2}
                  onChange={(e) => updateSetting('level', parseInt(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
                >
                  {[1, 2, 3, 4, 5, 6].map(level => (
                    <option key={level} value={level}>H{level}</option>
                  ))}
                </select>
              </div>
            )}
            {block.type === 'button' && (
              <>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">URL</label>
                  <input
                    type="text"
                    value={settings.url || '#'}
                    onChange={(e) => updateSetting('url', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Target</label>
                  <select
                    value={settings.target || '_self'}
                    onChange={(e) => updateSetting('target', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
                  >
                    <option value="_self">Same Window</option>
                    <option value="_blank">New Window</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Image/Video Settings */}
      {(block.type === 'image' || block.type === 'video') && (
        <div className="border-b border-gray-700 pb-4">
          <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3 flex items-center gap-2">
            <Image className="w-3.5 h-3.5" /> Media
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">{block.type === 'image' ? 'Image URL' : 'Video URL'}</label>
              <input
                type="text"
                value={settings.src || ''}
                onChange={(e) => updateSetting('src', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
                placeholder={block.type === 'image' ? 'https://...' : 'YouTube/Vimeo URL'}
              />
            </div>
            {block.type === 'image' && (
              <div>
                <label className="text-xs text-gray-500 block mb-1">Alt Text</label>
                <input
                  type="text"
                  value={settings.alt || ''}
                  onChange={(e) => updateSetting('alt', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Typography */}
      <div className="border-b border-gray-700 pb-4">
        <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3 flex items-center gap-2">
          <Type className="w-3.5 h-3.5" /> Typography
        </h4>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Font Size</label>
            <input
              type="text"
              value={settings.fontSize || '16px'}
              onChange={(e) => updateSetting('fontSize', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Font Weight</label>
            <select
              value={settings.fontWeight || '400'}
              onChange={(e) => updateSetting('fontWeight', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
            >
              <option value="300">Light</option>
              <option value="400">Normal</option>
              <option value="500">Medium</option>
              <option value="600">Semi Bold</option>
              <option value="700">Bold</option>
              <option value="800">Extra Bold</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Text Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.color || '#000000'}
                onChange={(e) => updateSetting('color', e.target.value)}
                className="w-10 h-8 rounded cursor-pointer"
              />
              <input
                type="text"
                value={settings.color || '#000000'}
                onChange={(e) => updateSetting('color', e.target.value)}
                className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Text Align</label>
            <div className="flex gap-1">
              {[
                { value: 'left', icon: AlignLeft },
                { value: 'center', icon: AlignCenter },
                { value: 'right', icon: AlignRight },
                { value: 'justify', icon: AlignJustify },
              ].map(({ value, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => updateSetting('textAlign', value)}
                  className={clsx(
                    'p-2 rounded',
                    settings.textAlign === value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-400 hover:text-white'
                  )}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Background */}
      <div className="border-b border-gray-700 pb-4">
        <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3 flex items-center gap-2">
          <Paintbrush className="w-3.5 h-3.5" /> Background
        </h4>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Background Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.backgroundColor || '#ffffff'}
                onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                className="w-10 h-8 rounded cursor-pointer"
              />
              <input
                type="text"
                value={settings.backgroundColor || ''}
                onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
                placeholder="#ffffff"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Spacing */}
      <div className="border-b border-gray-700 pb-4">
        <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3 flex items-center gap-2">
          <Move className="w-3.5 h-3.5" /> Spacing
        </h4>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Padding</label>
            <div className="grid grid-cols-4 gap-1">
              {[
                { key: 'paddingTop', label: 'T' },
                { key: 'paddingRight', label: 'R' },
                { key: 'paddingBottom', label: 'B' },
                { key: 'paddingLeft', label: 'L' },
              ].map(({ key, label }) => (
                <input
                  key={key}
                  type="text"
                  value={settings[key] || '0'}
                  onChange={(e) => updateSetting(key, e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white text-center"
                  placeholder={label}
                  title={key}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Margin</label>
            <div className="grid grid-cols-4 gap-1">
              {[
                { key: 'marginTop', label: 'T' },
                { key: 'marginRight', label: 'R' },
                { key: 'marginBottom', label: 'B' },
                { key: 'marginLeft', label: 'L' },
              ].map(({ key, label }) => (
                <input
                  key={key}
                  type="text"
                  value={settings[key] || '0'}
                  onChange={(e) => updateSetting(key, e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white text-center"
                  placeholder={label}
                  title={key}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Border */}
      <div className="border-b border-gray-700 pb-4">
        <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3 flex items-center gap-2">
          <Square className="w-3.5 h-3.5" /> Border
        </h4>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Width</label>
              <input
                type="text"
                value={settings.borderWidth || '0'}
                onChange={(e) => updateSetting('borderWidth', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Radius</label>
              <input
                type="text"
                value={settings.borderRadius || '0'}
                onChange={(e) => updateSetting('borderRadius', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Border Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.borderColor || '#e5e7eb'}
                onChange={(e) => updateSetting('borderColor', e.target.value)}
                className="w-10 h-8 rounded cursor-pointer"
              />
              <input
                type="text"
                value={settings.borderColor || '#e5e7eb'}
                onChange={(e) => updateSetting('borderColor', e.target.value)}
                className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dimensions */}
      <div className="pb-4">
        <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3 flex items-center gap-2">
          <Maximize2 className="w-3.5 h-3.5" /> Dimensions
        </h4>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Width</label>
              <input
                type="text"
                value={settings.width || 'auto'}
                onChange={(e) => updateSetting('width', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Height</label>
              <input
                type="text"
                value={settings.height || 'auto'}
                onChange={(e) => updateSetting('height', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const PageBuilder: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [leftPanel, setLeftPanel] = useState<Panel>('blocks');
  const [rightPanel, setRightPanel] = useState<Panel>('styles');
  const [history, setHistory] = useState<Block[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['layout', 'basic']);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoom, setZoom] = useState(100);
  const [layoutData, setLayoutData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [themeData, setThemeData] = useState<ThemeData | null>(null);
  const [pageSettings, setPageSettings] = useState<PageSettings>({
    showHeader: true,
    showFooter: true,
    showSidebar: false,
    sidebarId: null,
    sidebarPosition: 'right',
    containerWidth: '1200px',
    headerStyle: 'default',
    footerStyle: 'default',
  });
  const [availableSidebars, setAvailableSidebars] = useState<SidebarOption[]>([]);

  // Drag and drop state
  const [draggedBlockType, setDraggedBlockType] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<number | null>(null);

  // Block config modal state
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [configModalBlockId, setConfigModalBlockId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Find selected block
  const findBlock = useCallback((blocks: Block[], id: string): Block | null => {
    for (const block of blocks) {
      if (block.id === id) return block;
      if (block.children) {
        const found = findBlock(block.children, id);
        if (found) return found;
      }
    }
    return null;
  }, []);

  const selectedBlock = selectedBlockId ? findBlock(blocks, selectedBlockId) : null;
  const configModalBlock = configModalBlockId ? findBlock(blocks, configModalBlockId) : null;

  // Handle config modal save
  const handleConfigSave = useCallback((settings: BlockSettings) => {
    if (configModalBlockId) {
      updateBlock(configModalBlockId, { settings });
    }
    setConfigModalOpen(false);
    setConfigModalBlockId(null);
  }, [configModalBlockId, updateBlock]);

  // Load layout and theme
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        // Fetch active theme
        try {
          const themeResponse = await fetch('/api/v1/themes/active', {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (themeResponse.ok) {
            const themeResult = await themeResponse.json();
            setThemeData(themeResult.data);
          }
        } catch (err) {
          console.log('Could not fetch theme, using defaults');
        }

        // Fetch available sidebars
        try {
          const sidebarsResponse = await fetch('/api/v1/sidebars', {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (sidebarsResponse.ok) {
            const sidebarsResult = await sidebarsResponse.json();
            const sidebars = sidebarsResult.data || sidebarsResult || [];
            setAvailableSidebars(
              Array.isArray(sidebars)
                ? sidebars.map((s: any) => ({
                    id: s.id || s.slug,
                    name: s.name || s.title || s.id,
                    location: s.location || 'right',
                  }))
                : []
            );
          }
        } catch (err) {
          console.log('Could not fetch sidebars, using defaults');
          // Set some default sidebars
          setAvailableSidebars([
            { id: 'default', name: 'Default Sidebar', location: 'right' },
            { id: 'blog', name: 'Blog Sidebar', location: 'right' },
            { id: 'shop', name: 'Shop Sidebar', location: 'left' },
          ]);
        }

        // Fetch layout if postId exists
        if (postId) {
          const response = await fetch(`/api/v1/rustbuilder/layouts/by-post/${postId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });

          if (response.ok) {
            const data = await response.json();
            setLayoutData(data.data);
            if (data.data?.content_json?.blocks) {
              setBlocks(data.data.content_json.blocks);
            }
            if (data.data?.page_settings) {
              setPageSettings(prev => ({ ...prev, ...data.data.page_settings }));
            }
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [postId]);

  // History management
  const pushHistory = useCallback((newBlocks: Block[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newBlocks)));
    setHistory(newHistory.slice(-50));
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setBlocks(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setBlocks(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  }, [history, historyIndex]);

  // Block operations
  const addBlock = useCallback((type: string) => {
    const newBlock = createBlock(type);
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    pushHistory(newBlocks);
    setSelectedBlockId(newBlock.id);
    toast.success(`Added ${type} block`);
    // Auto-open config modal for complex blocks
    if (isComplexBlock(type)) {
      setConfigModalBlockId(newBlock.id);
      setConfigModalOpen(true);
    }
  }, [blocks, pushHistory]);

  // Add block at specific position in root
  const addBlockAtPosition = useCallback((type: string, position: number) => {
    const newBlock = createBlock(type);
    const newBlocks = [...blocks];
    newBlocks.splice(position, 0, newBlock);
    setBlocks(newBlocks);
    pushHistory(newBlocks);
    setSelectedBlockId(newBlock.id);
    setDropPosition(null);
    setDropTargetId(null);
    toast.success(`Added ${type} block`);
    // Auto-open config modal for complex blocks
    if (isComplexBlock(type)) {
      setConfigModalBlockId(newBlock.id);
      setConfigModalOpen(true);
    }
  }, [blocks, pushHistory]);

  // Add block inside a container block
  const addBlockToContainer = useCallback((type: string, containerId: string, position?: number) => {
    const newBlock = createBlock(type);

    const addToContainer = (blocks: Block[]): Block[] => {
      return blocks.map(block => {
        if (block.id === containerId) {
          const children = block.children || [];
          const newChildren = [...children];
          if (position !== undefined) {
            newChildren.splice(position, 0, newBlock);
          } else {
            newChildren.push(newBlock);
          }
          return { ...block, children: newChildren };
        }
        if (block.children) {
          return { ...block, children: addToContainer(block.children) };
        }
        return block;
      });
    };

    const newBlocks = addToContainer(blocks);
    setBlocks(newBlocks);
    pushHistory(newBlocks);
    setSelectedBlockId(newBlock.id);
    setDropPosition(null);
    setDropTargetId(null);
    toast.success(`Added ${type} block`);
  }, [blocks, pushHistory]);

  const updateBlock = useCallback((id: string, updates: Partial<Block>) => {
    const updateInBlocks = (blocks: Block[]): Block[] => {
      return blocks.map(block => {
        if (block.id === id) {
          return { ...block, ...updates };
        }
        if (block.children) {
          return { ...block, children: updateInBlocks(block.children) };
        }
        return block;
      });
    };
    const newBlocks = updateInBlocks(blocks);
    setBlocks(newBlocks);
    pushHistory(newBlocks);
  }, [blocks, pushHistory]);

  const deleteBlock = useCallback((id: string) => {
    const deleteFromBlocks = (blocks: Block[]): Block[] => {
      return blocks.filter(block => {
        if (block.id === id) return false;
        if (block.children) {
          block.children = deleteFromBlocks(block.children);
        }
        return true;
      });
    };
    const newBlocks = deleteFromBlocks(blocks);
    setBlocks(newBlocks);
    pushHistory(newBlocks);
    if (selectedBlockId === id) setSelectedBlockId(null);
    toast.success('Block deleted');
  }, [blocks, selectedBlockId, pushHistory]);

  const duplicateBlock = useCallback((id: string) => {
    const duplicateInBlocks = (blocks: Block[]): Block[] => {
      const result: Block[] = [];
      for (const block of blocks) {
        result.push(block);
        if (block.id === id) {
          const duplicate = JSON.parse(JSON.stringify(block));
          duplicate.id = generateId();
          result.push(duplicate);
        }
        if (block.children) {
          block.children = duplicateInBlocks(block.children);
        }
      }
      return result;
    };
    const newBlocks = duplicateInBlocks(blocks);
    setBlocks(newBlocks);
    pushHistory(newBlocks);
    toast.success('Block duplicated');
  }, [blocks, pushHistory]);

  // Handle block reorder
  const handleReorder = useCallback((newBlocks: Block[]) => {
    setBlocks(newBlocks);
    pushHistory(newBlocks);
  }, [pushHistory]);

  // Save
  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      const payload = {
        author_id: userId,
        content_json: { version: '1.0', blocks },
        page_settings: pageSettings,
      };

      const url = layoutData?.id
        ? `/api/v1/rustbuilder/layouts/${layoutData.id}/save`
        : `/api/v1/rustbuilder/layouts`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(layoutData?.id ? payload : {
          post_id: postId,
          post_type: 'page',
          author_id: userId,
          content_json: { version: '1.0', blocks },
          page_settings: pageSettings,
        }),
      });

      if (response.ok) {
        toast.success('Layout saved successfully');
      } else {
        throw new Error('Failed to save');
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Failed to save layout');
    } finally {
      setSaving(false);
    }
  };

  // Viewport width
  const getViewportWidth = () => {
    switch (viewport) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      default: return '100%';
    }
  };

  // Filter blocks by search
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return BLOCK_CATEGORIES;
    return BLOCK_CATEGORIES.map(cat => ({
      ...cat,
      blocks: cat.blocks.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(cat => cat.blocks.length > 0);
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 z-50">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" />
            <Layers className="absolute inset-0 m-auto w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading Page Builder</h2>
          <p className="text-gray-400">Preparing your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 flex flex-col bg-gray-900 overflow-hidden z-50">
        {/* Top Toolbar */}
        <header className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Exit</span>
            </button>

            <div className="h-6 w-px bg-gray-700" />

            <div className="flex items-center gap-1">
              <button
                onClick={() => setLeftPanel(leftPanel === 'blocks' ? null : 'blocks')}
                className={clsx(
                  'p-2 rounded-lg transition-colors',
                  leftPanel === 'blocks' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
                )}
                title="Blocks"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                onClick={() => setLeftPanel(leftPanel === 'layers' ? null : 'layers')}
                className={clsx(
                  'p-2 rounded-lg transition-colors',
                  leftPanel === 'layers' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
                )}
                title="Layers"
              >
                <Layers className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Viewport */}
            <div className="flex items-center bg-gray-700 rounded-lg p-1">
              {[
                { key: 'desktop', icon: Monitor, label: 'Desktop' },
                { key: 'tablet', icon: Tablet, label: 'Tablet' },
                { key: 'mobile', icon: Smartphone, label: 'Mobile' },
              ].map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => setViewport(key as Viewport)}
                  className={clsx(
                    'p-2 rounded transition-colors',
                    viewport === key ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  )}
                  title={label}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-gray-700" />

            {/* Zoom */}
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <button
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                className="p-1 hover:text-white"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <span className="w-12 text-center">{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(150, zoom + 10))}
                className="p-1 hover:text-white"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            <div className="h-6 w-px bg-gray-700" />

            {/* Undo/Redo */}
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Undo"
            >
              <Undo className="w-5 h-5" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Redo"
            >
              <Redo className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span className="text-sm">Preview</span>
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span className="text-sm font-medium">Save</span>
            </button>

            <button
              onClick={() => setRightPanel(rightPanel === 'pageSettings' ? null : 'pageSettings')}
              className={clsx(
                'p-2 rounded-lg transition-colors',
                rightPanel === 'pageSettings' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
              )}
              title="Page Settings"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>

            <button
              onClick={() => setRightPanel(rightPanel === 'styles' ? null : 'styles')}
              className={clsx(
                'p-2 rounded-lg transition-colors',
                rightPanel === 'styles' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
              )}
              title="Element Styles"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel */}
          <AnimatePresence>
            {leftPanel && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="bg-gray-800 border-r border-gray-700 flex flex-col overflow-hidden shrink-0"
              >
                <div className="p-3 border-b border-gray-700">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search blocks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3">
                  {leftPanel === 'blocks' && (
                    <div className="space-y-2">
                      {filteredCategories.map((category) => (
                        <div key={category.id}>
                          <button
                            onClick={() => setExpandedCategories(
                              expandedCategories.includes(category.id)
                                ? expandedCategories.filter(id => id !== category.id)
                                : [...expandedCategories, category.id]
                            )}
                            className="w-full flex items-center justify-between p-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <category.icon className="w-4 h-4" />
                              {category.name}
                            </div>
                            <ChevronRight className={clsx(
                              'w-4 h-4 transition-transform',
                              expandedCategories.includes(category.id) && 'rotate-90'
                            )} />
                          </button>

                          <AnimatePresence>
                            {expandedCategories.includes(category.id) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="grid grid-cols-2 gap-2 p-2">
                                  {category.blocks.map((block) => (
                                    <button
                                      key={block.type}
                                      onClick={() => addBlock(block.type)}
                                      draggable
                                      onDragStart={(e) => {
                                        e.dataTransfer.setData('blockType', block.type);
                                        e.dataTransfer.effectAllowed = 'copy';
                                        setDraggedBlockType(block.type);
                                      }}
                                      onDragEnd={() => {
                                        setDraggedBlockType(null);
                                        setDropPosition(null);
                                        setDropTargetId(null);
                                      }}
                                      className="flex flex-col items-center gap-1 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group cursor-grab active:cursor-grabbing"
                                      title={block.description}
                                    >
                                      <block.icon className="w-5 h-5 text-gray-400 group-hover:text-blue-400" />
                                      <span className="text-xs text-gray-400 group-hover:text-white">{block.name}</span>
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  )}

                  {leftPanel === 'layers' && (
                    <div className="space-y-1">
                      {blocks.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No elements yet</p>
                        </div>
                      ) : (
                        <Reorder.Group
                          axis="y"
                          values={blocks}
                          onReorder={handleReorder}
                          className="space-y-1"
                        >
                          {blocks.map((block) => (
                            <Reorder.Item
                              key={block.id}
                              value={block}
                              className={clsx(
                                'w-full flex items-center gap-2 p-2 rounded-lg text-sm transition-colors cursor-grab active:cursor-grabbing',
                                selectedBlockId === block.id
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
                              )}
                              onClick={() => setSelectedBlockId(block.id)}
                            >
                              <GripVertical className="w-4 h-4 opacity-50" />
                              <span className="capitalize">{block.type}</span>
                              {block.hidden && <EyeOff className="w-3 h-3 ml-auto opacity-50" />}
                              {block.locked && <Lock className="w-3 h-3 ml-auto opacity-50" />}
                            </Reorder.Item>
                          ))}
                        </Reorder.Group>
                      )}
                    </div>
                  )}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Canvas */}
          <main
            className="flex-1 overflow-auto bg-gray-950 p-8"
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'copy';
            }}
            onDrop={(e) => {
              e.preventDefault();
              const blockType = e.dataTransfer.getData('blockType');
              if (blockType) {
                addBlock(blockType);
              }
            }}
          >
            <div
              ref={canvasRef}
              className="mx-auto transition-all duration-300"
              style={{
                width: getViewportWidth(),
                maxWidth: '100%',
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center',
              }}
            >
              <div
                className="bg-white min-h-[600px] shadow-2xl rounded-lg overflow-hidden"
                onClick={() => setSelectedBlockId(null)}
              >
                {blocks.length === 0 ? (
                  <div
                    className={clsx(
                      'flex flex-col items-center justify-center min-h-[600px] p-8 transition-colors',
                      draggedBlockType && 'bg-blue-50 border-2 border-dashed border-blue-400 rounded-lg'
                    )}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const blockType = e.dataTransfer.getData('blockType');
                      if (blockType) {
                        addBlockAtPosition(blockType, 0);
                      }
                    }}
                  >
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                      <Plus className={clsx('w-10 h-10', draggedBlockType ? 'text-blue-500' : 'text-gray-400')} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {draggedBlockType ? `Drop ${draggedBlockType} here` : 'Start Building'}
                    </h3>
                    <p className="text-gray-500 text-center mb-6 max-w-md">
                      {draggedBlockType
                        ? 'Release to add the block to your page'
                        : 'Drag blocks from the left panel or click to add. You can also drop blocks here.'}
                    </p>
                    {!draggedBlockType && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => addBlock('section')}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Section
                        </button>
                        <button
                          onClick={() => setLeftPanel('blocks')}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <LayoutGrid className="w-4 h-4" />
                          Browse Blocks
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4">
                    {/* First drop zone */}
                    <DropZone
                      position={0}
                      isActive={!!draggedBlockType}
                      onDrop={(type, pos) => addBlockAtPosition(type, pos)}
                      onDragOver={(pos) => setDropPosition(pos)}
                      onDragLeave={() => setDropPosition(null)}
                      label="Insert at top"
                    />

                    <Reorder.Group
                      axis="y"
                      values={blocks}
                      onReorder={handleReorder}
                      className="space-y-0"
                    >
                      {blocks.map((block, index) => (
                        <React.Fragment key={block.id}>
                          <DraggableBlockItem
                            block={block}
                            selected={selectedBlockId === block.id}
                            onSelect={() => setSelectedBlockId(block.id)}
                            onUpdate={(updated) => updateBlock(block.id, updated)}
                            onDelete={() => deleteBlock(block.id)}
                            onDuplicate={() => duplicateBlock(block.id)}
                            onConfigure={() => {
                              setConfigModalBlockId(block.id);
                              setConfigModalOpen(true);
                            }}
                            viewport={viewport}
                            onAddToContainer={addBlockToContainer}
                            isDragging={!!draggedBlockType}
                          />

                          {/* Drop zone after each block */}
                          <DropZone
                            position={index + 1}
                            isActive={!!draggedBlockType}
                            onDrop={(type, pos) => addBlockAtPosition(type, pos)}
                            onDragOver={(pos) => setDropPosition(pos)}
                            onDragLeave={() => setDropPosition(null)}
                            label={`Insert after ${block.type}`}
                          />
                        </React.Fragment>
                      ))}
                    </Reorder.Group>
                  </div>
                )}
              </div>
            </div>
          </main>

          {/* Right Panel */}
          <AnimatePresence>
            {rightPanel && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 300, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="bg-gray-800 border-l border-gray-700 flex flex-col overflow-hidden shrink-0"
              >
                <div className="p-3 border-b border-gray-700 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">
                    {rightPanel === 'pageSettings'
                      ? 'Page Settings'
                      : selectedBlock
                        ? `${selectedBlock.type} Settings`
                        : 'Element Settings'}
                  </h3>
                  <button
                    onClick={() => setRightPanel(null)}
                    className="p-1 text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {rightPanel === 'pageSettings' ? (
                    <PageSettingsPanel
                      settings={pageSettings}
                      onUpdate={(updates) => setPageSettings(prev => ({ ...prev, ...updates }))}
                      availableSidebars={availableSidebars}
                    />
                  ) : (
                    <StyleEditor
                      block={selectedBlock}
                      onUpdate={(settingsUpdate) => {
                        if (selectedBlockId && selectedBlock) {
                          updateBlock(selectedBlockId, {
                            settings: { ...selectedBlock.settings, ...settingsUpdate }
                          });
                        }
                      }}
                    />
                  )}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Live Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <LivePreviewModal
            isOpen={showPreview}
            onClose={() => setShowPreview(false)}
            blocks={blocks}
            viewport={viewport}
            pageSettings={pageSettings}
            themeData={themeData}
          />
        )}
      </AnimatePresence>

      {/* Block Config Modal */}
      <BlockConfigModal
        isOpen={configModalOpen}
        onClose={() => {
          setConfigModalOpen(false);
          setConfigModalBlockId(null);
        }}
        block={configModalBlock}
        onSave={handleConfigSave}
      />
    </>
  );
};

export default PageBuilder;
