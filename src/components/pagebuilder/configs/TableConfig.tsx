/**
 * TableConfig - Table Block Configuration
 *
 * Configure table cells, headers, and styling.
 */

import React, { useState } from 'react';
import { Table, Plus, Minus, Trash2 } from 'lucide-react';
import clsx from 'clsx';

interface TableConfigProps {
  settings: Record<string, any>;
  onChange: (settings: Record<string, any>) => void;
  blockType: string;
  activeTab?: 'content' | 'behavior' | 'style';
}

const TableConfig: React.FC<TableConfigProps> = ({
  settings,
  onChange,
  activeTab = 'content',
}) => {
  const rows = settings.rows || 3;
  const columns = settings.columns || 3;
  const tableData: string[][] = settings.tableData || Array(rows).fill(null).map(() => Array(columns).fill(''));

  const ensureTableData = (newRows: number, newCols: number) => {
    const newData: string[][] = [];
    for (let r = 0; r < newRows; r++) {
      const row: string[] = [];
      for (let c = 0; c < newCols; c++) {
        row.push(tableData[r]?.[c] || '');
      }
      newData.push(row);
    }
    return newData;
  };

  const updateCell = (row: number, col: number, value: string) => {
    const newData = tableData.map((r, rIdx) =>
      r.map((c, cIdx) => (rIdx === row && cIdx === col ? value : c))
    );
    onChange({ ...settings, tableData: newData });
  };

  const addRow = () => {
    const newRows = rows + 1;
    onChange({
      ...settings,
      rows: newRows,
      tableData: ensureTableData(newRows, columns),
    });
  };

  const removeRow = () => {
    if (rows <= 1) return;
    const newRows = rows - 1;
    onChange({
      ...settings,
      rows: newRows,
      tableData: ensureTableData(newRows, columns),
    });
  };

  const addColumn = () => {
    const newCols = columns + 1;
    onChange({
      ...settings,
      columns: newCols,
      tableData: ensureTableData(rows, newCols),
    });
  };

  const removeColumn = () => {
    if (columns <= 1) return;
    const newCols = columns - 1;
    onChange({
      ...settings,
      columns: newCols,
      tableData: ensureTableData(rows, newCols),
    });
  };

  if (activeTab === 'content') {
    return (
      <div className="space-y-6">
        {/* Table Dimensions */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rows
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={removeRow}
                disabled={rows <= 1}
                className="p-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-medium">{rows}</span>
              <button
                onClick={addRow}
                className="p-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Columns
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={removeColumn}
                disabled={columns <= 1}
                className="p-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-medium">{columns}</span>
              <button
                onClick={addColumn}
                className="p-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Table Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Table Content
          </label>
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            <table className="w-full text-sm">
              <tbody>
                {ensureTableData(rows, columns).map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    {row.map((cell, colIdx) => (
                      <td key={colIdx} className="border border-gray-200 dark:border-gray-700 p-0">
                        <input
                          type="text"
                          value={tableData[rowIdx]?.[colIdx] || ''}
                          onChange={(e) => updateCell(rowIdx, colIdx, e.target.value)}
                          className={clsx(
                            'w-full px-2 py-1.5 text-sm bg-transparent border-0 focus:ring-2 focus:ring-blue-500 focus:ring-inset',
                            rowIdx === 0 && settings.hasHeader && 'font-semibold bg-gray-50 dark:bg-gray-800'
                          )}
                          placeholder={rowIdx === 0 && settings.hasHeader ? 'Header' : 'Cell'}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Click on any cell to edit its content
          </p>
        </div>

        {/* Caption */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Table Caption (optional)
          </label>
          <input
            type="text"
            value={settings.caption || ''}
            onChange={(e) => onChange({ ...settings, caption: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Table caption"
          />
        </div>
      </div>
    );
  }

  if (activeTab === 'behavior') {
    return (
      <div className="space-y-6">
        {/* Header Row */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.hasHeader !== false}
              onChange={(e) => onChange({ ...settings, hasHeader: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">First row is header</span>
          </label>
        </div>

        {/* Footer Row */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.hasFooter || false}
              onChange={(e) => onChange({ ...settings, hasFooter: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Last row is footer</span>
          </label>
        </div>

        {/* Sortable */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.sortable || false}
              onChange={(e) => onChange({ ...settings, sortable: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Enable column sorting</span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-6">
            Allow visitors to sort the table by clicking column headers
          </p>
        </div>

        {/* Searchable */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.searchable || false}
              onChange={(e) => onChange({ ...settings, searchable: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Enable search</span>
          </label>
        </div>

        {/* Responsive */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Responsive Behavior
          </label>
          <select
            value={settings.responsive || 'scroll'}
            onChange={(e) => onChange({ ...settings, responsive: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="scroll">Horizontal scroll</option>
            <option value="stack">Stack on mobile</option>
            <option value="collapse">Collapse columns</option>
          </select>
        </div>
      </div>
    );
  }

  if (activeTab === 'style') {
    return (
      <div className="space-y-6">
        {/* Use Theme Styles */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.useThemeStyles !== false}
              onChange={(e) => onChange({ ...settings, useThemeStyles: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Use theme styles</span>
          </label>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 ml-6">
            Table will inherit colors, fonts, and styling from your active theme
          </p>
        </div>

        {/* Table Style */}
        <div className={settings.useThemeStyles !== false ? 'opacity-50 pointer-events-none' : ''}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Table Style
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'default', label: 'Default' },
              { value: 'striped', label: 'Striped' },
              { value: 'bordered', label: 'Bordered' },
              { value: 'minimal', label: 'Minimal' },
            ].map((style) => (
              <button
                key={style.value}
                onClick={() => onChange({ ...settings, tableStyle: style.value })}
                className={clsx(
                  'p-3 rounded-lg border-2 transition-colors text-center',
                  settings.tableStyle === style.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                )}
              >
                <span className="text-xs font-medium">{style.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Hover Effect */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.hoverHighlight !== false}
              onChange={(e) => onChange({ ...settings, hoverHighlight: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Highlight row on hover</span>
          </label>
        </div>

        {/* Text Alignment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Cell Text Alignment
          </label>
          <select
            value={settings.textAlign || 'left'}
            onChange={(e) => onChange({ ...settings, textAlign: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
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
            <label className="block text-xs text-gray-500 mb-1">Border Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.borderColor || '#e5e7eb'}
                onChange={(e) => onChange({ ...settings, borderColor: e.target.value })}
                className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={settings.borderColor || '#e5e7eb'}
                onChange={(e) => onChange({ ...settings, borderColor: e.target.value })}
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
          </div>

          {settings.tableStyle === 'striped' && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Stripe Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.stripeColor || '#f9fafb'}
                  onChange={(e) => onChange({ ...settings, stripeColor: e.target.value })}
                  className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.stripeColor || '#f9fafb'}
                  onChange={(e) => onChange({ ...settings, stripeColor: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>
            </div>
          )}
        </div>

        {/* Cell Padding */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Cell Padding
          </label>
          <select
            value={settings.cellPadding || 'medium'}
            onChange={(e) => onChange({ ...settings, cellPadding: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="compact">Compact</option>
            <option value="medium">Medium</option>
            <option value="spacious">Spacious</option>
          </select>
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
      </div>
    );
  }

  return null;
};

export default TableConfig;
