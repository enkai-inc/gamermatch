import { Page, expect } from '@playwright/test';

/** Seed user credentials from prisma/seed.ts */
export const SEED_USER = {
  email: 'admin@gamermatch.ai',
  password: 'admin123',
  name: 'Admin',
};

/** Generate a unique email for test user registration */
export function uniqueEmail(): string {
  return `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.gamermatch.ai`;
}

/** Log in with the given credentials (defaults to seed user) */
export async function login(
  page: Page,
  email = SEED_USER.email,
  password = SEED_USER.password,
) {
  await page.goto('/login');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL('/dashboard**', { timeout: 15_000 });
}

/** Register a new user and land on the dashboard */
export async function register(
  page: Page,
  opts: { name?: string; email: string; password: string },
) {
  await page.goto('/register');
  if (opts.name) {
    await page.locator('#name').fill(opts.name);
  }
  await page.locator('#email').fill(opts.email);
  await page.locator('#password').fill(opts.password);
  await page.getByRole('button', { name: 'Create Account' }).click();
  await page.waitForURL('/dashboard**', { timeout: 15_000 });
}

/** Assert we are on the dashboard (sidebar visible) */
export async function expectDashboard(page: Page) {
  await expect(page.getByText('GameMatch AI').first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Overview' })).toBeVisible();
}

/** Navigate using the sidebar */
export async function navigateTo(page: Page, label: string) {
  await page.getByRole('link', { name: label, exact: true }).click();
  await page.waitForLoadState('networkidle');
}
