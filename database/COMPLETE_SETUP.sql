-- ================================================================
-- GORA STORE — COMPLETE SUPABASE SQL SETUP
-- Copy this entire file and paste it into your Supabase SQL Editor,
-- then click "Run". Run it only ONCE on a fresh project.
-- ================================================================


-- ────────────────────────────────────────────────────────────────
-- SECTION 1: EXTENSIONS
-- ────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ────────────────────────────────────────────────────────────────
-- SECTION 2: CUSTOM TYPES (ENUMs)
-- ────────────────────────────────────────────────────────────────

CREATE TYPE user_role     AS ENUM ('customer', 'admin');
CREATE TYPE product_status AS ENUM ('draft', 'active', 'archived');


-- ────────────────────────────────────────────────────────────────
-- SECTION 3: PROFILES TABLE
-- Linked 1-to-1 with Supabase Auth users.
-- Stores role (admin/customer) and customer shipping details.
-- ────────────────────────────────────────────────────────────────

CREATE TABLE profiles (
  id             UUID          REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email          VARCHAR(255)  NOT NULL,
  role           user_role     DEFAULT 'customer',
  username       VARCHAR(50)   UNIQUE,
  phone          VARCHAR(20)   UNIQUE,
  address        TEXT,
  city           VARCHAR(100),
  pincode        VARCHAR(10),
  phone_verified BOOLEAN       DEFAULT false,
  email_verified BOOLEAN       DEFAULT false,
  created_at     TIMESTAMPTZ   DEFAULT timezone('utc', now()),
  updated_at     TIMESTAMPTZ   DEFAULT timezone('utc', now())
);

-- Fast lookups at login
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_phone    ON profiles(phone);

-- Auto-create a profile row whenever a user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'customer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ────────────────────────────────────────────────────────────────
-- SECTION 4: CATEGORIES TABLE
-- ────────────────────────────────────────────────────────────────

CREATE TABLE categories (
  id          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(255)  NOT NULL,
  slug        VARCHAR(255)  UNIQUE NOT NULL,
  description TEXT,
  image_url   TEXT,
  is_active   BOOLEAN       DEFAULT true,
  created_at  TIMESTAMPTZ   DEFAULT timezone('utc', now()),
  updated_at  TIMESTAMPTZ   DEFAULT timezone('utc', now())
);


-- ────────────────────────────────────────────────────────────────
-- SECTION 5: PRODUCTS TABLE
-- ────────────────────────────────────────────────────────────────

CREATE TABLE products (
  id               UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id      UUID           REFERENCES categories(id) ON DELETE RESTRICT,
  name             VARCHAR(255)   NOT NULL,
  slug             VARCHAR(255)   UNIQUE NOT NULL,
  description      TEXT,
  base_price       DECIMAL(10,2)  NOT NULL,
  compare_at_price DECIMAL(10,2),
  status           product_status DEFAULT 'draft',
  discount_badge   VARCHAR(50),
  is_featured      BOOLEAN        DEFAULT false,
  created_at       TIMESTAMPTZ    DEFAULT timezone('utc', now()),
  updated_at       TIMESTAMPTZ    DEFAULT timezone('utc', now()),

  -- Constraints
  CONSTRAINT price_check        CHECK (base_price >= 0),
  CONSTRAINT compare_price_check CHECK (compare_at_price IS NULL OR compare_at_price >= 0)
);

-- Indexes for frequent queries
CREATE INDEX idx_products_slug     ON products(slug);
CREATE INDEX idx_products_status   ON products(status);
CREATE INDEX idx_products_category ON products(category_id);


-- ────────────────────────────────────────────────────────────────
-- SECTION 6: PRODUCT IMAGES TABLE
-- Stores Cloudflare R2 object keys and delivery metadata.
-- The storage_key is the canonical reference; url is the CDN URL.
-- ────────────────────────────────────────────────────────────────

