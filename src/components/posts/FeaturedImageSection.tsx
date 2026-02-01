import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image,
  Upload,
  X,
  RefreshCw,
  Sparkles,
  Crop,
  Palette,
  ZoomIn,
  Link,
  AlertCircle,
  Check,
  Camera,
  Wand2
} from 'lucide-react';
import clsx from 'clsx';

interface FeaturedImageSectionProps {
  imageUrl?: string;
  imageAlt?: string;
  imageCaption?: string;
  onImageChange: (data: FeaturedImageData) => void;
  postTitle?: string;
  className?: string;
}

export interface FeaturedImageData {
  url: string;
  alt: string;
  caption: string;
  focalPoint?: { x: number; y: number };
  credit?: string;
}

interface AIImageSuggestion {
  url: string;
  description: string;
  source: string;
}

export const FeaturedImageSection: React.FC<FeaturedImageSectionProps> = ({
  imageUrl,
  imageAlt = '',
  imageCaption = '',
  onImageChange,
  postTitle = '',
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [currentImage, setCurrentImage] = useState<FeaturedImageData>({
    url: imageUrl || '',
    alt: imageAlt,
    caption: imageCaption
  });
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'ai' | 'library'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [focalPoint, setFocalPoint] = useState({ x: 50, y: 50 });
  const [showFocalPointEditor, setShowFocalPointEditor] = useState(false);

  // Mock AI suggestions based on post title
  const aiSuggestions: AIImageSuggestion[] = [
    { url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643', description: 'Laptop with coffee - perfect for blog posts', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f', description: 'Workspace with notebook', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e', description: 'Writing desk setup', source: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8', description: 'Person typing on laptop', source: 'Unsplash' },
  ];

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // Simulate upload - replace with actual API call
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Mock response - replace with actual upload
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockUrl = URL.createObjectURL(file);
      const newImageData = {
        ...currentImage,
        url: mockUrl,
        alt: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
      };

      setCurrentImage(newImageData);
      onImageChange(newImageData);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  }, [currentImage, onImageChange]);

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;

    const newImageData = {
      ...currentImage,
      url: urlInput,
      alt: currentImage.alt || 'Featured image'
    };

    setCurrentImage(newImageData);
    onImageChange(newImageData);
    setUrlInput('');
  };

  const handleAISuggestionSelect = (suggestion: AIImageSuggestion) => {
    const newImageData = {
      ...currentImage,
      url: suggestion.url,
      alt: suggestion.description,
      credit: suggestion.source
    };

    setCurrentImage(newImageData);
    onImageChange(newImageData);
    setShowAISuggestions(false);
  };

  const handleRemoveImage = () => {
    const emptyData = { url: '', alt: '', caption: '' };
    setCurrentImage(emptyData);
    onImageChange(emptyData);
  };

  const handleFocalPointChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setFocalPoint({ x: Math.round(x), y: Math.round(y) });
    onImageChange({
      ...currentImage,
      focalPoint: { x: Math.round(x), y: Math.round(y) }
    });
  };

  const generateAltText = async () => {
    // Mock AI alt text generation - replace with actual AI service
    const generatedAlt = `Featured image for "${postTitle || 'this post'}"`;
    const newImageData = { ...currentImage, alt: generatedAlt };
    setCurrentImage(newImageData);
    onImageChange(newImageData);
  };

  return (
    <div className={clsx(
      'bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden',
      className
    )}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg">
            <Image className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 dark:text-white">Featured Image</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentImage.url ? 'Image selected' : 'Add a highlight image for your post'}
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-200 dark:border-gray-800"
          >
            <div className="p-4 space-y-4">
              {/* Current Image Preview */}
              {currentImage.url ? (
                <div className="space-y-4">
                  {/* Image Preview */}
                  <div className="relative group rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <div
                      className="relative cursor-crosshair"
                      onClick={showFocalPointEditor ? handleFocalPointChange : undefined}
                    >
                      <img
                        src={currentImage.url}
                        alt={currentImage.alt}
                        className="w-full h-48 object-cover"
                        style={showFocalPointEditor ? {
                          objectPosition: `${focalPoint.x}% ${focalPoint.y}%`
                        } : undefined}
                      />

                      {/* Focal Point Indicator */}
                      {showFocalPointEditor && (
                        <div
                          className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 border-2 border-white rounded-full bg-blue-500/50 shadow-lg"
                          style={{ left: `${focalPoint.x}%`, top: `${focalPoint.y}%` }}
                        />
                      )}
                    </div>

                    {/* Image Actions Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => setShowFocalPointEditor(!showFocalPointEditor)}
                        className={clsx(
                          "p-2 rounded-lg transition-colors",
                          showFocalPointEditor
                            ? "bg-blue-500 text-white"
                            : "bg-white/90 hover:bg-white text-gray-700"
                        )}
                        title="Set focal point"
                      >
                        <Crop size={18} />
                      </button>
                      <button
                        onClick={() => {/* Open image editor */}}
                        className="p-2 bg-white/90 hover:bg-white rounded-lg text-gray-700"
                        title="Edit image"
                      >
                        <Palette size={18} />
                      </button>
                      <button
                        onClick={() => window.open(currentImage.url, '_blank')}
                        className="p-2 bg-white/90 hover:bg-white rounded-lg text-gray-700"
                        title="View full size"
                      >
                        <ZoomIn size={18} />
                      </button>
                      <button
                        onClick={handleRemoveImage}
                        className="p-2 bg-red-500/90 hover:bg-red-500 rounded-lg text-white"
                        title="Remove image"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Image Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Alt Text */}
                    <div>
                      <label className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <span>Alt Text</span>
                        <button
                          onClick={generateAltText}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                        >
                          <Wand2 size={12} />
                          Generate with AI
                        </button>
                      </label>
                      <input
                        type="text"
                        value={currentImage.alt}
                        onChange={(e) => {
                          const newData = { ...currentImage, alt: e.target.value };
                          setCurrentImage(newData);
                          onImageChange(newData);
                        }}
                        placeholder="Describe the image for accessibility"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {!currentImage.alt && (
                        <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                          <AlertCircle size={12} />
                          Alt text improves SEO and accessibility
                        </p>
                      )}
                    </div>

                    {/* Caption */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Caption (optional)
                      </label>
                      <input
                        type="text"
                        value={currentImage.caption}
                        onChange={(e) => {
                          const newData = { ...currentImage, caption: e.target.value };
                          setCurrentImage(newData);
                          onImageChange(newData);
                        }}
                        placeholder="Add a caption for this image"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setActiveTab('upload')}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    >
                      <RefreshCw size={14} />
                      Replace Image
                    </button>
                    <button
                      onClick={() => setShowAISuggestions(true)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                    >
                      <Sparkles size={14} />
                      AI Suggestions
                    </button>
                  </div>
                </div>
              ) : (
                /* Upload Options */
                <div className="space-y-4">
                  {/* Tab Navigation */}
                  <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    {[
                      { id: 'upload', label: 'Upload', icon: Upload },
                      { id: 'url', label: 'URL', icon: Link },
                      { id: 'ai', label: 'AI Generate', icon: Sparkles },
                      { id: 'library', label: 'Library', icon: Image }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        className={clsx(
                          'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors',
                          activeTab === tab.id
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        )}
                      >
                        <tab.icon size={16} />
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <AnimatePresence mode="wait">
                    {activeTab === 'upload' && (
                      <motion.div
                        key="upload"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          {isUploading ? (
                            <div className="flex flex-col items-center gap-3">
                              <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">Uploading...</span>
                            </div>
                          ) : (
                            <>
                              <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl mb-4">
                                <Camera className="w-8 h-8 text-white" />
                              </div>
                              <span className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                                Drop your image here
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                or click to browse files
                              </span>
                              <span className="mt-3 text-xs text-gray-400">
                                Recommended: 1200×630px for optimal social sharing
                              </span>
                            </>
                          )}
                        </label>
                      </motion.div>
                    )}

                    {activeTab === 'url' && (
                      <motion.div
                        key="url"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-3"
                      >
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            placeholder="Paste image URL here..."
                            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            onClick={handleUrlSubmit}
                            disabled={!urlInput.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Check size={20} />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Enter a direct link to an image. Supported formats: JPG, PNG, GIF, WebP
                        </p>
                      </motion.div>
                    )}

                    {activeTab === 'ai' && (
                      <motion.div
                        key="ai"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                      >
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                          <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
                            <Sparkles size={16} />
                            AI Image Suggestions
                          </h4>
                          <p className="text-sm text-purple-700 dark:text-purple-300">
                            Based on your post title: "{postTitle || 'Untitled'}"
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {aiSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleAISuggestionSelect(suggestion)}
                              className="group relative rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-colors"
                            >
                              <img
                                src={suggestion.url}
                                alt={suggestion.description}
                                className="w-full h-24 object-cover"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-end">
                                <div className="p-2 text-left opacity-0 group-hover:opacity-100 transition-opacity">
                                  <p className="text-xs text-white font-medium line-clamp-2">
                                    {suggestion.description}
                                  </p>
                                  <p className="text-xs text-gray-300">{suggestion.source}</p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>

                        <button className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2">
                          <RefreshCw size={14} />
                          Generate more suggestions
                        </button>
                      </motion.div>
                    )}

                    {activeTab === 'library' && (
                      <motion.div
                        key="library"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-center py-8"
                      >
                        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full inline-block mb-3">
                          <Image className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          Browse your media library
                        </p>
                        <button className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:opacity-90">
                          Open Media Library
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeaturedImageSection;
