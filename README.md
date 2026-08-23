<div align="center">

<img src="src/assets/Logo.png" alt="BeejVeda Logo" width="200" />

# 🌿 BeejVeda Naturals

**Organic Wellness Products — Farm to Your Doorstep**

Premium herbal teas, mushroom supplements, dried vegetables, and microgreens sourced directly from organic farms.

</div>

---

## About

BeejVeda Naturals is an e-commerce platform for organic health and wellness products. Built as a **MERN stack** application with a Vite-powered React frontend and an Express/Node.js backend API.

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Build tool & dev server |
| Tailwind CSS | Utility-first styling |
| shadcn/ui | Component library |
| React Router v6 | Client-side routing |
| Zustand / Context | State management |
| React Query | Server state & caching |
| Zod | Schema validation |

### Backend

| Technology | Purpose |
|---|---|
| Node.js + Express | HTTP server |
| TypeScript | Type safety |
| MongoDB + Mongoose | Database & ODM |
| JWT (access + refresh) | Authentication |
| bcryptjs | Password hashing |
| Zod | Request validation |
| multer | File upload handling |
| Backblaze B2 (S3 API) | Private image storage |
| Helmet | Security headers |
| CORS | Cross-origin configuration |

---

## Prerequisites

- **Node.js** ≥ 18.x (LTS recommended)
- **MongoDB Atlas** account (free tier works) — you'll need a connection string
- **Backblaze B2** account — create a private bucket and generate an Application Key with read/write access scoped to that bucket
- Package manager: **npm** (recommended; project ships with `package-lock.json`)

---

## Project Structure

```
Beejveda/
├── src/                     # React frontend (Vite)
├── public/                  # Static assets
├── package.json             # Frontend dependencies
├── vite.config.ts
├── README.md
├── .env.example             # Frontend env template
│
└── server/                  # Backend API (separate Node project)
    ├── package.json
    ├── tsconfig.json
    ├── .env.example         # Backend env template
    ├── scripts/
    │   └── seed.ts          # Database seed script
    └── src/
        ├── index.ts         # Server entry point
        ├── app.ts           # Express app setup & middleware
        ├── config/          # Environment, DB, B2 config
        ├── models/          # Mongoose schemas
        ├── controllers/     # Route handlers
        ├── routes/          # Express routers
        ├── middleware/       # Auth, admin, error, validation, upload
        ├── validators/      # Zod schemas
        └── utils/           # Helpers (ApiError, tokens, slugify, B2)
```

---

## Getting Started

### Frontend

```bash
# From project root
npm install
cp .env.example .env        # Set VITE_API_URL if needed
npm run dev
```

Frontend runs at `http://localhost:5173`.

### Backend

```bash
cd server
npm install
cp .env.example .env        # Fill in all required values
```

**Seed the database** (populates categories + products):

```bash
npm run seed
```

**Start the dev server** (auto-restarts on changes):

```bash
npm run dev
```

Backend runs at `http://localhost:5000`.

---

## Environment Variables

### Frontend (`.env`)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |

### Backend (`server/.env`)

| Variable | Description | Required |
|---|---|---|
| `PORT` | Server port | No (default: `5000`) |
| `NODE_ENV` | `development` / `production` / `test` | No (default: `development`) |
| `CORS_ORIGIN` | Allowed origins (comma-separated) | No (default: `http://localhost:5173`) |
| `MONGODB_URI` | MongoDB Atlas connection string | **Yes** |
| `JWT_SECRET` | Access token signing secret | **Yes** |
| `JWT_EXPIRES_IN` | Access token TTL | No (default: `15m`) |
| `JWT_REFRESH_SECRET` | Refresh token signing secret | **Yes** |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL | No (default: `30d`) |
| `B2_KEY_ID` | Backblaze B2 key ID | **Yes** |
| `B2_APPLICATION_KEY` | Backblaze B2 application key | **Yes** |
| `B2_BUCKET_NAME` | B2 bucket name | **Yes** |
| `B2_BUCKET_ID` | B2 bucket ID | **Yes** |
| `B2_ENDPOINT` | B2 S3-compatible endpoint URL | **Yes** |
| `B2_REGION` | B2 region | No (default: `us-east-005`) |
| `B2_SIGNED_URL_EXPIRY_SECONDS` | Presigned URL lifetime | No (default: `3600`) |

---

## API Overview

### Public Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Register a new customer |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout (clears refresh cookie) |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/products` | List products (filterable, paginated) |
| GET | `/api/products/:slug` | Get product by slug |
| GET | `/api/categories` | List active categories with product counts |
| GET | `/api/categories/:slug` | Get category by slug |
| GET | `/api/reviews/product/:productId` | List reviews for a product |

### Protected Endpoints (require `Authorization: Bearer <token>`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/auth/me` | Get current user profile |
| GET | `/api/cart` | Get user cart (populated with live prices) |
| POST | `/api/cart/items` | Add item to cart |
| PATCH | `/api/cart/items/:itemId` | Update cart item quantity |
| DELETE | `/api/cart/items/:itemId` | Remove item from cart |
| DELETE | `/api/cart` | Clear cart |
| POST | `/api/orders` | Create order from cart |
| GET | `/api/orders` | Get user's orders |
| GET | `/api/orders/:id` | Get order detail |
| POST | `/api/reviews` | Create a review |

### Admin Endpoints (require admin role)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/admin/products` | Create product |
| GET | `/api/admin/products` | List all products (incl. inactive) |
| GET | `/api/admin/products/:id` | Get product by ID |
| PATCH | `/api/admin/products/:id` | Update product |
| DELETE | `/api/admin/products/:id` | Soft/hard delete product |
| POST | `/api/admin/products/:id/variants` | Add variant |
| PATCH | `/api/admin/products/:id/variants/:vid` | Update variant |
| DELETE | `/api/admin/products/:id/variants/:vid` | Delete variant |
| POST | `/api/admin/categories` | Create category |
| GET | `/api/admin/categories` | List all categories |
| PATCH | `/api/admin/categories/:id` | Update category |
| DELETE | `/api/admin/categories/:id` | Delete category |
| GET | `/api/admin/orders` | List all orders (filterable) |
| GET | `/api/admin/orders/:id` | Get order detail |
| PATCH | `/api/admin/orders/:id/status` | Update order status |
| GET | `/api/admin/users` | List users |
| PATCH | `/api/admin/users/:id/role` | Update user role |
| POST | `/api/upload/product/:id` | Upload product image (multipart) |
| DELETE | `/api/upload/product/:id/image/:key` | Delete product image |
| POST | `/api/upload/category/:id` | Upload category image (multipart) |
| DELETE | `/api/upload/category/:id/image` | Delete category image |

---

## Available Scripts

### Frontend

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

### Backend (`cd server`)

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with hot-reload (tsx watch) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run compiled server |
| `npm run seed` | Seed database with categories & products |

---

## Deployment Notes

- **Frontend**: Deploy the built `dist/` folder to any static host (Vercel, Netlify, Cloudflare Pages). Set `VITE_API_URL` to your production backend URL.
- **Backend**: Deploy to any Node.js host (Railway, Render, Fly.io, a VPS). Set `CORS_ORIGIN` to your production frontend URL.
- **Database**: MongoDB Atlas M0 (free tier) is sufficient for development and small production workloads.
- **Storage**: Backblaze B2 is cost-effective for image storage. Application keys should be scoped to read+write on your bucket only.

---

## License

Private — © BeejVeda Naturals
