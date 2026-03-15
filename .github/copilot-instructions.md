# Copilot instructions for `qa-prj-1`

## Build, lint, and test commands

```bash
# Dev server
npm run dev

# Production build
npm run build

# Lint
npm run lint

# Unit/component tests (Vitest)
npx vitest
npx vitest __tests__/components/AddToCartButton.test.tsx
npx vitest __tests__/components/AddToCartButton.test.tsx -t "renders correctly"

# E2E tests (Playwright)
npx playwright test
npx playwright test e2e/auth.spec.ts
npx playwright test e2e/auth.spec.ts -g "should allow an existing user to login"

# Seed local DB data used by app/tests
npx prisma db seed
```

## High-level architecture

- This is a Next.js App Router app with mixed server/client rendering.
- Product listing and product detail pages are server components that query Prisma directly (`app/page.tsx`, `app/products/[id]/page.tsx`).
- Interactive flows (login/signup/cart/checkout/seller dashboard) are client components and use shared React contexts from `lib/store/*`.
- `app/layout.tsx` wraps the app with `AuthProvider` and `CartProvider`, and renders the global `Header`.
- API routes under `app/api/**` back the client flows:
  - `/api/auth/login` and `/api/auth/signup` return `{ success, token, user }`.
  - `/api/products` and `/api/products/[id]` implement product CRUD.
  - `/api/checkout` groups cart items by `sellerId` and creates one order per seller in a Prisma transaction.
- Persistence is Prisma + SQLite:
  - Prisma client singleton: `lib/db.ts`
  - Schema: `prisma/schema.prisma` (`User`, `UserRole`, `Product`, `Order`, `OrderItem`).
  - Seed source: `lib/data.ts` via `prisma/seed.ts`.
- Test layers:
  - Vitest + Testing Library for component tests in `__tests__/`.
  - Playwright E2E tests in `e2e/` with `playwright.config.ts` auto-starting `npm run dev` on `http://localhost:3000`.

## Key repository conventions

- Use the TypeScript alias `@/*` for imports (`tsconfig.json`), e.g. `@/lib/db`.
- Shared client state lives in contexts (`lib/store/auth-context.tsx`, `lib/store/cart-context.tsx`) and is consumed via `useAuth()` / `useCart()`.
- Auth is intentionally demo-style:
  - Mock JWT tokens (`mock-jwt-token-*`).
  - Plaintext password checks/storage in auth routes.
  - Multiple local sessions are supported and persisted in `localStorage` keys `auth_sessions` and `active_session_email`.
- Cart state is persisted in `localStorage` key `cart`.
- `AddToCartButton` intentionally returns `null` for unauthenticated users.
- Seller features are role-gated in the client using `activeSession.user.roles.includes('SELLER')` and redirect non-seller users away from seller pages.
- Dynamic API route params are handled as promised params and awaited (e.g. `{ params }: { params: Promise<{ id: string }> }`).
- Existing seeded users in `lib/data.ts` are used across manual/E2E tests:
  - `john@example.com` / `password123` (`BUYER`)
  - `jane@example.com` / `password456` (`BUYER`, `SELLER`)
  - `bob@example.com` / `password789` (`SELLER`)
- Remote images are expected from Unsplash (`images.unsplash.com`) per `next.config.ts`.
- Formatting/linting conventions:
  - Prettier: single quotes, semicolons, trailing commas, 2-space tabs (`.prettierrc`).
  - ESLint: Next core-web-vitals + TypeScript + Prettier (`eslint.config.mjs`).

## Documentation conventions

- Keep repository docs under `docs/` (not as standalone root docs).
- Use subfolders by purpose:
  - `docs/getting-started/`
  - `docs/guides/`
  - `docs/testing/`
  - `docs/testing/postman/`
  - `docs/reports/`
- Use timestamp-first filenames for docs/assets: `YYYYMMDD-HHMMSS_slug.ext`.
- For migrated docs, prefer latest git commit datetime as timestamp; if unavailable, use filesystem mtime.
- For newly created docs, use current local datetime for the timestamp prefix.
- When creating or renaming docs, update `docs/README.md` and adjust affected links.
