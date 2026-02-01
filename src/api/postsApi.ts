/**
 * Posts API Service
 *
 * Comprehensive API service for post management including
 * featured images, metadata, categories, tags, and more.
 */

import { apiClient } from './client';

// Types
export interface Author {
  id: string;
  username: string;
  email: string;
  display_name: string;
  avatar?: string;
  role: string;
  bio?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  count: number;
  children?: Category[];
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  count: number;
}

export interface FeaturedImage {
  id: string;
  url: string;
  alt_text?: string;
  caption?: string;
  focal_point?: { x: number; y: number };
  credit?: string;
  sizes?: {
    thumbnail?: string;
    medium?: string;
    large?: string;
    og_image?: string;
    twitter_card?: string;
  };
  width?: number;
  height?: number;
}

export interface PostMeta {
  seo_title?: string;
  seo_description?: string;
  focus_keyword?: string;
  canonical_url?: string;
  robots?: string;
  schema_markup?: Record<string, unknown>;
  custom_fields?: Record<string, string>;
}

export interface PostRevision {
  id: string;
  post_id: string;
  title: string;
  content: string;
  author_id: string;
  author_name: string;
  created_at: string;
  changes_summary?: string;
}

export type PostStatus = 'draft' | 'pending' | 'published' | 'scheduled' | 'private' | 'trash';
export type PostFormat = 'standard' | 'aside' | 'gallery' | 'link' | 'image' | 'quote' | 'status' | 'video' | 'audio' | 'chat';
export type PostVisibility = 'public' | 'private' | 'password';

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: PostStatus;
  visibility: PostVisibility;
  password?: string;
  author: Author;
  co_authors?: Author[];
  featured_image?: FeaturedImage;
  categories: Category[];
  tags: Tag[];
  format: PostFormat;
  template?: string;
  allow_comments: boolean;
  allow_pingbacks: boolean;
  sticky: boolean;
  published_at?: string;
  scheduled_at?: string;
  created_at: string;
  updated_at: string;
  meta?: PostMeta;
  word_count?: number;
  reading_time?: number;
}

export interface CreatePostData {
  title: string;
  content: string;
  slug?: string;
  excerpt?: string;
  status?: PostStatus;
  visibility?: PostVisibility;
  password?: string;
  author_id?: string;
  co_author_ids?: string[];
  featured_image_id?: string;
  featured_image_focal_point?: { x: number; y: number };
  category_ids?: string[];
  tag_ids?: string[];
  format?: PostFormat;
  template?: string;
  allow_comments?: boolean;
  allow_pingbacks?: boolean;
  sticky?: boolean;
  scheduled_at?: string;
  meta?: PostMeta;
}

export interface UpdatePostData extends Partial<CreatePostData> {}

