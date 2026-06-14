import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowLeft, Clock, Copy, ArrowRight } from 'lucide-react'
import PublicLayout from '@/components/seo/PublicLayout'
import JsonLd from '@/components/seo/JsonLd'
import BlogTocSidebar from '@/components/seo/BlogTocSidebar'
import { fetchAllSlugs, fetchPostBySlug, fetchPublishedPosts } from '@/lib/blogApi'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const post = await fetchPostBySlug(slug)
  if (!post) return {}
  return {
    title: `${post.title} | AskBro Journal`,
    description: post.description,
    keywords: post.tags ?? [],
    alternates: { canonical: `https://askbro.app/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url: `https://askbro.app/blog/${post.slug}`,
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: post.title }],
      publishedTime: post.date,
      modifiedTime: post.updated_at ?? post.date,
      authors: [post.author ?? 'AskBro Team'],
      tags: post.tags ?? [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: ['/og-image.png'],
    },
  }
}

function slugify(text) {
  if (!text) return ''
  const str = Array.isArray(text) ? text.join('') : String(text)
  return str.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
}

const mdComponents = {
  h1: ({ children }) => (
    <h1 id={slugify(children)} className="np-serif font-black mt-10 mb-4 first:mt-0 leading-tight" style={{ fontSize: '1.9rem', color: '#111111' }}>{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 id={slugify(children)} className="np-serif font-bold mt-10 mb-4 pt-6 leading-tight" style={{ fontSize: '1.5rem', color: '#111111', borderTop: '2px solid #111111' }}>{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 id={slugify(children)} className="np-serif font-bold mt-7 mb-3" style={{ fontSize: '1.2rem', color: '#111111' }}>{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="np-sans font-semibold uppercase tracking-widest mt-5 mb-2" style={{ fontSize: '11px', color: '#111111', letterSpacing: '0.12em' }}>{children}</h4>
  ),
  p: ({ children }) => (
    <p className="np-body text-[15px] leading-relaxed mb-5 last:mb-0" style={{ color: '#404040' }}>{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-5 space-y-2 pl-5" style={{ listStyleType: 'disc', color: '#404040' }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-5 space-y-2 pl-5" style={{ listStyleType: 'decimal', color: '#404040' }}>{children}</ol>
  ),
  li: ({ children }) => (
    <li className="np-body text-[15px] leading-relaxed pl-1" style={{ color: '#404040' }}>{children}</li>
  ),
  strong: ({ children }) => (
    <strong className="np-sans font-bold" style={{ color: '#111111' }}>{children}</strong>
  ),
  em: ({ children }) => (
    <em className="np-serif italic" style={{ color: '#525252' }}>{children}</em>
  ),
  a: ({ href, children }) => (
    <a href={href} className="np-sans font-semibold underline decoration-2 transition-colors hover:text-[#CC0000]" style={{ color: '#111111', textDecorationColor: '#CC0000' }}>
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-6 pl-6 py-1" style={{ borderLeft: '4px solid #111111' }}>
      <div className="np-serif italic text-[16px] leading-relaxed" style={{ color: '#525252' }}>{children}</div>
    </blockquote>
  ),
  code: ({ inline, children }) =>
    inline
      ? <code className="np-mono text-[12px] px-1.5 py-0.5" style={{ background: '#F0F0F0', color: '#CC0000', border: '1px solid #E5E5E0' }}>{children}</code>
      : <code className="block np-mono text-[12px] leading-relaxed" style={{ color: '#111111' }}>{children}</code>,
  pre: ({ children }) => (
    <pre className="my-6 px-6 py-5 overflow-x-auto np-mono text-[12px] leading-relaxed border border-[#111111]" style={{ background: '#F5F5F5', color: '#111111' }}>
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto border border-[#111111]">
      <table className="w-full text-[13px]">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead style={{ background: '#111111' }}>{children}</thead>
  ),
  th: ({ children }) => (
    <th className="px-5 py-3 text-left np-mono text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#F9F9F7', borderRight: '1px solid rgba(255,255,255,0.1)' }}>{children}</th>
  ),
  td: ({ children }) => (
    <td className="px-5 py-3 np-body text-[13px]" style={{ color: '#404040', borderTop: '1px solid #E5E5E0', borderRight: '1px solid #E5E5E0' }}>{children}</td>
  ),
  hr: () => (
    <div className="my-10 flex items-center justify-center gap-6" style={{ color: '#E5E5E0' }}>
      <div className="flex-1 h-px bg-[#E5E5E0]" />
      <span className="np-serif text-[1.2rem] tracking-[0.8em]">✦ ✦ ✦</span>
      <div className="flex-1 h-px bg-[#E5E5E0]" />
    </div>
  ),
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params
  const post = await fetchPostBySlug(slug)
  if (!post) notFound()

  const readingTime = post.reading_time ?? post.readingTime

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated_at ?? post.date,
    image: { '@type': 'ImageObject', url: 'https://askbro.app/og-image.png', width: 1200, height: 630 },
    author: { '@type': 'Organization', name: post.author ?? 'AskBro Team', url: 'https://askbro.app' },
    publisher: {
      '@type': 'Organization',
      name: 'AskBro',
      url: 'https://askbro.app',
      logo: { '@type': 'ImageObject', url: 'https://askbro.app/AskBro_Logo.png', width: 512, height: 512 },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://askbro.app/blog/${post.slug}` },
    keywords: post.tags?.join(', '),
  }

  // Related: other published posts sharing at least one tag
  const allPosts = await fetchPublishedPosts()
  const related  = allPosts
    .filter((p) => p.slug !== post.slug && p.tags?.some((t) => post.tags?.includes(t)))
    .slice(0, 3)

  return (
    <PublicLayout>
      <JsonLd data={articleJsonLd} />

      {/* ── Breadcrumb strip ─────────────────────────────────── */}
      <div className="border-b" style={{ borderColor: '#E5E5E0', background: 'rgba(0,0,0,0.02)' }}>
        <div className="mx-auto max-w-screen-xl px-6 py-3 flex items-center gap-2 np-mono text-[10px] uppercase tracking-widest" style={{ color: '#737373' }}>
          <Link href="/" className="hover:text-[#CC0000] transition-colors duration-150">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-[#CC0000] transition-colors duration-150">Journal</Link>
          <span>/</span>
          <span style={{ color: '#111111' }} className="truncate max-w-[200px]">{post.title}</span>
        </div>
      </div>

      {/* ── Article hero ─────────────────────────────────────── */}
      <section style={{ borderBottom: '4px solid #111111', background: '#F9F9F7' }}>
        <div className="mx-auto max-w-screen-xl px-6 py-12 md:py-16">
          <div className="max-w-4xl">
            <Link
              href="/blog"
              data-animate="left"
              className="np-sans inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest mb-8 transition-colors duration-150 hover:text-[#CC0000]"
              style={{ color: '#A3A3A3' }}
            >
              <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2.5} /> Back to Journal
            </Link>

            {/* Tags */}
            <div data-animate="up" className="flex flex-wrap items-center gap-3 mb-5">
              {post.tags?.map((tag) => (
                <span key={tag} className="np-mono text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-1" style={{ background: '#111111', color: '#F9F9F7' }}>
                  {tag}
                </span>
              ))}
            </div>

            <h1 data-animate="up" data-delay="80" className="np-serif font-black leading-[0.92] tracking-tight mb-5" style={{ fontSize: 'clamp(2rem, 5vw, 3.8rem)', color: '#111111' }}>
              {post.title}
            </h1>

            <p data-animate="up" data-delay="160" className="np-body text-[16px] leading-relaxed mb-7 max-w-2xl" style={{ color: '#525252' }}>
              {post.description}
            </p>

            <div data-animate="fade" data-delay="280" className="flex flex-wrap items-center gap-5 pt-5 border-t" style={{ borderColor: '#E5E5E0' }}>
              <div className="flex items-center gap-1.5 np-mono text-[10px] uppercase tracking-widest" style={{ color: '#A3A3A3' }}>
                <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                {readingTime}
              </div>
              {post.date && (
                <time className="np-mono text-[10px] uppercase tracking-widest" style={{ color: '#A3A3A3' }}>
                  {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </time>
              )}
              {post.author && (
                <span className="np-mono text-[10px] uppercase tracking-widest" style={{ color: '#A3A3A3' }}>
                  By {post.author}
                </span>
              )}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://askbro.app/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto btn-outline-ink px-4 py-2 inline-flex items-center gap-1.5 transition-colors hover:border-[#CC0000] hover:text-[#CC0000]"
              >
                <Copy className="w-3 h-3" strokeWidth={2} /> Share
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Article + TOC ────────────────────────────────────── */}
      <div className="mx-auto max-w-screen-xl px-6 py-12 mt-2">
        <div className="grid lg:grid-cols-[1fr_260px] gap-12">
          <article data-animate="up" className="min-w-0">
            <div className="border border-[#E5E5E0] p-8 md:p-12" style={{ background: '#FFFFFF', boxShadow: '5px 5px 0 #F0F0F0' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                {post.content}
              </ReactMarkdown>
            </div>
          </article>
          <div data-animate="right" data-delay="200">
            <BlogTocSidebar content={post.content} />
          </div>
        </div>
      </div>

      {/* ── Ornament ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-screen-xl px-6 my-2 flex items-center gap-4" style={{ color: '#D4D4D4' }}>
        <div className="flex-1 h-px bg-[#E5E5E0]" />
        <span className="np-serif text-[1.1rem] tracking-[0.8em]">✦ ✦ ✦</span>
        <div className="flex-1 h-px bg-[#E5E5E0]" />
      </div>

      {/* ── Related posts ────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="mt-10" style={{ borderTop: '4px solid #111111', borderBottom: '4px solid #111111', background: '#F9F9F7' }}>
          <div className="mx-auto max-w-screen-xl px-6">
            <div className="py-10">
              <div data-animate="left" className="flex items-center gap-5">
                <span className="np-mono text-[9px] uppercase" style={{ letterSpacing: '0.2em', color: '#CC0000' }}>§ Also Read</span>
                <h2 className="np-serif font-black" style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', color: '#111111' }}>Related Articles</h2>
                <div className="flex-1 h-px bg-[#111111] hidden md:block" />
              </div>
            </div>
            <div data-stagger className="grid md:grid-cols-3 gap-6 pb-16">
              {related.map((rPost) => (
                <Link
                  key={rPost.slug}
                  href={`/blog/${rPost.slug}`}
                  data-lift
                  className="block p-7 border border-[#E5E5E0] group transition-colors duration-200 hover:border-[#111111]"
                  style={{ background: '#fff' }}
                >
                  {rPost.tags?.[0] && (
                    <span className="np-mono text-[8px] font-bold uppercase tracking-[0.15em] block mb-3" style={{ color: '#CC0000' }}>
                      {rPost.tags[0]}
                    </span>
                  )}
                  <h3 className="np-serif font-bold leading-tight mb-3 group-hover:text-[#CC0000] transition-colors duration-200" style={{ fontSize: '1.1rem', color: '#111111' }}>
                    {rPost.title}
                  </h3>
                  <p className="np-body text-[12px] leading-relaxed line-clamp-2 mb-5" style={{ color: '#525252' }}>
                    {rPost.description}
                  </p>
                  <div className="np-sans text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 group-hover:text-[#CC0000] transition-colors duration-200" style={{ color: '#A3A3A3' }}>
                    Read <ArrowRight className="w-3 h-3" strokeWidth={2} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="mt-10" style={{ background: '#F9F9F7', borderBottom: '4px solid #111111' }}>
        <div className="mx-auto max-w-screen-xl px-6 py-20 flex flex-col items-center text-center">
          <p data-animate="up" className="np-mono text-[10px] font-semibold uppercase mb-5 px-3 py-1.5 border border-[#E5E5E0]" style={{ letterSpacing: '0.2em', color: '#CC0000', background: 'rgba(204,0,0,0.05)' }}>★ Try It Free</p>
          <h2 data-animate="up" data-delay="80" className="np-serif font-black mb-5 max-w-2xl" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', color: '#111111', lineHeight: 0.95, letterSpacing: '-0.02em' }}>
            Try AskBro for free
          </h2>
          <p data-animate="up" data-delay="160" className="np-body text-[16px] mb-8 max-w-lg" style={{ color: '#525252' }}>
            The fastest way to chat with your PDFs, GitHub repos, and study materials.
          </p>
          <div data-animate="up" data-delay="240">
            <Link href="/create" className="inline-flex items-center gap-2 px-8 py-4 np-sans text-[12px] font-bold uppercase tracking-widest transition-opacity hover:opacity-85" style={{ background: '#CC0000', color: '#F9F9F7', border: '2px solid #CC0000' }}>
              Create Free Workspace <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
