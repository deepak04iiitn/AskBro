import { fireRateLimit, parseRetryAfter } from '@/lib/rateLimitEvent'

const API_URL = process.env.NEXT_PUBLIC_API_URL

function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('askbro_token')
}

async function authFetch(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }
  const res = await fetch(`${API_URL}${path}`, { ...options, headers })
  if (res.status === 401 && typeof window !== 'undefined') {
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }
  if (res.status === 429) {
    fireRateLimit(parseRetryAfter(res.headers.get('Retry-After')))
    throw new Error('Rate limit exceeded. Please wait before trying again.')
  }
  return res
}

export async function getNotionStatus() {
  const res = await authFetch('/integrations/notion/status')
  if (!res.ok) throw new Error('Failed to get Notion status')
  return res.json()
}

export async function connectNotion(token) {
  const res = await authFetch('/integrations/notion/connect', {
    method: 'POST',
    body: JSON.stringify({ token }),
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.detail || 'Failed to connect Notion')
  }
  return res.json()
}

export async function disconnectNotion() {
  const res = await authFetch('/integrations/notion/disconnect', { method: 'DELETE' })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.detail || 'Failed to disconnect')
  }
  return res.json()
}

export async function importNotionPage(pageUrl, fileName) {
  const res = await authFetch('/integrations/notion/import', {
    method: 'POST',
    body: JSON.stringify({ page_url: pageUrl, file_name: fileName }),
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.detail || 'Failed to import page')
  }
  return res.json()
}
