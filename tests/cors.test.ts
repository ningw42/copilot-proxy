import { describe, expect, test } from 'bun:test'

import { server } from '~/server'

function parseHeaderList(value: string | null): Array<string> {
  return value
    ?.split(',')
    .map(header => header.trim().toLowerCase())
    .filter(Boolean) ?? []
}

describe('CORS', () => {
  test('exposes request correlation and retry headers by default', async () => {
    const response = await server.request('/', {
      headers: {
        Origin: 'https://example.test',
      },
    })

    const exposedHeaders = parseHeaderList(response.headers.get('access-control-expose-headers'))

    expect(exposedHeaders).toContain('x-request-id')
    expect(exposedHeaders).toContain('retry-after')
    expect(exposedHeaders.some(header => header.startsWith('x-quota-snapshot'))).toBe(false)
  })
})
