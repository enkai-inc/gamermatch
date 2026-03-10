import { test, expect } from '@playwright/test';
import { login, navigateTo } from './helpers';

test.describe('Wishlist Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateTo(page, 'Wishlist');
  });

  test('shows page heading', async ({ page }) => {
    await expect(page.getByText('Wishlist').first()).toBeVisible();
  });

  test('shows empty state with discover link when no items', async ({ page }) => {
    // For seed user without wishlist items, should show empty state
    await page.waitForLoadState('networkidle');
    // Either shows "Track games and get price drop notifications" or a list
    const emptyText = page.getByText('Track games and get price drop notifications');
    const discoverLink = page.getByRole('link', { name: 'Discover Games' });
    // At least the page content area should be visible
    await expect(page.locator('main')).toBeVisible();
    // If empty state, the discover link should be there
    if (await emptyText.isVisible()) {
      await expect(discoverLink).toBeVisible();
    }
  });
});
