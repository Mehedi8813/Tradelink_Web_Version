"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Search,
  Loader2,
  ShoppingCart,
  Filter,
  Printer,
  ChevronDown,
  Package,
  Calendar,
  MapPin,
  Hash,
  X,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "all", label: "All Orders" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "delivered", label: "Delivered" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  matching: "bg-purple-50 text-purple-700 border-purple-200",
  "out for delivery": "bg-sky-50 text-sky-700 border-sky-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchOrders() {
      const userStr = localStorage.getItem("tradelink_web_user");
      if (!userStr) {
        setLoading(false);
        return;
      }
      const currentUser = JSON.parse(userStr);
      setUser(currentUser);

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("supplier_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (error) console.error("Orders fetch error:", error);
      if (data) setOrders(data);
      setLoading(false);
    }
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.product_name?.toLowerCase().includes(search.toLowerCase()) ||
      order.id?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status?.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    totalRevenue: orders
      .filter((o) => o.status === "delivered" || o.status === "completed")
      .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0),
  };

  function handlePrintSlip(order) {
    setSelectedOrder(order);
    setShowPrintModal(true);
  }

  function printSlip() {
    if (!selectedOrder) return;

    const slipContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order Slip - ${selectedOrder.id.slice(0, 8)}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; }
          .slip { max-width: 400px; margin: 0 auto; border: 2px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
          .header { background: #136353; color: white; padding: 20px; text-align: center; }
          .header h1 { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
          .header p { font-size: 12px; opacity: 0.8; margin-top: 4px; }
          .content { padding: 24px; }
          .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #e2e8f0; }
          .row:last-child { border-bottom: none; }
          .label { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
          .value { font-size: 14px; font-weight: 700; color: #0f172a; text-align: right; }
          .total-row { background: #f0fdf4; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; }
          .total-label { font-size: 14px; font-weight: 700; color: #059669; }
          .total-value { font-size: 24px; font-weight: 800; color: #059669; }
          .footer { padding: 16px 24px; background: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0; }
          .footer p { font-size: 11px; color: #94a3b8; }
          .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
          .status-delivered { background: #dcfce7; color: #16a34a; }
          .status-pending { background: #fef3c7; color: #d97706; }
          .status-processing { background: #dbeafe; color: #2563eb; }
          .status-cancelled { background: #fee2e2; color: #dc2626; }
          @media print {
            body { padding: 20px; }
            .slip { border: 1px solid #ccc; }
          }
        </style>
      </head>
      <body>
        <div class="slip">
          <div class="header">
            <h1>TradeLink</h1>
            <p>Order Receipt</p>
          </div>
          <div class="content">
            <div class="row">
              <span class="label">Order ID</span>
              <span class="value">#${selectedOrder.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div class="row">
              <span class="label">Date</span>
              <span class="value">${new Date(selectedOrder.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
            <div class="row">
              <span class="label">Time</span>
              <span class="value">${new Date(selectedOrder.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            <div class="row">
              <span class="label">Product</span>
              <span class="value">${selectedOrder.product_name || "N/A"}</span>
            </div>
            <div class="row">
              <span class="label">Quantity</span>
              <span class="value">${selectedOrder.quantity} ${selectedOrder.unit || ""}</span>
            </div>
            <div class="row">
              <span class="label">Unit Price</span>
              <span class="value">৳${Number(selectedOrder.unit_price || 0).toFixed(2)}</span>
            </div>
            <div class="row">
              <span class="label">Status</span>
              <span class="value"><span class="status-badge status-${selectedOrder.status}">${selectedOrder.status || "N/A"}</span></span>
            </div>
            ${selectedOrder.delivery_address ? `
            <div class="row">
              <span class="label">Delivery Address</span>
              <span class="value" style="max-width: 200px; text-align: right;">${selectedOrder.delivery_address}</span>
            </div>
            ` : ""}
          </div>
          <div class="total-row">
            <span class="total-label">Total Amount</span>
            <span class="total-value">৳${Number(selectedOrder.total_amount || 0).toLocaleString()}</span>
          </div>
          <div class="footer">
            <p>Thank you for your order!</p>
            <p style="margin-top: 4px;">Generated by TradeLink Supplier Portal</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=500,height=700");
    printWindow.document.write(slipContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
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
        {/* Header */}
        <div
          className="mb-8 flex items-center justify-between opacity-0 animate-[fadeSlideUp_0.6s_ease-out_forwards]"
        >
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Orders</h1>
            <p className="mt-1.5 text-sm text-slate-500 font-medium">View and manage all your orders.</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 opacity-0 animate-[fadeSlideUp_0.6s_ease-out_forwards]"
          style={{ animationDelay: "100ms" }}
        >
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-amber-500 uppercase tracking-wide">Pending</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">{stats.pending}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-blue-500 uppercase tracking-wide">Processing</p>
            <p className="text-2xl font-extrabold text-blue-600 mt-1">{stats.processing}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-wide">Delivered</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">{stats.delivered}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-wide">Revenue</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">৳{stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 opacity-0 animate-[fadeSlideUp_0.6s_ease-out_forwards]"
          style={{ animationDelay: "200ms" }}
        >
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by product or order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 py-2.5 px-4 text-sm font-medium focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 bg-white"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden opacity-0 animate-[fadeSlideUp_0.6s_ease-out_forwards]"
          style={{ animationDelay: "300ms" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-700">Order ID</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Product</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Qty</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Unit Price</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Total</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Date</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative">
                          <div className="h-8 w-8 rounded-full border-3 border-slate-200"></div>
                          <div className="absolute top-0 h-8 w-8 rounded-full border-3 border-transparent border-t-emerald-500 animate-spin"></div>
                        </div>
                        <p className="text-sm font-medium text-slate-500 animate-pulse">Loading orders...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-16 text-center text-slate-500">
                      <ShoppingCart className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                      <p className="text-base font-medium text-slate-900">No orders found</p>
                      <p className="text-sm">No orders match your search criteria.</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order, index) => (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/60 transition-all duration-200 opacity-0 animate-[fadeSlideUp_0.4s_ease-out_forwards] group"
                      style={{ animationDelay: `${350 + index * 40}ms` }}
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">{order.product_name || "N/A"}</td>
                      <td className="px-6 py-4 text-slate-700">
                        {order.quantity} <span className="text-slate-400 text-xs">{order.unit || ""}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-700">৳{Number(order.unit_price || 0).toFixed(2)}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">৳{Number(order.total_amount || 0).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${STATUS_STYLES[order.status] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
                          {order.status || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-xs font-medium">
                        {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handlePrintSlip(order)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-all duration-200 hover:scale-105"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          Print Slip
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Print Count */}
        {!loading && filteredOrders.length > 0 && (
          <div className="mt-4 text-center text-sm text-slate-500 font-medium">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        )}
      </div>

      {/* Print Preview Modal */}
      {showPrintModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
            style={{ animation: "fadeSlideUp 0.3s ease-out" }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Order Slip Preview</h3>
                <p className="text-sm text-slate-500">Order #{selectedOrder.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <button
                onClick={() => setShowPrintModal(false)}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            {/* Slip Preview */}
            <div className="p-6">
              <div className="border-2 border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-[#136353] text-white p-4 text-center">
                  <h4 className="text-lg font-extrabold">TradeLink</h4>
                  <p className="text-xs opacity-80">Order Receipt</p>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Order ID</span>
                    <span className="font-bold">#{selectedOrder.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Date</span>
                    <span className="font-bold">{new Date(selectedOrder.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Product</span>
                    <span className="font-bold">{selectedOrder.product_name || "N/A"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Quantity</span>
                    <span className="font-bold">{selectedOrder.quantity} {selectedOrder.unit || ""}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Unit Price</span>
                    <span className="font-bold">৳{Number(selectedOrder.unit_price || 0).toFixed(2)}</span>
                  </div>
                  {selectedOrder.delivery_address && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Address</span>
                      <span className="font-bold text-right max-w-[200px]">{selectedOrder.delivery_address}</span>
                    </div>
                  )}
                </div>
                <div className="bg-emerald-50 px-5 py-4 flex justify-between items-center">
                  <span className="font-bold text-emerald-700">Total</span>
                  <span className="text-2xl font-extrabold text-emerald-700">৳{Number(selectedOrder.total_amount || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => setShowPrintModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={printSlip}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#136353] to-[#1a7d6a] text-white font-semibold text-sm hover:from-[#0f5043] hover:to-[#136353] transition-all duration-300 shadow-lg shadow-emerald-900/20"
              >
                <Printer className="h-4 w-4" />
                Print Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
