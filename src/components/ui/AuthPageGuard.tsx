"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { getAuthenticatedDestination } from "@/lib/authRedirect";

export default function AuthPageGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, role, loading } = useAuthStore();

  useEffect(() => {
    if (!loading && user) router.replace(getAuthenticatedDestination(role));
  }, [loading, user, role, router]);

  if (loading || user) {
    return (
      <main className="route-loader" aria-label="Checking your account">
        <span className="route-loader-mark">QUTUB<span>.</span></span>
        <span className="route-loader-line"><i /></span>
        <p>CHECKING YOUR ACCOUNT</p>
      </main>
    );
  }

  return children;
}
