/**
 * Templates Library - Integration Tests
 * Tests for API integration and state management
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

// ============================================
// MOCK API RESPONSES
// ============================================

const mockLibraryResponse = {
  templates: [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Simple Hero',
      slug: 'simple-hero',
      description: 'Clean hero section',
      category_id: 'hero',
      thumbnail_url: '/thumbnails/hero.jpg',
      is_pro: false,
      is_system: true,
      author_name: null,
      downloads: 1234,
      rating: 4.5,
      rating_count: 89,
      tags: ['hero', 'simple'],
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'Feature Grid',
      slug: 'feature-grid',
      description: 'Three column features',
      category_id: 'features',
      thumbnail_url: '/thumbnails/features.jpg',
      is_pro: false,
      is_system: true,
      author_name: null,
      downloads: 987,
      rating: 4.7,
      rating_count: 56,
      tags: ['features', 'grid'],
    },
  ],
  categories: [
    { id: 'hero', name: 'Hero Sections', description: 'Hero sections', icon: 'star', sort_order: 1 },
    { id: 'features', name: 'Features', description: 'Feature sections', icon: 'grid', sort_order: 2 },
  ],
  user_templates: [
    {
      id: '660e8400-e29b-41d4-a716-446655440001',
      name: 'My Template',
      slug: 'my-template',
      description: 'Custom template',
      category_id: 'custom',
      thumbnail_url: null,
      is_pro: false,
      is_system: false,
      author_name: 'User',
      downloads: 0,
      rating: 0,
      rating_count: 0,
      tags: ['custom'],
    },
  ],
  favorites: ['550e8400-e29b-41d4-a716-446655440001'],
  recent_used: ['550e8400-e29b-41d4-a716-446655440002'],
};

const mockTemplateDetailResponse = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  name: 'Simple Hero',
  slug: 'simple-hero',
  description: 'Clean hero section',
  category: { id: 'hero', name: 'Hero Sections' },
  thumbnail_url: '/thumbnails/hero.jpg',
  html_content: '<section><h1>{{title}}</h1><p>{{subtitle}}</p></section>',
  css_content: 'section { padding: 80px; }',
  variables: [
    { name: 'title', type: 'text', defaultValue: 'Welcome', placeholder: 'Title' },
    { name: 'subtitle', type: 'text', defaultValue: 'Subtitle', placeholder: 'Subtitle' },
  ],
  is_pro: false,
  is_system: true,
  author: null,
  downloads: 1234,
  rating: 4.5,
  rating_count: 89,
  is_public: true,
  tags: ['hero', 'simple'],
  version: '1.0.0',
  user_rating: null,
  is_favorited: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockProcessResponse = {
  html: '<section><h1>My Title</h1><p>My Subtitle</p></section>',
  css: 'section { padding: 80px; }',
  variables_replaced: ['title', 'subtitle'],
};

const mockCreateTemplateResponse = {
  id: '770e8400-e29b-41d4-a716-446655440001',
  name: 'New Template',
  slug: 'new-template',
  description: 'Newly created template',
  category_id: 'custom',
  thumbnail_url: null,
  html_content: '<div>Content</div>',
  css_content: null,
  variables: [],
  is_pro: false,
  is_system: false,
  author_id: '123e4567-e89b-12d3-a456-426614174000',
  downloads: 0,
  rating: 0,
  rating_count: 0,
  is_public: false,
  tags: [],
  version: '1.0.0',
  created_at: '2024-01-15T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z',
};

const mockRateResponse = {
  template_id: '550e8400-e29b-41d4-a716-446655440001',
  rating: 5,
  new_average: 4.6,
  total_ratings: 90,
};

const mockToggleFavoriteResponse = {
  template_id: '550e8400-e29b-41d4-a716-446655440002',
  is_favorited: true,
};

// ============================================
// MOCK FETCH SETUP
// ============================================

const mockFetch = vi.fn();

beforeEach(() => {
  global.fetch = mockFetch;
  mockFetch.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

function setupMockFetch(responses: Record<string, any>) {
  mockFetch.mockImplementation((url: string, options?: RequestInit) => {
    const urlStr = url.toString();

    if (urlStr.includes('/api/templates/library')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(responses.library || mockLibraryResponse),
      });
    }

    if (urlStr.match(/\/api\/templates\/[a-f0-9-]+$/) && !options?.method) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(responses.detail || mockTemplateDetailResponse),
      });
    }

    if (urlStr.includes('/api/templates/process')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(responses.process || mockProcessResponse),
      });
    }

    if (urlStr.includes('/api/templates') && options?.method === 'POST' && !urlStr.includes('rate') && !urlStr.includes('favorite') && !urlStr.includes('usage')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(responses.create || mockCreateTemplateResponse),
      });
    }

    if (urlStr.includes('/api/templates/rate')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(responses.rate || mockRateResponse),
      });
    }

    if (urlStr.includes('/api/templates/favorites/toggle')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(responses.toggleFavorite || mockToggleFavoriteResponse),
      });
    }

    if (urlStr.includes('/api/templates/usage')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    }

    if (urlStr.includes('/api/templates/categories')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(responses.categories || mockLibraryResponse.categories),
      });
    }

    return Promise.resolve({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'Not found' }),
    });
  });
}

// ============================================
// MOCK COMPONENT WITH API INTEGRATION
// ============================================

interface TemplateLibraryData {
  templates: any[];
  categories: any[];
  userTemplates: any[];
  favorites: string[];
  recentUsed: string[];
}

const useTemplateLibrary = () => {
  const [data, setData] = React.useState<TemplateLibraryData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = React.useState<any>(null);

  const fetchLibrary = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/templates/library');
      if (!response.ok) throw new Error('Failed to fetch library');
      const json = await response.json();
      setData({
        templates: json.templates,
        categories: json.categories,
        userTemplates: json.user_templates,
        favorites: json.favorites,
        recentUsed: json.recent_used,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  const getTemplateDetail = async (templateId: string) => {
    const response = await fetch(`/api/templates/${templateId}`);
    if (!response.ok) throw new Error('Failed to fetch template');
    const detail = await response.json();
    setSelectedTemplate(detail);
    return detail;
  };

  const processTemplate = async (templateId: string, variables: Record<string, string>) => {
    const response = await fetch('/api/templates/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template_id: templateId, variables, include_css: true }),
    });
    if (!response.ok) throw new Error('Failed to process template');
    return response.json();
  };

  const createTemplate = async (templateData: any) => {
    const response = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(templateData),
    });
    if (!response.ok) throw new Error('Failed to create template');
    const result = await response.json();

    setData(prev => {
      if (!prev) return prev;
      return { ...prev, userTemplates: [...prev.userTemplates, result] };
    });

    return result;
  };

  const rateTemplate = async (templateId: string, rating: number, review?: string) => {
    const response = await fetch('/api/templates/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template_id: templateId, rating, review }),
    });
    if (!response.ok) throw new Error('Failed to rate template');
    return response.json();
  };

  const toggleFavorite = async (templateId: string) => {
    const response = await fetch('/api/templates/favorites/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template_id: templateId }),
    });
    if (!response.ok) throw new Error('Failed to toggle favorite');
    const result = await response.json();

    setData(prev => {
      if (!prev) return prev;
      const favorites = result.is_favorited
        ? [...prev.favorites, templateId]
        : prev.favorites.filter(id => id !== templateId);
      return { ...prev, favorites };
    });

    return result;
  };

  const trackUsage = async (templateId: string, action: string, postId?: string) => {
    await fetch('/api/templates/usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template_id: templateId, action, post_id: postId }),
    });
  };

  return {
    data,
    loading,
    error,
    selectedTemplate,
    refetch: fetchLibrary,
    getTemplateDetail,
    processTemplate,
    createTemplate,
    rateTemplate,
    toggleFavorite,
    trackUsage,
  };
};

const MockTemplatesLibraryWithAPI = ({
  isOpen = true,
  onClose = vi.fn(),
  onInsertTemplate = vi.fn(),
}: any) => {
  const {
    data,
    loading,
    error,
    selectedTemplate,
    getTemplateDetail,
    processTemplate,
    createTemplate,
    toggleFavorite,
    trackUsage,
    rateTemplate,
  } = useTemplateLibrary();

  const [variableValues, setVariableValues] = React.useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = React.useState<'library' | 'user' | 'favorites'>('library');
  const [processedHtml, setProcessedHtml] = React.useState<string | null>(null);

  if (!isOpen) return null;

  if (loading) {
    return <div data-testid="loading-state">Loading templates...</div>;
  }

  if (error) {
    return <div data-testid="error-state">{error}</div>;
  }

  if (!data) {
    return <div data-testid="no-data-state">No template data available</div>;
  }

  const handleSelectTemplate = async (template: any) => {
    await getTemplateDetail(template.id);
  };

  const handleToggleFavorite = async (templateId: string) => {
    await toggleFavorite(templateId);
  };

  const handleVariableChange = (name: string, value: string) => {
    setVariableValues(prev => ({ ...prev, [name]: value }));
  };

  const handleInsertTemplate = async () => {
    if (!selectedTemplate) return;

    await trackUsage(selectedTemplate.id, 'insert');
    const processed = await processTemplate(selectedTemplate.id, variableValues);
    setProcessedHtml(processed.html);

    onInsertTemplate({
      template: selectedTemplate,
      variables: variableValues,
      html: processed.html,
      css: processed.css,
    });

    onClose();
  };

  const handleCreateTemplate = async () => {
    const newTemplate = {
      name: 'New Template',
      description: 'My new template',
      html_content: '<div>Content</div>',
      category_id: 'custom',
      is_public: false,
    };
    await createTemplate(newTemplate);
  };

  const handleRateTemplate = async (rating: number) => {
    if (!selectedTemplate) return;
    await rateTemplate(selectedTemplate.id, rating);
  };

  const favoriteTemplates = data.templates.filter(t => data.favorites.includes(t.id));

  return (
    <div data-testid="templates-library-modal" role="dialog">
      <div className="modal-header">
        <h2>Template Library</h2>
        <button data-testid="close-modal" onClick={onClose}>×</button>
      </div>

      <div className="modal-tabs" role="tablist">
        <button
          role="tab"
          data-testid="tab-library"
          aria-selected={activeTab === 'library'}
          onClick={() => setActiveTab('library')}
        >
          Library ({data.templates.length})
        </button>
        <button
          role="tab"
          data-testid="tab-user"
          aria-selected={activeTab === 'user'}
          onClick={() => setActiveTab('user')}
        >
          My Templates ({data.userTemplates.length})
        </button>
        <button
          role="tab"
          data-testid="tab-favorites"
          aria-selected={activeTab === 'favorites'}
          onClick={() => setActiveTab('favorites')}
        >
          Favorites ({data.favorites.length})
        </button>
      </div>

      <div className="modal-content">
        {activeTab === 'library' && (
          <div data-testid="library-tab-content">
            <div className="templates-grid" data-testid="templates-grid">
              {data.templates.map((template: any) => (
                <div
                  key={template.id}
                  data-testid={`template-${template.id}`}
                  onClick={() => handleSelectTemplate(template)}
                  className={`template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                >
                  <span className="name">{template.name}</span>
                  <span className="downloads">{template.downloads} downloads</span>
                  <span className="rating">★ {template.rating}</span>
                  <button
                    data-testid={`favorite-${template.id}`}
                    onClick={(e) => { e.stopPropagation(); handleToggleFavorite(template.id); }}
                    className={data.favorites.includes(template.id) ? 'favorited' : ''}
                  >
                    {data.favorites.includes(template.id) ? '★' : '☆'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'user' && (
          <div data-testid="user-tab-content">
            <button data-testid="create-template-btn" onClick={handleCreateTemplate}>
              Create Template
            </button>
            {data.userTemplates.map((template: any) => (
              <div key={template.id} data-testid={`user-template-${template.id}`}>
                {template.name}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div data-testid="favorites-tab-content">
            {favoriteTemplates.length === 0 ? (
              <div data-testid="no-favorites">No favorites</div>
            ) : (
              favoriteTemplates.map((template: any) => (
                <div key={template.id} data-testid={`favorite-template-${template.id}`}>
                  {template.name}
                </div>
              ))
            )}
          </div>
        )}

        {selectedTemplate && (
          <div data-testid="template-sidebar">
            <h3 data-testid="selected-name">{selectedTemplate.name}</h3>
            <p>{selectedTemplate.description}</p>

            {selectedTemplate.variables?.length > 0 && (
              <div data-testid="variable-form">
                {selectedTemplate.variables.map((variable: any) => (
                  <div key={variable.name}>
                    <label>{variable.name}</label>
                    <input
                      type="text"
                      data-testid={`variable-${variable.name}`}
                      value={variableValues[variable.name] || variable.defaultValue}
                      onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="rating-section">
              <span>Rate this template:</span>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  data-testid={`rate-${star}`}
                  onClick={() => handleRateTemplate(star)}
                >
                  {star}★
                </button>
              ))}
            </div>

            <button data-testid="insert-btn" onClick={handleInsertTemplate}>
              Insert Template
            </button>

            {processedHtml && (
              <div data-testid="processed-html">
                {processedHtml}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// INTEGRATION TESTS
// ============================================

describe('TemplatesLibrary - API Integration', () => {
  beforeEach(() => {
    setupMockFetch({});
  });

  it('should fetch template library on mount', async () => {
    render(<MockTemplatesLibraryWithAPI />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/templates/library');
    });
  });

  it('should display loading state while fetching', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));
    render(<MockTemplatesLibraryWithAPI />);

    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('should display templates after loading', async () => {
    render(<MockTemplatesLibraryWithAPI />);

    await waitFor(() => {
      expect(screen.getByTestId('templates-grid')).toBeInTheDocument();
    });

    expect(screen.getByTestId('template-550e8400-e29b-41d4-a716-446655440001')).toBeInTheDocument();
    expect(screen.getByTestId('template-550e8400-e29b-41d4-a716-446655440002')).toBeInTheDocument();
  });

  it('should display error state when API fails', async () => {
    mockFetch.mockImplementation(() => Promise.resolve({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Server error' }),
    }));

    render(<MockTemplatesLibraryWithAPI />);

    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
    });
  });
});

describe('TemplatesLibrary - Template Selection API', () => {
  beforeEach(() => {
    setupMockFetch({});
  });

  it('should fetch template detail when selecting', async () => {
    render(<MockTemplatesLibraryWithAPI />);

    await waitFor(() => {
      expect(screen.getByTestId('templates-grid')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('template-550e8400-e29b-41d4-a716-446655440001'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/templates/550e8400-e29b-41d4-a716-446655440001');
    });
  });

  it('should display template detail in sidebar', async () => {
    render(<MockTemplatesLibraryWithAPI />);

    await waitFor(() => {
      expect(screen.getByTestId('templates-grid')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('template-550e8400-e29b-41d4-a716-446655440001'));

    await waitFor(() => {
      expect(screen.getByTestId('template-sidebar')).toBeInTheDocument();
    });

    expect(screen.getByTestId('selected-name')).toHaveTextContent('Simple Hero');
  });

  it('should display variable form from template detail', async () => {
    render(<MockTemplatesLibraryWithAPI />);

    await waitFor(() => {
      expect(screen.getByTestId('templates-grid')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('template-550e8400-e29b-41d4-a716-446655440001'));

    await waitFor(() => {
      expect(screen.getByTestId('variable-form')).toBeInTheDocument();
    });

    expect(screen.getByTestId('variable-title')).toBeInTheDocument();
    expect(screen.getByTestId('variable-subtitle')).toBeInTheDocument();
  });
});

describe('TemplatesLibrary - Template Processing API', () => {
  beforeEach(() => {
    setupMockFetch({});
  });

  it('should call process API when inserting template', async () => {
    const onInsertTemplate = vi.fn();
    render(<MockTemplatesLibraryWithAPI onInsertTemplate={onInsertTemplate} />);

    await waitFor(() => {
      expect(screen.getByTestId('templates-grid')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('template-550e8400-e29b-41d4-a716-446655440001'));

    await waitFor(() => {
      expect(screen.getByTestId('template-sidebar')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('insert-btn'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/templates/process',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  it('should call onInsertTemplate with processed HTML', async () => {
    const onInsertTemplate = vi.fn();
    render(<MockTemplatesLibraryWithAPI onInsertTemplate={onInsertTemplate} />);

    await waitFor(() => {
      expect(screen.getByTestId('templates-grid')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('template-550e8400-e29b-41d4-a716-446655440001'));

    await waitFor(() => {
      expect(screen.getByTestId('template-sidebar')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('insert-btn'));

    await waitFor(() => {
      expect(onInsertTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('My Title'),
        })
      );
    });
  });
});

describe('TemplatesLibrary - Favorites API', () => {
  beforeEach(() => {
    setupMockFetch({});
  });

  it('should call toggle favorite API', async () => {
    render(<MockTemplatesLibraryWithAPI />);

    await waitFor(() => {
      expect(screen.getByTestId('templates-grid')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('favorite-550e8400-e29b-41d4-a716-446655440002'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/templates/favorites/toggle',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ template_id: '550e8400-e29b-41d4-a716-446655440002' }),
        })
      );
    });
  });

  it('should update favorites list after toggle', async () => {
    render(<MockTemplatesLibraryWithAPI />);

    await waitFor(() => {
      expect(screen.getByTestId('templates-grid')).toBeInTheDocument();
    });

    // Initially 1 favorite
    expect(screen.getByTestId('tab-favorites')).toHaveTextContent('(1)');

    await userEvent.click(screen.getByTestId('favorite-550e8400-e29b-41d4-a716-446655440002'));

    await waitFor(() => {
      expect(screen.getByTestId('tab-favorites')).toHaveTextContent('(2)');
    });
  });

  it('should display favorites in Favorites tab', async () => {
    render(<MockTemplatesLibraryWithAPI />);

    await waitFor(() => {
      expect(screen.getByTestId('templates-grid')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('tab-favorites'));

    expect(screen.getByTestId('favorite-template-550e8400-e29b-41d4-a716-446655440001')).toBeInTheDocument();
  });
});

describe('TemplatesLibrary - Create Template API', () => {
  beforeEach(() => {
    setupMockFetch({});
  });

  it('should call create template API', async () => {
    render(<MockTemplatesLibraryWithAPI />);

    await waitFor(() => {
      expect(screen.getByTestId('templates-grid')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('tab-user'));
    await userEvent.click(screen.getByTestId('create-template-btn'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/templates',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  it('should add new template to user templates list', async () => {
    render(<MockTemplatesLibraryWithAPI />);

    await waitFor(() => {
      expect(screen.getByTestId('templates-grid')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('tab-user'));

    // Initially 1 user template
    expect(screen.getByTestId('tab-user')).toHaveTextContent('(1)');

    await userEvent.click(screen.getByTestId('create-template-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('tab-user')).toHaveTextContent('(2)');
    });
  });
});

describe('TemplatesLibrary - Rating API', () => {
  beforeEach(() => {
    setupMockFetch({});
  });

  it('should call rate template API', async () => {
    render(<MockTemplatesLibraryWithAPI />);

    await waitFor(() => {
      expect(screen.getByTestId('templates-grid')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('template-550e8400-e29b-41d4-a716-446655440001'));

    await waitFor(() => {
      expect(screen.getByTestId('template-sidebar')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('rate-5'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/templates/rate',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });
});

describe('TemplatesLibrary - Usage Tracking API', () => {
  beforeEach(() => {
    setupMockFetch({});
  });

  it('should track usage when inserting template', async () => {
    render(<MockTemplatesLibraryWithAPI />);

    await waitFor(() => {
      expect(screen.getByTestId('templates-grid')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('template-550e8400-e29b-41d4-a716-446655440001'));

    await waitFor(() => {
      expect(screen.getByTestId('template-sidebar')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('insert-btn'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/templates/usage',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('insert'),
        })
      );
    });
  });
});

describe('TemplatesLibrary - Variable Form State', () => {
  beforeEach(() => {
    setupMockFetch({});
  });

  it('should update variable values when input changes', async () => {
    const onInsertTemplate = vi.fn();
    render(<MockTemplatesLibraryWithAPI onInsertTemplate={onInsertTemplate} />);

    await waitFor(() => {
      expect(screen.getByTestId('templates-grid')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('template-550e8400-e29b-41d4-a716-446655440001'));

    await waitFor(() => {
      expect(screen.getByTestId('variable-form')).toBeInTheDocument();
    });

    const titleInput = screen.getByTestId('variable-title');
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Custom Title');

    await userEvent.click(screen.getByTestId('insert-btn'));

    await waitFor(() => {
      expect(onInsertTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            title: 'Custom Title',
          }),
        })
      );
    });
  });
});

describe('TemplatesLibrary - Close Behavior', () => {
  beforeEach(() => {
    setupMockFetch({});
  });

  it('should call onClose when close button clicked', async () => {
    const onClose = vi.fn();
    render(<MockTemplatesLibraryWithAPI onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByTestId('templates-grid')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('close-modal'));

    expect(onClose).toHaveBeenCalled();
  });

  it('should call onClose after inserting template', async () => {
    const onClose = vi.fn();
    render(<MockTemplatesLibraryWithAPI onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByTestId('templates-grid')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('template-550e8400-e29b-41d4-a716-446655440001'));

    await waitFor(() => {
      expect(screen.getByTestId('template-sidebar')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('insert-btn'));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });
});
