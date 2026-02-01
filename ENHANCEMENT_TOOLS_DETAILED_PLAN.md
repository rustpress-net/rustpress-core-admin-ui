# RustPress Post Editor - 51 Enhancement Tools Detailed Implementation Plan

## Document Overview

This document provides comprehensive implementation details for all 51 enhancement tools including:
- **Description**: What the tool does and why it's needed
- **Frontend Components**: React components and UI elements
- **Backend API**: Rust API endpoints and data structures
- **Database Schema**: Required database tables/fields
- **Settings & Configuration**: User-configurable options
- **Integration Points**: How it connects with the editor
- **Test Coverage**: Unit, integration, and E2E tests

---

# CATEGORY 1: CONTENT BLOCKS (4 Tools)

---

## Tool 1: Block Library

### 1.1 Description
The Block Library provides a visual interface for users to browse and insert content blocks into their posts. It serves as the primary way to add structured content elements like paragraphs, headings, images, quotes, lists, code blocks, and more.

### 1.2 Frontend Components

```
src/components/posts/modals/BlockLibraryModal.tsx
├── BlockGrid - Grid display of available blocks
├── BlockCard - Individual block type card with icon and description
├── BlockSearch - Search/filter blocks by name or category
├── BlockCategories - Category sidebar (Text, Media, Layout, Interactive, etc.)
└── BlockPreview - Preview of block before insertion
```

**State Management:**
```typescript
interface BlockLibraryState {
  searchQuery: string;
  selectedCategory: 'all' | 'text' | 'media' | 'layout' | 'interactive' | 'embed' | 'advanced';
  recentBlocks: string[];
  favoriteBlocks: string[];
}
```

### 1.3 Backend API

```rust
// src/api/blocks.rs

/// GET /api/blocks
/// Returns all available block types with metadata
#[get("/blocks")]
async fn list_blocks() -> Json<Vec<BlockType>> { }

/// GET /api/blocks/recent
/// Returns user's recently used blocks
#[get("/blocks/recent")]
async fn get_recent_blocks(user_id: Uuid) -> Json<Vec<String>> { }

/// POST /api/blocks/recent
/// Updates user's recently used blocks
#[post("/blocks/recent")]
async fn update_recent_blocks(user_id: Uuid, block_id: String) -> Json<()> { }

/// GET /api/blocks/favorites
/// Returns user's favorite blocks
#[get("/blocks/favorites")]
async fn get_favorite_blocks(user_id: Uuid) -> Json<Vec<String>> { }

/// POST /api/blocks/favorites/{block_id}
/// Toggle block as favorite
#[post("/blocks/favorites/{block_id}")]
async fn toggle_favorite_block(user_id: Uuid, block_id: String) -> Json<bool> { }
```

**Data Structures:**
```rust
#[derive(Serialize, Deserialize)]
pub struct BlockType {
    pub id: String,
    pub name: String,
    pub description: String,
    pub icon: String,
    pub category: BlockCategory,
    pub default_html: String,
    pub supports: BlockSupports,
    pub is_pro: bool,
}

#[derive(Serialize, Deserialize)]
pub struct BlockSupports {
    pub alignment: bool,
    pub color: bool,
    pub typography: bool,
    pub spacing: bool,
    pub anchor: bool,
    pub custom_class: bool,
}

#[derive(Serialize, Deserialize)]
pub enum BlockCategory {
    Text,
    Media,
    Layout,
    Interactive,
    Embed,
    Advanced,
}
```

### 1.4 Database Schema

```sql
-- User block preferences
CREATE TABLE user_block_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recent_blocks JSONB DEFAULT '[]',
    favorite_blocks JSONB DEFAULT '[]',
    custom_blocks JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom block definitions (user-created blocks)
CREATE TABLE custom_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    category VARCHAR(50) DEFAULT 'custom',
    html_template TEXT NOT NULL,
    css_styles TEXT,
    js_scripts TEXT,
    settings JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_block_preferences_user_id ON user_block_preferences(user_id);
CREATE INDEX idx_custom_blocks_user_id ON custom_blocks(user_id);
```

### 1.5 Settings & Configuration

```typescript
interface BlockLibrarySettings {
  // Display settings
  viewMode: 'grid' | 'list';
  gridColumns: 2 | 3 | 4;
  showDescriptions: boolean;
  showCategories: boolean;

  // Behavior settings
  closeOnInsert: boolean;
  insertPosition: 'cursor' | 'end' | 'after-current-block';

  // Filter settings
  hiddenCategories: string[];
  hiddenBlocks: string[];

  // Pro settings
  showProBlocks: boolean;
}
```

**Admin Settings (Global):**
```typescript
interface AdminBlockSettings {
  enabledBlocks: string[];
  disabledBlocks: string[];
  customBlocksEnabled: boolean;
  maxCustomBlocks: number;
  allowHtmlBlock: boolean;
  allowScriptBlock: boolean;
}
```

### 1.6 Integration Points

1. **Editor Integration:**
   - Toolbar button opens Block Library modal
   - Keyboard shortcut: `/` to open quick insert
   - Drag and drop blocks into editor
   - Context menu "Insert block after"

2. **Content Sync:**
   - Visual Editor: Appends HTML to content
   - Block Editor: Creates new block object
   - HTML Editor: Inserts at cursor position

3. **Event Hooks:**
   ```typescript
   onBlockInsert(blockId: string, html: string): void;
   onBlockSelect(blockId: string): void;
   onBlockFavorite(blockId: string, isFavorite: boolean): void;
   ```

### 1.7 Test Coverage

#### Unit Tests
```typescript
// __tests__/BlockLibraryModal.unit.test.tsx

describe('BlockLibraryModal', () => {
  describe('Rendering', () => {
    it('should render all block categories', () => {});
    it('should render block grid with correct number of blocks', () => {});
    it('should show block descriptions when enabled', () => {});
    it('should highlight favorite blocks', () => {});
    it('should show recent blocks section', () => {});
  });

  describe('Search & Filter', () => {
    it('should filter blocks by search query', () => {});
    it('should filter blocks by category', () => {});
    it('should show "no results" when no blocks match', () => {});
    it('should clear search when category changes', () => {});
  });

  describe('Block Selection', () => {
    it('should call onInsertBlock when block is clicked', () => {});
    it('should close modal after insertion when closeOnInsert is true', () => {});
    it('should keep modal open when closeOnInsert is false', () => {});
    it('should add block to recent blocks on insert', () => {});
  });

  describe('Favorites', () => {
    it('should toggle favorite status on star click', () => {});
    it('should persist favorites to localStorage', () => {});
    it('should load favorites from localStorage on mount', () => {});
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {});
    it('should support keyboard navigation', () => {});
    it('should trap focus within modal', () => {});
    it('should close on Escape key', () => {});
  });
});
```

#### Integration Tests
```typescript
// __tests__/BlockLibraryModal.integration.test.tsx

describe('BlockLibraryModal Integration', () => {
  describe('Editor Integration', () => {
    it('should insert paragraph block into Visual Editor', async () => {});
    it('should insert heading block into Block Editor', async () => {});
    it('should insert code block into HTML Editor', async () => {});
    it('should maintain cursor position after insert in HTML Editor', async () => {});
  });

  describe('API Integration', () => {
    it('should fetch recent blocks from API on mount', async () => {});
    it('should update recent blocks via API after insert', async () => {});
    it('should sync favorites with backend', async () => {});
  });

  describe('Settings Integration', () => {
    it('should respect hidden blocks setting', async () => {});
    it('should apply view mode from settings', async () => {});
  });
});
```

#### E2E Tests
```typescript
// e2e/block-library.spec.ts

describe('Block Library E2E', () => {
  beforeEach(async () => {
    await page.goto('/admin/posts/new');
  });

  it('should open Block Library from toolbar', async () => {
    await page.click('[data-testid="toolbar-block-library"]');
    await expect(page.locator('[data-testid="block-library-modal"]')).toBeVisible();
  });

  it('should insert heading block and show in editor', async () => {
    await page.click('[data-testid="toolbar-block-library"]');
    await page.click('[data-testid="block-heading"]');
    await expect(page.locator('.editor-content h2')).toBeVisible();
  });

  it('should search and filter blocks', async () => {
    await page.click('[data-testid="toolbar-block-library"]');
    await page.fill('[data-testid="block-search"]', 'image');
    await expect(page.locator('[data-testid="block-card"]')).toHaveCount(2); // image, gallery
  });

  it('should remember recent blocks across sessions', async () => {
    // Insert a block
    await page.click('[data-testid="toolbar-block-library"]');
    await page.click('[data-testid="block-quote"]');

    // Reload page
    await page.reload();

    // Check recent blocks
    await page.click('[data-testid="toolbar-block-library"]');
    await expect(page.locator('[data-testid="recent-blocks"] [data-block-id="quote"]')).toBeVisible();
  });
});
```

---

## Tool 2: Animations (55+)

### 2.1 Description
The Animations library provides 55+ pre-built CSS/JS animations that users can apply to any content element. Animations include entrance effects (fade in, slide in), exit effects (fade out, slide out), emphasis effects (pulse, shake, bounce), scroll-triggered animations, and motion paths.

### 2.2 Frontend Components

```
src/components/posts/modals/BlockLibraryModal.tsx (animations tab)
├── AnimationGrid - Grid of animation previews
├── AnimationCard - Individual animation with live preview
├── AnimationPreview - Animated preview box
├── AnimationSettings - Duration, delay, easing, repeat controls
├── AnimationCategories - Entrance, Exit, Emphasis, Scroll, etc.
└── AnimationCode - Generated CSS/HTML output
```

**State Management:**
```typescript
interface AnimationState {
  selectedAnimation: string | null;
  previewAnimation: string | null;
  favoriteAnimations: string[];
  recentAnimations: string[];
  settings: AnimationSettings;
}

interface AnimationSettings {
  duration: number;        // ms (100-5000)
  delay: number;           // ms (0-2000)
  easing: EasingFunction;  // ease, ease-in, ease-out, ease-in-out, linear, cubic-bezier
  repeat: number;          // 1-10 or -1 for infinite
  repeatDelay: number;     // ms between repeats
  direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode: 'none' | 'forwards' | 'backwards' | 'both';
  trigger: 'load' | 'scroll' | 'hover' | 'click';
  scrollOffset: number;    // px from viewport edge to trigger
}
```

### 2.3 Backend API

