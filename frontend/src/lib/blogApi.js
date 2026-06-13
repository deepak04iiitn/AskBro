/**
 * Blog API client — used by both public pages (server components) and
 * the admin panel (client component via adminApi helpers).
 *
 * Falls back to the static lib/blog.js posts when the API is unreachable
 * so the site degrades gracefully in local dev without a running backend.
 */

import { posts as staticPosts } from './blog'

const API_URL = process.env.NEXT_PUBLIC_API_URL

function staticFallback() {
  return staticPosts.map((p) => ({
    id: p.slug,
    slug: p.slug,
    title: p.title,
    description: p.description,
    content: p.content,
    date: p.date,
    reading_time: p.readingTime,
    tags: p.tags ?? [],
    status: 'published',
    author: 'AskBro Team',
    created_at: p.date,
    updated_at: p.date,
  }))
}

/** Fetch all published posts (summary, no content). */
export async function fetchPublishedPosts() {
  try {
    const res = await fetch(`${API_URL}/api/v1/blog/posts`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) throw new Error('non-ok')
    const data = await res.json()
    return data.length ? data : staticFallback()
  } catch {
    return staticFallback()
  }
}

/** Fetch a single published post by slug (includes full content). */
export async function fetchPostBySlug(slug) {
  try {
    const res = await fetch(`${API_URL}/api/v1/blog/posts/${slug}`, {
      next: { revalidate: 60 },
    })
    // Only treat a successful API response as authoritative.
    // Any non-200 (including 404) falls through to the static fallback
    // so hardcoded posts remain accessible before they're added to the DB.
    if (!res.ok) throw new Error('non-ok')
    return await res.json()
  } catch {
    return staticFallback().find((p) => p.slug === slug) ?? null
  }
}

/** Fetch all slugs — used for generateStaticParams. */
export async function fetchAllSlugs() {
  const posts = await fetchPublishedPosts()
  return posts.map((p) => ({ slug: p.slug }))
}
