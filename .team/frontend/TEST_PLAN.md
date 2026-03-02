# RustPress Admin UI - Test Infrastructure Plan

> Generated: 2026-03-02 | Wave 2 Frontend Engineering | Research & Planning
> Source: `C:\Users\Software Engineering\Desktop\rustpress-core-admin-ui`

---

## 1. Current Test Status

### 1.1 Existing Tests

Tests exist ONLY for the Visual Queue Manager plugin:

| File | Type | Location |
|------|------|----------|
| `api.test.ts` | Unit | `src/pages/plugins/visual-queue-manager/__tests__/api.test.ts` |
| `components.test.tsx` | Component | `src/pages/plugins/visual-queue-manager/__tests__/components.test.tsx` |
| `integration.test.ts` | Integration | `src/pages/plugins/visual-queue-manager/__tests__/integration.test.ts` |
| `setup.ts` | Setup | `src/pages/plugins/visual-queue-manager/__tests__/setup.ts` |
| `store.test.ts` | Unit | `src/pages/plugins/visual-queue-manager/__tests__/store.test.ts` |
| `utils.test.ts` | Unit | `src/pages/plugins/visual-queue-manager/__tests__/utils.test.ts` |

There is also a mock handlers file:
- `src/mocks/queueManagerHandlers.ts` -- MSW handlers for the queue manager plugin

### 1.2 Test Dependencies in `package.json`

**NONE.** The project has zero test-related dependencies:

```json
{
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.15",
    "typescript": "^5.7.2",
    "vite": "^6.0.3"
  }
}
```

**Missing**: Vitest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, jsdom, MSW (msw), Playwright, axe-core, @axe-core/playwright, @vitest/coverage-v8.

### 1.3 Test Scripts in `package.json`

**NONE.** No `test`, `test:unit`, `test:e2e`, `test:coverage` scripts.

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:typecheck": "tsc -b && vite build",
    "preview": "vite preview"
  }
}
```

### 1.4 Test Configuration Files

**NONE.** No `vitest.config.ts`, `playwright.config.ts`, or `.env.test`.

---

## 2. Required Test Dependencies

### 2.1 Unit & Component Testing (Vitest + RTL)

```json
{
  "devDependencies": {
    "vitest": "^3.0.0",
    "@vitest/coverage-v8": "^3.0.0",
    "@vitest/ui": "^3.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/user-event": "^14.5.0",
    "jsdom": "^25.0.0",
    "msw": "^2.7.0"
  }
}
```

### 2.2 E2E Testing (Playwright)

```json
{
  "devDependencies": {
    "@playwright/test": "^1.49.0",
    "@axe-core/playwright": "^4.10.0"
  }
}
```

### 2.3 Total New Dependencies: 10

---

## 3. Test Configuration Files Needed

### 3.1 `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/test/**',
        'src/mocks/**',
        'src/**/*.d.ts',
      ],
      thresholds: {
        global: {
          statements: 70,
          branches: 70,
          functions: 70,
          lines: 70,
        },
      },
    },
  },
});
```

### 3.2 `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'html' : 'list',
  use: {
    baseURL: 'http://localhost:5173/admin/',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173/admin/',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 3.3 `src/test/setup.ts`

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
});
```

---

## 4. Proposed Test File Structure

```
src/
  test/
    setup.ts                    # Global test setup
    utils.tsx                   # Render helpers (providers, router wrapping)
    mocks/
      handlers.ts               # MSW request handlers (central)
      server.ts                 # MSW server setup
      data/
        posts.ts                # Mock post data factories
        users.ts                # Mock user data factories
        media.ts                # Mock media data factories
  api/
    __tests__/
      client.test.ts            # API client interceptors, auth
  store/
    __tests__/
      postStore.test.ts         # Post store unit tests
      dashboardStore.test.ts    # Dashboard store tests
      pluginStore.test.ts       # Plugin store tests
      navigationStore.test.ts   # Navigation store tests
      databaseStore.test.ts     # Database store tests
      appStore.test.ts          # App store tests
      chatStore.test.ts         # Chat store tests
      storageStore.test.ts      # Storage store tests
      themeEditorStore.test.ts  # Theme editor store tests
      tableStore.test.ts        # Table store tests
  design-system/
    components/
      __tests__/
        Button.test.tsx         # Design system component tests
        Card.test.tsx
        DataTable.test.tsx
        Modal.test.tsx
        Input.test.tsx
        Badge.test.tsx
        Alert.test.tsx
        Tabs.test.tsx
        Dropdown.test.tsx
        Pagination.test.tsx
  components/
    posts/
      __tests__/
        PostEditor.test.tsx     # Post editor component tests
    plugins/
      __tests__/
        PluginManagement.test.tsx
    users/
      __tests__/
        UserManagement.test.tsx
  pages/
    enterprise/
      __tests__/
        Dashboard.test.tsx      # Dashboard page tests
    posts/
      __tests__/
        PostsListPage.test.tsx  # Posts list page tests
    settings/
      __tests__/
        SiteModeSettings.test.tsx
