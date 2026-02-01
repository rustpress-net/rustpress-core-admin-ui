/**
 * TextConfig - Paragraph/Text Block Configuration
 */

import React from 'react';
import clsx from 'clsx';

interface TextConfigProps {
  settings: Record<string, any>;
  onChange: (settings: Record<string, any>) => void;
  blockType: string;
  activeTab?: 'content' | 'behavior' | 'style';
}

const FONT_SIZES = [
  { value: '14px', label: 'Small' },
  { value: '16px', label: 'Normal' },
  { value: '18px', label: 'Large' },
  { value: '20px', label: 'Extra Large' },
];

const LINE_HEIGHTS = [
  { value: '1.4', label: 'Compact' },
  { value: '1.6', label: 'Normal' },
  { value: '1.8', label: 'Relaxed' },
  { value: '2', label: 'Loose' },
];

const TextConfig: React.FC<TextConfigProps> = ({
  settings,
  onChange,
  activeTab = 'content',
}) => {
  if (activeTab === 'content') {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Text Content
          </label>
          <textarea
            value={settings.text || ''}
            onChange={(e) => onChange({ ...settings, text: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Enter your paragraph text..."
            rows={6}
          />
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.dropCap || false}
              onChange={(e) => onChange({ ...settings, dropCap: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Enable drop cap</span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-6">
            Makes the first letter larger and decorative
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
            Font Size
          </label>
          <div className="grid grid-cols-2 gap-2">
            {FONT_SIZES.map((size) => (
              <button
                key={size.value}
                onClick={() => onChange({ ...settings, fontSize: size.value })}
                className={clsx(
                  'px-3 py-2 text-sm rounded-lg border-2 transition-colors',
                  settings.fontSize === size.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                )}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Line Height
          </label>
          <select
            value={settings.lineHeight || '1.6'}
            onChange={(e) => onChange({ ...settings, lineHeight: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            {LINE_HEIGHTS.map((lh) => (
              <option key={lh.value} value={lh.value}>{lh.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Text Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={settings.color || '#374151'}
              onChange={(e) => onChange({ ...settings, color: e.target.value })}
              className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={settings.color || '#374151'}
              onChange={(e) => onChange({ ...settings, color: e.target.value })}
              className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Text Alignment
          </label>
          <div className="flex gap-2">
            {['left', 'center', 'right', 'justify'].map((align) => (
              <button
                key={align}
                onClick={() => onChange({ ...settings, textAlign: align })}
                className={clsx(
                  'flex-1 px-3 py-2 text-sm rounded-lg border-2 transition-colors capitalize',
                  settings.textAlign === align
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                )}
              >
                {align}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default TextConfig;
