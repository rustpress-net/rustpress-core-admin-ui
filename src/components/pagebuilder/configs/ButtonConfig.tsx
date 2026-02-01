/**
 * ButtonConfig - Button Block Configuration
 */

import React from 'react';
import { ExternalLink } from 'lucide-react';
import clsx from 'clsx';

interface ButtonConfigProps {
  settings: Record<string, any>;
  onChange: (settings: Record<string, any>) => void;
  blockType: string;
  activeTab?: 'content' | 'behavior' | 'style';
}

const BUTTON_VARIANTS = [
  { value: 'solid', label: 'Solid' },
  { value: 'outline', label: 'Outline' },
  { value: 'ghost', label: 'Ghost' },
  { value: 'link', label: 'Link' },
];

const BUTTON_SIZES = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Extra Large' },
];

const ButtonConfig: React.FC<ButtonConfigProps> = ({
  settings,
  onChange,
  activeTab = 'content',
}) => {
  if (activeTab === 'content') {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Button Text
          </label>
          <input
            type="text"
            value={settings.text || ''}
            onChange={(e) => onChange({ ...settings, text: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            placeholder="Click me"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Link URL
          </label>
          <input
            type="url"
            value={settings.url || ''}
            onChange={(e) => onChange({ ...settings, url: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Open In
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => onChange({ ...settings, target: '_self' })}
              className={clsx(
                'flex-1 px-3 py-2 text-sm rounded-lg border-2 transition-colors',
                settings.target !== '_blank'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              )}
            >
              Same Tab
            </button>
            <button
              onClick={() => onChange({ ...settings, target: '_blank' })}
              className={clsx(
                'flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg border-2 transition-colors',
                settings.target === '_blank'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              )}
            >
              <ExternalLink className="w-4 h-4" />
              New Tab
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Icon (optional)
          </label>
          <select
            value={settings.icon || ''}
            onChange={(e) => onChange({ ...settings, icon: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="">No icon</option>
            <option value="arrow-right">Arrow Right</option>
            <option value="download">Download</option>
            <option value="external-link">External Link</option>
            <option value="chevron-right">Chevron Right</option>
            <option value="plus">Plus</option>
          </select>
          {settings.icon && (
            <div className="mt-2">
              <label className="text-xs text-gray-500">Icon Position</label>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => onChange({ ...settings, iconPosition: 'left' })}
                  className={clsx(
                    'flex-1 px-2 py-1 text-xs rounded border',
                    settings.iconPosition !== 'right' ? 'bg-blue-50 border-blue-500' : 'border-gray-300'
                  )}
                >
                  Left
                </button>
                <button
                  onClick={() => onChange({ ...settings, iconPosition: 'right' })}
                  className={clsx(
                    'flex-1 px-2 py-1 text-xs rounded border',
                    settings.iconPosition === 'right' ? 'bg-blue-50 border-blue-500' : 'border-gray-300'
                  )}
                >
                  Right
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeTab === 'style') {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Variant
          </label>
          <div className="grid grid-cols-2 gap-2">
            {BUTTON_VARIANTS.map((v) => (
              <button
                key={v.value}
                onClick={() => onChange({ ...settings, variant: v.value })}
                className={clsx(
                  'px-3 py-2 text-sm rounded-lg border-2 transition-colors',
                  settings.variant === v.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                )}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Size
          </label>
          <div className="grid grid-cols-4 gap-2">
            {BUTTON_SIZES.map((s) => (
              <button
                key={s.value}
                onClick={() => onChange({ ...settings, size: s.value })}
                className={clsx(
                  'px-2 py-2 text-xs rounded-lg border-2 transition-colors',
                  settings.size === s.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Background Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={settings.backgroundColor || '#3b82f6'}
              onChange={(e) => onChange({ ...settings, backgroundColor: e.target.value })}
              className="w-10 h-10 rounded border cursor-pointer"
            />
            <input
              type="text"
              value={settings.backgroundColor || '#3b82f6'}
              onChange={(e) => onChange({ ...settings, backgroundColor: e.target.value })}
              className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Text Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={settings.color || '#ffffff'}
              onChange={(e) => onChange({ ...settings, color: e.target.value })}
              className="w-10 h-10 rounded border cursor-pointer"
            />
            <input
              type="text"
              value={settings.color || '#ffffff'}
              onChange={(e) => onChange({ ...settings, color: e.target.value })}
              className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Border Radius: {settings.borderRadius || 8}px
          </label>
          <input
            type="range"
            min="0"
            max="32"
            value={parseInt(settings.borderRadius) || 8}
            onChange={(e) => onChange({ ...settings, borderRadius: `${e.target.value}px` })}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Width
          </label>
          <div className="flex gap-2">
            {['auto', 'full'].map((w) => (
              <button
                key={w}
                onClick={() => onChange({ ...settings, fullWidth: w === 'full' })}
                className={clsx(
                  'flex-1 px-3 py-2 text-sm rounded-lg border-2 transition-colors capitalize',
                  (w === 'full' ? settings.fullWidth : !settings.fullWidth)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                )}
              >
                {w === 'auto' ? 'Auto Width' : 'Full Width'}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ButtonConfig;
