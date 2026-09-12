"use client";

import Link from "next/link";
import { CheckCircle2, ChevronRight, Package, ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") || "ORD-XXXXXXX";

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </div>
      
      <h1 className="text-3xl font-black uppercase tracking-widest text-black mb-2 text-center">Order Confirmed</h1>
      <p className="text-gray-500 font-medium mb-8 text-center max-w-md">
        Thank you for your purchase. We've received your order and will begin processing it right away.
      </p>

      <div className="bg-white border border-gray-100 shadow-sm p-6 rounded-2xl w-full max-w-sm mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Order Number</span>
          <span className="font-bold text-black">{orderNumber}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Payment Method</span>
          <span className="font-bold text-black">Cash on Delivery</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <Link href="/account/orders" className="flex-1 bg-black text-white px-6 py-3.5 rounded-lg font-bold uppercase tracking-widest text-xs text-center hover:bg-gray-900 transition-colors flex items-center justify-center gap-2">
          View Order <ArrowRight className="w-4 h-4" />
        </Link>
        <Link href="/shop/hoodies" className="flex-1 bg-white border border-gray-200 text-black px-6 py-3.5 rounded-lg font-bold uppercase tracking-widest text-xs text-center hover:bg-gray-50 transition-colors">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center">Loading...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
