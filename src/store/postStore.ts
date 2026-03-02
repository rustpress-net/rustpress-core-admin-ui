/**
 * RustPress Post Store
 * Manages posts list, editor state, filters, and CRUD operations
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { postsApi } from '../api/client';
import type { PostEditorData, PostListItem, PostFilters, PostSEOData } from '../types/post';
import { DEFAULT_POST, DEFAULT_FILTERS, DEFAULT_SEO } from '../types/post';
import toast from 'react-hot-toast';

// ---------- Mock Data ----------

const MOCK_POSTS: PostListItem[] = [
  { id: '1', title: 'Getting Started with RustPress', slug: 'getting-started-with-rustpress', status: 'published', author_name: 'Admin', categories: ['Tutorials', 'Getting Started'], created_at: '2024-12-20T10:00:00Z', updated_at: '2024-12-20T10:00:00Z' },
  { id: '2', title: 'Building Your First Theme', slug: 'building-your-first-theme', status: 'draft', author_name: 'Admin', categories: ['Themes', 'Tutorials'], created_at: '2024-12-19T08:30:00Z', updated_at: '2024-12-19T14:15:00Z' },
  { id: '3', title: 'Plugin Development Guide', slug: 'plugin-development-guide', status: 'published', author_name: 'Admin', categories: ['Plugins', 'Development'], created_at: '2024-12-18T12:00:00Z', updated_at: '2024-12-18T12:00:00Z' },
  { id: '4', title: 'SEO Best Practices for RustPress', slug: 'seo-best-practices', status: 'scheduled', author_name: 'Editor', categories: ['SEO'], created_at: '2024-12-17T09:00:00Z', updated_at: '2024-12-22T16:00:00Z' },
  { id: '5', title: 'Performance Optimization Tips', slug: 'performance-optimization-tips', status: 'published', author_name: 'Admin', categories: ['Performance'], created_at: '2024-12-15T11:00:00Z', updated_at: '2024-12-15T11:00:00Z' },
  { id: '6', title: 'Deploying RustPress to Production', slug: 'deploying-rustpress-production', status: 'published', author_name: 'DevOps', categories: ['Deployment', 'Tutorials'], created_at: '2024-12-14T07:00:00Z', updated_at: '2024-12-14T07:00:00Z' },
  { id: '7', title: 'Custom Block Development', slug: 'custom-block-development', status: 'draft', author_name: 'Admin', categories: ['Development', 'Blocks'], created_at: '2024-12-13T15:00:00Z', updated_at: '2024-12-21T10:30:00Z' },
  { id: '8', title: 'Media Management Guide', slug: 'media-management-guide', status: 'pending', author_name: 'Author', categories: ['Tutorials'], created_at: '2024-12-12T13:00:00Z', updated_at: '2024-12-20T09:00:00Z' },
  { id: '9', title: 'Accessibility in RustPress', slug: 'accessibility-rustpress', status: 'published', author_name: 'Admin', categories: ['Accessibility'], created_at: '2024-12-10T10:00:00Z', updated_at: '2024-12-10T10:00:00Z' },
  { id: '10', title: 'RustPress vs WordPress: A Comparison', slug: 'rustpress-vs-wordpress', status: 'draft', author_name: 'Editor', categories: ['Comparisons'], created_at: '2024-12-08T08:00:00Z', updated_at: '2024-12-19T17:00:00Z' },
];

const MOCK_FULL_POSTS: Record<string, PostEditorData> = {
  '1': { ...DEFAULT_POST, id: '1', title: 'Getting Started with RustPress', slug: 'getting-started-with-rustpress', content: '<h1>Getting Started with RustPress</h1>\n<p>Welcome to RustPress! This guide will walk you through setting up your first site.</p>', excerpt: 'A beginner-friendly guide to RustPress.', status: 'published', categories: ['Tutorials', 'Getting Started'], tags: ['beginner', 'setup', 'guide'], author_name: 'Admin', seo: { meta_title: 'Getting Started with RustPress', meta_description: 'Learn how to set up your first RustPress site.', focus_keyword: 'rustpress getting started' }, created_at: '2024-12-20T10:00:00Z', updated_at: '2024-12-20T10:00:00Z' },
  '2': { ...DEFAULT_POST, id: '2', title: 'Building Your First Theme', slug: 'building-your-first-theme', content: '<h1>Building Your First Theme</h1>\n<p>Themes in RustPress are powerful and easy to create.</p>', excerpt: 'Learn to build custom themes.', status: 'draft', categories: ['Themes', 'Tutorials'], tags: ['themes', 'customization'], author_name: 'Admin', created_at: '2024-12-19T08:30:00Z', updated_at: '2024-12-19T14:15:00Z' },
  '3': { ...DEFAULT_POST, id: '3', title: 'Plugin Development Guide', slug: 'plugin-development-guide', content: '<h1>Plugin Development Guide</h1>\n<p>Extend RustPress with custom plugins.</p>', excerpt: 'Comprehensive plugin development guide.', status: 'published', categories: ['Plugins', 'Development'], tags: ['plugins', 'development', 'api'], author_name: 'Admin', created_at: '2024-12-18T12:00:00Z', updated_at: '2024-12-18T12:00:00Z' },
};

const AVAILABLE_CATEGORIES = [
  'Tutorials', 'Getting Started', 'Themes', 'Plugins', 'Development',
  'SEO', 'Performance', 'Deployment', 'Blocks', 'Accessibility',
];

const AVAILABLE_TAGS = [
  'beginner', 'advanced', 'setup', 'guide', 'themes', 'plugins',
  'customization', 'api', 'deployment', 'performance',
];

// ---------- Store Types ----------

interface PostStore {
  // List state
  posts: PostListItem[];
  filters: PostFilters;
  isLoading: boolean;
  selectedIds: string[];

  // Editor state
  currentPost: PostEditorData;
  originalPost: PostEditorData;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;

  // Reference data
  availableCategories: string[];
  availableTags: string[];

  // List actions
  fetchPosts: () => Promise<void>;
  setFilters: (partial: Partial<PostFilters>) => void;
  setSelectedIds: (ids: string[]) => void;
  deletePost: (id: string) => void;
  bulkAction: (action: 'delete' | 'draft' | 'publish', ids: string[]) => void;

  // Editor actions
  initNewPost: () => void;
  loadPost: (id: string) => Promise<void>;
  updateField: <K extends keyof PostEditorData>(field: K, value: PostEditorData[K]) => void;
  updateSEOField: <K extends keyof PostSEOData>(field: K, value: PostSEOData[K]) => void;
  saveDraft: () => Promise<void>;
  publish: () => Promise<void>;
  generateSlug: (title: string) => string;
}

// ---------- Helpers ----------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// ---------- Store ----------

export const usePostStore = create<PostStore>()(
  persist(
    (set, get) => ({
      // Initial state
      posts: [],
      filters: { ...DEFAULT_FILTERS },
      isLoading: false,
      selectedIds: [],
      currentPost: { ...DEFAULT_POST },
      originalPost: { ...DEFAULT_POST },
      isDirty: false,
      isSaving: false,
      lastSaved: null,
      availableCategories: AVAILABLE_CATEGORIES,
      availableTags: AVAILABLE_TAGS,

      // ---------- List Actions ----------

      fetchPosts: async () => {
        set({ isLoading: true });
        try {
          const res = await postsApi.getAll();
          const posts: PostListItem[] = res.data.map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            status: p.status as PostListItem['status'],
            author_name: p.author_name || 'Admin',
            categories: p.categories || [],
            created_at: p.created_at,
            updated_at: p.updated_at,
          }));
          set({ posts, isLoading: false });
        } catch {
          // Fallback to mock data
          set({ posts: MOCK_POSTS, isLoading: false });
        }
      },

      setFilters: (partial) => {
        set((s) => ({ filters: { ...s.filters, ...partial } }));
      },

      setSelectedIds: (ids) => set({ selectedIds: ids }),

      deletePost: (id) => {
        set((s) => ({
          posts: s.posts.filter((p) => p.id !== id),
          selectedIds: s.selectedIds.filter((sid) => sid !== id),
        }));
        postsApi.delete(id).catch(() => {});
        toast.success('Post deleted');
      },

      bulkAction: (action, ids) => {
        set((s) => {
          let posts = s.posts;
          if (action === 'delete') {
            posts = posts.filter((p) => !ids.includes(p.id));
          } else {
            const status = action === 'publish' ? 'published' : 'draft';
            posts = posts.map((p) => (ids.includes(p.id) ? { ...p, status: status as PostListItem['status'] } : p));
          }
          return { posts, selectedIds: [] };
        });
        toast.success(`${ids.length} post(s) updated`);
      },

      // ---------- Editor Actions ----------

      initNewPost: () => {
        const fresh = { ...DEFAULT_POST, seo: { ...DEFAULT_SEO }, id: '', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        set({ currentPost: fresh, originalPost: { ...fresh }, isDirty: false, lastSaved: null });
      },

      loadPost: async (id) => {
        set({ isLoading: true });
        try {
          const res = await postsApi.getById(id);
          const p = res.data;
          const post: PostEditorData = {
            id: p.id,
            title: p.title,
            slug: p.slug,
            content: p.content,
            excerpt: p.excerpt || '',
            status: p.status as PostEditorData['status'],
            visibility: (p.visibility as PostEditorData['visibility']) || 'public',
            password: p.password || '',
            categories: p.categories || [],
            tags: p.tags || [],
            featured_image: p.featured_image || '',
            featured_image_alt: p.featured_image_alt || '',
            seo: {
              meta_title: p.seo_title || '',
              meta_description: p.seo_description || '',
              focus_keyword: p.focus_keyword || '',
            },
            author_id: p.author_id,
            author_name: p.author_name || 'Admin',
            scheduled_at: p.scheduled_at || '',
            created_at: p.created_at,
            updated_at: p.updated_at,
          };
          set({ currentPost: post, originalPost: { ...post }, isDirty: false, isLoading: false });
        } catch {
          // Fallback to mock data
          const mock = MOCK_FULL_POSTS[id];
          if (mock) {
            set({ currentPost: { ...mock }, originalPost: { ...mock }, isDirty: false, isLoading: false });
          } else {
            // Create a stub from list data
            const listItem = get().posts.find((p) => p.id === id);
            const stub: PostEditorData = {
              ...DEFAULT_POST,
              seo: { ...DEFAULT_SEO },
              id,
              title: listItem?.title || '',
              slug: listItem?.slug || '',
              status: (listItem?.status as PostEditorData['status']) || 'draft',
              categories: listItem?.categories || [],
              author_name: listItem?.author_name || 'Admin',
            };
            set({ currentPost: stub, originalPost: { ...stub }, isDirty: false, isLoading: false });
          }
        }
      },

      updateField: (field, value) => {
        set((s) => ({
          currentPost: { ...s.currentPost, [field]: value },
          isDirty: true,
        }));
      },

      updateSEOField: (field, value) => {
        set((s) => ({
          currentPost: {
            ...s.currentPost,
            seo: { ...s.currentPost.seo, [field]: value },
          },
          isDirty: true,
        }));
      },

      saveDraft: async () => {
        const { currentPost } = get();
        set({ isSaving: true });
        const post = { ...currentPost, status: 'draft' as const };
        try {
          if (post.id) {
            await postsApi.update(post.id, post);
          } else {
            const res = await postsApi.create(post);
            post.id = res.data.id;
          }
          set({ currentPost: post, originalPost: { ...post }, isDirty: false, isSaving: false, lastSaved: new Date() });
          toast.success('Draft saved');
        } catch {
          // Fallback: save locally
          set({ currentPost: post, originalPost: { ...post }, isDirty: false, isSaving: false, lastSaved: new Date() });
          toast.success('Draft saved locally');
        }
      },

      publish: async () => {
        const { currentPost } = get();
        set({ isSaving: true });
        const post = { ...currentPost, status: 'published' as const };
        try {
          if (post.id) {
            await postsApi.update(post.id, post);
          } else {
            const res = await postsApi.create(post);
            post.id = res.data.id;
          }
          set({ currentPost: post, originalPost: { ...post }, isDirty: false, isSaving: false, lastSaved: new Date() });
          toast.success('Post published!');
        } catch {
          set({ currentPost: post, originalPost: { ...post }, isDirty: false, isSaving: false, lastSaved: new Date() });
          toast.success('Post published locally');
        }
      },

      generateSlug: (title) => slugify(title),
    }),
    {
      name: 'rustpress-post-store',
      partialize: (state) => ({
        posts: state.posts,
        availableCategories: state.availableCategories,
        availableTags: state.availableTags,
      }),
    }
  )
);

// ---------- Derived Selectors ----------

export const useFilteredPosts = () => {
  const posts = usePostStore((s) => s.posts);
  const filters = usePostStore((s) => s.filters);

  return posts.filter((post) => {
    if (filters.status !== 'all' && post.status !== filters.status) return false;
    if (filters.category && !post.categories.includes(filters.category)) return false;
    if (filters.author && post.author_name !== filters.author) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      return post.title.toLowerCase().includes(q) || post.slug.toLowerCase().includes(q);
    }
    return true;
  });
};
