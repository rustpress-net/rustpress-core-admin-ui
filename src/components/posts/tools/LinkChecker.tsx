import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link2,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Settings,
  Filter,
  Search,
  Eye,
  Edit3,
  Trash2,
  Copy,
  Globe,
  FileText,
  Anchor,
  ArrowUpRight,
  Shield,
  Zap,
  Loader2
} from 'lucide-react';
import clsx from 'clsx';

interface LinkInfo {
  id: string;
  url: string;
  text: string;
  type: 'internal' | 'external' | 'anchor' | 'mailto' | 'tel';
  status: 'valid' | 'broken' | 'redirect' | 'timeout' | 'pending' | 'unknown';
  statusCode?: number;
  redirectUrl?: string;
  responseTime?: number;
  position: number;
  attributes: {
    rel?: string;
    target?: string;
    title?: string;
  };
  issues: LinkIssue[];
  lastChecked?: Date;
}

interface LinkIssue {
  type: 'no-text' | 'generic-text' | 'too-long' | 'no-https' | 'no-rel' | 'orphan' | 'duplicate';
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
}

interface LinkCheckerSettings {
  autoCheck: boolean;
  checkInterval: number;
  timeout: number;
  followRedirects: boolean;
  checkExternal: boolean;
  showPreview: boolean;
  groupByType: boolean;
  showIssuesOnly: boolean;
}

interface LinkCheckerProps {
  content?: string;
  onLinkClick?: (linkId: string) => void;
  onLinkUpdate?: (linkId: string, newUrl: string) => void;
  onLinkRemove?: (linkId: string) => void;
  className?: string;
}

// Export status summary for sidebar display
export interface LinkCheckerStatus {
  total: number;
  valid: number;
  broken: number;
  warnings: number;
  checking: boolean;
}

// Parse links from HTML content
const parseLinksFromContent = (content: string): LinkInfo[] => {
  if (!content) return [];

  const links: LinkInfo[] = [];
  const linkRegex = /<a\s+([^>]*?)href=["']([^"']+)["']([^>]*?)>([^<]*)<\/a>/gi;
  let match;
  let position = 0;

  while ((match = linkRegex.exec(content)) !== null) {
    position++;
    const beforeHref = match[1] || '';
    const url = match[2];
    const afterHref = match[3] || '';
    const text = match[4];
    const allAttrs = beforeHref + afterHref;

    // Parse attributes
    const relMatch = allAttrs.match(/rel=["']([^"']+)["']/);
    const targetMatch = allAttrs.match(/target=["']([^"']+)["']/);
    const titleMatch = allAttrs.match(/title=["']([^"']+)["']/);

    // Determine link type
    let type: LinkInfo['type'] = 'external';
    if (url.startsWith('#')) type = 'anchor';
    else if (url.startsWith('mailto:')) type = 'mailto';
    else if (url.startsWith('tel:')) type = 'tel';
    else if (url.startsWith('/') || url.startsWith('./') || !url.includes('://')) type = 'internal';

    // Check for issues
    const issues: LinkIssue[] = [];

    if (!text.trim()) {
      issues.push({
        type: 'no-text',
        severity: 'error',
        message: 'Link has no anchor text',
        suggestion: 'Add descriptive text between the anchor tags'
      });
    }

    const genericTexts = ['click here', 'here', 'link', 'read more', 'learn more', 'more'];
    if (genericTexts.includes(text.toLowerCase().trim())) {
      issues.push({
        type: 'generic-text',
        severity: 'warning',
        message: `Generic anchor text "${text}" is not descriptive`,
        suggestion: 'Use descriptive anchor text that explains where the link leads'
      });
    }

    if (type === 'external' && url.startsWith('http://')) {
      issues.push({
        type: 'no-https',
        severity: 'error',
        message: 'Link uses insecure HTTP protocol',
        suggestion: 'Update to HTTPS for security'
      });
    }

    if (type === 'external' && !relMatch) {
      issues.push({
        type: 'no-rel',
        severity: 'warning',
        message: 'External link missing rel="noopener noreferrer"',
        suggestion: 'Add rel="noopener noreferrer" for security'
      });
    }

    links.push({
      id: `link-${position}`,
      url,
      text,
      type,
      status: 'pending',
      position,
      attributes: {
        rel: relMatch?.[1],
        target: targetMatch?.[1],
        title: titleMatch?.[1]
      },
      issues
    });
  }

  return links;
};