e2e/
  auth.spec.ts                  # Login/logout E2E
  posts.spec.ts                 # Post CRUD E2E
  media.spec.ts                 # Media upload E2E
  plugins.spec.ts               # Plugin management E2E
  themes.spec.ts                # Theme switching E2E
  settings.spec.ts              # Settings management E2E
  users.spec.ts                 # User management E2E
  dashboard.spec.ts             # Dashboard E2E
  navigation.spec.ts            # Navigation, sidebar, command palette E2E
  accessibility.spec.ts         # axe-core accessibility audit on all pages
```

---

## 5. Test Priority List

### 5.1 Priority 1 -- Maximum Coverage Impact (do first)

These components/stores are used across the entire application:

| Target | Type | Why First |
|--------|------|-----------|
| `src/api/client.ts` | Unit | Auth interceptor, error handling -- affects all API calls |
| `src/store/postStore.ts` | Unit | Most-used store, has both API and mock paths |
| `src/store/dashboardStore.ts` | Unit | Dashboard is the landing page |
| `src/store/navigationStore.ts` | Unit | Simple, high-confidence starting point |
| `src/store/tableStore.ts` | Unit | Complex filter logic (`evaluateFilter`, `evaluateFilterGroup`) -- pure functions, easy to test |
| `src/design-system/components/Button.tsx` | Component | Most-used component |
| `src/design-system/components/DataTable.tsx` | Component | Used on every list page |
| `src/design-system/components/Modal.tsx` | Component | Used for all CRUD dialogs |
| `src/design-system/components/Input.tsx` | Component | Core form component |
| `src/design-system/components/Card.tsx` | Component | Layout building block |

### 5.2 Priority 2 -- Core CMS Flows

| Target | Type | Why |
|--------|------|-----|
| `src/components/posts/PostEditor.tsx` | Component | Core content creation |
| `src/pages/posts/PostsListPage.tsx` | Component | Post listing |
| `src/pages/enterprise/Dashboard.tsx` | Component | Landing page |
| `src/store/pluginStore.ts` | Unit | Plugin lifecycle |
| `src/store/databaseStore.ts` | Unit | Database operations |
| `e2e/posts.spec.ts` | E2E | Full post CRUD flow |
| `e2e/auth.spec.ts` | E2E | Login flow (once auth is implemented) |

### 5.3 Priority 3 -- Advanced Features

| Target | Type | Why |
|--------|------|-----|
| `src/store/chatStore.ts` | Unit | Complex WebSocket message handling |
| `src/store/collaborationStore.ts` | Unit | Real-time state management |
| `src/store/themeEditorStore.ts` | Unit | Theme editing with undo/redo |
| `src/store/appStore.ts` | Unit | App marketplace logic |
| `src/components/plugins/PluginManagement.tsx` | Component | Plugin UI |
| `src/components/users/UserManagement.tsx` | Component | User management UI |
| `e2e/accessibility.spec.ts` | E2E/A11y | WCAG 2.1 AA compliance |
| `e2e/plugins.spec.ts` | E2E | Plugin lifecycle |
| `e2e/themes.spec.ts` | E2E | Theme switching |

### 5.4 Priority 4 -- Design System Coverage

| Target | Type | Count |
|--------|------|-------|
| All 169 design system components | Component | Write snapshot + interaction tests for top 30 most-used components |
| Chart components (9) | Component | Verify render without data, with data, responsive |

---

## 6. Test Scripts to Add

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:a11y": "playwright test e2e/accessibility.spec.ts"
  }
}
```

