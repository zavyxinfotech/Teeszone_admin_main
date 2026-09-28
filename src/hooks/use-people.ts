"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { customersApi, dashboardApi, enquiriesApi, newsletterApi } from "@/lib/api";
import type { EnquiryStatus } from "@/lib/types";
import { useApiMutation } from "./use-api-mutation";
import { keys, useEnabled } from "./use-catalog";

export function useDashboard() {
  const enabled = useEnabled();
  return useQuery({ queryKey: keys.dashboard, queryFn: dashboardApi.stats, enabled });
}

export function useEnquiries(params: { status?: EnquiryStatus; page: number; limit: number }) {
  const enabled = useEnabled();
  return useQuery({
    queryKey: [...keys.enquiries, params],
    queryFn: () => enquiriesApi.list(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}
export const useUpdateEnquiryStatus = () =>
  useApiMutation(({ id, status }: { id: string; status: EnquiryStatus }) => enquiriesApi.updateStatus(id, status), {
    invalidate: [keys.enquiries, keys.dashboard],
  });

export function useCustomers(params: { q?: string; role?: "CUSTOMER" | "ADMIN"; page: number; limit: number }) {
  const enabled = useEnabled();
  return useQuery({
    queryKey: [...keys.customers, params],
    queryFn: () => customersApi.list(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}
export function useCustomer(id: string | undefined) {
  const enabled = useEnabled();
  return useQuery({
    queryKey: [...keys.customers, "detail", id],
    queryFn: () => customersApi.get(id!),
    enabled: enabled && !!id,
  });
}

export function useSubscribers(params: { page: number; limit: number }) {
  const enabled = useEnabled();
  return useQuery({
    queryKey: [...keys.newsletter, params],
    queryFn: () => newsletterApi.list(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}
