"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, Store, Package } from "lucide-react";
import { toast, Toaster } from "sonner";
import { supabase } from "@/lib/supabase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

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

export default function LoginPage() {
  const router = useRouter();

  const [role, setRole] = useState("admin"); // 'admin' | 'shop_owner' | 'supplier'
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [keepMeSignedIn, setKeepMeSignedIn] = useState(false);
  
  // 2FA States removed by user request

  async function handleForgotPassword() {
    if (role !== "admin") {
      toast.info("Please contact the system administrator to reset your password.");
      return;
    }

    if (!identifier) {
      toast.error("Please enter your admin email address first.");
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, identifier);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Check local session for active dashboard routing
    const data = localStorage.getItem("tradelink_web_user");
    if (data) {
      const user = JSON.parse(data);
      if (user.role === "shop_owner") router.push("/shop-owner/dashboard");
      else if (user.role === "supplier") router.push("/stockholder/dashboard");
    }
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!identifier || !password) {
      toast.error(
        `Please enter your ${
          role === "admin" ? "email" : "phone number"
        } and password.`
      );
      return;
    }

    setLoading(true);

    try {
      if (role === "admin") {
        // Firebase Auth for Admin
        await signInWithEmailAndPassword(auth, identifier, password);
        const user = auth.currentUser;
        
        toast.success("Admin logged in successfully!");
        setTimeout(() => router.push("/admin/dashboard"), 300);
      } else {
        // Supabase Auth for Shop Owner & Supplier using phone & password_hash
        const hashedPw = await hashPassword(password);

        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("phone_number", identifier)
          .eq("password_hash", hashedPw)
          .eq("role", role)
          .single();

        if (error || !data) {
          throw new Error("Invalid credentials.");
        }

        if (data.is_suspended) {
          throw new Error("Your account has been suspended by the administrator. Please contact support.");
        }

        // Store user in local storage for simple web dashboard session
        localStorage.setItem("tradelink_web_user", JSON.stringify(data));

        const roleDisplay = role === "shop_owner" ? "Shop Owner" : "Supplier";
        toast.success(`${roleDisplay} logged in successfully!`);
        
        setTimeout(() => {
          if (role === "shop_owner") router.push("/shop-owner/dashboard");
          else router.push("/stockholder/dashboard");
        }, 300);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  }



  const roleConfig = {
    admin: {
      title: "TradeLink Admin Console",
      desc: "Manage users, catalogs, and oversee platform activity.",
      labelId: "Email address",
      placeholderId: "admin@tradelink.com.bd",
      typeId: "email",
    },
    shop_owner: {
      title: "Retailer Portal",
      desc: "View your buying details, order history, and supplier insights.",
      labelId: "Phone Number",
      placeholderId: "e.g. 01560016744",
      typeId: "tel",
    },
    supplier: {
      title: "Stockholder Portal",
      desc: "Manage massive inventory and upload bulk CSV catalogs.",
      labelId: "Phone Number",
      placeholderId: "e.g. 01642425701",
      typeId: "tel",
    },
  };

  const currentConfig = roleConfig[role];

  const [systemSettings, setSystemSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('system_settings').select('*').eq('id', 1).single();
      if (data) setSystemSettings(data);
    };
    fetchSettings();
  }, []);

  const isMaintenance = systemSettings && role !== "admin" && (
    systemSettings.maintenance_mode_web_all || 
    (role === "supplier" && systemSettings.maintenance_mode_web_supplier) ||
    (role === "shop_owner" && systemSettings.maintenance_mode_web_shop_owner)
  );

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Left Side */}
      <div className="relative hidden w-1/2 flex-col justify-center bg-[#136353] p-12 text-white md:flex lg:p-20 overflow-hidden transition-all duration-300">
        <div className="absolute -bottom-24 -right-24 h-[400px] w-[400px] rounded-full border-[1.5px] border-white/10" />
        <div className="absolute -top-32 -left-12 h-[300px] w-[300px] rounded-full border border-white/5" />

        <div className="relative z-10 max-w-lg">
          <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
            <TradeLinkLogo className="h-8 w-8 text-white" />
          </div>

          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-white lg:text-5xl">
            {currentConfig.title}
          </h1>

          <p className="text-lg leading-relaxed text-[#9dc9c2]">
            {currentConfig.desc}
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex w-full flex-col justify-center p-8 md:w-1/2 lg:p-20">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-10 flex gap-2 rounded-lg bg-slate-100 p-1">
            <button
              onClick={() => {
                setRole("admin");
                setIdentifier("");
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-all ${
                role === "admin"
                  ? "bg-white text-[#136353] shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <ShieldCheck className="h-4 w-4" /> Admin
            </button>
            <button
              onClick={() => {
                setRole("shop_owner");
                setIdentifier("");
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-all ${
                role === "shop_owner"
                  ? "bg-white text-[#136353] shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Store className="h-4 w-4" /> Retailer
            </button>
            <button
              onClick={() => {
                setRole("supplier");
                setIdentifier("");
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-all ${
                role === "supplier"
                  ? "bg-white text-[#136353] shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Package className="h-4 w-4" /> Supplier
            </button>
          </div>

          {isMaintenance ? (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full bg-amber-100 animate-ping opacity-75"></div>
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
                  <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
                </div>
              </div>
              <h2 className="mb-2 text-2xl font-bold text-slate-900">Under Maintenance</h2>
              <p className="text-base text-slate-500 max-w-[280px]">
                The {role === "shop_owner" ? "Retailer" : "Supplier"} portal is currently undergoing scheduled maintenance. Please check back later.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-10">
                <h2 className="mb-2 text-3xl font-bold text-slate-900">Sign in</h2>
                <p className="text-base text-slate-500">
                  Use your {role === "admin" ? "administrator" : role === "shop_owner" ? "retailer" : "supplier"} credentials
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">
                    {currentConfig.labelId}
                  </label>
                  <input
                    type={currentConfig.typeId}
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={currentConfig.placeholderId}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#136353] focus:outline-none focus:ring-1 focus:ring-[#136353] transition-shadow"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#136353] focus:outline-none focus:ring-1 focus:ring-[#136353] transition-shadow"
                  />
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={keepMeSignedIn}
                      onChange={(e) => setKeepMeSignedIn(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-[#136353] focus:ring-[#136353]"
                    />
                    <span className="text-sm text-slate-600">
                      Keep me signed in
                    </span>
                  </label>
                  {role === "admin" && (
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm font-semibold text-[#136353] hover:text-[#0f4f42]"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 flex w-full items-center justify-center rounded-xl bg-[#136353] py-3.5 text-base font-semibold text-white transition-all hover:bg-[#0f4f42] hover:shadow-lg hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:transform-none disabled:shadow-none"
                >
                  {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  Log in to Portal
                </button>
              </form>

              {role === "admin" && (
                <div className="mt-8 text-center">
                  <p className="text-sm text-slate-500">
                    First time setting up the system?{" "}
                    <a href="/admin/register" className="font-semibold text-[#136353] hover:underline">
                      Register Master Admin
                    </a>
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Toaster position="top-center" richColors />
    </div>
  );
}
