"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";

// App-wide providers. One QueryClient per browser session; admin data is
// always fetched live (staleTime 0) and refetched on window focus.
export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: true, staleTime: 0 } },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        <TooltipProvider>{children}</TooltipProvider>
      </AuthProvider>
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  );
}