```rust
// src/api/animations.rs

/// GET /api/animations
/// Returns all available animations
#[get("/animations")]
async fn list_animations() -> Json<Vec<Animation>> { }

/// GET /api/animations/{id}
/// Returns animation details with CSS keyframes
#[get("/animations/{id}")]
async fn get_animation(id: String) -> Json<AnimationDetail> { }

/// POST /api/animations/custom
/// Create custom animation
#[post("/animations/custom")]
async fn create_custom_animation(
    user_id: Uuid,
    animation: CreateAnimationRequest
) -> Json<Animation> { }

/// GET /api/animations/presets
/// Returns animation presets (combinations)
#[get("/animations/presets")]
async fn get_animation_presets() -> Json<Vec<AnimationPreset>> { }
```

**Data Structures:**
```rust
#[derive(Serialize, Deserialize)]
pub struct Animation {
    pub id: String,
    pub name: String,
    pub category: AnimationCategory,
    pub duration: u32,
    pub preview_description: String,
    pub css_keyframes: String,
    pub css_class: String,
    pub is_pro: bool,
}

#[derive(Serialize, Deserialize)]
pub enum AnimationCategory {
    Entrance,
    Exit,
    Emphasis,
    MotionPath,
    Rotation,
    Scale,
    Scroll,
}

#[derive(Serialize, Deserialize)]
pub struct AnimationPreset {
    pub id: String,
    pub name: String,
    pub description: String,
    pub animations: Vec<AnimationStep>,
}

#[derive(Serialize, Deserialize)]
pub struct AnimationStep {
    pub animation_id: String,
    pub delay: u32,
    pub target: String, // CSS selector
}
```

### 2.4 Database Schema

```sql
-- Animation library
CREATE TABLE animations (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    duration INTEGER DEFAULT 500,
    preview_description TEXT,
    css_keyframes TEXT NOT NULL,
    css_class VARCHAR(100) NOT NULL,
    is_pro BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom user animations
CREATE TABLE user_animations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) DEFAULT 'custom',
    css_keyframes TEXT NOT NULL,
    css_class VARCHAR(100) NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User animation preferences
CREATE TABLE user_animation_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    favorite_animations JSONB DEFAULT '[]',
    recent_animations JSONB DEFAULT '[]',
    default_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Animation presets (combinations)
CREATE TABLE animation_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    steps JSONB NOT NULL,
    is_system BOOLEAN DEFAULT FALSE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_animations_category ON animations(category);
CREATE INDEX idx_user_animations_user_id ON user_animations(user_id);
```

### 2.5 Settings & Configuration

```typescript
interface AnimationLibrarySettings {
  // Default animation settings
  defaultDuration: number;
  defaultEasing: EasingFunction;
  defaultTrigger: 'load' | 'scroll' | 'hover' | 'click';

  // Preview settings
  autoPlayPreview: boolean;
  previewSpeed: number; // 0.5x, 1x, 2x

  // Output settings
  outputFormat: 'inline-style' | 'css-class' | 'data-attribute';
  includeKeyframes: boolean;
  minifyOutput: boolean;

  // Scroll animation settings
  defaultScrollOffset: number;
  scrollThrottle: number;
}
```

### 2.6 Integration Points

1. **Editor Integration:**
   - Select element → Apply animation
   - Animation preview on hover
   - Animation timeline for sequencing

2. **Output Formats:**
   ```html
   <!-- Inline style -->
   <div style="animation: fadeIn 500ms ease-out forwards;">Content</div>

   <!-- CSS class -->
   <div class="animate-fade-in">Content</div>

   <!-- Data attribute (JS-triggered) -->
   <div data-animation="fadeIn" data-trigger="scroll" data-offset="100">Content</div>
   ```

3. **Required Assets:**
   - Animation CSS file included in theme
   - Animation JS for scroll/click triggers
   - Intersection Observer polyfill

### 2.7 Test Coverage

#### Unit Tests
```typescript
// __tests__/AnimationsLibrary.unit.test.tsx

describe('AnimationsLibrary', () => {
  describe('Animation Selection', () => {
    it('should display all 55+ animations', () => {});
    it('should filter animations by category', () => {});
    it('should search animations by name', () => {});
    it('should preview animation on hover', () => {});
    it('should select animation on click', () => {});
  });

  describe('Animation Settings', () => {
    it('should update duration slider', () => {});
    it('should update delay input', () => {});
    it('should change easing function', () => {});
    it('should set repeat count', () => {});
    it('should toggle infinite repeat', () => {});
    it('should set animation direction', () => {});
    it('should set fill mode', () => {});
    it('should set trigger type', () => {});
  });

  describe('Animation Preview', () => {
    it('should play animation in preview box', () => {});
    it('should update preview when settings change', () => {});
    it('should pause preview on button click', () => {});
    it('should replay animation on replay button', () => {});
  });

  describe('Code Generation', () => {
    it('should generate correct inline style', () => {});
    it('should generate correct CSS class', () => {});
    it('should generate correct data attributes', () => {});
    it('should include keyframes when enabled', () => {});
  });

  describe('Favorites & Recent', () => {
    it('should add animation to favorites', () => {});
    it('should remove animation from favorites', () => {});
    it('should track recent animations', () => {});
    it('should limit recent animations to 10', () => {});
  });
});
```

#### Integration Tests
```typescript
// __tests__/AnimationsLibrary.integration.test.tsx

describe('AnimationsLibrary Integration', () => {
  describe('Editor Integration', () => {
    it('should wrap selected text with animation', async () => {});
    it('should apply animation to selected block', async () => {});
    it('should insert animated element at cursor', async () => {});
  });

  describe('Theme Integration', () => {
    it('should include animation CSS in preview', async () => {});
    it('should include animation JS for triggers', async () => {});
  });

  describe('API Integration', () => {
    it('should fetch animations from backend', async () => {});
    it('should save custom animations', async () => {});
    it('should sync preferences with backend', async () => {});
  });
});
```

#### E2E Tests
```typescript
// e2e/animations.spec.ts

describe('Animations E2E', () => {
  it('should apply fade-in animation to paragraph', async () => {
    await page.goto('/admin/posts/new');
    await page.fill('.editor-content', 'Test paragraph');
    await page.selectText('.editor-content p');
    await page.click('[data-testid="toolbar-animations"]');
    await page.click('[data-animation-id="fade-in"]');
    await page.click('[data-testid="insert-animation"]');

    const element = page.locator('.editor-content p');
    await expect(element).toHaveClass(/animate-fade-in/);
  });

  it('should preview animation on hover', async () => {
    await page.click('[data-testid="toolbar-animations"]');
    await page.hover('[data-animation-id="bounce"]');

    const preview = page.locator('[data-testid="animation-preview-box"]');
    await expect(preview).toHaveCSS('animation-name', 'bounce');
  });

  it('should customize animation duration', async () => {
    await page.click('[data-testid="toolbar-animations"]');
    await page.click('[data-animation-id="slide-in"]');
    await page.fill('[data-testid="duration-input"]', '1000');

    const code = await page.locator('[data-testid="animation-code"]').textContent();
    expect(code).toContain('1000ms');
  });
});
```

---

## Tool 3: Templates

### 3.1 Description
The Templates library provides pre-built content templates that users can insert into their posts. Templates range from simple sections (hero, features, pricing) to complete page layouts. Users can also save their own content as reusable templates.

### 3.2 Frontend Components

```
src/components/posts/modals/BlockLibraryModal.tsx (templates tab)
├── TemplateGrid - Grid of template thumbnails
├── TemplateCard - Template preview with name, category, pro badge
├── TemplatePreview - Full-size template preview modal
├── TemplateCategories - Sidebar with template categories
├── TemplateSearch - Search templates by name/tag
├── SaveTemplateModal - Save current content as template
└── TemplateSettings - Template variables/placeholders
```

**State Management:**
```typescript
interface TemplateLibraryState {
  searchQuery: string;
  selectedCategory: string | null;
  selectedTemplate: string | null;
  previewTemplate: string | null;
  userTemplates: Template[];
  systemTemplates: Template[];
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  html: string;
  css?: string;
  variables: TemplateVariable[];
  isPro: boolean;
  isUserTemplate: boolean;
  author?: string;
  downloads?: number;
  rating?: number;
}

interface TemplateVariable {
  name: string;
  type: 'text' | 'image' | 'color' | 'link';
  defaultValue: string;
  placeholder: string;
}
```

### 3.3 Backend API

```rust
// src/api/templates.rs

/// GET /api/templates
/// Returns all available templates
#[get("/templates")]
async fn list_templates(
    category: Option<String>,
    search: Option<String>,
    page: u32,
    limit: u32
) -> Json<PaginatedResponse<Template>> { }

/// GET /api/templates/{id}
/// Returns template details with full HTML
#[get("/templates/{id}")]
async fn get_template(id: Uuid) -> Json<TemplateDetail> { }

/// POST /api/templates
/// Create user template
#[post("/templates")]
async fn create_template(
    user_id: Uuid,
    template: CreateTemplateRequest
) -> Json<Template> { }

/// PUT /api/templates/{id}
/// Update user template
#[put("/templates/{id}")]
async fn update_template(
    user_id: Uuid,
    id: Uuid,
    template: UpdateTemplateRequest
) -> Json<Template> { }

/// DELETE /api/templates/{id}
/// Delete user template
#[delete("/templates/{id}")]
async fn delete_template(user_id: Uuid, id: Uuid) -> Json<()> { }

/// GET /api/templates/categories
/// Returns template categories
#[get("/templates/categories")]
async fn get_template_categories() -> Json<Vec<TemplateCategory>> { }

/// POST /api/templates/{id}/download
/// Track template download/usage
#[post("/templates/{id}/download")]
async fn track_template_download(id: Uuid) -> Json<()> { }
```

**Data Structures:**
```rust
#[derive(Serialize, Deserialize)]
pub struct Template {
    pub id: Uuid,
    pub name: String,
    pub description: String,
    pub category: String,
    pub thumbnail_url: String,
    pub html_content: String,
    pub css_content: Option<String>,
    pub variables: Vec<TemplateVariable>,
    pub is_pro: bool,
    pub is_system: bool,
    pub author_id: Option<Uuid>,
    pub downloads: u32,
    pub rating: f32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Serialize, Deserialize)]
pub struct TemplateVariable {
    pub name: String,
    pub var_type: TemplateVarType,
    pub default_value: String,
    pub placeholder: String,
    pub required: bool,
}

#[derive(Serialize, Deserialize)]
pub enum TemplateVarType {
    Text,
    LongText,
    Image,
    Color,
    Link,
    Number,
    Select(Vec<String>),
}

#[derive(Serialize, Deserialize)]
pub struct TemplateCategory {
    pub id: String,
    pub name: String,
    pub description: String,
    pub count: u32,
    pub icon: String,
}
```

### 3.4 Database Schema

