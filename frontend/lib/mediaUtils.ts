export const MAX_PROPERTY_MEDIA = 30;

const VIDEO_EXT = /\.(mp4|mov|webm|avi|mkv|m4v|ogg)(\?|$)/i;

export function isVideoMedia(urlOrFile: string | File): boolean {
  if (typeof urlOrFile !== "string") {
    return urlOrFile.type.startsWith("video/");
  }
  return VIDEO_EXT.test(urlOrFile);
}

export function resolveMediaUrl(url: string): string {
  if (url.startsWith("http")) return url;
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://property-management-system-production-e024.up.railway.app/api";
  const baseUrl = apiUrl.replace(/\/api\/?$/, "");
  return `${baseUrl}/${url.replace(/\\/g, "/").replace(/^\//, "")}`;
}

export function isVideoItem(item: { type?: string; url: string }): boolean {
  return item.type === "VIDEO" || isVideoMedia(item.url);
}

/** Videos first, then images (newest first within each group). */
export function sortMediaVideosFirst<T extends { id?: number; type?: string; url: string }>(
  items: T[]
): T[] {
  return [...items].sort((a, b) => {
    const aVideo = isVideoItem(a) ? 0 : 1;
    const bVideo = isVideoItem(b) ? 0 : 1;
    if (aVideo !== bVideo) return aVideo - bVideo;
    return (b.id ?? 0) - (a.id ?? 0);
  });
}
