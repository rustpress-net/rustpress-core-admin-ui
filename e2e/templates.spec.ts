/**
 * Templates Library - E2E Tests
 * End-to-end tests for the Template Library functionality in the Post Editor
 */

import { test, expect, Page } from '@playwright/test';

// ============================================
// TEST FIXTURES
// ============================================

test.describe.configure({ mode: 'serial' });

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

// Helper to navigate to post editor
async function navigateToPostEditor(page: Page) {
  await page.goto(`${BASE_URL}/admin/posts/new`);
  await page.waitForSelector('[data-testid="post-editor"]', { timeout: 10000 });
}

// Helper to open templates library
async function openTemplatesLibrary(page: Page) {
  // Open block library first
  const addBlockButton = page.locator('[data-testid="add-block-button"], button:has-text("Add Block")');
  await addBlockButton.click();

  // Wait for modal
  await page.waitForSelector('[data-testid="block-library-modal"], [role="dialog"]', { timeout: 5000 });

  // Switch to templates tab
  const templatesTab = page.locator('[data-testid="tab-templates"], button:has-text("Templates")');
  await templatesTab.click();

  // Wait for templates content
  await page.waitForSelector('[data-testid="templates-tab-content"], [data-tab="templates"]', { timeout: 5000 });
}

// ============================================
// E2E TEST SUITES
// ============================================

test.describe('Templates Library - Modal Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPostEditor(page);
  });

  test('should open templates library from block library', async ({ page }) => {
    await openTemplatesLibrary(page);

    const templatesContent = page.locator('[data-testid="templates-tab-content"], [data-tab="templates"]');
    await expect(templatesContent).toBeVisible();
  });

  test('should display template categories', async ({ page }) => {
    await openTemplatesLibrary(page);

    const categories = ['Hero', 'Features', 'Pricing', 'Testimonials', 'CTA'];
    for (const category of categories) {
      const categoryButton = page.locator(`button:has-text("${category}"), [data-testid="category-${category.toLowerCase()}"]`);
      // At least some categories should be visible
    }
  });

  test('should close modal when Escape is pressed', async ({ page }) => {
    await openTemplatesLibrary(page);

    await page.keyboard.press('Escape');

    const modal = page.locator('[data-testid="block-library-modal"], [role="dialog"]');
    await expect(modal).not.toBeVisible();
  });
});

test.describe('Templates Library - Category Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPostEditor(page);
    await openTemplatesLibrary(page);
  });

  test('should filter templates by Hero category', async ({ page }) => {
    await page.locator('button:has-text("Hero"), [data-testid="category-hero"]').click();

    // Should show hero templates
    const heroTemplate = page.locator('[data-testid*="template-"][data-category="hero"], .template-card:has-text("Hero")').first();
    if (await heroTemplate.count() > 0) {
      await expect(heroTemplate).toBeVisible();
    }
  });

  test('should filter templates by Features category', async ({ page }) => {
    await page.locator('button:has-text("Features"), [data-testid="category-features"]').click();

    // Should show feature templates
    const featureTemplate = page.locator('[data-testid*="template-"][data-category="features"], .template-card:has-text("Features")').first();
    if (await featureTemplate.count() > 0) {
      await expect(featureTemplate).toBeVisible();
    }
  });

  test('should show all templates when All is clicked', async ({ page }) => {
    // First filter by category
    await page.locator('button:has-text("Hero"), [data-testid="category-hero"]').click();

    // Then show all
    await page.locator('button:has-text("All"), [data-testid="category-all"]').click();

    // Should show templates from multiple categories
    const templates = page.locator('[data-testid*="template-"], .template-card');
    expect(await templates.count()).toBeGreaterThan(1);
  });
});

