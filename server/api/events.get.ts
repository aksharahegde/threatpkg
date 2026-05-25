export default defineEventHandler((event) => {
  setResponseHeader(event, 'Content-Type', 'text/event-stream')
  setResponseHeader(event, 'Cache-Control', 'no-cache')
  setResponseHeader(event, 'Connection', 'keep-alive')

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      const send = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`))
      }

      send(JSON.stringify({ type: 'connected', at: new Date().toISOString() }))

      const interval = setInterval(() => {
        send(JSON.stringify({ type: 'heartbeat', at: new Date().toISOString() }))
      }, 30000)

      event.node.req.on('close', () => {
        clearInterval(interval)
        controller.close()
      })
    }
  })

  return stream
})
