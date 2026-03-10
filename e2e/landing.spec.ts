import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('renders hero section with CTA buttons', async ({ page }) => {
    await page.goto('/');

    // Hero headline
    await expect(page.getByText('Find Your Next Favorite Game')).toBeVisible();
    await expect(
      page.getByText('AI-powered recommendations based on your unique gaming taste'),
    ).toBeVisible();

    // CTA buttons
    await expect(page.getByRole('link', { name: 'Get Started Free' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'See How It Works' })).toBeVisible();
  });

  test('shows how it works section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'How It Works' })).toBeVisible();
    await expect(page.getByText('Build Your Taste Profile')).toBeVisible();
    await expect(page.getByText('Get AI Recommendations')).toBeVisible();
    await expect(page.getByText('Play & Refine')).toBeVisible();
  });

  test('shows feature grid', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Everything You Need')).toBeVisible();
    await expect(page.getByText('Taste Profile Builder')).toBeVisible();
    await expect(page.getByText('Smart Recommendations')).toBeVisible();
    await expect(page.getByText('Play Journal')).toBeVisible();
    await expect(page.getByText('Price Comparison')).toBeVisible();
    await expect(page.getByText('Mood Discovery')).toBeVisible();
  });

  test('shows stats section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('1,000+')).toBeVisible();
    await expect(page.getByText('Games Analyzed')).toBeVisible();
  });

  test('footer contains branding and links', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer.getByText('GameMatch AI', { exact: true }).first()).toBeVisible();
    await expect(footer.getByRole('link', { name: 'About' })).toBeVisible();
    await expect(footer.getByRole('link', { name: 'Privacy' })).toBeVisible();
    await expect(footer.getByRole('link', { name: 'Terms' })).toBeVisible();
  });

  test('"Get Started Free" navigates to register', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Get Started Free' }).click();
    await expect(page).toHaveURL('/register');
  });
});
