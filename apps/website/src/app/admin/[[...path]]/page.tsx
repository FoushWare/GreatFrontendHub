import { redirect } from "next/navigation";

type QueryValue = string | string[] | undefined;
type QueryParams = Record<string, QueryValue>;

type Props = {
  params: Promise<{ path?: string[] }>;
  searchParams?: Promise<QueryParams>;
};

function getAdminBaseUrl(): string {
  const configured = process.env.ADMIN_URL?.trim().replace(/\/+$/, "");

  if (configured) {
    try {
      const url = new URL(configured);
      if (
        url.hostname !== "elzatona-web.com" &&
        !url.hostname.endsWith(".elzatona-web.com")
      ) {
        return configured;
      }
    } catch {
      // If it's a relative path or invalid URL, fallback to default
    }
  }

  return "https://elzatona-admin.vercel.app";
}

function buildRedirectUrl(
  adminPath: string[] | undefined,
  searchParams: QueryParams,
): string {
  const baseUrl = getAdminBaseUrl();
  const pathname =
    adminPath && adminPath.length > 0 ? `/${adminPath.join("/")}` : "";
  const qs = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        qs.append(key, item);
      }
      continue;
    }

    qs.set(key, value);
  }

  const query = qs.toString();
  return `${baseUrl}/admin${pathname}${query ? `?${query}` : ""}`;
}

export default async function AdminProxyFallbackPage({
  params,
  searchParams,
}: Props): Promise<never> {
  const resolvedParams = await params;
  const resolvedSearchParams = (
    searchParams ? await searchParams : {}
  ) as QueryParams;

  redirect(buildRedirectUrl(resolvedParams.path, resolvedSearchParams));
}
