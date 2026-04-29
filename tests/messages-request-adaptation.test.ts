import type { AnthropicMessagesPayload } from '~/lib/translation/types'

import { describe, expect, test } from 'bun:test'

import {
  normalizeAdaptiveThinkingForCopilot,
  sanitizeForCopilotBackend,
  stripAssistantThinkingBlocks,
} from '~/routes/messages/request-adaptation'

function makePayload(
  overrides: Partial<AnthropicMessagesPayload> = {},
): AnthropicMessagesPayload {
  return {
    model: 'claude-opus-4.6',
    max_tokens: 64,
    messages: [{ role: 'user', content: 'Hi' }],
    ...overrides,
  }
}

describe('sanitizeForCopilotBackend', () => {
  test('strips unsupported native passthrough context_management', () => {
    const payload = makePayload() as AnthropicMessagesPayload & {
      context_management?: { clear_function_results?: boolean }
    }
    payload.context_management = { clear_function_results: true }

    sanitizeForCopilotBackend(payload)

    expect('context_management' in payload).toBe(false)
  })

  test('flattens legacy json_schema.schema and strips unsupported format metadata', () => {
    const schema = { type: 'object', properties: { ok: { type: 'boolean' } } }
    const payload = makePayload({
      output_config: {
        format: {
          type: 'json_schema',
          json_schema: { schema },
          name: 'response_shape',
          strict: true,
        },
      },
    })

    sanitizeForCopilotBackend(payload)

    expect(payload.output_config?.format).toEqual({
      type: 'json_schema',
      schema,
    })
  })

  test('rejects json_schema format with both flat and legacy nested schema', () => {
    const payload = makePayload({
      output_config: {
        format: {
          type: 'json_schema',
          schema: { type: 'object' },
          json_schema: { schema: { type: 'object' } },
        },
      },
    })

    expect(() => sanitizeForCopilotBackend(payload)).toThrow(
      'must use either flat "schema" or legacy "json_schema.schema", not both',
    )
  })

  test('rejects json_schema format without an object schema', () => {
    const payload = makePayload({
      output_config: {
        format: {
          type: 'json_schema',
          schema: 'not-an-object',
        },
      },
    })

    expect(() => sanitizeForCopilotBackend(payload)).toThrow(
      'requires an object "schema"',
    )
  })
})

describe('normalizeAdaptiveThinkingForCopilot', () => {
  test('rejects adaptive thinking budget_tokens', () => {
    const payload = makePayload({
      thinking: {
        type: 'adaptive',
        budget_tokens: 4096,
      } as AnthropicMessagesPayload['thinking'],
    })

    expect(() => normalizeAdaptiveThinkingForCopilot(payload)).toThrow(
      'thinking.adaptive.budget_tokens',
    )
  })

  test('strips unsupported adaptive thinking budget_tokens_max', () => {
    const payload = makePayload({
      thinking: {
        type: 'adaptive',
        display: 'omitted',
        budget_tokens_max: 4096,
      } as AnthropicMessagesPayload['thinking'],
    })

    normalizeAdaptiveThinkingForCopilot(payload)

    expect(payload.thinking).toEqual({
      type: 'adaptive',
      display: 'omitted',
    })
  })
})

describe('stripAssistantThinkingBlocks', () => {
  test('strips assistant thinking blocks and drops thinking-only assistant turns', () => {
    const payload = makePayload({
      messages: [
        { role: 'user', content: 'Start.' },
        {
          role: 'assistant',
          content: [
            { type: 'thinking', thinking: 'old reasoning', signature: 'sig_1' },
            { type: 'redacted_thinking', data: 'redacted' },
          ],
        },
        { role: 'user', content: 'Continue.' },
        {
          role: 'assistant',
          content: [
            { type: 'thinking', thinking: 'more reasoning', signature: 'sig_2' },
            { type: 'text', text: 'Visible answer.' },
          ],
        },
      ],
    })

    const result = stripAssistantThinkingBlocks(payload)

    expect(result.stripped).toBe(true)
    expect(result.strippedBlocks).toBe(3)
    expect(result.droppedAssistantMessages).toBe(1)
    expect(result.payload.messages).toEqual([
      { role: 'user', content: 'Start.' },
      { role: 'user', content: 'Continue.' },
      {
        role: 'assistant',
        content: [
          { type: 'text', text: 'Visible answer.' },
        ],
      },
    ])
  })

  test('returns the original payload when there are no assistant thinking blocks', () => {
    const payload = makePayload({
      messages: [
        { role: 'user', content: 'Start.' },
        { role: 'assistant', content: [{ type: 'text', text: 'Visible answer.' }] },
      ],
    })

    const result = stripAssistantThinkingBlocks(payload)

    expect(result).toEqual({
      payload,
      stripped: false,
      strippedBlocks: 0,
      droppedAssistantMessages: 0,
    })
    expect(result.payload).toBe(payload)
  })
})
