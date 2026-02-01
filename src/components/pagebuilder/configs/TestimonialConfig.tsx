/**
 * TestimonialConfig - Testimonial Block Configuration
 *
 * Configure customer review display with quote, author, and rating.
 */

import React from 'react';
import { Quote, Star, User, Image } from 'lucide-react';
import clsx from 'clsx';

interface TestimonialConfigProps {
  settings: Record<string, any>;
  onChange: (settings: Record<string, any>) => void;
  blockType: string;
  activeTab?: 'content' | 'behavior' | 'style';
}

const TestimonialConfig: React.FC<TestimonialConfigProps> = ({
  settings,
  onChange,
  activeTab = 'content',
}) => {
  if (activeTab === 'content') {
    return (
      <div className="space-y-6">
        {/* Quote */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Quote / Review
          </label>
          <textarea
            value={settings.quote || ''}
            onChange={(e) => onChange({ ...settings, quote: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="This product has completely transformed my workflow..."
            rows={4}
          />
        </div>

        {/* Author Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Author Name
          </label>
          <input
            type="text"
            value={settings.author || ''}
            onChange={(e) => onChange({ ...settings, author: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="John Doe"
          />
        </div>

        {/* Author Title/Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Author Title/Role (optional)
          </label>
          <input
            type="text"
            value={settings.authorTitle || ''}
            onChange={(e) => onChange({ ...settings, authorTitle: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="CEO at Acme Inc."
          />
        </div>

        {/* Company */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Company (optional)
          </label>
          <input
            type="text"
            value={settings.company || ''}
            onChange={(e) => onChange({ ...settings, company: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Acme Inc."
          />
        </div>

        {/* Avatar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Avatar Image URL (optional)
          </label>
          <div className="flex gap-3">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
              {settings.avatar ? (
                <img
                  src={settings.avatar}
                  alt={settings.author}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <input
              type="text"
              value={settings.avatar || ''}
              onChange={(e) => onChange({ ...settings, avatar: e.target.value })}
              className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rating
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => onChange({ ...settings, rating: star })}
                className="p-1 hover:scale-110 transition-transform"
              >
                <Star
                  className={clsx(
                    'w-6 h-6',
                    star <= (settings.rating || 5)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  )}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-500">
              {settings.rating || 5} / 5
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'behavior') {
    return (
      <div className="space-y-6">
        {/* Show Rating */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showRating !== false}
              onChange={(e) => onChange({ ...settings, showRating: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show star rating</span>
          </label>
        </div>

        {/* Show Avatar */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showAvatar !== false}
              onChange={(e) => onChange({ ...settings, showAvatar: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show avatar</span>
          </label>
        </div>

        {/* Show Quote Marks */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showQuoteMarks !== false}
              onChange={(e) => onChange({ ...settings, showQuoteMarks: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show quote marks</span>
          </label>
        </div>

        {/* Link */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Link URL (optional)
          </label>
          <input
            type="text"
            value={settings.linkUrl || ''}
            onChange={(e) => onChange({ ...settings, linkUrl: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/case-study"
          />
          <p className="text-xs text-gray-500 mt-1">
            Make the testimonial clickable to link to a case study or source
          </p>
        </div>
      </div>
    );
  }

  if (activeTab === 'style') {
    return (
      <div className="space-y-6">
        {/* Layout Style */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Layout Style
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'card', label: 'Card', description: 'Bordered card' },
              { value: 'minimal', label: 'Minimal', description: 'Clean look' },
              { value: 'bubble', label: 'Bubble', description: 'Speech bubble' },
              { value: 'modern', label: 'Modern', description: 'Large quote' },
            ].map((style) => (
              <button
                key={style.value}
                onClick={() => onChange({ ...settings, layoutStyle: style.value })}
                className={clsx(
                  'p-3 rounded-lg border-2 transition-colors text-left',
                  settings.layoutStyle === style.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                )}
              >
                <div className="text-xs font-medium">{style.label}</div>
                <div className="text-[10px] text-gray-500">{style.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Avatar Size */}
        {settings.showAvatar !== false && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Avatar Size
            </label>
            <select
              value={settings.avatarSize || 'medium'}
              onChange={(e) => onChange({ ...settings, avatarSize: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              <option value="small">Small (32px)</option>
              <option value="medium">Medium (48px)</option>
              <option value="large">Large (64px)</option>
            </select>
          </div>
        )}

        {/* Text Alignment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Text Alignment
          </label>
          <select
            value={settings.textAlign || 'left'}
            onChange={(e) => onChange({ ...settings, textAlign: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
          </select>
        </div>

        {/* Colors */}
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Colors</h4>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Background Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.bgColor || '#f9fafb'}
                onChange={(e) => onChange({ ...settings, bgColor: e.target.value })}
                className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={settings.bgColor || '#f9fafb'}
                onChange={(e) => onChange({ ...settings, bgColor: e.target.value })}
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Quote Text Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.quoteColor || '#374151'}
                onChange={(e) => onChange({ ...settings, quoteColor: e.target.value })}
                className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={settings.quoteColor || '#374151'}
                onChange={(e) => onChange({ ...settings, quoteColor: e.target.value })}
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
          </div>

          {settings.showRating !== false && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Star Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.starColor || '#facc15'}
                  onChange={(e) => onChange({ ...settings, starColor: e.target.value })}
                  className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.starColor || '#facc15'}
                  onChange={(e) => onChange({ ...settings, starColor: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>
            </div>
          )}
        </div>

        {/* Border Radius */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Border Radius: {settings.borderRadius || 12}px
          </label>
          <input
            type="range"
            min="0"
            max="24"
            value={parseInt(settings.borderRadius) || 12}
            onChange={(e) => onChange({ ...settings, borderRadius: `${e.target.value}px` })}
            className="w-full"
          />
        </div>

        {/* Quote Font Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Quote Font Size
          </label>
          <select
            value={settings.quoteFontSize || 'medium'}
            onChange={(e) => onChange({ ...settings, quoteFontSize: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="small">Small (14px)</option>
            <option value="medium">Medium (16px)</option>
            <option value="large">Large (18px)</option>
            <option value="xlarge">Extra Large (20px)</option>
          </select>
        </div>
      </div>
    );
  }

  return null;
};

export default TestimonialConfig;
