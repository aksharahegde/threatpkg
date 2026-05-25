import { describe, expect, it } from 'vitest'
import {
  readResponseTextBounded,
  ResponseTooLargeError
} from './fetch-bounded'

describe('readResponseTextBounded', () => {
  it('returns text under the limit', async () => {
    const res = new Response('hello', {
      headers: { 'Content-Length': '5' }
    })
    expect(await readResponseTextBounded(res, 100)).toBe('hello')
  })

  it('rejects Content-Length over the limit', async () => {
    const res = new Response('x', {
      headers: { 'Content-Length': '9999' }
    })
    await expect(readResponseTextBounded(res, 100)).rejects.toBeInstanceOf(
      ResponseTooLargeError
    )
  })

  it('rejects streamed bodies over the limit', async () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(50))
        controller.enqueue(new Uint8Array(60))
        controller.close()
      }
    })
    const res = new Response(stream)
    await expect(readResponseTextBounded(res, 100)).rejects.toBeInstanceOf(
      ResponseTooLargeError
    )
  })
})
