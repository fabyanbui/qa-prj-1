# Advanced Manual Test Cases - ShopPy Web App

## General Information

| Field | Details |
| :--- | :--- |
| **Project Name** | ShopPy E-commerce Application |
| **Priority** | High |
| **Description** | Comprehensive manual testing suite for the ShopPy web application, covering user auth, product management, and shopping workflows. |
| **Test Objective** | Ensure the stability, usability, and correctness of core e-commerce features and role-based access control. |
| **Test Case Author** | Bui Dinh Bao |
| **Test Case Reviewer** | [Reviewer Name] |
| **Test Case Version** | 1.0 |
| **Test Execution Date** | 2026-02-07 |

---

## Test Cases Table

| Test Case ID | Test Steps | Input Data | Expected Results | Actual Results | Test Environment | Execution Status | Bug Severity | Bug Priority | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-001** | 1. Navigate to `/signup`<br>2. Fill in Name, Email, Password<br>3. Select "Buyer" role<br>4. Click "Sign Up" | Name: "John Doe"<br>Email: "john@example.com"<br>Password: "Password123!" | User is redirected to `/` and is logged in as "John Doe". | User successfully redirected to `/`. | Localhost:3000 | Pass | | | Verified via playwright `auth.spec.ts`. |
| **TC-002** | 1. Navigate to `/login`<br>2. Enter valid credentials<br>3. Click "Sign In" | Email: "john@example.com"<br>Password: "Password123!" | User is redirected to Home. Header shows "John Doe". | Session persists and name is shown in Header. | Localhost:3000 | Pass | | | Verified via playwright `auth.spec.ts`. |
| **TC-003** | 1. On Home page, verify product cards are displayed | N/A | Multiple product cards showing image, name, price, and "Add to Cart" button. | Home page displays a grid of product cards. | Localhost:3000 | Pass | | | |
| **TC-004** | 1. Click "Add to Cart" on a product card | Product: "Modern Watch" | Cart badge count increases by 1. Success notification shown. | **Fail**: "Add to Cart" button is hidden if user is not logged in. | Localhost:3000 | Fail | Medium | High | Functional but hidden for guests. No CTA for guests. |
| **TC-005** | 1. Click Cart icon<br>2. Change quantity of an item<br>3. Click "Remove" | Quantity: 2 | Total price updates correctly. Item is removed when clicking "Remove". | Cart page shows items with +/- quantity controls. Increasing quantity from 1→2 correctly updates item subtotal and cart total. Clicking "Remove" instantly removes item and recalculates total. | Localhost:3000 | Pass | | | |
| **TC-006** | 1. Click Cart icon<br>2. Click "Checkout"<br>3. Complete checkout flow | Mock Delivery Info | Redirected to order confirmation. Stock for item decreases. | Checkout form submits successfully. Browser `alert("Order placed successfully!")` is shown, then user is redirected to `/`. **No dedicated order confirmation page**. Product stock does **not** decrease after checkout — `/api/checkout` creates orders but omits stock decrement logic. | Localhost:3000 | Fail | High | High | Two bugs: (1) No order confirmation page — uses a browser `alert()` instead. (2) Product stock not decremented on order. |
| **TC-007** | 1. Log in as Seller<br>2. Click "My Shop"<br>3. Click "Add Product"<br>4. Fill details and save | Name: "Nikon Camera"<br>Price: 1200<br>Stock: 5 | New product appears in the seller dashboard and on the Home page. | Seller dashboard accessible via header dropdown → "My Shop (Dashboard)". "Add New Product" form accepts all fields. After saving, "Nikon Camera" ($1200, Stock: 5) appears immediately in the seller dashboard table and on the Home page product grid. | Localhost:3000 | Pass | | | |
| **TC-008** | 1. Log in as Buyer<br>2. Try to manually navigate to `/seller` | N/A | User is redirected to Home or shown "Access Denied" message. | Buyer (John Doe, BUYER role only) navigating to `/seller` briefly sees "Loading dashboard..." then is silently redirected to Home (`/`). No "Access Denied" message is displayed — the redirect is silent. | Localhost:3000 | Pass | | | Access is correctly denied. No explicit error message is shown to the user. |
| **TC-009** | 1. Log in as User A<br>2. Click "Add Another Account"<br>3. Log in as User B<br>4. Switch between accounts in Header | User A: john@example.com (BUYER)<br>User B: jane@example.com (BUYER, SELLER) | Active user updates instantly in Header and App State. | Both accounts listed in the header dropdown. Clicking an account entry switches the active user immediately — the Header name updates to the selected user with no page reload. Sessions are persisted via localStorage. | Localhost:3000 | Pass | | | |
| **TC-010** | 1. Navigate to Home page<br>2. Refresh page multiple times<br>3. Verify load time | N/A | Page loads in under 2 seconds. Images are optimized. | Page `loadEventEnd` measured at ~281ms (well under 2s). TTFB: ~72ms. Next.js handles image optimization via `<Image>` component with `w=` and `q=` params. | Localhost:3000 | Pass | | | Performance Test. Measured via `performance.getEntriesByType('navigation')`. |
| **TC-011** | 1. Attempt SQL Injection in Login Email field | Email: `' OR 1=1 --` | Login fails. No database error leaked. | Input `' OR 1=1 --` is blocked at the browser level by the HTML5 `type="email"` validation — form never submits. Direct API call with SQL injection payload returns HTTP 401 `{"success":false,"message":"Invalid credentials"}` with no database error exposed. Prisma ORM uses parameterized queries. | Localhost:3000 | Pass | | | Security Test. Protected by both client-side HTML5 email validation and server-side Prisma ORM parameterized queries. |
| **TC-012** | 1. Open mobile view (Responsive)<br>2. Verify Navbar collapsing | Mobile (375x812) | Navbar collapses into a hamburger menu or responsive layout. | At 375×812 viewport, the Navbar remains as a horizontal bar (logo left, cart icon + user button right) and does **not** collapse into a hamburger menu. Product cards stack into a single-column responsive layout correctly. | Localhost:3000 | Fail | Low | Medium | UI/UX Test. No hamburger menu implemented. Navbar is usable on mobile due to minimal items, but does not meet the hamburger/collapse requirement. |

---

## Environment Information
- **URL**: [http://localhost:3000](http://localhost:3000)
- **Browser**: Chrome / Firefox / Safari (Latest)
- **Database**: SQLite (via Prisma)
- **Framework**: Next.js 14+ (App Router)

## Test Summary

| Metric | Count |
| :--- | :--- |
| **Total Test Cases** | 12 |
| **Pass** | 9 |
| **Fail** | 3 |
| **Pending** | 0 |

### Failed Test Cases Summary

| ID | Issue | Severity | Priority |
| :--- | :--- | :--- | :--- |
| **TC-004** | "Add to Cart" button hidden for unauthenticated users. No CTA or prompt to sign in. | Medium | High |
| **TC-006** | (1) No order confirmation page — uses a browser `alert()`. (2) Product stock not decremented after checkout. | High | High |
| **TC-012** | Navbar does not collapse into a hamburger menu on mobile (375×812). | Low | Medium |

### Execution Notes
- Auth is persisted via `localStorage` (client-side). Session state loads after hydration, causing a brief flash of the logged-out state on hard navigation.
- Seed user passwords differ from the test case input data (`password123` vs `Password123!`). TC-001/TC-002 were validated against the seeded data.
- Execution date: 2026-02-24. Tested on Chromium via Playwright MCP.
