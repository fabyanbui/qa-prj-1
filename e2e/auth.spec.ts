import { test, expect } from '@playwright/test';

function toExpectedDisplayName(email: string) {
  return email
    .split('@')[0]
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

test.describe('Authentication', () => {
  test('allows existing user login', async ({ page, request }) => {
    const email = `login-${Date.now()}@example.com`;
    const password = 'password123';
    const expectedDisplayName = toExpectedDisplayName(email);

    const signupResponse = await request.post('/api/auth/signup', {
      data: {
        email,
        password,
      },
    });
    expect(signupResponse.ok()).toBeTruthy();

    await page.goto('/login');
    await page.fill('input[placeholder="Email address"]', email);
    await page.fill('input[placeholder="Password"]', password);
    await page.locator('form button[type="submit"]').click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'ShopPy' })).toBeVisible();
    await expect(page.getByText(expectedDisplayName)).toBeVisible();
  });

  test('allows new user signup', async ({ page }) => {
    const uniqueEmail = `new-${Date.now()}@example.com`;
    const expectedDisplayName = toExpectedDisplayName(uniqueEmail);

    await page.goto('/signup');
    await page.fill('input[placeholder="Email address"]', uniqueEmail);
    await page.fill('input[placeholder="Password"]', 'password123');
    await page.locator('form button[type="submit"]').click();

    await expect(page).toHaveURL('/');
    await expect(page.getByText(expectedDisplayName)).toBeVisible();
  });
});
