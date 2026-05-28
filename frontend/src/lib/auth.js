const TOKEN_KEY = 'askbro_token'

export function saveToken(token) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token)
  }
}

export function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY)
  }
  return null
}

export function clearToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY)
  }
}

/**
 * Decode JWT payload without verification.
 * Returns { email, role, workspace_id, workspace_code, exp } or null on failure.
 */
export function getPayload() {
  const token = getToken()
  if (!token) return null
  try {
    const base64 = token.split('.')[1]
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function isAuthenticated() {
  const payload = getPayload()
  if (!payload) return false
  // Check expiry (exp is in seconds)
  return payload.exp * 1000 > Date.now()
}
