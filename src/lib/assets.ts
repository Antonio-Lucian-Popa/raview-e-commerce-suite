export function withAssetVersion(url?: string | null, version?: string | null) {
  if (!url) return '/placeholder.svg';
  if (!version) return url;

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${encodeURIComponent(version)}`;
}
