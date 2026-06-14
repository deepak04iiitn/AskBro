/**
 * Fires a browser CustomEvent that the RateLimitOverlay listens for.
 * Works from plain JS (outside React) so every API layer can call it.
 *
 * @param {number} retryAfter  seconds to wait before the user can retry (default 60)
 */
export function fireRateLimit(retryAfter = 60) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent('askbro:rate-limit', { detail: { retryAfter: Number(retryAfter) || 60 } })
  )
}

/**
 * Parses the Retry-After header value (seconds integer or HTTP-date string)
 * and returns seconds as a number.
 */
export function parseRetryAfter(header) {
  if (!header) return 60
  const secs = parseInt(header, 10)
  if (!isNaN(secs)) return secs
  // HTTP-date fallback
  const future = new Date(header).getTime()
  const now = Date.now()
  const diff = Math.ceil((future - now) / 1000)
  return diff > 0 ? diff : 60
}
