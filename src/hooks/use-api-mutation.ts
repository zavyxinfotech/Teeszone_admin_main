"use client";

import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError, type ApiResult } from "@/lib/api";

// Shared mutation wrapper: toasts the backend message on success, the
// ApiError message + description on failure, and invalidates the given keys.
export function useApiMutation<TVars, TData>(
  fn: (vars: TVars) => Promise<ApiResult<TData>>,
  opts: { invalidate?: QueryKey[]; onSuccess?: (data: TData, vars: TVars) => void; silent?: boolean } = {},
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (result, vars) => {
      if (!opts.silent && result.message) toast.success(result.message);
      for (const key of opts.invalidate ?? []) void qc.invalidateQueries({ queryKey: key });
      opts.onSuccess?.(result.data, vars);
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message, { description: error.description });
      } else {
        toast.error("Something went wrong", { description: (error as Error).message });
      }
    },
  });
}
