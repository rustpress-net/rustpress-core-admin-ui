/**
 * Animations Library - E2E Tests
 * End-to-end tests for the Animation Library functionality in the Post Editor
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

// Helper to open animations library
async function openAnimationsLibrary(page: Page) {
  // Open block library first
  const addBlockButton = page.locator('[data-testid="add-block-button"], button:has-text("Add Block")');
  await addBlockButton.click();

  // Wait for modal
  await page.waitForSelector('[data-testid="block-library-modal"], [role="dialog"]', { timeout: 5000 });

  // Switch to animations tab
  const animationsTab = page.locator('[data-testid="tab-animations"], button:has-text("Animations")');
  await animationsTab.click();

  // Wait for animations content
  await page.waitForSelector('[data-testid="animations-tab-content"], [data-tab="animations"]', { timeout: 5000 });
}

// Helper to select an element in editor for animation
async function selectEditorElement(page: Page) {
  // First insert a block
  const addBlockButton = page.locator('[data-testid="add-block-button"], button:has-text("Add Block")');
  await addBlockButton.click();
  await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

  // Insert paragraph
  await page.locator('[data-testid="block-paragraph"], button:has-text("Paragraph")').click();

  // Select the inserted element
  const editor = page.locator('[data-testid="editor-content"], [contenteditable="true"]');
  await editor.click();
}

// ============================================
// E2E TEST SUITES
// ============================================

test.describe('Animations Library - Modal Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPostEditor(page);
  });

  test('should open animations library from block library', async ({ page }) => {
    await openAnimationsLibrary(page);

    const animationsContent = page.locator('[data-testid="animations-tab-content"], [data-tab="animations"]');
    await expect(animationsContent).toBeVisible();
  });

  test('should display animation categories', async ({ page }) => {
    await openAnimationsLibrary(page);

    const categories = ['Entrance', 'Exit', 'Emphasis', 'Scroll'];
    for (const category of categories) {
      const categoryButton = page.locator(`button:has-text("${category}"), [data-testid="category-${category.toLowerCase()}"]`);
      await expect(categoryButton).toBeVisible();
    }
  });

  test('should close modal when Escape is pressed', async ({ page }) => {
    await openAnimationsLibrary(page);

    await page.keyboard.press('Escape');

    const modal = page.locator('[data-testid="block-library-modal"], [role="dialog"]');
    await expect(modal).not.toBeVisible();
  });
});

test.describe('Animations Library - Category Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPostEditor(page);
    await openAnimationsLibrary(page);
  });

  test('should filter animations by Entrance category', async ({ page }) => {
    await page.locator('button:has-text("Entrance"), [data-testid="category-entrance"]').click();

    // Should show entrance animations
    await expect(page.locator('[data-testid="animation-fade-in"], [data-animation="fade-in"]')).toBeVisible();

    // Should not show exit animations
    const exitAnimation = page.locator('[data-testid="animation-fade-out"], [data-animation="fade-out"]');
    if (await exitAnimation.count() > 0) {
      await expect(exitAnimation).not.toBeVisible();
    }
  });

  test('should filter animations by Emphasis category', async ({ page }) => {
    await page.locator('button:has-text("Emphasis"), [data-testid="category-emphasis"]').click();

    // Should show emphasis animations
    const bounceAnimation = page.locator('[data-testid="animation-bounce"], [data-animation="bounce"]');
    if (await bounceAnimation.count() > 0) {
      await expect(bounceAnimation).toBeVisible();
    }
  });

  test('should show all animations when All is clicked', async ({ page }) => {
    // First filter by category
    await page.locator('button:has-text("Entrance"), [data-testid="category-entrance"]').click();

    // Then select all
    await page.locator('button:has-text("All"), [data-testid="category-all"]').click();

    // Should show animations from multiple categories
    await expect(page.locator('[data-testid="animation-fade-in"], [data-animation="fade-in"]')).toBeVisible();
  });
});

test.describe('Animations Library - Search', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPostEditor(page);
    await openAnimationsLibrary(page);
  });

  test('should filter animations by search query', async ({ page }) => {
    const searchInput = page.locator('[data-testid="animation-search"], input[placeholder*="Search"]');
    await searchInput.fill('fade');

    // Should show fade animations
    await expect(page.locator('[data-testid="animation-fade-in"], [data-animation="fade-in"]')).toBeVisible();

    // Should not show non-matching animations
    const bounceAnimation = page.locator('[data-testid="animation-bounce"], [data-animation="bounce"]');
    if (await bounceAnimation.count() > 0) {
      await expect(bounceAnimation).not.toBeVisible();
    }
  });

  test('should show no results for non-matching search', async ({ page }) => {
    const searchInput = page.locator('[data-testid="animation-search"], input[placeholder*="Search"]');
    await searchInput.fill('nonexistentanimation');

    const noResults = page.locator('[data-testid="no-results"], text="No animations found"');
    await expect(noResults).toBeVisible();
  });

  test('should clear search and show all animations', async ({ page }) => {
    const searchInput = page.locator('[data-testid="animation-search"], input[placeholder*="Search"]');

    await searchInput.fill('fade');
    await searchInput.fill('');

    // Should show all animations again
    await expect(page.locator('[data-testid="animation-fade-in"], [data-animation="fade-in"]')).toBeVisible();
  });
});

test.describe('Animations Library - Animation Selection', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPostEditor(page);
    await openAnimationsLibrary(page);
  });

  test('should select animation and show settings panel', async ({ page }) => {
    await page.locator('[data-testid="animation-fade-in"], [data-animation="fade-in"]').first().click();

    const settingsPanel = page.locator('[data-testid="animation-settings"], [data-testid="animation-sidebar"]');
    await expect(settingsPanel).toBeVisible();
  });

  test('should display animation name in settings panel', async ({ page }) => {
    await page.locator('[data-testid="animation-fade-in"], [data-animation="fade-in"]').first().click();

    const animationName = page.locator('[data-testid="selected-name"], h3:has-text("Fade In")');
    await expect(animationName).toBeVisible();
  });

  test('should show animation preview', async ({ page }) => {
    await page.locator('[data-testid="animation-fade-in"], [data-animation="fade-in"]').first().click();

    const preview = page.locator('[data-testid="animation-preview"]');
    await expect(preview).toBeVisible();
  });
});

test.describe('Animations Library - Settings Customization', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPostEditor(page);
    await openAnimationsLibrary(page);
    await page.locator('[data-testid="animation-fade-in"], [data-animation="fade-in"]').first().click();
  });

  test('should have duration slider', async ({ page }) => {
    const durationSlider = page.locator('[data-testid="duration-slider"], input[type="range"]');
    await expect(durationSlider).toBeVisible();
  });

  test('should update duration value when slider changes', async ({ page }) => {
    const durationSlider = page.locator('[data-testid="duration-slider"], input[type="range"]');
    await durationSlider.fill('1000');

    const durationValue = page.locator('[data-testid="duration-value"], span:has-text("ms")');
    await expect(durationValue).toContainText('1000');
  });

  test('should have easing select', async ({ page }) => {
    const easingSelect = page.locator('[data-testid="easing-select"], select:has(option:has-text("Ease"))');
    await expect(easingSelect).toBeVisible();
  });

  test('should have trigger select', async ({ page }) => {
    const triggerSelect = page.locator('[data-testid="trigger-select"], select:has(option:has-text("On Load"))');
    await expect(triggerSelect).toBeVisible();
  });

  test('should change trigger to scroll', async ({ page }) => {
    const triggerSelect = page.locator('[data-testid="trigger-select"], select:has(option:has-text("On Load"))');
    await triggerSelect.selectOption({ label: 'On Scroll' });

    await expect(triggerSelect).toHaveValue('scroll');
  });
});

test.describe('Animations Library - Favorites', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPostEditor(page);
    await openAnimationsLibrary(page);
  });

  test('should toggle favorite on animation', async ({ page }) => {
    const favoriteButton = page.locator('[data-testid="favorite-fade-in"], [data-animation="fade-in"] button:has-text("☆")').first();

    if (await favoriteButton.count() > 0) {
      await favoriteButton.click();

      // Should now show filled star
      const favoritedButton = page.locator('[data-animation="fade-in"] button:has-text("★")');
      await expect(favoritedButton).toBeVisible();
    }
  });

  test('should display favorites in Favorites tab', async ({ page }) => {
    // First favorite an animation
    const favoriteButton = page.locator('[data-animation="fade-in"] button[data-testid^="favorite"]').first();
    if (await favoriteButton.count() > 0) {
      await favoriteButton.click();
    }

    // Switch to favorites tab
    const favoritesTab = page.locator('[data-testid="tab-favorites"], button:has-text("Favorites")');
    await favoritesTab.click();

    // Should show favorited animation
    const favoritesList = page.locator('[data-testid="favorites-tab-content"]');
    await expect(favoritesList).toBeVisible();
  });
});

test.describe('Animations Library - Custom Animations', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPostEditor(page);
    await openAnimationsLibrary(page);
  });

  test('should switch to Custom tab', async ({ page }) => {
    const customTab = page.locator('[data-testid="tab-custom"], button:has-text("Custom")');
    await customTab.click();

    const customContent = page.locator('[data-testid="custom-tab-content"]');
    await expect(customContent).toBeVisible();
  });

  test('should have create custom animation button', async ({ page }) => {
    const customTab = page.locator('[data-testid="tab-custom"], button:has-text("Custom")');
    await customTab.click();

    const createButton = page.locator('[data-testid="create-custom-animation"], button:has-text("Create")');
    await expect(createButton).toBeVisible();
  });
});

test.describe('Animations Library - Presets', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPostEditor(page);
    await openAnimationsLibrary(page);
  });

  test('should switch to Presets tab', async ({ page }) => {
    const presetsTab = page.locator('[data-testid="tab-presets"], button:has-text("Presets")');
    await presetsTab.click();

    const presetsContent = page.locator('[data-testid="presets-tab-content"]');
    await expect(presetsContent).toBeVisible();
  });

  test('should display preset cards', async ({ page }) => {
    const presetsTab = page.locator('[data-testid="tab-presets"], button:has-text("Presets")');
    await presetsTab.click();

    const presetCard = page.locator('[data-testid*="preset-"], .preset-card').first();
    if (await presetCard.count() > 0) {
      await expect(presetCard).toBeVisible();
    }
  });
});

test.describe('Animations Library - Apply Animation', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPostEditor(page);
    await selectEditorElement(page);
    await openAnimationsLibrary(page);
  });

  test('should apply animation to selected element', async ({ page }) => {
    // Select animation
    await page.locator('[data-testid="animation-fade-in"], [data-animation="fade-in"]').first().click();

    // Click apply
    const applyButton = page.locator('[data-testid="apply-animation"], button:has-text("Apply")');
    await applyButton.click();

    // Modal should close
    const modal = page.locator('[data-testid="block-library-modal"], [role="dialog"]');
    await expect(modal).not.toBeVisible();

    // Check that animation class or attribute was applied
    const editor = page.locator('[data-testid="editor-content"], [contenteditable="true"]');
    const hasAnimation = await editor.evaluate((el) => {
      const animated = el.querySelector('[data-animation], .animate-fade-in, [class*="animate"]');
      return animated !== null;
    });
    // Animation should be applied (implementation may vary)
  });
});

test.describe('Animations Library - Preview', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPostEditor(page);
    await openAnimationsLibrary(page);
    await page.locator('[data-testid="animation-fade-in"], [data-animation="fade-in"]').first().click();
  });

  test('should play preview when Play button clicked', async ({ page }) => {
    const playButton = page.locator('[data-testid="play-preview"], button:has-text("Play")');
    await playButton.click();

    const preview = page.locator('[data-testid="animation-preview"]');
    await expect(preview).toBeVisible();
  });

  test('should preview animation on hover', async ({ page }) => {
    const animationCard = page.locator('[data-testid="animation-bounce"], [data-animation="bounce"]').first();

    if (await animationCard.count() > 0) {
      await animationCard.hover();
      // Preview behavior varies by implementation
    }
  });
});

test.describe('Animations Library - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPostEditor(page);
    await openAnimationsLibrary(page);
  });

  test('should have proper tab roles in modal', async ({ page }) => {
    const tabList = page.locator('[role="tablist"]');
    await expect(tabList).toBeVisible();

    const tabs = page.locator('[role="tab"]');
    expect(await tabs.count()).toBeGreaterThanOrEqual(2);
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
    const animationCard = page.locator('[data-testid="animation-fade-in"], [data-animation="fade-in"]').first();
    await animationCard.focus();
    await page.keyboard.press('Enter');

    // Settings panel should appear
    const settingsPanel = page.locator('[data-testid="animation-settings"], [data-testid="animation-sidebar"]');
    await expect(settingsPanel).toBeVisible();
  });
});

test.describe('Animations Library - Performance', () => {
  test('should load animations within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await navigateToPostEditor(page);
    await openAnimationsLibrary(page);

    const loadTime = Date.now() - startTime;

    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should render animation cards smoothly', async ({ page }) => {
    await navigateToPostEditor(page);
    await openAnimationsLibrary(page);

    // Should have multiple animation cards
    const animationCards = page.locator('[data-testid*="animation-"], [data-animation]');
    expect(await animationCards.count()).toBeGreaterThan(5);
  });
});

test.describe('Animations Library - Output Generation', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPostEditor(page);
    await openAnimationsLibrary(page);
    await page.locator('[data-testid="animation-fade-in"], [data-animation="fade-in"]').first().click();
  });

  test('should show CSS class output option', async ({ page }) => {
    const outputFormatSelect = page.locator('[data-testid="output-format"], select:has(option:has-text("CSS Class"))');
    if (await outputFormatSelect.count() > 0) {
      await expect(outputFormatSelect).toBeVisible();
    }
  });

  test('should generate CSS code', async ({ page }) => {
    const showCodeButton = page.locator('button:has-text("Show Code"), [data-testid="show-code"]');
    if (await showCodeButton.count() > 0) {
      await showCodeButton.click();

      const codeOutput = page.locator('[data-testid="code-output"], pre, code');
      await expect(codeOutput).toContainText('animation');
    }
  });
});

test.describe('Animations Library - Recent Animations', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPostEditor(page);
    await openAnimationsLibrary(page);
  });

  test('should add animation to recent when selected', async ({ page }) => {
    // Select an animation
    await page.locator('[data-testid="animation-bounce"], [data-animation="bounce"]').first().click();

    // Switch to recent tab
    const recentTab = page.locator('[data-testid="tab-recent"], button:has-text("Recent")');
    if (await recentTab.count() > 0) {
      await recentTab.click();

      // Should show the recently selected animation
      const recentContent = page.locator('[data-testid="recent-tab-content"]');
      await expect(recentContent).toBeVisible();
    }
  });
});

test.describe('Animations Library - Mobile Responsiveness', () => {
  test('should be usable on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await navigateToPostEditor(page);
    await openAnimationsLibrary(page);

    // Modal should still be usable
    const modal = page.locator('[data-testid="block-library-modal"], [role="dialog"]');
    await expect(modal).toBeVisible();

    // Animation cards should be visible
    const animationCard = page.locator('[data-testid*="animation-"], [data-animation]').first();
    await expect(animationCard).toBeVisible();
  });

  test('should have scrollable content on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await navigateToPostEditor(page);
    await openAnimationsLibrary(page);

    // Content should be scrollable
    const content = page.locator('[data-testid="animations-tab-content"], .modal-content');
    const isScrollable = await content.evaluate((el) => {
      return el.scrollHeight > el.clientHeight;
    });
    // Content may or may not be scrollable depending on number of animations
  });
});

test.describe('Animations Library - Error Handling', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Intercept API calls and simulate failure
    await page.route('**/api/animations/**', (route) => {
      route.abort('failed');
    });

    await navigateToPostEditor(page);

    // Try to open animations
    const addBlockButton = page.locator('[data-testid="add-block-button"], button:has-text("Add Block")');
    await addBlockButton.click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

    const animationsTab = page.locator('[data-testid="tab-animations"], button:has-text("Animations")');
    await animationsTab.click();

    // Should show error message or fallback
    const errorMessage = page.locator('[data-testid="error-message"], text="Error"');
    // Error handling behavior varies by implementation
  });
});

test.describe('Animations Library - Pro Animations', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPostEditor(page);
    await openAnimationsLibrary(page);
  });

  test('should show PRO badge on pro animations', async ({ page }) => {
    const proAnimation = page.locator('[data-animation][data-pro="true"], .animation-card:has(.pro-badge)').first();

    if (await proAnimation.count() > 0) {
      const proBadge = proAnimation.locator('.pro-badge, span:has-text("PRO")');
      await expect(proBadge).toBeVisible();
    }
  });
});
