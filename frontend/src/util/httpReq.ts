export async function fetcher<T>(
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  secure: boolean = true,
  body?: T,
) {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    ...(secure ? { credentials: "include" } : {}),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();

  return {
    status: res.status,
    ok: res.ok,
    data,
  };
}
