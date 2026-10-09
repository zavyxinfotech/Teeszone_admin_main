// Public shapes are copied VERBATIM from ui/src/lib/types.ts (the API contract).
// Admin-only shapes extend them with what the /admin endpoints add.

export type SegmentSlug = "unisex" | "men" | "women" | "kids" | "shop-more";

export interface Collection {
  slug: string;
  name: string;
  segment: SegmentSlug;
  group: string;
  description: string;
}

export interface Segment {
  slug: SegmentSlug;
  name: string;
  groups: { title: string; collections: string[] }[];
}

export interface ProductColor {
  name: string;
  hex: string;
  image: string;
  backImage?: string;
  chestImage?: string;
  detailImage?: string;
  image4?: string;
  image5?: string;
}

export interface QtyDiscount {
  minQty: number;
  offPct: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  collections: string[];
  description: string;
  fit: string;
  fabric: string;
  gsm: number;
  mrp: number;
  price: number;
  colors: ProductColor[];
  sizes: string[];
  qtyDiscounts: QtyDiscount[];
  features: string[];
  isNew?: boolean;
  bestSeller?: boolean;
  megaSale?: boolean;
}

export interface Review {
  stars: number;
  quote: string;
  author: string;
  product: string;
}

export interface Fabric {
  key: string;
  name: string;
  description: string;
  fit: string;
  highlights: string[];
  image: string;
}

export interface Promotion {
  id: string;
  name: string;
  code: string | null;
  type: "PERCENT" | "FLAT";
  value: number;
  scope: "ALL" | "PRODUCTS" | "COLLECTIONS";
  productSlugs: string[];
  collectionSlugs: string[];
  minQty: number | null;
  minOrderValue: number | null;
  startsAt: string | null;
  endsAt: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: "CUSTOMER" | "ADMIN";
  hasPassword: boolean;
  googleLinked: boolean;
}

export type AddressType = "HOME" | "WORK" | "OTHER";

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  type: AddressType;
  isDefault: boolean;
}

// ---------- Admin extras ----------

export const VIRTUAL_COLLECTIONS = ["new-arrival", "best-sellers", "mega-sale"] as const;
export const isVirtualCollection = (slug: string) =>
  (VIRTUAL_COLLECTIONS as readonly string[]).includes(slug);

export interface AdminProduct extends Product {
  isActive: boolean;
  sortOrder: number;
}

export interface ProductInput {
  name: string;
  slug: string;
  description: string;
  fit: string;
  fabric: string;
  gsm: number;
  mrp: number;
  price: number;
  sizes: string[];
  features: string[];
  colors: ProductColor[];
  qtyDiscounts: QtyDiscount[];
  collections: string[]; // real collection slugs only
  isNew: boolean;
  bestSeller: boolean;
  megaSale: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface AdminCollection extends Collection {
  id: string;
  isVirtual: boolean;
  sortOrder: number;
  productCount: number;
}

export interface CollectionInput {
  slug: string;
  name: string;
  description: string;
  segment: string;
  group: string;
  sortOrder: number;
}

export type PromotionStatus = "scheduled" | "live" | "expired" | "inactive";

export interface AdminPromotion extends Promotion {
  isActive: boolean;
  sortOrder: number;
  status: PromotionStatus;
  createdAt: string;
}

export interface PromotionInput {
  name: string;
  code: string | null;
  type: "PERCENT" | "FLAT";
  value: number;
  scope: "ALL" | "PRODUCTS" | "COLLECTIONS";
  productSlugs: string[];
  collectionSlugs: string[];
  minQty: number | null;
  minOrderValue: number | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface AdminFabric extends Fabric {
  id: string;
  sortOrder: number;
}

export interface FabricInput {
  key: string;
  name: string;
  description: string;
  fit: string;
  highlights: string[];
  image: string;
  sortOrder: number;
}

export interface AdminReview extends Review {
  id: string;
  isPublished: boolean;
  sortOrder: number;
}

export interface ReviewInput {
  stars: number;
  quote: string;
  author: string;
  product: string;
  isPublished: boolean;
  sortOrder: number;
}

export type EnquiryStatus = "NEW" | "CONTACTED" | "CLOSED";

export interface Enquiry {
  id: string;
  name: string;
  company: string | null;
  phone: string;
  productId: string | null;
  productName: string | null;
  quantity: string | null;
  message: string | null;
  status: EnquiryStatus;
  createdAt: string;
}

export interface Customer {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: "CUSTOMER" | "ADMIN";
  hasPassword: boolean;
  googleLinked: boolean;
  addressCount: number;
  createdAt: string;
}

export interface CustomerDetail extends Customer {
  addresses: Address[];
}

export interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
}

export interface DashboardStats {
  products: { active: number; inactive: number };
  collections: number;
  promotions: { live: number; total: number };
  enquiries: { new: number; contacted: number; closed: number };
  reviews: { published: number; unpublished: number };
  customers: number;
  subscribers: number;
  recentEnquiries: Enquiry[];
  recentCustomers: { id: string; name: string; email: string; createdAt: string }[];
}
