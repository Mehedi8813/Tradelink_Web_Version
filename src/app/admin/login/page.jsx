"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";

function TradeLinkLogo({ className = "" }) {
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

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [error, setError] = useState("");

  const [isSignUp, setIsSignUp] = useState(false);

  // ==============================
  // EMAIL / PASSWORD LOGIN
  // ==============================
  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      const message = "Please enter your email and password.";
      setError(message);
      toast.error(message);
      return;
    }

    setLoading(true);

    try {
      let userCredential;

      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
      } else {
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      }

      const user = userCredential.user;

      // ==============================
      // SAVE ADMIN SESSION
      // ==============================
      try {
        await setDoc(
          doc(db, "adminSessions", user.uid),
          {
            uid: user.uid,
            email: user.email,
            name: user.displayName || "",
            provider: "email",
            lastLoginAt: serverTimestamp(),
          },
          {
            merge: true,
          }
        );
      } catch (firestoreError) {
        console.error(
          "Failed to save admin session:",
          firestoreError
        );
      }

      // ==============================
      // SAVE ADMIN TO SUPABASE
      // ==============================
      try {
        await supabase
          .from("admins")
          .upsert(
            {
              uid: user.uid,
              email: user.email,
              name: user.displayName || "",
              provider: "email",
              auth_id: user.uid,
            },
            { onConflict: "email" }
          );
      } catch (supabaseError) {
        console.error(
          "Failed to save admin to Supabase:",
          supabaseError
        );
      }

      // ==============================
      // SUCCESS
      // ==============================
      toast.success(
        isSignUp
          ? "Admin account created successfully!"
          : "Logged in successfully!"
      );

      /*
       * Firebase authentication is already completed.
       * Give Firebase a moment to persist the auth state,
       * then navigate to dashboard.
       */
      setTimeout(() => {
        router.replace("/admin/dashboard");
        router.refresh();
      }, 300);
    } catch (err) {
      console.error("Firebase authentication error:", err);

      let message =
        "Unable to sign in. Please check your credentials.";

      switch (err.code) {
        case "auth/user-not-found":
          message = "No account found with this email.";
          break;

        case "auth/wrong-password":
          message = "Invalid email or password.";
          break;

        case "auth/invalid-credential":
          message = "Invalid email or password.";
          break;

        case "auth/invalid-email":
          message = "Please enter a valid email address.";
          break;

        case "auth/email-already-in-use":
          message =
            "An account with this email already exists. Please sign in.";
          break;

        case "auth/weak-password":
          message =
            "Password should be at least 6 characters.";
          break;

        case "auth/too-many-requests":
          message =
            "Too many failed attempts. Please try again later.";
          break;

        case "auth/network-request-failed":
          message =
            "Network error. Please check your internet connection.";
          break;

        case "auth/operation-not-allowed":
          message =
            "Email/password authentication is not enabled in Firebase.";
          break;

        default:
          message =
            err.message || "Authentication failed. Please try again.";
      }

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  // ==============================
  // GOOGLE LOGIN
  // ==============================
  async function handleGoogleSignIn() {
    setError("");
    setGoogleLoading(true);

    try {
      const provider = new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account",
      });

      const userCredential = await signInWithPopup(
        auth,
        provider
      );

      const user = userCredential.user;

      // ==============================
      // SAVE ADMIN SESSION
      // ==============================
      try {
        await setDoc(
          doc(db, "adminSessions", user.uid),
          {
            uid: user.uid,
            email: user.email,
            name: user.displayName || "",
            photoURL: user.photoURL || "",
            provider: "google",
            lastLoginAt: serverTimestamp(),
          },
          {
            merge: true,
          }
        );
      } catch (firestoreError) {
        console.error(
          "Failed to save admin session:",
          firestoreError
        );
      }

      // ==============================
      // SAVE ADMIN TO SUPABASE
      // ==============================
      try {
        await supabase
          .from("admins")
          .upsert(
            {
              uid: user.uid,
              email: user.email,
              name: user.displayName || "",
              photo_url: user.photoURL || "",
              provider: "google",
              auth_id: user.uid,
            },
            { onConflict: "email" }
          );
      } catch (supabaseError) {
        console.error(
          "Failed to save admin to Supabase:",
          supabaseError
        );
      }

      toast.success("Logged in successfully!");

      setTimeout(() => {
        router.replace("/admin/dashboard");
        router.refresh();
      }, 300);
    } catch (err) {
      console.error("Google authentication error:", err);

      if (err.code === "auth/popup-closed-by-user") {
        return;
      }

      let message =
        "Unable to sign in with Google. Please try again.";

      switch (err.code) {
        case "auth/popup-blocked":
          message =
            "The Google sign-in popup was blocked. Please allow popups.";
          break;

        case "auth/network-request-failed":
          message =
            "Network error. Please check your internet connection.";
          break;

        case "auth/account-exists-with-different-credential":
          message =
            "An account already exists with this email using another login method.";
          break;

        case "auth/operation-not-allowed":
          message =
            "Google authentication is not enabled in Firebase.";
          break;

        default:
          message =
            err.message ||
            "Google authentication failed.";
      }

      setError(message);
      toast.error(message);
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-1 bg-slate-100">
      <div className="flex w-full">

        {/* ========================================= */}
        {/* LEFT SIDE */}
        {/* ========================================= */}

        <div
          className="
            relative hidden
            w-[44%]
            flex-col
            justify-center
            overflow-hidden
            bg-gradient-to-br
            from-[#0b3d3a]
            to-[#0f766e]
            p-14
            text-white
            md:flex
            lg:p-16
          "
        >
          {/* Decorative Circle */}
          <div
            className="
              absolute
              -bottom-24
              -right-24
              h-[280px]
              w-[280px]
              rounded-full
              border-[1.5px]
              border-white/15
            "
          />

          <div className="relative">
            {/* Logo */}
            <div
              className="
                mb-6
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-white/15
              "
            >
              <TradeLinkLogo className="h-6 w-6" />
            </div>

            {/* Title */}
            <h1
              className="
                font-heading
                text-[26px]
                font-extrabold
                leading-tight
              "
            >
              TradeLink Admin Console
            </h1>

            {/* Description */}
            <p
              className="
                mt-3
                max-w-[340px]
                text-[13.5px]
                leading-relaxed
                text-[#bcd9d6]
              "
            >
              Oversee shop owners, stockholders, product
              catalogs and platform-wide activity across
              Bangladesh&apos;s retail network.
            </p>
          </div>
        </div>

        {/* ========================================= */}
        {/* RIGHT SIDE */}
        {/* ========================================= */}

        <div
          className="
            flex
            flex-1
            items-center
            justify-center
            bg-slate-100
            px-6
            py-10
          "
        >
          <form
            className="
              flex
              w-full
              max-w-[340px]
              flex-col
              gap-4
            "
            onSubmit={handleSubmit}
          >

            {/* ===================================== */}
            {/* HEADER */}
            {/* ===================================== */}

            <div className="mb-1">

              {/* Mobile Logo */}
              <div
                className="
                  mb-2
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#0f766e]
                  text-white
                  md:hidden
                "
              >
                <TradeLinkLogo className="h-6 w-6" />
              </div>

              <h2
                className="
                  font-heading
                  text-xl
                  font-bold
                  text-slate-900
                "
              >
                {isSignUp
                  ? "Create admin account"
                  : "Sign in"}
              </h2>

              <span
                className="
                  text-[13px]
                  text-slate-500
                "
              >
                {isSignUp
                  ? "Enter admin credentials to create your account"
                  : "Use your administrator credentials"}
              </span>
            </div>

            {/* ===================================== */}
            {/* ERROR MESSAGE */}
            {/* ===================================== */}

            {error && (
              <div
                className="
                  rounded-lg
                  border
                  border-red-200
                  bg-red-50
                  px-3
                  py-2
                  text-[13px]
                  font-medium
                  text-red-600
                "
              >
                {error}
              </div>
            )}

            {/* ===================================== */}
            {/* EMAIL */}
            {/* ===================================== */}

            <div className="flex flex-col gap-1.5">

              <label
                className="
                  text-[12.5px]
                  font-semibold
                  text-slate-700
                "
              >
                Email address
              </label>

              <div className="relative">

                <Mail
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    h-4
                    w-4
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="admin@tradelink.com.bd"
                  className="
                    w-full
                    rounded-lg
                    border-[1.5px]
                    border-slate-200
                    bg-white
                    py-[11px]
                    pl-9
                    pr-3
                    text-sm
                    text-slate-900
                    placeholder:text-slate-400
                    focus:border-[#0f766e]
                    focus:outline-none
                  "
                />

              </div>
            </div>

            {/* ===================================== */}
            {/* PASSWORD */}
            {/* ===================================== */}

            <div className="flex flex-col gap-1.5">

              <label
                className="
                  text-[12.5px]
                  font-semibold
                  text-slate-700
                "
              >
                Password
              </label>

              <div className="relative">

                <Lock
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    h-4
                    w-4
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  required
                  autoComplete={
                    isSignUp
                      ? "new-password"
                      : "current-password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="••••••••"
                  className="
                    w-full
                    rounded-lg
                    border-[1.5px]
                    border-slate-200
                    bg-white
                    py-[11px]
                    pl-9
                    pr-10
                    text-sm
                    text-slate-900
                    placeholder:text-slate-400
                    focus:border-[#0f766e]
                    focus:outline-none
                  "
                />

                <button
                  type="button"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  onClick={() =>
                    setShowPassword(
                      (current) => !current
                    )
                  }
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                    hover:text-slate-600
                  "
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>

              </div>
            </div>

            {/* ===================================== */}
            {/* REMEMBER / FORGOT */}
            {/* ===================================== */}

            <div className="flex items-center justify-between">

              <label
                className="
                  flex
                  cursor-pointer
                  items-center
                  gap-1.5
                  text-[13px]
                  text-slate-500
                "
              >
                <input
                  type="checkbox"
                  className="
                    h-4
                    w-4
                    rounded
                    border-slate-300
                    accent-[#0f766e]
                  "
                />

                Keep me signed in
              </label>

              <button
                type="button"
                onClick={() =>
                  toast.info(
                    "Password reset can be added with Firebase sendPasswordResetEmail."
                  )
                }
                className="
                  text-[13px]
                  font-semibold
                  text-[#0f766e]
                  hover:text-[#0d4a45]
                "
              >
                Forgot password?
              </button>

            </div>

            {/* ===================================== */}
            {/* LOGIN BUTTON */}
            {/* ===================================== */}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-lg
                bg-[#0f766e]
                py-3
                font-semibold
                text-[13.5px]
                text-white
                transition-colors
                hover:bg-[#0d4a45]
                disabled:cursor-not-allowed
                disabled:opacity-70
              "
            >

              {loading && (
                <Loader2
                  className="
                    h-4
                    w-4
                    animate-spin
                  "
                />
              )}

              {loading
                ? isSignUp
                  ? "Creating account..."
                  : "Signing in..."
                : isSignUp
                ? "Create admin account"
                : "Log in to Admin Console"}

            </button>

            {/* ===================================== */}
            {/* DIVIDER */}
            {/* ===================================== */}

            <div className="flex items-center gap-3">

              <span
                className="
                  h-px
                  flex-1
                  bg-slate-200
                "
              />

              <span
                className="
                  text-[11.5px]
                  font-medium
                  uppercase
                  tracking-wide
                  text-slate-400
                "
              >
                or
              </span>

              <span
                className="
                  h-px
                  flex-1
                  bg-slate-200
                "
              />

            </div>

            {/* ===================================== */}
            {/* GOOGLE LOGIN */}
            {/* ===================================== */}

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={
                loading || googleLoading
              }
              className="
                flex
                w-full
                items-center
                justify-center
                gap-2.5
                rounded-lg
                border-[1.5px]
                border-slate-200
                bg-white
                py-3
                font-semibold
                text-[13.5px]
                text-slate-700
                transition-colors
                hover:bg-slate-50
                disabled:cursor-not-allowed
                disabled:opacity-70
              "
            >

              {googleLoading ? (
                <Loader2
                  className="
                    h-4
                    w-4
                    animate-spin
                    text-slate-400
                  "
                />
              ) : (
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#4285F4"
                    d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.4 3.62v3h3.87c2.27-2.09 3.58-5.17 3.58-8.81z"
                  />

                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.1A12 12 0 0 0 12 24z"
                  />

                  <path
                    fill="#FBBC05"
                    d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56v-3.1H1.29a12 12 0 0 0 0 10.76l3.98-3.1z"
                  />

                  <path
                    fill="#EA4335"
                    d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44A11.98 11.98 0 0 0 12 0 12 12 0 0 0 1.29 6.62l3.98 3.1C6.22 6.88 8.87 4.77 12 4.77z"
                  />
                </svg>
              )}

              {googleLoading
                ? "Signing in with Google..."
                : "Continue with Google"}

            </button>

            {/* ===================================== */}
            {/* SECURITY MESSAGE */}
            {/* ===================================== */}

            <span
              className="
                text-center
                text-[13px]
                text-slate-500
              "
            >
              Protected by Firebase Authentication ·
              Admin access only
            </span>

            {/* ===================================== */}
            {/* SIGN UP / SIGN IN */}
            {/* ===================================== */}

            <button
              type="button"
              onClick={() => {
                setIsSignUp((current) => !current);
                setError("");
              }}
              className="
                text-center
                text-[13px]
                font-semibold
                text-teal-700
                hover:text-teal-800
              "
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Create admin account"}
            </button>

          </form>
        </div>
      </div>

      <Toaster
        position="top-center"
        richColors
      />
    </div>
  );
}