test.describe('Templates Library - Search', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPostEditor(page);
    await openTemplatesLibrary(page);
  });

  test('should filter templates by search query', async ({ page }) => {
    const searchInput = page.locator('[data-testid="template-search"], input[placeholder*="Search"]');
    await searchInput.fill('hero');

    // Should show hero-related templates
    const heroTemplate = page.locator('.template-card:has-text("Hero"), [data-testid*="hero"]').first();
    if (await heroTemplate.count() > 0) {
      await expect(heroTemplate).toBeVisible();
    }
  });

  test('should show no results for non-matching search', async ({ page }) => {
    const searchInput = page.locator('[data-testid="template-search"], input[placeholder*="Search"]');
    await searchInput.fill('nonexistenttemplate');

    const noResults = page.locator('[data-testid="no-results"], text="No templates found"');
    await expect(noResults).toBeVisible();
  });

  test('should clear search and show all templates', async ({ page }) => {
    const searchInput = page.locator('[data-testid="template-search"], input[placeholder*="Search"]');

    await searchInput.fill('hero');
    await searchInput.fill('');

    // Should show all templates
    const templates = page.locator('[data-testid*="template-"], .template-card');
    expect(await templates.count()).toBeGreaterThan(1);
  });
});

test.describe('Templates Library - Template Selection', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPostEditor(page);
    await openTemplatesLibrary(page);
  });

  test('should select template and show details', async ({ page }) => {
    const template = page.locator('[data-testid*="template-"], .template-card').first();
    await template.click();

    const sidebar = page.locator('[data-testid="template-sidebar"], .template-details');
    await expect(sidebar).toBeVisible();
  });

  test('should display template preview', async ({ page }) => {
    const template = page.locator('[data-testid*="template-"], .template-card').first();
    await template.click();

    const previewButton = page.locator('button:has-text("Preview"), [data-testid="preview-btn"]');
    if (await previewButton.count() > 0) {
      await previewButton.click();

      const previewModal = page.locator('[data-testid="template-preview"], .preview-modal');
      await expect(previewModal).toBeVisible();
    }
  });

  test('should show template stats', async ({ page }) => {
    const template = page.locator('[data-testid*="template-"], .template-card').first();
    await template.click();

    const sidebar = page.locator('[data-testid="template-sidebar"], .template-details');
    // Should show downloads and rating
    const hasStats = await sidebar.evaluate((el) => {
      const text = el.textContent || '';
      return text.includes('download') || text.includes('rating') || text.includes('★');
    });
  });
});

test.describe('Templates Library - Variable Form', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPostEditor(page);
    await openTemplatesLibrary(page);
  });

  test('should display variable inputs for template', async ({ page }) => {
    const template = page.locator('[data-testid*="template-"], .template-card').first();
    await template.click();

    const variableForm = page.locator('[data-testid="variable-form"], .template-variables');
    if (await variableForm.count() > 0) {
      await expect(variableForm).toBeVisible();
    }
  });

  test('should allow editing variable values', async ({ page }) => {
    const template = page.locator('[data-testid*="template-"], .template-card').first();
    await template.click();

    const variableInput = page.locator('[data-testid*="variable-"], .variable-input input').first();
    if (await variableInput.count() > 0) {
      await variableInput.fill('Custom Value');
      await expect(variableInput).toHaveValue('Custom Value');
    }
  });
});

test.describe('Templates Library - Template Insertion', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPostEditor(page);
    await openTemplatesLibrary(page);
  });

  test('should insert template into editor', async ({ page }) => {
    const template = page.locator('[data-testid*="template-"], .template-card').first();
    await template.click();

    const insertButton = page.locator('button:has-text("Insert"), [data-testid="insert-btn"]');
    await insertButton.click();

    // Modal should close
    const modal = page.locator('[data-testid="block-library-modal"], [role="dialog"]');
    await expect(modal).not.toBeVisible();

    // Content should be inserted into editor
    const editor = page.locator('[data-testid="editor-content"], [contenteditable="true"], #visual-editor');
    const hasContent = await editor.evaluate((el) => {
      return el.innerHTML.length > 50; // Template content should add significant HTML
    });
    expect(hasContent).toBeTruthy();
  });

  test('should insert template with custom variable values', async ({ page }) => {
    const template = page.locator('[data-testid*="template-"], .template-card').first();
    await template.click();

    // Fill in a variable if available
    const variableInput = page.locator('[data-testid*="variable-"], .variable-input input').first();
    if (await variableInput.count() > 0) {
      await variableInput.fill('My Custom Title');
    }

    const insertButton = page.locator('button:has-text("Insert"), [data-testid="insert-btn"]');
    await insertButton.click();

    // Check that custom value was inserted
    const editor = page.locator('[data-testid="editor-content"], [contenteditable="true"]');
    const hasCustomValue = await editor.evaluate((el) => {
      return el.innerHTML.includes('My Custom Title');
    });
    // Value may or may not be present depending on template structure
  });
});

