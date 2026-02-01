/**
 * BlockConfigRegistry - Maps block types to their configuration components
 *
 * Registry for block-specific configuration wizards.
 * Each block type can have a custom configuration component.
 */

import React from 'react';
import {
  FormInput,
  Image,
  Play,
  ChevronDown,
  Folder,
  CreditCard,
  Quote,
  Clock,
  Video,
  Table,
  Code,
  MapPin,
  Menu,
  FileText,
  Target,
  BarChart,
  User,
  Type,
  Heading1,
  List,
  Link,
  Minus,
  Square,
  AlertCircle,
  Globe,
  Music,
  File,
  FileCode,
} from 'lucide-react';

// Import config components
import FormConfig from '../configs/FormConfig';
import GalleryConfig from '../configs/GalleryConfig';
import CarouselConfig from '../configs/CarouselConfig';
import AccordionConfig from '../configs/AccordionConfig';
import TabsConfig from '../configs/TabsConfig';
import PricingConfig from '../configs/PricingConfig';
import TestimonialConfig from '../configs/TestimonialConfig';
import CountdownConfig from '../configs/CountdownConfig';
import VideoConfig from '../configs/VideoConfig';
import TableConfig from '../configs/TableConfig';
import CodeConfig from '../configs/CodeConfig';
import MapConfig from '../configs/MapConfig';
import MenuConfig from '../configs/MenuConfig';
import PostsConfig from '../configs/PostsConfig';
import ProgressConfig from '../configs/ProgressConfig';
import CounterConfig from '../configs/CounterConfig';
import TextConfig from '../configs/TextConfig';
import HeadingConfig from '../configs/HeadingConfig';
import QuoteConfig from '../configs/QuoteConfig';
import ListConfig from '../configs/ListConfig';
import ImageConfig from '../configs/ImageConfig';
import ButtonConfig from '../configs/ButtonConfig';
import DividerConfig from '../configs/DividerConfig';
import SpacerConfig from '../configs/SpacerConfig';
import AlertConfig from '../configs/AlertConfig';
import EmbedConfig from '../configs/EmbedConfig';
import CustomHtmlConfig from '../configs/CustomHtmlConfig';
import AudioConfig from '../configs/AudioConfig';
import FileConfig from '../configs/FileConfig';

export interface BlockInfo {
  name: string;
  description: string;
  icon: React.ElementType;
  category: string;
}

export interface ConfigComponentProps {
  settings: Record<string, any>;
  onChange: (settings: Record<string, any>) => void;
  blockType: string;
  activeTab?: 'content' | 'behavior' | 'style';
}

type ConfigComponent = React.ComponentType<ConfigComponentProps>;

// Registry of block types to their config components
const configRegistry: Record<string, ConfigComponent> = {
  // Content blocks
  paragraph: TextConfig,
  text: TextConfig,
  heading: HeadingConfig,
  subheading: HeadingConfig,
  quote: QuoteConfig,
  blockquote: QuoteConfig,
  list: ListConfig,

  // Media blocks
  image: ImageConfig,
  gallery: GalleryConfig,
  carousel: CarouselConfig,
  video: VideoConfig,
  audio: AudioConfig,
  file: FileConfig,
  embed: EmbedConfig,

  // Interactive blocks
  form: FormConfig,
  button: ButtonConfig,
  accordion: AccordionConfig,
  tabs: TabsConfig,
  alert: AlertConfig,
  notice: AlertConfig,

  // Layout blocks
  table: TableConfig,
  divider: DividerConfig,
  spacer: SpacerConfig,

  // Widget blocks
  pricing: PricingConfig,
  testimonial: TestimonialConfig,
  countdown: CountdownConfig,
  progress: ProgressConfig,
  counter: CounterConfig,

  // Navigation & dynamic
  menu: MenuConfig,
  posts: PostsConfig,
  map: MapConfig,

  // Advanced
  code: CodeConfig,
  'code-block': CodeConfig,
  html: CustomHtmlConfig,
  'custom-html': CustomHtmlConfig,
};

