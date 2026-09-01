"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Database, Plus, X, Camera, MapPin, Loader2, ChevronDown } from "lucide-react";
import { toast, Toaster } from "sonner";

const CATEGORIES = [
  "Grocery",
  "Pharmacy",
  "Stationery",
  "Hardware",
];

const UNITS = [
  { value: "kg", label: "kg" },
  { value: "litre", label: "litre" },
  { value: "pcs", label: "pcs" },
];

const INITIAL_FORM = {
  category: "Grocery",
  custom_product_name: "",
  quantity_available: "",
  unit: "kg",
  price_per_unit: "",
  delivery_radius_km: 10,
};

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    async function fetchInventory() {
      const userStr = localStorage.getItem("tradelink_web_user");
      if (!userStr) {
        setLoading(false);
        return;
      }
      const user = JSON.parse(userStr);
      setUserId(user.id);

      const { data, error } = await supabase
        .from("stockholder_inventory")
        .select("id, quantity_available, price_per_unit, is_available, updated_at, custom_product_name, category, unit, image_url, delivery_radius_km")
        .eq("stockholder_id", user.id);

      if (error) console.error("Inventory fetch error:", error);
      if (data) setInventory(data);
      setLoading(false);
    }
    fetchInventory();
  }, []);

  const filteredInventory = inventory.filter((item) => {
    const term = search.toLowerCase();
    const productName = item.custom_product_name?.toLowerCase() || "";
    const category = item.category?.toLowerCase() || "";
    return productName.includes(term) || category.includes(term);
  });

  function handleImageSelect(e) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  function handleFormChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.custom_product_name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!form.quantity_available || Number(form.quantity_available) <= 0) {
      toast.error("Enter a valid quantity");
      return;
    }
    if (!form.price_per_unit || Number(form.price_per_unit) <= 0) {
      toast.error("Enter a valid price");
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = null;

      // Upload image if selected
      if (imageFile) {
        const fileName = `${userId}/${Date.now()}_${imageFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("inventory-images")
          .upload(fileName, imageFile);

        if (uploadError) {
          console.error("Image upload error:", uploadError);
        } else {
          const { data: urlData } = supabase.storage
            .from("inventory-images")
            .getPublicUrl(fileName);
          imageUrl = urlData.publicUrl;
        }
      }

      // Insert inventory item
      const { data, error } = await supabase
        .from("stockholder_inventory")
        .insert({
          stockholder_id: userId,
          custom_product_name: form.custom_product_name.trim(),
          category: form.category,
          quantity_available: Number(form.quantity_available),
          unit: form.unit,
          price_per_unit: Number(form.price_per_unit),
          delivery_radius_km: Number(form.delivery_radius_km),
          is_available: true,
          image_url: imageUrl,
        })
        .select()
        .single();

      if (error) throw error;

      setInventory((prev) => [data, ...prev]);
      setShowAddModal(false);
      setForm(INITIAL_FORM);
      setImageFile(null);
      setImagePreview(null);
      toast.success("Stock listing published successfully!");
    } catch (error) {
      console.error("Add stock error:", error);
      toast.error(error.message || "Failed to add stock");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCloseModal() {
    setShowAddModal(false);
    setForm(INITIAL_FORM);
    setImageFile(null);
    setImagePreview(null);
  }

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="p-8 bg-gradient-to-br from-slate-50 via-slate-50 to-emerald-50/30 min-h-screen font-sans">
        <Toaster position="top-right" richColors />

        <div className="mb-8 flex items-center justify-between opacity-0 animate-[fadeSlideUp_0.6s_ease-out_forwards]">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Inventory Management</h1>
            <p className="mt-1.5 text-sm text-slate-500 font-medium">Manage your live catalog and pricing.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search inventory..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:from-emerald-700 hover:to-emerald-600 transition-all duration-300 shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
              Add Stock
            </button>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden opacity-0 animate-[fadeSlideUp_0.6s_ease-out_forwards]" style={{ animationDelay: "150ms" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700">
                <tr>
                  <th className="px-6 py-4 font-semibold">Product</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Quantity</th>
                  <th className="px-6 py-4 font-semibold">Unit</th>
                  <th className="px-6 py-4 font-semibold">Price per Unit</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative">
                          <div className="h-8 w-8 rounded-full border-3 border-slate-200"></div>
                          <div className="absolute top-0 h-8 w-8 rounded-full border-3 border-transparent border-t-emerald-500 animate-spin"></div>
                        </div>
                        <p className="text-sm font-medium text-slate-500 animate-pulse">Loading inventory...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center text-slate-500">
                      <Database className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                      <p className="text-base font-medium text-slate-900">No inventory found</p>
                      <p className="text-sm">You haven&apos;t added any products to your catalog yet.</p>
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-all duration-200 opacity-0 animate-[fadeSlideUp_0.4s_ease-out_forwards] group" style={{ animationDelay: `${200 + index * 50}ms` }}>
                      <td className="px-6 py-4 font-medium text-slate-900 group-hover:text-emerald-700 transition-colors duration-200">
                        <div className="flex items-center gap-3">
                          {item.image_url ? (
                            <img src={item.image_url} alt="" className="h-9 w-9 rounded-lg object-cover" />
                          ) : (
                            <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-bold">N/A</div>
                          )}
                          {item.custom_product_name || "Unknown Product"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">{item.category || "N/A"}</span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{item.quantity_available}</td>
                      <td className="px-6 py-4 text-slate-500 text-xs font-medium">{item.unit || "-"}</td>
                      <td className="px-6 py-4 font-semibold text-emerald-600">৳{item.price_per_unit?.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize transition-all duration-200 hover:scale-105 ${item.is_available ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${item.is_available ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                          {item.is_available ? "Active" : "Hidden"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-blue-600 hover:text-blue-800 font-semibold text-xs hover:underline transition-all duration-200">Edit</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" style={{ animation: "fadeSlideUp 0.3s ease-out" }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white rounded-t-3xl z-10">
              <h3 className="text-xl font-bold text-slate-900">Add Stock</h3>
              <button onClick={handleCloseModal} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Product Photo */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Product photo</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all duration-200"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-24 w-24 rounded-xl object-cover" />
                  ) : (
                    <>
                      <Camera className="h-10 w-10 text-emerald-600 mb-2" />
                      <p className="text-sm font-semibold text-slate-600">Tap to upload product photo</p>
                    </>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                <div className="relative">
                  <select
                    value={form.category}
                    onChange={(e) => handleFormChange("category", e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 py-3 px-4 pr-10 text-sm font-medium focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Product name</label>
                <input
                  type="text"
                  value={form.custom_product_name}
                  onChange={(e) => handleFormChange("custom_product_name", e.target.value)}
                  placeholder="e.g. Rice - Basmati"
                  className="w-full rounded-xl border border-slate-200 py-3 px-4 text-sm font-medium placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                />
              </div>

              {/* Quantity & Unit */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Quantity available</label>
                  <input
                    type="number"
                    value={form.quantity_available}
                    onChange={(e) => handleFormChange("quantity_available", e.target.value)}
                    placeholder="500"
                    min="0"
                    className="w-full rounded-xl border border-slate-200 py-3 px-4 text-sm font-medium placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Unit</label>
                  <div className="relative">
                    <select
                      value={form.unit}
                      onChange={(e) => handleFormChange("unit", e.target.value)}
                      className="w-full appearance-none rounded-xl border border-slate-200 py-3 px-3 pr-8 text-sm font-medium focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 bg-white"
                    >
                      {UNITS.map((u) => (
                        <option key={u.value} value={u.value}>{u.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Price per Unit */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Price per unit (৳)</label>
                <input
                  type="number"
                  value={form.price_per_unit}
                  onChange={(e) => handleFormChange("price_per_unit", e.target.value)}
                  placeholder="68"
                  min="0"
                  className="w-full rounded-xl border border-slate-200 py-3 px-4 text-sm font-medium placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                />
              </div>

              {/* Delivery Radius */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Delivery radius (km)</label>
                <input
                  type="number"
                  value={form.delivery_radius_km}
                  onChange={(e) => handleFormChange("delivery_radius_km", e.target.value)}
                  placeholder="10"
                  min="1"
                  className="w-full rounded-xl border border-slate-200 py-3 px-4 text-sm font-medium placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 pt-0 sticky bottom-0 bg-white rounded-b-3xl">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#136353] to-[#1a7d6a] text-white font-bold text-sm hover:from-[#0f5043] hover:to-[#136353] transition-all duration-300 shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  "Publish stock listing"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
