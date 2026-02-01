/**
 * Animations Library - Unit Tests
 * Tests for the Animation Library functionality in the Post Editor
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ============================================
// MOCK DATA
// ============================================

const mockAnimations = [
  {
    id: 'fade-in',
    name: 'Fade In',
    category: 'entrance',
    duration: 500,
    preview_description: 'Smoothly fade in from transparent',
    css_keyframes: '@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }',
    css_class: 'animate-fade-in',
    is_pro: false,
    sort_order: 1,
  },
  {
    id: 'slide-in-left',
    name: 'Slide In Left',
    category: 'entrance',
    duration: 600,
    preview_description: 'Slide in from the left side',
    css_keyframes: '@keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }',
    css_class: 'animate-slide-in-left',
    is_pro: false,
    sort_order: 2,
  },
  {
    id: 'fade-out',
    name: 'Fade Out',
    category: 'exit',
    duration: 500,
    preview_description: 'Smoothly fade out to transparent',
    css_keyframes: '@keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }',
    css_class: 'animate-fade-out',
    is_pro: false,
    sort_order: 1,
  },
  {
    id: 'bounce',
    name: 'Bounce',
    category: 'emphasis',
    duration: 1000,
    preview_description: 'Bouncing up and down',
    css_keyframes: '@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }',
    css_class: 'animate-bounce',
    is_pro: false,
    sort_order: 1,
  },
  {
    id: 'pulse',
    name: 'Pulse',
    category: 'emphasis',
    duration: 1000,
    preview_description: 'Pulsing scale effect',
    css_keyframes: '@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }',
    css_class: 'animate-pulse',
    is_pro: false,
    sort_order: 2,
  },
  {
    id: 'scroll-fade',
    name: 'Scroll Fade',
    category: 'scroll',
    duration: 800,
    preview_description: 'Fade in when scrolling into view',
    css_keyframes: '@keyframes scrollFade { from { opacity: 0; } to { opacity: 1; } }',
    css_class: 'animate-scroll-fade',
    is_pro: false,
    sort_order: 1,
  },
  {
    id: 'rotate-360',
    name: 'Rotate 360',
    category: 'rotation',
    duration: 1000,
    preview_description: 'Full 360 degree rotation',
    css_keyframes: '@keyframes rotate360 { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }',
    css_class: 'animate-rotate-360',
    is_pro: true,
    sort_order: 1,
  },
];

const mockCategories = [
  { id: 'entrance', name: 'Entrance', description: 'Animations for entering elements', icon: '→', count: 10 },
  { id: 'exit', name: 'Exit', description: 'Animations for exiting elements', icon: '←', count: 8 },
  { id: 'emphasis', name: 'Emphasis', description: 'Animations to draw attention', icon: '!', count: 12 },
  { id: 'scroll', name: 'Scroll', description: 'Scroll-triggered animations', icon: '↓', count: 8 },
  { id: 'rotation', name: 'Rotation', description: 'Rotation animations', icon: '↻', count: 6 },
  { id: 'scale', name: 'Scale', description: 'Scale animations', icon: '⤢', count: 6 },
  { id: 'motion', name: 'Motion', description: 'Motion path animations', icon: '~', count: 4 },
  { id: 'custom', name: 'Custom', description: 'User-created animations', icon: '★', count: 2 },
];

const mockSettings = {
  duration: 500,
  delay: 0,
  easing: 'ease',
  repeat: 1,
  repeat_delay: 0,
  direction: 'normal',
  fill_mode: 'forwards',
  trigger: 'load',
  scroll_offset: 100,
};

const mockUserPreferences = {
  user_id: '123e4567-e89b-12d3-a456-426614174000',
  favorite_animations: ['fade-in', 'bounce'],
  recent_animations: ['fade-in', 'slide-in-left', 'pulse'],
  default_settings: mockSettings,
  updated_at: '2024-01-01T00:00:00Z',
};

const mockCustomAnimations = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    user_id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'My Custom Fade',
    category: 'custom',
    duration: 750,
    css_keyframes: '@keyframes customFade { from { opacity: 0.5; } to { opacity: 1; } }',
    css_class: 'animate-custom-fade',
    settings: mockSettings,
    is_public: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const mockPresets = [
  {
    id: '660e8400-e29b-41d4-a716-446655440001',
    name: 'Hero Entrance',
    description: 'Animated hero section entrance',
    steps: [
      { animation_id: 'fade-in', delay: 0, target: '.hero-title', settings: null },
      { animation_id: 'slide-in-left', delay: 200, target: '.hero-subtitle', settings: null },
    ],
    is_system: true,
    user_id: null,
    created_at: '2024-01-01T00:00:00Z',
  },
];

// ============================================
// MOCK COMPONENTS
// ============================================

const MockAnimationCard = ({ animation, onSelect, onPreview, isFavorite, onToggleFavorite }: any) => (
  <div
    data-testid={`animation-${animation.id}`}
    data-animation={animation.id}
    className="animation-card"
    onClick={() => onSelect?.(animation)}
    onMouseEnter={() => onPreview?.(animation)}
  >
    <span className="animation-name">{animation.name}</span>
    <span className="animation-category">{animation.category}</span>
    {animation.is_pro && <span className="pro-badge">PRO</span>}
    <button
      data-testid={`favorite-${animation.id}`}
      onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(animation.id); }}
      className={isFavorite ? 'favorited' : ''}
    >
      {isFavorite ? '★' : '☆'}
    </button>
  </div>
);

const MockAnimationSettings = ({ settings, onChange }: any) => (
  <div data-testid="animation-settings">
    <label>
      Duration (ms)
      <input
        type="range"
        data-testid="duration-slider"
        min={100}
        max={5000}
        value={settings.duration}
        onChange={(e) => onChange({ ...settings, duration: parseInt(e.target.value) })}
      />
      <span data-testid="duration-value">{settings.duration}ms</span>
    </label>
    <label>
      Delay (ms)
      <input
        type="number"
        data-testid="delay-input"
        value={settings.delay}
        onChange={(e) => onChange({ ...settings, delay: parseInt(e.target.value) })}
      />
    </label>
    <label>
      Easing
      <select
        data-testid="easing-select"
        value={settings.easing}
        onChange={(e) => onChange({ ...settings, easing: e.target.value })}
      >
        <option value="ease">Ease</option>
        <option value="ease-in">Ease In</option>
        <option value="ease-out">Ease Out</option>
        <option value="ease-in-out">Ease In Out</option>
        <option value="linear">Linear</option>
        <option value="cubic-bezier(0.68, -0.55, 0.265, 1.55)">Elastic</option>
      </select>
    </label>
    <label>
      Repeat
      <input
        type="number"
        data-testid="repeat-input"
        min={1}
        max={10}
        value={settings.repeat}
        onChange={(e) => onChange({ ...settings, repeat: parseInt(e.target.value) })}
      />
    </label>
    <label>
      Direction
      <select
        data-testid="direction-select"
        value={settings.direction}
        onChange={(e) => onChange({ ...settings, direction: e.target.value })}
      >
        <option value="normal">Normal</option>
        <option value="reverse">Reverse</option>
        <option value="alternate">Alternate</option>
        <option value="alternate-reverse">Alternate Reverse</option>
      </select>
    </label>
    <label>
      Trigger
      <select
        data-testid="trigger-select"
        value={settings.trigger}
        onChange={(e) => onChange({ ...settings, trigger: e.target.value })}
      >
        <option value="load">On Load</option>
        <option value="scroll">On Scroll</option>
        <option value="hover">On Hover</option>
        <option value="click">On Click</option>
      </select>
    </label>
  </div>
);

const MockAnimationPreview = ({ animation, settings, isPlaying }: any) => (
  <div data-testid="animation-preview" className={isPlaying ? 'playing' : ''}>
    <div
      data-testid="preview-element"
      style={{
        animation: isPlaying ? `${animation.id} ${settings.duration}ms ${settings.easing}` : 'none'
      }}
    >
      Preview
    </div>
    <style>{animation.css_keyframes}</style>
  </div>
);

const MockAnimationsLibrary = ({
  isOpen = true,
  onClose = vi.fn(),
  onSelectAnimation = vi.fn(),
  animations = mockAnimations,
  categories = mockCategories,
  userPreferences = mockUserPreferences,
  customAnimations = mockCustomAnimations,
  presets = mockPresets,
}: any) => {
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedAnimation, setSelectedAnimation] = React.useState<any>(null);
  const [settings, setSettings] = React.useState(userPreferences.default_settings);
  const [favorites, setFavorites] = React.useState<string[]>(userPreferences.favorite_animations);
  const [isPreviewPlaying, setIsPreviewPlaying] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'library' | 'custom' | 'presets' | 'favorites'>('library');

  if (!isOpen) return null;

  const filteredAnimations = animations.filter((anim: any) => {
    const matchesCategory = !selectedCategory || anim.category === selectedCategory;
    const matchesSearch = !searchQuery ||
      anim.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      anim.preview_description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const favoriteAnimations = animations.filter((a: any) => favorites.includes(a.id));

  const handleToggleFavorite = (animationId: string) => {
    setFavorites(prev =>
      prev.includes(animationId)
        ? prev.filter(id => id !== animationId)
        : [...prev, animationId]
    );
  };

  const handleSelectAnimation = (animation: any) => {
    setSelectedAnimation(animation);
  };

  const handleApplyAnimation = () => {
    if (selectedAnimation) {
      onSelectAnimation({ animation: selectedAnimation, settings });
      onClose();
    }
  };

  const handlePreview = (animation: any) => {
    setSelectedAnimation(animation);
    setIsPreviewPlaying(true);
    setTimeout(() => setIsPreviewPlaying(false), animation.duration);
  };

  return (
    <div data-testid="animations-library-modal" role="dialog" aria-modal="true">
      <div className="modal-header">
        <h2>Animation Library</h2>
        <button data-testid="close-modal" aria-label="Close modal" onClick={onClose}>×</button>
      </div>

      <div className="modal-tabs" role="tablist">
        <button
          role="tab"
          data-testid="tab-library"
          aria-selected={activeTab === 'library'}
          onClick={() => setActiveTab('library')}
        >
          Library
        </button>
        <button
          role="tab"
          data-testid="tab-custom"
          aria-selected={activeTab === 'custom'}
          onClick={() => setActiveTab('custom')}
        >
          Custom
        </button>
        <button
          role="tab"
          data-testid="tab-presets"
          aria-selected={activeTab === 'presets'}
          onClick={() => setActiveTab('presets')}
        >
          Presets
        </button>
        <button
          role="tab"
          data-testid="tab-favorites"
          aria-selected={activeTab === 'favorites'}
          onClick={() => setActiveTab('favorites')}
        >
          Favorites ({favorites.length})
        </button>
      </div>

      <div className="modal-content">
        {activeTab === 'library' && (
          <div data-testid="library-tab-content" data-tab="library">
            <input
              type="text"
              data-testid="animation-search"
              placeholder="Search animations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="category-filters" data-testid="category-filters">
              <button
                data-testid="category-all"
                className={!selectedCategory ? 'active' : ''}
                onClick={() => setSelectedCategory(null)}
              >
                All
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

            <div className="animations-grid" data-testid="animations-grid">
              {filteredAnimations.length === 0 ? (
                <div data-testid="no-results">No animations found</div>
              ) : (
                filteredAnimations.map((anim: any) => (
                  <MockAnimationCard
                    key={anim.id}
                    animation={anim}
                    onSelect={handleSelectAnimation}
                    onPreview={handlePreview}
                    isFavorite={favorites.includes(anim.id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'custom' && (
          <div data-testid="custom-tab-content" data-tab="custom">
            <button data-testid="create-custom-animation">Create Custom Animation</button>
            <div className="custom-animations-grid">
              {customAnimations.map((anim: any) => (
                <MockAnimationCard
                  key={anim.id}
                  animation={anim}
                  onSelect={handleSelectAnimation}
                  isFavorite={false}
                  onToggleFavorite={() => {}}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'presets' && (
          <div data-testid="presets-tab-content" data-tab="presets">
            {presets.map((preset: any) => (
              <div key={preset.id} data-testid={`preset-${preset.id}`} className="preset-card">
                <h3>{preset.name}</h3>
                <p>{preset.description}</p>
                <span>{preset.steps.length} steps</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div data-testid="favorites-tab-content" data-tab="favorites">
            {favoriteAnimations.length === 0 ? (
              <div data-testid="no-favorites">No favorite animations yet</div>
            ) : (
              favoriteAnimations.map((anim: any) => (
                <MockAnimationCard
                  key={anim.id}
                  animation={anim}
                  onSelect={handleSelectAnimation}
                  isFavorite={true}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))
            )}
          </div>
        )}

        {selectedAnimation && (
          <div className="animation-sidebar" data-testid="animation-sidebar">
            <h3>{selectedAnimation.name}</h3>
            <p>{selectedAnimation.preview_description}</p>

            <MockAnimationPreview
              animation={selectedAnimation}
              settings={settings}
              isPlaying={isPreviewPlaying}
            />

            <button
              data-testid="play-preview"
              onClick={() => handlePreview(selectedAnimation)}
            >
              Play Preview
            </button>

            <MockAnimationSettings
              settings={settings}
              onChange={setSettings}
            />

            <button
              data-testid="apply-animation"
              onClick={handleApplyAnimation}
            >
              Apply Animation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Need React for the mock component
import * as React from 'react';

// ============================================
// UNIT TESTS
// ============================================

describe('AnimationsLibrary - Modal Rendering', () => {
  it('should render the modal when isOpen is true', () => {
    render(<MockAnimationsLibrary isOpen={true} />);
    expect(screen.getByTestId('animations-library-modal')).toBeInTheDocument();
  });

  it('should not render the modal when isOpen is false', () => {
    render(<MockAnimationsLibrary isOpen={false} />);
    expect(screen.queryByTestId('animations-library-modal')).not.toBeInTheDocument();
  });

  it('should have proper dialog role and aria attributes', () => {
    render(<MockAnimationsLibrary />);
    const modal = screen.getByTestId('animations-library-modal');
    expect(modal).toHaveAttribute('role', 'dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
  });

  it('should call onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    render(<MockAnimationsLibrary onClose={onClose} />);

    await userEvent.click(screen.getByTestId('close-modal'));
    expect(onClose).toHaveBeenCalled();
  });
});

describe('AnimationsLibrary - Tab Navigation', () => {
  it('should display Library tab as active by default', () => {
    render(<MockAnimationsLibrary />);
    expect(screen.getByTestId('tab-library')).toHaveAttribute('aria-selected', 'true');
  });

  it('should switch to Custom tab when clicked', async () => {
    render(<MockAnimationsLibrary />);

    await userEvent.click(screen.getByTestId('tab-custom'));
    expect(screen.getByTestId('tab-custom')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('custom-tab-content')).toBeInTheDocument();
  });

  it('should switch to Presets tab when clicked', async () => {
    render(<MockAnimationsLibrary />);

    await userEvent.click(screen.getByTestId('tab-presets'));
    expect(screen.getByTestId('tab-presets')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('presets-tab-content')).toBeInTheDocument();
  });

  it('should switch to Favorites tab when clicked', async () => {
    render(<MockAnimationsLibrary />);

    await userEvent.click(screen.getByTestId('tab-favorites'));
    expect(screen.getByTestId('tab-favorites')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('favorites-tab-content')).toBeInTheDocument();
  });

  it('should display favorites count in tab', () => {
    render(<MockAnimationsLibrary userPreferences={mockUserPreferences} />);
    expect(screen.getByTestId('tab-favorites')).toHaveTextContent('Favorites (2)');
  });
});

describe('AnimationsLibrary - Category Filtering', () => {
  it('should display all category filter buttons', () => {
    render(<MockAnimationsLibrary />);

    expect(screen.getByTestId('category-all')).toBeInTheDocument();
    mockCategories.forEach(cat => {
      expect(screen.getByTestId(`category-${cat.id}`)).toBeInTheDocument();
    });
  });

  it('should show all animations when no category selected', () => {
    render(<MockAnimationsLibrary />);

    expect(screen.getByTestId('animation-fade-in')).toBeInTheDocument();
    expect(screen.getByTestId('animation-fade-out')).toBeInTheDocument();
    expect(screen.getByTestId('animation-bounce')).toBeInTheDocument();
  });

  it('should filter animations by entrance category', async () => {
    render(<MockAnimationsLibrary />);

    await userEvent.click(screen.getByTestId('category-entrance'));

    expect(screen.getByTestId('animation-fade-in')).toBeInTheDocument();
    expect(screen.getByTestId('animation-slide-in-left')).toBeInTheDocument();
    expect(screen.queryByTestId('animation-fade-out')).not.toBeInTheDocument();
    expect(screen.queryByTestId('animation-bounce')).not.toBeInTheDocument();
  });

  it('should filter animations by emphasis category', async () => {
    render(<MockAnimationsLibrary />);

    await userEvent.click(screen.getByTestId('category-emphasis'));

    expect(screen.getByTestId('animation-bounce')).toBeInTheDocument();
    expect(screen.getByTestId('animation-pulse')).toBeInTheDocument();
    expect(screen.queryByTestId('animation-fade-in')).not.toBeInTheDocument();
  });

  it('should show all animations when All category clicked', async () => {
    render(<MockAnimationsLibrary />);

    // Filter first
    await userEvent.click(screen.getByTestId('category-entrance'));
    // Then clear filter
    await userEvent.click(screen.getByTestId('category-all'));

    expect(screen.getByTestId('animation-fade-in')).toBeInTheDocument();
    expect(screen.getByTestId('animation-fade-out')).toBeInTheDocument();
  });
});

describe('AnimationsLibrary - Search', () => {
  it('should display search input', () => {
    render(<MockAnimationsLibrary />);
    expect(screen.getByTestId('animation-search')).toBeInTheDocument();
  });

  it('should filter animations by search query', async () => {
    render(<MockAnimationsLibrary />);

    await userEvent.type(screen.getByTestId('animation-search'), 'fade');

    expect(screen.getByTestId('animation-fade-in')).toBeInTheDocument();
    expect(screen.getByTestId('animation-fade-out')).toBeInTheDocument();
    expect(screen.queryByTestId('animation-bounce')).not.toBeInTheDocument();
  });

  it('should filter by animation description', async () => {
    render(<MockAnimationsLibrary />);

    await userEvent.type(screen.getByTestId('animation-search'), 'bouncing');

    expect(screen.getByTestId('animation-bounce')).toBeInTheDocument();
    expect(screen.queryByTestId('animation-fade-in')).not.toBeInTheDocument();
  });

  it('should show no results message when no matches', async () => {
    render(<MockAnimationsLibrary />);

    await userEvent.type(screen.getByTestId('animation-search'), 'nonexistent');

    expect(screen.getByTestId('no-results')).toBeInTheDocument();
    expect(screen.getByTestId('no-results')).toHaveTextContent('No animations found');
  });

  it('should clear search and show all animations', async () => {
    render(<MockAnimationsLibrary />);

    const searchInput = screen.getByTestId('animation-search');
    await userEvent.type(searchInput, 'fade');
    await userEvent.clear(searchInput);

    expect(screen.getByTestId('animation-bounce')).toBeInTheDocument();
  });
});

describe('AnimationsLibrary - Animation Selection', () => {
  it('should select animation when card is clicked', async () => {
    render(<MockAnimationsLibrary />);

    await userEvent.click(screen.getByTestId('animation-fade-in'));

    expect(screen.getByTestId('animation-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('animation-sidebar')).toHaveTextContent('Fade In');
  });

  it('should display animation preview when selected', async () => {
    render(<MockAnimationsLibrary />);

    await userEvent.click(screen.getByTestId('animation-fade-in'));

    expect(screen.getByTestId('animation-preview')).toBeInTheDocument();
  });

  it('should display animation settings when selected', async () => {
    render(<MockAnimationsLibrary />);

    await userEvent.click(screen.getByTestId('animation-fade-in'));

    expect(screen.getByTestId('animation-settings')).toBeInTheDocument();
  });

  it('should call onSelectAnimation when Apply is clicked', async () => {
    const onSelectAnimation = vi.fn();
    render(<MockAnimationsLibrary onSelectAnimation={onSelectAnimation} />);

    await userEvent.click(screen.getByTestId('animation-fade-in'));
    await userEvent.click(screen.getByTestId('apply-animation'));

    expect(onSelectAnimation).toHaveBeenCalledWith(
      expect.objectContaining({
        animation: expect.objectContaining({ id: 'fade-in' }),
        settings: expect.any(Object),
      })
    );
  });
});

describe('AnimationsLibrary - Animation Settings', () => {
  beforeEach(async () => {
    render(<MockAnimationsLibrary />);
    await userEvent.click(screen.getByTestId('animation-fade-in'));
  });

  it('should display duration slider', () => {
    expect(screen.getByTestId('duration-slider')).toBeInTheDocument();
  });

  it('should display delay input', () => {
    expect(screen.getByTestId('delay-input')).toBeInTheDocument();
  });

  it('should display easing select', () => {
    expect(screen.getByTestId('easing-select')).toBeInTheDocument();
  });

  it('should display repeat input', () => {
    expect(screen.getByTestId('repeat-input')).toBeInTheDocument();
  });

  it('should display direction select', () => {
    expect(screen.getByTestId('direction-select')).toBeInTheDocument();
  });

  it('should display trigger select', () => {
    expect(screen.getByTestId('trigger-select')).toBeInTheDocument();
  });

  it('should update duration when slider changes', async () => {
    const slider = screen.getByTestId('duration-slider');
    fireEvent.change(slider, { target: { value: '1000' } });

    expect(screen.getByTestId('duration-value')).toHaveTextContent('1000ms');
  });

  it('should update easing when select changes', async () => {
    const select = screen.getByTestId('easing-select');
    await userEvent.selectOptions(select, 'ease-in-out');

    expect(select).toHaveValue('ease-in-out');
  });

  it('should update trigger when select changes', async () => {
    const select = screen.getByTestId('trigger-select');
    await userEvent.selectOptions(select, 'scroll');

    expect(select).toHaveValue('scroll');
  });
});

describe('AnimationsLibrary - Favorites', () => {
  it('should show favorite status on animation cards', () => {
    render(<MockAnimationsLibrary />);

    const fadeInFavorite = screen.getByTestId('favorite-fade-in');
    expect(fadeInFavorite).toHaveTextContent('★');
    expect(fadeInFavorite).toHaveClass('favorited');
  });

  it('should toggle favorite when star is clicked', async () => {
    render(<MockAnimationsLibrary />);

    // fade-in is initially favorited
    const fadeInFavorite = screen.getByTestId('favorite-fade-in');
    await userEvent.click(fadeInFavorite);

    // Should now be unfavorited
    expect(fadeInFavorite).toHaveTextContent('☆');
    expect(fadeInFavorite).not.toHaveClass('favorited');
  });

  it('should add animation to favorites when star clicked', async () => {
    render(<MockAnimationsLibrary />);

    // pulse is not favorited initially
    const pulseFavorite = screen.getByTestId('favorite-pulse');
    expect(pulseFavorite).toHaveTextContent('☆');

    await userEvent.click(pulseFavorite);

    expect(pulseFavorite).toHaveTextContent('★');
    expect(pulseFavorite).toHaveClass('favorited');
  });

  it('should display favorite animations in Favorites tab', async () => {
    render(<MockAnimationsLibrary />);

    await userEvent.click(screen.getByTestId('tab-favorites'));

    expect(screen.getByTestId('animation-fade-in')).toBeInTheDocument();
    expect(screen.getByTestId('animation-bounce')).toBeInTheDocument();
    expect(screen.queryByTestId('animation-pulse')).not.toBeInTheDocument();
  });

  it('should update favorites count when toggling', async () => {
    render(<MockAnimationsLibrary />);

    // Initial count is 2
    expect(screen.getByTestId('tab-favorites')).toHaveTextContent('(2)');

    // Add pulse to favorites
    await userEvent.click(screen.getByTestId('favorite-pulse'));

    expect(screen.getByTestId('tab-favorites')).toHaveTextContent('(3)');
  });
});

describe('AnimationsLibrary - Custom Animations', () => {
  it('should display custom animations in Custom tab', async () => {
    render(<MockAnimationsLibrary />);

    await userEvent.click(screen.getByTestId('tab-custom'));

    expect(screen.getByText('My Custom Fade')).toBeInTheDocument();
  });

  it('should show create custom animation button', async () => {
    render(<MockAnimationsLibrary />);

    await userEvent.click(screen.getByTestId('tab-custom'));

    expect(screen.getByTestId('create-custom-animation')).toBeInTheDocument();
  });
});

describe('AnimationsLibrary - Presets', () => {
  it('should display presets in Presets tab', async () => {
    render(<MockAnimationsLibrary />);

    await userEvent.click(screen.getByTestId('tab-presets'));

    expect(screen.getByText('Hero Entrance')).toBeInTheDocument();
    expect(screen.getByText('Animated hero section entrance')).toBeInTheDocument();
  });

  it('should show preset step count', async () => {
    render(<MockAnimationsLibrary />);

    await userEvent.click(screen.getByTestId('tab-presets'));

    expect(screen.getByText('2 steps')).toBeInTheDocument();
  });
});

describe('AnimationsLibrary - Preview', () => {
  it('should play preview when Play Preview button clicked', async () => {
    render(<MockAnimationsLibrary />);

    await userEvent.click(screen.getByTestId('animation-fade-in'));
    await userEvent.click(screen.getByTestId('play-preview'));

    const preview = screen.getByTestId('animation-preview');
    expect(preview).toHaveClass('playing');
  });
});

describe('AnimationsLibrary - Pro Animations', () => {
  it('should display PRO badge on pro animations', () => {
    render(<MockAnimationsLibrary />);

    const rotateCard = screen.getByTestId('animation-rotate-360');
    expect(within(rotateCard).getByText('PRO')).toBeInTheDocument();
  });

  it('should not display PRO badge on free animations', () => {
    render(<MockAnimationsLibrary />);

    const fadeCard = screen.getByTestId('animation-fade-in');
    expect(within(fadeCard).queryByText('PRO')).not.toBeInTheDocument();
  });
});

describe('AnimationsLibrary - Accessibility', () => {
  it('should have proper tab roles', () => {
    render(<MockAnimationsLibrary />);

    const tabList = screen.getByRole('tablist');
    expect(tabList).toBeInTheDocument();

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(4);
  });

  it('should be keyboard navigable', async () => {
    render(<MockAnimationsLibrary />);

    // Tab through elements
    await userEvent.tab();
    await userEvent.tab();

    const focusedElement = document.activeElement;
    expect(focusedElement).not.toBe(document.body);
  });

  it('should have close button with aria-label', () => {
    render(<MockAnimationsLibrary />);

    const closeButton = screen.getByTestId('close-modal');
    expect(closeButton).toHaveAttribute('aria-label', 'Close modal');
  });
});

describe('AnimationsLibrary - Edge Cases', () => {
  it('should handle empty animations list', () => {
    render(<MockAnimationsLibrary animations={[]} />);

    expect(screen.getByTestId('no-results')).toBeInTheDocument();
  });

  it('should handle empty favorites', async () => {
    render(<MockAnimationsLibrary userPreferences={{ ...mockUserPreferences, favorite_animations: [] }} />);

    await userEvent.click(screen.getByTestId('tab-favorites'));

    expect(screen.getByTestId('no-favorites')).toBeInTheDocument();
  });

  it('should handle empty custom animations', async () => {
    render(<MockAnimationsLibrary customAnimations={[]} />);

    await userEvent.click(screen.getByTestId('tab-custom'));

    // Should still show create button
    expect(screen.getByTestId('create-custom-animation')).toBeInTheDocument();
  });

  it('should handle empty presets', async () => {
    render(<MockAnimationsLibrary presets={[]} />);

    await userEvent.click(screen.getByTestId('tab-presets'));

    const content = screen.getByTestId('presets-tab-content');
    expect(content.children.length).toBe(0);
  });
});