// Block info registry
const blockInfoRegistry: Record<string, BlockInfo> = {
  // Content blocks
  paragraph: {
    name: 'Paragraph',
    description: 'Add and style text content',
    icon: Type,
    category: 'content',
  },
  text: {
    name: 'Text',
    description: 'Add and style text content',
    icon: Type,
    category: 'content',
  },
  heading: {
    name: 'Heading',
    description: 'Section heading with level options (H1-H6)',
    icon: Heading1,
    category: 'content',
  },
  subheading: {
    name: 'Subheading',
    description: 'Smaller heading for subsections',
    icon: Heading1,
    category: 'content',
  },
  quote: {
    name: 'Quote',
    description: 'Highlight quoted text with citation',
    icon: Quote,
    category: 'content',
  },
  blockquote: {
    name: 'Blockquote',
    description: 'Highlight quoted text with citation',
    icon: Quote,
    category: 'content',
  },
  list: {
    name: 'List',
    description: 'Bulleted or numbered list items',
    icon: List,
    category: 'content',
  },

  // Media blocks
  image: {
    name: 'Image',
    description: 'Upload or embed an image with alt text and caption',
    icon: Image,
    category: 'media',
  },
  gallery: {
    name: 'Gallery',
    description: 'Manage images, layout modes, and lightbox settings',
    icon: Image,
    category: 'media',
  },
  carousel: {
    name: 'Carousel',
    description: 'Configure slides, autoplay, and navigation options',
    icon: Play,
    category: 'media',
  },
  video: {
    name: 'Video',
    description: 'Configure video source, playback options, and controls',
    icon: Video,
    category: 'media',
  },
  audio: {
    name: 'Audio',
    description: 'Embed audio player with playback controls',
    icon: Music,
    category: 'media',
  },
  file: {
    name: 'File',
    description: 'Add downloadable file with description',
    icon: File,
    category: 'media',
  },
  embed: {
    name: 'Embed',
    description: 'Embed content from YouTube, Vimeo, Twitter, etc.',
    icon: Globe,
    category: 'media',
  },

  // Interactive blocks
  form: {
    name: 'Form',
    description: 'Configure form fields, validation rules, and submission actions',
    icon: FormInput,
    category: 'interactive',
  },
  button: {
    name: 'Button',
    description: 'Call-to-action button with link and styling',
    icon: Link,
    category: 'interactive',
  },
  accordion: {
    name: 'Accordion',
    description: 'Manage collapsible content items and behavior',
    icon: ChevronDown,
    category: 'interactive',
  },
  tabs: {
    name: 'Tabs',
    description: 'Configure tabbed content sections and styling',
    icon: Folder,
    category: 'interactive',
  },
  alert: {
    name: 'Alert',
    description: 'Highlighted notice box with icon and message',
    icon: AlertCircle,
    category: 'interactive',
  },
  notice: {
    name: 'Notice',
    description: 'Highlighted notice box with icon and message',
    icon: AlertCircle,
    category: 'interactive',
  },

  // Layout blocks
  table: {
    name: 'Table',
    description: 'Edit table cells, configure headers and styling',
    icon: Table,
    category: 'layout',
  },
  divider: {
    name: 'Divider',
    description: 'Horizontal line separator with style options',
    icon: Minus,
    category: 'layout',
  },
  spacer: {
    name: 'Spacer',
    description: 'Add vertical spacing between blocks',
    icon: Square,
    category: 'layout',
  },

  // Widget blocks
  pricing: {
    name: 'Pricing',
    description: 'Set up pricing details, features, and display options',
    icon: CreditCard,
    category: 'widgets',
  },
  testimonial: {
    name: 'Testimonial',
    description: 'Configure customer review display with quote, author, and rating',
    icon: Quote,
    category: 'widgets',
  },
  countdown: {
    name: 'Countdown',
    description: 'Set target date and configure display units',
    icon: Clock,
    category: 'widgets',
  },
  progress: {
    name: 'Progress',
    description: 'Configure progress bar value, animation, and colors',
    icon: Target,
    category: 'widgets',
  },
  counter: {
    name: 'Counter',
    description: 'Configure animated counter with start/end values and formatting',
    icon: BarChart,
    category: 'widgets',
  },

  // Navigation & dynamic
  menu: {
    name: 'Menu',
    description: 'Configure navigation items with support for nesting',
    icon: Menu,
    category: 'navigation',
  },
  posts: {
    name: 'Posts',
    description: 'Configure post query filters and layout options',
    icon: FileText,
    category: 'dynamic',
  },
  map: {
    name: 'Map',
    description: 'Set location, zoom level, and map display options',
    icon: MapPin,
    category: 'widgets',
  },

  // Advanced
  code: {
    name: 'Code',
    description: 'Configure code snippet with language and display options',
    icon: Code,
    category: 'advanced',
  },
  'code-block': {
    name: 'Code Block',
    description: 'Configure code snippet with language and display options',
    icon: Code,
    category: 'advanced',
  },
  html: {
    name: 'Custom HTML',
    description: 'Insert raw HTML, CSS, and JavaScript code',
    icon: FileCode,
    category: 'advanced',
  },
  'custom-html': {
    name: 'Custom HTML',
    description: 'Insert raw HTML, CSS, and JavaScript code',
    icon: FileCode,
    category: 'advanced',
  },
  author: {
    name: 'Author',
    description: 'Configure author display with avatar, bio, and social links',
    icon: User,
    category: 'dynamic',
  },
};

// List of block types that require configuration wizards (auto-open)
const complexBlockTypes = new Set([
  'form',
  'gallery',
  'carousel',
  'accordion',
  'tabs',
  'pricing',
  'testimonial',
  'countdown',
  'video',
  'table',
  'code',
  'code-block',
  'map',
  'menu',
  'posts',
  'progress',
  'counter',
  'html',
  'custom-html',
]);

/**
 * Get the configuration component for a block type
 */
export function getConfigComponent(blockType: string): ConfigComponent | null {
  return configRegistry[blockType] || null;
}

/**
 * Check if a block type has a configuration component
 */
export function hasConfigComponent(blockType: string): boolean {
  return blockType in configRegistry;
}

/**
 * Get block info (name, description, icon)
 */
export function getBlockInfo(blockType: string): BlockInfo | null {
  return blockInfoRegistry[blockType] || null;
}

/**
 * Check if a block type is considered "complex" and should auto-open config
 */
export function isComplexBlock(blockType: string): boolean {
  return complexBlockTypes.has(blockType);
}

/**
 * Get all block types that have configuration components
 */
export function getConfigurableBlockTypes(): string[] {
  return Object.keys(configRegistry);
}

/**
 * Register a new configuration component
 */
export function registerConfigComponent(blockType: string, component: ConfigComponent, info?: BlockInfo): void {
  configRegistry[blockType] = component;
  if (info) {
    blockInfoRegistry[blockType] = info;
  }
}

export default {
  getConfigComponent,
  hasConfigComponent,
  getBlockInfo,
  isComplexBlock,
  getConfigurableBlockTypes,
  registerConfigComponent,
};
