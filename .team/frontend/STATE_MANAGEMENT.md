# RustPress Admin UI - State Management Audit

> Generated: 2026-03-02 | Wave 2 Frontend Engineering | Research & Planning
> Source: `C:\Users\Software Engineering\Desktop\rustpress-core-admin-ui`

---

## 1. Zustand Store Inventory

All stores are in `src/store/`. Total: **14 store files**.

---

### 1.1 `postStore.ts` -- Post Management

| Property | Detail |
|----------|--------|
| **File** | `src/store/postStore.ts` (308 lines) |
| **Hook** | `usePostStore`, `useFilteredPosts` |
| **Persistence** | `rustpress-post-store` (posts, categories, tags) |
| **Data Source** | **Hybrid** -- calls `postsApi` first, falls back to `MOCK_POSTS` on error |
| **Mock Data** | 10 `MOCK_POSTS` list items + 3 `MOCK_FULL_POSTS` with content |
| **API Integration** | `postsApi.getAll()`, `postsApi.getById()`, `postsApi.create()`, `postsApi.update()`, `postsApi.delete()` |
| **Manages** | Post list, filters (status/category/author/search), editor state, categories/tags, save/publish |
| **Issues** | 1. Falls back to mock on any API error (should distinguish network vs 404). 2. `availableCategories` and `availableTags` are hardcoded arrays, not fetched from API. 3. `deletePost` fires API call but does not handle failure (optimistic delete without rollback). 4. `bulkAction` is purely local (no API call for bulk operations). |
| **Migration Needed** | Remove mock fallback. Fetch categories/tags from `taxonomiesApi`. Add bulk API operations. Add pagination support. |

---

### 1.2 `dashboardStore.ts` -- Dashboard Widgets & Metrics

| Property | Detail |
|----------|--------|
| **File** | `src/store/dashboardStore.ts` (370 lines) |
| **Hook** | `useDashboardStore`, `useActiveLayout`, `useVisibleWidgets` |
| **Persistence** | `rustpress-dashboard` (layouts, activeLayoutId only) |
| **Data Source** | **100% Mock** -- `Math.random()` generators, hardcoded sample data |
| **Mock Data** | `generateSampleMetrics()`, `generateSampleSparkline()`, `sampleUptimeStatus`, `sampleScheduledPosts` (4 items), `sampleActivityEvents` (5 items), `generateHeatmapData()`, hardcoded `statsComparison` |
| **API Integration** | **NONE** -- zero API calls |
| **Manages** | Widget layout (11 default widgets), system metrics, uptime, scheduled posts, activity events, heatmap, sparklines, stats comparison |
| **Issues** | 1. ALL data is randomly generated on store creation. 2. No API endpoints defined for dashboard data. 3. Layout management is well-designed but data layer is entirely fake. |
| **Migration Needed** | Create `dashboardApi` with endpoints: `/api/v1/dashboard/stats`, `/api/v1/dashboard/activity`, `/api/v1/dashboard/scheduled-posts`, `/api/v1/system/health`. Connect to real system metrics. |

---

### 1.3 `pluginStore.ts` -- Plugin Management

| Property | Detail |
|----------|--------|
| **File** | `src/store/pluginStore.ts` (255 lines) |
| **Hook** | `usePluginStore` |
| **Persistence** | `rustpress-plugins` (entire state) |
| **Data Source** | **100% Mock** -- 7 hardcoded `defaultPlugins` |
| **Mock Data** | visual-queue-manager, rust-users, rust-analytics, rust-multilang, rust-commerce, seo-optimizer, contact-form-pro |
| **API Integration** | **NONE** -- all CRUD operations are local state mutations only |
| **Manages** | Plugin install/uninstall, activate/deactivate, settings, menu visibility |
| **Issues** | 1. No API calls at all. 2. Install/uninstall only modifies local state. 3. Plugin discovery from backend filesystem not implemented. |
| **Migration Needed** | Create `pluginsApi`. Fetch installed plugins from backend. Plugin activate/deactivate must call backend hooks. Settings save to backend. |

---

### 1.4 `navigationStore.ts` -- UI Navigation State

| Property | Detail |
|----------|--------|
| **File** | `src/store/navigationStore.ts` (195 lines) |
| **Hook** | `useNavigationStore` |
| **Persistence** | `rustpress-navigation` (recentlyVisited, favorites, collapsedGroups) |
| **Data Source** | **Client-only** -- stores UI preferences only |
| **API Integration** | Not needed (UI state only) |
| **Manages** | Recently visited pages, favorites, sidebar collapsed groups, command palette open/close, keyboard shortcuts panel, sidebar search |
| **Issues** | None -- this is correctly client-only UI state. |
| **Migration Needed** | None. This store is correctly implemented as client-side UI state. |

