"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StockholderDashboardPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/stockholder/dashboard/home");
  }, [router]);
  return null;
}