---

## 7. CI Integration

### 7.1 GitHub Actions Workflow (`.github/workflows/test.yml`)

The CI workflow should:
1. Install dependencies (`npm ci`)
2. Run type check (`npm run build:typecheck`)
3. Run unit tests with coverage (`npm run test:coverage`)
4. Install Playwright browsers (`npx playwright install --with-deps`)
5. Run E2E tests (`npm run test:e2e`)
6. Upload coverage report as artifact
7. Upload Playwright report as artifact
8. Fail if coverage drops below 70%

### 7.2 Pre-commit Hook

Add to existing (or new) pre-commit configuration:
- Run `vitest run --changed` (only tests affected by changed files)
- Run `tsc --noEmit` (type checking)

---

## 8. MSW Mock Strategy

### 8.1 Handler Organization

Create MSW handlers for each API domain in `src/test/mocks/handlers/`:
- `authHandlers.ts` -- login, register, token refresh
- `postsHandlers.ts` -- posts CRUD
- `pagesHandlers.ts` -- pages CRUD
- `mediaHandlers.ts` -- media CRUD
- `usersHandlers.ts` -- users CRUD
- `taxonomiesHandlers.ts` -- categories/tags
- `commentsHandlers.ts` -- comments CRUD
- `settingsHandlers.ts` -- site settings
- `pluginsHandlers.ts` -- plugin management
- `dashboardHandlers.ts` -- dashboard metrics
- `databaseHandlers.ts` -- database operations

### 8.2 Data Factories

Use factory functions to generate test data:
```typescript
// src/test/mocks/data/posts.ts
export function createPost(overrides?: Partial<Post>): Post {
  return {
    id: crypto.randomUUID(),
    title: 'Test Post',
    slug: 'test-post',
    content: '<p>Test content</p>',
    status: 'draft',
    author_id: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}
```

---

## 9. Coverage Target Breakdown

| Area | Current | Target | Gap |
|------|---------|--------|-----|
| Stores (14 files) | 0% | 85% | 14 test files needed |
| API client | 0% | 90% | 1 test file needed |
| Design system (169 components) | 0% | 60% | ~50 test files needed |
| Page components | 0% | 50% | ~15 test files needed |
| Feature components | ~5% (VQM only) | 70% | ~10 test files needed |
| E2E critical flows | 0% | 100% | ~10 spec files needed |
| **Overall** | **<1%** | **70%** | **~100 test files needed** |

---

## 10. Estimated Effort

| Phase | Work | Time Estimate |
|-------|------|---------------|
| Setup infrastructure | Dependencies, configs, setup files, CI | 2-4 hours |
| Store unit tests (14) | Test all stores | 8-12 hours |
| API client tests | Interceptors, error handling | 2-3 hours |
| Core component tests (30) | Top design system components | 10-15 hours |
| Page tests (15) | Critical admin pages | 8-12 hours |
| E2E setup + tests (10) | Playwright critical flows | 10-15 hours |
| A11y audit | axe-core on all pages | 4-6 hours |
| **Total** | | **44-67 hours** |
