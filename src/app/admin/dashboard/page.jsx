"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Bell,
  Settings,
  Search,
  Store,
  Boxes,
  Zap,
  CheckCircle2,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Toaster } from "sonner";

function Logo({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7l9-4 9 4-9 4-9-4z" />
      <path d="M3 12l9 4 9-4" />
      <path d="M3 17l9 4 9-4" />
    </svg>
  );
}

const navItems = [
  {
    label: "Overview",
    items: [{ name: "Dashboard", icon: LayoutDashboard, active: true }],
  },
  {
    label: "Management",
    items: [
      { name: "Users", icon: Users, count: "12" },
      { name: "Products", icon: Package },
      { name: "Demands & Orders", icon: ShoppingCart },
    ],
  },
  {
    label: "Insights",
    items: [
      { name: "Reports", icon: BarChart3 },
      { name: "Notifications", icon: Bell },
      { name: "Settings", icon: Settings },
    ],
  },
];

function initials(name) {
  return (name || "AD")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Sidebar({ userName }) {
  return (
    <aside className="flex w-[232px] shrink-0 flex-col bg-[#0b3d3a] px-4 py-[22px] text-white">
      <div className="flex items-center gap-2.5 px-1.5 pb-6">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#14958c]">
          <Logo className="h-[18px] w-[18px]" />
        </div>
        <div>
          <div className="font-heading text-[15px] font-bold leading-tight">TradeLink</div>
          <small className="text-[10px] font-medium tracking-[0.03em] text-[#d3ece9]">
            ADMIN CONSOLE
          </small>
        </div>
      </div>

      {navItems.map((group) => (
        <div key={group.label}>
          <div className="px-2.5 py-2 text-[10.5px] font-bold uppercase tracking-[0.06em] text-[#5c8a86]">
            {group.label}
          </div>
          {group.items.map((item) => (
            <div
              key={item.name}
              className={`mb-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-[13.5px] font-semibold ${
                item.active ? "bg-white/10 text-white" : "text-[#bcd9d6]"
              }`}
            >
              <item.icon
                className={`h-[17px] w-[17px] ${item.active ? "text-amber-500" : "text-[#8fb8b4]"}`}
                strokeWidth={1.8}
              />
              {item.name}
              {item.count && (
                <span className="ml-auto rounded-full bg-amber-500 px-[7px] py-0.5 text-[10px] font-bold text-white">
                  {item.count}
                </span>
              )}
            </div>
          ))}
        </div>
      ))}

      <div className="mt-auto flex items-center gap-2.5 border-t border-white/10 px-2.5 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-[12px] font-bold">
          {initials(userName)}
        </div>
        <div className="text-[12.5px] font-semibold leading-tight">
          {userName || "Admin"}
          <small className="block text-[10.5px] font-medium text-[#8fb8b4]">Super Admin</small>
        </div>
      </div>
    </aside>
  );
}

const stats = [
  { label: "Shop Owners", value: "2,148", delta: "▲ 6.4% this month", up: true, icon: Store, bg: "bg-teal-50", iconColor: "text-teal-700" },
  { label: "Stockholders", value: "614", delta: "▲ 3.1% this month", up: true, icon: Boxes, bg: "bg-amber-50", iconColor: "text-amber-600" },
  { label: "Active Demands", value: "387", delta: "▼ 1.2% this week", up: false, icon: Zap, bg: "bg-teal-50", iconColor: "text-teal-700" },
  { label: "Orders Today", value: "96", delta: "▲ 12 vs yesterday", up: true, icon: CheckCircle2, bg: "bg-green-50", iconColor: "text-green-700" },
  { label: "GMV (this month)", value: "৳18.4L", delta: "▲ 9.8% MoM", up: true, icon: TrendingUp, bg: "bg-amber-50", iconColor: "text-amber-600" },
];

const bars = [
  { day: "Mon", h: "58px", light: false },
  { day: "Tue", h: "74px", light: false },
  { day: "Wed", h: "66px", light: false },
  { day: "Thu", h: "96px", light: true },
  { day: "Fri", h: "82px", light: false },
  { day: "Sat", h: "110px", light: false },
  { day: "Sun", h: "90px", light: false },
];

const recentDemands = [
  { product: "Rice — Basmati, 50kg", shop: "Rahim General Store", location: "Mirpur-10", status: "Matching", badge: "amber" },
  { product: "Detergent Powder, 30 units", shop: "New Bazar Store", location: "Kazipara", status: "Out for delivery", badge: "teal" },
  { product: "Paracetamol, 200 strips", shop: "Green Life Pharmacy", location: "Dhanmondi", status: "Delivered", badge: "green" },
];

const badgeMap = {
  amber: "bg-amber-50 text-amber-600",
  teal: "bg-teal-50 text-teal-700",
  green: "bg-green-50 text-green-700",
};

const pendingVerifications = [
  { initials: "MK", name: "Manik Wholesale", role: "Stockholder" },
  { initials: "HR", name: "Hazi Rice House", role: "Stockholder" },
  { initials: "RS", name: "Rahim Store", role: "Shop Owner" },
];

const donutSegments = [
  { label: "Grocery — 42%", color: "#0f766e" },
  { label: "Pharmacy — 26%", color: "#d97706" },
  { label: "Hardware — 18%", color: "#6bbdb6" },
  { label: "Stationery — 14%", color: "#cbd5e1" },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace("/admin/login");
      } else {
        setUser(currentUser);
      }
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, [router]);

  async function handleLogout() {
    try {
      await signOut(auth);
      router.replace("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
          <p className="text-sm text-slate-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar userName={user.displayName} />

      <main className="flex flex-1 flex-col overflow-hidden bg-slate-50">
        <header className="flex h-[60px] shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-6">
          <div>
            <h2 className="font-heading text-[16.5px] font-bold text-slate-900">Dashboard</h2>
            <span className="text-[12px] font-medium text-slate-500">Wed, 2 Sep 2026</span>
          </div>

          <div className="ml-3 flex max-w-[340px] flex-1 items-center gap-2 rounded-lg bg-slate-100 px-3 py-2">
            <Search className="h-[15px] w-[15px] text-slate-400" />
            <input
              placeholder="Search users, orders, products..."
              className="w-full bg-transparent text-[13px] outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="ml-auto flex items-center gap-3.5">
            <div className="relative flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-slate-100">
              <Bell className="h-[17px] w-[17px] text-slate-700" />
              <span className="absolute right-1.5 top-1.5 h-[7px] w-[7px] rounded-full border-[1.5px] border-white bg-red-600" />
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-[12px] font-bold text-white">
              {initials(user.displayName)}
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[12.5px] font-semibold text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-5 overflow-auto p-6">
          <div className="flex shrink-0 gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex flex-1 flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-slate-500">{s.label}</span>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.bg}`}>
                    <s.icon className={`h-4 w-4 ${s.iconColor}`} strokeWidth={1.8} />
                  </div>
                </div>
                <div className="font-heading text-[26px] font-bold text-slate-900">{s.value}</div>
                <div className={`text-[11.5px] font-bold ${s.up ? "text-green-700" : "text-red-600"}`}>
                  {s.delta}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-1 gap-4">
            <div className="flex flex-1 flex-col gap-4">
              <div className="flex flex-1 flex-col gap-3.5 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-[14.5px] font-bold text-slate-900">
                    Order volume — last 7 days
                  </h3>
                  <span className="text-[12.5px] font-semibold text-teal-700">Export</span>
                </div>
                <div className="flex flex-1 items-end gap-3.5 pt-2.5">
                  {bars.map((b) => (
                    <div key={b.day} className="flex flex-1 flex-col items-center gap-2">
                      <div
                        className={`w-full max-w-[34px] rounded-b-[3px] rounded-t-[6px] ${
                          b.light
                            ? "bg-gradient-to-b from-amber-500 to-amber-600"
                            : "bg-gradient-to-b from-teal-600 to-teal-800"
                        }`}
                        style={{ height: b.h }}
                      />
                      <span className="text-[11px] font-semibold text-slate-500">{b.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-[14.5px] font-bold text-slate-900">Recent demands</h3>
                  <span className="text-[12.5px] font-semibold text-teal-700">See all</span>
                </div>
                <div className="overflow-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b-[1.5px] border-slate-200 bg-slate-50 text-left text-[11px] font-bold uppercase tracking-[0.03em] text-slate-500">
                        <th className="px-2.5 py-2">Product</th>
                        <th className="px-2.5 py-2">Shop</th>
                        <th className="px-2.5 py-2">Location</th>
                        <th className="px-2.5 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentDemands.map((r) => (
                        <tr key={r.product} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-2.5 py-3">{r.product}</td>
                          <td className="px-2.5 py-3">{r.shop}</td>
                          <td className="px-2.5 py-3">{r.location}</td>
                          <td className="px-2.5 py-3">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${badgeMap[r.badge]}`}>
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex w-[320px] flex-col gap-4">
              <div className="flex flex-1 flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="font-heading text-[14.5px] font-bold text-slate-900">
                  Pending verifications
                </h3>
                <div className="flex flex-col gap-1">
                  {pendingVerifications.map((p, i) => (
                    <div key={p.name}>
                      {i > 0 && <hr className="border-slate-200" />}
                      <div className="flex items-center justify-between py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-[12px] font-bold text-teal-700">
                            {p.initials}
                          </div>
                          <div>
                            <div className="text-[12.5px] font-bold text-slate-900">{p.name}</div>
                            <div className="text-[11px] text-slate-500">{p.role}</div>
                          </div>
                        </div>
                        <button className="rounded-md border-[1.5px] border-teal-700 bg-white px-3 py-1.5 text-[12.5px] font-semibold text-teal-700 hover:bg-teal-50">
                          Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="font-heading text-[14.5px] font-bold text-slate-900">Category share</h3>
                <div className="flex items-center gap-5">
                  <div
                    className="h-[118px] w-[118px] shrink-0 rounded-full"
                    style={{
                      background:
                        "conic-gradient(#0f766e 0 42%, #d97706 42% 68%, #6bbdb6 68% 86%, #cbd5e1 86% 100%)",
                    }}
                  />
                  <div className="flex flex-col gap-2">
                    {donutSegments.map((d) => (
                      <div
                        key={d.label}
                        className="flex items-center gap-2 text-[12.5px] font-semibold text-slate-700"
                      >
                        <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: d.color }} />
                        {d.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Toaster position="top-center" richColors />
    </div>
  );
}
