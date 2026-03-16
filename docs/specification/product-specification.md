# Reverse Marketplace – Product Specification

## 1. Overview

### 1.1 Product Concept

The **Reverse Marketplace** is a platform where **buyers post requests first**, and **sellers compete by sending offers**.

Unlike traditional marketplaces where sellers list products, this system allows buyers to define their needs, budget, and requirements. Sellers then submit offers to fulfill the request.

Example:

Buyer posts:

```
Need: Wooden desk
Budget: $100
Location: Ho Chi Minh City
Deadline: 3 days
```

Sellers submit offers:

```
Seller A – $95 – Delivery in 2 days
Seller B – $90 – Delivery in 4 days
Seller C – $100 – Premium material
```

The buyer reviews offers and selects the best one.

---

# 2. Goals

## 2.1 Primary Goals

* Allow buyers to express demand directly
* Enable sellers to compete through offers
* Simplify negotiation between buyers and sellers
* Provide a lightweight marketplace without requiring integrated payment

## 2.2 MVP Scope

The first version focuses on:

* Request posting
* Offer submission
* Offer comparison
* Offer acceptance
* Deal creation

Payment is **not included in MVP**.

---

# 3. User Roles

## 3.1 Buyer

Buyers can:

* Create requests
* View incoming offers
* Compare offers
* Accept an offer
* Track deals

## 3.2 Seller

Sellers can:

* Browse open requests
* Submit offers
* Track submitted offers
* Participate in deals

## 3.3 Optional Role

A user may act as **both buyer and seller**.

---

# 4. Core Entities

## 4.1 User

Represents a platform user.

Fields:

```
id
email
password_hash
name
role
created_at
```

Optional fields:

```
profile_description
location
rating
```

---

## 4.2 Request

A buyer's demand for a product or service.

Fields:

```
id
buyer_id
title
description
category
budget
location
deadline
status
created_at
```

Status values:

```
OPEN
CLOSED
FULFILLED
EXPIRED
```

---

## 4.3 Offer

A seller’s proposal to fulfill a request.

Fields:

```
id
request_id
seller_id
price
delivery_time
message
status
created_at
```

Status values:

```
PENDING
ACCEPTED
REJECTED
WITHDRAWN
```

---

## 4.4 Deal

Created when a buyer accepts an offer.

Fields:

```
id
request_id
offer_id
buyer_id
seller_id
agreed_price
created_at
status
```

Status values:

```
ACTIVE
COMPLETED
CANCELLED
```

---

# 5. Core Features

## 5.1 Authentication

Users must be able to:

* Register
* Login
* Logout

Optional features:

* Password reset
* Profile editing

---

## 5.2 Create Request (Buyer)

Buyers can create a request describing what they need.

Fields:

```
Title
Description
Budget
Category
Location
Deadline
Optional images
```

Behavior:

* Request status becomes `OPEN`
* Sellers can see the request

---

## 5.3 Browse Requests (Seller)

Sellers can browse available requests.

Filters may include:

```
Category
Budget range
Location
Deadline
```

---

## 5.4 Submit Offer (Seller)

Sellers submit offers to fulfill requests.

Fields:

```
Price
Delivery time
Message
Optional attachments
```

Behavior:

* Offer status = `PENDING`
* Buyer receives notification

---

## 5.5 View Offers (Buyer)

Buyers can view all offers submitted to their request.

Displayed information:

```
Seller name
Price
Delivery time
Message
Offer date
```

Offers may be sorted by:

```
Lowest price
Fastest delivery
Newest offer
```

---

## 5.6 Accept Offer (Buyer)

The buyer selects one offer.

System behavior:

```
Selected offer → ACCEPTED
Other offers → REJECTED
Request → FULFILLED
Deal → CREATED
```

---

## 5.7 Deal Tracking

After accepting an offer, a deal is created.

Users can view:

```
Deal information
Seller
Buyer
Agreed price
Request details
```

Future extensions may include:

* delivery status
* payment status

---

# 6. User Flows

## 6.1 Buyer Flow

```
Register/Login
↓
Create Request
↓
Wait for Offers
↓
Review Offers
↓
Accept Offer
↓
Deal Created
```

---

## 6.2 Seller Flow

```
Register/Login
↓
Browse Requests
↓
Submit Offer
↓
Wait for Buyer Decision
↓
Offer Accepted → Deal Created
```

---

# 7. Request Lifecycle

```
OPEN
↓
Offers submitted
↓
Buyer accepts offer
↓
FULFILLED
↓
Deal created
```

Alternative path:

```
OPEN
↓
Deadline reached
↓
EXPIRED
```

---

# 8. Offer Lifecycle

```
PENDING
↓
Buyer accepts → ACCEPTED
↓
Other offers → REJECTED
```

Alternative:

```
Seller withdraws offer
↓
WITHDRAWN
```

---

# 9. Basic API Endpoints (Conceptual)

## Authentication

```
POST /register
POST /login
POST /logout
```

---

## Requests

```
POST /requests
GET /requests
GET /requests/{id}
GET /my-requests
```

---

## Offers

```
POST /offers
GET /requests/{id}/offers
GET /my-offers
```

---

## Accept Offer

```
POST /offers/{id}/accept
```

---

## Deals

```
GET /deals
GET /deals/{id}
```

---

# 10. Non-Functional Requirements

## Performance

* Requests and offers should load quickly
* Pagination should be supported for lists

## Security

* Passwords must be hashed
* Authorization required for modifying resources

## Data Integrity

* Only the buyer who created a request can accept an offer
* Sellers can only edit their own offers

---

# 11. Future Enhancements

Potential features for later versions:

### Payment Integration

Support external payment systems such as:

* Stripe
* VNPay

---

### Messaging System

Allow negotiation between buyer and seller.

Features:

```
chat thread
counter offers
file attachments
```

---

### Seller Reputation

Metrics such as:

```
completed deals
average response time
buyer ratings
```

---

### Smart Matching

Automatically suggest sellers for new requests.

Example:

```
Recommended sellers for this request
Seller A – 92% match
Seller B – 88% match
```

---

# 12. MVP Summary

The MVP should include:

```
User authentication
Create request
Browse requests
Submit offer
View offers
Accept offer
Deal creation
```

This minimal feature set enables a functional **reverse marketplace** without requiring payment integration.

