import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Calendar,
  Clock,
  Tag,
  Folder,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Link,
  Hash,
  FileText,
  Settings,
  ChevronDown,
  X,
  Plus,
  Search,
  Star,
  AlertCircle,
  Check,
  RefreshCw,
  Bell,
  Users,
  Bookmark
} from 'lucide-react';
import clsx from 'clsx';

export interface Author {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent?: string;
  count?: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  count?: number;
}

export interface PostMetadataData {
  author: Author | null;
  coAuthors: Author[];
  publishDate: Date | null;
  publishTime: string;
  status: 'draft' | 'pending' | 'published' | 'scheduled' | 'private';
  visibility: 'public' | 'private' | 'password';
  password?: string;
  categories: Category[];
  tags: Tag[];
  slug: string;
  template: string;
  allowComments: boolean;
  allowPingbacks: boolean;
  sticky: boolean;
  format: 'standard' | 'aside' | 'gallery' | 'link' | 'image' | 'quote' | 'status' | 'video' | 'audio' | 'chat';
  excerpt: string;
  customFields: Record<string, string>;
}

interface PostMetadataProps {
  data: PostMetadataData;
  onChange: (data: PostMetadataData) => void;
  postTitle?: string;
  className?: string;
}

// Mock data for demonstration
const mockAuthors: Author[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', avatar: 'https://i.pravatar.cc/150?u=john', role: 'Admin' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', avatar: 'https://i.pravatar.cc/150?u=jane', role: 'Editor' },
  { id: '3', name: 'Mike Johnson', email: 'mike@example.com', avatar: 'https://i.pravatar.cc/150?u=mike', role: 'Author' },
];

const mockCategories: Category[] = [
  { id: '1', name: 'Technology', slug: 'technology', count: 45 },
  { id: '2', name: 'Design', slug: 'design', count: 32 },
  { id: '3', name: 'Development', slug: 'development', parent: '1', count: 28 },
  { id: '4', name: 'UI/UX', slug: 'ui-ux', parent: '2', count: 15 },
  { id: '5', name: 'Business', slug: 'business', count: 22 },
  { id: '6', name: 'Marketing', slug: 'marketing', count: 18 },
];

const mockTags: Tag[] = [
  { id: '1', name: 'React', slug: 'react', count: 25 },
  { id: '2', name: 'TypeScript', slug: 'typescript', count: 20 },
  { id: '3', name: 'CSS', slug: 'css', count: 18 },
  { id: '4', name: 'JavaScript', slug: 'javascript', count: 30 },
  { id: '5', name: 'Node.js', slug: 'nodejs', count: 15 },
  { id: '6', name: 'Tutorial', slug: 'tutorial', count: 40 },
];

const postFormats = [
  { id: 'standard', label: 'Standard', icon: FileText },
  { id: 'gallery', label: 'Gallery', icon: Folder },
  { id: 'video', label: 'Video', icon: FileText },
  { id: 'audio', label: 'Audio', icon: FileText },
  { id: 'quote', label: 'Quote', icon: FileText },
  { id: 'link', label: 'Link', icon: Link },
];

const templates = [
  { id: 'default', name: 'Default Template' },
  { id: 'full-width', name: 'Full Width' },
  { id: 'sidebar-left', name: 'Sidebar Left' },
  { id: 'sidebar-right', name: 'Sidebar Right' },
  { id: 'landing', name: 'Landing Page' },
  { id: 'minimal', name: 'Minimal' },
];

