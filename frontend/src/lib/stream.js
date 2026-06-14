import { clearToken, getToken } from '@/lib/auth'
import { fireRateLimit, parseRetryAfter } from '@/lib/rateLimitEvent'

const API_URL = process.env.NEXT_PUBLIC_API_URL

/**
 * Async generator that streams chat tokens from the SSE endpoint.
 *
 * Yields objects of two shapes:
 *   { token: string, done: false }   — a text token from the LLM
 *   { citations: [...], done: true } — final event; stop iterating after this
 *
 * @param {string} query
 * @param {string} chatId — chat session ID (create via POST /chat/chats first)
 * @param {string[] | undefined} documentIds
 */
export async function* streamChat(query, chatId, documentIds, source = 'all', repoIds) {
  const token = getToken()

  const res = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      query,
      chat_id: chatId,
      document_ids: documentIds ?? null,
      repo_ids: repoIds ?? null,
      source: source ?? 'all',
    }),
  })

  if (res.status === 401) {
    clearToken()
    window.location.href = '/login'
    return
  }

  if (res.status === 429) {
    fireRateLimit(parseRetryAfter(res.headers.get('Retry-After')))
    throw new Error('Rate limit exceeded. Please wait before trying again.')
  }

  if (!res.ok) {
    throw new Error(`Chat request failed: ${res.status}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    // SSE lines are separated by "\n\n"
    const parts = buffer.split('\n\n')
    buffer = parts.pop() // keep incomplete trailing chunk

    for (const part of parts) {
      const line = part.trim()
      if (!line.startsWith('data:')) continue

      const json = line.slice('data:'.length).trim()
      if (!json) continue

      try {
        const event = JSON.parse(json)
        yield event
        if (event.done === true) return
      } catch {
        // malformed event — skip
      }
    }
  }
}
