"use client";

import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRequireAdmin } from "@/lib/auth";

// Wraps the dashboard layout: skeleton while the stored session is checked,
// redirect to /login when there is no admin session.
export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, ready } = useRequireAdmin();
  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md space-y-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
