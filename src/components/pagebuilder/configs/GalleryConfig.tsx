/**
 * GalleryConfig - Gallery Block Configuration
 *
 * Configure images, layout modes, and lightbox settings.
 */

import React, { useState } from 'react';
import {
  Image,
  Grid,
  LayoutGrid,
  Rows,
  Square,
  Columns,
  Plus,
  Trash2,
  Upload,
  Link,
  ZoomIn,
} from 'lucide-react';
import clsx from 'clsx';
import ArrayEditor from '../config/shared/ArrayEditor';

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  caption?: string;
}

interface GalleryConfigProps {
  settings: Record<string, any>;
  onChange: (settings: Record<string, any>) => void;
  blockType: string;
  activeTab?: 'content' | 'behavior' | 'style';
}

const LAYOUT_OPTIONS = [
  { value: 'grid', label: 'Grid', icon: Grid, description: 'Even grid layout' },
  { value: 'masonry', label: 'Masonry', icon: LayoutGrid, description: 'Pinterest-style layout' },
  { value: 'justified', label: 'Justified', icon: Rows, description: 'Row-based justified' },
  { value: 'mosaic', label: 'Mosaic', icon: Square, description: 'Mixed size tiles' },
  { value: 'carousel', label: 'Carousel', icon: Columns, description: 'Horizontal slider' },
];

const HOVER_EFFECTS = [
  { value: 'none', label: 'None' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'fade', label: 'Fade' },
  { value: 'slide', label: 'Slide Up' },
  { value: 'blur', label: 'Blur' },
];

const ASPECT_RATIOS = [
  { value: 'original', label: 'Original' },
  { value: 'square', label: 'Square (1:1)' },
  { value: '4:3', label: '4:3' },
  { value: '16:9', label: '16:9' },
  { value: '3:2', label: '3:2' },
];

const GalleryConfig: React.FC<GalleryConfigProps> = ({
  settings,
  onChange,
  activeTab = 'content',
}) => {
  const [imageUrlInput, setImageUrlInput] = useState('');
  const images: GalleryImage[] = settings.images || [];

  const handleImagesChange = (newImages: GalleryImage[]) => {
    onChange({ ...settings, images: newImages });
  };

  const addImageFromUrl = () => {
    if (!imageUrlInput.trim()) return;
    const newImage: GalleryImage = {
      id: `img_${Date.now()}`,
      src: imageUrlInput.trim(),
      alt: '',
      caption: '',
    };
    handleImagesChange([...images, newImage]);
    setImageUrlInput('');
  };

  const createImage = (): GalleryImage => ({
    id: `img_${Date.now()}`,
    src: '',
    alt: '',
    caption: '',
  });

  const renderImageEditor = (image: GalleryImage, index: number, handlers: any) => (
    <div className="space-y-3">
      {/* Image Preview */}
      <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
        {image.src ? (
          <img
            src={image.src}
            alt={image.alt}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext fill="%239ca3af" x="50" y="50" text-anchor="middle" dy=".3em" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Image className="w-8 h-8" />
          </div>
        )}
      </div>

      {/* Image URL */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Image URL</label>
        <input
          type="text"
          value={image.src}
          onChange={(e) => handlers.update({ src: e.target.value })}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {/* Alt Text */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Alt Text</label>
        <input
          type="text"
          value={image.alt}
          onChange={(e) => handlers.update({ alt: e.target.value })}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Describe the image"
        />
      </div>

      {/* Caption */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Caption (optional)</label>
        <input
          type="text"
          value={image.caption || ''}
          onChange={(e) => handlers.update({ caption: e.target.value })}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Image caption"
        />
      </div>
    </div>
  );

  if (activeTab === 'content') {
    return (
      <div className="space-y-6">
        {/* Quick Add Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quick Add Image
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addImageFromUrl()}
              className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Paste image URL and press Enter"
            />
            <button
              onClick={addImageFromUrl}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image List */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
            Images ({images.length})
          </h3>
          <ArrayEditor
            items={images}
            onChange={handleImagesChange}
            renderItem={renderImageEditor}
            createItem={createImage}
            getItemKey={(img) => img.id}
            addLabel="Add Image"
            emptyLabel="No images yet. Add images to build your gallery."
            collapsible={true}
            itemLabel={(img, idx) => img.alt || `Image ${idx + 1}`}
          />
        </div>
      </div>
    );
  }

  if (activeTab === 'behavior') {
    return (
      <div className="space-y-6">
        {/* Layout Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Layout
          </label>
          <div className="grid grid-cols-5 gap-2">
            {LAYOUT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => onChange({ ...settings, layout: option.value })}
                className={clsx(
                  'flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-colors',
                  settings.layout === option.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                )}
                title={option.description}
              >
                <option.icon className="w-5 h-5" />
                <span className="text-xs">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Columns */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Columns: {settings.columns || 3}
          </label>
          <input
            type="range"
            min="2"
            max="6"
            value={settings.columns || 3}
            onChange={(e) => onChange({ ...settings, columns: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
            <span>6</span>
          </div>
        </div>

        {/* Lightbox */}
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableLightbox !== false}
              onChange={(e) => onChange({ ...settings, enableLightbox: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Enable lightbox</span>
          </label>

          {settings.enableLightbox !== false && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Lightbox Transition
                </label>
                <select
                  value={settings.lightboxTransition || 'fade'}
                  onChange={(e) => onChange({ ...settings, lightboxTransition: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  <option value="fade">Fade</option>
                  <option value="slide">Slide</option>
                  <option value="zoom">Zoom</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.lightboxShowCaptions !== false}
                  onChange={(e) => onChange({ ...settings, lightboxShowCaptions: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Show captions in lightbox</span>
              </label>
            </>
          )}
        </div>

        {/* Link Images */}
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.linkImages || false}
              onChange={(e) => onChange({ ...settings, linkImages: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Link images to original file</span>
          </label>
        </div>
      </div>
    );
  }

  if (activeTab === 'style') {
    return (
      <div className="space-y-6">
        {/* Gap */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Gap: {settings.gap || 16}px
          </label>
          <input
            type="range"
            min="0"
            max="32"
            value={parseInt(settings.gap) || 16}
            onChange={(e) => onChange({ ...settings, gap: `${e.target.value}px` })}
            className="w-full"
          />
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

        {/* Aspect Ratio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Aspect Ratio
          </label>
          <select
            value={settings.aspectRatio || 'original'}
            onChange={(e) => onChange({ ...settings, aspectRatio: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            {ASPECT_RATIOS.map((ratio) => (
              <option key={ratio.value} value={ratio.value}>{ratio.label}</option>
            ))}
          </select>
        </div>

        {/* Hover Effect */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Hover Effect
          </label>
          <select
            value={settings.hoverEffect || 'zoom'}
            onChange={(e) => onChange({ ...settings, hoverEffect: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            {HOVER_EFFECTS.map((effect) => (
              <option key={effect.value} value={effect.value}>{effect.label}</option>
            ))}
          </select>
        </div>

        {/* Show Captions */}
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showCaptions !== false}
              onChange={(e) => onChange({ ...settings, showCaptions: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show captions</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableHoverEffects !== false}
              onChange={(e) => onChange({ ...settings, enableHoverEffects: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Enable hover effects</span>
          </label>
        </div>
      </div>
    );
  }

  return null;
};

export default GalleryConfig;
