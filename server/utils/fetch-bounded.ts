/** Default max response body for RSS/XML ingest (2 MiB). */
export const DEFAULT_MAX_RESPONSE_BYTES = 2 * 1024 * 1024

export class ResponseTooLargeError extends Error {
  constructor(
    readonly maxBytes: number,
    readonly receivedBytes?: number
  ) {
    super(
      receivedBytes !== undefined
        ? `Response body exceeds ${maxBytes} bytes (got ${receivedBytes})`
        : `Response body exceeds ${maxBytes} bytes`
    )
    this.name = 'ResponseTooLargeError'
  }
}

export async function readResponseTextBounded(
  res: Response,
  maxBytes = DEFAULT_MAX_RESPONSE_BYTES
): Promise<string> {
  const contentLength = res.headers.get('content-length')
  if (contentLength) {
    const size = Number(contentLength)
    if (Number.isFinite(size) && size > maxBytes) {
      throw new ResponseTooLargeError(maxBytes, size)
    }
  }

  if (!res.body) {
    const text = await res.text()
    if (text.length > maxBytes) {
      throw new ResponseTooLargeError(maxBytes, text.length)
    }
    return text
  }

  const reader = res.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (!value?.byteLength) continue

      total += value.byteLength
      if (total > maxBytes) {
        throw new ResponseTooLargeError(maxBytes, total)
      }
      chunks.push(value)
    }
  } finally {
    try {
      await reader.cancel()
    } catch {
      /* ignore */
    }
  }

  const merged = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    merged.set(chunk, offset)
    offset += chunk.byteLength
  }

  return new TextDecoder().decode(merged)
}
