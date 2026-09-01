"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Package, ShoppingCart } from "lucide-react";

export default function MarketplacePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from("stockholder_inventory")
        .select("id, quantity_available, price_per_unit, updated_at, custom_product_name, category, unit, image_url, rating, review_count, stockholder_id")
        .eq("is_available", true);

      if (error) console.error("Products fetch error:", error);
      if (data) setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((item) => {
    const term = search.toLowerCase();
    const productName = item.custom_product_name?.toLowerCase() || "";
    const category = item.category?.toLowerCase() || "";
    return productName.includes(term) || category.includes(term);
  });

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="p-8 bg-gradient-to-br from-slate-50 via-slate-50 to-emerald-50/30 min-h-screen font-sans">
        <div
          className="mb-8 flex items-center justify-between opacity-0 animate-[fadeSlideUp_0.6s_ease-out_forwards]"
        >
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Supplier Marketplace</h1>
            <p className="mt-1.5 text-sm text-slate-500 font-medium">Browse available wholesale products from suppliers.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        <div
          className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden opacity-0 animate-[fadeSlideUp_0.6s_ease-out_forwards]"
          style={{ animationDelay: "150ms" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700">
                <tr>
                  <th className="px-6 py-4 font-semibold">Product</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Available Stock</th>
                  <th className="px-6 py-4 font-semibold">Unit</th>
                  <th className="px-6 py-4 font-semibold">Price per Unit</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative">
                          <div className="h-8 w-8 rounded-full border-3 border-slate-200"></div>
                          <div className="absolute top-0 h-8 w-8 rounded-full border-3 border-transparent border-t-emerald-500 animate-spin"></div>
                        </div>
                        <p className="text-sm font-medium text-slate-500 animate-pulse">Loading catalog...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center text-slate-500">
                      <Package className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                      <p className="text-base font-medium text-slate-900">No products found</p>
                      <p className="text-sm">There are no products currently available from suppliers.</p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((item, index) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 transition-all duration-200 opacity-0 animate-[fadeSlideUp_0.4s_ease-out_forwards] group"
                      style={{ animationDelay: `${200 + index * 50}ms` }}
                    >
                      <td className="px-6 py-4 font-medium text-slate-900 group-hover:text-emerald-700 transition-colors duration-200">
                        <div className="flex items-center gap-3">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.custom_product_name} className="w-8 h-8 rounded object-cover" />
                          ) : (
                            <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center">
                              <Package className="w-4 h-4 text-slate-400" />
                            </div>
                          )}
                          <span>{item.custom_product_name || "Unknown Product"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                          {item.category || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{item.quantity_available}</td>
                      <td className="px-6 py-4 text-slate-500 text-xs font-medium">{item.unit || "-"}</td>
                      <td className="px-6 py-4 font-semibold text-emerald-600">৳{item.price_per_unit?.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-all duration-200 hover:scale-105">
                          <ShoppingCart className="h-3.5 w-3.5" />
                          Buy Now
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
