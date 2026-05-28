import { clearToken, getToken } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL

/**
 * Core fetch wrapper.
 * - Prepends API_URL
 * - Injects Authorization header when a token exists
 * - On 401: clears token and redirects to /login
 */
async function request(path, options = {}) {
  const token = getToken()

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (res.status === 401) {
    clearToken()
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    throw new Error('Unauthorized')
  }

  return res
}

// ── Workspace / Auth ──────────────────────────────────────────────────────────

export async function createWorkspace({ name, owner_email, password, member_emails = [] }) {
  const res = await request('/workspaces/create', {
    method: 'POST',
    body: JSON.stringify({ name, owner_email, password, member_emails }),
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.detail || 'Failed to create workspace')
  }
  return res.json()
}

export async function login({ workspace_code, email, password }) {
  const res = await request('/workspaces/auth/login', {
    method: 'POST',
    body: JSON.stringify({ workspace_code, email, password }),
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.detail || 'Login failed')
  }
  return res.json() // { access_token, token_type }
}

// ── Documents ─────────────────────────────────────────────────────────────────

export async function listDocuments({ status, tags, uploaded_by, limit = 50, offset = 0 } = {}) {
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  if (tags?.length) tags.forEach((t) => params.append('tags', t))
  if (uploaded_by) params.set('uploaded_by', uploaded_by)
  params.set('limit', String(limit))
  params.set('offset', String(offset))

  const res = await request(`/documents?${params}`)
  if (!res.ok) throw new Error('Failed to load documents')
  return res.json()
}

export async function uploadDocument(file, tags = []) {
  const token = getToken()
  const form = new FormData()
  form.append('file', file)
  form.append('tags', tags.join(','))

  const res = await fetch(`${API_URL}/documents/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  })

  if (res.status === 401) {
    clearToken()
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.detail || 'Upload failed')
  }
  return res.json() // { document_id, status, message }
}

export async function getDocumentStatus(documentId) {
  const res = await request(`/documents/${documentId}/status`)
  if (!res.ok) throw new Error('Failed to fetch status')
  return res.json()
}

export async function deleteDocument(documentId) {
  const res = await request(`/documents/${documentId}`, { method: 'DELETE' })
  if (res.status !== 204 && !res.ok) throw new Error('Failed to delete document')
}
