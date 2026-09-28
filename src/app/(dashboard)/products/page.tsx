import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductsTable } from "@/components/products/ProductsTable";

export const metadata = { title: "Products" };

export default function ProductsPage() {
  return (
    <>
      <PageHeader
        title="Products"
        description="Everything the storefront sells. Changes go live within a few minutes."
        actions={
          <Button asChild>
            <Link href="/products/new">
              <Plus /> Add product
            </Link>
          </Button>
        }
      />
      <ProductsTable />
    </>
  );
}
