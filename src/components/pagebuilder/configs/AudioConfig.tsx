/**
 * AudioConfig - Audio Block Configuration
 */

import React from 'react';
import { Upload, Music } from 'lucide-react';
import clsx from 'clsx';

interface AudioConfigProps {
  settings: Record<string, any>;
  onChange: (settings: Record<string, any>) => void;
  blockType: string;
  activeTab?: 'content' | 'behavior' | 'style';
}

const AudioConfig: React.FC<AudioConfigProps> = ({
  settings,
  onChange,
  activeTab = 'content',
}) => {
  if (activeTab === 'content') {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Audio URL
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={settings.src || ''}
              onChange={(e) => onChange({ ...settings, src: e.target.value })}
              className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              placeholder="https://example.com/audio.mp3"
            />
            <button className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200">
              <Upload className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Supports MP3, WAV, OGG formats
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title (optional)
          </label>
          <input
            type="text"
            value={settings.title || ''}
            onChange={(e) => onChange({ ...settings, title: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            placeholder="Audio title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Artist (optional)
          </label>
          <input
            type="text"
            value={settings.artist || ''}
            onChange={(e) => onChange({ ...settings, artist: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            placeholder="Artist name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Cover Image (optional)
          </label>
          <input
            type="url"
            value={settings.cover || ''}
            onChange={(e) => onChange({ ...settings, cover: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            placeholder="https://example.com/cover.jpg"
          />
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
            placeholder="Audio caption"
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
            <span className="text-sm text-gray-700 dark:text-gray-300">Autoplay</span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-6">
            May be blocked by browsers without user interaction
          </p>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.loop || false}
              onChange={(e) => onChange({ ...settings, loop: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Loop</span>
          </label>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.muted || false}
              onChange={(e) => onChange({ ...settings, muted: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Start muted</span>
          </label>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.preload !== false}
              onChange={(e) => onChange({ ...settings, preload: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Preload audio</span>
          </label>
        </div>
      </div>
    );
  }

  if (activeTab === 'style') {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Player Style
          </label>
          <div className="space-y-2">
            {['default', 'compact', 'full'].map((style) => (
              <button
                key={style}
                onClick={() => onChange({ ...settings, playerStyle: style })}
                className={clsx(
                  'w-full px-4 py-3 rounded-lg border-2 transition-colors text-left capitalize',
                  settings.playerStyle === style
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                )}
              >
                <span className="text-sm font-medium">{style}</span>
                <p className="text-xs text-gray-500 mt-0.5">
                  {style === 'default' && 'Standard browser audio player'}
                  {style === 'compact' && 'Minimal player with basic controls'}
                  {style === 'full' && 'Full player with waveform and cover'}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Accent Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={settings.accentColor || '#3b82f6'}
              onChange={(e) => onChange({ ...settings, accentColor: e.target.value })}
              className="w-10 h-10 rounded border cursor-pointer"
            />
            <input
              type="text"
              value={settings.accentColor || '#3b82f6'}
              onChange={(e) => onChange({ ...settings, accentColor: e.target.value })}
              className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AudioConfig;
