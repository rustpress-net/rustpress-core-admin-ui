import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import {
  Search,
  Settings,
  Share2,
  FileText,
  Layout,
  Layers,
  Link2,
  BookOpen,
  MapPin,
  Globe,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Facebook,
  Twitter,
  Linkedin,
  Image,
  Type,
  Hash,
  Calendar,
  User,
  Tag,
  Folder,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  AlertCircle,
  Info,
  Sparkles,
  Zap,
  RefreshCw,
  Download,
  Upload,
  MoreVertical,
  Edit3,
  Code,
  List,
  Grid,
  Star,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowRight,
  Languages,
  Flag,
  Navigation,
  Building,
  Phone,
  Mail,
  AtSign,
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

interface MetadataSEOModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: MetadataTab;
  hideTabs?: boolean;
}

type MetadataTab = 'seo' | 'social' | 'custom-fields' | 'format' | 'template' | 'attributes' | 'related' | 'series' | 'location' | 'language';

// Tab titles and subtitles for single-tab mode
const metadataTabTitles: Record<string, { title: string; subtitle: string }> = {
  seo: { title: 'SEO Settings', subtitle: 'Configure meta title, description, and Open Graph' },
  social: { title: 'Social Sharing', subtitle: 'Customize how content appears when shared' },
  'custom-fields': { title: 'Custom Fields', subtitle: 'Add custom metadata and properties' },
  format: { title: 'Post Format', subtitle: 'Select content format type' },
  template: { title: 'Template', subtitle: 'Choose page template' },
  attributes: { title: 'Attributes', subtitle: 'Set post permissions and access' },
  related: { title: 'Related Posts', subtitle: 'Configure related content suggestions' },
  series: { title: 'Series', subtitle: 'Organize posts into series' },
  location: { title: 'Location', subtitle: 'Add geographic location data' },
  language: { title: 'Language', subtitle: 'Set content language and translations' },
};

// SEO Settings Types
interface SEOSettings {
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  secondaryKeywords: string[];
  canonicalUrl: string;
  robots: {
    index: boolean;
    follow: boolean;
    noarchive: boolean;
    nosnippet: boolean;
    noimageindex: boolean;
    maxSnippet: number;
    maxImagePreview: 'none' | 'standard' | 'large';
    maxVideoPreview: number;
  };
  breadcrumbTitle: string;
  redirectUrl: string;
  redirectType: '301' | '302' | '307' | '410';
}

// Social Sharing Types
interface SocialSettings {
  facebook: {
    title: string;
    description: string;
    image: string;
    type: 'article' | 'website' | 'product' | 'video';
  };
  twitter: {
    title: string;
    description: string;
    image: string;
    cardType: 'summary' | 'summary_large_image' | 'player' | 'app';
    creator: string;
  };
  linkedin: {
    title: string;
    description: string;
    image: string;
  };
  pinterest: {
    description: string;
    image: string;
    richPin: boolean;
  };
}

// Custom Field Types
interface CustomField {
  id: string;
  key: string;
  value: string;
  type: 'text' | 'number' | 'date' | 'url' | 'email' | 'textarea' | 'select' | 'checkbox';
  options?: string[];
  isVisible: boolean;
}

// Post Format Types
type PostFormat = 'standard' | 'aside' | 'gallery' | 'link' | 'image' | 'quote' | 'status' | 'video' | 'audio' | 'chat';

// Template Types
interface TemplateSettings {
  template: string;
  layout: 'default' | 'full-width' | 'sidebar-left' | 'sidebar-right' | 'no-sidebar';
  headerStyle: 'default' | 'transparent' | 'minimal' | 'hero';
  footerStyle: 'default' | 'minimal' | 'expanded' | 'hidden';
  customClasses: string;
  customCSS: string;
}

// Attributes Types
interface AttributeSettings {
  order: number;
  parentPage: string;
  pageType: 'page' | 'landing' | 'article' | 'product' | 'portfolio';
  menuOrder: number;
  customPermissions: {
    viewRole: string[];
    editRole: string[];
    deleteRole: string[];
  };
}

// Related Posts Types
interface RelatedPost {
  id: string;
  title: string;
  thumbnail: string;
  date: string;
  category: string;
  relevanceScore: number;
}

// Series Types
interface Series {
  id: string;
  name: string;
  description: string;
  postCount: number;
  currentPosition: number;
}

// Location Types
interface LocationSettings {
  enabled: boolean;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  mapZoom: number;
  showMap: boolean;
  businessInfo: {
    name: string;
    phone: string;
    email: string;
    website: string;
    hours: string;
  };
}

// Language Types
interface LanguageSettings {
  primaryLanguage: string;
  translations: {
    language: string;
    postId: string;
    status: 'published' | 'draft' | 'pending';
  }[];
  hreflangTags: boolean;
  autoTranslate: boolean;
}

// Score indicator component
const ScoreBar: React.FC<{ score: number; maxScore: number; label: string }> = ({ score, maxScore, label }) => {
  const percentage = (score / maxScore) * 100;
  const color = percentage >= 80 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-300">{score}/{maxScore}</span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          className={clsx('h-full rounded-full', color)}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
};

// Character counter component
const CharacterCounter: React.FC<{ current: number; min: number; max: number }> = ({ current, min, max }) => {
  const isOptimal = current >= min && current <= max;
  const isTooShort = current < min;
  const isTooLong = current > max;

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={clsx(
        isOptimal && 'text-green-400',
        isTooShort && 'text-yellow-400',
        isTooLong && 'text-red-400'
      )}>
        {current} characters
      </span>
      <span className="text-slate-500">
        (optimal: {min}-{max})
      </span>
    </div>
  );
};