CREATE TABLE product_images (
  id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id    UUID         REFERENCES products(id) ON DELETE CASCADE,
  storage_key   TEXT         NOT NULL UNIQUE,  -- e.g. products/{uuid}/original/image.webp
  url           TEXT         NOT NULL,          -- Cloudflare delivery URL
  alt_text      VARCHAR(255),
  width         INTEGER,
  height        INTEGER,
  aspect_ratio  VARCHAR(20),
  is_primary    BOOLEAN      DEFAULT false,
  display_order INTEGER      DEFAULT 0,
  created_at    TIMESTAMPTZ  DEFAULT timezone('utc', now())
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);

-- Enforce only ONE primary image per product at the database level
CREATE UNIQUE INDEX idx_one_primary_image
  ON product_images (product_id)
  WHERE is_primary = true;


-- ────────────────────────────────────────────────────────────────
-- SECTION 7: PRODUCT VARIANTS TABLE
-- Each row = one unique Color + Size combination.
-- Duplicate color/size for the same product is rejected by UNIQUE.
-- ────────────────────────────────────────────────────────────────

CREATE TABLE product_variants (
  id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id      UUID          REFERENCES products(id) ON DELETE CASCADE,
  sku             VARCHAR(255)  UNIQUE,
  color           VARCHAR(100)  NOT NULL,
  size            VARCHAR(50)   NOT NULL,
  price_override  DECIMAL(10,2),
  stock_quantity  INTEGER       NOT NULL DEFAULT 0,
  image_url       TEXT,
  created_at      TIMESTAMPTZ   DEFAULT timezone('utc', now()),
  updated_at      TIMESTAMPTZ   DEFAULT timezone('utc', now()),

  -- Constraints
  UNIQUE(product_id, color, size),  -- No duplicate color+size per product
  CONSTRAINT stock_check        CHECK (stock_quantity >= 0),
  CONSTRAINT variant_price_check CHECK (price_override IS NULL OR price_override >= 0)
);

CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);


-- ────────────────────────────────────────────────────────────────
-- SECTION 8: STOREFRONT COMPONENTS TABLE (CMS)
-- Admin edits homepage sections (hero, promo, testimonials, etc.)
-- without touching source code.
-- ────────────────────────────────────────────────────────────────

CREATE TABLE storefront_components (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_type  VARCHAR(100) UNIQUE NOT NULL, -- e.g. 'hero_banner', 'promo_block'
  is_active       BOOLEAN      DEFAULT true,
  display_order   INTEGER      DEFAULT 0,
  config          JSONB        NOT NULL DEFAULT '{}'::jsonb,
  updated_at      TIMESTAMPTZ  DEFAULT timezone('utc', now())
);


-- ────────────────────────────────────────────────────────────────
-- SECTION 9: PENDING PHONE OTPs TABLE
-- Stores hashed (SHA-256) WhatsApp OTPs during registration.
-- Never stores plaintext OTPs. Fully blocked from public access.
-- ────────────────────────────────────────────────────────────────

CREATE TABLE pending_phone_otps (
  id         UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone      VARCHAR(20)  NOT NULL,
  otp_hash   TEXT         NOT NULL,
  expires_at TIMESTAMPTZ  NOT NULL,
  attempts   INTEGER      DEFAULT 0,
  created_at TIMESTAMPTZ  DEFAULT timezone('utc', now())
);

CREATE INDEX idx_pending_otps_phone   ON pending_phone_otps(phone);
CREATE INDEX idx_pending_otps_expires ON pending_phone_otps(expires_at);


-- ────────────────────────────────────────────────────────────────
-- SECTION 10: UPDATED_AT AUTO-TIMESTAMP TRIGGERS
-- ────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_modtime
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_categories_modtime
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_products_modtime
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_product_variants_modtime
  BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_storefront_components_modtime
  BEFORE UPDATE ON storefront_components
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();


-- ────────────────────────────────────────────────────────────────
-- SECTION 11: ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────────────────────────

ALTER TABLE profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories            ENABLE ROW LEVEL SECURITY;
ALTER TABLE products              ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images        ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants      ENABLE ROW LEVEL SECURITY;
ALTER TABLE storefront_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_phone_otps    ENABLE ROW LEVEL SECURITY;