---

### 1.5 `analyticsStore.ts` -- Google Analytics

| Property | Detail |
|----------|--------|
| **File** | `src/store/analyticsStore.ts` (578 lines) |
| **Hook** | `useAnalyticsStore` + 6 selectors |
| **Persistence** | `rustpress-analytics-store` (dateRange, compareEnabled, activeTab only) |
| **Data Source** | **Real API** -- calls `analyticsApi.*` service methods |
| **Mock Data** | None -- relies on API responses |
| **API Integration** | Full -- overview, realtime, traffic, sources, pages, geo, channels, audience, acquisition, behavior, conversions, ecommerce, settings, reports, sync, cache |
| **Manages** | Complete analytics data lifecycle with caching (5-min staleness check) |
| **Issues** | 1. `error` typing uses `(error as Error).message` cast. 2. No retry logic on transient failures. 3. Uses both `devtools` and `persist` middleware (correct but increases bundle). |
| **Migration Needed** | Minimal -- already well-integrated. Verify backend analytics endpoints match. |

---

### 1.6 `appStore.ts` -- App Marketplace

| Property | Detail |
|----------|--------|
| **File** | `src/store/appStore.ts` (567 lines) |
| **Hook** | `useAppStore` |
| **Persistence** | `rustpress-apps` (entire state) |
| **Data Source** | **100% Mock** -- 3 `defaultApps` + 6 `demoStoreApps` + 2 `defaultUserAccess` entries |
| **Mock Data** | task-manager, notes, calendar (installed); project-tracker, email-campaigns, POS, backup-manager, workflow-automation, file-manager-pro (store) |
| **API Integration** | **NONE** -- all operations local |
| **Manages** | App install/uninstall, activate/deactivate, launch, site mode settings, user app access, config, stats, notifications |
| **Issues** | 1. No backend integration. 2. App discovery is hardcoded. 3. Stats recording is local. |
| **Migration Needed** | Create `appsApi`. This is a P2 feature (not blocking v1.0). |

---

### 1.7 `chatStore.ts` -- Real-Time Chat

| Property | Detail |
|----------|--------|
| **File** | `src/store/chatStore.ts` (514 lines) |
| **Hook** | `useChatStore` |
| **Persistence** | `rustpress-chat` (isOpen only) |
| **Data Source** | **Real API + WebSocket** -- `chatApi` for REST, `websocketService` for real-time |
| **Mock Data** | None |
| **API Integration** | Full -- conversations, messages, reactions, stars, pins, typing indicators, tags, reminders |
| **Manages** | Chat conversations, messages (via WebSocket), typing users, unread counts |
| **Issues** | 1. `Map` type not serializable (persistence correctly excludes message data). 2. Complex `handleMessage` switch handles 12+ event types. 3. Error handling is console.error only. |
| **Migration Needed** | Minimal -- already integrated with backend WebSocket. Verify backend chat endpoints exist. |

---

### 1.8 `collaborationStore.ts` -- Real-Time Collaboration

| Property | Detail |
|----------|--------|
| **File** | `src/store/collaborationStore.ts` (257 lines) |
| **Hook** | `useCollaborationStore` |
| **Persistence** | **None** (no persist middleware) |
| **Data Source** | **Real WebSocket** -- `websocketService` for all events |
| **Mock Data** | None |
| **API Integration** | Full via WebSocket -- presence, file collaboration, cursors, selections |
| **Manages** | Connection state, online users, file collaborators, remote cursors, remote selections |
| **Issues** | 1. Uses `Map` type (correct for non-persisted data). 2. Color assignment for collaborators comes from server. |
| **Migration Needed** | Minimal -- already integrated. Verify backend WebSocket protocol. |

---

### 1.9 `databaseStore.ts` -- Database Management

| Property | Detail |
|----------|--------|
| **File** | `src/store/databaseStore.ts` (299 lines) |
| **Hook** | `useDatabaseStore` |
| **Persistence** | `database-manager-storage` (readOnlyMode, showSystemTables, pageSize, editorTheme, savedQueries, queryHistory) |
| **Data Source** | **Real API** -- calls `databaseApi.*` from `api/client.ts` |
| **Mock Data** | None |
| **API Integration** | Full -- status, stats, tables, columns, query execution, saved queries, history |
| **Manages** | DB connection status, table browser, SQL execution, query history, saved queries |
| **Issues** | 1. Uses `error: any` type. 2. `deleteSavedQuery` is local-only (API endpoint missing). 3. Read-only mode enforced client-side only. |
| **Migration Needed** | Fix URL prefix. Add `deleteSavedQuery` backend endpoint. Server-side read-only enforcement. |

