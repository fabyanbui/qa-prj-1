import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test('should allow a new user to sign up', async ({ page }) => {
        // 1. Visit login page
        await page.goto('/login');

        // 2. Click on "Sign up" link
        await page.getByRole('link', { name: /sign up/i }).click();
        await expect(page).toHaveURL('/signup');
        await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();

        // 3. Fill signup form
        await page.fill('input[placeholder="Full Name"]', 'New User');
        await page.fill('input[placeholder="Email address"]', 'newuser@example.com');
        await page.fill('input[placeholder="Password"]', 'password123');

        // 4. Submit form
        await page.getByRole('button', { name: /sign up/i }).click();

        // 5. Verify redirect to home and user name in header
        await expect(page).toHaveURL('/');
        await expect(page.getByText('New User')).toBeVisible();
    });

    test('should allow an existing user to login', async ({ page }) => {
        // 1. Visit login page
        await page.goto('/login');

        // 2. Fill login form with mock data from lib/data.ts
        await page.fill('input[placeholder="Email address"]', 'john@example.com');
        await page.fill('input[placeholder="Password"]', 'password123');

        // 3. Submit form
        await page.locator('form button[type="submit"]').click();

        // 4. Verify redirect to home and user name in header
        await expect(page).toHaveURL('/');
        await expect(page.getByText('John Doe')).toBeVisible();
    });
});