export interface PostListParams {
  page?: number;
  per_page?: number;
  status?: PostStatus | PostStatus[];
  author_id?: string;
  category_id?: string;
  tag_id?: string;
  search?: string;
  sort_by?: 'title' | 'created_at' | 'updated_at' | 'published_at';
  sort_order?: 'asc' | 'desc';
  format?: PostFormat;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface AIImageSuggestion {
  url: string;
  title: string;
  source: string;
  license?: string;
}

// API functions
export const postsApi = {
  // Post CRUD
  list: async (params?: PostListParams): Promise<PaginatedResponse<Post>> => {
    const response = await apiClient.get('/v1/posts', { params });
    return response.data;
  },

  get: async (id: string): Promise<Post> => {
    const response = await apiClient.get(`/v1/posts/${id}`);
    return response.data;
  },

  create: async (data: CreatePostData): Promise<Post> => {
    const response = await apiClient.post('/v1/posts', data);
    return response.data;
  },

  update: async (id: string, data: UpdatePostData): Promise<Post> => {
    const response = await apiClient.put(`/v1/posts/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/v1/posts/${id}`);
  },

  bulkDelete: async (ids: string[]): Promise<void> => {
    await apiClient.post('/v1/posts/bulk-delete', { ids });
  },

  // Publishing
  publish: async (id: string): Promise<Post> => {
    const response = await apiClient.post(`/v1/posts/${id}/publish`);
    return response.data;
  },

  unpublish: async (id: string): Promise<Post> => {
    const response = await apiClient.post(`/v1/posts/${id}/unpublish`);
    return response.data;
  },

  schedule: async (id: string, scheduledAt: string): Promise<Post> => {
    const response = await apiClient.post(`/v1/posts/${id}/schedule`, { scheduled_at: scheduledAt });
    return response.data;
  },

  duplicate: async (id: string): Promise<Post> => {
    const response = await apiClient.post(`/v1/posts/${id}/duplicate`);
    return response.data;
  },

  // Revisions
  getRevisions: async (id: string): Promise<PostRevision[]> => {
    const response = await apiClient.get(`/v1/posts/${id}/revisions`);
    return response.data;
  },

  restoreRevision: async (postId: string, revisionId: string): Promise<Post> => {
    const response = await apiClient.post(`/v1/posts/${postId}/revisions/${revisionId}/restore`);
    return response.data;
  },

  // Autosave
  autosave: async (id: string, data: UpdatePostData): Promise<{ saved_at: string }> => {
    const response = await apiClient.post(`/v1/posts/${id}/autosave`, data);
    return response.data;
  },

  // Featured Image
  setFeaturedImage: async (postId: string, imageId: string, focalPoint?: { x: number; y: number }): Promise<Post> => {
    const response = await apiClient.put(`/v1/posts/${postId}/featured-image`, {
      image_id: imageId,
      focal_point: focalPoint,
    });
    return response.data;
  },

  removeFeaturedImage: async (postId: string): Promise<Post> => {
    const response = await apiClient.delete(`/v1/posts/${postId}/featured-image`);
    return response.data;
  },
};

// Categories API
export const categoriesApi = {
  list: async (): Promise<Category[]> => {
    const response = await apiClient.get('/v1/categories');
    return response.data;
  },

  get: async (id: string): Promise<Category> => {
    const response = await apiClient.get(`/v1/categories/${id}`);
    return response.data;
  },

  create: async (data: { name: string; slug?: string; description?: string; parent_id?: string }): Promise<Category> => {
    const response = await apiClient.post('/v1/categories', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Category>): Promise<Category> => {
    const response = await apiClient.put(`/v1/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/v1/categories/${id}`);
  },
};

// Tags API
export const tagsApi = {
  list: async (): Promise<Tag[]> => {
    const response = await apiClient.get('/v1/tags');
    return response.data;
  },

  get: async (id: string): Promise<Tag> => {
    const response = await apiClient.get(`/v1/tags/${id}`);
    return response.data;
  },

  create: async (data: { name: string; slug?: string; description?: string }): Promise<Tag> => {
    const response = await apiClient.post('/v1/tags', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Tag>): Promise<Tag> => {
    const response = await apiClient.put(`/v1/tags/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/v1/tags/${id}`);
  },

  getPopular: async (limit?: number): Promise<Tag[]> => {
    const response = await apiClient.get('/v1/tags/popular', { params: { limit } });
    return response.data;
  },

  search: async (query: string): Promise<Tag[]> => {
    const response = await apiClient.get('/v1/tags/search', { params: { q: query } });
    return response.data;
  },
};

// Authors/Users API
export const authorsApi = {
  list: async (params?: { role?: string; search?: string }): Promise<Author[]> => {
    const response = await apiClient.get('/v1/users', { params: { ...params, role: params?.role || 'author,editor,administrator' } });
    return response.data;
  },

  get: async (id: string): Promise<Author> => {
    const response = await apiClient.get(`/v1/users/${id}`);
    return response.data;
  },

  search: async (query: string): Promise<Author[]> => {
    const response = await apiClient.get('/v1/users', { params: { search: query } });
    return response.data;
  },

  getCurrent: async (): Promise<Author> => {
    const response = await apiClient.get('/v1/users/me');
    return response.data;
  },
};

// Media API extensions for featured images
export const mediaApi = {
  list: async (params?: {
    page?: number;
    per_page?: number;
    media_type?: string;
    search?: string;
  }): Promise<PaginatedResponse<FeaturedImage>> => {
    const response = await apiClient.get('/v1/media', { params });
    return response.data;
  },

  get: async (id: string): Promise<FeaturedImage> => {
    const response = await apiClient.get(`/v1/media/${id}`);
    return response.data;
  },

  upload: async (
    file: File,
    options?: { alt_text?: string; title?: string; description?: string }
  ): Promise<FeaturedImage> => {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.alt_text) formData.append('alt_text', options.alt_text);
    if (options?.title) formData.append('title', options.title);
    if (options?.description) formData.append('description', options.description);

    const response = await apiClient.post('/v1/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  uploadFromUrl: async (url: string, options?: { alt_text?: string; title?: string }): Promise<FeaturedImage> => {
    const response = await apiClient.post('/v1/media/from-url', { url, ...options });
    return response.data;
  },

  update: async (id: string, data: { alt_text?: string; caption?: string; credit?: string }): Promise<FeaturedImage> => {
    const response = await apiClient.put(`/v1/media/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/v1/media/${id}`);
  },

  // AI Suggestions
  suggestImages: async (title: string, content?: string): Promise<AIImageSuggestion[]> => {
    const response = await apiClient.post('/v1/ai/suggest-images', { title, content });
    return response.data;
  },

  generateAltText: async (imageUrl: string): Promise<{ alt_text: string }> => {
    const response = await apiClient.post('/v1/ai/generate-alt-text', { image_url: imageUrl });
    return response.data;
  },
};

// Templates API
export const templatesApi = {
  list: async (): Promise<{ id: string; name: string; description?: string }[]> => {
    const response = await apiClient.get('/v1/templates');
    return response.data;
  },
};

export default {
  posts: postsApi,
  categories: categoriesApi,
  tags: tagsApi,
  authors: authorsApi,
  media: mediaApi,
  templates: templatesApi,
};
