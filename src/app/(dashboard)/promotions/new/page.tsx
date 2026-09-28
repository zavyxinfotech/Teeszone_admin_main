import { PageHeader } from "@/components/layout/PageHeader";
import { PromotionForm } from "@/components/promotions/PromotionForm";

export const metadata = { title: "New promotion" };

export default function NewPromotionPage() {
  return (
    <>
      <PageHeader title="New promotion" />
      <PromotionForm />
    </>
  );
}
