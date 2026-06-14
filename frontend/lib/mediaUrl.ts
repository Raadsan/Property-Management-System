/** Resolve stored media paths for display (S3 URLs pass through as-is). */
export const getMediaUrl = (path?: string | null): string => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return path.replace(/\\/g, "/").replace(/^\//, "");
};
