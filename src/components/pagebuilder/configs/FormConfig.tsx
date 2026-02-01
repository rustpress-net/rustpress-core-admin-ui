/**
 * FormConfig - Form Block Configuration
 *
 * Configure form fields, validation rules, and submission actions.
 */

import React from 'react';
import {
  FormInput,
  Mail,
  Phone,
  Type,
  AlignLeft,
  ChevronDown,
  Check,
  CircleDot,
  Calendar,
  Hash,
  Link,
  FileText,
} from 'lucide-react';
import clsx from 'clsx';
import ArrayEditor from '../config/shared/ArrayEditor';
import { SimpleListEditor } from '../config/shared/ArrayEditor';

interface FormField {
  id: string;
  type: string;
  label: string;
  name: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

interface FormConfigProps {
  settings: Record<string, any>;
  onChange: (settings: Record<string, any>) => void;
  blockType: string;
  activeTab?: 'content' | 'behavior' | 'style';
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text', icon: Type },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'phone', label: 'Phone', icon: Phone },
  { value: 'textarea', label: 'Textarea', icon: AlignLeft },
  { value: 'select', label: 'Select', icon: ChevronDown },
  { value: 'checkbox', label: 'Checkbox', icon: Check },
  { value: 'radio', label: 'Radio', icon: CircleDot },
  { value: 'date', label: 'Date', icon: Calendar },
  { value: 'number', label: 'Number', icon: Hash },
  { value: 'url', label: 'URL', icon: Link },
  { value: 'file', label: 'File Upload', icon: FileText },
];

const FormConfig: React.FC<FormConfigProps> = ({
  settings,
  onChange,
  activeTab = 'content',
}) => {
  const formFields: FormField[] = settings.formFields || [];

  const handleFieldsChange = (fields: FormField[]) => {
    onChange({ ...settings, formFields: fields });
  };

  const createField = (): FormField => ({
    id: `field_${Date.now()}`,
    type: 'text',
    label: 'New Field',
    name: `field_${Date.now()}`,
    placeholder: '',
    required: false,
    options: [],
  });

  const renderFieldEditor = (field: FormField, index: number, handlers: any) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Field Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Field Type
          </label>
          <select
            value={field.type}
            onChange={(e) => handlers.update({ type: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {FIELD_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Field Label */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Label
          </label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => handlers.update({ label: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Field label"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Field Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Field Name
          </label>
          <input
            type="text"
            value={field.name}
            onChange={(e) => handlers.update({ name: e.target.value.replace(/\s+/g, '_').toLowerCase() })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="field_name"
          />
        </div>

        {/* Placeholder */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Placeholder
          </label>
          <input
            type="text"
            value={field.placeholder || ''}
            onChange={(e) => handlers.update({ placeholder: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Placeholder text"
          />
        </div>
      </div>

      {/* Required Toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={field.required}
          onChange={(e) => handlers.update({ required: e.target.checked })}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">Required field</span>
      </label>

      {/* Options for select/radio fields */}
      {(field.type === 'select' || field.type === 'radio') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Options
          </label>
          <SimpleListEditor
            items={field.options || []}
            onChange={(options) => handlers.update({ options })}
            placeholder="Option value"
            addLabel="Add Option"
          />
        </div>
      )}

      {/* Validation for text fields */}
      {['text', 'email', 'phone', 'url'].includes(field.type) && (
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Validation</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Min Length</label>
              <input
                type="number"
                value={field.validation?.minLength || ''}
                onChange={(e) => handlers.update({
                  validation: { ...field.validation, minLength: e.target.value ? parseInt(e.target.value) : undefined }
                })}
                className="w-full px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                min="0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Max Length</label>
              <input
                type="number"
                value={field.validation?.maxLength || ''}
                onChange={(e) => handlers.update({
                  validation: { ...field.validation, maxLength: e.target.value ? parseInt(e.target.value) : undefined }
                })}
                className="w-full px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                min="0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (activeTab === 'content') {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Form Fields</h3>
          <ArrayEditor
            items={formFields}
            onChange={handleFieldsChange}
            renderItem={renderFieldEditor}
            createItem={createField}
            getItemKey={(field) => field.id}
            addLabel="Add Field"
            emptyLabel="No fields yet. Add fields to build your form."
            collapsible={true}
            itemLabel={(field) => `${field.label} (${field.type})`}
          />
        </div>
      </div>
    );
  }

  if (activeTab === 'behavior') {
    return (
      <div className="space-y-6">
        {/* Form Action */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Form Action URL
          </label>
          <input
            type="text"
            value={settings.formAction || ''}
            onChange={(e) => onChange({ ...settings, formAction: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="/api/contact"
          />
          <p className="text-xs text-gray-500 mt-1">Leave empty to use default form handler</p>
        </div>

        {/* Form Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Form Method
          </label>
          <select
            value={settings.method || 'POST'}
            onChange={(e) => onChange({ ...settings, method: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="POST">POST</option>
            <option value="GET">GET</option>
          </select>
        </div>

        {/* Success Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Success Message
          </label>
          <input
            type="text"
            value={settings.successMessage || ''}
            onChange={(e) => onChange({ ...settings, successMessage: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Thank you for your submission!"
          />
        </div>

        {/* Error Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Error Message
          </label>
          <input
            type="text"
            value={settings.errorMessage || ''}
            onChange={(e) => onChange({ ...settings, errorMessage: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Something went wrong. Please try again."
          />
        </div>

        {/* Redirect URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Redirect After Submit
          </label>
          <input
            type="text"
            value={settings.redirectUrl || ''}
            onChange={(e) => onChange({ ...settings, redirectUrl: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="/thank-you"
          />
          <p className="text-xs text-gray-500 mt-1">Leave empty to show success message inline</p>
        </div>

        {/* Email Notifications */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <label className="flex items-center gap-2 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={settings.sendEmailNotification || false}
              onChange={(e) => onChange({ ...settings, sendEmailNotification: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Send email notification</span>
          </label>

          {settings.sendEmailNotification && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notification Email
              </label>
              <input
                type="email"
                value={settings.notificationEmail || ''}
                onChange={(e) => onChange({ ...settings, notificationEmail: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="admin@example.com"
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
        {/* Submit Button Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Submit Button Text
          </label>
          <input
            type="text"
            value={settings.submitButtonText || 'Submit'}
            onChange={(e) => onChange({ ...settings, submitButtonText: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Button Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Submit Button Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={settings.submitButtonColor || '#3b82f6'}
              onChange={(e) => onChange({ ...settings, submitButtonColor: e.target.value })}
              className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <input
              type="text"
              value={settings.submitButtonColor || '#3b82f6'}
              onChange={(e) => onChange({ ...settings, submitButtonColor: e.target.value })}
              className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>
        </div>

        {/* Form Layout */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Form Layout
          </label>
          <select
            value={settings.formLayout || 'vertical'}
            onChange={(e) => onChange({ ...settings, formLayout: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="vertical">Vertical (stacked)</option>
            <option value="horizontal">Horizontal (inline labels)</option>
            <option value="inline">Inline (side by side)</option>
          </select>
        </div>

        {/* Field Gap */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Field Spacing
          </label>
          <input
            type="range"
            min="8"
            max="32"
            value={parseInt(settings.fieldGap) || 16}
            onChange={(e) => onChange({ ...settings, fieldGap: `${e.target.value}px` })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Tight</span>
            <span>{settings.fieldGap || '16px'}</span>
            <span>Loose</span>
          </div>
        </div>

        {/* Label Style */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showLabels !== false}
              onChange={(e) => onChange({ ...settings, showLabels: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show field labels</span>
          </label>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showRequiredAsterisk !== false}
              onChange={(e) => onChange({ ...settings, showRequiredAsterisk: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show required asterisk (*)</span>
          </label>
        </div>
      </div>
    );
  }

  return null;
};

export default FormConfig;
