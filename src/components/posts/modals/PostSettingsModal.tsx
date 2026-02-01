/**
 * PostSettingsModal - Enterprise Post Settings Modal
 *
 * Comprehensive modal for Featured Image, Author & Info, Categories, Tags,
 * Visibility, Schedule, Excerpt, URL Slug, Discussion, and Revisions
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ImagePlus,
  User,
  Folder,
  Tag,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  FileText,
  Link,
  MessageSquare,
  History,
  Plus,
  X,
  Check,
  ChevronRight,
  ChevronDown,
  Search,
  Upload,
  Crop,
  Trash2,
  RotateCcw,
  Users,
  Shield,
  AlertCircle,
  Info,
  Star,
  Copy,
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
  Textarea,
  Badge,
  InfoBox,
} from './EditorModal';

interface PostSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (settings: PostSettings) => void;
  initialSettings?: Partial<PostSettings>;
  defaultTab?: 'featured' | 'author' | 'categories' | 'tags' | 'visibility' | 'schedule' | 'excerpt' | 'slug' | 'discussion' | 'revisions';
  initialTab?: 'featured' | 'author' | 'categories' | 'tags' | 'visibility' | 'schedule' | 'excerpt' | 'slug' | 'discussion' | 'revisions';
  hideTabs?: boolean;
}

// Tab titles and subtitles for single-tab mode
const settingsTabTitles: Record<string, { title: string; subtitle: string }> = {
  featured: { title: 'Featured Image', subtitle: 'Set the post thumbnail and social image' },
  author: { title: 'Author', subtitle: 'Set post author and co-authors' },
  categories: { title: 'Categories', subtitle: 'Organize posts into categories' },
  tags: { title: 'Tags', subtitle: 'Add tags for better discoverability' },
  visibility: { title: 'Visibility', subtitle: 'Control who can see this post' },
  schedule: { title: 'Schedule', subtitle: 'Set publish date and time' },
  excerpt: { title: 'Excerpt', subtitle: 'Write a custom post summary' },
  slug: { title: 'URL Slug', subtitle: 'Customize the post URL' },
  discussion: { title: 'Discussion', subtitle: 'Configure comments and feedback' },
  revisions: { title: 'Revisions', subtitle: 'View and restore previous versions' },
};

interface PostSettings {
  featuredImage: {
    id: string;
    url: string;
    alt: string;
    caption: string;
    focalPoint: { x: number; y: number };
  } | null;
  author: { id: string; name: string; avatar: string } | null;
  coAuthors: { id: string; name: string; avatar: string }[];
  categories: string[];
  tags: string[];
  visibility: 'public' | 'private' | 'password';
  password: string;
  publishDate: Date | null;
  publishTime: string;
  status: 'draft' | 'pending' | 'published' | 'scheduled';
  excerpt: string;
  slug: string;
  allowComments: boolean;
  allowPingbacks: boolean;
  commentStatus: 'open' | 'closed';
  pingStatus: 'open' | 'closed';
}

// Sample data
const sampleCategories = [
  { id: '1', name: 'Technology', slug: 'technology', count: 45, parent: null },
  { id: '2', name: 'Web Development', slug: 'web-development', count: 32, parent: '1' },
  { id: '3', name: 'React', slug: 'react', count: 18, parent: '2' },
  { id: '4', name: 'Design', slug: 'design', count: 28, parent: null },
  { id: '5', name: 'UI/UX', slug: 'ui-ux', count: 15, parent: '4' },
  { id: '6', name: 'Business', slug: 'business', count: 22, parent: null },
  { id: '7', name: 'Marketing', slug: 'marketing', count: 19, parent: '6' },
];

const sampleTags = [
  { id: '1', name: 'javascript', count: 120 },
  { id: '2', name: 'react', count: 85 },
  { id: '3', name: 'typescript', count: 62 },
  { id: '4', name: 'css', count: 54 },
  { id: '5', name: 'nodejs', count: 48 },
  { id: '6', name: 'nextjs', count: 35 },
  { id: '7', name: 'tailwind', count: 42 },
  { id: '8', name: 'api', count: 38 },
];

const sampleAuthors = [
  { id: '1', name: 'John Doe', email: 'john@example.com', avatar: '', role: 'Administrator' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', avatar: '', role: 'Editor' },
  { id: '3', name: 'Bob Wilson', email: 'bob@example.com', avatar: '', role: 'Author' },
];

const sampleRevisions = [
  { id: '1', date: '2024-01-15 14:30', author: 'John Doe', changes: 'Updated introduction' },
  { id: '2', date: '2024-01-15 12:15', author: 'John Doe', changes: 'Added new section' },
  { id: '3', date: '2024-01-14 16:45', author: 'Jane Smith', changes: 'Fixed typos' },
  { id: '4', date: '2024-01-14 10:20', author: 'John Doe', changes: 'Initial draft' },
];

export const PostSettingsModal: React.FC<PostSettingsModalProps> = ({
  isOpen,
  onClose,
  onApply,
  initialSettings = {},
  defaultTab = 'featured',
  initialTab,
  hideTabs = false,
}) => {
  const [activeTab, setActiveTab] = useState(initialTab || defaultTab);

  // Sync activeTab with initialTab prop changes (fixes single-tab mode)
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Get title and subtitle based on single-tab mode
  const currentTabInfo = settingsTabTitles[activeTab] || { title: 'Post Settings', subtitle: 'Featured image, author, categories, and more' };
  const modalTitle = hideTabs ? currentTabInfo.title : 'Post Settings';
  const modalSubtitle = hideTabs ? currentTabInfo.subtitle : 'Featured image, author, categories, and more';

  // Settings state
  const [settings, setSettings] = useState<PostSettings>({
    featuredImage: null,
    author: sampleAuthors[0],
    coAuthors: [],
    categories: [],
    tags: [],
    visibility: 'public',
    password: '',
    publishDate: null,
    publishTime: '',
    status: 'draft',
    excerpt: '',
    slug: '',
    allowComments: true,
    allowPingbacks: true,
    commentStatus: 'open',
    pingStatus: 'open',
    ...initialSettings,
  });

  // UI state
  const [categorySearch, setCategorySearch] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedRevision, setSelectedRevision] = useState<string | null>(null);
  const [focalPointMode, setFocalPointMode] = useState(false);

  const updateSettings = <K extends keyof PostSettings>(key: K, value: PostSettings[K]) => {
    setSettings(s => ({ ...s, [key]: value }));
  };

  const toggleCategory = (categoryId: string) => {
    const cats = settings.categories.includes(categoryId)
      ? settings.categories.filter(c => c !== categoryId)
      : [...settings.categories, categoryId];
    updateSettings('categories', cats);
  };

  const addTag = (tag: string) => {
    const normalized = tag.toLowerCase().trim();
    if (normalized && !settings.tags.includes(normalized)) {
      updateSettings('tags', [...settings.tags, normalized]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    updateSettings('tags', settings.tags.filter(t => t !== tag));
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const filteredCategories = useMemo(() => {
    if (!categorySearch) return sampleCategories;
    return sampleCategories.filter(c =>
      c.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categorySearch]);

  const suggestedTags = useMemo(() => {
    if (!tagInput) return sampleTags.slice(0, 6);
    return sampleTags.filter(t =>
      t.name.includes(tagInput.toLowerCase()) && !settings.tags.includes(t.name)
    );
  }, [tagInput, settings.tags]);

  const handleApply = () => {
    onApply(settings);
    onClose();
  };

  const tabs = [
    { id: 'featured', label: 'Featured Image', icon: ImagePlus },
    { id: 'author', label: 'Author & Info', icon: User },
    { id: 'categories', label: 'Categories', icon: Folder },
    { id: 'tags', label: 'Tags', icon: Tag },
    { id: 'visibility', label: 'Visibility', icon: Globe },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'excerpt', label: 'Excerpt', icon: FileText },
    { id: 'slug', label: 'URL Slug', icon: Link },
    { id: 'discussion', label: 'Discussion', icon: MessageSquare },
    { id: 'revisions', label: 'Revisions', icon: History },
  ];

  return (
    <EditorModal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      subtitle={modalSubtitle}
      icon={FileText}
      iconColor="pink"
      size={hideTabs ? 'lg' : 'xl'}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as typeof activeTab)}
      hideTabs={hideTabs}
      showSave
      saveLabel="Apply Changes"
      onSave={handleApply}
    >
      {/* Featured Image Tab */}
      {activeTab === 'featured' && (
        <div className="space-y-6">
          {/* Image Preview / Upload */}
          <div className={clsx(
            'relative aspect-video rounded-xl overflow-hidden border-2 border-dashed transition-colors',
            settings.featuredImage
              ? 'border-transparent'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer'
          )}>
            {settings.featuredImage ? (
              <>
                <img
                  src={settings.featuredImage.url || '/placeholder-image.jpg'}
                  alt={settings.featuredImage.alt}
                  className="w-full h-full object-cover"
                />

                {/* Focal Point Indicator */}
                {focalPointMode && (
                  <div
                    className="absolute w-6 h-6 border-2 border-white rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 cursor-move"
                    style={{
                      left: `${settings.featuredImage.focalPoint.x}%`,
                      top: `${settings.featuredImage.focalPoint.y}%`,
                    }}
                  >
                    <div className="absolute inset-1 bg-white rounded-full" />
                  </div>
                )}

                {/* Overlay controls */}
                <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button
                    onClick={() => setFocalPointMode(!focalPointMode)}
                    className={clsx(
                      'p-3 rounded-xl transition-colors',
                      focalPointMode ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <Crop className="w-5 h-5" />
                  </button>
                  <button className="p-3 bg-white text-gray-700 rounded-xl hover:bg-gray-100 transition-colors">
                    <Upload className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => updateSettings('featuredImage', null)}
                    className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                <Upload className="w-12 h-12 mb-3" />
                <span className="text-lg font-medium">Click to upload</span>
                <span className="text-sm mt-1">or drag and drop</span>
                <span className="text-xs mt-4">Recommended: 1200 × 630px</span>
              </div>
            )}
          </div>

          {/* Image Settings */}
          {settings.featuredImage && (
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Alt Text" description="Describe the image for accessibility">
                <Input
                  value={settings.featuredImage.alt}
                  onChange={(v) => updateSettings('featuredImage', { ...settings.featuredImage!, alt: v })}
                  placeholder="Describe the image..."
                />
              </FormField>
              <FormField label="Caption" description="Optional caption displayed below the image">
                <Input
                  value={settings.featuredImage.caption}
                  onChange={(v) => updateSettings('featuredImage', { ...settings.featuredImage!, caption: v })}
                  placeholder="Image caption..."
                />
              </FormField>
            </div>
          )}

          <InfoBox>
            Featured images are used as thumbnails in post lists and when sharing on social media.
            For best results, use images at least 1200 × 630 pixels.
          </InfoBox>
        </div>
      )}

      {/* Author & Info Tab */}
      {activeTab === 'author' && (
        <div className="space-y-6">
          <ModalSection id="author-primary" title="Primary Author" description="The main author of this post">
            <div className="space-y-3">
              {sampleAuthors.map(author => (
                <label
                  key={author.id}
                  className={clsx(
                    'flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
                    settings.author?.id === author.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                >
                  <input
                    type="radio"
                    name="author"
                    checked={settings.author?.id === author.id}
                    onChange={() => updateSettings('author', author)}
                    className="sr-only"
                  />
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {author.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">{author.name}</div>
                    <div className="text-sm text-gray-500">{author.email}</div>
                  </div>
                  <Badge>{author.role}</Badge>
                  {settings.author?.id === author.id && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </label>
              ))}
            </div>
          </ModalSection>

          <ModalSection id="author-co" title="Co-Authors" description="Additional authors who contributed">
            <div className="space-y-3">
              {settings.coAuthors.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {settings.coAuthors.map(author => (
                    <span
                      key={author.id}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full"
                    >
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold">
                        {author.name.charAt(0)}
                      </div>
                      {author.name}
                      <button
                        onClick={() => updateSettings('coAuthors', settings.coAuthors.filter(a => a.id !== author.id))}
                        className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <Select
                value=""
                onChange={(v) => {
                  const author = sampleAuthors.find(a => a.id === v);
                  if (author && !settings.coAuthors.find(a => a.id === v) && settings.author?.id !== v) {
                    updateSettings('coAuthors', [...settings.coAuthors, author]);
                  }
                }}
                options={sampleAuthors
                  .filter(a => a.id !== settings.author?.id && !settings.coAuthors.find(ca => ca.id === a.id))
                  .map(a => ({ value: a.id, label: a.name }))}
                placeholder="Add co-author..."
              />
            </div>
          </ModalSection>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              placeholder="Search categories..."
              className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Selected categories */}
          {settings.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {settings.categories.map(catId => {
                const cat = sampleCategories.find(c => c.id === catId);
                return cat ? (
                  <span
                    key={catId}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                  >
                    <Folder className="w-3 h-3" />
                    {cat.name}
                    <button
                      onClick={() => toggleCategory(catId)}
                      className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ) : null;
              })}
            </div>
          )}

          {/* Category list */}
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {filteredCategories.map(category => {
              const isSelected = settings.categories.includes(category.id);
              const indent = category.parent ? 24 : 0;

              return (
                <label
                  key={category.id}
                  className={clsx(
                    'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  )}
                  style={{ paddingLeft: `${indent + 12}px` }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleCategory(category.id)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Folder className={clsx('w-4 h-4', isSelected ? 'text-blue-600' : 'text-gray-400')} />
                  <span className={clsx(
                    'flex-1 font-medium',
                    isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
                  )}>
                    {category.name}
                  </span>
                  <span className="text-xs text-gray-400">{category.count} posts</span>
                </label>
              );
            })}
          </div>

          {/* Add new category */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            {showNewCategory ? (
              <div className="flex gap-2">
                <Input
                  value={newCategoryName}
                  onChange={setNewCategoryName}
                  placeholder="Category name"
                />
                <button
                  onClick={() => {
                    // Would add category via API
                    setShowNewCategory(false);
                    setNewCategoryName('');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowNewCategory(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowNewCategory(true)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="w-4 h-4" />
                Add New Category
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tags Tab */}
      {activeTab === 'tags' && (
        <div className="space-y-6">
          {/* Tag input */}
          <FormField label="Add Tags" description="Press Enter or comma to add a tag">
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addTag(tagInput);
                  }
                }}
                placeholder="Type tag and press Enter..."
                className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </FormField>

          {/* Selected tags */}
          {settings.tags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Selected Tags ({settings.tags.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {settings.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:bg-cyan-200 dark:hover:bg-cyan-800 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggested tags */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {tagInput ? 'Matching Tags' : 'Popular Tags'}
            </h4>
            <div className="flex flex-wrap gap-2">
              {suggestedTags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => addTag(tag.name)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  #{tag.name}
                  <span className="text-gray-400 text-xs">({tag.count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Visibility Tab */}
      {activeTab === 'visibility' && (
        <div className="space-y-6">
          <div className="space-y-3">
            {[
              { id: 'public', icon: Globe, label: 'Public', description: 'Visible to everyone' },
              { id: 'private', icon: Lock, label: 'Private', description: 'Only visible to administrators and editors' },
              { id: 'password', icon: Shield, label: 'Password Protected', description: 'Visitors need a password to view' },
            ].map(option => (
              <label
                key={option.id}
                className={clsx(
                  'flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
                  settings.visibility === option.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                )}
              >
                <input
                  type="radio"
                  name="visibility"
                  checked={settings.visibility === option.id}
                  onChange={() => updateSettings('visibility', option.id as any)}
                  className="sr-only"
                />
                <div className={clsx(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  settings.visibility === option.id
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
                )}>
                  <option.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">{option.label}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{option.description}</div>
                </div>
                {settings.visibility === option.id && (
                  <Check className="w-5 h-5 text-blue-600" />
                )}
              </label>
            ))}
          </div>

          {settings.visibility === 'password' && (
            <FormField label="Password" description="Visitors will need to enter this password">
              <Input
                type="password"
                value={settings.password}
                onChange={(v) => updateSettings('password', v)}
                placeholder="Enter password..."
              />
            </FormField>
          )}
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <ModalSection id="publish-status" title="Publish Status" description="Current post status">
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'draft', label: 'Draft', description: 'Not yet published', color: 'gray' },
                { id: 'pending', label: 'Pending Review', description: 'Awaiting approval', color: 'amber' },
                { id: 'published', label: 'Published', description: 'Live and visible', color: 'green' },
                { id: 'scheduled', label: 'Scheduled', description: 'Will publish later', color: 'blue' },
              ].map(status => (
                <label
                  key={status.id}
                  className={clsx(
                    'flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all',
                    settings.status === status.id
                      ? `border-${status.color}-500 bg-${status.color}-50 dark:bg-${status.color}-900/20`
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                >
                  <input
                    type="radio"
                    name="status"
                    checked={settings.status === status.id}
                    onChange={() => updateSettings('status', status.id as any)}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">{status.label}</div>
                    <div className="text-xs text-gray-500">{status.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </ModalSection>

          {(settings.status === 'scheduled' || settings.status === 'published') && (
            <ModalSection id="publish-date" title="Publish Date & Time" description="When to publish this post">
              <FormRow columns={2}>
                <FormField label="Date">
                  <Input
                    type="date"
                    value={settings.publishDate?.toISOString().split('T')[0] || ''}
                    onChange={(v) => updateSettings('publishDate', v ? new Date(v) : null)}
                  />
                </FormField>
                <FormField label="Time">
                  <Input
                    type="time"
                    value={settings.publishTime}
                    onChange={(v) => updateSettings('publishTime', v)}
                  />
                </FormField>
              </FormRow>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    const now = new Date();
                    updateSettings('publishDate', now);
                    updateSettings('publishTime', now.toTimeString().slice(0, 5));
                  }}
                  className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  Now
                </button>
                <button
                  onClick={() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    tomorrow.setHours(9, 0, 0, 0);
                    updateSettings('publishDate', tomorrow);
                    updateSettings('publishTime', '09:00');
                  }}
                  className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  Tomorrow 9 AM
                </button>
              </div>
            </ModalSection>
          )}
        </div>
      )}

      {/* Excerpt Tab */}
      {activeTab === 'excerpt' && (
        <div className="space-y-6">
          <FormField
            label="Post Excerpt"
            description="A brief summary of your post. Used in post lists, feeds, and search results."
          >
            <Textarea
              value={settings.excerpt}
              onChange={(v) => updateSettings('excerpt', v)}
              placeholder="Write a brief summary of your post..."
              rows={6}
              maxLength={300}
              showCount
            />
          </FormField>

          <div className="flex gap-2">
            <button
              onClick={() => {
                // Would auto-generate from content
                updateSettings('excerpt', 'Auto-generated excerpt from the first paragraph of your content...');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Auto-generate
            </button>
          </div>

          <InfoBox>
            If left empty, an excerpt will be automatically generated from the first 55 words of your content.
            For best SEO results, write a custom excerpt that includes your focus keyword.
          </InfoBox>
        </div>
      )}

      {/* URL Slug Tab */}
      {activeTab === 'slug' && (
        <div className="space-y-6">
          <FormField
            label="URL Slug"
            description="The URL-friendly version of the post title"
          >
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">/blog/</span>
                <Input
                  value={settings.slug}
                  onChange={(v) => updateSettings('slug', v.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  placeholder="post-url-slug"
                  prefix={null}
                />
              </div>
              <button
                onClick={() => updateSettings('slug', generateSlug('Sample Post Title'))}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </FormField>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="text-sm text-gray-500 mb-1">Preview URL</div>
            <div className="flex items-center gap-2">
              <Link className="w-4 h-4 text-gray-400" />
              <span className="text-blue-600 dark:text-blue-400">
                https://example.com/blog/{settings.slug || 'post-url-slug'}
              </span>
              <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                <Copy className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          <InfoBox>
            A good URL slug is short, descriptive, and includes relevant keywords.
            Avoid changing slugs after publishing to prevent broken links.
          </InfoBox>
        </div>
      )}

      {/* Discussion Tab */}
      {activeTab === 'discussion' && (
        <div className="space-y-6">
          <ModalSection id="comments" title="Comments" description="Allow visitors to comment on this post">
            <div className="space-y-4">
              <Toggle
                checked={settings.allowComments}
                onChange={(v) => {
                  updateSettings('allowComments', v);
                  updateSettings('commentStatus', v ? 'open' : 'closed');
                }}
                label="Allow Comments"
                description="Enable comment section for this post"
              />

              {settings.allowComments && (
                <Select
                  value={settings.commentStatus}
                  onChange={(v) => updateSettings('commentStatus', v as any)}
                  options={[
                    { value: 'open', label: 'Open - Anyone can comment' },
                    { value: 'closed', label: 'Closed - No new comments allowed' },
                  ]}
                />
              )}
            </div>
          </ModalSection>

          <ModalSection id="pingbacks" title="Pingbacks & Trackbacks" description="Allow link notifications">
            <Toggle
              checked={settings.allowPingbacks}
              onChange={(v) => {
                updateSettings('allowPingbacks', v);
                updateSettings('pingStatus', v ? 'open' : 'closed');
              }}
              label="Allow Pingbacks"
              description="Receive notifications when other sites link to this post"
            />
          </ModalSection>
        </div>
      )}

      {/* Revisions Tab */}
      {activeTab === 'revisions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {sampleRevisions.length} Revisions
              </h3>
              <p className="text-sm text-gray-500">Autosaved every 60 seconds</p>
            </div>
            <button className="flex items-center gap-2 text-red-600 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          </div>

          <div className="space-y-2">
            {sampleRevisions.map((revision, index) => (
              <div
                key={revision.id}
                onClick={() => setSelectedRevision(revision.id)}
                className={clsx(
                  'flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all',
                  selectedRevision === revision.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                    : 'bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                )}
              >
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  {index === 0 ? (
                    <Star className="w-5 h-5 text-amber-500" />
                  ) : (
                    <History className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {revision.author}
                    </span>
                    {index === 0 && <Badge variant="success">Current</Badge>}
                  </div>
                  <div className="text-sm text-gray-500">{revision.changes}</div>
                </div>
                <div className="text-sm text-gray-400">
                  {revision.date}
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>

          {selectedRevision && (
            <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <RotateCcw className="w-4 h-4" />
                Restore This Version
              </button>
              <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                Compare
              </button>
            </div>
          )}
        </div>
      )}
    </EditorModal>
  );
};

export default PostSettingsModal;
