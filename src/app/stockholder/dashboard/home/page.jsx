"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  Package,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Download,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";

/**
 * Custom hook for animating a number from 0 to target value.
 * Uses requestAnimationFrame with cubic easing for smooth animation.
 * @param {number} target - The target number to animate to
 * @param {number} duration - Animation duration in milliseconds (default: 800ms)
 * @returns {number} The current animated value
 */
function useAnimatedNumber(target, duration = 800) {
  const [current, setCurrent] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!target) return;
    const start = performance.now();
    const from = 0;
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(from + (target - from) * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return current;
}

/**
 * AnimatedStatCard - Displays a metric card with animated number counter.
 * Features hover effects, staggered entrance animation, and icon scaling.
 * @param {string} title - The metric label
 * @param {string|number} value - The metric value to display
 * @param {string} prefix - Currency or text prefix for the value
 * @param {string} trend - Trend description text
 * @param {string} trendColor - Tailwind color class for trend text
 * @param {React.ReactNode} icon - Lucide icon component
 * @param {string} iconBg - Tailwind background class for icon container
 * @param {number} delay - Animation delay in milliseconds
 */
function AnimatedStatCard({ title, value, prefix = "", suffix = "", trend, trendColor, icon, iconBg, delay }) {
  const numericValue = typeof value === "number" ? value : parseInt(String(value).replace(/[^0-9]/g, "")) || 0;
  const animated = useAnimatedNumber(numericValue, 1000);

  return (
    <div
      className="group bg-white p-5 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between hover:-translate-y-1 hover:shadow-[0_20px_40px_-12px_rgba(19,99,83,0.15)] transition-all duration-500 ease-out opacity-0 animate-[fadeSlideUp_0.6s_ease-out_forwards]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex justify-between items-start mb-6">
        <h4 className="text-[13px] font-bold text-slate-500 tracking-wide">{title}</h4>
        <div className={`p-2.5 rounded-xl ${iconBg} group-hover:scale-110 transition-transform duration-300`}>{icon}</div>
      </div>
      <div>
        <h2 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">
          {prefix}{typeof value === "number" ? animated.toLocaleString() : value}
        </h2>
        <p className={`text-[12px] font-bold mt-2.5 ${trendColor}`}>{trend}</p>
      </div>
    </div>
  );
}

/**
 * ChartCard - Wrapper component for chart containers with consistent styling.
 * Provides white background, rounded corners, shadow, and entrance animation.
 * @param {string} title - Chart section heading
 * @param {React.ReactNode} children - Chart content
 * @param {string} className - Additional CSS classes
 * @param {number} delay - Animation delay in milliseconds
 */
