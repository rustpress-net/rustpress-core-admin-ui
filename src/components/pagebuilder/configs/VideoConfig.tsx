/**
 * VideoConfig - Video Block Configuration
 *
 * Configure video source, playback options, and controls.
 */

import React from 'react';
import { Video, Play, ExternalLink } from 'lucide-react';
import clsx from 'clsx';

interface VideoConfigProps {
  settings: Record<string, any>;
  onChange: (settings: Record<string, any>) => void;
  blockType: string;
  activeTab?: 'content' | 'behavior' | 'style';
}

const VideoConfig: React.FC<VideoConfigProps> = ({
  settings,
  onChange,
  activeTab = 'content',
}) => {
  // Extract video ID from YouTube/Vimeo URLs
  const extractVideoId = (url: string, type: string) => {
    if (type === 'youtube') {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
      return match ? match[1] : url;
    }
    if (type === 'vimeo') {
      const match = url.match(/(?:vimeo\.com\/)(\d+)/);
      return match ? match[1] : url;
    }
    return url;
  };

  const handleUrlChange = (url: string) => {
    // Auto-detect video type
    let type = settings.type || 'youtube';
    if (url.includes('vimeo.com')) {
      type = 'vimeo';
    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
      type = 'youtube';
    } else if (url.match(/\.(mp4|webm|ogg)$/i)) {
      type = 'file';
    }
    onChange({ ...settings, src: url, type });
  };

  if (activeTab === 'content') {
    return (
      <div className="space-y-6">
        {/* Video Source Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Video Source
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'youtube', label: 'YouTube' },
              { value: 'vimeo', label: 'Vimeo' },
              { value: 'file', label: 'File/URL' },
            ].map((source) => (
              <button
                key={source.value}
                onClick={() => onChange({ ...settings, type: source.value })}
                className={clsx(
                  'p-3 rounded-lg border-2 transition-colors text-center',
                  settings.type === source.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                )}
              >
                <span className="text-xs font-medium">{source.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Video URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {settings.type === 'youtube' ? 'YouTube URL or Video ID' :
             settings.type === 'vimeo' ? 'Vimeo URL or Video ID' :
             'Video URL'}
          </label>
          <input
            type="text"
            value={settings.src || ''}
            onChange={(e) => handleUrlChange(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder={
              settings.type === 'youtube' ? 'https://youtube.com/watch?v=...' :
              settings.type === 'vimeo' ? 'https://vimeo.com/...' :
              'https://example.com/video.mp4'
            }
          />
          {settings.type === 'youtube' && (
            <p className="text-xs text-gray-500 mt-1">
              Paste a full YouTube URL or just the video ID
            </p>
          )}
        </div>

        {/* Preview */}
        {settings.src && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preview
            </label>
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
              {settings.type === 'youtube' && (
                <iframe
                  src={`https://www.youtube.com/embed/${extractVideoId(settings.src, 'youtube')}`}
                  className="w-full h-full"
                  allowFullScreen
                />
              )}
              {settings.type === 'vimeo' && (
                <iframe
                  src={`https://player.vimeo.com/video/${extractVideoId(settings.src, 'vimeo')}`}
                  className="w-full h-full"
                  allowFullScreen
                />
              )}
              {settings.type === 'file' && (
                <video
                  src={settings.src}
                  className="w-full h-full"
                  controls
                />
              )}
            </div>
          </div>
        )}

        {/* Poster Image */}
        {settings.type === 'file' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Poster Image (optional)
            </label>
            <input
              type="text"
              value={settings.poster || ''}
              onChange={(e) => onChange({ ...settings, poster: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/poster.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Image shown before the video plays
            </p>
          </div>
        )}
      </div>
    );
  }

  if (activeTab === 'behavior') {
    return (
      <div className="space-y-6">
        {/* Autoplay */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoplay || false}
              onChange={(e) => onChange({ ...settings, autoplay: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Autoplay</span>
          </label>
          {settings.autoplay && (
            <p className="text-xs text-gray-500 ml-6">
              Note: Most browsers require videos to be muted for autoplay
            </p>
          )}
        </div>

        {/* Muted */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.muted || false}
              onChange={(e) => onChange({ ...settings, muted: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Start muted</span>
          </label>
        </div>

        {/* Loop */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.loop || false}
              onChange={(e) => onChange({ ...settings, loop: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Loop video</span>
          </label>
        </div>

        {/* Controls */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.controls !== false}
              onChange={(e) => onChange({ ...settings, controls: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show controls</span>
          </label>
        </div>

        {/* Platform-specific options */}
        {settings.type === 'youtube' && (
          <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">YouTube Options</h4>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showRelated === false ? false : true}
                onChange={(e) => onChange({ ...settings, showRelated: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Show related videos</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.modestBranding || false}
                onChange={(e) => onChange({ ...settings, modestBranding: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Modest branding</span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start at (seconds)
              </label>
              <input
                type="number"
                value={settings.startAt || ''}
                onChange={(e) => onChange({ ...settings, startAt: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                placeholder="0"
                min="0"
              />
            </div>
          </div>
        )}

        {/* Lazy Loading */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.lazyLoad !== false}
              onChange={(e) => onChange({ ...settings, lazyLoad: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Lazy load video</span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-6">
            Only load the video when it's about to enter the viewport
          </p>
        </div>
      </div>
    );
  }

  if (activeTab === 'style') {
    return (
      <div className="space-y-6">
        {/* Aspect Ratio */}
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
            <option value="21:9">21:9 (Ultrawide)</option>
            <option value="1:1">1:1 (Square)</option>
            <option value="9:16">9:16 (Vertical)</option>
          </select>
        </div>

        {/* Border Radius */}
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

        {/* Width */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Width
          </label>
          <select
            value={settings.width || '100%'}
            onChange={(e) => onChange({ ...settings, width: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="100%">Full width</option>
            <option value="75%">75%</option>
            <option value="50%">50%</option>
            <option value="640px">640px (Small)</option>
            <option value="854px">854px (Medium)</option>
            <option value="1280px">1280px (Large)</option>
          </select>
        </div>

        {/* Alignment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Alignment
          </label>
          <select
            value={settings.alignment || 'center'}
            onChange={(e) => onChange({ ...settings, alignment: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>

        {/* Play Button Overlay */}
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Play Button Overlay</h4>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showPlayButton !== false}
              onChange={(e) => onChange({ ...settings, showPlayButton: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show custom play button</span>
          </label>

          {settings.showPlayButton !== false && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Play Button Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.playButtonColor || '#ffffff'}
                  onChange={(e) => onChange({ ...settings, playButtonColor: e.target.value })}
                  className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.playButtonColor || '#ffffff'}
                  onChange={(e) => onChange({ ...settings, playButtonColor: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default VideoConfig;
