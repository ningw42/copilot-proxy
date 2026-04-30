import { describe, expect, test } from 'bun:test'

import { getModelConfig } from '../src/lib/model-config'

describe('getModelConfig', () => {
  test('should return config with enableCacheControl and defaultReasoningEffort for claude-opus-4.6', () => {
    const config = getModelConfig('claude-opus-4.6')
    expect(config.enableCacheControl).toBe(true)
    expect(config.defaultReasoningEffort).toBe('high')
    expect(config.supportsToolChoice).toBe(true)
    expect(config.supportedReasoningEfforts).toEqual(['low', 'medium', 'high'])
    expect(config.supportedApis).toEqual(['anthropic-messages', 'chat-completions'])
    expect(config.preferredApi).toBe('anthropic-messages')
  })

  test('should let claude-opus-4.6-fast inherit the claude-opus-4.6 config', () => {
    const config = getModelConfig('claude-opus-4.6-fast')
    expect(config.enableCacheControl).toBe(true)
    expect(config.defaultReasoningEffort).toBe('high')
    expect(config.supportsToolChoice).toBe(true)
    expect(config.supportsParallelToolCalls).toBe(true)
    expect(config.supportedReasoningEfforts).toEqual(['low', 'medium', 'high'])
    expect(config.supportedApis).toEqual(['anthropic-messages', 'chat-completions'])
    expect(config.preferredApi).toBe('anthropic-messages')
  })

  test('should let claude-opus-4.6-1m inherit the claude-opus-4.6 config', () => {
    const config = getModelConfig('claude-opus-4.6-1m')
    expect(config.enableCacheControl).toBe(true)
    expect(config.defaultReasoningEffort).toBe('high')
    expect(config.supportsToolChoice).toBe(true)
    expect(config.supportsParallelToolCalls).toBe(true)
    expect(config.supportedReasoningEfforts).toEqual(['low', 'medium', 'high'])
    expect(config.supportedApis).toEqual(['anthropic-messages', 'chat-completions'])
    expect(config.preferredApi).toBe('anthropic-messages')
  })

  test('should configure claude-opus-4.7 with medium-only reasoning', () => {
    const config = getModelConfig('claude-opus-4.7')
    expect(config.enableCacheControl).toBe(true)
    expect(config.defaultReasoningEffort).toBe('medium')
    expect(config.supportsToolChoice).toBe(false)
    expect(config.supportsParallelToolCalls).toBe(true)
    expect(config.supportedReasoningEfforts).toEqual(['medium'])
    expect(config.supportedApis).toEqual(['anthropic-messages', 'chat-completions'])
    expect(config.preferredApi).toBe('anthropic-messages')
  })

  test('should configure claude-opus-4.7-1m-internal with xhigh reasoning support', () => {
    const config = getModelConfig('claude-opus-4.7-1m-internal')
    expect(config.enableCacheControl).toBe(true)
    expect(config.defaultReasoningEffort).toBe('high')
    expect(config.supportsToolChoice).toBe(false)
    expect(config.supportsParallelToolCalls).toBe(true)
    expect(config.supportedReasoningEfforts).toEqual(['low', 'medium', 'high', 'xhigh'])
    expect(config.supportedApis).toEqual(['anthropic-messages', 'chat-completions'])
    expect(config.preferredApi).toBe('anthropic-messages')
  })

  test('should return config with reasoningMode for gpt-5.2-codex', () => {
    const config = getModelConfig('gpt-5.2-codex')
    expect(config.reasoningMode).toBe('thinking')
    expect(config.supportedApis).toEqual(['responses'])
  })

  test('should let o3-mini variants inherit the responses config', () => {
    const config = getModelConfig('o3-mini-high')
    expect(config.reasoningMode).toBe('thinking')
    expect(config.supportedApis).toEqual(['responses'])
  })

  test('should match gpt-5.2-codex-max via prefix match', () => {
    const config = getModelConfig('gpt-5.2-codex-max')
    expect(config.reasoningMode).toBe('thinking')
    expect(config.defaultReasoningEffort).toBe('high')
    expect(config.supportedReasoningEfforts).toEqual([
      'low',
      'medium',
      'high',
      'xhigh',
    ])
  })

  test('should return default config for unknown-model', () => {
    const config = getModelConfig('unknown-model')
    expect(config.supportedApis).toEqual(['chat-completions'])
  })

  test('should not match adjacent model versions by raw prefix', () => {
    const config = getModelConfig('gpt-5.20')
    expect(config.supportedApis).toEqual(['chat-completions'])
  })

  test('should return default Claude config for claude-unknown', () => {
    const config = getModelConfig('claude-unknown')
    expect(config.enableCacheControl).toBe(true)
    expect(config.supportsToolChoice).toBe(false)
  })

  test('should return exact match config for claude-sonnet-4', () => {
    const config = getModelConfig('claude-sonnet-4')
    expect(config.enableCacheControl).toBe(true)
    expect(config.supportsToolChoice).toBe(false)
    expect(config.supportsParallelToolCalls).toBe(false)
  })

  test('should return exact match config for claude-sonnet-4.6', () => {
    const config = getModelConfig('claude-sonnet-4.6')
    expect(config.enableCacheControl).toBe(true)
    expect(config.defaultReasoningEffort).toBe('high')
    expect(config.supportedReasoningEfforts).toEqual(['low', 'medium', 'high'])
    expect(config.supportsToolChoice).toBe(true)
    expect(config.supportsParallelToolCalls).toBe(true)
    expect(config.supportedApis).toEqual(['anthropic-messages', 'chat-completions'])
    expect(config.preferredApi).toBe('anthropic-messages')
  })

  test('should return exact match config for gpt-4o', () => {
    const config = getModelConfig('gpt-4o')
    expect(config.supportsToolChoice).toBe(true)
    expect(config.supportsParallelToolCalls).toBe(true)
  })

  test('should configure gpt-5.4 as responses-only', () => {
    const config = getModelConfig('gpt-5.4')
    expect(config.supportedApis).toEqual(['responses'])
    expect(config.reasoningMode).toBe('thinking')
    expect(config.defaultReasoningEffort).toBe('high')
    expect(config.supportedReasoningEfforts).toEqual(['low', 'medium', 'high', 'xhigh'])
  })

  test('should configure gpt-5.5 as responses-only', () => {
    const config = getModelConfig('gpt-5.5')
    expect(config.supportedApis).toEqual(['responses'])
    expect(config.reasoningMode).toBe('thinking')
    expect(config.defaultReasoningEffort).toBe('medium')
    expect(config.supportedReasoningEfforts).toEqual(['none', 'low', 'medium', 'high', 'xhigh'])
    expect(config.supportsToolChoice).toBe(true)
    expect(config.supportsParallelToolCalls).toBe(true)
  })

  test('should configure gpt-5.1 as both APIs', () => {
    const config = getModelConfig('gpt-5.1')
    expect(config.supportedApis).toEqual(['chat-completions', 'responses'])
    expect(config.preferredApi).toBe('responses')
  })

  test('should configure gpt-5 as both APIs', () => {
    const config = getModelConfig('gpt-5')
    expect(config.supportedApis).toEqual(['chat-completions', 'responses'])
    expect(config.preferredApi).toBe('responses')
  })

  test('should configure gpt-5.1-codex as responses-only', () => {
    const config = getModelConfig('gpt-5.1-codex')
    expect(config.supportedApis).toEqual(['responses'])
    expect(config.reasoningMode).toBe('thinking')
  })

  test('should match gemini models via prefix', () => {
    const config = getModelConfig('gemini-3.1-pro-preview')
    expect(config.supportedApis).toEqual(['chat-completions'])
  })
})
