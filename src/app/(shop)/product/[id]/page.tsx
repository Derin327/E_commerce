"use client";

import { useState, useEffect } from "react";
import ProductForm from "@/components/shared/ProductForm";
import ProductCard from "@/components/shared/ProductCard";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";

// Centralized mock database for fallback
const mockDatabase = [
  {
    id: "p1",
    name: "Graffiti Wash Drop-Shoulder Shirt",
    basePrice: 990,
    originalPrice: 1599,
    discountBadge: "-27%",
    description: "Make a statement with this Graffiti Wash Drop-Shoulder Shirt. Featuring a relaxed fit and unique acid-wash patterns, it's the ultimate streetwear staple.",
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80"],
    variants: [
      { id: "p1_v1", color: "Black", size: "M", price: 990, stock: 15, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80" },
      { id: "p1_v2", color: "Black", size: "L", price: 990, stock: 10, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80" },
    ],
    category: "Shirts",
  },
  {
    id: "p2",
    name: "Classic Overdyed Checkered Shirt",
    basePrice: 1499,
    originalPrice: 2199,
    discountBadge: "-31%",
    description: "A timeless checkered pattern with a modern overdyed finish. Perfect for layering over tees or wearing buttoned up.",
    images: ["https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&q=80"],
    variants: [
      { id: "p2_v1", color: "Red", size: "L", price: 1499, stock: 5, image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&q=80" },
      { id: "p2_v2", color: "Red", size: "XL", price: 1499, stock: 2, image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&q=80" },
    ],
    category: "Shirts",
  },
  {
    id: "p3",
    name: "The Zephyr Plus-Size Linen Pant",
    basePrice: 989,
    originalPrice: 1319,
    discountBadge: "-25%",
    description: "Upgrade your everyday rotation with the The Zephyr Plus-Size Linen Pant, designed specifically for ultimate comfort and an effortless drape in sizes 38 to 42. Crafted from a premium, highly breathable linen fabric, these trousers offer a lightweight feel that doesn't compromise on structure or durability.",
    images: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80",
      "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=800&q=80",
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80",
      "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80"
    ],
    variants: [
      { id: "v1", color: "Black", size: "38", price: 989, stock: 10, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80" },
      { id: "v2", color: "Black", size: "40", price: 989, stock: 5, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80" },
      { id: "v3", color: "Black", size: "42", price: 1050, stock: 2, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80" }, 
      { id: "v4", color: "Dark-Brown", size: "38", price: 989, stock: 8, image: "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=800&q=80" },
      { id: "v5", color: "Dark-Brown", size: "40", price: 989, stock: 0, image: "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=800&q=80" },
      { id: "v6", color: "Dark-Brown", size: "42", price: 1050, stock: 5, image: "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=800&q=80" },
      { id: "v7", color: "White", size: "38", price: 1100, stock: 12, image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80" },
      { id: "v8", color: "White", size: "40", price: 1100, stock: 7, image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80" },
      { id: "v9", color: "White", size: "42", price: 1150, stock: 3, image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80" },
    ],
    category: "Bottoms",
  }
];

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      const supabase = createClient();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id);
      
      let query = supabase
        .from("products")
        .select(`
          *,
          categories(name),
          product_images(*),
          product_variants(*)
        `);

      if (isUuid) {
        query = query.eq("id", params.id);
      } else {
        query = query.eq("slug", params.id);
      }

      const { data } = await query.single();

      if (data) {
        // Map Supabase DB structure to product format
        const imgs = data.product_images?.map((i: any) => i.url) || ["/placeholder.jpg"];
        const vars = data.product_variants?.map((v: any) => ({
          id: v.id,
          color: v.color,
          size: v.size,
          price: v.price_override || data.base_price,
          stock: v.stock_quantity,
          image: v.image_url || imgs[0],
        })) || [];

        const formatted = {
          id: data.id,
          name: data.name,
          basePrice: data.base_price,
          originalPrice: data.compare_at_price || data.base_price,
          discountBadge: data.discount_badge || "",
          description: data.description,
          images: imgs,
          variants: vars,
          category: data.categories?.name || "Apparel",
        };
        setProduct(formatted);
        setSelectedImage(imgs[0]);
        if (vars.length > 0) {
          setSelectedColor(vars[0].color);
          setSelectedSize(vars[0].size);
        }
      } else {
        // Fallback to mock product
        const fallback = mockDatabase.find((p) => p.id === params.id) || mockDatabase[2];
        setProduct(fallback);
        setSelectedImage(fallback.images[0]);
        if (fallback.variants.length > 0) {
          setSelectedColor(fallback.variants[0].color);
          setSelectedSize(fallback.variants[0].size);
        }
      }
      setLoading(false);
    }

    loadProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!product) return null;

  // Compute available colors and sizes
  const availableColors = Array.from(new Set(product.variants.map((v: any) => v.color)));
  
  const availableSizesForColor = product.variants
    .filter((v: any) => v.color === selectedColor)
    .map((v: any) => v.size);

  const availableSizes = Array.from(new Set(availableSizesForColor));

  const activeVariant = product.variants.find(
    (v: any) => v.color === selectedColor && v.size === selectedSize
  ) || product.variants.find((v: any) => v.color === selectedColor) || product.variants[0];

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    const colorVariant = product.variants.find((v: any) => v.color === color);
    if (colorVariant) {
      if (colorVariant.image) {
        setSelectedImage(colorVariant.image);
      }
      setSelectedSize(colorVariant.size);
    }
  };

  return (
    <main className="min-h-screen bg-white text-black font-sans pb-24">
      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 text-xs text-gray-500 uppercase tracking-widest flex items-center gap-2">
        <a href="/" className="hover:text-black">Home</a>
        <span>/</span>
        <a href={`/shop/${product.category.toLowerCase()}`} className="hover:text-black">{product.category}</a>
        <span>/</span>
        <span className="text-black font-medium line-clamp-1">{product.name}</span>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 items-start">
          
          {/* Left Column: Image Gallery (7 cols) */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4 sticky top-24">
            {/* Thumbnails list */}
            {product.images.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar max-h-[650px] flex-shrink-0">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 h-24 border-2 transition-all flex-shrink-0 bg-gray-50 overflow-hidden ${
                      selectedImage === img ? "border-black scale-95" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image Display */}
            <div className="flex-1 relative aspect-[3/4] bg-gray-50 overflow-hidden group">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {product.discountBadge && (
                <span className="absolute top-4 left-4 bg-black text-white text-xs font-bold px-3 py-1 uppercase tracking-widest">
                  {product.discountBadge}
                </span>
              )}
            </div>
          </div>

          {/* Right Column: Product Info & Form (5 cols) */}
          <div className="lg:col-span-5 flex flex-col">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-wide uppercase text-gray-900 leading-tight mb-2">
              {product.name}
            </h1>
            
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-2xl font-bold text-black">
                Rs.{activeVariant ? activeVariant.price : product.basePrice}
              </span>
              {product.originalPrice > (activeVariant ? activeVariant.price : product.basePrice) && (
                <span className="text-base text-gray-400 line-through">
                  Rs.{product.originalPrice}
                </span>
              )}
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-8">
              {product.description}
            </p>

            <ProductForm 
              product={product} 
              availableColors={availableColors as any[]}
              availableSizes={availableSizes as string[]}
              selectedColor={selectedColor}
              selectedSize={selectedSize}
              onColorSelect={handleColorChange}
              onSizeSelect={setSelectedSize}
              currentVariant={activeVariant}
            />

            {/* Accordion Details */}
            <div className="mt-12 border-t border-gray-100 divide-y divide-gray-100">
              <details className="group py-5" open>
                <summary className="flex justify-between items-center font-bold text-sm uppercase tracking-widest cursor-pointer list-none">
                  Product Details
                  <span className="transition group-open:rotate-180">
                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <div className="text-gray-500 text-sm mt-4 leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </div>
              </details>
              
              <details className="group py-5">
                <summary className="flex justify-between items-center font-bold text-sm uppercase tracking-widest cursor-pointer list-none">
                  Delivery &amp; Returns
                  <span className="transition group-open:rotate-180">
                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <div className="text-gray-500 text-sm mt-4 leading-relaxed">
                  Delivery within 5-7 business days. Easy 7-day returns on unworn items with tags attached.
                </div>
              </details>
            </div>
          </div>
        </div>

        {/* You May Also Like Section */}
        <div className="mt-32">
          <h2 className="text-2xl font-medium tracking-widest uppercase text-center mb-12 text-black">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {mockDatabase.filter(p => p.id !== product.id).slice(0, 4).map(relatedProd => (
              <ProductCard
                key={relatedProd.id}
                id={relatedProd.id}
                name={relatedProd.name}
                imageUrl={relatedProd.images[0]}
                originalPrice={relatedProd.originalPrice}
                discountedPrice={relatedProd.basePrice}
                discountPercentage={Math.round(((relatedProd.originalPrice - relatedProd.basePrice) / relatedProd.originalPrice) * 100)}
                variants={[]}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
