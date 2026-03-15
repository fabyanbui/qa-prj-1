# ShopPy Advanced Tutorial (Contributor + QA Automation)

This guide is for:

- full-stack contributors who want to extend the app safely
- QA/automation testers who need reliable functional and regression coverage

It goes beyond quick setup and explains architecture, data flow, test strategy, and extension workflows.

## 1) Advanced Local Setup

### Prerequisites

- Node.js 20+
- npm 10+
- Optional for E2E: `npx playwright install --with-deps`

### Project bootstrap

```bash
npm install
```

Create `.env` at the repository root:

```bash
DATABASE_URL="file:./dev.db"
```

Initialize Prisma client + seed:

```bash
npx prisma generate
npx prisma db seed
```

Start dev server:

```bash
npm run dev
```

App URL: `http://localhost:3000`

## 2) Architecture Map

### Runtime layers

- **App Router pages** (`app/**`) mix server and client components.
- **API routes** (`app/api/**`) provide backend operations for auth, products, and checkout.
- **Persistence** uses Prisma + SQLite (`prisma/schema.prisma`, `lib/db.ts`).
- **Client state** uses React contexts:
  - `lib/store/auth-context.tsx`
  - `lib/store/cart-context.tsx`

### Render model

- Server components fetch products directly through Prisma:
  - `app/page.tsx`
  - `app/products/[id]/page.tsx`
- Client components handle interactive flows (login/signup/cart/checkout/seller dashboard).

### Global wiring

`app/layout.tsx` wraps everything with:

- `AuthProvider`
- `CartProvider`
- global `Header`

## 3) Data Model and Seed Strategy

Schema file: `prisma/schema.prisma`

Core entities:

- `User` and `UserRole` (`BUYER`, `SELLER`)
- `Product` (owned by seller)
- `Order` and `OrderItem`

Seed flow:

- Source data in `lib/data.ts`
- Seeder script in `prisma/seed.ts`
- Known test users:
  - `john@example.com` / `password123` (BUYER)
  - `jane@example.com` / `password456` (BUYER, SELLER)
  - `bob@example.com` / `password789` (SELLER)

For repeatable automation runs, reseed before suites that depend on deterministic data.

## 4) API Behavior Deep Dive

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`

Response shape:

```json
{
  "success": true,
  "token": "mock-jwt-token-<user-id>",
  "user": {
    "id": "u1",
    "name": "John Doe",
    "email": "john@example.com",
    "roles": ["BUYER"]
  }
}
```

### Product CRUD

- `GET /api/products`
- `POST /api/products`
- `GET /api/products/:id`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

Pattern note: dynamic route handlers await promised params, e.g.:

```ts
{ params }: { params: Promise<{ id: string }> }
```

### Checkout internals

`POST /api/checkout`:

- groups cart items by `sellerId`
- creates one order per seller in a Prisma transaction
- returns `orderIds[]`

This is important for both business correctness and test expectations.

## 5) Auth, Sessions, and Role Gating

Auth in this project is intentionally demo-style:

- mock JWT token format
- plaintext password checks/storage

Session model:

- multi-account local sessions are supported
- persisted in localStorage:
  - `auth_sessions`
  - `active_session_email`

Role gating:

- Seller UI is shown only when `activeSession.user.roles.includes('SELLER')`
- Non-sellers are redirected away from seller pages

## 6) Full-Stack Contributor Workflow

Use this sequence for safe feature delivery:

1. **Map data impact**
   - schema changes?
   - API contract changes?
   - UI state impact (`useAuth`, `useCart`)?
2. **Implement server route first**
   - add validation
   - return explicit error responses
3. **Wire client behavior**
   - update context/page/component
   - keep role/auth rules consistent
4. **Add tests**
   - Vitest for local component/logic behavior
   - Playwright for end-to-end user journey
5. **Run quality gates**
   - lint
   - unit/component tests
   - E2E scope needed for changed flow

## 7) QA Automation Playbook

### Recommended execution order

0. Install Playwright browsers once:

```bash
npx playwright install --with-deps
```

1. Lint and unit/component tests:

```bash
npm run lint
npx vitest
```

2. Focused E2E pass while developing:

```bash
npx playwright test e2e/auth.spec.ts
```

3. Full E2E regression:

```bash
npx playwright test
```

### Deterministic test data strategy

- Reseed when state drift causes flaky assumptions:

```bash
npx prisma db seed
```

- Prefer seeded accounts for stable login scenarios.

### API validation strategy

- Use `../testing/postman/20260208-200837_e-commerce-api-tests.postman_collection.json` with:
  - `../testing/20260208-200837_postman-testing-guide.md`
- Validate response shape and status codes for:
  - auth failures (`401`)
  - duplicate signup (`400`)
  - missing checkout data (`400`)
  - invalid product ids (`404`)

### Flaky test debugging

- Keep Playwright traces enabled (configured on first retry).
- Re-run isolated spec first:

```bash
npx playwright test e2e/auth.spec.ts -g "should allow an existing user to login"
```

- If retries happen, inspect trace:

```bash
npx playwright show-report
```

Also inspect server logs for API 4xx/5xx mismatches against expected behavior.

### Baseline caveat

Current repository state includes pre-existing lint/test issues. If lint or Vitest fails right away, do not treat it as setup failure unless your error differs from the known baseline.

## 8) Extension Exercise (Hands-On)

If you want to practice safely, try this mini-scope:

1. Add a product filter to `/api/products` (e.g., by category).
2. Surface filter UI on home page.
3. Add component test for filter UI behavior.
4. Add/adjust E2E scenario for filtered browsing.
5. Update Postman examples for new query usage.

This touches route, UI, and tests, which is ideal for cross-role learning.

## 9) Known Demo Constraints

- Security is intentionally simplified for learning/testing:
  - no real JWT verification
  - no password hashing
- Some authorization checks are documented as "real app" notes in route handlers.
- Treat this as a QA/full-stack playground, not a production baseline.

## 10) Useful File Index

- `app/layout.tsx` - app-wide providers and header
- `app/page.tsx` - server-rendered product listing
- `app/products/[id]/page.tsx` - server-rendered product detail
- `app/api/auth/*` - signup/login routes
- `app/api/products/*` - product CRUD routes
- `app/api/checkout/route.ts` - multi-seller checkout logic
- `lib/store/auth-context.tsx` - multi-session auth state
- `lib/store/cart-context.tsx` - cart state and persistence
- `prisma/schema.prisma` - data model
- `prisma/seed.ts` / `lib/data.ts` - seed data source
- `__tests__/**` - Vitest tests
- `e2e/**` - Playwright tests
