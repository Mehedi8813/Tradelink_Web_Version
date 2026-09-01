"use client";

import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Users, Settings, Activity, FileText } from "lucide-react";
import { toast } from "sonner";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await signOut(auth);
    toast.success("Logged out successfully");
    router.push("/login");
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-[#136353] text-white flex flex-col shadow-xl">
        <div className="p-6 pb-2">
          <h2 className="text-xl font-bold tracking-tight">TradeLink</h2>
          <span className="text-xs font-semibold text-[#8ebbb2] uppercase tracking-wider">Admin Portal</span>
        </div>
        
        <nav className="flex-1 px-4 mt-8 space-y-1 overflow-y-auto">
          <a 
            href="/admin/dashboard" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              pathname === "/admin/dashboard"
                ? "bg-white/10 text-white" 
                : "text-[#9dc9c2] hover:bg-white/5 hover:text-white"
            }`}
          >
            <Activity className="h-5 w-5" />
            Dashboard
          </a>
          <a 
            href="/admin/dashboard/users" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              pathname === "/admin/dashboard/users"
                ? "bg-white/10 text-white" 
                : "text-[#9dc9c2] hover:bg-white/5 hover:text-white"
            }`}
          >
            <Users className="h-5 w-5" />
            User Management
          </a>
          <a 
            href="/admin/dashboard/report" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              pathname === "/admin/dashboard/report"
                ? "bg-white/10 text-white" 
                : "text-[#9dc9c2] hover:bg-white/5 hover:text-white"
            }`}
          >
            <FileText className="h-5 w-5" />
            Reports
          </a>
          <a 
            href="/admin/dashboard/settings" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              pathname === "/admin/dashboard/settings"
                ? "bg-white/10 text-white" 
                : "text-[#9dc9c2] hover:bg-white/5 hover:text-white"
            }`}
          >
            <Settings className="h-5 w-5" />
            System Settings
          </a>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 py-2.5 rounded-lg text-white hover:bg-red-500/20 hover:text-red-300 transition-colors font-medium text-sm"
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
