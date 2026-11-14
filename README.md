# CARDORA

**Identity, Designed with Elegance.**

A responsive React + Vite storefront concept for personalized student-themed cards and stationery, styled in olive green, warm brown, and beige.

## Included
- Responsive storefront and product category filters
- Interactive shopping bag and quantity controls
- Admin dashboard for adding, editing, and deleting products
- Admin order list and order-status management
- Express API with MongoDB models
- Customer registration/login using bcrypt and JWT
- Server-side order pricing from database product records

## Administrator setup
1. Configure a private .env file using .env.example as a guide.
2. Set MONGODB_URI, a long random JWT_SECRET, ADMIN_EMAIL, and a unique ADMIN_PASSWORD of at least 12 characters.
3. Run npm install.
4. Run npm run admin:create once to create or update the administrator account.
5. Start the API with npm run server and the frontend with npm run dev.
6. Open the website footer and select Admin dashboard to sign in.

Never put real credentials in GitHub. The .env file is ignored by Git. Public customer registration always creates a customer account and cannot grant administrator access.

## Run locally
Requires Node.js 18+ and MongoDB.
- Frontend: http://localhost:5173
- API health: http://localhost:5000/api/health

## API routes
- GET /api/health
- GET /api/products
- POST /api/auth/register
- POST /api/auth/login
- GET /api/admin/products (admin only)
- POST /api/admin/products (admin only)
- PUT /api/admin/products/:id (admin only)
- DELETE /api/admin/products/:id (admin only)
- GET /api/admin/orders (admin only)
- PATCH /api/admin/orders/:id (admin only)
- POST /api/orders (signed-in customer)
- GET /api/orders/mine (signed-in customer)

## Important identity-card policy
This project is for personalized designs, keepsakes, stationery, and non-official student-themed merchandise. Official institutional identity cards and credentials may only be issued by the relevant institution or produced with its written authorization. Do not represent unofficial designs as valid university IDs.

## Before accepting real orders
This is a starter implementation, not a production-ready payment system. Add payment verification, delivery integration, rate limiting, production CORS settings, HTTPS deployment, clear privacy/refund policies, and thorough testing. Never commit API keys, database passwords, JWT secrets, or customer data.