-- ────────────────────────────────────────────────────────────────
-- SECTION 12: HELPER FUNCTIONS FOR RLS POLICIES
-- ────────────────────────────────────────────────────────────────

-- Checks whether the currently logged-in user has role = 'admin'
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ────────────────────────────────────────────────────────────────
-- SECTION 13: RLS POLICIES
-- ────────────────────────────────────────────────────────────────

-- profiles
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT USING (public.is_admin());

-- categories (public read of active; admin full CRUD)
CREATE POLICY "Public read active categories"
  ON categories FOR SELECT USING (is_active = true);

CREATE POLICY "Admin full access categories"
  ON categories FOR ALL USING (public.is_admin());

-- products (public read of active; admin full CRUD)
CREATE POLICY "Public read active products"
  ON products FOR SELECT USING (status = 'active');

CREATE POLICY "Admin full access products"
  ON products FOR ALL USING (public.is_admin());

-- product_images (public read only for active products; admin full CRUD)
CREATE POLICY "Public read active product images"
  ON product_images FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_images.product_id
        AND products.status = 'active'
    )
  );

CREATE POLICY "Admin full access product images"
  ON product_images FOR ALL USING (public.is_admin());

-- product_variants (same logic)
CREATE POLICY "Public read active product variants"
  ON product_variants FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_variants.product_id
        AND products.status = 'active'
    )
  );

CREATE POLICY "Admin full access product variants"
  ON product_variants FOR ALL USING (public.is_admin());

-- storefront_components (public read of active; admin full CRUD)
CREATE POLICY "Public read active storefront components"
  ON storefront_components FOR SELECT USING (is_active = true);

CREATE POLICY "Admin full access storefront components"
  ON storefront_components FOR ALL USING (public.is_admin());

-- pending_phone_otps (NO public access — service role only)
CREATE POLICY "No public access to pending_phone_otps"
  ON pending_phone_otps FOR ALL USING (false);


-- ────────────────────────────────────────────────────────────────
-- SECTION 14: TRANSACTIONAL RPC — create_product_transaction
-- Called from Next.js Server Action.
-- Creates product + variants + images atomically.
-- Rolls back everything if any step fails.
-- Internally verifies admin role — cannot be called by customers.
-- ────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION create_product_transaction(
  p_name            VARCHAR,
  p_slug            VARCHAR,
  p_description     TEXT,
  p_category_id     UUID,
  p_base_price      DECIMAL,
  p_compare_at_price DECIMAL,
  p_status          VARCHAR,
  p_discount_badge  VARCHAR,
  p_variants        JSONB,
  p_images          JSONB
) RETURNS UUID AS $$
DECLARE
  v_product_id UUID;
  v_variant    JSONB;
  v_image      JSONB;
BEGIN
  -- SECURITY: verify caller is admin at the database level
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can execute this transaction.';
  END IF;

  -- VALIDATION
  IF p_name IS NULL OR trim(p_name) = '' THEN
    RAISE EXCEPTION 'Product name is required.';
  END IF;

  IF p_slug IS NULL OR trim(p_slug) = '' THEN
    RAISE EXCEPTION 'Product slug is required.';
  END IF;

  -- 1. Insert Product
  INSERT INTO products (
    name, slug, description, category_id,
    base_price, compare_at_price, status, discount_badge
  ) VALUES (
    p_name, p_slug, p_description, p_category_id,
    p_base_price, p_compare_at_price, p_status::product_status, p_discount_badge
  ) RETURNING id INTO v_product_id;

  -- 2. Insert Variants
  FOR v_variant IN SELECT * FROM jsonb_array_elements(p_variants)
  LOOP
    INSERT INTO product_variants (
      product_id, sku, color, size, price_override, stock_quantity, image_url
    ) VALUES (
      v_product_id,
      v_variant->>'sku',
      v_variant->>'color',
      v_variant->>'size',
      (v_variant->>'price_override')::DECIMAL,
      (v_variant->>'stock_quantity')::INTEGER,
      v_variant->>'image_url'
    );
  END LOOP;

  -- 3. Insert Images
  FOR v_image IN SELECT * FROM jsonb_array_elements(p_images)
  LOOP
    INSERT INTO product_images (
      product_id, storage_key, url, alt_text,
      width, height, aspect_ratio, is_primary, display_order
    ) VALUES (
      v_product_id,
      v_image->>'storage_key',
      v_image->>'url',
      v_image->>'alt_text',
      (v_image->>'width')::INTEGER,
      (v_image->>'height')::INTEGER,
      v_image->>'aspect_ratio',
      (v_image->>'is_primary')::BOOLEAN,
      (v_image->>'display_order')::INTEGER
    );
  END LOOP;

  RETURN v_product_id;

