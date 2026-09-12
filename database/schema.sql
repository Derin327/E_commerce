-- GORA Store - Production Database Schema (V2 - Strict Admin Roles & Cloudflare R2 Metadata)
-- Run this in your Supabase SQL Editor

-- 1. Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles (For Admin Role Authorization)
CREATE TYPE user_role AS ENUM ('customer', 'admin');

CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'customer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new auth users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Categories Table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Products Table
CREATE TYPE product_status AS ENUM ('draft', 'active', 'archived');

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    compare_at_price DECIMAL(10, 2),
    status product_status DEFAULT 'draft',
    discount_badge VARCHAR(50), 
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Indexes for frequent queries
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_category ON products(category_id);

-- 5. Product Images Table (Cloudflare R2 Meta)
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    storage_key TEXT NOT NULL UNIQUE, -- e.g. products/uuid/original/image.webp
    url TEXT NOT NULL,                -- Cloudflare delivery URL
    alt_text VARCHAR(255),
    width INTEGER,
    height INTEGER,
    aspect_ratio VARCHAR(20),
    is_primary BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
CREATE INDEX idx_product_images_product_id ON product_images(product_id);

-- 6. Product Variants Table
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(255) UNIQUE,
    color VARCHAR(100) NOT NULL,
    size VARCHAR(50) NOT NULL,
    price_override DECIMAL(10, 2), 
    stock_quantity INTEGER DEFAULT 0 NOT NULL,
    image_url TEXT, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(product_id, color, size) -- Prevent duplicates
);
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);

-- 7. Storefront Components Table (CMS)
CREATE TABLE storefront_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    component_type VARCHAR(100) UNIQUE NOT NULL, 
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    config JSONB NOT NULL DEFAULT '{}'::jsonb, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ==========================================
-- Triggers for updated_at timestamps
-- ==========================================
CREATE OR REPLACE FUNCTION update_modified_column()   
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;   
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_categories_modtime BEFORE UPDATE ON categories FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_products_modtime BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_product_variants_modtime BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_storefront_components_modtime BEFORE UPDATE ON storefront_components FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- ==========================================
-- Row Level Security (RLS) & Auth Policies
-- ==========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE storefront_components ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can read all profiles" ON profiles FOR SELECT USING (public.is_admin());

-- Public READ access
CREATE POLICY "Public read active categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active products" ON products FOR SELECT USING (status = 'active');
CREATE POLICY "Public read active product images" ON product_images FOR SELECT USING (EXISTS (SELECT 1 FROM products WHERE products.id = product_images.product_id AND products.status = 'active'));
CREATE POLICY "Public read active product variants" ON product_variants FOR SELECT USING (EXISTS (SELECT 1 FROM products WHERE products.id = product_variants.product_id AND products.status = 'active'));
CREATE POLICY "Public read active storefront components" ON storefront_components FOR SELECT USING (is_active = true);

-- Admin FULL access
CREATE POLICY "Admin full access categories" ON categories FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access products" ON products FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access product images" ON product_images FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access product variants" ON product_variants FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access storefront components" ON storefront_components FOR ALL USING (public.is_admin());
