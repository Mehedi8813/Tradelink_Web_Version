"use client";

import { useRouter, usePathname } from "next/navigation";
import { LogOut, Package, LayoutDashboard, Database, Settings, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function StockholderLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("tradelink_web_user");
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.role !== "supplier") {
        router.push("/login");
      } else {
        setUser(parsed);
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("tradelink_web_user");
    toast.success("Logged out successfully");
    router.push("/login");
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl">
        <div className="p-6 pb-4 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Database className="h-5 w-5 text-emerald-400" />
            Supplier Portal
          </h2>
          <p className="text-xs font-medium text-slate-400 mt-1 truncate">{user.business_name}</p>
        </div>
        
        <nav className="flex-1 px-4 mt-6 space-y-1">
          <a
            href="/stockholder/dashboard/home"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${
              pathname === "/stockholder/dashboard/home"
                ? "bg-emerald-500/10 text-emerald-400"
                : "hover:bg-white/5 hover:text-white"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </a>
          <a
            href="/stockholder/dashboard/inventory"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${
              pathname === "/stockholder/dashboard/inventory"
                ? "bg-emerald-500/10 text-emerald-400"
                : "hover:bg-white/5 hover:text-white"
            }`}
          >
            <Package className="h-4 w-4" />
            Inventory
          </a>
          <a
            href="/stockholder/dashboard/orders"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${
              pathname === "/stockholder/dashboard/orders"
                ? "bg-emerald-500/10 text-emerald-400"
                : "hover:bg-white/5 hover:text-white"
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            Orders
          </a>
          <a
            href="/stockholder/dashboard/settings"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${
              pathname === "/stockholder/dashboard/settings"
                ? "bg-emerald-500/10 text-emerald-400"
                : "hover:bg-white/5 hover:text-white"
            }`}
          >
            <Settings className="h-4 w-4" />
            Settings
          </a>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 py-2.5 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-colors font-medium text-sm"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
