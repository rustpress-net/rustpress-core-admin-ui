/**
 * EmbedConfig - Embed Block Configuration
 */

import React from 'react';
import { Youtube, Music, FileText, Globe } from 'lucide-react';
import clsx from 'clsx';

interface EmbedConfigProps {
  settings: Record<string, any>;
  onChange: (settings: Record<string, any>) => void;
  blockType: string;
  activeTab?: 'content' | 'behavior' | 'style';
}

const EMBED_TYPES = [
  { value: 'youtube', label: 'YouTube', icon: Youtube },
  { value: 'vimeo', label: 'Vimeo', icon: Youtube },
  { value: 'spotify', label: 'Spotify', icon: Music },
  { value: 'soundcloud', label: 'SoundCloud', icon: Music },
  { value: 'twitter', label: 'Twitter/X', icon: Globe },
  { value: 'instagram', label: 'Instagram', icon: Globe },
  { value: 'codepen', label: 'CodePen', icon: FileText },
  { value: 'figma', label: 'Figma', icon: FileText },
  { value: 'custom', label: 'Custom URL', icon: Globe },
];

const EmbedConfig: React.FC<EmbedConfigProps> = ({
  settings,
  onChange,
  activeTab = 'content',
}) => {
  if (activeTab === 'content') {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Embed Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {EMBED_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => onChange({ ...settings, embedType: type.value })}
                  className={clsx(
                    'flex flex-col items-center gap-1 px-3 py-3 rounded-lg border-2 transition-colors',
                    settings.embedType === type.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            URL or Embed Code
          </label>
          <textarea
            value={settings.url || ''}
            onChange={(e) => onChange({ ...settings, url: e.target.value })}
            className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg resize-none"
            placeholder="Paste URL or embed code..."
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">
            {settings.embedType === 'youtube' && 'e.g., https://www.youtube.com/watch?v=...'}
            {settings.embedType === 'vimeo' && 'e.g., https://vimeo.com/...'}
            {settings.embedType === 'spotify' && 'e.g., https://open.spotify.com/track/...'}
            {settings.embedType === 'twitter' && 'e.g., https://twitter.com/.../status/...'}
            {settings.embedType === 'custom' && 'Paste any embed URL or iframe code'}
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
            placeholder="Add a caption..."
          />
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
              checked={settings.autoplay || false}
              onChange={(e) => onChange({ ...settings, autoplay: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Autoplay (if supported)</span>
          </label>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.loop || false}
              onChange={(e) => onChange({ ...settings, loop: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Loop (if supported)</span>
          </label>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.lazyLoad !== false}
              onChange={(e) => onChange({ ...settings, lazyLoad: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Lazy load</span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-6">
            Load embed only when scrolled into view
          </p>
        </div>
      </div>
    );
  }

  if (activeTab === 'style') {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Aspect Ratio
          </label>
          <select
            value={settings.aspectRatio || '16:9'}
            onChange={(e) => onChange({ ...settings, aspectRatio: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="16:9">16:9 (Widescreen)</option>
            <option value="4:3">4:3 (Standard)</option>
            <option value="1:1">1:1 (Square)</option>
            <option value="9:16">9:16 (Portrait)</option>
            <option value="auto">Auto</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Max Width
          </label>
          <select
            value={settings.maxWidth || '100%'}
            onChange={(e) => onChange({ ...settings, maxWidth: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="100%">Full width</option>
            <option value="800px">Large (800px)</option>
            <option value="600px">Medium (600px)</option>
            <option value="400px">Small (400px)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Border Radius: {settings.borderRadius || 0}px
          </label>
          <input
            type="range"
            min="0"
            max="24"
            value={parseInt(settings.borderRadius) || 0}
            onChange={(e) => onChange({ ...settings, borderRadius: `${e.target.value}px` })}
            className="w-full"
          />
        </div>
      </div>
    );
  }

  return null;
};

export default EmbedConfig;
