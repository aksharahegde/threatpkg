import { vi } from 'vitest'

export function mockFetch(impl: typeof fetch): () => void {
  const original = globalThis.fetch
  globalThis.fetch = vi.fn(impl) as typeof fetch
  return () => {
    globalThis.fetch = original
  }
}
