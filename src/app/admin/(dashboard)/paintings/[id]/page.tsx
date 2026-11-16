import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { PaintingForm } from "@/components/admin/PaintingForm";
import { facetsOf, getPaintingById, getPaintings } from "@/lib/data/paintings";
import { isDemoMode } from "@/lib/supabase/env";

export const metadata = { title: "Edit painting" };

export default async function EditPaintingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [painting, all] = await Promise.all([getPaintingById(id), getPaintings()]);
  if (!painting) notFound();
  return (
    <>
      <PageHeader
        title={painting.title}
        description="Edit the details below and press Save."
        action={<Link href={`/paintings/${painting.slug}`} target="_blank" className="btn-outline"><ExternalLink className="h-4 w-4" /> View on website</Link>}
      />
      <PaintingForm painting={painting} facets={facetsOf(all)} demo={isDemoMode} />
    </>
  );
}
