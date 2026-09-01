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

export default function ShopOwnerHomePage() {
  const [metrics, setMetrics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [spendData, setSpendData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [topProductsData, setTopProductsData] = useState([]);
  const [monthlySpendData, setMonthlySpendData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const userStr = localStorage.getItem("tradelink_web_user");
      if (!userStr) {
        setLoading(false);
        return;
      }
      const user = JSON.parse(userStr);

      const { data: orders, error: ordErr } = await supabase
        .from("orders")
        .select("id, product_name, total_amount, status, created_at, supplier_id")
        .eq("shop_owner_id", user.id)
        .order("created_at", { ascending: false });

      if (ordErr) console.error("Orders fetch error:", ordErr);

      const ords = orders || [];

      const totalPurchases = ords.length;
      const totalSpend = ords
        .filter((o) => o.status === "delivered" || o.status === "completed")
        .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
      const activeOrders = ords.filter((o) => ["pending", "processing", "matching", "out for delivery"].includes(o.status?.toLowerCase())).length;

      // Unique suppliers count
      const suppliers = new Set(ords.map(o => o.supplier_id).filter(Boolean));
      const uniqueSuppliers = suppliers.size;

      setMetrics({ totalPurchases, totalSpend, activeOrders, uniqueSuppliers });

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

      const spendByDay = last7Days.map((d) => {
        const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
        const dayTotal = ords
          .filter((o) => {
            const od = new Date(o.created_at);
            return od.getDate() === d.getDate() && od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
          })
          .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
        return { name: dayName, spend: dayTotal };
      });
      setSpendData(spendByDay);

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

      const productSpend = {};
      ords.forEach((o) => {
        const name = o.product_name || "Unknown";
        productSpend[name] = (productSpend[name] || 0) + (Number(o.total_amount) || 0);
      });
      const topProducts = Object.entries(productSpend)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, spend]) => ({
          name: name.length > 15 ? name.substring(0, 15) + "..." : name,
          spend,
        }));
      setTopProductsData(topProducts);

      const monthlySpend = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today);
        d.setMonth(d.getMonth() - i);
        const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        monthlySpend[key] = 0;
      }
      ords.forEach((o) => {
        const od = new Date(o.created_at);
        const key = od.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        if (key in monthlySpend) monthlySpend[key] += Number(o.total_amount) || 0;
      });
      setMonthlySpendData(Object.entries(monthlySpend).map(([name, spend]) => ({ name, spend })));

      setLoading(false);
    }
    fetchData();
  }, []);

  function downloadCSV() {
    if (!metrics) return;
    const userStr = localStorage.getItem("tradelink_web_user");
    const user = userStr ? JSON.parse(userStr) : {};
    const rows = [
      ["Metric", "Value"],
      ["Business Name", user.business_name || ""],
      ["Total Purchases", metrics.totalPurchases],
      ["Total Spend (৳)", metrics.totalSpend.toFixed(2)],
      ["Active Orders", metrics.activeOrders],
      ["Unique Suppliers", metrics.uniqueSuppliers],
      [],
      ["Recent Purchases"],
      ["Product", "Amount (৳)", "Status", "Date"],
      ...recentOrders.map((o) => [o.product, o.amount.toFixed(2), o.status, o.date]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `retailer-report-${new Date().toISOString().slice(0, 10)}.csv`;
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
      `}</style>

      <div className="p-8 bg-gradient-to-br from-slate-50 via-slate-50 to-emerald-50/30 min-h-screen font-sans">
        {/* Header */}
        <div
          className="flex items-center justify-between mb-8 opacity-0 animate-[fadeSlideUp_0.6s_ease-out_forwards]"
        >
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Retailer Dashboard</h1>
            <p className="mt-1.5 text-sm text-slate-500 font-medium">Overview of your purchasing and spending trends.</p>
          </div>
          <button
            onClick={downloadCSV}
            className="group flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#136353] to-[#1a7d6a] px-5 py-3 text-sm font-semibold text-white hover:from-[#0f5043] hover:to-[#136353] transition-all duration-300 shadow-lg shadow-emerald-900/20 hover:shadow-xl hover:shadow-emerald-900/30 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Download className="h-4 w-4 group-hover:animate-bounce" />
            Download CSV
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <AnimatedStatCard
            title="Total Spend"
            value={`৳${metrics?.totalSpend?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || 0}`}
            trend="Completed purchases"
            trendColor="text-emerald-700"
            icon={<DollarSign className="w-4 h-4 text-emerald-700" />}
            iconBg="bg-emerald-50"
            delay={0}
          />
          <AnimatedStatCard
            title="Total Purchases"
            value={metrics?.totalPurchases || 0}
            trend="All time orders"
            trendColor="text-slate-500"
            icon={<Package className="w-4 h-4 text-orange-600" />}
            iconBg="bg-orange-50"
            delay={100}
          />
          <AnimatedStatCard
            title="Active Orders"
            value={metrics?.activeOrders || 0}
            trend="Pending & Processing"
            trendColor="text-amber-600"
            icon={<ShoppingCart className="w-4 h-4 text-emerald-700" />}
            iconBg="bg-emerald-50"
            delay={200}
          />
          <AnimatedStatCard
            title="Unique Suppliers"
            value={metrics?.uniqueSuppliers || 0}
            trend="Wholesalers connected"
            trendColor="text-slate-500"
            icon={<TrendingUp className="w-4 h-4 text-orange-600" />}
            iconBg="bg-orange-50"
            delay={300}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard title="Spending — last 7 days" className="col-span-1 lg:col-span-2" delay={400}>
            <div className="h-72 w-full">
              {spendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={spendData} margin={{ top: 0, right: 0, left: 0, bottom: 20 }}>
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
                      formatter={(value) => [`৳${value.toLocaleString()}`, "Spend"]}
                    />
                    <Bar dataKey="spend" radius={[6, 6, 0, 0]} barSize={48} animationDuration={1200} animationBegin={500}>
                      {spendData.map((entry, index) => {
                        const isToday = new Date().toLocaleDateString("en-US", { weekday: "short" }) === entry.name;
                        return <Cell key={`cell-${index}`} fill={isToday ? "#d97706" : "#1f7564"} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  No spending data for the last 7 days.
                </div>
              )}
            </div>
          </ChartCard>

          <ChartCard title="Order status" delay={500}>
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
                        animationBegin={600}
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
          <ChartCard title="Recent purchases" className="col-span-1 lg:col-span-3" delay={700}>
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
                      <td colSpan="4" className="py-8 text-center text-slate-400">No purchases yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ChartCard title="Top products by spend" delay={900}>
            <div className="h-64 w-full">
              {topProductsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProductsData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} tickFormatter={(v) => `৳${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} />
                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#334155", fontSize: 12, fontWeight: 500 }} width={110} />
                    <Tooltip
                      cursor={{ fill: "#f8fafc", radius: 6 }}
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)", padding: "10px 14px" }}
                      formatter={(value) => [`৳${value.toLocaleString()}`, "Spend"]}
                    />
                    <Bar dataKey="spend" radius={[0, 6, 6, 0]} barSize={28} animationDuration={1200} animationBegin={1000}>
                      {topProductsData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? "#d97706" : "#1f7564"} fillOpacity={1 - index * 0.12} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">No product spend data.</div>
              )}
            </div>
          </ChartCard>

          <ChartCard title="Monthly spending trend" delay={1000}>
            <div className="h-64 w-full">
              {monthlySpendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlySpendData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
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
                      formatter={(value) => [`৳${value.toLocaleString()}`, "Spend"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="spend"
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
                <div className="w-full h-full flex items-center justify-center text-slate-400">No monthly spend data.</div>
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
