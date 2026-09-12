"use client";

import { useState, useEffect } from "react";
import { Users, Search, Mail, Phone, MapPin, ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Profile {
  id: string;
  email: string;
  role: string;
  username: string | null;
  phone: string | null;
  city: string | null;
  phone_verified: boolean;
  created_at: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCustomers() {
      setIsLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      setCustomers(data || []);
      setIsLoading(false);
    }
    loadCustomers();
  }, []);

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.email?.toLowerCase().includes(q) ||
      c.username?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage registered user profiles.</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 border border-gray-200 rounded-t-lg">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by email, username, phone, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-black transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-t-0 border-gray-200 rounded-b-lg overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-gray-400">
                  <Users className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-semibold text-gray-500">No customers found</p>
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm uppercase">
                        {(c.username || c.email)?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{c.username || "Anonymous User"}</p>
                        <p className="text-xs text-gray-400">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {c.phone ? (
                      <span className="flex items-center gap-1">
                        {c.phone}
                        {c.phone_verified ? (
                          <span title="Verified Phone"><ShieldCheck className="w-4 h-4 text-green-600" /></span>
                        ) : (
                          <span title="Unverified Phone"><ShieldAlert className="w-4 h-4 text-gray-300" /></span>
                        )}
                      </span>
                    ) : (
                      <span className="text-gray-300 italic">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {c.city || <span className="text-gray-300 italic">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        c.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {c.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
