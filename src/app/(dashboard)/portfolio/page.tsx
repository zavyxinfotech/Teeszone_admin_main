import { Metadata } from "next";
import { PortfolioManagementView } from "@/components/portfolio/PortfolioManagementView";

export const metadata: Metadata = {
  title: "Client Portfolio | TeesZone Admin",
};

export default function PortfolioPage() {
  return <PortfolioManagementView />;
}
