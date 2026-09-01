"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { FileDown, Users, ShoppingCart, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function ReportsPage() {
  const [loadingType, setLoadingType] = useState(null);
  
  // Date range state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const generateCSV = (data, filename) => {
    if (!data || data.length === 0) {
      toast.error("No data found for the selected date range.");
      return;
    }
    const keys = Object.keys(data[0]);
    const csvContent = [
      keys.join(","), // header
      ...data.map(row => keys.map(k => `"${String(row[k] || "").replace(/"/g, '""')}"`).join(",")) // rows
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`${filename} generated successfully!`);
  };

  const handleDownloadUsers = async () => {
    setLoadingType("users");
    try {
      let query = supabase.from("users").select("*").order("created_at", { ascending: false });
      
      if (startDate) {
        query = query.gte("created_at", new Date(startDate).toISOString());
      }
      if (endDate) {
        // Add 1 day to include the entire end date
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        query = query.lt("created_at", end.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      // Clean and format data for the report
      const cleanData = data.map(user => ({
        "Full Name": user.full_name || "N/A",
        "Email": user.email || "N/A",
        "Phone": user.phone_number || "N/A",
        "Role": user.role || "N/A",
        "Category": user.category || "N/A",
        "Status": user.is_suspended ? "Suspended" : "Active",
        "Joined Date": new Date(user.created_at).toLocaleDateString()
      }));

      generateCSV(cleanData, `tradelink_users_report_${new Date().toISOString().split("T")[0]}.csv`);
    } catch (err) {
      toast.error("Failed to fetch user data.");
    }
    setLoadingType(null);
  };

  const handleDownloadOrders = async () => {
    setLoadingType("orders");
    try {
      let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
      
      if (startDate) {
        query = query.gte("created_at", new Date(startDate).toISOString());
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        query = query.lt("created_at", end.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      // Clean and format data for the report
      const cleanData = data.map(order => ({
        "Order ID": order.id,
        "Product": order.product_name || "N/A",
        "Quantity": order.quantity || 0,
        "Total Amount (BDT)": order.total_amount || 0,
        "Order Status": order.status || "N/A",
        "Payment Status": order.payment_status || "N/A",
        "Delivery Address": order.delivery_address || "N/A",
        "Order Date": new Date(order.created_at).toLocaleDateString()
      }));

      generateCSV(cleanData, `tradelink_sales_report_${new Date().toISOString().split("T")[0]}.csv`);
    } catch (err) {
      toast.error("Failed to fetch sales data.");
    }
    setLoadingType(null);
  };

  return (
    <div className="p-8 w-full max-w-[1600px] mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports Hub</h1>
          <p className="mt-1 text-sm text-slate-500">Generate curated data exports filtered by date range.</p>
        </div>
        
        {/* Date Range Picker */}
        <div className="flex flex-col sm:flex-row items-end gap-3 bg-white p-3 rounded-xl shadow-sm border border-slate-100">
          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Start Date</label>
            <div className="relative">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-3 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#136353]/20 focus:border-[#136353] font-medium text-slate-700"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">End Date</label>
            <div className="relative">
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-3 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#136353]/20 focus:border-[#136353] font-medium text-slate-700"
              />
            </div>
          </div>
          <button 
            onClick={() => { setStartDate(""); setEndDate(""); }}
            className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Clear Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Sales Report Card */}
        <div className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col items-start hover:-translate-y-0.5 transition-transform duration-300">
          <div className="bg-emerald-50 p-4 rounded-xl mb-6">
            <ShoppingCart className="w-8 h-8 text-[#136353]" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Sales & Revenue Report</h3>
          <p className="text-sm text-slate-500 font-medium mb-8 flex-1 leading-relaxed">
            Export a curated CSV of orders within your selected date range. Data is cleaned and formatted with essential fields: Order ID, Product, Amount, Status, and Date.
          </p>
          <button 
            onClick={handleDownloadOrders}
            disabled={loadingType === "orders"}
            className="w-full flex items-center justify-center gap-2 bg-[#136353] hover:bg-[#0e4d41] text-white px-4 py-3.5 rounded-xl font-bold transition-colors disabled:opacity-70"
          >
            {loadingType === "orders" ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileDown className="w-5 h-5" />}
            Download Order Report
          </button>
        </div>

        {/* Users Report Card */}
        <div className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col items-start hover:-translate-y-0.5 transition-transform duration-300">
          <div className="bg-blue-50 p-4 rounded-xl mb-6">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Platform Users Report</h3>
          <p className="text-sm text-slate-500 font-medium mb-8 flex-1 leading-relaxed">
            Export a curated CSV of registered users within your selected date range. Contains cleaned data including Name, Email, Phone, Role, Category, and Suspension Status.
          </p>
          <button 
            onClick={handleDownloadUsers}
            disabled={loadingType === "users"}
            className="w-full flex items-center justify-center gap-2 bg-[#1f7564] hover:bg-[#155a4c] text-white px-4 py-3.5 rounded-xl font-bold transition-colors disabled:opacity-70"
          >
            {loadingType === "users" ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileDown className="w-5 h-5" />}
            Download User Report
          </button>
        </div>

      </div>
    </div>
  );
}
