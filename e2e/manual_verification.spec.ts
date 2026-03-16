import { expect, test } from '@playwright/test';

test('seller submits offer and buyer accepts to create order', async ({
  browser,
  request,
}) => {
  const buyerEmail = `buyer-lifecycle-${Date.now()}@example.com`;
  const sellerEmail = `seller-lifecycle-${Date.now()}@example.com`;
  const password = 'password123';
  const requestTitle = `Need office lamp ${Date.now()}`;

  const buyerSignupResponse = await request.post('/api/auth/signup', {
    data: {
      email: buyerEmail,
      password,
    },
  });
  expect(buyerSignupResponse.ok()).toBeTruthy();
  const buyerSignupPayload = (await buyerSignupResponse.json()) as {
    success: boolean;
    user: { id: string };
  };
  expect(buyerSignupPayload.success).toBeTruthy();

  const sellerSignupResponse = await request.post('/api/auth/signup', {
    data: {
      email: sellerEmail,
      password,
    },
  });
  expect(sellerSignupResponse.ok()).toBeTruthy();
  const sellerSignupPayload = (await sellerSignupResponse.json()) as {
    success: boolean;
  };
  expect(sellerSignupPayload.success).toBeTruthy();

  const createRequestResponse = await request.post('/api/requests', {
    data: {
      buyerId: buyerSignupPayload.user.id,
      title: requestTitle,
      description: 'Looking for warm light desk lamp, delivered within this week.',
      category: 'Home',
      budgetMin: 60,
      budgetMax: 80,
      location: 'Ho Chi Minh City',
      deadline: new Date('2026-04-02T12:00:00.000Z').toISOString(),
    },
  });
  expect(createRequestResponse.ok()).toBeTruthy();

  const createdRequestPayload = (await createRequestResponse.json()) as {
    success: boolean;
    data: { id: string };
  };
  expect(createdRequestPayload.success).toBeTruthy();
  const requestId = createdRequestPayload.data.id;

  const sellerContext = await browser.newContext();
  const sellerPage = await sellerContext.newPage();

  await sellerPage.goto('/login');
  await sellerPage.fill('input[placeholder="Email address"]', sellerEmail);
  await sellerPage.fill('input[placeholder="Password"]', password);
  await sellerPage.locator('form button[type="submit"]').click();
  await expect(sellerPage).toHaveURL('/');

  await sellerPage.goto(`/requests/${requestId}`);
  await sellerPage.fill('input[placeholder="195"]', '65');
  await sellerPage.fill('input[placeholder="3"]', '2');
  await sellerPage.fill(
    'textarea[placeholder="Describe what you can deliver..."]',
    'Can deliver high quality lamp with one-year warranty.',
  );
  await sellerPage.getByRole('button', { name: /submit offer/i }).click();
  await expect(sellerPage.getByText('PENDING').first()).toBeVisible();

  const buyerContext = await browser.newContext();
  const buyerPage = await buyerContext.newPage();

  await buyerPage.goto('/login');
  await buyerPage.fill('input[placeholder="Email address"]', buyerEmail);
  await buyerPage.fill('input[placeholder="Password"]', password);
  await buyerPage.locator('form button[type="submit"]').click();
  await expect(buyerPage).toHaveURL('/');

  await buyerPage.goto(`/requests/${requestId}`);
  await buyerPage.getByRole('button', { name: /accept offer/i }).first().click();
  await expect(buyerPage.getByText('CLOSED')).toBeVisible();

  await buyerPage.goto('/orders');
  await expect(buyerPage.getByText(requestTitle)).toBeVisible();

  await sellerContext.close();
  await buyerContext.close();
});
