// Single API client for the admin. Every response arrives in the backend
// envelope { data, message, success, code }; request() unwraps .data and
// throws ApiError with the backend's message/description on failure.
// The bearer token is registered once by AuthProvider (setAuthToken).

import type {
  AdminCollection,
  AdminFabric,
  AdminProduct,
  AdminPromotion,
  AdminReview,
  AuthUser,
  Collection,
  CollectionInput,
  Customer,
  CustomerDetail,
  DashboardStats,
  Enquiry,
  EnquiryStatus,
  FabricInput,
  Paginated,
  ProductInput,
  PromotionInput,
  ReviewInput,
  Segment,
  Subscriber,
} from "@/lib/types";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4010/api").replace(/\/$/, "");

let authToken: string | null = null;
export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export class ApiError extends Error {
  status: number;
  description?: string;
  constructor(message: string, status: number, description?: string) {
    super(message);
    this.status = status;
    this.description = description;
  }
}

export interface ApiResult<T> {
  data: T;
  message: string;
}

async function requestFull<T>(
  path: string,
  opts: { method?: string; body?: unknown; token?: string | null; formData?: FormData } = {},
): Promise<ApiResult<T>> {
  const token = opts.token === undefined ? authToken : opts.token;
  const res = await fetch(`${API_URL}${path}`, {
    method: opts.method ?? "GET",
    headers: {
      ...(opts.body !== undefined ? { "content-type": "application/json" } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: opts.formData ?? (opts.body !== undefined ? JSON.stringify(opts.body) : undefined),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(json?.message ?? `Request failed (${res.status})`, res.status, json?.description);
  }
  return { data: json.data as T, message: json?.message ?? "" };
}

async function request<T>(path: string, opts?: Parameters<typeof requestFull>[1]): Promise<T> {
  return (await requestFull<T>(path, opts)).data;
}

const qs = (params: Record<string, string | number | undefined>) => {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
};

// ---------- Auth ----------

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export const authApi = {
  login: (input: { email: string; password: string }) =>
    request<AuthSession>("/auth/login", { method: "POST", body: input, token: null }),
  me: (token: string) => request<AuthUser>("/auth/me", { token }),
};

// ---------- Dashboard ----------

export const dashboardApi = {
  stats: () => request<DashboardStats>("/dashboard/stats"),
};

// ---------- Catalog ----------

export const productsApi = {
  adminList: () => request<AdminProduct[]>("/products/admin/list"),
  get: (id: string) => request<AdminProduct>(`/products/admin/${id}`),
  create: (input: ProductInput) => requestFull<AdminProduct>("/products/", { method: "POST", body: input }),
  update: (id: string, input: ProductInput) =>
    requestFull<AdminProduct>(`/products/${id}`, { method: "PUT", body: input }),
  remove: (id: string) => requestFull<{ deleted: boolean }>(`/products/${id}`, { method: "DELETE" }),
};

export const collectionsApi = {
  adminList: () => request<AdminCollection[]>("/collections/admin/list"),
  list: () => request<Collection[]>("/collections/"),
  navigation: () => request<{ segments: Segment[]; collections: Collection[] }>("/navigation/"),
  create: (input: CollectionInput) =>
    requestFull<Collection>("/collections/", { method: "POST", body: input }),
  update: (id: string, input: CollectionInput) =>
    requestFull<Collection>(`/collections/${id}`, { method: "PUT", body: input }),
  remove: (id: string) => requestFull<{ deleted: boolean }>(`/collections/${id}`, { method: "DELETE" }),
};

export const promotionsApi = {
  adminList: () => request<AdminPromotion[]>("/promotions/admin/list"),
  get: (id: string) => request<AdminPromotion>(`/promotions/admin/${id}`),
  create: (input: PromotionInput) =>
    requestFull<AdminPromotion>("/promotions/", { method: "POST", body: input }),
  update: (id: string, input: PromotionInput) =>
    requestFull<AdminPromotion>(`/promotions/${id}`, { method: "PUT", body: input }),
  remove: (id: string) => requestFull<{ deleted: boolean }>(`/promotions/${id}`, { method: "DELETE" }),
};

export const fabricsApi = {
  adminList: () => request<AdminFabric[]>("/fabrics/admin/list"),
  create: (input: FabricInput) => requestFull<AdminFabric>("/fabrics/", { method: "POST", body: input }),
  update: (id: string, input: FabricInput) =>
    requestFull<AdminFabric>(`/fabrics/${id}`, { method: "PUT", body: input }),
  remove: (id: string) => requestFull<{ deleted: boolean }>(`/fabrics/${id}`, { method: "DELETE" }),
};

export const reviewsApi = {
  adminList: () => request<AdminReview[]>("/reviews/admin/list"),
  create: (input: ReviewInput) => requestFull<AdminReview>("/reviews/", { method: "POST", body: input }),
  update: (id: string, input: ReviewInput) =>
    requestFull<AdminReview>(`/reviews/${id}`, { method: "PUT", body: input }),
  remove: (id: string) => requestFull<{ deleted: boolean }>(`/reviews/${id}`, { method: "DELETE" }),
};

// ---------- Leads & people ----------

export const enquiriesApi = {
  list: (params: { status?: EnquiryStatus; page: number; limit: number }) =>
    request<Paginated<Enquiry>>(`/enquiries/${qs(params)}`),
  updateStatus: (id: string, status: EnquiryStatus) =>
    requestFull<Enquiry>(`/enquiries/${id}`, { method: "PATCH", body: { status } }),
};

export const customersApi = {
  list: (params: { q?: string; role?: "CUSTOMER" | "ADMIN"; page: number; limit: number }) =>
    request<Paginated<Customer>>(`/customers/${qs(params)}`),
  get: (id: string) => request<CustomerDetail>(`/customers/${id}`),
};

export const newsletterApi = {
  list: (params: { page: number; limit: number }) =>
    request<Paginated<Subscriber>>(`/newsletter/${qs(params)}`),
};

// ---------- Upload (503 until S3 is configured) ----------

export const uploadApi = {
  image: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return request<{ url: string }>("/upload/image", { method: "POST", formData: fd });
  },
};
