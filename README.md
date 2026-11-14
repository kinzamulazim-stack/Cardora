# CARDORA

**Identity, Designed with Elegance.**

A responsive React + Vite storefront concept for personalized student-themed cards and stationery, styled in olive green, warm brown, and beige.

## Included
- Responsive storefront and product category filters
- Interactive shopping bag and quantity controls
- Custom-design enquiry section
- Express API starter with MongoDB models
- Customer registration/login using bcrypt and JWT
- Authenticated order creation and order history endpoints
- `.env.example` for configuration

## Important identity-card policy
This project is for personalized designs, keepsakes, stationery, and non-official student-themed merchandise. Official institutional identity cards and credentials may only be issued by the relevant institution or produced with its written authorization. Do not represent unofficial designs as valid university IDs.

## Run locally
Requires Node.js 18+ and MongoDB.

1. Run `npm install`.
2. Copy `.env.example` to `.env`; set `MONGODB_URI` and a long random `JWT_SECRET`.
3. Start the frontend with `npm run dev`.
4. Start the API in another terminal with `npm run server`.

Frontend: `http://localhost:5173`  
API health: `http://localhost:5000/api/health`

## API routes
- `GET /api/health`
- `GET /api/products`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/orders` (Bearer token required)
- `GET /api/orders/mine` (Bearer token required)

## Before accepting real orders
This is a starter project, not a production-ready payment system. Add server-side price validation, admin-only product/order management, rate limiting, request validation, production CORS settings, HTTPS deployment, payment verification, delivery integration, and clear privacy/refund policies. Never commit API keys, database passwords, JWT secrets, or customer data.
