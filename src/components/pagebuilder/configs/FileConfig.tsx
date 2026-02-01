/**
 * FileConfig - File/Download Block Configuration
 */

import React from 'react';
import { Upload, FileText, Download, File } from 'lucide-react';
import clsx from 'clsx';

interface FileConfigProps {
  settings: Record<string, any>;
  onChange: (settings: Record<string, any>) => void;
  blockType: string;
  activeTab?: 'content' | 'behavior' | 'style';
}

const FileConfig: React.FC<FileConfigProps> = ({
  settings,
  onChange,
  activeTab = 'content',
}) => {
  if (activeTab === 'content') {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            File URL
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={settings.fileUrl || ''}
              onChange={(e) => onChange({ ...settings, fileUrl: e.target.value })}
              className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              placeholder="https://example.com/document.pdf"
            />
            <button className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200">
              <Upload className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Display Name
          </label>
          <input
            type="text"
            value={settings.fileName || ''}
            onChange={(e) => onChange({ ...settings, fileName: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            placeholder="Document.pdf"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description (optional)
          </label>
          <textarea
            value={settings.description || ''}
            onChange={(e) => onChange({ ...settings, description: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg resize-none"
            placeholder="Brief description of the file..."
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              File Size (optional)
            </label>
            <input
              type="text"
              value={settings.fileSize || ''}
              onChange={(e) => onChange({ ...settings, fileSize: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              placeholder="2.5 MB"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              File Type (optional)
            </label>
            <input
              type="text"
              value={settings.fileType || ''}
              onChange={(e) => onChange({ ...settings, fileType: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              placeholder="PDF"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Button Text
          </label>
          <input
            type="text"
            value={settings.buttonText || 'Download'}
            onChange={(e) => onChange({ ...settings, buttonText: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          />
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
              checked={settings.forceDownload !== false}
              onChange={(e) => onChange({ ...settings, forceDownload: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Force download</span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-6">
            Download file instead of opening in browser
          </p>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.openInNewTab || false}
              onChange={(e) => onChange({ ...settings, openInNewTab: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Open in new tab</span>
          </label>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.trackDownloads || false}
              onChange={(e) => onChange({ ...settings, trackDownloads: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Track downloads</span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-6">
            Count downloads in analytics
          </p>
        </div>
      </div>
    );
  }

  if (activeTab === 'style') {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Display Style
          </label>
          <div className="space-y-2">
            {['card', 'button', 'link'].map((style) => (
              <button
                key={style}
                onClick={() => onChange({ ...settings, displayStyle: style })}
                className={clsx(
                  'w-full px-4 py-3 rounded-lg border-2 transition-colors text-left capitalize',
                  (settings.displayStyle || 'card') === style
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                )}
              >
                <span className="text-sm font-medium">{style}</span>
                <p className="text-xs text-gray-500 mt-0.5">
                  {style === 'card' && 'File card with icon, name, and details'}
                  {style === 'button' && 'Download button only'}
                  {style === 'link' && 'Simple text link'}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showIcon !== false}
              onChange={(e) => onChange({ ...settings, showIcon: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show file icon</span>
          </label>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showSize !== false}
              onChange={(e) => onChange({ ...settings, showSize: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show file size</span>
          </label>
        </div>
      </div>
    );
  }

  return null;
};

export default FileConfig;
