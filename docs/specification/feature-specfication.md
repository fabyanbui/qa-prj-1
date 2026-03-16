# Reverse Marketplace – Core Feature Specification

## 1. Authentication & Account Management

These features operate on the **Account** and **Profile** tables.

### 1.1 User Registration

Users create an account.

**Input**

* email
* password

**System Actions**

* create record in `Account`
* create record in `Profile`

**Result**

* user can log in
* user automatically becomes both **buyer and seller**

---

### 1.2 Login / Logout

Users authenticate into the system.

**Login**

Input:

* email
* password

System:

* validate credentials
* return authentication token/session

---

### 1.3 Profile Management

Users can edit their profile.

**Actions**

User can:

* update display name
* update avatar
* update phone number
* update location
* update bio

**Tables**

```
Profile
```

---

# 2. Buyer Features

Buyer functionality is based on the **Request** entity.

---

# 2.1 Create Request

Buyer posts a request for product/service.

Example:

> "Need a logo design. Budget $100–$200."

**Input**

* title
* description
* budget_min
* budget_max
* deadline

**Database**

```
INSERT → Request
buyer_id = current_user
status = open
```

---

# 2.2 View Request List

Users can browse available requests.

**Filters**

* open requests
* budget range
* newest

**Query**

```
SELECT * FROM Request
WHERE status = 'open'
ORDER BY created_at DESC
```

---

# 2.3 View Request Detail

Shows:

* request description
* budget
* buyer profile
* all offers from sellers

**Tables involved**

```
Request
Account
Offer
Profile
```

---

# 2.4 Manage My Requests

Buyer can view requests they created.

Actions:

* edit request
* close request
* cancel request

**Database**

```
UPDATE Request
SET status = closed
```

---

# 3. Seller Features

Seller functionality revolves around **Offer**.

---

# 3.1 Browse Requests

Sellers discover opportunities.

View:

* request title
* budget
* deadline
* description

**Query**

```
Request WHERE status = open
```

---

# 3.2 Submit Offer

Seller proposes to fulfill a request.

Example:

> "I can do this for $150 in 3 days."

**Input**

* price
* message
* delivery_days

**Database**

```
INSERT → Offer
seller_id
request_id
status = pending
```

---

# 3.3 View My Offers

Seller can track offers they submitted.

Statuses:

* pending
* accepted
* rejected

**Query**

```
Offer WHERE seller_id = current_user
```

---

# 3.4 Withdraw Offer

Seller cancels an offer before acceptance.

```
UPDATE Offer
SET status = withdrawn
```

---

# 4. Offer Negotiation & Communication

This feature uses the **Message** table.

---

# 4.1 Chat Between Buyer and Seller

Users can send messages.

Message context:

* request
* offer

**Input**

* content

**Database**

```
INSERT → Message
sender_id
receiver_id
request_id or offer_id
```

---

# 4.2 Conversation View

Users see conversation history.

**Query**

```
SELECT * FROM Message
WHERE sender_id = X AND receiver_id = Y
```

---

# 5. Order Management

Orders begin when a **buyer accepts an offer**.

---

# 5.1 Accept Offer

Buyer selects one offer.

System actions:

```
Offer.status = accepted
Create Order
Request.status = closed
All other offers = rejected
```

Tables:

```
Offer
Order
Request
```

---

# 5.2 View My Orders

Users see active orders.

Buyer query:

```
Order WHERE buyer_id = current_user
```

Seller query:

```
Order WHERE seller_id = current_user
```

---

# 5.3 Order Status Tracking

Possible statuses:

```
active
completed
cancelled
disputed
```

---

# 5.4 Mark Order Completed

After delivery, buyer marks order completed.

```
UPDATE Order
SET status = completed
```

---

# 6. Review System

Based on **Review** table.

---

# 6.1 Leave Review

After order completion, users can rate each other.

**Input**

* rating (1–5)
* comment

**Database**

```
INSERT → Review
order_id
reviewer_id
reviewee_id
```

---

# 6.2 View User Reputation

Users can see ratings.

Example:

```
SELECT AVG(rating)
FROM Review
WHERE reviewee_id = user
```

---

# 7. User Dashboard

Every user has a personal dashboard.

---

## Dashboard Sections

### My Requests

Requests created by user.

```
Request WHERE buyer_id = user
```

---

### My Offers

Offers submitted by user.

```
Offer WHERE seller_id = user
```

---

### My Orders

Active and completed transactions.

```
Order WHERE buyer_id = user
OR seller_id = user
```

---

# 8. Notifications (Basic MVP)

Simple in-app notifications.

Trigger events:

| Event           | Notification    |
| --------------- | --------------- |
| new offer       | notify buyer    |
| offer accepted  | notify seller   |
| new message     | notify receiver |
| order completed | notify both     |

(Stored later in a `notifications` table.)

---

# 9. Basic Admin Features (Optional MVP)

Admin can:

* suspend accounts
* remove requests
* moderate reviews

Tables affected:

```
Account
Request
Review
```

---

# 10. Minimal MVP Feature List

If we were launching **version 1**, the **absolute minimal feature set** would be:

### Authentication

* register
* login

### Marketplace

* create request
* browse requests
* view request detail

### Seller

* submit offer

### Transaction

* accept offer
* create order
* mark completed

### Communication

* message buyer/seller

### Reputation

* leave review

That’s **enough to make the marketplace functional**.

---

# 11. Feature → Database Mapping

| Feature        | Tables       |
| -------------- | ------------ |
| Register       | Account      |
| Profile        | Profile      |
| Create Request | Request      |
| Submit Offer   | Offer        |
| Accept Offer   | Offer, Order |
| Messaging      | Message      |
| Complete Order | Order        |
| Review         | Review       |
