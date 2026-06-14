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

async function json(res) {
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Request failed')
  return data
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function getGitHubStatus() {
  return json(await authFetch('/github/status'))
}

export async function connectGitHubPAT(token) {
  return json(await authFetch('/github/connect/pat', {
    method: 'POST',
    body: JSON.stringify({ token }),
  }))
}

export async function getGitHubOAuthUrl() {
  return json(await authFetch('/github/oauth/start'))
}

export async function disconnectGitHub() {
  return json(await authFetch('/github/disconnect', { method: 'DELETE' }))
}

// ── Repos ─────────────────────────────────────────────────────────────────────

export async function listAvailableRepos() {
  return json(await authFetch('/github/repos/available'))
}

export async function listRepoBranches(owner, repo) {
  return json(await authFetch(`/github/repos/branches?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`))
}

export async function listImportedRepos() {
  return json(await authFetch('/github/repos'))
}

export async function getRepoStatus(repoId) {
  return json(await authFetch(`/github/repos/${repoId}`))
}

export async function importRepo(payload) {
  // payload: { owner, repo_name, branch, include_issues, include_prs, include_commits, auto_sync, filters }
  return json(await authFetch('/github/repos/import', {
    method: 'POST',
    body: JSON.stringify(payload),
  }))
}

export async function syncRepo(repoId, forceFull = false) {
  return json(await authFetch(`/github/repos/${repoId}/sync`, {
    method: 'POST',
    body: JSON.stringify({ force_full: forceFull }),
  }))
}

export async function removeRepo(repoId) {
  return json(await authFetch(`/github/repos/${repoId}`, { method: 'DELETE' }))
}
