import { Metadata } from "next";
import { ProductionVideosManagementView } from "@/components/videos/ProductionVideosManagementView";

export const metadata: Metadata = {
  title: "Production Videos | TeesZone Admin",
};

export default function ProductionVideosPage() {
  return <ProductionVideosManagementView />;
}
