"use client";

import { useQuery } from "@tanstack/react-query";
import { promotionsApi } from "@/lib/api";
import type { PromotionInput } from "@/lib/types";
import { useApiMutation } from "./use-api-mutation";
import { keys, useEnabled } from "./use-catalog";

export function usePromotions() {
  const enabled = useEnabled();
  return useQuery({ queryKey: keys.promotions, queryFn: promotionsApi.adminList, enabled });
}
export function usePromotion(id: string | undefined) {
  const enabled = useEnabled();
  return useQuery({
    queryKey: keys.promotion(id ?? ""),
    queryFn: () => promotionsApi.get(id!),
    enabled: enabled && !!id,
  });
}
export const useCreatePromotion = (onSuccess?: (id: string) => void) =>
  useApiMutation((input: PromotionInput) => promotionsApi.create(input), {
    invalidate: [keys.promotions, keys.dashboard],
    onSuccess: (p) => onSuccess?.(p.id),
  });
export const useUpdatePromotion = (onSuccess?: () => void) =>
  useApiMutation(({ id, input }: { id: string; input: PromotionInput }) => promotionsApi.update(id, input), {
    invalidate: [keys.promotions, keys.dashboard],
    onSuccess: () => onSuccess?.(),
  });
export const useDeletePromotion = () =>
  useApiMutation((id: string) => promotionsApi.remove(id), { invalidate: [keys.promotions, keys.dashboard] });
