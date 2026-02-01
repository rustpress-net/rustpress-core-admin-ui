import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock data
const mockMediaItems = [
  {
    id: '1',
    filename: 'hero-image.jpg',
    original_filename: 'hero-image.jpg',
    mime_type: 'image/jpeg',
    file_size: 245000,
    width: 1920,
    height: 1080,
    url: '/uploads/hero-image.jpg',
    thumbnail_url: '/uploads/thumbnails/hero-image.jpg',
    alt_text: 'Hero banner image',
    caption: 'Main hero image for homepage',
    folder_id: 'folder-1',
    folder_name: 'Images',
    uploaded_by: 'user-1',
    uploader_name: 'John Doe',
    is_optimized: true,
    original_size: 450000,
    optimized_url: '/uploads/optimized/hero-image.webp',
    blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH',
    dominant_color: '#3b82f6',
    focal_point_x: 50,
    focal_point_y: 50,
    tags: ['hero', 'banner', 'homepage'],
    is_favorite: true,
    view_count: 150,
    download_count: 25,
    variants: [
      { id: 'v1', variant_type: 'thumbnail', filename: 'hero-image-thumb.jpg', url: '/uploads/thumbnails/hero-image.jpg', width: 150, height: 84, file_size: 5000, mime_type: 'image/jpeg' },
      { id: 'v2', variant_type: 'medium', filename: 'hero-image-medium.jpg', url: '/uploads/medium/hero-image.jpg', width: 800, height: 450, file_size: 75000, mime_type: 'image/jpeg' },
    ],
    usage_count: 3,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T12:00:00Z',
    meta: {},
  },
  {
    id: '2',
    filename: 'product-video.mp4',
    original_filename: 'product-demo.mp4',
    mime_type: 'video/mp4',
    file_size: 15000000,
    width: 1280,
    height: 720,
    duration: 120,
    url: '/uploads/product-video.mp4',
    thumbnail_url: '/uploads/thumbnails/product-video.jpg',
    alt_text: 'Product demonstration video',
    caption: 'Demo video showing product features',
    folder_id: 'folder-2',
    folder_name: 'Videos',
    uploaded_by: 'user-1',
    uploader_name: 'John Doe',
    is_optimized: false,
    tags: ['product', 'demo', 'video'],
    is_favorite: false,
    view_count: 50,
    download_count: 10,
    variants: [],
    usage_count: 1,
    created_at: '2024-01-14T08:00:00Z',
    updated_at: '2024-01-14T08:00:00Z',
    meta: {},
  },
  {
    id: '3',
    filename: 'document.pdf',
    original_filename: 'annual-report-2024.pdf',
    mime_type: 'application/pdf',
    file_size: 2500000,
    url: '/uploads/document.pdf',
    alt_text: 'Annual report 2024',
    caption: 'Company annual report for 2024',
    folder_id: 'folder-4',
    folder_name: 'Documents',
    uploaded_by: 'user-2',
    uploader_name: 'Jane Smith',
    is_optimized: false,
    tags: ['report', 'annual', '2024'],
    is_favorite: false,
    view_count: 20,
    download_count: 15,
    variants: [],
    usage_count: 0,
    created_at: '2024-01-10T14:00:00Z',
    updated_at: '2024-01-10T14:00:00Z',
    meta: {},
  },
];

