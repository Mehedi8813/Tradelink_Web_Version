"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import { toast, Toaster } from "sonner";
import { supabase } from "@/lib/supabase";

function TradeLinkLogo({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

async function hashPassword(password) {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function AdminRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      toast.success("Admin registered successfully!");
      setTimeout(() => {
        router.push("/login");
      }, 1000);

    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to register admin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-[20px] bg-white p-8 shadow-xl sm:p-12">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#136353] shadow-md">
            <TradeLinkLogo className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Registration</h1>
          <p className="mt-2 text-sm text-slate-500">
            Create the primary administrator account for TradeLink.
          </p>
        </div>

        <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 p-4">
          <div className="flex items-start gap-3 text-amber-800">
            <ShieldAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
            <p className="text-xs font-medium leading-relaxed">
              <strong>Security Restriction:</strong> Only <strong>one</strong> admin account can exist in the system at any given time. Subsequent registration attempts will be blocked.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@tradelink.com.bd"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#136353] focus:outline-none focus:ring-1 focus:ring-[#136353] transition-shadow"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Master Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#136353] focus:outline-none focus:ring-1 focus:ring-[#136353] transition-shadow"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center rounded-xl bg-[#136353] py-3.5 text-base font-semibold text-white transition-all hover:bg-[#0f4f42] hover:shadow-lg hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:transform-none disabled:shadow-none"
          >
            {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Register Admin
          </button>
        </form>

        <div className="mt-8 text-center">
          <a href="/login" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
            Return to login portal
          </a>
        </div>
      </div>
      <Toaster position="top-center" richColors />
    </div>
  );
}
