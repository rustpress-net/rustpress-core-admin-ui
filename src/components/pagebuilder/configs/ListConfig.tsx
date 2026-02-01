/**
 * ListConfig - List Block Configuration
 */

import React from 'react';
import clsx from 'clsx';
import ArrayEditor from '../config/shared/ArrayEditor';

interface ListConfigProps {
  settings: Record<string, any>;
  onChange: (settings: Record<string, any>) => void;
  blockType: string;
  activeTab?: 'content' | 'behavior' | 'style';
}

const ListConfig: React.FC<ListConfigProps> = ({
  settings,
  onChange,
  activeTab = 'content',
}) => {
  const items = settings.items || ['Item 1', 'Item 2', 'Item 3'];

  if (activeTab === 'content') {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            List Type
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => onChange({ ...settings, listType: 'unordered' })}
              className={clsx(
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors',
                settings.listType !== 'ordered'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              )}
            >
              <span className="text-lg">•</span>
              <span className="text-sm">Bulleted</span>
            </button>
            <button
              onClick={() => onChange({ ...settings, listType: 'ordered' })}
              className={clsx(
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors',
                settings.listType === 'ordered'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              )}
            >
              <span className="text-lg">1.</span>
              <span className="text-sm">Numbered</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            List Items
          </label>
          <ArrayEditor
            items={items}
            onChange={(newItems) => onChange({ ...settings, items: newItems })}
            renderItem={(item, idx, handlers) => (
              <input
                type="text"
                value={item}
                onChange={(e) => handlers.update(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                placeholder={`Item ${idx + 1}`}
              />
            )}
            createItem={() => 'New item'}
            getItemKey={(_, idx) => `item-${idx}`}
            addLabel="Add Item"
            emptyLabel="No items. Add some list items."
            collapsible={false}
          />
        </div>
      </div>
    );
  }

  if (activeTab === 'style') {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Marker Style
          </label>
          <select
            value={settings.markerStyle || 'disc'}
            onChange={(e) => onChange({ ...settings, markerStyle: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            {settings.listType === 'ordered' ? (
              <>
                <option value="decimal">1, 2, 3...</option>
                <option value="lower-alpha">a, b, c...</option>
                <option value="upper-alpha">A, B, C...</option>
                <option value="lower-roman">i, ii, iii...</option>
                <option value="upper-roman">I, II, III...</option>
              </>
            ) : (
              <>
                <option value="disc">Filled circle (•)</option>
                <option value="circle">Empty circle (○)</option>
                <option value="square">Square (■)</option>
                <option value="none">None</option>
              </>
            )}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Item Spacing
          </label>
          <select
            value={settings.spacing || 'normal'}
            onChange={(e) => onChange({ ...settings, spacing: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="tight">Tight</option>
            <option value="normal">Normal</option>
            <option value="relaxed">Relaxed</option>
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
              className="w-10 h-10 rounded border cursor-pointer"
            />
            <input
              type="text"
              value={settings.color || '#374151'}
              onChange={(e) => onChange({ ...settings, color: e.target.value })}
              className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ListConfig;
