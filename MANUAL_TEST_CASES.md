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
| **TC-005** | 1. Click Cart icon<br>2. Change quantity of an item<br>3. Click "Remove" | Quantity: 2 | Total price updates correctly. Item is removed when clicking "Remove". | | Localhost:3000 | Pending | | | |
| **TC-006** | 1. Click Cart icon<br>2. Click "Checkout"<br>3. Complete checkout flow | Mock Delivery Info | Redirected to order confirmation. Stock for item decreases. | | Localhost:3000 | Pending | | | |
| **TC-007** | 1. Log in as Seller<br>2. Click "My Shop"<br>3. Click "Add Product"<br>4. Fill details and save | Name: "Nikon Camera"<br>Price: 1200<br>Stock: 5 | New product appears in the seller dashboard and on the Home page. | | Localhost:3000 | Pending | | | |
| **TC-008** | 1. Log in as Buyer<br>2. Try to manually navigate to `/seller` | N/A | User is redirected to Home or shown "Access Denied" message. | | Localhost:3000 | Pending | | | |
| **TC-009** | 1. Log in as User A<br>2. Click "Add Another Account"<br>3. Log in as User B<br>4. Switch between accounts in Header | User A, User B credentials | Active user updates instantly in Header and App State. | | Localhost:3000 | Pending | | | |
| **TC-010** | 1. Navigate to Home page<br>2. Refresh page multiple times<br>3. Verify load time | N/A | Page loads in under 2 seconds. Images are optimized. | | Localhost:3000 | Pending | | | Performance Test |
| **TC-011** | 1. Attempt SQL Injection in Login Email field | Email: `' OR 1=1 --` | Login fails. No database error leaked. | | Localhost:3000 | Pending | | | Security Test |
| **TC-012** | 1. Open mobile view (Responsive)<br>2. Verify Navbar collapsing | Mobile (375x812) | Navbar collapses into a hamburger menu or responsive layout. | | Localhost:3000 | Pending | | | UI/UX Test |

---

## Environment Information
- **URL**: [http://localhost:3000](http://localhost:3000)
- **Browser**: Chrome / Firefox / Safari (Latest)
- **Database**: SQLite (via Prisma)
- **Framework**: Next.js 14+ (App Router)

## Test Summary
*To be filled after execution*