```sql
-- Template categories
CREATE TABLE template_categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id VARCHAR(50) REFERENCES template_categories(id),
    thumbnail_url TEXT,
    html_content TEXT NOT NULL,
    css_content TEXT,
    variables JSONB DEFAULT '[]',
    is_pro BOOLEAN DEFAULT FALSE,
    is_system BOOLEAN DEFAULT FALSE,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    downloads INTEGER DEFAULT 0,
    rating_sum INTEGER DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT FALSE,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Template ratings
CREATE TABLE template_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(template_id, user_id)
);

-- Template usage tracking
CREATE TABLE template_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_templates_category ON templates(category_id);
CREATE INDEX idx_templates_author ON templates(author_id);
CREATE INDEX idx_templates_public ON templates(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_template_usage_template ON template_usage(template_id);
```

### 3.5 Settings & Configuration

```typescript
interface TemplateLibrarySettings {
  // Display settings
  viewMode: 'grid' | 'list';
  thumbnailSize: 'small' | 'medium' | 'large';
  showRatings: boolean;
  showDownloads: boolean;

  // Insertion settings
  replaceContent: boolean;  // Replace all content or append
  processVariables: boolean; // Show variable form before insert

  // User templates
  maxUserTemplates: number;
  allowPublicTemplates: boolean;

  // Pro settings
  showProTemplates: boolean;
}
```

### 3.6 Integration Points

1. **Variable Processing:**
   ```html
   <!-- Template with variables -->
   <section class="hero">
     <h1>{{title}}</h1>
     <p>{{description}}</p>
     <img src="{{hero_image}}" alt="{{hero_alt}}">
     <a href="{{cta_link}}" style="background: {{cta_color}}">{{cta_text}}</a>
   </section>
   ```

2. **Save as Template:**
   - Select content in editor
   - Click "Save as Template"
   - Define variables for dynamic parts
   - Set category and visibility

### 3.7 Test Coverage

#### Unit Tests
```typescript
describe('TemplatesLibrary', () => {
  describe('Template Display', () => {
    it('should render template grid', () => {});
    it('should show template thumbnails', () => {});
    it('should filter by category', () => {});
    it('should search templates', () => {});
    it('should show pro badge for premium templates', () => {});
  });

  describe('Template Preview', () => {
    it('should open preview modal on click', () => {});
    it('should render full template in preview', () => {});
    it('should show template variables', () => {});
  });

  describe('Template Insertion', () => {
    it('should insert template HTML', () => {});
    it('should process variables before insertion', () => {});
    it('should replace placeholders with values', () => {});
  });

  describe('User Templates', () => {
    it('should save content as template', () => {});
    it('should edit user template', () => {});
    it('should delete user template', () => {});
    it('should extract variables from content', () => {});
  });
});
```

#### Integration Tests
```typescript
describe('TemplatesLibrary Integration', () => {
  it('should fetch templates from API', async () => {});
  it('should paginate template results', async () => {});
  it('should save template to backend', async () => {});
  it('should track template usage', async () => {});
  it('should rate template', async () => {});
});
```

#### E2E Tests
```typescript
describe('Templates E2E', () => {
  it('should insert hero template into editor', async () => {});
  it('should fill template variables and insert', async () => {});
  it('should save current content as template', async () => {});
  it('should filter templates by category', async () => {});
});
```

---

## Tool 4: Media Library

### 4.1 Description
The Media Library provides a centralized interface for browsing, uploading, and managing media files (images, videos, audio, documents). Users can insert media into posts, edit metadata, and organize files into folders.

### 4.2 Frontend Components

```
src/components/posts/modals/BlockLibraryModal.tsx (media tab)
├── MediaGrid - Grid/list view of media files
├── MediaCard - Individual media item with thumbnail
├── MediaUploader - Drag & drop upload zone
├── MediaFilters - Filter by type, date, folder
├── MediaDetails - Selected media metadata panel
├── MediaEditor - Basic image editing (crop, resize)
├── FolderTree - Folder navigation sidebar
└── BulkActions - Multi-select actions
```

**State Management:**
```typescript
interface MediaLibraryState {
  viewMode: 'grid' | 'list';
  sortBy: 'date' | 'name' | 'size' | 'type';
  sortOrder: 'asc' | 'desc';
  filterType: 'all' | 'image' | 'video' | 'audio' | 'document';
  filterFolder: string | null;
  searchQuery: string;
  selectedItems: string[];
  currentFolder: string | null;
  uploadProgress: Record<string, number>;
}

interface MediaItem {
  id: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  url: string;
  thumbnailUrl: string;
  alt: string;
  caption: string;
  folderId: string | null;
  uploadedBy: string;
  uploadedAt: string;
  metadata: Record<string, any>;
}
```

### 4.3 Backend API

```rust
// src/api/media.rs

/// GET /api/media
/// List media files with filtering and pagination
#[get("/media")]
async fn list_media(
    query: MediaQuery,
    page: u32,
    limit: u32
) -> Json<PaginatedResponse<MediaItem>> { }

/// POST /api/media/upload
/// Upload media file(s)
#[post("/media/upload")]
async fn upload_media(
    user_id: Uuid,
    files: Vec<UploadedFile>,
    folder_id: Option<Uuid>
) -> Json<Vec<MediaItem>> { }

/// GET /api/media/{id}
/// Get media item details
#[get("/media/{id}")]
async fn get_media(id: Uuid) -> Json<MediaItem> { }

/// PUT /api/media/{id}
/// Update media metadata
#[put("/media/{id}")]
async fn update_media(
    id: Uuid,
    update: UpdateMediaRequest
) -> Json<MediaItem> { }

/// DELETE /api/media/{id}
/// Delete media item
#[delete("/media/{id}")]
async fn delete_media(id: Uuid) -> Json<()> { }

/// POST /api/media/{id}/duplicate
/// Duplicate media item
#[post("/media/{id}/duplicate")]
async fn duplicate_media(id: Uuid) -> Json<MediaItem> { }

/// POST /api/media/bulk-delete
/// Delete multiple media items
#[post("/media/bulk-delete")]
async fn bulk_delete_media(ids: Vec<Uuid>) -> Json<BulkDeleteResult> { }

/// GET /api/media/folders
/// List media folders
#[get("/media/folders")]
async fn list_folders() -> Json<Vec<MediaFolder>> { }

/// POST /api/media/folders
/// Create media folder
#[post("/media/folders")]
async fn create_folder(folder: CreateFolderRequest) -> Json<MediaFolder> { }

/// POST /api/media/{id}/optimize
/// Optimize image (compress, resize, convert)
#[post("/media/{id}/optimize")]
async fn optimize_media(
    id: Uuid,
    options: OptimizeOptions
) -> Json<MediaItem> { }
```

**Data Structures:**
```rust
#[derive(Serialize, Deserialize)]
pub struct MediaItem {
    pub id: Uuid,
    pub filename: String,
    pub original_filename: String,
    pub mime_type: String,
    pub size: u64,
    pub width: Option<u32>,
    pub height: Option<u32>,
    pub duration: Option<u32>,
    pub url: String,
    pub thumbnail_url: Option<String>,
    pub alt_text: String,
    pub caption: String,
    pub folder_id: Option<Uuid>,
    pub uploaded_by: Uuid,
    pub uploaded_at: DateTime<Utc>,
    pub metadata: serde_json::Value,
}

#[derive(Serialize, Deserialize)]
pub struct MediaFolder {
    pub id: Uuid,
    pub name: String,
    pub parent_id: Option<Uuid>,
    pub item_count: u32,
    pub created_at: DateTime<Utc>,
}

#[derive(Serialize, Deserialize)]
pub struct OptimizeOptions {
    pub quality: u8,           // 1-100
    pub max_width: Option<u32>,
    pub max_height: Option<u32>,
    pub convert_to: Option<String>, // webp, avif
    pub strip_metadata: bool,
}
```

### 4.4 Database Schema

```sql
-- Media folders
CREATE TABLE media_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    parent_id UUID REFERENCES media_folders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media items
CREATE TABLE media_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(500) NOT NULL,
    original_filename VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size BIGINT NOT NULL,
    width INTEGER,
    height INTEGER,
    duration INTEGER,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    alt_text TEXT DEFAULT '',
    caption TEXT DEFAULT '',
    folder_id UUID REFERENCES media_folders(id) ON DELETE SET NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    is_optimized BOOLEAN DEFAULT FALSE,
    original_size BIGINT,
    optimized_url TEXT
);

-- Media usage tracking (which posts use which media)
CREATE TABLE media_post_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_id UUID NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(media_id, post_id)
);

CREATE INDEX idx_media_items_folder ON media_items(folder_id);
CREATE INDEX idx_media_items_uploaded_by ON media_items(uploaded_by);
CREATE INDEX idx_media_items_mime_type ON media_items(mime_type);
CREATE INDEX idx_media_items_uploaded_at ON media_items(uploaded_at DESC);
CREATE INDEX idx_media_post_usage_media ON media_post_usage(media_id);
CREATE INDEX idx_media_post_usage_post ON media_post_usage(post_id);
```

### 4.5 Settings & Configuration

```typescript
interface MediaLibrarySettings {
  // Upload settings
  maxFileSize: number;           // bytes
  allowedMimeTypes: string[];
  autoOptimize: boolean;
  optimizeQuality: number;
  generateThumbnails: boolean;
  thumbnailSize: { width: number; height: number };

  // Display settings
  defaultViewMode: 'grid' | 'list';
  itemsPerPage: number;
  showFileSize: boolean;
  showDimensions: boolean;

  // Storage settings
  storageProvider: 'local' | 's3' | 'cloudflare' | 'gcs';
  cdnUrl: string;

  // Organization
  defaultFolder: string | null;
  autoCreateDateFolders: boolean;
}
```

### 4.6 Integration Points

1. **Upload Methods:**
   - Drag & drop to upload zone
   - Click to browse files
   - Paste from clipboard
   - Import from URL

2. **Insertion Formats:**
   ```html
   <!-- Image -->
   <figure>
     <img src="{{url}}" alt="{{alt}}" width="{{width}}" height="{{height}}" loading="lazy">
     <figcaption>{{caption}}</figcaption>
   </figure>

   <!-- Video -->
   <video controls width="{{width}}" height="{{height}}" poster="{{thumbnail}}">
     <source src="{{url}}" type="{{mimeType}}">
   </video>

   <!-- Audio -->
   <audio controls>
     <source src="{{url}}" type="{{mimeType}}">
   </audio>

   <!-- Document link -->
   <a href="{{url}}" download="{{filename}}">{{filename}} ({{size}})</a>
   ```

### 4.7 Test Coverage

