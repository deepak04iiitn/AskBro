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
  return res.json()
}

/**
 * Upload with real byte-level progress via XHR.
 * onProgress(0–100) is called as bytes are sent.
 */
export function uploadDocumentWithProgress(file, tags = [], onProgress) {
  return new Promise((resolve, reject) => {
    const token = getToken()
    const form = new FormData()
    form.append('file', file)
    form.append('tags', tags.join(','))

    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${API_URL}/documents/upload`)
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status === 401) {
        clearToken()
        window.location.href = '/login'
        return reject(new Error('Unauthorized'))
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        try { resolve(JSON.parse(xhr.responseText)) }
        catch { reject(new Error('Invalid server response')) }
      } else {
        try {
          const body = JSON.parse(xhr.responseText)
          reject(new Error(body.detail || 'Upload failed'))
        } catch {
          reject(new Error('Upload failed'))
        }
      }
    })

    xhr.addEventListener('error', () => reject(new Error('Network error during upload')))
    xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')))

    xhr.send(form)
  })
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

// ── Members ───────────────────────────────────────────────────────────────────

export async function listMembers() {
  const res = await request('/workspaces/members')
  if (!res.ok) throw new Error('Failed to load members')
  return res.json()
}

export async function addMember(email) {
  const res = await request('/workspaces/members/add', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.detail || 'Failed to add member')
  }
  return res.json()
}

export async function removeMember(email) {
  const res = await request(`/workspaces/members/${encodeURIComponent(email)}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.detail || 'Failed to remove member')
  }
  return res.json()
}

// ── Chat history ──────────────────────────────────────────────

export async function createChat() {
  const res = await request('/chat/chats', { method: 'POST' })
  if (!res.ok) throw new Error('Failed to create chat')
  return res.json() // { id, title, created_at, updated_at }
}

export async function listChats() {
  const res = await request('/chat/chats')
  if (!res.ok) throw new Error('Failed to list chats')
  return res.json()
}

export async function getChatMessages(chatId) {
  const res = await request(`/chat/chats/${chatId}/messages`)
  if (!res.ok) throw new Error('Failed to load messages')
  return res.json()
}

export async function deleteChatApi(chatId) {
  const res = await request(`/chat/chats/${chatId}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete chat')
  return res.json()
}
