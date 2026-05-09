import { describe, expect, test } from 'bun:test'

import { redactDeviceCodeResponse } from '~/lib/token'
import { redactAccessTokenPollResponse } from '~/services/github/poll-access-token'

describe('auth logging redaction', () => {
  test('redacts device_code from verbose device-flow logging', () => {
    const response = {
      device_code: 'device-secret',
      user_code: 'ABCD-EFGH',
      verification_uri: 'https://github.com/login/device',
      expires_in: 900,
      interval: 5,
    }

    const redacted = redactDeviceCodeResponse(response)

    expect(redacted).toEqual({
      ...response,
      device_code: '<redacted>',
    })
    expect(JSON.stringify(redacted)).not.toContain('device-secret')
    expect(response.device_code).toBe('device-secret')
  })

  test('redacts access_token from verbose device-flow polling logs', () => {
    const response = {
      access_token: 'ghu_secret_access_token',
      token_type: 'bearer',
      scope: 'read:user',
    }

    const redacted = redactAccessTokenPollResponse(response)

    expect(redacted).toEqual({
      ...response,
      access_token: '<redacted>',
    })
    expect(JSON.stringify(redacted)).not.toContain('ghu_secret_access_token')
    expect(response.access_token).toBe('ghu_secret_access_token')
  })

  test('leaves non-token polling responses intact', () => {
    const response = {
      error: 'authorization_pending',
      error_description: 'The authorization request is still pending.',
    }

    expect(redactAccessTokenPollResponse(response)).toEqual(response)
  })
})
