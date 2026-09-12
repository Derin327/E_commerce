import { LogOut, User, MapPin, Package } from "lucide-react";
import Link from "next/link";

export default function AccountPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <h1 className="text-3xl font-bold uppercase tracking-widest text-black mb-8 text-center md:text-left">
          My Account
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-2">
            <Link href="/account" className="flex items-center gap-3 px-4 py-3 bg-white border-l-2 border-black text-black font-semibold text-sm uppercase tracking-wider shadow-sm">
              <User className="w-4 h-4" /> Profile
            </Link>
            <Link href="/orders" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-white hover:text-black hover:border-l-2 hover:border-gray-200 transition-colors text-sm uppercase tracking-wider">
              <Package className="w-4 h-4" /> Orders
            </Link>
            <Link href="/account/addresses" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-white hover:text-black hover:border-l-2 hover:border-gray-200 transition-colors text-sm uppercase tracking-wider">
              <MapPin className="w-4 h-4" /> Addresses
            </Link>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-white hover:border-l-2 hover:border-red-100 transition-colors text-sm uppercase tracking-wider text-left">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>

          {/* Content Area */}
          <div className="md:col-span-3 bg-white p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold tracking-wide uppercase border-b border-gray-100 pb-4 mb-6">
              Profile Information
            </h2>
            
            <form className="space-y-6 max-w-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">First Name</label>
                  <input type="text" defaultValue="John" className="w-full border border-gray-200 p-3 text-sm focus:outline-none focus:border-black" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Last Name</label>
                  <input type="text" defaultValue="Doe" className="w-full border border-gray-200 p-3 text-sm focus:outline-none focus:border-black" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Email</label>
                <input type="email" defaultValue="john.doe@example.com" disabled className="w-full border border-gray-100 bg-gray-50 text-gray-400 p-3 text-sm cursor-not-allowed" />
                <p className="text-xs text-gray-400 mt-1">To change your email, please contact support.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Phone Number</label>
                <input type="tel" placeholder="+91 0000000000" className="w-full border border-gray-200 p-3 text-sm focus:outline-none focus:border-black" />
              </div>

              <button type="submit" className="bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-gray-900 transition-colors">
                Save Changes
              </button>
            </form>
          </div>

        </div>
      </div>
    </main>
  );
}
