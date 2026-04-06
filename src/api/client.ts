export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

let getToken: () => string | null = () => null
let onUnauthorized: () => void = () => {}

export function setTokenAccessor(fn: () => string | null): void {
  getToken = fn
}

export function setUnauthorizedHandler(fn: () => void): void {
  onUnauthorized = fn
}

type Params = Record<string, string | number | boolean | undefined | null>

async function request<T>(
  method: string,
  path: string,
  options: { body?: unknown; params?: Params } = {},
): Promise<T> {
  const base = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'
  const url = new URL(base + path, window.location.origin)

  if (options.params) {
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value))
      }
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  if (res.status === 401) {
    onUnauthorized()
    throw new ApiError(401, 'Unauthorized')
  }

  if (!res.ok) {
    const payload = await res.json().catch(() => ({ error: res.statusText }))
    throw new ApiError(res.status, payload.error ?? res.statusText)
  }

  if (res.status === 204) {
    return undefined as T
  }

  return res.json() as Promise<T>
}

export const client = {
  get: <T>(path: string, params?: Params) => request<T>('GET', path, { params }),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, { body }),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, { body }),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, { body }),
  delete: <T = void>(path: string) => request<T>('DELETE', path),
}
