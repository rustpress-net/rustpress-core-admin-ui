/**
 * VisualElementsModal - Enterprise Visual Elements Modal
 *
 * Comprehensive modal for Carousel, Gallery Grid, Before/After, Table Editor, and Embeds
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image,
  Images,
  Table,
  Video,
  Plus,
  Minus,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Trash2,
  Upload,
  Link,
  Eye,
  EyeOff,
  Settings,
  Play,
  Pause,
  Maximize2,
  Grid,
  Columns,
  Rows,
  Move,
  Copy,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  SplitSquareHorizontal,
  Youtube,
  Twitter,
  Instagram,
  Code,
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

interface VisualElementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertBlock: (block: string) => void;
  defaultTab?: 'carousel' | 'gallery' | 'before-after' | 'table' | 'embed';
  initialTab?: 'carousel' | 'gallery' | 'before-after' | 'table' | 'embed';
  hideTabs?: boolean;
}

// Carousel slide interface
interface CarouselSlide {
  id: string;
  image: string;
  title: string;
  caption: string;
  link: string;
}

// Table cell interface
interface TableCell {
  content: string;
  align?: 'left' | 'center' | 'right';
  bold?: boolean;
  italic?: boolean;
}

// Tab titles and subtitles for single-tab mode
const tabTitles: Record<string, { title: string; subtitle: string }> = {
  carousel: { title: 'Carousel', subtitle: 'Create image/content carousels and sliders' },
  gallery: { title: 'Gallery Grid', subtitle: 'Create responsive image galleries' },
  'before-after': { title: 'Before/After', subtitle: 'Create image comparison sliders' },
  table: { title: 'Table Editor', subtitle: 'Create and format data tables' },
  embed: { title: 'Embeds', subtitle: 'Embed videos, social posts, and more' },
};

export const VisualElementsModal: React.FC<VisualElementsModalProps> = ({
  isOpen,
  onClose,
  onInsertBlock,
  defaultTab = 'carousel',
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
  const currentTabInfo = tabTitles[activeTab] || { title: 'Visual Elements', subtitle: 'Carousels, galleries, tables, and embeds' };
  const modalTitle = hideTabs ? currentTabInfo.title : 'Visual Elements';
  const modalSubtitle = hideTabs ? currentTabInfo.subtitle : 'Carousels, galleries, tables, and embeds';

  // Carousel state
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>([
    { id: '1', image: '', title: 'Slide 1', caption: '', link: '' },
    { id: '2', image: '', title: 'Slide 2', caption: '', link: '' },
  ]);
  const [carouselSettings, setCarouselSettings] = useState({
    autoplay: true,
    autoplaySpeed: 5000,
    effect: 'slide' as 'slide' | 'fade' | 'cube' | 'flip' | 'coverflow',
    slidesPerView: 1,
    spaceBetween: 20,
    loop: true,
    showNavigation: true,
    showPagination: true,
    paginationType: 'bullets' as 'bullets' | 'fraction' | 'progressbar',
    showThumbnails: false,
    pauseOnHover: true,
    lazyLoad: true,
    speed: 500,
    direction: 'horizontal' as 'horizontal' | 'vertical',
    centeredSlides: false,
    freeMode: false,
  });

  // Gallery state
  const [galleryImages, setGalleryImages] = useState<{ id: string; url: string; alt: string; caption: string }[]>([]);
  const [gallerySettings, setGallerySettings] = useState({
    layout: 'grid' as 'grid' | 'masonry' | 'justified' | 'slider' | 'collage',
    columns: 3,
    gap: 16,
    thumbnailSize: 'medium' as 'small' | 'medium' | 'large' | 'full',
    enableLightbox: true,
    showCaptions: true,
    captionPosition: 'below' as 'below' | 'overlay' | 'hover',
    hoverEffect: 'zoom' as 'none' | 'zoom' | 'fade' | 'slide' | 'blur',
    lazyLoad: true,
    aspectRatio: 'auto' as 'auto' | '1:1' | '4:3' | '16:9' | '3:2',
    orderBy: 'manual' as 'manual' | 'date' | 'title' | 'random',
    linkTo: 'lightbox' as 'lightbox' | 'media' | 'attachment' | 'custom' | 'none',
  });

  // Before/After state
  const [beforeAfterSettings, setBeforeAfterSettings] = useState({
    beforeImage: '',
    afterImage: '',
    beforeLabel: 'Before',
    afterLabel: 'After',
    orientation: 'horizontal' as 'horizontal' | 'vertical',
    initialPosition: 50,
    showLabels: true,
    labelPosition: 'top' as 'top' | 'bottom' | 'sides',
    handleStyle: 'line' as 'line' | 'circle' | 'arrows' | 'minimal',
    handleColor: '#ffffff',
    moveOnHover: false,
    clickToMove: true,
    overlayColor: 'rgba(0,0,0,0.5)',
    showOverlay: false,
    borderRadius: 0,
    shadow: true,
  });

  // Table state
  const [tableData, setTableData] = useState<TableCell[][]>([
    [{ content: 'Header 1' }, { content: 'Header 2' }, { content: 'Header 3' }],
    [{ content: 'Cell 1' }, { content: 'Cell 2' }, { content: 'Cell 3' }],
    [{ content: 'Cell 4' }, { content: 'Cell 5' }, { content: 'Cell 6' }],
  ]);
  const [tableSettings, setTableSettings] = useState({
    theme: 'default' as 'default' | 'striped' | 'bordered' | 'minimal' | 'dark',
    headerStyle: 'filled' as 'filled' | 'outline' | 'none' | 'gradient',
    headerColor: '#3b82f6',
    enableSorting: true,
    enableFiltering: false,
    enablePagination: false,
    rowsPerPage: 10,
    stickyHeader: false,
    stickyFirstColumn: false,
    responsive: true,
    responsiveMode: 'scroll' as 'scroll' | 'stack' | 'collapse',
    compactMode: false,
    showBorders: true,
    hoverHighlight: true,
    zebraStripes: false,
    caption: '',
    captionPosition: 'bottom' as 'top' | 'bottom',
  });
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);

  // Embed state
  const [embedSettings, setEmbedSettings] = useState({
    url: '',
    provider: 'auto' as 'auto' | 'youtube' | 'vimeo' | 'twitter' | 'instagram' | 'facebook' | 'tiktok' | 'codepen' | 'spotify' | 'soundcloud',
    aspectRatio: '16:9' as '16:9' | '4:3' | '1:1' | '9:16' | '21:9',
    width: '100%',
    maxWidth: 800,
    autoplay: false,
    showControls: true,
    loop: false,
    muted: true,
    startTime: 0,
    endTime: 0,
    privacyMode: true,
    showInfo: true,
    showRelated: false,
    showCaption: true,
    caption: '',
    lazyLoad: true,
    borderRadius: 8,
    shadow: true,
  });
  const [embedPreview, setEmbedPreview] = useState<string | null>(null);

  // Carousel handlers
  const addSlide = () => {
    setCarouselSlides([
      ...carouselSlides,
      { id: Date.now().toString(), image: '', title: `Slide ${carouselSlides.length + 1}`, caption: '', link: '' },
    ]);
  };

  const removeSlide = (id: string) => {
    if (carouselSlides.length > 1) {
      setCarouselSlides(carouselSlides.filter(s => s.id !== id));
    }
  };

  const updateSlide = (id: string, field: keyof CarouselSlide, value: string) => {
    setCarouselSlides(carouselSlides.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const moveSlide = (id: string, direction: 'up' | 'down') => {
    const index = carouselSlides.findIndex(s => s.id === id);
    if ((direction === 'up' && index > 0) || (direction === 'down' && index < carouselSlides.length - 1)) {
      const newSlides = [...carouselSlides];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      [newSlides[index], newSlides[newIndex]] = [newSlides[newIndex], newSlides[index]];
      setCarouselSlides(newSlides);
    }
  };

  // Gallery handlers
  const addGalleryImage = () => {
    setGalleryImages([
      ...galleryImages,
      { id: Date.now().toString(), url: '', alt: '', caption: '' },
    ]);
  };

  const removeGalleryImage = (id: string) => {
    setGalleryImages(galleryImages.filter(i => i.id !== id));
  };

  // Table handlers
  const addRow = () => {
    const cols = tableData[0]?.length || 3;
    setTableData([...tableData, Array(cols).fill(null).map(() => ({ content: '' }))]);
  };

  const addColumn = () => {
    setTableData(tableData.map(row => [...row, { content: '' }]));
  };

  const removeRow = (index: number) => {
    if (tableData.length > 1) {
      setTableData(tableData.filter((_, i) => i !== index));
    }
  };

  const removeColumn = (index: number) => {
    if (tableData[0].length > 1) {
      setTableData(tableData.map(row => row.filter((_, i) => i !== index)));
    }
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...tableData];
    newData[rowIndex][colIndex] = { ...newData[rowIndex][colIndex], content: value };
    setTableData(newData);
  };

  const setCellFormat = (rowIndex: number, colIndex: number, format: Partial<TableCell>) => {
    const newData = [...tableData];
    newData[rowIndex][colIndex] = { ...newData[rowIndex][colIndex], ...format };
    setTableData(newData);
  };

  // Generate HTML outputs
  const generateCarouselHTML = () => {
    return `<div class="swiper-container" data-autoplay="${carouselSettings.autoplay}" data-speed="${carouselSettings.autoplaySpeed}" data-effect="${carouselSettings.effect}">
  <div class="swiper-wrapper">
${carouselSlides.map(slide => `    <div class="swiper-slide">
      <img src="${slide.image}" alt="${slide.title}" />
      ${slide.caption ? `<div class="slide-caption">${slide.caption}</div>` : ''}
    </div>`).join('\n')}
  </div>
  ${carouselSettings.showNavigation ? '<div class="swiper-button-prev"></div>\n  <div class="swiper-button-next"></div>' : ''}
  ${carouselSettings.showPagination ? '<div class="swiper-pagination"></div>' : ''}
</div>`;
  };

  const generateGalleryHTML = () => {
    return `<div class="gallery gallery-${gallerySettings.layout}" data-columns="${gallerySettings.columns}" data-gap="${gallerySettings.gap}">
${galleryImages.map(img => `  <figure class="gallery-item">
    <img src="${img.url}" alt="${img.alt}" loading="${gallerySettings.lazyLoad ? 'lazy' : 'eager'}" />
    ${gallerySettings.showCaptions && img.caption ? `<figcaption>${img.caption}</figcaption>` : ''}
  </figure>`).join('\n')}
</div>`;
  };

  const generateBeforeAfterHTML = () => {
    return `<div class="before-after-slider"
  data-orientation="${beforeAfterSettings.orientation}"
  data-initial="${beforeAfterSettings.initialPosition}"
  data-handle-style="${beforeAfterSettings.handleStyle}">
  <div class="before-image">
    <img src="${beforeAfterSettings.beforeImage}" alt="${beforeAfterSettings.beforeLabel}" />
    ${beforeAfterSettings.showLabels ? `<span class="label">${beforeAfterSettings.beforeLabel}</span>` : ''}
  </div>
  <div class="after-image">
    <img src="${beforeAfterSettings.afterImage}" alt="${beforeAfterSettings.afterLabel}" />
    ${beforeAfterSettings.showLabels ? `<span class="label">${beforeAfterSettings.afterLabel}</span>` : ''}
  </div>
  <div class="slider-handle"></div>
</div>`;
  };

  const generateTableHTML = () => {
    return `<table class="styled-table table-${tableSettings.theme}"${tableSettings.caption ? ` aria-describedby="table-caption"` : ''}>
${tableSettings.caption && tableSettings.captionPosition === 'top' ? `  <caption id="table-caption">${tableSettings.caption}</caption>\n` : ''}  <thead>
    <tr>
${tableData[0].map(cell => `      <th${cell.align ? ` style="text-align:${cell.align}"` : ''}>${cell.content}</th>`).join('\n')}
    </tr>
  </thead>
  <tbody>
${tableData.slice(1).map(row => `    <tr>
${row.map(cell => `      <td${cell.align ? ` style="text-align:${cell.align}"` : ''}>${cell.bold ? '<strong>' : ''}${cell.italic ? '<em>' : ''}${cell.content}${cell.italic ? '</em>' : ''}${cell.bold ? '</strong>' : ''}</td>`).join('\n')}
    </tr>`).join('\n')}
  </tbody>
${tableSettings.caption && tableSettings.captionPosition === 'bottom' ? `  <caption id="table-caption">${tableSettings.caption}</caption>\n` : ''}</table>`;
  };

  const generateEmbedHTML = () => {
    if (embedSettings.provider === 'youtube' || (embedSettings.provider === 'auto' && embedSettings.url.includes('youtube'))) {
      const videoId = embedSettings.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/)?.[1] || '';
      return `<div class="video-embed" style="aspect-ratio: ${embedSettings.aspectRatio.replace(':', '/')}; max-width: ${embedSettings.maxWidth}px;">
  <iframe
    src="https://www.youtube${embedSettings.privacyMode ? '-nocookie' : ''}.com/embed/${videoId}?autoplay=${embedSettings.autoplay ? 1 : 0}&controls=${embedSettings.showControls ? 1 : 0}&loop=${embedSettings.loop ? 1 : 0}&mute=${embedSettings.muted ? 1 : 0}${embedSettings.startTime ? `&start=${embedSettings.startTime}` : ''}"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
    loading="${embedSettings.lazyLoad ? 'lazy' : 'eager'}"
  ></iframe>
</div>`;
    }
    return `<div class="embed-container" style="aspect-ratio: ${embedSettings.aspectRatio.replace(':', '/')}; max-width: ${embedSettings.maxWidth}px;">
  <iframe src="${embedSettings.url}" frameborder="0" allowfullscreen loading="${embedSettings.lazyLoad ? 'lazy' : 'eager'}"></iframe>
</div>`;
  };

  const handleInsert = () => {
    let html = '';
    switch (activeTab) {
      case 'carousel':
        html = generateCarouselHTML();
        break;
      case 'gallery':
        html = generateGalleryHTML();
        break;
      case 'before-after':
        html = generateBeforeAfterHTML();
        break;
      case 'table':
        html = generateTableHTML();
        break;
      case 'embed':
        html = generateEmbedHTML();
        break;
    }
    onInsertBlock(html);
    onClose();
  };

  const tabs = [
    { id: 'carousel', label: 'Carousel', icon: Images },
    { id: 'gallery', label: 'Gallery Grid', icon: Grid },
    { id: 'before-after', label: 'Before/After', icon: SplitSquareHorizontal },
    { id: 'table', label: 'Table Editor', icon: Table },
    { id: 'embed', label: 'Embeds', icon: Video },
  ];

  return (
    <EditorModal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      subtitle={modalSubtitle}
      icon={Images}
      iconColor="indigo"
      size={hideTabs ? 'lg' : 'xl'}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as typeof activeTab)}
      hideTabs={hideTabs}
      showSave
      saveLabel="Insert"
      onSave={handleInsert}
    >
      {/* Carousel Tab */}
      {activeTab === 'carousel' && (
        <div className="space-y-6">
          {/* Slides */}
          <ModalSection id="slides" title="Slides" description="Add and arrange carousel slides">
            <div className="space-y-3">
              {carouselSlides.map((slide, index) => (
                <motion.div
                  key={slide.id}
                  layout
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-1">
                      <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
                      <span className="text-xs font-medium text-gray-500">{index + 1}</span>
                      <div className="flex flex-col gap-1 mt-2">
                        <button
                          onClick={() => moveSlide(slide.id, 'up')}
                          disabled={index === 0}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-30"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveSlide(slide.id, 'down')}
                          disabled={index === carouselSlides.length - 1}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-30"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div className="col-span-2 flex gap-4">
                        <div className="w-32 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:border-blue-500 transition-colors">
                          {slide.image ? (
                            <img src={slide.image} alt="" className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <div className="text-center">
                              <Upload className="w-5 h-5 mx-auto text-gray-400" />
                              <span className="text-xs text-gray-500 mt-1">Upload</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <Input
                            value={slide.title}
                            onChange={(v) => updateSlide(slide.id, 'title', v)}
                            placeholder="Slide title"
                          />
                          <Input
                            value={slide.image}
                            onChange={(v) => updateSlide(slide.id, 'image', v)}
                            placeholder="Image URL"
                          />
                        </div>
                      </div>
                      <Input
                        value={slide.caption}
                        onChange={(v) => updateSlide(slide.id, 'caption', v)}
                        placeholder="Caption (optional)"
                      />
                      <Input
                        value={slide.link}
                        onChange={(v) => updateSlide(slide.id, 'link', v)}
                        placeholder="Link URL (optional)"
                      />
                    </div>

                    <button
                      onClick={() => removeSlide(slide.id)}
                      disabled={carouselSlides.length === 1}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}

              <button
                onClick={addSlide}
                className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 hover:text-gray-700 hover:border-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Slide
              </button>
            </div>
          </ModalSection>

          {/* Settings */}
          <ModalSection id="carousel-settings" title="Carousel Settings" description="Configure carousel behavior">
            <div className="space-y-6">
              <FormRow columns={3}>
                <FormField label="Effect">
                  <Select
                    value={carouselSettings.effect}
                    onChange={(v) => setCarouselSettings(s => ({ ...s, effect: v as any }))}
                    options={[
                      { value: 'slide', label: 'Slide' },
                      { value: 'fade', label: 'Fade' },
                      { value: 'cube', label: 'Cube' },
                      { value: 'flip', label: 'Flip' },
                      { value: 'coverflow', label: 'Coverflow' },
                    ]}
                  />
                </FormField>
                <FormField label="Slides Per View">
                  <Input
                    type="number"
                    value={carouselSettings.slidesPerView}
                    onChange={(v) => setCarouselSettings(s => ({ ...s, slidesPerView: parseInt(v) || 1 }))}
                    min={1}
                    max={6}
                  />
                </FormField>
                <FormField label="Space Between (px)">
                  <Input
                    type="number"
                    value={carouselSettings.spaceBetween}
                    onChange={(v) => setCarouselSettings(s => ({ ...s, spaceBetween: parseInt(v) || 0 }))}
                    min={0}
                    max={100}
                  />
                </FormField>
              </FormRow>

              <FormRow columns={3}>
                <FormField label="Direction">
                  <Select
                    value={carouselSettings.direction}
                    onChange={(v) => setCarouselSettings(s => ({ ...s, direction: v as any }))}
                    options={[
                      { value: 'horizontal', label: 'Horizontal' },
                      { value: 'vertical', label: 'Vertical' },
                    ]}
                  />
                </FormField>
                <FormField label="Speed (ms)">
                  <Input
                    type="number"
                    value={carouselSettings.speed}
                    onChange={(v) => setCarouselSettings(s => ({ ...s, speed: parseInt(v) || 500 }))}
                    min={100}
                    max={2000}
                    step={100}
                  />
                </FormField>
                <FormField label="Autoplay Speed (ms)">
                  <Input
                    type="number"
                    value={carouselSettings.autoplaySpeed}
                    onChange={(v) => setCarouselSettings(s => ({ ...s, autoplaySpeed: parseInt(v) || 5000 }))}
                    min={1000}
                    max={10000}
                    step={500}
                  />
                </FormField>
              </FormRow>

              <div className="grid grid-cols-3 gap-4">
                <Toggle
                  checked={carouselSettings.autoplay}
                  onChange={(v) => setCarouselSettings(s => ({ ...s, autoplay: v }))}
                  label="Autoplay"
                  description="Auto-advance slides"
                />
                <Toggle
                  checked={carouselSettings.loop}
                  onChange={(v) => setCarouselSettings(s => ({ ...s, loop: v }))}
                  label="Loop"
                  description="Infinite scrolling"
                />
                <Toggle
                  checked={carouselSettings.pauseOnHover}
                  onChange={(v) => setCarouselSettings(s => ({ ...s, pauseOnHover: v }))}
                  label="Pause on Hover"
                  description="Stop on mouse hover"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Toggle
                  checked={carouselSettings.showNavigation}
                  onChange={(v) => setCarouselSettings(s => ({ ...s, showNavigation: v }))}
                  label="Navigation Arrows"
                  description="Show prev/next buttons"
                />
                <Toggle
                  checked={carouselSettings.showPagination}
                  onChange={(v) => setCarouselSettings(s => ({ ...s, showPagination: v }))}
                  label="Pagination"
                  description="Show slide indicators"
                />
                <Toggle
                  checked={carouselSettings.showThumbnails}
                  onChange={(v) => setCarouselSettings(s => ({ ...s, showThumbnails: v }))}
                  label="Thumbnails"
                  description="Show thumbnail nav"
                />
              </div>

              {carouselSettings.showPagination && (
                <FormField label="Pagination Type">
                  <Select
                    value={carouselSettings.paginationType}
                    onChange={(v) => setCarouselSettings(s => ({ ...s, paginationType: v as any }))}
                    options={[
                      { value: 'bullets', label: 'Bullets' },
                      { value: 'fraction', label: 'Fraction (1/5)' },
                      { value: 'progressbar', label: 'Progress Bar' },
                    ]}
                  />
                </FormField>
              )}
            </div>
          </ModalSection>
        </div>
      )}

      {/* Gallery Tab */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          {/* Images */}
          <ModalSection id="gallery-images" title="Gallery Images" description="Add and arrange images">
            <div className="grid grid-cols-4 gap-4">
              {galleryImages.map((img) => (
                <div
                  key={img.id}
                  className="relative group aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"
                >
                  {img.url ? (
                    <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500">
                      <Upload className="w-6 h-6 mb-1" />
                      <span className="text-xs">Upload</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button className="p-1.5 bg-white rounded-lg hover:bg-gray-100">
                      <Eye className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => removeGalleryImage(img.id)}
                      className="p-1.5 bg-red-500 rounded-lg hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={addGalleryImage}
                className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
              >
                <Plus className="w-6 h-6 mb-1" />
                <span className="text-xs">Add Image</span>
              </button>
            </div>
          </ModalSection>

          {/* Gallery Settings */}
          <ModalSection id="gallery-settings" title="Gallery Settings" description="Configure gallery appearance">
            <div className="space-y-6">
              <FormRow columns={3}>
                <FormField label="Layout">
                  <Select
                    value={gallerySettings.layout}
                    onChange={(v) => setGallerySettings(s => ({ ...s, layout: v as any }))}
                    options={[
                      { value: 'grid', label: 'Grid' },
                      { value: 'masonry', label: 'Masonry' },
                      { value: 'justified', label: 'Justified' },
                      { value: 'slider', label: 'Slider' },
                      { value: 'collage', label: 'Collage' },
                    ]}
                  />
                </FormField>
                <FormField label="Columns">
                  <Input
                    type="number"
                    value={gallerySettings.columns}
                    onChange={(v) => setGallerySettings(s => ({ ...s, columns: parseInt(v) || 3 }))}
                    min={1}
                    max={8}
                  />
                </FormField>
                <FormField label="Gap (px)">
                  <Input
                    type="number"
                    value={gallerySettings.gap}
                    onChange={(v) => setGallerySettings(s => ({ ...s, gap: parseInt(v) || 16 }))}
                    min={0}
                    max={50}
                  />
                </FormField>
              </FormRow>

              <FormRow columns={3}>
                <FormField label="Aspect Ratio">
                  <Select
                    value={gallerySettings.aspectRatio}
                    onChange={(v) => setGallerySettings(s => ({ ...s, aspectRatio: v as any }))}
                    options={[
                      { value: 'auto', label: 'Auto' },
                      { value: '1:1', label: 'Square (1:1)' },
                      { value: '4:3', label: 'Standard (4:3)' },
                      { value: '16:9', label: 'Widescreen (16:9)' },
                      { value: '3:2', label: 'Photo (3:2)' },
                    ]}
                  />
                </FormField>
                <FormField label="Hover Effect">
                  <Select
                    value={gallerySettings.hoverEffect}
                    onChange={(v) => setGallerySettings(s => ({ ...s, hoverEffect: v as any }))}
                    options={[
                      { value: 'none', label: 'None' },
                      { value: 'zoom', label: 'Zoom' },
                      { value: 'fade', label: 'Fade' },
                      { value: 'slide', label: 'Slide' },
                      { value: 'blur', label: 'Blur' },
                    ]}
                  />
                </FormField>
                <FormField label="Link To">
                  <Select
                    value={gallerySettings.linkTo}
                    onChange={(v) => setGallerySettings(s => ({ ...s, linkTo: v as any }))}
                    options={[
                      { value: 'lightbox', label: 'Lightbox' },
                      { value: 'media', label: 'Media File' },
                      { value: 'attachment', label: 'Attachment Page' },
                      { value: 'custom', label: 'Custom URL' },
                      { value: 'none', label: 'None' },
                    ]}
                  />
                </FormField>
              </FormRow>

              <div className="grid grid-cols-3 gap-4">
                <Toggle
                  checked={gallerySettings.enableLightbox}
                  onChange={(v) => setGallerySettings(s => ({ ...s, enableLightbox: v }))}
                  label="Enable Lightbox"
                  description="Click to enlarge images"
                />
                <Toggle
                  checked={gallerySettings.showCaptions}
                  onChange={(v) => setGallerySettings(s => ({ ...s, showCaptions: v }))}
                  label="Show Captions"
                  description="Display image captions"
                />
                <Toggle
                  checked={gallerySettings.lazyLoad}
                  onChange={(v) => setGallerySettings(s => ({ ...s, lazyLoad: v }))}
                  label="Lazy Loading"
                  description="Load images on scroll"
                />
              </div>

              {gallerySettings.showCaptions && (
                <FormField label="Caption Position">
                  <Select
                    value={gallerySettings.captionPosition}
                    onChange={(v) => setGallerySettings(s => ({ ...s, captionPosition: v as any }))}
                    options={[
                      { value: 'below', label: 'Below Image' },
                      { value: 'overlay', label: 'Overlay' },
                      { value: 'hover', label: 'Show on Hover' },
                    ]}
                  />
                </FormField>
              )}
            </div>
          </ModalSection>
        </div>
      )}

      {/* Before/After Tab */}
      {activeTab === 'before-after' && (
        <div className="space-y-6">
          {/* Images */}
          <ModalSection id="ba-images" title="Images" description="Select before and after images">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Before Image</h4>
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:border-blue-500 transition-colors">
                  {beforeAfterSettings.beforeImage ? (
                    <img src={beforeAfterSettings.beforeImage} alt="Before" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Click to upload</span>
                    </div>
                  )}
                </div>
                <Input
                  value={beforeAfterSettings.beforeImage}
                  onChange={(v) => setBeforeAfterSettings(s => ({ ...s, beforeImage: v }))}
                  placeholder="Image URL"
                />
                <Input
                  value={beforeAfterSettings.beforeLabel}
                  onChange={(v) => setBeforeAfterSettings(s => ({ ...s, beforeLabel: v }))}
                  placeholder="Label"
                />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">After Image</h4>
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:border-blue-500 transition-colors">
                  {beforeAfterSettings.afterImage ? (
                    <img src={beforeAfterSettings.afterImage} alt="After" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Click to upload</span>
                    </div>
                  )}
                </div>
                <Input
                  value={beforeAfterSettings.afterImage}
                  onChange={(v) => setBeforeAfterSettings(s => ({ ...s, afterImage: v }))}
                  placeholder="Image URL"
                />
                <Input
                  value={beforeAfterSettings.afterLabel}
                  onChange={(v) => setBeforeAfterSettings(s => ({ ...s, afterLabel: v }))}
                  placeholder="Label"
                />
              </div>
            </div>
          </ModalSection>

          {/* Settings */}
          <ModalSection id="ba-settings" title="Slider Settings" description="Configure slider behavior">
            <div className="space-y-6">
              <FormRow columns={3}>
                <FormField label="Orientation">
                  <Select
                    value={beforeAfterSettings.orientation}
                    onChange={(v) => setBeforeAfterSettings(s => ({ ...s, orientation: v as any }))}
                    options={[
                      { value: 'horizontal', label: 'Horizontal' },
                      { value: 'vertical', label: 'Vertical' },
                    ]}
                  />
                </FormField>
                <FormField label="Initial Position (%)">
                  <Input
                    type="number"
                    value={beforeAfterSettings.initialPosition}
                    onChange={(v) => setBeforeAfterSettings(s => ({ ...s, initialPosition: parseInt(v) || 50 }))}
                    min={0}
                    max={100}
                  />
                </FormField>
                <FormField label="Handle Style">
                  <Select
                    value={beforeAfterSettings.handleStyle}
                    onChange={(v) => setBeforeAfterSettings(s => ({ ...s, handleStyle: v as any }))}
                    options={[
                      { value: 'line', label: 'Line' },
                      { value: 'circle', label: 'Circle' },
                      { value: 'arrows', label: 'Arrows' },
                      { value: 'minimal', label: 'Minimal' },
                    ]}
                  />
                </FormField>
              </FormRow>

              <FormRow columns={3}>
                <FormField label="Handle Color">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={beforeAfterSettings.handleColor}
                      onChange={(e) => setBeforeAfterSettings(s => ({ ...s, handleColor: e.target.value }))}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={beforeAfterSettings.handleColor}
                      onChange={(v) => setBeforeAfterSettings(s => ({ ...s, handleColor: v }))}
                    />
                  </div>
                </FormField>
                <FormField label="Border Radius (px)">
                  <Input
                    type="number"
                    value={beforeAfterSettings.borderRadius}
                    onChange={(v) => setBeforeAfterSettings(s => ({ ...s, borderRadius: parseInt(v) || 0 }))}
                    min={0}
                    max={50}
                  />
                </FormField>
                <FormField label="Label Position">
                  <Select
                    value={beforeAfterSettings.labelPosition}
                    onChange={(v) => setBeforeAfterSettings(s => ({ ...s, labelPosition: v as any }))}
                    options={[
                      { value: 'top', label: 'Top' },
                      { value: 'bottom', label: 'Bottom' },
                      { value: 'sides', label: 'Sides' },
                    ]}
                  />
                </FormField>
              </FormRow>

              <div className="grid grid-cols-3 gap-4">
                <Toggle
                  checked={beforeAfterSettings.showLabels}
                  onChange={(v) => setBeforeAfterSettings(s => ({ ...s, showLabels: v }))}
                  label="Show Labels"
                  description="Display before/after labels"
                />
                <Toggle
                  checked={beforeAfterSettings.moveOnHover}
                  onChange={(v) => setBeforeAfterSettings(s => ({ ...s, moveOnHover: v }))}
                  label="Move on Hover"
                  description="Slider follows mouse"
                />
                <Toggle
                  checked={beforeAfterSettings.clickToMove}
                  onChange={(v) => setBeforeAfterSettings(s => ({ ...s, clickToMove: v }))}
                  label="Click to Move"
                  description="Jump to click position"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Toggle
                  checked={beforeAfterSettings.shadow}
                  onChange={(v) => setBeforeAfterSettings(s => ({ ...s, shadow: v }))}
                  label="Drop Shadow"
                  description="Add shadow effect"
                />
                <Toggle
                  checked={beforeAfterSettings.showOverlay}
                  onChange={(v) => setBeforeAfterSettings(s => ({ ...s, showOverlay: v }))}
                  label="Show Overlay"
                  description="Darken inactive side"
                />
              </div>
            </div>
          </ModalSection>
        </div>
      )}

      {/* Table Tab */}
      {activeTab === 'table' && (
        <div className="space-y-6">
          {/* Table Editor */}
          <ModalSection id="table-editor" title="Table Data" description="Edit table content">
            <div className="space-y-4">
              {/* Toolbar */}
              <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <button onClick={addColumn} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600">
                  <Columns className="w-4 h-4" />
                  Add Column
                </button>
                <button onClick={addRow} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600">
                  <Rows className="w-4 h-4" />
                  Add Row
                </button>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
                {selectedCell && (
                  <>
                    <button
                      onClick={() => setCellFormat(selectedCell.row, selectedCell.col, { bold: !tableData[selectedCell.row][selectedCell.col].bold })}
                      className={clsx(
                        'p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-600',
                        tableData[selectedCell.row][selectedCell.col].bold && 'bg-gray-200 dark:bg-gray-600'
                      )}
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCellFormat(selectedCell.row, selectedCell.col, { italic: !tableData[selectedCell.row][selectedCell.col].italic })}
                      className={clsx(
                        'p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-600',
                        tableData[selectedCell.row][selectedCell.col].italic && 'bg-gray-200 dark:bg-gray-600'
                      )}
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
                    <button
                      onClick={() => setCellFormat(selectedCell.row, selectedCell.col, { align: 'left' })}
                      className={clsx(
                        'p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-600',
                        tableData[selectedCell.row][selectedCell.col].align === 'left' && 'bg-gray-200 dark:bg-gray-600'
                      )}
                    >
                      <AlignLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCellFormat(selectedCell.row, selectedCell.col, { align: 'center' })}
                      className={clsx(
                        'p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-600',
                        tableData[selectedCell.row][selectedCell.col].align === 'center' && 'bg-gray-200 dark:bg-gray-600'
                      )}
                    >
                      <AlignCenter className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCellFormat(selectedCell.row, selectedCell.col, { align: 'right' })}
                      className={clsx(
                        'p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-600',
                        tableData[selectedCell.row][selectedCell.col].align === 'right' && 'bg-gray-200 dark:bg-gray-600'
                      )}
                    >
                      <AlignRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                <table className="w-full min-w-max">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <th className="w-8 p-2 border-r border-gray-200 dark:border-gray-700"></th>
                      {tableData[0].map((_, colIndex) => (
                        <th key={colIndex} className="p-2 border-r border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-500 relative group">
                          {String.fromCharCode(65 + colIndex)}
                          <button
                            onClick={() => removeColumn(colIndex)}
                            className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, rowIndex) => (
                      <tr key={rowIndex} className={rowIndex === 0 ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                        <td className="w-8 p-2 border-r border-b border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-500 text-center relative group">
                          {rowIndex + 1}
                          {rowIndex > 0 && (
                            <button
                              onClick={() => removeRow(rowIndex)}
                              className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </td>
                        {row.map((cell, colIndex) => (
                          <td
                            key={colIndex}
                            className={clsx(
                              'p-0 border-r border-b border-gray-200 dark:border-gray-700',
                              selectedCell?.row === rowIndex && selectedCell?.col === colIndex && 'ring-2 ring-blue-500 ring-inset'
                            )}
                          >
                            <input
                              type="text"
                              value={cell.content}
                              onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                              onFocus={() => setSelectedCell({ row: rowIndex, col: colIndex })}
                              className={clsx(
                                'w-full px-3 py-2 bg-transparent border-0 focus:outline-none text-sm',
                                rowIndex === 0 && 'font-semibold',
                                cell.bold && 'font-bold',
                                cell.italic && 'italic',
                                cell.align === 'center' && 'text-center',
                                cell.align === 'right' && 'text-right'
                              )}
                              placeholder={rowIndex === 0 ? 'Header' : 'Cell'}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </ModalSection>

          {/* Table Settings */}
          <ModalSection id="table-settings" title="Table Settings" description="Configure table appearance">
            <div className="space-y-6">
              <FormRow columns={3}>
                <FormField label="Theme">
                  <Select
                    value={tableSettings.theme}
                    onChange={(v) => setTableSettings(s => ({ ...s, theme: v as any }))}
                    options={[
                      { value: 'default', label: 'Default' },
                      { value: 'striped', label: 'Striped' },
                      { value: 'bordered', label: 'Bordered' },
                      { value: 'minimal', label: 'Minimal' },
                      { value: 'dark', label: 'Dark' },
                    ]}
                  />
                </FormField>
                <FormField label="Header Style">
                  <Select
                    value={tableSettings.headerStyle}
                    onChange={(v) => setTableSettings(s => ({ ...s, headerStyle: v as any }))}
                    options={[
                      { value: 'filled', label: 'Filled' },
                      { value: 'outline', label: 'Outline' },
                      { value: 'gradient', label: 'Gradient' },
                      { value: 'none', label: 'None' },
                    ]}
                  />
                </FormField>
                <FormField label="Responsive Mode">
                  <Select
                    value={tableSettings.responsiveMode}
                    onChange={(v) => setTableSettings(s => ({ ...s, responsiveMode: v as any }))}
                    options={[
                      { value: 'scroll', label: 'Horizontal Scroll' },
                      { value: 'stack', label: 'Stack' },
                      { value: 'collapse', label: 'Collapse' },
                    ]}
                  />
                </FormField>
              </FormRow>

              <FormField label="Table Caption">
                <Input
                  value={tableSettings.caption}
                  onChange={(v) => setTableSettings(s => ({ ...s, caption: v }))}
                  placeholder="Enter table caption (optional)"
                />
              </FormField>

              <div className="grid grid-cols-3 gap-4">
                <Toggle
                  checked={tableSettings.enableSorting}
                  onChange={(v) => setTableSettings(s => ({ ...s, enableSorting: v }))}
                  label="Enable Sorting"
                  description="Click headers to sort"
                />
                <Toggle
                  checked={tableSettings.enableFiltering}
                  onChange={(v) => setTableSettings(s => ({ ...s, enableFiltering: v }))}
                  label="Enable Filtering"
                  description="Filter table data"
                />
                <Toggle
                  checked={tableSettings.enablePagination}
                  onChange={(v) => setTableSettings(s => ({ ...s, enablePagination: v }))}
                  label="Enable Pagination"
                  description="Paginate rows"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Toggle
                  checked={tableSettings.stickyHeader}
                  onChange={(v) => setTableSettings(s => ({ ...s, stickyHeader: v }))}
                  label="Sticky Header"
                  description="Fixed header on scroll"
                />
                <Toggle
                  checked={tableSettings.hoverHighlight}
                  onChange={(v) => setTableSettings(s => ({ ...s, hoverHighlight: v }))}
                  label="Hover Highlight"
                  description="Highlight row on hover"
                />
                <Toggle
                  checked={tableSettings.zebraStripes}
                  onChange={(v) => setTableSettings(s => ({ ...s, zebraStripes: v }))}
                  label="Zebra Stripes"
                  description="Alternate row colors"
                />
              </div>
            </div>
          </ModalSection>
        </div>
      )}

      {/* Embed Tab */}
      {activeTab === 'embed' && (
        <div className="space-y-6">
          {/* URL Input */}
          <ModalSection id="embed-url" title="Embed URL" description="Paste the URL of the content to embed">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    value={embedSettings.url}
                    onChange={(v) => setEmbedSettings(s => ({ ...s, url: v }))}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
                <button
                  onClick={() => setEmbedPreview(embedSettings.url)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              {/* Quick providers */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Supported:</span>
                <div className="flex gap-1">
                  {[
                    { id: 'youtube', icon: Youtube, color: 'text-red-600' },
                    { id: 'twitter', icon: Twitter, color: 'text-blue-400' },
                    { id: 'instagram', icon: Instagram, color: 'text-pink-600' },
                    { id: 'codepen', icon: Code, color: 'text-gray-600' },
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => setEmbedSettings(s => ({ ...s, provider: p.id as any }))}
                      className={clsx(
                        'p-2 rounded-lg transition-colors',
                        embedSettings.provider === p.id ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      )}
                    >
                      <p.icon className={clsx('w-5 h-5', p.color)} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </ModalSection>

          {/* Preview */}
          {embedPreview && (
            <ModalSection id="embed-preview" title="Preview" description="Preview of the embedded content">
              <div
                className="bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden"
                style={{ aspectRatio: embedSettings.aspectRatio.replace(':', '/'), maxWidth: embedSettings.maxWidth }}
              >
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Video className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">Embed Preview</p>
                  </div>
                </div>
              </div>
            </ModalSection>
          )}

          {/* Embed Settings */}
          <ModalSection id="embed-settings" title="Embed Settings" description="Configure embed appearance and behavior">
            <div className="space-y-6">
              <FormRow columns={3}>
                <FormField label="Provider">
                  <Select
                    value={embedSettings.provider}
                    onChange={(v) => setEmbedSettings(s => ({ ...s, provider: v as any }))}
                    options={[
                      { value: 'auto', label: 'Auto Detect' },
                      { value: 'youtube', label: 'YouTube' },
                      { value: 'vimeo', label: 'Vimeo' },
                      { value: 'twitter', label: 'Twitter/X' },
                      { value: 'instagram', label: 'Instagram' },
                      { value: 'facebook', label: 'Facebook' },
                      { value: 'tiktok', label: 'TikTok' },
                      { value: 'codepen', label: 'CodePen' },
                      { value: 'spotify', label: 'Spotify' },
                      { value: 'soundcloud', label: 'SoundCloud' },
                    ]}
                  />
                </FormField>
                <FormField label="Aspect Ratio">
                  <Select
                    value={embedSettings.aspectRatio}
                    onChange={(v) => setEmbedSettings(s => ({ ...s, aspectRatio: v as any }))}
                    options={[
                      { value: '16:9', label: 'Widescreen (16:9)' },
                      { value: '4:3', label: 'Standard (4:3)' },
                      { value: '1:1', label: 'Square (1:1)' },
                      { value: '9:16', label: 'Vertical (9:16)' },
                      { value: '21:9', label: 'Ultrawide (21:9)' },
                    ]}
                  />
                </FormField>
                <FormField label="Max Width (px)">
                  <Input
                    type="number"
                    value={embedSettings.maxWidth}
                    onChange={(v) => setEmbedSettings(s => ({ ...s, maxWidth: parseInt(v) || 800 }))}
                    min={200}
                    max={1920}
                  />
                </FormField>
              </FormRow>

              <FormRow columns={2}>
                <FormField label="Start Time (seconds)">
                  <Input
                    type="number"
                    value={embedSettings.startTime}
                    onChange={(v) => setEmbedSettings(s => ({ ...s, startTime: parseInt(v) || 0 }))}
                    min={0}
                  />
                </FormField>
                <FormField label="Border Radius (px)">
                  <Input
                    type="number"
                    value={embedSettings.borderRadius}
                    onChange={(v) => setEmbedSettings(s => ({ ...s, borderRadius: parseInt(v) || 0 }))}
                    min={0}
                    max={50}
                  />
                </FormField>
              </FormRow>

              <div className="grid grid-cols-3 gap-4">
                <Toggle
                  checked={embedSettings.autoplay}
                  onChange={(v) => setEmbedSettings(s => ({ ...s, autoplay: v }))}
                  label="Autoplay"
                  description="Play automatically"
                />
                <Toggle
                  checked={embedSettings.loop}
                  onChange={(v) => setEmbedSettings(s => ({ ...s, loop: v }))}
                  label="Loop"
                  description="Repeat video"
                />
                <Toggle
                  checked={embedSettings.muted}
                  onChange={(v) => setEmbedSettings(s => ({ ...s, muted: v }))}
                  label="Muted"
                  description="Start muted"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Toggle
                  checked={embedSettings.showControls}
                  onChange={(v) => setEmbedSettings(s => ({ ...s, showControls: v }))}
                  label="Show Controls"
                  description="Display player controls"
                />
                <Toggle
                  checked={embedSettings.privacyMode}
                  onChange={(v) => setEmbedSettings(s => ({ ...s, privacyMode: v }))}
                  label="Privacy Mode"
                  description="Enhanced privacy (YouTube)"
                />
                <Toggle
                  checked={embedSettings.lazyLoad}
                  onChange={(v) => setEmbedSettings(s => ({ ...s, lazyLoad: v }))}
                  label="Lazy Load"
                  description="Load when visible"
                />
              </div>

              <FormField label="Caption">
                <Input
                  value={embedSettings.caption}
                  onChange={(v) => setEmbedSettings(s => ({ ...s, caption: v }))}
                  placeholder="Optional caption for the embed"
                />
              </FormField>
            </div>
          </ModalSection>
        </div>
      )}
    </EditorModal>
  );
};

export default VisualElementsModal;
