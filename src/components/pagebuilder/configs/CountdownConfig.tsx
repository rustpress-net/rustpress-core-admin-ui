/**
 * CountdownConfig - Countdown Block Configuration
 *
 * Configure target date and display units for countdown timer.
 */

import React from 'react';
import { Clock, Calendar } from 'lucide-react';
import clsx from 'clsx';

interface CountdownConfigProps {
  settings: Record<string, any>;
  onChange: (settings: Record<string, any>) => void;
  blockType: string;
  activeTab?: 'content' | 'behavior' | 'style';
}

const CountdownConfig: React.FC<CountdownConfigProps> = ({
  settings,
  onChange,
  activeTab = 'content',
}) => {
  // Format date for datetime-local input
  const formatDateForInput = (isoString: string | undefined) => {
    if (!isoString) {
      const tomorrow = new Date(Date.now() + 86400000);
      return tomorrow.toISOString().slice(0, 16);
    }
    return new Date(isoString).toISOString().slice(0, 16);
  };

  if (activeTab === 'content') {
    return (
      <div className="space-y-6">
        {/* Target Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Target Date & Time
          </label>
          <input
            type="datetime-local"
            value={formatDateForInput(settings.targetDate)}
            onChange={(e) => onChange({ ...settings, targetDate: new Date(e.target.value).toISOString() })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title (optional)
          </label>
          <input
            type="text"
            value={settings.title || ''}
            onChange={(e) => onChange({ ...settings, title: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Sale ends in..."
          />
        </div>

        {/* Expired Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Message when expired
          </label>
          <input
            type="text"
            value={settings.expiredMessage || ''}
            onChange={(e) => onChange({ ...settings, expiredMessage: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Event has ended"
          />
        </div>

        {/* Display Units */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Display Units
          </label>
          <div className="space-y-2">
            {[
              { key: 'showDays', label: 'Days' },
              { key: 'showHours', label: 'Hours' },
              { key: 'showMinutes', label: 'Minutes' },
              { key: 'showSeconds', label: 'Seconds' },
            ].map((unit) => (
              <label key={unit.key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[unit.key] !== false}
                  onChange={(e) => onChange({ ...settings, [unit.key]: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{unit.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'behavior') {
    return (
      <div className="space-y-6">
        {/* Action on Expire */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            When countdown expires
          </label>
          <select
            value={settings.expireAction || 'message'}
            onChange={(e) => onChange({ ...settings, expireAction: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="message">Show message</option>
            <option value="hide">Hide countdown</option>
            <option value="redirect">Redirect to URL</option>
            <option value="zeros">Show zeros</option>
          </select>
        </div>

        {settings.expireAction === 'redirect' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Redirect URL
            </label>
            <input
              type="text"
              value={settings.redirectUrl || ''}
              onChange={(e) => onChange({ ...settings, redirectUrl: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="/thank-you"
            />
          </div>
        )}

        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Timezone
          </label>
          <select
            value={settings.timezone || 'local'}
            onChange={(e) => onChange({ ...settings, timezone: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="local">Visitor's local time</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="Europe/London">London (GMT)</option>
            <option value="Europe/Paris">Paris (CET)</option>
            <option value="Asia/Tokyo">Tokyo (JST)</option>
          </select>
        </div>
      </div>
    );
  }

  if (activeTab === 'style') {
    return (
      <div className="space-y-6">
        {/* Layout Style */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Layout Style
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'boxes', label: 'Boxes', description: 'Separate boxes' },
              { value: 'inline', label: 'Inline', description: 'Single line' },
              { value: 'circles', label: 'Circles', description: 'Circular units' },
              { value: 'minimal', label: 'Minimal', description: 'Numbers only' },
            ].map((style) => (
              <button
                key={style.value}
                onClick={() => onChange({ ...settings, layoutStyle: style.value })}
                className={clsx(
                  'p-3 rounded-lg border-2 transition-colors text-left',
                  settings.layoutStyle === style.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                )}
              >
                <div className="text-xs font-medium">{style.label}</div>
                <div className="text-[10px] text-gray-500">{style.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Size
          </label>
          <select
            value={settings.size || 'medium'}
            onChange={(e) => onChange({ ...settings, size: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        {/* Label Style */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Label Style
          </label>
          <select
            value={settings.labelStyle || 'below'}
            onChange={(e) => onChange({ ...settings, labelStyle: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="below">Below numbers</option>
            <option value="inside">Inside box</option>
            <option value="abbreviated">Abbreviated (d, h, m, s)</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>

        {/* Separator */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Separator
          </label>
          <select
            value={settings.separator || 'none'}
            onChange={(e) => onChange({ ...settings, separator: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="none">None</option>
            <option value="colon">Colon (:)</option>
            <option value="dot">Dot (.)</option>
            <option value="dash">Dash (-)</option>
          </select>
        </div>

        {/* Colors */}
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Colors</h4>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Number Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.numberColor || '#ffffff'}
                onChange={(e) => onChange({ ...settings, numberColor: e.target.value })}
                className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={settings.numberColor || '#ffffff'}
                onChange={(e) => onChange({ ...settings, numberColor: e.target.value })}
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Box Background</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.boxBgColor || '#1f2937'}
                onChange={(e) => onChange({ ...settings, boxBgColor: e.target.value })}
                className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={settings.boxBgColor || '#1f2937'}
                onChange={(e) => onChange({ ...settings, boxBgColor: e.target.value })}
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Label Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.labelColor || '#6b7280'}
                onChange={(e) => onChange({ ...settings, labelColor: e.target.value })}
                className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={settings.labelColor || '#6b7280'}
                onChange={(e) => onChange({ ...settings, labelColor: e.target.value })}
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

export default CountdownConfig;
