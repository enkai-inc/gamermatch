import { test, expect } from '@playwright/test';
import { uniqueEmail, expectDashboard } from './helpers';

/**
 * End-to-end user flow: register → dashboard → navigate all pages → sign out
 * This tests the complete happy path a new user would experience.
 */
test.describe('Full User Flow', () => {
  test('new user registers, explores dashboard, and signs out', async ({ page }) => {
    const email = uniqueEmail();

    // 1. Start at landing page
    await page.goto('/');
    await expect(page.getByText('Find Your Next Favorite Game')).toBeVisible();

    // 2. Navigate to register
    await page.getByRole('link', { name: 'Get Started Free' }).click();
    await expect(page).toHaveURL('/register');

    // 3. Register
    await page.locator('#name').fill('E2E Test User');
    await page.locator('#email').fill(email);
    await page.locator('#password').fill('securepassword123');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await page.waitForURL('/dashboard**', { timeout: 15_000 });
    await expectDashboard(page);

    // 4. Should see welcome message
    await expect(page.getByText('Welcome back')).toBeVisible();

    // 5. Navigate to Discover
    await page.getByRole('link', { name: 'Discover', exact: true }).click();
    await expect(page.getByText('Discover Games')).toBeVisible();
    await expect(page.getByText('How are you feeling?')).toBeVisible();

    // 6. Select a mood
    await page.getByText('Relaxing Evening').click();
    await expect(
      page.getByText('Calm, story-rich games to wind down with'),
    ).toBeVisible();

    // 7. Navigate to Journal
    await page.getByRole('link', { name: 'Journal', exact: true }).click();
    await expect(page.getByText('Play Journal')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Game' })).toBeVisible();

    // 8. Navigate to Wishlist
    await page.getByRole('link', { name: 'Wishlist', exact: true }).click();
    await expect(page.getByText('Wishlist').first()).toBeVisible();

    // 9. Navigate to Community
    await page.getByRole('link', { name: 'Community', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Community' })).toBeVisible();

    // 10. Navigate to Profile (should show wizard for new user)
    await page.getByRole('link', { name: 'Profile', exact: true }).click();
    await expect(page.getByText('Taste Profile')).toBeVisible();
    // New user should see the wizard
    await expect(page.getByText('Step 1 of 6: Genres')).toBeVisible();

    // 11. Start filling taste profile - select genres
    await page.getByRole('button', { name: 'RPG', exact: true }).click();
    await page.getByRole('button', { name: 'Strategy', exact: true }).click();

    // Verify selections are highlighted
    const rpgBtn = page.getByRole('button', { name: 'RPG', exact: true });
    await expect(rpgBtn).toHaveClass(/border-emerald-500/);

    // 12. Navigate to next step
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByText('Step 2 of 6: Mechanics')).toBeVisible();

    // 13. Go back to overview
    await page.getByRole('link', { name: 'Overview', exact: true }).click();
    await expect(page.getByText('Welcome back')).toBeVisible();

    // 14. Sign out
    await page.getByRole('button', { name: /sign out/i }).click();
    await page.waitForURL(/\/(login)?$/, { timeout: 10_000 });

    // 15. Verify we're logged out - dashboard should redirect
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});
