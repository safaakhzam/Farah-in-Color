"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Sofa, X, ZoomIn } from "lucide-react";
import type { Painting } from "@/lib/types";
import { RoomView } from "./RoomView";

/** Main image + thumbnails, a full-screen zoom viewer and the "View in a room" mockup. */
export function PaintingGallery({ painting }: { painting: Painting }) {
  const images = painting.images.length ? painting.images : [{ url: "", alt: painting.title }];
  const [index, setIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [roomOpen, setRoomOpen] = useState(false);
  const current = images[index];
  const ratio = (painting.height_cm ?? 5) / (painting.width_cm ?? 4);

  return (
    <div>
      <div className="relative bg-sand">
        <button
          type="button"
          onClick={() => setZoomOpen(true)}
          className="group relative block w-full cursor-zoom-in"
          aria-label={`Zoom into ${current.alt}`}
        >
          {current.url && (
            <Image
              src={current.url}
              alt={current.alt}
              width={1400}
              height={index === 0 ? Math.round(1400 * ratio) : 1400}
              priority
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="mx-auto h-auto max-h-[80vh] w-auto object-contain"
            />
          )}
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium shadow-sm">
            <ZoomIn className="h-3.5 w-3.5" /> Zoom
          </span>
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        {images.length > 1 ? (
          <div className="flex gap-2" role="tablist" aria-label="Painting images">
            {images.map((img, i) => (
              <button
                key={img.url + i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Show image ${i + 1}: ${img.alt}`}
                onClick={() => setIndex(i)}
                className={`relative h-16 w-16 overflow-hidden bg-sand ring-offset-2 transition ${i === index ? "ring-2 ring-ink" : "opacity-70 hover:opacity-100"}`}
              >
                {img.url && <Image src={img.url} alt="" fill sizes="64px" className="object-cover" />}
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}
        <button type="button" onClick={() => setRoomOpen(true)} className="btn-outline px-4 py-2.5">
          <Sofa className="h-4 w-4" /> View in a room
        </button>
      </div>

      {zoomOpen && <ZoomViewer src={current.url} alt={current.alt} onClose={() => setZoomOpen(false)} />}
      {roomOpen && <RoomView painting={painting} onClose={() => setRoomOpen(false)} />}
    </div>
  );
}

/** Full-screen viewer. Tap/click to zoom in at that point, move to pan, tap again to zoom out. */
function ZoomViewer({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");

  const onKey = useCallback((e: KeyboardEvent) => e.key === "Escape" && onClose(), [onClose]);
  useEffect(() => {
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onKey]);

  const point = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <div role="dialog" aria-modal="true" aria-label={`Zoomed view: ${alt}`} className="fixed inset-0 z-[70] flex items-center justify-center bg-[#141312]/95 p-4">
      <button type="button" onClick={onClose} className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" aria-label="Close zoom" autoFocus>
        <X className="h-6 w-6" />
      </button>
      <div
        className={`relative h-full w-full overflow-hidden ${zoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`}
        style={{ touchAction: zoomed ? "none" : "auto" }}
        onPointerDown={(e) => {
          point(e);
          setZoomed((z) => !z);
        }}
        onPointerMove={(e) => zoomed && point(e)}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="100vw"
          quality={85}
          className="select-none object-contain transition-transform duration-300 ease-out"
          style={{ transform: zoomed ? "scale(2.6)" : "scale(1)", transformOrigin: origin }}
          draggable={false}
        />
      </div>
      <p className="pointer-events-none absolute bottom-4 left-0 right-0 text-center text-xs text-white/60">
        {zoomed ? "Move to explore · tap to zoom out" : "Tap anywhere to zoom in"}
      </p>
    </div>
  );
}
