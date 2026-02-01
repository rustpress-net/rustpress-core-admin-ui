/**
 * CarouselConfig - Carousel Block Configuration
 *
 * Configure slides, autoplay, and navigation options.
 */

import React, { useState } from 'react';
import {
  Image,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Circle,
  Square,
  Plus,
} from 'lucide-react';
import clsx from 'clsx';
import ArrayEditor from '../config/shared/ArrayEditor';

interface CarouselSlide {
  id: string;
  image: string;
  title?: string;
  text?: string;
  button?: {
    text: string;
    url: string;
  };
}

interface CarouselConfigProps {
  settings: Record<string, any>;
  onChange: (settings: Record<string, any>) => void;
  blockType: string;
  activeTab?: 'content' | 'behavior' | 'style';
}

const TRANSITION_EFFECTS = [
  { value: 'slide', label: 'Slide' },
  { value: 'fade', label: 'Fade' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'flip', label: 'Flip' },
];

const INDICATOR_STYLES = [
  { value: 'dots', label: 'Dots', icon: Circle },
  { value: 'lines', label: 'Lines', icon: Square },
  { value: 'numbers', label: 'Numbers' },
  { value: 'none', label: 'None' },
];

const CarouselConfig: React.FC<CarouselConfigProps> = ({
  settings,
  onChange,
  activeTab = 'content',
}) => {
  const [imageUrlInput, setImageUrlInput] = useState('');
  const slides: CarouselSlide[] = settings.slides || [];

  const handleSlidesChange = (newSlides: CarouselSlide[]) => {
    onChange({ ...settings, slides: newSlides });
  };

  const addSlideFromUrl = () => {
    if (!imageUrlInput.trim()) return;
    const newSlide: CarouselSlide = {
      id: `slide_${Date.now()}`,
      image: imageUrlInput.trim(),
      title: '',
      text: '',
    };
    handleSlidesChange([...slides, newSlide]);
    setImageUrlInput('');
  };

  const createSlide = (): CarouselSlide => ({
    id: `slide_${Date.now()}`,
    image: '',
    title: '',
    text: '',
  });

  const renderSlideEditor = (slide: CarouselSlide, index: number, handlers: any) => (
    <div className="space-y-4">
      {/* Image Preview */}
      <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
        {slide.image ? (
          <img
            src={slide.image}
            alt={slide.title || `Slide ${index + 1}`}
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
          value={slide.image}
          onChange={(e) => handlers.update({ image: e.target.value })}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Title (optional)</label>
        <input
          type="text"
          value={slide.title || ''}
          onChange={(e) => handlers.update({ title: e.target.value })}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Slide title"
        />
      </div>

      {/* Text */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Description (optional)</label>
        <textarea
          value={slide.text || ''}
          onChange={(e) => handlers.update({ text: e.target.value })}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Slide description"
          rows={2}
        />
      </div>

      {/* Button */}
      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
        <label className="block text-xs font-medium text-gray-500 mb-2">Button (optional)</label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              type="text"
              value={slide.button?.text || ''}
              onChange={(e) => handlers.update({
                button: { ...slide.button, text: e.target.value, url: slide.button?.url || '' }
              })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Button text"
            />
          </div>
          <div>
            <input
              type="text"
              value={slide.button?.url || ''}
              onChange={(e) => handlers.update({
                button: { ...slide.button, url: e.target.value, text: slide.button?.text || '' }
              })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Button URL"
            />
          </div>
        </div>
      </div>
    </div>
  );

  if (activeTab === 'content') {
    return (
      <div className="space-y-6">
        {/* Quick Add Slide */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quick Add Slide
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSlideFromUrl()}
              className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Paste image URL and press Enter"
            />
            <button
              onClick={addSlideFromUrl}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slides List */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
            Slides ({slides.length})
          </h3>
          <ArrayEditor
            items={slides}
            onChange={handleSlidesChange}
            renderItem={renderSlideEditor}
            createItem={createSlide}
            getItemKey={(slide) => slide.id}
            addLabel="Add Slide"
            emptyLabel="No slides yet. Add slides to build your carousel."
            collapsible={true}
            itemLabel={(slide, idx) => slide.title || `Slide ${idx + 1}`}
          />
        </div>
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
              checked={settings.autoplay !== false}
              onChange={(e) => onChange({ ...settings, autoplay: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Enable autoplay</span>
          </label>

          {settings.autoplay !== false && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Interval: {(settings.interval || 5000) / 1000}s
              </label>
              <input
                type="range"
                min="2000"
                max="10000"
                step="500"
                value={settings.interval || 5000}
                onChange={(e) => onChange({ ...settings, interval: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>2s</span>
                <span>6s</span>
                <span>10s</span>
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.pauseOnHover !== false}
              onChange={(e) => onChange({ ...settings, pauseOnHover: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Pause on hover</span>
          </label>
        </div>

        {/* Navigation */}
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Navigation</h4>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showArrows !== false}
              onChange={(e) => onChange({ ...settings, showArrows: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show navigation arrows</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showIndicators !== false}
              onChange={(e) => onChange({ ...settings, showIndicators: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show slide indicators</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.infiniteLoop !== false}
              onChange={(e) => onChange({ ...settings, infiniteLoop: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Infinite loop</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.swipeable !== false}
              onChange={(e) => onChange({ ...settings, swipeable: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Enable swipe gestures</span>
          </label>
        </div>

        {/* Transition */}
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Transition Effect
            </label>
            <select
              value={settings.transition || 'slide'}
              onChange={(e) => onChange({ ...settings, transition: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              {TRANSITION_EFFECTS.map((effect) => (
                <option key={effect.value} value={effect.value}>{effect.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Transition Speed: {settings.transitionSpeed || 500}ms
            </label>
            <input
              type="range"
              min="200"
              max="1000"
              step="100"
              value={settings.transitionSpeed || 500}
              onChange={(e) => onChange({ ...settings, transitionSpeed: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'style') {
    return (
      <div className="space-y-6">
        {/* Indicator Style */}
        {settings.showIndicators !== false && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Indicator Style
            </label>
            <div className="grid grid-cols-4 gap-2">
              {INDICATOR_STYLES.map((style) => (
                <button
                  key={style.value}
                  onClick={() => onChange({ ...settings, indicatorStyle: style.value })}
                  className={clsx(
                    'flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-colors',
                    settings.indicatorStyle === style.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  )}
                >
                  {style.icon ? <style.icon className="w-4 h-4" /> : <span className="text-xs">123</span>}
                  <span className="text-xs">{style.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

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
            <option value="auto">Auto (Image height)</option>
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

        {/* Content Overlay */}
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Content Overlay</h4>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showOverlay !== false}
              onChange={(e) => onChange({ ...settings, showOverlay: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show text overlay</span>
          </label>

          {settings.showOverlay !== false && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Overlay Position
                </label>
                <select
                  value={settings.overlayPosition || 'bottom'}
                  onChange={(e) => onChange({ ...settings, overlayPosition: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  <option value="bottom">Bottom</option>
                  <option value="center">Center</option>
                  <option value="top">Top</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Overlay Background
                </label>
                <select
                  value={settings.overlayBackground || 'gradient'}
                  onChange={(e) => onChange({ ...settings, overlayBackground: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  <option value="gradient">Gradient</option>
                  <option value="solid">Solid Dark</option>
                  <option value="transparent">Transparent</option>
                </select>
              </div>
            </>
          )}
        </div>

        {/* Arrow Style */}
        {settings.showArrows !== false && (
          <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Arrow Style</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Arrow Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.arrowColor || '#ffffff'}
                  onChange={(e) => onChange({ ...settings, arrowColor: e.target.value })}
                  className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.arrowColor || '#ffffff'}
                  onChange={(e) => onChange({ ...settings, arrowColor: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default CarouselConfig;
