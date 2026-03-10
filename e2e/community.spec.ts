import { test, expect } from '@playwright/test';
import { login, navigateTo } from './helpers';

test.describe('Community Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateTo(page, 'Community');
  });

  test('shows page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Community' })).toBeVisible();
  });

  test('shows Browse Clusters section after loading', async ({ page }) => {
    // Wait for API calls to resolve
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Browse Clusters')).toBeVisible();
  });

  test('displays cluster cards', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    // Cluster cards should be rendered in the grid
    const clusterCards = page.locator('.rounded-xl.border.p-4');
    // There should be at least some clusters from the seed data
    await expect(clusterCards.first()).toBeVisible({ timeout: 10_000 });
  });
});
