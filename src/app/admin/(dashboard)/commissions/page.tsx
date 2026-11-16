import { Mail } from "lucide-react";
import { updateCommissionStatus } from "@/actions/admin";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { WhatsAppIcon } from "@/components/icons";
import { listCommissions } from "@/lib/data/admin";
import { formatDate, formatPrice } from "@/lib/format";
import type { CommissionStatus } from "@/lib/types";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata = { title: "Commissions" };

const STATUS: { value: CommissionStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "in_discussion", label: "In discussion" },
  { value: "accepted", label: "Accepted" },
  { value: "declined", label: "Declined" },
  { value: "completed", label: "Completed" },
];

export default async function CommissionsAdmin() {
  const items = await listCommissions();
  return (
    <>
      <PageHeader title="Commission requests" description="Custom painting requests from the Commissions page." />
      <ul className="space-y-4">
        {items.map((c) => {
          const wa = c.phone ? whatsappLink(c.phone, `Hello ${c.name.split(" ")[0]}, this is Farah from Farah in Color about your commission request.`) : null;
          return (
            <li key={c.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-serif text-2xl">{c.name}</p>
                  <p className="text-sm text-muted">{formatDate(c.created_at)}</p>
                </div>
                <StatusSelect label={`Status of ${c.name}'s request`} value={c.status} options={STATUS} onChange={updateCommissionStatus.bind(null, c.id)} />
              </div>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                <div><dt className="eyebrow">Size</dt><dd>{c.size}</dd></div>
                <div><dt className="eyebrow">Colors</dt><dd>{c.colors || "–"}</dd></div>
                <div><dt className="eyebrow">Budget</dt><dd>{c.budget_usd != null ? formatPrice(c.budget_usd) : "–"}</dd></div>
              </dl>
              <p className="mt-4 whitespace-pre-line text-sm">{c.description}</p>
              {c.imageUrls.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {c.imageUrls.map((u, i) => (
                    <li key={u}>
                      <a href={u} target="_blank" rel="noopener noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={u} alt={`Reference image ${i + 1} from ${c.name}`} className="h-24 w-24 rounded-lg object-cover" />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <a href={`mailto:${c.email}?subject=${encodeURIComponent("Your commission request – Farah in Color")}`} className="btn-outline px-4 py-2"><Mail className="h-4 w-4" /> {c.email}</a>
                {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-whatsapp px-4 py-2"><WhatsAppIcon className="h-4 w-4" /> WhatsApp</a>}
              </div>
            </li>
          );
        })}
        {items.length === 0 && <li className="card p-8 text-center text-muted">No commission requests yet.</li>}
      </ul>
    </>
  );
}
