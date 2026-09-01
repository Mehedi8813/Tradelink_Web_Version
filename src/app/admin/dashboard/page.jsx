"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Home, Hexagon, Plus, Check, DollarSign } from "lucide-react";
import { Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

export default function MetricsDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [recentDemands, setRecentDemands] = useState([]);
  const [orderVolumeData, setOrderVolumeData] = useState([]);
  const [categoryShareData, setCategoryShareData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      // Fetch users
      const { data: users } = await supabase.from("users").select("role, category, full_name");
      // Fetch orders
      const { data: orders } = await supabase.from("orders").select("product_name, shop_owner_id, delivery_address, status, total_amount, created_at").order("created_at", { ascending: false });

      if (users && orders) {
        
        // 1. Basic Stats
        const shopOwners = users.filter(u => u.role === "shop_owner").length;
        const suppliers = users.filter(u => u.role === "supplier").length;
        const activeDemands = orders.filter(o => o.status === "pending" || o.status === "processing" || o.status === "matching").length;
        
        const today = new Date();
        const ordersToday = orders.filter(o => {
           const orderDate = new Date(o.created_at);
           return orderDate.getDate() === today.getDate() && orderDate.getMonth() === today.getMonth() && orderDate.getFullYear() === today.getFullYear();
        }).length;
        
        const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);
        
        setMetrics({ shopOwners, suppliers, activeDemands, ordersToday, gmv: totalRevenue });
        
        // 2. Recent Demands (Top 5)
        setRecentDemands(orders.slice(0, 5).map(o => ({
          product: o.product_name || "Unknown Product",
          shop: "Store #" + String(o.shop_owner_id).substring(0, 4), 
          location: o.delivery_address || "Unknown Location",
          status: o.status || "Pending"
        })));

        // 3. Order Volume (Last 7 Days)
        const last7Days = Array.from({length: 7}, (_, i) => {
          const d = new Date(today);
          d.setDate(d.getDate() - (6 - i));
          return d;
        });
        
        const volumeData = last7Days.map(d => {
          const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
          const count = orders.filter(o => {
            const od = new Date(o.created_at);
            return od.getDate() === d.getDate() && od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
          }).length;
          return { name: dayName, orders: count };
        });
        setOrderVolumeData(volumeData);

        // 4. Category Share Pie Chart
        const shopOwnerUsers = users.filter(u => u.role === "shop_owner");
        const categoryCounts = {};
        shopOwnerUsers.forEach(u => {
          const cat = u.category || "Uncategorized";
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });
        
        const totalShopOwners = shopOwnerUsers.length || 1;
        const colors = ["#1f7564", "#d97706", "#66b2a3", "#cbd5e1", "#8b5cf6", "#f43f5e"];
        const shareData = Object.entries(categoryCounts)
          .sort((a, b) => b[1] - a[1]) // sort highest to lowest
          .map(([name, count], index) => ({
            name,
            value: Math.round((count / totalShopOwners) * 100),
            color: colors[index % colors.length]
        }));
        setCategoryShareData(shareData);

      }
      setLoading(false);
    }
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#136353]" />
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      
      {/* 5 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard 
          title="Shop Owners" 
          value={metrics?.shopOwners || 0} 
          trend="▲ Total count" 
          trendColor="text-emerald-700" 
          icon={<Home className="w-4 h-4 text-emerald-700" />} 
          iconBg="bg-emerald-50" 
        />
        <StatCard 
          title="Stockholders" 
          value={metrics?.suppliers || 0} 
          trend="▲ Total count" 
          trendColor="text-emerald-700" 
          icon={<Hexagon className="w-4 h-4 text-orange-600" />} 
          iconBg="bg-orange-50" 
        />
        <StatCard 
          title="Active Demands" 
          value={metrics?.activeDemands || 0} 
          trend="Currently processing" 
          trendColor="text-slate-500" 
          icon={<Plus className="w-4 h-4 text-emerald-700" />} 
          iconBg="bg-emerald-50" 
        />
        <StatCard 
          title="Orders Today" 
          value={metrics?.ordersToday || 0} 
          trend="Last 24 hours" 
          trendColor="text-slate-500" 
          icon={<Check className="w-4 h-4 text-emerald-700" />} 
          iconBg="bg-emerald-50" 
        />
        <StatCard 
          title="GMV (Total)" 
          value={`৳${metrics?.gmv?.toLocaleString() || 0}`} 
          trend="Gross Merchandise Value" 
          trendColor="text-slate-500" 
          icon={<DollarSign className="w-4 h-4 text-orange-600" />} 
          iconBg="bg-orange-50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bar Chart */}
        <div className="col-span-1 lg:col-span-3 bg-white p-6 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Order volume — last 7 days</h3>
            <button className="text-sm font-semibold text-[#1f7564] hover:underline">Export</button>
          </div>
          <div className="h-64 w-full">
            {orderVolumeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orderVolumeData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 500}} dy={15} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="orders" radius={[6, 6, 6, 6]} barSize={48}>
                    {orderVolumeData.map((entry, index) => {
                       // Highlight today's bar in orange
                       const isToday = new Date().toLocaleDateString("en-US", { weekday: "short" }) === entry.name;
                       return <Cell key={`cell-${index}`} fill={isToday ? '#d97706' : '#1f7564'} />
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">No order data available for the last 7 days.</div>
            )}
          </div>
        </div>

        {/* Recent Demands Table */}
        <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Recent demands</h3>
            <button className="text-sm font-semibold text-[#1f7564] hover:underline">See all</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100/80 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  <th className="pb-3 pr-4 w-1/3">PRODUCT</th>
                  <th className="pb-3 px-4 w-1/4">SHOP</th>
                  <th className="pb-3 px-4 w-1/4">LOCATION</th>
                  <th className="pb-3 pl-4 w-1/6">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50/50">
                {recentDemands.length > 0 ? recentDemands.map((demand, i) => (
                  <DemandRow key={i} product={demand.product} shop={demand.shop} location={demand.location} status={demand.status} />
                )) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-400">No recent demands found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Share Pie Chart */}
        <div className="col-span-1 bg-white p-6 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-8">Category share</h3>
          {categoryShareData.length > 0 ? (
            <div className="flex items-center justify-between gap-4">
              <div className="w-1/2 h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryShareData}
                      innerRadius={35}
                      outerRadius={65}
                      paddingAngle={0}
                      dataKey="value"
                      stroke="none"
                    >
                      {categoryShareData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-4">
                {categoryShareData.map((cat, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-[3px] shrink-0 mt-1" style={{ backgroundColor: cat.color }}></div>
                    <div className="text-[13px] font-semibold text-slate-900 leading-snug">
                      {cat.name} — <br/>
                      <span className="text-slate-500 font-medium">{cat.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
             <div className="w-full h-36 flex items-center justify-center text-slate-400 text-sm">No category data available.</div>
          )}
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, trend, trendColor, icon, iconBg }) {
  return (
    <div className="bg-white p-5 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between hover:-translate-y-0.5 transition-transform duration-300">
      <div className="flex justify-between items-start mb-6">
        <h4 className="text-[13px] font-bold text-slate-500 tracking-wide">{title}</h4>
        <div className={`p-2 rounded-xl ${iconBg}`}>
          {icon}
        </div>
      </div>
      <div>
        <h2 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">{value}</h2>
        <p className={`text-[12px] font-bold mt-2.5 ${trendColor}`}>{trend}</p>
      </div>
    </div>
  );
}

function DemandRow({ product, shop, location, status }) {
  let badgeClasses = "bg-slate-100 text-slate-700";
  let statusText = status;
  
  if (status?.toLowerCase() === "matching" || status?.toLowerCase() === "pending") {
    badgeClasses = "bg-[#fff7ed] text-[#ea580c]"; 
  } else if (status?.toLowerCase() === "out for delivery" || status?.toLowerCase() === "processing") {
    badgeClasses = "bg-[#ecfdf5] text-[#059669]"; 
  } else if (status?.toLowerCase() === "delivered") {
    badgeClasses = "bg-transparent text-[#059669] px-0"; 
  }

  return (
    <tr className="hover:bg-slate-50/40 transition-colors group">
      <td className="py-4 pr-4">
        <span className="text-[13.5px] font-medium text-slate-800">{product}</span>
      </td>
      <td className="py-4 px-4 text-[13.5px] text-slate-600 font-medium">{shop}</td>
      <td className="py-4 px-4 text-[13.5px] text-slate-600 font-medium">{location}</td>
      <td className="py-4 pl-4">
        <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${badgeClasses}`}>
          {statusText}
        </span>
      </td>
    </tr>
  );
}
