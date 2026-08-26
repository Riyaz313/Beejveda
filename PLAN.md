# Beejveda MERN Backend — Implementation Plan

## Context

Beejveda's frontend (Vite + React 18 + TypeScript + shadcn-ui) was scaffolded by Lovable and is currently 100% frontend — no backend exists anywhere in the repo (confirmed: no `server/`/`backend/`/`api/` folder, no `.env` files). The only backend-adjacent artifact is `src/lib/api.ts`, a **stale, unused** fetch client from an earlier abandoned "migrate to FastAPI" attempt (git history shows this was superseded). Checkout (`src/pages/Checkout.tsx`) is a pure client-side mock (`setTimeout` fake submit), and the login/signup UI (`src/pages/Account.tsx`) has no wired handler at all.

The user wants a real backend built now, as a **MERN stack** (MongoDB Atlas + Express + React + Node), with:
1. A rewritten, developer-friendly `README.md` (logo + tech stack + setup docs).
2. MongoDB Atlas as the database (connection string to be supplied by the user later — never fabricated).
3. Backblaze B2 as **private** object storage for product images (key-based auth only, no public bucket, since public requires a credit card).
4. An admin panel **backend** (API) supporting products sold in flexible variant units — arbitrary piece counts (1pc, 2pcs, ...), weights (100g, 500g, 1kg, ...), or volumes (100ml, 1l, ...) — not a fixed picklist of exact values.

This plan scopes **backend-only** work this pass. Two follow-up phases are explicitly deferred (tracked as future work, not part of this implementation):
- **Phase 2:** Rewire the frontend to the real API — replace `src/lib/api.ts`, add an `AuthContext`, wire `Account.tsx` and `Checkout.tsx` to real endpoints, switch `CartContext` to sync with the new server-side cart for logged-in users.
- **Phase 3:** Build the admin **UI** (this pass only builds the admin API, to be exercised via Postman/Insomnia or a future admin frontend).

**Decisions locked in with the user:**
- Backend language: **TypeScript** (matches frontend conventions).
- Image serving: **Presigned B2 URLs** (~1hr expiry), attached to product/category JSON at response time — no bandwidth cost on the API server, no public bucket needed.
- Cart: **Server-side**, per logged-in user, built now (not deferred) — a `Cart` Mongoose model + `/api/cart` endpoints.
- Seed script: skip image migration — seed products with `images: []`; real images get uploaded per-product afterward via the new admin upload endpoint.

---

## 1. Repository Layout

New, fully separate Node project living alongside the existing Vite frontend (monorepo-style, independent `package.json`/lockfile, not merged into the Vite build):

```
Beejveda/
├── src/, public/, package.json, vite.config.ts   ← existing, unchanged this pass
├── README.md                                     ← rewritten (see §10)
├── .env.example                                  ← NEW (frontend): VITE_API_URL=http://localhost:5000/api
└── server/                                       ← NEW, separate Node/TS project
    ├── package.json, tsconfig.json, .env.example, .gitignore
    ├── src/
    │   ├── index.ts, app.ts
    │   ├── config/        db.ts, env.ts, b2.ts
    │   ├── models/        User, Category, Product, Order, Review, Cart (.model.ts)
    │   ├── controllers/   auth, product, category, order, review, cart, upload
    │   │                  + admin/ (admin.product, admin.category, admin.order, admin.user)
    │   ├── routes/        mirrors controllers, admin/ subfolder for /api/admin/*
    │   ├── middleware/     auth (protect), admin (adminOnly), error, validate (zod), upload (multer)
    │   ├── utils/          ApiError, asyncHandler, generateToken, slugify, b2Storage
    │   └── validators/     auth, product, order (zod schemas)
    └── scripts/seed.ts
```

---

## 2. Mongoose Schemas

