"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FilterDrawer({ isOpen, onClose }: FilterDrawerProps) {
  const router = useRouter();

  // Mock filter options
  const categories = ["Shirts", "Bottoms", "Hoodies", "Accessories"];
  const colors = ["Black", "White", "Blue", "Dark-Brown", "Purple"];
  const sizes = ["S", "M", "L", "XL", "XXL", "38", "40", "42"];
  const priceRanges = ["Under Rs.500", "Rs.500 - Rs.1000", "Rs.1000 - Rs.2000", "Over Rs.2000"];

  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const handleApply = () => {
    // In a real app, we'd build a complex URL query string here
    // For now, we'll just push to search with a dummy parameter to trigger the page
    const queryParams = new URLSearchParams();
    if (selectedCats.length > 0) queryParams.set('cat', selectedCats.join(','));
    if (selectedColors.length > 0) queryParams.set('color', selectedColors.join(','));
    if (selectedSizes.length > 0) queryParams.set('size', selectedSizes.join(','));
    
    router.push(`/search?${queryParams.toString()}`);
    onClose();
  };

  const toggleArrayItem = (array: string[], setArray: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    if (array.includes(item)) {
      setArray(array.filter(i => i !== item));
    } else {
      setArray([...array, item]);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold tracking-widest uppercase">Filter Products</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Category Filter */}
          <div>
            <h3 className="font-bold uppercase tracking-widest text-sm mb-4">Categories</h3>
            <div className="space-y-3">
              {categories.map(cat => (
                <label key={cat} className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedCats.includes(cat)}
                    onChange={() => toggleArrayItem(selectedCats, setSelectedCats, cat)}
                    className="w-4 h-4 accent-black" 
                  />
                  <span className="text-sm font-medium text-gray-700">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div>
            <h3 className="font-bold uppercase tracking-widest text-sm mb-4">Colors</h3>
            <div className="space-y-3">
              {colors.map(color => (
                <label key={color} className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedColors.includes(color)}
                    onChange={() => toggleArrayItem(selectedColors, setSelectedColors, color)}
                    className="w-4 h-4 accent-black" 
                  />
                  <span className="text-sm font-medium text-gray-700">{color}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Size Filter */}
          <div>
            <h3 className="font-bold uppercase tracking-widest text-sm mb-4">Sizes</h3>
            <div className="grid grid-cols-4 gap-2">
              {sizes.map(size => (
                <button 
                  key={size}
                  onClick={() => toggleArrayItem(selectedSizes, setSelectedSizes, size)}
                  className={`py-2 text-xs font-bold border transition-colors ${
                    selectedSizes.includes(size) ? "border-black bg-black text-white" : "border-gray-200 text-gray-600 hover:border-black"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="font-bold uppercase tracking-widest text-sm mb-4">Price Range</h3>
            <div className="space-y-3">
              {priceRanges.map(price => (
                <label key={price} className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="priceRange" className="w-4 h-4 accent-black" />
                  <span className="text-sm font-medium text-gray-700">{price}</span>
                </label>
              ))}
            </div>
          </div>

        </div>

        <div className="border-t border-gray-100 p-6 bg-gray-50 flex gap-4">
          <button 
            onClick={() => {
              setSelectedCats([]);
              setSelectedColors([]);
              setSelectedSizes([]);
            }}
            className="flex-1 bg-white border border-black text-black text-center py-4 font-bold uppercase tracking-widest text-sm hover:bg-gray-50 transition-colors"
          >
            Clear All
          </button>
          <button 
            onClick={handleApply}
            className="flex-1 bg-black text-white text-center py-4 font-bold uppercase tracking-widest text-sm hover:bg-[#e32c2b] transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
}
