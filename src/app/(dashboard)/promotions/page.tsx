import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { PromotionsTable } from "@/components/promotions/PromotionsTable";

export const metadata = { title: "Promotions" };

export default function PromotionsPage() {
  return (
    <>
      <PageHeader
        title="Promotions"
        description="Automatic offers and coupon codes applied in the storefront cart, on top of bulk tiers."
        actions={
          <Button asChild>
            <Link href="/promotions/new">
              <Plus /> Create promotion
            </Link>
          </Button>
        }
      />
      <PromotionsTable />
    </>
  );
}
