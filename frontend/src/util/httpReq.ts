export async function fetcher<K, T = unknown>(
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  secure: boolean = true,
  query?: Record<string, string | number>,
  body?: T,
) {
  const q = Object.entries(query ?? {})
    .map(([key, val], indx) =>
      indx === 0 ? `?${key}:${val}` : `${key}:${val}`,
    )
    .join("&");

  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}${url}${q}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    ...(secure ? { credentials: "include" } : {}),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = (await res.json()) as K;

  return {
    status: res.status,
    ok: res.ok,
    data,
  };
}
