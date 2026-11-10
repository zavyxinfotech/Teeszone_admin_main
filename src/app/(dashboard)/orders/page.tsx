import type { Metadata } from "next";
import { OrdersView } from "@/components/orders/OrdersView";

export const metadata: Metadata = {
  title: "Customer Orders | TeesZone Admin",
  description: "View and manage wholesale and custom customer orders.",
};

export default function OrdersPage() {
  return <OrdersView />;
}
