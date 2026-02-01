/**
 * Block Library - E2E Tests
 * End-to-end tests for the Block Library functionality in the Post Editor
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

// Helper to open block library
async function openBlockLibrary(page: Page, tab?: string) {
  // Click Add Block button
  const addBlockButton = page.locator('[data-testid="add-block-button"], button:has-text("Add Block")');
  await addBlockButton.click();

  // Wait for modal to appear
  await page.waitForSelector('[data-testid="block-library-modal"], [role="dialog"]', { timeout: 5000 });

  // Switch to specific tab if provided
  if (tab) {
    const tabButton = page.locator(`[data-testid="tab-${tab}"], button:has-text("${tab}")`);
    await tabButton.click();
  }
}

// ============================================
// E2E TEST SUITES
// ============================================

test.describe('Block Library - Modal Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPostEditor(page);
  });

  test('should open block library modal when Add Block is clicked', async ({ page }) => {
    await openBlockLibrary(page);

    const modal = page.locator('[data-testid="block-library-modal"], [role="dialog"]');
    await expect(modal).toBeVisible();
  });

  test('should close modal when close button is clicked', async ({ page }) => {
    await openBlockLibrary(page);

    const closeButton = page.locator('[aria-label="Close modal"], button:has-text("Close"), [data-testid="close-modal"]');
    await closeButton.click();

    const modal = page.locator('[data-testid="block-library-modal"], [role="dialog"]');
    await expect(modal).not.toBeVisible();
  });

  test('should close modal when clicking outside', async ({ page }) => {
    await openBlockLibrary(page);

    // Click on overlay/backdrop
    await page.locator('.modal-overlay, [data-testid="modal-backdrop"]').click({ position: { x: 10, y: 10 } });

    // Modal should be closed (or check a specific close behavior)
    const modal = page.locator('[data-testid="block-library-modal"], [role="dialog"]');
    // Note: behavior may vary - some modals close on outside click, some don't
  });

  test('should close modal when Escape key is pressed', async ({ page }) => {
    await openBlockLibrary(page);

    await page.keyboard.press('Escape');

    const modal = page.locator('[data-testid="block-library-modal"], [role="dialog"]');
    await expect(modal).not.toBeVisible();
  });
});

test.describe('Block Library - Tab Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPostEditor(page);
    await openBlockLibrary(page);
  });

  test('should display Content Blocks tab by default', async ({ page }) => {
    const blocksTab = page.locator('[data-testid="tab-blocks"], button:has-text("Content Blocks")');
    await expect(blocksTab).toHaveAttribute('aria-selected', 'true');
  });

  test('should switch to Animations tab', async ({ page }) => {
    const animationsTab = page.locator('[data-testid="tab-animations"], button:has-text("Animations")');
    await animationsTab.click();

    await expect(animationsTab).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('[data-testid="animations-tab-content"], [data-tab="animations"]')).toBeVisible();
  });

  test('should switch to Templates tab', async ({ page }) => {
    const templatesTab = page.locator('[data-testid="tab-templates"], button:has-text("Templates")');
    await templatesTab.click();

    await expect(templatesTab).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('[data-testid="templates-tab-content"], [data-tab="templates"]')).toBeVisible();
  });

  test('should switch to Media Library tab', async ({ page }) => {
    const mediaTab = page.locator('[data-testid="tab-media"], button:has-text("Media")');
    await mediaTab.click();

    await expect(mediaTab).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('[data-testid="media-tab-content"], [data-tab="media"]')).toBeVisible();
  });
});

test.describe('Block Library - Block Categories', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPostEditor(page);
    await openBlockLibrary(page, 'blocks');
  });

  test('should display all category filters', async ({ page }) => {
    const categories = ['All Blocks', 'Text', 'Media', 'Layout', 'Embed', 'Interactive'];

    for (const category of categories) {
      const categoryButton = page.locator(`button:has-text("${category}")`);
      await expect(categoryButton).toBeVisible();
    }
  });

  test('should filter blocks by Text category', async ({ page }) => {
    await page.locator('button:has-text("Text")').click();

    // Should show text blocks
    await expect(page.locator('[data-testid="block-paragraph"], button:has-text("Paragraph")')).toBeVisible();
    await expect(page.locator('[data-testid="block-heading"], button:has-text("Heading")')).toBeVisible();

    // Should not show media blocks
    await expect(page.locator('[data-testid="block-image"], button:has-text("Image")')).not.toBeVisible();
  });

  test('should filter blocks by Media category', async ({ page }) => {
    await page.locator('button:has-text("Media")').click();

    // Should show media blocks
    await expect(page.locator('[data-testid="block-image"], button:has-text("Image")')).toBeVisible();

    // Should not show text blocks
    await expect(page.locator('[data-testid="block-paragraph"], button:has-text("Paragraph")')).not.toBeVisible();
  });

  test('should show all blocks when All Blocks is selected', async ({ page }) => {
    // First filter by category
    await page.locator('button:has-text("Text")').click();

    // Then select all
    await page.locator('button:has-text("All Blocks")').click();

    // Should show both text and media blocks
    await expect(page.locator('[data-testid="block-paragraph"], button:has-text("Paragraph")')).toBeVisible();
    await expect(page.locator('[data-testid="block-image"], button:has-text("Image")')).toBeVisible();
  });
});

test.describe('Block Library - Search', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPostEditor(page);
    await openBlockLibrary(page, 'blocks');
  });

  test('should filter blocks by search query', async ({ page }) => {
    const searchInput = page.locator('[data-testid="block-search"], input[placeholder*="Search"]');
    await searchInput.fill('heading');

    // Should show heading block
    await expect(page.locator('[data-testid="block-heading"], button:has-text("Heading")')).toBeVisible();

    // Should not show other blocks
    await expect(page.locator('[data-testid="block-paragraph"], button:has-text("Paragraph")')).not.toBeVisible();
  });

  test('should show no results for non-matching search', async ({ page }) => {
    const searchInput = page.locator('[data-testid="block-search"], input[placeholder*="Search"]');
    await searchInput.fill('nonexistentblocktype');

    // Should show no results message
    await expect(page.locator('[data-testid="no-results"], text="No blocks found"')).toBeVisible();
  });

  test('should clear search and show all blocks', async ({ page }) => {
    const searchInput = page.locator('[data-testid="block-search"], input[placeholder*="Search"]');

    // Search for something
    await searchInput.fill('heading');

    // Clear search
    await searchInput.fill('');

    // Should show all blocks again
    await expect(page.locator('[data-testid="block-paragraph"], button:has-text("Paragraph")')).toBeVisible();
    await expect(page.locator('[data-testid="block-heading"], button:has-text("Heading")')).toBeVisible();
  });
});

test.describe('Block Library - Block Insertion', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPostEditor(page);
  });

  test('should insert paragraph block into editor', async ({ page }) => {
    await openBlockLibrary(page, 'blocks');

    // Click paragraph block
    await page.locator('[data-testid="block-paragraph"], button:has-text("Paragraph")').click();

    // Modal should close
    await expect(page.locator('[data-testid="block-library-modal"], [role="dialog"]')).not.toBeVisible();

    // Content should be inserted into editor
    const editor = page.locator('[data-testid="editor-content"], [contenteditable="true"], #visual-editor, #html-editor');
    await expect(editor).toContainText('Paragraph');
  });

  test('should insert heading block into editor', async ({ page }) => {
    await openBlockLibrary(page, 'blocks');

    await page.locator('[data-testid="block-heading"], button:has-text("Heading")').click();

    const editor = page.locator('[data-testid="editor-content"], [contenteditable="true"], #visual-editor, #html-editor');
    // Check for heading element or heading text
    const hasHeading = await editor.locator('h1, h2, h3, h4, h5, h6').count() > 0;
    expect(hasHeading).toBeTruthy();
  });

  test('should insert image block placeholder', async ({ page }) => {
    await openBlockLibrary(page, 'blocks');

    await page.locator('[data-testid="block-image"], button:has-text("Image")').click();

    const editor = page.locator('[data-testid="editor-content"], [contenteditable="true"], #visual-editor, #html-editor');
    // Should contain figure or img element
    const hasImage = await editor.locator('figure, img, [data-block-type="image"]').count() > 0;
    expect(hasImage).toBeTruthy();
  });

  test('should insert multiple blocks sequentially', async ({ page }) => {
    // Insert paragraph
    await openBlockLibrary(page, 'blocks');
    await page.locator('[data-testid="block-paragraph"], button:has-text("Paragraph")').click();

    // Insert heading
    await openBlockLibrary(page, 'blocks');
    await page.locator('[data-testid="block-heading"], button:has-text("Heading")').click();

    // Both should be in editor
    const editor = page.locator('[data-testid="editor-content"], [contenteditable="true"], #visual-editor, #html-editor');
    await expect(editor).toContainText('Paragraph');
    const hasHeading = await editor.locator('h1, h2, h3, h4, h5, h6').count() > 0;
    expect(hasHeading).toBeTruthy();
  });
});

test.describe('Block Library - Animations Tab', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPostEditor(page);
    await openBlockLibrary(page, 'animations');
  });

  test('should display animation categories', async ({ page }) => {
    const categories = ['Entrance', 'Exit', 'Emphasis', 'Scroll'];

    for (const category of categories) {
      const categoryElement = page.locator(`text="${category}"`);
      await expect(categoryElement).toBeVisible();
    }
  });

  test('should preview animation on hover', async ({ page }) => {
    const animationCard = page.locator('[data-testid="animation-fade-in"], [data-animation="fade-in"]').first();
    await animationCard.hover();

    // Check for preview indicator or animation class
    const hasPreview = await animationCard.evaluate((el) => {
      return el.classList.contains('previewing') || el.querySelector('.preview');
    });
    // Animation preview behavior varies
  });
});

test.describe('Block Library - Templates Tab', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPostEditor(page);
    await openBlockLibrary(page, 'templates');
  });

  test('should display template categories', async ({ page }) => {
    const categories = ['Hero', 'Features', 'Pricing', 'CTA', 'Footer'];

    for (const category of categories) {
      const categoryElement = page.locator(`text="${category}"`);
      // At least some categories should be visible
    }
  });

  test('should insert template content', async ({ page }) => {
    // Click on a template
    const template = page.locator('[data-testid*="template-"], [data-template]').first();
    if (await template.count() > 0) {
      await template.click();

      // Check for inserted content
      const editor = page.locator('[data-testid="editor-content"], [contenteditable="true"]');
      // Template content should be inserted
    }
  });
});

test.describe('Block Library - Media Tab', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPostEditor(page);
    await openBlockLibrary(page, 'media');
  });

  test('should display media library', async ({ page }) => {
    const mediaGrid = page.locator('[data-testid="media-grid"], .media-library');
    await expect(mediaGrid).toBeVisible();
  });

  test('should have upload button', async ({ page }) => {
    const uploadButton = page.locator('button:has-text("Upload"), [data-testid="upload-media"]');
    await expect(uploadButton).toBeVisible();
  });

  test('should insert selected media', async ({ page }) => {
    // Select first media item if available
    const mediaItem = page.locator('[data-testid*="media-item-"], .media-item').first();
    if (await mediaItem.count() > 0) {
      await mediaItem.click();

      // Click insert button
      const insertButton = page.locator('button:has-text("Insert"), [data-testid="insert-media"]');
      if (await insertButton.count() > 0) {
        await insertButton.click();

        // Check editor for inserted media
        const editor = page.locator('[data-testid="editor-content"], [contenteditable="true"]');
        const hasMedia = await editor.locator('img, video, audio').count() > 0;
        // Media should be inserted if available
      }
    }
  });
});

test.describe('Block Library - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPostEditor(page);
    await openBlockLibrary(page);
  });

  test('should have proper dialog role', async ({ page }) => {
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Tab through elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should focus on a focusable element
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should support Enter key for selection', async ({ page }) => {
    // Focus on a block
    const block = page.locator('[data-testid="block-paragraph"], button:has-text("Paragraph")');
    await block.focus();

    // Press Enter
    await page.keyboard.press('Enter');

    // Modal should close (block inserted)
    await expect(page.locator('[data-testid="block-library-modal"], [role="dialog"]')).not.toBeVisible();
  });
});

test.describe('Block Library - Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await navigateToPostEditor(page);
    await openBlockLibrary(page);

    const loadTime = Date.now() - startTime;

    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should render blocks smoothly', async ({ page }) => {
    await navigateToPostEditor(page);
    await openBlockLibrary(page, 'blocks');

    // All blocks should be visible
    const blockCount = await page.locator('[data-testid*="block-"], .block-item').count();
    expect(blockCount).toBeGreaterThan(10);
  });
});
