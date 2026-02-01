/**
 * CustomHtmlConfig - Custom HTML Block Configuration
 */

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface CustomHtmlConfigProps {
  settings: Record<string, any>;
  onChange: (settings: Record<string, any>) => void;
  blockType: string;
  activeTab?: 'content' | 'behavior' | 'style';
}

const CustomHtmlConfig: React.FC<CustomHtmlConfigProps> = ({
  settings,
  onChange,
  activeTab = 'content',
}) => {
  if (activeTab === 'content') {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            <p className="font-medium mb-1">Use with caution</p>
            <p className="text-xs opacity-80">
              Custom HTML can affect page styling and functionality. Make sure your code is safe and valid.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            HTML Code
          </label>
          <textarea
            value={settings.html || ''}
            onChange={(e) => onChange({ ...settings, html: e.target.value })}
            className="w-full px-3 py-2 text-sm font-mono bg-gray-900 text-gray-100 border border-gray-700 rounded-lg resize-none"
            placeholder="<div>Your HTML here...</div>"
            rows={12}
            spellCheck={false}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            CSS Styles (optional)
          </label>
          <textarea
            value={settings.css || ''}
            onChange={(e) => onChange({ ...settings, css: e.target.value })}
            className="w-full px-3 py-2 text-sm font-mono bg-gray-900 text-gray-100 border border-gray-700 rounded-lg resize-none"
            placeholder=".my-class { color: red; }"
            rows={6}
            spellCheck={false}
          />
          <p className="text-xs text-gray-500 mt-1">
            Styles will be scoped to this block
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            JavaScript (optional)
          </label>
          <textarea
            value={settings.js || ''}
            onChange={(e) => onChange({ ...settings, js: e.target.value })}
            className="w-full px-3 py-2 text-sm font-mono bg-gray-900 text-gray-100 border border-gray-700 rounded-lg resize-none"
            placeholder="console.log('Hello');"
            rows={4}
            spellCheck={false}
          />
          <p className="text-xs text-gray-500 mt-1">
            JavaScript runs after the HTML is rendered
          </p>
        </div>
      </div>
    );
  }

  if (activeTab === 'behavior') {
    return (
      <div className="space-y-6">
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.sanitize !== false}
              onChange={(e) => onChange({ ...settings, sanitize: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Sanitize HTML</span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-6">
            Remove potentially dangerous scripts and attributes
          </p>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.preserveWhitespace || false}
              onChange={(e) => onChange({ ...settings, preserveWhitespace: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Preserve whitespace</span>
          </label>
        </div>
      </div>
    );
  }

  return null;
};

export default CustomHtmlConfig;