EXCEPTION
  WHEN OTHERS THEN
    -- Automatic full rollback of all inserts above
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Only authenticated users can call this RPC (admin check is inside the function)
REVOKE ALL ON FUNCTION create_product_transaction FROM public;
GRANT EXECUTE ON FUNCTION create_product_transaction TO authenticated;


-- ════════════════════════════════════════════════════════════════
-- SECTION 15: POSTGRESQL TABLE GRANTS & DEFAULT PRIVILEGES
-- Ensures Supabase roles (authenticated, anon, service_role) have
-- PostgreSQL permission to execute queries before RLS evaluation.
-- ════════════════════════════════════════════════════════════════

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;


-- ════════════════════════════════════════════════════════════════
-- SECTION 16: ORDERS & ORDER ITEMS TABLES
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS orders (
  id                 UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID           REFERENCES auth.users(id) ON DELETE SET NULL,
  order_number       VARCHAR(50)    UNIQUE NOT NULL,
  customer_name      VARCHAR(255)   NOT NULL,
  customer_email     VARCHAR(255)   NOT NULL,
  customer_phone     VARCHAR(20)    NOT NULL,
  shipping_address   JSONB          NOT NULL, -- address, city, pincode
  subtotal           DECIMAL(10,2)  NOT NULL,
  shipping_fee       DECIMAL(10,2)  DEFAULT 0,
  discount           DECIMAL(10,2)  DEFAULT 0,
  total_amount       DECIMAL(10,2)  NOT NULL,
  payment_method     VARCHAR(50)    DEFAULT 'cod', -- 'cod', 'razorpay'
  payment_status     VARCHAR(50)    DEFAULT 'pending', -- 'pending', 'paid', 'failed'
  fulfillment_status VARCHAR(50)    DEFAULT 'processing', -- 'processing', 'shipped', 'delivered', 'cancelled'
  created_at         TIMESTAMPTZ    DEFAULT timezone('utc', now()),
  updated_at         TIMESTAMPTZ    DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

CREATE TABLE IF NOT EXISTS order_items (
  id           UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id     UUID           REFERENCES orders(id) ON DELETE CASCADE,
  product_id   UUID           REFERENCES products(id) ON DELETE SET NULL,
  variant_id   UUID           REFERENCES product_variants(id) ON DELETE SET NULL,
  product_name VARCHAR(255)   NOT NULL,
  color        VARCHAR(100),
  size         VARCHAR(50),
  unit_price   DECIMAL(10,2)  NOT NULL,
  quantity     INTEGER        NOT NULL,
  total_price  DECIMAL(10,2)  NOT NULL,
  image_url    TEXT
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Customers can view their own orders
CREATE POLICY "Customers view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Customers view own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- Admin full access
CREATE POLICY "Admin full access orders" ON orders FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access order items" ON order_items FOR ALL USING (public.is_admin());

-- Grants
GRANT ALL ON orders TO service_role;
GRANT ALL ON order_items TO service_role;
GRANT SELECT, INSERT, UPDATE ON orders TO authenticated;
GRANT SELECT, INSERT ON order_items TO authenticated;


-- ════════════════════════════════════════════════════════════════
-- SETUP COMPLETE
-- After running this script:
--   1. Go to Supabase Dashboard → Authentication → URL Configuration
--      and add your site URL + redirect URL: http://localhost:3000/auth/callback
--   2. To make yourself an admin, run:
--      UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
-- ════════════════════════════════════════════════════════════════
