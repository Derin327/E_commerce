import { LogOut, User, MapPin, Package, Eye } from "lucide-react";
import Link from "next/link";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function OrdersPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch real orders
  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <h1 className="text-3xl font-black uppercase tracking-widest text-black mb-8 text-center md:text-left">
          Order History
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-2">
            <Link href="/account" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-white hover:text-black hover:border-l-2 hover:border-gray-200 transition-colors text-sm font-semibold uppercase tracking-wider">
              <User className="w-4 h-4" /> Profile
            </Link>
            <Link href="/orders" className="flex items-center gap-3 px-4 py-3 bg-white border-l-2 border-black text-black font-bold text-sm uppercase tracking-wider shadow-sm">
              <Package className="w-4 h-4" /> Orders
            </Link>
          </div>

          {/* Content Area */}
          <div className="md:col-span-3 space-y-6">
            {!orders || orders.length === 0 ? (
              <div className="bg-white p-12 text-center border border-gray-100 rounded-xl">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-black mb-2">No orders found</h3>
                <p className="text-sm text-gray-500 mb-6 font-medium">You haven't placed any orders yet.</p>
                <Link href="/shop/hoodies" className="bg-black text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-[#e32c2b] transition-colors">
                  Start Shopping
                </Link>
              </div>
            ) : (
              orders.map((order: any) => (
                <div key={order.id} className="bg-white p-6 shadow-sm border border-gray-100 rounded-xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-4 mb-4 gap-4">
                    <div className="flex flex-wrap gap-x-8 gap-y-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Order Placed</p>
                        <p className="text-sm font-semibold">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Amount</p>
                        <p className="text-sm font-semibold">Rs.{order.total_amount}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Order Number</p>
                        <p className="text-sm font-semibold">{order.order_number}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                      <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md ${
                        order.fulfillment_status === 'delivered' ? 'bg-green-100 text-green-800' : 
                        order.fulfillment_status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.fulfillment_status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {order.fulfillment_status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="w-16 h-20 bg-gray-100 border border-gray-100 rounded flex-shrink-0">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover rounded" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-bold leading-tight line-clamp-1">{item.product_name}</h3>
                          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
                            {item.color} | {item.size}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Qty: {item.quantity}</p>
                            <p className="text-sm font-bold text-gray-900">Rs.{item.total_price}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
