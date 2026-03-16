import { expect, test } from '@playwright/test';

test.describe('Buyer request flow', () => {
  test('buyer can create a request and find it in my requests', async ({ page, request }) => {
    const requestTitle = `Need standing desk ${Date.now()}`;
    const buyerEmail = `buyer-flow-${Date.now()}@example.com`;
    const buyerPassword = 'password123';

    const signupResponse = await request.post('/api/auth/signup', {
      data: {
        email: buyerEmail,
        password: buyerPassword,
      },
    });
    expect(signupResponse.ok()).toBeTruthy();

    await page.goto('/login');
    await page.fill('input[placeholder="Email address"]', buyerEmail);
    await page.fill('input[placeholder="Password"]', buyerPassword);
    await page.locator('form button[type="submit"]').click();
    await expect(page).toHaveURL('/');

    await page.getByRole('link', { name: /create request/i }).first().click();
    await expect(page).toHaveURL('/requests/new');

    await page.fill('input[placeholder="Need a wooden desk"]', requestTitle);
    await page.fill(
      'textarea[placeholder="Dimensions, quality preferences, and other details..."]',
      'Need one for home office with ergonomic size.',
    );
    await page.fill('input[placeholder="Furniture"]', 'Furniture');
    await page.fill('input[placeholder="180"]', '240');
    await page.fill('input[placeholder="230"]', '280');
    await page.fill('input[placeholder="Ho Chi Minh City"]', 'Ho Chi Minh City');
    await page.fill('input[type="date"]', '2026-04-01');
    await page.getByRole('button', { name: /create request/i }).click();

    await expect(page).toHaveURL(/\/requests\/.+/);
    await expect(page.getByRole('heading', { name: requestTitle })).toBeVisible();

    await page.getByRole('link', { name: /my requests/i }).first().click();
    await expect(page).toHaveURL('/my-requests');
    await expect(page.getByText(requestTitle)).toBeVisible();
  });
});
