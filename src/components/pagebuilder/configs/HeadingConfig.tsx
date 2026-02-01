/**
 * HeadingConfig - Heading Block Configuration
 */

import React from 'react';
import clsx from 'clsx';

interface HeadingConfigProps {
  settings: Record<string, any>;
  onChange: (settings: Record<string, any>) => void;
  blockType: string;
  activeTab?: 'content' | 'behavior' | 'style';
}

const HeadingConfig: React.FC<HeadingConfigProps> = ({
  settings,
  onChange,
  activeTab = 'content',
}) => {
  if (activeTab === 'content') {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Heading Text
          </label>
          <input
            type="text"
            value={settings.text || ''}
            onChange={(e) => onChange({ ...settings, text: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Enter heading text..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Heading Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((level) => (
              <button
                key={level}
                onClick={() => onChange({ ...settings, level })}
                className={clsx(
                  'px-4 py-3 rounded-lg border-2 transition-colors font-medium',
                  settings.level === level
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                )}
                style={{ fontSize: `${24 - level * 2}px` }}
              >
                H{level}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Anchor ID (optional)
          </label>
          <input
            type="text"
            value={settings.anchorId || ''}
            onChange={(e) => onChange({ ...settings, anchorId: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            placeholder="section-name"
          />
          <p className="text-xs text-gray-500 mt-1">
            Used for linking directly to this heading
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
            Text Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={settings.color || '#111827'}
              onChange={(e) => onChange({ ...settings, color: e.target.value })}
              className="w-10 h-10 rounded border cursor-pointer"
            />
            <input
              type="text"
              value={settings.color || '#111827'}
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
            {['left', 'center', 'right'].map((align) => (
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

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Font Weight
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

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.uppercase || false}
              onChange={(e) => onChange({ ...settings, uppercase: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Uppercase</span>
          </label>
        </div>
      </div>
    );
  }

  return null;
};

export default HeadingConfig;