function ChartCard({ title, children, className = "", delay = 0 }) {
  return (
    <div
      className={`bg-white p-6 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-[0_20px_40px_-12px_rgba(19,99,83,0.1)] transition-shadow duration-500 opacity-0 animate-[fadeSlideUp_0.6s_ease-out_forwards] ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-6">{title}</h3>
      {children}
    </div>
  );
}

export default function SupplierHomePage() {
  const [metrics, setMetrics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [topProductsData, setTopProductsData] = useState([]);
  const [monthlySalesData, setMonthlySalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    async function fetchData() {
      const userStr = localStorage.getItem("tradelink_web_user");
      if (!userStr) {
        setLoading(false);
        return;
      }
      const user = JSON.parse(userStr);

      const { data: inventory, error: invErr } = await supabase
        .from("stockholder_inventory")
        .select("id, quantity_available, price_per_unit, is_available, custom_product_name, category, unit")
        .eq("stockholder_id", user.id);

      const { data: orders, error: ordErr } = await supabase
        .from("orders")
        .select("id, product_name, quantity, unit_price, total_amount, status, created_at, supplier_id")
        .eq("supplier_id", user.id)
        .order("created_at", { ascending: false });

      if (invErr) console.error("Inventory fetch error:", invErr);
      if (ordErr) console.error("Orders fetch error:", ordErr);

      const inv = inventory || [];
      const ords = orders || [];

      const totalStock = inv.reduce((sum, item) => sum + (item.quantity_available || 0), 0);
      const totalStockValue = inv.reduce(
        (sum, item) => sum + (item.quantity_available || 0) * (item.price_per_unit || 0), 0
      );
      const activeProducts = inv.filter((item) => item.is_available).length;
      const totalSales = ords
        .filter((o) => o.status === "delivered" || o.status === "completed")
        .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
      const totalOrders = ords.length;

      setMetrics({ totalStock, totalStockValue, totalSales, activeProducts, totalOrders });

      const catCounts = {};
      inv.forEach((item) => {
        const cat = item.category || "Uncategorized";
        catCounts[cat] = (catCounts[cat] || 0) + (item.quantity_available || 0);
      });
      const colors = ["#1f7564", "#d97706", "#66b2a3", "#cbd5e1", "#8b5cf6", "#f43f5e"];
      const catData = Object.entries(catCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }));
      setCategoryData(catData);

      setAllOrders(ords);

      setRecentOrders(
        ords.slice(0, 5).map((o) => ({
          product: o.product_name || "Unknown",
          amount: Number(o.total_amount) || 0,
          status: o.status || "pending",
          date: new Date(o.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        }))
      );

      const today = new Date();
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - i));
        return d;
      });

      const salesByDay = last7Days.map((d) => {
        const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
        const dayTotal = ords
          .filter((o) => {
            const od = new Date(o.created_at);
            return od.getDate() === d.getDate() && od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
          })
          .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
        return { name: dayName, sales: dayTotal };
      });
      setSalesData(salesByDay);

      const statusCounts = {};
      ords.forEach((o) => {
        const s = o.status || "pending";
        statusCounts[s] = (statusCounts[s] || 0) + 1;
      });
      const statusColors = {
        pending: "#d97706", processing: "#3b82f6", matching: "#8b5cf6",
        delivered: "#059669", completed: "#059669", cancelled: "#ef4444", "out for delivery": "#0ea5e9",
      };
      const statusData = Object.entries(statusCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
          color: statusColors[name.toLowerCase()] || "#64748b",
        }));
      setOrderStatusData(statusData);

      const productRevenue = {};
      ords.forEach((o) => {
        const name = o.product_name || "Unknown";
        productRevenue[name] = (productRevenue[name] || 0) + (Number(o.total_amount) || 0);
      });
      const topProducts = Object.entries(productRevenue)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, revenue]) => ({
          name: name.length > 15 ? name.substring(0, 15) + "..." : name,
          revenue,
        }));
      setTopProductsData(topProducts);

      const monthlySales = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today);
        d.setMonth(d.getMonth() - i);
        const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        monthlySales[key] = 0;
      }
      ords.forEach((o) => {
        const od = new Date(o.created_at);
        const key = od.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        if (key in monthlySales) monthlySales[key] += Number(o.total_amount) || 0;
      });
      setMonthlySalesData(Object.entries(monthlySales).map(([name, sales]) => ({ name, sales })));

      setLoading(false);
    }
    fetchData();
  }, []);

  function downloadCSV() {
    if (!metrics) return;
    const userStr = localStorage.getItem("tradelink_web_user");
    const user = userStr ? JSON.parse(userStr) : {};

    // Filter orders by date range
    let filteredOrders = allOrders;
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filteredOrders = filteredOrders.filter((o) => new Date(o.created_at) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filteredOrders = filteredOrders.filter((o) => new Date(o.created_at) <= end);
    }

    const totalFilteredSales = filteredOrders
      .filter((o) => o.status === "delivered" || o.status === "completed")
      .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

    const dateRangeLabel = startDate && endDate
      ? `${startDate} to ${endDate}`
      : startDate
      ? `From ${startDate}`
      : endDate
      ? `Until ${endDate}`
      : "All time";

    const rows = [
      ["Supplier Report"],
      ["Business Name", user.business_name || ""],
      ["Date Range", dateRangeLabel],
      ["Generated On", new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })],
      [],
      ["Summary"],
      ["Total Stock Units", metrics.totalStock],
      ["Total Stock Value (৳)", metrics.totalStockValue.toFixed(2)],
      ["Filtered Sales (৳)", totalFilteredSales.toFixed(2)],
      ["Filtered Orders", filteredOrders.length],
      ["Active Products", metrics.activeProducts],
      [],
      ["Orders"],
      ["Order ID", "Product", "Quantity", "Unit Price", "Total Amount", "Status", "Date"],
      ...filteredOrders.map((o) => [
        o.id?.slice(0, 8).toUpperCase() || "",
        o.product_name || "Unknown",
        o.quantity || 0,
        Number(o.unit_price || 0).toFixed(2),
        Number(o.total_amount || 0).toFixed(2),
        o.status || "pending",
        new Date(o.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `supplier-report-${startDate || "all"}-to-${endDate || "all"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8 gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-slate-200"></div>
          <div className="absolute top-0 h-12 w-12 rounded-full border-4 border-transparent border-t-[#136353] animate-spin"></div>
        </div>
        <p className="text-sm font-medium text-slate-500 animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      <div className="p-8 bg-gradient-to-br from-slate-50 via-slate-50 to-emerald-50/30 min-h-screen font-sans">
        {/* Header */}
        <div
          className="flex items-center justify-between mb-8 opacity-0 animate-[fadeSlideUp_0.6s_ease-out_forwards]"
        >
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Supplier Dashboard</h1>
            <p className="mt-1.5 text-sm text-slate-500 font-medium">Overview of your stock and sales performance.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 py-2">
              <label className="text-xs font-bold text-slate-500">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-sm font-medium text-slate-700 border-none outline-none cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 py-2">
              <label className="text-xs font-bold text-slate-500">To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-sm font-medium text-slate-700 border-none outline-none cursor-pointer"
              />
            </div>
            <button
              onClick={downloadCSV}
              className="group flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#136353] to-[#1a7d6a] px-5 py-3 text-sm font-semibold text-white hover:from-[#0f5043] hover:to-[#136353] transition-all duration-300 shadow-lg shadow-emerald-900/20 hover:shadow-xl hover:shadow-emerald-900/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Download className="h-4 w-4 group-hover:animate-bounce" />
              Download CSV
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <AnimatedStatCard
            title="Total Stock"
            value={metrics?.totalStock || 0}
            trend="Units in inventory"
            trendColor="text-slate-500"
            icon={<Package className="w-4 h-4 text-emerald-700" />}
            iconBg="bg-emerald-50"
            delay={0}
          />
          <AnimatedStatCard
            title="Stock Value"
            value={`৳${metrics?.totalStockValue?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || 0}`}
            trend="Total inventory worth"
            trendColor="text-slate-500"
            icon={<DollarSign className="w-4 h-4 text-orange-600" />}
            iconBg="bg-orange-50"
            delay={100}
          />
          <AnimatedStatCard
            title="Total Sales"
            value={`৳${metrics?.totalSales?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || 0}`}
            trend="Completed orders"
            trendColor="text-emerald-700"
            icon={<TrendingUp className="w-4 h-4 text-emerald-700" />}
            iconBg="bg-emerald-50"
            delay={200}
          />
          <AnimatedStatCard
            title="Total Orders"
            value={metrics?.totalOrders || 0}
            trend={`${metrics?.activeProducts || 0} active products`}
            trendColor="text-slate-500"
            icon={<ShoppingCart className="w-4 h-4 text-orange-600" />}
            iconBg="bg-orange-50"
            delay={300}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard title="Sales — last 7 days" className="col-span-1 lg:col-span-2" delay={400}>
            <div className="h-72 w-full">
              {salesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData} margin={{ top: 0, right: 0, left: 0, bottom: 20 }}>
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 13, fontWeight: 500 }}
                      dy={20}
                    />
                    <Tooltip
                      cursor={{ fill: "#f8fafc", radius: 8 }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                        padding: "10px 14px",
                      }}
                      formatter={(value) => [`৳${value.toLocaleString()}`, "Sales"]}
                    />
                    <Bar dataKey="sales" radius={[6, 6, 0, 0]} barSize={48} animationDuration={1200} animationBegin={500}>
                      {salesData.map((entry, index) => {
                        const isToday = new Date().toLocaleDateString("en-US", { weekday: "short" }) === entry.name;
                        return <Cell key={`cell-${index}`} fill={isToday ? "#d97706" : "#1f7564"} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  No sales data for the last 7 days.
                </div>
              )}
            </div>
          </ChartCard>

          <ChartCard title="Stock by category" delay={500}>
            {categoryData.length > 0 ? (
              <div className="flex items-center justify-between gap-4">
                <div className="w-1/2 h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        innerRadius={35}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                        animationDuration={1000}
                        animationBegin={600}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 10px rgb(0 0 0 / 0.1)" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-3">
                  {categoryData.map((cat, i) => (
                    <div key={i} className="flex items-start gap-2 group/item cursor-default">
                      <div className="w-3 h-3 rounded-[4px] shrink-0 mt-1 group-hover/item:scale-125 transition-transform duration-200" style={{ backgroundColor: cat.color }}></div>
                      <div className="text-[12px] font-semibold text-slate-900 leading-snug">
                        {cat.name}
                        <br />
                        <span className="text-slate-500 font-medium">{cat.value} units</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full h-36 flex items-center justify-center text-slate-400 text-sm">No category data available.</div>
            )}
          </ChartCard>

          <ChartCard title="Order status" delay={600}>
            {orderStatusData.length > 0 ? (
              <div className="flex items-center justify-between gap-4">
                <div className="w-1/2 h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        innerRadius={35}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                        animationDuration={1000}
                        animationBegin={700}
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 10px rgb(0 0 0 / 0.1)" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-3">
                  {orderStatusData.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 group/item cursor-default">
                      <div className="w-3 h-3 rounded-full shrink-0 mt-1 group-hover/item:scale-125 transition-transform duration-200" style={{ backgroundColor: s.color }}></div>
                      <div className="text-[12px] font-semibold text-slate-900 leading-snug">
                        {s.name}
                        <br />
                        <span className="text-slate-500 font-medium">{s.value} orders</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full h-36 flex items-center justify-center text-slate-400 text-sm">No order data available.</div>
            )}
          </ChartCard>

          {/* Recent Orders */}
          <ChartCard title="Recent orders" className="col-span-1 lg:col-span-3" delay={700}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100/80 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    <th className="pb-3 pr-4 w-1/3">PRODUCT</th>
                    <th className="pb-3 px-4 w-1/4">AMOUNT</th>
                    <th className="pb-3 px-4 w-1/4">STATUS</th>
                    <th className="pb-3 pl-4 w-1/6">DATE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50/50">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order, i) => (
                      <tr
                        key={i}
                        className="hover:bg-slate-50/60 transition-all duration-200 opacity-0 animate-[fadeSlideUp_0.4s_ease-out_forwards]"
                        style={{ animationDelay: `${800 + i * 80}ms` }}
                      >
                        <td className="py-4 pr-4 text-[13.5px] font-medium text-slate-800">{order.product}</td>
                        <td className="py-4 px-4 text-[13.5px] font-semibold text-slate-900">৳{order.amount.toLocaleString()}</td>
                        <td className="py-4 px-4"><OrderStatusBadge status={order.status} /></td>
                        <td className="py-4 pl-4 text-[13.5px] text-slate-600 font-medium">{order.date}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-400">No orders yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ChartCard title="Top products by revenue" delay={900}>
            <div className="h-64 w-full">
              {topProductsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProductsData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} tickFormatter={(v) => `৳${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} />
                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#334155", fontSize: 12, fontWeight: 500 }} width={110} />
                    <Tooltip
                      cursor={{ fill: "#f8fafc", radius: 6 }}
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)", padding: "10px 14px" }}
                      formatter={(value) => [`৳${value.toLocaleString()}`, "Revenue"]}
                    />
                    <Bar dataKey="revenue" radius={[0, 6, 6, 0]} barSize={28} animationDuration={1200} animationBegin={1000}>
                      {topProductsData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? "#d97706" : "#1f7564"} fillOpacity={1 - index * 0.12} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">No product revenue data.</div>
              )}
            </div>
          </ChartCard>

          <ChartCard title="Monthly sales trend" delay={1000}>
            <div className="h-64 w-full">
              {monthlySalesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlySalesData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#1f7564" />
                        <stop offset="100%" stopColor="#66b2a3" />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} tickFormatter={(v) => `৳${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} />
                    <Tooltip
                      cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }}
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)", padding: "10px 14px" }}
                      formatter={(value) => [`৳${value.toLocaleString()}`, "Sales"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="url(#lineGradient)"
                      strokeWidth={3}
                      dot={{ fill: "#1f7564", r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 7, fill: "#d97706", stroke: "#fff", strokeWidth: 2 }}
                      animationDuration={1500}
                      animationBegin={1100}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">No monthly sales data.</div>
              )}
            </div>
          </ChartCard>
        </div>
      </div>
    </>
  );
}

function OrderStatusBadge({ status }) {
  let classes = "bg-slate-100 text-slate-700";
  const s = status?.toLowerCase();
  if (s === "pending" || s === "matching") classes = "bg-[#fff7ed] text-[#ea580c]";
  else if (s === "processing" || s === "out for delivery") classes = "bg-[#ecfdf5] text-[#059669]";
  else if (s === "delivered" || s === "completed") classes = "bg-[#ecfdf5] text-[#059669]";
  else if (s === "cancelled") classes = "bg-red-50 text-red-600";

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 ${classes}`}>
      {status}
    </span>
  );
}
