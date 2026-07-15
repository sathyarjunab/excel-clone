export async function fetchMe<T>(url: string, body: T) {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}
