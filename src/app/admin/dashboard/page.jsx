"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        console.log(
          "Firebase current user:",
          currentUser
        );

        if (!currentUser) {
          setUser(null);
          setCheckingAuth(false);

          router.replace("/admin/login");
          return;
        }

        setUser(currentUser);
        setCheckingAuth(false);
      }
    );

    return () => unsubscribe();
  }, [router]);

  // ==============================
  // LOADING
  // ==============================

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-teal-700" />

          <p className="text-sm text-slate-500">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // ==============================
  // NO USER
  // ==============================

  if (!user) {
    return null;
  }

  // ==============================
  // DASHBOARD
  // ==============================

  async function handleLogout() {
    try {
      await signOut(auth);

      router.replace("/admin/login");
      router.refresh();
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Navbar */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div>
            <h1 className="text-xl font-bold text-slate-900">
              TradeLink Admin
            </h1>

            <p className="text-sm text-slate-500">
              Admin Dashboard
            </p>
          </div>

          <div className="flex items-center gap-4">

            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800">
                {user.displayName ||
                  "Administrator"}
              </p>

              <p className="text-xs text-slate-500">
                {user.email}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="
                rounded-lg
                bg-red-500
                px-4
                py-2
                text-sm
                font-semibold
                text-white
                hover:bg-red-600
              "
            >
              Logout
            </button>

          </div>

        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-6 py-8">

        <div className="rounded-xl bg-white p-8 shadow-sm">

          <h2 className="text-2xl font-bold text-slate-900">
            Welcome to Admin Dashboard
          </h2>

          <p className="mt-2 text-slate-500">
            You are successfully authenticated.
          </p>

          <div className="mt-6 rounded-lg bg-teal-50 p-4">
            <p className="text-sm text-teal-800">
              Logged in as:
            </p>

            <p className="mt-1 font-semibold text-teal-900">
              {user.email}
            </p>
          </div>

        </div>

      </main>

    </div>
  );
}