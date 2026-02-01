/**
 * MenuConfig - Menu Block Configuration
 *
 * Configure navigation items with support for nesting.
 */

import React from 'react';
import { Menu, Link, ChevronDown, ExternalLink } from 'lucide-react';
import clsx from 'clsx';
import ArrayEditor from '../config/shared/ArrayEditor';

interface MenuItem {
  id: string;
  label: string;
  url: string;
  target?: string;
  children?: MenuItem[];
}

interface MenuConfigProps {
  settings: Record<string, any>;
  onChange: (settings: Record<string, any>) => void;
  blockType: string;
  activeTab?: 'content' | 'behavior' | 'style';
}

const MenuConfig: React.FC<MenuConfigProps> = ({
  settings,
  onChange,
  activeTab = 'content',
}) => {
  const items: MenuItem[] = settings.items || [];

  const handleItemsChange = (newItems: MenuItem[]) => {
    onChange({ ...settings, items: newItems });
  };

  const createItem = (): MenuItem => ({
    id: `item_${Date.now()}`,
    label: 'New Link',
    url: '/',
    target: '_self',
  });

  const renderItemEditor = (item: MenuItem, index: number, handlers: any) => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {/* Label */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Label</label>
          <input
            type="text"
            value={item.label}
            onChange={(e) => handlers.update({ label: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Home"
          />
        </div>

        {/* URL */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">URL</label>
          <input
            type="text"
            value={item.url}
            onChange={(e) => handlers.update({ url: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="/page"
          />
        </div>
      </div>

      {/* Target */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Open in</label>
        <select
          value={item.target || '_self'}
          onChange={(e) => handlers.update({ target: e.target.value })}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
        >
          <option value="_self">Same window</option>
          <option value="_blank">New window</option>
        </select>
      </div>

      {/* Submenu Items */}
      {settings.allowNesting !== false && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <label className="block text-xs font-medium text-gray-500 mb-2">Submenu Items</label>
          <ArrayEditor
            items={item.children || []}
            onChange={(children) => handlers.update({ children })}
            renderItem={(child, childIdx, childHandlers) => (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={child.label}
                  onChange={(e) => childHandlers.update({ label: e.target.value })}
                  className="flex-1 px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded"
                  placeholder="Label"
                />
                <input
                  type="text"
                  value={child.url}
                  onChange={(e) => childHandlers.update({ url: e.target.value })}
                  className="flex-1 px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded"
                  placeholder="URL"
                />
              </div>
            )}
            createItem={() => ({ id: `sub_${Date.now()}`, label: '', url: '', target: '_self' })}
            getItemKey={(child) => child.id}
            addLabel="Add Submenu Item"
            emptyLabel="No submenu items"
            collapsible={false}
          />
        </div>
      )}
    </div>
  );

  if (activeTab === 'content') {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
            Menu Items ({items.length})
          </h3>
          <ArrayEditor
            items={items}
            onChange={handleItemsChange}
            renderItem={renderItemEditor}
            createItem={createItem}
            getItemKey={(item) => item.id}
            addLabel="Add Menu Item"
            emptyLabel="No menu items yet. Add items to build your navigation."
            collapsible={true}
            itemLabel={(item) => item.label || 'Untitled'}
          />
        </div>
      </div>
    );
  }

  if (activeTab === 'behavior') {
    return (
      <div className="space-y-6">
        {/* Allow Nesting */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.allowNesting !== false}
              onChange={(e) => onChange({ ...settings, allowNesting: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Allow nested submenus</span>
          </label>
        </div>

        {/* Dropdown Trigger */}
        {settings.allowNesting !== false && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Dropdown Trigger
            </label>
            <select
              value={settings.dropdownTrigger || 'hover'}
              onChange={(e) => onChange({ ...settings, dropdownTrigger: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              <option value="hover">On hover</option>
              <option value="click">On click</option>
            </select>
          </div>
        )}

        {/* Mobile Behavior */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Mobile Settings</h4>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mobile Breakpoint
              </label>
              <select
                value={settings.mobileBreakpoint || '768'}
                onChange={(e) => onChange({ ...settings, mobileBreakpoint: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              >
                <option value="640">640px (small)</option>
                <option value="768">768px (tablet)</option>
                <option value="1024">1024px (laptop)</option>
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showHamburger !== false}
                onChange={(e) => onChange({ ...settings, showHamburger: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Show hamburger menu on mobile</span>
            </label>
          </div>
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
              <span className="text-xs font-medium">Horizontal</span>
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
              <span className="text-xs font-medium">Vertical</span>
            </button>
          </div>
        </div>

        {/* Alignment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Alignment
          </label>
          <select
            value={settings.alignment || 'start'}
            onChange={(e) => onChange({ ...settings, alignment: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="start">Left</option>
            <option value="center">Center</option>
            <option value="end">Right</option>
            <option value="space-between">Space Between</option>
          </select>
        </div>

        {/* Item Spacing */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Item Spacing: {settings.itemSpacing || 24}px
          </label>
          <input
            type="range"
            min="8"
            max="48"
            value={parseInt(settings.itemSpacing) || 24}
            onChange={(e) => onChange({ ...settings, itemSpacing: `${e.target.value}px` })}
            className="w-full"
          />
        </div>

        {/* Colors */}
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Colors</h4>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Text Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.textColor || '#374151'}
                onChange={(e) => onChange({ ...settings, textColor: e.target.value })}
                className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={settings.textColor || '#374151'}
                onChange={(e) => onChange({ ...settings, textColor: e.target.value })}
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Hover Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.hoverColor || '#3b82f6'}
                onChange={(e) => onChange({ ...settings, hoverColor: e.target.value })}
                className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={settings.hoverColor || '#3b82f6'}
                onChange={(e) => onChange({ ...settings, hoverColor: e.target.value })}
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Active Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.activeColor || '#3b82f6'}
                onChange={(e) => onChange({ ...settings, activeColor: e.target.value })}
                className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={settings.activeColor || '#3b82f6'}
                onChange={(e) => onChange({ ...settings, activeColor: e.target.value })}
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Font Settings */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Font Size
              </label>
              <select
                value={settings.fontSize || '14px'}
                onChange={(e) => onChange({ ...settings, fontSize: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              >
                <option value="12px">Small (12px)</option>
                <option value="14px">Medium (14px)</option>
                <option value="16px">Large (16px)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Font Weight
              </label>
              <select
                value={settings.fontWeight || '500'}
                onChange={(e) => onChange({ ...settings, fontWeight: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              >
                <option value="400">Normal</option>
                <option value="500">Medium</option>
                <option value="600">Semi Bold</option>
                <option value="700">Bold</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dropdown Indicator */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showDropdownIcon !== false}
              onChange={(e) => onChange({ ...settings, showDropdownIcon: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show dropdown indicator</span>
          </label>
        </div>
      </div>
    );
  }

  return null;
};

export default MenuConfig;
