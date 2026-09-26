/** Fetch helper for admin and learner JSON APIs: throws an Error with the server's message. */
export class ApiError extends Error {
  constructor(message: string, public status: number, public field: string | null = null, public code: string | null = null) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function api<T>(url: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, ...rest } = init
  const res = await fetch(url, {
    ...rest,
    headers: { ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(rest.headers || {}) },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
    credentials: 'same-origin',
  })
  const body = (await res.json().catch(() => null)) as (T & { error?: string; field?: string | null; code?: string | null }) | null
  if (!res.ok) throw new ApiError(body?.error || `Request failed (${res.status})`, res.status, body?.field ?? null, body?.code ?? null)
  return body as T
}
