/**
 * CodeConfig - Code Block Configuration
 *
 * Configure code snippet with language and display options.
 */

import React from 'react';
import { Code, Copy } from 'lucide-react';
import clsx from 'clsx';

interface CodeConfigProps {
  settings: Record<string, any>;
  onChange: (settings: Record<string, any>) => void;
  blockType: string;
  activeTab?: 'content' | 'behavior' | 'style';
}

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'rust', label: 'Rust' },
  { value: 'go', label: 'Go' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'scss', label: 'SCSS' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash/Shell' },
  { value: 'plaintext', label: 'Plain Text' },
];

const THEMES = [
  { value: 'github', label: 'GitHub' },
  { value: 'github-dark', label: 'GitHub Dark' },
  { value: 'vs-code', label: 'VS Code' },
  { value: 'vs-code-dark', label: 'VS Code Dark' },
  { value: 'one-dark', label: 'One Dark' },
  { value: 'one-light', label: 'One Light' },
  { value: 'dracula', label: 'Dracula' },
  { value: 'monokai', label: 'Monokai' },
  { value: 'nord', label: 'Nord' },
  { value: 'solarized-dark', label: 'Solarized Dark' },
  { value: 'solarized-light', label: 'Solarized Light' },
];

const CodeConfig: React.FC<CodeConfigProps> = ({
  settings,
  onChange,
  activeTab = 'content',
}) => {
  if (activeTab === 'content') {
    return (
      <div className="space-y-6">
        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Language
          </label>
          <select
            value={settings.language || 'javascript'}
            onChange={(e) => onChange({ ...settings, language: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
        </div>

        {/* Code Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Code
          </label>
          <textarea
            value={settings.code || ''}
            onChange={(e) => onChange({ ...settings, code: e.target.value })}
            className="w-full px-3 py-2 text-sm font-mono bg-gray-900 text-gray-100 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="// Enter your code here..."
            rows={12}
            spellCheck={false}
          />
        </div>

        {/* Filename */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Filename (optional)
          </label>
          <input
            type="text"
            value={settings.filename || ''}
            onChange={(e) => onChange({ ...settings, filename: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            placeholder="example.js"
          />
          <p className="text-xs text-gray-500 mt-1">
            Shows a filename header above the code block
          </p>
        </div>

        {/* Caption */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Caption (optional)
          </label>
          <input
            type="text"
            value={settings.caption || ''}
            onChange={(e) => onChange({ ...settings, caption: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            placeholder="A simple example"
          />
        </div>
      </div>
    );
  }

  if (activeTab === 'behavior') {
    return (
      <div className="space-y-6">
        {/* Line Numbers */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showLineNumbers !== false}
              onChange={(e) => onChange({ ...settings, showLineNumbers: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show line numbers</span>
          </label>
        </div>

        {/* Starting Line Number */}
        {settings.showLineNumbers !== false && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Starting Line Number
            </label>
            <input
              type="number"
              value={settings.startLine || 1}
              onChange={(e) => onChange({ ...settings, startLine: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              min="1"
            />
          </div>
        )}

        {/* Highlight Lines */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Highlight Lines (optional)
          </label>
          <input
            type="text"
            value={settings.highlightLines || ''}
            onChange={(e) => onChange({ ...settings, highlightLines: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            placeholder="1, 3-5, 8"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter line numbers or ranges to highlight
          </p>
        </div>

        {/* Copy Button */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showCopyButton !== false}
              onChange={(e) => onChange({ ...settings, showCopyButton: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show copy button</span>
          </label>
        </div>

        {/* Wrap Lines */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.wrapLines || false}
              onChange={(e) => onChange({ ...settings, wrapLines: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Wrap long lines</span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-6">
            Otherwise, horizontal scroll will be enabled
          </p>
        </div>

        {/* Max Height */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Max Height
          </label>
          <select
            value={settings.maxHeight || 'auto'}
            onChange={(e) => onChange({ ...settings, maxHeight: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="auto">Auto (show all)</option>
            <option value="200px">200px</option>
            <option value="300px">300px</option>
            <option value="400px">400px</option>
            <option value="500px">500px</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Adds vertical scroll if code exceeds max height
          </p>
        </div>
      </div>
    );
  }

  if (activeTab === 'style') {
    return (
      <div className="space-y-6">
        {/* Theme */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Syntax Theme
          </label>
          <select
            value={settings.theme || 'github-dark'}
            onChange={(e) => onChange({ ...settings, theme: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            {THEMES.map((theme) => (
              <option key={theme.value} value={theme.value}>{theme.label}</option>
            ))}
          </select>
        </div>

        {/* Font Size */}
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
            <option value="13px">Default (13px)</option>
            <option value="14px">Medium (14px)</option>
            <option value="15px">Large (15px)</option>
            <option value="16px">Extra Large (16px)</option>
          </select>
        </div>

        {/* Font Family */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Font Family
          </label>
          <select
            value={settings.fontFamily || 'default'}
            onChange={(e) => onChange({ ...settings, fontFamily: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="default">System Mono</option>
            <option value="fira-code">Fira Code</option>
            <option value="jetbrains-mono">JetBrains Mono</option>
            <option value="source-code-pro">Source Code Pro</option>
            <option value="inconsolata">Inconsolata</option>
          </select>
        </div>

        {/* Show Ligatures */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.fontLigatures || false}
              onChange={(e) => onChange({ ...settings, fontLigatures: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Enable font ligatures</span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-6">
            Combines characters like =&gt; and !== into single glyphs
          </p>
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

        {/* Padding */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Padding
          </label>
          <select
            value={settings.padding || 'medium'}
            onChange={(e) => onChange({ ...settings, padding: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="compact">Compact</option>
            <option value="medium">Medium</option>
            <option value="spacious">Spacious</option>
          </select>
        </div>

        {/* Header Style */}
        {settings.filename && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Header Style
            </label>
            <select
              value={settings.headerStyle || 'default'}
              onChange={(e) => onChange({ ...settings, headerStyle: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              <option value="default">Default</option>
              <option value="mac">macOS Style (dots)</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default CodeConfig;
