/**
 * CounterConfig - Counter Block Configuration
 *
 * Configure animated counter with start/end values and formatting.
 */

import React from 'react';
import { BarChart } from 'lucide-react';
import clsx from 'clsx';

interface CounterConfigProps {
  settings: Record<string, any>;
  onChange: (settings: Record<string, any>) => void;
  blockType: string;
  activeTab?: 'content' | 'behavior' | 'style';
}

const CounterConfig: React.FC<CounterConfigProps> = ({
  settings,
  onChange,
  activeTab = 'content',
}) => {
  if (activeTab === 'content') {
    return (
      <div className="space-y-6">
        {/* Start Value */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Start Value
          </label>
          <input
            type="number"
            value={settings.startValue || 0}
            onChange={(e) => onChange({ ...settings, startValue: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* End Value */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            End Value
          </label>
          <input
            type="number"
            value={settings.value || 1000}
            onChange={(e) => onChange({ ...settings, value: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Prefix */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Prefix (optional)
          </label>
          <input
            type="text"
            value={settings.prefix || ''}
            onChange={(e) => onChange({ ...settings, prefix: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="$"
          />
        </div>

        {/* Suffix */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Suffix (optional)
          </label>
          <input
            type="text"
            value={settings.suffix || ''}
            onChange={(e) => onChange({ ...settings, suffix: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="+"
          />
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title (optional)
          </label>
          <input
            type="text"
            value={settings.title || ''}
            onChange={(e) => onChange({ ...settings, title: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Happy Customers"
          />
        </div>

        {/* Preview */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {settings.prefix || ''}{settings.value || 1000}{settings.suffix || ''}
          </div>
          {settings.title && (
            <div className="text-sm text-gray-500 mt-1">{settings.title}</div>
          )}
        </div>
      </div>
    );
  }

  if (activeTab === 'behavior') {
    return (
      <div className="space-y-6">
        {/* Animation Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Animation Duration: {settings.duration || 2000}ms
          </label>
          <input
            type="range"
            min="500"
            max="5000"
            step="100"
            value={settings.duration || 2000}
            onChange={(e) => onChange({ ...settings, duration: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0.5s</span>
            <span>2.5s</span>
            <span>5s</span>
          </div>
        </div>

        {/* Easing */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Animation Easing
          </label>
          <select
            value={settings.easing || 'easeOut'}
            onChange={(e) => onChange({ ...settings, easing: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="linear">Linear</option>
            <option value="easeIn">Ease In</option>
            <option value="easeOut">Ease Out (recommended)</option>
            <option value="easeInOut">Ease In Out</option>
          </select>
        </div>

        {/* Trigger */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Animation Trigger
          </label>
          <select
            value={settings.trigger || 'scroll'}
            onChange={(e) => onChange({ ...settings, trigger: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="scroll">On scroll into view</option>
            <option value="load">On page load</option>
            <option value="hover">On hover</option>
          </select>
        </div>

        {/* Number Formatting */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Number Formatting</h4>

          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.useThousandSeparator !== false}
                onChange={(e) => onChange({ ...settings, useThousandSeparator: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Use thousand separator</span>
            </label>

            {settings.useThousandSeparator !== false && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Separator</label>
                <select
                  value={settings.separator || ','}
                  onChange={(e) => onChange({ ...settings, separator: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  <option value=",">Comma (1,000)</option>
                  <option value=".">Period (1.000)</option>
                  <option value=" ">Space (1 000)</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs text-gray-500 mb-1">Decimal Places</label>
              <select
                value={settings.decimals || '0'}
                onChange={(e) => onChange({ ...settings, decimals: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              >
                <option value="0">None</option>
                <option value="1">1 (1000.0)</option>
                <option value="2">2 (1000.00)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Replay */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.replayOnScroll || false}
              onChange={(e) => onChange({ ...settings, replayOnScroll: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Replay animation when scrolling back</span>
          </label>
        </div>
      </div>
    );
  }

  if (activeTab === 'style') {
    return (
      <div className="space-y-6">
        {/* Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Counter Size
          </label>
          <select
            value={settings.size || 'large'}
            onChange={(e) => onChange({ ...settings, size: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="small">Small (24px)</option>
            <option value="medium">Medium (32px)</option>
            <option value="large">Large (48px)</option>
            <option value="xlarge">Extra Large (64px)</option>
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

        {/* Title Position */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title Position
          </label>
          <select
            value={settings.titlePosition || 'below'}
            onChange={(e) => onChange({ ...settings, titlePosition: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="above">Above counter</option>
            <option value="below">Below counter</option>
          </select>
        </div>

        {/* Colors */}
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Colors</h4>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Number Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.numberColor || '#1f2937'}
                onChange={(e) => onChange({ ...settings, numberColor: e.target.value })}
                className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={settings.numberColor || '#1f2937'}
                onChange={(e) => onChange({ ...settings, numberColor: e.target.value })}
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Title Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.titleColor || '#6b7280'}
                onChange={(e) => onChange({ ...settings, titleColor: e.target.value })}
                className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={settings.titleColor || '#6b7280'}
                onChange={(e) => onChange({ ...settings, titleColor: e.target.value })}
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Prefix/Suffix Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.affixColor || '#3b82f6'}
                onChange={(e) => onChange({ ...settings, affixColor: e.target.value })}
                className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={settings.affixColor || '#3b82f6'}
                onChange={(e) => onChange({ ...settings, affixColor: e.target.value })}
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Font Weight */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Number Font Weight
          </label>
          <select
            value={settings.fontWeight || '700'}
            onChange={(e) => onChange({ ...settings, fontWeight: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="400">Normal</option>
            <option value="500">Medium</option>
            <option value="600">Semi Bold</option>
            <option value="700">Bold</option>
            <option value="800">Extra Bold</option>
          </select>
        </div>

        {/* Icon */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showIcon || false}
              onChange={(e) => onChange({ ...settings, showIcon: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show icon</span>
          </label>

          {settings.showIcon && (
            <div className="mt-2">
              <label className="block text-xs text-gray-500 mb-1">Icon Name</label>
              <input
                type="text"
                value={settings.iconName || 'users'}
                onChange={(e) => onChange({ ...settings, iconName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                placeholder="users, star, heart..."
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default CounterConfig;