export const PostMetadata: React.FC<PostMetadataProps> = ({
  data,
  onChange,
  postTitle = '',
  className
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    author: true,
    schedule: true,
    categories: true,
    tags: true,
    visibility: false,
    advanced: false
  });

  const [authorSearch, setAuthorSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateData = useCallback((updates: Partial<PostMetadataData>) => {
    onChange({ ...data, ...updates });
  }, [data, onChange]);

  const handleAuthorSelect = (author: Author) => {
    updateData({ author });
    setShowAuthorDropdown(false);
    setAuthorSearch('');
  };

  const handleAddCoAuthor = (author: Author) => {
    if (!data.coAuthors.find(a => a.id === author.id)) {
      updateData({ coAuthors: [...data.coAuthors, author] });
    }
  };

  const handleRemoveCoAuthor = (authorId: string) => {
    updateData({ coAuthors: data.coAuthors.filter(a => a.id !== authorId) });
  };

  const handleCategoryToggle = (category: Category) => {
    const exists = data.categories.find(c => c.id === category.id);
    if (exists) {
      updateData({ categories: data.categories.filter(c => c.id !== category.id) });
    } else {
      updateData({ categories: [...data.categories, category] });
    }
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;

    const existingTag = mockTags.find(
      t => t.name.toLowerCase() === tagInput.toLowerCase()
    );

    if (existingTag && !data.tags.find(t => t.id === existingTag.id)) {
      updateData({ tags: [...data.tags, existingTag] });
    } else if (!existingTag) {
      const newTag: Tag = {
        id: `new-${Date.now()}`,
        name: tagInput.trim(),
        slug: tagInput.trim().toLowerCase().replace(/\s+/g, '-'),
        count: 0
      };
      updateData({ tags: [...data.tags, newTag] });
    }

    setTagInput('');
  };

  const handleRemoveTag = (tagId: string) => {
    updateData({ tags: data.tags.filter(t => t.id !== tagId) });
  };

  const generateSlug = () => {
    const slug = postTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    updateData({ slug });
  };

  const filteredAuthors = mockAuthors.filter(a =>
    a.name.toLowerCase().includes(authorSearch.toLowerCase()) ||
    a.email.toLowerCase().includes(authorSearch.toLowerCase())
  );

  const filteredCategories = mockCategories.filter(c =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const suggestedTags = mockTags.filter(t =>
    t.name.toLowerCase().includes(tagInput.toLowerCase()) &&
    !data.tags.find(dt => dt.id === t.id)
  ).slice(0, 5);

  const SectionHeader: React.FC<{
    title: string;
    icon: React.ElementType;
    section: string;
    badge?: string;
    color?: string;
  }> = ({ title, icon: Icon, section, badge, color = 'blue' }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-lg"
    >
      <div className="flex items-center gap-3">
        <div className={clsx(
          'p-2 rounded-lg',
          `bg-${color}-100 dark:bg-${color}-900/30`
        )}>
          <Icon className={clsx('w-4 h-4', `text-${color}-600 dark:text-${color}-400`)} />
        </div>
        <span className="font-medium text-gray-900 dark:text-white">{title}</span>
        {badge && (
          <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <motion.div
        animate={{ rotate: expandedSections[section] ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </motion.div>
    </button>
  );

  return (
    <div className={clsx(
      'bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden divide-y divide-gray-200 dark:divide-gray-800',
      className
    )}>
      {/* Main Header */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Post Metadata</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Configure author, scheduling, and organization
            </p>
          </div>
        </div>
      </div>

      {/* Author Section */}
      <div>
        <SectionHeader title="Author" icon={User} section="author" color="violet" />
        <AnimatePresence>
          {expandedSections.author && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-4">
                {/* Primary Author */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Primary Author
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setShowAuthorDropdown(!showAuthorDropdown)}
                      className="w-full flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                    >
                      {data.author ? (
                        <>
                          <img
                            src={data.author.avatar}
                            alt={data.author.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <div className="flex-1 text-left">
                            <p className="font-medium text-gray-900 dark:text-white">{data.author.name}</p>
                            <p className="text-xs text-gray-500">{data.author.role}</p>
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-500">Select an author...</span>
                      )}
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>

                    <AnimatePresence>
                      {showAuthorDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden"
                        >
                          <div className="p-2">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                type="text"
                                value={authorSearch}
                                onChange={(e) => setAuthorSearch(e.target.value)}
                                placeholder="Search authors..."
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-transparent"
                              />
                            </div>
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {filteredAuthors.map((author) => (
                              <button
                                key={author.id}
                                onClick={() => handleAuthorSelect(author)}
                                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              >
                                <img
                                  src={author.avatar}
                                  alt={author.name}
                                  className="w-8 h-8 rounded-full"
                                />
                                <div className="flex-1 text-left">
                                  <p className="font-medium text-gray-900 dark:text-white">{author.name}</p>
                                  <p className="text-xs text-gray-500">{author.email}</p>
                                </div>
                                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded">
                                  {author.role}
                                </span>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Co-Authors */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <span className="flex items-center gap-2">
                      <Users size={14} />
                      Co-Authors
                    </span>
                  </label>
                  <div className="space-y-2">
                    {data.coAuthors.map((author) => (
                      <div
                        key={author.id}
                        className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <img
                          src={author.avatar}
                          alt={author.name}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{author.name}</span>
                        <button
                          onClick={() => handleRemoveCoAuthor(author.id)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        >
                          <X size={14} className="text-gray-400" />
                        </button>
                      </div>
                    ))}
                    <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                      <Plus size={14} />
                      Add co-author
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Schedule Section */}
      <div>
        <SectionHeader
          title="Schedule & Status"
          icon={Calendar}
          section="schedule"
          badge={data.status}
          color="green"
        />
        <AnimatePresence>
          {expandedSections.schedule && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-4">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['draft', 'pending', 'published'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => updateData({ status })}
                        className={clsx(
                          'px-3 py-2 text-sm font-medium rounded-lg border transition-colors capitalize',
                          data.status === status
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        )}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Publish Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <span className="flex items-center gap-2">
                        <Calendar size={14} />
                        Publish Date
                      </span>
                    </label>
                    <input
                      type="date"
                      value={data.publishDate?.toISOString().split('T')[0] || ''}
                      onChange={(e) => updateData({
                        publishDate: e.target.value ? new Date(e.target.value) : null,
                        status: e.target.value ? 'scheduled' : data.status
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <span className="flex items-center gap-2">
                        <Clock size={14} />
                        Time
                      </span>
                    </label>
                    <input
                      type="time"
                      value={data.publishTime}
                      onChange={(e) => updateData({ publishTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
                    />
                  </div>
                </div>

                {/* Quick Schedule Options */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => updateData({ publishDate: new Date(), publishTime: '09:00', status: 'scheduled' })}
                    className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    Tomorrow 9 AM
                  </button>
                  <button
                    onClick={() => {
                      const date = new Date();
                      date.setDate(date.getDate() + 7);
                      updateData({ publishDate: date, publishTime: '09:00', status: 'scheduled' });
                    }}
                    className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    Next Week
                  </button>
                  <button
                    onClick={() => updateData({ publishDate: null, publishTime: '', status: 'draft' })}
                    className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    Clear Schedule
                  </button>
                </div>

                {data.status === 'scheduled' && data.publishDate && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm">
                    <Bell size={16} className="text-amber-600" />
                    <span className="text-amber-800 dark:text-amber-200">
                      Scheduled for {data.publishDate.toLocaleDateString()} at {data.publishTime}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Categories Section */}
      <div>
        <SectionHeader
          title="Categories"
          icon={Folder}
          section="categories"
          badge={data.categories.length > 0 ? String(data.categories.length) : undefined}
          color="amber"
        />
        <AnimatePresence>
          {expandedSections.categories && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="Search categories..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredCategories.map((category) => {
                    const isSelected = data.categories.some(c => c.id === category.id);
                    return (
                      <label
                        key={category.id}
                        className={clsx(
                          'flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors',
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-900/30'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleCategoryToggle(category)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className={clsx(
                          'flex-1 text-sm',
                          category.parent ? 'ml-4' : ''
                        )}>
                          {category.name}
                        </span>
                        <span className="text-xs text-gray-400">{category.count}</span>
                      </label>
                    );
                  })}
                </div>

                <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                  <Plus size={14} />
                  Add new category
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tags Section */}
      <div>
        <SectionHeader
          title="Tags"
          icon={Tag}
          section="tags"
          badge={data.tags.length > 0 ? String(data.tags.length) : undefined}
          color="pink"
        />
        <AnimatePresence>
          {expandedSections.tags && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-3">
                {/* Selected Tags */}
                {data.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {data.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full text-sm"
                      >
                        <Hash size={12} />
                        {tag.name}
                        <button
                          onClick={() => handleRemoveTag(tag.id)}
                          className="ml-1 hover:text-pink-900 dark:hover:text-pink-100"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Tag Input */}
                <div className="relative">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Add tags..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  />

                  {/* Tag Suggestions */}
                  {tagInput && suggestedTags.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                      {suggestedTags.map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => {
                            updateData({ tags: [...data.tags, tag] });
                            setTagInput('');
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-left"
                        >
                          <Hash size={14} className="text-gray-400" />
                          <span className="flex-1">{tag.name}</span>
                          <span className="text-xs text-gray-400">{tag.count} posts</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Popular Tags */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">Popular tags:</p>
                  <div className="flex flex-wrap gap-1">
                    {mockTags.slice(0, 6).map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => {
                          if (!data.tags.find(t => t.id === tag.id)) {
                            updateData({ tags: [...data.tags, tag] });
                          }
                        }}
                        disabled={data.tags.some(t => t.id === tag.id)}
                        className={clsx(
                          'px-2 py-1 text-xs rounded-full transition-colors',
                          data.tags.some(t => t.id === tag.id)
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                        )}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Visibility Section */}
      <div>
        <SectionHeader title="Visibility" icon={Eye} section="visibility" color="cyan" />
        <AnimatePresence>
          {expandedSections.visibility && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-4">
                {/* Visibility Options */}
                <div className="space-y-2">
                  {[
                    { id: 'public', label: 'Public', desc: 'Visible to everyone', icon: Globe },
                    { id: 'private', label: 'Private', desc: 'Only visible to you and admins', icon: Lock },
                    { id: 'password', label: 'Password Protected', desc: 'Requires a password to view', icon: Lock }
                  ].map((option) => (
                    <label
                      key={option.id}
                      className={clsx(
                        'flex items-start gap-3 p-3 rounded-lg cursor-pointer border transition-colors',
                        data.visibility === option.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      )}
                    >
                      <input
                        type="radio"
                        name="visibility"
                        checked={data.visibility === option.id}
                        onChange={() => updateData({ visibility: option.id as PostMetadataData['visibility'] })}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <option.icon size={16} className="text-gray-500" />
                          <span className="font-medium text-gray-900 dark:text-white">{option.label}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{option.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {data.visibility === 'password' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Post Password
                    </label>
                    <input
                      type="text"
                      value={data.password || ''}
                      onChange={(e) => updateData({ password: e.target.value })}
                      placeholder="Enter password..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
                    />
                  </div>
                )}

                {/* Sticky Post */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.sticky}
                    onChange={(e) => updateData({ sticky: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                      <Star size={14} className="text-amber-500" />
                      Sticky Post
                    </span>
                    <p className="text-xs text-gray-500">Pin this post to the top of the blog</p>
                  </div>
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Advanced Section */}
      <div>
        <SectionHeader title="Advanced" icon={Settings} section="advanced" color="slate" />
        <AnimatePresence>
          {expandedSections.advanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-4">
                {/* URL Slug */}
                <div>
                  <label className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <span className="flex items-center gap-2">
                      <Link size={14} />
                      URL Slug
                    </span>
                    <button
                      onClick={generateSlug}
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <RefreshCw size={12} />
                      Generate from title
                    </button>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">/posts/</span>
                    <input
                      type="text"
                      value={data.slug}
                      onChange={(e) => updateData({ slug: e.target.value })}
                      placeholder="post-url-slug"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
                    />
                  </div>
                </div>

                {/* Template */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Page Template
                  </label>
                  <select
                    value={data.template}
                    onChange={(e) => updateData({ template: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
                  >
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Post Format */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Post Format
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {postFormats.map((format) => (
                      <button
                        key={format.id}
                        onClick={() => updateData({ format: format.id as PostMetadataData['format'] })}
                        className={clsx(
                          'flex flex-col items-center gap-1 p-3 rounded-lg border text-sm transition-colors',
                          data.format === format.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        )}
                      >
                        <format.icon size={18} />
                        <span>{format.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Discussion Settings */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Discussion</p>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.allowComments}
                      onChange={(e) => updateData({ allowComments: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Allow comments</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.allowPingbacks}
                      onChange={(e) => updateData({ allowPingbacks: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Allow pingbacks & trackbacks</span>
                  </label>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Excerpt
                  </label>
                  <textarea
                    value={data.excerpt}
                    onChange={(e) => updateData({ excerpt: e.target.value })}
                    placeholder="Write a short summary for this post..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm resize-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {data.excerpt.length}/300 characters
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PostMetadata;
