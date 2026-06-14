const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function fetchApprovedTestimonials() {
  const res = await fetch(`${API_URL}/testimonials`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch testimonials')
  return res.json()
}

export async function submitTestimonial(data) {
  const res = await fetch(`${API_URL}/testimonials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Failed to submit testimonial')
  }
  return res.json()
}
