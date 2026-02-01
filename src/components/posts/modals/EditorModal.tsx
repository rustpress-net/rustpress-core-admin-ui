/**
 * EditorModal - Enterprise Modal Component
 *
 * Reusable modal component with tabs, sections, and professional UI
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Maximize2,
  Minimize2,
  Pin,
  PinOff,
  ChevronDown,
  ChevronRight,
  Search,
  Settings,
  HelpCircle,
  RotateCcw,
  Save,
  Check,
  AlertCircle,
  Info,
  Keyboard,
} from 'lucide-react';
import clsx from 'clsx';

export interface ModalTab {
  id: string;
  label: string;
  icon?: React.ElementType;
  badge?: string | number;
  disabled?: boolean;
}

export interface ModalSection {
  id: string;
  title: string;
  description?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

interface EditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  iconColor?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  tabs?: ModalTab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  showHelp?: boolean;
  helpContent?: React.ReactNode;
  showReset?: boolean;
  onReset?: () => void;
  showSave?: boolean;
  onSave?: () => void;
  saveLabel?: string;
  isPinnable?: boolean;
  className?: string;
  headerActions?: React.ReactNode;
  sidebarContent?: React.ReactNode;
  sidebarWidth?: number;
  hideTabs?: boolean;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  full: 'max-w-[95vw]',
};

export const EditorModal: React.FC<EditorModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  iconColor = 'blue',
  size = 'lg',
  tabs,
  activeTab,
  onTabChange,
  children,
  footer,
  showSearch,
  searchPlaceholder = 'Search...',
  onSearch,
  showHelp,
  helpContent,
  showReset,
  onReset,
  showSave,
  onSave,
  saveLabel = 'Apply',
  isPinnable,
  className,
  headerActions,
  sidebarContent,
  sidebarWidth = 240,
  hideTabs = false,
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showHelpPanel, setShowHelpPanel] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPinned) {
        onClose();
      }
      if (e.key === '?' && e.shiftKey) {
        setShowKeyboardShortcuts(true);
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
  }, [isOpen, isPinned, onClose]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  }, [onSearch]);

  if (!isOpen) return null;

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
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => !isPinned && onClose()}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={clsx(
            'relative w-full bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden flex flex-col',
            isMaximized ? 'fixed inset-4 max-w-none max-h-none' : [sizeClasses[size], 'max-h-[90vh]'],
            className
          )}
        >
          {/* Header */}
          <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
            {/* Main Header */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                {Icon && (
                  <div className={clsx(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    `bg-${iconColor}-100 dark:bg-${iconColor}-900/30`
                  )}>
                    <Icon className={`w-5 h-5 text-${iconColor}-600 dark:text-${iconColor}-400`} />
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
                  {subtitle && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {headerActions}

                {showSearch && (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder={searchPlaceholder}
                      className="pl-9 pr-4 py-2 w-64 text-sm bg-gray-100 dark:bg-gray-800 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                    />
                  </div>
                )}

                {showHelp && (
                  <button
                    onClick={() => setShowHelpPanel(!showHelpPanel)}
                    className={clsx(
                      'p-2 rounded-lg transition-colors',
                      showHelpPanel
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                    title="Help"
                  >
                    <HelpCircle className="w-5 h-5" />
                  </button>
                )}

                {isPinnable && (
                  <button
                    onClick={() => setIsPinned(!isPinned)}
                    className={clsx(
                      'p-2 rounded-lg transition-colors',
                      isPinned
                        ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                    title={isPinned ? 'Unpin' : 'Pin'}
                  >
                    {isPinned ? <PinOff className="w-5 h-5" /> : <Pin className="w-5 h-5" />}
                  </button>
                )}

                <button
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title={isMaximized ? 'Restore' : 'Maximize'}
                >
                  {isMaximized ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>

                <button
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            {tabs && tabs.length > 0 && !hideTabs && (
              <div className="flex px-6 -mb-px overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange?.(tab.id)}
                    disabled={tab.disabled}
                    className={clsx(
                      'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
                      tab.disabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {tab.icon && <tab.icon className="w-4 h-4" />}
                    {tab.label}
                    {tab.badge !== undefined && (
                      <span className={clsx(
                        'px-2 py-0.5 text-xs rounded-full',
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      )}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex">
            {/* Sidebar */}
            {sidebarContent && (
              <div
                className="flex-shrink-0 border-r border-gray-200 dark:border-gray-700 overflow-y-auto"
                style={{ width: sidebarWidth }}
              >
                {sidebarContent}
              </div>
            )}

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>

            {/* Help Panel */}
            <AnimatePresence>
              {showHelpPanel && helpContent && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 320, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="flex-shrink-0 border-l border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <div className="w-80 p-4 overflow-y-auto h-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900 dark:text-white">Help</h3>
                      <button
                        onClick={() => setShowHelpPanel(false)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {helpContent}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          {(footer || showReset || showSave) && (
            <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {showReset && (
                    <button
                      onClick={onReset}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset to Defaults
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {footer}

                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  >
                    Cancel
                  </button>

                  {showSave && (
                    <button
                      onClick={onSave}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      {saveLabel}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Collapsible Section Component
export const ModalSection: React.FC<ModalSection> = ({
  id,
  title,
  description,
  collapsible = true,
  defaultExpanded = true,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-4">
      <button
        onClick={() => collapsible && setIsExpanded(!isExpanded)}
        className={clsx(
          'w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50 text-left',
          collapsible && 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800'
        )}
      >
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h4>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
          )}
        </div>
        {collapsible && (
          <ChevronDown
            className={clsx(
              'w-5 h-5 text-gray-400 transition-transform',
              isExpanded && 'rotate-180'
            )}
          />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Form Field Components
export const FormField: React.FC<{
  label: string;
  description?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}> = ({ label, description, required, error, children }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {description && (
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{description}</p>
    )}
    {children}
    {error && (
      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        {error}
      </p>
    )}
  </div>
);

export const FormRow: React.FC<{
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
}> = ({ children, columns = 2 }) => (
  <div className={clsx(
    'grid gap-4',
    columns === 2 && 'grid-cols-2',
    columns === 3 && 'grid-cols-3',
    columns === 4 && 'grid-cols-4'
  )}>
    {children}
  </div>
);

// Toggle Switch Component
export const Toggle: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}> = ({ checked, onChange, label, description, disabled }) => (
  <label className={clsx(
    'flex items-start gap-3 cursor-pointer',
    disabled && 'opacity-50 cursor-not-allowed'
  )}>
    <div className="relative flex-shrink-0 mt-0.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        className="sr-only"
      />
      <div className={clsx(
        'w-10 h-6 rounded-full transition-colors',
        checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
      )}>
        <div className={clsx(
          'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-1'
        )} />
      </div>
    </div>
    {(label || description) && (
      <div className="flex-1">
        {label && <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</div>}
        {description && <div className="text-xs text-gray-500 dark:text-gray-400">{description}</div>}
      </div>
    )}
  </label>
);

// Select Component
export const Select: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; description?: string }[];
  placeholder?: string;
  disabled?: boolean;
}> = ({ value, onChange, options, placeholder, disabled }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
    className={clsx(
      'w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg',
      'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
      disabled && 'opacity-50 cursor-not-allowed'
    )}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

// Input Component
export const Input: React.FC<{
  value: string | number;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'email' | 'url' | 'password';
  placeholder?: string;
  disabled?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  min?: number;
  max?: number;
  step?: number;
}> = ({ value, onChange, type = 'text', placeholder, disabled, prefix, suffix, min, max, step }) => (
  <div className="relative flex items-center">
    {prefix && (
      <span className="absolute left-3 text-gray-400 pointer-events-none">{prefix}</span>
    )}
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      min={min}
      max={max}
      step={step}
      className={clsx(
        'w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg',
        'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        prefix && 'pl-9',
        suffix && 'pr-9',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    />
    {suffix && (
      <span className="absolute right-3 text-gray-400 pointer-events-none">{suffix}</span>
    )}
  </div>
);

// Textarea Component
export const Textarea: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
  showCount?: boolean;
}> = ({ value, onChange, placeholder, disabled, rows = 4, maxLength, showCount }) => (
  <div className="relative">
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      maxLength={maxLength}
      className={clsx(
        'w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg resize-none',
        'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    />
    {showCount && maxLength && (
      <div className="absolute bottom-2 right-2 text-xs text-gray-400">
        {value.length}/{maxLength}
      </div>
    )}
  </div>
);

// Badge Component
export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}> = ({ children, variant = 'default' }) => (
  <span className={clsx(
    'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full',
    variant === 'default' && 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    variant === 'success' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    variant === 'warning' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    variant === 'error' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    variant === 'info' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
  )}>
    {children}
  </span>
);

// Info Box Component
export const InfoBox: React.FC<{
  children: React.ReactNode;
  variant?: 'info' | 'warning' | 'success' | 'error';
  icon?: React.ElementType;
}> = ({ children, variant = 'info', icon: CustomIcon }) => {
  const IconComponent = CustomIcon || Info;

  return (
    <div className={clsx(
      'flex gap-3 p-4 rounded-lg',
      variant === 'info' && 'bg-blue-50 dark:bg-blue-900/20',
      variant === 'warning' && 'bg-amber-50 dark:bg-amber-900/20',
      variant === 'success' && 'bg-green-50 dark:bg-green-900/20',
      variant === 'error' && 'bg-red-50 dark:bg-red-900/20'
    )}>
      <IconComponent className={clsx(
        'w-5 h-5 flex-shrink-0 mt-0.5',
        variant === 'info' && 'text-blue-600 dark:text-blue-400',
        variant === 'warning' && 'text-amber-600 dark:text-amber-400',
        variant === 'success' && 'text-green-600 dark:text-green-400',
        variant === 'error' && 'text-red-600 dark:text-red-400'
      )} />
      <div className={clsx(
        'text-sm',
        variant === 'info' && 'text-blue-800 dark:text-blue-300',
        variant === 'warning' && 'text-amber-800 dark:text-amber-300',
        variant === 'success' && 'text-green-800 dark:text-green-300',
        variant === 'error' && 'text-red-800 dark:text-red-300'
      )}>
        {children}
      </div>
    </div>
  );
};

export default EditorModal;
