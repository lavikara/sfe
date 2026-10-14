import { afterEach, describe, expect, it, vi } from 'vitest'
import { api, ApiError } from './client'

describe('API client', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('throws ApiError for non-success HTTP responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: vi.fn().mockResolvedValue({
          error: { code: 'SERVICE_UNAVAILABLE', message: 'Please retry later' },
        }),
      })
    )
    vi.spyOn(console, 'log').mockImplementation(() => {})

    await expect(api.get('/transactions')).rejects.toEqual(
      new ApiError(503, 'SERVICE_UNAVAILABLE', 'Please retry later')
    )
  })
})
