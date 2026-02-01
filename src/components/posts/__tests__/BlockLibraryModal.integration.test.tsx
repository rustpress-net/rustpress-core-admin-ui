/**
 * Block Library Modal - Integration Tests
 * Tests for BlockLibraryModal integration with editor and API
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../test/utils';

// ============================================
// MOCK API RESPONSES
// ============================================

const mockBlockLibraryResponse = {
  blocks: [
    {
      id: 'paragraph',
      name: 'Paragraph',
      description: 'Start writing with plain text',
      icon: 'FileText',
      category: 'text',
      html_template: '<p>{{content}}</p>',
      default_attributes: {},
      supports: { alignment: true, color: true, typography: true, spacing: true, html: true, reusable: true },
    },
    {
      id: 'heading',
      name: 'Heading',
      description: 'Large section heading',
      icon: 'Type',
      category: 'text',
      html_template: '<h{{level}}>{{content}}</h{{level}}>',
      default_attributes: { level: 2 },
      supports: { alignment: true, color: true, typography: true, spacing: true, html: true, reusable: true },
    },
    {
      id: 'image',
      name: 'Image',
      description: 'Insert an image',
      icon: 'Image',
      category: 'media',
      html_template: '<figure><img src="{{src}}" alt="{{alt}}" /></figure>',
      default_attributes: {},
      supports: { alignment: true, color: false, typography: false, spacing: true, html: true, reusable: true },
    },
  ],
  categories: [
    { id: 'cat-1', name: 'Text', slug: 'text', description: 'Text blocks', icon: 'Type', sort_order: 1, is_system: true },
    { id: 'cat-2', name: 'Media', slug: 'media', description: 'Media blocks', icon: 'Image', sort_order: 2, is_system: true },
  ],
  custom_blocks: [
    {
      id: 'custom-1',
      user_id: 'user-1',
      name: 'My Custom Block',
      description: 'A reusable custom block',
      category: 'custom',
      icon: 'Box',
      content: '<div class="custom">Custom content</div>',
      preview_html: '<div class="custom">Custom content</div>',
      settings: {},
      is_global: false,
      usage_count: 5,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ],
  recent_blocks: ['paragraph', 'heading', 'image'],
  favorite_blocks: ['paragraph'],
};

const mockUserPreferencesResponse = {
  user_id: 'user-1',
  recent_blocks: ['paragraph', 'heading', 'image'],
  favorite_blocks: ['paragraph'],
  block_settings: {},
  updated_at: '2024-01-01T00:00:00Z',
};

const mockAnalyticsResponse = {
  total_insertions: 150,
  unique_blocks_used: 12,
  most_used_blocks: [
    { block_id: 'paragraph', block_type: 'builtin', usage_count: 45, last_used: '2024-01-15T00:00:00Z' },
    { block_id: 'heading', block_type: 'builtin', usage_count: 30, last_used: '2024-01-15T00:00:00Z' },
  ],
  recent_activity: [
    { block_id: 'image', block_type: 'builtin', usage_count: 5, last_used: '2024-01-15T00:00:00Z' },
  ],
};

// ============================================
// MOCK FETCH
// ============================================

const createMockFetch = () => {
  return vi.fn((url: string, options?: RequestInit) => {
    // GET /api/blocks/library
    if (url.includes('/api/blocks/library') && (!options?.method || options?.method === 'GET')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockBlockLibraryResponse),
      });
    }

    // GET /api/blocks/preferences
    if (url.includes('/api/blocks/preferences')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUserPreferencesResponse),
      });
    }

    // POST /api/blocks/recent
    if (url.includes('/api/blocks/recent') && options?.method === 'POST') {
      const body = JSON.parse(options.body as string);
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          ...mockUserPreferencesResponse,
          recent_blocks: [body.block_id, ...mockUserPreferencesResponse.recent_blocks.slice(0, 19)],
        }),
      });
    }

    // POST /api/blocks/favorites/:id
    if (url.includes('/api/blocks/favorites') && options?.method === 'POST') {
      const blockId = url.split('/').pop();
      const isFavorite = !mockUserPreferencesResponse.favorite_blocks.includes(blockId!);
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          block_id: blockId,
          is_favorite: isFavorite,
        }),
      });
    }

    // POST /api/blocks/usage
    if (url.includes('/api/blocks/usage') && options?.method === 'POST') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    }

    // GET /api/blocks/analytics
    if (url.includes('/api/blocks/analytics')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAnalyticsResponse),
      });
    }

    // POST /api/blocks/custom
    if (url.includes('/api/blocks/custom') && options?.method === 'POST') {
      const body = JSON.parse(options.body as string);
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          id: 'custom-new',
          user_id: 'user-1',
          name: body.name,
          description: body.description,
          category: body.category || 'custom',
          icon: body.icon || 'Box',
          content: body.content,
          preview_html: body.preview_html,
          settings: body.settings || {},
          is_global: body.is_global || false,
          usage_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });
    }

    // Default response
    return Promise.resolve({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'Not found' }),
    });
  });
};

// ============================================
// MOCK COMPONENTS WITH API INTEGRATION
// ============================================

interface BlockLibraryWithApiProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertBlock?: (html: string) => void;
  userId?: string;
}

const BlockLibraryWithApi: React.FC<BlockLibraryWithApiProps> = ({
  isOpen,
  onClose,
  onInsertBlock,
  userId = 'user-1',
}) => {
  const [blocks, setBlocks] = React.useState<typeof mockBlockLibraryResponse.blocks>([]);
  const [categories, setCategories] = React.useState<typeof mockBlockLibraryResponse.categories>([]);
  const [customBlocks, setCustomBlocks] = React.useState<typeof mockBlockLibraryResponse.custom_blocks>([]);
  const [recentBlocks, setRecentBlocks] = React.useState<string[]>([]);
  const [favoriteBlocks, setFavoriteBlocks] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<'blocks' | 'recent' | 'favorites' | 'custom'>('blocks');

  React.useEffect(() => {
    if (isOpen) {
      loadBlockLibrary();
    }
  }, [isOpen]);

  const loadBlockLibrary = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/blocks/library?user_id=${userId}`);
      if (!response.ok) throw new Error('Failed to load block library');
      const data = await response.json();
      setBlocks(data.blocks);
      setCategories(data.categories);
      setCustomBlocks(data.custom_blocks);
      setRecentBlocks(data.recent_blocks);
      setFavoriteBlocks(data.favorite_blocks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockInsert = async (block: typeof blocks[0]) => {
    // Track usage
    await fetch('/api/blocks/usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        block_id: block.id,
        block_type: 'builtin',
        action: 'insert',
      }),
    });

    // Update recent blocks
    await fetch('/api/blocks/recent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ block_id: block.id }),
    });

    // Insert block
    const html = block.html_template.replace('{{content}}', `New ${block.name}`);
    onInsertBlock?.(html);
    onClose();
  };

  const handleToggleFavorite = async (blockId: string) => {
    const response = await fetch(`/api/blocks/favorites/${blockId}`, {
      method: 'POST',
    });
    const data = await response.json();

    if (data.is_favorite) {
      setFavoriteBlocks(prev => [...prev, blockId]);
    } else {
      setFavoriteBlocks(prev => prev.filter(id => id !== blockId));
    }
  };

  const handleCreateCustomBlock = async (content: string, name: string) => {
    const response = await fetch('/api/blocks/custom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        content,
        category: 'custom',
      }),
    });
    const newBlock = await response.json();
    setCustomBlocks(prev => [...prev, newBlock]);
  };

  if (!isOpen) return null;

  return (
    <div data-testid="block-library-api" role="dialog">
      {loading && <div data-testid="loading">Loading...</div>}
      {error && <div data-testid="error">{error}</div>}

      {!loading && !error && (
        <>
          <div className="tabs">
            <button
              onClick={() => setActiveTab('blocks')}
              className={activeTab === 'blocks' ? 'active' : ''}
              data-testid="tab-all-blocks"
            >
              All Blocks ({blocks.length})
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={activeTab === 'recent' ? 'active' : ''}
              data-testid="tab-recent"
            >
              Recent ({recentBlocks.length})
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={activeTab === 'favorites' ? 'active' : ''}
              data-testid="tab-favorites"
            >
              Favorites ({favoriteBlocks.length})
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={activeTab === 'custom' ? 'active' : ''}
              data-testid="tab-custom"
            >
              Custom ({customBlocks.length})
            </button>
          </div>

          <div className="content">
            {activeTab === 'blocks' && (
              <div data-testid="all-blocks-content">
                {blocks.map(block => (
                  <div key={block.id} className="block-item" data-testid={`block-item-${block.id}`}>
                    <button onClick={() => handleBlockInsert(block)} data-testid={`insert-${block.id}`}>
                      {block.name}
                    </button>
                    <button
                      onClick={() => handleToggleFavorite(block.id)}
                      data-testid={`favorite-${block.id}`}
                      className={favoriteBlocks.includes(block.id) ? 'is-favorite' : ''}
                    >
                      {favoriteBlocks.includes(block.id) ? 'Unfavorite' : 'Favorite'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'recent' && (
              <div data-testid="recent-blocks-content">
                {recentBlocks.map(blockId => {
                  const block = blocks.find(b => b.id === blockId);
                  if (!block) return null;
                  return (
                    <button
                      key={blockId}
                      onClick={() => handleBlockInsert(block)}
                      data-testid={`recent-${blockId}`}
                    >
                      {block.name}
                    </button>
                  );
                })}
              </div>
            )}

            {activeTab === 'favorites' && (
              <div data-testid="favorites-content">
                {favoriteBlocks.map(blockId => {
                  const block = blocks.find(b => b.id === blockId);
                  if (!block) return null;
                  return (
                    <button
                      key={blockId}
                      onClick={() => handleBlockInsert(block)}
                      data-testid={`favorite-block-${blockId}`}
                    >
                      {block.name}
                    </button>
                  );
                })}
              </div>
            )}

            {activeTab === 'custom' && (
              <div data-testid="custom-blocks-content">
                {customBlocks.map(block => (
                  <button
                    key={block.id}
                    onClick={() => onInsertBlock?.(block.content)}
                    data-testid={`custom-block-${block.id}`}
                  >
                    {block.name}
                  </button>
                ))}
                <button
                  onClick={() => handleCreateCustomBlock('<div>New custom</div>', 'New Block')}
                  data-testid="create-custom-block"
                >
                  Create Custom Block
                </button>
              </div>
            )}
          </div>

          <button onClick={onClose} data-testid="close-modal">Close</button>
        </>
      )}
    </div>
  );
};

// ============================================
// MOCK EDITOR INTEGRATION
// ============================================

interface EditorWithBlockLibraryProps {
  initialContent?: string;
}

const EditorWithBlockLibrary: React.FC<EditorWithBlockLibraryProps> = ({
  initialContent = '',
}) => {
  const [content, setContent] = React.useState(initialContent);
  const [isBlockLibraryOpen, setIsBlockLibraryOpen] = React.useState(false);
  const [insertHistory, setInsertHistory] = React.useState<string[]>([]);

  const handleInsertBlock = (html: string) => {
    setContent(prev => prev + html);
    setInsertHistory(prev => [...prev, html]);
  };

  return (
    <div data-testid="editor-with-block-library">
      <button onClick={() => setIsBlockLibraryOpen(true)} data-testid="open-block-library">
        Add Block
      </button>

      <div
        data-testid="editor-content"
        contentEditable
        dangerouslySetInnerHTML={{ __html: content }}
      />

      <div data-testid="insert-history">
        {insertHistory.map((html, i) => (
          <div key={i} data-testid={`history-${i}`}>{html}</div>
        ))}
      </div>

      <BlockLibraryWithApi
        isOpen={isBlockLibraryOpen}
        onClose={() => setIsBlockLibraryOpen(false)}
        onInsertBlock={handleInsertBlock}
      />
    </div>
  );
};

// ============================================
// INTEGRATION TESTS
// ============================================

describe('BlockLibraryModal - Integration Tests', () => {
  let mockFetch: ReturnType<typeof createMockFetch>;

  beforeEach(() => {
    mockFetch = createMockFetch();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe('API Integration', () => {
    it('should load block library from API when opened', async () => {
      render(
        <BlockLibraryWithApi
          isOpen={true}
          onClose={() => {}}
        />
      );

      // Should show loading initially
      expect(screen.getByTestId('loading')).toBeInTheDocument();

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Should have called the API
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/blocks/library'));

      // Should render blocks
      expect(screen.getByTestId('all-blocks-content')).toBeInTheDocument();
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: 'Server error' }),
        })
      );

      render(
        <BlockLibraryWithApi
          isOpen={true}
          onClose={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument();
      });
    });

    it('should track block usage when inserting', async () => {
      const mockOnInsert = vi.fn();

      const { user } = render(
        <BlockLibraryWithApi
          isOpen={true}
          onClose={() => {}}
          onInsertBlock={mockOnInsert}
        />
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      await user.click(screen.getByTestId('insert-paragraph'));

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/blocks/usage',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('paragraph'),
        })
      );
    });

    it('should update recent blocks after insertion', async () => {
      const mockOnInsert = vi.fn();

      const { user } = render(
        <BlockLibraryWithApi
          isOpen={true}
          onClose={() => {}}
          onInsertBlock={mockOnInsert}
        />
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      await user.click(screen.getByTestId('insert-heading'));

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/blocks/recent',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('heading'),
        })
      );
    });

    it('should toggle favorite status via API', async () => {
      const { user } = render(
        <BlockLibraryWithApi
          isOpen={true}
          onClose={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      await user.click(screen.getByTestId('favorite-heading'));

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/blocks/favorites/heading',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('should create custom blocks via API', async () => {
      const { user } = render(
        <BlockLibraryWithApi
          isOpen={true}
          onClose={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      await user.click(screen.getByTestId('tab-custom'));
      await user.click(screen.getByTestId('create-custom-block'));

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/blocks/custom',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('New Block'),
        })
      );
    });
  });

  describe('Tab Navigation with Data', () => {
    it('should show correct count in recent tab', async () => {
      render(
        <BlockLibraryWithApi
          isOpen={true}
          onClose={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('tab-recent').textContent).toContain('3');
    });

    it('should show recent blocks when tab is clicked', async () => {
      const { user } = render(
        <BlockLibraryWithApi
          isOpen={true}
          onClose={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      await user.click(screen.getByTestId('tab-recent'));

      expect(screen.getByTestId('recent-blocks-content')).toBeInTheDocument();
      expect(screen.getByTestId('recent-paragraph')).toBeInTheDocument();
    });

    it('should show favorites when tab is clicked', async () => {
      const { user } = render(
        <BlockLibraryWithApi
          isOpen={true}
          onClose={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      await user.click(screen.getByTestId('tab-favorites'));

      expect(screen.getByTestId('favorites-content')).toBeInTheDocument();
      expect(screen.getByTestId('favorite-block-paragraph')).toBeInTheDocument();
    });

    it('should show custom blocks when tab is clicked', async () => {
      const { user } = render(
        <BlockLibraryWithApi
          isOpen={true}
          onClose={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      await user.click(screen.getByTestId('tab-custom'));

      expect(screen.getByTestId('custom-blocks-content')).toBeInTheDocument();
      expect(screen.getByTestId('custom-block-custom-1')).toBeInTheDocument();
    });
  });

  describe('Editor Integration', () => {
    it('should open block library when button is clicked', async () => {
      const { user } = render(<EditorWithBlockLibrary />);

      await user.click(screen.getByTestId('open-block-library'));

      await waitFor(() => {
        expect(screen.getByTestId('block-library-api')).toBeInTheDocument();
      });
    });

    it('should insert block content into editor', async () => {
      const { user } = render(<EditorWithBlockLibrary />);

      await user.click(screen.getByTestId('open-block-library'));

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      await user.click(screen.getByTestId('insert-paragraph'));

      await waitFor(() => {
        expect(screen.queryByTestId('block-library-api')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('insert-history').textContent).toContain('Paragraph');
    });

    it('should maintain insert history', async () => {
      const { user } = render(<EditorWithBlockLibrary />);

      // Insert first block
      await user.click(screen.getByTestId('open-block-library'));
      await waitFor(() => expect(screen.queryByTestId('loading')).not.toBeInTheDocument());
      await user.click(screen.getByTestId('insert-paragraph'));

      // Insert second block
      await user.click(screen.getByTestId('open-block-library'));
      await waitFor(() => expect(screen.queryByTestId('loading')).not.toBeInTheDocument());
      await user.click(screen.getByTestId('insert-heading'));

      const history = screen.getByTestId('insert-history');
      expect(history.children.length).toBe(2);
    });

    it('should close modal after insertion', async () => {
      const { user } = render(<EditorWithBlockLibrary />);

      await user.click(screen.getByTestId('open-block-library'));

      await waitFor(() => {
        expect(screen.getByTestId('block-library-api')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      await user.click(screen.getByTestId('insert-paragraph'));

      await waitFor(() => {
        expect(screen.queryByTestId('block-library-api')).not.toBeInTheDocument();
      });
    });
  });

  describe('State Persistence', () => {
    it('should update favorite button state after toggling', async () => {
      const { user } = render(
        <BlockLibraryWithApi
          isOpen={true}
          onClose={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      const favoriteButton = screen.getByTestId('favorite-heading');
      expect(favoriteButton.textContent).toBe('Favorite');

      await user.click(favoriteButton);

      await waitFor(() => {
        expect(favoriteButton.textContent).toBe('Unfavorite');
      });
    });

    it('should add new custom block to list after creation', async () => {
      const { user } = render(
        <BlockLibraryWithApi
          isOpen={true}
          onClose={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      await user.click(screen.getByTestId('tab-custom'));

      const initialCount = screen.getByTestId('custom-blocks-content').children.length;

      await user.click(screen.getByTestId('create-custom-block'));

      await waitFor(() => {
        expect(screen.getByTestId('custom-blocks-content').children.length).toBe(initialCount + 1);
      });
    });
  });
});

describe('BlockLibraryModal - Error Handling', () => {
  let mockFetch: ReturnType<typeof createMockFetch>;

  beforeEach(() => {
    mockFetch = createMockFetch();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('should display error message when API fails', async () => {
    mockFetch.mockImplementation(() =>
      Promise.reject(new Error('Network error'))
    );

    render(
      <BlockLibraryWithApi
        isOpen={true}
        onClose={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument();
    });

    expect(screen.getByTestId('error').textContent).toBe('Network error');
  });

  it('should handle timeout errors', async () => {
    mockFetch.mockImplementation(
      () => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 100))
    );

    render(
      <BlockLibraryWithApi
        isOpen={true}
        onClose={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument();
    }, { timeout: 500 });
  });
});