#### Unit Tests
```typescript
describe('MediaLibrary', () => {
  describe('Display', () => {
    it('should render media grid', () => {});
    it('should render media list', () => {});
    it('should show thumbnails for images', () => {});
    it('should show video thumbnails', () => {});
    it('should show file icons for documents', () => {});
  });

  describe('Filtering & Sorting', () => {
    it('should filter by media type', () => {});
    it('should filter by folder', () => {});
    it('should search by filename', () => {});
    it('should sort by date', () => {});
    it('should sort by name', () => {});
    it('should sort by size', () => {});
  });

  describe('Upload', () => {
    it('should accept drag and drop', () => {});
    it('should show upload progress', () => {});
    it('should validate file type', () => {});
    it('should validate file size', () => {});
    it('should handle multiple files', () => {});
  });

  describe('Selection', () => {
    it('should select single item', () => {});
    it('should multi-select with ctrl/cmd', () => {});
    it('should range select with shift', () => {});
    it('should show selection count', () => {});
  });

  describe('Actions', () => {
    it('should insert media into editor', () => {});
    it('should edit media metadata', () => {});
    it('should delete media', () => {});
    it('should duplicate media', () => {});
    it('should move media to folder', () => {});
  });
});
```

#### Integration Tests
```typescript
describe('MediaLibrary Integration', () => {
  it('should upload file to backend', async () => {});
  it('should fetch media list from API', async () => {});
  it('should paginate results', async () => {});
  it('should update media metadata', async () => {});
  it('should delete media from backend', async () => {});
  it('should create folders', async () => {});
  it('should optimize images', async () => {});
});
```

#### E2E Tests
```typescript
describe('MediaLibrary E2E', () => {
  it('should upload image and insert into post', async () => {});
  it('should search and filter media', async () => {});
  it('should edit image alt text', async () => {});
  it('should create folder and move items', async () => {});
  it('should bulk delete selected items', async () => {});
});
```

---

# CATEGORY 2: VISUAL ELEMENTS (5 Tools)

---

## Tool 5: Carousel

### 5.1 Description
The Carousel tool allows users to create responsive image and content sliders with customizable navigation, autoplay, effects, and layout options. Supports multiple slide types including images, videos, and custom HTML content.

### 5.2 Frontend Components

```
src/components/posts/modals/VisualElementsModal.tsx (carousel tab)
├── SlideList - Sortable list of slides
├── SlideEditor - Edit individual slide content
├── SlidePreview - Live carousel preview
├── CarouselSettings - Configuration panel
│   ├── AutoplaySettings - Speed, pause on hover
│   ├── NavigationSettings - Arrows, dots, thumbnails
│   ├── EffectSettings - Slide, fade, cube, flip
│   └── ResponsiveSettings - Breakpoint configurations
└── CarouselCode - Generated HTML/CSS output
```

**State Management:**
```typescript
interface CarouselState {
  slides: CarouselSlide[];
  selectedSlideIndex: number;
  settings: CarouselSettings;
  previewMode: 'desktop' | 'tablet' | 'mobile';
}

interface CarouselSlide {
  id: string;
  type: 'image' | 'video' | 'html';
  content: string;
  title?: string;
  description?: string;
  link?: string;
  background?: string;
}

interface CarouselSettings {
  autoplay: boolean;
  autoplaySpeed: number;
  pauseOnHover: boolean;
  showDots: boolean;
  showArrows: boolean;
  showThumbnails: boolean;
  infinite: boolean;
  slidesToShow: number;
  slidesToScroll: number;
  effect: 'slide' | 'fade' | 'cube' | 'flip' | 'coverflow';
  speed: number;
  gap: number;
  centerMode: boolean;
  adaptiveHeight: boolean;
  lazyLoad: boolean;
  responsive: ResponsiveBreakpoint[];
}

interface ResponsiveBreakpoint {
  breakpoint: number;
  slidesToShow: number;
  slidesToScroll: number;
}
```

### 5.3 Backend API

```rust
// src/api/carousels.rs

/// POST /api/carousels
/// Save carousel configuration
#[post("/carousels")]
async fn create_carousel(
    user_id: Uuid,
    carousel: CreateCarouselRequest
) -> Json<Carousel> { }

/// GET /api/carousels/{id}
/// Get carousel by ID
#[get("/carousels/{id}")]
async fn get_carousel(id: Uuid) -> Json<Carousel> { }

/// PUT /api/carousels/{id}
/// Update carousel
#[put("/carousels/{id}")]
async fn update_carousel(
    id: Uuid,
    carousel: UpdateCarouselRequest
) -> Json<Carousel> { }

/// GET /api/carousels/presets
/// Get carousel presets
#[get("/carousels/presets")]
async fn get_carousel_presets() -> Json<Vec<CarouselPreset>> { }
```

### 5.4 Database Schema

```sql
-- Saved carousels (for reusability)
CREATE TABLE carousels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    slides JSONB NOT NULL,
    settings JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Carousel usage in posts
CREATE TABLE post_carousels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    carousel_id UUID REFERENCES carousels(id) ON DELETE SET NULL,
    inline_config JSONB, -- If not using saved carousel
    position INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5.5 Settings & Configuration

```typescript
interface CarouselGlobalSettings {
  defaultEffect: string;
  defaultAutoplaySpeed: number;
  defaultSlidesToShow: number;
  enabledEffects: string[];
  maxSlides: number;
  lazyLoadDefault: boolean;
}
```

### 5.6 Integration Points

1. **Output HTML:**
```html
<div class="rustpress-carousel"
     data-autoplay="true"
     data-speed="3000"
     data-effect="slide"
     data-slides-to-show="1">
  <div class="carousel-slide">
    <img src="slide1.jpg" alt="Slide 1" loading="lazy">
  </div>
  <div class="carousel-slide">
    <img src="slide2.jpg" alt="Slide 2" loading="lazy">
  </div>
</div>
```

2. **Required Assets:**
   - Swiper.js or similar library
   - Carousel CSS styles
   - Initialization script

### 5.7 Test Coverage

#### Unit Tests
```typescript
describe('Carousel', () => {
  describe('Slide Management', () => {
    it('should add new slide', () => {});
    it('should remove slide', () => {});
    it('should reorder slides via drag and drop', () => {});
    it('should duplicate slide', () => {});
    it('should edit slide content', () => {});
  });

  describe('Settings', () => {
    it('should toggle autoplay', () => {});
    it('should set autoplay speed', () => {});
    it('should change effect type', () => {});
    it('should configure responsive breakpoints', () => {});
  });

  describe('Preview', () => {
    it('should render carousel preview', () => {});
    it('should apply effect in preview', () => {});
    it('should respond to device preview changes', () => {});
  });

  describe('Code Generation', () => {
    it('should generate valid HTML', () => {});
    it('should include data attributes', () => {});
    it('should include lazy loading', () => {});
  });
});
```

#### Integration Tests
```typescript
describe('Carousel Integration', () => {
  it('should save carousel to backend', async () => {});
  it('should load saved carousel', async () => {});
  it('should insert carousel into editor', async () => {});
});
```

#### E2E Tests
```typescript
describe('Carousel E2E', () => {
  it('should create carousel with 3 slides', async () => {});
  it('should configure autoplay and insert', async () => {});
  it('should preview carousel in editor', async () => {});
});
```

---

## Tool 6: Gallery Grid

### 6.1 Description
The Gallery Grid tool creates responsive image galleries with multiple layout options (grid, masonry, justified), lightbox support, captions, and hover effects.

### 6.2 Frontend Components

```
src/components/posts/modals/VisualElementsModal.tsx (gallery tab)
├── GalleryImages - Image selection/upload area
├── GalleryPreview - Live gallery preview
├── GallerySettings - Configuration panel
│   ├── LayoutSettings - Grid, masonry, justified
│   ├── LightboxSettings - Enable, animation, captions
│   ├── HoverSettings - Zoom, overlay, tilt effects
│   └── SizeSettings - Columns, gap, thumbnail size
└── GalleryCode - Generated HTML output
```

**State Management:**
```typescript
interface GalleryState {
  images: GalleryImage[];
  settings: GallerySettings;
}

interface GalleryImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
}

interface GallerySettings {
  layout: 'grid' | 'masonry' | 'justified';
  columns: number;
  gap: number;
  thumbnailSize: 'small' | 'medium' | 'large';
  aspectRatio: 'auto' | '1:1' | '4:3' | '16:9';
  enableLightbox: boolean;
  lightboxAnimation: 'fade' | 'zoom' | 'slide';
  showCaptions: boolean;
  captionPosition: 'overlay' | 'below';
  hoverEffect: 'none' | 'zoom' | 'overlay' | 'tilt' | 'fade';
  lazyLoad: boolean;
  borderRadius: number;
}
```

### 6.3 Backend API

```rust
// src/api/galleries.rs

/// POST /api/galleries
/// Save gallery configuration
#[post("/galleries")]
async fn create_gallery(gallery: CreateGalleryRequest) -> Json<Gallery> { }

/// GET /api/galleries/{id}
/// Get gallery by ID
#[get("/galleries/{id}")]
async fn get_gallery(id: Uuid) -> Json<Gallery> { }

/// PUT /api/galleries/{id}
/// Update gallery
#[put("/galleries/{id}")]
async fn update_gallery(id: Uuid, gallery: UpdateGalleryRequest) -> Json<Gallery> { }
```

### 6.4 Database Schema

```sql
CREATE TABLE galleries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    images JSONB NOT NULL,
    settings JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6.5 Settings & Configuration

```typescript
interface GalleryGlobalSettings {
  defaultLayout: 'grid' | 'masonry' | 'justified';
  defaultColumns: number;
  defaultGap: number;
  enableLightboxByDefault: boolean;
  defaultHoverEffect: string;
  maxImagesPerGallery: number;
}
```

### 6.6 Integration Points

1. **Output HTML:**
```html
<div class="rustpress-gallery"
     data-layout="masonry"
     data-columns="3"
     data-lightbox="true">
  <figure class="gallery-item">
    <img src="thumb1.jpg" data-full="full1.jpg" alt="Image 1" loading="lazy">
    <figcaption>Caption 1</figcaption>
  </figure>
  <!-- more items -->
</div>
```

### 6.7 Test Coverage

```typescript
describe('Gallery', () => {
  describe('Image Management', () => {
    it('should add images from media library', () => {});
    it('should remove image from gallery', () => {});
    it('should reorder images', () => {});
    it('should edit image caption', () => {});
  });

  describe('Layout', () => {
    it('should render grid layout', () => {});
    it('should render masonry layout', () => {});
    it('should render justified layout', () => {});
    it('should adjust columns', () => {});
  });

  describe('Lightbox', () => {
    it('should enable/disable lightbox', () => {});
    it('should configure lightbox animation', () => {});
  });
});
```

---

## Tool 7: Before/After Slider

### 7.1 Description
Creates interactive comparison sliders for before/after images. Users can drag a handle to reveal the comparison between two images.

### 7.2 Frontend Components

