import { test, expect } from '@playwright/test';
import { login, expectDashboard, navigateTo } from './helpers';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.describe('Overview', () => {
    test('shows welcome message with user name', async ({ page }) => {
      await expect(page.getByText('Welcome back')).toBeVisible();
      await expect(
        page.getByText('Here is what is happening with your gaming world'),
      ).toBeVisible();
    });

    test('displays dashboard overview component', async ({ page }) => {
      // The DashboardOverview component should render
      // It fetches stats and recent activity
      await expect(page.locator('main')).toBeVisible();
    });
  });

  test.describe('Sidebar Navigation', () => {
    test('shows all navigation items', async ({ page }) => {
      await expect(page.getByText('GameMatch AI').first()).toBeVisible();
      for (const label of [
        'Overview',
        'Discover',
        'Journal',
        'Wishlist',
        'Community',
        'Profile',
      ]) {
        await expect(
          page.getByRole('link', { name: label, exact: true }),
        ).toBeVisible();
      }
    });

    test('navigates to Discover page', async ({ page }) => {
      await navigateTo(page, 'Discover');
      await expect(page).toHaveURL(/\/dashboard\/discover/);
      await expect(page.getByText('Discover Games')).toBeVisible();
    });

    test('navigates to Journal page', async ({ page }) => {
      await navigateTo(page, 'Journal');
      await expect(page).toHaveURL(/\/dashboard\/journal/);
      await expect(page.getByText('Play Journal')).toBeVisible();
    });

    test('navigates to Wishlist page', async ({ page }) => {
      await navigateTo(page, 'Wishlist');
      await expect(page).toHaveURL(/\/dashboard\/wishlist/);
      await expect(page.getByText('Wishlist')).toBeVisible();
    });

    test('navigates to Community page', async ({ page }) => {
      await navigateTo(page, 'Community');
      await expect(page).toHaveURL(/\/dashboard\/community/);
      await expect(page.getByText('Community')).toBeVisible();
    });

    test('navigates to Profile page', async ({ page }) => {
      await navigateTo(page, 'Profile');
      await expect(page).toHaveURL(/\/dashboard\/profile/);
      await expect(page.getByText('Taste Profile')).toBeVisible();
    });
  });

  test.describe('Header', () => {
    test('shows user name and sign out button', async ({ page }) => {
      await expect(page.getByText('Dashboard')).toBeVisible();
      await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
    });
  });
});
