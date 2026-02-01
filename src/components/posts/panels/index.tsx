/**
 * Post Editor Sidebar Panels
 *
 * Individual panels for managing post settings in the right sidebar.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Folder,
  FolderPlus,
  Tag,
  Plus,
  X,
  Search,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  FileText,
  Link as LinkIcon,
  RefreshCw,
  Check,
  AlertCircle,
  Copy,
  Sparkles,
  MessageSquare,
  AtSign,
  History,
  ChevronRight,
  ChevronDown,
  Trash2,
  Edit3,
  ExternalLink,
  TrendingUp,
} from 'lucide-react';
import clsx from 'clsx';

// Types
interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string;
  count?: number;
  children?: Category[];
}

interface TagItem {
  id: string;
  name: string;
  slug: string;
  count?: number;
}

type PostVisibility = 'public' | 'private' | 'password';
type PostStatus = 'draft' | 'pending' | 'published' | 'scheduled' | 'private';

interface Revision {
  id: string;
  author: string;
  authorAvatar?: string;
  date: Date;
  changesSummary: string;
}

// ============== CATEGORIES PANEL ==============
interface CategoriesPanelProps {
  selected: Category[];
  onChange: (categories: Category[]) => void;
  className?: string;
}

export function CategoriesPanel({ selected, onChange, className }: CategoriesPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Sample categories - replace with API call
  const allCategories: Category[] = [
    { id: '1', name: 'Technology', slug: 'technology', count: 45, children: [
      { id: '1-1', name: 'Web Development', slug: 'web-development', parent_id: '1', count: 20 },
      { id: '1-2', name: 'Mobile Apps', slug: 'mobile-apps', parent_id: '1', count: 15 },
      { id: '1-3', name: 'AI & ML', slug: 'ai-ml', parent_id: '1', count: 10 },
    ]},
    { id: '2', name: 'Business', slug: 'business', count: 32, children: [
      { id: '2-1', name: 'Startups', slug: 'startups', parent_id: '2', count: 12 },
      { id: '2-2', name: 'Marketing', slug: 'marketing', parent_id: '2', count: 20 },
    ]},
    { id: '3', name: 'Design', slug: 'design', count: 28 },
    { id: '4', name: 'Tutorials', slug: 'tutorials', count: 56 },
    { id: '5', name: 'News', slug: 'news', count: 89 },
    { id: '6', name: 'Reviews', slug: 'reviews', count: 34 },
  ];

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return allCategories;
    const query = searchQuery.toLowerCase();
    return allCategories.filter(cat =>
      cat.name.toLowerCase().includes(query) ||
      cat.children?.some(child => child.name.toLowerCase().includes(query))
    );
  }, [searchQuery, allCategories]);

  const toggleCategory = (category: Category) => {
    const isSelected = selected.some(c => c.id === category.id);
    if (isSelected) {
      onChange(selected.filter(c => c.id !== category.id));
    } else {
      onChange([...selected, category]);
    }
  };

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: Category = {
        id: `new-${Date.now()}`,
        name: newCategoryName.trim(),
        slug: newCategoryName.trim().toLowerCase().replace(/\s+/g, '-'),
        count: 0,
      };
      onChange([...selected, newCategory]);
      setNewCategoryName('');
      setIsCreating(false);
    }
  };

  const renderCategory = (category: Category, depth = 0) => {
    const isSelected = selected.some(c => c.id === category.id);
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <div key={category.id}>
        <div
          className={clsx(
            'flex items-center gap-2 py-2 px-2 rounded-lg cursor-pointer transition-colors',
            isSelected ? 'bg-amber-50 dark:bg-amber-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
          )}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {hasChildren && (
            <button
              onClick={(e) => { e.stopPropagation(); toggleExpanded(category.id); }}
              className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
          <label className="flex items-center gap-2 flex-1 cursor-pointer">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleCategory(category)}
              className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <span className="flex-1 text-sm">{category.name}</span>
            {category.count !== undefined && (
              <span className="text-xs text-gray-400">({category.count})</span>
            )}
          </label>
        </div>
        {hasChildren && isExpanded && (
          <div className="ml-2">
            {category.children!.map(child => renderCategory(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Folder className="w-4 h-4 text-amber-500" />
          Categories
        </h3>
        <span className="text-xs text-gray-500">{selected.length} selected</span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-800 dark:border-gray-700"
        />
      </div>

      {/* Selected Categories */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map(cat => (
            <span
              key={cat.id}
              className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 rounded-full text-xs"
            >
              {cat.name}
              <button
                onClick={() => toggleCategory(cat)}
                className="p-0.5 hover:bg-amber-200 dark:hover:bg-amber-800 rounded-full"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Categories List */}
      <div className="max-h-64 overflow-y-auto space-y-1 border rounded-lg p-2 dark:border-gray-700">
        {filteredCategories.map(cat => renderCategory(cat))}
      </div>

      {/* Add New Category */}
      {isCreating ? (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
            className="flex-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-800 dark:border-gray-700"
            autoFocus
          />
          <button
            onClick={handleCreateCategory}
            className="px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            <Check size={16} />
          </button>
          <button
            onClick={() => { setIsCreating(false); setNewCategoryName(''); }}
            className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
        >
          <FolderPlus size={16} />
          Add New Category
        </button>
      )}
    </div>
  );
}

// ============== TAGS PANEL ==============
interface TagsPanelProps {
  selected: TagItem[];
  onChange: (tags: TagItem[]) => void;
  className?: string;
}

