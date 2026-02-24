# RustPress Core Admin UI — AI Context Document

> **Purpose**: This document teaches an AI agent everything it needs to know about `rustpress-core-admin-ui` to build plugin UIs, extend the admin dashboard, or create new admin pages. Read this FIRST. Only explore the full codebase if something specific is unclear.

---

## 1. What Is This?

The RustPress Admin UI is a **React/TypeScript single-page application** that serves as the enterprise admin dashboard for RustPress CMS. It communicates with `rustpress-core-base` (the Rust backend) via REST API and WebSocket.

**Tech Stack**:
| Concern | Technology |
|---------|------------|
| Framework | React 18.3 |
| Language | TypeScript 5.7 |
| Build Tool | Vite 6.0 |
| Styling | Tailwind CSS 3.4 + custom design tokens |
| State | Zustand 5.0 (with localStorage persistence) |
| Routing | React Router DOM 6.28 |
| HTTP Client | Axios 1.7 |
| Code Editor | Monaco Editor 4.7 |
| Charts | Recharts 3.6 |
| Animations | Framer Motion 11.15 |
| Icons | Lucide React 0.468 |

---

## 2. Project Structure

```
rustpress-core-admin-ui/
├── index.html                # SPA entry point (dark mode default)
├── package.json              # Dependencies + scripts
├── vite.config.ts            # Base: /admin/, proxy: /api → localhost:3080
├── tailwind.config.js        # Custom theme: colors, fonts, animations
├── tsconfig.json             # @/* path alias → ./src/*
│
├── src/
│   ├── main.tsx              # React root, BrowserRouter basename="/admin"
│   ├── App.tsx               # ~950 lines: ALL route definitions + lazy loading
│   ├── index.css             # Global styles
│   │
│   ├── api/                  # Backend API clients
│   │   ├── client.ts         # Axios REST client with JWT auth interceptors
│   │   └── queueManagerApi.ts # Queue manager-specific API
│   │
│   ├── layouts/
│   │   └── EnterpriseLayout.tsx # Main shell: sidebar, topnav, breadcrumbs, chat
│   │
│   ├── design-system/        # FULL CUSTOM DESIGN SYSTEM (150+ components)
│   │   ├── index.ts          # Central barrel export
│   │   ├── tokens.ts         # Design tokens: colors, spacing, shadows, etc.
│   │   ├── ThemeProvider.tsx  # Light/dark/system theme + breakpoint hooks
│   │   ├── animations.ts     # 40+ Framer Motion variants
│   │   ├── utils.ts          # Utility functions (cn, formatting, debounce)
│   │   └── components/       # 150+ reusable components (see Section 5)
│   │
│   ├── store/                # Zustand state stores (all persisted)
│   │   ├── pluginStore.ts    # Plugin management state ← KEY FOR PLUGINS
│   │   ├── navigationStore.ts # Nav state, favorites, command palette
│   │   ├── appStore.ts       # Site mode (website/app/hybrid)
│   │   ├── chatStore.ts      # Chat messages
│   │   ├── analyticsStore.ts # Analytics data
│   │   ├── dashboardStore.ts # Dashboard widget state
│   │   └── ...               # Other stores
│   │
│   ├── services/             # Backend service interfaces
│   │   ├── fileSystemService.ts  # File ops, git, terminal, code intel
│   │   ├── websocketService.ts   # WebSocket singleton for real-time
│   │   └── ...
│   │
│   ├── pages/                # Route-level page components
│   │   ├── plugins/          # Plugin management pages
│   │   │   └── visual-queue-manager/  # Example: full plugin UI
│   │   ├── enterprise/       # Dashboard
│   │   ├── analytics/        # Analytics
│   │   ├── development/      # Database manager
│   │   └── ...
│   │
│   ├── components/           # Shared + feature components
│   │   ├── plugins/          # Plugin management UI components
│   │   │   ├── PluginManagement.tsx  # 10 enterprise features
│   │   │   ├── PluginGallery.tsx
│   │   │   ├── PluginDetails.tsx
│   │   │   ├── PluginSettings.tsx
│   │   │   └── ...
│   │   ├── ide/              # VS Code-like IDE (~60 components)
│   │   │   └── wizards/
│   │   │       └── PluginWizard.tsx  # Plugin scaffolding wizard
│   │   ├── posts/            # Post editor ecosystem
│   │   ├── themes/           # Theme management
│   │   └── ...
│   │
│   └── types/                # TypeScript type definitions
│       ├── app.ts
│       ├── chat.ts
│       └── collaboration.ts
```

---

## 3. How the Admin UI Communicates with the Backend

### 3.1 REST API (Primary)

