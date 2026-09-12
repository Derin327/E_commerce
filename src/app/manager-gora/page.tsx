import { IndianRupee, ShoppingBag, Users, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { name: "Total Revenue", value: "Rs.1,24,500", icon: IndianRupee, trend: "+14.5%" },
    { name: "Total Orders", value: "458", icon: ShoppingBag, trend: "+5.2%" },
    { name: "Active Customers", value: "124", icon: Users, trend: "+12.1%" },
    { name: "Conversion Rate", value: "3.2%", icon: TrendingUp, trend: "-0.4%" },
  ];

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-8">Dashboard Overview</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{stat.name}</span>
              <div className="p-2 bg-gray-50 rounded-lg">
                <stat.icon className="w-5 h-5 text-gray-700" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
              <span className={`text-sm font-semibold ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
          <button className="text-sm font-semibold text-[#e32c2b] hover:text-red-800 transition-colors">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900">#ORD-{9000 + i}</td>
                  <td className="px-6 py-4 text-gray-600">John Doe</td>
                  <td className="px-6 py-4 text-gray-600">Sep 9, 2026</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">Rs.{(i * 1250).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      Processing
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
