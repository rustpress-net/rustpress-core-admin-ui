/**
 * MapConfig - Map Block Configuration
 *
 * Configure map location, zoom level, and display options.
 */

import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import clsx from 'clsx';

interface MapConfigProps {
  settings: Record<string, any>;
  onChange: (settings: Record<string, any>) => void;
  blockType: string;
  activeTab?: 'content' | 'behavior' | 'style';
}

const MapConfig: React.FC<MapConfigProps> = ({
  settings,
  onChange,
  activeTab = 'content',
}) => {
  if (activeTab === 'content') {
    return (
      <div className="space-y-6">
        {/* Address or Coordinates */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Location Address
          </label>
          <input
            type="text"
            value={settings.address || ''}
            onChange={(e) => onChange({ ...settings, address: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="123 Main St, New York, NY 10001"
          />
        </div>

        {/* Or Coordinates */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">or enter coordinates</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Latitude</label>
            <input
              type="number"
              step="any"
              value={settings.lat || ''}
              onChange={(e) => onChange({ ...settings, lat: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              placeholder="40.7128"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Longitude</label>
            <input
              type="number"
              step="any"
              value={settings.lng || ''}
              onChange={(e) => onChange({ ...settings, lng: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              placeholder="-74.0060"
            />
          </div>
        </div>

        {/* Zoom Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Zoom Level: {settings.zoom || 14}
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={settings.zoom || 14}
            onChange={(e) => onChange({ ...settings, zoom: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>World</span>
            <span>City</span>
            <span>Street</span>
          </div>
        </div>

        {/* Marker Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Marker Title (optional)
          </label>
          <input
            type="text"
            value={settings.markerTitle || ''}
            onChange={(e) => onChange({ ...settings, markerTitle: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            placeholder="Our Office"
          />
        </div>

        {/* Info Window */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Info Window Content (optional)
          </label>
          <textarea
            value={settings.infoContent || ''}
            onChange={(e) => onChange({ ...settings, infoContent: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg resize-none"
            placeholder="Address and contact info..."
            rows={3}
          />
        </div>
      </div>
    );
  }

  if (activeTab === 'behavior') {
    return (
      <div className="space-y-6">
        {/* Map Controls */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Map Controls</h4>
          <div className="space-y-2">
            {[
              { key: 'zoomControl', label: 'Zoom controls' },
              { key: 'fullscreenControl', label: 'Fullscreen button' },
              { key: 'streetViewControl', label: 'Street view' },
              { key: 'mapTypeControl', label: 'Map type selector' },
            ].map((control) => (
              <label key={control.key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[control.key] !== false}
                  onChange={(e) => onChange({ ...settings, [control.key]: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{control.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Interaction */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Interaction</h4>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.draggable !== false}
                onChange={(e) => onChange({ ...settings, draggable: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Allow dragging</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.scrollWheel !== false}
                onChange={(e) => onChange({ ...settings, scrollWheel: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Scroll wheel zoom</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.clickableMarker !== false}
                onChange={(e) => onChange({ ...settings, clickableMarker: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Clickable marker (show info)</span>
            </label>
          </div>
        </div>

        {/* Directions Link */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showDirections || false}
              onChange={(e) => onChange({ ...settings, showDirections: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show "Get Directions" link</span>
          </label>
        </div>

        {/* Lazy Load */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.lazyLoad !== false}
              onChange={(e) => onChange({ ...settings, lazyLoad: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Lazy load map</span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-6">
            Load map only when scrolled into view
          </p>
        </div>
      </div>
    );
  }

  if (activeTab === 'style') {
    return (
      <div className="space-y-6">
        {/* Map Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Map Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'roadmap', label: 'Road Map' },
              { value: 'satellite', label: 'Satellite' },
              { value: 'hybrid', label: 'Hybrid' },
              { value: 'terrain', label: 'Terrain' },
            ].map((type) => (
              <button
                key={type.value}
                onClick={() => onChange({ ...settings, mapType: type.value })}
                className={clsx(
                  'p-3 rounded-lg border-2 transition-colors text-center',
                  settings.mapType === type.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                )}
              >
                <span className="text-xs font-medium">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Map Style (for roadmap) */}
        {settings.mapType !== 'satellite' && settings.mapType !== 'hybrid' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Map Style
            </label>
            <select
              value={settings.mapStyle || 'default'}
              onChange={(e) => onChange({ ...settings, mapStyle: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              <option value="default">Default</option>
              <option value="silver">Silver</option>
              <option value="retro">Retro</option>
              <option value="dark">Dark</option>
              <option value="night">Night</option>
              <option value="aubergine">Aubergine</option>
            </select>
          </div>
        )}

        {/* Height */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Height
          </label>
          <select
            value={settings.height || '400px'}
            onChange={(e) => onChange({ ...settings, height: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="300px">Small (300px)</option>
            <option value="400px">Medium (400px)</option>
            <option value="500px">Large (500px)</option>
            <option value="600px">Extra Large (600px)</option>
            <option value="50vh">Half screen</option>
            <option value="100vh">Full screen</option>
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

        {/* Marker Style */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Marker</h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Marker Style
            </label>
            <select
              value={settings.markerStyle || 'default'}
              onChange={(e) => onChange({ ...settings, markerStyle: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              <option value="default">Default Red</option>
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="custom">Custom Icon</option>
            </select>
          </div>

          {settings.markerStyle === 'custom' && (
            <div className="mt-3">
              <label className="block text-xs text-gray-500 mb-1">Custom Marker URL</label>
              <input
                type="text"
                value={settings.customMarker || ''}
                onChange={(e) => onChange({ ...settings, customMarker: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                placeholder="https://example.com/marker.png"
              />
            </div>
          )}

          <div className="mt-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.animateMarker || false}
                onChange={(e) => onChange({ ...settings, animateMarker: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Animate marker (bounce)</span>
            </label>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default MapConfig;
