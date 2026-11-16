"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Painting } from "@/lib/types";

const WALLS = [
  { name: "Warm white", color: "#efe9df" },
  { name: "Sage", color: "#b9c4b0" },
  { name: "Terracotta", color: "#c98b6b" },
  { name: "Charcoal", color: "#3b3936" },
];

/** The wall shown is 400 × 250 cm; the sofa is 210 cm wide. The painting is drawn to scale. */
const SCENE_WIDTH_CM = 400;
const SCENE_HEIGHT_CM = 250;

export function RoomView({ painting, onClose }: { painting: Painting; onClose: () => void }) {
  const [wall, setWall] = useState(WALLS[0]);
  const hasSize = Boolean(painting.width_cm && painting.height_cm);
  const w = painting.width_cm ?? 60;
  const h = painting.height_cm ?? 75;
  const img = painting.images[0];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Sofa back ends ~46% from the bottom; hang the painting ~10 cm above it.
  const widthPct = (w / SCENE_WIDTH_CM) * 100;
  const heightPct = (h / SCENE_HEIGHT_CM) * 100;
  const bottomPct = 50;

  return (
    <div role="dialog" aria-modal="true" aria-label={`${painting.title} shown in a room`} className="fixed inset-0 z-[70] flex flex-col bg-[#1a1918] p-3 sm:p-8">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between pb-3 text-white">
        <p className="font-serif text-xl italic">{painting.title}, in a living room</p>
        <button type="button" onClick={onClose} className="rounded-full bg-white/10 p-2 hover:bg-white/20" aria-label="Close room view" autoFocus>
          <X className="h-6 w-6" />
        </button>
      </div>
      <div className="mx-auto flex w-full max-w-5xl flex-1 items-center">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg transition-colors duration-500" style={{ background: wall.color }}>
          {/* soft light from the left */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/25 via-transparent to-black/10" />
          {/* floor */}
          <div className="absolute inset-x-0 bottom-0 h-[14%] bg-[#b08a63]" style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,.06) 0 1px, transparent 1px 12%)" }} />
          <div className="absolute inset-x-0 bottom-[14%] h-[1.2%] bg-white/70" />
          {/* painting */}
          {img && (
            <div className="absolute left-1/2 -translate-x-1/2 shadow-[6px_14px_24px_-6px_rgba(0,0,0,0.45)]" style={{ width: `${widthPct}%`, height: `${heightPct}%`, bottom: `${bottomPct}%` }}>
              <Image src={img.url} alt={img.alt} fill sizes="60vw" className="object-cover" />
            </div>
          )}
          {/* sofa (210 cm wide) */}
          <svg viewBox="0 0 210 85" className="absolute bottom-[12%] left-1/2 w-[52.5%] -translate-x-1/2" aria-hidden>
            <rect x="8" y="10" width="194" height="42" rx="10" fill="#d9d2c5" />
            <rect x="0" y="30" width="26" height="45" rx="10" fill="#cfc7b8" />
            <rect x="184" y="30" width="26" height="45" rx="10" fill="#cfc7b8" />
            <rect x="20" y="44" width="170" height="28" rx="6" fill="#e3ddd1" />
            <line x1="105" y1="44" x2="105" y2="72" stroke="#cfc7b8" strokeWidth="1.5" />
            <rect x="34" y="22" width="34" height="26" rx="6" fill="#e8664f" opacity=".85" />
            <rect x="146" y="24" width="30" height="24" rx="6" fill="#1f8a87" opacity=".8" />
            <rect x="14" y="74" width="5" height="10" fill="#6b5a48" />
            <rect x="191" y="74" width="5" height="10" fill="#6b5a48" />
          </svg>
          {/* plant */}
          <svg viewBox="0 0 40 90" className="absolute bottom-[13%] right-[6%] w-[7%]" aria-hidden>
            <path d="M20 60 C 5 40, 2 20, 12 5 M20 60 C 30 38, 38 22, 30 8 M20 60 C 18 40, 20 25, 22 12" stroke="#4f7942" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M8 58 h24 l-4 30 h-16z" fill="#c98b6b" />
          </svg>
        </div>
      </div>
      <div className="mx-auto mt-4 flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-2" role="radiogroup" aria-label="Wall color">
          {WALLS.map((c) => (
            <button
              key={c.name}
              type="button"
              role="radio"
              aria-checked={wall.name === c.name}
              aria-label={c.name}
              onClick={() => setWall(c)}
              className={`h-8 w-8 rounded-full border-2 ${wall.name === c.name ? "border-white" : "border-white/30"}`}
              style={{ background: c.color }}
            />
          ))}
        </div>
        <p className="text-xs text-white/70">
          {hasSize ? `Shown to scale above a 210 cm sofa (${w} × ${h} cm).` : "Approximate preview: exact size to be announced."}
        </p>
      </div>
    </div>
  );
}
