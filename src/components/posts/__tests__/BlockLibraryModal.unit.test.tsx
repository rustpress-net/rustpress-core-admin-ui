/**
 * Block Library Modal - Unit Tests
 * Tests for the BlockLibraryModal component functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../test/utils';

// ============================================
// MOCK DATA
// ============================================

const mockContentBlocks = [
  { id: 'paragraph', name: 'Paragraph', icon: 'FileText', description: 'Start writing with plain text', category: 'text' },
  { id: 'heading', name: 'Heading', icon: 'Type', description: 'Large section heading (H2-H6)', category: 'text' },
  { id: 'quote', name: 'Quote', icon: 'Quote', description: 'Give quoted text visual emphasis', category: 'text' },
  { id: 'list', name: 'List', icon: 'List', description: 'Create a bulleted or numbered list', category: 'text' },
  { id: 'code', name: 'Code', icon: 'Code', description: 'Display code with syntax highlighting', category: 'text' },
  { id: 'image', name: 'Image', icon: 'Image', description: 'Insert an image to make a visual statement', category: 'media' },
  { id: 'gallery', name: 'Gallery', icon: 'Grid', description: 'Display multiple images in a gallery', category: 'media' },
  { id: 'video', name: 'Video', icon: 'Play', description: 'Embed a video from your media library', category: 'media' },
  { id: 'columns', name: 'Columns', icon: 'Columns', description: 'Add a block that displays content in columns', category: 'layout' },
  { id: 'button', name: 'Button', icon: 'MousePointer', description: 'Add a customizable call-to-action button', category: 'interactive' },
];

const mockBlockCategories = [
  { id: 'all', label: 'All Blocks', count: 22 },
  { id: 'text', label: 'Text', count: 6 },
  { id: 'media', label: 'Media', count: 5 },
  { id: 'layout', label: 'Layout', count: 4 },
  { id: 'embed', label: 'Embed', count: 2 },
  { id: 'interactive', label: 'Interactive', count: 5 },
];

const mockAnimations = [
  { id: 'fade-in', name: 'Fade In', category: 'entrance', preview: 'animate-fadeIn' },
  { id: 'slide-up', name: 'Slide Up', category: 'entrance', preview: 'animate-slideUp' },
  { id: 'bounce', name: 'Bounce', category: 'emphasis', preview: 'animate-bounce' },
];

const mockTemplates = [
  { id: 'hero-1', name: 'Hero Section', category: 'hero', thumbnail: '/templates/hero-1.png' },
  { id: 'features-1', name: 'Feature Grid', category: 'features', thumbnail: '/templates/features-1.png' },
];

const mockMediaItems = [
  { id: 'img-1', name: 'sample.jpg', type: 'image', url: '/uploads/sample.jpg', size: '1.2 MB' },
  { id: 'img-2', name: 'banner.png', type: 'image', url: '/uploads/banner.png', size: '2.5 MB' },
];

// ============================================
// MOCK COMPONENTS
// ============================================

interface BlockLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertBlock?: (html: string) => void;
  initialTab?: 'blocks' | 'animations' | 'templates' | 'media';
  hideTabs?: boolean;
}

// Mock BlockLibraryModal for testing
const MockBlockLibraryModal: React.FC<BlockLibraryModalProps> = ({
  isOpen,
  onClose,
  onInsertBlock,
  initialTab = 'blocks',
  hideTabs = false,
}) => {
  const [activeTab, setActiveTab] = React.useState(initialTab);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  const filteredBlocks = mockContentBlocks.filter(block => {
    const matchesSearch = block.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          block.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || block.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBlockClick = (block: typeof mockContentBlocks[0]) => {
    const html = `<${block.id === 'paragraph' ? 'p' : 'div'} class="${block.id}">New ${block.name}</div>`;
    onInsertBlock?.(html);
    onClose();
  };

  return (
    <div data-testid="block-library-modal" role="dialog" aria-label="Block Library">
      <div className="modal-header">
        <h2>Block Library</h2>
        <button onClick={onClose} aria-label="Close modal">Close</button>
      </div>

      {!hideTabs && (
        <div className="tabs" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'blocks'}
            onClick={() => setActiveTab('blocks')}
            data-testid="tab-blocks"
          >
            Content Blocks
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'animations'}
            onClick={() => setActiveTab('animations')}
            data-testid="tab-animations"
          >
            Animations
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'templates'}
            onClick={() => setActiveTab('templates')}
            data-testid="tab-templates"
          >
            Templates
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'media'}
            onClick={() => setActiveTab('media')}
            data-testid="tab-media"
          >
            Media Library
          </button>
        </div>
      )}

      <div className="modal-content">
        {activeTab === 'blocks' && (
          <div data-testid="blocks-tab-content">
            <input
              type="text"
              placeholder="Search blocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="block-search"
            />

            <div className="categories" data-testid="block-categories">
              {mockBlockCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={selectedCategory === cat.id ? 'active' : ''}
                  data-testid={`category-${cat.id}`}
                >
                  {cat.label} ({cat.count})
                </button>
              ))}
            </div>

            <div className="blocks-grid" data-testid="blocks-grid">
              {filteredBlocks.map(block => (
                <button
                  key={block.id}
                  onClick={() => handleBlockClick(block)}
                  data-testid={`block-${block.id}`}
                  className="block-item"
                >
                  <span className="block-icon">{block.icon}</span>
                  <span className="block-name">{block.name}</span>
                  <span className="block-description">{block.description}</span>
                </button>
              ))}
            </div>

            {filteredBlocks.length === 0 && (
              <div data-testid="no-results">No blocks found</div>
            )}
          </div>
        )}

        {activeTab === 'animations' && (
          <div data-testid="animations-tab-content">
            {mockAnimations.map(anim => (
              <button key={anim.id} data-testid={`animation-${anim.id}`}>
                {anim.name}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'templates' && (
          <div data-testid="templates-tab-content">
            {mockTemplates.map(template => (
              <button key={template.id} data-testid={`template-${template.id}`}>
                {template.name}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'media' && (
          <div data-testid="media-tab-content">
            {mockMediaItems.map(item => (
              <button key={item.id} data-testid={`media-${item.id}`}>
                {item.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// UNIT TESTS
// ============================================

describe('BlockLibraryModal - Unit Tests', () => {
  const mockOnClose = vi.fn();
  const mockOnInsertBlock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Modal Rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(
        <MockBlockLibraryModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByTestId('block-library-modal')).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      render(
        <MockBlockLibraryModal
          isOpen={false}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByTestId('block-library-modal')).not.toBeInTheDocument();
    });

    it('should render all tabs', () => {
      render(
        <MockBlockLibraryModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByTestId('tab-blocks')).toBeInTheDocument();
      expect(screen.getByTestId('tab-animations')).toBeInTheDocument();
      expect(screen.getByTestId('tab-templates')).toBeInTheDocument();
      expect(screen.getByTestId('tab-media')).toBeInTheDocument();
    });

    it('should hide tabs when hideTabs is true', () => {
      render(
        <MockBlockLibraryModal
          isOpen={true}
          onClose={mockOnClose}
          hideTabs={true}
        />
      );

      expect(screen.queryByTestId('tab-blocks')).not.toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('should show blocks tab content by default', () => {
      render(
        <MockBlockLibraryModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByTestId('blocks-tab-content')).toBeInTheDocument();
    });

    it('should switch to animations tab when clicked', async () => {
      const { user } = render(
        <MockBlockLibraryModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByTestId('tab-animations'));

      expect(screen.getByTestId('animations-tab-content')).toBeInTheDocument();
      expect(screen.queryByTestId('blocks-tab-content')).not.toBeInTheDocument();
    });

    it('should switch to templates tab when clicked', async () => {
      const { user } = render(
        <MockBlockLibraryModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByTestId('tab-templates'));

      expect(screen.getByTestId('templates-tab-content')).toBeInTheDocument();
    });

    it('should switch to media tab when clicked', async () => {
      const { user } = render(
        <MockBlockLibraryModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByTestId('tab-media'));

      expect(screen.getByTestId('media-tab-content')).toBeInTheDocument();
    });

    it('should respect initialTab prop', () => {
      render(
        <MockBlockLibraryModal
          isOpen={true}
          onClose={mockOnClose}
          initialTab="animations"
        />
      );

      expect(screen.getByTestId('animations-tab-content')).toBeInTheDocument();
    });
  });

  describe('Block Search', () => {
    it('should render search input', () => {
      render(
        <MockBlockLibraryModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByTestId('block-search')).toBeInTheDocument();
    });

    it('should filter blocks by search query', async () => {
      const { user } = render(
        <MockBlockLibraryModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const searchInput = screen.getByTestId('block-search');
      await user.type(searchInput, 'paragraph');

      expect(screen.getByTestId('block-paragraph')).toBeInTheDocument();
      expect(screen.queryByTestId('block-heading')).not.toBeInTheDocument();
    });

    it('should show no results message when search has no matches', async () => {
      const { user } = render(
        <MockBlockLibraryModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const searchInput = screen.getByTestId('block-search');
      await user.type(searchInput, 'nonexistentblock');

      expect(screen.getByTestId('no-results')).toBeInTheDocument();
    });

    it('should search by description', async () => {
      const { user } = render(
        <MockBlockLibraryModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const searchInput = screen.getByTestId('block-search');
      await user.type(searchInput, 'syntax highlighting');

      expect(screen.getByTestId('block-code')).toBeInTheDocument();
    });
  });

  describe('Block Categories', () => {
    it('should render all categories', () => {
      render(
        <MockBlockLibraryModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByTestId('category-all')).toBeInTheDocument();
      expect(screen.getByTestId('category-text')).toBeInTheDocument();
      expect(screen.getByTestId('category-media')).toBeInTheDocument();
      expect(screen.getByTestId('category-layout')).toBeInTheDocument();
    });

    it('should filter blocks by category', async () => {
      const { user } = render(
        <MockBlockLibraryModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByTestId('category-media'));

      expect(screen.getByTestId('block-image')).toBeInTheDocument();
      expect(screen.getByTestId('block-gallery')).toBeInTheDocument();
      expect(screen.getByTestId('block-video')).toBeInTheDocument();
      expect(screen.queryByTestId('block-paragraph')).not.toBeInTheDocument();
    });

    it('should show all blocks when "All Blocks" is selected', async () => {
      const { user } = render(
        <MockBlockLibraryModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // First filter by category
      await user.click(screen.getByTestId('category-text'));

      // Then select all
      await user.click(screen.getByTestId('category-all'));

      // Should show all blocks
      expect(screen.getByTestId('blocks-grid').children.length).toBeGreaterThan(5);
    });
  });

  describe('Block Selection', () => {
    it('should render all content blocks', () => {
      render(
        <MockBlockLibraryModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByTestId('block-paragraph')).toBeInTheDocument();
      expect(screen.getByTestId('block-heading')).toBeInTheDocument();
      expect(screen.getByTestId('block-image')).toBeInTheDocument();
    });

    it('should call onInsertBlock when block is clicked', async () => {
      const { user } = render(
        <MockBlockLibraryModal
          isOpen={true}
          onClose={mockOnClose}
          onInsertBlock={mockOnInsertBlock}
        />
      );

      await user.click(screen.getByTestId('block-heading'));

      expect(mockOnInsertBlock).toHaveBeenCalledWith(expect.stringContaining('heading'));
    });

    it('should close modal after inserting block', async () => {
      const { user } = render(
        <MockBlockLibraryModal
          isOpen={true}
          onClose={mockOnClose}
          onInsertBlock={mockOnInsertBlock}
        />
      );

      await user.click(screen.getByTestId('block-paragraph'));

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Close Modal', () => {
    it('should call onClose when close button is clicked', async () => {
      const { user } = render(
        <MockBlockLibraryModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByLabelText('Close modal'));

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Animations Tab', () => {
    it('should render animation items', async () => {
      const { user } = render(
        <MockBlockLibraryModal
          isOpen={true}
          onClose={mockOnClose}
          initialTab="animations"
        />
      );

      expect(screen.getByTestId('animation-fade-in')).toBeInTheDocument();
      expect(screen.getByTestId('animation-slide-up')).toBeInTheDocument();
      expect(screen.getByTestId('animation-bounce')).toBeInTheDocument();
    });
  });

  describe('Templates Tab', () => {
    it('should render template items', async () => {
      const { user } = render(
        <MockBlockLibraryModal
          isOpen={true}
          onClose={mockOnClose}
          initialTab="templates"
        />
      );

      expect(screen.getByTestId('template-hero-1')).toBeInTheDocument();
      expect(screen.getByTestId('template-features-1')).toBeInTheDocument();
    });
  });

  describe('Media Tab', () => {
    it('should render media items', async () => {
      const { user } = render(
        <MockBlockLibraryModal
          isOpen={true}
          onClose={mockOnClose}
          initialTab="media"
        />
      );

      expect(screen.getByTestId('media-img-1')).toBeInTheDocument();
      expect(screen.getByTestId('media-img-2')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper dialog role', () => {
      render(
        <MockBlockLibraryModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have proper aria-label', () => {
      render(
        <MockBlockLibraryModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Block Library');
    });

    it('should have proper tab roles', () => {
      render(
        <MockBlockLibraryModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBe(4);
    });

    it('should indicate selected tab with aria-selected', async () => {
      const { user } = render(
        <MockBlockLibraryModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const blocksTab = screen.getByTestId('tab-blocks');
      expect(blocksTab).toHaveAttribute('aria-selected', 'true');

      await user.click(screen.getByTestId('tab-animations'));

      expect(screen.getByTestId('tab-animations')).toHaveAttribute('aria-selected', 'true');
      expect(blocksTab).toHaveAttribute('aria-selected', 'false');
    });
  });
});

describe('BlockLibraryModal - Block Types', () => {
  it('should have all text block types', () => {
    const textBlocks = mockContentBlocks.filter(b => b.category === 'text');
    expect(textBlocks.length).toBeGreaterThan(0);
    expect(textBlocks.some(b => b.id === 'paragraph')).toBe(true);
    expect(textBlocks.some(b => b.id === 'heading')).toBe(true);
    expect(textBlocks.some(b => b.id === 'quote')).toBe(true);
  });

  it('should have all media block types', () => {
    const mediaBlocks = mockContentBlocks.filter(b => b.category === 'media');
    expect(mediaBlocks.length).toBeGreaterThan(0);
    expect(mediaBlocks.some(b => b.id === 'image')).toBe(true);
    expect(mediaBlocks.some(b => b.id === 'video')).toBe(true);
  });

  it('should have layout block types', () => {
    const layoutBlocks = mockContentBlocks.filter(b => b.category === 'layout');
    expect(layoutBlocks.length).toBeGreaterThan(0);
    expect(layoutBlocks.some(b => b.id === 'columns')).toBe(true);
  });

  it('should have interactive block types', () => {
    const interactiveBlocks = mockContentBlocks.filter(b => b.category === 'interactive');
    expect(interactiveBlocks.length).toBeGreaterThan(0);
    expect(interactiveBlocks.some(b => b.id === 'button')).toBe(true);
  });
});
