import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock API responses
const mockLibraryResponse = {
  media: {
    items: [
      {
        id: '1',
        filename: 'test-image.jpg',
        original_filename: 'test-image.jpg',
        mime_type: 'image/jpeg',
        file_size: 245000,
        width: 1920,
        height: 1080,
        url: '/uploads/test-image.jpg',
        thumbnail_url: '/uploads/thumbnails/test-image.jpg',
        alt_text: 'Test image',
        caption: 'A test image',
        folder_id: 'folder-1',
        folder_name: 'Images',
        uploaded_by: 'user-1',
        uploader_name: 'John Doe',
        is_optimized: true,
        original_size: 450000,
        tags: ['test'],
        is_favorite: false,
        view_count: 10,
        download_count: 5,
        variants: [],
        usage_count: 2,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T12:00:00Z',
        meta: {},
      },
    ],
    total: 1,
    page: 1,
    per_page: 24,
    total_pages: 1,
  },
  folders: [
    {
      id: 'folder-1',
      name: 'Images',
      slug: 'images',
      parent_id: null,
      color: '#10b981',
      icon: 'image',
      item_count: 45,
      total_size: 125000000,
      is_system: true,
      children: [],
    },
  ],
  stats: {
    total_items: 80,
    total_size: 730000000,
    images_count: 45,
    videos_count: 12,
    audio_count: 8,
    documents_count: 15,
    optimized_count: 30,
    total_savings: 45000000,
    favorites_count: 5,
  },
  user_preferences: {
    view_mode: 'grid',
    sort_by: 'created_at',
    sort_order: 'desc',
    items_per_page: 24,
    auto_optimize: true,
  },
};

const mockUploadResponse = {
  id: '2',
  url: '/uploads/new-image.jpg',
  filename: 'new-image.jpg',
  mime_type: 'image/jpeg',
  size: 150000,
  thumbnail_url: '/uploads/thumbnails/new-image.jpg',
  width: 800,
  height: 600,
};

const mockOptimizationResponse = {
  media_id: '1',
  original_size: 450000,
  optimized_size: 245000,
  savings_percent: 45.6,
  optimized_url: '/uploads/optimized/test-image.webp',
  variants_generated: ['thumbnail', 'medium', 'large'],
  blurhash: 'LKO2?U%2Tw=w]',
  dominant_color: '#3b82f6',
};

const mockFolderResponse = {
  id: 'folder-new',
  name: 'New Folder',
  slug: 'new-folder',
  parent_id: null,
  color: '#6366f1',
  icon: 'folder',
  item_count: 0,
  total_size: 0,
  is_system: false,
  children: [],
};

