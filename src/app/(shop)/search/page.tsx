import ProductCard from "@/components/shared/ProductCard";

export default function SearchPage({ searchParams }: { searchParams: { q?: string; cat?: string; color?: string; size?: string } }) {
  const query = searchParams.q || "";

  // Mock global database of all products.
  // When we build the backend, this will be a search query sent to Supabase
  // like: supabase.from('products').select('*').ilike('name', `%${query}%`)
  const allProducts = [
    {
      id: "p1",
      name: "Graffiti Wash Drop-Shoulder Shirt",
      category: "shirts",
      originalPrice: 1599,
      discountedPrice: 990,
      discountPercentage: 27,
      imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
      variants: [],
    },
    {
      id: "p2",
      name: "Classic Overdyed Checkered Shirt",
      category: "shirts",
      originalPrice: 2199,
      discountedPrice: 1499,
      discountPercentage: 31,
      imageUrl: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&q=80",
      variants: [],
    },
    {
      id: "p3",
      name: "The Zephyr Plus-Size Linen Pant",
      category: "bottoms",
      originalPrice: 1319,
      discountedPrice: 989,
      discountPercentage: 25,
      imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80",
      variants: [],
    },
    {
      id: "p4",
      name: "Vintage Momfit Jean",
      category: "bottoms",
      originalPrice: 1399,
      discountedPrice: 799,
      discountPercentage: 43,
      imageUrl: "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=600&q=80",
      variants: [],
    },
    {
      id: "p5",
      name: "Italian Polo Fit Pants",
      category: "bottoms",
      originalPrice: 666,
      discountedPrice: 499,
      discountPercentage: 25,
      imageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80",
      variants: [],
    },
    {
      id: "p6",
      name: "Classic Heavyweight Hoodie",
      category: "hoodies",
      originalPrice: 1999,
      discountedPrice: 1299,
      discountPercentage: 35,
      imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80",
      variants: [],
    },
    {
      id: "p7",
      name: "Silver Cuban Chain",
      category: "accessories",
      originalPrice: 999,
      discountedPrice: 599,
      discountPercentage: 40,
      imageUrl: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&q=80",
      variants: [],
    }
  ];

  // Filter products by searching the name or category
  const lowerQuery = query.toLowerCase();
  const searchResults = query ? allProducts.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) || 
    p.category.toLowerCase().includes(lowerQuery)
  ) : [];

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 md:py-20">
        <h1 className="text-3xl font-medium tracking-wide text-black mb-2 text-center">
          Search Results
        </h1>
        {query ? (
          <p className="text-center text-gray-500 mb-12 uppercase tracking-widest text-sm">
            Showing {searchResults.length} results for "{query}"
          </p>
        ) : (
          <p className="text-center text-gray-500 mb-12 uppercase tracking-widest text-sm">
            Please enter a search term
          </p>
        )}

        {searchResults.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {searchResults.map(prod => (
              <ProductCard key={prod.id} {...prod} />
            ))}
          </div>
        ) : (
          (query || searchParams.cat || searchParams.color || searchParams.size) && (
            <div className="text-center py-24 bg-gray-50 border border-dashed border-gray-200 mt-8 rounded-lg">
              <h2 className="text-xl font-bold text-gray-900 uppercase tracking-widest mb-4">
                No exact matches found.
              </h2>
              {/* This is a frontend placeholder showing how the backend will handle missing filters */}
              <p className="text-gray-500 font-medium">
                We couldn't find exactly what you're looking for with these specific filters.
              </p>
              {searchParams.cat && searchParams.color && (
                <p className="mt-4 text-[#e32c2b] font-bold">
                  Suggestion: We have 12 {searchParams.cat} available in other colors! Try removing the "{searchParams.color}" filter.
                </p>
              )}
            </div>
          )
        )}
      </div>
    </main>
  );
}