---

### 1.10 `storageStore.ts` -- Cloud Storage Configuration

| Property | Detail |
|----------|--------|
| **File** | `src/store/storageStore.ts` (516 lines) |
| **Hook** | `useStorageStore` |
| **Persistence** | `rustpress-storage` (entire state) |
| **Data Source** | **100% Mock** -- single default `local` provider, 10 provider definitions, 10 API service definitions |
| **Mock Data** | Provider definitions for S3, GCS, Azure, DO Spaces, Cloudflare R2, Backblaze, Wasabi, MinIO, Linode |
| **API Integration** | **NONE** -- `testProviderConnection` is a `setTimeout` with `Math.random()` |
| **Manages** | Storage provider config, API keys for 3rd party services |
| **Issues** | 1. Connection test is fake. 2. API keys stored in localStorage (security issue). 3. No backend persistence. |
| **Migration Needed** | Create `storageApi`. Never store API keys in localStorage. Backend should manage credentials. |

---

### 1.11 `themeEditorStore.ts` -- Theme Editor

| Property | Detail |
|----------|--------|
| **File** | `src/store/themeEditorStore.ts` (532 lines) |
| **Hook** | `useThemeEditorStore` |
| **Persistence** | `rustpress-theme-editor` (editorMode, gitBranch only) |
| **Data Source** | **Hybrid** -- tries API first, falls back to embedded theme data + localStorage |
| **Mock Data** | Embedded theme data via `getEmbeddedThemeData()` |
| **API Integration** | Partial -- `fetch('/api/v1/themes/:slug')`, `PUT /api/v1/themes/:slug`, `POST /api/v1/themes/:slug/commit` |
| **Manages** | Theme manifest (colors, fonts, features, animations), assets (CSS/JS), templates, partials, layouts, git state, undo/redo history |
| **Issues** | 1. Uses raw `fetch` instead of Axios `apiClient`. 2. Auth token not included in requests. 3. Git operations (push, switchBranch) are no-ops. 4. `pullChanges` just reloads theme. |
| **Migration Needed** | Migrate to `apiClient`. Add auth headers. Implement git operations via backend. |

---

### 1.12 `tableStore.ts` -- Table UI State

| Property | Detail |
|----------|--------|
| **File** | `src/store/tableStore.ts` (510 lines) |
| **Hook** | `useTableStore` |
| **Persistence** | `rustpress-table` (views, columnVisibility, columnWidths, columnOrder) |
| **Data Source** | **Client-only** -- manages UI state for data tables |
| **API Integration** | Not needed (UI state for table components) |
| **Manages** | Saved views, column visibility/widths/order per table, filters, inline editing |
| **Issues** | None -- correctly client-only. Includes utility functions `evaluateFilter`, `evaluateFilterGroup`, `applyFilters`. |
| **Migration Needed** | None. Correctly implemented as client-side UI state. |

---

### 1.13 `tableStylesStore.ts` -- Table Visual Customization

| Property | Detail |
|----------|--------|
| **File** | `src/store/tableStylesStore.ts` (large file, 38000+ tokens) |
| **Hook** | `useTableStylesStore` (presumed) |
| **Persistence** | Likely persisted |
| **Data Source** | **Client-only** -- visual styling preferences |
| **API Integration** | Not needed |
| **Manages** | Table visual customization (colors, borders, density, etc.) |
| **Issues** | File is extremely large (38000+ tokens). May need splitting. |
| **Migration Needed** | None for API. Consider splitting the file. |

---

### 1.14 `sidebarElementsStore.ts` -- Sidebar Widget Elements

| Property | Detail |
|----------|--------|
| **File** | `src/store/sidebarElementsStore.ts` |
| **Data Source** | **Client-only** -- defines 50+ element types for sidebar builder |
| **API Integration** | Not needed |
| **Manages** | Element type definitions, categories, drag-and-drop sidebar building |
| **Migration Needed** | None. UI configuration only. |

---

### 1.15 Plugin-Local Stores

| Store | File | Data Source |
|-------|------|-------------|
| `queueManagerStore` | `src/pages/plugins/visual-queue-manager/stores/queueManagerStore.ts` | Mock data (but has API integration planned) |
| `commerceStore` | `src/pages/plugins/rustcommerce/stores/commerceStore.ts` | Mock data |

