import { fetchPublishedPosts } from '@/lib/blogApi'

const BASE = 'https://askbro.app'

export default async function sitemap() {
  // Dynamically include all published blog posts
  let blogPostEntries = []
  try {
    const posts = await fetchPublishedPosts()
    blogPostEntries = posts.map((post) => ({
      url: `${BASE}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at ?? post.date ?? Date.now()),
      changeFrequency: 'monthly',
      priority: 0.7,
    }))
  } catch {
    // Fall back to known static slugs if API is unavailable
    blogPostEntries = [
      'how-to-chat-with-pdf',
      'ai-interview-prep-guide',
      'generate-flashcards-from-notes',
      'understand-github-codebase-with-ai',
      'best-ai-study-tools-2026',
    ].map((slug) => ({
      url: `${BASE}/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    }))
  }

  const now = new Date()

  return [
    // ── Core public pages ─────────────────────────────────────
    { url: BASE, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },

    // ── Feature pages ─────────────────────────────────────────
    { url: `${BASE}/features/document-qa`,    lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/features/github-repo`,    lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/features/integrations`,   lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/features/interview-prep`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/features/quizzes`,        lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/features/flashcards`,     lastModified: now, changeFrequency: 'monthly', priority: 0.8 },

    // ── Use-case pages ────────────────────────────────────────
    { url: `${BASE}/use-cases/students`,          lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/use-cases/engineering-teams`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/use-cases/developers`,        lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/use-cases/onboarding`,        lastModified: now, changeFrequency: 'monthly', priority: 0.7 },

    // ── Comparison pages ──────────────────────────────────────
    { url: `${BASE}/compare/askbro-vs-chatpdf`,    lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/compare/askbro-vs-notebooklm`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/compare/askbro-vs-perplexity`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },

    // ── Blog index ────────────────────────────────────────────
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },

    // ── Blog posts (dynamic) ──────────────────────────────────
    ...blogPostEntries,

    // ── Auth (low priority) ───────────────────────────────────
    { url: `${BASE}/login`,  lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/create`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
  ]
}
