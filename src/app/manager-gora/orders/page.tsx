"use client";

import { useState } from "react";
import { ShoppingBag, Search, Eye, Filter, CheckCircle2, Truck, Clock, AlertCircle } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: "paid" | "pending" | "failed";
  fulfillmentStatus: "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  itemsCount: number;
}

const mockOrders: Order[] = [
  {
    id: "ord_1",
    orderNumber: "GOR-9821",
    customerName: "Derin Bhavan",
    customerEmail: "blestoderin2005@gmail.com",
    totalAmount: 2489,
    paymentMethod: "COD",
    paymentStatus: "pending",
    fulfillmentStatus: "processing",
    createdAt: "2026-09-10T14:30:00Z",
    itemsCount: 2,
  },
  {
    id: "ord_2",
    orderNumber: "GOR-9820",
    customerName: "Ananya Sharma",
    customerEmail: "ananya.s@example.com",
    totalAmount: 1499,
    paymentMethod: "Razorpay",
    paymentStatus: "paid",
    fulfillmentStatus: "shipped",
    createdAt: "2026-09-09T18:15:00Z",
    itemsCount: 1,
  },
  {
    id: "ord_3",
    orderNumber: "GOR-9819",
    customerName: "Rohan Verma",
    customerEmail: "rohan.v@example.com",
    totalAmount: 3598,
    paymentMethod: "Razorpay",
    paymentStatus: "paid",
    fulfillmentStatus: "delivered",
    createdAt: "2026-09-08T11:20:00Z",
    itemsCount: 3,
  },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? o.fulfillmentStatus === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = (id: string, newStatus: Order["fulfillmentStatus"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, fulfillmentStatus: newStatus } : o))
    );
    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder((prev) => (prev ? { ...prev, fulfillmentStatus: newStatus } : null));
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage customer orders and fulfillment.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 border border-gray-200 rounded-t-lg flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order #, customer name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:border-black cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-t-0 border-gray-200 rounded-b-lg overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
              <th className="px-4 py-3">Order #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Fulfillment</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-gray-400">
                  <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-semibold text-gray-500">No orders found</p>
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-sm text-gray-900">
                    {order.orderNumber}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-sm text-gray-900">{order.customerName}</p>
                    <p className="text-xs text-gray-400">{order.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold uppercase bg-gray-100 text-gray-700">
                      {order.paymentMethod} • {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        order.fulfillmentStatus === "delivered"
                          ? "bg-green-100 text-green-700"
                          : order.fulfillmentStatus === "shipped"
                          ? "bg-blue-100 text-blue-700"
                          : order.fulfillmentStatus === "processing"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {order.fulfillmentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-sm text-gray-900">
                    Rs.{order.totalAmount}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-md transition-all active:scale-95 cursor-pointer inline-flex items-center gap-1 text-xs font-semibold border"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-lg font-bold">Order Details - {selectedOrder.orderNumber}</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-black text-xl font-bold active:scale-95 cursor-pointer px-2"
              >
                ✕
              </button>
            </div>
            <div className="text-sm space-y-2">
              <p><span className="font-semibold text-gray-500">Customer:</span> {selectedOrder.customerName}</p>
              <p><span className="font-semibold text-gray-500">Email:</span> {selectedOrder.customerEmail}</p>
              <p><span className="font-semibold text-gray-500">Total:</span> Rs.{selectedOrder.totalAmount}</p>
              <p><span className="font-semibold text-gray-500">Payment:</span> {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})</p>
            </div>

            <div className="border-t pt-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Update Status</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, "processing")}
                  className={`py-2 text-xs font-bold uppercase rounded border transition-all active:scale-95 cursor-pointer ${
                    selectedOrder.fulfillmentStatus === "processing" ? "bg-yellow-500 text-white" : "hover:bg-gray-50"
                  }`}
                >
                  Processing
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, "shipped")}
                  className={`py-2 text-xs font-bold uppercase rounded border transition-all active:scale-95 cursor-pointer ${
                    selectedOrder.fulfillmentStatus === "shipped" ? "bg-blue-600 text-white" : "hover:bg-gray-50"
                  }`}
                >
                  Shipped
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, "delivered")}
                  className={`py-2 text-xs font-bold uppercase rounded border transition-all active:scale-95 cursor-pointer ${
                    selectedOrder.fulfillmentStatus === "delivered" ? "bg-green-600 text-white" : "hover:bg-gray-50"
                  }`}
                >
                  Delivered
                </button>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full bg-black text-white py-2.5 rounded font-semibold text-sm hover:bg-gray-800 transition-all active:scale-95 cursor-pointer mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
