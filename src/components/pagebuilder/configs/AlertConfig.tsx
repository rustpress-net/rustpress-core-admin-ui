/**
 * AlertConfig - Alert/Notice Block Configuration
 */

import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, XCircle } from 'lucide-react';
import clsx from 'clsx';

interface AlertConfigProps {
  settings: Record<string, any>;
  onChange: (settings: Record<string, any>) => void;
  blockType: string;
  activeTab?: 'content' | 'behavior' | 'style';
}

const ALERT_TYPES = [
  { value: 'info', label: 'Info', icon: Info, color: 'blue' },
  { value: 'success', label: 'Success', icon: CheckCircle, color: 'green' },
  { value: 'warning', label: 'Warning', icon: AlertTriangle, color: 'yellow' },
  { value: 'error', label: 'Error', icon: XCircle, color: 'red' },
  { value: 'neutral', label: 'Neutral', icon: AlertCircle, color: 'gray' },
];

const AlertConfig: React.FC<AlertConfigProps> = ({
  settings,
  onChange,
  activeTab = 'content',
}) => {
  if (activeTab === 'content') {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Alert Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {ALERT_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => onChange({ ...settings, alertType: type.value })}
                  className={clsx(
                    'flex items-center gap-2 px-3 py-3 rounded-lg border-2 transition-colors',
                    settings.alertType === type.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  )}
                >
                  <Icon className={clsx('w-5 h-5', `text-${type.color}-500`)} />
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title (optional)
          </label>
          <input
            type="text"
            value={settings.title || ''}
            onChange={(e) => onChange({ ...settings, title: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            placeholder="Alert Title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Message
          </label>
          <textarea
            value={settings.text || ''}
            onChange={(e) => onChange({ ...settings, text: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg resize-none"
            placeholder="Alert message..."
            rows={3}
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
              checked={settings.dismissible || false}
              onChange={(e) => onChange({ ...settings, dismissible: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Dismissible</span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-6">
            Show close button to dismiss alert
          </p>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showIcon !== false}
              onChange={(e) => onChange({ ...settings, showIcon: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show icon</span>
          </label>
        </div>
      </div>
    );
  }

  if (activeTab === 'style') {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Style Variant
          </label>
          <div className="space-y-2">
            {['filled', 'outlined', 'soft'].map((variant) => (
              <button
                key={variant}
                onClick={() => onChange({ ...settings, variant })}
                className={clsx(
                  'w-full px-4 py-3 rounded-lg border-2 transition-colors text-left capitalize',
                  settings.variant === variant
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                )}
              >
                <span className="text-sm font-medium">{variant}</span>
                <p className="text-xs text-gray-500 mt-0.5">
                  {variant === 'filled' && 'Solid background color'}
                  {variant === 'outlined' && 'Border with transparent background'}
                  {variant === 'soft' && 'Light tinted background'}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Border Radius: {settings.borderRadius || 8}px
          </label>
          <input
            type="range"
            min="0"
            max="24"
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

export default AlertConfig;
