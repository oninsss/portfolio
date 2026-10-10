const LOCAL_URL = "http://localhost:3000";

function toOrigin(value: string | undefined): URL | undefined {
  const raw = value?.trim();
  if (!raw) return undefined;
  try {
    return new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return undefined;
  }
}

export const siteUrl: URL | undefined = (() => {
  const url =
    toOrigin(process.env.NEXT_PUBLIC_SITE_URL) ??
    toOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  return url ? new URL(url.origin) : undefined;
})();

export const metadataBase: URL = siteUrl ?? new URL(LOCAL_URL);

export const calendarMonths = 12;