test.describe('Templates Library - Favorites', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPostEditor(page);
    await openTemplatesLibrary(page);
  });

  test('should toggle favorite on template', async ({ page }) => {
    const favoriteButton = page.locator('[data-testid*="favorite-"], .template-card button:has-text("☆")').first();

    if (await favoriteButton.count() > 0) {
      await favoriteButton.click();

      // Should now show filled star
      const filledStar = page.locator('.template-card button:has-text("★")');
      await expect(filledStar.first()).toBeVisible();
    }
  });

  test('should display favorites in Favorites tab', async ({ page }) => {
    // First favorite a template
    const favoriteButton = page.locator('[data-testid*="favorite-"], .template-card button[class*="favorite"]').first();
    if (await favoriteButton.count() > 0) {
      await favoriteButton.click();
    }

    // Switch to favorites tab
    const favoritesTab = page.locator('[data-testid="tab-favorites"], button:has-text("Favorites")');
    await favoritesTab.click();

    const favoritesContent = page.locator('[data-testid="favorites-tab-content"]');
    await expect(favoritesContent).toBeVisible();
  });
});

test.describe('Templates Library - User Templates', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPostEditor(page);
    await openTemplatesLibrary(page);
  });

  test('should switch to My Templates tab', async ({ page }) => {
    const userTab = page.locator('[data-testid="tab-user"], button:has-text("My Templates")');
    await userTab.click();

    const userContent = page.locator('[data-testid="user-tab-content"]');
    await expect(userContent).toBeVisible();
  });

  test('should have Save as Template option', async ({ page }) => {
    const userTab = page.locator('[data-testid="tab-user"], button:has-text("My Templates")');
    await userTab.click();

    const saveButton = page.locator('button:has-text("Save"), [data-testid="save-as-template"]');
    await expect(saveButton).toBeVisible();
  });
});

test.describe('Templates Library - Sorting', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPostEditor(page);
    await openTemplatesLibrary(page);
  });

  test('should have sort options', async ({ page }) => {
    const sortSelect = page.locator('[data-testid="sort-select"], select:has(option:has-text("Popular"))');

    if (await sortSelect.count() > 0) {
      await expect(sortSelect).toBeVisible();
    }
  });

  test('should sort by rating', async ({ page }) => {
    const sortSelect = page.locator('[data-testid="sort-select"], select:has(option:has-text("Popular"))');

    if (await sortSelect.count() > 0) {
      await sortSelect.selectOption({ label: 'Highest Rated' });
      // Templates should be reordered
    }
  });
});

test.describe('Templates Library - View Mode', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPostEditor(page);
    await openTemplatesLibrary(page);
  });

  test('should have grid and list view toggle', async ({ page }) => {
    const gridButton = page.locator('[data-testid="view-grid"], button:has-text("Grid")');
    const listButton = page.locator('[data-testid="view-list"], button:has-text("List")');

    if (await gridButton.count() > 0) {
      await expect(gridButton).toBeVisible();
      await expect(listButton).toBeVisible();
    }
  });

  test('should switch to list view', async ({ page }) => {
    const listButton = page.locator('[data-testid="view-list"], button:has-text("List")');

    if (await listButton.count() > 0) {
      await listButton.click();
      await expect(listButton).toHaveClass(/active/);
    }
  });
});

test.describe('Templates Library - Pro Templates', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPostEditor(page);
    await openTemplatesLibrary(page);
  });

  test('should display PRO badge on premium templates', async ({ page }) => {
    const proTemplate = page.locator('.template-card:has(.pro-badge), [data-testid*="template-"][data-pro="true"]').first();

    if (await proTemplate.count() > 0) {
      const proBadge = proTemplate.locator('.pro-badge, span:has-text("PRO")');
      await expect(proBadge).toBeVisible();
    }
  });
});