**User** — `name`, `email` (unique), `password` (bcryptjs hash, `select:false`, pre-save hook), `role: 'customer'|'admin'`, `phone`, `addresses[]` (label/address/address2/city/state/pincode/country/isDefault), timestamps. No public admin-registration endpoint — admins are seeded/promoted directly (deliberate security choice against privilege escalation).

**Category** — `name`, `slug` (unique, indexed), `description`, `image` (B2 object key), `isActive`, timestamps. `productCount` is computed live via aggregation, not stored (avoids drift from the current mock's static counter).

**Product** (core of the variant requirement):
- `name`, `slug` (unique), `category` (ref), `description`, `benefits[]`, `ingredients[]`, `howToUse`, `images: [{ key, alt, isPrimary }]` (B2 object keys, never raw URLs), `badge`, `brand` (default "Beejveda"), `ratingsAverage`/`ratingsCount` (updated via Review hooks), `isActive` (soft delete), timestamps.
- `variants: [ProductVariantSchema]` (embedded array):
  - `unitType: enum('piece','weight','volume')`, required.
  - `value: Number`, required, **no enum** — this is what allows "any number of pcs / any weight."
  - `unit: String`, required — validated at the **application layer** (zod `.refine()` in `validators/product.validators.ts`) against an allowed-unit-per-unitType map (`piece→['pc']`, `weight→['g','kg']`, `volume→['ml','l']`), not a Mongo enum, so the allowed-unit list stays easy to extend without a schema migration.
  - `displayLabel` — auto-derived pre-save (e.g. "500 g", "2 pcs").
  - `price`, `originalPrice?`, `sku` (auto-generated if omitted), `stock` (default 0), `inStock` (virtual, derived from `stock > 0`), `isDefault` (pre-save hook ensures exactly one default variant).
  - Duplicate-variant prevention (same unitType+value+unit on one product) enforced in the controller, not the schema.

**Order** — `user` (ref), `items[]` (full **snapshot**: product ref, name, image key, variant details, unitPrice, quantity, lineTotal — so edits/deletes to products never corrupt historical orders), `shippingAddress` (firstName/lastName/email/phone/address/address2/city/state/pincode/country — matches `Checkout.tsx`'s existing form fields exactly), `paymentMethod: 'COD'|'ONLINE'` (ONLINE accepted in schema now even though frontend currently disables it), `itemsTotal`/`shippingFee`/`grandTotal`, `status` enum, `paymentStatus` enum, timestamps.

**Review** — `product` (ref), `user` (ref), `rating` (1-5), `comment`, unique compound index on `(product, user)`, timestamps.

**Cart** — per the "add server-side cart now" decision: `user` (ref, unique), `items: [{ product: ref, variantId: ObjectId (subdocument _id within product.variants), quantity }]`, timestamps. Cart endpoints re-validate product/variant existence and stock on every mutation (never trust stale client state).

---

## 3. Auth (JWT)

- `POST /api/auth/register` — `{ name, email, password }` → creates `role:'customer'` user, returns `{ user, accessToken }` + refresh token as httpOnly cookie.
- `POST /api/auth/login` — same response shape.
- `POST /api/auth/logout` — clears refresh cookie.
- `GET /api/auth/me` — protected, current profile.
- `POST /api/auth/refresh` — exchanges refresh cookie for new access token (access ~15m, refresh ~30d).
- `middleware/auth.middleware.ts` (`protect`): verifies `Authorization: Bearer <token>`, attaches `req.user`, 401 on failure.
- `middleware/admin.middleware.ts` (`adminOnly`): requires `req.user.role === 'admin'`, 403 otherwise.

---

## 4. Public Catalog Endpoints

- `GET /api/products` — filters via query params (`category`, `search`, `minPrice`, `maxPrice`, `unitType`, `sort`, `page`, `limit`); search via text index or regex on name/description/benefits.
- `GET /api/products/:slug` — full detail, populates category, includes variants + ratings.
- `GET /api/categories` — active categories with live-computed `productCount`.
- `GET /api/categories/:slug` — single category.
- `GET /api/reviews/product/:productId` — public list.
- `POST /api/reviews` — protected, `{ product, rating, comment }`, duplicate (product,user) → 409.

## 5. Cart Endpoints (`/api/cart`, all protected)

- `GET /` — current user's cart, populated with live product/variant data (price/stock) so the frontend always shows current prices, not stale snapshots.
- `POST /items` — `{ productId, variantId, quantity }`, validates stock, upserts line item.
- `PATCH /items/:itemId` — update quantity.
- `DELETE /items/:itemId` — remove line item.
- `DELETE /` — clear cart (called after successful order creation).

## 6. Order Endpoints (`/api/orders`, all protected)

- `POST /` — creates order from the server-side cart (or an explicit item list): re-fetches each product/variant from DB (**never trusts client-sent price**), snapshots into `order.items`, validates stock, atomically decrements `variant.stock` (`findOneAndUpdate` with `$inc` + stock-guard filter to prevent oversell races), computes totals (mirrors existing `total >= 999 ? 0 : 99` shipping logic in `Checkout.tsx`), clears the cart on success.
- `GET /` — current user's own orders.
- `GET /:id` — single order, 403 if not owner (unless admin).

## 7. Admin API (`/api/admin/...`, all behind `protect` + `adminOnly`)

- **Products**: `POST /`, `GET /` (includes inactive), `GET /:id`, `PATCH /:id`, `DELETE /:id` (soft delete by default; `?hard=true` does real delete + B2 image cleanup, gated to avoid accidents).
- **Variants**: `POST /:id/variants`, `PATCH /:id/variants/:variantId`, `DELETE /:id/variants/:variantId` (blocked if it's the last variant, or referenced by open orders → 409).
- **Images**: `POST /:id/images` (multipart via multer memory storage → B2 `PutObjectCommand`, stores returned key), `DELETE /:id/images/:imageKey` (B2 delete + array removal).
- **Categories**: standard CRUD, same image pattern.
- **Orders**: `GET /` (filterable by status/date/user), `GET /:id`, `PATCH /:id/status`.
- **Users**: `GET /` (list), `PATCH /:id/role` (guard against demoting the last remaining admin).

---

## 8. Backblaze B2 Integration

**Approach: S3-compatible API via `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`** (not the native `backblaze-b2` package) — actively maintained, well-documented, and keeps the storage layer swappable (only `config/b2.ts` env values would change to migrate to real S3/R2 later).

- Bucket stays **private**. Auth via `B2_KEY_ID`/`B2_APPLICATION_KEY` (application key scoped to just this bucket, read+write only — least privilege).
- **Upload** (admin only): `PutObjectCommand` streams multer's buffer to a key like `products/<slug>/<uuid>-<originalName>`. Only the **key** is stored in Mongo, never a URL.
- **Read**: per the locked-in decision, `utils/b2Storage.ts` exposes `getSignedImageUrl(key, expiresIn=3600)` (`GetObjectCommand` + `getSignedUrl`). Product/category controllers attach freshly-signed URLs to each image at serialization time (a `toPublicJSON()` transform, not persisted) — cheap (pure signature computation, no B2 network call per request).
- `config/b2.ts`: `new S3Client({ region, endpoint: B2_ENDPOINT, credentials: { accessKeyId, secretAccessKey }, forcePathStyle: true })`.
- Deletion: `DeleteObjectCommand` on image-delete and hard product-delete, so B2 storage doesn't accumulate orphaned objects.

---

## 9. Environment Variables

`server/.env.example`:
```
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

MONGODB_URI=

JWT_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=30d

B2_KEY_ID=
B2_APPLICATION_KEY=
B2_BUCKET_NAME=
B2_BUCKET_ID=
B2_ENDPOINT=
B2_REGION=
B2_SIGNED_URL_EXPIRY_SECONDS=3600
```
`config/env.ts` validates required vars at boot via zod (fail fast, not a silent `mongoose.connect(undefined)`).

Root `.env.example` (new, frontend, no fabricated values):
```
VITE_API_URL=http://localhost:5000/api
```

CORS: `app.ts` reads `CORS_ORIGIN` (comma-separated → array), `credentials: true` (needed since refresh token travels as an httpOnly cookie).

---

## 10. Seed Script (`server/scripts/seed.ts`)

- A local snapshot of `categories`/`products` data (copied from `src/data/products.ts`, since that file's Vite asset `import` syntax can't resolve under plain Node/ts-node) upserts `Category` docs by slug, then `Product` docs by slug.
- Maps the current flat `weight: string` (e.g. `"100g"`, `"60 capsules"`) into **one initial variant** per product: regex-parses leading number + unit token, maps `g/gram(s)`→weight/g, `kg`→weight/kg, `ml`→volume/ml, `l/liter(s)`→volume/l, anything else (capsules, unparseable)→piece/pc. `price`/`originalPrice` go on this variant, `stock: inStock ? 100 : 0` as an admin-adjustable placeholder, `isDefault: true`.
- Per the locked-in decision: `images: []` on seed — real images are uploaded afterward per-product via the new admin upload endpoint.
- `bundles`/`testimonials` are **not** modeled as Mongoose schemas this pass (no requirement calls for backend persistence of them) — remain static frontend content.
- Idempotent (upsert on slug), run via `npm run seed` once `MONGODB_URI` is supplied.

---

## 11. `server/package.json` — Key Dependencies

- Runtime: `express`, `mongoose`, `bcryptjs` (native-build-free, Windows-dev-friendly), `jsonwebtoken`, `cors`, `dotenv`, `multer`, `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `zod`, `cookie-parser`, `morgan`, `helmet`.
- Dev: `typescript`, `tsx` (watch/dev runner), `@types/*`, `eslint`.
- Scripts: `dev`, `build` (`tsc`), `start`, `seed`.

---

## 12. README Rewrite (`README.md`)

Replaces the generic Lovable template entirely. Sections: logo (`src/assets/Logo.png`) + title/tagline; About; Tech Stack (frontend table + backend table); Prerequisites (Node version, MongoDB Atlas account, B2 account with a private-bucket-scoped application key; note the `bun.lockb`+`package-lock.json` ambiguity and recommend standardizing on npm); Project Structure; Getting Started (frontend, then backend — install, `.env` setup, `npm run seed`, `npm run dev`); Environment Variables (two tables mirroring §9); Available Scripts (per package); API Overview (endpoint summary table from §3-7); Deployment Notes (placeholder — frontend to any static host, backend to any Node host, note `CORS_ORIGIN` needs the production frontend URL); License/Contact.

---

## Verification

1. `cd server && npm install && npm run dev` — server boots on `PORT`, connects to MongoDB (once `MONGODB_URI` is supplied), fails fast with a clear message if required env vars are missing.
2. `npm run seed` — populates categories/products from the snapshot, confirm via `GET /api/products` and `GET /api/categories` (curl/Postman) that data + computed variants appear correctly.
3. Auth flow: register → login → `GET /api/auth/me` with the bearer token → confirm role defaults to `customer`; manually promote one seeded user to `admin` in MongoDB to test admin routes.
4. Admin flow: create a product with 2+ variants (e.g. one weight variant, one piece variant) via `POST /api/admin/products`, upload an image via `POST /api/admin/products/:id/images`, confirm `GET /api/products/:slug` returns a working presigned image URL that loads in a browser within its expiry window.
5. Cart + order flow: add items to `/api/cart`, `POST /api/orders`, confirm stock decrements correctly and a concurrent double-submit doesn't oversell (test with two rapid requests against low stock).
6. CORS: run the existing Vite frontend (`npm run dev` at repo root) and confirm a manual `fetch('http://localhost:5000/api/products')` from the browser console succeeds without CORS errors.
