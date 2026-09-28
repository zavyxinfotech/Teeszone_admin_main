"use client";

import { useQuery } from "@tanstack/react-query";
import { collectionsApi, fabricsApi, productsApi, reviewsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { CollectionInput, FabricInput, ProductInput, ReviewInput } from "@/lib/types";
import { useApiMutation } from "./use-api-mutation";

export const keys = {
  products: ["products"] as const,
  product: (id: string) => ["products", id] as const,
  collections: ["collections"] as const,
  navigation: ["navigation"] as const,
  fabrics: ["fabrics"] as const,
  reviews: ["reviews"] as const,
  promotions: ["promotions"] as const,
  promotion: (id: string) => ["promotions", id] as const,
  enquiries: ["enquiries"] as const,
  customers: ["customers"] as const,
  newsletter: ["newsletter"] as const,
  dashboard: ["dashboard"] as const,
};

// Queries only run once the admin session is in place.
export function useEnabled() {
  const { token } = useAuth();
  return !!token;
}

// ---------- Products ----------
export function useProducts() {
  const enabled = useEnabled();
  return useQuery({ queryKey: keys.products, queryFn: productsApi.adminList, enabled });
}
export function useProduct(id: string | undefined) {
  const enabled = useEnabled();
  return useQuery({
    queryKey: keys.product(id ?? ""),
    queryFn: () => productsApi.get(id!),
    enabled: enabled && !!id,
  });
}
export const useCreateProduct = (onSuccess?: (id: string) => void) =>
  useApiMutation((input: ProductInput) => productsApi.create(input), {
    invalidate: [keys.products, keys.collections, keys.dashboard],
    onSuccess: (p) => onSuccess?.(p.id),
  });
export const useUpdateProduct = (onSuccess?: () => void) =>
  useApiMutation(({ id, input }: { id: string; input: ProductInput }) => productsApi.update(id, input), {
    invalidate: [keys.products, keys.collections, keys.dashboard],
    onSuccess: () => onSuccess?.(),
  });
export const useDeleteProduct = () =>
  useApiMutation((id: string) => productsApi.remove(id), {
    invalidate: [keys.products, keys.collections, keys.dashboard],
  });

// ---------- Collections ----------
export function useCollections() {
  const enabled = useEnabled();
  return useQuery({ queryKey: keys.collections, queryFn: collectionsApi.adminList, enabled });
}
export function useNavigation() {
  const enabled = useEnabled();
  return useQuery({ queryKey: keys.navigation, queryFn: collectionsApi.navigation, enabled });
}
export const useCreateCollection = (onSuccess?: () => void) =>
  useApiMutation((input: CollectionInput) => collectionsApi.create(input), {
    invalidate: [keys.collections, keys.navigation, keys.dashboard],
    onSuccess: () => onSuccess?.(),
  });
export const useUpdateCollection = (onSuccess?: () => void) =>
  useApiMutation(({ id, input }: { id: string; input: CollectionInput }) => collectionsApi.update(id, input), {
    invalidate: [keys.collections, keys.navigation, keys.products],
    onSuccess: () => onSuccess?.(),
  });
export const useDeleteCollection = () =>
  useApiMutation((id: string) => collectionsApi.remove(id), {
    invalidate: [keys.collections, keys.navigation, keys.products, keys.dashboard],
  });

// ---------- Fabrics ----------
export function useFabrics() {
  const enabled = useEnabled();
  return useQuery({ queryKey: keys.fabrics, queryFn: fabricsApi.adminList, enabled });
}
export const useCreateFabric = (onSuccess?: () => void) =>
  useApiMutation((input: FabricInput) => fabricsApi.create(input), {
    invalidate: [keys.fabrics],
    onSuccess: () => onSuccess?.(),
  });
export const useUpdateFabric = (onSuccess?: () => void) =>
  useApiMutation(({ id, input }: { id: string; input: FabricInput }) => fabricsApi.update(id, input), {
    invalidate: [keys.fabrics],
    onSuccess: () => onSuccess?.(),
  });
export const useDeleteFabric = () =>
  useApiMutation((id: string) => fabricsApi.remove(id), { invalidate: [keys.fabrics] });

// ---------- Reviews ----------
export function useReviews() {
  const enabled = useEnabled();
  return useQuery({ queryKey: keys.reviews, queryFn: reviewsApi.adminList, enabled });
}
export const useCreateReview = (onSuccess?: () => void) =>
  useApiMutation((input: ReviewInput) => reviewsApi.create(input), {
    invalidate: [keys.reviews, keys.dashboard],
    onSuccess: () => onSuccess?.(),
  });
export const useUpdateReview = (onSuccess?: () => void) =>
  useApiMutation(({ id, input }: { id: string; input: ReviewInput }) => reviewsApi.update(id, input), {
    invalidate: [keys.reviews, keys.dashboard],
    onSuccess: () => onSuccess?.(),
  });
export const useDeleteReview = () =>
  useApiMutation((id: string) => reviewsApi.remove(id), { invalidate: [keys.reviews, keys.dashboard] });
