/**
 * AIToolsModal - Enterprise AI Enhancement Tools Modal
 *
 * Comprehensive modal for AI-powered content enhancement:
 * - AI Writing Assistant (grammar, tone, style)
 * - AI Content Generation (outlines, paragraphs, conclusions)
 * - AI Image Tools (generation, enhancement, alt text)
 * - AI SEO Optimization (suggestions, keywords, meta)
 * - AI Translation (multi-language support)
 * - AI Summarization (TL;DR, key points)
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Wand2,
  FileText,
  Image,
  Search,
  Languages,
  FileSearch,
  Zap,
  RefreshCw,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  MessageSquare,
  PenTool,
  BookOpen,
  Target,
  TrendingUp,
  AlertCircle,
  Info,
  Star,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Send,
  Loader2,
  Mic,
  Volume2,
  Eye,
  Hash,
  Type,
  AlignLeft,
  List,
  Heading,
  Quote,
  ArrowRight,
  Globe,
  Brain,
  Palette,
  Scissors,
  Expand,
  Shrink,
  Settings,
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

interface AIToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  onInsertContent: (content: string) => void;
  onReplaceContent: (content: string) => void;
  initialTab?: AITab;
  hideTabs?: boolean;
}

type AITab = 'assistant' | 'generate' | 'image' | 'seo' | 'translate' | 'summarize';

// Tab titles and subtitles for single-tab mode
const aiTabTitles: Record<string, { title: string; subtitle: string }> = {
  assistant: { title: 'AI Writing Assistant', subtitle: 'Improve grammar, tone, and writing style' },
  generate: { title: 'AI Content Generator', subtitle: 'Generate outlines, paragraphs, and more' },
  image: { title: 'AI Image Tools', subtitle: 'Generate images, alt text, and enhancements' },
  seo: { title: 'AI SEO Optimizer', subtitle: 'Get AI-powered SEO recommendations' },
  translate: { title: 'AI Translator', subtitle: 'Translate content to multiple languages' },
  summarize: { title: 'AI Summarizer', subtitle: 'Generate summaries and key points' },
};

// Tone options for writing assistant
const toneOptions = [
  { value: 'professional', label: 'Professional', description: 'Formal and business-appropriate' },
  { value: 'casual', label: 'Casual', description: 'Friendly and conversational' },
  { value: 'academic', label: 'Academic', description: 'Scholarly and research-focused' },
  { value: 'creative', label: 'Creative', description: 'Engaging and imaginative' },
  { value: 'persuasive', label: 'Persuasive', description: 'Convincing and compelling' },
  { value: 'informative', label: 'Informative', description: 'Clear and educational' },
  { value: 'enthusiastic', label: 'Enthusiastic', description: 'Energetic and exciting' },
  { value: 'empathetic', label: 'Empathetic', description: 'Understanding and supportive' },
];

// Writing actions
const writingActions = [
  { id: 'grammar', label: 'Fix Grammar', icon: Check, description: 'Correct grammar and spelling errors' },
  { id: 'clarity', label: 'Improve Clarity', icon: Eye, description: 'Make text clearer and more readable' },
  { id: 'concise', label: 'Make Concise', icon: Shrink, description: 'Shorten without losing meaning' },
  { id: 'expand', label: 'Expand', icon: Expand, description: 'Add more detail and depth' },
  { id: 'rephrase', label: 'Rephrase', icon: RefreshCw, description: 'Rewrite in different words' },
  { id: 'simplify', label: 'Simplify', icon: Type, description: 'Use simpler language' },
  { id: 'formal', label: 'Make Formal', icon: FileText, description: 'Increase formality' },
  { id: 'casual', label: 'Make Casual', icon: MessageSquare, description: 'Make more conversational' },
];

// Content generation types
const generationTypes = [
  { id: 'outline', label: 'Article Outline', icon: List, description: 'Generate a structured outline' },
  { id: 'intro', label: 'Introduction', icon: ArrowRight, description: 'Write an engaging opening' },
  { id: 'paragraph', label: 'Paragraph', icon: AlignLeft, description: 'Generate a full paragraph' },
  { id: 'conclusion', label: 'Conclusion', icon: Target, description: 'Write a compelling ending' },
  { id: 'heading', label: 'Headlines', icon: Heading, description: 'Generate catchy headlines' },
  { id: 'bullet', label: 'Bullet Points', icon: List, description: 'Create concise bullet points' },
  { id: 'quote', label: 'Pull Quote', icon: Quote, description: 'Extract or create a pull quote' },
  { id: 'cta', label: 'Call to Action', icon: Zap, description: 'Create compelling CTAs' },
];

// Image generation styles
const imageStyles = [
  { value: 'realistic', label: 'Realistic', preview: 'Photo-realistic imagery' },
  { value: 'illustration', label: 'Illustration', preview: 'Hand-drawn style' },
  { value: 'digital-art', label: 'Digital Art', preview: 'Modern digital artwork' },
  { value: 'watercolor', label: 'Watercolor', preview: 'Soft watercolor painting' },
  { value: '3d-render', label: '3D Render', preview: 'Three-dimensional render' },
  { value: 'minimalist', label: 'Minimalist', preview: 'Clean and simple' },
  { value: 'vintage', label: 'Vintage', preview: 'Retro/nostalgic style' },
  { value: 'abstract', label: 'Abstract', preview: 'Non-representational art' },
];

// Supported languages
const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
];

export const AIToolsModal: React.FC<AIToolsModalProps> = ({
  isOpen,
  onClose,
  content,
  onInsertContent,
  onReplaceContent,
  initialTab,
  hideTabs = false,
}) => {
  const [activeTab, setActiveTab] = useState<AITab>(initialTab || 'assistant');

  // Sync activeTab with initialTab prop changes (fixes single-tab mode)
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Get title and subtitle based on single-tab mode
  const currentTabInfo = aiTabTitles[activeTab] || { title: 'AI Tools', subtitle: 'AI-powered content enhancement' };
  const modalTitle = hideTabs ? currentTabInfo.title : 'AI Tools';
  const modalSubtitle = hideTabs ? currentTabInfo.subtitle : 'AI-powered content enhancement';

  // Shared state
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedText, setSelectedText] = useState(content.slice(0, 500));
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Writing Assistant state
  const [selectedTone, setSelectedTone] = useState('professional');
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');

  // Content Generator state
  const [generationType, setGenerationType] = useState<string | null>(null);
  const [generationTopic, setGenerationTopic] = useState('');
  const [generationContext, setGenerationContext] = useState('');
  const [wordCount, setWordCount] = useState(150);

  // Image Tools state
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageStyle, setImageStyle] = useState('realistic');
  const [imageSize, setImageSize] = useState('1024x1024');
  const [altTextInput, setAltTextInput] = useState('');
  const [generatedAltText, setGeneratedAltText] = useState('');

  // SEO Optimizer state
  const [seoKeyword, setSeoKeyword] = useState('');
  const [seoSuggestions, setSeoSuggestions] = useState<string[]>([]);

  // Translation state
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [preserveFormatting, setPreserveFormatting] = useState(true);

  // Summarization state
  const [summaryType, setSummaryType] = useState<'tldr' | 'bullets' | 'abstract'>('tldr');
  const [summaryLength, setSummaryLength] = useState<'short' | 'medium' | 'long'>('medium');

  // AI History
  const [aiHistory, setAiHistory] = useState<{ action: string; input: string; output: string; timestamp: Date }[]>([]);

  // Simulate AI processing
  const simulateAI = async (action: string, input: string): Promise<string> => {
    setIsProcessing(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);

    // Mock responses based on action
    const mockResponses: Record<string, string> = {
      grammar: 'The corrected text with improved grammar and spelling would appear here.',
      clarity: 'The clarified version of your text with improved readability.',
      concise: 'A shorter, more concise version of the original text.',
      expand: 'An expanded version with more details, examples, and context.',
      rephrase: 'The same content expressed in different words.',
      simplify: 'A simplified version using easier vocabulary.',
      outline: '1. Introduction\n   - Hook statement\n   - Background context\n\n2. Main Point 1\n   - Supporting detail\n   - Example\n\n3. Main Point 2\n   - Supporting detail\n   - Example\n\n4. Conclusion\n   - Summary\n   - Call to action',
      intro: 'In today\'s rapidly evolving digital landscape, understanding the fundamentals of effective content creation has become more crucial than ever...',
      paragraph: 'This generated paragraph would contain well-structured content based on your topic and context, with smooth transitions and engaging language.',
      conclusion: 'In conclusion, the evidence presented demonstrates the significant impact of these strategies on overall success...',
      heading: '5 Proven Strategies to Transform Your Content Marketing\nThe Ultimate Guide to Writing Headlines That Convert\nWhy Your Content Strategy Needs an Immediate Overhaul',
      bullet: '- Key point one with concise explanation\n- Key point two highlighting benefits\n- Key point three with actionable insight\n- Key point four summarizing impact',
      translate: 'La traducción de tu contenido aparecería aquí con formato preservado.',
      tldr: 'TL;DR: This is a brief one-sentence summary of the main point of your content.',
      bullets: '- Key Point 1: Main takeaway from the content\n- Key Point 2: Important detail to remember\n- Key Point 3: Action item or conclusion',
      abstract: 'This abstract provides a comprehensive overview of the content, summarizing the main arguments, key findings, and conclusions in a cohesive paragraph.',
      seo: '1. Add focus keyword to title tag\n2. Include keyword in first 100 words\n3. Add internal links to related content\n4. Optimize meta description length\n5. Add alt text to images',
      alttext: 'A professional workspace featuring a laptop computer on a wooden desk, with natural lighting from a nearby window, creating a productive atmosphere.',
    };

    return mockResponses[action] || 'AI-generated content would appear here based on your request.';
  };

  const handleAIAction = async (action: string, input: string) => {
    const result = await simulateAI(action, input);
    setAiResult(result);
    setAiHistory(prev => [{
      action,
      input: input.slice(0, 100) + (input.length > 100 ? '...' : ''),
      output: result,
      timestamp: new Date(),
    }, ...prev]);
  };

  const handleCopyResult = () => {
    if (aiResult) {
      navigator.clipboard.writeText(aiResult);
    }
  };

  const handleInsertResult = () => {
    if (aiResult) {
      onInsertContent(aiResult);
      onClose();
    }
  };

  const handleReplaceResult = () => {
    if (aiResult) {
      onReplaceContent(aiResult);
      onClose();
    }
  };

  const tabs = [
    { id: 'assistant', label: 'Writing Assistant', icon: PenTool, badge: '' },
    { id: 'generate', label: 'Generate', icon: Sparkles, badge: 'NEW' },
    { id: 'image', label: 'Image AI', icon: Image, badge: '' },
    { id: 'seo', label: 'SEO AI', icon: Search, badge: '' },
    { id: 'translate', label: 'Translate', icon: Languages, badge: '' },
    { id: 'summarize', label: 'Summarize', icon: FileSearch, badge: '' },
  ];

  return (
    <EditorModal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      subtitle={modalSubtitle}
      icon={Brain}
      iconColor="purple"
      size={hideTabs ? 'lg' : 'xl'}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tab) => {
        setActiveTab(tab as AITab);
        setAiResult(null);
      }}
      hideTabs={hideTabs}
      showSave={!!aiResult}
      saveLabel="Insert Result"
      onSave={handleInsertResult}
      headerActions={
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={clsx(
            'p-2 rounded-lg transition-colors',
            showHistory ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
          title="AI History"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      }
    >
      <div className="space-y-6">
        {/* Processing Indicator */}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl"
          >
            <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
            <span className="text-purple-700 dark:text-purple-300 font-medium">AI is processing your request...</span>
          </motion.div>
        )}

        {/* Writing Assistant Tab */}
        {activeTab === 'assistant' && (
          <div className="space-y-6">
            {/* Input Text */}
            <ModalSection title="Selected Text" icon={FileText}>
              <Textarea
                value={selectedText}
                onChange={setSelectedText}
                rows={4}
                placeholder="Paste or type the text you want to improve..."
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">{selectedText.length} characters</span>
                <button
                  onClick={() => setSelectedText(content.slice(0, 1000))}
                  className="text-xs text-purple-600 hover:text-purple-700"
                >
                  Use editor content
                </button>
              </div>
            </ModalSection>

            {/* Tone Selection */}
            <ModalSection title="Target Tone" icon={MessageSquare}>
              <div className="grid grid-cols-4 gap-2">
                {toneOptions.map(tone => (
                  <button
                    key={tone.value}
                    onClick={() => setSelectedTone(tone.value)}
                    className={clsx(
                      'p-3 rounded-lg border text-left transition-all',
                      selectedTone === tone.value
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    )}
                  >
                    <div className="font-medium text-sm text-gray-900 dark:text-white">{tone.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{tone.description}</div>
                  </button>
                ))}
              </div>
            </ModalSection>

            {/* Quick Actions */}
            <ModalSection title="Quick Actions" icon={Zap}>
              <div className="grid grid-cols-4 gap-3">
                {writingActions.map(action => (
                  <motion.button
                    key={action.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAIAction(action.id, selectedText)}
                    disabled={isProcessing || !selectedText}
                    className={clsx(
                      'p-4 rounded-xl border transition-all text-left',
                      'border-gray-200 dark:border-gray-700',
                      'hover:border-purple-300 dark:hover:border-purple-700',
                      'hover:bg-purple-50 dark:hover:bg-purple-900/10',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  >
                    <action.icon className="w-5 h-5 text-purple-600 mb-2" />
                    <div className="font-medium text-sm text-gray-900 dark:text-white">{action.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{action.description}</div>
                  </motion.button>
                ))}
              </div>
            </ModalSection>

            {/* Custom Prompt */}
            <ModalSection title="Custom Instructions" icon={Wand2}>
              <div className="flex gap-2">
                <Input
                  value={customPrompt}
                  onChange={setCustomPrompt}
                  placeholder="E.g., 'Make it more engaging for young professionals'"
                  className="flex-1"
                />
                <button
                  onClick={() => handleAIAction('custom', `${customPrompt}: ${selectedText}`)}
                  disabled={isProcessing || !customPrompt || !selectedText}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Apply
                </button>
              </div>
            </ModalSection>
          </div>
        )}

        {/* Content Generator Tab */}
        {activeTab === 'generate' && (
          <div className="space-y-6">
            {/* Generation Type */}
            <ModalSection title="What to Generate" icon={Sparkles}>
              <div className="grid grid-cols-4 gap-3">
                {generationTypes.map(type => (
                  <motion.button
                    key={type.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setGenerationType(type.id)}
                    className={clsx(
                      'p-4 rounded-xl border transition-all text-left',
                      generationType === type.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    )}
                  >
                    <type.icon className="w-5 h-5 text-purple-600 mb-2" />
                    <div className="font-medium text-sm text-gray-900 dark:text-white">{type.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                  </motion.button>
                ))}
              </div>
            </ModalSection>

            {/* Topic & Context */}
            <div className="grid grid-cols-2 gap-4">
              <ModalSection title="Topic" icon={Target}>
                <Input
                  value={generationTopic}
                  onChange={setGenerationTopic}
                  placeholder="E.g., 'Benefits of remote work'"
                />
              </ModalSection>

              <ModalSection title="Word Count" icon={Hash}>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={50}
                    max={500}
                    step={10}
                    value={wordCount}
                    onChange={(e) => setWordCount(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-16">~{wordCount}</span>
                </div>
              </ModalSection>
            </div>

            <ModalSection title="Additional Context (Optional)" icon={BookOpen}>
              <Textarea
                value={generationContext}
                onChange={setGenerationContext}
                rows={3}
                placeholder="Add any relevant context, keywords, or specific requirements..."
              />
            </ModalSection>

            {/* Generate Button */}
            <button
              onClick={() => handleAIAction(generationType || 'paragraph', `Topic: ${generationTopic}. Context: ${generationContext}`)}
              disabled={isProcessing || !generationType || !generationTopic}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Content
                </>
              )}
            </button>
          </div>
        )}

        {/* Image AI Tab */}
        {activeTab === 'image' && (
          <div className="space-y-6">
            {/* Image Generation */}
            <ModalSection title="Generate Image" icon={Image}>
              <Textarea
                value={imagePrompt}
                onChange={setImagePrompt}
                rows={3}
                placeholder="Describe the image you want to generate..."
              />

              <div className="grid grid-cols-2 gap-4 mt-4">
                <FormField label="Style">
                  <Select
                    value={imageStyle}
                    onChange={setImageStyle}
                    options={imageStyles.map(s => ({ value: s.value, label: s.label }))}
                  />
                </FormField>

                <FormField label="Size">
                  <Select
                    value={imageSize}
                    onChange={setImageSize}
                    options={[
                      { value: '512x512', label: '512x512 (Square)' },
                      { value: '1024x1024', label: '1024x1024 (Large)' },
                      { value: '1024x768', label: '1024x768 (Landscape)' },
                      { value: '768x1024', label: '768x1024 (Portrait)' },
                    ]}
                  />
                </FormField>
              </div>

              <button
                onClick={() => handleAIAction('image', imagePrompt)}
                disabled={isProcessing || !imagePrompt}
                className="w-full mt-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Image...
                  </>
                ) : (
                  <>
                    <Palette className="w-5 h-5" />
                    Generate Image
                  </>
                )}
              </button>
            </ModalSection>

            {/* Alt Text Generator */}
            <ModalSection title="Generate Alt Text" icon={Type}>
              <div className="p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-center">
                <Image className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-3">Upload or paste an image to generate alt text</p>
                <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700">
                  Select Image
                </button>
              </div>

              {generatedAltText && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-green-800 dark:text-green-300">Generated Alt Text:</div>
                      <div className="text-sm text-green-700 dark:text-green-400 mt-1">{generatedAltText}</div>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(generatedAltText)}
                      className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
                    >
                      <Copy className="w-4 h-4 text-green-600" />
                    </button>
                  </div>
                </div>
              )}
            </ModalSection>
          </div>
        )}

        {/* SEO AI Tab */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <ModalSection title="Focus Keyword" icon={Target}>
              <div className="flex gap-2">
                <Input
                  value={seoKeyword}
                  onChange={setSeoKeyword}
                  placeholder="Enter your target keyword..."
                  className="flex-1"
                />
                <button
                  onClick={() => handleAIAction('seo', `Keyword: ${seoKeyword}, Content: ${content.slice(0, 500)}`)}
                  disabled={isProcessing || !seoKeyword}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Analyze
                </button>
              </div>
            </ModalSection>

            {/* SEO Quick Actions */}
            <ModalSection title="AI SEO Tools" icon={Search}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'meta-title', label: 'Generate Meta Title', icon: Heading, description: 'Create SEO-optimized title' },
                  { id: 'meta-desc', label: 'Generate Meta Description', icon: FileText, description: 'Write compelling description' },
                  { id: 'keywords', label: 'Suggest Keywords', icon: Hash, description: 'Find related keywords' },
                  { id: 'optimize', label: 'Content Optimization', icon: TrendingUp, description: 'Get improvement suggestions' },
                ].map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => handleAIAction(tool.id, content.slice(0, 500))}
                    disabled={isProcessing}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all text-left"
                  >
                    <tool.icon className="w-5 h-5 text-purple-600 mb-2" />
                    <div className="font-medium text-sm text-gray-900 dark:text-white">{tool.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{tool.description}</div>
                  </button>
                ))}
              </div>
            </ModalSection>
          </div>
        )}

        {/* Translate Tab */}
        {activeTab === 'translate' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <ModalSection title="Source Language" icon={Globe}>
                <Select
                  value={sourceLanguage}
                  onChange={setSourceLanguage}
                  options={languages.map(l => ({ value: l.code, label: `${l.flag} ${l.name}` }))}
                />
              </ModalSection>

              <ModalSection title="Target Language" icon={Languages}>
                <Select
                  value={targetLanguage}
                  onChange={setTargetLanguage}
                  options={languages.map(l => ({ value: l.code, label: `${l.flag} ${l.name}` }))}
                />
              </ModalSection>
            </div>

            <ModalSection title="Text to Translate" icon={FileText}>
              <Textarea
                value={selectedText}
                onChange={setSelectedText}
                rows={5}
                placeholder="Enter text to translate..."
              />
            </ModalSection>

            <div className="flex items-center justify-between">
              <Toggle
                checked={preserveFormatting}
                onChange={setPreserveFormatting}
                label="Preserve formatting (HTML, Markdown)"
              />
            </div>

            <button
              onClick={() => handleAIAction('translate', selectedText)}
              disabled={isProcessing || !selectedText || sourceLanguage === targetLanguage}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <Languages className="w-5 h-5" />
                  Translate
                </>
              )}
            </button>
          </div>
        )}

        {/* Summarize Tab */}
        {activeTab === 'summarize' && (
          <div className="space-y-6">
            <ModalSection title="Summary Type" icon={FileSearch}>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'tldr', label: 'TL;DR', icon: Zap, description: 'One sentence summary' },
                  { id: 'bullets', label: 'Key Points', icon: List, description: 'Bullet point summary' },
                  { id: 'abstract', label: 'Abstract', icon: FileText, description: 'Paragraph summary' },
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => setSummaryType(type.id as typeof summaryType)}
                    className={clsx(
                      'p-4 rounded-xl border transition-all text-left',
                      summaryType === type.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    )}
                  >
                    <type.icon className="w-5 h-5 text-purple-600 mb-2" />
                    <div className="font-medium text-sm text-gray-900 dark:text-white">{type.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                  </button>
                ))}
              </div>
            </ModalSection>

            <ModalSection title="Content to Summarize" icon={FileText}>
              <Textarea
                value={selectedText}
                onChange={setSelectedText}
                rows={6}
                placeholder="Paste the content you want to summarize..."
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">{selectedText.split(/\s+/).filter(Boolean).length} words</span>
                <button
                  onClick={() => setSelectedText(content)}
                  className="text-xs text-purple-600 hover:text-purple-700"
                >
                  Use full content
                </button>
              </div>
            </ModalSection>

            <button
              onClick={() => handleAIAction(summaryType, selectedText)}
              disabled={isProcessing || !selectedText}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Summarizing...
                </>
              ) : (
                <>
                  <FileSearch className="w-5 h-5" />
                  Generate Summary
                </>
              )}
            </button>
          </div>
        )}

        {/* AI Result */}
        {aiResult && !isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <ModalSection title="AI Result" icon={Sparkles}>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">{aiResult}</div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyResult}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleAIAction(selectedAction || 'rephrase', aiResult)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Regenerate"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleInsertResult}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Insert at Cursor
                  </button>
                  <button
                    onClick={handleReplaceResult}
                    className="px-4 py-2 border border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 flex items-center gap-2"
                  >
                    <Scissors className="w-4 h-4" />
                    Replace Selection
                  </button>
                </div>
              </div>
            </ModalSection>
          </motion.div>
        )}

        {/* AI History Panel */}
        <AnimatePresence>
          {showHistory && aiHistory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <ModalSection title="Recent AI Actions" icon={RotateCcw}>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {aiHistory.slice(0, 5).map((item, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setAiResult(item.output)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{item.action}</span>
                        <span className="text-xs text-gray-500">
                          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 truncate">{item.input}</p>
                    </div>
                  ))}
                </div>
              </ModalSection>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </EditorModal>
  );
};

export default AIToolsModal;
