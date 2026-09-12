"use client";

import { useState } from "react";
import { Store, CreditCard, ShieldCheck, Check, Save } from "lucide-react";

export default function AdminSettingsPage() {
  const [storeName, setStoreName] = useState("GORA Store");
  const [supportEmail, setSupportEmail] = useState("support@gorastore.com");
  const [currency, setCurrency] = useState("INR (Rs.)");
  const [codEnabled, setCodEnabled] = useState(true);
  const [onlinePaymentEnabled, setOnlinePaymentEnabled] = useState(true);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure payments, store info, and system preferences.</p>
        </div>
        {savedMsg && (
          <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5">
            <Check className="w-4 h-4" /> Settings Saved!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Info */}
        <div className="bg-white p-6 border rounded-lg shadow-sm space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900 border-b pb-3">
            <Store className="w-5 h-5 text-gray-500" /> General Store Info
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full border p-2.5 rounded text-sm focus:border-black outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full border p-2.5 rounded text-sm focus:border-black outline-none"
              />
            </div>
          </div>
        </div>

        {/* Payment Gateways */}
        <div className="bg-white p-6 border rounded-lg shadow-sm space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900 border-b pb-3">
            <CreditCard className="w-5 h-5 text-gray-500" /> Payment Modes
          </h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
              <div>
                <p className="text-sm font-bold text-gray-900">Cash on Delivery (COD)</p>
                <p className="text-xs text-gray-500">Allow customers to pay upon delivery.</p>
              </div>
              <input
                type="checkbox"
                checked={codEnabled}
                onChange={(e) => setCodEnabled(e.target.checked)}
                className="w-5 h-5 accent-black cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
              <div>
                <p className="text-sm font-bold text-gray-900">Razorpay / UPI Online Payments</p>
                <p className="text-xs text-gray-500">Enable Debit, Credit Cards, Netbanking & UPI.</p>
              </div>
              <input
                type="checkbox"
                checked={onlinePaymentEnabled}
                onChange={(e) => setOnlinePaymentEnabled(e.target.checked)}
                className="w-5 h-5 accent-black cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="bg-black text-white px-6 py-3 rounded-md text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95 cursor-pointer shadow flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
