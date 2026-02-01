/**
 * SEOAnalysisModal - Enterprise SEO & Analysis Modal
 *
 * Comprehensive modal for SEO Analyzer, Readability, Keywords, Headings,
 * Schema Markup, Internal Links, and Link Checker
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  FileText,
  Hash,
  Heading,
  Code,
  Link,
  LinkIcon,
  ExternalLink,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Eye,
  RefreshCw,
  Plus,
  Minus,
  ChevronRight,
  ChevronDown,
  Target,
  Zap,
  BookOpen,
  Type,
  List,
  Settings,
  Copy,
  Download,
  Lightbulb,
  Globe,
  Shield,
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

interface SEOAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  title: string;
  defaultTab?: 'seo' | 'readability' | 'keywords' | 'headings' | 'schema' | 'links' | 'checker';
  initialTab?: 'seo' | 'readability' | 'keywords' | 'headings' | 'schema' | 'links' | 'checker';
  hideTabs?: boolean;
}

// Tab titles and subtitles for single-tab mode
const tabTitles: Record<string, { title: string; subtitle: string }> = {
  seo: { title: 'SEO Analyzer', subtitle: 'Analyze and optimize your content for search engines' },
  readability: { title: 'Readability', subtitle: 'Check content readability and comprehension level' },
  keywords: { title: 'Keywords', subtitle: 'Analyze keyword density and optimization' },
  headings: { title: 'Headings', subtitle: 'Review and optimize heading structure' },
  schema: { title: 'Schema Markup', subtitle: 'Configure structured data for rich results' },
  links: { title: 'Internal Links', subtitle: 'Manage internal linking strategy' },
  checker: { title: 'Link Checker', subtitle: 'Validate all links in your content' },
};

// Score indicator component
const ScoreIndicator: React.FC<{
  score: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ score, label, size = 'md' }) => {
  const getColor = () => {
    if (score >= 80) return { bg: 'bg-green-500', text: 'text-green-600', ring: 'ring-green-200' };
    if (score >= 60) return { bg: 'bg-amber-500', text: 'text-amber-600', ring: 'ring-amber-200' };
    return { bg: 'bg-red-500', text: 'text-red-600', ring: 'ring-red-200' };
  };

  const colors = getColor();
  const sizeClasses = {
    sm: { container: 'w-12 h-12', text: 'text-sm', label: 'text-xs' },
    md: { container: 'w-20 h-20', text: 'text-xl', label: 'text-sm' },
    lg: { container: 'w-28 h-28', text: 'text-3xl', label: 'text-base' },
  };

  return (
    <div className="flex flex-col items-center">
      <div className={clsx(
        sizeClasses[size].container,
        'relative rounded-full flex items-center justify-center ring-4',
        colors.ring
      )}>
        <svg className="absolute inset-0" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${score * 2.83} 283`}
            transform="rotate(-90 50 50)"
            className={colors.text}
          />
        </svg>
        <span className={clsx(sizeClasses[size].text, 'font-bold', colors.text)}>
          {score}
        </span>
      </div>
      <span className={clsx(sizeClasses[size].label, 'mt-2 text-gray-600 dark:text-gray-400')}>
        {label}
      </span>
    </div>
  );
};

// Issue item component
const IssueItem: React.FC<{
  type: 'error' | 'warning' | 'success' | 'info';
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}> = ({ type, title, description, action }) => {
  const icons = {
    error: XCircle,
    warning: AlertTriangle,
    success: CheckCircle,
    info: Info,
  };
  const colors = {
    error: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    warning: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
    success: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
  };
  const iconColors = {
    error: 'text-red-500',
    warning: 'text-amber-500',
    success: 'text-green-500',
    info: 'text-blue-500',
  };

  const Icon = icons[type];

  return (
    <div className={clsx('p-4 rounded-lg border', colors[type])}>
      <div className="flex items-start gap-3">
        <Icon className={clsx('w-5 h-5 flex-shrink-0 mt-0.5', iconColors[type])} />
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
          {action && (
            <button
              onClick={action.onClick}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
            >
              {action.label} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const SEOAnalysisModal: React.FC<SEOAnalysisModalProps> = ({
  isOpen,
  onClose,
  content,
  title,
  defaultTab = 'seo',
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
  const currentTabInfo = tabTitles[activeTab] || { title: 'SEO & Analysis', subtitle: 'SEO analyzer, readability, and link checker' };
  const modalTitle = hideTabs ? currentTabInfo.title : 'SEO & Analysis';
  const modalSubtitle = hideTabs ? currentTabInfo.subtitle : 'SEO analyzer, readability, and link checker';

  // SEO Analyzer state
  const [focusKeyword, setFocusKeyword] = useState('');
  const [seoScore, setSeoScore] = useState(72);
  const [seoSettings, setSeoSettings] = useState({
    enableRealTime: true,
    checkTitleLength: true,
    checkMetaDescription: true,
    checkKeywordDensity: true,
    checkHeadingStructure: true,
    checkImageAlt: true,
    checkInternalLinks: true,
    checkExternalLinks: true,
    minWordCount: 300,
  });

  // Readability state
  const [readabilityScore, setReadabilityScore] = useState(68);
  const [readabilitySettings, setReadabilitySettings] = useState({
    formula: 'flesch-kincaid' as 'flesch-kincaid' | 'gunning-fog' | 'coleman-liau' | 'smog' | 'ari',
    targetGradeLevel: 8,
    highlightComplexSentences: true,
    highlightPassiveVoice: true,
    highlightLongParagraphs: true,
    maxSentenceLength: 25,
    maxParagraphLength: 150,
    showSuggestions: true,
  });

  // Keywords state
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [keywordsSettings, setKeywordsSettings] = useState({
    targetDensityMin: 1,
    targetDensityMax: 3,
    highlightKeywords: true,
    checkTitlePlacement: true,
    checkFirstParagraph: true,
    checkSubheadings: true,
    checkUrl: true,
    checkImageAlt: true,
  });

  // Sample keyword density data
  const keywordDensityData = [
    { keyword: 'react', count: 15, density: 2.1, status: 'optimal' },
    { keyword: 'component', count: 12, density: 1.7, status: 'optimal' },
    { keyword: 'state', count: 8, density: 1.1, status: 'low' },
    { keyword: 'hooks', count: 6, density: 0.8, status: 'low' },
    { keyword: 'performance', count: 3, density: 0.4, status: 'low' },
  ];

  // Headings state
  const [headingsSettings, setHeadingsSettings] = useState({
    enforceHierarchy: true,
    requireH1: true,
    maxH1Count: 1,
    highlightIssues: true,
    suggestImprovements: true,
    maxHeadingLength: 70,
    includeKeyword: true,
  });

  // Sample headings structure
  const headingsStructure = [
    { level: 1, text: 'Getting Started with React Hooks', issues: [] },
    { level: 2, text: 'What are Hooks?', issues: [] },
    { level: 3, text: 'useState Hook', issues: [] },
    { level: 3, text: 'useEffect Hook', issues: [] },
    { level: 2, text: 'Advanced Patterns', issues: [] },
    { level: 4, text: 'Custom Hooks', issues: ['Skipped H3 level'] },
    { level: 2, text: 'Best Practices for Performance Optimization in Modern React Applications', issues: ['Too long (84 chars)'] },
  ];

  // Schema state
  const [schemaType, setSchemaType] = useState('Article');
  const [schemaSettings, setSchemaSettings] = useState({
    autoGenerate: true,
    includeAuthor: true,
    includePublisher: true,
    includeDatePublished: true,
    includeDateModified: true,
    includeImage: true,
    includeWordCount: true,
    validateSchema: true,
  });
  const [customSchemaProperties, setCustomSchemaProperties] = useState<{ key: string; value: string }[]>([]);

  // Sample schema preview
  const schemaPreview = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    headline: title || 'Article Title',
    author: {
      '@type': 'Person',
      name: 'John Doe',
    },
    datePublished: '2024-01-15',
    image: 'https://example.com/image.jpg',
  };

  // Internal Links state
  const [linksSettings, setLinksSettings] = useState({
    enableAutoSuggest: true,
    maxSuggestions: 5,
    minRelevanceScore: 0.5,
    linkNewWindow: false,
    addNoFollow: false,
    highlightOrphans: true,
    showLinkPreview: true,
  });

  // Sample link suggestions
  const linkSuggestions = [
    { text: 'React Hooks', url: '/blog/react-hooks-guide', relevance: 0.95 },
    { text: 'State Management', url: '/blog/state-management', relevance: 0.82 },
    { text: 'Performance Tips', url: '/blog/react-performance', relevance: 0.76 },
    { text: 'Component Patterns', url: '/blog/component-patterns', relevance: 0.68 },
  ];

  // Link Checker state
  const [linkCheckerSettings, setLinkCheckerSettings] = useState({
    checkOnSave: true,
    checkOnPublish: true,
    checkSchedule: 'weekly' as 'manual' | 'daily' | 'weekly' | 'monthly',
    checkInternal: true,
    checkExternal: true,
    checkImages: true,
    checkAnchors: true,
    timeout: 10000,
    followRedirects: true,
    maxRedirects: 3,
  });
  const [isChecking, setIsChecking] = useState(false);

  // Sample link check results
  const linkCheckResults = [
    { url: '/about', type: 'internal', status: 200, statusText: 'OK', responseTime: 45 },
    { url: '/blog/old-post', type: 'internal', status: 404, statusText: 'Not Found', responseTime: 0 },
    { url: 'https://example.com', type: 'external', status: 200, statusText: 'OK', responseTime: 234 },
    { url: 'https://broken-link.com/page', type: 'external', status: 0, statusText: 'Timeout', responseTime: 10000 },
    { url: '/images/hero.jpg', type: 'image', status: 200, statusText: 'OK', responseTime: 89 },
  ];

  const addSecondaryKeyword = () => {
    if (newKeyword && !secondaryKeywords.includes(newKeyword)) {
      setSecondaryKeywords([...secondaryKeywords, newKeyword]);
      setNewKeyword('');
    }
  };

  const removeSecondaryKeyword = (keyword: string) => {
    setSecondaryKeywords(secondaryKeywords.filter(k => k !== keyword));
  };

  const runLinkCheck = () => {
    setIsChecking(true);
    setTimeout(() => setIsChecking(false), 2000);
  };

  const tabs = [
    { id: 'seo', label: 'SEO Analyzer', icon: Search, badge: seoScore >= 80 ? undefined : '!' },
    { id: 'readability', label: 'Readability', icon: BookOpen },
    { id: 'keywords', label: 'Keywords', icon: Hash },
    { id: 'headings', label: 'Headings', icon: Heading },
    { id: 'schema', label: 'Schema', icon: Code },
    { id: 'links', label: 'Internal Links', icon: Link },
    { id: 'checker', label: 'Link Checker', icon: LinkIcon },
  ];

  return (
    <EditorModal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      subtitle={modalSubtitle}
      icon={Search}
      iconColor="orange"
      size={hideTabs ? 'lg' : 'xl'}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as typeof activeTab)}
      hideTabs={hideTabs}
      showHelp
      helpContent={
        <div className="space-y-4">
          <h4 className="font-medium">SEO Best Practices</h4>
          <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-400">
            <li>• Use your focus keyword in the title</li>
            <li>• Write a compelling meta description</li>
            <li>• Include keywords naturally in content</li>
            <li>• Use proper heading hierarchy</li>
            <li>• Add alt text to all images</li>
            <li>• Include internal and external links</li>
          </ul>
        </div>
      }
    >
      {/* SEO Analyzer Tab */}
      {activeTab === 'seo' && (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800 rounded-xl">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Overall SEO Score</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Based on {Object.values(seoSettings).filter(Boolean).length} checks
              </p>
            </div>
            <ScoreIndicator score={seoScore} label="SEO Score" size="lg" />
          </div>

          {/* Focus Keyword */}
          <ModalSection id="focus-keyword" title="Focus Keyword" description="Enter your target keyword for optimization">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  value={focusKeyword}
                  onChange={setFocusKeyword}
                  placeholder="Enter focus keyword..."
                />
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Analyze
              </button>
            </div>
          </ModalSection>

          {/* Analysis Results */}
          <ModalSection id="seo-results" title="Analysis Results" description="Detailed SEO checks">
            <div className="space-y-3">
              <IssueItem
                type="success"
                title="Title contains focus keyword"
                description="Your title includes the focus keyword 'React Hooks' which is great for SEO."
              />
              <IssueItem
                type="warning"
                title="Meta description could be improved"
                description="Your meta description is 120 characters. Consider expanding it to 150-160 characters for optimal display in search results."
                action={{ label: 'Edit meta description', onClick: () => {} }}
              />
              <IssueItem
                type="error"
                title="Missing alt text on 2 images"
                description="Images without alt text hurt accessibility and SEO. Add descriptive alt text to all images."
                action={{ label: 'Fix image alt text', onClick: () => {} }}
              />
              <IssueItem
                type="success"
                title="Good internal linking"
                description="You have 5 internal links in your content, which helps with site navigation and SEO."
              />
              <IssueItem
                type="info"
                title="Consider adding more content"
                description="Your content is 450 words. Longer, comprehensive content (1000+ words) often performs better in search results."
              />
            </div>
          </ModalSection>

          {/* Settings */}
          <ModalSection id="seo-settings" title="Analysis Settings" description="Configure SEO checks">
            <div className="grid grid-cols-2 gap-4">
              <Toggle
                checked={seoSettings.enableRealTime}
                onChange={(v) => setSeoSettings(s => ({ ...s, enableRealTime: v }))}
                label="Real-time Analysis"
                description="Analyze as you type"
              />
              <Toggle
                checked={seoSettings.checkTitleLength}
                onChange={(v) => setSeoSettings(s => ({ ...s, checkTitleLength: v }))}
                label="Check Title Length"
                description="Optimal: 50-60 characters"
              />
              <Toggle
                checked={seoSettings.checkMetaDescription}
                onChange={(v) => setSeoSettings(s => ({ ...s, checkMetaDescription: v }))}
                label="Check Meta Description"
                description="Optimal: 150-160 characters"
              />
              <Toggle
                checked={seoSettings.checkKeywordDensity}
                onChange={(v) => setSeoSettings(s => ({ ...s, checkKeywordDensity: v }))}
                label="Check Keyword Density"
                description="Target: 1-3%"
              />
              <Toggle
                checked={seoSettings.checkHeadingStructure}
                onChange={(v) => setSeoSettings(s => ({ ...s, checkHeadingStructure: v }))}
                label="Check Heading Structure"
                description="Proper H1-H6 hierarchy"
              />
              <Toggle
                checked={seoSettings.checkImageAlt}
                onChange={(v) => setSeoSettings(s => ({ ...s, checkImageAlt: v }))}
                label="Check Image Alt Text"
                description="All images need alt text"
              />
            </div>
          </ModalSection>
        </div>
      )}

      {/* Readability Tab */}
      {activeTab === 'readability' && (
        <div className="space-y-6">
          {/* Score Overview */}
          <div className="grid grid-cols-4 gap-6">
            <div className="col-span-1 flex justify-center">
              <ScoreIndicator score={readabilityScore} label="Readability" size="lg" />
            </div>
            <div className="col-span-3 grid grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">Grade 8</div>
                <div className="text-sm text-gray-500">Reading Level</div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">15.2</div>
                <div className="text-sm text-gray-500">Avg Words/Sentence</div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">4.8</div>
                <div className="text-sm text-gray-500">Avg Syllables/Word</div>
              </div>
            </div>
          </div>

          {/* Readability Issues */}
          <ModalSection id="readability-issues" title="Improvement Suggestions" description="Areas to improve readability">
            <div className="space-y-3">
              <IssueItem
                type="warning"
                title="3 sentences are too long"
                description="Sentences over 25 words can be hard to read. Consider breaking them into smaller sentences."
                action={{ label: 'Show sentences', onClick: () => {} }}
              />
              <IssueItem
                type="warning"
                title="Passive voice detected in 5 sentences"
                description="Active voice is generally more engaging. Consider rephrasing passive constructions."
                action={{ label: 'Highlight passive voice', onClick: () => {} }}
              />
              <IssueItem
                type="success"
                title="Good paragraph length"
                description="Your paragraphs average 85 words, which is within the recommended range."
              />
              <IssueItem
                type="info"
                title="Consider using transition words"
                description="Adding transition words like 'however', 'therefore', 'additionally' can improve flow."
              />
            </div>
          </ModalSection>

          {/* Settings */}
          <ModalSection id="readability-settings" title="Readability Settings" description="Configure analysis parameters">
            <div className="space-y-4">
              <FormRow columns={2}>
                <FormField label="Formula">
                  <Select
                    value={readabilitySettings.formula}
                    onChange={(v) => setReadabilitySettings(s => ({ ...s, formula: v as any }))}
                    options={[
                      { value: 'flesch-kincaid', label: 'Flesch-Kincaid Grade Level' },
                      { value: 'gunning-fog', label: 'Gunning Fog Index' },
                      { value: 'coleman-liau', label: 'Coleman-Liau Index' },
                      { value: 'smog', label: 'SMOG Index' },
                      { value: 'ari', label: 'Automated Readability Index' },
                    ]}
                  />
                </FormField>
                <FormField label="Target Grade Level">
                  <Input
                    type="number"
                    value={readabilitySettings.targetGradeLevel}
                    onChange={(v) => setReadabilitySettings(s => ({ ...s, targetGradeLevel: parseInt(v) || 8 }))}
                    min={1}
                    max={18}
                  />
                </FormField>
              </FormRow>

              <FormRow columns={2}>
                <FormField label="Max Sentence Length">
                  <Input
                    type="number"
                    value={readabilitySettings.maxSentenceLength}
                    onChange={(v) => setReadabilitySettings(s => ({ ...s, maxSentenceLength: parseInt(v) || 25 }))}
                    min={10}
                    max={50}
                  />
                </FormField>
                <FormField label="Max Paragraph Length">
                  <Input
                    type="number"
                    value={readabilitySettings.maxParagraphLength}
                    onChange={(v) => setReadabilitySettings(s => ({ ...s, maxParagraphLength: parseInt(v) || 150 }))}
                    min={50}
                    max={300}
                  />
                </FormField>
              </FormRow>

              <div className="grid grid-cols-2 gap-4">
                <Toggle
                  checked={readabilitySettings.highlightComplexSentences}
                  onChange={(v) => setReadabilitySettings(s => ({ ...s, highlightComplexSentences: v }))}
                  label="Highlight Complex Sentences"
                />
                <Toggle
                  checked={readabilitySettings.highlightPassiveVoice}
                  onChange={(v) => setReadabilitySettings(s => ({ ...s, highlightPassiveVoice: v }))}
                  label="Highlight Passive Voice"
                />
                <Toggle
                  checked={readabilitySettings.highlightLongParagraphs}
                  onChange={(v) => setReadabilitySettings(s => ({ ...s, highlightLongParagraphs: v }))}
                  label="Highlight Long Paragraphs"
                />
                <Toggle
                  checked={readabilitySettings.showSuggestions}
                  onChange={(v) => setReadabilitySettings(s => ({ ...s, showSuggestions: v }))}
                  label="Show Suggestions"
                />
              </div>
            </div>
          </ModalSection>
        </div>
      )}

      {/* Keywords Tab */}
      {activeTab === 'keywords' && (
        <div className="space-y-6">
          {/* Keyword Input */}
          <ModalSection id="keywords-input" title="Target Keywords" description="Set your primary and secondary keywords">
            <div className="space-y-4">
              <FormField label="Primary Keyword">
                <Input
                  value={primaryKeyword}
                  onChange={setPrimaryKeyword}
                  placeholder="Enter your main target keyword"
                />
              </FormField>

              <FormField label="Secondary Keywords">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newKeyword}
                      onChange={setNewKeyword}
                      placeholder="Add secondary keyword"
                    />
                    <button
                      onClick={addSecondaryKeyword}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {secondaryKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {secondaryKeywords.map(kw => (
                        <span
                          key={kw}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm"
                        >
                          {kw}
                          <button
                            onClick={() => removeSecondaryKeyword(kw)}
                            className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </FormField>
            </div>
          </ModalSection>

          {/* Keyword Density */}
          <ModalSection id="keyword-density" title="Keyword Density Analysis" description="How often keywords appear in your content">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Keyword</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Count</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Density</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {keywordDensityData.map(kw => (
                    <tr key={kw.keyword} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{kw.keyword}</td>
                      <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">{kw.count}</td>
                      <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">{kw.density}%</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={kw.status === 'optimal' ? 'success' : kw.status === 'high' ? 'warning' : 'default'}>
                          {kw.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ModalSection>

          {/* Keyword Placement */}
          <ModalSection id="keyword-placement" title="Keyword Placement Check" description="Where your keywords appear">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">In Title</span>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">In First Paragraph</span>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">In Subheadings</span>
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">In URL</span>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">In Image Alt Text</span>
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
            </div>
          </ModalSection>
        </div>
      )}

      {/* Headings Tab */}
      {activeTab === 'headings' && (
        <div className="space-y-6">
          {/* Heading Structure */}
          <ModalSection id="heading-structure" title="Heading Structure" description="Visual representation of your heading hierarchy">
            <div className="space-y-2">
              {headingsStructure.map((heading, index) => (
                <div
                  key={index}
                  className={clsx(
                    'flex items-start gap-3 p-3 rounded-lg transition-colors',
                    heading.issues.length > 0
                      ? 'bg-amber-50 dark:bg-amber-900/20'
                      : 'bg-gray-50 dark:bg-gray-800'
                  )}
                  style={{ marginLeft: (heading.level - 1) * 24 }}
                >
                  <span className={clsx(
                    'flex-shrink-0 px-2 py-0.5 rounded text-xs font-mono font-bold',
                    heading.level === 1 && 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
                    heading.level === 2 && 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
                    heading.level === 3 && 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
                    heading.level >= 4 && 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  )}>
                    H{heading.level}
                  </span>
                  <div className="flex-1">
                    <span className="text-sm text-gray-900 dark:text-white">{heading.text}</span>
                    {heading.issues.map((issue, i) => (
                      <div key={i} className="flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        <span className="text-xs text-amber-600 dark:text-amber-400">{issue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ModalSection>

          {/* Heading Analysis */}
          <ModalSection id="heading-analysis" title="Analysis" description="Heading structure recommendations">
            <div className="space-y-3">
              <IssueItem
                type="success"
                title="Single H1 tag found"
                description="Your page has exactly one H1 tag, which is best practice for SEO."
              />
              <IssueItem
                type="warning"
                title="Heading hierarchy issue"
                description="H4 is used without a preceding H3. Consider adjusting the heading levels."
                action={{ label: 'Fix hierarchy', onClick: () => {} }}
              />
              <IssueItem
                type="warning"
                title="Heading too long"
                description="One heading exceeds 70 characters. Consider shortening it for better display."
                action={{ label: 'Edit heading', onClick: () => {} }}
              />
            </div>
          </ModalSection>

          {/* Settings */}
          <ModalSection id="heading-settings" title="Settings" description="Configure heading analysis">
            <div className="grid grid-cols-2 gap-4">
              <Toggle
                checked={headingsSettings.enforceHierarchy}
                onChange={(v) => setHeadingsSettings(s => ({ ...s, enforceHierarchy: v }))}
                label="Enforce Hierarchy"
                description="Check for proper H1-H6 order"
              />
              <Toggle
                checked={headingsSettings.requireH1}
                onChange={(v) => setHeadingsSettings(s => ({ ...s, requireH1: v }))}
                label="Require H1"
                description="Page must have an H1"
              />
              <Toggle
                checked={headingsSettings.highlightIssues}
                onChange={(v) => setHeadingsSettings(s => ({ ...s, highlightIssues: v }))}
                label="Highlight Issues"
                description="Show problems in editor"
              />
              <Toggle
                checked={headingsSettings.includeKeyword}
                onChange={(v) => setHeadingsSettings(s => ({ ...s, includeKeyword: v }))}
                label="Check Keyword in Headings"
                description="Keyword should be in headings"
              />
            </div>
          </ModalSection>
        </div>
      )}

      {/* Schema Tab */}
      {activeTab === 'schema' && (
        <div className="space-y-6">
          {/* Schema Type */}
          <ModalSection id="schema-type" title="Schema Type" description="Select the appropriate schema type for your content">
            <div className="grid grid-cols-4 gap-3">
              {['Article', 'BlogPosting', 'NewsArticle', 'HowTo', 'FAQ', 'Product', 'Recipe', 'Event'].map(type => (
                <button
                  key={type}
                  onClick={() => setSchemaType(type)}
                  className={clsx(
                    'p-4 rounded-xl border-2 transition-all text-center',
                    schemaType === type
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                >
                  <Code className={clsx(
                    'w-6 h-6 mx-auto mb-2',
                    schemaType === type ? 'text-blue-600' : 'text-gray-400'
                  )} />
                  <span className={clsx(
                    'text-sm font-medium',
                    schemaType === type ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
                  )}>
                    {type}
                  </span>
                </button>
              ))}
            </div>
          </ModalSection>

          {/* Schema Preview */}
          <ModalSection id="schema-preview" title="Schema Preview" description="Generated JSON-LD structured data">
            <div className="relative">
              <pre className="p-4 bg-gray-900 text-green-400 rounded-lg overflow-x-auto text-sm font-mono">
                {JSON.stringify(schemaPreview, null, 2)}
              </pre>
              <div className="absolute top-2 right-2 flex gap-2">
                <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors">
                  <Copy className="w-4 h-4" />
                </button>
                <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </ModalSection>

          {/* Schema Settings */}
          <ModalSection id="schema-settings" title="Schema Options" description="Configure what to include in schema">
            <div className="grid grid-cols-2 gap-4">
              <Toggle
                checked={schemaSettings.autoGenerate}
                onChange={(v) => setSchemaSettings(s => ({ ...s, autoGenerate: v }))}
                label="Auto-generate Schema"
                description="Automatically create schema"
              />
              <Toggle
                checked={schemaSettings.includeAuthor}
                onChange={(v) => setSchemaSettings(s => ({ ...s, includeAuthor: v }))}
                label="Include Author"
                description="Add author information"
              />
              <Toggle
                checked={schemaSettings.includePublisher}
                onChange={(v) => setSchemaSettings(s => ({ ...s, includePublisher: v }))}
                label="Include Publisher"
                description="Add publisher/organization"
              />
              <Toggle
                checked={schemaSettings.includeDatePublished}
                onChange={(v) => setSchemaSettings(s => ({ ...s, includeDatePublished: v }))}
                label="Include Dates"
                description="Add published/modified dates"
              />
              <Toggle
                checked={schemaSettings.includeImage}
                onChange={(v) => setSchemaSettings(s => ({ ...s, includeImage: v }))}
                label="Include Image"
                description="Add featured image"
              />
              <Toggle
                checked={schemaSettings.validateSchema}
                onChange={(v) => setSchemaSettings(s => ({ ...s, validateSchema: v }))}
                label="Validate Schema"
                description="Check for errors"
              />
            </div>
          </ModalSection>
        </div>
      )}

      {/* Internal Links Tab */}
      {activeTab === 'links' && (
        <div className="space-y-6">
          {/* Link Suggestions */}
          <ModalSection id="link-suggestions" title="Suggested Internal Links" description="AI-powered link suggestions based on your content">
            <div className="space-y-3">
              {linkSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Link className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{suggestion.text}</p>
                      <p className="text-sm text-gray-500">{suggestion.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {Math.round(suggestion.relevance * 100)}%
                      </div>
                      <div className="text-xs text-gray-500">relevance</div>
                    </div>
                    <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                      Insert
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ModalSection>

          {/* Current Links */}
          <ModalSection id="current-links" title="Current Internal Links" description="Links already in your content">
            <div className="text-center py-8 text-gray-500">
              <Link className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No internal links found in content</p>
              <p className="text-sm mt-1">Add links to improve navigation and SEO</p>
            </div>
          </ModalSection>

          {/* Settings */}
          <ModalSection id="link-settings" title="Link Settings" description="Configure link suggestions">
            <div className="space-y-4">
              <FormRow columns={2}>
                <FormField label="Max Suggestions">
                  <Input
                    type="number"
                    value={linksSettings.maxSuggestions}
                    onChange={(v) => setLinksSettings(s => ({ ...s, maxSuggestions: parseInt(v) || 5 }))}
                    min={1}
                    max={20}
                  />
                </FormField>
                <FormField label="Min Relevance Score">
                  <Input
                    type="number"
                    value={linksSettings.minRelevanceScore}
                    onChange={(v) => setLinksSettings(s => ({ ...s, minRelevanceScore: parseFloat(v) || 0.5 }))}
                    min={0}
                    max={1}
                    step={0.1}
                  />
                </FormField>
              </FormRow>

              <div className="grid grid-cols-2 gap-4">
                <Toggle
                  checked={linksSettings.enableAutoSuggest}
                  onChange={(v) => setLinksSettings(s => ({ ...s, enableAutoSuggest: v }))}
                  label="Auto-suggest Links"
                  description="Show suggestions while typing"
                />
                <Toggle
                  checked={linksSettings.highlightOrphans}
                  onChange={(v) => setLinksSettings(s => ({ ...s, highlightOrphans: v }))}
                  label="Highlight Orphan Content"
                  description="Show pages with no links"
                />
              </div>
            </div>
          </ModalSection>
        </div>
      )}

      {/* Link Checker Tab */}
      {activeTab === 'checker' && (
        <div className="space-y-6">
          {/* Check Button */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Link Validation</h3>
              <p className="text-sm text-gray-500 mt-1">Check all links in your content</p>
            </div>
            <button
              onClick={runLinkCheck}
              disabled={isChecking}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                isChecking
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              )}
            >
              <RefreshCw className={clsx('w-4 h-4', isChecking && 'animate-spin')} />
              {isChecking ? 'Checking...' : 'Check Links'}
            </button>
          </div>

          {/* Results */}
          <ModalSection id="link-results" title="Link Check Results" description="Status of all links in content">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">URL</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Response</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {linkCheckResults.map((link, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {link.type === 'external' && <ExternalLink className="w-4 h-4 text-gray-400" />}
                          {link.type === 'internal' && <Link className="w-4 h-4 text-gray-400" />}
                          <span className="text-sm text-gray-900 dark:text-white truncate max-w-xs">{link.url}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge>{link.type}</Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {link.status === 200 ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                        ) : link.status === 404 ? (
                          <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-amber-500 mx-auto" />
                        )}
                      </td>
                      <td className="py-3 px-4 text-center text-sm">
                        <span className={clsx(
                          link.status === 200 && 'text-green-600',
                          link.status === 404 && 'text-red-600',
                          link.status === 0 && 'text-amber-600'
                        )}>
                          {link.status} {link.statusText}
                        </span>
                        <span className="text-gray-400 ml-2">({link.responseTime}ms)</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {link.status !== 200 && (
                          <button className="text-sm text-blue-600 hover:text-blue-700">
                            Fix
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ModalSection>

          {/* Settings */}
          <ModalSection id="checker-settings" title="Check Settings" description="Configure link checking behavior">
            <div className="space-y-4">
              <FormRow columns={2}>
                <FormField label="Check Schedule">
                  <Select
                    value={linkCheckerSettings.checkSchedule}
                    onChange={(v) => setLinkCheckerSettings(s => ({ ...s, checkSchedule: v as any }))}
                    options={[
                      { value: 'manual', label: 'Manual Only' },
                      { value: 'daily', label: 'Daily' },
                      { value: 'weekly', label: 'Weekly' },
                      { value: 'monthly', label: 'Monthly' },
                    ]}
                  />
                </FormField>
                <FormField label="Timeout (ms)">
                  <Input
                    type="number"
                    value={linkCheckerSettings.timeout}
                    onChange={(v) => setLinkCheckerSettings(s => ({ ...s, timeout: parseInt(v) || 10000 }))}
                    min={1000}
                    max={30000}
                    step={1000}
                  />
                </FormField>
              </FormRow>

              <div className="grid grid-cols-2 gap-4">
                <Toggle
                  checked={linkCheckerSettings.checkOnSave}
                  onChange={(v) => setLinkCheckerSettings(s => ({ ...s, checkOnSave: v }))}
                  label="Check on Save"
                  description="Validate links when saving"
                />
                <Toggle
                  checked={linkCheckerSettings.checkOnPublish}
                  onChange={(v) => setLinkCheckerSettings(s => ({ ...s, checkOnPublish: v }))}
                  label="Check on Publish"
                  description="Validate before publishing"
                />
                <Toggle
                  checked={linkCheckerSettings.checkInternal}
                  onChange={(v) => setLinkCheckerSettings(s => ({ ...s, checkInternal: v }))}
                  label="Check Internal Links"
                  description="Validate site links"
                />
                <Toggle
                  checked={linkCheckerSettings.checkExternal}
                  onChange={(v) => setLinkCheckerSettings(s => ({ ...s, checkExternal: v }))}
                  label="Check External Links"
                  description="Validate external URLs"
                />
                <Toggle
                  checked={linkCheckerSettings.checkImages}
                  onChange={(v) => setLinkCheckerSettings(s => ({ ...s, checkImages: v }))}
                  label="Check Images"
                  description="Validate image URLs"
                />
                <Toggle
                  checked={linkCheckerSettings.followRedirects}
                  onChange={(v) => setLinkCheckerSettings(s => ({ ...s, followRedirects: v }))}
                  label="Follow Redirects"
                  description="Check final destination"
                />
              </div>
            </div>
          </ModalSection>
        </div>
      )}
    </EditorModal>
  );
};

export default SEOAnalysisModal;
