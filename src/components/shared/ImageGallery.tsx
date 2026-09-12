"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

export default function ImageGallery({ images }: { images: string[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!images || images.length === 0) return null;

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Thumbnails */}
      <div className="order-2 md:order-1 flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedIndex(idx)}
            className={`relative flex-shrink-0 w-16 h-24 sm:w-20 sm:h-28 overflow-hidden bg-gray-50 border ${
              idx === selectedIndex ? "border-black" : "border-transparent hover:border-gray-300"
            } transition-colors`}
          >
            <Image src={img} alt={`Thumbnail ${idx}`} fill unoptimized className="object-cover" />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="order-1 md:order-2 flex-1 relative bg-gray-50">
        <div 
          className={`relative w-full aspect-[3/4] overflow-hidden ${isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`}
          onClick={() => setIsZoomed(!isZoomed)}
        >
          <Image
            src={images[selectedIndex]}
            alt="Product Image"
            fill
            unoptimized
            className={`object-cover transition-transform duration-300 ${isZoomed ? "scale-150" : "scale-100"}`}
            style={isZoomed ? { transformOrigin: "center center" } : {}}
          />
          {!isZoomed && (
            <div className="absolute bottom-4 right-4 bg-white/80 p-2 shadow-sm pointer-events-none">
              <ZoomIn className="w-5 h-5 text-black" />
            </div>
          )}
        </div>
        
        {/* Mobile Navigation Arrows */}
        {images.length > 1 && (
          <div className="md:hidden absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 pointer-events-none">
            <button 
              className="pointer-events-auto p-2 bg-white/80 shadow-sm rounded-full"
              onClick={(e) => { e.stopPropagation(); setSelectedIndex(prev => (prev - 1 + images.length) % images.length); }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              className="pointer-events-auto p-2 bg-white/80 shadow-sm rounded-full"
              onClick={(e) => { e.stopPropagation(); setSelectedIndex(prev => (prev + 1) % images.length); }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
