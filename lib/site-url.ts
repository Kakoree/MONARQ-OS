// Resolves the app's own public URL, used for the magic-link
// emailRedirectTo. Server-only — safe to read VERCEL_URL directly since
// nothing here needs to reach the client bundle.
//
// Order:
// 1. NEXT_PUBLIC_SITE_URL — set this explicitly for Production in Vercel.
// 2. VERCEL_URL — set automatically by Vercel on every deployment
//    (Production and Preview alike), no configuration needed. Only used
//    as a fallback so Preview deployments work without NEXT_PUBLIC_SITE_URL
//    having to be (mis)configured there too.
// 3. localhost — local dev, where neither of the above is set.
export function getSiteURL(): string {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_URL ??
    "http://localhost:3000";

  // VERCEL_URL is provided without a protocol (e.g. "my-app.vercel.app").
  if (!url.startsWith("http")) {
    url = `https://${url}`;
  }

  // Strip any trailing slash so callers can safely append a path.
  return url.replace(/\/+$/, "");
}
