# RustPress Admin UI - API Integration Audit

> Generated: 2026-03-02 | Wave 2 Frontend Engineering | Research & Planning
> Source: `C:\Users\Software Engineering\Desktop\rustpress-core-admin-ui`

---

## 1. API Client Configuration (`src/api/client.ts`)

### 1.1 Base Configuration
- **Base URL**: `VITE_API_URL` env var or `/api` (default)
- **HTTP Client**: Axios 1.7
- **Auth**: JWT Bearer token from `localStorage.getItem('auth_token')`
- **401 Handling**: Clears token and redirects to `/login`
- **Proxy** (dev): Vite proxies `/api` to `http://localhost:3080` (see `vite.config.ts`)

### 1.2 API Modules Defined

| Module | Endpoints | Methods |
|--------|-----------|---------|
| `postsApi` | `/posts`, `/posts/:id` | `getAll`, `getById`, `create`, `update`, `delete` |
| `taxonomiesApi` | `/taxonomies/categories`, `/taxonomies/tags`, `/taxonomies`, `/taxonomies/:id` | `getCategories`, `getTags`, `create`, `update`, `delete` |
| `mediaApi` | `/media`, `/media/:id` | `getAll`, `upload` (multipart), `delete` |
| `usersApi` | `/users`, `/users/:id` | `getAll`, `getById`, `create`, `update`, `delete` |
| `databaseApi` | `/database/status`, `/database/stats`, `/database/tables`, `/database/tables/:table/columns`, `/database/query`, `/database/queries`, `/database/history` | `getStatus`, `getStats`, `getTables`, `getTableColumns`, `executeQuery`, `getSavedQueries`, `saveQuery`, `getHistory` |

### 1.3 Additional API Services (in `src/services/`)

| Service File | Base Path | Description |
|-------------|-----------|-------------|
| `analyticsApi.ts` | `/api/v1/analytics/*` | Google Analytics integration (~40 endpoints) |
| `chatApi.ts` | `/api/v1/chat/*` | Real-time chat REST endpoints |
| `websocketService.ts` | `ws://host/api/v1/ws` | WebSocket for real-time collaboration + chat |
| `themeService.ts` | `/api/v1/themes/*` | Theme loading, saving, git operations |
| `fileSystemService.ts` | Unknown | File system operations for IDE |
| `gitService.ts` | Unknown | Git operations for theme editor |
| `searchService.ts` | Unknown | Content search |
| `aiAssistantService.ts` | Unknown | AI writing assistant |
| `codeIntelligenceService.ts` | Unknown | Code intelligence for IDE |
| `debugService.ts` | Unknown | Debug/profiling service |
| `projectGeneratorService.ts` | Unknown | Project scaffolding |
| `appsService.ts` | Unknown | App marketplace service |
| `assetService.ts` | Unknown | Asset management |
| `tasksService.ts` | Unknown | Task/todo management |
| `windowSyncService.ts` | Unknown | Multi-window sync for IDE |
| `themeDataService.ts` | Unknown | Theme data loading |

---

## 2. Backend API Endpoints (Expected)

Based on the strategy document, the backend (`rustpress-core-base`) exposes endpoints under `/api/v1/`. The frontend currently maps to `/api/` without the `/v1/` prefix.

### 2.1 Known Backend Endpoint Patterns (from strategy)

