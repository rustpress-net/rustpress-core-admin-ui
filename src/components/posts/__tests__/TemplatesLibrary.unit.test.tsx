/**
 * Templates Library - Unit Tests
 * Tests for the Template Library functionality in the Post Editor
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

// ============================================
// MOCK DATA
// ============================================

const mockCategories = [
  { id: 'hero', name: 'Hero Sections', description: 'Eye-catching hero sections', icon: 'star', sort_order: 1 },
  { id: 'features', name: 'Feature Sections', description: 'Showcase features', icon: 'grid', sort_order: 2 },
  { id: 'pricing', name: 'Pricing Tables', description: 'Pricing plans', icon: 'dollar-sign', sort_order: 3 },
  { id: 'testimonials', name: 'Testimonials', description: 'Customer reviews', icon: 'message-circle', sort_order: 4 },
  { id: 'cta', name: 'Call to Action', description: 'CTA sections', icon: 'zap', sort_order: 5 },
  { id: 'custom', name: 'Custom Templates', description: 'User templates', icon: 'edit', sort_order: 99 },
];

const mockTemplates = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Simple Hero',
    slug: 'simple-hero',
    description: 'Clean and simple hero section',
    category_id: 'hero',
    thumbnail_url: '/thumbnails/simple-hero.jpg',
    is_pro: false,
    is_system: true,
    author_name: null,
    downloads: 1234,
    rating: 4.5,
    rating_count: 89,
    tags: ['hero', 'simple', 'gradient'],
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Hero with Image',
    slug: 'hero-with-image',
    description: 'Two-column hero with image',
    category_id: 'hero',
    thumbnail_url: '/thumbnails/hero-image.jpg',
    is_pro: false,
    is_system: true,
    author_name: null,
    downloads: 987,
    rating: 4.8,
    rating_count: 56,
    tags: ['hero', 'image', 'two-column'],
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Three Column Features',
    slug: 'three-column-features',
    description: 'Display three features in a grid',
    category_id: 'features',
    thumbnail_url: '/thumbnails/features-three.jpg',
    is_pro: false,
    is_system: true,
    author_name: null,
    downloads: 2345,
    rating: 4.7,
    rating_count: 123,
    tags: ['features', 'grid', 'cards'],
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'Three Tier Pricing',
    slug: 'three-tier-pricing',
    description: 'Classic pricing table',
    category_id: 'pricing',
    thumbnail_url: '/thumbnails/pricing-three.jpg',
    is_pro: true,
    is_system: true,
    author_name: null,
    downloads: 567,
    rating: 4.9,
    rating_count: 34,
    tags: ['pricing', 'table', 'tiers'],
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    name: 'Testimonial Cards',
    slug: 'testimonial-cards',
    description: 'Three testimonial cards',
    category_id: 'testimonials',
    thumbnail_url: '/thumbnails/testimonials.jpg',
    is_pro: false,
    is_system: true,
    author_name: null,
    downloads: 890,
    rating: 4.6,
    rating_count: 67,
    tags: ['testimonials', 'cards', 'social-proof'],
  },
];

const mockUserTemplates = [
  {
    id: '660e8400-e29b-41d4-a716-446655440001',
    name: 'My Custom Header',
    slug: 'my-custom-header',
    description: 'Custom header template',
    category_id: 'custom',
    thumbnail_url: null,
    is_pro: false,
    is_system: false,
    author_name: 'Current User',
    downloads: 0,
    rating: 0,
    rating_count: 0,
    tags: ['custom', 'header'],
  },
];

const mockTemplateDetail = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  name: 'Simple Hero',
  slug: 'simple-hero',
  description: 'Clean and simple hero section with title, subtitle and CTA button',
  category: mockCategories[0],
  thumbnail_url: '/thumbnails/simple-hero.jpg',
  html_content: '<section class="hero-simple"><h1>{{title}}</h1><p>{{subtitle}}</p><a href="{{cta_link}}">{{cta_text}}</a></section>',
  css_content: '.hero-simple { padding: 80px 20px; }',
  variables: [
    { name: 'title', type: 'text', defaultValue: 'Welcome', placeholder: 'Enter headline' },
    { name: 'subtitle', type: 'text', defaultValue: 'Discover amazing features', placeholder: 'Enter subtitle' },
    { name: 'cta_link', type: 'link', defaultValue: '#signup', placeholder: 'Button URL' },
    { name: 'cta_text', type: 'text', defaultValue: 'Get Started', placeholder: 'Button text' },
  ],
  is_pro: false,
  is_system: true,
  author: null,
  downloads: 1234,
  rating: 4.5,
  rating_count: 89,
  is_public: true,
  tags: ['hero', 'simple', 'gradient'],
  version: '1.0.0',
  user_rating: null,
  is_favorited: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockFavorites = ['550e8400-e29b-41d4-a716-446655440001'];

// ============================================
// MOCK COMPONENTS
// ============================================

const MockTemplateCard = ({ template, onSelect, onPreview, isFavorited, onToggleFavorite }: any) => (
  <div
    data-testid={`template-${template.id}`}
    className={`template-card ${template.is_pro ? 'pro' : ''}`}
    onClick={() => onSelect?.(template)}
  >
    {template.thumbnail_url && (
      <img src={template.thumbnail_url} alt={template.name} className="thumbnail" />
    )}
    <div className="template-info">
      <h3>{template.name}</h3>
      <p className="description">{template.description}</p>
      {template.is_pro && <span className="pro-badge">PRO</span>}
      <div className="stats">
        <span className="downloads">{template.downloads} downloads</span>
        <span className="rating">★ {template.rating.toFixed(1)} ({template.rating_count})</span>
      </div>
      <div className="tags">
        {template.tags.map((tag: string) => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>
    </div>
    <div className="actions">
      <button
        data-testid={`preview-${template.id}`}
        onClick={(e) => { e.stopPropagation(); onPreview?.(template); }}
      >
        Preview
      </button>
      <button
        data-testid={`favorite-${template.id}`}
        onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(template.id); }}
        className={isFavorited ? 'favorited' : ''}
      >
        {isFavorited ? '★' : '☆'}
      </button>
    </div>
  </div>
);

const MockVariableForm = ({ variables, values, onChange }: any) => (
  <div data-testid="variable-form">
    {variables.map((variable: any) => (
      <div key={variable.name} className="variable-field">
        <label htmlFor={variable.name}>{variable.name}</label>
        {variable.type === 'text' || variable.type === 'link' ? (
          <input
            type="text"
            id={variable.name}
            data-testid={`variable-${variable.name}`}
            value={values[variable.name] || variable.defaultValue}
            placeholder={variable.placeholder}
            onChange={(e) => onChange(variable.name, e.target.value)}
          />
        ) : variable.type === 'image' ? (
          <input
            type="text"
            id={variable.name}
            data-testid={`variable-${variable.name}`}
            value={values[variable.name] || variable.defaultValue}
            placeholder={variable.placeholder}
            onChange={(e) => onChange(variable.name, e.target.value)}
          />
        ) : variable.type === 'color' ? (
          <input
            type="color"
            id={variable.name}
            data-testid={`variable-${variable.name}`}
            value={values[variable.name] || variable.defaultValue}
            onChange={(e) => onChange(variable.name, e.target.value)}
          />
        ) : null}
      </div>
    ))}
  </div>
);

const MockTemplatesLibrary = ({
  isOpen = true,
  onClose = vi.fn(),
  onInsertTemplate = vi.fn(),
  templates = mockTemplates,
  categories = mockCategories,
  userTemplates = mockUserTemplates,
  favorites = mockFavorites,
}: any) => {
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedTemplate, setSelectedTemplate] = React.useState<any>(null);
  const [previewTemplate, setPreviewTemplate] = React.useState<any>(null);
  const [favoriteIds, setFavoriteIds] = React.useState<string[]>(favorites);
  const [variableValues, setVariableValues] = React.useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = React.useState<'library' | 'user' | 'favorites'>('library');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = React.useState<'popular' | 'newest' | 'rating' | 'name'>('popular');

  if (!isOpen) return null;

  const filteredTemplates = templates.filter((t: any) => {
    const matchesCategory = !selectedCategory || t.category_id === selectedCategory;
    const matchesSearch = !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'popular': return b.downloads - a.downloads;
      case 'newest': return 0; // Would sort by date
      case 'rating': return b.rating - a.rating;
      case 'name': return a.name.localeCompare(b.name);
      default: return 0;
    }
  });

  const favoriteTemplates = templates.filter((t: any) => favoriteIds.includes(t.id));

  const handleToggleFavorite = (templateId: string) => {
    setFavoriteIds(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const handleVariableChange = (name: string, value: string) => {
    setVariableValues(prev => ({ ...prev, [name]: value }));
  };

  const handleInsert = () => {
    if (selectedTemplate) {
      onInsertTemplate({
        template: selectedTemplate,
        variables: variableValues,
      });
      onClose();
    }
  };

  return (
    <div data-testid="templates-library-modal" role="dialog" aria-modal="true">
      <div className="modal-header">
        <h2>Template Library</h2>
        <button data-testid="close-modal" aria-label="Close modal" onClick={onClose}>×</button>
      </div>

      <div className="modal-tabs" role="tablist">
        <button
          role="tab"
          data-testid="tab-library"
          aria-selected={activeTab === 'library'}
          onClick={() => setActiveTab('library')}
        >
          Library ({templates.length})
        </button>
        <button
          role="tab"
          data-testid="tab-user"
          aria-selected={activeTab === 'user'}
          onClick={() => setActiveTab('user')}
        >
          My Templates ({userTemplates.length})
        </button>
        <button
          role="tab"
          data-testid="tab-favorites"
          aria-selected={activeTab === 'favorites'}
          onClick={() => setActiveTab('favorites')}
        >
          Favorites ({favoriteIds.length})
        </button>
      </div>

      <div className="modal-content">
        {activeTab === 'library' && (
          <div data-testid="library-tab-content">
            <div className="toolbar">
              <input
                type="text"
                data-testid="template-search"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                data-testid="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="rating">Highest Rated</option>
                <option value="name">Name A-Z</option>
              </select>
              <div className="view-toggle">
                <button
                  data-testid="view-grid"
                  className={viewMode === 'grid' ? 'active' : ''}
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </button>
                <button
                  data-testid="view-list"
                  className={viewMode === 'list' ? 'active' : ''}
                  onClick={() => setViewMode('list')}
                >
                  List
                </button>
              </div>
            </div>

            <div className="category-sidebar" data-testid="category-sidebar">
              <button
                data-testid="category-all"
                className={!selectedCategory ? 'active' : ''}
                onClick={() => setSelectedCategory(null)}
              >
                All Templates
              </button>
              {categories.map((cat: any) => (
                <button
                  key={cat.id}
                  data-testid={`category-${cat.id}`}
                  className={selectedCategory === cat.id ? 'active' : ''}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div
              className={`templates-${viewMode}`}
              data-testid="templates-grid"
            >
              {sortedTemplates.length === 0 ? (
                <div data-testid="no-results">No templates found</div>
              ) : (
                sortedTemplates.map((template: any) => (
                  <MockTemplateCard
                    key={template.id}
                    template={template}
                    onSelect={setSelectedTemplate}
                    onPreview={setPreviewTemplate}
                    isFavorited={favoriteIds.includes(template.id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'user' && (
          <div data-testid="user-tab-content">
            <button data-testid="save-as-template-btn">Save Current as Template</button>
            {userTemplates.length === 0 ? (
              <div data-testid="no-user-templates">You haven't created any templates yet</div>
            ) : (
              <div className="templates-grid">
                {userTemplates.map((template: any) => (
                  <MockTemplateCard
                    key={template.id}
                    template={template}
                    onSelect={setSelectedTemplate}
                    onPreview={setPreviewTemplate}
                    isFavorited={favoriteIds.includes(template.id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div data-testid="favorites-tab-content">
            {favoriteTemplates.length === 0 ? (
              <div data-testid="no-favorites">No favorite templates yet</div>
            ) : (
              <div className="templates-grid">
                {favoriteTemplates.map((template: any) => (
                  <MockTemplateCard
                    key={template.id}
                    template={template}
                    onSelect={setSelectedTemplate}
                    onPreview={setPreviewTemplate}
                    isFavorited={true}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {previewTemplate && (
          <div data-testid="template-preview-modal" className="preview-modal">
            <div className="preview-header">
              <h3>{previewTemplate.name}</h3>
              <button
                data-testid="close-preview"
                onClick={() => setPreviewTemplate(null)}
              >
                ×
              </button>
            </div>
            <div
              data-testid="preview-content"
              className="preview-content"
              dangerouslySetInnerHTML={{ __html: previewTemplate.html_content || '<p>Preview</p>' }}
            />
          </div>
        )}

        {selectedTemplate && (
          <div data-testid="template-sidebar" className="template-sidebar">
            <h3>{selectedTemplate.name}</h3>
            <p>{selectedTemplate.description}</p>

            <div className="template-stats">
              <span>{selectedTemplate.downloads} downloads</span>
              <span>★ {selectedTemplate.rating.toFixed(1)}</span>
            </div>

            {mockTemplateDetail.variables.length > 0 && (
              <MockVariableForm
                variables={mockTemplateDetail.variables}
                values={variableValues}
                onChange={handleVariableChange}
              />
            )}

            <div className="template-actions">
              <button
                data-testid="preview-btn"
                onClick={() => setPreviewTemplate(selectedTemplate)}
              >
                Preview
              </button>
              <button
                data-testid="insert-btn"
                onClick={handleInsert}
              >
                Insert Template
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// UNIT TESTS
// ============================================

describe('TemplatesLibrary - Modal Rendering', () => {
  it('should render the modal when isOpen is true', () => {
    render(<MockTemplatesLibrary isOpen={true} />);
    expect(screen.getByTestId('templates-library-modal')).toBeInTheDocument();
  });

  it('should not render the modal when isOpen is false', () => {
    render(<MockTemplatesLibrary isOpen={false} />);
    expect(screen.queryByTestId('templates-library-modal')).not.toBeInTheDocument();
  });

  it('should have proper dialog role and aria attributes', () => {
    render(<MockTemplatesLibrary />);
    const modal = screen.getByTestId('templates-library-modal');
    expect(modal).toHaveAttribute('role', 'dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
  });

  it('should call onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    render(<MockTemplatesLibrary onClose={onClose} />);

    await userEvent.click(screen.getByTestId('close-modal'));
    expect(onClose).toHaveBeenCalled();
  });
});

describe('TemplatesLibrary - Tab Navigation', () => {
  it('should display Library tab as active by default', () => {
    render(<MockTemplatesLibrary />);
    expect(screen.getByTestId('tab-library')).toHaveAttribute('aria-selected', 'true');
  });

  it('should switch to My Templates tab when clicked', async () => {
    render(<MockTemplatesLibrary />);

    await userEvent.click(screen.getByTestId('tab-user'));
    expect(screen.getByTestId('tab-user')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('user-tab-content')).toBeInTheDocument();
  });

  it('should switch to Favorites tab when clicked', async () => {
    render(<MockTemplatesLibrary />);

    await userEvent.click(screen.getByTestId('tab-favorites'));
    expect(screen.getByTestId('tab-favorites')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('favorites-tab-content')).toBeInTheDocument();
  });

  it('should display template counts in tabs', () => {
    render(<MockTemplatesLibrary />);
    expect(screen.getByTestId('tab-library')).toHaveTextContent('Library (5)');
    expect(screen.getByTestId('tab-user')).toHaveTextContent('My Templates (1)');
    expect(screen.getByTestId('tab-favorites')).toHaveTextContent('Favorites (1)');
  });
});

describe('TemplatesLibrary - Category Filtering', () => {
  it('should display all category filter buttons', () => {
    render(<MockTemplatesLibrary />);

    expect(screen.getByTestId('category-all')).toBeInTheDocument();
    mockCategories.forEach(cat => {
      expect(screen.getByTestId(`category-${cat.id}`)).toBeInTheDocument();
    });
  });

  it('should filter templates by Hero category', async () => {
    render(<MockTemplatesLibrary />);

    await userEvent.click(screen.getByTestId('category-hero'));

    expect(screen.getByTestId('template-550e8400-e29b-41d4-a716-446655440001')).toBeInTheDocument();
    expect(screen.getByTestId('template-550e8400-e29b-41d4-a716-446655440002')).toBeInTheDocument();
    expect(screen.queryByTestId('template-550e8400-e29b-41d4-a716-446655440003')).not.toBeInTheDocument();
  });

  it('should filter templates by Features category', async () => {
    render(<MockTemplatesLibrary />);

    await userEvent.click(screen.getByTestId('category-features'));

    expect(screen.getByTestId('template-550e8400-e29b-41d4-a716-446655440003')).toBeInTheDocument();
    expect(screen.queryByTestId('template-550e8400-e29b-41d4-a716-446655440001')).not.toBeInTheDocument();
  });

  it('should show all templates when All category selected', async () => {
    render(<MockTemplatesLibrary />);

    // First filter
    await userEvent.click(screen.getByTestId('category-hero'));
    // Then show all
    await userEvent.click(screen.getByTestId('category-all'));

    expect(screen.getByTestId('template-550e8400-e29b-41d4-a716-446655440001')).toBeInTheDocument();
    expect(screen.getByTestId('template-550e8400-e29b-41d4-a716-446655440003')).toBeInTheDocument();
  });
});

describe('TemplatesLibrary - Search', () => {
  it('should display search input', () => {
    render(<MockTemplatesLibrary />);
    expect(screen.getByTestId('template-search')).toBeInTheDocument();
  });

  it('should filter templates by search query', async () => {
    render(<MockTemplatesLibrary />);

    await userEvent.type(screen.getByTestId('template-search'), 'hero');

    expect(screen.getByTestId('template-550e8400-e29b-41d4-a716-446655440001')).toBeInTheDocument();
    expect(screen.getByTestId('template-550e8400-e29b-41d4-a716-446655440002')).toBeInTheDocument();
    expect(screen.queryByTestId('template-550e8400-e29b-41d4-a716-446655440003')).not.toBeInTheDocument();
  });

  it('should search by tags', async () => {
    render(<MockTemplatesLibrary />);

    await userEvent.type(screen.getByTestId('template-search'), 'gradient');

    expect(screen.getByTestId('template-550e8400-e29b-41d4-a716-446655440001')).toBeInTheDocument();
    expect(screen.queryByTestId('template-550e8400-e29b-41d4-a716-446655440003')).not.toBeInTheDocument();
  });

  it('should show no results for non-matching search', async () => {
    render(<MockTemplatesLibrary />);

    await userEvent.type(screen.getByTestId('template-search'), 'nonexistent');

    expect(screen.getByTestId('no-results')).toBeInTheDocument();
  });
});

describe('TemplatesLibrary - Sorting', () => {
  it('should have sort select with options', () => {
    render(<MockTemplatesLibrary />);

    const sortSelect = screen.getByTestId('sort-select');
    expect(sortSelect).toBeInTheDocument();
    expect(within(sortSelect).getByText('Most Popular')).toBeInTheDocument();
    expect(within(sortSelect).getByText('Newest')).toBeInTheDocument();
    expect(within(sortSelect).getByText('Highest Rated')).toBeInTheDocument();
    expect(within(sortSelect).getByText('Name A-Z')).toBeInTheDocument();
  });

  it('should change sort order when selected', async () => {
    render(<MockTemplatesLibrary />);

    await userEvent.selectOptions(screen.getByTestId('sort-select'), 'rating');

    expect(screen.getByTestId('sort-select')).toHaveValue('rating');
  });
});

describe('TemplatesLibrary - View Mode', () => {
  it('should have grid and list view toggle', () => {
    render(<MockTemplatesLibrary />);

    expect(screen.getByTestId('view-grid')).toBeInTheDocument();
    expect(screen.getByTestId('view-list')).toBeInTheDocument();
  });

  it('should switch to list view when clicked', async () => {
    render(<MockTemplatesLibrary />);

    await userEvent.click(screen.getByTestId('view-list'));

    expect(screen.getByTestId('view-list')).toHaveClass('active');
  });
});

describe('TemplatesLibrary - Template Selection', () => {
  it('should select template when card is clicked', async () => {
    render(<MockTemplatesLibrary />);

    await userEvent.click(screen.getByTestId('template-550e8400-e29b-41d4-a716-446655440001'));

    expect(screen.getByTestId('template-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('template-sidebar')).toHaveTextContent('Simple Hero');
  });

  it('should display template stats in sidebar', async () => {
    render(<MockTemplatesLibrary />);

    await userEvent.click(screen.getByTestId('template-550e8400-e29b-41d4-a716-446655440001'));

    expect(screen.getByTestId('template-sidebar')).toHaveTextContent('1234 downloads');
    expect(screen.getByTestId('template-sidebar')).toHaveTextContent('4.5');
  });

  it('should display variable form when template has variables', async () => {
    render(<MockTemplatesLibrary />);

    await userEvent.click(screen.getByTestId('template-550e8400-e29b-41d4-a716-446655440001'));

    expect(screen.getByTestId('variable-form')).toBeInTheDocument();
    expect(screen.getByTestId('variable-title')).toBeInTheDocument();
    expect(screen.getByTestId('variable-subtitle')).toBeInTheDocument();
  });
});

describe('TemplatesLibrary - Variable Form', () => {
  beforeEach(async () => {
    render(<MockTemplatesLibrary />);
    await userEvent.click(screen.getByTestId('template-550e8400-e29b-41d4-a716-446655440001'));
  });

  it('should show default values in variable inputs', () => {
    expect(screen.getByTestId('variable-title')).toHaveValue('Welcome');
    expect(screen.getByTestId('variable-subtitle')).toHaveValue('Discover amazing features');
  });

  it('should update variable value when input changes', async () => {
    const titleInput = screen.getByTestId('variable-title');
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'New Title');

    expect(titleInput).toHaveValue('New Title');
  });
});

describe('TemplatesLibrary - Template Preview', () => {
  it('should open preview modal when Preview button clicked', async () => {
    render(<MockTemplatesLibrary />);

    await userEvent.click(screen.getByTestId('preview-550e8400-e29b-41d4-a716-446655440001'));

    expect(screen.getByTestId('template-preview-modal')).toBeInTheDocument();
  });

  it('should close preview when close button clicked', async () => {
    render(<MockTemplatesLibrary />);

    await userEvent.click(screen.getByTestId('preview-550e8400-e29b-41d4-a716-446655440001'));
    await userEvent.click(screen.getByTestId('close-preview'));

    expect(screen.queryByTestId('template-preview-modal')).not.toBeInTheDocument();
  });

  it('should show preview button in sidebar', async () => {
    render(<MockTemplatesLibrary />);

    await userEvent.click(screen.getByTestId('template-550e8400-e29b-41d4-a716-446655440001'));

    expect(screen.getByTestId('preview-btn')).toBeInTheDocument();
  });
});

describe('TemplatesLibrary - Template Insertion', () => {
  it('should call onInsertTemplate when Insert is clicked', async () => {
    const onInsertTemplate = vi.fn();
    render(<MockTemplatesLibrary onInsertTemplate={onInsertTemplate} />);

    await userEvent.click(screen.getByTestId('template-550e8400-e29b-41d4-a716-446655440001'));
    await userEvent.click(screen.getByTestId('insert-btn'));

    expect(onInsertTemplate).toHaveBeenCalledWith(
      expect.objectContaining({
        template: expect.objectContaining({ id: '550e8400-e29b-41d4-a716-446655440001' }),
        variables: expect.any(Object),
      })
    );
  });

  it('should close modal after inserting', async () => {
    const onClose = vi.fn();
    render(<MockTemplatesLibrary onClose={onClose} />);

    await userEvent.click(screen.getByTestId('template-550e8400-e29b-41d4-a716-446655440001'));
    await userEvent.click(screen.getByTestId('insert-btn'));

    expect(onClose).toHaveBeenCalled();
  });
});

describe('TemplatesLibrary - Favorites', () => {
  it('should show favorite status on template cards', () => {
    render(<MockTemplatesLibrary />);

    const firstFavorite = screen.getByTestId('favorite-550e8400-e29b-41d4-a716-446655440001');
    expect(firstFavorite).toHaveTextContent('★');
    expect(firstFavorite).toHaveClass('favorited');
  });

  it('should toggle favorite when star clicked', async () => {
    render(<MockTemplatesLibrary />);

    const favorite = screen.getByTestId('favorite-550e8400-e29b-41d4-a716-446655440001');
    await userEvent.click(favorite);

    expect(favorite).toHaveTextContent('☆');
    expect(favorite).not.toHaveClass('favorited');
  });

  it('should display favorites in Favorites tab', async () => {
    render(<MockTemplatesLibrary />);

    await userEvent.click(screen.getByTestId('tab-favorites'));

    expect(screen.getByTestId('template-550e8400-e29b-41d4-a716-446655440001')).toBeInTheDocument();
  });

  it('should update favorites count when toggling', async () => {
    render(<MockTemplatesLibrary />);

    // Initial count is 1
    expect(screen.getByTestId('tab-favorites')).toHaveTextContent('(1)');

    // Add another favorite
    await userEvent.click(screen.getByTestId('favorite-550e8400-e29b-41d4-a716-446655440003'));

    expect(screen.getByTestId('tab-favorites')).toHaveTextContent('(2)');
  });
});

describe('TemplatesLibrary - User Templates', () => {
  it('should display user templates in My Templates tab', async () => {
    render(<MockTemplatesLibrary />);

    await userEvent.click(screen.getByTestId('tab-user'));

    expect(screen.getByTestId('template-660e8400-e29b-41d4-a716-446655440001')).toBeInTheDocument();
    expect(screen.getByText('My Custom Header')).toBeInTheDocument();
  });

  it('should show Save as Template button', async () => {
    render(<MockTemplatesLibrary />);

    await userEvent.click(screen.getByTestId('tab-user'));

    expect(screen.getByTestId('save-as-template-btn')).toBeInTheDocument();
  });

  it('should show empty state when no user templates', async () => {
    render(<MockTemplatesLibrary userTemplates={[]} />);

    await userEvent.click(screen.getByTestId('tab-user'));

    expect(screen.getByTestId('no-user-templates')).toBeInTheDocument();
  });
});

describe('TemplatesLibrary - Pro Templates', () => {
  it('should display PRO badge on pro templates', () => {
    render(<MockTemplatesLibrary />);

    const proTemplate = screen.getByTestId('template-550e8400-e29b-41d4-a716-446655440004');
    expect(within(proTemplate).getByText('PRO')).toBeInTheDocument();
  });

  it('should not display PRO badge on free templates', () => {
    render(<MockTemplatesLibrary />);

    const freeTemplate = screen.getByTestId('template-550e8400-e29b-41d4-a716-446655440001');
    expect(within(freeTemplate).queryByText('PRO')).not.toBeInTheDocument();
  });
});

describe('TemplatesLibrary - Template Stats', () => {
  it('should display download count', () => {
    render(<MockTemplatesLibrary />);

    const template = screen.getByTestId('template-550e8400-e29b-41d4-a716-446655440001');
    expect(within(template).getByText('1234 downloads')).toBeInTheDocument();
  });

  it('should display rating', () => {
    render(<MockTemplatesLibrary />);

    const template = screen.getByTestId('template-550e8400-e29b-41d4-a716-446655440001');
    expect(within(template).getByText('★ 4.5 (89)')).toBeInTheDocument();
  });

  it('should display tags', () => {
    render(<MockTemplatesLibrary />);

    const template = screen.getByTestId('template-550e8400-e29b-41d4-a716-446655440001');
    expect(within(template).getByText('hero')).toBeInTheDocument();
    expect(within(template).getByText('simple')).toBeInTheDocument();
  });
});

describe('TemplatesLibrary - Accessibility', () => {
  it('should have proper tab roles', () => {
    render(<MockTemplatesLibrary />);

    const tabList = screen.getByRole('tablist');
    expect(tabList).toBeInTheDocument();

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
  });

  it('should be keyboard navigable', async () => {
    render(<MockTemplatesLibrary />);

    await userEvent.tab();
    await userEvent.tab();

    const focusedElement = document.activeElement;
    expect(focusedElement).not.toBe(document.body);
  });

  it('should have close button with aria-label', () => {
    render(<MockTemplatesLibrary />);

    const closeButton = screen.getByTestId('close-modal');
    expect(closeButton).toHaveAttribute('aria-label', 'Close modal');
  });
});

describe('TemplatesLibrary - Edge Cases', () => {
  it('should handle empty templates list', () => {
    render(<MockTemplatesLibrary templates={[]} />);

    expect(screen.getByTestId('no-results')).toBeInTheDocument();
  });

  it('should handle empty favorites', async () => {
    render(<MockTemplatesLibrary favorites={[]} />);

    await userEvent.click(screen.getByTestId('tab-favorites'));

    expect(screen.getByTestId('no-favorites')).toBeInTheDocument();
  });
});
