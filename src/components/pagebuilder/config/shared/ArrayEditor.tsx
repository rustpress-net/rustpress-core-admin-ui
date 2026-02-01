/**
 * ArrayEditor - Reusable drag-drop list editor
 *
 * A generic component for managing arrays of items with:
 * - Add/remove items
 * - Drag-and-drop reordering
 * - Customizable item rendering
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Copy,
} from 'lucide-react';
import clsx from 'clsx';

export interface ArrayEditorProps<T> {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, index: number, handlers: ItemHandlers<T>) => React.ReactNode;
  createItem: () => T;
  getItemKey: (item: T, index: number) => string;
  addLabel?: string;
  emptyLabel?: string;
  maxItems?: number;
  minItems?: number;
  collapsible?: boolean;
  itemLabel?: (item: T, index: number) => string;
  className?: string;
}

export interface ItemHandlers<T> {
  update: (updates: Partial<T>) => void;
  remove: () => void;
  duplicate: () => void;
  moveUp: () => void;
  moveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

function ArrayEditor<T>({
  items,
  onChange,
  renderItem,
  createItem,
  getItemKey,
  addLabel = 'Add Item',
  emptyLabel = 'No items yet. Click the button below to add one.',
  maxItems,
  minItems = 0,
  collapsible = false,
  itemLabel,
  className,
}: ArrayEditorProps<T>) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const handleAdd = useCallback(() => {
    if (maxItems && items.length >= maxItems) return;
    const newItem = createItem();
    const newItems = [...items, newItem];
    onChange(newItems);
    // Auto-expand new item if collapsible
    if (collapsible) {
      const key = getItemKey(newItem, newItems.length - 1);
      setExpandedItems(prev => new Set([...prev, key]));
    }
  }, [items, onChange, createItem, maxItems, collapsible, getItemKey]);

  const handleUpdate = useCallback((index: number, updates: Partial<T>) => {
    const newItems = items.map((item, i) =>
      i === index ? { ...item, ...updates } : item
    );
    onChange(newItems);
  }, [items, onChange]);

  const handleRemove = useCallback((index: number) => {
    if (items.length <= minItems) return;
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  }, [items, onChange, minItems]);

  const handleDuplicate = useCallback((index: number) => {
    if (maxItems && items.length >= maxItems) return;
    const itemToDuplicate = items[index];
    const newItem = { ...itemToDuplicate };
    const newItems = [...items];
    newItems.splice(index + 1, 0, newItem);
    onChange(newItems);
  }, [items, onChange, maxItems]);

  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    onChange(newItems);
  }, [items, onChange]);

  const handleMoveDown = useCallback((index: number) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    onChange(newItems);
  }, [items, onChange]);

  const handleReorder = useCallback((newItems: T[]) => {
    onChange(newItems);
  }, [onChange]);

  const toggleExpanded = useCallback((key: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const getHandlers = (index: number): ItemHandlers<T> => ({
    update: (updates) => handleUpdate(index, updates),
    remove: () => handleRemove(index),
    duplicate: () => handleDuplicate(index),
    moveUp: () => handleMoveUp(index),
    moveDown: () => handleMoveDown(index),
    isFirst: index === 0,
    isLast: index === items.length - 1,
  });

  const canAdd = !maxItems || items.length < maxItems;
  const canRemove = items.length > minItems;

  return (
    <div className={clsx('space-y-2', className)}>
      {items.length === 0 ? (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
          <p className="text-sm">{emptyLabel}</p>
        </div>
      ) : (
        <Reorder.Group
          axis="y"
          values={items}
          onReorder={handleReorder}
          className="space-y-2"
        >
          <AnimatePresence initial={false}>
            {items.map((item, index) => {
              const key = getItemKey(item, index);
              const isExpanded = !collapsible || expandedItems.has(key);

              return (
                <Reorder.Item
                  key={key}
                  value={item}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {collapsible ? (
                      <>
                        {/* Collapsible Header */}
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                          <div className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600">
                            <GripVertical className="w-4 h-4" />
                          </div>
                          <button
                            onClick={() => toggleExpanded(key)}
                            className="flex items-center gap-2 flex-1 text-left"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {itemLabel ? itemLabel(item, index) : `Item ${index + 1}`}
                            </span>
                          </button>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDuplicate(index)}
                              disabled={!canAdd}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"
                              title="Duplicate"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleRemove(index)}
                              disabled={!canRemove}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-50"
                              title="Remove"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Collapsible Content */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="p-4"
                            >
                              {renderItem(item, index, getHandlers(index))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      /* Non-collapsible Item */
                      <div className="flex items-start gap-2 p-3">
                        <div className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 mt-1">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          {renderItem(item, index, getHandlers(index))}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <button
                            onClick={() => handleDuplicate(index)}
                            disabled={!canAdd}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"
                            title="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRemove(index)}
                            disabled={!canRemove}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-50"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </Reorder.Item>
              );
            })}
          </AnimatePresence>
        </Reorder.Group>
      )}

      {/* Add Button */}
      <button
        onClick={handleAdd}
        disabled={!canAdd}
        className={clsx(
          'flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium rounded-lg border-2 border-dashed transition-colors',
          canAdd
            ? 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
            : 'border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed'
        )}
      >
        <Plus className="w-4 h-4" />
        {addLabel}
        {maxItems && <span className="text-xs text-gray-400">({items.length}/{maxItems})</span>}
      </button>
    </div>
  );
}

export default ArrayEditor;

// Simplified array editor for basic key-value or simple string lists
export const SimpleListEditor: React.FC<{
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  addLabel?: string;
}> = ({ items, onChange, placeholder = 'Enter value...', addLabel = 'Add Item' }) => {
  const handleAdd = () => {
    onChange([...items, '']);
  };

  const handleUpdate = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    onChange(newItems);
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            value={item}
            onChange={(e) => handleUpdate(index, e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={() => handleRemove(index)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        onClick={handleAdd}
        className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
      >
        <Plus className="w-4 h-4" />
        {addLabel}
      </button>
    </div>
  );
};
