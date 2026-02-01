/**
 * Animations Library - Integration Tests
 * Tests for API integration and state management
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

// ============================================
// MOCK API RESPONSES
// ============================================

const mockAnimationLibraryResponse = {
  animations: [
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
      id: 'slide-up',
      name: 'Slide Up',
      category: 'entrance',
      duration: 600,
      preview_description: 'Slide up from below',
      css_keyframes: '@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }',
      css_class: 'animate-slide-up',
      is_pro: false,
      sort_order: 2,
    },
    {
      id: 'bounce',
      name: 'Bounce',
      category: 'emphasis',
      duration: 1000,
      preview_description: 'Bouncing effect',
      css_keyframes: '@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }',
      css_class: 'animate-bounce',
      is_pro: false,
      sort_order: 1,
    },
  ],
  categories: [
    { id: 'entrance', name: 'Entrance', description: 'Entrance animations', icon: '→', count: 10 },
    { id: 'exit', name: 'Exit', description: 'Exit animations', icon: '←', count: 8 },
    { id: 'emphasis', name: 'Emphasis', description: 'Emphasis animations', icon: '!', count: 12 },
    { id: 'scroll', name: 'Scroll', description: 'Scroll animations', icon: '↓', count: 8 },
  ],
  custom_animations: [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'My Custom Animation',
      category: 'custom',
      duration: 800,
      css_keyframes: '@keyframes custom { 0% { opacity: 0; } 100% { opacity: 1; } }',
      css_class: 'animate-custom',
      settings: { duration: 800, delay: 0, easing: 'ease' },
      is_public: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ],
  presets: [
    {
      id: '660e8400-e29b-41d4-a716-446655440001',
      name: 'Hero Section',
      description: 'Animated hero entrance',
      steps: [
        { animation_id: 'fade-in', delay: 0, target: '.hero-title' },
        { animation_id: 'slide-up', delay: 200, target: '.hero-subtitle' },
      ],
      is_system: true,
      user_id: null,
      created_at: '2024-01-01T00:00:00Z',
    },
  ],
  recent_animations: ['fade-in', 'bounce'],
  favorite_animations: ['fade-in'],
  default_settings: {
    duration: 500,
    delay: 0,
    easing: 'ease',
    repeat: 1,
    repeat_delay: 0,
    direction: 'normal',
    fill_mode: 'forwards',
    trigger: 'load',
    scroll_offset: 100,
  },
};

const mockToggleFavoriteResponse = {
  animation_id: 'bounce',
  is_favorite: true,
};

const mockCreateCustomResponse = {
  id: '770e8400-e29b-41d4-a716-446655440002',
  user_id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'New Custom Animation',
  category: 'custom',
  duration: 600,
  css_keyframes: '@keyframes newCustom { 0% { scale: 0.9; } 100% { scale: 1; } }',
  css_class: 'animate-new-custom',
  settings: { duration: 600, delay: 100, easing: 'ease-out' },
  is_public: false,
  created_at: '2024-01-15T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z',
};

const mockGenerateOutputResponse = {
  inline_style: 'animation: fadeIn 500ms ease forwards;',
  css_class: 'animate-fade-in',
  data_attributes: 'data-animation="fade-in" data-duration="500" data-trigger="load"',
  css_keyframes: '@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }',
  js_trigger_code: null,
};

const mockAnalyticsResponse = {
  total_applications: 150,
  unique_animations_used: 12,
  most_used_animations: [
    { animation_id: 'fade-in', animation_type: 'system', usage_count: 45, last_used: '2024-01-15T10:00:00Z' },
    { animation_id: 'bounce', animation_type: 'system', usage_count: 32, last_used: '2024-01-14T15:00:00Z' },
  ],
  recent_activity: [
    { animation_id: 'slide-up', animation_type: 'system', usage_count: 1, last_used: '2024-01-15T12:00:00Z' },
  ],
  category_breakdown: [
    { category: 'entrance', count: 60 },
    { category: 'emphasis', count: 45 },
    { category: 'exit', count: 25 },
    { category: 'scroll', count: 20 },
  ],
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

// Helper to setup mock fetch responses
function setupMockFetch(responses: Record<string, any>) {
  mockFetch.mockImplementation((url: string, options?: RequestInit) => {
    const urlStr = url.toString();

    // Match URL patterns
    if (urlStr.includes('/api/animations/library')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(responses.library || mockAnimationLibraryResponse),
      });
    }

    if (urlStr.includes('/api/animations/favorites/toggle')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(responses.toggleFavorite || mockToggleFavoriteResponse),
      });
    }

    if (urlStr.includes('/api/animations/custom') && options?.method === 'POST') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(responses.createCustom || mockCreateCustomResponse),
      });
    }

    if (urlStr.includes('/api/animations/generate-output')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(responses.generateOutput || mockGenerateOutputResponse),
      });
    }

    if (urlStr.includes('/api/animations/analytics')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(responses.analytics || mockAnalyticsResponse),
      });
    }

    if (urlStr.includes('/api/animations/track-usage')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    }

    if (urlStr.includes('/api/animations/recent')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    }

    if (urlStr.includes('/api/animations/presets') && options?.method === 'POST') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(responses.createPreset || {
          id: '880e8400-e29b-41d4-a716-446655440003',
          name: 'New Preset',
          description: 'Test preset',
          steps: [],
          is_system: false,
          user_id: '123e4567-e89b-12d3-a456-426614174000',
          created_at: '2024-01-15T00:00:00Z',
        }),
      });
    }

    // Default: return 404
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

interface AnimationLibraryData {
  animations: any[];
  categories: any[];
  customAnimations: any[];
  presets: any[];
  recentAnimations: string[];
  favoriteAnimations: string[];
  defaultSettings: any;
}

const useAnimationLibrary = () => {
  const [data, setData] = React.useState<AnimationLibraryData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchLibrary = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/animations/library');
      if (!response.ok) throw new Error('Failed to fetch library');
      const json = await response.json();
      setData({
        animations: json.animations,
        categories: json.categories,
        customAnimations: json.custom_animations,
        presets: json.presets,
        recentAnimations: json.recent_animations,
        favoriteAnimations: json.favorite_animations,
        defaultSettings: json.default_settings,
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

  const toggleFavorite = async (animationId: string) => {
    const response = await fetch('/api/animations/favorites/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ animation_id: animationId }),
    });
    if (!response.ok) throw new Error('Failed to toggle favorite');
    const result = await response.json();

    setData(prev => {
      if (!prev) return prev;
      const favorites = result.is_favorite
        ? [...prev.favoriteAnimations, animationId]
        : prev.favoriteAnimations.filter(id => id !== animationId);
      return { ...prev, favoriteAnimations: favorites };
    });

    return result;
  };

  const createCustomAnimation = async (animationData: any) => {
    const response = await fetch('/api/animations/custom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(animationData),
    });
    if (!response.ok) throw new Error('Failed to create custom animation');
    const result = await response.json();

    setData(prev => {
      if (!prev) return prev;
      return { ...prev, customAnimations: [...prev.customAnimations, result] };
    });

    return result;
  };

  const generateOutput = async (animationId: string, settings: any, outputFormat: string) => {
    const response = await fetch('/api/animations/generate-output', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        animation_id: animationId,
        settings,
        output_format: outputFormat,
        include_keyframes: true,
      }),
    });
    if (!response.ok) throw new Error('Failed to generate output');
    return response.json();
  };

  const trackUsage = async (animationId: string, postId?: string) => {
    await fetch('/api/animations/track-usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        animation_id: animationId,
        animation_type: 'system',
        post_id: postId,
        action: 'apply',
      }),
    });
  };

  const updateRecent = async (animationId: string) => {
    await fetch('/api/animations/recent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ animation_id: animationId }),
    });

    setData(prev => {
      if (!prev) return prev;
      const recent = [animationId, ...prev.recentAnimations.filter(id => id !== animationId)].slice(0, 10);
      return { ...prev, recentAnimations: recent };
    });
  };

  return {
    data,
    loading,
    error,
    refetch: fetchLibrary,
    toggleFavorite,
    createCustomAnimation,
    generateOutput,
    trackUsage,
    updateRecent,
  };
};

// Mock component using the hook
const MockAnimationsLibraryWithAPI = ({
  isOpen = true,
  onClose = vi.fn(),
  onApplyAnimation = vi.fn(),
}: any) => {
  const {
    data,
    loading,
    error,
    toggleFavorite,
    createCustomAnimation,
    generateOutput,
    trackUsage,
    updateRecent,
  } = useAnimationLibrary();

  const [selectedAnimation, setSelectedAnimation] = React.useState<any>(null);
  const [settings, setSettings] = React.useState(data?.defaultSettings || {
    duration: 500,
    delay: 0,
    easing: 'ease',
    repeat: 1,
    direction: 'normal',
    trigger: 'load',
  });
  const [generatedOutput, setGeneratedOutput] = React.useState<any>(null);
  const [activeTab, setActiveTab] = React.useState<'library' | 'custom' | 'presets' | 'recent'>('library');

  if (!isOpen) return null;

  if (loading) {
    return <div data-testid="loading-state">Loading animations...</div>;
  }

  if (error) {
    return <div data-testid="error-state">{error}</div>;
  }

  if (!data) {
    return <div data-testid="no-data-state">No animation data available</div>;
  }

  const handleSelectAnimation = async (animation: any) => {
    setSelectedAnimation(animation);
    await updateRecent(animation.id);
  };

  const handleToggleFavorite = async (animationId: string) => {
    await toggleFavorite(animationId);
  };

  const handleApplyAnimation = async () => {
    if (!selectedAnimation) return;

    await trackUsage(selectedAnimation.id);
    const output = await generateOutput(selectedAnimation.id, settings, 'css-class');
    setGeneratedOutput(output);

    onApplyAnimation({
      animation: selectedAnimation,
      settings,
      output,
    });

    onClose();
  };

  const handleCreateCustom = async () => {
    const customAnimation = {
      name: 'New Custom Animation',
      category: 'custom',
      duration: 600,
      css_keyframes: '@keyframes newCustom { 0% { scale: 0.9; } 100% { scale: 1; } }',
      css_class: 'animate-new-custom',
      settings: { duration: 600, delay: 100, easing: 'ease-out' },
      is_public: false,
    };
    await createCustomAnimation(customAnimation);
  };

  return (
    <div data-testid="animations-library-modal" role="dialog">
      <div className="modal-header">
        <h2>Animation Library</h2>
        <button data-testid="close-modal" onClick={onClose}>×</button>
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
          Custom ({data.customAnimations.length})
        </button>
        <button
          role="tab"
          data-testid="tab-presets"
          aria-selected={activeTab === 'presets'}
          onClick={() => setActiveTab('presets')}
        >
          Presets ({data.presets.length})
        </button>
        <button
          role="tab"
          data-testid="tab-recent"
          aria-selected={activeTab === 'recent'}
          onClick={() => setActiveTab('recent')}
        >
          Recent
        </button>
      </div>

      <div className="modal-content">
        {activeTab === 'library' && (
          <div data-testid="library-tab-content">
            <div className="animations-grid" data-testid="animations-grid">
              {data.animations.map((anim: any) => (
                <div
                  key={anim.id}
                  data-testid={`animation-${anim.id}`}
                  onClick={() => handleSelectAnimation(anim)}
                  className={`animation-card ${selectedAnimation?.id === anim.id ? 'selected' : ''}`}
                >
                  <span className="name">{anim.name}</span>
                  <span className="category">{anim.category}</span>
                  <button
                    data-testid={`favorite-${anim.id}`}
                    onClick={(e) => { e.stopPropagation(); handleToggleFavorite(anim.id); }}
                    className={data.favoriteAnimations.includes(anim.id) ? 'favorited' : ''}
                  >
                    {data.favoriteAnimations.includes(anim.id) ? '★' : '☆'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'custom' && (
          <div data-testid="custom-tab-content">
            <button data-testid="create-custom-btn" onClick={handleCreateCustom}>
              Create Custom Animation
            </button>
            {data.customAnimations.map((anim: any) => (
              <div key={anim.id} data-testid={`custom-${anim.id}`}>
                {anim.name}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'presets' && (
          <div data-testid="presets-tab-content">
            {data.presets.map((preset: any) => (
              <div key={preset.id} data-testid={`preset-${preset.id}`}>
                <strong>{preset.name}</strong>
                <span>{preset.steps.length} steps</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'recent' && (
          <div data-testid="recent-tab-content">
            {data.recentAnimations.length === 0 ? (
              <div data-testid="no-recent">No recent animations</div>
            ) : (
              data.recentAnimations.map((animId: string) => {
                const anim = data.animations.find(a => a.id === animId);
                return anim ? (
                  <div key={animId} data-testid={`recent-${animId}`}>
                    {anim.name}
                  </div>
                ) : null;
              })
            )}
          </div>
        )}

        {selectedAnimation && (
          <div data-testid="animation-sidebar">
            <h3 data-testid="selected-name">{selectedAnimation.name}</h3>
            <div data-testid="animation-settings">
              <label>
                Duration
                <input
                  type="range"
                  data-testid="duration-slider"
                  min={100}
                  max={5000}
                  value={settings.duration}
                  onChange={(e) => setSettings({ ...settings, duration: parseInt(e.target.value) })}
                />
              </label>
              <label>
                Easing
                <select
                  data-testid="easing-select"
                  value={settings.easing}
                  onChange={(e) => setSettings({ ...settings, easing: e.target.value })}
                >
                  <option value="ease">Ease</option>
                  <option value="ease-in">Ease In</option>
                  <option value="ease-out">Ease Out</option>
                  <option value="linear">Linear</option>
                </select>
              </label>
            </div>
            <button data-testid="apply-btn" onClick={handleApplyAnimation}>
              Apply Animation
            </button>
            {generatedOutput && (
              <div data-testid="generated-output">
                <code>{generatedOutput.css_class}</code>
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

describe('AnimationsLibrary - API Integration', () => {
  beforeEach(() => {
    setupMockFetch({});
  });

  it('should fetch animation library on mount', async () => {
    render(<MockAnimationsLibraryWithAPI />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/animations/library');
    });
  });

  it('should display loading state while fetching', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<MockAnimationsLibraryWithAPI />);

    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('should display animations after loading', async () => {
    render(<MockAnimationsLibraryWithAPI />);

    await waitFor(() => {
      expect(screen.getByTestId('animations-grid')).toBeInTheDocument();
    });

    expect(screen.getByTestId('animation-fade-in')).toBeInTheDocument();
    expect(screen.getByTestId('animation-slide-up')).toBeInTheDocument();
    expect(screen.getByTestId('animation-bounce')).toBeInTheDocument();
  });

  it('should display error state when API fails', async () => {
    mockFetch.mockImplementation(() => Promise.resolve({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Server error' }),
    }));

    render(<MockAnimationsLibraryWithAPI />);

    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
    });
  });
});

describe('AnimationsLibrary - Favorites API', () => {
  beforeEach(() => {
    setupMockFetch({});
  });

  it('should call toggle favorite API when star clicked', async () => {
    render(<MockAnimationsLibraryWithAPI />);

    await waitFor(() => {
      expect(screen.getByTestId('animations-grid')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('favorite-bounce'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/animations/favorites/toggle',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ animation_id: 'bounce' }),
        })
      );
    });
  });

  it('should update favorites list after toggle', async () => {
    render(<MockAnimationsLibraryWithAPI />);

    await waitFor(() => {
      expect(screen.getByTestId('animations-grid')).toBeInTheDocument();
    });

    // bounce is initially not favorited
    const bounceFavorite = screen.getByTestId('favorite-bounce');
    expect(bounceFavorite).not.toHaveClass('favorited');

    await userEvent.click(bounceFavorite);

    await waitFor(() => {
      expect(bounceFavorite).toHaveClass('favorited');
    });
  });
});

describe('AnimationsLibrary - Custom Animation API', () => {
  beforeEach(() => {
    setupMockFetch({});
  });

  it('should call create custom animation API', async () => {
    render(<MockAnimationsLibraryWithAPI />);

    await waitFor(() => {
      expect(screen.getByTestId('animations-grid')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('tab-custom'));
    await userEvent.click(screen.getByTestId('create-custom-btn'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/animations/custom',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });
  });

  it('should add new custom animation to list after creation', async () => {
    render(<MockAnimationsLibraryWithAPI />);

    await waitFor(() => {
      expect(screen.getByTestId('animations-grid')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('tab-custom'));

    // Initially has 1 custom animation
    const initialCustom = screen.getByTestId('custom-550e8400-e29b-41d4-a716-446655440000');
    expect(initialCustom).toBeInTheDocument();

    await userEvent.click(screen.getByTestId('create-custom-btn'));

    await waitFor(() => {
      // Should now have 2 custom animations
      expect(screen.getByTestId('custom-770e8400-e29b-41d4-a716-446655440002')).toBeInTheDocument();
    });
  });
});

describe('AnimationsLibrary - Apply Animation API', () => {
  beforeEach(() => {
    setupMockFetch({});
  });

  it('should call track usage API when applying animation', async () => {
    const onApplyAnimation = vi.fn();
    render(<MockAnimationsLibraryWithAPI onApplyAnimation={onApplyAnimation} />);

    await waitFor(() => {
      expect(screen.getByTestId('animations-grid')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('animation-fade-in'));
    await userEvent.click(screen.getByTestId('apply-btn'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/animations/track-usage',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  it('should call generate output API when applying animation', async () => {
    const onApplyAnimation = vi.fn();
    render(<MockAnimationsLibraryWithAPI onApplyAnimation={onApplyAnimation} />);

    await waitFor(() => {
      expect(screen.getByTestId('animations-grid')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('animation-fade-in'));
    await userEvent.click(screen.getByTestId('apply-btn'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/animations/generate-output',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  it('should call onApplyAnimation with generated output', async () => {
    const onApplyAnimation = vi.fn();
    render(<MockAnimationsLibraryWithAPI onApplyAnimation={onApplyAnimation} />);

    await waitFor(() => {
      expect(screen.getByTestId('animations-grid')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('animation-fade-in'));
    await userEvent.click(screen.getByTestId('apply-btn'));

    await waitFor(() => {
      expect(onApplyAnimation).toHaveBeenCalledWith(
        expect.objectContaining({
          animation: expect.objectContaining({ id: 'fade-in' }),
          settings: expect.any(Object),
          output: expect.objectContaining({
            css_class: 'animate-fade-in',
          }),
        })
      );
    });
  });
});

describe('AnimationsLibrary - Recent Animations API', () => {
  beforeEach(() => {
    setupMockFetch({});
  });

  it('should call update recent API when selecting animation', async () => {
    render(<MockAnimationsLibraryWithAPI />);

    await waitFor(() => {
      expect(screen.getByTestId('animations-grid')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('animation-slide-up'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/animations/recent',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ animation_id: 'slide-up' }),
        })
      );
    });
  });

  it('should display recent animations in Recent tab', async () => {
    render(<MockAnimationsLibraryWithAPI />);

    await waitFor(() => {
      expect(screen.getByTestId('animations-grid')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('tab-recent'));

    expect(screen.getByTestId('recent-fade-in')).toBeInTheDocument();
    expect(screen.getByTestId('recent-bounce')).toBeInTheDocument();
  });

  it('should update recent list after selecting animation', async () => {
    render(<MockAnimationsLibraryWithAPI />);

    await waitFor(() => {
      expect(screen.getByTestId('animations-grid')).toBeInTheDocument();
    });

    // Select slide-up
    await userEvent.click(screen.getByTestId('animation-slide-up'));

    // Switch to recent tab
    await userEvent.click(screen.getByTestId('tab-recent'));

    await waitFor(() => {
      // slide-up should now be in recent
      expect(screen.getByTestId('recent-slide-up')).toBeInTheDocument();
    });
  });
});

describe('AnimationsLibrary - Settings State', () => {
  beforeEach(() => {
    setupMockFetch({});
  });

  it('should update settings when duration slider changes', async () => {
    const onApplyAnimation = vi.fn();
    render(<MockAnimationsLibraryWithAPI onApplyAnimation={onApplyAnimation} />);

    await waitFor(() => {
      expect(screen.getByTestId('animations-grid')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('animation-fade-in'));

    const durationSlider = screen.getByTestId('duration-slider');
    fireEvent.change(durationSlider, { target: { value: '1000' } });

    await userEvent.click(screen.getByTestId('apply-btn'));

    await waitFor(() => {
      expect(onApplyAnimation).toHaveBeenCalledWith(
        expect.objectContaining({
          settings: expect.objectContaining({
            duration: 1000,
          }),
        })
      );
    });
  });

  it('should update settings when easing select changes', async () => {
    const onApplyAnimation = vi.fn();
    render(<MockAnimationsLibraryWithAPI onApplyAnimation={onApplyAnimation} />);

    await waitFor(() => {
      expect(screen.getByTestId('animations-grid')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('animation-fade-in'));

    await userEvent.selectOptions(screen.getByTestId('easing-select'), 'ease-out');

    await userEvent.click(screen.getByTestId('apply-btn'));

    await waitFor(() => {
      expect(onApplyAnimation).toHaveBeenCalledWith(
        expect.objectContaining({
          settings: expect.objectContaining({
            easing: 'ease-out',
          }),
        })
      );
    });
  });
});

describe('AnimationsLibrary - Tab State Management', () => {
  beforeEach(() => {
    setupMockFetch({});
  });

  it('should display custom animation count in tab', async () => {
    render(<MockAnimationsLibraryWithAPI />);

    await waitFor(() => {
      expect(screen.getByTestId('animations-grid')).toBeInTheDocument();
    });

    expect(screen.getByTestId('tab-custom')).toHaveTextContent('Custom (1)');
  });

  it('should display presets count in tab', async () => {
    render(<MockAnimationsLibraryWithAPI />);

    await waitFor(() => {
      expect(screen.getByTestId('animations-grid')).toBeInTheDocument();
    });

    expect(screen.getByTestId('tab-presets')).toHaveTextContent('Presets (1)');
  });

  it('should display presets in Presets tab', async () => {
    render(<MockAnimationsLibraryWithAPI />);

    await waitFor(() => {
      expect(screen.getByTestId('animations-grid')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('tab-presets'));

    expect(screen.getByTestId('preset-660e8400-e29b-41d4-a716-446655440001')).toBeInTheDocument();
    expect(screen.getByText('Hero Section')).toBeInTheDocument();
    expect(screen.getByText('2 steps')).toBeInTheDocument();
  });
});

describe('AnimationsLibrary - Close Behavior', () => {
  beforeEach(() => {
    setupMockFetch({});
  });

  it('should call onClose when close button clicked', async () => {
    const onClose = vi.fn();
    render(<MockAnimationsLibraryWithAPI onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByTestId('animations-grid')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('close-modal'));

    expect(onClose).toHaveBeenCalled();
  });

  it('should call onClose after applying animation', async () => {
    const onClose = vi.fn();
    render(<MockAnimationsLibraryWithAPI onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByTestId('animations-grid')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('animation-fade-in'));
    await userEvent.click(screen.getByTestId('apply-btn'));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });
});

// Import fireEvent for the slider tests
import { fireEvent } from '@testing-library/react';
