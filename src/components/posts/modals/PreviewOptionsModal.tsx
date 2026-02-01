/**
 * PreviewOptionsModal - Enterprise Preview Options Modal
 *
 * Comprehensive modal for Device Preview, Social Preview, and Content Outline
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Monitor,
  Tablet,
  Smartphone,
  Tv,
  Watch,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RefreshCw,
  ExternalLink,
  Copy,
  Download,
  Eye,
  List,
  ChevronRight,
  ChevronDown,
  Hash,
  Image,
  Type,
  FileText,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Globe,
  Settings,
  Sun,
  Moon,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  Clock,
} from 'lucide-react';
import clsx from 'clsx';
import {
  EditorModal,
  ModalSection,
  FormField,
  FormRow,
  Toggle,
  Select,
  Input,
  Textarea,
  Badge,
  InfoBox,
} from './EditorModal';

interface PreviewOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  title: string;
  excerpt?: string;
  featuredImage?: string;
  defaultTab?: 'device' | 'social' | 'outline';
  initialTab?: 'device' | 'social' | 'outline';
  hideTabs?: boolean;
}

// Tab titles and subtitles for single-tab mode
const previewTabTitles: Record<string, { title: string; subtitle: string }> = {
  device: { title: 'Device Preview', subtitle: 'Preview content on different devices and screen sizes' },
  social: { title: 'Social Preview', subtitle: 'Preview how content appears on social platforms' },
  outline: { title: 'Content Outline', subtitle: 'View document structure and navigation' },
};

// Device presets
const devicePresets = [
  { id: 'iphone-15', name: 'iPhone 15 Pro', width: 393, height: 852, type: 'mobile', icon: Smartphone },
  { id: 'iphone-se', name: 'iPhone SE', width: 375, height: 667, type: 'mobile', icon: Smartphone },
  { id: 'pixel-8', name: 'Pixel 8', width: 412, height: 915, type: 'mobile', icon: Smartphone },
  { id: 'galaxy-s24', name: 'Galaxy S24', width: 360, height: 780, type: 'mobile', icon: Smartphone },
  { id: 'ipad-pro', name: 'iPad Pro 12.9"', width: 1024, height: 1366, type: 'tablet', icon: Tablet },
  { id: 'ipad-air', name: 'iPad Air', width: 820, height: 1180, type: 'tablet', icon: Tablet },
  { id: 'surface-pro', name: 'Surface Pro', width: 912, height: 1368, type: 'tablet', icon: Tablet },
  { id: 'laptop', name: 'Laptop', width: 1440, height: 900, type: 'desktop', icon: Monitor },
  { id: 'desktop', name: 'Desktop HD', width: 1920, height: 1080, type: 'desktop', icon: Monitor },
  { id: 'desktop-4k', name: 'Desktop 4K', width: 3840, height: 2160, type: 'desktop', icon: Tv },
];

// Social platform presets
const socialPlatforms = [
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-600', titleLimit: 60, descLimit: 300, imageRatio: '1.91:1' },
  { id: 'twitter', name: 'Twitter/X', icon: Twitter, color: 'bg-black', titleLimit: 70, descLimit: 200, imageRatio: '2:1' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700', titleLimit: 70, descLimit: 150, imageRatio: '1.91:1' },
  { id: 'pinterest', name: 'Pinterest', icon: Globe, color: 'bg-red-600', titleLimit: 100, descLimit: 500, imageRatio: '2:3' },
  { id: 'google', name: 'Google Search', icon: Globe, color: 'bg-white', titleLimit: 60, descLimit: 160, imageRatio: '1.91:1' },
];

export const PreviewOptionsModal: React.FC<PreviewOptionsModalProps> = ({
  isOpen,
  onClose,
  content,
  title,
  excerpt = '',
  featuredImage = '',
  defaultTab = 'device',
  initialTab,
  hideTabs = false,
}) => {
  const [activeTab, setActiveTab] = useState(initialTab || defaultTab);

  // Sync activeTab with initialTab prop changes (fixes single-tab mode)
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Get title and subtitle based on single-tab mode
  const currentTabInfo = previewTabTitles[activeTab] || { title: 'Preview Options', subtitle: 'Device preview, social preview, and outline' };
  const modalTitle = hideTabs ? currentTabInfo.title : 'Preview Options';
  const modalSubtitle = hideTabs ? currentTabInfo.subtitle : 'Device preview, social preview, and outline';

  // Device Preview state
  const [selectedDevice, setSelectedDevice] = useState('iphone-15');
  const [isLandscape, setIsLandscape] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [showDeviceFrame, setShowDeviceFrame] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [showStatusBar, setShowStatusBar] = useState(true);

  // Social Preview state
  const [selectedPlatform, setSelectedPlatform] = useState('facebook');
  const [ogTitle, setOgTitle] = useState(title);
  const [ogDescription, setOgDescription] = useState(excerpt);
  const [ogImage, setOgImage] = useState(featuredImage);
  const [twitterCard, setTwitterCard] = useState<'summary' | 'summary_large_image'>('summary_large_image');

  // Content Outline state
  const [outlineMaxDepth, setOutlineMaxDepth] = useState(3);
  const [showWordCounts, setShowWordCounts] = useState(true);
  const [highlightCurrent, setHighlightCurrent] = useState(true);
  const [collapsibleSections, setCollapsibleSections] = useState(true);

  // Parse content for outline
  const contentOutline = useMemo(() => {
    const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi;
    const headings: { level: number; text: string; id: string; wordCount: number }[] = [];
    let match;
    let lastIndex = 0;

    while ((match = headingRegex.exec(content)) !== null) {
      const sectionContent = content.slice(lastIndex, match.index);
      const wordCount = sectionContent.split(/\s+/).filter(Boolean).length;

      headings.push({
        level: parseInt(match[1]),
        text: match[2].replace(/<[^>]*>/g, ''),
        id: `heading-${headings.length}`,
        wordCount,
      });

      lastIndex = match.index + match[0].length;
    }

    return headings;
  }, [content]);

  const currentDevice = devicePresets.find(d => d.id === selectedDevice) || devicePresets[0];
  const currentPlatform = socialPlatforms.find(p => p.id === selectedPlatform) || socialPlatforms[0];

  const deviceWidth = isLandscape ? currentDevice.height : currentDevice.width;
  const deviceHeight = isLandscape ? currentDevice.width : currentDevice.height;
  const scaledWidth = (deviceWidth * zoom) / 100;
  const scaledHeight = (deviceHeight * zoom) / 100;

  const tabs = [
    { id: 'device', label: 'Device Preview', icon: Monitor },
    { id: 'social', label: 'Social Preview', icon: Share2 },
    { id: 'outline', label: 'Content Outline', icon: List },
  ];

  return (
    <EditorModal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      subtitle={modalSubtitle}
      icon={Eye}
      iconColor="blue"
      size={hideTabs ? 'lg' : 'xl'}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as typeof activeTab)}
      hideTabs={hideTabs}
    >
      {/* Device Preview Tab */}
      {activeTab === 'device' && (
        <div className="space-y-6">
          {/* Device Selector */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Device type filter */}
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                {['mobile', 'tablet', 'desktop'].map(type => {
                  const Icon = type === 'mobile' ? Smartphone : type === 'tablet' ? Tablet : Monitor;
                  const count = devicePresets.filter(d => d.type === type).length;
                  return (
                    <button
                      key={type}
                      className={clsx(
                        'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                        currentDevice.type === type
                          ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      )}
                      onClick={() => {
                        const firstOfType = devicePresets.find(d => d.type === type);
                        if (firstOfType) setSelectedDevice(firstOfType.id);
                      }}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="capitalize">{type}</span>
                      <span className="text-xs text-gray-400">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Device dropdown */}
              <Select
                value={selectedDevice}
                onChange={setSelectedDevice}
                options={devicePresets
                  .filter(d => d.type === currentDevice.type)
                  .map(d => ({ value: d.id, label: `${d.name} (${d.width}×${d.height})` }))}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLandscape(!isLandscape)}
                className={clsx(
                  'p-2 rounded-lg transition-colors',
                  isLandscape ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
                title="Rotate"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setZoom(Math.max(25, zoom - 25))}
                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  disabled={zoom <= 25}
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-medium">{zoom}%</span>
                <button
                  onClick={() => setZoom(Math.min(200, zoom + 25))}
                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  disabled={zoom >= 200}
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setShowDeviceFrame(!showDeviceFrame)}
                className={clsx(
                  'p-2 rounded-lg transition-colors',
                  showDeviceFrame ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
                title="Toggle frame"
              >
                <Maximize2 className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={clsx(
                  'p-2 rounded-lg transition-colors',
                  isDarkMode ? 'bg-gray-800 text-amber-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
                title="Toggle dark mode"
              >
                {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex justify-center p-8 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl min-h-[500px]">
            <div
              className={clsx(
                'relative transition-all duration-300',
                showDeviceFrame && 'p-3 bg-gray-900 rounded-[2.5rem] shadow-2xl'
              )}
              style={{
                width: showDeviceFrame ? scaledWidth + 24 : scaledWidth,
                height: showDeviceFrame ? scaledHeight + 24 : scaledHeight,
              }}
            >
              {/* Device frame decorations */}
              {showDeviceFrame && currentDevice.type === 'mobile' && (
                <>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-gray-900 rounded-b-xl z-10" />
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-gray-800 rounded-full z-10" />
                </>
              )}

              {/* Preview iframe container */}
              <div
                className={clsx(
                  'w-full h-full overflow-hidden bg-white dark:bg-gray-900',
                  showDeviceFrame ? 'rounded-[2rem]' : 'rounded-lg'
                )}
              >
                {/* Status bar */}
                {showStatusBar && currentDevice.type === 'mobile' && (
                  <div className={clsx(
                    'flex items-center justify-between px-6 py-1 text-xs font-medium',
                    isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
                  )}>
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <Signal className="w-3 h-3" />
                      <Wifi className="w-3 h-3" />
                      <Battery className="w-4 h-3" />
                    </div>
                  </div>
                )}

                {/* Content preview */}
                <div className={clsx(
                  'w-full h-full overflow-auto p-4',
                  isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
                )}>
                  <h1 className="text-xl font-bold mb-4">{title || 'Untitled Post'}</h1>
                  <div
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: content || '<p>No content to preview</p>' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Device Info */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              {currentDevice.name} • {deviceWidth} × {deviceHeight}px
              {isLandscape && ' (Landscape)'}
            </span>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1 hover:text-gray-700">
                <ExternalLink className="w-4 h-4" />
                Open in new tab
              </button>
              <button className="flex items-center gap-1 hover:text-gray-700">
                <Download className="w-4 h-4" />
                Screenshot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Social Preview Tab */}
      {activeTab === 'social' && (
        <div className="space-y-6">
          {/* Platform Selector */}
          <div className="flex gap-2">
            {socialPlatforms.map(platform => (
              <button
                key={platform.id}
                onClick={() => setSelectedPlatform(platform.id)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
                  selectedPlatform === platform.id
                    ? `${platform.color} text-white shadow-lg`
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                <platform.icon className="w-4 h-4" />
                {platform.name}
              </button>
            ))}
          </div>

          {/* Preview Card */}
          <ModalSection id="social-preview-card" title="Preview" description={`How your content will appear on ${currentPlatform.name}`}>
            <div className="max-w-lg mx-auto">
              {selectedPlatform === 'google' ? (
                // Google Search Preview
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Globe className="w-4 h-4" />
                    example.com › blog › post
                  </div>
                  <h3 className="text-xl text-blue-600 hover:underline cursor-pointer">
                    {ogTitle || title || 'Page Title'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {ogDescription || excerpt || 'Page description will appear here...'}
                  </p>
                </div>
              ) : (
                // Social Media Preview Card
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  {/* Image */}
                  <div
                    className="w-full bg-gray-100 flex items-center justify-center"
                    style={{
                      aspectRatio: currentPlatform.imageRatio.replace(':', '/'),
                    }}
                  >
                    {ogImage ? (
                      <img src={ogImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-gray-400">
                        <Image className="w-12 h-12 mx-auto mb-2" />
                        <span className="text-sm">No image set</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      example.com
                    </div>
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                      {ogTitle || title || 'Page Title'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {ogDescription || excerpt || 'Page description will appear here...'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </ModalSection>

          {/* Edit Social Meta */}
          <ModalSection id="social-meta" title="Social Meta Tags" description="Customize how your content appears when shared">
            <div className="space-y-4">
              <FormField
                label="Title"
                description={`${ogTitle.length}/${currentPlatform.titleLimit} characters`}
              >
                <Input
                  value={ogTitle}
                  onChange={setOgTitle}
                  placeholder="Enter social share title"
                />
                {ogTitle.length > currentPlatform.titleLimit && (
                  <p className="text-xs text-amber-600 mt-1">Title may be truncated</p>
                )}
              </FormField>

              <FormField
                label="Description"
                description={`${ogDescription.length}/${currentPlatform.descLimit} characters`}
              >
                <Textarea
                  value={ogDescription}
                  onChange={setOgDescription}
                  placeholder="Enter social share description"
                  rows={3}
                  maxLength={currentPlatform.descLimit}
                  showCount
                />
              </FormField>

              <FormField label="Image">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      value={ogImage}
                      onChange={setOgImage}
                      placeholder="Image URL"
                    />
                  </div>
                  <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    Browse
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Recommended size: 1200 × 630px for most platforms
                </p>
              </FormField>

              {selectedPlatform === 'twitter' && (
                <FormField label="Twitter Card Type">
                  <Select
                    value={twitterCard}
                    onChange={(v) => setTwitterCard(v as any)}
                    options={[
                      { value: 'summary', label: 'Summary (small image)' },
                      { value: 'summary_large_image', label: 'Summary with Large Image' },
                    ]}
                  />
                </FormField>
              )}
            </div>
          </ModalSection>

          {/* Copy Tags */}
          <div className="flex justify-end gap-2">
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
              <Copy className="w-4 h-4" />
              Copy meta tags
            </button>
          </div>
        </div>
      )}

      {/* Content Outline Tab */}
      {activeTab === 'outline' && (
        <div className="space-y-6">
          {/* Outline Settings */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <FormField label="Max Depth">
                <Select
                  value={outlineMaxDepth.toString()}
                  onChange={(v) => setOutlineMaxDepth(parseInt(v))}
                  options={[
                    { value: '2', label: 'H1-H2' },
                    { value: '3', label: 'H1-H3' },
                    { value: '4', label: 'H1-H4' },
                    { value: '6', label: 'All Headings' },
                  ]}
                />
              </FormField>
            </div>

            <div className="flex items-center gap-4">
              <Toggle
                checked={showWordCounts}
                onChange={setShowWordCounts}
                label="Word counts"
              />
              <Toggle
                checked={collapsibleSections}
                onChange={setCollapsibleSections}
                label="Collapsible"
              />
            </div>
          </div>

          {/* Content Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {content.split(/\s+/).filter(Boolean).length}
              </div>
              <div className="text-sm text-gray-500">Total Words</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {contentOutline.length}
              </div>
              <div className="text-sm text-gray-500">Headings</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {(content.match(/<p[^>]*>/g) || []).length}
              </div>
              <div className="text-sm text-gray-500">Paragraphs</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.ceil(content.split(/\s+/).filter(Boolean).length / 200)}
              </div>
              <div className="text-sm text-gray-500">Min Read</div>
            </div>
          </div>

          {/* Outline Tree */}
          <ModalSection id="outline-tree" title="Document Outline" description="Navigate your content structure">
            {contentOutline.length > 0 ? (
              <div className="space-y-1">
                {contentOutline
                  .filter(h => h.level <= outlineMaxDepth)
                  .map((heading, index) => (
                    <motion.div
                      key={heading.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={clsx(
                        'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors group',
                        highlightCurrent && index === 0
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      )}
                      style={{ paddingLeft: `${(heading.level - 1) * 20 + 12}px` }}
                    >
                      <span className={clsx(
                        'flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-bold',
                        heading.level === 1 && 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
                        heading.level === 2 && 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
                        heading.level === 3 && 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
                        heading.level >= 4 && 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      )}>
                        H{heading.level}
                      </span>

                      <span className="flex-1 text-sm text-gray-900 dark:text-white truncate">
                        {heading.text}
                      </span>

                      {showWordCounts && (
                        <span className="text-xs text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                          {heading.wordCount} words
                        </span>
                      )}

                      <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <List className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No headings found in content</p>
                <p className="text-sm mt-1">Add headings (H1-H6) to create an outline</p>
              </div>
            )}
          </ModalSection>

          {/* Export Options */}
          <div className="flex justify-end gap-2">
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
              <Copy className="w-4 h-4" />
              Copy as Markdown
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>
      )}
    </EditorModal>
  );
};

export default PreviewOptionsModal;
