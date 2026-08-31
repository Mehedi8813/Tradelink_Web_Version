import { Layers, Mail, Lock, Eye, EyeOff } from "lucide-react";

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
  return (
    <div className="flex min-h-full flex-1 bg-slate-100">
      <div className="flex w-full">
        <div className="relative hidden w-[44%] flex-col justify-center overflow-hidden bg-gradient-to-br from-[#0b3d3a] to-[#0f766e] p-14 text-white md:flex lg:p-16">
          <div className="absolute -bottom-24 -right-24 h-[280px] w-[280px] rounded-full border-[1.5px] border-white/15" />

          <div className="relative">
            <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
              <TradeLinkLogo className="h-6 w-6" />
            </div>
            <h1 className="font-heading text-[26px] font-extrabold leading-tight">
              TradeLink Admin Console
            </h1>
            <p className="mt-3 max-w-[340px] text-[13.5px] leading-relaxed text-[#bcd9d6]">
              Oversee shop owners, stockholders, product catalogs and platform-wide
              activity across Bangladesh&apos;s retail network.
            </p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center bg-slate-100 px-6">
          <form className="flex w-full max-w-[340px] flex-col gap-4">
            <div className="mb-1">
              <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-[#0f766e] text-white md:hidden">
                <TradeLinkLogo className="h-6 w-6" />
              </div>
              <h2 className="font-heading text-xl font-bold text-slate-900">
                Sign in
              </h2>
              <span className="text-[13px] text-slate-500">
                Use your administrator credentials
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-semibold text-slate-700">
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  placeholder="admin@tradelink.com.bd"
                  className="w-full rounded-lg border-[1.5px] border-slate-200 bg-white py-[11px] pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0f766e] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-semibold text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-lg border-[1.5px] border-slate-200 bg-white py-[11px] pl-9 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0f766e] focus:outline-none"
                />
                <button
                  type="button"
                  aria-label="Show password"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-1.5 text-[13px] text-slate-500">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 accent-[#0f766e]"
                />
                Keep me signed in
              </label>
              <span className="text-[13px] font-semibold text-[#0f766e]">
                Forgot password?
              </span>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-[#0f766e] py-3 font-semibold text-[13.5px] text-white transition-colors hover:bg-[#0d4a45]"
            >
              Log in to Admin Console
            </button>

            <span className="text-center text-[13px] text-slate-500">
              Protected by JWT authentication · Admin access only
            </span>
          </form>
        </div>
      </div>
    </div>
  );
}
