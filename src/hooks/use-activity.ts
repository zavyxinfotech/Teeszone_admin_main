"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { activityApi, ordersApi } from "@/lib/api";
import { useEnabled } from "./use-catalog";

export function useActivities(params: {
  search?: string;
  activityType?: string;
  productId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}) {
  const enabled = useEnabled();
  return useQuery({
    queryKey: ["admin", "activities", params],
    queryFn: () => activityApi.list(params),
    enabled,
    placeholderData: keepPreviousData,
    refetchInterval: 3500, // Real-time automatic polling every 3.5s without manual page refresh
  });
}

export function useAdminOrders(params: {
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const enabled = useEnabled();
  return useQuery({
    queryKey: ["admin", "orders", params],
    queryFn: () => ordersApi.list(params),
    enabled,
    placeholderData: keepPreviousData,
    refetchInterval: 5000,
  });
}