```
src/components/posts/modals/VisualElementsModal.tsx (before-after tab)
├── ImageUpload - Before and after image upload
├── SliderPreview - Interactive preview
├── SliderSettings - Configuration panel
│   ├── OrientationSettings - Horizontal/vertical
│   ├── HandleSettings - Style, color, size
│   ├── LabelSettings - Before/after labels
│   └── InteractionSettings - Drag, hover, click
└── SliderCode - Generated HTML output
```

**State Management:**
```typescript
interface BeforeAfterState {
  beforeImage: ImageData | null;
  afterImage: ImageData | null;
  settings: BeforeAfterSettings;
}

interface BeforeAfterSettings {
  orientation: 'horizontal' | 'vertical';
  defaultPosition: number; // 0-100
  showLabels: boolean;
  beforeLabel: string;
  afterLabel: string;
  handleStyle: 'circle' | 'line' | 'arrows';
  handleColor: string;
  moveOnHover: boolean;
  moveOnClick: boolean;
  smooth: boolean;
  overlayOpacity: number;
}
```

### 7.3 Backend API

```rust
// src/api/comparisons.rs

/// POST /api/comparisons
/// Save comparison configuration
#[post("/comparisons")]
async fn create_comparison(comparison: CreateComparisonRequest) -> Json<Comparison> { }
```

### 7.4 Database Schema

```sql
CREATE TABLE comparisons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    before_image_url TEXT NOT NULL,
    after_image_url TEXT NOT NULL,
    settings JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 7.5 Integration Points

```html
<div class="rustpress-comparison"
     data-orientation="horizontal"
     data-position="50">
  <img class="comparison-before" src="before.jpg" alt="Before">
  <img class="comparison-after" src="after.jpg" alt="After">
  <div class="comparison-handle"></div>
  <span class="comparison-label comparison-label-before">Before</span>
  <span class="comparison-label comparison-label-after">After</span>
</div>
```

### 7.6 Test Coverage

```typescript
describe('BeforeAfterSlider', () => {
  describe('Images', () => {
    it('should upload before image', () => {});
    it('should upload after image', () => {});
    it('should swap images', () => {});
  });

  describe('Interaction', () => {
    it('should drag handle', () => {});
    it('should move on hover when enabled', () => {});
    it('should click to move when enabled', () => {});
  });

  describe('Settings', () => {
    it('should toggle orientation', () => {});
    it('should set default position', () => {});
    it('should customize labels', () => {});
    it('should change handle style', () => {});
  });
});
```

---

## Tool 8: Table Editor

### 8.1 Description
A visual table editor for creating and styling data tables with sorting, filtering, pagination, and responsive options.

### 8.2 Frontend Components

```
src/components/posts/modals/VisualElementsModal.tsx (table tab)
├── TableGrid - Editable table grid
├── TableToolbar - Add/remove rows/columns
├── CellEditor - Edit cell content
├── TableSettings - Configuration panel
│   ├── StyleSettings - Theme, borders, stripes
│   ├── HeaderSettings - Sticky, style
│   ├── FeatureSettings - Sort, filter, paginate
│   └── ResponsiveSettings - Stack, scroll
└── TableCode - Generated HTML output
```

**State Management:**
```typescript
interface TableState {
  data: TableCell[][];
  headers: string[];
  settings: TableSettings;
}

interface TableSettings {
  theme: 'default' | 'minimal' | 'striped' | 'bordered';
  headerStyle: 'none' | 'filled' | 'bordered';
  enableSorting: boolean;
  enableFiltering: boolean;
  enablePagination: boolean;
  rowsPerPage: number;
  stickyHeader: boolean;
  responsive: 'scroll' | 'stack' | 'hide-columns';
  compactMode: boolean;
  cellPadding: 'small' | 'medium' | 'large';
  alignment: 'left' | 'center' | 'right';
  showRowNumbers: boolean;
}
```

### 8.3 Backend API

```rust
// src/api/tables.rs

/// POST /api/tables
/// Save table configuration
#[post("/tables")]
async fn create_table(table: CreateTableRequest) -> Json<Table> { }

/// POST /api/tables/import
/// Import table from CSV/Excel
#[post("/tables/import")]
async fn import_table(file: UploadedFile) -> Json<TableData> { }

/// POST /api/tables/export
/// Export table to CSV/Excel
#[post("/tables/export")]
async fn export_table(table: ExportTableRequest) -> Response { }
```

### 8.4 Database Schema

```sql
CREATE TABLE saved_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200),
    data JSONB NOT NULL,
    headers JSONB NOT NULL,
    settings JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 8.5 Integration Points

```html
<div class="rustpress-table"
     data-sortable="true"
     data-filterable="true"
     data-paginate="true"
     data-per-page="10">
  <table>
    <thead>
      <tr><th>Name</th><th>Value</th></tr>
    </thead>
    <tbody>
      <tr><td>Row 1</td><td>100</td></tr>
    </tbody>
  </table>
</div>
```

### 8.6 Test Coverage

```typescript
describe('TableEditor', () => {
  describe('Data Entry', () => {
    it('should add row', () => {});
    it('should add column', () => {});
    it('should delete row', () => {});
    it('should delete column', () => {});
    it('should edit cell', () => {});
    it('should paste from clipboard', () => {});
  });

  describe('Import/Export', () => {
    it('should import CSV', () => {});
    it('should import Excel', () => {});
    it('should export to CSV', () => {});
  });

  describe('Features', () => {
    it('should enable sorting', () => {});
    it('should enable filtering', () => {});
    it('should enable pagination', () => {});
  });
});
```

---

## Tool 9: Embeds

### 9.1 Description
Embed external content from popular platforms (YouTube, Vimeo, Twitter, Instagram, CodePen, etc.) with responsive sizing and customization options.

### 9.2 Frontend Components

```
src/components/posts/modals/VisualElementsModal.tsx (embed tab)
├── EmbedUrlInput - URL input with auto-detection
├── EmbedPreview - Live preview of embed
├── ProviderSelector - Manual provider selection
├── EmbedSettings - Configuration panel
│   ├── SizeSettings - Width, height, aspect ratio
│   ├── PlayerSettings - Autoplay, controls, loop
│   ├── PrivacySettings - No-cookie mode
│   └── CaptionSettings - Caption text
└── EmbedCode - Generated HTML output
```

**State Management:**
```typescript
interface EmbedState {
  url: string;
  provider: EmbedProvider | null;
  embedId: string | null;
  settings: EmbedSettings;
  preview: string | null;
}

type EmbedProvider =
  | 'youtube' | 'vimeo' | 'twitter' | 'instagram'
  | 'tiktok' | 'codepen' | 'spotify' | 'soundcloud'
  | 'custom';

interface EmbedSettings {
  provider: EmbedProvider;
  aspectRatio: 'auto' | '16:9' | '4:3' | '1:1' | '9:16';
  maxWidth: number;
  alignment: 'left' | 'center' | 'right';
  autoplay: boolean;
  showControls: boolean;
  loop: boolean;
  muted: boolean;
  startTime: number;
  privacyMode: boolean;
  lazyLoad: boolean;
  showCaption: boolean;
  caption: string;
}
```

### 9.3 Backend API

```rust
// src/api/embeds.rs

/// POST /api/embeds/parse
/// Parse URL and return embed info
#[post("/embeds/parse")]
async fn parse_embed_url(url: String) -> Json<EmbedInfo> { }

/// GET /api/embeds/oembed
/// Get oEmbed data for URL
#[get("/embeds/oembed")]
async fn get_oembed(url: String) -> Json<OEmbedResponse> { }
```

### 9.4 Database Schema

```sql
-- Cache for oEmbed responses
CREATE TABLE oembed_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url_hash VARCHAR(64) NOT NULL UNIQUE,
    url TEXT NOT NULL,
    provider VARCHAR(50),
    response JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_oembed_cache_url_hash ON oembed_cache(url_hash);
```

### 9.5 Integration Points

```html
<!-- YouTube embed (privacy mode) -->
<div class="rustpress-embed" data-provider="youtube">
  <iframe
    src="https://www.youtube-nocookie.com/embed/VIDEO_ID?autoplay=0&controls=1"
    width="560"
    height="315"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
    loading="lazy">
  </iframe>
  <p class="embed-caption">Video caption</p>
</div>
```

### 9.6 Test Coverage

```typescript
describe('Embeds', () => {
  describe('URL Parsing', () => {
    it('should detect YouTube URL', () => {});
    it('should detect Vimeo URL', () => {});
    it('should detect Twitter URL', () => {});
    it('should detect Instagram URL', () => {});
    it('should handle invalid URL', () => {});
  });

  describe('Preview', () => {
    it('should show preview for YouTube', () => {});
    it('should show preview for Vimeo', () => {});
    it('should show error for invalid embed', () => {});
  });

  describe('Settings', () => {
    it('should set aspect ratio', () => {});
    it('should enable privacy mode', () => {});
    it('should set start time', () => {});
    it('should enable autoplay', () => {});
  });
});
```

---

# CATEGORY 3: SEO & ANALYSIS (7 Tools)

---

## Tool 10: SEO Analyzer

### 10.1 Description
Comprehensive SEO analysis tool that evaluates content for search engine optimization, including title, meta description, keyword usage, headings, images, and links.

### 10.2 Frontend Components

```
src/components/posts/modals/SEOAnalysisModal.tsx (seo tab)
├── SEOScoreOverview - Overall score display (0-100)
├── FocusKeywordInput - Target keyword input
├── AnalysisResults - List of SEO checks
│   ├── TitleAnalysis - Title length, keyword presence
│   ├── MetaAnalysis - Description length, keyword
│   ├── ContentAnalysis - Word count, keyword density
│   ├── HeadingAnalysis - H1-H6 structure
│   ├── ImageAnalysis - Alt text, file names
│   └── LinkAnalysis - Internal/external links
├── Suggestions - Improvement recommendations
└── SEOSettings - Configuration options
```

**State Management:**
```typescript
interface SEOAnalysisState {
  focusKeyword: string;
  score: number;
  results: SEOCheckResult[];
  suggestions: SEOSuggestion[];
  isAnalyzing: boolean;
}

interface SEOCheckResult {
  id: string;
  name: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  score: number;
  maxScore: number;
  details?: string;
}

interface SEOSuggestion {
  type: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  action?: string;
}
```

### 10.3 Backend API

```rust
// src/api/seo.rs

/// POST /api/seo/analyze
/// Analyze content for SEO
#[post("/seo/analyze")]
async fn analyze_seo(content: AnalyzeSEORequest) -> Json<SEOAnalysisResult> { }

/// GET /api/seo/suggestions
/// Get SEO suggestions for focus keyword
#[get("/seo/suggestions")]
async fn get_seo_suggestions(keyword: String) -> Json<Vec<KeywordSuggestion>> { }

/// POST /api/seo/generate-meta
/// Generate meta title and description
#[post("/seo/generate-meta")]
async fn generate_meta(content: GenerateMetaRequest) -> Json<MetaSuggestions> { }
```