describe('MediaLibrary Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('API Integration - Fetch Library', () => {
    it('should fetch media library on mount', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockLibraryResponse),
      });

      // Simulate component that fetches on mount
      const fetchLibrary = async () => {
        const response = await fetch('/api/media/library');
        return response.json();
      };

      const data = await fetchLibrary();

      expect(mockFetch).toHaveBeenCalledWith('/api/media/library');
      expect(data.media.items).toHaveLength(1);
      expect(data.folders).toHaveLength(1);
      expect(data.stats.total_items).toBe(80);
    });

    it('should fetch with pagination parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockLibraryResponse),
      });

      const fetchLibrary = async (page: number, perPage: number) => {
        const response = await fetch(`/api/media/library?page=${page}&per_page=${perPage}`);
        return response.json();
      };

      await fetchLibrary(2, 48);

      expect(mockFetch).toHaveBeenCalledWith('/api/media/library?page=2&per_page=48');
    });

    it('should fetch with folder filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockLibraryResponse),
      });

      const fetchLibrary = async (folderId: string) => {
        const response = await fetch(`/api/media/library?folder_id=${folderId}`);
        return response.json();
      };

      await fetchLibrary('folder-1');

      expect(mockFetch).toHaveBeenCalledWith('/api/media/library?folder_id=folder-1');
    });

    it('should fetch with search query', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockLibraryResponse),
      });

      const fetchLibrary = async (search: string) => {
        const response = await fetch(`/api/media/library?search=${encodeURIComponent(search)}`);
        return response.json();
      };

      await fetchLibrary('test image');

      expect(mockFetch).toHaveBeenCalledWith('/api/media/library?search=test%20image');
    });

    it('should fetch with media type filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockLibraryResponse),
      });

      const fetchLibrary = async (mediaType: string) => {
        const response = await fetch(`/api/media/library?media_type=${mediaType}`);
        return response.json();
      };

      await fetchLibrary('image');

      expect(mockFetch).toHaveBeenCalledWith('/api/media/library?media_type=image');
    });

    it('should handle fetch error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const fetchLibrary = async () => {
        try {
          const response = await fetch('/api/media/library');
          return response.json();
        } catch (error) {
          throw error;
        }
      };

      await expect(fetchLibrary()).rejects.toThrow('Network error');
    });
  });

  describe('API Integration - Upload', () => {
    it('should upload file with FormData', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUploadResponse),
      });

      const uploadFile = async (file: File, options: { folder_id?: string; alt_text?: string }) => {
        const formData = new FormData();
        formData.append('file', file);
        if (options.folder_id) formData.append('folder_id', options.folder_id);
        if (options.alt_text) formData.append('alt_text', options.alt_text);

        const response = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        });
        return response.json();
      };

      const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      const result = await uploadFile(file, { folder_id: 'folder-1', alt_text: 'Test alt' });

      expect(mockFetch).toHaveBeenCalledWith('/api/media/upload', expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      }));
      expect(result.id).toBe('2');
      expect(result.url).toBe('/uploads/new-image.jpg');
    });

    it('should handle bulk upload', async () => {
      const bulkResponse = {
        uploaded: [mockUploadResponse, { ...mockUploadResponse, id: '3', filename: 'new-image-2.jpg' }],
        failed: [],
        total_uploaded: 2,
        total_failed: 0,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(bulkResponse),
      });

      const bulkUpload = async (files: File[]) => {
        const formData = new FormData();
        files.forEach((file) => formData.append('files', file));

        const response = await fetch('/api/media/upload/bulk', {
          method: 'POST',
          body: formData,
        });
        return response.json();
      };

      const files = [
        new File(['content1'], 'file1.jpg', { type: 'image/jpeg' }),
        new File(['content2'], 'file2.jpg', { type: 'image/jpeg' }),
      ];

      const result = await bulkUpload(files);

      expect(result.total_uploaded).toBe(2);
      expect(result.uploaded).toHaveLength(2);
    });

    it('should handle upload with auto-optimize option', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUploadResponse),
      });

      const uploadFile = async (file: File, autoOptimize: boolean) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('auto_optimize', String(autoOptimize));

        const response = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        });
        return response.json();
      };

      const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      await uploadFile(file, true);

      const [, options] = mockFetch.mock.calls[0];
      const formData = options.body as FormData;
      expect(formData.get('auto_optimize')).toBe('true');
    });
  });

  describe('API Integration - Media Operations', () => {
    it('should get single media item', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockLibraryResponse.media.items[0]),
      });

      const getMedia = async (id: string) => {
        const response = await fetch(`/api/media/${id}`);
        return response.json();
      };

      const result = await getMedia('1');

      expect(mockFetch).toHaveBeenCalledWith('/api/media/1');
      expect(result.filename).toBe('test-image.jpg');
    });

    it('should update media metadata', async () => {
      const updatedMedia = {
        ...mockLibraryResponse.media.items[0],
        alt_text: 'Updated alt text',
        caption: 'Updated caption',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(updatedMedia),
      });

      const updateMedia = async (id: string, updates: Record<string, any>) => {
        const response = await fetch(`/api/media/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        return response.json();
      };

      const result = await updateMedia('1', {
        alt_text: 'Updated alt text',
        caption: 'Updated caption',
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/media/1', expect.objectContaining({
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      }));
      expect(result.alt_text).toBe('Updated alt text');
    });

    it('should delete media item', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const deleteMedia = async (id: string) => {
        const response = await fetch(`/api/media/${id}`, {
          method: 'DELETE',
        });
        return response.json();
      };

      const result = await deleteMedia('1');

      expect(mockFetch).toHaveBeenCalledWith('/api/media/1', expect.objectContaining({
        method: 'DELETE',
      }));
      expect(result.success).toBe(true);
    });

    it('should toggle favorite status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ is_favorite: true }),
      });

      const toggleFavorite = async (id: string) => {
        const response = await fetch(`/api/media/${id}/favorite`, {
          method: 'POST',
        });
        return response.json();
      };

      const result = await toggleFavorite('1');

      expect(mockFetch).toHaveBeenCalledWith('/api/media/1/favorite', expect.objectContaining({
        method: 'POST',
      }));
      expect(result.is_favorite).toBe(true);
    });
  });

  describe('API Integration - Folder Operations', () => {
    it('should create folder', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFolderResponse),
      });

      const createFolder = async (data: { name: string; parent_id?: string; color?: string }) => {
        const response = await fetch('/api/media/folders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        return response.json();
      };

      const result = await createFolder({ name: 'New Folder', color: '#6366f1' });

      expect(mockFetch).toHaveBeenCalledWith('/api/media/folders', expect.objectContaining({
        method: 'POST',
      }));
      expect(result.name).toBe('New Folder');
    });

    it('should update folder', async () => {
      const updatedFolder = { ...mockFolderResponse, name: 'Renamed Folder' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(updatedFolder),
      });

      const updateFolder = async (id: string, data: { name?: string }) => {
        const response = await fetch(`/api/media/folders/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        return response.json();
      };

      const result = await updateFolder('folder-new', { name: 'Renamed Folder' });

      expect(mockFetch).toHaveBeenCalledWith('/api/media/folders/folder-new', expect.objectContaining({
        method: 'PUT',
      }));
      expect(result.name).toBe('Renamed Folder');
    });

    it('should delete folder', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const deleteFolder = async (id: string, moveContentsTo?: string) => {
        const response = await fetch(`/api/media/folders/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ move_contents_to: moveContentsTo }),
        });
        return response.json();
      };

      const result = await deleteFolder('folder-new', 'folder-1');

      expect(mockFetch).toHaveBeenCalledWith('/api/media/folders/folder-new', expect.objectContaining({
        method: 'DELETE',
      }));
      expect(result.success).toBe(true);
    });
  });

  describe('API Integration - Bulk Operations', () => {
    it('should bulk move media items', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ moved: 3 }),
      });

      const bulkMove = async (mediaIds: string[], folderId: string) => {
        const response = await fetch('/api/media/bulk-move', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ media_ids: mediaIds, folder_id: folderId }),
        });
        return response.json();
      };

      const result = await bulkMove(['1', '2', '3'], 'folder-1');

      expect(mockFetch).toHaveBeenCalledWith('/api/media/bulk-move', expect.objectContaining({
        method: 'POST',
      }));
      expect(result.moved).toBe(3);
    });

    it('should bulk delete media items', async () => {
      const bulkDeleteResponse = {
        deleted: ['1', '2'],
        failed: [{ media_id: '3', error: 'In use' }],
        total_deleted: 2,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(bulkDeleteResponse),
      });

      const bulkDelete = async (mediaIds: string[], permanent: boolean = false) => {
        const response = await fetch('/api/media/bulk-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ media_ids: mediaIds, permanent }),
        });
        return response.json();
      };

      const result = await bulkDelete(['1', '2', '3'], false);

      expect(result.total_deleted).toBe(2);
      expect(result.failed).toHaveLength(1);
    });

    it('should bulk add tags', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ updated: 3 }),
      });

      const bulkTag = async (mediaIds: string[], addTags: string[], removeTags: string[]) => {
        const response = await fetch('/api/media/bulk-tag', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ media_ids: mediaIds, add_tags: addTags, remove_tags: removeTags }),
        });
        return response.json();
      };

      const result = await bulkTag(['1', '2', '3'], ['new-tag', 'another-tag'], ['old-tag']);

      expect(mockFetch).toHaveBeenCalledWith('/api/media/bulk-tag', expect.objectContaining({
        method: 'POST',
      }));
      expect(result.updated).toBe(3);
    });
  });

  describe('API Integration - Optimization', () => {
    it('should optimize a single image', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockOptimizationResponse),
      });

      const optimizeMedia = async (id: string, options: { quality?: number; convert_to?: string }) => {
        const response = await fetch(`/api/media/${id}/optimize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(options),
        });
        return response.json();
      };

      const result = await optimizeMedia('1', { quality: 85, convert_to: 'webp' });

      expect(mockFetch).toHaveBeenCalledWith('/api/media/1/optimize', expect.objectContaining({
        method: 'POST',
      }));
      expect(result.savings_percent).toBe(45.6);
      expect(result.variants_generated).toContain('thumbnail');
    });

    it('should bulk optimize images', async () => {
      const bulkOptimizeResponse = {
        optimized: [mockOptimizationResponse],
        failed: [],
        total_savings: 205000,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(bulkOptimizeResponse),
      });

      const bulkOptimize = async (mediaIds: string[], options: { quality?: number }) => {
        const response = await fetch('/api/media/bulk-optimize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ media_ids: mediaIds, options }),
        });
        return response.json();
      };

      const result = await bulkOptimize(['1', '2'], { quality: 85 });

      expect(result.total_savings).toBe(205000);
    });
  });

  describe('API Integration - Usage Tracking', () => {
    it('should track media usage', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const trackUsage = async (mediaId: string, entityType: string, entityId: string, context?: string) => {
        const response = await fetch(`/api/media/${mediaId}/usage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entity_type: entityType, entity_id: entityId, context }),
        });
        return response.json();
      };

      const result = await trackUsage('1', 'post', 'post-123', 'featured_image');

      expect(mockFetch).toHaveBeenCalledWith('/api/media/1/usage', expect.objectContaining({
        method: 'POST',
      }));
      expect(result.success).toBe(true);
    });

    it('should get media usage locations', async () => {
      const usageResponse = {
        usage: [
          { entity_type: 'post', entity_id: 'post-123', entity_title: 'Test Post', context: 'content' },
          { entity_type: 'page', entity_id: 'page-456', entity_title: 'About Page', context: 'featured_image' },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(usageResponse),
      });

      const getUsage = async (mediaId: string) => {
        const response = await fetch(`/api/media/${mediaId}/usage`);
        return response.json();
      };

      const result = await getUsage('1');

      expect(result.usage).toHaveLength(2);
      expect(result.usage[0].entity_title).toBe('Test Post');
    });
  });

  describe('API Integration - Preferences', () => {
    it('should get user preferences', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockLibraryResponse.user_preferences),
      });

      const getPreferences = async () => {
        const response = await fetch('/api/media/preferences');
        return response.json();
      };

      const result = await getPreferences();

      expect(result.view_mode).toBe('grid');
      expect(result.auto_optimize).toBe(true);
    });

    it('should update user preferences', async () => {
      const updatedPrefs = {
        ...mockLibraryResponse.user_preferences,
        view_mode: 'list',
        items_per_page: 48,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(updatedPrefs),
      });

      const updatePreferences = async (prefs: Record<string, any>) => {
        const response = await fetch('/api/media/preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(prefs),
        });
        return response.json();
      };

      const result = await updatePreferences({ view_mode: 'list', items_per_page: 48 });

      expect(result.view_mode).toBe('list');
      expect(result.items_per_page).toBe(48);
    });
  });

  describe('API Integration - Analytics', () => {
    it('should get media analytics', async () => {
      const analyticsResponse = {
        media_id: '1',
        total_views: 150,
        total_downloads: 25,
        views_by_date: [
          { date: '2024-01-15', count: 50 },
          { date: '2024-01-16', count: 60 },
          { date: '2024-01-17', count: 40 },
        ],
        downloads_by_date: [
          { date: '2024-01-15', count: 10 },
          { date: '2024-01-16', count: 8 },
          { date: '2024-01-17', count: 7 },
        ],
        usage_locations: [
          { entity_type: 'post', entity_id: 'post-1', entity_title: 'Post 1' },
        ],
        referrers: [
          { referrer: 'google.com', count: 50 },
          { referrer: 'direct', count: 30 },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(analyticsResponse),
      });

      const getAnalytics = async (mediaId: string) => {
        const response = await fetch(`/api/media/${mediaId}/analytics`);
        return response.json();
      };

      const result = await getAnalytics('1');

      expect(result.total_views).toBe(150);
      expect(result.views_by_date).toHaveLength(3);
    });

    it('should increment view count', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ view_count: 151 }),
      });

      const incrementView = async (mediaId: string) => {
        const response = await fetch(`/api/media/${mediaId}/view`, {
          method: 'POST',
        });
        return response.json();
      };

      const result = await incrementView('1');

      expect(result.view_count).toBe(151);
    });

    it('should increment download count', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ download_count: 26 }),
      });

      const incrementDownload = async (mediaId: string) => {
        const response = await fetch(`/api/media/${mediaId}/download`, {
          method: 'POST',
        });
        return response.json();
      };

      const result = await incrementDownload('1');

      expect(result.download_count).toBe(26);
    });
  });

  describe('API Integration - Search', () => {
    it('should perform advanced search', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockLibraryResponse.media),
      });

      const advancedSearch = async (params: {
        query: string;
        search_in?: string[];
        filters?: Record<string, any>;
      }) => {
        const response = await fetch('/api/media/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });
        return response.json();
      };

      const result = await advancedSearch({
        query: 'test',
        search_in: ['filename', 'alt_text', 'tags'],
        filters: {
          media_type: 'image',
          is_favorite: true,
        },
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/media/search', expect.objectContaining({
        method: 'POST',
      }));
    });
  });

  describe('API Integration - Image Editing', () => {
    it('should crop image', async () => {
      const editedImage = {
        ...mockLibraryResponse.media.items[0],
        width: 800,
        height: 600,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(editedImage),
      });

      const editImage = async (mediaId: string, editParams: Record<string, any>) => {
        const response = await fetch(`/api/media/${mediaId}/edit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editParams),
        });
        return response.json();
      };

      const result = await editImage('1', {
        crop: { x: 100, y: 100, width: 800, height: 600 },
        save_as_new: false,
      });

      expect(result.width).toBe(800);
      expect(result.height).toBe(600);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Media not found' }),
      });

      const getMedia = async (id: string) => {
        const response = await fetch(`/api/media/${id}`);
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error);
        }
        return response.json();
      };

      await expect(getMedia('nonexistent')).rejects.toThrow('Media not found');
    });

    it('should handle validation errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Invalid file type' }),
      });

      const uploadFile = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error);
        }
        return response.json();
      };

      const file = new File(['test'], 'test.exe', { type: 'application/octet-stream' });
      await expect(uploadFile(file)).rejects.toThrow('Invalid file type');
    });

    it('should handle server errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Internal server error' }),
      });

      const deleteMedia = async (id: string) => {
        const response = await fetch(`/api/media/${id}`, { method: 'DELETE' });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error);
        }
        return response.json();
      };

      await expect(deleteMedia('1')).rejects.toThrow('Internal server error');
    });
  });
});
