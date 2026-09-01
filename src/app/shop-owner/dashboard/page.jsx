"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Package } from "lucide-react";

export default function ShopOwnerDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      const userStr = localStorage.getItem("tradelink_web_user");
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("shopOwnerId", user.id) // Adjusted naming to potentially match DB
        .order("created_at", { ascending: false });
      
      if (!error && data) setOrders(data);
      setLoading(false);
    }
    fetchOrders();
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Buying Details & Orders</h1>
        <p className="mt-1 text-sm text-slate-500">Track your bulk purchases and active logistics.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Order ID</th>
                <th className="px-6 py-4 font-semibold">Quantity</th>
                <th className="px-6 py-4 font-semibold">Total Price</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin mb-2" />
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-slate-500">
                    <Package className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <p className="text-base font-medium text-slate-900">No orders found</p>
                    <p className="text-sm">You haven't made any bulk purchases yet.</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.orderID} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">
                      #{order.orderID?.toString().padStart(5, '0')}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {order.quantity} units
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      ৳{order.totalPrice?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' : 
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {order.status?.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(order.created_at || Date.now()).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