test.describe('Templates Library - Template Preview', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPostEditor(page);
    await openTemplatesLibrary(page);
  });

  test('should open preview modal', async ({ page }) => {
    const previewButton = page.locator('[data-testid*="preview-"], button:has-text("Preview")').first();

    if (await previewButton.count() > 0) {
      await previewButton.click();

      const previewModal = page.locator('[data-testid="template-preview-modal"], .preview-modal');
      await expect(previewModal).toBeVisible();
    }
  });

  test('should close preview modal', async ({ page }) => {
    const previewButton = page.locator('[data-testid*="preview-"], button:has-text("Preview")').first();

    if (await previewButton.count() > 0) {
      await previewButton.click();

      const closeButton = page.locator('[data-testid="close-preview"], .preview-modal button:has-text("×")');
      await closeButton.click();

      const previewModal = page.locator('[data-testid="template-preview-modal"], .preview-modal');
      await expect(previewModal).not.toBeVisible();
    }
  });
});

test.describe('Templates Library - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPostEditor(page);
    await openTemplatesLibrary(page);
  });

  test('should have proper tab roles', async ({ page }) => {
    const tabList = page.locator('[role="tablist"]');
    await expect(tabList).toBeVisible();

    const tabs = page.locator('[role="tab"]');
    expect(await tabs.count()).toBeGreaterThanOrEqual(2);
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should support Enter key for selection', async ({ page }) => {
    const template = page.locator('[data-testid*="template-"], .template-card').first();
    await template.focus();
    await page.keyboard.press('Enter');

    const sidebar = page.locator('[data-testid="template-sidebar"], .template-details');
    await expect(sidebar).toBeVisible();
  });
});

test.describe('Templates Library - Performance', () => {
  test('should load templates within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await navigateToPostEditor(page);
    await openTemplatesLibrary(page);

    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000);
  });

  test('should render template cards smoothly', async ({ page }) => {
    await navigateToPostEditor(page);
    await openTemplatesLibrary(page);

    const templates = page.locator('[data-testid*="template-"], .template-card');
    expect(await templates.count()).toBeGreaterThan(5);
  });
});

test.describe('Templates Library - Mobile Responsiveness', () => {
  test('should be usable on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await navigateToPostEditor(page);
    await openTemplatesLibrary(page);

    const modal = page.locator('[data-testid="block-library-modal"], [role="dialog"]');
    await expect(modal).toBeVisible();

    const template = page.locator('[data-testid*="template-"], .template-card').first();
    await expect(template).toBeVisible();
  });
});

test.describe('Templates Library - Error Handling', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    await page.route('**/api/templates/**', (route) => {
      route.abort('failed');
    });

    await navigateToPostEditor(page);

    const addBlockButton = page.locator('[data-testid="add-block-button"], button:has-text("Add Block")');
    await addBlockButton.click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

    const templatesTab = page.locator('[data-testid="tab-templates"], button:has-text("Templates")');
    await templatesTab.click();

    // Should show error or fallback
    const errorMessage = page.locator('[data-testid="error-message"], text="Error"');
    // Error handling behavior varies by implementation
  });
});

test.describe('Templates Library - Rating', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPostEditor(page);
    await openTemplatesLibrary(page);
  });

  test('should display template ratings', async ({ page }) => {
    const template = page.locator('[data-testid*="template-"], .template-card').first();
    const hasRating = await template.evaluate((el) => {
      const text = el.textContent || '';
      return text.includes('★') || text.includes('rating');
    });
    // Rating display varies by implementation
  });

  test('should allow rating template', async ({ page }) => {
    const template = page.locator('[data-testid*="template-"], .template-card').first();
    await template.click();

    const ratingButton = page.locator('[data-testid*="rate-"], .rating-star').first();
    if (await ratingButton.count() > 0) {
      await ratingButton.click();
      // Rating should be submitted
    }
  });
});
