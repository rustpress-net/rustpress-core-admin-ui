/**
 * TabsConfig - Tabs Block Configuration
 *
 * Configure tabbed content sections and styling.
 */

import React from 'react';
import { Folder, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import clsx from 'clsx';
import ArrayEditor from '../config/shared/ArrayEditor';

interface TabItem {
  id: string;
  title: string;
  content: string;
  icon?: string;
}

interface TabsConfigProps {
  settings: Record<string, any>;
  onChange: (settings: Record<string, any>) => void;
  blockType: string;
  activeTab?: 'content' | 'behavior' | 'style';
}

const TAB_STYLES = [
  { value: 'underline', label: 'Underline' },
  { value: 'boxed', label: 'Boxed' },
  { value: 'pills', label: 'Pills' },
  { value: 'minimal', label: 'Minimal' },
];

const TabsConfig: React.FC<TabsConfigProps> = ({
  settings,
  onChange,
  activeTab = 'content',
}) => {
  const tabs: TabItem[] = settings.tabs || [];

  const handleTabsChange = (newTabs: TabItem[]) => {
    onChange({ ...settings, tabs: newTabs });
  };

  const createTab = (): TabItem => ({
    id: `tab_${Date.now()}`,
    title: 'New Tab',
    content: 'Tab content goes here...',
  });

  const renderTabEditor = (tab: TabItem, index: number, handlers: any) => (
    <div className="space-y-3">
      {/* Title */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Tab Title</label>
        <input
          type="text"
          value={tab.title}
          onChange={(e) => handlers.update({ title: e.target.value })}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Tab title"
        />
      </div>

      {/* Icon (optional) */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Icon (optional)</label>
        <input
          type="text"
          value={tab.icon || ''}
          onChange={(e) => handlers.update({ icon: e.target.value })}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Icon name (e.g., star, heart)"
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Tab Content</label>
        <textarea
          value={tab.content}
          onChange={(e) => handlers.update({ content: e.target.value })}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Tab content"
          rows={5}
        />
      </div>
    </div>
  );

  if (activeTab === 'content') {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
            Tabs ({tabs.length})
          </h3>
          <ArrayEditor
            items={tabs}
            onChange={handleTabsChange}
            renderItem={renderTabEditor}
            createItem={createTab}
            getItemKey={(tab) => tab.id}
            addLabel="Add Tab"
            emptyLabel="No tabs yet. Add tabs to create tabbed content."
            collapsible={true}
            itemLabel={(tab) => tab.title || 'Untitled'}
            minItems={1}
          />
        </div>
      </div>
    );
  }

  if (activeTab === 'behavior') {
    return (
      <div className="space-y-6">
        {/* Default Tab */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Default Active Tab
          </label>
          <select
            value={settings.defaultTab || '0'}
            onChange={(e) => onChange({ ...settings, defaultTab: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            {tabs.map((tab, idx) => (
              <option key={tab.id} value={idx.toString()}>
                {tab.title || `Tab ${idx + 1}`}
              </option>
            ))}
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
                Animation Type
              </label>
              <select
                value={settings.animationType || 'fade'}
                onChange={(e) => onChange({ ...settings, animationType: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              >
                <option value="fade">Fade</option>
                <option value="slide">Slide</option>
                <option value="none">None</option>
              </select>
            </div>
          )}
        </div>

        {/* Keyboard Navigation */}
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.keyboardNav !== false}
              onChange={(e) => onChange({ ...settings, keyboardNav: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Enable keyboard navigation</span>
          </label>
          <p className="text-xs text-gray-500">
            Allow users to navigate tabs using arrow keys
          </p>
        </div>
      </div>
    );
  }

  if (activeTab === 'style') {
    return (
      <div className="space-y-6">
        {/* Orientation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Orientation
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onChange({ ...settings, orientation: 'horizontal' })}
              className={clsx(
                'p-3 rounded-lg border-2 transition-colors text-center',
                settings.orientation !== 'vertical'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              )}
            >
              <div className="text-xs font-medium">Horizontal</div>
              <div className="text-[10px] text-gray-500">Tabs on top</div>
            </button>
            <button
              onClick={() => onChange({ ...settings, orientation: 'vertical' })}
              className={clsx(
                'p-3 rounded-lg border-2 transition-colors text-center',
                settings.orientation === 'vertical'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              )}
            >
              <div className="text-xs font-medium">Vertical</div>
              <div className="text-[10px] text-gray-500">Tabs on side</div>
            </button>
          </div>
        </div>

        {/* Tab Style */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tab Style
          </label>
          <div className="grid grid-cols-2 gap-2">
            {TAB_STYLES.map((style) => (
              <button
                key={style.value}
                onClick={() => onChange({ ...settings, tabStyle: style.value })}
                className={clsx(
                  'p-3 rounded-lg border-2 transition-colors',
                  settings.tabStyle === style.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                )}
              >
                <span className="text-xs font-medium">{style.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Alignment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tab Alignment
          </label>
          <div className="flex gap-2">
            {[
              { value: 'start', icon: AlignLeft, label: 'Left' },
              { value: 'center', icon: AlignCenter, label: 'Center' },
              { value: 'end', icon: AlignRight, label: 'Right' },
            ].map((align) => (
              <button
                key={align.value}
                onClick={() => onChange({ ...settings, tabAlignment: align.value })}
                className={clsx(
                  'flex-1 flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-colors',
                  settings.tabAlignment === align.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                )}
              >
                <align.icon className="w-4 h-4" />
                <span className="text-xs">{align.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Full Width */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.fullWidth || false}
              onChange={(e) => onChange({ ...settings, fullWidth: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Full width tabs</span>
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Tabs will stretch to fill available width
          </p>
        </div>

        {/* Colors */}
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Colors</h4>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Active Tab Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.activeTabColor || '#3b82f6'}
                onChange={(e) => onChange({ ...settings, activeTabColor: e.target.value })}
                className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={settings.activeTabColor || '#3b82f6'}
                onChange={(e) => onChange({ ...settings, activeTabColor: e.target.value })}
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Content Background</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.contentBgColor || '#ffffff'}
                onChange={(e) => onChange({ ...settings, contentBgColor: e.target.value })}
                className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={settings.contentBgColor || '#ffffff'}
                onChange={(e) => onChange({ ...settings, contentBgColor: e.target.value })}
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Border Radius */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
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
      </div>
    );
  }

  return null;
};

export default TabsConfig;
