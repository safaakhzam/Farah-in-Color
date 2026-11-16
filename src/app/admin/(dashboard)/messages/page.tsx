import { Mail } from "lucide-react";
import { setMessageHandled } from "@/actions/admin";
import { HandledToggle } from "@/components/admin/HandledToggle";
import { PageHeader } from "@/components/admin/PageHeader";
import { listMessages } from "@/lib/data/admin";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  const messages = await listMessages();
  return (
    <>
      <PageHeader title="Messages" description="From the Contact page and “Inquire about this piece”." />
      <ul className="space-y-4">
        {messages.map((m) => (
          <li key={m.id} className={`card p-5 ${m.handled ? "opacity-70" : ""}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">{m.name}</p>
                <p className="text-sm text-muted">{formatDate(m.created_at)}{m.painting_slug ? ` · about “${m.painting_slug}”` : ""}</p>
              </div>
              <HandledToggle handled={m.handled} onToggle={setMessageHandled.bind(null, m.id)} />
            </div>
            <p className="mt-3 whitespace-pre-line text-sm">{m.message}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <a href={`mailto:${m.email}`} className="btn-outline px-4 py-2"><Mail className="h-4 w-4" /> Reply to {m.email}</a>
              {m.phone && <a href={`tel:${m.phone}`} className="btn-outline px-4 py-2">{m.phone}</a>}
            </div>
          </li>
        ))}
        {messages.length === 0 && <li className="card p-8 text-center text-muted">No messages yet.</li>}
      </ul>
    </>
  );
}
