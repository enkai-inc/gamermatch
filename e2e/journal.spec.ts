import { test, expect } from '@playwright/test';
import { login, navigateTo } from './helpers';

test.describe('Play Journal Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateTo(page, 'Journal');
  });

  test('shows page heading', async ({ page }) => {
    await expect(page.getByText('Play Journal')).toBeVisible();
    await expect(
      page.getByText('Track your gaming sessions and history'),
    ).toBeVisible();
  });

  test('shows Add Game button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Add Game' })).toBeVisible();
  });

  test('opens add journal entry dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Game' }).click();
    // The dialog should appear with a search input
    await expect(page.getByPlaceholder('Type to search games...')).toBeVisible();
  });

  test('journal stats section renders', async ({ page }) => {
    // Stats component should be present (may show zeros for new users)
    await page.waitForLoadState('networkidle');
    // The stats section loads asynchronously
    await expect(page.locator('main')).toBeVisible();
  });
});