**File**: `src/api/client.ts`

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Auth interceptor: adds JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 → redirect to /login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);
```

**API Modules**:
- `postsApi` — CRUD for posts
- `taxonomiesApi` — Categories/tags
- `mediaApi` — File uploads
- `usersApi` — User management
- `databaseApi` — SQL query execution

### 3.2 Dev Server Proxy

**File**: `vite.config.ts`
```typescript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:3080',  // RustPress backend
      changeOrigin: true,
    }
  }
}
```

### 3.3 WebSocket (Real-time)

**File**: `src/services/websocketService.ts`
- Collaboration: cursor positions, selections, text changes
- Chat: messages, typing indicators, reactions
- Presence: online status updates
- Reconnect logic with 30-second keepalive pings

---

## 4. Plugin System in the Admin UI

This is the most critical section for building plugin UIs.

### 4.1 Plugin State Store

**File**: `src/store/pluginStore.ts`

```typescript
interface InstalledPlugin {
  id: string;
  name: string;
  slug: string;           // URL-safe identifier
  description: string;
  version: string;
  author: string;
  active: boolean;        // Is the plugin currently active?
  icon: string;           // Lucide icon name
  category: string;
  isRustPlugin: boolean;  // Backend plugin vs frontend-only
  settings: Record<string, any>;
  installedAt: string;
  updatedAt: string;
  menuHref?: string;      // Custom menu link in sidebar
  menuLabel?: string;     // Custom menu label
  showInMenu?: boolean;   // Show in sidebar navigation?
}

interface PluginState {
  plugins: InstalledPlugin[];
  installPlugin: (plugin: InstalledPlugin) => void;
  uninstallPlugin: (id: string) => void;
  activatePlugin: (id: string) => void;
  deactivatePlugin: (id: string) => void;
  updatePluginSettings: (id: string, settings: Record<string, any>) => void;
  setMenuVisibility: (id: string, visible: boolean) => void;
  getActivePlugins: () => InstalledPlugin[];
  getMenuPlugins: () => InstalledPlugin[];
}
```

**Default registered plugins** (pre-loaded in the store):
- Visual Queue Manager
- RustUsers
- RustAnalytics
- RustMultilang
- **RustCommerce** (id: "rustcommerce", slug: "rustcommerce")
- SEO Optimizer
- Contact Form Pro

### 4.2 How Plugin Routes Work

**File**: `src/App.tsx`

Plugins register routes in three ways:

**A. Full-screen plugin routes** (outside the admin layout):
```tsx
// For plugins that need their own full-screen UI
<Route
  path="/plugins/visual-queue-manager"
  element={
    <Suspense fallback={<LoadingSkeleton />}>
      <VisualQueueManager />
    </Suspense>
  }
/>
```

**B. Admin-wrapped plugin routes** (inside EnterpriseLayout):
```tsx
<Route element={<EnterpriseLayout />}>
  {/* Plugin management pages */}
  <Route path="/plugins" element={<PluginsPage />} />
  <Route path="/plugins/add" element={<PluginStorePage />} />
  <Route path="/plugins/:pluginSlug" element={<PluginDetailPage />} />

  {/* Individual plugin pages would go here */}
  <Route path="/store/*" element={<RustCommerceAdmin />} />
</Route>
```

**C. Lazy loading pattern** (all pages use this):
```tsx
const MyPluginPage = lazy(() => import('./pages/plugins/my-plugin'));

<Route
  path="/my-plugin/*"
  element={
    <Suspense fallback={<LoadingSkeleton />}>
      <MyPluginPage />
    </Suspense>
  }
