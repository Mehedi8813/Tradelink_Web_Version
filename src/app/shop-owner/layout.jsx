"use client";

import { useRouter } from "next/navigation";
import { LogOut, ShoppingBag, Store, FileText } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function ShopOwnerLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("tradelink_web_user");
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.role !== "shop_owner") {
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
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        <div className="p-6 pb-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Store className="h-5 w-5 text-[#136353]" />
            Retailer Portal
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-1 truncate">{user.business_name}</p>
        </div>
        
        <nav className="flex-1 px-4 mt-6 space-y-1">
          <a href="/shop-owner/dashboard" className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-blue-50 text-blue-700 font-medium">
            <ShoppingBag className="h-4 w-4" />
            Buying Details
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium transition-colors">
            <FileText className="h-4 w-4" />
            Invoices
          </a>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 py-2.5 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors font-medium text-sm"
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