**Data Structures:**
```rust
#[derive(Serialize, Deserialize)]
pub struct SEOAnalysisResult {
    pub score: u32,
    pub max_score: u32,
    pub checks: Vec<SEOCheck>,
    pub suggestions: Vec<SEOSuggestion>,
}

#[derive(Serialize, Deserialize)]
pub struct SEOCheck {
    pub id: String,
    pub name: String,
    pub status: CheckStatus,
    pub message: String,
    pub score: u32,
    pub max_score: u32,
    pub details: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub enum CheckStatus {
    Pass,
    Warning,
    Fail,
}
```

### 10.4 Database Schema

```sql
-- SEO analysis history
CREATE TABLE seo_analysis_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    focus_keyword VARCHAR(200),
    score INTEGER,
    results JSONB,
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SEO settings per post
CREATE TABLE post_seo_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL UNIQUE REFERENCES posts(id) ON DELETE CASCADE,
    focus_keyword VARCHAR(200),
    meta_title VARCHAR(200),
    meta_description TEXT,
    canonical_url TEXT,
    robots_meta VARCHAR(100),
    og_title VARCHAR(200),
    og_description TEXT,
    og_image TEXT,
    twitter_title VARCHAR(200),
    twitter_description TEXT,
    twitter_image TEXT,
    schema_type VARCHAR(50),
    schema_data JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_seo_analysis_history_post ON seo_analysis_history(post_id);
```

### 10.5 Settings & Configuration

```typescript
interface SEOAnalyzerSettings {
  // Enabled checks
  checkTitleLength: boolean;
  checkMetaDescription: boolean;
  checkKeywordDensity: boolean;
  checkHeadingStructure: boolean;
  checkImageAltTags: boolean;
  checkInternalLinks: boolean;
  checkExternalLinks: boolean;

  // Thresholds
  minWordCount: number;
  maxWordCount: number;
  targetKeywordDensity: { min: number; max: number };
  minTitleLength: number;
  maxTitleLength: number;
  minDescriptionLength: number;
  maxDescriptionLength: number;

  // Features
  enableRealTimeAnalysis: boolean;
  showScoreInEditor: boolean;
  showSuggestionsInline: boolean;
}
```

### 10.6 Integration Points

1. **Real-time Analysis:**
   - Debounced analysis on content change
   - Score badge in editor toolbar
   - Inline suggestions

2. **Auto-generation:**
   - Generate meta title from content
   - Generate meta description from content
   - Suggest focus keywords

### 10.7 Test Coverage

```typescript
describe('SEOAnalyzer', () => {
  describe('Score Calculation', () => {
    it('should calculate overall SEO score', () => {});
    it('should weight checks appropriately', () => {});
    it('should handle missing content gracefully', () => {});
  });

  describe('Title Analysis', () => {
    it('should check title length', () => {});
    it('should check keyword in title', () => {});
    it('should warn about title too long', () => {});
    it('should warn about title too short', () => {});
  });

  describe('Meta Description', () => {
    it('should check description length', () => {});
    it('should check keyword in description', () => {});
  });

  describe('Content Analysis', () => {
    it('should count words', () => {});
    it('should calculate keyword density', () => {});
    it('should detect keyword stuffing', () => {});
  });

  describe('Heading Analysis', () => {
    it('should check for H1', () => {});
    it('should check heading hierarchy', () => {});
    it('should check keyword in headings', () => {});
  });

  describe('Image Analysis', () => {
    it('should check for alt text', () => {});
    it('should check keyword in alt text', () => {});
  });

  describe('Link Analysis', () => {
    it('should count internal links', () => {});
    it('should count external links', () => {});
    it('should check for broken links', () => {});
  });
});
```

---

## Tool 11: Readability

### 11.1 Description
Analyzes content readability using various formulas (Flesch-Kincaid, Gunning Fog, Coleman-Liau, SMOG) and provides suggestions for improving text clarity.

### 11.2 Frontend Components

```
src/components/posts/modals/SEOAnalysisModal.tsx (readability tab)
├── ReadabilityScore - Overall readability grade
├── FormulaSelector - Choose readability formula
├── MetricsDisplay - Sentence length, word complexity
├── IssuesList - Highlighted problem areas
│   ├── ComplexSentences - Long/complex sentences
│   ├── PassiveVoice - Passive voice usage
│   ├── HardWords - Difficult vocabulary
│   └── Paragraphs - Long paragraphs
├── Suggestions - Simplification suggestions
└── ReadabilitySettings - Configuration
```

**State Management:**
```typescript
interface ReadabilityState {
  formula: ReadabilityFormula;
  score: number;
  grade: string;
  metrics: ReadabilityMetrics;
  issues: ReadabilityIssue[];
}

type ReadabilityFormula =
  | 'flesch-kincaid'
  | 'gunning-fog'
  | 'coleman-liau'
  | 'smog'
  | 'automated';

interface ReadabilityMetrics {
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  avgWordsPerSentence: number;
  avgSyllablesPerWord: number;
  complexWordCount: number;
  passiveVoiceCount: number;
}

interface ReadabilityIssue {
  type: 'sentence-length' | 'passive-voice' | 'complex-word' | 'paragraph-length';
  severity: 'low' | 'medium' | 'high';
  text: string;
  position: { start: number; end: number };
  suggestion: string;
}
```

### 11.3 Backend API

```rust
// src/api/readability.rs

/// POST /api/readability/analyze
/// Analyze content readability
#[post("/readability/analyze")]
async fn analyze_readability(
    content: String,
    formula: Option<String>
) -> Json<ReadabilityResult> { }

/// POST /api/readability/simplify
/// Suggest simplified version of text
#[post("/readability/simplify")]
async fn simplify_text(text: String) -> Json<SimplifyResult> { }
```

### 11.4 Settings & Configuration

```typescript
interface ReadabilitySettings {
  formula: ReadabilityFormula;
  targetGrade: number; // Target reading grade level
  highlightIssues: boolean;
  maxSentenceLength: number;
  maxParagraphLength: number;
  checkPassiveVoice: boolean;
  checkComplexWords: boolean;
  checkConsecutiveSentences: boolean;
}
```

### 11.5 Test Coverage

```typescript
describe('Readability', () => {
  describe('Score Calculation', () => {
    it('should calculate Flesch-Kincaid score', () => {});
    it('should calculate Gunning Fog score', () => {});
    it('should calculate Coleman-Liau score', () => {});
    it('should calculate SMOG score', () => {});
  });

  describe('Metrics', () => {
    it('should count words', () => {});
    it('should count sentences', () => {});
    it('should calculate average sentence length', () => {});
    it('should count syllables', () => {});
    it('should identify complex words', () => {});
  });

  describe('Issues Detection', () => {
    it('should detect long sentences', () => {});
    it('should detect passive voice', () => {});
    it('should detect complex words', () => {});
    it('should detect long paragraphs', () => {});
  });
});
```

---

## Tool 12: Keywords

### 12.1 Description
Keyword analysis tool for tracking keyword density, placement, and optimization across the content.

### 12.2 Frontend Components

```
src/components/posts/modals/SEOAnalysisModal.tsx (keywords tab)
├── PrimaryKeyword - Main target keyword
├── SecondaryKeywords - Additional keywords list
├── DensityAnalysis - Keyword density chart
├── PlacementCheck - Where keywords appear
├── SuggestedKeywords - Related keyword suggestions
└── KeywordSettings - Configuration
```

### 12.3 Test Coverage

```typescript
describe('Keywords', () => {
  describe('Density', () => {
    it('should calculate keyword density', () => {});
    it('should warn about under-optimization', () => {});
    it('should warn about over-optimization', () => {});
  });

  describe('Placement', () => {
    it('should check keyword in title', () => {});
    it('should check keyword in first paragraph', () => {});
    it('should check keyword in headings', () => {});
    it('should check keyword in meta description', () => {});
    it('should check keyword in URL', () => {});
  });

  describe('Suggestions', () => {
    it('should suggest related keywords', () => {});
    it('should suggest long-tail keywords', () => {});
  });
});
```

---

## Tool 13: Headings

### 13.1 Description
Analyzes and visualizes the heading structure (H1-H6) of the content, checking for proper hierarchy and SEO optimization.

### 13.2 Frontend Components

```
src/components/posts/modals/SEOAnalysisModal.tsx (headings tab)
├── HeadingStructure - Visual tree of headings
├── HeadingList - Clickable list of all headings
├── HierarchyAnalysis - Check for proper nesting
├── KeywordAnalysis - Keywords in headings
└── HeadingSettings - Configuration
```

### 13.3 Test Coverage

```typescript
describe('Headings', () => {
  describe('Structure', () => {
    it('should parse all headings', () => {});
    it('should build heading tree', () => {});
    it('should detect skipped levels', () => {});
  });

  describe('Validation', () => {
    it('should require single H1', () => {});
    it('should check proper nesting', () => {});
    it('should check heading length', () => {});
    it('should check keyword presence', () => {});
  });
});
```

---

## Tool 14: Schema Markup

### 14.1 Description
Generate and manage JSON-LD structured data (Schema.org) for better search engine understanding of content.

### 14.2 Frontend Components

```
src/components/posts/modals/SEOAnalysisModal.tsx (schema tab)
├── SchemaTypeSelector - Article, FAQ, HowTo, etc.
├── SchemaForm - Dynamic form based on type
├── SchemaPreview - JSON-LD code preview
├── ValidationStatus - Schema validation
└── SchemaSettings - Configuration
```

### 14.3 Backend API

```rust
// src/api/schema.rs

/// POST /api/schema/generate
/// Generate schema markup for content
#[post("/schema/generate")]
async fn generate_schema(content: GenerateSchemaRequest) -> Json<SchemaMarkup> { }

/// POST /api/schema/validate
/// Validate schema markup
#[post("/schema/validate")]
async fn validate_schema(schema: String) -> Json<ValidationResult> { }
```

### 14.4 Test Coverage

```typescript
describe('SchemaMarkup', () => {
  describe('Generation', () => {
    it('should generate Article schema', () => {});
    it('should generate FAQ schema', () => {});
    it('should generate HowTo schema', () => {});
    it('should generate Product schema', () => {});
    it('should generate Recipe schema', () => {});
  });

  describe('Validation', () => {
    it('should validate required fields', () => {});
    it('should validate JSON-LD syntax', () => {});
    it('should check for Google requirements', () => {});
  });
});
```

---

## Tool 15: Internal Links

### 15.1 Description
Suggests and manages internal links to other posts/pages for improved site structure and SEO.

### 15.2 Frontend Components

