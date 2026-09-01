"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Loader2, Database, Plus, Upload } from "lucide-react";

export default function StockholderDashboard() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchInventory() {
      const userStr = localStorage.getItem("tradelink_web_user");
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const { data, error } = await supabase
        .from("stockholder_inventory")
        .select(`
          id,
          quantity,
          price_per_unit,
          is_available,
          updated_at,
          master_products (name, category)
        `)
        .eq("stockholder_id", user.id);
      
      if (!error && data) setInventory(data);
      setLoading(false);
    }
    fetchInventory();
  }, []);

  const filteredInventory = inventory.filter((item) => {
    const term = search.toLowerCase();
    const productName = item.master_products?.name?.toLowerCase() || "";
    const category = item.master_products?.category?.toLowerCase() || "";
    return productName.includes(term) || category.includes(term);
  });

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your live catalog and pricing.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search inventory..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Upload className="h-4 w-4" />
            Bulk CSV
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
            <Plus className="h-4 w-4" />
            Add Item
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Product</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Quantity</th>
                <th className="px-6 py-4 font-semibold">Price per Unit</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin mb-2" />
                    Loading inventory...
                  </td>
                </tr>
              ) : filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-slate-500">
                    <Database className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <p className="text-base font-medium text-slate-900">No inventory found</p>
                    <p className="text-sm">You haven't added any products to your catalog yet.</p>
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {item.master_products?.name || "Unknown Product"}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {item.master_products?.category || "N/A"}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 font-semibold text-emerald-600">
                      ৳{item.price_per_unit?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        item.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.is_available ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 hover:text-blue-800 font-medium text-xs">Edit</button>
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
