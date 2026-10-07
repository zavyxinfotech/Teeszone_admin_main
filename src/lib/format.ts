// Small formatting helpers shared by tables and forms.

export const formatINR = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

export const formatDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export const formatDateTime = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

export const offPct = (mrp: number, price: number) =>
  mrp > 0 ? Math.max(0, Math.round((1 - price / mrp) * 100)) : 0;

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const STORE_URL = (process.env.NEXT_PUBLIC_STORE_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const storeUrl = (path = "") => `${STORE_URL}${path}`;
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4010/api").replace(/\/$/, "");
export const imageUrl = (path: string) => {
  if (!path) return "";
  if (path.includes("teeszone-catalogue-images-2026") || path.includes("s3.ap-southeast-2.amazonaws.com")) {
    const key = path.replace(/^https?:\/\/[^\/]+\//, "");
    return `${API_URL}/upload/media/${key}`;
  }
  return /^https?:\/\//.test(path) ? path : storeUrl(path);
};

// <input type="datetime-local"> <-> ISO string
export const isoToLocalInput = (iso: string | null | undefined) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
export const localInputToIso = (v: string) => (v ? new Date(v).toISOString() : null);
