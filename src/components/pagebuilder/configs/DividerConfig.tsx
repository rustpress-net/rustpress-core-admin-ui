/**
 * DividerConfig - Divider/Separator Block Configuration
 */

import React from 'react';
import clsx from 'clsx';

interface DividerConfigProps {
  settings: Record<string, any>;
  onChange: (settings: Record<string, any>) => void;
  blockType: string;
  activeTab?: 'content' | 'behavior' | 'style';
}

const DIVIDER_STYLES = [
  { value: 'solid', label: 'Solid', preview: '─────────' },
  { value: 'dashed', label: 'Dashed', preview: '- - - - -' },
  { value: 'dotted', label: 'Dotted', preview: '• • • • •' },
  { value: 'double', label: 'Double', preview: '═════════' },
];

const DividerConfig: React.FC<DividerConfigProps> = ({
  settings,
  onChange,
  activeTab = 'content',
}) => {
  if (activeTab === 'content' || activeTab === 'style') {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Style
          </label>
          <div className="space-y-2">
            {DIVIDER_STYLES.map((style) => (
              <button
                key={style.value}
                onClick={() => onChange({ ...settings, borderStyle: style.value })}
                className={clsx(
                  'w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-colors',
                  settings.borderStyle === style.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                )}
              >
                <span className="text-sm font-medium">{style.label}</span>
                <span className="text-gray-400 font-mono text-xs">{style.preview}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Width
          </label>
          <select
            value={settings.width || '100%'}
            onChange={(e) => onChange({ ...settings, width: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="25%">25%</option>
            <option value="50%">50%</option>
            <option value="75%">75%</option>
            <option value="100%">100%</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Alignment
          </label>
          <div className="flex gap-2">
            {['left', 'center', 'right'].map((align) => (
              <button
                key={align}
                onClick={() => onChange({ ...settings, alignment: align })}
                className={clsx(
                  'flex-1 px-3 py-2 text-sm rounded-lg border-2 transition-colors capitalize',
                  (settings.alignment || 'center') === align
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
            Line Thickness: {settings.borderWidth || 1}px
          </label>
          <input
            type="range"
            min="1"
            max="8"
            value={parseInt(settings.borderWidth) || 1}
            onChange={(e) => onChange({ ...settings, borderWidth: `${e.target.value}px` })}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={settings.borderColor || '#e5e7eb'}
              onChange={(e) => onChange({ ...settings, borderColor: e.target.value })}
              className="w-10 h-10 rounded border cursor-pointer"
            />
            <input
              type="text"
              value={settings.borderColor || '#e5e7eb'}
              onChange={(e) => onChange({ ...settings, borderColor: e.target.value })}
              className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Spacing (Top/Bottom)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">Top: {settings.marginTop || 20}px</label>
              <input
                type="range"
                min="0"
                max="80"
                value={parseInt(settings.marginTop) || 20}
                onChange={(e) => onChange({ ...settings, marginTop: `${e.target.value}px` })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Bottom: {settings.marginBottom || 20}px</label>
              <input
                type="range"
                min="0"
                max="80"
                value={parseInt(settings.marginBottom) || 20}
                onChange={(e) => onChange({ ...settings, marginBottom: `${e.target.value}px` })}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default DividerConfig;