```
src/components/posts/modals/SEOAnalysisModal.tsx (links tab)
├── SuggestedLinks - AI-suggested internal links
├── CurrentLinks - Existing internal links
├── LinkOpportunities - Phrases to link
├── OrphanCheck - Posts without links
└── LinkSettings - Configuration
```

### 15.3 Backend API

```rust
// src/api/internal-links.rs

/// POST /api/internal-links/suggest
/// Suggest internal links for content
#[post("/internal-links/suggest")]
async fn suggest_internal_links(content: String) -> Json<Vec<LinkSuggestion>> { }

/// GET /api/internal-links/opportunities
/// Find linking opportunities in content
#[get("/internal-links/opportunities")]
async fn find_link_opportunities(post_id: Uuid) -> Json<Vec<LinkOpportunity>> { }
```

### 15.4 Test Coverage

```typescript
describe('InternalLinks', () => {
  describe('Suggestions', () => {
    it('should suggest relevant posts', () => {});
    it('should find anchor text opportunities', () => {});
    it('should avoid over-linking', () => {});
  });

  describe('Analysis', () => {
    it('should list current internal links', () => {});
    it('should detect broken internal links', () => {});
    it('should identify orphan pages', () => {});
  });
});
```

---

## Tool 16: Link Checker

### 16.1 Description
Validates all links in content (internal and external) and reports broken, redirected, or suspicious links.

### 16.2 Frontend Components

```
src/components/posts/modals/SEOAnalysisModal.tsx (checker tab)
├── LinkList - All links in content
├── CheckStatus - Check progress/results
├── BrokenLinks - List of broken links
├── RedirectLinks - Links with redirects
├── FixSuggestions - How to fix issues
└── CheckerSettings - Configuration
```

### 16.3 Backend API

```rust
// src/api/link-checker.rs

/// POST /api/links/check
/// Check all links in content
#[post("/links/check")]
async fn check_links(content: String) -> Json<LinkCheckResult> { }

/// GET /api/links/check/{url}
/// Check single URL status
#[get("/links/check/{url}")]
async fn check_single_link(url: String) -> Json<LinkStatus> { }
```

### 16.4 Database Schema

```sql
-- Link check cache
CREATE TABLE link_check_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url_hash VARCHAR(64) NOT NULL UNIQUE,
    url TEXT NOT NULL,
    status_code INTEGER,
    is_broken BOOLEAN,
    redirect_url TEXT,
    error_message TEXT,
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);
```

### 16.5 Test Coverage

```typescript
describe('LinkChecker', () => {
  describe('Detection', () => {
    it('should find all links in content', () => {});
    it('should identify internal links', () => {});
    it('should identify external links', () => {});
  });

  describe('Validation', () => {
    it('should detect broken links (404)', () => {});
    it('should detect server errors (5xx)', () => {});
    it('should detect redirects', () => {});
    it('should handle timeout', () => {});
  });

  describe('Caching', () => {
    it('should cache link check results', () => {});
    it('should expire cache after timeout', () => {});
  });
});
```

---

# CATEGORY 4: PREVIEW OPTIONS (3 Tools)

---

## Tool 17: Device Preview

### 17.1 Description
Preview content as it appears on different devices (desktop, tablet, mobile) with accurate viewport sizes and responsive behavior.

### 17.2 Frontend Components

```
src/components/posts/modals/PreviewOptionsModal.tsx (device tab)
├── DeviceSelector - Desktop, tablet, mobile buttons
├── DeviceFrame - Visual device frame
├── PreviewContent - Rendered content
├── OrientationToggle - Portrait/landscape
├── ZoomControls - Zoom in/out
└── DeviceSettings - Configuration
```

### 17.3 Settings & Configuration

```typescript
interface DevicePreviewSettings {
  devices: {
    desktop: { width: number; height: number };
    tablet: { width: number; height: number };
    mobile: { width: number; height: number };
  };
  showDeviceFrame: boolean;
  showDimensionLabel: boolean;
  defaultDevice: 'desktop' | 'tablet' | 'mobile';
}
```

### 17.4 Test Coverage

```typescript
describe('DevicePreview', () => {
  describe('Rendering', () => {
    it('should render desktop preview', () => {});
    it('should render tablet preview (768px)', () => {});
    it('should render mobile preview (375px)', () => {});
  });

  describe('Interaction', () => {
    it('should switch between devices', () => {});
    it('should toggle orientation', () => {});
    it('should zoom in/out', () => {});
  });

  describe('Content', () => {
    it('should apply responsive styles', () => {});
    it('should show accurate dimensions', () => {});
  });
});
```

---

## Tool 18: Social Preview

### 18.1 Description
Preview how content appears when shared on social media platforms (Facebook, Twitter, LinkedIn).

### 18.2 Frontend Components

```
src/components/posts/modals/PreviewOptionsModal.tsx (social tab)
├── PlatformSelector - Facebook, Twitter, LinkedIn
├── PreviewCard - Social share card preview
├── MetaEditor - Edit OG/Twitter meta tags
├── ImageCropper - Adjust social image
└── CopyMetaTags - Copy generated tags
```

### 18.3 Test Coverage

```typescript
describe('SocialPreview', () => {
  describe('Platforms', () => {
    it('should show Facebook preview', () => {});
    it('should show Twitter preview', () => {});
    it('should show LinkedIn preview', () => {});
  });

  describe('Meta Tags', () => {
    it('should generate og:title', () => {});
    it('should generate og:description', () => {});
    it('should generate og:image', () => {});
    it('should generate twitter:card', () => {});
  });
});
```

---

## Tool 19: Content Outline

### 19.1 Description
Display document outline/table of contents based on heading structure with navigation support.

### 19.2 Frontend Components

```
src/components/posts/modals/PreviewOptionsModal.tsx (outline tab)
├── OutlineTree - Hierarchical heading tree
├── OutlineSettings - Max depth, numbering
├── ContentStats - Word count, reading time
├── ExportOutline - Export as list/markdown
└── NavigationLinks - Jump to section
```

### 19.3 Test Coverage

```typescript
describe('ContentOutline', () => {
  describe('Generation', () => {
    it('should build outline from headings', () => {});
    it('should respect max depth setting', () => {});
    it('should add numbering when enabled', () => {});
  });

  describe('Navigation', () => {
    it('should scroll to heading on click', () => {});
    it('should highlight current section', () => {});
  });

  describe('Export', () => {
    it('should export as HTML list', () => {});
    it('should export as Markdown', () => {});
  });
});
```

---

# CATEGORY 5: POST SETTINGS (10 Tools)

---

## Tool 20: Featured Image

### 20.1 Description
Set and manage the post's featured/thumbnail image with focal point selection, alt text, and caption.

### 20.2 Frontend Components

```
src/components/posts/modals/PostSettingsModal.tsx (featured tab)
├── ImageUploader - Upload/select image
├── ImagePreview - Preview with focal point
├── FocalPointSelector - Click to set focal point
├── AltTextInput - Alt text field
├── CaptionInput - Caption field
└── ImageSizes - View available sizes
```

### 20.3 Backend API

```rust
// src/api/posts.rs

/// PUT /api/posts/{id}/featured-image
/// Set featured image for post
#[put("/posts/{id}/featured-image")]
async fn set_featured_image(
    post_id: Uuid,
    image: FeaturedImageRequest
) -> Json<Post> { }
```

### 20.4 Database Schema

```sql
-- Posts table includes:
ALTER TABLE posts ADD COLUMN featured_image_id UUID REFERENCES media_items(id);
ALTER TABLE posts ADD COLUMN featured_image_focal_point JSONB; -- { x: 0.5, y: 0.5 }
ALTER TABLE posts ADD COLUMN featured_image_alt TEXT;
ALTER TABLE posts ADD COLUMN featured_image_caption TEXT;
```

### 20.5 Test Coverage

```typescript
describe('FeaturedImage', () => {
  describe('Selection', () => {
    it('should select image from media library', () => {});
    it('should upload new image', () => {});
    it('should remove featured image', () => {});
  });

  describe('Focal Point', () => {
    it('should set focal point on click', () => {});
    it('should preview focal point crop', () => {});
    it('should save focal point coordinates', () => {});
  });

  describe('Metadata', () => {
    it('should set alt text', () => {});
    it('should set caption', () => {});
  });
});
```

---

## Tool 21-29: Author, Categories, Tags, Visibility, Schedule, Excerpt, Slug, Discussion, Revisions

*(Similar detailed structure for each tool with Frontend Components, Backend API, Database Schema, Settings, and Test Coverage)*

---

# CATEGORY 6: METADATA & SEO (10 Tools)

## Tools 30-39: SEO Settings, Social Sharing, Custom Fields, Post Format, Template, Attributes, Related Posts, Series, Location, Language

*(Similar detailed structure for each tool)*

---

# CATEGORY 7: ADVANCED (6 Tools)

## Tools 40-45: Version History, Compare Versions, Analytics, Collaboration, Image Optimizer, Plugins

*(Similar detailed structure for each tool)*

---

# CATEGORY 8: AI ENHANCEMENT (6 Tools)

---

## Tool 46: AI Writing Assistant

### 46.1 Description
AI-powered writing assistant that helps improve, rewrite, expand, or shorten selected text using language models.

### 46.2 Frontend Components

```
src/components/posts/modals/AIToolsModal.tsx (assistant tab)
├── TextInput - Selected/input text
├── ToneSelector - Formal, casual, professional, etc.
├── ActionButtons - Improve, rewrite, expand, shorten
├── ResultPreview - AI-generated result
├── CustomPrompt - Custom instruction input
└── AISettings - Model, temperature settings
```

### 46.3 Backend API

```rust
// src/api/ai.rs

/// POST /api/ai/assist
/// Get AI writing assistance
#[post("/ai/assist")]
async fn ai_assist(request: AIAssistRequest) -> Json<AIAssistResponse> { }

#[derive(Serialize, Deserialize)]
pub struct AIAssistRequest {
    pub text: String,
    pub action: AIAction,
    pub tone: Option<String>,
    pub custom_prompt: Option<String>,
    pub max_tokens: Option<u32>,
}

#[derive(Serialize, Deserialize)]
pub enum AIAction {
    Improve,
    Rewrite,
    Expand,
    Shorten,
    FixGrammar,
    Simplify,
    Custom,
}
```

### 46.4 Database Schema

