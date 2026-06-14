const API_URL = process.env.NEXT_PUBLIC_API_URL

function getAdminToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('askbro_admin_token')
}

async function adminRequest(path, options = {}) {
  const token = getAdminToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }
  const res = await fetch(`${API_URL}${path}`, { ...options, headers })
  if (res.status === 401) {
    localStorage.removeItem('askbro_admin_token')
    window.location.href = '/admin/login'
    throw new Error('Unauthorized')
  }
  return res
}

export async function adminLogin(email, password) {
  const res = await fetch(`${API_URL}/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.detail || 'Login failed')
  }
  return res.json()
}

export async function adminVerifyOtp(email, otp) {
  const res = await fetch(`${API_URL}/admin/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.detail || 'Invalid OTP')
  }
  return res.json()
}

export async function fetchAdminMetrics() {
  const res = await adminRequest('/admin/metrics')
  if (!res.ok) throw new Error('Failed to fetch metrics')
  return res.json()
}

// ── Blog admin ────────────────────────────────────────────────────────────────

export async function adminFetchPosts() {
  const res = await adminRequest('/blog/admin/posts')
  if (!res.ok) throw new Error('Failed to fetch posts')
  return res.json()
}

export async function adminFetchPost(id) {
  const res = await adminRequest(`/blog/admin/posts/${id}`)
  if (!res.ok) throw new Error('Failed to fetch post')
  return res.json()
}

export async function adminCreatePost(data) {
  const res = await adminRequest('/blog/admin/posts', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'Failed to create post')
  }
  return res.json()
}

export async function adminUpdatePost(id, data) {
  const res = await adminRequest(`/blog/admin/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'Failed to update post')
  }
  return res.json()
}

export async function adminDeletePost(id) {
  const res = await adminRequest(`/blog/admin/posts/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete post')
  return res.json()
}

// ── Testimonials admin ────────────────────────────────────────────────────────

export async function adminFetchTestimonials() {
  const res = await adminRequest('/testimonials/admin')
  if (!res.ok) throw new Error('Failed to fetch testimonials')
  return res.json()
}

export async function adminUpdateTestimonialStatus(id, status) {
  const res = await adminRequest(`/testimonials/admin/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Failed to update status')
  }
  return res.json()
}

export async function adminDeleteTestimonial(id) {
  const res = await adminRequest(`/testimonials/admin/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete testimonial')
  return res.json()
}
