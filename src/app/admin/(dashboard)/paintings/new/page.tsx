import { PageHeader } from "@/components/admin/PageHeader";
import { PaintingForm } from "@/components/admin/PaintingForm";
import { facetsOf, getPaintings } from "@/lib/data/paintings";
import { isDemoMode } from "@/lib/supabase/env";

export const metadata = { title: "Add a painting" };

export default async function NewPaintingPage() {
  const facets = facetsOf(await getPaintings());
  return (
    <>
      <PageHeader title="Add a painting" description="Fill in the details, add photos, and press Save. It appears on the website right away." />
      <PaintingForm facets={facets} demo={isDemoMode} />
    </>
  );
}
