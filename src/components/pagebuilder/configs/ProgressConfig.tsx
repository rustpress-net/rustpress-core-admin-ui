/**
 * ProgressConfig - Progress Bar Block Configuration
 *
 * Configure progress bar value, animation, and colors.
 */

import React from 'react';
import { Target } from 'lucide-react';
import clsx from 'clsx';

interface ProgressConfigProps {
  settings: Record<string, any>;
  onChange: (settings: Record<string, any>) => void;
  blockType: string;
  activeTab?: 'content' | 'behavior' | 'style';
}

const ProgressConfig: React.FC<ProgressConfigProps> = ({
  settings,
  onChange,
  activeTab = 'content',
}) => {
  if (activeTab === 'content') {
    return (
      <div className="space-y-6">
        {/* Value */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Progress Value: {settings.value || 0}%
          </label>
          <input
            type="range"
            min="0"
            max={settings.max || 100}
            value={settings.value || 0}
            onChange={(e) => onChange({ ...settings, value: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex gap-2 mt-2">
            <input
              type="number"
              value={settings.value || 0}
              onChange={(e) => onChange({ ...settings, value: parseInt(e.target.value) || 0 })}
              className="w-20 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              min="0"
              max={settings.max || 100}
            />
            <span className="text-sm text-gray-500 self-center">
              / {settings.max || 100}
            </span>
          </div>
        </div>

        {/* Max Value */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Maximum Value
          </label>
          <input
            type="number"
            value={settings.max || 100}
            onChange={(e) => onChange({ ...settings, max: parseInt(e.target.value) || 100 })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            min="1"
          />
        </div>

        {/* Label */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Label (optional)
          </label>
          <input
            type="text"
            value={settings.label || ''}
            onChange={(e) => onChange({ ...settings, label: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            placeholder="Skills Progress"
          />
        </div>

        {/* Suffix */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Value Suffix
          </label>
          <input
            type="text"
            value={settings.suffix || '%'}
            onChange={(e) => onChange({ ...settings, suffix: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            placeholder="%"
          />
        </div>
      </div>
    );
  }

  if (activeTab === 'behavior') {
    return (
      <div className="space-y-6">
        {/* Animation */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.animated !== false}
              onChange={(e) => onChange({ ...settings, animated: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Animate on scroll</span>
          </label>

          {settings.animated !== false && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Animation Duration: {settings.animationDuration || 1000}ms
              </label>
              <input
                type="range"
                min="500"
                max="3000"
                step="100"
                value={settings.animationDuration || 1000}
                onChange={(e) => onChange({ ...settings, animationDuration: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Show Value */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showValue !== false}
              onChange={(e) => onChange({ ...settings, showValue: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show value</span>
          </label>
        </div>

        {/* Show Label */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showLabel !== false}
              onChange={(e) => onChange({ ...settings, showLabel: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show label</span>
          </label>
        </div>

        {/* Striped */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.striped || false}
              onChange={(e) => onChange({ ...settings, striped: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Striped effect</span>
          </label>
        </div>

        {/* Animated Stripes */}
        {settings.striped && (
          <div className="ml-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.animatedStripes || false}
                onChange={(e) => onChange({ ...settings, animatedStripes: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Animate stripes</span>
            </label>
          </div>
        )}
      </div>
    );
  }

  if (activeTab === 'style') {
    return (
      <div className="space-y-6">
        {/* Style */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Progress Style
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'bar', label: 'Bar' },
              { value: 'thin', label: 'Thin Line' },
              { value: 'circle', label: 'Circle' },
              { value: 'semicircle', label: 'Semi-circle' },
            ].map((style) => (
              <button
                key={style.value}
                onClick={() => onChange({ ...settings, progressStyle: style.value })}
                className={clsx(
                  'p-3 rounded-lg border-2 transition-colors text-center',
                  settings.progressStyle === style.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                )}
              >
                <span className="text-xs font-medium">{style.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Height (for bar style) */}
        {settings.progressStyle !== 'circle' && settings.progressStyle !== 'semicircle' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Height: {settings.height || 20}px
            </label>
            <input
              type="range"
              min="4"
              max="40"
              value={parseInt(settings.height) || 20}
              onChange={(e) => onChange({ ...settings, height: `${e.target.value}px` })}
              className="w-full"
            />
          </div>
        )}

        {/* Size (for circle style) */}
        {(settings.progressStyle === 'circle' || settings.progressStyle === 'semicircle') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Size: {settings.circleSize || 120}px
            </label>
            <input
              type="range"
              min="60"
              max="200"
              value={settings.circleSize || 120}
              onChange={(e) => onChange({ ...settings, circleSize: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        )}

        {/* Colors */}
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Colors</h4>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Progress Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.progressColor || '#3b82f6'}
                onChange={(e) => onChange({ ...settings, progressColor: e.target.value })}
                className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={settings.progressColor || '#3b82f6'}
                onChange={(e) => onChange({ ...settings, progressColor: e.target.value })}
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Track Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.trackColor || '#e5e7eb'}
                onChange={(e) => onChange({ ...settings, trackColor: e.target.value })}
                className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={settings.trackColor || '#e5e7eb'}
                onChange={(e) => onChange({ ...settings, trackColor: e.target.value })}
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
          </div>

          {/* Gradient */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.useGradient || false}
                onChange={(e) => onChange({ ...settings, useGradient: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Use gradient</span>
            </label>

            {settings.useGradient && (
              <div className="mt-2">
                <label className="block text-xs text-gray-500 mb-1">Gradient End Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.gradientEndColor || '#8b5cf6'}
                    onChange={(e) => onChange({ ...settings, gradientEndColor: e.target.value })}
                    className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.gradientEndColor || '#8b5cf6'}
                    onChange={(e) => onChange({ ...settings, gradientEndColor: e.target.value })}
                    className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Border Radius */}
        {settings.progressStyle !== 'circle' && settings.progressStyle !== 'semicircle' && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Border Radius: {settings.borderRadius || 'full'}
            </label>
            <select
              value={settings.borderRadius || 'full'}
              onChange={(e) => onChange({ ...settings, borderRadius: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              <option value="none">Square (0px)</option>
              <option value="sm">Small (4px)</option>
              <option value="md">Medium (8px)</option>
              <option value="full">Full (pill)</option>
            </select>
          </div>
        )}

        {/* Value Position */}
        {settings.showValue !== false && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Value Position
            </label>
            <select
              value={settings.valuePosition || 'end'}
              onChange={(e) => onChange({ ...settings, valuePosition: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              <option value="start">Start</option>
              <option value="end">End</option>
              <option value="inside">Inside bar</option>
              <option value="top">Above bar</option>
            </select>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default ProgressConfig;
