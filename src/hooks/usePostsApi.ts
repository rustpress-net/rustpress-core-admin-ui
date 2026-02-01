/**
 * React Query hooks for Posts API
 *
 * Provides easy-to-use hooks for fetching and mutating post data
 * with automatic caching, refetching, and optimistic updates.
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import {
  postsApi,
  categoriesApi,
  tagsApi,
  authorsApi,
  mediaApi,
  templatesApi,
  Post,
  Category,
  Tag,
  Author,
  FeaturedImage,
  CreatePostData,
  UpdatePostData,
  PostListParams,
  PaginatedResponse,
  PostRevision,
  AIImageSuggestion,
} from '../api/postsApi';

// Query Keys
export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (params?: PostListParams) => [...postKeys.lists(), params] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
  revisions: (id: string) => [...postKeys.detail(id), 'revisions'] as const,
};

export const categoryKeys = {
  all: ['categories'] as const,
  list: () => [...categoryKeys.all, 'list'] as const,
  detail: (id: string) => [...categoryKeys.all, 'detail', id] as const,
};

export const tagKeys = {
  all: ['tags'] as const,
  list: () => [...tagKeys.all, 'list'] as const,
  popular: () => [...tagKeys.all, 'popular'] as const,
  search: (query: string) => [...tagKeys.all, 'search', query] as const,
  detail: (id: string) => [...tagKeys.all, 'detail', id] as const,
};

export const authorKeys = {
  all: ['authors'] as const,
  list: () => [...authorKeys.all, 'list'] as const,
  search: (query: string) => [...authorKeys.all, 'search', query] as const,
  current: () => [...authorKeys.all, 'current'] as const,
  detail: (id: string) => [...authorKeys.all, 'detail', id] as const,
};

export const mediaKeys = {
  all: ['media'] as const,
  list: (params?: Record<string, unknown>) => [...mediaKeys.all, 'list', params] as const,
  detail: (id: string) => [...mediaKeys.all, 'detail', id] as const,
  suggestions: (title: string) => [...mediaKeys.all, 'suggestions', title] as const,
};

export const templateKeys = {
  all: ['templates'] as const,
  list: () => [...templateKeys.all, 'list'] as const,
};

// Post Hooks
export function usePosts(params?: PostListParams) {
  return useQuery({
    queryKey: postKeys.list(params),
    queryFn: () => postsApi.list(params),
  });
}

export function usePost(id: string, options?: Omit<UseQueryOptions<Post>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => postsApi.get(id),
    enabled: !!id,
    ...options,
  });
}

export function usePostRevisions(id: string) {
  return useQuery({
    queryKey: postKeys.revisions(id),
    queryFn: () => postsApi.getRevisions(id),
    enabled: !!id,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostData) => postsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePostData }) => postsApi.update(id, data),
    onSuccess: (post) => {
      queryClient.setQueryData(postKeys.detail(post.id), post);
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => postsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

export function useBulkDeletePosts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => postsApi.bulkDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

export function usePublishPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => postsApi.publish(id),
    onSuccess: (post) => {
      queryClient.setQueryData(postKeys.detail(post.id), post);
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

export function useUnpublishPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => postsApi.unpublish(id),
    onSuccess: (post) => {
      queryClient.setQueryData(postKeys.detail(post.id), post);
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

export function useSchedulePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, scheduledAt }: { id: string; scheduledAt: string }) =>
      postsApi.schedule(id, scheduledAt),
    onSuccess: (post) => {
      queryClient.setQueryData(postKeys.detail(post.id), post);
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

export function useDuplicatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => postsApi.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

export function useRestoreRevision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, revisionId }: { postId: string; revisionId: string }) =>
      postsApi.restoreRevision(postId, revisionId),
    onSuccess: (post) => {
      queryClient.setQueryData(postKeys.detail(post.id), post);
      queryClient.invalidateQueries({ queryKey: postKeys.revisions(post.id) });
    },
  });
}

export function useAutosavePost() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePostData }) =>
      postsApi.autosave(id, data),
  });
}

export function useSetFeaturedImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      imageId,
      focalPoint,
    }: {
      postId: string;
      imageId: string;
      focalPoint?: { x: number; y: number };
    }) => postsApi.setFeaturedImage(postId, imageId, focalPoint),
    onSuccess: (post) => {
      queryClient.setQueryData(postKeys.detail(post.id), post);
    },
  });
}

export function useRemoveFeaturedImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => postsApi.removeFeaturedImage(postId),
    onSuccess: (post) => {
      queryClient.setQueryData(postKeys.detail(post.id), post);
    },
  });
}

// Category Hooks
export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: () => categoriesApi.list(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoriesApi.get(id),
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; slug?: string; description?: string; parent_id?: string }) =>
      categoriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.list() });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
      categoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.list() });
    },
  });
}

// Tag Hooks
export function useTags() {
  return useQuery({
    queryKey: tagKeys.list(),
    queryFn: () => tagsApi.list(),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePopularTags(limit?: number) {
  return useQuery({
    queryKey: tagKeys.popular(),
    queryFn: () => tagsApi.getPopular(limit),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSearchTags(query: string) {
  return useQuery({
    queryKey: tagKeys.search(query),
    queryFn: () => tagsApi.search(query),
    enabled: query.length >= 2,
  });
}

export function useTag(id: string) {
  return useQuery({
    queryKey: tagKeys.detail(id),
    queryFn: () => tagsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; slug?: string; description?: string }) =>
      tagsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Tag> }) => tagsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tagsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.list() });
    },
  });
}

// Author Hooks
export function useAuthors(params?: { role?: string; search?: string }) {
  return useQuery({
    queryKey: authorKeys.list(),
    queryFn: () => authorsApi.list(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useSearchAuthors(query: string) {
  return useQuery({
    queryKey: authorKeys.search(query),
    queryFn: () => authorsApi.search(query),
    enabled: query.length >= 2,
  });
}

export function useCurrentAuthor() {
  return useQuery({
    queryKey: authorKeys.current(),
    queryFn: () => authorsApi.getCurrent(),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useAuthor(id: string) {
  return useQuery({
    queryKey: authorKeys.detail(id),
    queryFn: () => authorsApi.get(id),
    enabled: !!id,
  });
}

// Media Hooks
export function useMedia(params?: { page?: number; per_page?: number; media_type?: string; search?: string }) {
  return useQuery({
    queryKey: mediaKeys.list(params),
    queryFn: () => mediaApi.list(params),
  });
}

export function useMediaItem(id: string) {
  return useQuery({
    queryKey: mediaKeys.detail(id),
    queryFn: () => mediaApi.get(id),
    enabled: !!id,
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      options,
    }: {
      file: File;
      options?: { alt_text?: string; title?: string; description?: string };
    }) => mediaApi.upload(file, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
    },
  });
}

export function useUploadMediaFromUrl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ url, options }: { url: string; options?: { alt_text?: string; title?: string } }) =>
      mediaApi.uploadFromUrl(url, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
    },
  });
}

export function useUpdateMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { alt_text?: string; caption?: string; credit?: string };
    }) => mediaApi.update(id, data),
    onSuccess: (media) => {
      queryClient.setQueryData(mediaKeys.detail(media.id), media);
      queryClient.invalidateQueries({ queryKey: mediaKeys.list() });
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mediaApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
    },
  });
}

// AI Hooks
export function useImageSuggestions(title: string, content?: string) {
  return useQuery({
    queryKey: mediaKeys.suggestions(title),
    queryFn: () => mediaApi.suggestImages(title, content),
    enabled: title.length >= 5,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useGenerateAltText() {
  return useMutation({
    mutationFn: (imageUrl: string) => mediaApi.generateAltText(imageUrl),
  });
}

// Template Hooks
export function useTemplates() {
  return useQuery({
    queryKey: templateKeys.list(),
    queryFn: () => templatesApi.list(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Export all hooks
export default {
  // Posts
  usePosts,
  usePost,
  usePostRevisions,
  useCreatePost,
  useUpdatePost,
  useDeletePost,
  useBulkDeletePosts,
  usePublishPost,
  useUnpublishPost,
  useSchedulePost,
  useDuplicatePost,
  useRestoreRevision,
  useAutosavePost,
  useSetFeaturedImage,
  useRemoveFeaturedImage,
  // Categories
  useCategories,
  useCategory,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  // Tags
  useTags,
  usePopularTags,
  useSearchTags,
  useTag,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
  // Authors
  useAuthors,
  useSearchAuthors,
  useCurrentAuthor,
  useAuthor,
  // Media
  useMedia,
  useMediaItem,
  useUploadMedia,
  useUploadMediaFromUrl,
  useUpdateMedia,
  useDeleteMedia,
  // AI
  useImageSuggestions,
  useGenerateAltText,
  // Templates
  useTemplates,
};
