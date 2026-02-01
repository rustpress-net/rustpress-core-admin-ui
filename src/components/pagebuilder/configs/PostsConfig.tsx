/**
 * PostsConfig - Posts Block Configuration
 *
 * Configure post query filters and layout options.
 */

import React from 'react';
import { FileText, Grid, LayoutList, LayoutGrid } from 'lucide-react';
import clsx from 'clsx';

interface PostsConfigProps {
  settings: Record<string, any>;
  onChange: (settings: Record<string, any>) => void;
  blockType: string;
  activeTab?: 'content' | 'behavior' | 'style';
}

const PostsConfig: React.FC<PostsConfigProps> = ({
  settings,
  onChange,
  activeTab = 'content',
}) => {
  if (activeTab === 'content') {
    return (
      <div className="space-y-6">
        {/* Number of Posts */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Number of Posts: {settings.count || 6}
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={settings.count || 6}
            onChange={(e) => onChange({ ...settings, count: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>

        {/* Post Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Post Type
          </label>
          <select
            value={settings.postType || 'post'}
            onChange={(e) => onChange({ ...settings, postType: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="post">Blog Posts</option>
            <option value="page">Pages</option>
            <option value="product">Products</option>
            <option value="portfolio">Portfolio</option>
          </select>
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Filter by Category (optional)
          </label>
          <input
            type="text"
            value={settings.categories || ''}
            onChange={(e) => onChange({ ...settings, categories: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            placeholder="category-slug-1, category-slug-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter category slugs separated by commas
          </p>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Filter by Tags (optional)
          </label>
          <input
            type="text"
            value={settings.tags || ''}
            onChange={(e) => onChange({ ...settings, tags: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            placeholder="tag-1, tag-2"
          />
        </div>

        {/* Order By */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Order By
            </label>
            <select
              value={settings.orderBy || 'date'}
              onChange={(e) => onChange({ ...settings, orderBy: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              <option value="date">Date</option>
              <option value="title">Title</option>
              <option value="modified">Modified Date</option>
              <option value="random">Random</option>
              <option value="views">Popular (views)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Order
            </label>
            <select
              value={settings.order || 'desc'}
              onChange={(e) => onChange({ ...settings, order: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Offset */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Offset (skip posts)
          </label>
          <input
            type="number"
            value={settings.offset || 0}
            onChange={(e) => onChange({ ...settings, offset: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            min="0"
          />
          <p className="text-xs text-gray-500 mt-1">
            Number of posts to skip (useful for pagination)
          </p>
        </div>
      </div>
    );
  }

  if (activeTab === 'behavior') {
    return (
      <div className="space-y-6">
        {/* Display Elements */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Display Elements</h4>
          <div className="space-y-2">
            {[
              { key: 'showThumbnail', label: 'Featured Image' },
              { key: 'showTitle', label: 'Title' },
              { key: 'showExcerpt', label: 'Excerpt' },
              { key: 'showDate', label: 'Date' },
              { key: 'showAuthor', label: 'Author' },
              { key: 'showCategory', label: 'Category' },
              { key: 'showReadMore', label: 'Read More Link' },
            ].map((item) => (
              <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[item.key] !== false}
                  onChange={(e) => onChange({ ...settings, [item.key]: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Excerpt Length */}
        {settings.showExcerpt !== false && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Excerpt Length: {settings.excerptLength || 20} words
            </label>
            <input
              type="range"
              min="10"
              max="50"
              value={settings.excerptLength || 20}
              onChange={(e) => onChange({ ...settings, excerptLength: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        )}

        {/* Read More Text */}
        {settings.showReadMore !== false && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Read More Text
            </label>
            <input
              type="text"
              value={settings.readMoreText || 'Read More'}
              onChange={(e) => onChange({ ...settings, readMoreText: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>
        )}

        {/* Pagination */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showPagination || false}
              onChange={(e) => onChange({ ...settings, showPagination: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show pagination</span>
          </label>
        </div>

        {/* Load More */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.loadMore || false}
              onChange={(e) => onChange({ ...settings, loadMore: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Enable "Load More" button</span>
          </label>
        </div>
      </div>
    );
  }

  if (activeTab === 'style') {
    return (
      <div className="space-y-6">
        {/* Layout */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Layout
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'grid', label: 'Grid', icon: Grid },
              { value: 'list', label: 'List', icon: LayoutList },
              { value: 'masonry', label: 'Masonry', icon: LayoutGrid },
            ].map((layout) => (
              <button
                key={layout.value}
                onClick={() => onChange({ ...settings, layout: layout.value })}
                className={clsx(
                  'flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-colors',
                  settings.layout === layout.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                )}
              >
                <layout.icon className="w-5 h-5" />
                <span className="text-xs">{layout.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Columns */}
        {settings.layout !== 'list' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Columns: {settings.columns || 3}
            </label>
            <input
              type="range"
              min="1"
              max="4"
              value={settings.columns || 3}
              onChange={(e) => onChange({ ...settings, columns: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
            </div>
          </div>
        )}

        {/* Gap */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Gap: {settings.gap || 24}px
          </label>
          <input
            type="range"
            min="8"
            max="48"
            value={parseInt(settings.gap) || 24}
            onChange={(e) => onChange({ ...settings, gap: `${e.target.value}px` })}
            className="w-full"
          />
        </div>

        {/* Image Aspect Ratio */}
        {settings.showThumbnail !== false && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Image Aspect Ratio
            </label>
            <select
              value={settings.imageRatio || '16:9'}
              onChange={(e) => onChange({ ...settings, imageRatio: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              <option value="16:9">16:9 (Widescreen)</option>
              <option value="4:3">4:3 (Standard)</option>
              <option value="1:1">1:1 (Square)</option>
              <option value="3:2">3:2</option>
              <option value="auto">Auto (original)</option>
            </select>
          </div>
        )}

        {/* Card Style */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Card Style
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'default', label: 'Default' },
              { value: 'bordered', label: 'Bordered' },
              { value: 'elevated', label: 'Elevated' },
              { value: 'minimal', label: 'Minimal' },
            ].map((style) => (
              <button
                key={style.value}
                onClick={() => onChange({ ...settings, cardStyle: style.value })}
                className={clsx(
                  'p-3 rounded-lg border-2 transition-colors text-center',
                  settings.cardStyle === style.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                )}
              >
                <span className="text-xs font-medium">{style.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Border Radius */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Border Radius: {settings.borderRadius || 8}px
          </label>
          <input
            type="range"
            min="0"
            max="24"
            value={parseInt(settings.borderRadius) || 8}
            onChange={(e) => onChange({ ...settings, borderRadius: `${e.target.value}px` })}
            className="w-full"
          />
        </div>

        {/* Title Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title Size
          </label>
          <select
            value={settings.titleSize || 'medium'}
            onChange={(e) => onChange({ ...settings, titleSize: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="small">Small (16px)</option>
            <option value="medium">Medium (18px)</option>
            <option value="large">Large (20px)</option>
          </select>
        </div>

        {/* Hover Effect */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.hoverEffect !== false}
              onChange={(e) => onChange({ ...settings, hoverEffect: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Enable hover effect</span>
          </label>
        </div>
      </div>
    );
  }

  return null;
};

export default PostsConfig;
