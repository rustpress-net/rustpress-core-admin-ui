/**
 * AccordionConfig - Accordion Block Configuration
 *
 * Configure accordion items and behavior.
 */

import React from 'react';
import { ChevronDown, ChevronRight, Plus, Minus } from 'lucide-react';
import clsx from 'clsx';
import ArrayEditor from '../config/shared/ArrayEditor';

interface AccordionItem {
  id: string;
  title: string;
  content: string;
  icon?: string;
}

interface AccordionConfigProps {
  settings: Record<string, any>;
  onChange: (settings: Record<string, any>) => void;
  blockType: string;
  activeTab?: 'content' | 'behavior' | 'style';
}

const ICON_OPTIONS = [
  { value: 'chevron', label: 'Chevron', preview: '>' },
  { value: 'plus', label: 'Plus/Minus', preview: '+' },
  { value: 'arrow', label: 'Arrow', preview: '→' },
  { value: 'none', label: 'None', preview: '' },
];

const AccordionConfig: React.FC<AccordionConfigProps> = ({
  settings,
  onChange,
  activeTab = 'content',
}) => {
  const items: AccordionItem[] = settings.items || [];

  const handleItemsChange = (newItems: AccordionItem[]) => {
    onChange({ ...settings, items: newItems });
  };

  const createItem = (): AccordionItem => ({
    id: `item_${Date.now()}`,
    title: 'Accordion Title',
    content: 'Accordion content goes here...',
  });

  const renderItemEditor = (item: AccordionItem, index: number, handlers: any) => (
    <div className="space-y-3">
      {/* Title */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
        <input
          type="text"
          value={item.title}
          onChange={(e) => handlers.update({ title: e.target.value })}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Accordion title"
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Content</label>
        <textarea
          value={item.content}
          onChange={(e) => handlers.update({ content: e.target.value })}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Accordion content"
          rows={4}
        />
      </div>
    </div>
  );

  if (activeTab === 'content') {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
            Accordion Items ({items.length})
          </h3>
          <ArrayEditor
            items={items}
            onChange={handleItemsChange}
            renderItem={renderItemEditor}
            createItem={createItem}
            getItemKey={(item) => item.id}
            addLabel="Add Item"
            emptyLabel="No items yet. Add items to build your accordion."
            collapsible={true}
            itemLabel={(item) => item.title || 'Untitled'}
            minItems={1}
          />
        </div>
      </div>
    );
  }

  if (activeTab === 'behavior') {
    return (
      <div className="space-y-6">
        {/* Collapse Behavior */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Collapse Behavior
          </label>
          <select
            value={settings.collapseBehavior || 'single'}
            onChange={(e) => onChange({ ...settings, collapseBehavior: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="single">Single open (collapse others)</option>
            <option value="multiple">Multiple open</option>
          </select>
        </div>

        {/* Default Open */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Default Open
          </label>
          <select
            value={settings.defaultOpen ?? 'first'}
            onChange={(e) => onChange({ ...settings, defaultOpen: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="none">None (all collapsed)</option>
            <option value="first">First item</option>
            <option value="all">All items</option>
          </select>
        </div>

        {/* Animation */}
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.animated !== false}
              onChange={(e) => onChange({ ...settings, animated: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Enable animation</span>
          </label>

          {settings.animated !== false && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Animation Speed: {settings.animationSpeed || 300}ms
              </label>
              <input
                type="range"
                min="100"
                max="500"
                step="50"
                value={settings.animationSpeed || 300}
                onChange={(e) => onChange({ ...settings, animationSpeed: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeTab === 'style') {
    return (
      <div className="space-y-6">
        {/* Icon Style */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Toggle Icon
          </label>
          <div className="grid grid-cols-4 gap-2">
            {ICON_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => onChange({ ...settings, iconStyle: option.value })}
                className={clsx(
                  'flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-colors',
                  settings.iconStyle === option.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                )}
              >
                <span className="text-lg font-mono">{option.preview || '—'}</span>
                <span className="text-xs">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Icon Position */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Icon Position
          </label>
          <select
            value={settings.iconPosition || 'right'}
            onChange={(e) => onChange({ ...settings, iconPosition: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="right">Right</option>
            <option value="left">Left</option>
          </select>
        </div>

        {/* Border Style */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Border Style
          </label>
          <select
            value={settings.borderStyle || 'separated'}
            onChange={(e) => onChange({ ...settings, borderStyle: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="separated">Separated (with gap)</option>
            <option value="connected">Connected (no gap)</option>
            <option value="minimal">Minimal (dividers only)</option>
            <option value="boxed">Boxed (bordered)</option>
          </select>
        </div>

        {/* Gap */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Gap Between Items: {settings.gap || 8}px
          </label>
          <input
            type="range"
            min="0"
            max="24"
            value={parseInt(settings.gap) || 8}
            onChange={(e) => onChange({ ...settings, gap: `${e.target.value}px` })}
            className="w-full"
          />
        </div>

        {/* Border Radius */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Border Radius: {settings.borderRadius || 8}px
          </label>
          <input
            type="range"
            min="0"
            max="16"
            value={parseInt(settings.borderRadius) || 8}
            onChange={(e) => onChange({ ...settings, borderRadius: `${e.target.value}px` })}
            className="w-full"
          />
        </div>

        {/* Colors */}
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Colors</h4>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Header Background</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.headerBgColor || '#f9fafb'}
                onChange={(e) => onChange({ ...settings, headerBgColor: e.target.value })}
                className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={settings.headerBgColor || '#f9fafb'}
                onChange={(e) => onChange({ ...settings, headerBgColor: e.target.value })}
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Active Header Background</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.activeHeaderBgColor || '#eff6ff'}
                onChange={(e) => onChange({ ...settings, activeHeaderBgColor: e.target.value })}
                className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={settings.activeHeaderBgColor || '#eff6ff'}
                onChange={(e) => onChange({ ...settings, activeHeaderBgColor: e.target.value })}
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AccordionConfig;
