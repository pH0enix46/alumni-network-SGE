import "server-only";

function headersToObject(
  headers: HeadersInit | undefined,
): Record<string, string> {
  if (!headers) {
    return {};
  }

  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }

  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }

  if (typeof headers === "object") {
    return { ...headers } as Record<string, string>;
  }

  return {};
}

export async function getAdminHeaders({
  json = true,
  headers = {},
}: { json?: boolean; headers?: HeadersInit } = {}) {
  // Using SECRET_KEY from study-abroad-expo/.env
  const ADMIN_SECRET = process.env.SECRET_KEY;

  if (!ADMIN_SECRET) {
    console.error("SECRET_KEY is missing from environment variables.");
  }

  const merged = {
    ...(json ? { "Content-Type": "application/json" } : {}),
    ...headersToObject(headers),
    "x-admin-secret":
      ADMIN_SECRET ||
      "dc6410c09a63f3efb5765bb456e161320ba2aa637bb6f0bb482d33b82df9c6ff",
  };

  return merged;
}

export async function secureApiFetch(
  url: string,
  {
    json = true,
    headers = {},
    cache = "no-store" as RequestCache,
    ...init
  }: RequestInit & { json?: boolean } = {},
) {
  const mergedHeaders = await getAdminHeaders({
    json,
    headers,
  });

  return fetch(url, {
    ...init,
    cache,
    headers: mergedHeaders,
  });
}

export async function getRegistrations() {
  const API_BASE = process.env.BACKEND_URL || "https://api.shabujglobal.com";

  const query = new URLSearchParams({
    page: "1",
    perPage: "100", // Fetching a larger batch as per "all registrations" request
    sortBy: "desc",
  });

  try {
    const res = await secureApiFetch(
      `${API_BASE}/alumni-network?${query.toString()}`,
      {
        cache: "no-store",
      },
    );

    if (!res.ok) {
      console.error("Failed to fetch registrations", res.status);
      return [];
    }

    const payload = await res.json();
    const data = payload.data || [];
    
    console.log("ALL ALUMNI DATA FETCHED FROM API:", JSON.stringify(data, null, 2));

    // Filter out test registrations (where name includes "test" or "tst")
    return data.filter((reg: any) => {
      const name = (reg.fullName || "").toLowerCase();
      return !name.includes("test") && !name.includes("tst");
    });
  } catch (err) {
    console.error("Error in getRegistrations:", err);
    return [];
  }
}
