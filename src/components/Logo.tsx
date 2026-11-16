import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/config";

/**
 * Placeholder text wordmark. When a real logo exists, set `siteConfig.logo`
 * (src/lib/config.ts) to its path in /public and this renders the image instead.
 */
export function Logo({ className = "", size = "md" }: { className?: string; size?: "md" | "lg" }) {
  const text = size === "lg" ? "text-4xl sm:text-5xl" : "text-2xl sm:text-[1.7rem]";
  return (
    <Link href="/" className={`inline-flex items-baseline leading-none ${className}`} aria-label="Farah in Color, home">
      {siteConfig.logo ? (
        <Image src={siteConfig.logo} alt="Farah in Color" width={180} height={48} priority className="h-10 w-auto" />
      ) : (
        <span className={`font-serif ${text} tracking-tight`}>
          Farah <span className="italic text-muted">in</span>{" "}
          <span className="text-color-gradient font-medium italic">Color</span>
        </span>
      )}
    </Link>
  );
}
