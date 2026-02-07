import { test, expect } from '@playwright/test';

test.describe('Shopping Flow', () => {
    test('should allow adding a product to cart and checking out', async ({ page }) => {
        // 1. Visit home page
        await page.goto('/');
        await expect(page.getByRole('heading', { name: /featured products/i })).toBeVisible();

        // 2. Click on a product link
        await page.getByRole('link', { name: 'Premium Wireless Headphones' }).click();

        // 3. Verify we are on the details page (h1 is unique here)
        await expect(page.getByRole('heading', { level: 1, name: 'Premium Wireless Headphones' })).toBeVisible();

        // 4. Add to cart (the one on the detail page)
        await page.getByRole('button', { name: 'Add to Cart' }).click();

        // 4. Verify cart badge (optional, if we can target it)
        await expect(page.getByRole('link', { name: /cart/i })).toContainText('1');

        // 5. Go to cart
        await page.getByRole('link', { name: /cart/i }).click();
        await expect(page.getByRole('heading', { name: /shopping cart/i })).toBeVisible();
        await expect(page.getByText('Premium Wireless Headphones')).toBeVisible();

        // 6. Go to checkout
        await page.getByRole('link', { name: /proceed to checkout/i }).click();
        await expect(page.getByRole('heading', { name: /checkout/i })).toBeVisible();

        // 7. Fill form
        await page.fill('input[name="name"]', 'John Doe');
        await page.fill('input[name="email"]', 'john@example.com');
        await page.fill('input[name="address"]', '123 Test St');
        await page.fill('input[name="city"]', 'Test City');
        await page.fill('input[name="zip"]', '12345');
        await page.fill('input[name="card"]', '1234567890123456');

        // 8. Submit
        await page.getByRole('button', { name: /place order/i }).click();

        // 9. Verify success (mock alert or navigation)
        page.on('dialog', async dialog => {
            expect(dialog.message()).toContain('Order placed successfully');
            await dialog.accept();
        });

        await expect(page).toHaveURL('/');
    });
});
