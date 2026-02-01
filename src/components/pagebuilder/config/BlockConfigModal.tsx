/**
 * BlockConfigModal - Block Configuration Modal
 *
 * Main modal wrapper for block-specific configuration wizards.
 * Supports editor-only, preview-only, or split view modes.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Maximize2,
  Minimize2,
  ChevronDown,
  Settings,
  HelpCircle,
  RotateCcw,
  Check,
  Eye,
  EyeOff,
  Sliders,
  Palette,
  Zap,
  PanelLeft,
  PanelRight,
  Columns,
  Play,
  Star,
  Download,
  ExternalLink,
  Music,
  File,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
} from 'lucide-react';
import clsx from 'clsx';
import { getConfigComponent, hasConfigComponent, getBlockInfo } from './BlockConfigRegistry';

export interface BlockSettings {
  [key: string]: any;
}

export interface Block {
  id: string;
  type: string;
  settings: BlockSettings;
  children?: Block[];
}

export interface BlockConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  block: Block | null;
  onSave: (settings: BlockSettings) => void;
}

export interface ConfigComponentProps {
  settings: BlockSettings;
  onChange: (settings: BlockSettings) => void;
  blockType: string;
}

type ConfigTab = 'content' | 'behavior' | 'style';
type ViewMode = 'editor' | 'preview' | 'split';

const BlockConfigModal: React.FC<BlockConfigModalProps> = ({
  isOpen,
  onClose,
  block,
  onSave,
}) => {
  const [isMaximized, setIsMaximized] = useState(true);
  const [activeTab, setActiveTab] = useState<ConfigTab>('content');
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [localSettings, setLocalSettings] = useState<BlockSettings>({});
  const [showHelp, setShowHelp] = useState(false);

  // Initialize local settings when block changes
  useEffect(() => {
    if (block) {
      setLocalSettings({ ...block.settings });
      setActiveTab('content');
    }
  }, [block]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleSettingsChange = useCallback((updates: Partial<BlockSettings>) => {
    setLocalSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const handleReset = useCallback(() => {
    if (block) {
      setLocalSettings({ ...block.settings });
    }
  }, [block]);

  const handleSave = useCallback(() => {
    onSave(localSettings);
    onClose();
  }, [localSettings, onSave, onClose]);

  const blockInfo = useMemo(() => {
    return block ? getBlockInfo(block.type) : null;
  }, [block]);

  const ConfigComponent = useMemo(() => {
    return block ? getConfigComponent(block.type) : null;
  }, [block]);

  if (!isOpen || !block) return null;

  const tabs: { id: ConfigTab; label: string; icon: React.ElementType }[] = [
    { id: 'content', label: 'Content', icon: Settings },
    { id: 'behavior', label: 'Behavior', icon: Zap },
    { id: 'style', label: 'Style', icon: Palette },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={clsx(
            'relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden flex flex-col',
            isMaximized ? 'fixed inset-4 max-w-none max-h-none' : 'w-full max-w-6xl max-h-[90vh]'
          )}
        >
          {/* Header */}
          <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                {blockInfo?.icon && (
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-100 dark:bg-blue-900/30">
                    <blockInfo.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    Configure {blockInfo?.name || block.type}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {blockInfo?.description || `Configure ${block.type} block settings`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg p-0.5 mr-2">
                  <button
                    onClick={() => setViewMode('editor')}
                    className={clsx(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                      viewMode === 'editor'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    )}
                    title="Editor Only"
                  >
                    <PanelLeft className="w-3.5 h-3.5" />
                    Editor
                  </button>
                  <button
                    onClick={() => setViewMode('split')}
                    className={clsx(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                      viewMode === 'split'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    )}
                    title="Split View"
                  >
                    <Columns className="w-3.5 h-3.5" />
                    Split
                  </button>
                  <button
                    onClick={() => setViewMode('preview')}
                    className={clsx(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                      viewMode === 'preview'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    )}
                    title="Preview Only"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                  </button>
                </div>

                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className={clsx(
                    'p-2 rounded-lg transition-colors',
                    showHelp
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                  title="Help"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title={isMaximized ? 'Restore' : 'Maximize'}
                >
                  {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabs - Only show when editor is visible */}
            {viewMode !== 'preview' && (
              <div className="flex px-4 -mb-px overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={clsx(
                      'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex">
            {/* Editor Panel */}
            {viewMode !== 'preview' && (
              <div className={clsx(
                'overflow-y-auto p-6 bg-white dark:bg-gray-900',
                viewMode === 'split' ? 'w-1/2 border-r border-gray-200 dark:border-gray-700' : 'flex-1'
              )}>
                {ConfigComponent ? (
                  <ConfigComponent
                    settings={localSettings}
                    onChange={handleSettingsChange}
                    blockType={block.type}
                    activeTab={activeTab}
                  />
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Sliders className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">No configuration wizard available</p>
                    <p className="text-sm mt-1">This block type uses default settings</p>
                  </div>
                )}
              </div>
            )}

            {/* Preview Panel */}
            {viewMode !== 'editor' && (
              <div className={clsx(
                'overflow-y-auto bg-gray-100 dark:bg-gray-800',
                viewMode === 'split' ? 'w-1/2' : 'flex-1'
              )}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Live Preview
                  </h3>
                </div>
                <div className="p-6">
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 min-h-[200px]">
                    <BlockPreview block={{ ...block, settings: localSettings }} />
                  </div>
                </div>
              </div>
            )}

            {/* Help Panel */}
            <AnimatePresence>
              {showHelp && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 280, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="flex-shrink-0 border-l border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800/50"
                >
                  <div className="w-[280px] p-4 overflow-y-auto h-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900 dark:text-white">Help</h3>
                      <button
                        onClick={() => setShowHelp(false)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">About this block</h4>
                        <p>{blockInfo?.description || 'Configure the settings for this block.'}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">Tips</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>Changes are previewed in real-time</li>
                          <li>Use Split view to see editor and preview</li>
                          <li>Click Reset to restore original settings</li>
                          <li>Press Escape to cancel changes</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">Keyboard shortcuts</h4>
                        <ul className="space-y-1 text-xs">
                          <li><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Esc</kbd> Close modal</li>
                          <li><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Ctrl+S</kbd> Save changes</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Check className="w-4 h-4" />
                  Apply Changes
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Enhanced block preview component with better rendering
const BlockPreview: React.FC<{ block: Block }> = ({ block }) => {
  const { settings } = block;

  const renderPreview = () => {
    switch (block.type) {
      // Text/Content blocks
      case 'paragraph':
      case 'text':
        return (
          <p
            style={{
              fontSize: settings.fontSize || '16px',
              lineHeight: settings.lineHeight || '1.6',
              color: settings.color || '#374151',
              textAlign: settings.textAlign as any,
            }}
            className={settings.dropCap ? 'first-letter:text-4xl first-letter:font-bold first-letter:float-left first-letter:mr-2' : ''}
          >
            {settings.text || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'}
          </p>
        );

      case 'heading':
      case 'subheading':
        const HeadingTag = `h${settings.level || 2}` as keyof JSX.IntrinsicElements;
        const headingSizes: Record<number, string> = { 1: '2.5rem', 2: '2rem', 3: '1.75rem', 4: '1.5rem', 5: '1.25rem', 6: '1rem' };
        return (
          <HeadingTag
            style={{
              fontSize: headingSizes[settings.level || 2],
              fontWeight: settings.fontWeight || '700',
              color: settings.color || '#111827',
              textAlign: settings.textAlign as any,
              textTransform: settings.uppercase ? 'uppercase' : 'none',
            }}
          >
            {settings.text || 'Heading Text'}
          </HeadingTag>
        );

      case 'quote':
      case 'blockquote':
        return (
          <blockquote
            className={clsx(
              'relative',
              settings.quoteStyle === 'bordered' && 'border-l-4 pl-4',
              settings.quoteStyle === 'large' && 'text-center',
            )}
            style={{
              borderColor: settings.accentColor || '#3b82f6',
              fontSize: settings.fontSize || '18px',
              fontStyle: settings.italic !== false ? 'italic' : 'normal',
            }}
          >
            <span className="text-4xl text-gray-300 absolute -top-2 -left-1">"</span>
            <p className="text-gray-600 dark:text-gray-400 relative z-10 pl-4">
              {settings.text || 'This is a quote that stands out from the rest of the content.'}
            </p>
            {settings.citation && (
              <cite className="block mt-2 text-sm text-gray-500 not-italic">
                — {settings.citation}
              </cite>
            )}
          </blockquote>
        );

      case 'list':
        const ListTag = settings.listType === 'ordered' ? 'ol' : 'ul';
        const items = settings.items || ['First item', 'Second item', 'Third item'];
        return (
          <ListTag
            className={clsx(
              'space-y-1',
              settings.listType === 'ordered' ? 'list-decimal' : 'list-disc',
              'list-inside'
            )}
            style={{ color: settings.color || '#374151' }}
          >
            {items.map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </ListTag>
        );

      // Media blocks
      case 'image':
        return (
          <div className={clsx('relative', settings.alignment && `text-${settings.alignment}`)}>
            {settings.src ? (
              <img
                src={settings.src}
                alt={settings.alt || ''}
                className={clsx(
                  'max-w-full',
                  settings.shadow && 'shadow-lg',
                )}
                style={{
                  borderRadius: settings.borderRadius || '0',
                  width: settings.width || 'auto',
                }}
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="w-12 h-12 mx-auto mb-2 opacity-50 border-2 border-dashed border-current rounded-lg flex items-center justify-center">
                    <span className="text-2xl">+</span>
                  </div>
                  <p className="text-sm">No image selected</p>
                </div>
              </div>
            )}
            {settings.caption && (
              <p className="mt-2 text-sm text-gray-500 text-center">{settings.caption}</p>
            )}
          </div>
        );

      case 'video':
        return (
          <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
            {settings.src ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <div className="text-center text-white">
                  <div className="w-16 h-16 mx-auto mb-2 bg-white/20 rounded-full flex items-center justify-center">
                    <Play className="w-8 h-8 ml-1" />
                  </div>
                  <p className="text-sm opacity-80">Video ready to play</p>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Play className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No video source</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'audio':
        return (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-4">
              {settings.cover ? (
                <img src={settings.cover} alt="" className="w-16 h-16 rounded object-cover" />
              ) : (
                <div className="w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded flex items-center justify-center">
                  <Music className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{settings.title || 'Audio Track'}</p>
                {settings.artist && <p className="text-sm text-gray-500">{settings.artist}</p>}
                <div className="mt-2 h-1 bg-gray-300 dark:bg-gray-600 rounded-full">
                  <div className="w-1/3 h-full bg-blue-500 rounded-full" />
                </div>
              </div>
              <button className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                <Play className="w-5 h-5 ml-0.5" />
              </button>
            </div>
          </div>
        );

      case 'file':
        return (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <File className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">{settings.fileName || 'Document.pdf'}</p>
              {settings.fileSize && <p className="text-sm text-gray-500">{settings.fileSize}</p>}
              {settings.description && <p className="text-sm text-gray-500 mt-1">{settings.description}</p>}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
              <Download className="w-4 h-4" />
              {settings.buttonText || 'Download'}
            </button>
          </div>
        );

      case 'embed':
        return (
          <div
            className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"
            style={{ aspectRatio: settings.aspectRatio?.replace(':', '/') || '16/9' }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-gray-400">
                <ExternalLink className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">{settings.embedType || 'Embed'} Content</p>
                {settings.url && <p className="text-xs mt-1 opacity-75 truncate max-w-xs">{settings.url}</p>}
              </div>
            </div>
          </div>
        );

      // Interactive blocks
      case 'button':
        const buttonPaddings: Record<string, string> = { sm: '8px 16px', md: '10px 20px', lg: '12px 24px', xl: '14px 28px' };
        return (
          <div className={settings.fullWidth ? 'w-full' : 'inline-block'}>
            <button
              className={clsx(
                'font-medium transition-colors',
                settings.fullWidth && 'w-full',
                settings.variant === 'outline' && 'bg-transparent border-2',
                settings.variant === 'ghost' && 'bg-transparent hover:bg-gray-100',
                settings.variant === 'link' && 'bg-transparent underline p-0',
              )}
              style={{
                backgroundColor: settings.variant === 'solid' || !settings.variant ? (settings.backgroundColor || '#3b82f6') : 'transparent',
                color: settings.variant === 'solid' || !settings.variant ? (settings.color || '#ffffff') : (settings.backgroundColor || '#3b82f6'),
                borderColor: settings.variant === 'outline' ? (settings.backgroundColor || '#3b82f6') : 'transparent',
                padding: settings.variant !== 'link' ? (buttonPaddings[settings.size || 'md']) : '0',
                borderRadius: settings.borderRadius || '8px',
              }}
            >
              {settings.text || 'Click me'}
            </button>
          </div>
        );

      case 'alert':
      case 'notice':
        const alertColors: Record<string, { bg: string; border: string; icon: React.ElementType }> = {
          info: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', icon: Info },
          success: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', icon: CheckCircle },
          warning: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', icon: AlertTriangle },
          error: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', icon: AlertCircle },
          neutral: { bg: 'bg-gray-50 dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700', icon: AlertCircle },
        };
        const alertStyle = alertColors[settings.alertType || 'info'];
        const AlertIcon = alertStyle.icon;
        return (
          <div className={clsx('rounded-lg border p-4', alertStyle.bg, alertStyle.border)}>
            <div className="flex gap-3">
              {settings.showIcon !== false && <AlertIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />}
              <div>
                {settings.title && <p className="font-medium mb-1">{settings.title}</p>}
                <p className="text-sm">{settings.text || 'This is an alert message.'}</p>
              </div>
            </div>
          </div>
        );

      // Layout blocks
      case 'divider':
        return (
          <div className={clsx('flex', settings.alignment === 'center' && 'justify-center', settings.alignment === 'right' && 'justify-end')}>
            <hr
              style={{
                width: settings.width || '100%',
                borderWidth: settings.borderWidth || '1px',
                borderStyle: settings.borderStyle || 'solid',
                borderColor: settings.borderColor || '#e5e7eb',
                margin: `${settings.marginTop || '20px'} 0 ${settings.marginBottom || '20px'} 0`,
              }}
            />
          </div>
        );

      case 'spacer':
        const height = parseInt(settings.height) || 40;
        return (
          <div
            className="bg-blue-100/50 dark:bg-blue-900/20 border border-dashed border-blue-300 dark:border-blue-700 rounded flex items-center justify-center"
            style={{ height: `${Math.min(height, 150)}px` }}
          >
            <span className="text-xs text-blue-500 font-medium">{height}px spacer</span>
          </div>
        );

      // Form block
      case 'form':
        return (
          <div className="space-y-4">
            {(settings.formFields || []).slice(0, 4).map((field: any, idx: number) => (
              <div key={idx}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    rows={3}
                  />
                ) : field.type === 'select' ? (
                  <select className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                    <option>{field.placeholder || 'Select...'}</option>
                  </select>
                ) : (
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  />
                )}
              </div>
            ))}
            {(settings.formFields?.length || 0) > 4 && (
              <p className="text-sm text-gray-500">+ {settings.formFields.length - 4} more fields</p>
            )}
            <button
              className="w-full px-4 py-2 text-sm font-medium text-white rounded-lg"
              style={{ backgroundColor: settings.submitButtonColor || '#3b82f6' }}
            >
              {settings.submitButtonText || 'Submit'}
            </button>
          </div>
        );

      case 'gallery':
        const images = settings.images || [];
        const cols = settings.columns || 3;
        return (
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(cols, 4)}, 1fr)` }}>
            {images.length > 0 ? (
              images.slice(0, 8).map((img: any, idx: number) => (
                <div key={idx} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                </div>
              ))
            ) : (
              Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg" />
              ))
            )}
          </div>
        );

      case 'carousel':
        const slides = settings.slides || [];
        return (
          <div className="relative">
            <div className="aspect-[16/9] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
              {slides.length > 0 && slides[0].image ? (
                <img src={slides[0].image} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Play className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Slide 1 of {Math.max(slides.length, 3)}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-center gap-2 mt-3">
              {(slides.length > 0 ? slides : [1, 2, 3]).slice(0, 5).map((_: any, idx: number) => (
                <div
                  key={idx}
                  className={clsx(
                    'w-2.5 h-2.5 rounded-full transition-colors',
                    idx === 0 ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                  )}
                />
              ))}
            </div>
          </div>
        );

      case 'accordion':
        const accItems = settings.items || [{ title: 'Accordion Item', content: 'Content here' }];
        return (
          <div className="space-y-2">
            {accItems.slice(0, 4).map((item: any, idx: number) => (
              <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 cursor-pointer">
                  <span className="font-medium text-sm">{item.title}</span>
                  <ChevronDown className={clsx('w-4 h-4 transition-transform', idx === 0 && 'rotate-180')} />
                </div>
                {idx === 0 && (
                  <div className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
                    {item.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case 'tabs':
        const tabItems = settings.tabs || [{ title: 'Tab 1', content: 'Tab content' }];
        return (
          <div>
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {tabItems.slice(0, 4).map((tab: any, idx: number) => (
                <div
                  key={idx}
                  className={clsx(
                    'px-4 py-2.5 text-sm font-medium cursor-pointer border-b-2 -mb-px',
                    idx === 0
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  )}
                >
                  {tab.title}
                </div>
              ))}
            </div>
            <div className="p-4 text-sm text-gray-600 dark:text-gray-400">
              {tabItems[0]?.content || 'Tab content goes here'}
            </div>
          </div>
        );

      case 'pricing':
        return (
          <div className={clsx(
            'p-6 rounded-xl border-2 text-center',
            settings.isFeatured
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
              : 'border-gray-200 dark:border-gray-700'
          )}>
            {settings.isFeatured && settings.badgeText && (
              <div className="inline-block px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full mb-3">
                {settings.badgeText}
              </div>
            )}
            <h3 className="text-lg font-semibold">{settings.title || 'Basic Plan'}</h3>
            <div className="my-4">
              <span className="text-3xl font-bold">{settings.price || '$9.99'}</span>
              <span className="text-gray-500">{settings.period || '/month'}</span>
            </div>
            <ul className="text-sm space-y-2 mb-6">
              {(settings.features || ['Feature 1', 'Feature 2', 'Feature 3']).slice(0, 5).map((f: any, idx: number) => (
                <li key={idx} className={clsx(
                  'flex items-center justify-center gap-2',
                  typeof f === 'object' && !f.included && 'text-gray-400 line-through'
                )}>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {typeof f === 'object' ? f.text : f}
                </li>
              ))}
            </ul>
            <button className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg">
              Get Started
            </button>
          </div>
        );

      case 'testimonial':
        return (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
            <div className="flex gap-1 mb-4">
              {Array.from({ length: settings.rating || 5 }).map((_, idx) => (
                <Star key={idx} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <p className="text-gray-600 dark:text-gray-400 italic mb-4">
              "{settings.quote || 'This is an amazing product! I highly recommend it to everyone.'}"
            </p>
            <div className="flex items-center gap-3">
              {settings.avatar ? (
                <img src={settings.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full" />
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{settings.author || 'John Doe'}</p>
                {settings.role && <p className="text-sm text-gray-500">{settings.role}</p>}
              </div>
            </div>
          </div>
        );

      case 'countdown':
        const units = [
          { label: 'Days', show: settings.showDays !== false },
          { label: 'Hours', show: settings.showHours !== false },
          { label: 'Minutes', show: settings.showMinutes !== false },
          { label: 'Seconds', show: settings.showSeconds !== false },
        ].filter(u => u.show);
        return (
          <div className="flex justify-center gap-4">
            {units.map((unit) => (
              <div key={unit.label} className="text-center">
                <div className="w-16 h-16 bg-gray-900 dark:bg-gray-700 text-white rounded-lg flex items-center justify-center text-2xl font-bold">
                  00
                </div>
                <div className="text-xs text-gray-500 mt-2">{unit.label}</div>
              </div>
            ))}
          </div>
        );

      case 'progress':
        const progressValue = settings.value || 75;
        return (
          <div>
            {settings.showLabel !== false && (
              <div className="flex justify-between mb-2 text-sm">
                <span className="font-medium">{settings.label || 'Progress'}</span>
                <span className="text-gray-500">{progressValue}%</span>
              </div>
            )}
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${progressValue}%`,
                  backgroundColor: settings.color || '#3b82f6',
                }}
              />
            </div>
          </div>
        );

      case 'counter':
        return (
          <div className="text-center">
            <div
              className="text-4xl font-bold"
              style={{ color: settings.color || '#3b82f6' }}
            >
              {settings.prefix || ''}{settings.endValue || 1000}{settings.suffix || ''}
            </div>
            {settings.label && (
              <p className="text-gray-500 mt-2">{settings.label}</p>
            )}
          </div>
        );

      case 'table':
        const tableRows = settings.rows || 4;
        const tableCols = settings.columns || 4;
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  {Array.from({ length: tableCols }).map((_, idx) => (
                    <th key={idx} className="border border-gray-200 dark:border-gray-700 px-3 py-2 bg-gray-50 dark:bg-gray-800 text-left font-medium">
                      Header {idx + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: tableRows - 1 }).map((_, rowIdx) => (
                  <tr key={rowIdx}>
                    {Array.from({ length: tableCols }).map((_, colIdx) => (
                      <td key={colIdx} className="border border-gray-200 dark:border-gray-700 px-3 py-2">
                        Cell {rowIdx + 1},{colIdx + 1}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'code':
      case 'code-block':
        return (
          <div className="rounded-lg overflow-hidden">
            {settings.filename && (
              <div className="bg-gray-800 px-4 py-2 text-sm text-gray-400 border-b border-gray-700">
                {settings.filename}
              </div>
            )}
            <pre
              className="p-4 bg-gray-900 text-gray-100 text-sm overflow-x-auto"
              style={{ fontSize: settings.fontSize || '14px' }}
            >
              <code>
                {settings.code || `function hello() {\n  console.log("Hello, World!");\n}`}
              </code>
            </pre>
          </div>
        );

      case 'html':
      case 'custom-html':
        return (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
            <div className="text-center text-gray-500">
              <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">&lt;/&gt;</code>
              <p className="mt-2 text-sm font-medium">Custom HTML Block</p>
              {settings.html && (
                <p className="text-xs mt-1 opacity-75">{settings.html.substring(0, 50)}...</p>
              )}
            </div>
          </div>
        );

      case 'menu':
        const menuItems = settings.items || [{ label: 'Home', url: '/' }, { label: 'About', url: '/about' }];
        return (
          <nav className={clsx(
            'flex gap-6',
            settings.orientation === 'vertical' && 'flex-col gap-2'
          )}>
            {menuItems.slice(0, 5).map((item: any, idx: number) => (
              <a
                key={idx}
                href="#"
                className="text-sm font-medium hover:text-blue-600 transition-colors"
                style={{ color: settings.textColor || '#374151' }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        );

      case 'posts':
        return (
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${settings.columns || 2}, 1fr)` }}>
            {Array.from({ length: Math.min(settings.count || 4, 6) }).map((_, idx) => (
              <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="aspect-video bg-gray-200 dark:bg-gray-700" />
                <div className="p-3">
                  <p className="font-medium text-sm">Post Title {idx + 1}</p>
                  <p className="text-xs text-gray-500 mt-1">Jan 1, 2024</p>
                </div>
              </div>
            ))}
          </div>
        );

      case 'map':
        return (
          <div
            className="bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center"
            style={{ height: settings.height || '300px' }}
          >
            <div className="text-center text-gray-400">
              <div className="w-12 h-12 mx-auto mb-2 bg-red-500 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full" />
              </div>
              <p className="text-sm font-medium">Map Location</p>
              {settings.address && <p className="text-xs mt-1">{settings.address}</p>}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12 text-gray-400">
            <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Preview for {block.type}</p>
            <p className="text-sm mt-1">Configure settings to see changes</p>
          </div>
        );
    }
  };

  return renderPreview();
};

export default BlockConfigModal;
