import { test, expect } from '@playwright/test';
import * as fs from 'fs';

const screenshotDir = 'test-screenshots';
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
}

test('TC-005 & TC-006: Cart and Checkout', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[placeholder="Email address"]', 'john@example.com');
    await page.fill('input[placeholder="Password"]', 'password123');
    await page.click('button:has-text("Sign in")');
    await page.waitForSelector('text=Featured Products');

    // Add to cart
    await page.click('button:has-text("Add to Cart") >> nth=0');
    await expect(page.locator('a[href="/cart"]')).toContainText('1');

    // Go to cart
    await page.goto('http://localhost:3000/cart');
    await page.screenshot({ path: `${screenshotDir}/tc_005_cart.png` });

    // Remove item
    await page.click('button:has-text("Remove")');
    await page.screenshot({ path: `${screenshotDir}/tc_005_cart_empty.png` });

    // Checkout flow
    await page.goto('http://localhost:3000/');
    await page.click('button:has-text("Add to Cart") >> nth=0');
    await page.goto('http://localhost:3000/cart');
    await page.click('a:has-text("Proceed to Checkout")');

    await page.fill('input[name="name"]', 'John Doe');
    await page.fill('input[name="email"]', 'john@example.com');
    await page.fill('input[name="address"]', '123 Test St');
    await page.fill('input[name="city"]', 'Test City');
    await page.fill('input[name="zip"]', '12345');
    await page.fill('input[name="card"]', '1234567812345678');

    await page.click('button:has-text("Place Order")');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screenshotDir}/tc_006_checkout_success.png` });
});

test('TC-007: Seller Dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[placeholder="Email address"]', 'bob@example.com');
    await page.fill('input[placeholder="Password"]', 'password789');
    await page.click('button:has-text("Sign in")');
    await page.waitForSelector('text=Featured Products');

    await page.click('button:has-text("Bob Wilson")');
    await page.click('text=My Shop (Dashboard)');
    await page.waitForURL('**/seller');
    await page.screenshot({ path: `${screenshotDir}/tc_007_seller_dashboard.png` });
});

test('TC-008: Security - Role Access', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[placeholder="Email address"]', 'john@example.com');
    await page.fill('input[placeholder="Password"]', 'password123');
    await page.click('button:has-text("Sign in")');
    await page.waitForSelector('text=Featured Products');

    await page.goto('http://localhost:3000/seller');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screenshotDir}/tc_008_security.png` });
});

test('TC-009: Multi-account Switching', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[placeholder="Email address"]', 'john@example.com');
    await page.fill('input[placeholder="Password"]', 'password123');
    await page.click('button:has-text("Sign in")');
    await page.waitForSelector('text=Featured Products');

    await page.click('button:has-text("John Doe")');
    await page.click('text=Add Another Account');

    await page.fill('input[placeholder="Email address"]', 'jane@example.com');
    await page.fill('input[placeholder="Password"]', 'password456');
    await page.click('button:has-text("Sign in")');
    await page.waitForSelector('text=Featured Products');

    await page.screenshot({ path: `${screenshotDir}/tc_009_multi_account.png` });
});

test('TC-011: SQL Injection Protection', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[placeholder="Email address"]', "' OR 1=1 --");
    await page.fill('input[placeholder="Password"]', "anything");
    await page.click('button:has-text("Sign in")');
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/.*login/);
    await page.screenshot({ path: `${screenshotDir}/tc_011_sqli.png` });
});

test('TC-012: Mobile Responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('http://localhost:3000/');
    await page.screenshot({ path: `${screenshotDir}/tc_012_mobile.png` });
});
