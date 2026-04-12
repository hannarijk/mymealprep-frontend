import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { client, setTokenAccessor, setUnauthorizedHandler, type Paginated } from '@/api/client'

function mockFetch(status: number, body: unknown, headers: Record<string, string> = {}) {
  const response = {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : String(status),
    json: vi.fn().mockResolvedValue(body),
    headers: new Headers(headers),
  }
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))
  return response
}

beforeEach(() => {
  // Reset accessors to defaults before each test
  setTokenAccessor(() => null)
  setUnauthorizedHandler(() => {})
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('client', () => {
  it('GET returns parsed JSON', async () => {
    mockFetch(200, { id: '1', name: 'Oatmeal' })
    const result = await client.get<{ id: string; name: string }>('/recipes/1')
    expect(result).toEqual({ id: '1', name: 'Oatmeal' })
  })

  it('GET appends query params to URL', async () => {
    mockFetch(200, { data: [] })
    await client.get('/recipes', { limit: 100, search: 'oat' })
    const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
    expect(calledUrl).toContain('limit=100')
    expect(calledUrl).toContain('search=oat')
  })

  it('GET omits undefined/null query params', async () => {
    mockFetch(200, { data: [] })
    await client.get('/recipes', { section: undefined, tag: null, limit: 20 })
    const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
    expect(calledUrl).not.toContain('section')
    expect(calledUrl).not.toContain('tag')
    expect(calledUrl).toContain('limit=20')
  })

  it('POST sends JSON body and Content-Type header', async () => {
    mockFetch(201, { id: '1' })
    await client.post('/recipes', { name: 'Oatmeal', section: 'Breakfast' })
    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit]
    expect(init.method).toBe('POST')
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json')
    expect(JSON.parse(init.body as string)).toEqual({ name: 'Oatmeal', section: 'Breakfast' })
  })

  it('injects Authorization header when token accessor returns a value', async () => {
    setTokenAccessor(() => 'test-token-123')
    mockFetch(200, {})
    await client.get('/recipes')
    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit]
    expect((init.headers as Record<string, string>)['Authorization']).toBe('Bearer test-token-123')
  })

  it('omits Authorization header when token accessor returns null', async () => {
    setTokenAccessor(() => null)
    mockFetch(200, {})
    await client.get('/recipes')
    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit]
    expect((init.headers as Record<string, string>)['Authorization']).toBeUndefined()
  })

  it('throws ApiError with correct status on non-OK response', async () => {
    mockFetch(422, { error: 'Validation failed' })
    await expect(client.post('/auth/register', {})).rejects.toMatchObject({
      name: 'ApiError',
      status: 422,
      message: 'Validation failed',
    })
  })

  it('calls unauthorized handler and throws ApiError on 401', async () => {
    const handler = vi.fn()
    setUnauthorizedHandler(handler)
    mockFetch(401, { error: 'Unauthorized' })
    await expect(client.get('/recipes')).rejects.toMatchObject({ status: 401 })
    expect(handler).toHaveBeenCalledOnce()
  })

  it('returns undefined for 204 No Content', async () => {
    mockFetch(204, null)
    const result = await client.delete('/recipes/1')
    expect(result).toBeUndefined()
  })

  it('falls back to statusText when error response body has no error field', async () => {
    mockFetch(500, {})
    await expect(client.get('/recipes')).rejects.toMatchObject({
      status: 500,
    })
  })
})

describe('client.getAll', () => {
  afterEach(() => vi.unstubAllGlobals())

  function mockFetchSequence(responses: { status: number; body: unknown }[]) {
    const mocks = responses.map(({ status, body }) =>
      Promise.resolve({
        ok: status >= 200 && status < 300,
        status,
        statusText: 'OK',
        json: vi.fn().mockResolvedValue(body),
        headers: new Headers(),
      }),
    )
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => mocks.shift()))
  }

  it('returns all items from a single page', async () => {
    const page1: Paginated<{ id: string }> = { data: [{ id: '1' }, { id: '2' }], totalCount: 2 }
    mockFetchSequence([{ status: 200, body: page1 }])
    const result = await client.getAll<{ id: string }>('/items', { limit: 100 })
    expect(result).toEqual([{ id: '1' }, { id: '2' }])
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('fetches all pages and concatenates results', async () => {
    const page1: Paginated<{ id: string }> = { data: [{ id: '1' }], totalCount: 2 }
    const page2: Paginated<{ id: string }> = { data: [{ id: '2' }], totalCount: 2 }
    mockFetchSequence([
      { status: 200, body: page1 },
      { status: 200, body: page2 },
    ])
    const result = await client.getAll<{ id: string }>('/items', { limit: 1 })
    expect(result).toEqual([{ id: '1' }, { id: '2' }])
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('returns empty array when totalCount is 0', async () => {
    const empty: Paginated<{ id: string }> = { data: [], totalCount: 0 }
    mockFetchSequence([{ status: 200, body: empty }])
    const result = await client.getAll<{ id: string }>('/items', { limit: 100 })
    expect(result).toHaveLength(0)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('passes page=1 on the first request', async () => {
    const page1: Paginated<{ id: string }> = { data: [], totalCount: 0 }
    mockFetchSequence([{ status: 200, body: page1 }])
    await client.getAll<{ id: string }>('/items', { limit: 100 })
    const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
    expect(calledUrl).toContain('page=1')
  })

  it('propagates ApiError', async () => {
    mockFetchSequence([{ status: 500, body: { error: 'Server error' } }])
    await expect(client.getAll('/items')).rejects.toMatchObject({ status: 500 })
  })
})
