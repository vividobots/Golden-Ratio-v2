// src/utils/media.ts
// Helper to normalize media file paths from Django /media storage.
//
// Usage:
// import { normalizeMediaUrl } from './utils/media';
// <img src={normalizeMediaUrl(dbPathOrAbsoluteUrl)} />
const URL = "http://3.110.41.174:8000/";

export function normalizeMediaUrl(path?: string | null) {
  if (!path) return "";
  if (typeof path !== 'string') return "";
  if (path.startsWith("http")) return path;
  const p = path.startsWith("/") ? path.slice(1) : path;
  if (p.startsWith("media/")) return `${URL}${p}`;
  return `${URL}media/${p}`;
}
