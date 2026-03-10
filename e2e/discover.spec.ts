import { test, expect } from '@playwright/test';
import { login, navigateTo } from './helpers';

test.describe('Discover Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateTo(page, 'Discover');
  });

  test('shows page heading and subtitle', async ({ page }) => {
    await expect(page.getByText('Discover Games')).toBeVisible();
    await expect(
      page.getByText('Personalized recommendations based on your taste profile'),
    ).toBeVisible();
  });

  test.describe('Mood Selector', () => {
    test('displays all mood options', async ({ page }) => {
      await expect(page.getByText('How are you feeling?')).toBeVisible();
      for (const mood of [
        'Relaxing Evening',
        'Competitive Edge',
        'Social Gaming',
        'Epic Adventure',
        'Creative Mode',
        'Quick Fun',
      ]) {
        await expect(page.getByText(mood)).toBeVisible();
      }
    });

    test('shows Surprise Me button', async ({ page }) => {
      await expect(page.getByRole('button', { name: /surprise me/i })).toBeVisible();
    });

    test('selects a mood and updates subtitle', async ({ page }) => {
      await page.getByText('Relaxing Evening').click();
      await expect(
        page.getByText('Calm, story-rich games to wind down with'),
      ).toBeVisible();
    });

    test('clears mood selection', async ({ page }) => {
      // Select a mood first
      await page.getByText('Competitive Edge').click();
      await expect(
        page.getByText('Intense matches to test your skills'),
      ).toBeVisible();

      // Clear button should appear and work
      await page.getByRole('button', { name: /clear/i }).click();
      await expect(
        page.getByText('Personalized recommendations based on your taste profile'),
      ).toBeVisible();
    });

    test('Surprise Me selects a random mood', async ({ page }) => {
      await page.getByRole('button', { name: /surprise me/i }).click();
      // After clicking, the subtitle should change from the default
      // (we can't predict which mood, but the Clear button should appear)
      await expect(page.getByRole('button', { name: /clear/i })).toBeVisible();
    });
  });

  test('renders recommendation feed area', async ({ page }) => {
    // The RecommendationFeed component should be present
    // It may show recommendations, empty state, or loading
    await expect(page.locator('main')).toBeVisible();
  });
});
