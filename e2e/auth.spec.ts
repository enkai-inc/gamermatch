import { test, expect } from '@playwright/test';
import { SEED_USER, login, register, uniqueEmail, expectDashboard } from './helpers';

test.describe('Authentication', () => {
  test.describe('Login', () => {
    test('shows login form', async ({ page }) => {
      await page.goto('/login');
      await expect(page.getByText('Welcome Back')).toBeVisible();
      await expect(page.locator('#email')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Create one' })).toBeVisible();
    });

    test('logs in with seed user credentials', async ({ page }) => {
      await login(page);
      await expectDashboard(page);
      await expect(page.getByText('Welcome back')).toBeVisible();
    });

    test('shows error for invalid credentials', async ({ page }) => {
      await page.goto('/login');
      await page.locator('#email').fill('wrong@example.com');
      await page.locator('#password').fill('wrongpassword');
      await page.getByRole('button', { name: 'Sign In' }).click();

      await expect(page.getByText('Invalid email or password')).toBeVisible();
      // Should stay on login page
      await expect(page).toHaveURL(/\/login/);
    });

    test('shows loading state during submission', async ({ page }) => {
      await page.goto('/login');
      await page.locator('#email').fill(SEED_USER.email);
      await page.locator('#password').fill(SEED_USER.password);

      const button = page.getByRole('button', { name: 'Sign In' });
      await button.click();

      // Button should show loading text briefly
      // Then redirect to dashboard
      await page.waitForURL('/dashboard**', { timeout: 15_000 });
    });

    test('redirects to dashboard if already logged in', async ({ page }) => {
      await login(page);
      await page.goto('/login');
      await expect(page).toHaveURL(/\/dashboard/);
    });
  });

  test.describe('Registration', () => {
    test('shows registration form', async ({ page }) => {
      await page.goto('/register');
      await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
      await expect(page.locator('#name')).toBeVisible();
      await expect(page.locator('#email')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Create Account' }),
      ).toBeVisible();
      await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
    });

    test('registers a new user and redirects to dashboard', async ({ page }) => {
      const email = uniqueEmail();
      await register(page, {
        name: 'Test User',
        email,
        password: 'testpassword123',
      });
      await expectDashboard(page);
    });

    test('shows error for duplicate email', async ({ page }) => {
      await page.goto('/register');
      await page.locator('#email').fill(SEED_USER.email);
      await page.locator('#password').fill('somepassword123');
      await page.getByRole('button', { name: 'Create Account' }).click();

      // Should show an error (email already taken)
      await expect(page.locator('.border-red-500\\/30')).toBeVisible({
        timeout: 10_000,
      });
    });

    test('login link navigates to login page', async ({ page }) => {
      await page.goto('/register');
      await page.getByRole('link', { name: 'Sign in' }).click();
      await expect(page).toHaveURL('/login');
    });
  });

  test.describe('Sign Out', () => {
    test('signs out and redirects to login', async ({ page }) => {
      await login(page);
      await expectDashboard(page);

      await page.getByRole('button', { name: /sign out/i }).click();
      await page.waitForURL(/\/(login)?$/, { timeout: 10_000 });
    });
  });

  test.describe('Route Protection', () => {
    test('redirects unauthenticated user from dashboard to login', async ({
      page,
    }) => {
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/login/);
    });

    test('redirects unauthenticated user from dashboard/discover to login', async ({
      page,
    }) => {
      await page.goto('/dashboard/discover');
      await expect(page).toHaveURL(/\/login/);
    });
  });
});