// Check a single link
const checkLink = async (link: LinkInfo, timeout: number = 10000): Promise<LinkInfo> => {
  // Skip non-http links
  if (link.type === 'anchor' || link.type === 'mailto' || link.type === 'tel') {
    return { ...link, status: 'valid', lastChecked: new Date() };
  }

  try {
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Use HEAD request to check link, fall back to no-cors mode for cross-origin
    const response = await fetch(link.url, {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    // In no-cors mode, we can't read the status, so assume it's valid if no error
    // For same-origin or CORS-enabled URLs, we can read the actual status
    let status: LinkInfo['status'] = 'valid';
    let statusCode: number | undefined;

    if (response.type !== 'opaque') {
      statusCode = response.status;
      if (response.status >= 200 && response.status < 300) {
        status = 'valid';
      } else if (response.status >= 300 && response.status < 400) {
        status = 'redirect';
      } else {
        status = 'broken';
      }
    }

    return {
      ...link,
      status,
      statusCode,
      responseTime,
      lastChecked: new Date()
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return { ...link, status: 'timeout', lastChecked: new Date() };
    }
    // Network errors in no-cors mode might still mean the link exists
    // We'll mark as unknown but not broken since we can't verify
    return { ...link, status: 'unknown', lastChecked: new Date() };
  }
};

export const LinkChecker: React.FC<LinkCheckerProps> = ({
  content,
  onLinkClick,
  onLinkUpdate,
  onLinkRemove,
  className
}) => {
  const [links, setLinks] = useState<LinkInfo[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [checkProgress, setCheckProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedLink, setExpandedLink] = useState<string | null>(null);
  const [settings, setSettings] = useState<LinkCheckerSettings>({
    autoCheck: true,
    checkInterval: 300,
    timeout: 10000,
    followRedirects: true,
    checkExternal: true,
    showPreview: true,
    groupByType: false,
    showIssuesOnly: false
  });

  // Parse links when content changes
  useEffect(() => {
    const parsedLinks = parseLinksFromContent(content || '');
    setLinks(parsedLinks);

    // Auto-check if enabled
    if (settings.autoCheck && parsedLinks.length > 0) {
      handleCheckAll(parsedLinks);
    }
  }, [content]);

  const stats = useMemo(() => {
    return {
      total: links.length,
      valid: links.filter(l => l.status === 'valid').length,
      broken: links.filter(l => l.status === 'broken').length,
      redirects: links.filter(l => l.status === 'redirect').length,
      timeout: links.filter(l => l.status === 'timeout').length,
      pending: links.filter(l => l.status === 'pending').length,
      issues: links.reduce((acc, l) => acc + l.issues.length, 0),
      internal: links.filter(l => l.type === 'internal').length,
      external: links.filter(l => l.type === 'external').length
    };
  }, [links]);

  const filteredLinks = useMemo(() => {
    return links.filter(link => {
      if (searchQuery && !link.url.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !link.text.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (filterType !== 'all' && link.type !== filterType) return false;
      if (filterStatus !== 'all' && link.status !== filterStatus) return false;
      if (settings.showIssuesOnly && link.issues.length === 0) return false;
      return true;
    });
  }, [links, searchQuery, filterType, filterStatus, settings.showIssuesOnly]);

  const handleCheckAll = useCallback(async (linksToCheck?: LinkInfo[]) => {
    const checkList = linksToCheck || links;
    if (checkList.length === 0) return;

    setIsChecking(true);
    setCheckProgress(0);

    const results: LinkInfo[] = [];

    for (let i = 0; i < checkList.length; i++) {
      const link = checkList[i];
      const checkedLink = await checkLink(link, settings.timeout);
      results.push(checkedLink);
      setCheckProgress(Math.round(((i + 1) / checkList.length) * 100));

      // Update state progressively for real-time feedback
      setLinks(prev => prev.map(l => l.id === checkedLink.id ? checkedLink : l));
    }

    setIsChecking(false);
    setCheckProgress(0);
  }, [links, settings.timeout]);

  const handleCheckSingle = useCallback(async (linkId: string) => {
    const link = links.find(l => l.id === linkId);
    if (!link) return;

    setLinks(prev => prev.map(l => l.id === linkId ? { ...l, status: 'pending' } : l));
    const checkedLink = await checkLink(link, settings.timeout);
    setLinks(prev => prev.map(l => l.id === linkId ? checkedLink : l));
  }, [links, settings.timeout]);

  const getStatusIcon = (status: LinkInfo['status']) => {
    switch (status) {
      case 'valid': return <CheckCircle size={16} className="text-green-500" />;
      case 'broken': return <XCircle size={16} className="text-red-500" />;
      case 'redirect': return <ArrowUpRight size={16} className="text-amber-500" />;
      case 'timeout': return <Clock size={16} className="text-orange-500" />;
      case 'pending': return <Loader2 size={16} className="text-blue-500 animate-spin" />;
      default: return <AlertTriangle size={16} className="text-gray-500" />;
    }
  };

  const getTypeIcon = (type: LinkInfo['type']) => {
    switch (type) {
      case 'external': return <ExternalLink size={14} />;
      case 'internal': return <FileText size={14} />;
      case 'anchor': return <Anchor size={14} />;
      case 'mailto': return <Globe size={14} />;
      case 'tel': return <Globe size={14} />;
      default: return <Link2 size={14} />;
    }
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  // Status summary for sidebar - can be exported and used
  const statusSummary: LinkCheckerStatus = {
    total: stats.total,
    valid: stats.valid,
    broken: stats.broken,
    warnings: stats.issues,
    checking: isChecking
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-gray-800 dark:to-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-100 dark:bg-cyan-900 rounded-lg relative">
            <Link2 size={20} className="text-cyan-600 dark:text-cyan-400" />
            {/* Status indicator badges */}
            {stats.broken > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                {stats.broken}
              </span>
            )}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              Link Checker
              {/* Real-time status icons */}
              <span className="flex items-center gap-1 ml-2">
                {stats.valid > 0 && (
                  <span className="flex items-center gap-0.5 text-xs text-green-600 bg-green-100 px-1.5 py-0.5 rounded">
                    <CheckCircle size={12} />
                    {stats.valid}
                  </span>
                )}
                {stats.broken > 0 && (
                  <span className="flex items-center gap-0.5 text-xs text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                    <XCircle size={12} />
                    {stats.broken}
                  </span>
                )}
                {stats.issues > 0 && (
                  <span className="flex items-center gap-0.5 text-xs text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
                    <AlertTriangle size={12} />
                    {stats.issues}
                  </span>
                )}
              </span>
            </h2>
            <p className="text-sm text-gray-500">
              {links.length === 0 ? 'No links found in content' : `${links.length} links found`}
              {isChecking && ` - Checking ${checkProgress}%`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleCheckAll()}
            disabled={isChecking || links.length === 0}
            className="px-3 py-1.5 text-sm bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 flex items-center gap-2 disabled:opacity-50"
          >
            {isChecking ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                {checkProgress}%
              </>
            ) : (
              <>
                <RefreshCw size={14} />
                Check All
              </>
            )}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              showSettings ? 'bg-cyan-100 text-cyan-600' : 'hover:bg-white/50 dark:hover:bg-gray-700'
            )}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Real-time Status Bar */}
      {isChecking && (
        <div className="h-1 bg-gray-200">
          <motion.div
            className="h-full bg-cyan-500"
            initial={{ width: 0 }}
            animate={{ width: `${checkProgress}%` }}
          />
        </div>
      )}

      {/* Stats Bar with Status Icons */}
      <div className="grid grid-cols-5 divide-x border-b">
        {[
          { label: 'Total', value: stats.total, icon: Link2, color: 'gray' },
          { label: 'Valid', value: stats.valid, icon: CheckCircle, color: 'green' },
          { label: 'Broken', value: stats.broken, icon: XCircle, color: 'red' },
          { label: 'Redirects', value: stats.redirects, icon: ArrowUpRight, color: 'amber' },
          { label: 'Issues', value: stats.issues, icon: AlertTriangle, color: 'orange' }
        ].map(stat => (
          <button
            key={stat.label}
            onClick={() => {
              if (stat.label === 'Valid') setFilterStatus('valid');
              else if (stat.label === 'Broken') setFilterStatus('broken');
              else if (stat.label === 'Redirects') setFilterStatus('redirect');
              else setFilterStatus('all');
            }}
            className={clsx(
              'p-3 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
              filterStatus === stat.label.toLowerCase() && 'bg-gray-100 dark:bg-gray-800'
            )}
          >
            <div className="flex items-center justify-center gap-1">
              <stat.icon size={16} className={`text-${stat.color}-500`} />
              <span className={`text-xl font-bold text-${stat.color}-600`}>{stat.value}</span>
            </div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </button>
        ))}
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b bg-gray-50 dark:bg-gray-800/50 overflow-hidden"
          >
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoCheck}
                  onChange={(e) => setSettings({ ...settings, autoCheck: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Auto Check</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.checkExternal}
                  onChange={(e) => setSettings({ ...settings, checkExternal: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Check External</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.followRedirects}
                  onChange={(e) => setSettings({ ...settings, followRedirects: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Follow Redirects</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showIssuesOnly}
                  onChange={(e) => setSettings({ ...settings, showIssuesOnly: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Issues Only</span>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and Filter */}
      <div className="p-4 border-b flex gap-3">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search links..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="all">All Types</option>
          <option value="internal">Internal ({stats.internal})</option>
          <option value="external">External ({stats.external})</option>
          <option value="anchor">Anchors</option>
          <option value="mailto">Email</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="valid">Valid</option>
          <option value="broken">Broken</option>
          <option value="redirect">Redirect</option>
          <option value="timeout">Timeout</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Links List */}
      <div className="max-h-[400px] overflow-y-auto divide-y">
        {filteredLinks.map((link, idx) => (
          <motion.div
            key={link.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.03 }}
            className={clsx(
              'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
              link.status === 'broken' && 'bg-red-50/50 dark:bg-red-900/10',
              link.issues.length > 0 && link.status !== 'broken' && 'bg-amber-50/50 dark:bg-amber-900/10'
            )}
          >
            <div
              className="p-4 cursor-pointer"
              onClick={() => setExpandedLink(expandedLink === link.id ? null : link.id)}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">{getStatusIcon(link.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={clsx(
                      'px-2 py-0.5 text-xs rounded flex items-center gap-1',
                      link.type === 'external' && 'bg-blue-100 text-blue-700',
                      link.type === 'internal' && 'bg-green-100 text-green-700',
                      link.type === 'anchor' && 'bg-purple-100 text-purple-700',
                      link.type === 'mailto' && 'bg-amber-100 text-amber-700'
                    )}>
                      {getTypeIcon(link.type)}
                      {link.type}
                    </span>
                    {link.statusCode && (
                      <span className={clsx(
                        'px-2 py-0.5 text-xs rounded',
                        link.statusCode >= 200 && link.statusCode < 300 && 'bg-green-100 text-green-700',
                        link.statusCode >= 300 && link.statusCode < 400 && 'bg-amber-100 text-amber-700',
                        link.statusCode >= 400 && 'bg-red-100 text-red-700'
                      )}>
                        {link.statusCode}
                      </span>
                    )}
                    {link.responseTime && (
                      <span className="text-xs text-gray-500">{link.responseTime}ms</span>
                    )}
                    {link.issues.length > 0 && (
                      <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded flex items-center gap-1">
                        <AlertTriangle size={12} />
                        {link.issues.length}
                      </span>
                    )}
                  </div>

                  <div className="text-sm font-medium text-blue-600 truncate" title={link.url}>
                    {link.url}
                  </div>

                  {link.text ? (
                    <div className="text-xs text-gray-500 mt-1">
                      Anchor: "{link.text}"
                    </div>
                  ) : (
                    <div className="text-xs text-red-500 mt-1">
                      No anchor text
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCheckSingle(link.id);
                    }}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    title="Re-check link"
                  >
                    <RefreshCw size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyLink(link.url);
                    }}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    title="Copy link"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(link.url, '_blank');
                    }}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    title="Open link"
                  >
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
              {expandedLink === link.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t bg-gray-50 dark:bg-gray-800/50 overflow-hidden"
                >
                  <div className="p-4 space-y-3">
                    {/* Redirect Info */}
                    {link.status === 'redirect' && link.redirectUrl && (
                      <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-sm">
                        <ArrowUpRight size={16} className="text-amber-600" />
                        <span>Redirects to: </span>
                        <a href={link.redirectUrl} className="text-blue-600 hover:underline">{link.redirectUrl}</a>
                      </div>
                    )}

                    {/* Attributes */}
                    {Object.keys(link.attributes).length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {link.attributes.rel && (
                          <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded flex items-center gap-1">
                            <Shield size={12} />
                            rel="{link.attributes.rel}"
                          </span>
                        )}
                        {link.attributes.target && (
                          <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded">
                            target="{link.attributes.target}"
                          </span>
                        )}
                      </div>
                    )}

                    {/* Issues */}
                    {link.issues.length > 0 && (
                      <div className="space-y-2">
                        {link.issues.map((issue, idx) => (
                          <div
                            key={idx}
                            className={clsx(
                              'p-3 rounded-lg text-sm',
                              issue.severity === 'error' && 'bg-red-100 dark:bg-red-900/20',
                              issue.severity === 'warning' && 'bg-amber-100 dark:bg-amber-900/20',
                              issue.severity === 'info' && 'bg-blue-100 dark:bg-blue-900/20'
                            )}
                          >
                            <div className="flex items-center gap-2 font-medium">
                              <AlertTriangle size={14} />
                              {issue.message}
                            </div>
                            {issue.suggestion && (
                              <div className="mt-1 text-xs opacity-80 flex items-center gap-1">
                                <Zap size={12} />
                                {issue.suggestion}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => onLinkClick?.(link.id)}
                        className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Eye size={12} />
                        Jump to link
                      </button>
                      <button
                        onClick={() => onLinkUpdate?.(link.id, link.url)}
                        className="px-3 py-1.5 text-xs border rounded hover:bg-gray-100 flex items-center gap-1"
                      >
                        <Edit3 size={12} />
                        Edit
                      </button>
                      <button
                        onClick={() => onLinkRemove?.(link.id)}
                        className="px-3 py-1.5 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50 flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                        Remove
                      </button>
                    </div>

                    <div className="text-xs text-gray-500">
                      Last checked: {link.lastChecked?.toLocaleString() || 'Never'}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {filteredLinks.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <Link2 size={32} className="mx-auto mb-2 opacity-50" />
          {links.length === 0 ? (
            <p>No links found in the content</p>
          ) : (
            <p>No links found matching your criteria</p>
          )}
        </div>
      )}
    </motion.div>
  );
};

// Export a hook for getting link status summary (for sidebar display)
export const useLinkCheckerStatus = (content?: string): LinkCheckerStatus => {
  const [status, setStatus] = useState<LinkCheckerStatus>({
    total: 0,
    valid: 0,
    broken: 0,
    warnings: 0,
    checking: false
  });

  useEffect(() => {
    const links = parseLinksFromContent(content || '');
    const issues = links.reduce((acc, l) => acc + l.issues.length, 0);

    setStatus({
      total: links.length,
      valid: 0,
      broken: 0,
      warnings: issues,
      checking: true
    });

    // Check links asynchronously
    const checkLinks = async () => {
      let valid = 0;
      let broken = 0;

      for (const link of links) {
        const checked = await checkLink(link);
        if (checked.status === 'valid') valid++;
        else if (checked.status === 'broken') broken++;
      }

      setStatus(prev => ({
        ...prev,
        valid,
        broken,
        checking: false
      }));
    };

    if (links.length > 0) {
      checkLinks();
    } else {
      setStatus(prev => ({ ...prev, checking: false }));
    }
  }, [content]);

  return status;
};

export default LinkChecker;
