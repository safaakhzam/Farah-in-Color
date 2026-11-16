import Image from "next/image";
import Link from "next/link";
import { Pencil, Plus, Star } from "lucide-react";
import { setPaintingStatus } from "@/actions/admin";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { getPaintings } from "@/lib/data/paintings";
import { formatDimensions, formatPrice } from "@/lib/format";
import type { PaintingStatus } from "@/lib/types";

export const metadata = { title: "Paintings" };

const STATUS_OPTIONS: { value: PaintingStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "sold", label: "Sold" },
];

export default async function AdminPaintings({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const [{ saved }, paintings] = await Promise.all([searchParams, getPaintings()]);
  return (
    <>
      <PageHeader
        title="Paintings"
        description={`${paintings.length} paintings · change a status here and it updates on the website instantly.`}
        action={<Link href="/admin/paintings/new" className="btn-primary"><Plus className="h-4 w-4" /> Add a painting</Link>}
      />
      {saved && <p role="status" className="mb-4 rounded-xl bg-teal/10 px-4 py-3 text-sm text-teal-deep">Saved! Your website has been updated.</p>}
      <ul className="card divide-y divide-line">
        {paintings.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center gap-4 p-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-sand">
              {p.images[0] && <Image src={p.images[0].url} alt="" fill sizes="64px" className="object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 font-medium">
                {p.title}
                {p.featured && <Star className="h-3.5 w-3.5 fill-saffron text-saffron" aria-label="Featured" />}
              </p>
              <p className="truncate text-sm text-muted">{formatPrice(p.price_usd)} · {formatDimensions(p).split(" (")[0]}</p>
            </div>
            <StatusSelect label={`Status of ${p.title}`} value={p.status} options={STATUS_OPTIONS} onChange={setPaintingStatus.bind(null, p.id)} />
            <Link href={`/admin/paintings/${p.id}`} className="btn-outline px-4 py-2"><Pencil className="h-4 w-4" /> Edit</Link>
          </li>
        ))}
        {paintings.length === 0 && <li className="p-8 text-center text-muted">No paintings yet. Click “Add a painting” to start.</li>}
      </ul>
    </>
  );
}
