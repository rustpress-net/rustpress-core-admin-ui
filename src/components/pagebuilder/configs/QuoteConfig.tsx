/**
 * QuoteConfig - Quote/Blockquote Block Configuration
 */

import React from 'react';
import clsx from 'clsx';

interface QuoteConfigProps {
  settings: Record<string, any>;
  onChange: (settings: Record<string, any>) => void;
  blockType: string;
  activeTab?: 'content' | 'behavior' | 'style';
}

const QUOTE_STYLES = [
  { value: 'default', label: 'Default', icon: '❝' },
  { value: 'large', label: 'Large Quote', icon: '❞' },
  { value: 'bordered', label: 'Left Border', icon: '│' },
  { value: 'modern', label: 'Modern', icon: '◢' },
];

const QuoteConfig: React.FC<QuoteConfigProps> = ({
  settings,
  onChange,
  activeTab = 'content',
}) => {
  if (activeTab === 'content') {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Quote Text
          </label>
          <textarea
            value={settings.text || ''}
            onChange={(e) => onChange({ ...settings, text: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Enter the quote..."
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Citation / Author
          </label>
          <input
            type="text"
            value={settings.citation || ''}
            onChange={(e) => onChange({ ...settings, citation: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            placeholder="— Author Name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Source URL (optional)
          </label>
          <input
            type="url"
            value={settings.sourceUrl || ''}
            onChange={(e) => onChange({ ...settings, sourceUrl: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            placeholder="https://..."
          />
        </div>
      </div>
    );
  }

  if (activeTab === 'style') {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quote Style
          </label>
          <div className="grid grid-cols-2 gap-2">
            {QUOTE_STYLES.map((style) => (
              <button
                key={style.value}
                onClick={() => onChange({ ...settings, quoteStyle: style.value })}
                className={clsx(
                  'flex items-center gap-2 px-3 py-3 rounded-lg border-2 transition-colors',
                  settings.quoteStyle === style.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                )}
              >
                <span className="text-lg">{style.icon}</span>
                <span className="text-sm">{style.label}</span>
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

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Font Size
          </label>
          <select
            value={settings.fontSize || '18px'}
            onChange={(e) => onChange({ ...settings, fontSize: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="16px">Small</option>
            <option value="18px">Medium</option>
            <option value="20px">Large</option>
            <option value="24px">Extra Large</option>
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.italic !== false}
              onChange={(e) => onChange({ ...settings, italic: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Italic text</span>
          </label>
        </div>
      </div>
    );
  }

  return null;
};

export default QuoteConfig;