| Domain | Expected Backend Endpoints |
|--------|---------------------------|
| Auth | `POST /api/v1/auth/login`, `POST /api/v1/auth/register`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`, `POST /api/v1/auth/password-reset` |
| Users | `GET/POST /api/v1/users`, `GET/PUT/DELETE /api/v1/users/:id` |
| Posts | `GET/POST /api/v1/posts`, `GET/PUT/DELETE /api/v1/posts/:id` |
| Pages | `GET/POST /api/v1/pages`, `GET/PUT/DELETE /api/v1/pages/:id` |
| Media | `GET/POST /api/v1/media`, `GET/DELETE /api/v1/media/:id` |
| Comments | `GET/POST /api/v1/comments`, `PUT/DELETE /api/v1/comments/:id` |
| Taxonomies | `GET/POST /api/v1/taxonomies`, `PUT/DELETE /api/v1/taxonomies/:id` |
| Settings | `GET/PUT /api/v1/settings`, `GET/PUT /api/v1/settings/:group` |
| Menus | `GET/POST /api/v1/menus`, `PUT/DELETE /api/v1/menus/:id` |
| Widgets | `GET/POST /api/v1/widgets`, `PUT/DELETE /api/v1/widgets/:id` |
| Themes | `GET /api/v1/themes`, `POST /api/v1/themes/:slug/activate`, etc. |
| Plugins | `GET /api/v1/plugins`, `POST /api/v1/plugins/:id/activate`, etc. |
| Search | `GET /api/v1/search` |
| Health | `GET /health/live`, `GET /health/ready`, `GET /metrics` |

---

## 3. Endpoint Mismatch Analysis

### 3.1 URL Prefix Mismatch

**CRITICAL**: The frontend `apiClient` uses base URL `/api` while the backend likely uses `/api/v1/`.

- Frontend calls: `GET /api/posts`
- Backend expects: `GET /api/v1/posts`
- The Vite proxy is configured to forward `/api` to `http://localhost:3080`, but it does not rewrite the path. This means the backend must either accept both `/api/` and `/api/v1/` or the frontend needs to be updated.
- Some services (analyticsApi, chatApi, themeService) already use `/api/v1/` prefix, creating inconsistency.

### 3.2 Missing Frontend API Modules

The following backend API domains have NO corresponding frontend API module:

| Domain | Backend Status | Frontend API | Frontend Page |
|--------|---------------|--------------|---------------|
| **Auth** | Implemented | **MISSING** | Login is `<div>Login Page</div>` |
| **Pages** | Implemented | **MISSING** (uses PostEditor) | Inline stub in App.tsx |
| **Comments** | Implemented | **MISSING** | Inline stub in App.tsx |
| **Settings** | Implemented | **MISSING** | Inline stub in App.tsx |
| **Menus** | Implemented | **MISSING** | Uses separate Menus page but no API client |
| **Widgets** | Implemented | **MISSING** | EmptyState stub |
| **Plugins** | Implemented | **MISSING** (store is local-only) | Plugin store uses hardcoded data |
| **Themes** | Implemented | **Partial** (themeService uses raw `fetch`) | Theme editor has API calls with localStorage fallback |
| **Search** | Implemented | **MISSING** | No search API integration |

### 3.3 Frontend API Modules That Exist

| Module | Makes Real API Calls? | Fallback? |
|--------|----------------------|-----------|
| `postsApi` | Yes, via Axios | Falls back to mock data on failure |
| `taxonomiesApi` | Yes, via Axios | No fallback (likely fails silently) |
| `mediaApi` | Yes, via Axios | No fallback |
| `usersApi` | Yes, via Axios | No fallback |
| `databaseApi` | Yes, via Axios | No fallback |
| `analyticsApi` | Yes, via Axios | No fallback |
| `chatApi` | Yes, via raw `fetch` | No fallback |
| `themeService` | Yes, via raw `fetch` | Falls back to localStorage |

---

## 4. Pages vs API Connection Status

### 4.1 Pages That Call Real Backend APIs

| Page | API Used | Store | Notes |
|------|----------|-------|-------|
| Posts List | `postsApi.getAll()` | `postStore` | Falls back to mock data |
| Post Editor | `postsApi.getById/create/update` | `postStore` | Falls back to mock data |
| Database Manager | `databaseApi.*` | `databaseStore` | All methods use real API |
| Database Tables | `databaseApi.getTables/getTableColumns` | `databaseStore` | Real API |
| SQL Editor | `databaseApi.executeQuery` | `databaseStore` | Real API |
| Analytics Dashboard | `analyticsApi.*` | `analyticsStore` | Real API calls |
| Analytics Settings | `analyticsApi.*` | `analyticsStore` | Real API calls |
| Theme Editor | `fetch('/api/v1/themes/*')` | `themeEditorStore` | Falls back to localStorage |

