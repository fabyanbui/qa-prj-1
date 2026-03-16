# Reverse Marketplace Database Design

## 1. Overview

This document defines the relational database schema for the **Reverse Marketplace Application**.

A **Reverse Marketplace** allows buyers to **post requests for products/services**, and sellers can **submit offers** to fulfill those requests.

### Core Principles

The database is designed with the following goals:

* **Simplicity** – minimal tables required for core functionality
* **Role flexibility** – users can act as both buyers and sellers
* **Scalability** – easy to add payments, ratings, moderation later
* **Data integrity** – clear primary keys and foreign key relationships
* **Prisma compatibility** – clean relational model

---

# 2. Core Entities

The system consists of the following main entities:

| Entity  | Purpose                            |
| ------- | ---------------------------------- |
| Account | User identity                      |
| Profile | User profile information           |
| Request | Buyer request for product/service  |
| Offer   | Seller offer responding to request |
| Order   | Accepted offer transaction         |
| Message | Communication between users        |
| Review  | Rating after order completion      |

---

# 3. Entity Relationship Overview

```
Account
   |
   |--- Profile
   |
   |--- Request (buyer creates)
           |
           |--- Offer (seller submits)
                   |
                   |--- Order (accepted offer)

Order
   |
   |--- Review

Account
   |
   |--- Message
```

---

# 4. Tables Specification

---

# 4.1 Account

Stores authentication and identity information.

| Column        | Type             | Description        |
| ------------- | ---------------- | ------------------ |
| id            | UUID (PK)        | Unique account ID  |
| email         | VARCHAR (UNIQUE) | User login email   |
| password_hash | VARCHAR          | Hashed password    |
| status        | ENUM             | active / suspended |
| created_at    | TIMESTAMP        | Account creation   |
| updated_at    | TIMESTAMP        | Last update        |

### Primary Key

```
PK: id
```

### Unique Constraints

```
email
```

---

# 4.2 Profile

Stores public profile data.

Separating this from `Account` allows future extension.

| Column       | Type      | Description |
| ------------ | --------- | ----------- |
| id           | UUID (PK) |             |
| account_id   | UUID (FK) |             |
| display_name | VARCHAR   |             |
| avatar_url   | TEXT      |             |
| bio          | TEXT      |             |
| phone_number | VARCHAR   |             |
| location     | VARCHAR   |             |
| created_at   | TIMESTAMP |             |
| updated_at   | TIMESTAMP |             |

### Keys

```
PK: id
FK: account_id → Account.id
UNIQUE: account_id
```

Each account has **one profile**.

---

# 4.3 Request

Represents a **buyer request**.

Example:

> “I need someone to build a landing page – budget $200”

| Column      | Type      | Description |
| ----------- | --------- | ----------- |
| id          | UUID (PK) |             |
| buyer_id    | UUID (FK) |             |
| title       | VARCHAR   |             |
| description | TEXT      |             |
| budget_min  | DECIMAL   |             |
| budget_max  | DECIMAL   |             |
| status      | ENUM      |             |
| deadline    | TIMESTAMP |             |
| created_at  | TIMESTAMP |             |
| updated_at  | TIMESTAMP |             |

### Keys

```
PK: id
FK: buyer_id → Account.id
```

### Status Values

```
open
closed
expired
cancelled
```

---

# 4.4 Offer

Seller offers to fulfill a request.

| Column                  | Type      | Description |
| ----------------------- | --------- | ----------- |
| id                      | UUID (PK) |             |
| request_id              | UUID (FK) |             |
| seller_id               | UUID (FK) |             |
| price                   | DECIMAL   |             |
| message                 | TEXT      |             |
| estimated_delivery_days | INT       |             |
| status                  | ENUM      |             |
| created_at              | TIMESTAMP |             |
| updated_at              | TIMESTAMP |             |

### Keys

```
PK: id
FK: request_id → Request.id
FK: seller_id → Account.id
```

### Status Values

```
pending
accepted
rejected
withdrawn
```

---

# 4.5 Order

Created when a buyer **accepts an offer**.

| Column       | Type      | Description |
| ------------ | --------- | ----------- |
| id           | UUID (PK) |             |
| request_id   | UUID (FK) |             |
| offer_id     | UUID (FK) |             |
| buyer_id     | UUID (FK) |             |
| seller_id    | UUID (FK) |             |
| final_price  | DECIMAL   |             |
| status       | ENUM      |             |
| created_at   | TIMESTAMP |             |
| completed_at | TIMESTAMP |             |

### Keys

```
PK: id
FK: request_id → Request.id
FK: offer_id → Offer.id
FK: buyer_id → Account.id
FK: seller_id → Account.id
```

### Status

```
active
completed
cancelled
disputed
```

---

# 4.6 Message

Allows buyer and seller to communicate.

| Column      | Type                | Description |
| ----------- | ------------------- | ----------- |
| id          | UUID (PK)           |             |
| sender_id   | UUID (FK)           |             |
| receiver_id | UUID (FK)           |             |
| request_id  | UUID (FK, nullable) |             |
| offer_id    | UUID (FK, nullable) |             |
| content     | TEXT                |             |
| created_at  | TIMESTAMP           |             |

### Keys

```
PK: id
FK: sender_id → Account.id
FK: receiver_id → Account.id
FK: request_id → Request.id
FK: offer_id → Offer.id
```

Messages may belong to either:

* a request discussion
* an offer negotiation

---

# 4.7 Review

Allows users to rate each other after a completed order.

| Column      | Type      | Description |
| ----------- | --------- | ----------- |
| id          | UUID (PK) |             |
| order_id    | UUID (FK) |             |
| reviewer_id | UUID (FK) |             |
| reviewee_id | UUID (FK) |             |
| rating      | INT       |             |
| comment     | TEXT      |             |
| created_at  | TIMESTAMP |             |

### Keys

```
PK: id
FK: order_id → Order.id
FK: reviewer_id → Account.id
FK: reviewee_id → Account.id
```

### Constraints

```
rating BETWEEN 1 AND 5
```

---

# 5. Indexing Strategy

Indexes improve query performance.

### Recommended Indexes

```
Account
- email (unique)

Request
- buyer_id
- status
- created_at

Offer
- request_id
- seller_id

Order
- buyer_id
- seller_id
- status

Message
- sender_id
- receiver_id

Review
- reviewee_id
```

---

# 6. Example Workflow

### Buyer posts a request

```
Account → creates Request
```

---

### Sellers submit offers

```
Seller → Offer → Request
```

---

### Buyer accepts offer

```
Offer.status → accepted
Create Order
Request.status → closed
```

---

### After delivery

```
Order.status → completed
Both users create Review
```

---

# 7. Future Extensions

This schema is designed to support future modules.

Possible future tables:

| Feature        | Table               |
| -------------- | ------------------- |
| Payment        | payments            |
| Escrow         | escrow_transactions |
| Notification   | notifications       |
| Saved Requests | saved_requests      |
| Categories     | categories          |
| Attachments    | request_files       |
| Moderation     | reports             |

---

# 8. Summary

This database design provides:

* **7 core tables**
* **Flexible user roles**
* **Clear marketplace workflow**
* **Prisma-friendly relational structure**
* **Room for future marketplace features**

Core relationship:

```
Account
   ├── Profile
   ├── Request
   │      └── Offer
   │             └── Order
   │                    └── Review
   └── Message
```
