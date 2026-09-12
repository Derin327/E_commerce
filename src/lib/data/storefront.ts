import { createClient } from "@/utils/supabase/client";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server-side helper to create Supabase client in Server Components
export function getSupabaseServerComponent() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try { cookieStore.set(name, value, options); } catch {}
        },
        remove(name: string, options: CookieOptions) {
          try { cookieStore.set(name, "", options); } catch {}
        },
      },
    }
  );
}

// 1. Fetch active categories
export async function getStorefrontCategories() {
  const supabase = getSupabaseServerComponent();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
  return data;
}

// 2. Fetch active storefront CMS components (Hero, Announcement, Promo)
export async function getStorefrontCMS() {
  const supabase = getSupabaseServerComponent();
  const { data, error } = await supabase
    .from("storefront_components")
    .select("*")
    .eq("is_active", true);

  if (error) {
    console.error("Error fetching storefront components:", error);
    return [];
  }

  const cmsMap: Record<string, any> = {};
  data.forEach((comp) => {
    cmsMap[comp.component_type] = comp.config;
  });
  return cmsMap;
}

// 3. Fetch active products for home (Featured / Trending / New Arrivals)
export async function getStorefrontProducts(limit = 8) {
  const supabase = getSupabaseServerComponent();
  const { data, error } = await supabase
    .from("products")
    .select(`
      id, name, slug, base_price, compare_at_price, discount_badge, is_featured,
      categories(name, slug),
      product_images(url, is_primary),
      product_variants(color, size, stock_quantity)
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  // Format to standard shape used by ProductCard
  return data.map((p) => {
    const primaryImg = p.product_images?.find((img) => img.is_primary)?.url || p.product_images?.[0]?.url || "/placeholder.jpg";
    const discountPct = p.compare_at_price
      ? Math.round(((p.compare_at_price - p.base_price) / p.compare_at_price) * 100)
      : 0;

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      originalPrice: p.compare_at_price || p.base_price,
      discountedPrice: p.base_price,
      discountPercentage: discountPct,
      imageUrl: primaryImg,
      badge: p.discount_badge,
      category: (p.categories as any)?.name,
      variants: Array.from(new Set(p.product_variants?.map((v: any) => v.size).filter(Boolean))),
    };
  });
}

// 4. Fetch single product by ID or Slug with images & variants
export async function getStorefrontProductById(idOrSlug: string) {
  const supabase = getSupabaseServerComponent();
  
  // Try by UUID or slug
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  
  let query = supabase
    .from("products")
    .select(`
      *,
      categories(id, name, slug),
      product_images(*),
      product_variants(*)
    `)
    .eq("status", "active");

  if (isUuid) {
    query = query.eq("id", idOrSlug);
  } else {
    query = query.eq("slug", idOrSlug);
  }

  const { data, error } = await query.single();

  if (error || !data) {
    console.error("Error fetching product detail:", error);
    return null;
  }

  return data;
}

// 5. Fetch products by Category slug
export async function getProductsByCategory(categorySlug: string) {
  const supabase = getSupabaseServerComponent();
  
  // First get category ID
  const { data: category } = await supabase
    .from("categories")
    .select("id, name, description, image_url")
    .eq("slug", categorySlug)
    .single();

  if (!category) return { category: null, products: [] };

  const { data: products } = await supabase
    .from("products")
    .select(`
      id, name, slug, base_price, compare_at_price, discount_badge,
      product_images(url, is_primary),
      product_variants(color, size)
    `)
    .eq("category_id", category.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const formattedProducts = (products || []).map((p) => {
    const primaryImg = p.product_images?.find((img) => img.is_primary)?.url || p.product_images?.[0]?.url || "/placeholder.jpg";
    const discountPct = p.compare_at_price
      ? Math.round(((p.compare_at_price - p.base_price) / p.compare_at_price) * 100)
      : 0;

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      originalPrice: p.compare_at_price || p.base_price,
      discountedPrice: p.base_price,
      discountPercentage: discountPct,
      imageUrl: primaryImg,
      badge: p.discount_badge,
      variants: Array.from(new Set(p.product_variants?.map((v) => v.size).filter(Boolean))),
    };
  });

  return { category, products: formattedProducts };
}