export function TagsPanel({ selected, onChange, className }: TagsPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<TagItem[]>([]);

  // Sample popular tags - replace with API call
  const popularTags: TagItem[] = [
    { id: 't1', name: 'javascript', slug: 'javascript', count: 156 },
    { id: 't2', name: 'react', slug: 'react', count: 134 },
    { id: 't3', name: 'typescript', slug: 'typescript', count: 98 },
    { id: 't4', name: 'nodejs', slug: 'nodejs', count: 87 },
    { id: 't5', name: 'css', slug: 'css', count: 76 },
    { id: 't6', name: 'tutorial', slug: 'tutorial', count: 65 },
    { id: 't7', name: 'beginner', slug: 'beginner', count: 54 },
    { id: 't8', name: 'webdev', slug: 'webdev', count: 43 },
  ];

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (value.length >= 2) {
      const filtered = popularTags.filter(
        tag => tag.name.toLowerCase().includes(value.toLowerCase()) &&
        !selected.some(s => s.id === tag.id)
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const addTag = (tag: TagItem) => {
    if (!selected.some(t => t.id === tag.id)) {
      onChange([...selected, tag]);
    }
    setInputValue('');
    setSuggestions([]);
  };

  const createAndAddTag = () => {
    if (inputValue.trim() && !selected.some(t => t.name.toLowerCase() === inputValue.toLowerCase())) {
      const newTag: TagItem = {
        id: `new-${Date.now()}`,
        name: inputValue.trim().toLowerCase(),
        slug: inputValue.trim().toLowerCase().replace(/\s+/g, '-'),
        count: 0,
      };
      onChange([...selected, newTag]);
      setInputValue('');
      setSuggestions([]);
    }
  };

  const removeTag = (tagId: string) => {
    onChange(selected.filter(t => t.id !== tagId));
  };

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Tag className="w-4 h-4 text-cyan-500" />
          Tags
        </h3>
        <span className="text-xs text-gray-500">{selected.length} tags</span>
      </div>

      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-lg dark:border-gray-700">
        {selected.map(tag => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300 rounded-full text-sm"
          >
            #{tag.name}
            <button
              onClick={() => removeTag(tag.id)}
              className="p-0.5 hover:bg-cyan-200 dark:hover:bg-cyan-800 rounded-full"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        {selected.length === 0 && (
          <span className="text-sm text-gray-400">No tags added</span>
        )}
      </div>

      {/* Tag Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Add a tag..."
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (suggestions.length > 0) {
                addTag(suggestions[0]);
              } else {
                createAndAddTag();
              }
            }
          }}
          className="w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-800 dark:border-gray-700"
        />

        {/* Suggestions Dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
            {suggestions.map(tag => (
              <button
                key={tag.id}
                onClick={() => addTag(tag)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <span>#{tag.name}</span>
                <span className="text-xs text-gray-400">{tag.count} posts</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Popular Tags */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <TrendingUp size={12} />
          Popular Tags
        </h4>
        <div className="flex flex-wrap gap-2">
          {popularTags
            .filter(tag => !selected.some(s => s.id === tag.id))
            .slice(0, 8)
            .map(tag => (
              <button
                key={tag.id}
                onClick={() => addTag(tag)}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 rounded-full transition-colors"
              >
                #{tag.name}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

// ============== VISIBILITY PANEL ==============
interface VisibilityPanelProps {
  visibility: PostVisibility;
  password?: string;
  onChange: (visibility: PostVisibility, password?: string) => void;
  className?: string;
}

export function VisibilityPanel({ visibility, password, onChange, className }: VisibilityPanelProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [localPassword, setLocalPassword] = useState(password || '');

  const options = [
    {
      value: 'public' as PostVisibility,
      label: 'Public',
      description: 'Visible to everyone',
      icon: Globe,
      color: 'green',
    },
    {
      value: 'private' as PostVisibility,
      label: 'Private',
      description: 'Only visible to admins and editors',
      icon: Lock,
      color: 'red',
    },
    {
      value: 'password' as PostVisibility,
      label: 'Password Protected',
      description: 'Visitors must enter a password',
      icon: Eye,
      color: 'amber',
    },
  ];

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Header */}
      <h3 className="font-semibold flex items-center gap-2">
        <Globe className="w-4 h-4 text-green-500" />
        Visibility
      </h3>

      {/* Options */}
      <div className="space-y-2">
        {options.map(option => {
          const Icon = option.icon;
          const isSelected = visibility === option.value;
          return (
            <div key={option.value}>
              <label
                className={clsx(
                  'flex items-start gap-3 p-3 rounded-lg cursor-pointer border-2 transition-all',
                  isSelected
                    ? `border-${option.color}-500 bg-${option.color}-50 dark:bg-${option.color}-900/20`
                    : 'border-transparent bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                <input
                  type="radio"
                  name="visibility"
                  value={option.value}
                  checked={isSelected}
                  onChange={() => onChange(option.value, option.value === 'password' ? localPassword : undefined)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Icon size={16} className={isSelected ? `text-${option.color}-600` : 'text-gray-400'} />
                    <span className="font-medium">{option.label}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{option.description}</p>
                </div>
              </label>

              {/* Password Input */}
              {option.value === 'password' && isSelected && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-2 ml-7"
                >
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={localPassword}
                      onChange={(e) => {
                        setLocalPassword(e.target.value);
                        onChange('password', e.target.value);
                      }}
                      className="w-full px-4 py-2 pr-10 text-sm border rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-800 dark:border-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============== SCHEDULE PANEL ==============
interface SchedulePanelProps {
  status: PostStatus;
  publishDate: Date | null;
  publishTime: string;
  onChange: (status: PostStatus, publishDate: Date | null, publishTime: string) => void;
  className?: string;
}

export function SchedulePanel({ status, publishDate, publishTime, onChange, className }: SchedulePanelProps) {
  const [selectedOption, setSelectedOption] = useState<'now' | 'schedule'>(
    status === 'scheduled' ? 'schedule' : 'now'
  );

  const handlePublishNow = () => {
    setSelectedOption('now');
    onChange('draft', null, '');
  };

  const handleSchedule = () => {
    setSelectedOption('schedule');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    onChange('scheduled', tomorrow, '09:00');
  };

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Header */}
      <h3 className="font-semibold flex items-center gap-2">
        <Calendar className="w-4 h-4 text-blue-500" />
        Schedule
      </h3>

      {/* Current Status */}
      <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <span className="text-sm text-gray-500">Status:</span>
        <span className={clsx(
          'px-2 py-0.5 rounded-full text-xs font-medium',
          status === 'published' && 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
          status === 'draft' && 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
          status === 'scheduled' && 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
          status === 'pending' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        )}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>

      {/* Options */}
      <div className="space-y-3">
        <label
          className={clsx(
            'flex items-center gap-3 p-3 rounded-lg cursor-pointer border-2 transition-all',
            selectedOption === 'now'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-transparent bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
          )}
        >
          <input
            type="radio"
            name="schedule"
            checked={selectedOption === 'now'}
            onChange={handlePublishNow}
          />
          <div>
            <span className="font-medium">Publish Immediately</span>
            <p className="text-sm text-gray-500">Make this post live right away</p>
          </div>
        </label>

        <label
          className={clsx(
            'flex items-start gap-3 p-3 rounded-lg cursor-pointer border-2 transition-all',
            selectedOption === 'schedule'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-transparent bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
          )}
        >
          <input
            type="radio"
            name="schedule"
            checked={selectedOption === 'schedule'}
            onChange={handleSchedule}
            className="mt-1"
          />
          <div className="flex-1">
            <span className="font-medium">Schedule for Later</span>
            <p className="text-sm text-gray-500 mb-3">Set a specific date and time</p>

            {selectedOption === 'schedule' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Date</label>
                  <input
                    type="date"
                    value={publishDate ? publishDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => onChange('scheduled', new Date(e.target.value), publishTime)}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Time</label>
                  <input
                    type="time"
                    value={publishTime}
                    onChange={(e) => onChange('scheduled', publishDate, e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
              </div>
            )}
          </div>
        </label>
      </div>
    </div>
  );
}

// ============== EXCERPT PANEL ==============
interface ExcerptPanelProps {
  excerpt: string;
  onChange: (excerpt: string) => void;
  content: string;
  className?: string;
}

export function ExcerptPanel({ excerpt, onChange, content, className }: ExcerptPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateExcerpt = () => {
    setIsGenerating(true);
    // Simulate AI generation - replace with actual API call
    setTimeout(() => {
      const text = content.replace(/<[^>]*>/g, '').trim();
      const sentences = text.split(/[.!?]+/).filter(s => s.trim());
      const generated = sentences.slice(0, 2).join('. ').trim() + '.';
      onChange(generated.slice(0, 300));
      setIsGenerating(false);
    }, 1000);
  };

  const charCount = excerpt.length;
  const maxChars = 300;

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-500" />
          Excerpt
        </h3>
        <span className={clsx(
          'text-xs',
          charCount > maxChars ? 'text-red-500' : 'text-gray-500'
        )}>
          {charCount}/{maxChars}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-500">
        Write a short summary for search results and social sharing.
      </p>

      {/* Textarea */}
      <textarea
        value={excerpt}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write a brief description of your post..."
        className={clsx(
          'w-full px-4 py-3 text-sm border rounded-lg resize-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-700',
          charCount > maxChars && 'border-red-500 focus:ring-red-500'
        )}
        rows={5}
      />

      {/* AI Generate Button */}
      <button
        onClick={generateExcerpt}
        disabled={isGenerating || !content}
        className="flex items-center gap-2 w-full px-4 py-2 text-sm bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <RefreshCw size={16} className="animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles size={16} />
            Generate from Content
          </>
        )}
      </button>
    </div>
  );
}

// ============== SLUG PANEL ==============
interface SlugPanelProps {
  slug: string;
  title: string;
  onChange: (slug: string) => void;
  className?: string;
}

export function SlugPanel({ slug, title, onChange, className }: SlugPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localSlug, setLocalSlug] = useState(slug);

  const baseUrl = 'https://example.com/blog/';

  const generateSlug = () => {
    const generated = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    setLocalSlug(generated);
    onChange(generated);
  };

  const handleSave = () => {
    onChange(localSlug);
    setIsEditing(false);
  };

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Header */}
      <h3 className="font-semibold flex items-center gap-2">
        <LinkIcon className="w-4 h-4 text-teal-500" />
        URL Slug
      </h3>

      {/* Current URL Preview */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-xs text-gray-500 mb-1">Permalink</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-sm text-teal-600 dark:text-teal-400 break-all">
            {baseUrl}<span className="font-semibold">{slug || 'your-post-slug'}</span>
          </code>
          <button
            onClick={() => navigator.clipboard.writeText(baseUrl + slug)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            title="Copy URL"
          >
            <Copy size={14} />
          </button>
        </div>
      </div>

      {/* Edit Slug */}
      {isEditing ? (
        <div className="space-y-2">
          <input
            type="text"
            value={localSlug}
            onChange={(e) => setLocalSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            className="w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-800 dark:border-gray-700"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm"
            >
              Save
            </button>
            <button
              onClick={() => { setIsEditing(false); setLocalSlug(slug); }}
              className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm transition-colors"
          >
            <Edit3 size={14} />
            Edit Slug
          </button>
          <button
            onClick={generateSlug}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-teal-50 text-teal-700 hover:bg-teal-100 dark:bg-teal-900/20 dark:text-teal-300 dark:hover:bg-teal-900/30 rounded-lg text-sm transition-colors"
          >
            <RefreshCw size={14} />
            Generate
          </button>
        </div>
      )}
    </div>
  );
}

// ============== DISCUSSION PANEL ==============
interface DiscussionPanelProps {
  allowComments: boolean;
  allowPingbacks: boolean;
  onChange: (allowComments: boolean, allowPingbacks: boolean) => void;
  className?: string;
}

export function DiscussionPanel({ allowComments, allowPingbacks, onChange, className }: DiscussionPanelProps) {
  return (
    <div className={clsx('space-y-4', className)}>
      {/* Header */}
      <h3 className="font-semibold flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-orange-500" />
        Discussion
      </h3>

      {/* Options */}
      <div className="space-y-3">
        <label className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <input
            type="checkbox"
            checked={allowComments}
            onChange={(e) => onChange(e.target.checked, allowPingbacks)}
            className="mt-0.5 w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
          />
          <div>
            <span className="font-medium">Allow Comments</span>
            <p className="text-sm text-gray-500">Let readers comment on this post</p>
          </div>
        </label>

        <label className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <input
            type="checkbox"
            checked={allowPingbacks}
            onChange={(e) => onChange(allowComments, e.target.checked)}
            className="mt-0.5 w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
          />
          <div>
            <span className="font-medium">Allow Pingbacks & Trackbacks</span>
            <p className="text-sm text-gray-500">Receive notifications when other sites link to this post</p>
          </div>
        </label>
      </div>

      {/* Info */}
      <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 rounded-lg text-sm">
        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
        <p>You can manage comments in the Comments section after publishing.</p>
      </div>
    </div>
  );
}

// ============== REVISIONS PANEL ==============
interface RevisionsPanelProps {
  postId?: string;
  className?: string;
}

export function RevisionsPanel({ postId, className }: RevisionsPanelProps) {
  // Sample revisions - replace with API call
  const revisions: Revision[] = [
    { id: 'r1', author: 'John Doe', date: new Date(), changesSummary: 'Updated introduction paragraph' },
    { id: 'r2', author: 'Jane Smith', date: new Date(Date.now() - 3600000), changesSummary: 'Added new section about features' },
    { id: 'r3', author: 'John Doe', date: new Date(Date.now() - 86400000), changesSummary: 'Initial draft' },
  ];

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (!postId) {
    return (
      <div className={clsx('space-y-4', className)}>
        <h3 className="font-semibold flex items-center gap-2">
          <History className="w-4 h-4 text-gray-500" />
          Revisions
        </h3>
        <div className="text-center py-8 text-gray-500">
          <History size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">Save your post to see revisions</p>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <History className="w-4 h-4 text-gray-500" />
          Revisions
        </h3>
        <span className="text-xs text-gray-500">{revisions.length} versions</span>
      </div>

      {/* Revisions List */}
      <div className="space-y-2">
        {revisions.map((revision, index) => (
          <div
            key={revision.id}
            className={clsx(
              'p-3 rounded-lg border transition-colors',
              index === 0
                ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium">
                  {revision.author.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium">{revision.author}</p>
                  <p className="text-xs text-gray-500">{formatDate(revision.date)}</p>
                </div>
              </div>
              {index === 0 && (
                <span className="px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs">
                  Current
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{revision.changesSummary}</p>
            {index > 0 && (
              <div className="flex gap-2 mt-2">
                <button className="text-xs text-blue-600 hover:underline">Preview</button>
                <button className="text-xs text-blue-600 hover:underline">Restore</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============== SEO META PANEL ==============
interface SEOMetaPanelProps {
  title: string;
  description: string;
  focusKeyword: string;
  canonicalUrl: string;
  robots: {
    noindex: boolean;
    nofollow: boolean;
    noarchive: boolean;
    nosnippet: boolean;
  };
  onChange: (data: {
    title: string;
    description: string;
    focusKeyword: string;
    canonicalUrl: string;
    robots: { noindex: boolean; nofollow: boolean; noarchive: boolean; nosnippet: boolean };
  }) => void;
  postTitle: string;
  className?: string;
}

export function SEOMetaPanel({
  title = '',
  description = '',
  focusKeyword = '',
  canonicalUrl = '',
  robots = { noindex: false, nofollow: false, noarchive: false, nosnippet: false },
  onChange,
  postTitle,
  className
}: SEOMetaPanelProps) {
  const titleLength = title.length;
  const descLength = description.length;
  const maxTitleLength = 60;
  const maxDescLength = 160;

  const generateFromPost = () => {
    onChange({
      title: postTitle.slice(0, 60),
      description,
      focusKeyword,
      canonicalUrl,
      robots
    });
  };

  const seoScore = useMemo(() => {
    let score = 0;
    if (title.length >= 30 && title.length <= 60) score += 25;
    if (description.length >= 120 && description.length <= 160) score += 25;
    if (focusKeyword.length > 0) score += 25;
    if (title.toLowerCase().includes(focusKeyword.toLowerCase()) && focusKeyword) score += 25;
    return score;
  }, [title, description, focusKeyword]);

  return (
    <div className={clsx('space-y-5', className)}>
      {/* Header with Score */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Search className="w-4 h-4 text-orange-500" />
          SEO Settings
        </h3>
        <div className={clsx(
          'px-2 py-1 rounded-full text-xs font-medium',
          seoScore >= 75 ? 'bg-green-100 text-green-700' :
          seoScore >= 50 ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        )}>
          Score: {seoScore}%
        </div>
      </div>

      {/* SEO Title */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">SEO Title</label>
          <span className={clsx(
            'text-xs',
            titleLength > maxTitleLength ? 'text-red-500' : 'text-gray-500'
          )}>
            {titleLength}/{maxTitleLength}
          </span>
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => onChange({ title: e.target.value, description, focusKeyword, canonicalUrl, robots })}
          placeholder="Enter SEO title..."
          className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:border-gray-700"
        />
        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={clsx(
              'h-full transition-all',
              titleLength <= 30 ? 'bg-red-500' :
              titleLength <= 60 ? 'bg-green-500' :
              'bg-red-500'
            )}
            style={{ width: `${Math.min((titleLength / maxTitleLength) * 100, 100)}%` }}
          />
        </div>
        <button
          onClick={generateFromPost}
          className="text-xs text-orange-600 hover:underline"
        >
          Use post title
        </button>
      </div>

      {/* Meta Description */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Meta Description</label>
          <span className={clsx(
            'text-xs',
            descLength > maxDescLength ? 'text-red-500' : 'text-gray-500'
          )}>
            {descLength}/{maxDescLength}
          </span>
        </div>
        <textarea
          value={description}
          onChange={(e) => onChange({ title, description: e.target.value, focusKeyword, canonicalUrl, robots })}
          placeholder="Enter meta description..."
          rows={3}
          className="w-full px-3 py-2 text-sm border rounded-lg resize-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:border-gray-700"
        />
        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={clsx(
              'h-full transition-all',
              descLength < 120 ? 'bg-yellow-500' :
              descLength <= 160 ? 'bg-green-500' :
              'bg-red-500'
            )}
            style={{ width: `${Math.min((descLength / maxDescLength) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Focus Keyword */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Focus Keyword</label>
        <input
          type="text"
          value={focusKeyword}
          onChange={(e) => onChange({ title, description, focusKeyword: e.target.value, canonicalUrl, robots })}
          placeholder="Enter focus keyword..."
          className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:border-gray-700"
        />
        {focusKeyword && (
          <div className="flex items-center gap-2 text-xs">
            {title.toLowerCase().includes(focusKeyword.toLowerCase()) ? (
              <span className="flex items-center gap-1 text-green-600">
                <Check size={12} /> Keyword in title
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-600">
                <AlertCircle size={12} /> Add keyword to title
              </span>
            )}
          </div>
        )}
      </div>

      {/* Canonical URL */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Canonical URL</label>
        <input
          type="url"
          value={canonicalUrl}
          onChange={(e) => onChange({ title, description, focusKeyword, canonicalUrl: e.target.value, robots })}
          placeholder="https://example.com/canonical-url"
          className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:border-gray-700"
        />
        <p className="text-xs text-gray-500">Leave empty to use default URL</p>
      </div>

      {/* Robots Meta */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Robots Meta Tags</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'noindex', label: 'No Index', desc: 'Hide from search' },
            { key: 'nofollow', label: 'No Follow', desc: 'Don\'t follow links' },
            { key: 'noarchive', label: 'No Archive', desc: 'No cached copy' },
            { key: 'nosnippet', label: 'No Snippet', desc: 'No text preview' },
          ].map(({ key, label, desc }) => (
            <label
              key={key}
              className={clsx(
                'flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-colors',
                robots[key as keyof typeof robots]
                  ? 'border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              )}
            >
              <input
                type="checkbox"
                checked={robots[key as keyof typeof robots]}
                onChange={(e) => onChange({
                  title, description, focusKeyword, canonicalUrl,
                  robots: { ...robots, [key]: e.target.checked }
                })}
                className="mt-0.5"
              />
              <div>
                <span className="text-xs font-medium">{label}</span>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Search Preview</label>
        <div className="p-3 bg-white dark:bg-gray-800 border rounded-lg">
          <p className="text-blue-600 text-sm font-medium truncate">
            {title || postTitle || 'Page Title'}
          </p>
          <p className="text-green-700 text-xs truncate">
            example.com › blog › post-slug
          </p>
          <p className="text-gray-600 text-xs line-clamp-2 mt-1">
            {description || 'Add a meta description to control how your page appears in search results.'}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============== SOCIAL META PANEL ==============
interface SocialMetaPanelProps {
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: 'summary' | 'summary_large_image';
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  onChange: (data: {
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    twitterCard: 'summary' | 'summary_large_image';
    twitterTitle: string;
    twitterDescription: string;
    twitterImage: string;
  }) => void;
  postTitle: string;
  className?: string;
}

export function SocialMetaPanel({
  ogTitle = '',
  ogDescription = '',
  ogImage = '',
  twitterCard = 'summary_large_image',
  twitterTitle = '',
  twitterDescription = '',
  twitterImage = '',
  onChange,
  postTitle,
  className
}: SocialMetaPanelProps) {
  const [activeTab, setActiveTab] = useState<'facebook' | 'twitter'>('facebook');

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Header */}
      <h3 className="font-semibold flex items-center gap-2">
        <Share2 className="w-4 h-4 text-blue-500" />
        Social Sharing
      </h3>

      {/* Tabs */}
      <div className="flex border-b dark:border-gray-700">
        <button
          onClick={() => setActiveTab('facebook')}
          className={clsx(
            'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
            activeTab === 'facebook'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          Facebook / Open Graph
        </button>
        <button
          onClick={() => setActiveTab('twitter')}
          className={clsx(
            'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
            activeTab === 'twitter'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          Twitter / X
        </button>
      </div>

      {activeTab === 'facebook' ? (
        <div className="space-y-4">
          {/* OG Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <input
              type="text"
              value={ogTitle}
              onChange={(e) => onChange({ ogTitle: e.target.value, ogDescription, ogImage, twitterCard, twitterTitle, twitterDescription, twitterImage })}
              placeholder={postTitle || 'Enter title for Facebook sharing...'}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          {/* OG Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={ogDescription}
              onChange={(e) => onChange({ ogTitle, ogDescription: e.target.value, ogImage, twitterCard, twitterTitle, twitterDescription, twitterImage })}
              placeholder="Enter description for Facebook sharing..."
              rows={3}
              className="w-full px-3 py-2 text-sm border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          {/* OG Image */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Image URL</label>
            <input
              type="url"
              value={ogImage}
              onChange={(e) => onChange({ ogTitle, ogDescription, ogImage: e.target.value, twitterCard, twitterTitle, twitterDescription, twitterImage })}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
            />
            <p className="text-xs text-gray-500">Recommended: 1200 x 630 pixels</p>
          </div>

          {/* Facebook Preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Preview</label>
            <div className="border rounded-lg overflow-hidden dark:border-gray-700">
              <div className="h-32 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                {ogImage ? (
                  <img src={ogImage} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm text-gray-400">No image selected</span>
                )}
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800">
                <p className="text-xs text-gray-500 uppercase">example.com</p>
                <p className="text-sm font-medium">{ogTitle || postTitle || 'Post Title'}</p>
                <p className="text-xs text-gray-600 line-clamp-2">{ogDescription || 'Description will appear here'}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Twitter Card Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Card Type</label>
            <div className="grid grid-cols-2 gap-2">
              <label className={clsx(
                'flex items-center gap-2 p-3 rounded-lg border cursor-pointer',
                twitterCard === 'summary' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
              )}>
                <input
                  type="radio"
                  name="twitterCard"
                  checked={twitterCard === 'summary'}
                  onChange={() => onChange({ ogTitle, ogDescription, ogImage, twitterCard: 'summary', twitterTitle, twitterDescription, twitterImage })}
                />
                <div>
                  <span className="text-sm font-medium">Summary</span>
                  <p className="text-xs text-gray-500">Small image</p>
                </div>
              </label>
              <label className={clsx(
                'flex items-center gap-2 p-3 rounded-lg border cursor-pointer',
                twitterCard === 'summary_large_image' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
              )}>
                <input
                  type="radio"
                  name="twitterCard"
                  checked={twitterCard === 'summary_large_image'}
                  onChange={() => onChange({ ogTitle, ogDescription, ogImage, twitterCard: 'summary_large_image', twitterTitle, twitterDescription, twitterImage })}
                />
                <div>
                  <span className="text-sm font-medium">Large Image</span>
                  <p className="text-xs text-gray-500">Featured image</p>
                </div>
              </label>
            </div>
          </div>

          {/* Twitter Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <input
              type="text"
              value={twitterTitle}
              onChange={(e) => onChange({ ogTitle, ogDescription, ogImage, twitterCard, twitterTitle: e.target.value, twitterDescription, twitterImage })}
              placeholder={ogTitle || postTitle || 'Enter title for Twitter...'}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          {/* Twitter Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={twitterDescription}
              onChange={(e) => onChange({ ogTitle, ogDescription, ogImage, twitterCard, twitterTitle, twitterDescription: e.target.value, twitterImage })}
              placeholder="Enter description for Twitter..."
              rows={2}
              className="w-full px-3 py-2 text-sm border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          {/* Twitter Image */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Image URL</label>
            <input
              type="url"
              value={twitterImage}
              onChange={(e) => onChange({ ogTitle, ogDescription, ogImage, twitterCard, twitterTitle, twitterDescription, twitterImage: e.target.value })}
              placeholder={ogImage || 'https://example.com/image.jpg'}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ============== CUSTOM FIELDS PANEL ==============
interface CustomField {
  id: string;
  key: string;
  value: string;
}

interface CustomFieldsPanelProps {
  fields: CustomField[];
  onChange: (fields: CustomField[]) => void;
  className?: string;
}

export function CustomFieldsPanel({ fields = [], onChange, className }: CustomFieldsPanelProps) {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const addField = () => {
    if (newKey.trim() && newValue.trim()) {
      onChange([...fields, { id: `cf-${Date.now()}`, key: newKey.trim(), value: newValue.trim() }]);
      setNewKey('');
      setNewValue('');
    }
  };

  const updateField = (id: string, key: string, value: string) => {
    onChange(fields.map(f => f.id === id ? { ...f, key, value } : f));
  };

  const removeField = (id: string) => {
    onChange(fields.filter(f => f.id !== id));
  };

  const presets = [
    { key: 'featured', value: 'true', label: 'Featured Post' },
    { key: 'reading_time', value: '5 min', label: 'Reading Time' },
    { key: 'difficulty', value: 'beginner', label: 'Difficulty Level' },
    { key: 'source_url', value: '', label: 'Source URL' },
  ];

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Hash className="w-4 h-4 text-purple-500" />
          Custom Fields
        </h3>
        <span className="text-xs text-gray-500">{fields.length} fields</span>
      </div>

      {/* Existing Fields */}
      {fields.length > 0 && (
        <div className="space-y-2">
          {fields.map(field => (
            <div key={field.id} className="flex gap-2 items-start">
              <input
                type="text"
                value={field.key}
                onChange={(e) => updateField(field.id, e.target.value, field.value)}
                placeholder="Key"
                className="flex-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-700"
              />
              <input
                type="text"
                value={field.value}
                onChange={(e) => updateField(field.id, field.key, e.target.value)}
                placeholder="Value"
                className="flex-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-700"
              />
              <button
                onClick={() => removeField(field.id)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Field */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
        <p className="text-xs font-medium text-gray-500 uppercase">Add New Field</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="Key name"
            className="flex-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
          />
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="Value"
            className="flex-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
          />
          <button
            onClick={addField}
            disabled={!newKey.trim() || !newValue.trim()}
            className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-500 uppercase">Quick Presets</p>
        <div className="flex flex-wrap gap-2">
          {presets.filter(p => !fields.some(f => f.key === p.key)).map(preset => (
            <button
              key={preset.key}
              onClick={() => onChange([...fields, { id: `cf-${Date.now()}`, key: preset.key, value: preset.value }])}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded transition-colors"
            >
              + {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============== POST FORMAT PANEL ==============
type PostFormatType = 'standard' | 'aside' | 'gallery' | 'link' | 'image' | 'quote' | 'status' | 'video' | 'audio' | 'chat';

interface PostFormatPanelProps {
  format: PostFormatType;
  formatData: Record<string, string>;
  onChange: (format: PostFormatType, formatData: Record<string, string>) => void;
  className?: string;
}

export function PostFormatPanel({ format = 'standard', formatData = {}, onChange, className }: PostFormatPanelProps) {
  const formats: { value: PostFormatType; label: string; icon: React.ReactNode; description: string }[] = [
    { value: 'standard', label: 'Standard', icon: <FileText size={16} />, description: 'Regular blog post' },
    { value: 'aside', label: 'Aside', icon: <FileText size={16} />, description: 'Short, concise note' },
    { value: 'gallery', label: 'Gallery', icon: <Grid size={16} />, description: 'Image collection' },
    { value: 'link', label: 'Link', icon: <ExternalLink size={16} />, description: 'External link focus' },
    { value: 'image', label: 'Image', icon: <Eye size={16} />, description: 'Single image post' },
    { value: 'quote', label: 'Quote', icon: <FileText size={16} />, description: 'Quotation highlight' },
    { value: 'status', label: 'Status', icon: <FileText size={16} />, description: 'Short status update' },
    { value: 'video', label: 'Video', icon: <Eye size={16} />, description: 'Video content' },
    { value: 'audio', label: 'Audio', icon: <FileText size={16} />, description: 'Podcast/audio post' },
    { value: 'chat', label: 'Chat', icon: <MessageSquare size={16} />, description: 'Conversation log' },
  ];

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Header */}
      <h3 className="font-semibold flex items-center gap-2">
        <Layout className="w-4 h-4 text-pink-500" />
        Post Format
      </h3>

      {/* Format Grid */}
      <div className="grid grid-cols-2 gap-2">
        {formats.map(f => (
          <button
            key={f.value}
            onClick={() => onChange(f.value, formatData)}
            className={clsx(
              'flex flex-col items-start p-3 rounded-lg border-2 transition-all text-left',
              format === f.value
                ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-pink-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            )}
          >
            <div className={clsx(
              'p-1.5 rounded-lg mb-2',
              format === f.value ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 dark:bg-gray-700'
            )}>
              {f.icon}
            </div>
            <span className="text-sm font-medium">{f.label}</span>
            <span className="text-xs text-gray-500">{f.description}</span>
          </button>
        ))}
      </div>

      {/* Format-specific Options */}
      {format === 'link' && (
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
          <label className="text-sm font-medium">Link URL</label>
          <input
            type="url"
            value={formatData.url || ''}
            onChange={(e) => onChange(format, { ...formatData, url: e.target.value })}
            placeholder="https://example.com"
            className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
      )}

      {format === 'quote' && (
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
          <label className="text-sm font-medium">Quote Source</label>
          <input
            type="text"
            value={formatData.source || ''}
            onChange={(e) => onChange(format, { ...formatData, source: e.target.value })}
            placeholder="Author name or source"
            className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
      )}

      {(format === 'video' || format === 'audio') && (
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
          <label className="text-sm font-medium">{format === 'video' ? 'Video' : 'Audio'} URL</label>
          <input
            type="url"
            value={formatData.mediaUrl || ''}
            onChange={(e) => onChange(format, { ...formatData, mediaUrl: e.target.value })}
            placeholder="Embed URL or file URL"
            className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
      )}
    </div>
  );
}

// ============== TEMPLATE PANEL ==============
interface Template {
  id: string;
  name: string;
  description: string;
  preview?: string;
}

interface TemplatePanelProps {
  selectedTemplate: string;
  onChange: (templateId: string) => void;
  className?: string;
}

export function TemplatePanel({ selectedTemplate = 'default', onChange, className }: TemplatePanelProps) {
  const templates: Template[] = [
    { id: 'default', name: 'Default', description: 'Standard blog layout with sidebar' },
    { id: 'full-width', name: 'Full Width', description: 'Content spans entire width' },
    { id: 'no-sidebar', name: 'No Sidebar', description: 'Clean, focused reading experience' },
    { id: 'landing', name: 'Landing Page', description: 'Marketing-focused layout' },
    { id: 'documentation', name: 'Documentation', description: 'Technical docs with TOC' },
    { id: 'portfolio', name: 'Portfolio', description: 'Visual showcase layout' },
  ];

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Header */}
      <h3 className="font-semibold flex items-center gap-2">
        <Grid className="w-4 h-4 text-indigo-500" />
        Template
      </h3>

      {/* Template List */}
      <div className="space-y-2">
        {templates.map(template => (
          <button
            key={template.id}
            onClick={() => onChange(template.id)}
            className={clsx(
              'w-full flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left',
              selectedTemplate === template.id
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            )}
          >
            <div className={clsx(
              'w-12 h-8 rounded border flex items-center justify-center',
              selectedTemplate === template.id ? 'bg-indigo-100 border-indigo-300' : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
            )}>
              <Grid size={14} className={selectedTemplate === template.id ? 'text-indigo-600' : 'text-gray-400'} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{template.name}</span>
                {selectedTemplate === template.id && (
                  <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded dark:bg-indigo-900/30 dark:text-indigo-300">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">{template.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============== ATTRIBUTES PANEL ==============
interface AttributesPanelProps {
  sticky: boolean;
  featured: boolean;
  sponsored: boolean;
  editorsPick: boolean;
  customClass: string;
  customId: string;
  onChange: (attrs: {
    sticky: boolean;
    featured: boolean;
    sponsored: boolean;
    editorsPick: boolean;
    customClass: string;
    customId: string;
  }) => void;
  className?: string;
}

export function AttributesPanel({
  sticky = false,
  featured = false,
  sponsored = false,
  editorsPick = false,
  customClass = '',
  customId = '',
  onChange,
  className
}: AttributesPanelProps) {
  return (
    <div className={clsx('space-y-4', className)}>
      {/* Header */}
      <h3 className="font-semibold flex items-center gap-2">
        <Layers className="w-4 h-4 text-teal-500" />
        Attributes
      </h3>

      {/* Toggles */}
      <div className="space-y-2">
        <label
          className={clsx(
            'flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all',
            sticky
              ? 'border-teal-300 bg-teal-50 dark:border-teal-700 dark:bg-teal-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
          )}
        >
          <div>
            <span className="text-sm font-medium">Sticky Post</span>
            <p className="text-xs text-gray-500">Pin to top of blog</p>
          </div>
          <input
            type="checkbox"
            checked={sticky}
            onChange={(e) => onChange({ sticky: e.target.checked, featured, sponsored, editorsPick, customClass, customId })}
            className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500"
          />
        </label>

        <label
          className={clsx(
            'flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all',
            featured
              ? 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
          )}
        >
          <div>
            <span className="text-sm font-medium">Featured</span>
            <p className="text-xs text-gray-500">Show in featured section</p>
          </div>
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => onChange({ sticky, featured: e.target.checked, sponsored, editorsPick, customClass, customId })}
            className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500"
          />
        </label>

        <label
          className={clsx(
            'flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all',
            sponsored
              ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
          )}
        >
          <div>
            <span className="text-sm font-medium">Sponsored</span>
            <p className="text-xs text-gray-500">Mark as sponsored content</p>
          </div>
          <input
            type="checkbox"
            checked={sponsored}
            onChange={(e) => onChange({ sticky, featured, sponsored: e.target.checked, editorsPick, customClass, customId })}
            className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
          />
        </label>

        <label
          className={clsx(
            'flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all',
            editorsPick
              ? 'border-purple-300 bg-purple-50 dark:border-purple-700 dark:bg-purple-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
          )}
        >
          <div>
            <span className="text-sm font-medium">Editor's Pick</span>
            <p className="text-xs text-gray-500">Highlight as recommended</p>
          </div>
          <input
            type="checkbox"
            checked={editorsPick}
            onChange={(e) => onChange({ sticky, featured, sponsored, editorsPick: e.target.checked, customClass, customId })}
            className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500"
          />
        </label>
      </div>

      {/* Custom CSS/ID */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
        <p className="text-xs font-medium text-gray-500 uppercase">Advanced</p>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">CSS Class</label>
            <input
              type="text"
              value={customClass}
              onChange={(e) => onChange({ sticky, featured, sponsored, editorsPick, customClass: e.target.value, customId })}
              placeholder="e.g., featured-post highlight"
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Custom ID</label>
            <input
              type="text"
              value={customId}
              onChange={(e) => onChange({ sticky, featured, sponsored, editorsPick, customClass, customId: e.target.value })}
              placeholder="e.g., my-post-id"
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============== RELATED POSTS PANEL ==============
interface RelatedPost {
  id: string;
  title: string;
  thumbnail?: string;
  date: string;
}

interface RelatedPostsPanelProps {
  selectedPosts: string[];
  onChange: (postIds: string[]) => void;
  className?: string;
}

export function RelatedPostsPanel({ selectedPosts = [], onChange, className }: RelatedPostsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Sample posts - replace with API
  const availablePosts: RelatedPost[] = [
    { id: 'p1', title: 'Getting Started with React', date: '2024-01-15' },
    { id: 'p2', title: 'Advanced TypeScript Patterns', date: '2024-01-10' },
    { id: 'p3', title: 'Building REST APIs', date: '2024-01-05' },
    { id: 'p4', title: 'CSS Grid Layout Guide', date: '2024-01-01' },
    { id: 'p5', title: 'JavaScript Best Practices', date: '2023-12-20' },
  ];

  const filteredPosts = availablePosts.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const togglePost = (postId: string) => {
    if (selectedPosts.includes(postId)) {
      onChange(selectedPosts.filter(id => id !== postId));
    } else {
      onChange([...selectedPosts, postId]);
    }
  };

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-amber-500" />
          Related Posts
        </h3>
        <span className="text-xs text-gray-500">{selectedPosts.length} selected</span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-800 dark:border-gray-700"
        />
      </div>

      {/* Selected Posts */}
      {selectedPosts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase">Selected</p>
          {selectedPosts.map(postId => {
            const post = availablePosts.find(p => p.id === postId);
            return post ? (
              <div key={postId} className="flex items-center justify-between p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <span className="text-sm">{post.title}</span>
                <button
                  onClick={() => togglePost(postId)}
                  className="p-1 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-800 rounded"
                >
                  <X size={14} />
                </button>
              </div>
            ) : null;
          })}
        </div>
      )}

      {/* Available Posts */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {filteredPosts.filter(p => !selectedPosts.includes(p.id)).map(post => (
          <button
            key={post.id}
            onClick={() => togglePost(post.id)}
            className="w-full flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-left transition-colors"
          >
            <div>
              <p className="text-sm">{post.title}</p>
              <p className="text-xs text-gray-500">{post.date}</p>
            </div>
            <Plus size={14} className="text-gray-400" />
          </button>
        ))}
      </div>

      {/* Auto-suggest */}
      <button className="flex items-center gap-2 w-full px-3 py-2 text-sm bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-300 rounded-lg transition-colors">
        <Sparkles size={14} />
        Auto-suggest related posts
      </button>
    </div>
  );
}

// ============== SERIES PANEL ==============
interface Series {
  id: string;
  name: string;
  postCount: number;
}

interface SeriesPanelProps {
  selectedSeries: string | null;
  seriesOrder: number;
  onChange: (seriesId: string | null, order: number) => void;
  className?: string;
}

export function SeriesPanel({ selectedSeries = null, seriesOrder = 1, onChange, className }: SeriesPanelProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newSeriesName, setNewSeriesName] = useState('');

  const seriesList: Series[] = [
    { id: 's1', name: 'React Fundamentals', postCount: 5 },
    { id: 's2', name: 'TypeScript Deep Dive', postCount: 8 },
    { id: 's3', name: 'Building APIs', postCount: 3 },
  ];

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Header */}
      <h3 className="font-semibold flex items-center gap-2">
        <Layers className="w-4 h-4 text-cyan-500" />
        Series
      </h3>

      <p className="text-sm text-gray-500">
        Group related posts into a series for sequential reading.
      </p>

      {/* Series List */}
      <div className="space-y-2">
        <button
          onClick={() => onChange(null, 1)}
          className={clsx(
            'w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left',
            !selectedSeries
              ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-cyan-300'
          )}
        >
          <span className="text-sm">No series</span>
        </button>

        {seriesList.map(series => (
          <button
            key={series.id}
            onClick={() => onChange(series.id, 1)}
            className={clsx(
              'w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all text-left',
              selectedSeries === series.id
                ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-cyan-300'
            )}
          >
            <div>
              <span className="text-sm font-medium">{series.name}</span>
              <p className="text-xs text-gray-500">{series.postCount} posts</p>
            </div>
            {selectedSeries === series.id && (
              <Check size={16} className="text-cyan-600" />
            )}
          </button>
        ))}
      </div>

      {/* Series Order */}
      {selectedSeries && (
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
          <label className="text-sm font-medium">Position in Series</label>
          <input
            type="number"
            min={1}
            value={seriesOrder}
            onChange={(e) => onChange(selectedSeries, parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
      )}

      {/* Create New Series */}
      {isCreating ? (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Series name"
            value={newSeriesName}
            onChange={(e) => setNewSeriesName(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-gray-800 dark:border-gray-700"
            autoFocus
          />
          <button
            onClick={() => { setIsCreating(false); setNewSeriesName(''); }}
            className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Create New Series
        </button>
      )}
    </div>
  );
}

// ============== LOCATION PANEL ==============
interface LocationPanelProps {
  location: {
    name: string;
    latitude: number | null;
    longitude: number | null;
    address: string;
  };
  onChange: (location: { name: string; latitude: number | null; longitude: number | null; address: string }) => void;
  className?: string;
}

export function LocationPanel({
  location = { name: '', latitude: null, longitude: null, address: '' },
  onChange,
  className
}: LocationPanelProps) {
  const [isSearching, setIsSearching] = useState(false);

  const detectLocation = () => {
    setIsSearching(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onChange({
            ...location,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setIsSearching(false);
        },
        () => setIsSearching(false)
      );
    } else {
      setIsSearching(false);
    }
  };

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Header */}
      <h3 className="font-semibold flex items-center gap-2">
        <Target className="w-4 h-4 text-green-500" />
        Location
      </h3>

      <p className="text-sm text-gray-500">
        Add location data to your post for geo-tagging.
      </p>

      {/* Location Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Location Name</label>
        <input
          type="text"
          value={location.name}
          onChange={(e) => onChange({ ...location, name: e.target.value })}
          placeholder="e.g., San Francisco, CA"
          className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:border-gray-700"
        />
      </div>

      {/* Address */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Address</label>
        <textarea
          value={location.address}
          onChange={(e) => onChange({ ...location, address: e.target.value })}
          placeholder="Full address (optional)"
          rows={2}
          className="w-full px-3 py-2 text-sm border rounded-lg resize-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:border-gray-700"
        />
      </div>

      {/* Coordinates */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Latitude</label>
          <input
            type="number"
            step="0.000001"
            value={location.latitude || ''}
            onChange={(e) => onChange({ ...location, latitude: parseFloat(e.target.value) || null })}
            placeholder="37.7749"
            className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:border-gray-700"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Longitude</label>
          <input
            type="number"
            step="0.000001"
            value={location.longitude || ''}
            onChange={(e) => onChange({ ...location, longitude: parseFloat(e.target.value) || null })}
            placeholder="-122.4194"
            className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:border-gray-700"
          />
        </div>
      </div>

      {/* Detect Location Button */}
      <button
        onClick={detectLocation}
        disabled={isSearching}
        className="flex items-center gap-2 w-full px-3 py-2 text-sm bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 rounded-lg transition-colors disabled:opacity-50"
      >
        {isSearching ? (
          <>
            <RefreshCw size={14} className="animate-spin" />
            Detecting...
          </>
        ) : (
          <>
            <Target size={14} />
            Detect Current Location
          </>
        )}
      </button>

      {/* Map Preview Placeholder */}
      {location.latitude && location.longitude && (
        <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <span className="text-sm text-gray-500">Map preview at {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</span>
        </div>
      )}
    </div>
  );
}

// ============== LANGUAGE PANEL ==============
interface LanguagePanelProps {
  language: string;
  translations: { language: string; postId: string }[];
  onChange: (language: string, translations: { language: string; postId: string }[]) => void;
  className?: string;
}

export function LanguagePanel({
  language = 'en',
  translations = [],
  onChange,
  className
}: LanguagePanelProps) {
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  ];

  const selectedLang = languages.find(l => l.code === language);

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Header */}
      <h3 className="font-semibold flex items-center gap-2">
        <Globe className="w-4 h-4 text-sky-500" />
        Language
      </h3>

      {/* Current Language */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Post Language</label>
        <select
          value={language}
          onChange={(e) => onChange(e.target.value, translations)}
          className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-sky-500 dark:bg-gray-800 dark:border-gray-700"
        >
          {languages.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Current Language Display */}
      {selectedLang && (
        <div className="flex items-center gap-3 p-3 bg-sky-50 dark:bg-sky-900/20 rounded-lg">
          <span className="text-2xl">{selectedLang.flag}</span>
          <div>
            <p className="text-sm font-medium">{selectedLang.name}</p>
            <p className="text-xs text-gray-500">Primary language for this post</p>
          </div>
        </div>
      )}

      {/* Translations */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Translations</label>
        {translations.length > 0 ? (
          <div className="space-y-2">
            {translations.map((t, i) => {
              const lang = languages.find(l => l.code === t.language);
              return (
                <div key={i} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span>{lang?.flag}</span>
                    <span className="text-sm">{lang?.name}</span>
                  </div>
                  <button className="text-xs text-blue-600 hover:underline">
                    View
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            No translations linked yet
          </p>
        )}
      </div>

      {/* Add Translation */}
      <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-colors">
        <Plus size={16} />
        Link Translation
      </button>
    </div>
  );
}

// ============== VISUAL ELEMENTS PANELS ==============

// Carousel Configuration Panel
interface CarouselConfigPanelProps {
  config: {
    autoplay: boolean;
    autoplaySpeed: number;
    showDots: boolean;
    showArrows: boolean;
    infinite: boolean;
    slidesToShow: number;
    slidesToScroll: number;
    effect: 'slide' | 'fade' | 'cube' | 'flip';
    pauseOnHover: boolean;
    adaptiveHeight: boolean;
  };
  onChange: (config: CarouselConfigPanelProps['config']) => void;
  className?: string;
}

export function CarouselConfigPanel({ config, onChange, className }: CarouselConfigPanelProps) {
  return (
    <div className={clsx('p-4 space-y-4', className)}>
      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-indigo-500" />
        Carousel Settings
      </h3>

      {/* Autoplay */}
      <div className="space-y-3">
        <label className="flex items-center justify-between">
          <span className="text-sm font-medium">Autoplay</span>
          <button
            onClick={() => onChange({ ...config, autoplay: !config.autoplay })}
            className={clsx(
              'w-10 h-6 rounded-full transition-colors relative',
              config.autoplay ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'
            )}
          >
            <span className={clsx(
              'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
              config.autoplay ? 'translate-x-5' : 'translate-x-1'
            )} />
          </button>
        </label>

        {config.autoplay && (
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Speed (ms)</label>
            <input
              type="number"
              value={config.autoplaySpeed}
              onChange={(e) => onChange({ ...config, autoplaySpeed: parseInt(e.target.value) })}
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              min={1000}
              max={10000}
              step={500}
            />
          </div>
        )}
      </div>

      {/* Effect */}
      <div>
        <label className="text-sm font-medium">Transition Effect</label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {(['slide', 'fade', 'cube', 'flip'] as const).map(effect => (
            <button
              key={effect}
              onClick={() => onChange({ ...config, effect })}
              className={clsx(
                'px-3 py-2 text-sm rounded-lg border transition-colors capitalize',
                config.effect === effect
                  ? 'bg-indigo-100 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700'
              )}
            >
              {effect}
            </button>
          ))}
        </div>
      </div>

      {/* Slides to Show */}
      <div>
        <label className="text-sm font-medium">Slides to Show</label>
        <input
          type="range"
          value={config.slidesToShow}
          onChange={(e) => onChange({ ...config, slidesToShow: parseInt(e.target.value) })}
          min={1}
          max={5}
          className="w-full mt-2"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1</span>
          <span className="font-medium text-indigo-600">{config.slidesToShow}</span>
          <span>5</span>
        </div>
      </div>

      {/* Navigation Options */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Navigation</label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.showDots}
            onChange={(e) => onChange({ ...config, showDots: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">Show Dots</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.showArrows}
            onChange={(e) => onChange({ ...config, showArrows: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">Show Arrows</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.infinite}
            onChange={(e) => onChange({ ...config, infinite: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">Infinite Loop</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.pauseOnHover}
            onChange={(e) => onChange({ ...config, pauseOnHover: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">Pause on Hover</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.adaptiveHeight}
            onChange={(e) => onChange({ ...config, adaptiveHeight: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">Adaptive Height</span>
        </label>
      </div>
    </div>
  );
}

// Gallery Grid Configuration Panel
interface GalleryConfigPanelProps {
  config: {
    columns: number;
    gap: number;
    layout: 'grid' | 'masonry' | 'justified';
    thumbnailSize: 'small' | 'medium' | 'large';
    enableLightbox: boolean;
    showCaptions: boolean;
    captionPosition: 'below' | 'overlay';
    hoverEffect: 'zoom' | 'fade' | 'slide' | 'none';
    lazyLoad: boolean;
    borderRadius: number;
  };
  onChange: (config: GalleryConfigPanelProps['config']) => void;
  className?: string;
}

export function GalleryConfigPanel({ config, onChange, className }: GalleryConfigPanelProps) {
  return (
    <div className={clsx('p-4 space-y-4', className)}>
      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-500" />
        Gallery Settings
      </h3>

      {/* Layout */}
      <div>
        <label className="text-sm font-medium">Layout Style</label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {(['grid', 'masonry', 'justified'] as const).map(layout => (
            <button
              key={layout}
              onClick={() => onChange({ ...config, layout })}
              className={clsx(
                'px-3 py-2 text-sm rounded-lg border transition-colors capitalize',
                config.layout === layout
                  ? 'bg-cyan-100 border-cyan-500 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700'
              )}
            >
              {layout}
            </button>
          ))}
        </div>
      </div>

      {/* Columns */}
      <div>
        <label className="text-sm font-medium">Columns ({config.columns})</label>
        <input
          type="range"
          value={config.columns}
          onChange={(e) => onChange({ ...config, columns: parseInt(e.target.value) })}
          min={1}
          max={6}
          className="w-full mt-2"
        />
      </div>

      {/* Gap */}
      <div>
        <label className="text-sm font-medium">Gap ({config.gap}px)</label>
        <input
          type="range"
          value={config.gap}
          onChange={(e) => onChange({ ...config, gap: parseInt(e.target.value) })}
          min={0}
          max={32}
          step={4}
          className="w-full mt-2"
        />
      </div>

      {/* Border Radius */}
      <div>
        <label className="text-sm font-medium">Border Radius ({config.borderRadius}px)</label>
        <input
          type="range"
          value={config.borderRadius}
          onChange={(e) => onChange({ ...config, borderRadius: parseInt(e.target.value) })}
          min={0}
          max={24}
          className="w-full mt-2"
        />
      </div>

      {/* Thumbnail Size */}
      <div>
        <label className="text-sm font-medium">Thumbnail Size</label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {(['small', 'medium', 'large'] as const).map(size => (
            <button
              key={size}
              onClick={() => onChange({ ...config, thumbnailSize: size })}
              className={clsx(
                'px-3 py-2 text-sm rounded-lg border transition-colors capitalize',
                config.thumbnailSize === size
                  ? 'bg-cyan-100 border-cyan-500 text-cyan-700 dark:bg-cyan-900/30'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700'
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Hover Effect */}
      <div>
        <label className="text-sm font-medium">Hover Effect</label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {(['zoom', 'fade', 'slide', 'none'] as const).map(effect => (
            <button
              key={effect}
              onClick={() => onChange({ ...config, hoverEffect: effect })}
              className={clsx(
                'px-3 py-2 text-sm rounded-lg border transition-colors capitalize',
                config.hoverEffect === effect
                  ? 'bg-cyan-100 border-cyan-500 text-cyan-700 dark:bg-cyan-900/30'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700'
              )}
            >
              {effect}
            </button>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Display Options</label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.enableLightbox}
            onChange={(e) => onChange({ ...config, enableLightbox: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">Enable Lightbox</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.showCaptions}
            onChange={(e) => onChange({ ...config, showCaptions: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">Show Captions</span>
        </label>
        {config.showCaptions && (
          <div className="ml-6">
            <select
              value={config.captionPosition}
              onChange={(e) => onChange({ ...config, captionPosition: e.target.value as 'below' | 'overlay' })}
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="below">Below Image</option>
              <option value="overlay">Overlay</option>
            </select>
          </div>
        )}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.lazyLoad}
            onChange={(e) => onChange({ ...config, lazyLoad: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">Lazy Load Images</span>
        </label>
      </div>
    </div>
  );
}

// Before/After Slider Configuration Panel
interface BeforeAfterConfigPanelProps {
  config: {
    orientation: 'horizontal' | 'vertical';
    defaultPosition: number;
    showLabels: boolean;
    beforeLabel: string;
    afterLabel: string;
    moveOnHover: boolean;
    moveOnClick: boolean;
    handleStyle: 'line' | 'circle' | 'arrows';
    handleColor: string;
    overlayOpacity: number;
    smooth: boolean;
  };
  onChange: (config: BeforeAfterConfigPanelProps['config']) => void;
  className?: string;
}

export function BeforeAfterConfigPanel({ config, onChange, className }: BeforeAfterConfigPanelProps) {
  return (
    <div className={clsx('p-4 space-y-4', className)}>
      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-teal-500" />
        Before/After Settings
      </h3>

      {/* Orientation */}
      <div>
        <label className="text-sm font-medium">Orientation</label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {(['horizontal', 'vertical'] as const).map(orient => (
            <button
              key={orient}
              onClick={() => onChange({ ...config, orientation: orient })}
              className={clsx(
                'px-3 py-2 text-sm rounded-lg border transition-colors capitalize',
                config.orientation === orient
                  ? 'bg-teal-100 border-teal-500 text-teal-700 dark:bg-teal-900/30'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700'
              )}
            >
              {orient}
            </button>
          ))}
        </div>
      </div>

      {/* Default Position */}
      <div>
        <label className="text-sm font-medium">Default Position ({config.defaultPosition}%)</label>
        <input
          type="range"
          value={config.defaultPosition}
          onChange={(e) => onChange({ ...config, defaultPosition: parseInt(e.target.value) })}
          min={0}
          max={100}
          className="w-full mt-2"
        />
      </div>

      {/* Labels */}
      <div className="space-y-3">
        <label className="flex items-center justify-between">
          <span className="text-sm font-medium">Show Labels</span>
          <button
            onClick={() => onChange({ ...config, showLabels: !config.showLabels })}
            className={clsx(
              'w-10 h-6 rounded-full transition-colors relative',
              config.showLabels ? 'bg-teal-500' : 'bg-gray-300 dark:bg-gray-600'
            )}
          >
            <span className={clsx(
              'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
              config.showLabels ? 'translate-x-5' : 'translate-x-1'
            )} />
          </button>
        </label>

        {config.showLabels && (
          <div className="space-y-2">
            <input
              type="text"
              value={config.beforeLabel}
              onChange={(e) => onChange({ ...config, beforeLabel: e.target.value })}
              placeholder="Before label"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            />
            <input
              type="text"
              value={config.afterLabel}
              onChange={(e) => onChange({ ...config, afterLabel: e.target.value })}
              placeholder="After label"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
        )}
      </div>

      {/* Handle Style */}
      <div>
        <label className="text-sm font-medium">Handle Style</label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {(['line', 'circle', 'arrows'] as const).map(style => (
            <button
              key={style}
              onClick={() => onChange({ ...config, handleStyle: style })}
              className={clsx(
                'px-3 py-2 text-sm rounded-lg border transition-colors capitalize',
                config.handleStyle === style
                  ? 'bg-teal-100 border-teal-500 text-teal-700 dark:bg-teal-900/30'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700'
              )}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Handle Color */}
      <div>
        <label className="text-sm font-medium">Handle Color</label>
        <div className="flex gap-2 mt-2">
          {['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#fff'].map(color => (
            <button
              key={color}
              onClick={() => onChange({ ...config, handleColor: color })}
              className={clsx(
                'w-8 h-8 rounded-lg border-2 transition-all',
                config.handleColor === color ? 'scale-110 ring-2 ring-offset-2 ring-teal-500' : ''
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Interaction Options */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Interaction</label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.moveOnHover}
            onChange={(e) => onChange({ ...config, moveOnHover: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">Move on Hover</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.moveOnClick}
            onChange={(e) => onChange({ ...config, moveOnClick: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">Move on Click</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.smooth}
            onChange={(e) => onChange({ ...config, smooth: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">Smooth Animation</span>
        </label>
      </div>
    </div>
  );
}

// Table Editor Configuration Panel
interface TableConfigPanelProps {
  config: {
    theme: 'default' | 'striped' | 'bordered' | 'minimal';
    headerStyle: 'filled' | 'bordered' | 'none';
    enableSorting: boolean;
    enableFiltering: boolean;
    enablePagination: boolean;
    rowsPerPage: number;
    enableSearch: boolean;
    stickyHeader: boolean;
    responsive: 'scroll' | 'stack' | 'hide';
    cellPadding: 'compact' | 'normal' | 'spacious';
    alignment: 'left' | 'center' | 'right';
    showRowNumbers: boolean;
  };
  onChange: (config: TableConfigPanelProps['config']) => void;
  className?: string;
}

export function TableConfigPanel({ config, onChange, className }: TableConfigPanelProps) {
  return (
    <div className={clsx('p-4 space-y-4', className)}>
      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        Table Settings
      </h3>

      {/* Theme */}
      <div>
        <label className="text-sm font-medium">Table Theme</label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {(['default', 'striped', 'bordered', 'minimal'] as const).map(theme => (
            <button
              key={theme}
              onClick={() => onChange({ ...config, theme })}
              className={clsx(
                'px-3 py-2 text-sm rounded-lg border transition-colors capitalize',
                config.theme === theme
                  ? 'bg-emerald-100 border-emerald-500 text-emerald-700 dark:bg-emerald-900/30'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700'
              )}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>

      {/* Header Style */}
      <div>
        <label className="text-sm font-medium">Header Style</label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {(['filled', 'bordered', 'none'] as const).map(style => (
            <button
              key={style}
              onClick={() => onChange({ ...config, headerStyle: style })}
              className={clsx(
                'px-3 py-2 text-sm rounded-lg border transition-colors capitalize',
                config.headerStyle === style
                  ? 'bg-emerald-100 border-emerald-500 text-emerald-700 dark:bg-emerald-900/30'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700'
              )}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Cell Padding */}
      <div>
        <label className="text-sm font-medium">Cell Padding</label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {(['compact', 'normal', 'spacious'] as const).map(padding => (
            <button
              key={padding}
              onClick={() => onChange({ ...config, cellPadding: padding })}
              className={clsx(
                'px-3 py-2 text-sm rounded-lg border transition-colors capitalize',
                config.cellPadding === padding
                  ? 'bg-emerald-100 border-emerald-500 text-emerald-700 dark:bg-emerald-900/30'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700'
              )}
            >
              {padding}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Behavior */}
      <div>
        <label className="text-sm font-medium">Responsive Behavior</label>
        <select
          value={config.responsive}
          onChange={(e) => onChange({ ...config, responsive: e.target.value as 'scroll' | 'stack' | 'hide' })}
          className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 mt-2"
        >
          <option value="scroll">Horizontal Scroll</option>
          <option value="stack">Stack Columns</option>
          <option value="hide">Hide Columns</option>
        </select>
      </div>

      {/* Features */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Features</label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.enableSorting}
            onChange={(e) => onChange({ ...config, enableSorting: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">Enable Sorting</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.enableFiltering}
            onChange={(e) => onChange({ ...config, enableFiltering: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">Enable Filtering</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.enableSearch}
            onChange={(e) => onChange({ ...config, enableSearch: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">Enable Search</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.enablePagination}
            onChange={(e) => onChange({ ...config, enablePagination: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">Enable Pagination</span>
        </label>
        {config.enablePagination && (
          <div className="ml-6">
            <label className="text-xs text-gray-500">Rows per page</label>
            <input
              type="number"
              value={config.rowsPerPage}
              onChange={(e) => onChange({ ...config, rowsPerPage: parseInt(e.target.value) })}
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              min={5}
              max={100}
            />
          </div>
        )}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.stickyHeader}
            onChange={(e) => onChange({ ...config, stickyHeader: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">Sticky Header</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.showRowNumbers}
            onChange={(e) => onChange({ ...config, showRowNumbers: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">Show Row Numbers</span>
        </label>
      </div>
    </div>
  );
}

// Embed Configuration Panel
interface EmbedConfigPanelProps {
  config: {
    provider: 'youtube' | 'vimeo' | 'twitter' | 'instagram' | 'tiktok' | 'spotify' | 'soundcloud' | 'codepen' | 'custom';
    aspectRatio: '16:9' | '4:3' | '1:1' | '9:16' | 'auto';
    maxWidth: number;
    alignment: 'left' | 'center' | 'right';
    autoplay: boolean;
    loop: boolean;
    muted: boolean;
    showControls: boolean;
    lazyLoad: boolean;
    privacyMode: boolean;
    showCaption: boolean;
    caption: string;
  };
  onChange: (config: EmbedConfigPanelProps['config']) => void;
  className?: string;
}

export function EmbedConfigPanel({ config, onChange, className }: EmbedConfigPanelProps) {
  const providers = [
    { id: 'youtube', name: 'YouTube', color: 'red' },
    { id: 'vimeo', name: 'Vimeo', color: 'blue' },
    { id: 'twitter', name: 'Twitter/X', color: 'sky' },
    { id: 'instagram', name: 'Instagram', color: 'pink' },
    { id: 'tiktok', name: 'TikTok', color: 'purple' },
    { id: 'spotify', name: 'Spotify', color: 'green' },
    { id: 'soundcloud', name: 'SoundCloud', color: 'orange' },
    { id: 'codepen', name: 'CodePen', color: 'gray' },
    { id: 'custom', name: 'Custom', color: 'slate' },
  ] as const;

  return (
    <div className={clsx('p-4 space-y-4', className)}>
      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-violet-500" />
        Embed Settings
      </h3>

      {/* Provider */}
      <div>
        <label className="text-sm font-medium">Provider</label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {providers.map(provider => (
            <button
              key={provider.id}
              onClick={() => onChange({ ...config, provider: provider.id as EmbedConfigPanelProps['config']['provider'] })}
              className={clsx(
                'px-2 py-2 text-xs rounded-lg border transition-colors',
                config.provider === provider.id
                  ? 'bg-violet-100 border-violet-500 text-violet-700 dark:bg-violet-900/30'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700'
              )}
            >
              {provider.name}
            </button>
          ))}
        </div>
      </div>

      {/* Aspect Ratio */}
      <div>
        <label className="text-sm font-medium">Aspect Ratio</label>
        <div className="flex gap-2 mt-2">
          {(['16:9', '4:3', '1:1', '9:16', 'auto'] as const).map(ratio => (
            <button
              key={ratio}
              onClick={() => onChange({ ...config, aspectRatio: ratio })}
              className={clsx(
                'px-3 py-2 text-sm rounded-lg border transition-colors',
                config.aspectRatio === ratio
                  ? 'bg-violet-100 border-violet-500 text-violet-700 dark:bg-violet-900/30'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700'
              )}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>

      {/* Max Width */}
      <div>
        <label className="text-sm font-medium">Max Width ({config.maxWidth}px)</label>
        <input
          type="range"
          value={config.maxWidth}
          onChange={(e) => onChange({ ...config, maxWidth: parseInt(e.target.value) })}
          min={320}
          max={1200}
          step={40}
          className="w-full mt-2"
        />
      </div>

      {/* Alignment */}
      <div>
        <label className="text-sm font-medium">Alignment</label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {(['left', 'center', 'right'] as const).map(align => (
            <button
              key={align}
              onClick={() => onChange({ ...config, alignment: align })}
              className={clsx(
                'px-3 py-2 text-sm rounded-lg border transition-colors capitalize',
                config.alignment === align
                  ? 'bg-violet-100 border-violet-500 text-violet-700 dark:bg-violet-900/30'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700'
              )}
            >
              {align}
            </button>
          ))}
        </div>
      </div>

      {/* Video Options (for video providers) */}
      {['youtube', 'vimeo', 'tiktok'].includes(config.provider) && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Video Options</label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.autoplay}
              onChange={(e) => onChange({ ...config, autoplay: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Autoplay</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.loop}
              onChange={(e) => onChange({ ...config, loop: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Loop</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.muted}
              onChange={(e) => onChange({ ...config, muted: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Start Muted</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.showControls}
              onChange={(e) => onChange({ ...config, showControls: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Show Controls</span>
          </label>
        </div>
      )}

      {/* General Options */}
      <div className="space-y-2">
        <label className="text-sm font-medium">General</label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.lazyLoad}
            onChange={(e) => onChange({ ...config, lazyLoad: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">Lazy Load</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.privacyMode}
            onChange={(e) => onChange({ ...config, privacyMode: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">Privacy Mode (no cookies)</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.showCaption}
            onChange={(e) => onChange({ ...config, showCaption: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">Show Caption</span>
        </label>
        {config.showCaption && (
          <input
            type="text"
            value={config.caption}
            onChange={(e) => onChange({ ...config, caption: e.target.value })}
            placeholder="Enter caption..."
            className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          />
        )}
      </div>
    </div>
  );
}

// ============== SEO & ANALYSIS PANELS ==============

// SEO Analyzer Configuration Panel
interface SEOAnalyzerConfigPanelProps {
  config: {
    focusKeyword: string;
    enableRealTimeAnalysis: boolean;
    checkTitleLength: boolean;
    checkMetaDescription: boolean;
    checkHeadingStructure: boolean;
    checkImageAltTags: boolean;
    checkInternalLinks: boolean;
    checkExternalLinks: boolean;
    checkKeywordDensity: boolean;
    targetDensity: number;
    checkReadability: boolean;
    targetGrade: number;
    enableSchemaValidation: boolean;
    showScoreBreakdown: boolean;
  };
  onChange: (config: SEOAnalyzerConfigPanelProps['config']) => void;
  className?: string;
}

export function SEOAnalyzerConfigPanel({ config, onChange, className }: SEOAnalyzerConfigPanelProps) {
  return (
    <div className={clsx('p-4 space-y-4', className)}>
      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-orange-500" />
        SEO Analyzer Settings
      </h3>

      {/* Focus Keyword */}
      <div>
        <label className="text-sm font-medium">Focus Keyword</label>
        <input
          type="text"
          value={config.focusKeyword}
          onChange={(e) => onChange({ ...config, focusKeyword: e.target.value })}
          placeholder="Enter focus keyword..."
          className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 mt-2"
        />
      </div>

      {/* Real-time Analysis */}
      <label className="flex items-center justify-between">
        <span className="text-sm font-medium">Real-time Analysis</span>
        <button
          onClick={() => onChange({ ...config, enableRealTimeAnalysis: !config.enableRealTimeAnalysis })}
          className={clsx(
            'w-10 h-6 rounded-full transition-colors relative',
            config.enableRealTimeAnalysis ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'
          )}
        >
          <span className={clsx(
            'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
            config.enableRealTimeAnalysis ? 'translate-x-5' : 'translate-x-1'
          )} />
        </button>
      </label>

      {/* Checks */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Analysis Checks</label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.checkTitleLength} onChange={(e) => onChange({ ...config, checkTitleLength: e.target.checked })} className="rounded" />
          <span className="text-sm">Title Length (50-60 chars)</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.checkMetaDescription} onChange={(e) => onChange({ ...config, checkMetaDescription: e.target.checked })} className="rounded" />
          <span className="text-sm">Meta Description (150-160 chars)</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.checkHeadingStructure} onChange={(e) => onChange({ ...config, checkHeadingStructure: e.target.checked })} className="rounded" />
          <span className="text-sm">Heading Structure (H1-H6)</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.checkImageAltTags} onChange={(e) => onChange({ ...config, checkImageAltTags: e.target.checked })} className="rounded" />
          <span className="text-sm">Image Alt Tags</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.checkInternalLinks} onChange={(e) => onChange({ ...config, checkInternalLinks: e.target.checked })} className="rounded" />
          <span className="text-sm">Internal Links</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.checkExternalLinks} onChange={(e) => onChange({ ...config, checkExternalLinks: e.target.checked })} className="rounded" />
          <span className="text-sm">External Links</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.checkKeywordDensity} onChange={(e) => onChange({ ...config, checkKeywordDensity: e.target.checked })} className="rounded" />
          <span className="text-sm">Keyword Density</span>
        </label>
        {config.checkKeywordDensity && (
          <div className="ml-6">
            <label className="text-xs text-gray-500">Target Density (%)</label>
            <input
              type="number"
              value={config.targetDensity}
              onChange={(e) => onChange({ ...config, targetDensity: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              min={0.5}
              max={3}
              step={0.1}
            />
          </div>
        )}
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.checkReadability} onChange={(e) => onChange({ ...config, checkReadability: e.target.checked })} className="rounded" />
          <span className="text-sm">Readability Score</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.enableSchemaValidation} onChange={(e) => onChange({ ...config, enableSchemaValidation: e.target.checked })} className="rounded" />
          <span className="text-sm">Schema Validation</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.showScoreBreakdown} onChange={(e) => onChange({ ...config, showScoreBreakdown: e.target.checked })} className="rounded" />
          <span className="text-sm">Show Score Breakdown</span>
        </label>
      </div>
    </div>
  );
}

// Readability Configuration Panel
interface ReadabilityConfigPanelProps {
  config: {
    formula: 'flesch-kincaid' | 'gunning-fog' | 'coleman-liau' | 'smog' | 'automated';
    targetGrade: number;
    highlightIssues: boolean;
    checkSentenceLength: boolean;
    maxSentenceLength: number;
    checkParagraphLength: boolean;
    maxParagraphLength: number;
    checkPassiveVoice: boolean;
    maxPassivePercentage: number;
    checkTransitionWords: boolean;
    minTransitionPercentage: number;
    checkConsecutiveSentences: boolean;
  };
  onChange: (config: ReadabilityConfigPanelProps['config']) => void;
  className?: string;
}

export function ReadabilityConfigPanel({ config, onChange, className }: ReadabilityConfigPanelProps) {
  return (
    <div className={clsx('p-4 space-y-4', className)}>
      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        Readability Settings
      </h3>

      {/* Formula */}
      <div>
        <label className="text-sm font-medium">Readability Formula</label>
        <select
          value={config.formula}
          onChange={(e) => onChange({ ...config, formula: e.target.value as ReadabilityConfigPanelProps['config']['formula'] })}
          className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 mt-2"
        >
          <option value="flesch-kincaid">Flesch-Kincaid</option>
          <option value="gunning-fog">Gunning Fog Index</option>
          <option value="coleman-liau">Coleman-Liau Index</option>
          <option value="smog">SMOG Index</option>
          <option value="automated">Automated Readability Index</option>
        </select>
      </div>

      {/* Target Grade */}
      <div>
        <label className="text-sm font-medium">Target Grade Level ({config.targetGrade})</label>
        <input
          type="range"
          value={config.targetGrade}
          onChange={(e) => onChange({ ...config, targetGrade: parseInt(e.target.value) })}
          min={5}
          max={18}
          className="w-full mt-2"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>5th Grade</span>
          <span>College</span>
        </div>
      </div>

      {/* Highlight Issues */}
      <label className="flex items-center justify-between">
        <span className="text-sm font-medium">Highlight Issues in Editor</span>
        <button
          onClick={() => onChange({ ...config, highlightIssues: !config.highlightIssues })}
          className={clsx(
            'w-10 h-6 rounded-full transition-colors relative',
            config.highlightIssues ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'
          )}
        >
          <span className={clsx(
            'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
            config.highlightIssues ? 'translate-x-5' : 'translate-x-1'
          )} />
        </button>
      </label>

      {/* Checks */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Checks</label>

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.checkSentenceLength} onChange={(e) => onChange({ ...config, checkSentenceLength: e.target.checked })} className="rounded" />
          <span className="text-sm">Sentence Length</span>
        </label>
        {config.checkSentenceLength && (
          <div className="ml-6">
            <label className="text-xs text-gray-500">Max words per sentence</label>
            <input type="number" value={config.maxSentenceLength} onChange={(e) => onChange({ ...config, maxSentenceLength: parseInt(e.target.value) })} className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700" min={15} max={40} />
          </div>
        )}

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.checkParagraphLength} onChange={(e) => onChange({ ...config, checkParagraphLength: e.target.checked })} className="rounded" />
          <span className="text-sm">Paragraph Length</span>
        </label>
        {config.checkParagraphLength && (
          <div className="ml-6">
            <label className="text-xs text-gray-500">Max words per paragraph</label>
            <input type="number" value={config.maxParagraphLength} onChange={(e) => onChange({ ...config, maxParagraphLength: parseInt(e.target.value) })} className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700" min={100} max={300} />
          </div>
        )}

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.checkPassiveVoice} onChange={(e) => onChange({ ...config, checkPassiveVoice: e.target.checked })} className="rounded" />
          <span className="text-sm">Passive Voice</span>
        </label>
        {config.checkPassiveVoice && (
          <div className="ml-6">
            <label className="text-xs text-gray-500">Max passive voice (%)</label>
            <input type="number" value={config.maxPassivePercentage} onChange={(e) => onChange({ ...config, maxPassivePercentage: parseInt(e.target.value) })} className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700" min={5} max={25} />
          </div>
        )}

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.checkTransitionWords} onChange={(e) => onChange({ ...config, checkTransitionWords: e.target.checked })} className="rounded" />
          <span className="text-sm">Transition Words</span>
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.checkConsecutiveSentences} onChange={(e) => onChange({ ...config, checkConsecutiveSentences: e.target.checked })} className="rounded" />
          <span className="text-sm">Consecutive Sentence Starts</span>
        </label>
      </div>
    </div>
  );
}

// Keywords Configuration Panel
interface KeywordsConfigPanelProps {
  config: {
    primaryKeyword: string;
    secondaryKeywords: string[];
    targetDensity: number;
    checkTitle: boolean;
    checkFirstParagraph: boolean;
    checkHeadings: boolean;
    checkMetaDescription: boolean;
    checkUrl: boolean;
    checkImageAlts: boolean;
    showDensityHighlight: boolean;
    warnOverOptimization: boolean;
    suggestRelatedKeywords: boolean;
  };
  onChange: (config: KeywordsConfigPanelProps['config']) => void;
  className?: string;
}

export function KeywordsConfigPanel({ config, onChange, className }: KeywordsConfigPanelProps) {
  const [newKeyword, setNewKeyword] = useState('');

  const addSecondaryKeyword = () => {
    if (newKeyword && !config.secondaryKeywords.includes(newKeyword)) {
      onChange({ ...config, secondaryKeywords: [...config.secondaryKeywords, newKeyword] });
      setNewKeyword('');
    }
  };

  return (
    <div className={clsx('p-4 space-y-4', className)}>
      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-lime-500" />
        Keywords Settings
      </h3>

      {/* Primary Keyword */}
      <div>
        <label className="text-sm font-medium">Primary Keyword</label>
        <input
          type="text"
          value={config.primaryKeyword}
          onChange={(e) => onChange({ ...config, primaryKeyword: e.target.value })}
          placeholder="Enter primary keyword..."
          className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 mt-2"
        />
      </div>

      {/* Secondary Keywords */}
      <div>
        <label className="text-sm font-medium">Secondary Keywords</label>
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="Add keyword..."
            className="flex-1 px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            onKeyDown={(e) => e.key === 'Enter' && addSecondaryKeyword()}
          />
          <button onClick={addSecondaryKeyword} className="px-3 py-2 bg-lime-500 text-white rounded-lg text-sm hover:bg-lime-600">
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {config.secondaryKeywords.map((keyword, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-lime-100 text-lime-700 rounded text-xs dark:bg-lime-900/30 dark:text-lime-400">
              {keyword}
              <button onClick={() => onChange({ ...config, secondaryKeywords: config.secondaryKeywords.filter((_, idx) => idx !== i) })}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Target Density */}
      <div>
        <label className="text-sm font-medium">Target Density ({config.targetDensity}%)</label>
        <input
          type="range"
          value={config.targetDensity * 10}
          onChange={(e) => onChange({ ...config, targetDensity: parseInt(e.target.value) / 10 })}
          min={5}
          max={30}
          className="w-full mt-2"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0.5%</span>
          <span>3%</span>
        </div>
      </div>

      {/* Keyword Placement Checks */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Check Keyword Placement</label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.checkTitle} onChange={(e) => onChange({ ...config, checkTitle: e.target.checked })} className="rounded" />
          <span className="text-sm">In Title</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.checkFirstParagraph} onChange={(e) => onChange({ ...config, checkFirstParagraph: e.target.checked })} className="rounded" />
          <span className="text-sm">In First Paragraph</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.checkHeadings} onChange={(e) => onChange({ ...config, checkHeadings: e.target.checked })} className="rounded" />
          <span className="text-sm">In Headings</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.checkMetaDescription} onChange={(e) => onChange({ ...config, checkMetaDescription: e.target.checked })} className="rounded" />
          <span className="text-sm">In Meta Description</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.checkUrl} onChange={(e) => onChange({ ...config, checkUrl: e.target.checked })} className="rounded" />
          <span className="text-sm">In URL</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.checkImageAlts} onChange={(e) => onChange({ ...config, checkImageAlts: e.target.checked })} className="rounded" />
          <span className="text-sm">In Image Alt Tags</span>
        </label>
      </div>

      {/* Options */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Options</label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.showDensityHighlight} onChange={(e) => onChange({ ...config, showDensityHighlight: e.target.checked })} className="rounded" />
          <span className="text-sm">Highlight Keywords in Content</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.warnOverOptimization} onChange={(e) => onChange({ ...config, warnOverOptimization: e.target.checked })} className="rounded" />
          <span className="text-sm">Warn on Over-optimization</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.suggestRelatedKeywords} onChange={(e) => onChange({ ...config, suggestRelatedKeywords: e.target.checked })} className="rounded" />
          <span className="text-sm">Suggest Related Keywords</span>
        </label>
      </div>
    </div>
  );
}

// Headings Configuration Panel
interface HeadingsConfigPanelProps {
  config: {
    enforceHierarchy: boolean;
    requireH1: boolean;
    maxH1Count: number;
    checkKeywordInH1: boolean;
    suggestHeadings: boolean;
    showOutline: boolean;
    warnSkippedLevels: boolean;
    minHeadingsPerSection: number;
    maxHeadingLength: number;
  };
  onChange: (config: HeadingsConfigPanelProps['config']) => void;
  className?: string;
}

export function HeadingsConfigPanel({ config, onChange, className }: HeadingsConfigPanelProps) {
  return (
    <div className={clsx('p-4 space-y-4', className)}>
      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-sky-500" />
        Headings Settings
      </h3>

      {/* Hierarchy */}
      <label className="flex items-center justify-between">
        <span className="text-sm font-medium">Enforce Heading Hierarchy</span>
        <button
          onClick={() => onChange({ ...config, enforceHierarchy: !config.enforceHierarchy })}
          className={clsx(
            'w-10 h-6 rounded-full transition-colors relative',
            config.enforceHierarchy ? 'bg-sky-500' : 'bg-gray-300 dark:bg-gray-600'
          )}
        >
          <span className={clsx(
            'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
            config.enforceHierarchy ? 'translate-x-5' : 'translate-x-1'
          )} />
        </button>
      </label>

      {/* H1 Settings */}
      <div className="space-y-2">
        <label className="text-sm font-medium">H1 Settings</label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.requireH1} onChange={(e) => onChange({ ...config, requireH1: e.target.checked })} className="rounded" />
          <span className="text-sm">Require H1</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.checkKeywordInH1} onChange={(e) => onChange({ ...config, checkKeywordInH1: e.target.checked })} className="rounded" />
          <span className="text-sm">Check Keyword in H1</span>
        </label>
        <div>
          <label className="text-xs text-gray-500">Max H1 Count</label>
          <input
            type="number"
            value={config.maxH1Count}
            onChange={(e) => onChange({ ...config, maxH1Count: parseInt(e.target.value) })}
            className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            min={1}
            max={3}
          />
        </div>
      </div>

      {/* Max Heading Length */}
      <div>
        <label className="text-sm font-medium">Max Heading Length ({config.maxHeadingLength} chars)</label>
        <input
          type="range"
          value={config.maxHeadingLength}
          onChange={(e) => onChange({ ...config, maxHeadingLength: parseInt(e.target.value) })}
          min={40}
          max={100}
          className="w-full mt-2"
        />
      </div>

      {/* Options */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Options</label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.showOutline} onChange={(e) => onChange({ ...config, showOutline: e.target.checked })} className="rounded" />
          <span className="text-sm">Show Heading Outline</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.warnSkippedLevels} onChange={(e) => onChange({ ...config, warnSkippedLevels: e.target.checked })} className="rounded" />
          <span className="text-sm">Warn on Skipped Levels</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.suggestHeadings} onChange={(e) => onChange({ ...config, suggestHeadings: e.target.checked })} className="rounded" />
          <span className="text-sm">Suggest Heading Structure</span>
        </label>
      </div>
    </div>
  );
}

// Schema Markup Configuration Panel
interface SchemaMarkupConfigPanelProps {
  config: {
    type: 'Article' | 'BlogPosting' | 'NewsArticle' | 'TechArticle' | 'HowTo' | 'FAQ' | 'Recipe' | 'Product' | 'Review';
    enableAutoGeneration: boolean;
    includeBreadcrumbs: boolean;
    includeOrganization: boolean;
    includeAuthor: boolean;
    includeImage: boolean;
    includeDatePublished: boolean;
    includeDateModified: boolean;
    validateSchema: boolean;
    previewFormat: 'json-ld' | 'microdata' | 'rdfa';
  };
  onChange: (config: SchemaMarkupConfigPanelProps['config']) => void;
  className?: string;
}

export function SchemaMarkupConfigPanel({ config, onChange, className }: SchemaMarkupConfigPanelProps) {
  const schemaTypes = [
    { id: 'Article', desc: 'General article' },
    { id: 'BlogPosting', desc: 'Blog post' },
    { id: 'NewsArticle', desc: 'News article' },
    { id: 'TechArticle', desc: 'Technical article' },
    { id: 'HowTo', desc: 'How-to guide' },
    { id: 'FAQ', desc: 'FAQ page' },
    { id: 'Recipe', desc: 'Recipe' },
    { id: 'Product', desc: 'Product' },
    { id: 'Review', desc: 'Review' },
  ] as const;

  return (
    <div className={clsx('p-4 space-y-4', className)}>
      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-rose-500" />
        Schema Markup Settings
      </h3>

      {/* Schema Type */}
      <div>
        <label className="text-sm font-medium">Schema Type</label>
        <select
          value={config.type}
          onChange={(e) => onChange({ ...config, type: e.target.value as SchemaMarkupConfigPanelProps['config']['type'] })}
          className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 mt-2"
        >
          {schemaTypes.map(type => (
            <option key={type.id} value={type.id}>{type.id} - {type.desc}</option>
          ))}
        </select>
      </div>

      {/* Auto Generation */}
      <label className="flex items-center justify-between">
        <span className="text-sm font-medium">Auto-generate Schema</span>
        <button
          onClick={() => onChange({ ...config, enableAutoGeneration: !config.enableAutoGeneration })}
          className={clsx(
            'w-10 h-6 rounded-full transition-colors relative',
            config.enableAutoGeneration ? 'bg-rose-500' : 'bg-gray-300 dark:bg-gray-600'
          )}
        >
          <span className={clsx(
            'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
            config.enableAutoGeneration ? 'translate-x-5' : 'translate-x-1'
          )} />
        </button>
      </label>

      {/* Include Options */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Include Properties</label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.includeBreadcrumbs} onChange={(e) => onChange({ ...config, includeBreadcrumbs: e.target.checked })} className="rounded" />
          <span className="text-sm">Breadcrumbs</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.includeOrganization} onChange={(e) => onChange({ ...config, includeOrganization: e.target.checked })} className="rounded" />
          <span className="text-sm">Organization/Publisher</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.includeAuthor} onChange={(e) => onChange({ ...config, includeAuthor: e.target.checked })} className="rounded" />
          <span className="text-sm">Author Information</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.includeImage} onChange={(e) => onChange({ ...config, includeImage: e.target.checked })} className="rounded" />
          <span className="text-sm">Featured Image</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.includeDatePublished} onChange={(e) => onChange({ ...config, includeDatePublished: e.target.checked })} className="rounded" />
          <span className="text-sm">Date Published</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.includeDateModified} onChange={(e) => onChange({ ...config, includeDateModified: e.target.checked })} className="rounded" />
          <span className="text-sm">Date Modified</span>
        </label>
      </div>

      {/* Preview Format */}
      <div>
        <label className="text-sm font-medium">Preview Format</label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {(['json-ld', 'microdata', 'rdfa'] as const).map(format => (
            <button
              key={format}
              onClick={() => onChange({ ...config, previewFormat: format })}
              className={clsx(
                'px-3 py-2 text-sm rounded-lg border transition-colors uppercase',
                config.previewFormat === format
                  ? 'bg-rose-100 border-rose-500 text-rose-700 dark:bg-rose-900/30'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700'
              )}
            >
              {format}
            </button>
          ))}
        </div>
      </div>

      {/* Validate */}
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={config.validateSchema} onChange={(e) => onChange({ ...config, validateSchema: e.target.checked })} className="rounded" />
        <span className="text-sm">Validate Schema on Save</span>
      </label>
    </div>
  );
}

// Internal Links Configuration Panel
interface InternalLinksConfigPanelProps {
  config: {
    enableAutoSuggestions: boolean;
    minWordCount: number;
    maxLinksPerPost: number;
    excludeCategories: string[];
    excludeTags: string[];
    prioritizeRecent: boolean;
    prioritizeRelated: boolean;
    openInNewTab: boolean;
    addNofollow: boolean;
    checkBrokenLinks: boolean;
    highlightOpportunities: boolean;
  };
  onChange: (config: InternalLinksConfigPanelProps['config']) => void;
  className?: string;
}

export function InternalLinksConfigPanel({ config, onChange, className }: InternalLinksConfigPanelProps) {
  return (
    <div className={clsx('p-4 space-y-4', className)}>
      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-fuchsia-500" />
        Internal Links Settings
      </h3>

      {/* Auto Suggestions */}
      <label className="flex items-center justify-between">
        <span className="text-sm font-medium">Auto-suggest Links</span>
        <button
          onClick={() => onChange({ ...config, enableAutoSuggestions: !config.enableAutoSuggestions })}
          className={clsx(
            'w-10 h-6 rounded-full transition-colors relative',
            config.enableAutoSuggestions ? 'bg-fuchsia-500' : 'bg-gray-300 dark:bg-gray-600'
          )}
        >
          <span className={clsx(
            'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
            config.enableAutoSuggestions ? 'translate-x-5' : 'translate-x-1'
          )} />
        </button>
      </label>

      {/* Limits */}
      <div>
        <label className="text-sm font-medium">Max Links Per Post ({config.maxLinksPerPost})</label>
        <input
          type="range"
          value={config.maxLinksPerPost}
          onChange={(e) => onChange({ ...config, maxLinksPerPost: parseInt(e.target.value) })}
          min={1}
          max={20}
          className="w-full mt-2"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Min Word Count for Suggestions</label>
        <input
          type="number"
          value={config.minWordCount}
          onChange={(e) => onChange({ ...config, minWordCount: parseInt(e.target.value) })}
          className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 mt-2"
          min={100}
          max={1000}
        />
      </div>

      {/* Prioritization */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Prioritization</label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.prioritizeRecent} onChange={(e) => onChange({ ...config, prioritizeRecent: e.target.checked })} className="rounded" />
          <span className="text-sm">Prioritize Recent Posts</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.prioritizeRelated} onChange={(e) => onChange({ ...config, prioritizeRelated: e.target.checked })} className="rounded" />
          <span className="text-sm">Prioritize Related Content</span>
        </label>
      </div>

      {/* Link Options */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Link Options</label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.openInNewTab} onChange={(e) => onChange({ ...config, openInNewTab: e.target.checked })} className="rounded" />
          <span className="text-sm">Open in New Tab</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.addNofollow} onChange={(e) => onChange({ ...config, addNofollow: e.target.checked })} className="rounded" />
          <span className="text-sm">Add nofollow Attribute</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.checkBrokenLinks} onChange={(e) => onChange({ ...config, checkBrokenLinks: e.target.checked })} className="rounded" />
          <span className="text-sm">Check for Broken Links</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.highlightOpportunities} onChange={(e) => onChange({ ...config, highlightOpportunities: e.target.checked })} className="rounded" />
          <span className="text-sm">Highlight Link Opportunities</span>
        </label>
      </div>
    </div>
  );
}

// Link Checker Configuration Panel
interface LinkCheckerConfigPanelProps {
  config: {
    checkOnSave: boolean;
    checkOnPublish: boolean;
    checkSchedule: 'never' | 'daily' | 'weekly' | 'monthly';
    checkInternalLinks: boolean;
    checkExternalLinks: boolean;
    checkImages: boolean;
    checkEmbeds: boolean;
    timeout: number;
    retryCount: number;
    ignorePatterns: string[];
    notifyOnBroken: boolean;
    autoFixRedirects: boolean;
  };
  onChange: (config: LinkCheckerConfigPanelProps['config']) => void;
  className?: string;
}

export function LinkCheckerConfigPanel({ config, onChange, className }: LinkCheckerConfigPanelProps) {
  const [newPattern, setNewPattern] = useState('');

  return (
    <div className={clsx('p-4 space-y-4', className)}>
      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        Link Checker Settings
      </h3>

      {/* Check Triggers */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Check Triggers</label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.checkOnSave} onChange={(e) => onChange({ ...config, checkOnSave: e.target.checked })} className="rounded" />
          <span className="text-sm">Check on Save</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.checkOnPublish} onChange={(e) => onChange({ ...config, checkOnPublish: e.target.checked })} className="rounded" />
          <span className="text-sm">Check on Publish</span>
        </label>
      </div>

      {/* Schedule */}
      <div>
        <label className="text-sm font-medium">Scheduled Checks</label>
        <select
          value={config.checkSchedule}
          onChange={(e) => onChange({ ...config, checkSchedule: e.target.value as LinkCheckerConfigPanelProps['config']['checkSchedule'] })}
          className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 mt-2"
        >
          <option value="never">Never</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      {/* What to Check */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Check Types</label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.checkInternalLinks} onChange={(e) => onChange({ ...config, checkInternalLinks: e.target.checked })} className="rounded" />
          <span className="text-sm">Internal Links</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.checkExternalLinks} onChange={(e) => onChange({ ...config, checkExternalLinks: e.target.checked })} className="rounded" />
          <span className="text-sm">External Links</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.checkImages} onChange={(e) => onChange({ ...config, checkImages: e.target.checked })} className="rounded" />
          <span className="text-sm">Images</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.checkEmbeds} onChange={(e) => onChange({ ...config, checkEmbeds: e.target.checked })} className="rounded" />
          <span className="text-sm">Embeds</span>
        </label>
      </div>

      {/* Timeout */}
      <div>
        <label className="text-sm font-medium">Request Timeout ({config.timeout}s)</label>
        <input
          type="range"
          value={config.timeout}
          onChange={(e) => onChange({ ...config, timeout: parseInt(e.target.value) })}
          min={5}
          max={30}
          className="w-full mt-2"
        />
      </div>

      {/* Options */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Options</label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.notifyOnBroken} onChange={(e) => onChange({ ...config, notifyOnBroken: e.target.checked })} className="rounded" />
          <span className="text-sm">Notify on Broken Links</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.autoFixRedirects} onChange={(e) => onChange({ ...config, autoFixRedirects: e.target.checked })} className="rounded" />
          <span className="text-sm">Auto-fix Redirects</span>
        </label>
      </div>
    </div>
  );
}

// ============== PREVIEW OPTIONS PANELS ==============

// Device Preview Configuration Panel
interface DevicePreviewConfigPanelProps {
  config: {
    defaultDevice: 'desktop' | 'tablet' | 'mobile';
    showDeviceFrame: boolean;
    enableRotation: boolean;
    showScrollbars: boolean;
    syncWithEditor: boolean;
    customViewports: { name: string; width: number; height: number }[];
    showGridOverlay: boolean;
    showRulers: boolean;
    zoomLevel: number;
    darkModePreview: boolean;
  };
  onChange: (config: DevicePreviewConfigPanelProps['config']) => void;
  className?: string;
}

export function DevicePreviewConfigPanel({ config, onChange, className }: DevicePreviewConfigPanelProps) {
  return (
    <div className={clsx('p-4 space-y-4', className)}>
      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-500" />
        Device Preview Settings
      </h3>

      {/* Default Device */}
      <div>
        <label className="text-sm font-medium">Default Device</label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {(['desktop', 'tablet', 'mobile'] as const).map(device => (
            <button
              key={device}
              onClick={() => onChange({ ...config, defaultDevice: device })}
              className={clsx(
                'px-3 py-2 text-sm rounded-lg border transition-colors capitalize',
                config.defaultDevice === device
                  ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/30'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700'
              )}
            >
              {device}
            </button>
          ))}
        </div>
      </div>

      {/* Zoom Level */}
      <div>
        <label className="text-sm font-medium">Zoom Level ({config.zoomLevel}%)</label>
        <input
          type="range"
          value={config.zoomLevel}
          onChange={(e) => onChange({ ...config, zoomLevel: parseInt(e.target.value) })}
          min={25}
          max={200}
          step={25}
          className="w-full mt-2"
        />
      </div>

      {/* Display Options */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Display Options</label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.showDeviceFrame} onChange={(e) => onChange({ ...config, showDeviceFrame: e.target.checked })} className="rounded" />
          <span className="text-sm">Show Device Frame</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.enableRotation} onChange={(e) => onChange({ ...config, enableRotation: e.target.checked })} className="rounded" />
          <span className="text-sm">Enable Rotation</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.showScrollbars} onChange={(e) => onChange({ ...config, showScrollbars: e.target.checked })} className="rounded" />
          <span className="text-sm">Show Scrollbars</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.showGridOverlay} onChange={(e) => onChange({ ...config, showGridOverlay: e.target.checked })} className="rounded" />
          <span className="text-sm">Show Grid Overlay</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.showRulers} onChange={(e) => onChange({ ...config, showRulers: e.target.checked })} className="rounded" />
          <span className="text-sm">Show Rulers</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.darkModePreview} onChange={(e) => onChange({ ...config, darkModePreview: e.target.checked })} className="rounded" />
          <span className="text-sm">Dark Mode Preview</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.syncWithEditor} onChange={(e) => onChange({ ...config, syncWithEditor: e.target.checked })} className="rounded" />
          <span className="text-sm">Sync with Editor</span>
        </label>
      </div>
    </div>
  );
}

// Social Preview Configuration Panel
interface SocialPreviewConfigPanelProps {
  config: {
    defaultPlatform: 'facebook' | 'twitter' | 'linkedin' | 'pinterest';
    showAllPlatforms: boolean;
    autoGenerateDescription: boolean;
    maxDescriptionLength: number;
    enableImageSuggestions: boolean;
    showCharacterCount: boolean;
    validateImageSize: boolean;
    showPreviewScore: boolean;
    enableDarkMode: boolean;
  };
  onChange: (config: SocialPreviewConfigPanelProps['config']) => void;
  className?: string;
}

export function SocialPreviewConfigPanel({ config, onChange, className }: SocialPreviewConfigPanelProps) {
  const platforms = [
    { id: 'facebook', name: 'Facebook', color: 'blue' },
    { id: 'twitter', name: 'Twitter/X', color: 'sky' },
    { id: 'linkedin', name: 'LinkedIn', color: 'indigo' },
    { id: 'pinterest', name: 'Pinterest', color: 'red' },
  ] as const;

  return (
    <div className={clsx('p-4 space-y-4', className)}>
      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-sky-500" />
        Social Preview Settings
      </h3>

      {/* Default Platform */}
      <div>
        <label className="text-sm font-medium">Default Platform</label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {platforms.map(platform => (
            <button
              key={platform.id}
              onClick={() => onChange({ ...config, defaultPlatform: platform.id as SocialPreviewConfigPanelProps['config']['defaultPlatform'] })}
              className={clsx(
                'px-3 py-2 text-sm rounded-lg border transition-colors',
                config.defaultPlatform === platform.id
                  ? 'bg-sky-100 border-sky-500 text-sky-700 dark:bg-sky-900/30'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700'
              )}
            >
              {platform.name}
            </button>
          ))}
        </div>
      </div>

      {/* Show All Platforms */}
      <label className="flex items-center justify-between">
        <span className="text-sm font-medium">Show All Platforms</span>
        <button
          onClick={() => onChange({ ...config, showAllPlatforms: !config.showAllPlatforms })}
          className={clsx(
            'w-10 h-6 rounded-full transition-colors relative',
            config.showAllPlatforms ? 'bg-sky-500' : 'bg-gray-300 dark:bg-gray-600'
          )}
        >
          <span className={clsx(
            'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
            config.showAllPlatforms ? 'translate-x-5' : 'translate-x-1'
          )} />
        </button>
      </label>

      {/* Max Description Length */}
      <div>
        <label className="text-sm font-medium">Max Description ({config.maxDescriptionLength} chars)</label>
        <input
          type="range"
          value={config.maxDescriptionLength}
          onChange={(e) => onChange({ ...config, maxDescriptionLength: parseInt(e.target.value) })}
          min={100}
          max={300}
          step={10}
          className="w-full mt-2"
        />
      </div>

      {/* Options */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Options</label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.autoGenerateDescription} onChange={(e) => onChange({ ...config, autoGenerateDescription: e.target.checked })} className="rounded" />
          <span className="text-sm">Auto-generate Description</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.enableImageSuggestions} onChange={(e) => onChange({ ...config, enableImageSuggestions: e.target.checked })} className="rounded" />
          <span className="text-sm">Enable Image Suggestions</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.showCharacterCount} onChange={(e) => onChange({ ...config, showCharacterCount: e.target.checked })} className="rounded" />
          <span className="text-sm">Show Character Count</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.validateImageSize} onChange={(e) => onChange({ ...config, validateImageSize: e.target.checked })} className="rounded" />
          <span className="text-sm">Validate Image Size</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.showPreviewScore} onChange={(e) => onChange({ ...config, showPreviewScore: e.target.checked })} className="rounded" />
          <span className="text-sm">Show Preview Score</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.enableDarkMode} onChange={(e) => onChange({ ...config, enableDarkMode: e.target.checked })} className="rounded" />
          <span className="text-sm">Enable Dark Mode Preview</span>
        </label>
      </div>
    </div>
  );
}

// Content Outline Configuration Panel
interface ContentOutlineConfigPanelProps {
  config: {
    maxDepth: number;
    showWordCount: boolean;
    showReadingTime: boolean;
    enableNavigation: boolean;
    highlightCurrentSection: boolean;
    showProgress: boolean;
    collapseSections: boolean;
    showHeadingNumbers: boolean;
    stickyOutline: boolean;
    minHeadingsToShow: number;
  };
  onChange: (config: ContentOutlineConfigPanelProps['config']) => void;
  className?: string;
}

export function ContentOutlineConfigPanel({ config, onChange, className }: ContentOutlineConfigPanelProps) {
  return (
    <div className={clsx('p-4 space-y-4', className)}>
      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-slate-500" />
        Content Outline Settings
      </h3>

      {/* Max Depth */}
      <div>
        <label className="text-sm font-medium">Max Heading Depth (H{config.maxDepth})</label>
        <input
          type="range"
          value={config.maxDepth}
          onChange={(e) => onChange({ ...config, maxDepth: parseInt(e.target.value) })}
          min={2}
          max={6}
          className="w-full mt-2"
        />
      </div>

      {/* Min Headings */}
      <div>
        <label className="text-sm font-medium">Min Headings to Show ({config.minHeadingsToShow})</label>
        <input
          type="range"
          value={config.minHeadingsToShow}
          onChange={(e) => onChange({ ...config, minHeadingsToShow: parseInt(e.target.value) })}
          min={1}
          max={10}
          className="w-full mt-2"
        />
      </div>

      {/* Display Options */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Display Options</label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.showWordCount} onChange={(e) => onChange({ ...config, showWordCount: e.target.checked })} className="rounded" />
          <span className="text-sm">Show Word Count</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.showReadingTime} onChange={(e) => onChange({ ...config, showReadingTime: e.target.checked })} className="rounded" />
          <span className="text-sm">Show Reading Time</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.showHeadingNumbers} onChange={(e) => onChange({ ...config, showHeadingNumbers: e.target.checked })} className="rounded" />
          <span className="text-sm">Show Heading Numbers</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.showProgress} onChange={(e) => onChange({ ...config, showProgress: e.target.checked })} className="rounded" />
          <span className="text-sm">Show Progress Bar</span>
        </label>
      </div>

      {/* Behavior */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Behavior</label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.enableNavigation} onChange={(e) => onChange({ ...config, enableNavigation: e.target.checked })} className="rounded" />
          <span className="text-sm">Enable Click Navigation</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.highlightCurrentSection} onChange={(e) => onChange({ ...config, highlightCurrentSection: e.target.checked })} className="rounded" />
          <span className="text-sm">Highlight Current Section</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.collapseSections} onChange={(e) => onChange({ ...config, collapseSections: e.target.checked })} className="rounded" />
          <span className="text-sm">Collapsible Sections</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.stickyOutline} onChange={(e) => onChange({ ...config, stickyOutline: e.target.checked })} className="rounded" />
          <span className="text-sm">Sticky Outline</span>
        </label>
      </div>
    </div>
  );
}

// ============== ADVANCED PANELS ==============

// Version History Configuration Panel
interface VersionHistoryConfigPanelProps {
  config: {
    maxRevisionsToShow: number;
    showAuthor: boolean;
    showTimestamp: boolean;
    showChangeSummary: boolean;
    enableDiffView: boolean;
    highlightChanges: boolean;
    groupByDate: boolean;
    autoSaveInterval: number;
    keepRevisionsFor: number;
    showWordCountDiff: boolean;
  };
  onChange: (config: VersionHistoryConfigPanelProps['config']) => void;
  className?: string;
}

export function VersionHistoryConfigPanel({ config, onChange, className }: VersionHistoryConfigPanelProps) {
  return (
    <div className={clsx('p-4 space-y-4', className)}>
      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-gray-500" />
        Version History Settings
      </h3>

      {/* Max Revisions */}
      <div>
        <label className="text-sm font-medium">Revisions to Display ({config.maxRevisionsToShow})</label>
        <input
          type="range"
          value={config.maxRevisionsToShow}
          onChange={(e) => onChange({ ...config, maxRevisionsToShow: parseInt(e.target.value) })}
          min={5}
          max={50}
          step={5}
          className="w-full mt-2"
        />
      </div>

      {/* Auto-save Interval */}
      <div>
        <label className="text-sm font-medium">Auto-save Interval</label>
        <select
          value={config.autoSaveInterval}
          onChange={(e) => onChange({ ...config, autoSaveInterval: parseInt(e.target.value) })}
          className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 mt-2"
        >
          <option value={30}>30 seconds</option>
          <option value={60}>1 minute</option>
          <option value={120}>2 minutes</option>
          <option value={300}>5 minutes</option>
          <option value={600}>10 minutes</option>
        </select>
      </div>

      {/* Keep Revisions For */}
      <div>
        <label className="text-sm font-medium">Keep Revisions For</label>
        <select
          value={config.keepRevisionsFor}
          onChange={(e) => onChange({ ...config, keepRevisionsFor: parseInt(e.target.value) })}
          className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 mt-2"
        >
          <option value={7}>1 week</option>
          <option value={30}>1 month</option>
          <option value={90}>3 months</option>
          <option value={365}>1 year</option>
          <option value={-1}>Forever</option>
        </select>
      </div>

      {/* Display Options */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Display Options</label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.showAuthor} onChange={(e) => onChange({ ...config, showAuthor: e.target.checked })} className="rounded" />
          <span className="text-sm">Show Author</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.showTimestamp} onChange={(e) => onChange({ ...config, showTimestamp: e.target.checked })} className="rounded" />
          <span className="text-sm">Show Timestamp</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.showChangeSummary} onChange={(e) => onChange({ ...config, showChangeSummary: e.target.checked })} className="rounded" />
          <span className="text-sm">Show Change Summary</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.showWordCountDiff} onChange={(e) => onChange({ ...config, showWordCountDiff: e.target.checked })} className="rounded" />
          <span className="text-sm">Show Word Count Diff</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.groupByDate} onChange={(e) => onChange({ ...config, groupByDate: e.target.checked })} className="rounded" />
          <span className="text-sm">Group by Date</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.enableDiffView} onChange={(e) => onChange({ ...config, enableDiffView: e.target.checked })} className="rounded" />
          <span className="text-sm">Enable Diff View</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.highlightChanges} onChange={(e) => onChange({ ...config, highlightChanges: e.target.checked })} className="rounded" />
          <span className="text-sm">Highlight Changes</span>
        </label>
      </div>
    </div>
  );
}

// Analytics Configuration Panel
interface AnalyticsConfigPanelProps {
  config: {
    showPageViews: boolean;
    showUniqueVisitors: boolean;
    showAverageTimeOnPage: boolean;
    showBounceRate: boolean;
    showSocialShares: boolean;
    showComments: boolean;
    dateRange: '7d' | '30d' | '90d' | '1y' | 'all';
    compareWithPrevious: boolean;
    showTrends: boolean;
    enableRealTime: boolean;
    showTopReferrers: boolean;
    showDeviceBreakdown: boolean;
  };
  onChange: (config: AnalyticsConfigPanelProps['config']) => void;
  className?: string;
}

export function AnalyticsConfigPanel({ config, onChange, className }: AnalyticsConfigPanelProps) {
  return (
    <div className={clsx('p-4 space-y-4', className)}>
      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-500" />
        Analytics Settings
      </h3>

      {/* Date Range */}
      <div>
        <label className="text-sm font-medium">Date Range</label>
        <select
          value={config.dateRange}
          onChange={(e) => onChange({ ...config, dateRange: e.target.value as AnalyticsConfigPanelProps['config']['dateRange'] })}
          className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 mt-2"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* Metrics to Show */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Metrics</label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.showPageViews} onChange={(e) => onChange({ ...config, showPageViews: e.target.checked })} className="rounded" />
          <span className="text-sm">Page Views</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.showUniqueVisitors} onChange={(e) => onChange({ ...config, showUniqueVisitors: e.target.checked })} className="rounded" />
          <span className="text-sm">Unique Visitors</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.showAverageTimeOnPage} onChange={(e) => onChange({ ...config, showAverageTimeOnPage: e.target.checked })} className="rounded" />
          <span className="text-sm">Avg. Time on Page</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.showBounceRate} onChange={(e) => onChange({ ...config, showBounceRate: e.target.checked })} className="rounded" />
          <span className="text-sm">Bounce Rate</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.showSocialShares} onChange={(e) => onChange({ ...config, showSocialShares: e.target.checked })} className="rounded" />
          <span className="text-sm">Social Shares</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.showComments} onChange={(e) => onChange({ ...config, showComments: e.target.checked })} className="rounded" />
          <span className="text-sm">Comments</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.showTopReferrers} onChange={(e) => onChange({ ...config, showTopReferrers: e.target.checked })} className="rounded" />
          <span className="text-sm">Top Referrers</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.showDeviceBreakdown} onChange={(e) => onChange({ ...config, showDeviceBreakdown: e.target.checked })} className="rounded" />
          <span className="text-sm">Device Breakdown</span>
        </label>
      </div>

      {/* Options */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Options</label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.compareWithPrevious} onChange={(e) => onChange({ ...config, compareWithPrevious: e.target.checked })} className="rounded" />
          <span className="text-sm">Compare with Previous Period</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.showTrends} onChange={(e) => onChange({ ...config, showTrends: e.target.checked })} className="rounded" />
          <span className="text-sm">Show Trends</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.enableRealTime} onChange={(e) => onChange({ ...config, enableRealTime: e.target.checked })} className="rounded" />
          <span className="text-sm">Enable Real-time Updates</span>
        </label>
      </div>
    </div>
  );
}

// Collaboration Configuration Panel
interface CollaborationConfigPanelProps {
  config: {
    enableRealTimeEditing: boolean;
    showPresence: boolean;
    showCursors: boolean;
    showSelections: boolean;
    enableComments: boolean;
    enableSuggestions: boolean;
    notifyOnChanges: boolean;
    conflictResolution: 'auto' | 'manual' | 'last-write';
    showActivityFeed: boolean;
    enableMentions: boolean;
    enableChat: boolean;
    lockTimeout: number;
  };
  onChange: (config: CollaborationConfigPanelProps['config']) => void;
  className?: string;
}

export function CollaborationConfigPanel({ config, onChange, className }: CollaborationConfigPanelProps) {
  return (
    <div className={clsx('p-4 space-y-4', className)}>
      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500" />
        Collaboration Settings
      </h3>

      {/* Real-time Editing */}
      <label className="flex items-center justify-between">
        <span className="text-sm font-medium">Real-time Editing</span>
        <button
          onClick={() => onChange({ ...config, enableRealTimeEditing: !config.enableRealTimeEditing })}
          className={clsx(
            'w-10 h-6 rounded-full transition-colors relative',
            config.enableRealTimeEditing ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
          )}
        >
          <span className={clsx(
            'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
            config.enableRealTimeEditing ? 'translate-x-5' : 'translate-x-1'
          )} />
        </button>
      </label>

      {/* Conflict Resolution */}
      <div>
        <label className="text-sm font-medium">Conflict Resolution</label>
        <select
          value={config.conflictResolution}
          onChange={(e) => onChange({ ...config, conflictResolution: e.target.value as CollaborationConfigPanelProps['config']['conflictResolution'] })}
          className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 mt-2"
        >
          <option value="auto">Automatic Merge</option>
          <option value="manual">Manual Resolution</option>
          <option value="last-write">Last Write Wins</option>
        </select>
      </div>

      {/* Lock Timeout */}
      <div>
        <label className="text-sm font-medium">Lock Timeout</label>
        <select
          value={config.lockTimeout}
          onChange={(e) => onChange({ ...config, lockTimeout: parseInt(e.target.value) })}
          className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 mt-2"
        >
          <option value={60}>1 minute</option>
          <option value={300}>5 minutes</option>
          <option value={600}>10 minutes</option>
          <option value={1800}>30 minutes</option>
          <option value={-1}>Never</option>
        </select>
      </div>

      {/* Presence Options */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Presence</label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.showPresence} onChange={(e) => onChange({ ...config, showPresence: e.target.checked })} className="rounded" />
          <span className="text-sm">Show Online Users</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.showCursors} onChange={(e) => onChange({ ...config, showCursors: e.target.checked })} className="rounded" />
          <span className="text-sm">Show Cursors</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.showSelections} onChange={(e) => onChange({ ...config, showSelections: e.target.checked })} className="rounded" />
          <span className="text-sm">Show Selections</span>
        </label>
      </div>

      {/* Communication */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Communication</label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.enableComments} onChange={(e) => onChange({ ...config, enableComments: e.target.checked })} className="rounded" />
          <span className="text-sm">Enable Comments</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.enableSuggestions} onChange={(e) => onChange({ ...config, enableSuggestions: e.target.checked })} className="rounded" />
          <span className="text-sm">Enable Suggestions</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.enableMentions} onChange={(e) => onChange({ ...config, enableMentions: e.target.checked })} className="rounded" />
          <span className="text-sm">Enable @Mentions</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.enableChat} onChange={(e) => onChange({ ...config, enableChat: e.target.checked })} className="rounded" />
          <span className="text-sm">Enable Chat</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.showActivityFeed} onChange={(e) => onChange({ ...config, showActivityFeed: e.target.checked })} className="rounded" />
          <span className="text-sm">Show Activity Feed</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.notifyOnChanges} onChange={(e) => onChange({ ...config, notifyOnChanges: e.target.checked })} className="rounded" />
          <span className="text-sm">Notify on Changes</span>
        </label>
      </div>
    </div>
  );
}

// Image Optimizer Configuration Panel
interface ImageOptimizerConfigPanelProps {
  config: {
    autoOptimize: boolean;
    maxWidth: number;
    maxHeight: number;
    quality: number;
    format: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png';
    enableLazyLoad: boolean;
    generateResponsive: boolean;
    responsiveSizes: number[];
    preserveMetadata: boolean;
    stripExif: boolean;
    enableCdn: boolean;
    compressionLevel: 'low' | 'medium' | 'high' | 'lossless';
  };
  onChange: (config: ImageOptimizerConfigPanelProps['config']) => void;
  className?: string;
}

export function ImageOptimizerConfigPanel({ config, onChange, className }: ImageOptimizerConfigPanelProps) {
  return (
    <div className={clsx('p-4 space-y-4', className)}>
      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        Image Optimizer Settings
      </h3>

      {/* Auto Optimize */}
      <label className="flex items-center justify-between">
        <span className="text-sm font-medium">Auto-optimize Images</span>
        <button
          onClick={() => onChange({ ...config, autoOptimize: !config.autoOptimize })}
          className={clsx(
            'w-10 h-6 rounded-full transition-colors relative',
            config.autoOptimize ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'
          )}
        >
          <span className={clsx(
            'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
            config.autoOptimize ? 'translate-x-5' : 'translate-x-1'
          )} />
        </button>
      </label>

      {/* Max Dimensions */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Max Width</label>
          <input
            type="number"
            value={config.maxWidth}
            onChange={(e) => onChange({ ...config, maxWidth: parseInt(e.target.value) })}
            className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 mt-1"
            min={100}
            max={4096}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Max Height</label>
          <input
            type="number"
            value={config.maxHeight}
            onChange={(e) => onChange({ ...config, maxHeight: parseInt(e.target.value) })}
            className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 mt-1"
            min={100}
            max={4096}
          />
        </div>
      </div>

      {/* Quality */}
      <div>
        <label className="text-sm font-medium">Quality ({config.quality}%)</label>
        <input
          type="range"
          value={config.quality}
          onChange={(e) => onChange({ ...config, quality: parseInt(e.target.value) })}
          min={10}
          max={100}
          className="w-full mt-2"
        />
      </div>

      {/* Format */}
      <div>
        <label className="text-sm font-medium">Output Format</label>
        <select
          value={config.format}
          onChange={(e) => onChange({ ...config, format: e.target.value as ImageOptimizerConfigPanelProps['config']['format'] })}
          className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 mt-2"
        >
          <option value="auto">Auto (Best Format)</option>
          <option value="webp">WebP</option>
          <option value="avif">AVIF</option>
          <option value="jpeg">JPEG</option>
          <option value="png">PNG</option>
        </select>
      </div>

      {/* Compression Level */}
      <div>
        <label className="text-sm font-medium">Compression Level</label>
        <div className="grid grid-cols-4 gap-2 mt-2">
          {(['low', 'medium', 'high', 'lossless'] as const).map(level => (
            <button
              key={level}
              onClick={() => onChange({ ...config, compressionLevel: level })}
              className={clsx(
                'px-2 py-2 text-xs rounded-lg border transition-colors capitalize',
                config.compressionLevel === level
                  ? 'bg-amber-100 border-amber-500 text-amber-700 dark:bg-amber-900/30'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700'
              )}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Options</label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.enableLazyLoad} onChange={(e) => onChange({ ...config, enableLazyLoad: e.target.checked })} className="rounded" />
          <span className="text-sm">Enable Lazy Load</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.generateResponsive} onChange={(e) => onChange({ ...config, generateResponsive: e.target.checked })} className="rounded" />
          <span className="text-sm">Generate Responsive Sizes</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.preserveMetadata} onChange={(e) => onChange({ ...config, preserveMetadata: e.target.checked })} className="rounded" />
          <span className="text-sm">Preserve Metadata</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.stripExif} onChange={(e) => onChange({ ...config, stripExif: e.target.checked })} className="rounded" />
          <span className="text-sm">Strip EXIF Data</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.enableCdn} onChange={(e) => onChange({ ...config, enableCdn: e.target.checked })} className="rounded" />
          <span className="text-sm">Enable CDN Delivery</span>
        </label>
      </div>
    </div>
  );
}

// Plugins Configuration Panel
interface PluginsConfigPanelProps {
  config: {
    enabledPlugins: string[];
    autoUpdate: boolean;
    sandboxMode: boolean;
    allowThirdParty: boolean;
    showNotifications: boolean;
    pluginPriority: Record<string, number>;
    enableDeveloperMode: boolean;
    logLevel: 'none' | 'error' | 'warn' | 'info' | 'debug';
  };
  onChange: (config: PluginsConfigPanelProps['config']) => void;
  className?: string;
}

export function PluginsConfigPanel({ config, onChange, className }: PluginsConfigPanelProps) {
  const samplePlugins = [
    { id: 'seo-tools', name: 'SEO Tools', enabled: true },
    { id: 'social-share', name: 'Social Share', enabled: true },
    { id: 'image-compress', name: 'Image Compressor', enabled: false },
    { id: 'code-syntax', name: 'Code Syntax', enabled: true },
    { id: 'table-of-contents', name: 'Table of Contents', enabled: false },
  ];

  return (
    <div className={clsx('p-4 space-y-4', className)}>
      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-purple-500" />
        Plugins Settings
      </h3>

      {/* Plugin List */}
      <div>
        <label className="text-sm font-medium">Active Plugins</label>
        <div className="space-y-2 mt-2">
          {samplePlugins.map(plugin => (
            <label key={plugin.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
              <span className="text-sm">{plugin.name}</span>
              <button
                onClick={() => {
                  const enabled = config.enabledPlugins.includes(plugin.id);
                  onChange({
                    ...config,
                    enabledPlugins: enabled
                      ? config.enabledPlugins.filter(id => id !== plugin.id)
                      : [...config.enabledPlugins, plugin.id]
                  });
                }}
                className={clsx(
                  'w-10 h-6 rounded-full transition-colors relative',
                  config.enabledPlugins.includes(plugin.id) ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                )}
              >
                <span className={clsx(
                  'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                  config.enabledPlugins.includes(plugin.id) ? 'translate-x-5' : 'translate-x-1'
                )} />
              </button>
            </label>
          ))}
        </div>
      </div>

      {/* Log Level */}
      <div>
        <label className="text-sm font-medium">Log Level</label>
        <select
          value={config.logLevel}
          onChange={(e) => onChange({ ...config, logLevel: e.target.value as PluginsConfigPanelProps['config']['logLevel'] })}
          className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 mt-2"
        >
          <option value="none">None</option>
          <option value="error">Errors Only</option>
          <option value="warn">Warnings</option>
          <option value="info">Info</option>
          <option value="debug">Debug</option>
        </select>
      </div>

      {/* Options */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Options</label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.autoUpdate} onChange={(e) => onChange({ ...config, autoUpdate: e.target.checked })} className="rounded" />
          <span className="text-sm">Auto-update Plugins</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.sandboxMode} onChange={(e) => onChange({ ...config, sandboxMode: e.target.checked })} className="rounded" />
          <span className="text-sm">Sandbox Mode</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.allowThirdParty} onChange={(e) => onChange({ ...config, allowThirdParty: e.target.checked })} className="rounded" />
          <span className="text-sm">Allow Third-party Plugins</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.showNotifications} onChange={(e) => onChange({ ...config, showNotifications: e.target.checked })} className="rounded" />
          <span className="text-sm">Show Plugin Notifications</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={config.enableDeveloperMode} onChange={(e) => onChange({ ...config, enableDeveloperMode: e.target.checked })} className="rounded" />
          <span className="text-sm">Developer Mode</span>
        </label>
      </div>
    </div>
  );
}

// Export all panels
export default {
  CategoriesPanel,
  TagsPanel,
  VisibilityPanel,
  SchedulePanel,
  ExcerptPanel,
  SlugPanel,
  DiscussionPanel,
  RevisionsPanel,
  SEOMetaPanel,
  SocialMetaPanel,
  CustomFieldsPanel,
  PostFormatPanel,
  TemplatePanel,
  AttributesPanel,
  RelatedPostsPanel,
  SeriesPanel,
  LocationPanel,
  LanguagePanel,
  CarouselConfigPanel,
  GalleryConfigPanel,
  BeforeAfterConfigPanel,
  TableConfigPanel,
  EmbedConfigPanel,
  SEOAnalyzerConfigPanel,
  ReadabilityConfigPanel,
  KeywordsConfigPanel,
  HeadingsConfigPanel,
  SchemaMarkupConfigPanel,
  InternalLinksConfigPanel,
  LinkCheckerConfigPanel,
  DevicePreviewConfigPanel,
  SocialPreviewConfigPanel,
  ContentOutlineConfigPanel,
  VersionHistoryConfigPanel,
  AnalyticsConfigPanel,
  CollaborationConfigPanel,
  ImageOptimizerConfigPanel,
  PluginsConfigPanel,
};
