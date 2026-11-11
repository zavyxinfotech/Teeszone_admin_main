import { Metadata } from "next";
import { Customization3DManagementView } from "@/components/customization/Customization3DManagementView";

export const metadata: Metadata = {
  title: "T-Shirt 3D Models | TeesZone Admin",
  description: "Manage 3D T-shirt customization images for all spreadsheet colours",
};

export default function Customization3DPage() {
  return <Customization3DManagementView />;
}

