import Image from "next/image";
import Link from "next/link";
import { formatPrice, formatDimensions } from "@/lib/format";
import type { Painting } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

/**
 * "natural": image at its real proportions (used in masonry layouts).
 * "framed": painting hung inside a uniform wall-coloured box, so a grid stays
 *           aligned and sorted left-to-right (used in the shop).
 */
export function PaintingCard({
  painting,
  priority = false,
  variant = "natural",
}: {
  painting: Painting;
  priority?: boolean;
  variant?: "natural" | "framed";
}) {
  const img = painting.images[0];
  const unavailable = painting.status !== "available";
  const ratio = (painting.height_cm ?? 5) / (painting.width_cm ?? 4);

  return (
    <Link href={`/paintings/${painting.slug}`} className="group block">
      <div className={`relative overflow-hidden bg-sand ${variant === "framed" ? "flex aspect-[4/5] items-center justify-center p-[12%]" : ""}`}>
        {img ? (
          <Image
            src={img.url}
            alt={img.alt || painting.title}
            width={800}
            height={Math.round(800 * ratio)}
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
            priority={priority}
            className={`transition duration-700 group-hover:scale-[1.03] ${
              variant === "framed"
                ? "max-h-full w-auto object-contain shadow-[0_14px_28px_-12px_rgba(31,29,27,0.45)]"
                : "h-auto w-full"
            } ${unavailable ? "opacity-85" : ""}`}
          />
        ) : (
          <div className="aspect-[4/5] w-full" />
        )}
        {unavailable && <StatusBadge status={painting.status} className="absolute left-3 top-3 shadow-sm" />}
      </div>
      <div className="mt-3 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl leading-tight">{painting.title}</h3>
          <p className="mt-0.5 text-sm text-muted">
            {painting.medium}
            {painting.width_cm ? ` · ${formatDimensions(painting).split(" (")[0]}` : ""}
          </p>
        </div>
        <p className={`shrink-0 text-sm font-medium ${painting.status === "sold" ? "text-muted" : ""}`}>
          {painting.status === "sold" ? "Sold" : formatPrice(painting.price_usd)}
        </p>
      </div>
    </Link>
  );
}
