export function getImageUrl(filename?: string) {
  if (!filename) return "";

  // If filename is already a full URL, return it as is
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }

  const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

  // Only encode if it's not already a full URL
  const encoded = encodeURIComponent(filename);

  return `${BASE}/media/${encoded}`;
}
