import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('allows existing user login', async ({ page, request }) => {
    const email = `login-${Date.now()}@example.com`;
    const password = 'password123';

    const signupResponse = await request.post('/api/auth/signup', {
      data: {
        name: 'Login User',
        email,
        password,
        roles: ['BUYER'],
      },
    });
    expect(signupResponse.ok()).toBeTruthy();

    await page.goto('/login');
    await page.fill('input[placeholder="Email address"]', email);
    await page.fill('input[placeholder="Password"]', password);
    await page.locator('form button[type="submit"]').click();

    await expect(page).toHaveURL('/');
    await expect(page.getByText('Reverse Marketplace')).toBeVisible();
    await expect(page.getByText('Login User')).toBeVisible();
  });

  test('allows new user signup', async ({ page }) => {
    const uniqueEmail = `new-${Date.now()}@example.com`;

    await page.goto('/signup');
    await page.fill('input[placeholder="Full Name"]', 'New Buyer');
    await page.fill('input[placeholder="Email address"]', uniqueEmail);
    await page.fill('input[placeholder="Password"]', 'password123');
    await page.locator('form button[type="submit"]').click();

    await expect(page).toHaveURL('/');
    await expect(page.getByText('New Buyer')).toBeVisible();
  });
});
