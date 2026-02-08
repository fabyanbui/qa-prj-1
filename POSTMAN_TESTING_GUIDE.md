# 🚀 POSTMAN Testing Guide

## Quick Start

### Option 1: Import the Collection (Recommended)
1. Open POSTMAN
2. Click **Import** button (top left)
3. Select **File** tab
4. Choose `E-commerce_API_Tests.postman_collection.json` from this directory
5. Click **Import**
6. Done! All requests are ready to use

### Option 2: Manual Setup
Follow the step-by-step guide below.

---

## 📋 Testing Workflow

### Step 1: Start Your Application
```bash
npm run dev
```
Make sure the app is running on `http://localhost:3000`

### Step 2: Test in This Order

#### ✅ **Authentication Tests**
1. **Sign Up - New User**
   - Creates a new user with both BUYER and SELLER roles
   - ⚠️ **IMPORTANT:** Copy the `user.id` from the response
   - Save it in Collection Variables as `userId`

2. **Login - Valid Credentials**
   - Verifies login works correctly
   - Returns the same user data

3. **Login - Invalid Credentials** (Should Fail)
   - Tests error handling

4. **Sign Up - Duplicate User** (Should Fail)
   - Tests duplicate email validation

#### ✅ **Product Tests**
5. **Get All Products**
   - Lists all products in database

6. **Create Product**
   - Uses `{{userId}}` variable as sellerId
   - ⚠️ **IMPORTANT:** Copy the `id` from the response
   - Save it in Collection Variables as `productId`

7. **Get Product by ID**
   - Uses `{{productId}}` variable

8. **Update Product**
   - Modifies the product you created

9. **Delete Product**
   - Removes the product

10. **Get Product - Invalid ID** (Should Fail)
    - Tests 404 error handling

#### ✅ **Checkout Tests**
11. **Checkout - Single Seller**
    - Creates an order with items from one seller

12. **Checkout - Multiple Sellers**
    - Creates separate orders for different sellers

13. **Checkout - Missing BuyerId** (Should Fail)
    - Tests validation

#### ✅ **Security Tests**
14. **SQL Injection - Login**
    - Tests if SQL injection is prevented

15. **XSS - Product Name**
    - Tests if XSS attacks are handled

---

## 🔧 Setting Collection Variables

After importing the collection:

1. Click on the collection name
2. Go to **Variables** tab
3. Set these variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `baseUrl` | `http://localhost:3000` | API base URL |
| `userId` | *(copy from signup response)* | Your user ID |
| `productId` | *(copy from create product response)* | Product ID for testing |

---

## 📸 How to Use Variables in POSTMAN

### Setting a Variable:
1. Send a request (e.g., Sign Up)
2. Copy the `id` from the response
3. Click on collection → **Variables** tab
4. Paste the value into `userId` or `productId`
5. Click **Save**

### Using a Variable:
Variables are already set up in the collection using `{{variableName}}` syntax:
- `{{baseUrl}}` - Base URL
- `{{userId}}` - User ID
- `{{productId}}` - Product ID

---

## ✅ Expected Results

### Successful Requests (200/201):
- ✅ Sign Up - Returns user data with token
- ✅ Login - Returns user data with token
- ✅ Get All Products - Returns array of products
- ✅ Create Product - Returns created product
- ✅ Get Product by ID - Returns single product
- ✅ Update Product - Returns updated product
- ✅ Delete Product - Returns success message
- ✅ Checkout - Returns order IDs

### Failed Requests (400/401/404):
- ❌ Login with wrong password - 401 Unauthorized
- ❌ Duplicate signup - 400 Bad Request
- ❌ Create product without sellerId - 400 Bad Request
- ❌ Get invalid product ID - 404 Not Found
- ❌ Checkout without buyerId - 400 Bad Request

---

## 🎯 Testing Scenarios

### Scenario 1: Complete User Journey
1. Sign up as a new user
2. Login with credentials
3. Create a product (as seller)
4. View all products
5. Checkout (as buyer)

### Scenario 2: Multi-Role Testing
1. Create 3 users:
   - User A: BUYER only
   - User B: SELLER only
   - User C: Both BUYER and SELLER
2. User B creates products
3. User A and C can checkout
4. User C can also create products

### Scenario 3: Error Handling
1. Try invalid credentials
2. Try duplicate signup
3. Try creating product without sellerId
4. Try accessing non-existent product
5. Try SQL injection

---

## 🔍 Debugging Tips

### If requests fail:
1. ✅ Check if app is running (`http://localhost:3000`)
2. ✅ Verify database is connected (check terminal logs)
3. ✅ Check if variables are set correctly
4. ✅ Look at POSTMAN Console (View → Show Postman Console)
5. ✅ Check server terminal for error logs

### Common Issues:
- **"Cannot POST /api/..."** → Check URL spelling
- **"Missing fields"** → Check request body JSON
- **"Product not found"** → Update `productId` variable
- **"sellerId is required"** → Update `userId` variable

---

## 📊 Advanced Testing

### Test Scripts (Optional)
You can add test scripts in POSTMAN to automate validation:

**Example for Sign Up:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has success true", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
});

pm.test("User has ID", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.user.id).to.exist;
    // Auto-save userId
    pm.collectionVariables.set("userId", jsonData.user.id);
});
```

---

## 🎓 Next Steps

1. ✅ Import the collection
2. ✅ Run all requests in order
3. ✅ Check all responses
4. ✅ Document any bugs found
5. ✅ Create test report

---

## 📝 Notes

- **Authentication:** Uses mock JWT tokens (not real JWT)
- **Security:** Passwords are NOT hashed (demo only)
- **Database:** Uses Prisma with PostgreSQL
- **Roles:** Users can have multiple roles (BUYER, SELLER, or both)

---

## 🆘 Need Help?

Check the API documentation in the main README or refer to the route files:
- `/app/api/auth/signup/route.ts`
- `/app/api/auth/login/route.ts`
- `/app/api/products/route.ts`
- `/app/api/products/[id]/route.ts`
- `/app/api/checkout/route.ts`
