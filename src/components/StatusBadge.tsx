import type { PaintingStatus } from "@/lib/types";

const styles: Record<PaintingStatus, string> = {
  available: "bg-teal/10 text-teal-deep",
  reserved: "bg-saffron/20 text-[#7a4f00]",
  sold: "bg-ink text-white",
};
const labels: Record<PaintingStatus, string> = { available: "Available", reserved: "Reserved", sold: "Sold" };

export function StatusBadge({ status, className = "" }: { status: PaintingStatus; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium tracking-wide ${styles[status]} ${className}`}>
      {status === "sold" && <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-coral" aria-hidden />}
      {labels[status]}
    </span>
  );
}
