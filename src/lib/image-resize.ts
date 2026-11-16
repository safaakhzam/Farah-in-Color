"use client";

/**
 * Shrinks a photo in the browser before uploading (phones take 5–10 MB photos).
 * Returns a JPEG/WebP File no larger than `maxSide` pixels on its longest side.
 */
export async function resizeImage(file: File, maxSide = 1600, type: "image/jpeg" | "image/webp" = "image/jpeg", quality = 0.84): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, type, quality));
    if (!blob || blob.size >= file.size) return file;
    const ext = type === "image/webp" ? "webp" : "jpg";
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + "." + ext, { type });
  } catch {
    return file; // e.g. HEIC on browsers that can't decode it; upload as-is
  }
}