/>
```

### 4.3 How Plugins Appear in Navigation

**File**: `src/layouts/EnterpriseLayout.tsx`

The sidebar has a **Plugins** group with two default items:
- "Installed" → `/plugins`
- "Add New" → `/plugins/add`

Active plugins with `showInMenu: true` appear dynamically in the sidebar and in the top-nav **Plugins MegaMenu** dropdown.

The `SidebarItem` component renders each nav item with:
- Lucide icon (dynamically resolved from the plugin's `icon` field)
- Badge support (for notifications/counts)
- Active state highlighting
- Color indexing for visual variety

### 4.4 Plugin Management UI Components

**File**: `src/components/plugins/PluginManagement.tsx` (2192 lines)

10 enterprise features available to all plugins:

| Feature | Component | Purpose |
|---------|-----------|---------|
| Installation | `InstallationProgress` | Step-by-step install tracking |
| Dependencies | `DependencyResolver` | Required/optional/dev deps |
| Bulk Actions | `BulkActionsToolbar` | Multi-select: activate, deactivate, update, delete |
| Updates | `UpdateManager` | Security/breaking change badges |
| Rollback | `RollbackSystem` | Version history + rollback |
| Licensing | `LicenseManagement` | License key activation/validation |
| Health | `PluginHealthMonitor` | Response time, memory, CPU, error rate |
| Conflicts | `ConflictDetection` | Plugin compatibility checks |
| Safe Mode | `SafeModeToggle` | Disable all third-party plugins |
| Import/Export | `PluginImportExport` | Bulk export/import configurations |

### 4.5 Plugin Wizard (Scaffolding)

**File**: `src/components/ide/wizards/PluginWizard.tsx`

5-step wizard for creating new plugins:
1. **Plugin Info**: name, slug, description, author, version, license
2. **Category**: 8 categories (Analytics, Security, Content, Commerce, etc.)
3. **Language & Hooks**: Rust / TypeScript / Full-Stack + lifecycle hook selection
4. **Features**: settings, admin page, API endpoints, database, cron, widgets, shortcodes
5. **Review**: Configuration summary with file preview

---

## 5. Design System

### 5.1 Component Library

**File**: `src/design-system/components/` — 150+ reusable components

**Most useful for plugin UIs**:

| Category | Components |
|----------|------------|
| Layout | `PageContainer`, `Grid`, `SplitView`, `Resizable` |
| Data Display | `DataTable`, `Card`, `Badge`, `StatusIndicator`, `Timeline` |
| Charts | `AreaChart`, `BarChart`, `LineChart`, `PieChart`, `Gauge`, `Heatmap` |
| Forms | `Input`, `FormField`, `Switch`, `Slider`, `DatePicker`, `ColorPicker`, `TagInput` |
| Navigation | `Tabs`, `Breadcrumbs`, `Pagination`, `Stepper` |
| Overlays | `Modal`, `Drawer`, `Dropdown`, `Tooltip`, `ConfirmDialog` |
| Feedback | `Alert`, `Toast`, `Skeleton`, `LoadingSpinner`, `ProgressBar`, `EmptyState` |
| CMS | `RichTextEditor`, `BlockEditor`, `MediaLibrary`, `FileManager`, `CodeEditor` |

### 5.2 Design Tokens & Theme

**File**: `src/design-system/tokens.ts`

```typescript
// Color palette
primary: indigo (6366f1)
accent: cyan (06b6d4)
neutral: slate (64748b)
success, warning, danger, info

// Fonts
sans: Inter
display: Plus Jakarta Sans
mono: JetBrains Mono
```

**File**: `tailwind.config.js`
- Custom shadows: `elevation-1` through `elevation-5`, glow effects
- Animations: `fade-in`, `fade-in-up`, `slide-in-left`, `pulse-glow`, `shimmer`, `float`
- Z-index layers: sidebar(40), dropdown(50), megamenu(55), modal(60), tooltip(70)

### 5.3 Importing Components

```typescript
// Import from the design system barrel export
import { DataTable, Card, Badge, Modal, Alert } from '@/design-system';

// Or from specific component files
import { DataTable } from '@/design-system/components/DataTable';

// Utility for class names
import { cn } from '@/design-system/utils';
```

### 5.4 Animation Variants

**File**: `src/design-system/animations.ts`

```typescript
import { fadeIn, slideInLeft, scaleIn, staggerChildren } from '@/design-system/animations';

// Use with Framer Motion
<motion.div variants={fadeIn} initial="hidden" animate="visible">
```

---

## 6. How to Build a Plugin UI — Step-by-Step Guide

### Step 1: Create Your Plugin Page Component

```
src/pages/plugins/my-plugin/
├── index.tsx              # Main page component
├── components/            # Plugin-specific components
│   ├── Dashboard.tsx
│   ├── Settings.tsx
│   └── ...
├── stores/                # Plugin-specific Zustand stores
│   └── myPluginStore.ts
└── types/                 # Plugin-specific types
    └── index.ts
```

### Step 2: Register the Route

In `src/App.tsx`, add a lazy-loaded route:

```tsx
const MyPluginPage = lazy(() => import('./pages/plugins/my-plugin'));

// Inside the EnterpriseLayout routes:
<Route path="/my-plugin/*" element={
  <Suspense fallback={<LoadingSkeleton />}>
    <MyPluginPage />
  </Suspense>
} />
```

### Step 3: Register in Plugin Store

In `src/store/pluginStore.ts`, add the plugin to the default list:

```typescript
{
  id: 'my-plugin',
  name: 'My Plugin',
  slug: 'my-plugin',
  description: 'What my plugin does',
  version: '1.0.0',
  author: 'Author',
  active: true,
  icon: 'Package',        // Lucide icon name
  category: 'Commerce',
  isRustPlugin: true,
  settings: {},
  menuHref: '/my-plugin',
  menuLabel: 'My Plugin',
  showInMenu: true,
  installedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
```

### Step 4: Create Zustand Store (if needed)

```typescript
// src/pages/plugins/my-plugin/stores/myPluginStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MyPluginState {
  items: Item[];
  loading: boolean;
  fetchItems: () => Promise<void>;
}

