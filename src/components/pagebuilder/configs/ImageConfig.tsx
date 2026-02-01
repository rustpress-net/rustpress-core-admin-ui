/**
 * ImageConfig - Image Block Configuration
 */

import React from 'react';
import { Upload, Link, ExternalLink } from 'lucide-react';
import clsx from 'clsx';

interface ImageConfigProps {
  settings: Record<string, any>;
  onChange: (settings: Record<string, any>) => void;
  blockType: string;
  activeTab?: 'content' | 'behavior' | 'style';
}

const ImageConfig: React.FC<ImageConfigProps> = ({
  settings,
  onChange,
  activeTab = 'content',
}) => {
  if (activeTab === 'content') {
    return (
      <div className="space-y-6">
        {/* Image Preview */}
        {settings.src && (
          <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <img
              src={settings.src}
              alt={settings.alt || ''}
              className="w-full h-48 object-cover"
            />
            <button
              onClick={() => onChange({ ...settings, src: '' })}
              className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Image URL
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={settings.src || ''}
              onChange={(e) => onChange({ ...settings, src: e.target.value })}
              className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              placeholder="https://example.com/image.jpg"
            />
            <button className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
              <Upload className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Alt Text
          </label>
          <input
            type="text"
            value={settings.alt || ''}
            onChange={(e) => onChange({ ...settings, alt: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            placeholder="Describe the image for accessibility"
          />
          <p className="text-xs text-gray-500 mt-1">
            Important for SEO and accessibility
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Caption (optional)
          </label>
          <input
            type="text"
            value={settings.caption || ''}
            onChange={(e) => onChange({ ...settings, caption: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            placeholder="Image caption"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Link To (optional)
          </label>
          <input
            type="url"
            value={settings.linkUrl || ''}
            onChange={(e) => onChange({ ...settings, linkUrl: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            placeholder="https://..."
          />
          {settings.linkUrl && (
            <div className="mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.linkNewTab || false}
                  onChange={(e) => onChange({ ...settings, linkNewTab: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Open in new tab</span>
              </label>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeTab === 'behavior') {
    return (
      <div className="space-y-6">
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.lightbox || false}
              onChange={(e) => onChange({ ...settings, lightbox: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Enable lightbox</span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-6">
            Click to open image in fullscreen overlay
          </p>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.lazyLoad !== false}
              onChange={(e) => onChange({ ...settings, lazyLoad: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Lazy loading</span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-6">
            Load image only when visible
          </p>
        </div>
      </div>
    );
  }

  if (activeTab === 'style') {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Size
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['auto', '50%', '100%'].map((size) => (
              <button
                key={size}
                onClick={() => onChange({ ...settings, width: size })}
                className={clsx(
                  'px-3 py-2 text-sm rounded-lg border-2 transition-colors',
                  settings.width === size
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                )}
              >
                {size === 'auto' ? 'Auto' : size}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Alignment
          </label>
          <div className="flex gap-2">
            {['left', 'center', 'right'].map((align) => (
              <button
                key={align}
                onClick={() => onChange({ ...settings, alignment: align })}
                className={clsx(
                  'flex-1 px-3 py-2 text-sm rounded-lg border-2 transition-colors capitalize',
                  settings.alignment === align
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                )}
              >
                {align}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Border Radius: {settings.borderRadius || 0}px
          </label>
          <input
            type="range"
            min="0"
            max="32"
            value={parseInt(settings.borderRadius) || 0}
            onChange={(e) => onChange({ ...settings, borderRadius: `${e.target.value}px` })}
            className="w-full"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.shadow || false}
              onChange={(e) => onChange({ ...settings, shadow: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Add shadow</span>
          </label>
        </div>
      </div>
    );
  }

  return null;
};

export default ImageConfig;