---

## 2. Store Classification Summary

### 2.1 By Data Source

| Category | Stores | Count |
|----------|--------|-------|
| **Real API** | analyticsStore, chatStore, collaborationStore, databaseStore | 4 |
| **Hybrid (API + Mock fallback)** | postStore, themeEditorStore | 2 |
| **100% Mock** | dashboardStore, pluginStore, appStore, storageStore | 4 |
| **Client-only (correct)** | navigationStore, tableStore, tableStylesStore, sidebarElementsStore | 4 |

### 2.2 By Migration Priority

| Priority | Store | Work Needed |
|----------|-------|-------------|
| **P0 Critical** | `dashboardStore` | Create dashboard API, replace all random generators |
| **P0 Critical** | `pluginStore` | Create plugins API, fetch from backend |
| **P0 High** | `postStore` | Remove mock fallback, fix URL prefix, add pagination |
| **P0 High** | `themeEditorStore` | Migrate to apiClient, add auth, implement git ops |
| **P1 Medium** | `appStore` | Create apps API (but apps feature is P2) |
| **P1 Medium** | `storageStore` | Create storage API, fix credential security |
| **P1 Medium** | `databaseStore` | Fix URL prefix, add missing endpoints |
| **P2 Low** | `analyticsStore` | Already integrated, verify endpoints |
| **P2 Low** | `chatStore` | Already integrated, verify endpoints |
| **P2 Low** | `collaborationStore` | Already integrated, verify endpoints |
| **N/A** | `navigationStore` | No changes needed |
| **N/A** | `tableStore` | No changes needed |
| **N/A** | `tableStylesStore` | No changes needed |
| **N/A** | `sidebarElementsStore` | No changes needed |

---

## 3. Persistence Behavior Summary

| Store | localStorage Key | What's Persisted |
|-------|-----------------|-----------------|
| `postStore` | `rustpress-post-store` | posts list, categories, tags |
| `dashboardStore` | `rustpress-dashboard` | layouts, activeLayoutId |
| `pluginStore` | `rustpress-plugins` | **ALL state** (entire plugin list) |
| `navigationStore` | `rustpress-navigation` | recentlyVisited, favorites, collapsedGroups |
| `analyticsStore` | `rustpress-analytics-store` | dateRange, compareEnabled, activeTab |
| `appStore` | `rustpress-apps` | **ALL state** (all apps, access, configs) |
| `chatStore` | `rustpress-chat` | isOpen only |
| `databaseStore` | `database-manager-storage` | settings, savedQueries, queryHistory |
| `storageStore` | `rustpress-storage` | **ALL state** (providers, API keys!!) |
| `themeEditorStore` | `rustpress-theme-editor` | editorMode, gitBranch |
| `tableStore` | `rustpress-table` | views, column settings |
| `tableStylesStore` | Unknown | Visual preferences |
| `collaborationStore` | None | Nothing persisted (correct) |

### 3.1 Security Concerns

**CRITICAL**: `storageStore` persists API keys (OpenAI, Stripe, SendGrid, etc.) directly in localStorage via `rustpress-storage`. These should NEVER be stored client-side. They must be:
1. Sent to backend on save
2. Never returned in full (only last 4 chars for display)
3. Encrypted at rest on the server

---

## 4. Migration Plan: Mock Data to Real API

### Phase 1: Foundation (must be done first)
1. Fix API URL prefix: `/api` -> `/api/v1`
2. Create `authApi` module and login page
3. Verify Axios interceptor correctly handles token refresh

### Phase 2: Core CMS Stores
4. `postStore` -- Remove mock fallback, add pagination, connect bulk operations
5. Create `pagesApi` and page store (or extend postStore)
6. Connect `taxonomiesApi` to Categories/Tags pages (API already exists)
7. Connect `mediaApi` to Media Library page (API already exists)
8. Connect `usersApi` to Users page (API already exists)

### Phase 3: Dashboard & Plugins
9. `dashboardStore` -- Create `dashboardApi`, replace all random generators
10. `pluginStore` -- Create `pluginsApi`, fetch from backend
11. Create `commentsApi` and comments page
12. Create `settingsApi` and settings page

### Phase 4: Advanced Features
13. `themeEditorStore` -- Migrate to apiClient, implement real git ops
14. `storageStore` -- Create `storageApi`, fix credential security
15. `appStore` -- Create `appsApi` (P2 feature)
16. Create `menusApi`, `widgetsApi`, `rolesApi`, `searchApi`