const mockFolders = [
  {
    id: 'folder-1',
    name: 'Images',
    slug: 'images',
    description: 'All image files',
    parent_id: null,
    color: '#10b981',
    icon: 'image',
    item_count: 45,
    total_size: 125000000,
    is_system: true,
    sort_order: 1,
    children: [
      {
        id: 'folder-1a',
        name: 'Thumbnails',
        slug: 'thumbnails',
        parent_id: 'folder-1',
        color: '#10b981',
        icon: 'image',
        item_count: 20,
        total_size: 5000000,
        is_system: true,
        sort_order: 1,
        children: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'folder-2',
    name: 'Videos',
    slug: 'videos',
    description: 'All video files',
    parent_id: null,
    color: '#f59e0b',
    icon: 'video',
    item_count: 12,
    total_size: 500000000,
    is_system: true,
    sort_order: 2,
    children: [],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'folder-3',
    name: 'Audio',
    slug: 'audio',
    description: 'All audio files',
    parent_id: null,
    color: '#8b5cf6',
    icon: 'music',
    item_count: 8,
    total_size: 80000000,
    is_system: true,
    sort_order: 3,
    children: [],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'folder-4',
    name: 'Documents',
    slug: 'documents',
    description: 'PDF and document files',
    parent_id: null,
    color: '#ef4444',
    icon: 'file-text',
    item_count: 15,
    total_size: 25000000,
    is_system: true,
    sort_order: 4,
    children: [],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const mockStats = {
  total_items: 80,
  total_size: 730000000,
  images_count: 45,
  videos_count: 12,
  audio_count: 8,
  documents_count: 15,
  optimized_count: 30,
  total_savings: 45000000,
  favorites_count: 5,
};

const mockUserPreferences = {
  default_folder_id: null,
  view_mode: 'grid',
  sort_by: 'created_at',
  sort_order: 'desc',
  items_per_page: 24,
  auto_optimize: true,
  default_quality: 85,
  generate_thumbnails: true,
  generate_webp: true,
  max_upload_size: 10485760,
  allowed_types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'application/pdf'],
};

// Mock component props
const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSelect: vi.fn(),
  multiple: false,
  accept: '*/*',
};

// Mock MediaLibraryModal component for testing
const MockMediaLibraryModal = ({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  accept = '*/*',
}: typeof defaultProps) => {
  if (!isOpen) return null;

  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [selectedFolder, setSelectedFolder] = React.useState<string | null>(null);
  const [selectedItems, setSelectedItems] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterType, setFilterType] = React.useState<'all' | 'image' | 'video' | 'audio' | 'document'>('all');
  const [sortBy, setSortBy] = React.useState('created_at');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const [showUploader, setShowUploader] = React.useState(false);
  const [showDetails, setShowDetails] = React.useState(false);
  const [detailItem, setDetailItem] = React.useState<typeof mockMediaItems[0] | null>(null);

  const filteredItems = mockMediaItems.filter((item) => {
    if (searchQuery && !item.filename.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.alt_text.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedFolder && item.folder_id !== selectedFolder) {
      return false;
    }
    if (filterType !== 'all') {
      const typeMap: Record<string, string> = {
        image: 'image/',
        video: 'video/',
        audio: 'audio/',
        document: 'application/',
      };
      if (!item.mime_type.startsWith(typeMap[filterType])) {
        return false;
      }
    }
    return true;
  });

  const handleSelect = (item: typeof mockMediaItems[0]) => {
    if (multiple) {
      setSelectedItems((prev) =>
        prev.includes(item.id)
          ? prev.filter((id) => id !== item.id)
          : [...prev, item.id]
      );
    } else {
      setSelectedItems([item.id]);
    }
  };

  const handleInsert = () => {
    const items = mockMediaItems.filter((item) => selectedItems.includes(item.id));
    onSelect(multiple ? items : items[0]);
    onClose();
  };

  const handleViewDetails = (item: typeof mockMediaItems[0]) => {
    setDetailItem(item);
    setShowDetails(true);
  };

  return (
    <div data-testid="media-library-modal" role="dialog" aria-label="Media Library">
      <div className="modal-header">
        <h2>Media Library</h2>
        <button data-testid="close-button" onClick={onClose} aria-label="Close">×</button>
      </div>

      <div className="modal-toolbar">
        <input
          data-testid="search-input"
          type="text"
          placeholder="Search media..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search media"
        />

        <div className="filter-buttons" role="group" aria-label="Filter by type">
          {['all', 'image', 'video', 'audio', 'document'].map((type) => (
            <button
              key={type}
              data-testid={`filter-${type}`}
              onClick={() => setFilterType(type as any)}
              aria-pressed={filterType === type}
              className={filterType === type ? 'active' : ''}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        <div className="view-toggle" role="group" aria-label="View mode">
          <button
            data-testid="view-grid"
            onClick={() => setViewMode('grid')}
            aria-pressed={viewMode === 'grid'}
          >
            Grid
          </button>
          <button
            data-testid="view-list"
            onClick={() => setViewMode('list')}
            aria-pressed={viewMode === 'list'}
          >
            List
          </button>
        </div>

        <select
          data-testid="sort-select"
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [by, order] = e.target.value.split('-');
            setSortBy(by);
            setSortOrder(order as 'asc' | 'desc');
          }}
          aria-label="Sort by"
        >
          <option value="created_at-desc">Newest First</option>
          <option value="created_at-asc">Oldest First</option>
          <option value="filename-asc">Name A-Z</option>
          <option value="filename-desc">Name Z-A</option>
          <option value="file_size-desc">Largest First</option>
          <option value="file_size-asc">Smallest First</option>
        </select>

        <button data-testid="upload-button" onClick={() => setShowUploader(true)}>
          Upload
        </button>
      </div>

      <div className="modal-body">
        <div className="folder-sidebar" data-testid="folder-sidebar">
          <h3>Folders</h3>
          <button
            data-testid="folder-all"
            onClick={() => setSelectedFolder(null)}
            className={selectedFolder === null ? 'active' : ''}
          >
            All Files ({mockStats.total_items})
          </button>
          {mockFolders.map((folder) => (
            <div key={folder.id}>
              <button
                data-testid={`folder-${folder.slug}`}
                onClick={() => setSelectedFolder(folder.id)}
                className={selectedFolder === folder.id ? 'active' : ''}
                style={{ color: folder.color }}
              >
                <span className="folder-icon">{folder.icon}</span>
                {folder.name} ({folder.item_count})
              </button>
              {folder.children.map((child) => (
                <button
                  key={child.id}
                  data-testid={`folder-${child.slug}`}
                  onClick={() => setSelectedFolder(child.id)}
                  className={`subfolder ${selectedFolder === child.id ? 'active' : ''}`}
                >
                  {child.name} ({child.item_count})
                </button>
              ))}
            </div>
          ))}
          <button data-testid="create-folder-button" onClick={() => {}}>
            + New Folder
          </button>
        </div>

        <div className={`media-grid ${viewMode}`} data-testid="media-grid">
          {filteredItems.length === 0 ? (
            <div data-testid="no-results">No media found matching your criteria</div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                data-testid={`media-item-${item.id}`}
                className={`media-item ${selectedItems.includes(item.id) ? 'selected' : ''}`}
                onClick={() => handleSelect(item)}
                onDoubleClick={() => handleViewDetails(item)}
                tabIndex={0}
                role="option"
                aria-selected={selectedItems.includes(item.id)}
              >
                {item.mime_type.startsWith('image/') ? (
                  <img src={item.thumbnail_url || item.url} alt={item.alt_text} />
                ) : item.mime_type.startsWith('video/') ? (
                  <div className="video-thumbnail">
                    <img src={item.thumbnail_url} alt={item.alt_text} />
                    <span className="duration">{Math.floor((item.duration || 0) / 60)}:{String((item.duration || 0) % 60).padStart(2, '0')}</span>
                  </div>
                ) : (
                  <div className="file-icon">{item.mime_type.split('/')[1]}</div>
                )}

                <div className="media-info">
                  <span className="filename">{item.filename}</span>
                  <span className="file-size">{formatFileSize(item.file_size)}</span>
                </div>

                {item.is_favorite && (
                  <span className="favorite-badge" data-testid={`favorite-${item.id}`}>★</span>
                )}
                {item.is_optimized && (
                  <span className="optimized-badge" data-testid={`optimized-${item.id}`}>⚡</span>
                )}
                {item.usage_count > 0 && (
                  <span className="usage-badge" data-testid={`usage-${item.id}`}>{item.usage_count}</span>
                )}
              </div>
            ))
          )}
        </div>

        {showDetails && detailItem && (
          <div className="details-panel" data-testid="details-panel">
            <h3>Media Details</h3>
            <button data-testid="close-details" onClick={() => setShowDetails(false)}>×</button>

            <div className="detail-preview">
              {detailItem.mime_type.startsWith('image/') && (
                <img src={detailItem.url} alt={detailItem.alt_text} />
              )}
            </div>

            <dl>
              <dt>Filename</dt>
              <dd data-testid="detail-filename">{detailItem.filename}</dd>

              <dt>Type</dt>
              <dd data-testid="detail-type">{detailItem.mime_type}</dd>

              <dt>Size</dt>
              <dd data-testid="detail-size">{formatFileSize(detailItem.file_size)}</dd>

              {detailItem.width && detailItem.height && (
                <>
                  <dt>Dimensions</dt>
                  <dd data-testid="detail-dimensions">{detailItem.width} × {detailItem.height}</dd>
                </>
              )}

              <dt>Alt Text</dt>
              <dd data-testid="detail-alt">{detailItem.alt_text}</dd>

              <dt>Caption</dt>
              <dd data-testid="detail-caption">{detailItem.caption}</dd>

              <dt>Uploaded By</dt>
              <dd data-testid="detail-uploader">{detailItem.uploader_name}</dd>

              <dt>Upload Date</dt>
              <dd data-testid="detail-date">{new Date(detailItem.created_at).toLocaleDateString()}</dd>

              {detailItem.is_optimized && (
                <>
                  <dt>Original Size</dt>
                  <dd data-testid="detail-original-size">{formatFileSize(detailItem.original_size || 0)}</dd>

                  <dt>Savings</dt>
                  <dd data-testid="detail-savings">
                    {formatFileSize((detailItem.original_size || 0) - detailItem.file_size)}
                    ({Math.round(((detailItem.original_size || 0) - detailItem.file_size) / (detailItem.original_size || 1) * 100)}%)
                  </dd>
                </>
              )}

              <dt>Tags</dt>
              <dd data-testid="detail-tags">
                {detailItem.tags.map((tag) => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </dd>

              <dt>Usage</dt>
              <dd data-testid="detail-usage">{detailItem.usage_count} locations</dd>
            </dl>

            <div className="detail-actions">
              <button data-testid="edit-button">Edit</button>
              <button data-testid="optimize-button" disabled={detailItem.is_optimized}>
                {detailItem.is_optimized ? 'Optimized' : 'Optimize'}
              </button>
              <button data-testid="favorite-button">
                {detailItem.is_favorite ? 'Unfavorite' : 'Favorite'}
              </button>
              <button data-testid="delete-button">Delete</button>
              <button data-testid="download-button">Download</button>
            </div>

            {detailItem.variants.length > 0 && (
              <div className="variants-section">
                <h4>Available Sizes</h4>
                {detailItem.variants.map((variant) => (
                  <div key={variant.id} data-testid={`variant-${variant.variant_type}`}>
                    {variant.variant_type}: {variant.width}×{variant.height} ({formatFileSize(variant.file_size || 0)})
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showUploader && (
        <div className="upload-overlay" data-testid="upload-overlay">
          <div className="upload-zone" data-testid="upload-zone">
            <p>Drag and drop files here or click to browse</p>
            <input type="file" multiple data-testid="file-input" />
            <button data-testid="cancel-upload" onClick={() => setShowUploader(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="modal-footer">
        <div className="stats">
          <span data-testid="selected-count">{selectedItems.length} selected</span>
          <span data-testid="total-count">{filteredItems.length} items</span>
        </div>
        <div className="actions">
          <button data-testid="cancel-button" onClick={onClose}>Cancel</button>
          <button
            data-testid="insert-button"
            onClick={handleInsert}
            disabled={selectedItems.length === 0}
          >
            Insert {selectedItems.length > 0 ? `(${selectedItems.length})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
};

// Import React for the mock component
import React from 'react';

// Helper function
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

describe('MediaLibrary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render the media library modal when open', () => {
      render(<MockMediaLibraryModal {...defaultProps} />);
      expect(screen.getByTestId('media-library-modal')).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Media Library');
    });

    it('should not render when closed', () => {
      render(<MockMediaLibraryModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByTestId('media-library-modal')).not.toBeInTheDocument();
    });

    it('should render all media items', () => {
      render(<MockMediaLibraryModal {...defaultProps} />);
      mockMediaItems.forEach((item) => {
        expect(screen.getByTestId(`media-item-${item.id}`)).toBeInTheDocument();
      });
    });

    it('should render folder sidebar with all folders', () => {
      render(<MockMediaLibraryModal {...defaultProps} />);
      expect(screen.getByTestId('folder-sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('folder-images')).toBeInTheDocument();
      expect(screen.getByTestId('folder-videos')).toBeInTheDocument();
      expect(screen.getByTestId('folder-audio')).toBeInTheDocument();
      expect(screen.getByTestId('folder-documents')).toBeInTheDocument();
    });

    it('should render nested folders', () => {
      render(<MockMediaLibraryModal {...defaultProps} />);
      expect(screen.getByTestId('folder-thumbnails')).toBeInTheDocument();
    });

    it('should show favorite badge on favorited items', () => {
      render(<MockMediaLibraryModal {...defaultProps} />);
      expect(screen.getByTestId('favorite-1')).toBeInTheDocument();
      expect(screen.queryByTestId('favorite-2')).not.toBeInTheDocument();
    });

    it('should show optimized badge on optimized items', () => {
      render(<MockMediaLibraryModal {...defaultProps} />);
      expect(screen.getByTestId('optimized-1')).toBeInTheDocument();
      expect(screen.queryByTestId('optimized-2')).not.toBeInTheDocument();
    });

    it('should show usage count badge on used items', () => {
      render(<MockMediaLibraryModal {...defaultProps} />);
      expect(screen.getByTestId('usage-1')).toHaveTextContent('3');
    });

    it('should render toolbar with all controls', () => {
      render(<MockMediaLibraryModal {...defaultProps} />);
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
      expect(screen.getByTestId('filter-all')).toBeInTheDocument();
      expect(screen.getByTestId('view-grid')).toBeInTheDocument();
      expect(screen.getByTestId('view-list')).toBeInTheDocument();
      expect(screen.getByTestId('sort-select')).toBeInTheDocument();
      expect(screen.getByTestId('upload-button')).toBeInTheDocument();
    });
  });

  describe('Search', () => {
    it('should filter items by search query', async () => {
      const user = userEvent.setup();
      render(<MockMediaLibraryModal {...defaultProps} />);

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'hero');

      expect(screen.getByTestId('media-item-1')).toBeInTheDocument();
      expect(screen.queryByTestId('media-item-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('media-item-3')).not.toBeInTheDocument();
    });

    it('should search in alt text', async () => {
      const user = userEvent.setup();
      render(<MockMediaLibraryModal {...defaultProps} />);

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'demonstration');

      expect(screen.queryByTestId('media-item-1')).not.toBeInTheDocument();
      expect(screen.getByTestId('media-item-2')).toBeInTheDocument();
    });

    it('should show no results message when no matches', async () => {
      const user = userEvent.setup();
      render(<MockMediaLibraryModal {...defaultProps} />);

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'nonexistent');

      expect(screen.getByTestId('no-results')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('should filter by media type - images', async () => {
      const user = userEvent.setup();
      render(<MockMediaLibraryModal {...defaultProps} />);

      await user.click(screen.getByTestId('filter-image'));

      expect(screen.getByTestId('media-item-1')).toBeInTheDocument();
      expect(screen.queryByTestId('media-item-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('media-item-3')).not.toBeInTheDocument();
    });

    it('should filter by media type - videos', async () => {
      const user = userEvent.setup();
      render(<MockMediaLibraryModal {...defaultProps} />);

      await user.click(screen.getByTestId('filter-video'));

      expect(screen.queryByTestId('media-item-1')).not.toBeInTheDocument();
      expect(screen.getByTestId('media-item-2')).toBeInTheDocument();
      expect(screen.queryByTestId('media-item-3')).not.toBeInTheDocument();
    });

    it('should filter by media type - documents', async () => {
      const user = userEvent.setup();
      render(<MockMediaLibraryModal {...defaultProps} />);

      await user.click(screen.getByTestId('filter-document'));

      expect(screen.queryByTestId('media-item-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('media-item-2')).not.toBeInTheDocument();
      expect(screen.getByTestId('media-item-3')).toBeInTheDocument();
    });

    it('should show all items when "all" filter is selected', async () => {
      const user = userEvent.setup();
      render(<MockMediaLibraryModal {...defaultProps} />);

      await user.click(screen.getByTestId('filter-image'));
      await user.click(screen.getByTestId('filter-all'));

      expect(screen.getByTestId('media-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('media-item-2')).toBeInTheDocument();
      expect(screen.getByTestId('media-item-3')).toBeInTheDocument();
    });
  });

  describe('Folder Navigation', () => {
    it('should filter by folder when folder is selected', async () => {
      const user = userEvent.setup();
      render(<MockMediaLibraryModal {...defaultProps} />);

      await user.click(screen.getByTestId('folder-images'));

      expect(screen.getByTestId('media-item-1')).toBeInTheDocument();
      expect(screen.queryByTestId('media-item-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('media-item-3')).not.toBeInTheDocument();
    });

    it('should show all items when "All Files" is selected', async () => {
      const user = userEvent.setup();
      render(<MockMediaLibraryModal {...defaultProps} />);

      await user.click(screen.getByTestId('folder-images'));
      await user.click(screen.getByTestId('folder-all'));

      expect(screen.getByTestId('media-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('media-item-2')).toBeInTheDocument();
      expect(screen.getByTestId('media-item-3')).toBeInTheDocument();
    });

    it('should highlight active folder', async () => {
      const user = userEvent.setup();
      render(<MockMediaLibraryModal {...defaultProps} />);

      const folderButton = screen.getByTestId('folder-images');
      await user.click(folderButton);

      expect(folderButton).toHaveClass('active');
    });
  });

  describe('View Mode', () => {
    it('should default to grid view', () => {
      render(<MockMediaLibraryModal {...defaultProps} />);
      expect(screen.getByTestId('media-grid')).toHaveClass('grid');
    });

    it('should switch to list view when list button is clicked', async () => {
      const user = userEvent.setup();
      render(<MockMediaLibraryModal {...defaultProps} />);

      await user.click(screen.getByTestId('view-list'));

      expect(screen.getByTestId('media-grid')).toHaveClass('list');
    });

    it('should switch back to grid view', async () => {
      const user = userEvent.setup();
      render(<MockMediaLibraryModal {...defaultProps} />);

      await user.click(screen.getByTestId('view-list'));
      await user.click(screen.getByTestId('view-grid'));

      expect(screen.getByTestId('media-grid')).toHaveClass('grid');
    });
  });

  describe('Selection', () => {
    it('should select item on click', async () => {
      const user = userEvent.setup();
      render(<MockMediaLibraryModal {...defaultProps} />);

      const item = screen.getByTestId('media-item-1');
      await user.click(item);

      expect(item).toHaveClass('selected');
      expect(screen.getByTestId('selected-count')).toHaveTextContent('1 selected');
    });

    it('should deselect item on second click in single mode', async () => {
      const user = userEvent.setup();
      render(<MockMediaLibraryModal {...defaultProps} />);

      const item = screen.getByTestId('media-item-1');
      await user.click(item);
      await user.click(item);

      expect(item).not.toHaveClass('selected');
    });

    it('should allow multiple selection in multiple mode', async () => {
      const user = userEvent.setup();
      render(<MockMediaLibraryModal {...defaultProps} multiple={true} />);

      await user.click(screen.getByTestId('media-item-1'));
      await user.click(screen.getByTestId('media-item-2'));

      expect(screen.getByTestId('media-item-1')).toHaveClass('selected');
      expect(screen.getByTestId('media-item-2')).toHaveClass('selected');
      expect(screen.getByTestId('selected-count')).toHaveTextContent('2 selected');
    });

    it('should enable insert button when items are selected', async () => {
      const user = userEvent.setup();
      render(<MockMediaLibraryModal {...defaultProps} />);

      expect(screen.getByTestId('insert-button')).toBeDisabled();

      await user.click(screen.getByTestId('media-item-1'));

      expect(screen.getByTestId('insert-button')).not.toBeDisabled();
    });
  });

  describe('Details Panel', () => {
    it('should open details panel on double click', async () => {
      const user = userEvent.setup();
      render(<MockMediaLibraryModal {...defaultProps} />);

      await user.dblClick(screen.getByTestId('media-item-1'));

      expect(screen.getByTestId('details-panel')).toBeInTheDocument();
    });

    it('should show correct media details', async () => {
      const user = userEvent.setup();
      render(<MockMediaLibraryModal {...defaultProps} />);

      await user.dblClick(screen.getByTestId('media-item-1'));

      expect(screen.getByTestId('detail-filename')).toHaveTextContent('hero-image.jpg');
      expect(screen.getByTestId('detail-type')).toHaveTextContent('image/jpeg');
      expect(screen.getByTestId('detail-dimensions')).toHaveTextContent('1920 × 1080');
      expect(screen.getByTestId('detail-alt')).toHaveTextContent('Hero banner image');
      expect(screen.getByTestId('detail-uploader')).toHaveTextContent('John Doe');
    });

    it('should show optimization info for optimized images', async () => {
      const user = userEvent.setup();
      render(<MockMediaLibraryModal {...defaultProps} />);

      await user.dblClick(screen.getByTestId('media-item-1'));

      expect(screen.getByTestId('detail-original-size')).toBeInTheDocument();
      expect(screen.getByTestId('detail-savings')).toBeInTheDocument();
    });

    it('should show tags in details panel', async () => {
      const user = userEvent.setup();
      render(<MockMediaLibraryModal {...defaultProps} />);

      await user.dblClick(screen.getByTestId('media-item-1'));

      const tagsContainer = screen.getByTestId('detail-tags');
      expect(tagsContainer).toHaveTextContent('hero');
      expect(tagsContainer).toHaveTextContent('banner');
      expect(tagsContainer).toHaveTextContent('homepage');
    });

    it('should show variants for images with multiple sizes', async () => {
      const user = userEvent.setup();
      render(<MockMediaLibraryModal {...defaultProps} />);

      await user.dblClick(screen.getByTestId('media-item-1'));

      expect(screen.getByTestId('variant-thumbnail')).toBeInTheDocument();
      expect(screen.getByTestId('variant-medium')).toBeInTheDocument();
    });

    it('should close details panel when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<MockMediaLibraryModal {...defaultProps} />);

      await user.dblClick(screen.getByTestId('media-item-1'));
      await user.click(screen.getByTestId('close-details'));

      expect(screen.queryByTestId('details-panel')).not.toBeInTheDocument();
    });

    it('should disable optimize button for already optimized images', async () => {
      const user = userEvent.setup();
      render(<MockMediaLibraryModal {...defaultProps} />);

      await user.dblClick(screen.getByTestId('media-item-1'));

      expect(screen.getByTestId('optimize-button')).toBeDisabled();
    });
  });

  describe('Upload', () => {
    it('should show upload overlay when upload button is clicked', async () => {
      const user = userEvent.setup();
      render(<MockMediaLibraryModal {...defaultProps} />);

      await user.click(screen.getByTestId('upload-button'));

      expect(screen.getByTestId('upload-overlay')).toBeInTheDocument();
      expect(screen.getByTestId('upload-zone')).toBeInTheDocument();
    });

    it('should close upload overlay when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<MockMediaLibraryModal {...defaultProps} />);

      await user.click(screen.getByTestId('upload-button'));
      await user.click(screen.getByTestId('cancel-upload'));

      expect(screen.queryByTestId('upload-overlay')).not.toBeInTheDocument();
    });
  });

  describe('Insert Action', () => {
    it('should call onSelect with selected item and close modal', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      const onClose = vi.fn();
      render(<MockMediaLibraryModal {...defaultProps} onSelect={onSelect} onClose={onClose} />);

      await user.click(screen.getByTestId('media-item-1'));
      await user.click(screen.getByTestId('insert-button'));

      expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }));
      expect(onClose).toHaveBeenCalled();
    });

    it('should call onSelect with array in multiple mode', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(<MockMediaLibraryModal {...defaultProps} onSelect={onSelect} multiple={true} />);

      await user.click(screen.getByTestId('media-item-1'));
      await user.click(screen.getByTestId('media-item-2'));
      await user.click(screen.getByTestId('insert-button'));

      expect(onSelect).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: '1' }),
          expect.objectContaining({ id: '2' }),
        ])
      );
    });
  });

  describe('Close Modal', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<MockMediaLibraryModal {...defaultProps} onClose={onClose} />);

      await user.click(screen.getByTestId('close-button'));

      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<MockMediaLibraryModal {...defaultProps} onClose={onClose} />);

      await user.click(screen.getByTestId('cancel-button'));

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<MockMediaLibraryModal {...defaultProps} />);

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Media Library');
      expect(screen.getByLabelText('Search media')).toBeInTheDocument();
      expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
      expect(screen.getByLabelText('Close')).toBeInTheDocument();
    });

    it('should have proper role for media items', () => {
      render(<MockMediaLibraryModal {...defaultProps} />);

      const mediaItem = screen.getByTestId('media-item-1');
      expect(mediaItem).toHaveAttribute('role', 'option');
    });

    it('should mark selected items with aria-selected', async () => {
      const user = userEvent.setup();
      render(<MockMediaLibraryModal {...defaultProps} />);

      const item = screen.getByTestId('media-item-1');
      expect(item).toHaveAttribute('aria-selected', 'false');

      await user.click(item);

      expect(item).toHaveAttribute('aria-selected', 'true');
    });

    it('should have focusable media items', () => {
      render(<MockMediaLibraryModal {...defaultProps} />);

      const mediaItem = screen.getByTestId('media-item-1');
      expect(mediaItem).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Sorting', () => {
    it('should have sort options available', () => {
      render(<MockMediaLibraryModal {...defaultProps} />);

      const sortSelect = screen.getByTestId('sort-select');
      expect(sortSelect).toHaveValue('created_at-desc');
      expect(within(sortSelect).getByText('Newest First')).toBeInTheDocument();
      expect(within(sortSelect).getByText('Name A-Z')).toBeInTheDocument();
    });
  });

  describe('New Folder', () => {
    it('should show create folder button', () => {
      render(<MockMediaLibraryModal {...defaultProps} />);
      expect(screen.getByTestId('create-folder-button')).toBeInTheDocument();
    });
  });

  describe('Video Items', () => {
    it('should display video duration', () => {
      render(<MockMediaLibraryModal {...defaultProps} />);

      const videoItem = screen.getByTestId('media-item-2');
      expect(videoItem).toHaveTextContent('2:00'); // 120 seconds = 2:00
    });
  });

  describe('File Size Display', () => {
    it('should format file sizes correctly', () => {
      render(<MockMediaLibraryModal {...defaultProps} />);

      // The image is 245000 bytes = ~239.26 KB
      const imageItem = screen.getByTestId('media-item-1');
      expect(imageItem).toHaveTextContent('KB');
    });
  });
});
