-- Run this in your Supabase SQL Editor
-- This script adds the requested production constraints and a highly secure RPC.

-- 1. Table-Level Validation Constraints
ALTER TABLE products 
  DROP CONSTRAINT IF EXISTS price_check,
  ADD CONSTRAINT price_check CHECK (base_price >= 0),
  DROP CONSTRAINT IF EXISTS compare_price_check,
  ADD CONSTRAINT compare_price_check CHECK (compare_at_price IS NULL OR compare_at_price >= 0);

ALTER TABLE product_variants 
  DROP CONSTRAINT IF EXISTS stock_check,
  ADD CONSTRAINT stock_check CHECK (stock_quantity >= 0),
  DROP CONSTRAINT IF EXISTS variant_price_check,
  ADD CONSTRAINT variant_price_check CHECK (price_override IS NULL OR price_override >= 0);

-- 2. Ensure only one primary image per product
DROP INDEX IF EXISTS idx_one_primary_image;
CREATE UNIQUE INDEX idx_one_primary_image ON product_images (product_id) WHERE is_primary = true;

-- 3. Secure Transactional RPC
CREATE OR REPLACE FUNCTION create_product_transaction(
  p_name VARCHAR,
  p_slug VARCHAR,
  p_description TEXT,
  p_category_id UUID,
  p_base_price DECIMAL,
  p_compare_at_price DECIMAL,
  p_status VARCHAR,
  p_discount_badge VARCHAR,
  p_variants JSONB, 
  p_images JSONB    
) RETURNS UUID AS $$
DECLARE
  v_product_id UUID;
  v_variant JSONB;
  v_image JSONB;
BEGIN
  -- SECURITY: Verify the caller is an admin natively in the database
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can execute this transaction.';
  END IF;

  -- VALIDATION: Check for required fields
  IF p_name IS NULL OR trim(p_name) = '' THEN
    RAISE EXCEPTION 'Product name is required.';
  END IF;
  
  IF p_slug IS NULL OR trim(p_slug) = '' THEN
    RAISE EXCEPTION 'Product slug is required.';
  END IF;

  -- 1. Insert the Product (Will throw error if slug is not unique due to UNIQUE constraint)
  INSERT INTO products (
    name, slug, description, category_id, base_price, compare_at_price, status, discount_badge
  ) VALUES (
    p_name, p_slug, p_description, p_category_id, p_base_price, p_compare_at_price, p_status::product_status, p_discount_badge
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
      product_id, storage_key, url, alt_text, width, height, aspect_ratio, is_primary, display_order
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
    -- Any failure (like duplicate SKU, duplicate slug, negative price) triggers automatic rollback
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE ALL ON FUNCTION create_product_transaction FROM public;
GRANT EXECUTE ON FUNCTION create_product_transaction TO authenticated;
