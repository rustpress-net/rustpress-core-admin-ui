/**
 * PricingConfig - Pricing Block Configuration
 *
 * Configure pricing plan details, features, and display options.
 */

import React from 'react';
import { CreditCard, Check, X, Star } from 'lucide-react';
import clsx from 'clsx';
import ArrayEditor from '../config/shared/ArrayEditor';

interface PricingFeature {
  id: string;
  text: string;
  included: boolean;
}

interface PricingConfigProps {
  settings: Record<string, any>;
  onChange: (settings: Record<string, any>) => void;
  blockType: string;
  activeTab?: 'content' | 'behavior' | 'style';
}

const PricingConfig: React.FC<PricingConfigProps> = ({
  settings,
  onChange,
  activeTab = 'content',
}) => {
  const features: PricingFeature[] = settings.features || [];

  const handleFeaturesChange = (newFeatures: PricingFeature[]) => {
    onChange({ ...settings, features: newFeatures });
  };

  const createFeature = (): PricingFeature => ({
    id: `feature_${Date.now()}`,
    text: 'New feature',
    included: true,
  });

  const renderFeatureEditor = (feature: PricingFeature, index: number, handlers: any) => (
    <div className="flex items-center gap-3">
      <button
        onClick={() => handlers.update({ included: !feature.included })}
        className={clsx(
          'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors',
          feature.included
            ? 'bg-green-100 text-green-600'
            : 'bg-red-100 text-red-500'
        )}
      >
        {feature.included ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
      </button>
      <input
        type="text"
        value={feature.text}
        onChange={(e) => handlers.update({ text: e.target.value })}
        className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
        placeholder="Feature description"
      />
    </div>
  );

  if (activeTab === 'content') {
    return (
      <div className="space-y-6">
        {/* Plan Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Plan Name
          </label>
          <input
            type="text"
            value={settings.title || ''}
            onChange={(e) => onChange({ ...settings, title: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Basic, Pro, Enterprise"
          />
        </div>

        {/* Price */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Price
            </label>
            <input
              type="text"
              value={settings.price || ''}
              onChange={(e) => onChange({ ...settings, price: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="$29"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Period
            </label>
            <input
              type="text"
              value={settings.period || ''}
              onChange={(e) => onChange({ ...settings, period: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="/month"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description (optional)
          </label>
          <input
            type="text"
            value={settings.description || ''}
            onChange={(e) => onChange({ ...settings, description: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Perfect for small teams"
          />
        </div>

        {/* Features */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
            Features
          </h3>
          <ArrayEditor
            items={features}
            onChange={handleFeaturesChange}
            renderItem={renderFeatureEditor}
            createItem={createFeature}
            getItemKey={(feature) => feature.id}
            addLabel="Add Feature"
            emptyLabel="No features yet. Add features to list what's included."
            collapsible={false}
          />
        </div>

        {/* Button */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Call to Action</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Button Text</label>
              <input
                type="text"
                value={settings.buttonText || ''}
                onChange={(e) => onChange({ ...settings, buttonText: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Get Started"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Button URL</label>
              <input
                type="text"
                value={settings.buttonUrl || ''}
                onChange={(e) => onChange({ ...settings, buttonUrl: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="/signup?plan=basic"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'behavior') {
    return (
      <div className="space-y-6">
        {/* Featured Badge */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.isFeatured || false}
              onChange={(e) => onChange({ ...settings, isFeatured: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Mark as featured</span>
          </label>
          <p className="text-xs text-gray-500">
            Featured plans are highlighted and stand out from other options
          </p>

          {settings.isFeatured && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Badge Text
              </label>
              <input
                type="text"
                value={settings.badgeText || 'Most Popular'}
                onChange={(e) => onChange({ ...settings, badgeText: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Most Popular"
              />
            </div>
          )}
        </div>

        {/* Sale Price */}
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.onSale || false}
              onChange={(e) => onChange({ ...settings, onSale: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show sale price</span>
          </label>

          {settings.onSale && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Original Price
              </label>
              <input
                type="text"
                value={settings.originalPrice || ''}
                onChange={(e) => onChange({ ...settings, originalPrice: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="$49"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be shown crossed out above the current price
              </p>
            </div>
          )}
        </div>

        {/* Trial Period */}
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.hasTrial || false}
              onChange={(e) => onChange({ ...settings, hasTrial: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show trial info</span>
          </label>

          {settings.hasTrial && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Trial Text
              </label>
              <input
                type="text"
                value={settings.trialText || '14-day free trial'}
                onChange={(e) => onChange({ ...settings, trialText: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="14-day free trial"
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
        {/* Card Style */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Card Style
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['flat', 'bordered', 'elevated'].map((style) => (
              <button
                key={style}
                onClick={() => onChange({ ...settings, cardStyle: style })}
                className={clsx(
                  'p-3 rounded-lg border-2 transition-colors text-center',
                  settings.cardStyle === style
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                )}
              >
                <span className="text-xs font-medium capitalize">{style}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Feature Icon Style */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Feature Icon Style
          </label>
          <select
            value={settings.featureIconStyle || 'check'}
            onChange={(e) => onChange({ ...settings, featureIconStyle: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="check">Checkmark</option>
            <option value="circle">Circle</option>
            <option value="bullet">Bullet</option>
            <option value="none">None</option>
          </select>
        </div>

        {/* Colors */}
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Colors</h4>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Primary Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.primaryColor || '#3b82f6'}
                onChange={(e) => onChange({ ...settings, primaryColor: e.target.value })}
                className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={settings.primaryColor || '#3b82f6'}
                onChange={(e) => onChange({ ...settings, primaryColor: e.target.value })}
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Background Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.bgColor || '#ffffff'}
                onChange={(e) => onChange({ ...settings, bgColor: e.target.value })}
                className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={settings.bgColor || '#ffffff'}
                onChange={(e) => onChange({ ...settings, bgColor: e.target.value })}
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
          </div>

          {settings.isFeatured && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Featured Highlight Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.featuredColor || '#3b82f6'}
                  onChange={(e) => onChange({ ...settings, featuredColor: e.target.value })}
                  className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.featuredColor || '#3b82f6'}
                  onChange={(e) => onChange({ ...settings, featuredColor: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>
            </div>
          )}
        </div>

        {/* Border Radius */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Border Radius: {settings.borderRadius || 12}px
          </label>
          <input
            type="range"
            min="0"
            max="24"
            value={parseInt(settings.borderRadius) || 12}
            onChange={(e) => onChange({ ...settings, borderRadius: `${e.target.value}px` })}
            className="w-full"
          />
        </div>

        {/* Alignment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Text Alignment
          </label>
          <select
            value={settings.textAlign || 'center'}
            onChange={(e) => onChange({ ...settings, textAlign: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
          </select>
        </div>
      </div>
    );
  }

  return null;
};

export default PricingConfig;
