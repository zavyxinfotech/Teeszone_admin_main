import {
  BadgePercent,
  Inbox,
  LayoutDashboard,
  Layers,
  type LucideIcon,
  Mail,
  MessageSquareQuote,
  Package,
  Shirt,
  Users,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  { title: "Overview", items: [{ href: "/", label: "Dashboard", icon: LayoutDashboard }] },
  {
    title: "Catalog",
    items: [
      { href: "/products", label: "Products", icon: Package },
      { href: "/collections", label: "Collections", icon: Layers },
      { href: "/promotions", label: "Promotions", icon: BadgePercent },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/fabrics", label: "Fabrics", icon: Shirt },
      { href: "/reviews", label: "Reviews", icon: MessageSquareQuote },
    ],
  },
  {
    title: "People",
    items: [
      { href: "/enquiries", label: "Enquiries", icon: Inbox },
      { href: "/customers", label: "Customers", icon: Users },
      { href: "/newsletter", label: "Newsletter", icon: Mail },
    ],
  },
];

export const pageTitle = (pathname: string) => {
  const all = NAV.flatMap((g) => g.items);
  const exact = all.find((i) => i.href === pathname);
  if (exact) return exact.label;
  const prefix = all.find((i) => i.href !== "/" && pathname.startsWith(i.href));
  return prefix?.label ?? "TeesZone Admin";
};
