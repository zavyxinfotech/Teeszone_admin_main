import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { NewProductView } from "@/components/products/NewProductView";

export const metadata = { title: "New product" };

export default function NewProductPage() {
  return (
    <>
      <PageHeader title="New product" />
      <Suspense>
        <NewProductView />
      </Suspense>
    </>
  );
}
