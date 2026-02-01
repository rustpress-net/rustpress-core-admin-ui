// Modal Components Export
// This file exports all popup modal components for the PostEditor

// Base Modal Infrastructure
export { EditorModal, ModalSection, FormField, FormRow, Toggle, Select, Input, Textarea, Badge, InfoBox } from './EditorModal';
export type { EditorModalProps, ModalSectionProps, FormFieldProps, ToggleProps, SelectProps, InputProps, TextareaProps, BadgeProps, InfoBoxProps } from './EditorModal';

// Block Library Modal - Animations, Templates, Media Library
import { BlockLibraryModal } from './BlockLibraryModal';
export { BlockLibraryModal };

// Visual Elements Modal - Carousel, Gallery, Before/After, Table, Embeds
import { VisualElementsModal } from './VisualElementsModal';
export { VisualElementsModal };

// SEO Analysis Modal - SEO Analyzer, Readability, Keywords, Headings, Schema, Links
import { SEOAnalysisModal } from './SEOAnalysisModal';
export { SEOAnalysisModal };

// Preview Options Modal - Device Preview, Social Preview, Content Outline
import { PreviewOptionsModal } from './PreviewOptionsModal';
export { PreviewOptionsModal };

// Post Settings Modal - Featured Image, Author, Categories, Tags, Visibility, Schedule, etc.
import { PostSettingsModal } from './PostSettingsModal';
export { PostSettingsModal };

// Metadata & SEO Modal - SEO Settings, Social Sharing, Custom Fields, Format, Template, etc.
import { MetadataSEOModal } from './MetadataSEOModal';
export { MetadataSEOModal };

// Advanced Modal - Version History, Compare, Analytics, Collaboration, Image Optimizer, Plugins
import { AdvancedModal } from './AdvancedModal';
export { AdvancedModal };

// AI Tools Modal - AI Writing Assistant, Content Generator, Image AI, SEO AI, Translate, Summarize
import { AIToolsModal } from './AIToolsModal';
export { AIToolsModal };

// Default export
export default BlockLibraryModal;

// All Modals Export for easy importing
export const AllModals = {
  BlockLibraryModal,
  VisualElementsModal,
  SEOAnalysisModal,
  PreviewOptionsModal,
  PostSettingsModal,
  MetadataSEOModal,
  AdvancedModal,
  AIToolsModal,
};

// Modal Types
export type ModalType =
  | 'block-library'
  | 'visual-elements'
  | 'seo-analysis'
  | 'preview-options'
  | 'post-settings'
  | 'metadata-seo'
  | 'advanced'
  | 'ai-tools';

// Modal configuration for each tool
export interface ModalConfig {
  id: ModalType;
  title: string;
  description: string;
  icon: string;
  tabs: string[];
}

export const modalConfigs: Record<ModalType, ModalConfig> = {
  'block-library': {
    id: 'block-library',
    title: 'Block Library',
    description: 'Content blocks, animations, templates, and media library',
    icon: 'Layers',
    tabs: ['blocks', 'animations', 'templates', 'media'],
  },
  'visual-elements': {
    id: 'visual-elements',
    title: 'Visual Elements',
    description: 'Carousel, gallery, tables, and embeds',
    icon: 'Image',
    tabs: ['carousel', 'gallery', 'before-after', 'table', 'embeds'],
  },
  'seo-analysis': {
    id: 'seo-analysis',
    title: 'SEO & Analysis',
    description: 'SEO analyzer, readability, and link checker',
    icon: 'Search',
    tabs: ['seo', 'readability', 'keywords', 'headings', 'schema', 'links', 'checker'],
  },
  'preview-options': {
    id: 'preview-options',
    title: 'Preview Options',
    description: 'Device preview, social preview, and outline',
    icon: 'Eye',
    tabs: ['device', 'social', 'outline'],
  },
  'post-settings': {
    id: 'post-settings',
    title: 'Post Settings',
    description: 'Featured image, author, categories, and more',
    icon: 'Settings',
    tabs: ['featured', 'author', 'categories', 'tags', 'visibility', 'schedule', 'excerpt', 'slug', 'discussion', 'revisions'],
  },
  'metadata-seo': {
    id: 'metadata-seo',
    title: 'Metadata & SEO',
    description: 'SEO settings, social sharing, custom fields',
    icon: 'FileText',
    tabs: ['seo', 'social', 'custom-fields', 'format', 'template', 'attributes', 'related', 'series', 'location', 'language'],
  },
  'advanced': {
    id: 'advanced',
    title: 'Advanced',
    description: 'Version history, analytics, collaboration',
    icon: 'Zap',
    tabs: ['history', 'compare', 'analytics', 'collaboration', 'optimizer', 'plugins'],
  },
  'ai-tools': {
    id: 'ai-tools',
    title: 'AI Tools',
    description: 'AI-powered content enhancement',
    icon: 'Brain',
    tabs: ['assistant', 'generate', 'image', 'seo', 'translate', 'summarize'],
  },
};

// Helper to get modal component by type
export const getModalComponent = (type: ModalType) => {
  switch (type) {
    case 'block-library':
      return BlockLibraryModal;
    case 'visual-elements':
      return VisualElementsModal;
    case 'seo-analysis':
      return SEOAnalysisModal;
    case 'preview-options':
      return PreviewOptionsModal;
    case 'post-settings':
      return PostSettingsModal;
    case 'metadata-seo':
      return MetadataSEOModal;
    case 'advanced':
      return AdvancedModal;
    case 'ai-tools':
      return AIToolsModal;
    default:
      return null;
  }
};
