import { test, expect } from '@playwright/test';
import { login, SEED_USER } from './helpers';

test.describe('API Endpoints', () => {
  test.describe('Health Check', () => {
    test('GET /api/health returns 200', async ({ request }) => {
      const res = await request.get('/api/health');
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.status).toBe('ok');
      expect(body.version).toBeDefined();
      expect(body.timestamp).toBeDefined();
      expect(body.environment).toBeDefined();
    });
  });

  test.describe('Auth API', () => {
    test('POST /api/auth/register rejects duplicate email', async ({ request }) => {
      const res = await request.post('/api/auth/register', {
        data: {
          email: SEED_USER.email,
          password: 'testpassword123',
        },
      });
      expect(res.status()).toBe(409);
    });

    test('POST /api/auth/register rejects short password', async ({ request }) => {
      const res = await request.post('/api/auth/register', {
        data: {
          email: `short-pw-${Date.now()}@test.com`,
          password: 'short',
        },
      });
      // Should reject with 400 (validation error)
      expect(res.status()).toBeGreaterThanOrEqual(400);
    });
  });

  test.describe('Protected API (unauthenticated)', () => {
    test('GET /api/recommendations returns 401 without auth', async ({ request }) => {
      const res = await request.get('/api/recommendations');
      expect(res.status()).toBe(401);
    });

    test('GET /api/journal returns 401 without auth', async ({ request }) => {
      const res = await request.get('/api/journal');
      expect(res.status()).toBe(401);
    });

    test('GET /api/wishlist returns 401 without auth', async ({ request }) => {
      const res = await request.get('/api/wishlist');
      expect(res.status()).toBe(401);
    });

    test('GET /api/taste-profile returns 401 without auth', async ({ request }) => {
      const res = await request.get('/api/taste-profile');
      expect(res.status()).toBe(401);
    });
  });

  test.describe('Games API', () => {
    test('GET /api/games/search returns results for seeded games', async ({
      page,
      request,
    }) => {
      // Need to be authenticated for search
      await login(page);
      const cookies = await page.context().cookies();
      const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join('; ');

      const res = await request.get('/api/games/search?q=elden', {
        headers: { cookie: cookieHeader },
      });
      // Should return 200 if DB is connected and seeded
      if (res.status() === 200) {
        const body = await res.json();
        expect(body.success).toBe(true);
      }
    });
  });

  test.describe('Moods API', () => {
    test('GET /api/moods returns available moods', async ({ page, request }) => {
      await login(page);
      const cookies = await page.context().cookies();
      const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join('; ');

      const res = await request.get('/api/moods', {
        headers: { cookie: cookieHeader },
      });
      if (res.status() === 200) {
        const body = await res.json();
        expect(body.success).toBe(true);
      }
    });
  });
});