```sql
-- AI usage tracking
CREATE TABLE ai_usage_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    input_tokens INTEGER,
    output_tokens INTEGER,
    model VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI settings per user
CREATE TABLE user_ai_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    preferred_model VARCHAR(100) DEFAULT 'gpt-4',
    default_tone VARCHAR(50) DEFAULT 'professional',
    max_tokens INTEGER DEFAULT 1000,
    api_key_encrypted TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 46.5 Settings & Configuration

```typescript
interface AIAssistantSettings {
  model: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3' | 'custom';
  customApiEndpoint?: string;
  customApiKey?: string;
  defaultTone: string;
  maxTokens: number;
  temperature: number;
  showCostEstimate: boolean;
}
```

### 46.6 Test Coverage

```typescript
describe('AIWritingAssistant', () => {
  describe('Actions', () => {
    it('should improve selected text', async () => {});
    it('should rewrite in different tone', async () => {});
    it('should expand short text', async () => {});
    it('should shorten long text', async () => {});
    it('should fix grammar errors', async () => {});
  });

  describe('Integration', () => {
    it('should replace selected text with result', () => {});
    it('should insert result at cursor', () => {});
    it('should show loading state', () => {});
    it('should handle API errors', () => {});
  });

  describe('Settings', () => {
    it('should use selected tone', () => {});
    it('should respect max tokens', () => {});
    it('should use custom prompt', () => {});
  });
});
```

---

## Tool 47: AI Content Generator

### 47.1 Description
Generate content from prompts including introductions, outlines, full articles, and specific sections.

### 47.2 Frontend Components

```
src/components/posts/modals/AIToolsModal.tsx (generate tab)
├── GenerationType - Intro, outline, full, section
├── TopicInput - Main topic/prompt
├── ContextInput - Additional context
├── WordCountSelector - Target length
├── GenerateButton - Generate content
├── ResultPreview - Generated content
└── InsertOptions - Insert location
```

### 47.3 Backend API

```rust
/// POST /api/ai/generate
/// Generate content from prompt
#[post("/ai/generate")]
async fn ai_generate(request: AIGenerateRequest) -> Json<AIGenerateResponse> { }

#[derive(Serialize, Deserialize)]
pub struct AIGenerateRequest {
    pub generation_type: GenerationType,
    pub topic: String,
    pub context: Option<String>,
    pub word_count: u32,
    pub tone: Option<String>,
    pub keywords: Vec<String>,
}

#[derive(Serialize, Deserialize)]
pub enum GenerationType {
    Introduction,
    Outline,
    FullArticle,
    Section,
    Conclusion,
    FAQ,
}
```

### 47.4 Test Coverage

```typescript
describe('AIContentGenerator', () => {
  describe('Generation Types', () => {
    it('should generate introduction', async () => {});
    it('should generate outline', async () => {});
    it('should generate full article', async () => {});
    it('should generate section', async () => {});
    it('should generate FAQ', async () => {});
  });

  describe('Configuration', () => {
    it('should respect word count', async () => {});
    it('should include keywords', async () => {});
    it('should apply tone', async () => {});
  });

  describe('Insertion', () => {
    it('should insert at cursor', () => {});
    it('should append to content', () => {});
    it('should replace content', () => {});
  });
});
```

---

## Tool 48: AI Image Tools

### 48.1 Description
AI-powered image generation from text descriptions and automatic alt text generation for existing images.

### 48.2 Frontend Components

```
src/components/posts/modals/AIToolsModal.tsx (image tab)
├── GenerationMode - Generate / Alt Text
├── PromptInput - Image description
├── StyleSelector - Realistic, illustration, etc.
├── SizeSelector - Image dimensions
├── GenerateButton - Generate image
├── ResultGallery - Generated images
├── AltTextSection - Generate alt for existing images
└── ImageList - Select images for alt text
```

### 48.3 Backend API

```rust
/// POST /api/ai/image/generate
/// Generate image from prompt
#[post("/ai/image/generate")]
async fn ai_generate_image(request: AIImageRequest) -> Json<AIImageResponse> { }

/// POST /api/ai/image/alt-text
/// Generate alt text for image
#[post("/ai/image/alt-text")]
async fn ai_generate_alt_text(image_url: String) -> Json<AltTextResponse> { }
```

### 48.4 Test Coverage

```typescript
describe('AIImageTools', () => {
  describe('Image Generation', () => {
    it('should generate image from prompt', async () => {});
    it('should apply selected style', async () => {});
    it('should generate correct size', async () => {});
  });

  describe('Alt Text Generation', () => {
    it('should analyze image content', async () => {});
    it('should generate descriptive alt text', async () => {});
    it('should batch generate for multiple images', async () => {});
  });
});
```

---

## Tool 49: AI SEO Optimizer

### 49.1 Description
AI-powered SEO analysis and suggestions, including automatic meta tag generation and keyword recommendations.

### 49.2 Frontend Components

```
src/components/posts/modals/AIToolsModal.tsx (seo tab)
├── ContentAnalysis - AI SEO analysis
├── KeywordSuggestions - Recommended keywords
├── MetaGeneration - Generate meta title/desc
├── OptimizationTips - AI recommendations
└── ApplyActions - Apply suggestions
```

### 49.3 Test Coverage

```typescript
describe('AISEOOptimizer', () => {
  describe('Analysis', () => {
    it('should analyze content for SEO', async () => {});
    it('should identify optimization opportunities', async () => {});
  });

  describe('Generation', () => {
    it('should generate meta title', async () => {});
    it('should generate meta description', async () => {});
    it('should suggest keywords', async () => {});
  });

  describe('Application', () => {
    it('should apply meta title', () => {});
    it('should apply meta description', () => {});
    it('should add suggested keywords', () => {});
  });
});
```

---

## Tool 50: AI Translator

### 50.1 Description
Translate content to different languages while preserving formatting and creating linked translation posts.

### 50.2 Frontend Components

```
src/components/posts/modals/AIToolsModal.tsx (translate tab)
├── SourceLanguage - Current language
├── TargetLanguage - Target language selector
├── TextToTranslate - Content preview
├── PreserveFormatting - Keep HTML structure
├── TranslateButton - Start translation
├── ResultPreview - Translated content
└── CreateTranslation - Create linked post
```

### 50.3 Backend API

```rust
/// POST /api/ai/translate
/// Translate content
#[post("/ai/translate")]
async fn ai_translate(request: TranslateRequest) -> Json<TranslateResponse> { }

#[derive(Serialize, Deserialize)]
pub struct TranslateRequest {
    pub content: String,
    pub source_language: String,
    pub target_language: String,
    pub preserve_formatting: bool,
}
```

### 50.4 Test Coverage

```typescript
describe('AITranslator', () => {
  describe('Translation', () => {
    it('should translate to target language', async () => {});
    it('should preserve HTML formatting', async () => {});
    it('should handle multiple paragraphs', async () => {});
  });

  describe('Language Detection', () => {
    it('should detect source language', async () => {});
    it('should suggest common targets', () => {});
  });

  describe('Post Creation', () => {
    it('should create translation post', async () => {});
    it('should link translation to original', async () => {});
  });
});
```

---

## Tool 51: AI Summarizer

### 51.1 Description
Generate summaries of content in various formats (excerpt, TLDR, bullet points, key takeaways).

### 51.2 Frontend Components

```
src/components/posts/modals/AIToolsModal.tsx (summarize tab)
├── SummaryType - Excerpt, TLDR, bullets, takeaways
├── LengthSelector - Short, medium, long
├── ContentPreview - Content to summarize
├── SummarizeButton - Generate summary
├── ResultPreview - Generated summary
└── UseAsExcerpt - Set as post excerpt
```

### 51.3 Backend API

```rust
/// POST /api/ai/summarize
/// Generate content summary
#[post("/ai/summarize")]
async fn ai_summarize(request: SummarizeRequest) -> Json<SummarizeResponse> { }

#[derive(Serialize, Deserialize)]
pub struct SummarizeRequest {
    pub content: String,
    pub summary_type: SummaryType,
    pub max_length: u32,
}

#[derive(Serialize, Deserialize)]
pub enum SummaryType {
    Excerpt,
    TLDR,
    BulletPoints,
    KeyTakeaways,
}
```

### 51.4 Test Coverage

```typescript
describe('AISummarizer', () => {
  describe('Summary Types', () => {
    it('should generate excerpt', async () => {});
    it('should generate TLDR', async () => {});
    it('should generate bullet points', async () => {});
    it('should generate key takeaways', async () => {});
  });

  describe('Length Control', () => {
    it('should respect max length', async () => {});
    it('should adjust for short content', async () => {});
  });

  describe('Integration', () => {
    it('should set as post excerpt', () => {});
    it('should insert into content', () => {});
  });
});
```

---

# IMPLEMENTATION SUMMARY

## Total Components

| Category | Tools | Modal | Tabs | Tests Required |
|----------|-------|-------|------|----------------|
| Content Blocks | 4 | BlockLibraryModal | 4 | 120+ |
| Visual Elements | 5 | VisualElementsModal | 5 | 100+ |
| SEO & Analysis | 7 | SEOAnalysisModal | 7 | 140+ |
| Preview Options | 3 | PreviewOptionsModal | 3 | 60+ |
| Post Settings | 10 | PostSettingsModal | 10 | 200+ |
| Metadata & SEO | 10 | MetadataSEOModal | 10 | 200+ |
| Advanced | 6 | AdvancedModal | 6 | 120+ |
| AI Enhancement | 6 | AIToolsModal | 6 | 120+ |
| **TOTAL** | **51** | **8** | **51** | **1000+** |

## Backend API Endpoints Required

- Content Blocks: ~15 endpoints
- Visual Elements: ~20 endpoints
- SEO & Analysis: ~25 endpoints
- Preview Options: ~5 endpoints
- Post Settings: ~30 endpoints
- Metadata & SEO: ~25 endpoints
- Advanced: ~20 endpoints
- AI Enhancement: ~15 endpoints
- **Total: ~155 API endpoints**

## Database Tables Required

- Core tables: ~20
- Feature tables: ~35
- Cache tables: ~10
- **Total: ~65 tables**

## Test Files Structure

```
__tests__/
├── unit/
│   ├── modals/
│   │   ├── BlockLibraryModal.test.tsx
│   │   ├── VisualElementsModal.test.tsx
│   │   ├── SEOAnalysisModal.test.tsx
│   │   ├── PreviewOptionsModal.test.tsx
│   │   ├── PostSettingsModal.test.tsx
│   │   ├── MetadataSEOModal.test.tsx
│   │   ├── AdvancedModal.test.tsx
│   │   └── AIToolsModal.test.tsx
│   └── components/
│       └── ... (individual component tests)
├── integration/
│   ├── editor-integration.test.tsx
│   ├── api-integration.test.tsx
│   └── modal-integration.test.tsx
└── e2e/
    ├── block-library.spec.ts
    ├── visual-elements.spec.ts
    ├── seo-analysis.spec.ts
    ├── preview-options.spec.ts
    ├── post-settings.spec.ts
    ├── metadata-seo.spec.ts
    ├── advanced.spec.ts
    └── ai-tools.spec.ts
```