### 4.2 Pages That Use 100% Mock/Hardcoded Data

| Page | Data Source | Required API |
|------|------------|--------------|
| **Dashboard** | `dashboardStore` (random generators) | `/api/v1/dashboard/stats`, `/api/v1/activity` |
| **Pages List** | Hardcoded in App.tsx | `pagesApi` (CRUD) |
| **Media Library** | Empty placeholder grid | `mediaApi` (already exists but unused) |
| **Comments** | Hardcoded 2 comments | `commentsApi` (need to create) |
| **Categories** | EmptyState only | `taxonomiesApi` (exists but unused) |
| **Tags** | EmptyState only | `taxonomiesApi` (exists but unused) |
| **Users** | Hardcoded 3 users | `usersApi` (exists but unused) |
| **Roles** | Hardcoded 4 roles | `rolesApi` (need to create) |
| **Settings** | Hardcoded form | `settingsApi` (need to create) |
| **Widgets** | EmptyState | `widgetsApi` (need to create) |
| **Plugins** | `pluginStore` (hardcoded defaults) | `pluginsApi` (need to create) |
| **Apps** | `appStore` (hardcoded defaults) | `appsApi` (need to create) |
| **RustCommerce** | `commerceStore` (mock data) | `commerceApi` (exists but mock) |
| **Login** | None | `authApi` (need to create) |

---

## 5. Work Required for Full API Integration

### 5.1 New API Modules to Create

1. **`authApi`** -- login, register, logout, refresh, password reset
2. **`pagesApi`** -- CRUD pages with hierarchy support
3. **`commentsApi`** -- CRUD comments with moderation
4. **`settingsApi`** -- read/write site settings by group
5. **`menusApi`** -- CRUD menus with nesting
6. **`widgetsApi`** -- CRUD widgets with ordering
7. **`pluginsApi`** -- list, activate, deactivate, settings
8. **`rolesApi`** -- CRUD roles and permissions
9. **`searchApi`** -- content search
10. **`dashboardApi`** -- aggregate stats, activity feed

### 5.2 Existing API Modules to Fix

1. **`postsApi`** -- Fix URL prefix (`/api` -> `/api/v1`), add pagination, add bulk ops
2. **`taxonomiesApi`** -- Fix URL prefix, add hierarchical category support
3. **`mediaApi`** -- Fix URL prefix, add metadata update, folder operations
4. **`usersApi`** -- Fix URL prefix, add role assignment, password change
5. **`databaseApi`** -- Fix URL prefix
6. **Theme service** -- Standardize to use Axios `apiClient` instead of raw `fetch`
7. **Chat service** -- Standardize to use Axios `apiClient` instead of raw `fetch`

### 5.3 URL Prefix Resolution

**Option A** (recommended): Update `apiClient` base URL to `/api/v1` and update all endpoint paths.
**Option B**: Configure Vite proxy to rewrite `/api/` to `/api/v1/`.
**Option C**: Update backend to accept both prefixes.

### 5.4 Priority Order

1. **P0**: Auth API + Login page (blocks everything)
2. **P0**: Fix URL prefix mismatch
3. **P0**: Posts, Pages, Media API integration (core CMS)
4. **P0**: Comments, Categories, Tags API integration
5. **P0**: Users, Roles, Settings API integration
6. **P0**: Dashboard real data
7. **P1**: Plugins, Themes API integration
8. **P1**: Menus, Widgets API integration
9. **P2**: Search, RustCommerce API integration
