# GORA Store — Supabase Database Documentation

> **Last updated:** September 2026  
> **Status:** ✅ Successfully executed on production Supabase project `wvjwudtzwnzkwlxwujyd`

This document explains every decision made in `database/COMPLETE_SETUP.sql` — what was created, why it was created, and how it fits into the overall system. If you ever need to migrate to a new Supabase project or account, run `COMPLETE_SETUP.sql` once and follow the post-run checklist at the bottom.

---

## Table of Contents

1. [Why Supabase?](#why-supabase)
2. [Extensions](#extensions)
3. [Custom Types (ENUMs)](#custom-types)
4. [Tables](#tables)
5. [Triggers](#triggers)
6. [Row Level Security (RLS)](#row-level-security)
7. [Helper Functions](#helper-functions)
8. [Transactional RPC](#transactional-rpc)
9. [Security Architecture](#security-architecture)
10. [Post-Run Checklist](#post-run-checklist)
11. [Supabase Auth Configuration](#supabase-auth-configuration)
12. [Files in the database/ folder](#files-in-the-database-folder)

---

## Why Supabase?

Supabase provides:
- **PostgreSQL** — a fully relational database with foreign keys, constraints, and transactions.
- **Supabase Auth** — built-in authentication with email/password, OTP, and magic links.
- **Row Level Security (RLS)** — security enforced at the database layer, not just the application layer.
- **Realtime** — for live inventory/order updates in the future.
- **Storage** — we use Cloudflare R2 instead for images (cheaper, faster CDN), but Supabase stores the image metadata.

---

## Extensions

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

**Why:** PostgreSQL needs this extension to generate UUID v4 values using `uuid_generate_v4()`. All our primary keys use UUIDs instead of auto-increment integers.

**Why UUIDs over integers?**
- UUIDs are globally unique — safe to generate on the client or server without a DB round-trip.
- Prevents enumeration attacks (users cannot guess `/product/1`, `/product/2`...).
- Easier to merge data from multiple environments.

---

## Custom Types

```sql
CREATE TYPE user_role      AS ENUM ('customer', 'admin');
CREATE TYPE product_status AS ENUM ('draft', 'active', 'archived');
```

**Why ENUMs?**
- Enforces valid values at the database level — impossible to accidentally store `'adminn'` or `'publc'`.
- `user_role`: Controls what a logged-in user can do. `admin` unlocks the `/manager-gora` dashboard.
- `product_status`:
  - `draft` — Product is being created; invisible to customers.
  - `active` — Live on the storefront.
  - `archived` — Removed from storefront but data preserved for order history.

---

## Tables

### `profiles`

**Purpose:** Extended user profile linked 1-to-1 with Supabase's internal `auth.users` table.

| Column | Type | Reason |
|---|---|---|
| `id` | UUID (FK → auth.users) | Links to Supabase Auth user |
| `email` | VARCHAR | Denormalized for fast login-by-email lookup |
| `role` | user_role ENUM | Drives admin authorization |
| `username` | VARCHAR UNIQUE | Allows login with username instead of email |
| `phone` | VARCHAR UNIQUE | Required for WhatsApp OTP verification |
| `address`, `city`, `pincode` | TEXT/VARCHAR | Pre-fills checkout for registered users |
| `phone_verified` | BOOLEAN | Set to `true` after WhatsApp OTP is confirmed |
| `email_verified` | BOOLEAN | Set to `true` after email link is clicked |

**Auto-create trigger:** Every time a user signs up via Supabase Auth, a `TRIGGER` (`on_auth_user_created`) automatically inserts a row into `profiles` with `role = 'customer'`. This ensures the profile always exists.

---

### `categories`

**Purpose:** Admin-controlled product groupings displayed in the "Shop by Category" section.

| Column | Reason |
|---|---|
| `slug` | URL-safe identifier (e.g. `shirts`, `bottoms`). Used in `/shop/[category]` routes |
| `image_url` | Category cover image shown on the storefront grid |
| `is_active` | Admin can hide a category without deleting it |

**Foreign key behaviour:** Products reference `category_id`. If you try to delete a category that still has products, the database rejects it (`ON DELETE RESTRICT`). You must reassign or delete the products first.

---

### `products`

**Purpose:** Core product catalog. Each row is a single product (e.g. "Classic Overdyed Checkered Shirt").

| Column | Reason |
|---|---|
| `slug` | Unique URL identifier (e.g. `classic-overdyed-checkered-shirt`) |
| `base_price` | The selling price shown to customers |
| `compare_at_price` | The crossed-out "original" price — used to calculate the discount badge |
| `status` | Controls storefront visibility (draft / active / archived) |
| `discount_badge` | e.g. `"-31%"` — stored so admin can override the calculated value |
| `is_featured` | Flags products for the "New Arrivals" / "Trending" sections |

**Constraints enforced by the database:**
- `base_price >= 0` — prices cannot be negative
- `compare_at_price >= 0 OR NULL` — same rule
- `slug` is `UNIQUE` — no two products can share the same URL

---

### `product_images`

**Purpose:** Stores metadata for product images uploaded to Cloudflare R2.

> **Important:** The actual image files live in Cloudflare R2. This table stores references to them, not the files themselves.

| Column | Reason |
|---|---|
| `storage_key` | The R2 object key (e.g. `products/uuid/original/image.webp`). This is the canonical reference — not a hardcoded URL, so we can change CDN domains without updating every row. |
| `url` | The current Cloudflare delivery URL (derived from `storage_key` + R2 domain) |
| `width`, `height`, `aspect_ratio` | Stored so the frontend can generate correct `srcset` and avoid layout shift |
| `is_primary` | Which image shows as the thumbnail on product cards |
| `display_order` | Controls the order of the gallery on the product detail page |

**Uniqueness:** A partial unique index ensures only one image per product can have `is_primary = true`. Attempting to set two primary images throws a DB error.

---

### `product_variants`

**Purpose:** Each row is one specific combination of Color + Size for a product.

Example rows for "Checkered Shirt":

| color | size | stock_quantity | price_override |
|---|---|---|---|
| Red | M | 5 | NULL (uses base price) |
| Red | L | 3 | NULL |
| White | M | 8 | 1600 (this variant costs more) |

| Column | Reason |
|---|---|
| `sku` | Unique stock-keeping unit code for inventory tracking |
| `price_override` | Allows specific variants to have a different price than the base |
| `stock_quantity` | Inventory count. Total stock is summed across all variants |
| `image_url` | Variant-specific image (e.g. the white shirt variant shows the white photo) |

**Constraints enforced by the database:**
- `UNIQUE(product_id, color, size)` — duplicate Color+Size combos are rejected
- `stock_quantity >= 0` — stock cannot go negative
- `price_override >= 0 OR NULL`

---

### `storefront_components`

**Purpose:** A database-driven CMS for the homepage. Admins can change text, images, and toggles without touching code.

Each row represents one UI component:

| `component_type` | What it controls |
|---|---|
| `hero_banner` | Background video URL, heading, subheading, CTA text |
| `promo_block` | "Because Every Look Deserves an Upgrade" text and button |
| `announcement_bar` | Top black bar text (e.g. "40% OFF on two hot-selling products!") |
| `testimonials` | Array of customer reviews (stored as JSONB) |
| `featured_categories` | Which categories appear in the homepage grid |

The `config` column is `JSONB` — it stores flexible key-value data specific to each component type.

---

### `pending_phone_otps`

**Purpose:** Temporary storage for WhatsApp OTPs sent during registration.

**Security design:**
- OTPs are never stored in plaintext. Only the SHA-256 hash is stored.
- Each OTP expires after 10 minutes (`expires_at`).
- After 5 failed attempts, no more verifications are allowed (brute-force protection).
- RLS blocks all public and authenticated access — only the service role (server-side only) can read/write this table.
- Once an OTP is successfully verified, the row is immediately deleted.

---

## Triggers

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```
**Why:** Ensures every Supabase Auth user automatically gets a `profiles` row with `role = 'customer'`. Without this, our admin check would fail because no profile row would exist.

```sql
CREATE TRIGGER update_products_modtime
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
```
**Why (all `_modtime` triggers):** Automatically stamps `updated_at` on every table whenever a row is modified. Useful for cache invalidation, audit trails, and ordering by recency.

---

## Row Level Security

RLS is enabled on every table. This means even if someone gets your `ANON_KEY` (which is public-safe), they still cannot read draft products, write to any table, or access OTP data.

### Policy Summary

| Table | Public (unauthenticated) | Customer (logged in) | Admin |
|---|---|---|---|
| `profiles` | None | Read + Update own row | Full |
| `categories` | Read active only | Read active only | Full |
| `products` | Read active only | Read active only | Full |
| `product_images` | Read (active products only) | Read (active products only) | Full |
| `product_variants` | Read (active products only) | Read (active products only) | Full |
| `storefront_components` | Read active only | Read active only | Full |
| `pending_phone_otps` | None | None | None (service role only) |

---

## Helper Functions

### `public.is_admin()`

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Why:** This function is used inside RLS policies and the RPC to check if the currently authenticated user is an admin. `SECURITY DEFINER` means it runs with elevated privileges so it can bypass RLS on the `profiles` table to perform its own check — preventing infinite recursion.

---

## Transactional RPC

### `create_product_transaction(...)`

**Why it exists:** The Supabase JavaScript client does not support multi-table transactions natively. If we inserted into `products`, then `product_variants`, then `product_images` as separate API calls and the second or third call failed, we would be left with a corrupt, partial product in the database.

This PostgreSQL function wraps all three inserts in a single atomic operation. If anything fails (duplicate SKU, negative price, unauthorized caller), PostgreSQL automatically rolls back everything — leaving the database in a clean state.

**Security inside the function:**
```sql
IF NOT public.is_admin() THEN
  RAISE EXCEPTION 'Unauthorized: Only admins can execute this transaction.';
END IF;
```
Even if someone calls this RPC directly (bypassing the Next.js middleware), the database itself will reject them if they are not an admin.

**R2 Rollback:** The Next.js Server Action that calls this RPC uploads images to Cloudflare R2 first, then calls the RPC. If the RPC fails, the Server Action catches the error and deletes the already-uploaded images from R2, preventing orphaned files.

---

## Security Architecture

```
Customer Browser
  │
  ├─ Reads products/categories → Supabase Anon Key → RLS allows public SELECT
  │
  └─ Checkout → must be logged in → middleware checks session

Admin Browser (/manager-gora)
  │
  ├─ Next.js Middleware → checks session + queries profiles.role = 'admin'
  │   └─ Not admin? → redirect to /
  │
  ├─ Server Action (admin-products.ts)
  │   ├─ Re-verifies admin role (defence in depth)
  │   ├─ Uploads images to R2 (secret keys never reach browser)
  │   └─ Calls create_product_transaction RPC
  │       └─ RPC re-verifies admin role inside PostgreSQL
  │
  └─ If DB fails → Server Action deletes R2 images (rollback)
```

**Three layers of admin verification:**
1. Next.js Middleware (edge)
2. Server Action (Node.js server)
3. PostgreSQL RPC function (database)

---

## Post-Run Checklist

After running `COMPLETE_SETUP.sql` on a new Supabase project:

**1. Make yourself an admin**
Sign up via the app first (so a profile row is auto-created), then run:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

**2. Update `.env.local`** with the new project credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-new-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
```

**3. Configure Supabase Auth URLs** (see section below).

**4. Set up Cloudflare R2** — create a bucket named `dress-store-images` and fill in the R2 credentials in `.env.local`.

---

## Supabase Auth Configuration

In the Supabase Dashboard → **Authentication** → **URL Configuration**:

| Setting | Value |
|---|---|
| **Site URL** | `http://localhost:3000` (dev) / `https://yourdomain.com` (prod) |
| **Redirect URLs** | `http://localhost:3000/auth/callback` |

**Why:** When a user clicks the email confirmation link or password reset link, Supabase redirects them back to your app via `/auth/callback`. Without this configuration, the link will be rejected as an invalid redirect.

---

## Files in the `database/` folder

| File | Purpose |
|---|---|
| `COMPLETE_SETUP.sql` | **The one file to run on any new Supabase project.** All tables, triggers, RLS, and RPCs in the correct order. |
| `schema.sql` | Original schema (V2) — tables, triggers, RLS, helper functions |
| `rpc_transactions.sql` | The `create_product_transaction` function + check constraints |
| `auth_schema.sql` | Auth extensions — extra `profiles` columns, `pending_phone_otps` table |
| `DATABASE_DOCS.md` | This documentation file |

> **Note:** `schema.sql`, `rpc_transactions.sql`, and `auth_schema.sql` are kept as individual reference files. `COMPLETE_SETUP.sql` is the single consolidated version combining all three in the correct order. **Only run `COMPLETE_SETUP.sql`** on a fresh project — do not run the individual files separately, as that would cause duplicate declarations.
