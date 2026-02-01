/**
 * SpacerConfig - Spacer Block Configuration
 */

import React from 'react';
import clsx from 'clsx';

interface SpacerConfigProps {
  settings: Record<string, any>;
  onChange: (settings: Record<string, any>) => void;
  blockType: string;
  activeTab?: 'content' | 'behavior' | 'style';
}

const PRESET_HEIGHTS = [
  { value: '20px', label: 'XS', description: '20px' },
  { value: '40px', label: 'S', description: '40px' },
  { value: '60px', label: 'M', description: '60px' },
  { value: '80px', label: 'L', description: '80px' },
  { value: '120px', label: 'XL', description: '120px' },
  { value: '160px', label: '2XL', description: '160px' },
];

const SpacerConfig: React.FC<SpacerConfigProps> = ({
  settings,
  onChange,
  activeTab = 'content',
}) => {
  const currentHeight = parseInt(settings.height) || 40;

  if (activeTab === 'content' || activeTab === 'style') {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Preset Heights
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PRESET_HEIGHTS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => onChange({ ...settings, height: preset.value })}
                className={clsx(
                  'flex flex-col items-center px-3 py-3 rounded-lg border-2 transition-colors',
                  settings.height === preset.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                )}
              >
                <span className="text-sm font-bold">{preset.label}</span>
                <span className="text-xs text-gray-500">{preset.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Custom Height: {currentHeight}px
          </label>
          <input
            type="range"
            min="8"
            max="300"
            value={currentHeight}
            onChange={(e) => onChange({ ...settings, height: `${e.target.value}px` })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>8px</span>
            <span>300px</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Or enter exact value
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={currentHeight}
              onChange={(e) => onChange({ ...settings, height: `${e.target.value}px` })}
              className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              min="1"
            />
            <span className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
              px
            </span>
          </div>
        </div>

        {/* Visual Preview */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Preview
          </label>
          <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs text-gray-500 text-center">
              Content above
            </div>
            <div
              className="bg-blue-100 dark:bg-blue-900/30 border-y border-blue-300 dark:border-blue-700 flex items-center justify-center"
              style={{ height: `${Math.min(currentHeight, 100)}px` }}
            >
              <span className="text-xs text-blue-500">{currentHeight}px</span>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs text-gray-500 text-center">
              Content below
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Responsive Heights
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500">Tablet ({settings.tabletHeight || 'same'})</label>
              <input
                type="range"
                min="8"
                max="200"
                value={parseInt(settings.tabletHeight) || currentHeight}
                onChange={(e) => onChange({ ...settings, tabletHeight: `${e.target.value}px` })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Mobile ({settings.mobileHeight || 'same'})</label>
              <input
                type="range"
                min="8"
                max="150"
                value={parseInt(settings.mobileHeight) || Math.min(currentHeight, 60)}
                onChange={(e) => onChange({ ...settings, mobileHeight: `${e.target.value}px` })}
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

export default SpacerConfig;