export const MetadataSEOModal: React.FC<MetadataSEOModalProps> = ({ isOpen, onClose, initialTab, hideTabs = false }) => {
  const [activeTab, setActiveTab] = useState<MetadataTab>(initialTab || 'seo');

  // Sync activeTab with initialTab prop changes (fixes single-tab mode)
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Get title and subtitle based on single-tab mode
  const currentTabInfo = metadataTabTitles[activeTab] || { title: 'Metadata & SEO', subtitle: 'SEO settings, social sharing, custom fields' };
  const modalTitle = hideTabs ? currentTabInfo.title : 'Metadata & SEO';
  const modalSubtitle = hideTabs ? currentTabInfo.subtitle : 'SEO settings, social sharing, custom fields';
  const [searchQuery, setSearchQuery] = useState('');

  // SEO Settings State
  const [seoSettings, setSeoSettings] = useState<SEOSettings>({
    metaTitle: 'How to Build a Modern Web Application - Complete Guide',
    metaDescription: 'Learn how to build modern web applications with React, TypeScript, and best practices. This comprehensive guide covers everything from setup to deployment.',
    focusKeyword: 'modern web application',
    secondaryKeywords: ['react', 'typescript', 'web development'],
    canonicalUrl: '',
    robots: {
      index: true,
      follow: true,
      noarchive: false,
      nosnippet: false,
      noimageindex: false,
      maxSnippet: -1,
      maxImagePreview: 'large',
      maxVideoPreview: -1,
    },
    breadcrumbTitle: '',
    redirectUrl: '',
    redirectType: '301',
  });

  // Social Settings State
  const [socialSettings, setSocialSettings] = useState<SocialSettings>({
    facebook: {
      title: '',
      description: '',
      image: '',
      type: 'article',
    },
    twitter: {
      title: '',
      description: '',
      image: '',
      cardType: 'summary_large_image',
      creator: '@username',
    },
    linkedin: {
      title: '',
      description: '',
      image: '',
    },
    pinterest: {
      description: '',
      image: '',
      richPin: true,
    },
  });

  // Custom Fields State
  const [customFields, setCustomFields] = useState<CustomField[]>([
    { id: '1', key: 'subtitle', value: 'A comprehensive guide for developers', type: 'text', isVisible: true },
    { id: '2', key: 'reading_time', value: '15', type: 'number', isVisible: true },
    { id: '3', key: 'difficulty', value: 'intermediate', type: 'select', options: ['beginner', 'intermediate', 'advanced'], isVisible: true },
  ]);

  // Post Format State
  const [postFormat, setPostFormat] = useState<PostFormat>('standard');

  // Template Settings State
  const [templateSettings, setTemplateSettings] = useState<TemplateSettings>({
    template: 'default',
    layout: 'default',
    headerStyle: 'default',
    footerStyle: 'default',
    customClasses: '',
    customCSS: '',
  });

  // Attributes State
  const [attributeSettings, setAttributeSettings] = useState<AttributeSettings>({
    order: 0,
    parentPage: '',
    pageType: 'article',
    menuOrder: 0,
    customPermissions: {
      viewRole: ['public'],
      editRole: ['editor', 'admin'],
      deleteRole: ['admin'],
    },
  });

  // Related Posts State
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([
    { id: '1', title: 'Getting Started with React', thumbnail: '', date: '2024-01-15', category: 'React', relevanceScore: 95 },
    { id: '2', title: 'TypeScript Best Practices', thumbnail: '', date: '2024-01-10', category: 'TypeScript', relevanceScore: 88 },
    { id: '3', title: 'Modern CSS Techniques', thumbnail: '', date: '2024-01-05', category: 'CSS', relevanceScore: 72 },
  ]);
  const [relatedPostsMethod, setRelatedPostsMethod] = useState<'auto' | 'manual'>('auto');

  // Series State
  const [seriesSettings, setSeriesSettings] = useState<{
    enabled: boolean;
    selectedSeries: string;
    position: number;
  }>({
    enabled: false,
    selectedSeries: '',
    position: 1,
  });

  const [availableSeries] = useState<Series[]>([
    { id: '1', name: 'React Fundamentals', description: 'Learn React from scratch', postCount: 8, currentPosition: 0 },
    { id: '2', name: 'TypeScript Deep Dive', description: 'Advanced TypeScript patterns', postCount: 12, currentPosition: 0 },
    { id: '3', name: 'Web Performance', description: 'Optimize your web applications', postCount: 5, currentPosition: 0 },
  ]);

  // Location State
  const [locationSettings, setLocationSettings] = useState<LocationSettings>({
    enabled: false,
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    coordinates: { lat: 0, lng: 0 },
    mapZoom: 15,
    showMap: true,
    businessInfo: {
      name: '',
      phone: '',
      email: '',
      website: '',
      hours: '',
    },
  });

  // Language State
  const [languageSettings, setLanguageSettings] = useState<LanguageSettings>({
    primaryLanguage: 'en',
    translations: [
      { language: 'es', postId: '123', status: 'published' },
      { language: 'fr', postId: '124', status: 'draft' },
    ],
    hreflangTags: true,
    autoTranslate: false,
  });

  const tabs = [
    { id: 'seo' as const, label: 'SEO Settings', icon: Search },
    { id: 'social' as const, label: 'Social Sharing', icon: Share2 },
    { id: 'custom-fields' as const, label: 'Custom Fields', icon: FileText },
    { id: 'format' as const, label: 'Post Format', icon: Layout },
    { id: 'template' as const, label: 'Template', icon: Layers },
    { id: 'attributes' as const, label: 'Attributes', icon: Settings },
    { id: 'related' as const, label: 'Related Posts', icon: Link2 },
    { id: 'series' as const, label: 'Series', icon: BookOpen },
    { id: 'location' as const, label: 'Location', icon: MapPin },
    { id: 'language' as const, label: 'Language', icon: Globe },
  ];

  // Add custom field
  const addCustomField = () => {
    const newField: CustomField = {
      id: Date.now().toString(),
      key: '',
      value: '',
      type: 'text',
      isVisible: true,
    };
    setCustomFields([...customFields, newField]);
  };

  // Remove custom field
  const removeCustomField = (id: string) => {
    setCustomFields(customFields.filter(f => f.id !== id));
  };

  // Update custom field
  const updateCustomField = (id: string, updates: Partial<CustomField>) => {
    setCustomFields(customFields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  // Post formats data
  const postFormats: { id: PostFormat; label: string; icon: React.ElementType; description: string }[] = [
    { id: 'standard', label: 'Standard', icon: FileText, description: 'Default post format with title and content' },
    { id: 'aside', label: 'Aside', icon: Type, description: 'Brief snippet without title, similar to Facebook note' },
    { id: 'gallery', label: 'Gallery', icon: Grid, description: 'Gallery of images with optional captions' },
    { id: 'link', label: 'Link', icon: Link2, description: 'Link to external content' },
    { id: 'image', label: 'Image', icon: Image, description: 'Single image with optional caption' },
    { id: 'quote', label: 'Quote', icon: Type, description: 'Quotation with citation' },
    { id: 'status', label: 'Status', icon: Zap, description: 'Short status update, similar to Twitter' },
    { id: 'video', label: 'Video', icon: Layout, description: 'Single video or playlist' },
    { id: 'audio', label: 'Audio', icon: Layout, description: 'Audio file or playlist' },
    { id: 'chat', label: 'Chat', icon: List, description: 'Chat transcript format' },
  ];

  // Available templates
  const templates = [
    { id: 'default', label: 'Default Template', description: 'Standard blog post layout' },
    { id: 'full-width', label: 'Full Width', description: 'Content spans full width' },
    { id: 'landing', label: 'Landing Page', description: 'Optimized for conversions' },
    { id: 'portfolio', label: 'Portfolio', description: 'Showcase work with gallery' },
    { id: 'documentation', label: 'Documentation', description: 'Technical docs layout' },
    { id: 'blank', label: 'Blank Canvas', description: 'No predefined structure' },
  ];

  // Available languages
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'seo':
        return (
          <div className="space-y-6">
            {/* SEO Score Overview */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-white">SEO Score</h3>
                <Badge variant="success">Good - 78/100</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <ScoreBar score={45} maxScore={50} label="Title" />
                <ScoreBar score={18} maxScore={25} label="Description" />
                <ScoreBar score={15} maxScore={25} label="Keywords" />
              </div>
            </div>

            {/* Meta Title */}
            <ModalSection title="Meta Title" icon={Type} defaultOpen>
              <div className="space-y-3">
                <div className="relative">
                  <Input
                    value={seoSettings.metaTitle}
                    onChange={(e) => setSeoSettings({ ...seoSettings, metaTitle: e.target.value })}
                    placeholder="Enter meta title..."
                  />
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-purple-400 transition-colors"
                    title="Generate with AI"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
                <CharacterCounter current={seoSettings.metaTitle.length} min={50} max={60} />

                {/* Preview */}
                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                  <p className="text-xs text-slate-500 mb-2">Google Preview</p>
                  <p className="text-blue-400 text-sm hover:underline cursor-pointer line-clamp-1">
                    {seoSettings.metaTitle || 'Page Title'}
                  </p>
                  <p className="text-green-400 text-xs mt-0.5">https://example.com/post-slug</p>
                  <p className="text-slate-400 text-xs mt-1 line-clamp-2">
                    {seoSettings.metaDescription || 'Meta description will appear here...'}
                  </p>
                </div>
              </div>
            </ModalSection>

            {/* Meta Description */}
            <ModalSection title="Meta Description" icon={FileText} defaultOpen>
              <div className="space-y-3">
                <div className="relative">
                  <Textarea
                    value={seoSettings.metaDescription}
                    onChange={(e) => setSeoSettings({ ...seoSettings, metaDescription: e.target.value })}
                    placeholder="Enter meta description..."
                    rows={3}
                  />
                  <button
                    className="absolute right-2 bottom-2 p-1.5 text-slate-400 hover:text-purple-400 transition-colors"
                    title="Generate with AI"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
                <CharacterCounter current={seoSettings.metaDescription.length} min={120} max={160} />
              </div>
            </ModalSection>

            {/* Focus Keywords */}
            <ModalSection title="Focus Keywords" icon={Hash} defaultOpen>
              <div className="space-y-3">
                <FormField label="Primary Keyword">
                  <Input
                    value={seoSettings.focusKeyword}
                    onChange={(e) => setSeoSettings({ ...seoSettings, focusKeyword: e.target.value })}
                    placeholder="Enter focus keyword..."
                  />
                </FormField>

                <FormField label="Secondary Keywords">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {seoSettings.secondaryKeywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-slate-700 rounded text-sm text-slate-300"
                      >
                        {keyword}
                        <button
                          onClick={() => {
                            const newKeywords = [...seoSettings.secondaryKeywords];
                            newKeywords.splice(index, 1);
                            setSeoSettings({ ...seoSettings, secondaryKeywords: newKeywords });
                          }}
                          className="text-slate-500 hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <Input
                    placeholder="Add keyword and press Enter..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        setSeoSettings({
                          ...seoSettings,
                          secondaryKeywords: [...seoSettings.secondaryKeywords, e.currentTarget.value],
                        });
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </FormField>
              </div>
            </ModalSection>

            {/* Canonical URL */}
            <ModalSection title="Canonical URL" icon={Link2}>
              <div className="space-y-3">
                <Input
                  value={seoSettings.canonicalUrl}
                  onChange={(e) => setSeoSettings({ ...seoSettings, canonicalUrl: e.target.value })}
                  placeholder="https://example.com/original-post"
                />
                <InfoBox variant="info">
                  Leave empty to use the post's own URL as canonical. Set this if content is duplicated from another source.
                </InfoBox>
              </div>
            </ModalSection>

            {/* Robots Meta */}
            <ModalSection title="Robots Directives" icon={Settings}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Toggle
                    label="Index this page"
                    description="Allow search engines to index"
                    checked={seoSettings.robots.index}
                    onChange={(checked) => setSeoSettings({
                      ...seoSettings,
                      robots: { ...seoSettings.robots, index: checked },
                    })}
                  />
                  <Toggle
                    label="Follow links"
                    description="Allow following outbound links"
                    checked={seoSettings.robots.follow}
                    onChange={(checked) => setSeoSettings({
                      ...seoSettings,
                      robots: { ...seoSettings.robots, follow: checked },
                    })}
                  />
                  <Toggle
                    label="No archive"
                    description="Prevent cached copies"
                    checked={seoSettings.robots.noarchive}
                    onChange={(checked) => setSeoSettings({
                      ...seoSettings,
                      robots: { ...seoSettings.robots, noarchive: checked },
                    })}
                  />
                  <Toggle
                    label="No snippet"
                    description="Prevent snippet in results"
                    checked={seoSettings.robots.nosnippet}
                    onChange={(checked) => setSeoSettings({
                      ...seoSettings,
                      robots: { ...seoSettings.robots, nosnippet: checked },
                    })}
                  />
                </div>

                <FormRow>
                  <FormField label="Max Snippet Length">
                    <Select
                      value={seoSettings.robots.maxSnippet.toString()}
                      onChange={(value) => setSeoSettings({
                        ...seoSettings,
                        robots: { ...seoSettings.robots, maxSnippet: parseInt(value) },
                      })}
                      options={[
                        { value: '-1', label: 'No limit' },
                        { value: '0', label: 'No snippet' },
                        { value: '50', label: '50 characters' },
                        { value: '100', label: '100 characters' },
                        { value: '160', label: '160 characters' },
                        { value: '320', label: '320 characters' },
                      ]}
                    />
                  </FormField>
                  <FormField label="Max Image Preview">
                    <Select
                      value={seoSettings.robots.maxImagePreview}
                      onChange={(value) => setSeoSettings({
                        ...seoSettings,
                        robots: { ...seoSettings.robots, maxImagePreview: value as 'none' | 'standard' | 'large' },
                      })}
                      options={[
                        { value: 'none', label: 'None' },
                        { value: 'standard', label: 'Standard' },
                        { value: 'large', label: 'Large' },
                      ]}
                    />
                  </FormField>
                </FormRow>
              </div>
            </ModalSection>

            {/* Redirect */}
            <ModalSection title="Redirect" icon={ArrowRight}>
              <div className="space-y-3">
                <FormRow>
                  <FormField label="Redirect URL">
                    <Input
                      value={seoSettings.redirectUrl}
                      onChange={(e) => setSeoSettings({ ...seoSettings, redirectUrl: e.target.value })}
                      placeholder="https://example.com/new-url"
                    />
                  </FormField>
                  <FormField label="Redirect Type">
                    <Select
                      value={seoSettings.redirectType}
                      onChange={(value) => setSeoSettings({ ...seoSettings, redirectType: value as '301' | '302' | '307' | '410' })}
                      options={[
                        { value: '301', label: '301 Permanent' },
                        { value: '302', label: '302 Temporary' },
                        { value: '307', label: '307 Temporary' },
                        { value: '410', label: '410 Gone' },
                      ]}
                    />
                  </FormField>
                </FormRow>
                <InfoBox variant="warning">
                  Setting a redirect will prevent this post from being displayed. Visitors will be redirected to the specified URL.
                </InfoBox>
              </div>
            </ModalSection>
          </div>
        );

      case 'social':
        return (
          <div className="space-y-6">
            {/* Facebook / Open Graph */}
            <ModalSection title="Facebook / Open Graph" icon={Facebook} defaultOpen>
              <div className="space-y-4">
                <FormField label="Title" description="Leave empty to use SEO title">
                  <Input
                    value={socialSettings.facebook.title}
                    onChange={(e) => setSocialSettings({
                      ...socialSettings,
                      facebook: { ...socialSettings.facebook, title: e.target.value },
                    })}
                    placeholder={seoSettings.metaTitle}
                  />
                </FormField>

                <FormField label="Description" description="Leave empty to use SEO description">
                  <Textarea
                    value={socialSettings.facebook.description}
                    onChange={(e) => setSocialSettings({
                      ...socialSettings,
                      facebook: { ...socialSettings.facebook, description: e.target.value },
                    })}
                    placeholder={seoSettings.metaDescription}
                    rows={2}
                  />
                </FormField>

                <FormField label="Image">
                  <div className="flex gap-2">
                    <Input
                      value={socialSettings.facebook.image}
                      onChange={(e) => setSocialSettings({
                        ...socialSettings,
                        facebook: { ...socialSettings.facebook, image: e.target.value },
                      })}
                      placeholder="Select or enter image URL..."
                      className="flex-1"
                    />
                    <button className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors">
                      <Image className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Recommended: 1200 x 630 pixels</p>
                </FormField>

                <FormField label="Content Type">
                  <Select
                    value={socialSettings.facebook.type}
                    onChange={(value) => setSocialSettings({
                      ...socialSettings,
                      facebook: { ...socialSettings.facebook, type: value as any },
                    })}
                    options={[
                      { value: 'article', label: 'Article' },
                      { value: 'website', label: 'Website' },
                      { value: 'product', label: 'Product' },
                      { value: 'video', label: 'Video' },
                    ]}
                  />
                </FormField>

                {/* Facebook Preview */}
                <div className="bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden">
                  <p className="text-xs text-slate-500 p-3 border-b border-slate-700">Facebook Preview</p>
                  <div className="p-3">
                    <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-600">
                      <div className="h-40 bg-slate-700 flex items-center justify-center">
                        {socialSettings.facebook.image ? (
                          <img src={socialSettings.facebook.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Image className="w-12 h-12 text-slate-500" />
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-slate-500 uppercase">example.com</p>
                        <p className="text-white font-medium text-sm mt-1 line-clamp-2">
                          {socialSettings.facebook.title || seoSettings.metaTitle || 'Post Title'}
                        </p>
                        <p className="text-slate-400 text-xs mt-1 line-clamp-2">
                          {socialSettings.facebook.description || seoSettings.metaDescription || 'Description...'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ModalSection>

            {/* Twitter / X */}
            <ModalSection title="Twitter / X" icon={Twitter} defaultOpen>
              <div className="space-y-4">
                <FormField label="Card Type">
                  <Select
                    value={socialSettings.twitter.cardType}
                    onChange={(value) => setSocialSettings({
                      ...socialSettings,
                      twitter: { ...socialSettings.twitter, cardType: value as any },
                    })}
                    options={[
                      { value: 'summary', label: 'Summary' },
                      { value: 'summary_large_image', label: 'Summary with Large Image' },
                      { value: 'player', label: 'Player (Video/Audio)' },
                      { value: 'app', label: 'App' },
                    ]}
                  />
                </FormField>

                <FormField label="Title" description="Leave empty to use Facebook title">
                  <Input
                    value={socialSettings.twitter.title}
                    onChange={(e) => setSocialSettings({
                      ...socialSettings,
                      twitter: { ...socialSettings.twitter, title: e.target.value },
                    })}
                    placeholder={socialSettings.facebook.title || seoSettings.metaTitle}
                  />
                </FormField>

                <FormField label="Description">
                  <Textarea
                    value={socialSettings.twitter.description}
                    onChange={(e) => setSocialSettings({
                      ...socialSettings,
                      twitter: { ...socialSettings.twitter, description: e.target.value },
                    })}
                    rows={2}
                  />
                </FormField>

                <FormField label="Creator Handle">
                  <Input
                    value={socialSettings.twitter.creator}
                    onChange={(e) => setSocialSettings({
                      ...socialSettings,
                      twitter: { ...socialSettings.twitter, creator: e.target.value },
                    })}
                    placeholder="@username"
                  />
                </FormField>

                {/* Twitter Preview */}
                <div className="bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden">
                  <p className="text-xs text-slate-500 p-3 border-b border-slate-700">Twitter Preview</p>
                  <div className="p-3">
                    <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-600">
                      {socialSettings.twitter.cardType === 'summary_large_image' && (
                        <div className="h-48 bg-slate-700 flex items-center justify-center">
                          {socialSettings.twitter.image || socialSettings.facebook.image ? (
                            <img
                              src={socialSettings.twitter.image || socialSettings.facebook.image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Image className="w-12 h-12 text-slate-500" />
                          )}
                        </div>
                      )}
                      <div className="p-3">
                        <p className="text-white font-medium text-sm line-clamp-2">
                          {socialSettings.twitter.title || socialSettings.facebook.title || seoSettings.metaTitle || 'Post Title'}
                        </p>
                        <p className="text-slate-400 text-xs mt-1 line-clamp-2">
                          {socialSettings.twitter.description || socialSettings.facebook.description || seoSettings.metaDescription || 'Description...'}
                        </p>
                        <p className="text-slate-500 text-xs mt-2 flex items-center gap-1">
                          <Link2 className="w-3 h-3" />
                          example.com
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ModalSection>

            {/* LinkedIn */}
            <ModalSection title="LinkedIn" icon={Linkedin}>
              <div className="space-y-4">
                <FormField label="Title" description="Leave empty to use Facebook title">
                  <Input
                    value={socialSettings.linkedin.title}
                    onChange={(e) => setSocialSettings({
                      ...socialSettings,
                      linkedin: { ...socialSettings.linkedin, title: e.target.value },
                    })}
                  />
                </FormField>

                <FormField label="Description">
                  <Textarea
                    value={socialSettings.linkedin.description}
                    onChange={(e) => setSocialSettings({
                      ...socialSettings,
                      linkedin: { ...socialSettings.linkedin, description: e.target.value },
                    })}
                    rows={2}
                  />
                </FormField>

                <FormField label="Image">
                  <div className="flex gap-2">
                    <Input
                      value={socialSettings.linkedin.image}
                      onChange={(e) => setSocialSettings({
                        ...socialSettings,
                        linkedin: { ...socialSettings.linkedin, image: e.target.value },
                      })}
                      className="flex-1"
                    />
                    <button className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors">
                      <Image className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Recommended: 1200 x 627 pixels</p>
                </FormField>
              </div>
            </ModalSection>

            {/* Pinterest */}
            <ModalSection title="Pinterest" icon={Share2}>
              <div className="space-y-4">
                <Toggle
                  label="Enable Rich Pins"
                  description="Include additional metadata for Pinterest"
                  checked={socialSettings.pinterest.richPin}
                  onChange={(checked) => setSocialSettings({
                    ...socialSettings,
                    pinterest: { ...socialSettings.pinterest, richPin: checked },
                  })}
                />

                <FormField label="Pin Description">
                  <Textarea
                    value={socialSettings.pinterest.description}
                    onChange={(e) => setSocialSettings({
                      ...socialSettings,
                      pinterest: { ...socialSettings.pinterest, description: e.target.value },
                    })}
                    rows={3}
                    placeholder="Describe this pin..."
                  />
                </FormField>
              </div>
            </ModalSection>
          </div>
        );

      case 'custom-fields':
        return (
          <div className="space-y-6">
            <InfoBox variant="info">
              Custom fields allow you to add additional metadata to your post that can be used by themes and plugins.
            </InfoBox>

            {/* Custom Fields List */}
            <div className="space-y-3">
              {customFields.map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-800/50 rounded-lg border border-slate-700 p-4"
                >
                  <div className="flex items-start gap-3">
                    <button className="mt-2 text-slate-500 hover:text-slate-300 cursor-grab">
                      <GripVertical className="w-4 h-4" />
                    </button>

                    <div className="flex-1 space-y-3">
                      <FormRow>
                        <FormField label="Key">
                          <Input
                            value={field.key}
                            onChange={(e) => updateCustomField(field.id, { key: e.target.value })}
                            placeholder="field_name"
                          />
                        </FormField>
                        <FormField label="Type">
                          <Select
                            value={field.type}
                            onChange={(value) => updateCustomField(field.id, { type: value as CustomField['type'] })}
                            options={[
                              { value: 'text', label: 'Text' },
                              { value: 'textarea', label: 'Textarea' },
                              { value: 'number', label: 'Number' },
                              { value: 'date', label: 'Date' },
                              { value: 'url', label: 'URL' },
                              { value: 'email', label: 'Email' },
                              { value: 'select', label: 'Select' },
                              { value: 'checkbox', label: 'Checkbox' },
                            ]}
                          />
                        </FormField>
                      </FormRow>

                      <FormField label="Value">
                        {field.type === 'textarea' ? (
                          <Textarea
                            value={field.value}
                            onChange={(e) => updateCustomField(field.id, { value: e.target.value })}
                            rows={2}
                          />
                        ) : field.type === 'select' ? (
                          <Select
                            value={field.value}
                            onChange={(value) => updateCustomField(field.id, { value })}
                            options={(field.options || []).map(opt => ({ value: opt, label: opt }))}
                          />
                        ) : field.type === 'checkbox' ? (
                          <Toggle
                            checked={field.value === 'true'}
                            onChange={(checked) => updateCustomField(field.id, { value: checked.toString() })}
                          />
                        ) : (
                          <Input
                            type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'}
                            value={field.value}
                            onChange={(e) => updateCustomField(field.id, { value: e.target.value })}
                          />
                        )}
                      </FormField>

                      {field.type === 'select' && (
                        <FormField label="Options (comma-separated)">
                          <Input
                            value={(field.options || []).join(', ')}
                            onChange={(e) => updateCustomField(field.id, { options: e.target.value.split(',').map(s => s.trim()) })}
                            placeholder="option1, option2, option3"
                          />
                        </FormField>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateCustomField(field.id, { isVisible: !field.isVisible })}
                        className={clsx(
                          'p-2 rounded transition-colors',
                          field.isVisible ? 'text-green-400 hover:bg-green-500/10' : 'text-slate-500 hover:bg-slate-700'
                        )}
                        title={field.isVisible ? 'Visible' : 'Hidden'}
                      >
                        {field.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => removeCustomField(field.id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        title="Remove field"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Add Field Button */}
            <button
              onClick={addCustomField}
              className="w-full py-3 border-2 border-dashed border-slate-700 hover:border-purple-500/50 rounded-lg text-slate-400 hover:text-purple-400 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Custom Field
            </button>

            {/* Field Templates */}
            <ModalSection title="Field Templates" icon={Layers}>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'subtitle', type: 'text', label: 'Subtitle' },
                  { key: 'reading_time', type: 'number', label: 'Reading Time' },
                  { key: 'source_url', type: 'url', label: 'Source URL' },
                  { key: 'custom_css', type: 'textarea', label: 'Custom CSS' },
                  { key: 'featured', type: 'checkbox', label: 'Featured Post' },
                  { key: 'expiry_date', type: 'date', label: 'Expiry Date' },
                ].map((template) => (
                  <button
                    key={template.key}
                    onClick={() => {
                      const newField: CustomField = {
                        id: Date.now().toString(),
                        key: template.key,
                        value: '',
                        type: template.type as CustomField['type'],
                        isVisible: true,
                      };
                      setCustomFields([...customFields, newField]);
                    }}
                    className="p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg border border-slate-700 text-left transition-colors"
                  >
                    <p className="text-sm text-white">{template.label}</p>
                    <p className="text-xs text-slate-500">{template.key} ({template.type})</p>
                  </button>
                ))}
              </div>
            </ModalSection>
          </div>
        );

      case 'format':
        return (
          <div className="space-y-6">
            <InfoBox variant="info">
              Post formats change how the content is displayed based on the theme. Not all themes support all formats.
            </InfoBox>

            <div className="grid grid-cols-2 gap-3">
              {postFormats.map((format) => {
                const Icon = format.icon;
                const isSelected = postFormat === format.id;

                return (
                  <button
                    key={format.id}
                    onClick={() => setPostFormat(format.id)}
                    className={clsx(
                      'p-4 rounded-lg border text-left transition-all',
                      isSelected
                        ? 'bg-purple-500/20 border-purple-500 ring-1 ring-purple-500'
                        : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                    )}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={clsx(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        isSelected ? 'bg-purple-500/30 text-purple-400' : 'bg-slate-700 text-slate-400'
                      )}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{format.label}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">{format.description}</p>
                  </button>
                );
              })}
            </div>

            {/* Format-specific options */}
            {postFormat === 'gallery' && (
              <ModalSection title="Gallery Options" icon={Grid} defaultOpen>
                <div className="space-y-4">
                  <FormField label="Gallery Layout">
                    <Select
                      value="grid"
                      onChange={() => {}}
                      options={[
                        { value: 'grid', label: 'Grid' },
                        { value: 'masonry', label: 'Masonry' },
                        { value: 'carousel', label: 'Carousel' },
                        { value: 'slideshow', label: 'Slideshow' },
                      ]}
                    />
                  </FormField>
                  <FormField label="Columns">
                    <Select
                      value="3"
                      onChange={() => {}}
                      options={[
                        { value: '2', label: '2 Columns' },
                        { value: '3', label: '3 Columns' },
                        { value: '4', label: '4 Columns' },
                        { value: '5', label: '5 Columns' },
                      ]}
                    />
                  </FormField>
                </div>
              </ModalSection>
            )}

            {postFormat === 'video' && (
              <ModalSection title="Video Options" icon={Layout} defaultOpen>
                <div className="space-y-4">
                  <FormField label="Video URL">
                    <Input placeholder="https://youtube.com/watch?v=..." />
                  </FormField>
                  <Toggle
                    label="Autoplay"
                    description="Start playing automatically (muted)"
                    checked={false}
                    onChange={() => {}}
                  />
                </div>
              </ModalSection>
            )}

            {postFormat === 'quote' && (
              <ModalSection title="Quote Options" icon={Type} defaultOpen>
                <div className="space-y-4">
                  <FormField label="Quote Text">
                    <Textarea placeholder="Enter the quote..." rows={3} />
                  </FormField>
                  <FormField label="Citation">
                    <Input placeholder="Author name" />
                  </FormField>
                  <FormField label="Source">
                    <Input placeholder="Book, article, or URL" />
                  </FormField>
                </div>
              </ModalSection>
            )}

            {postFormat === 'link' && (
              <ModalSection title="Link Options" icon={Link2} defaultOpen>
                <div className="space-y-4">
                  <FormField label="Link URL">
                    <Input placeholder="https://example.com" />
                  </FormField>
                  <FormField label="Link Text">
                    <Input placeholder="Click here to read more" />
                  </FormField>
                  <Toggle
                    label="Open in new tab"
                    checked={true}
                    onChange={() => {}}
                  />
                </div>
              </ModalSection>
            )}
          </div>
        );

      case 'template':
        return (
          <div className="space-y-6">
            {/* Template Selection */}
            <ModalSection title="Page Template" icon={Layout} defaultOpen>
              <div className="grid grid-cols-2 gap-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setTemplateSettings({ ...templateSettings, template: template.id })}
                    className={clsx(
                      'p-4 rounded-lg border text-left transition-all',
                      templateSettings.template === template.id
                        ? 'bg-purple-500/20 border-purple-500 ring-1 ring-purple-500'
                        : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                    )}
                  >
                    <div className="w-full h-20 bg-slate-900/50 rounded mb-3 flex items-center justify-center">
                      <Layout className="w-8 h-8 text-slate-600" />
                    </div>
                    <p className="text-sm font-medium text-white">{template.label}</p>
                    <p className="text-xs text-slate-500 mt-1">{template.description}</p>
                  </button>
                ))}
              </div>
            </ModalSection>

            {/* Layout Options */}
            <ModalSection title="Layout Options" icon={Layers} defaultOpen>
              <div className="space-y-4">
                <FormField label="Content Layout">
                  <Select
                    value={templateSettings.layout}
                    onChange={(value) => setTemplateSettings({ ...templateSettings, layout: value as any })}
                    options={[
                      { value: 'default', label: 'Default' },
                      { value: 'full-width', label: 'Full Width' },
                      { value: 'sidebar-left', label: 'Sidebar Left' },
                      { value: 'sidebar-right', label: 'Sidebar Right' },
                      { value: 'no-sidebar', label: 'No Sidebar' },
                    ]}
                  />
                </FormField>

                <FormRow>
                  <FormField label="Header Style">
                    <Select
                      value={templateSettings.headerStyle}
                      onChange={(value) => setTemplateSettings({ ...templateSettings, headerStyle: value as any })}
                      options={[
                        { value: 'default', label: 'Default' },
                        { value: 'transparent', label: 'Transparent' },
                        { value: 'minimal', label: 'Minimal' },
                        { value: 'hero', label: 'Hero' },
                      ]}
                    />
                  </FormField>
                  <FormField label="Footer Style">
                    <Select
                      value={templateSettings.footerStyle}
                      onChange={(value) => setTemplateSettings({ ...templateSettings, footerStyle: value as any })}
                      options={[
                        { value: 'default', label: 'Default' },
                        { value: 'minimal', label: 'Minimal' },
                        { value: 'expanded', label: 'Expanded' },
                        { value: 'hidden', label: 'Hidden' },
                      ]}
                    />
                  </FormField>
                </FormRow>
              </div>
            </ModalSection>

            {/* Custom Styling */}
            <ModalSection title="Custom Styling" icon={Code}>
              <div className="space-y-4">
                <FormField label="Custom CSS Classes" description="Space-separated class names">
                  <Input
                    value={templateSettings.customClasses}
                    onChange={(e) => setTemplateSettings({ ...templateSettings, customClasses: e.target.value })}
                    placeholder="my-custom-class another-class"
                  />
                </FormField>

                <FormField label="Custom CSS" description="Scoped to this post only">
                  <Textarea
                    value={templateSettings.customCSS}
                    onChange={(e) => setTemplateSettings({ ...templateSettings, customCSS: e.target.value })}
                    placeholder=".post-content { /* styles */ }"
                    rows={6}
                    className="font-mono text-sm"
                  />
                </FormField>
              </div>
            </ModalSection>
          </div>
        );

      case 'attributes':
        return (
          <div className="space-y-6">
            {/* Page Hierarchy */}
            <ModalSection title="Page Hierarchy" icon={Folder} defaultOpen>
              <div className="space-y-4">
                <FormField label="Parent Page" description="Set a parent to create a hierarchy">
                  <Select
                    value={attributeSettings.parentPage}
                    onChange={(value) => setAttributeSettings({ ...attributeSettings, parentPage: value })}
                    options={[
                      { value: '', label: '(no parent)' },
                      { value: 'about', label: 'About' },
                      { value: 'services', label: 'Services' },
                      { value: 'blog', label: 'Blog' },
                      { value: 'contact', label: 'Contact' },
                    ]}
                  />
                </FormField>

                <FormRow>
                  <FormField label="Order" description="Pages are sorted by order">
                    <Input
                      type="number"
                      value={attributeSettings.order}
                      onChange={(e) => setAttributeSettings({ ...attributeSettings, order: parseInt(e.target.value) || 0 })}
                    />
                  </FormField>
                  <FormField label="Menu Order">
                    <Input
                      type="number"
                      value={attributeSettings.menuOrder}
                      onChange={(e) => setAttributeSettings({ ...attributeSettings, menuOrder: parseInt(e.target.value) || 0 })}
                    />
                  </FormField>
                </FormRow>
              </div>
            </ModalSection>

            {/* Page Type */}
            <ModalSection title="Content Type" icon={FileText} defaultOpen>
              <div className="space-y-4">
                <FormField label="Page Type">
                  <Select
                    value={attributeSettings.pageType}
                    onChange={(value) => setAttributeSettings({ ...attributeSettings, pageType: value as any })}
                    options={[
                      { value: 'page', label: 'Standard Page' },
                      { value: 'landing', label: 'Landing Page' },
                      { value: 'article', label: 'Article' },
                      { value: 'product', label: 'Product' },
                      { value: 'portfolio', label: 'Portfolio Item' },
                    ]}
                  />
                </FormField>
              </div>
            </ModalSection>

            {/* Permissions */}
            <ModalSection title="Permissions" icon={Settings}>
              <div className="space-y-4">
                <FormField label="View Access">
                  <div className="flex flex-wrap gap-2">
                    {['public', 'subscriber', 'contributor', 'author', 'editor', 'admin'].map((role) => (
                      <button
                        key={role}
                        onClick={() => {
                          const current = attributeSettings.customPermissions.viewRole;
                          const updated = current.includes(role)
                            ? current.filter(r => r !== role)
                            : [...current, role];
                          setAttributeSettings({
                            ...attributeSettings,
                            customPermissions: { ...attributeSettings.customPermissions, viewRole: updated },
                          });
                        }}
                        className={clsx(
                          'px-3 py-1.5 rounded-lg text-sm border transition-colors capitalize',
                          attributeSettings.customPermissions.viewRole.includes(role)
                            ? 'bg-green-500/20 border-green-500 text-green-400'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                        )}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </FormField>

                <FormField label="Edit Access">
                  <div className="flex flex-wrap gap-2">
                    {['contributor', 'author', 'editor', 'admin'].map((role) => (
                      <button
                        key={role}
                        onClick={() => {
                          const current = attributeSettings.customPermissions.editRole;
                          const updated = current.includes(role)
                            ? current.filter(r => r !== role)
                            : [...current, role];
                          setAttributeSettings({
                            ...attributeSettings,
                            customPermissions: { ...attributeSettings.customPermissions, editRole: updated },
                          });
                        }}
                        className={clsx(
                          'px-3 py-1.5 rounded-lg text-sm border transition-colors capitalize',
                          attributeSettings.customPermissions.editRole.includes(role)
                            ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                        )}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </FormField>

                <FormField label="Delete Access">
                  <div className="flex flex-wrap gap-2">
                    {['editor', 'admin'].map((role) => (
                      <button
                        key={role}
                        onClick={() => {
                          const current = attributeSettings.customPermissions.deleteRole;
                          const updated = current.includes(role)
                            ? current.filter(r => r !== role)
                            : [...current, role];
                          setAttributeSettings({
                            ...attributeSettings,
                            customPermissions: { ...attributeSettings.customPermissions, deleteRole: updated },
                          });
                        }}
                        className={clsx(
                          'px-3 py-1.5 rounded-lg text-sm border transition-colors capitalize',
                          attributeSettings.customPermissions.deleteRole.includes(role)
                            ? 'bg-red-500/20 border-red-500 text-red-400'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                        )}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </FormField>
              </div>
            </ModalSection>
          </div>
        );

      case 'related':
        return (
          <div className="space-y-6">
            {/* Related Posts Method */}
            <div className="flex gap-2 p-1 bg-slate-800/50 rounded-lg">
              <button
                onClick={() => setRelatedPostsMethod('auto')}
                className={clsx(
                  'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors',
                  relatedPostsMethod === 'auto'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                <Sparkles className="w-4 h-4 inline mr-2" />
                Auto-Detect
              </button>
              <button
                onClick={() => setRelatedPostsMethod('manual')}
                className={clsx(
                  'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors',
                  relatedPostsMethod === 'manual'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                <Edit3 className="w-4 h-4 inline mr-2" />
                Manual Selection
              </button>
            </div>

            {relatedPostsMethod === 'auto' && (
              <ModalSection title="Auto-Detection Settings" icon={Settings} defaultOpen>
                <div className="space-y-4">
                  <FormField label="Match Criteria">
                    <div className="space-y-2">
                      {['Categories', 'Tags', 'Keywords', 'Content similarity', 'Author'].map((criteria) => (
                        <Toggle
                          key={criteria}
                          label={criteria}
                          checked={true}
                          onChange={() => {}}
                        />
                      ))}
                    </div>
                  </FormField>

                  <FormRow>
                    <FormField label="Number of Posts">
                      <Select
                        value="3"
                        onChange={() => {}}
                        options={[
                          { value: '2', label: '2 posts' },
                          { value: '3', label: '3 posts' },
                          { value: '4', label: '4 posts' },
                          { value: '6', label: '6 posts' },
                        ]}
                      />
                    </FormField>
                    <FormField label="Minimum Score">
                      <Select
                        value="50"
                        onChange={() => {}}
                        options={[
                          { value: '25', label: '25%' },
                          { value: '50', label: '50%' },
                          { value: '75', label: '75%' },
                        ]}
                      />
                    </FormField>
                  </FormRow>

                  <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm transition-colors">
                    <RefreshCw className="w-4 h-4" />
                    Refresh Suggestions
                  </button>
                </div>
              </ModalSection>
            )}

            {/* Related Posts List */}
            <ModalSection title="Related Posts" icon={Link2} defaultOpen>
              <div className="space-y-3">
                {relatedPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700"
                  >
                    {relatedPostsMethod === 'manual' && (
                      <button className="text-slate-500 hover:text-slate-300 cursor-grab">
                        <GripVertical className="w-4 h-4" />
                      </button>
                    )}

                    <div className="w-16 h-12 bg-slate-700 rounded flex-shrink-0 flex items-center justify-center">
                      {post.thumbnail ? (
                        <img src={post.thumbnail} alt="" className="w-full h-full object-cover rounded" />
                      ) : (
                        <Image className="w-5 h-5 text-slate-500" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{post.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500">{post.category}</span>
                        <span className="text-xs text-slate-600">•</span>
                        <span className="text-xs text-slate-500">{post.date}</span>
                      </div>
                    </div>

                    {relatedPostsMethod === 'auto' && (
                      <div className="flex items-center gap-2">
                        <div className={clsx(
                          'px-2 py-1 rounded text-xs font-medium',
                          post.relevanceScore >= 80 ? 'bg-green-500/20 text-green-400' :
                          post.relevanceScore >= 50 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        )}>
                          {post.relevanceScore}%
                        </div>
                      </div>
                    )}

                    <button className="p-1.5 text-slate-500 hover:text-red-400 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}

                {relatedPostsMethod === 'manual' && (
                  <button className="w-full py-3 border-2 border-dashed border-slate-700 hover:border-purple-500/50 rounded-lg text-slate-400 hover:text-purple-400 transition-colors flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Related Post
                  </button>
                )}
              </div>
            </ModalSection>

            {/* Display Options */}
            <ModalSection title="Display Options" icon={Layout}>
              <div className="space-y-4">
                <FormField label="Display Style">
                  <Select
                    value="cards"
                    onChange={() => {}}
                    options={[
                      { value: 'cards', label: 'Cards' },
                      { value: 'list', label: 'List' },
                      { value: 'thumbnails', label: 'Thumbnails' },
                      { value: 'minimal', label: 'Minimal (titles only)' },
                    ]}
                  />
                </FormField>

                <Toggle
                  label="Show thumbnails"
                  checked={true}
                  onChange={() => {}}
                />

                <Toggle
                  label="Show excerpts"
                  checked={true}
                  onChange={() => {}}
                />

                <Toggle
                  label="Show dates"
                  checked={true}
                  onChange={() => {}}
                />
              </div>
            </ModalSection>
          </div>
        );

      case 'series':
        return (
          <div className="space-y-6">
            <Toggle
              label="Include in a Series"
              description="Group this post with related posts in a series"
              checked={seriesSettings.enabled}
              onChange={(checked) => setSeriesSettings({ ...seriesSettings, enabled: checked })}
            />

            {seriesSettings.enabled && (
              <>
                {/* Series Selection */}
                <ModalSection title="Select Series" icon={BookOpen} defaultOpen>
                  <div className="space-y-3">
                    {availableSeries.map((series) => (
                      <button
                        key={series.id}
                        onClick={() => setSeriesSettings({ ...seriesSettings, selectedSeries: series.id })}
                        className={clsx(
                          'w-full p-4 rounded-lg border text-left transition-all',
                          seriesSettings.selectedSeries === series.id
                            ? 'bg-purple-500/20 border-purple-500'
                            : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-white">{series.name}</p>
                            <p className="text-xs text-slate-400 mt-1">{series.description}</p>
                          </div>
                          <Badge variant="secondary">{series.postCount} posts</Badge>
                        </div>
                      </button>
                    ))}

                    <button className="w-full py-3 border-2 border-dashed border-slate-700 hover:border-purple-500/50 rounded-lg text-slate-400 hover:text-purple-400 transition-colors flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" />
                      Create New Series
                    </button>
                  </div>
                </ModalSection>

                {/* Position in Series */}
                {seriesSettings.selectedSeries && (
                  <ModalSection title="Position in Series" icon={List} defaultOpen>
                    <div className="space-y-4">
                      <FormField label="Part Number">
                        <Input
                          type="number"
                          min={1}
                          value={seriesSettings.position}
                          onChange={(e) => setSeriesSettings({ ...seriesSettings, position: parseInt(e.target.value) || 1 })}
                        />
                      </FormField>

                      {/* Series Navigation Preview */}
                      <div className="bg-slate-900/50 rounded-lg border border-slate-700 p-4">
                        <p className="text-xs text-slate-500 mb-3">Series Navigation Preview</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">← Part 1: Introduction</span>
                          </div>
                          <div className="flex items-center justify-between text-sm bg-purple-500/20 rounded p-2">
                            <span className="text-purple-400 font-medium">Part 2: This Post (Current)</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Part 3: Advanced Topics →</span>
                          </div>
                        </div>
                      </div>

                      <Toggle
                        label="Show series navigation"
                        description="Display prev/next links in series"
                        checked={true}
                        onChange={() => {}}
                      />

                      <Toggle
                        label="Show series table of contents"
                        description="Display full series list"
                        checked={true}
                        onChange={() => {}}
                      />
                    </div>
                  </ModalSection>
                )}
              </>
            )}
          </div>
        );

      case 'location':
        return (
          <div className="space-y-6">
            <Toggle
              label="Enable Location"
              description="Add geographic information to this post"
              checked={locationSettings.enabled}
              onChange={(checked) => setLocationSettings({ ...locationSettings, enabled: checked })}
            />

            {locationSettings.enabled && (
              <>
                {/* Address */}
                <ModalSection title="Address" icon={MapPin} defaultOpen>
                  <div className="space-y-4">
                    <FormField label="Street Address">
                      <Input
                        value={locationSettings.address}
                        onChange={(e) => setLocationSettings({ ...locationSettings, address: e.target.value })}
                        placeholder="123 Main Street"
                      />
                    </FormField>

                    <FormRow>
                      <FormField label="City">
                        <Input
                          value={locationSettings.city}
                          onChange={(e) => setLocationSettings({ ...locationSettings, city: e.target.value })}
                        />
                      </FormField>
                      <FormField label="State/Province">
                        <Input
                          value={locationSettings.state}
                          onChange={(e) => setLocationSettings({ ...locationSettings, state: e.target.value })}
                        />
                      </FormField>
                    </FormRow>

                    <FormRow>
                      <FormField label="Country">
                        <Input
                          value={locationSettings.country}
                          onChange={(e) => setLocationSettings({ ...locationSettings, country: e.target.value })}
                        />
                      </FormField>
                      <FormField label="Postal Code">
                        <Input
                          value={locationSettings.postalCode}
                          onChange={(e) => setLocationSettings({ ...locationSettings, postalCode: e.target.value })}
                        />
                      </FormField>
                    </FormRow>

                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm transition-colors">
                      <Navigation className="w-4 h-4" />
                      Geocode Address
                    </button>
                  </div>
                </ModalSection>

                {/* Coordinates */}
                <ModalSection title="Coordinates" icon={Globe}>
                  <div className="space-y-4">
                    <FormRow>
                      <FormField label="Latitude">
                        <Input
                          type="number"
                          step="any"
                          value={locationSettings.coordinates.lat}
                          onChange={(e) => setLocationSettings({
                            ...locationSettings,
                            coordinates: { ...locationSettings.coordinates, lat: parseFloat(e.target.value) || 0 },
                          })}
                        />
                      </FormField>
                      <FormField label="Longitude">
                        <Input
                          type="number"
                          step="any"
                          value={locationSettings.coordinates.lng}
                          onChange={(e) => setLocationSettings({
                            ...locationSettings,
                            coordinates: { ...locationSettings.coordinates, lng: parseFloat(e.target.value) || 0 },
                          })}
                        />
                      </FormField>
                    </FormRow>

                    <FormField label="Map Zoom Level">
                      <input
                        type="range"
                        min={1}
                        max={20}
                        value={locationSettings.mapZoom}
                        onChange={(e) => setLocationSettings({ ...locationSettings, mapZoom: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>World</span>
                        <span>{locationSettings.mapZoom}</span>
                        <span>Street</span>
                      </div>
                    </FormField>

                    <Toggle
                      label="Show map on post"
                      checked={locationSettings.showMap}
                      onChange={(checked) => setLocationSettings({ ...locationSettings, showMap: checked })}
                    />

                    {/* Map Preview Placeholder */}
                    <div className="h-48 bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Map Preview</p>
                        <p className="text-xs text-slate-600">
                          {locationSettings.coordinates.lat.toFixed(4)}, {locationSettings.coordinates.lng.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  </div>
                </ModalSection>

                {/* Business Info */}
                <ModalSection title="Business Information" icon={Building}>
                  <div className="space-y-4">
                    <FormField label="Business Name">
                      <Input
                        value={locationSettings.businessInfo.name}
                        onChange={(e) => setLocationSettings({
                          ...locationSettings,
                          businessInfo: { ...locationSettings.businessInfo, name: e.target.value },
                        })}
                      />
                    </FormField>

                    <FormRow>
                      <FormField label="Phone">
                        <div className="relative">
                          <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                          <Input
                            value={locationSettings.businessInfo.phone}
                            onChange={(e) => setLocationSettings({
                              ...locationSettings,
                              businessInfo: { ...locationSettings.businessInfo, phone: e.target.value },
                            })}
                            className="pl-10"
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                      </FormField>
                      <FormField label="Email">
                        <div className="relative">
                          <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                          <Input
                            type="email"
                            value={locationSettings.businessInfo.email}
                            onChange={(e) => setLocationSettings({
                              ...locationSettings,
                              businessInfo: { ...locationSettings.businessInfo, email: e.target.value },
                            })}
                            className="pl-10"
                          />
                        </div>
                      </FormField>
                    </FormRow>

                    <FormField label="Website">
                      <Input
                        type="url"
                        value={locationSettings.businessInfo.website}
                        onChange={(e) => setLocationSettings({
                          ...locationSettings,
                          businessInfo: { ...locationSettings.businessInfo, website: e.target.value },
                        })}
                        placeholder="https://example.com"
                      />
                    </FormField>

                    <FormField label="Business Hours">
                      <Textarea
                        value={locationSettings.businessInfo.hours}
                        onChange={(e) => setLocationSettings({
                          ...locationSettings,
                          businessInfo: { ...locationSettings.businessInfo, hours: e.target.value },
                        })}
                        placeholder="Mon-Fri: 9am-5pm&#10;Sat: 10am-2pm&#10;Sun: Closed"
                        rows={3}
                      />
                    </FormField>
                  </div>
                </ModalSection>
              </>
            )}
          </div>
        );

      case 'language':
        return (
          <div className="space-y-6">
            {/* Primary Language */}
            <ModalSection title="Primary Language" icon={Globe} defaultOpen>
              <div className="space-y-4">
                <FormField label="Content Language">
                  <Select
                    value={languageSettings.primaryLanguage}
                    onChange={(value) => setLanguageSettings({ ...languageSettings, primaryLanguage: value })}
                    options={languages.map(lang => ({
                      value: lang.code,
                      label: `${lang.flag} ${lang.name}`,
                    }))}
                  />
                </FormField>

                <Toggle
                  label="Generate hreflang tags"
                  description="Add language annotations for SEO"
                  checked={languageSettings.hreflangTags}
                  onChange={(checked) => setLanguageSettings({ ...languageSettings, hreflangTags: checked })}
                />
              </div>
            </ModalSection>

            {/* Translations */}
            <ModalSection title="Translations" icon={Languages} defaultOpen>
              <div className="space-y-3">
                {languageSettings.translations.map((translation, index) => {
                  const lang = languages.find(l => l.code === translation.language);
                  return (
                    <div
                      key={translation.language}
                      className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700"
                    >
                      <span className="text-2xl">{lang?.flag}</span>
                      <div className="flex-1">
                        <p className="text-sm text-white">{lang?.name}</p>
                        <p className="text-xs text-slate-500">Post ID: {translation.postId}</p>
                      </div>
                      <Badge
                        variant={
                          translation.status === 'published' ? 'success' :
                          translation.status === 'draft' ? 'secondary' : 'warning'
                        }
                      >
                        {translation.status}
                      </Badge>
                      <button className="p-1.5 text-slate-500 hover:text-white transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-500 hover:text-red-400 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}

                <button className="w-full py-3 border-2 border-dashed border-slate-700 hover:border-purple-500/50 rounded-lg text-slate-400 hover:text-purple-400 transition-colors flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Translation
                </button>
              </div>
            </ModalSection>

            {/* Auto-Translation */}
            <ModalSection title="Auto-Translation" icon={Sparkles}>
              <div className="space-y-4">
                <Toggle
                  label="Enable auto-translation"
                  description="Automatically create translations using AI"
                  checked={languageSettings.autoTranslate}
                  onChange={(checked) => setLanguageSettings({ ...languageSettings, autoTranslate: checked })}
                />

                {languageSettings.autoTranslate && (
                  <>
                    <FormField label="Target Languages">
                      <div className="flex flex-wrap gap-2">
                        {languages.filter(l => l.code !== languageSettings.primaryLanguage).map((lang) => (
                          <button
                            key={lang.code}
                            className="px-3 py-1.5 rounded-lg text-sm border bg-slate-800 border-slate-700 text-slate-400 hover:border-purple-500 hover:text-purple-400 transition-colors"
                          >
                            {lang.flag} {lang.name}
                          </button>
                        ))}
                      </div>
                    </FormField>

                    <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm transition-colors">
                      <Sparkles className="w-4 h-4" />
                      Generate Translations
                    </button>

                    <InfoBox variant="info">
                      Auto-translation uses AI to create draft translations. Always review translations before publishing.
                    </InfoBox>
                  </>
                )}
              </div>
            </ModalSection>

            {/* Language Switcher Preview */}
            <ModalSection title="Language Switcher Preview" icon={Flag}>
              <div className="bg-slate-900/50 rounded-lg border border-slate-700 p-4">
                <p className="text-xs text-slate-500 mb-3">How language switcher will appear</p>
                <div className="flex items-center gap-2">
                  {[languageSettings.primaryLanguage, ...languageSettings.translations.map(t => t.language)].map((code) => {
                    const lang = languages.find(l => l.code === code);
                    return (
                      <button
                        key={code}
                        className={clsx(
                          'px-3 py-1.5 rounded-lg text-sm border transition-colors',
                          code === languageSettings.primaryLanguage
                            ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                        )}
                      >
                        {lang?.flag} {lang?.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </ModalSection>
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
      icon={Settings}
      iconColor="text-indigo-400"
      size={hideTabs ? 'lg' : 'xl'}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as MetadataTab)}
      hideTabs={hideTabs}
      showSearch
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search settings..."
      showHelp
      showReset
      showSave
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Info className="w-4 h-4" />
            <span>Changes are auto-saved</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors">
              Apply Settings
            </button>
          </div>
        </div>
      }
    >
      {renderContent()}
    </EditorModal>
  );
};

export default MetadataSEOModal;
