import type { Metadata } from "next";
import { ActivitiesView } from "@/components/activities/ActivitiesView";

export const metadata: Metadata = {
  title: "Customer Activities | TeesZone Admin",
  description: "Real-time centralized activity monitoring for customer carts, customizations, and orders.",
};

export default function ActivitiesPage() {
  return <ActivitiesView />;
}
