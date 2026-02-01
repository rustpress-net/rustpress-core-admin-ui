/**
 * AuthProvidersSettings - Configure SSO and OAuth authentication providers
 *
 * Features:
 * - Enable/disable 30+ authentication providers
 * - Configure OAuth2, OIDC, SAML, and LDAP
 * - Attribute mapping from provider to RustPress
 * - Role mapping for automatic role assignment
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Save, Check, Info, Search, Plus, Settings, Trash2,
  ExternalLink, ChevronRight, ChevronDown, Eye, EyeOff,
  Building2, Users, Code, MessageSquare, Briefcase, FileCode,
  Globe, Key, Lock, Server, Cloud, AlertTriangle, Copy,
  ToggleLeft, ToggleRight, RefreshCw, TestTube, X
} from 'lucide-react';
import type {
  AuthProvider,
  AuthProviderId,
  AuthProviderCategory,
  AuthSettings,
  OAuthConfig,
  SAMLConfig,
  LDAPConfig,
  AttributeMapping,
  RoleMapping,
} from '../../types/auth';
import { AUTH_PROVIDERS, AUTH_CATEGORIES, DEFAULT_SCOPES, DEFAULT_ATTRIBUTE_MAPPINGS } from '../../types/auth';

// Category icons mapping
const categoryIcons: Record<AuthProviderCategory, React.ElementType> = {
  enterprise: Building2,
  protocol: FileCode,
  social: Users,
  developer: Code,
  communication: MessageSquare,
  business: Briefcase,
};

// Default auth settings
const defaultAuthSettings: AuthSettings = {
  allowLocalLogin: true,
  allowRegistration: true,
  showProviderButtons: true,
  sessionTimeout: 60,
  maxLoginAttempts: 5,
  lockoutDuration: 15,
  requireEmailVerification: false,
  requireMfa: false,
  passwordMinLength: 8,
  passwordRequireUppercase: true,
  passwordRequireLowercase: true,
  passwordRequireNumbers: true,
  passwordRequireSymbols: false,
  passwordExpiryDays: 0,
};

// Provider card component
const ProviderCard: React.FC<{
  providerId: AuthProviderId;
  isEnabled: boolean;
  isConfigured: boolean;
  onToggle: () => void;
  onConfigure: () => void;
}> = ({ providerId, isEnabled, isConfigured, onToggle, onConfigure }) => {
  const provider = AUTH_PROVIDERS[providerId];
  if (!provider) return null;

  return (
    <div
      className={`p-4 rounded-xl border-2 transition-all ${
        isEnabled
          ? 'bg-gray-800/50 border-green-500/50'
          : 'bg-gray-800/30 border-gray-700 hover:border-gray-600'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${provider.branding.color}20` }}
          >
            <Globe className="w-5 h-5" style={{ color: provider.branding.color }} />
          </div>
          <div>
            <h4 className="text-white font-medium">{provider.branding.displayName}</h4>
            <p className="text-xs text-gray-500">{provider.protocol.toUpperCase()}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isConfigured && (
            <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded">
              Configured
            </span>
          )}
          <button
            onClick={onToggle}
            className={`p-2 rounded-lg transition-colors ${
              isEnabled
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            {isEnabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
          </button>
          <button
            onClick={onConfigure}
            className="p-2 rounded-lg bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-400 mt-3">{provider.branding.description}</p>

      {provider.branding.documentationUrl && (
        <a
          href={provider.branding.documentationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-2"
        >
          Documentation <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
};

// Provider configuration modal
const ProviderConfigModal: React.FC<{
  providerId: AuthProviderId | null;
  config: Partial<AuthProvider> | null;
  onSave: (config: Partial<AuthProvider>) => void;
  onClose: () => void;
}> = ({ providerId, config, onSave, onClose }) => {
  const [localConfig, setLocalConfig] = useState<Partial<AuthProvider>>(config || {});
  const [showSecret, setShowSecret] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'oauth' | 'mapping' | 'advanced'>('general');

  if (!providerId) return null;
  const provider = AUTH_PROVIDERS[providerId];
  if (!provider) return null;

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  const updateOAuthConfig = (key: keyof OAuthConfig, value: string | string[] | boolean) => {
    setLocalConfig({
      ...localConfig,
      oauthConfig: {
        ...(localConfig.oauthConfig || { clientId: '', clientSecret: '', scopes: [] }),
        [key]: value,
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-700"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${provider.branding.color}20` }}
              >
                <Globe className="w-6 h-6" style={{ color: provider.branding.color }} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{provider.branding.displayName}</h2>
                <p className="text-sm text-gray-400">{provider.protocol.toUpperCase()} Configuration</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-gray-700 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {(['general', 'oauth', 'mapping', 'advanced'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-900 rounded-lg">
                <input
                  type="checkbox"
                  checked={localConfig.enabled ?? false}
                  onChange={(e) => setLocalConfig({ ...localConfig, enabled: e.target.checked })}
                  className="w-5 h-5 rounded bg-gray-800 border-gray-600 text-purple-500"
                />
                <div>
                  <span className="text-white font-medium">Enable Provider</span>
                  <p className="text-xs text-gray-500">Allow users to sign in with this provider</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-900 rounded-lg">
                <input
                  type="checkbox"
                  checked={localConfig.autoCreateUsers ?? true}
                  onChange={(e) => setLocalConfig({ ...localConfig, autoCreateUsers: e.target.checked })}
                  className="w-5 h-5 rounded bg-gray-800 border-gray-600 text-purple-500"
                />
                <div>
                  <span className="text-white font-medium">Auto-Create Users</span>
                  <p className="text-xs text-gray-500">Automatically create accounts for new users</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-900 rounded-lg">
                <input
                  type="checkbox"
                  checked={localConfig.updateUserOnLogin ?? true}
                  onChange={(e) => setLocalConfig({ ...localConfig, updateUserOnLogin: e.target.checked })}
                  className="w-5 h-5 rounded bg-gray-800 border-gray-600 text-purple-500"
                />
                <div>
                  <span className="text-white font-medium">Update User on Login</span>
                  <p className="text-xs text-gray-500">Sync user data from provider on each login</p>
                </div>
              </label>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Default Role</label>
                <select
                  value={localConfig.defaultRole || 'subscriber'}
                  onChange={(e) => setLocalConfig({ ...localConfig, defaultRole: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                >
                  <option value="subscriber">Subscriber</option>
                  <option value="author">Author</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Allowed Email Domains</label>
                <textarea
                  value={(localConfig.allowedDomains || []).join('\n')}
                  onChange={(e) => setLocalConfig({
                    ...localConfig,
                    allowedDomains: e.target.value.split('\n').filter(Boolean),
                  })}
                  placeholder="company.com&#10;partner.org"
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 resize-none font-mono text-sm"
                />
                <p className="text-xs text-gray-500">One domain per line. Leave empty to allow all domains.</p>
              </div>
            </div>
          )}

          {activeTab === 'oauth' && (provider.protocol === 'oauth2' || provider.protocol === 'oidc') && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <p className="text-sm text-blue-300">
                    Get your Client ID and Secret from the{' '}
                    <a
                      href={provider.branding.documentationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      {provider.branding.displayName} developer console
                    </a>
                    .
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Client ID</label>
                <input
                  type="text"
                  value={localConfig.oauthConfig?.clientId || ''}
                  onChange={(e) => updateOAuthConfig('clientId', e.target.value)}
                  placeholder="Enter Client ID"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Client Secret</label>
                <div className="relative">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    value={localConfig.oauthConfig?.clientSecret || ''}
                    onChange={(e) => updateOAuthConfig('clientSecret', e.target.value)}
                    placeholder="Enter Client Secret"
                    className="w-full px-4 py-3 pr-12 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Scopes</label>
                <input
                  type="text"
                  value={(localConfig.oauthConfig?.scopes || DEFAULT_SCOPES[providerId] || []).join(', ')}
                  onChange={(e) => updateOAuthConfig('scopes', e.target.value.split(',').map(s => s.trim()))}
                  placeholder="openid, email, profile"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500"
                />
                <p className="text-xs text-gray-500">Comma-separated list of OAuth scopes</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Callback URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/api/auth/callback/${providerId}`}
                    className="flex-1 px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-400 font-mono text-sm"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/api/auth/callback/${providerId}`)}
                    className="px-4 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500">Add this URL to your OAuth app's authorized redirect URIs</p>
              </div>
            </div>
          )}

          {activeTab === 'mapping' && (
            <div className="space-y-4">
              <h3 className="text-white font-medium">Attribute Mapping</h3>
              <p className="text-sm text-gray-400">
                Map attributes from the provider to RustPress user fields.
              </p>

              <div className="space-y-3">
                {(localConfig.attributeMappings || DEFAULT_ATTRIBUTE_MAPPINGS[providerId] || []).map((mapping, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <input
                      type="text"
                      value={mapping.providerId}
                      onChange={(e) => {
                        const mappings = [...(localConfig.attributeMappings || [])];
                        mappings[idx] = { ...mapping, providerId: e.target.value };
                        setLocalConfig({ ...localConfig, attributeMappings: mappings });
                      }}
                      placeholder="Provider field"
                      className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm"
                    />
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={mapping.rustpressField}
                      onChange={(e) => {
                        const mappings = [...(localConfig.attributeMappings || [])];
                        mappings[idx] = { ...mapping, rustpressField: e.target.value };
                        setLocalConfig({ ...localConfig, attributeMappings: mappings });
                      }}
                      placeholder="RustPress field"
                      className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm"
                    />
                    <button
                      onClick={() => {
                        const mappings = (localConfig.attributeMappings || []).filter((_, i) => i !== idx);
                        setLocalConfig({ ...localConfig, attributeMappings: mappings });
                      }}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  const mappings = [...(localConfig.attributeMappings || []), { providerId: '', rustpressField: '', required: false }];
                  setLocalConfig({ ...localConfig, attributeMappings: mappings });
                }}
                className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300"
              >
                <Plus className="w-4 h-4" /> Add Mapping
              </button>

              <div className="border-t border-gray-700 pt-4 mt-6">
                <h3 className="text-white font-medium mb-3">Role Mapping</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Map provider groups/roles to RustPress roles.
                </p>

                <div className="space-y-3">
                  {(localConfig.roleMappings || []).map((mapping, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <input
                        type="text"
                        value={mapping.providerRole}
                        onChange={(e) => {
                          const mappings = [...(localConfig.roleMappings || [])];
                          mappings[idx] = { ...mapping, providerRole: e.target.value };
                          setLocalConfig({ ...localConfig, roleMappings: mappings });
                        }}
                        placeholder="Provider role/group"
                        className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm"
                      />
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                      <select
                        value={mapping.rustpressRole}
                        onChange={(e) => {
                          const mappings = [...(localConfig.roleMappings || [])];
                          mappings[idx] = { ...mapping, rustpressRole: e.target.value };
                          setLocalConfig({ ...localConfig, roleMappings: mappings });
                        }}
                        className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm"
                      >
                        <option value="subscriber">Subscriber</option>
                        <option value="author">Author</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Administrator</option>
                      </select>
                      <button
                        onClick={() => {
                          const mappings = (localConfig.roleMappings || []).filter((_, i) => i !== idx);
                          setLocalConfig({ ...localConfig, roleMappings: mappings });
                        }}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    const mappings = [...(localConfig.roleMappings || []), { providerRole: '', rustpressRole: 'subscriber', priority: 0 }];
                    setLocalConfig({ ...localConfig, roleMappings: mappings });
                  }}
                  className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 mt-3"
                >
                  <Plus className="w-4 h-4" /> Add Role Mapping
                </button>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-900 rounded-lg">
                <input
                  type="checkbox"
                  checked={localConfig.jitProvisioning ?? true}
                  onChange={(e) => setLocalConfig({ ...localConfig, jitProvisioning: e.target.checked })}
                  className="w-5 h-5 rounded bg-gray-800 border-gray-600 text-purple-500"
                />
                <div>
                  <span className="text-white font-medium">Just-in-Time Provisioning</span>
                  <p className="text-xs text-gray-500">Create user accounts on first login</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-900 rounded-lg">
                <input
                  type="checkbox"
                  checked={localConfig.forceReauth ?? false}
                  onChange={(e) => setLocalConfig({ ...localConfig, forceReauth: e.target.checked })}
                  className="w-5 h-5 rounded bg-gray-800 border-gray-600 text-purple-500"
                />
                <div>
                  <span className="text-white font-medium">Force Re-authentication</span>
                  <p className="text-xs text-gray-500">Require users to re-authenticate with provider each time</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-900 rounded-lg">
                <input
                  type="checkbox"
                  checked={localConfig.mfaRequired ?? false}
                  onChange={(e) => setLocalConfig({ ...localConfig, mfaRequired: e.target.checked })}
                  className="w-5 h-5 rounded bg-gray-800 border-gray-600 text-purple-500"
                />
                <div>
                  <span className="text-white font-medium">Require MFA</span>
                  <p className="text-xs text-gray-500">Require multi-factor authentication for this provider</p>
                </div>
              </label>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Session Duration (minutes)</label>
                <input
                  type="number"
                  value={localConfig.sessionDuration || 60}
                  onChange={(e) => setLocalConfig({ ...localConfig, sessionDuration: parseInt(e.target.value) })}
                  min={5}
                  max={10080}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                />
                <p className="text-xs text-gray-500">Custom session duration for users signing in with this provider</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-between">
          <button
            onClick={() => {
              // Test connection logic would go here
              alert('Connection test would be performed here');
            }}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <TestTube className="w-4 h-4" />
            Test Connection
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Configuration
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const AuthProvidersSettings: React.FC = () => {
  const [authSettings, setAuthSettings] = useState<AuthSettings>(defaultAuthSettings);
  const [providerConfigs, setProviderConfigs] = useState<Record<AuthProviderId, Partial<AuthProvider>>>({} as any);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AuthProviderCategory | 'all'>('all');
  const [configuringProvider, setConfiguringProvider] = useState<AuthProviderId | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Save logic would go here
    setHasChanges(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleProvider = (providerId: AuthProviderId) => {
    setProviderConfigs({
      ...providerConfigs,
      [providerId]: {
        ...providerConfigs[providerId],
        enabled: !providerConfigs[providerId]?.enabled,
      },
    });
    setHasChanges(true);
  };

  const saveProviderConfig = (providerId: AuthProviderId, config: Partial<AuthProvider>) => {
    setProviderConfigs({
      ...providerConfigs,
      [providerId]: config,
    });
    setHasChanges(true);
  };

  // Filter providers
  const filteredProviders = Object.keys(AUTH_PROVIDERS).filter((id) => {
    const provider = AUTH_PROVIDERS[id as AuthProviderId];
    const matchesSearch =
      searchQuery === '' ||
      provider.branding.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.branding.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || provider.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) as AuthProviderId[];

  // Group by category
  const providersByCategory = filteredProviders.reduce((acc, id) => {
    const category = AUTH_PROVIDERS[id].category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(id);
    return acc;
  }, {} as Record<AuthProviderCategory, AuthProviderId[]>);

  const enabledCount = Object.values(providerConfigs).filter((c) => c.enabled).length;

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-purple-400" />
              Authentication Providers
            </h1>
            <p className="text-gray-400 mt-1">
              Configure SSO, OAuth, and social login providers ({enabledCount} enabled)
            </p>
          </div>

          {hasChanges && (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          )}

          {saved && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="px-4 py-2 bg-green-600/20 text-green-400 rounded-lg flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Settings saved
            </motion.div>
          )}
        </div>

        {/* General Auth Settings */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">General Authentication Settings</h2>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={authSettings.allowLocalLogin}
                onChange={(e) => {
                  setAuthSettings({ ...authSettings, allowLocalLogin: e.target.checked });
                  setHasChanges(true);
                }}
                className="w-5 h-5 rounded bg-gray-900 border-gray-700 text-purple-500"
              />
              <div>
                <span className="text-white">Allow Local Login</span>
                <p className="text-xs text-gray-500">Enable username/password login</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={authSettings.allowRegistration}
                onChange={(e) => {
                  setAuthSettings({ ...authSettings, allowRegistration: e.target.checked });
                  setHasChanges(true);
                }}
                className="w-5 h-5 rounded bg-gray-900 border-gray-700 text-purple-500"
              />
              <div>
                <span className="text-white">Allow Registration</span>
                <p className="text-xs text-gray-500">Allow new users to register</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={authSettings.showProviderButtons}
                onChange={(e) => {
                  setAuthSettings({ ...authSettings, showProviderButtons: e.target.checked });
                  setHasChanges(true);
                }}
                className="w-5 h-5 rounded bg-gray-900 border-gray-700 text-purple-500"
              />
              <div>
                <span className="text-white">Show SSO Buttons</span>
                <p className="text-xs text-gray-500">Display provider buttons on login page</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={authSettings.requireMfa}
                onChange={(e) => {
                  setAuthSettings({ ...authSettings, requireMfa: e.target.checked });
                  setHasChanges(true);
                }}
                className="w-5 h-5 rounded bg-gray-900 border-gray-700 text-purple-500"
              />
              <div>
                <span className="text-white">Require MFA</span>
                <p className="text-xs text-gray-500">Require multi-factor authentication</p>
              </div>
            </label>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Session Timeout (min)</label>
              <input
                type="number"
                value={authSettings.sessionTimeout}
                onChange={(e) => {
                  setAuthSettings({ ...authSettings, sessionTimeout: parseInt(e.target.value) });
                  setHasChanges(true);
                }}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Max Login Attempts</label>
              <input
                type="number"
                value={authSettings.maxLoginAttempts}
                onChange={(e) => {
                  setAuthSettings({ ...authSettings, maxLoginAttempts: parseInt(e.target.value) });
                  setHasChanges(true);
                }}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Lockout Duration (min)</label>
              <input
                type="number"
                value={authSettings.lockoutDuration}
                onChange={(e) => {
                  setAuthSettings({ ...authSettings, lockoutDuration: parseInt(e.target.value) });
                  setHasChanges(true);
                }}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
              />
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search providers..."
              className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              All
            </button>
            {(Object.keys(AUTH_CATEGORIES) as AuthProviderCategory[]).map((cat) => {
              const Icon = categoryIcons[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    selectedCategory === cat
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {AUTH_CATEGORIES[cat].label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Provider List by Category */}
        {Object.entries(providersByCategory).map(([category, providers]) => (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-3">
              {React.createElement(categoryIcons[category as AuthProviderCategory], {
                className: 'w-5 h-5 text-purple-400',
              })}
              <h2 className="text-lg font-semibold text-white">
                {AUTH_CATEGORIES[category as AuthProviderCategory].label}
              </h2>
              <span className="text-sm text-gray-500">({providers.length})</span>
            </div>
            <p className="text-sm text-gray-400">
              {AUTH_CATEGORIES[category as AuthProviderCategory].description}
            </p>
            <div className="grid grid-cols-2 gap-4">
              {providers.map((providerId) => (
                <ProviderCard
                  key={providerId}
                  providerId={providerId}
                  isEnabled={providerConfigs[providerId]?.enabled ?? false}
                  isConfigured={!!(providerConfigs[providerId]?.oauthConfig?.clientId)}
                  onToggle={() => toggleProvider(providerId)}
                  onConfigure={() => setConfiguringProvider(providerId)}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Empty state */}
        {filteredProviders.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No providers found matching your search.</p>
          </div>
        )}
      </div>

      {/* Configuration Modal */}
      <AnimatePresence>
        {configuringProvider && (
          <ProviderConfigModal
            providerId={configuringProvider}
            config={providerConfigs[configuringProvider] || null}
            onSave={(config) => saveProviderConfig(configuringProvider, config)}
            onClose={() => setConfiguringProvider(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthProvidersSettings;
