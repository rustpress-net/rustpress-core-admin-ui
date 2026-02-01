/**
 * MacroInfoPanel Component
 *
 * Displays key post statistics and macro information at a glance.
 * Includes word count, reading time, SEO score, readability, and more.
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Clock,
  Eye,
  BarChart3,
  Link2,
  Image,
  Hash,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  BookOpen,
  Type,
  Heading,
  List,
  MessageSquare,
  Calendar,
  RefreshCw,
  Zap,
  Target,
  Sparkles,
} from 'lucide-react';
import clsx from 'clsx';

// Types
export interface PostStats {
  wordCount: number;
  characterCount: number;
  characterCountNoSpaces: number;
  paragraphCount: number;
  sentenceCount: number;
  readingTime: number; // in minutes
  speakingTime: number; // in minutes
  headings: {
    h1: number;
    h2: number;
    h3: number;
    h4: number;
    h5: number;
    h6: number;
  };
  links: {
    internal: number;
    external: number;
    broken: number;
  };
  images: {
    total: number;
    withAlt: number;
    withoutAlt: number;
  };
  lists: number;
  codeBlocks: number;
}

export interface SEOScore {
  overall: number; // 0-100
  title: { score: number; message: string };
  metaDescription: { score: number; message: string };
  keywords: { score: number; message: string };
  headings: { score: number; message: string };
  images: { score: number; message: string };
  links: { score: number; message: string };
  readability: { score: number; message: string };
}

export interface ReadabilityScore {
  fleschKincaid: number; // Grade level
  fleschReadingEase: number; // 0-100, higher is easier
  gunningFog: number; // Grade level
  automatedReadabilityIndex: number;
  colemanLiauIndex: number;
  averageWordsPerSentence: number;
  averageSyllablesPerWord: number;
  difficulty: 'very_easy' | 'easy' | 'fairly_easy' | 'standard' | 'fairly_difficult' | 'difficult' | 'very_difficult';
}

export interface PostMeta {
  lastSaved?: Date;
  lastPublished?: Date;
  version: number;
  revisions: number;
  status: 'draft' | 'pending' | 'published' | 'scheduled' | 'private';
  views?: number;
  comments?: number;
}

interface MacroInfoPanelProps {
  content: string;
  title?: string;
  metaDescription?: string;
  focusKeyword?: string;
  postMeta?: PostMeta;
  className?: string;
  variant?: 'compact' | 'expanded' | 'sidebar';
  showSEO?: boolean;
  showReadability?: boolean;
  onAnalyze?: () => void;
}

// Utility functions for content analysis
function analyzeContent(content: string): PostStats {
  const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);

  // Count headings
  const h1Count = (content.match(/<h1[^>]*>/gi) || []).length;
  const h2Count = (content.match(/<h2[^>]*>/gi) || []).length;
  const h3Count = (content.match(/<h3[^>]*>/gi) || []).length;
  const h4Count = (content.match(/<h4[^>]*>/gi) || []).length;
  const h5Count = (content.match(/<h5[^>]*>/gi) || []).length;
  const h6Count = (content.match(/<h6[^>]*>/gi) || []).length;

  // Count links
  const internalLinks = (content.match(/<a[^>]*href=["'][^"']*(?:localhost|\/)[^"']*["'][^>]*>/gi) || []).length;
  const allLinks = (content.match(/<a[^>]*href=["'][^"']+["'][^>]*>/gi) || []).length;
  const externalLinks = allLinks - internalLinks;

  // Count images
  const allImages = content.match(/<img[^>]*>/gi) || [];
  const imagesWithAlt = allImages.filter(img => /alt=["'][^"']+["']/i.test(img)).length;

  // Count lists and code blocks
  const lists = (content.match(/<[uo]l[^>]*>/gi) || []).length;
  const codeBlocks = (content.match(/<pre[^>]*>|<code[^>]*>/gi) || []).length;

  const wordCount = words.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200)); // Average reading speed
  const speakingTime = Math.max(1, Math.ceil(wordCount / 150)); // Average speaking speed

  return {
    wordCount,
    characterCount: text.length,
    characterCountNoSpaces: text.replace(/\s/g, '').length,
    paragraphCount: paragraphs.length,
    sentenceCount: sentences.length,
    readingTime,
    speakingTime,
    headings: {
      h1: h1Count,
      h2: h2Count,
      h3: h3Count,
      h4: h4Count,
      h5: h5Count,
      h6: h6Count,
    },
    links: {
      internal: internalLinks,
      external: externalLinks,
      broken: 0, // Would need API call to check
    },
    images: {
      total: allImages.length,
      withAlt: imagesWithAlt,
      withoutAlt: allImages.length - imagesWithAlt,
    },
    lists,
    codeBlocks,
  };
}

function calculateSEOScore(
  content: string,
  title?: string,
  metaDescription?: string,
  focusKeyword?: string,
  stats?: PostStats
): SEOScore {
  const scores: SEOScore = {
    overall: 0,
    title: { score: 0, message: '' },
    metaDescription: { score: 0, message: '' },
    keywords: { score: 0, message: '' },
    headings: { score: 0, message: '' },
    images: { score: 0, message: '' },
    links: { score: 0, message: '' },
    readability: { score: 0, message: '' },
  };

  // Title analysis
  if (!title) {
    scores.title = { score: 0, message: 'Add a title to your post' };
  } else if (title.length < 30) {
    scores.title = { score: 50, message: 'Title is too short (aim for 50-60 characters)' };
  } else if (title.length > 60) {
    scores.title = { score: 70, message: 'Title is too long (aim for 50-60 characters)' };
  } else {
    scores.title = { score: 100, message: 'Title length is optimal' };
  }

  // Meta description analysis
  if (!metaDescription) {
    scores.metaDescription = { score: 0, message: 'Add a meta description' };
  } else if (metaDescription.length < 120) {
    scores.metaDescription = { score: 50, message: 'Meta description is too short (aim for 150-160 characters)' };
  } else if (metaDescription.length > 160) {
    scores.metaDescription = { score: 70, message: 'Meta description is too long' };
  } else {
    scores.metaDescription = { score: 100, message: 'Meta description length is optimal' };
  }

  // Keyword analysis
  if (!focusKeyword) {
    scores.keywords = { score: 30, message: 'Consider adding a focus keyword' };
  } else {
    const keywordLower = focusKeyword.toLowerCase();
    const contentLower = content.toLowerCase();
    const titleLower = (title || '').toLowerCase();

    const keywordInTitle = titleLower.includes(keywordLower);
    const keywordInContent = contentLower.includes(keywordLower);
    const keywordCount = (contentLower.match(new RegExp(keywordLower, 'g')) || []).length;

    if (keywordInTitle && keywordInContent && keywordCount >= 3) {
      scores.keywords = { score: 100, message: 'Keyword usage is optimal' };
    } else if (keywordInContent) {
      scores.keywords = { score: 70, message: 'Add keyword to title for better SEO' };
    } else {
      scores.keywords = { score: 40, message: 'Use your focus keyword more in the content' };
    }
  }

  // Headings analysis
  if (stats) {
    const totalHeadings = Object.values(stats.headings).reduce((a, b) => a + b, 0);
    if (totalHeadings === 0) {
      scores.headings = { score: 30, message: 'Add headings to structure your content' };
    } else if (stats.headings.h1 > 1) {
      scores.headings = { score: 60, message: 'Use only one H1 heading' };
    } else if (stats.headings.h2 >= 2) {
      scores.headings = { score: 100, message: 'Good heading structure' };
    } else {
      scores.headings = { score: 70, message: 'Add more subheadings (H2, H3) for better structure' };
    }

    // Images analysis
    if (stats.images.total === 0) {
      scores.images = { score: 40, message: 'Add images to make content more engaging' };
    } else if (stats.images.withoutAlt > 0) {
      scores.images = { score: 70, message: `${stats.images.withoutAlt} image(s) missing alt text` };
    } else {
      scores.images = { score: 100, message: 'All images have alt text' };
    }

    // Links analysis
    const totalLinks = stats.links.internal + stats.links.external;
    if (totalLinks === 0) {
      scores.links = { score: 50, message: 'Add internal and external links' };
    } else if (stats.links.internal === 0) {
      scores.links = { score: 70, message: 'Add internal links to other content' };
    } else if (stats.links.external === 0) {
      scores.links = { score: 80, message: 'Consider adding external references' };
    } else {
      scores.links = { score: 100, message: 'Good link diversity' };
    }

    // Readability based on word count
    if (stats.wordCount < 300) {
      scores.readability = { score: 50, message: 'Content is too short (aim for 600+ words)' };
    } else if (stats.wordCount < 600) {
      scores.readability = { score: 70, message: 'Consider adding more content' };
    } else if (stats.wordCount > 2500) {
      scores.readability = { score: 90, message: 'Long-form content detected' };
    } else {
      scores.readability = { score: 100, message: 'Content length is good' };
    }
  }

  // Calculate overall score
  const scoreValues = [
    scores.title.score,
    scores.metaDescription.score,
    scores.keywords.score,
    scores.headings.score,
    scores.images.score,
    scores.links.score,
    scores.readability.score,
  ];
  scores.overall = Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length);

  return scores;
}

function calculateReadability(content: string): ReadabilityScore {
  const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

  const wordCount = words.length;
  const sentenceCount = Math.max(1, sentences.length);
  const avgWordsPerSentence = wordCount / sentenceCount;

  // Simplified syllable counting
  const countSyllables = (word: string): number => {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const syllables = word.match(/[aeiouy]{1,2}/g);
    return syllables ? syllables.length : 1;
  };

  const totalSyllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
  const avgSyllablesPerWord = wordCount > 0 ? totalSyllables / wordCount : 0;

  // Flesch Reading Ease
  const fleschReadingEase = Math.max(0, Math.min(100,
    206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
  ));

  // Flesch-Kincaid Grade Level
  const fleschKincaid = Math.max(0,
    (0.39 * avgWordsPerSentence) + (11.8 * avgSyllablesPerWord) - 15.59
  );

  // Gunning Fog Index
  const complexWords = words.filter(word => countSyllables(word) >= 3).length;
  const gunningFog = Math.max(0,
    0.4 * (avgWordsPerSentence + (100 * complexWords / wordCount))
  );

  // Automated Readability Index
  const charCount = text.replace(/\s/g, '').length;
  const automatedReadabilityIndex = Math.max(0,
    (4.71 * (charCount / wordCount)) + (0.5 * avgWordsPerSentence) - 21.43
  );

  // Coleman-Liau Index
  const L = (charCount / wordCount) * 100;
  const S = (sentenceCount / wordCount) * 100;
  const colemanLiauIndex = Math.max(0, (0.0588 * L) - (0.296 * S) - 15.8);

  // Determine difficulty level
  let difficulty: ReadabilityScore['difficulty'];
  if (fleschReadingEase >= 90) difficulty = 'very_easy';
  else if (fleschReadingEase >= 80) difficulty = 'easy';
  else if (fleschReadingEase >= 70) difficulty = 'fairly_easy';
  else if (fleschReadingEase >= 60) difficulty = 'standard';
  else if (fleschReadingEase >= 50) difficulty = 'fairly_difficult';
  else if (fleschReadingEase >= 30) difficulty = 'difficult';
  else difficulty = 'very_difficult';

  return {
    fleschKincaid: Math.round(fleschKincaid * 10) / 10,
    fleschReadingEase: Math.round(fleschReadingEase),
    gunningFog: Math.round(gunningFog * 10) / 10,
    automatedReadabilityIndex: Math.round(automatedReadabilityIndex * 10) / 10,
    colemanLiauIndex: Math.round(colemanLiauIndex * 10) / 10,
    averageWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
    averageSyllablesPerWord: Math.round(avgSyllablesPerWord * 100) / 100,
    difficulty,
  };
}

// Sub-components
function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  color = 'default',
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  color?: 'default' | 'success' | 'warning' | 'error' | 'info';
}) {
  const colorClasses = {
    default: 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
    success: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    warning: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
    error: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    info: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  };

  return (
    <div className={clsx(
      'flex items-center gap-3 rounded-lg p-3 transition-all hover:scale-[1.02]',
      colorClasses[color]
    )}>
      <div className="flex-shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium opacity-70">{label}</p>
        <p className="text-lg font-bold">{value}</p>
        {subValue && (
          <p className="text-xs opacity-60">{subValue}</p>
        )}
      </div>
    </div>
  );
}

function ScoreRing({
  score,
  size = 'md',
  label,
}: {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}) {
  const sizeConfig = {
    sm: { ring: 48, stroke: 4, text: 'text-sm' },
    md: { ring: 64, stroke: 5, text: 'text-lg' },
    lg: { ring: 80, stroke: 6, text: 'text-xl' },
  };

  const config = sizeConfig[size];
  const radius = (config.ring - config.stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: config.ring, height: config.ring }}>
        <svg className="transform -rotate-90" width={config.ring} height={config.ring}>
          <circle
            className="text-gray-200 dark:text-gray-700"
            strokeWidth={config.stroke}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={config.ring / 2}
            cy={config.ring / 2}
          />
          <motion.circle
            className={getColor()}
            strokeWidth={config.stroke}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={config.ring / 2}
            cy={config.ring / 2}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={clsx('font-bold', config.text, getColor())}>{score}</span>
        </div>
      </div>
      {label && (
        <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      )}
    </div>
  );
}

function SEOChecklist({ seoScore }: { seoScore: SEOScore }) {
  const items = [
    { key: 'title', label: 'Title', ...seoScore.title },
    { key: 'metaDescription', label: 'Meta Description', ...seoScore.metaDescription },
    { key: 'keywords', label: 'Keywords', ...seoScore.keywords },
    { key: 'headings', label: 'Headings', ...seoScore.headings },
    { key: 'images', label: 'Images', ...seoScore.images },
    { key: 'links', label: 'Links', ...seoScore.links },
    { key: 'readability', label: 'Content Length', ...seoScore.readability },
  ];

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.key}
          className="flex items-start gap-2 text-sm"
        >
          {item.score >= 80 ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
          ) : item.score >= 50 ? (
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
          )}
          <div className="min-w-0 flex-1">
            <span className="font-medium">{item.label}</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">{item.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReadabilityGauge({ readability }: { readability: ReadabilityScore }) {
  const difficultyLabels = {
    very_easy: 'Very Easy',
    easy: 'Easy',
    fairly_easy: 'Fairly Easy',
    standard: 'Standard',
    fairly_difficult: 'Fairly Difficult',
    difficult: 'Difficult',
    very_difficult: 'Very Difficult',
  };

  const difficultyColors = {
    very_easy: 'text-green-500',
    easy: 'text-green-400',
    fairly_easy: 'text-lime-500',
    standard: 'text-yellow-500',
    fairly_difficult: 'text-orange-400',
    difficult: 'text-orange-500',
    very_difficult: 'text-red-500',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Reading Ease</span>
        <span className={clsx('text-sm font-bold', difficultyColors[readability.difficulty])}>
          {difficultyLabels[readability.difficulty]}
        </span>
      </div>

      <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
        <motion.div
          className={clsx('h-full rounded-full', {
            'bg-green-500': readability.fleschReadingEase >= 70,
            'bg-yellow-500': readability.fleschReadingEase >= 50 && readability.fleschReadingEase < 70,
            'bg-red-500': readability.fleschReadingEase < 50,
          })}
          initial={{ width: 0 }}
          animate={{ width: `${readability.fleschReadingEase}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
          <span className="text-gray-500">Grade Level</span>
          <p className="font-bold">{readability.fleschKincaid}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
          <span className="text-gray-500">Avg Words/Sentence</span>
          <p className="font-bold">{readability.averageWordsPerSentence}</p>
        </div>
      </div>
    </div>
  );
}

// Main component
export function MacroInfoPanel({
  content,
  title,
  metaDescription,
  focusKeyword,
  postMeta,
  className,
  variant = 'expanded',
  showSEO = true,
  showReadability = true,
  onAnalyze,
}: MacroInfoPanelProps) {
  // Analyze content
  const stats = useMemo(() => analyzeContent(content), [content]);
  const seoScore = useMemo(
    () => calculateSEOScore(content, title, metaDescription, focusKeyword, stats),
    [content, title, metaDescription, focusKeyword, stats]
  );
  const readability = useMemo(() => calculateReadability(content), [content]);

  // Format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={clsx(
          'flex items-center gap-4 rounded-lg border bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-900',
          className
        )}
      >
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <FileText className="h-4 w-4" />
          <span className="font-medium">{stats.wordCount}</span>
          <span className="text-gray-400">words</span>
        </div>

        <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />

        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <Clock className="h-4 w-4" />
          <span className="font-medium">{stats.readingTime}</span>
          <span className="text-gray-400">min read</span>
        </div>

        {showSEO && (
          <>
            <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              <ScoreRing score={seoScore.overall} size="sm" />
            </div>
          </>
        )}

        {postMeta?.lastSaved && (
          <>
            <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <RefreshCw className="h-4 w-4" />
              <span>{formatRelativeTime(postMeta.lastSaved)}</span>
            </div>
          </>
        )}
      </motion.div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className={clsx(
          'space-y-6 rounded-lg border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900',
          className
        )}
      >
        {/* SEO Score */}
        {showSEO && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-semibold">
                <Target className="h-4 w-4" />
                SEO Score
              </h3>
              <ScoreRing score={seoScore.overall} size="md" />
            </div>
            <SEOChecklist seoScore={seoScore} />
          </div>
        )}

        {/* Readability */}
        {showReadability && (
          <div className="space-y-4 border-t pt-4 dark:border-gray-700">
            <h3 className="flex items-center gap-2 font-semibold">
              <BookOpen className="h-4 w-4" />
              Readability
            </h3>
            <ReadabilityGauge readability={readability} />
          </div>
        )}

        {/* Quick Stats */}
        <div className="space-y-3 border-t pt-4 dark:border-gray-700">
          <h3 className="flex items-center gap-2 font-semibold">
            <BarChart3 className="h-4 w-4" />
            Content Stats
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-400" />
              <span>{stats.wordCount} words</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>{stats.readingTime} min read</span>
            </div>
            <div className="flex items-center gap-2">
              <Image className="h-4 w-4 text-gray-400" />
              <span>{stats.images.total} images</span>
            </div>
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-gray-400" />
              <span>{stats.links.internal + stats.links.external} links</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Expanded variant (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'rounded-xl border bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-2">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">Content Analysis</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Real-time insights for your post
            </p>
          </div>
        </div>

        {onAnalyze && (
          <button
            onClick={onAnalyze}
            className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <Zap className="h-4 w-4" />
            Deep Analyze
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Top Row - Key Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={FileText}
            label="Words"
            value={stats.wordCount.toLocaleString()}
            subValue={`${stats.characterCount.toLocaleString()} chars`}
            color="info"
          />
          <StatCard
            icon={Clock}
            label="Reading Time"
            value={`${stats.readingTime} min`}
            subValue={`${stats.speakingTime} min speaking`}
            color="default"
          />
          <StatCard
            icon={Heading}
            label="Headings"
            value={Object.values(stats.headings).reduce((a, b) => a + b, 0)}
            subValue={`H1: ${stats.headings.h1}, H2: ${stats.headings.h2}`}
            color={stats.headings.h1 === 1 && stats.headings.h2 >= 2 ? 'success' : 'warning'}
          />
          <StatCard
            icon={Image}
            label="Images"
            value={stats.images.total}
            subValue={stats.images.withoutAlt > 0 ? `${stats.images.withoutAlt} missing alt` : 'All have alt'}
            color={stats.images.withoutAlt > 0 ? 'warning' : 'success'}
          />
        </div>

        {/* Second Row - More Stats */}
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={Link2}
            label="Links"
            value={stats.links.internal + stats.links.external}
            subValue={`${stats.links.internal} internal, ${stats.links.external} external`}
            color="default"
          />
          <StatCard
            icon={List}
            label="Lists"
            value={stats.lists}
            color="default"
          />
          <StatCard
            icon={Type}
            label="Paragraphs"
            value={stats.paragraphCount}
            subValue={`${stats.sentenceCount} sentences`}
            color="default"
          />
          <StatCard
            icon={Hash}
            label="Code Blocks"
            value={stats.codeBlocks}
            color="default"
          />
        </div>

        {/* SEO and Readability Row */}
        {(showSEO || showReadability) && (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* SEO Score */}
            {showSEO && (
              <div className="rounded-lg border p-4 dark:border-gray-700">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="flex items-center gap-2 font-semibold">
                    <Target className="h-4 w-4" />
                    SEO Analysis
                  </h4>
                  <ScoreRing score={seoScore.overall} size="md" label="Score" />
                </div>
                <SEOChecklist seoScore={seoScore} />
              </div>
            )}

            {/* Readability */}
            {showReadability && (
              <div className="rounded-lg border p-4 dark:border-gray-700">
                <h4 className="mb-4 flex items-center gap-2 font-semibold">
                  <BookOpen className="h-4 w-4" />
                  Readability Analysis
                </h4>
                <ReadabilityGauge readability={readability} />

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
                    <span className="text-gray-500">Gunning Fog</span>
                    <p className="font-bold">{readability.gunningFog}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
                    <span className="text-gray-500">Coleman-Liau</span>
                    <p className="font-bold">{readability.colemanLiauIndex}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Post Meta */}
        {postMeta && (
          <div className="mt-6 flex flex-wrap items-center gap-4 border-t pt-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            {postMeta.lastSaved && (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                <span>Saved {formatRelativeTime(postMeta.lastSaved)}</span>
              </div>
            )}

            {postMeta.version > 1 && (
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>v{postMeta.version} ({postMeta.revisions} revisions)</span>
              </div>
            )}

            {postMeta.views !== undefined && (
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{postMeta.views.toLocaleString()} views</span>
              </div>
            )}

            {postMeta.comments !== undefined && (
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>{postMeta.comments} comments</span>
              </div>
            )}

            {postMeta.lastPublished && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Published {formatRelativeTime(postMeta.lastPublished)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default MacroInfoPanel;