export const useMyPluginStore = create<MyPluginState>()(
  persist(
    (set) => ({
      items: [],
      loading: false,
      fetchItems: async () => {
        set({ loading: true });
        const response = await fetch('/api/v1/my-plugin/items');
        const items = await response.json();
        set({ items, loading: false });
      },
    }),
    { name: 'my-plugin-store' }
  )
);
```

### Step 5: Build the UI with Design System Components

```tsx
import { PageContainer, DataTable, Card, Badge, Button } from '@/design-system';
import { useMyPluginStore } from './stores/myPluginStore';

export default function MyPluginPage() {
  const { items, loading, fetchItems } = useMyPluginStore();

  useEffect(() => { fetchItems(); }, []);

  return (
    <PageContainer title="My Plugin" description="Manage your items">
      <Card>
        <DataTable
          data={items}
          columns={columns}
          loading={loading}
        />
      </Card>
    </PageContainer>
  );
}
```

### Step 6: Connect to Backend API

Your plugin UI calls the RustPress backend at `/api/v1/{plugin-name}/`:

```typescript
// Use the existing Axios client for authenticated requests
import api from '@/api/client';

const response = await api.get('/v1/my-plugin/items');
const data = response.data;

// Or create a dedicated API module
export const myPluginApi = {
  listItems: () => api.get('/v1/my-plugin/items'),
  getItem: (id: string) => api.get(`/v1/my-plugin/items/${id}`),
  createItem: (data: CreateItemData) => api.post('/v1/my-plugin/items', data),
  updateItem: (id: string, data: UpdateItemData) => api.put(`/v1/my-plugin/items/${id}`, data),
  deleteItem: (id: string) => api.delete(`/v1/my-plugin/items/${id}`),
};
```

---

## 7. Build & Development

```bash
# Install dependencies
npm install

# Development server (http://localhost:5173/admin/)
npm run dev

# Production build (output: dist/)
npm run build

# Type-check + build
npm run build:typecheck
```

**Important paths**:
- Base URL: `/admin/`
- API proxy: `/api` → `http://localhost:3080`
- Path alias: `@/*` → `./src/*`

---

## 8. Patterns & Conventions

1. **Lazy loading**: ALL page components use `React.lazy()` + `<Suspense>`
2. **Dark mode first**: HTML starts with `class="dark"`, ThemeProvider manages mode
3. **State persistence**: All Zustand stores use `persist` middleware (localStorage)
4. **Mock-first development**: Services include mock data for offline/frontend-only dev
5. **Barrel exports**: `index.ts` files aggregate exports at each directory level
6. **Import alias**: Always use `@/` prefix (maps to `src/`)
7. **Lucide icons**: Import from `lucide-react` by name
8. **Class merging**: Use `cn()` utility (clsx + tailwind-merge)

---

## 9. Existing Plugin UI Examples

Study these for implementation patterns:

| Plugin UI | Location | Complexity | Best For Learning |
|-----------|----------|-----------|-------------------|
| Visual Queue Manager | `src/pages/plugins/visual-queue-manager/` | Very High | Full plugin with multiple views, WebSocket, stores, types, tests |
| Plugin Management | `src/components/plugins/PluginManagement.tsx` | High | Enterprise features (health, conflicts, rollback, licensing) |
| Plugin Wizard | `src/components/ide/wizards/PluginWizard.tsx` | Medium | How plugins are scaffolded |
| Database Manager | `src/pages/development/` | Medium | SQL editor, import/export, monitoring |

---

## 10. File Reference for Deep Dives

| Topic | File |
|-------|------|
| Plugin state/store | `src/store/pluginStore.ts` |
| Route registration | `src/App.tsx` |
| Sidebar navigation | `src/layouts/EnterpriseLayout.tsx` |
| Plugin management UI | `src/components/plugins/PluginManagement.tsx` |
| Plugin gallery | `src/components/plugins/PluginGallery.tsx` |
| Plugin details | `src/components/plugins/PluginDetails.tsx` |
| Plugin settings | `src/components/plugins/PluginSettings.tsx` |
| Plugin wizard | `src/components/ide/wizards/PluginWizard.tsx` |
| API client | `src/api/client.ts` |
| Design system | `src/design-system/index.ts` |
| Design tokens | `src/design-system/tokens.ts` |
| Theme provider | `src/design-system/ThemeProvider.tsx` |
| All UI components | `src/design-system/components/index.ts` |
| Animations | `src/design-system/animations.ts` |
| Tailwind config | `tailwind.config.js` |
| Vite config | `vite.config.ts` |
| WebSocket service | `src/services/websocketService.ts` |
