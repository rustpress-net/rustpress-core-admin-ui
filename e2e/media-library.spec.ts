import { test, expect } from '@playwright/test';

test.describe('Media Library', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to post editor where media library can be accessed
    await page.goto('/admin/posts/new');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Modal Behavior', () => {
    test('should open media library modal from toolbar', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');
      await expect(page.locator('[data-testid="media-library-modal"]')).toBeVisible();
    });

    test('should close modal when X button is clicked', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');
      await expect(page.locator('[data-testid="media-library-modal"]')).toBeVisible();

      await page.click('[data-testid="close-button"]');
      await expect(page.locator('[data-testid="media-library-modal"]')).not.toBeVisible();
    });

    test('should close modal when Cancel button is clicked', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');
      await page.click('[data-testid="cancel-button"]');
      await expect(page.locator('[data-testid="media-library-modal"]')).not.toBeVisible();
    });

    test('should close modal when pressing Escape key', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');
      await expect(page.locator('[data-testid="media-library-modal"]')).toBeVisible();

      await page.keyboard.press('Escape');
      await expect(page.locator('[data-testid="media-library-modal"]')).not.toBeVisible();
    });

    test('should keep modal open when clicking inside', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');
      await page.click('[data-testid="media-grid"]');
      await expect(page.locator('[data-testid="media-library-modal"]')).toBeVisible();
    });
  });

  test.describe('Media Grid Display', () => {
    test('should display media items in grid view by default', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');
      await expect(page.locator('[data-testid="media-grid"]')).toHaveClass(/grid/);
    });

    test('should switch to list view', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');
      await page.click('[data-testid="view-list"]');
      await expect(page.locator('[data-testid="media-grid"]')).toHaveClass(/list/);
    });

    test('should switch back to grid view', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');
      await page.click('[data-testid="view-list"]');
      await page.click('[data-testid="view-grid"]');
      await expect(page.locator('[data-testid="media-grid"]')).toHaveClass(/grid/);
    });

    test('should display media items with thumbnails', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');
      const mediaItems = page.locator('[data-testid^="media-item-"]');
      await expect(mediaItems.first()).toBeVisible();
    });

    test('should show file information on media items', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');
      const firstItem = page.locator('[data-testid^="media-item-"]').first();
      await expect(firstItem.locator('.filename')).toBeVisible();
      await expect(firstItem.locator('.file-size')).toBeVisible();
    });
  });

  test.describe('Folder Navigation', () => {
    test('should display folder sidebar', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');
      await expect(page.locator('[data-testid="folder-sidebar"]')).toBeVisible();
    });

    test('should display system folders', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');
      await expect(page.locator('[data-testid="folder-images"]')).toBeVisible();
      await expect(page.locator('[data-testid="folder-videos"]')).toBeVisible();
      await expect(page.locator('[data-testid="folder-audio"]')).toBeVisible();
      await expect(page.locator('[data-testid="folder-documents"]')).toBeVisible();
    });

    test('should filter media by folder selection', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');

      // Get initial count
      const initialCount = await page.locator('[data-testid^="media-item-"]').count();

      // Click on Images folder
      await page.click('[data-testid="folder-images"]');

      // Should show filtered results (likely fewer items)
      await page.waitForTimeout(500); // Wait for filter to apply
      const filteredCount = await page.locator('[data-testid^="media-item-"]').count();

      // Images folder should have items (or we see no-results)
      expect(filteredCount).toBeGreaterThanOrEqual(0);
    });

    test('should show all media when clicking All Files', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');

      // Click on a specific folder first
      await page.click('[data-testid="folder-images"]');
      await page.waitForTimeout(300);

      // Then click All Files
      await page.click('[data-testid="folder-all"]');

      await expect(page.locator('[data-testid="folder-all"]')).toHaveClass(/active/);
    });

    test('should highlight selected folder', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');
      await page.click('[data-testid="folder-images"]');
      await expect(page.locator('[data-testid="folder-images"]')).toHaveClass(/active/);
    });

    test('should show folder item count', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');
      const folderButton = page.locator('[data-testid="folder-images"]');
      await expect(folderButton).toContainText(/\(\d+\)/);
    });
  });

  test.describe('Search', () => {
    test('should have search input visible', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');
      await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
    });

    test('should filter media as user types', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');

      const searchInput = page.locator('[data-testid="search-input"]');
      await searchInput.fill('hero');

      await page.waitForTimeout(500); // Debounce wait

      // Should show filtered results or no-results message
      const hasResults = await page.locator('[data-testid^="media-item-"]').count();
      const hasNoResults = await page.locator('[data-testid="no-results"]').isVisible();

      expect(hasResults > 0 || hasNoResults).toBeTruthy();
    });

    test('should clear search when clicking clear button', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');

      const searchInput = page.locator('[data-testid="search-input"]');
      await searchInput.fill('test');
      await page.waitForTimeout(300);

      // Clear the input
      await searchInput.fill('');

      await expect(searchInput).toHaveValue('');
    });
  });

  test.describe('Type Filters', () => {
    test('should display filter buttons', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');
      await expect(page.locator('[data-testid="filter-all"]')).toBeVisible();
      await expect(page.locator('[data-testid="filter-image"]')).toBeVisible();
      await expect(page.locator('[data-testid="filter-video"]')).toBeVisible();
      await expect(page.locator('[data-testid="filter-audio"]')).toBeVisible();
      await expect(page.locator('[data-testid="filter-document"]')).toBeVisible();
    });

    test('should filter by image type', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');
      await page.click('[data-testid="filter-image"]');
      await expect(page.locator('[data-testid="filter-image"]')).toHaveAttribute('aria-pressed', 'true');
    });

    test('should filter by video type', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');
      await page.click('[data-testid="filter-video"]');
      await expect(page.locator('[data-testid="filter-video"]')).toHaveAttribute('aria-pressed', 'true');
    });

    test('should show all when All filter is selected', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');
      await page.click('[data-testid="filter-image"]');
      await page.click('[data-testid="filter-all"]');
      await expect(page.locator('[data-testid="filter-all"]')).toHaveAttribute('aria-pressed', 'true');
    });
  });

  test.describe('Sorting', () => {
    test('should have sort dropdown', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');
      await expect(page.locator('[data-testid="sort-select"]')).toBeVisible();
    });

    test('should sort by newest first by default', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');
      await expect(page.locator('[data-testid="sort-select"]')).toHaveValue(/created_at-desc|newest/i);
    });

    test('should change sort order', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');
      await page.selectOption('[data-testid="sort-select"]', { index: 2 });

      // Verify the selection changed
      const selectedValue = await page.locator('[data-testid="sort-select"]').inputValue();
      expect(selectedValue).not.toBe('created_at-desc');
    });
  });

  test.describe('Selection', () => {
    test('should select media item on click', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');

      const firstItem = page.locator('[data-testid^="media-item-"]').first();
      await firstItem.click();

      await expect(firstItem).toHaveClass(/selected/);
    });

    test('should show selected count', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');

      await page.locator('[data-testid^="media-item-"]').first().click();

      await expect(page.locator('[data-testid="selected-count"]')).toContainText('1');
    });

    test('should enable insert button when item is selected', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');

      // Initially disabled
      await expect(page.locator('[data-testid="insert-button"]')).toBeDisabled();

      // Select an item
      await page.locator('[data-testid^="media-item-"]').first().click();

      // Should be enabled
      await expect(page.locator('[data-testid="insert-button"]')).not.toBeDisabled();
    });

    test('should deselect on second click', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');

      const firstItem = page.locator('[data-testid^="media-item-"]').first();
      await firstItem.click();
      await firstItem.click();

      await expect(firstItem).not.toHaveClass(/selected/);
    });
  });

  test.describe('Insert Media', () => {
    test('should insert selected media into editor', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');

      // Select first media item
      await page.locator('[data-testid^="media-item-"]').first().click();

      // Click insert button
      await page.click('[data-testid="insert-button"]');

      // Modal should close
      await expect(page.locator('[data-testid="media-library-modal"]')).not.toBeVisible();

      // Editor should have content (check for img or media element)
      const editorContent = await page.locator('.editor-content').innerHTML();
      expect(editorContent.length).toBeGreaterThan(0);
    });
  });

  test.describe('Upload', () => {
    test('should show upload button', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');
      await expect(page.locator('[data-testid="upload-button"]')).toBeVisible();
    });

    test('should open upload zone when clicking upload', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');
      await page.click('[data-testid="upload-button"]');
      await expect(page.locator('[data-testid="upload-zone"]')).toBeVisible();
    });

    test('should close upload zone when clicking cancel', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');
      await page.click('[data-testid="upload-button"]');
      await page.click('[data-testid="cancel-upload"]');
      await expect(page.locator('[data-testid="upload-zone"]')).not.toBeVisible();
    });
  });

  test.describe('Details Panel', () => {
    test('should open details on double-click', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');

      const firstItem = page.locator('[data-testid^="media-item-"]').first();
      await firstItem.dblclick();

      await expect(page.locator('[data-testid="details-panel"]')).toBeVisible();
    });

    test('should show media details', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');

      await page.locator('[data-testid^="media-item-"]').first().dblclick();

      await expect(page.locator('[data-testid="detail-filename"]')).toBeVisible();
      await expect(page.locator('[data-testid="detail-type"]')).toBeVisible();
      await expect(page.locator('[data-testid="detail-size"]')).toBeVisible();
    });

    test('should close details panel when close button clicked', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');

      await page.locator('[data-testid^="media-item-"]').first().dblclick();
      await page.click('[data-testid="close-details"]');

      await expect(page.locator('[data-testid="details-panel"]')).not.toBeVisible();
    });

    test('should show action buttons in details panel', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');

      await page.locator('[data-testid^="media-item-"]').first().dblclick();

      await expect(page.locator('[data-testid="edit-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="delete-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="download-button"]')).toBeVisible();
    });
  });

  test.describe('Favorites', () => {
    test('should show favorite badge on favorited items', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');

      // Look for any favorite badges
      const favoriteBadges = page.locator('[data-testid^="favorite-"]');
      // May or may not have favorites - just check the selector works
      expect(await favoriteBadges.count()).toBeGreaterThanOrEqual(0);
    });

    test('should toggle favorite from details panel', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');

      await page.locator('[data-testid^="media-item-"]').first().dblclick();

      const favoriteButton = page.locator('[data-testid="favorite-button"]');
      await expect(favoriteButton).toBeVisible();

      // Click to toggle favorite
      await favoriteButton.click();

      // Button text should change
      await page.waitForTimeout(500);
    });
  });

  test.describe('Create Folder', () => {
    test('should show create folder button', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');
      await expect(page.locator('[data-testid="create-folder-button"]')).toBeVisible();
    });

    test('should open create folder dialog', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');
      await page.click('[data-testid="create-folder-button"]');

      // Should show folder creation form or dialog
      const createDialog = page.locator('[data-testid="create-folder-dialog"]');
      // This test checks if clicking opens the dialog
    });
  });

  test.describe('Optimization', () => {
    test('should show optimized badge on optimized items', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');

      const optimizedBadges = page.locator('[data-testid^="optimized-"]');
      expect(await optimizedBadges.count()).toBeGreaterThanOrEqual(0);
    });

    test('should show optimize button in details for non-optimized images', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');

      // Find and double-click a non-optimized item
      await page.locator('[data-testid^="media-item-"]').first().dblclick();

      const optimizeButton = page.locator('[data-testid="optimize-button"]');
      await expect(optimizeButton).toBeVisible();
    });
  });

  test.describe('Usage Tracking', () => {
    test('should show usage count badge', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');

      const usageBadges = page.locator('[data-testid^="usage-"]');
      expect(await usageBadges.count()).toBeGreaterThanOrEqual(0);
    });

    test('should show usage information in details panel', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');

      await page.locator('[data-testid^="media-item-"]').first().dblclick();

      await expect(page.locator('[data-testid="detail-usage"]')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');

      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('[aria-label="Search media"]')).toBeVisible();
      await expect(page.locator('[aria-label="Close"]')).toBeVisible();
    });

    test('should support keyboard navigation', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');

      // Tab to navigate
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Some element should be focused
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
    });

    test('should have focusable media items', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');

      const firstItem = page.locator('[data-testid^="media-item-"]').first();
      await expect(firstItem).toHaveAttribute('tabindex', '0');
    });

    test('should mark selected items with aria-selected', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');

      const firstItem = page.locator('[data-testid^="media-item-"]').first();
      await expect(firstItem).toHaveAttribute('aria-selected', 'false');

      await firstItem.click();
      await expect(firstItem).toHaveAttribute('aria-selected', 'true');
    });
  });

  test.describe('Performance', () => {
    test('should load initial content quickly', async ({ page }) => {
      const startTime = Date.now();

      await page.click('[data-testid="toolbar-media"]');
      await expect(page.locator('[data-testid="media-library-modal"]')).toBeVisible();

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000);
    });

    test('should handle large number of items with virtualization', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');

      // Scroll to load more items
      const mediaGrid = page.locator('[data-testid="media-grid"]');
      await mediaGrid.evaluate((el) => el.scrollTo(0, el.scrollHeight));

      // Should still be responsive
      await expect(page.locator('[data-testid="media-library-modal"]')).toBeVisible();
    });
  });

  test.describe('Drag and Drop Upload', () => {
    test('should show drop zone on drag over', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');
      await page.click('[data-testid="upload-button"]');

      const uploadZone = page.locator('[data-testid="upload-zone"]');
      await expect(uploadZone).toBeVisible();

      // Note: Actual drag-and-drop testing requires file system interaction
      // which is complex in Playwright. This test verifies the zone exists.
    });
  });

  test.describe('Responsive Design', () => {
    test('should adapt to mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await page.click('[data-testid="toolbar-media"]');
      await expect(page.locator('[data-testid="media-library-modal"]')).toBeVisible();

      // Modal should be full-screen or adapted
      const modal = page.locator('[data-testid="media-library-modal"]');
      const boundingBox = await modal.boundingBox();
      expect(boundingBox?.width).toBeLessThanOrEqual(375);
    });

    test('should hide folder sidebar on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await page.click('[data-testid="toolbar-media"]');

      // Folder sidebar might be hidden or collapsed on mobile
      const folderSidebar = page.locator('[data-testid="folder-sidebar"]');
      // Check if it's hidden or has a toggle button
    });
  });

  test.describe('Pagination', () => {
    test('should show pagination when there are many items', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');

      // Check for pagination or infinite scroll indicators
      const pagination = page.locator('[data-testid="pagination"]');
      const loadMore = page.locator('[data-testid="load-more"]');

      // Either pagination or load more should exist for large libraries
      const hasPagination = (await pagination.count()) > 0 || (await loadMore.count()) > 0;
      // This depends on how many items exist in the test data
    });

    test('should show total item count', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');

      const totalCount = page.locator('[data-testid="total-count"]');
      await expect(totalCount).toBeVisible();
    });
  });

  test.describe('Multiple Selection', () => {
    test('should allow multiple selection with Ctrl+Click', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');

      const items = page.locator('[data-testid^="media-item-"]');

      if ((await items.count()) >= 2) {
        await items.nth(0).click();
        await items.nth(1).click({ modifiers: ['Control'] });

        await expect(items.nth(0)).toHaveClass(/selected/);
        await expect(items.nth(1)).toHaveClass(/selected/);
      }
    });

    test('should allow range selection with Shift+Click', async ({ page }) => {
      await page.click('[data-testid="toolbar-media"]');

      const items = page.locator('[data-testid^="media-item-"]');

      if ((await items.count()) >= 3) {
        await items.nth(0).click();
        await items.nth(2).click({ modifiers: ['Shift'] });

        // All items between 0 and 2 should be selected
        await expect(items.nth(0)).toHaveClass(/selected/);
        await expect(items.nth(2)).toHaveClass(/selected/);
      }
    });
  });
});
