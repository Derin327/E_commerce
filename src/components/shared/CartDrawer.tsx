"use client";

import { useCartStore } from "@/lib/store";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function CartDrawer() {
  const { isOpen, setIsOpen, items, updateQuantity, removeItem } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsOpen(false);
    if (user) {
      router.push("/checkout");
    } else {
      router.push("/login?callbackUrl=/checkout");
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold tracking-widest uppercase">Cart ({items.length})</h2>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <ShoppingBag className="w-12 h-12 text-gray-200" />
              <p className="text-gray-500 font-medium">Your cart is empty</p>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-black border-b border-black pb-0.5 font-medium uppercase tracking-widest text-sm mt-4 hover:text-gray-600 hover:border-gray-600 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-24 bg-gray-100 flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-semibold text-sm leading-tight line-clamp-2">{item.name}</h3>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-black p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
                      {item.color} <span className="mx-1">|</span> {item.size}
                    </p>
                    
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center border border-gray-200">
                        <button 
                          onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                          className="px-2 py-1 text-gray-500 hover:text-black"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 text-gray-500 hover:text-black"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-bold text-sm">Rs.{item.price * item.quantity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-100 p-6 bg-gray-50">
            <div className="flex justify-between items-center mb-6 uppercase tracking-widest text-sm">
              <span className="font-bold">Subtotal</span>
              <span className="font-bold text-lg">Rs.{total}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="block w-full bg-black text-white text-center py-4 font-bold uppercase tracking-widest text-sm hover:bg-[#e32c2b] transition-colors"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
