import Link from 'next/link'
import { Clock, ArrowRight } from 'lucide-react'
import PublicLayout from '@/components/seo/PublicLayout'
import BlogTagFilter from '@/components/seo/BlogTagFilter'
import { posts as blogPosts } from '@/lib/blog'

export const metadata = {
  title: 'The AskBro Journal — AI, Study Tips & Developer Guides',
  description: 'Tips, guides, and insights for students, developers, and teams using AI to learn faster.',
  alternates: { canonical: 'https://askbro.app/blog' },
}

export default function BlogIndexPage() {
  const featuredPost = blogPosts[0]
  const secondPost   = blogPosts[1]
  const restPosts    = blogPosts.slice(2)

  return (
    <PublicLayout>

      {/* ── Masthead ──────────────────────────────────────────── */}
      <section style={{ borderBottom: '4px solid #111111', background: '#F9F9F7' }}>
        <div className="mx-auto max-w-screen-xl px-6 py-14 md:py-20 text-center">
          <p data-animate="up" className="np-mono text-[10px] font-semibold uppercase mb-4 inline-block px-3 py-1.5 border border-[#E5E5E0]" style={{ letterSpacing: '0.2em', color: '#CC0000', background: 'rgba(204,0,0,0.05)' }}>★ Published Daily</p>
          <h1 data-animate="up" data-delay="80" className="np-serif font-black mb-4" style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)', color: '#111111', lineHeight: 0.88, letterSpacing: '-0.03em' }}>
            The AskBro Journal
          </h1>
          <p data-animate="up" data-delay="160" className="np-body text-[15px]" style={{ color: '#737373' }}>
            AI · Study Tips · Developer Guides · Interview Prep
          </p>
          <div data-animate="fade" data-delay="300" className="mt-8 flex items-center justify-center gap-4" style={{ color: '#D4D4D4' }}>
            <div className="flex-1 max-w-[120px] h-px bg-[#D4D4D4]" />
            <span className="np-serif text-[1.1rem] tracking-[1.2em]">✦ ✦ ✦</span>
            <div className="flex-1 max-w-[120px] h-px bg-[#D4D4D4]" />
          </div>
        </div>
      </section>

      {/* ── Front Page Layout ─────────────────────────────────── */}
      {blogPosts.length === 0 ? (
        <div className="mx-auto max-w-screen-xl px-6 py-20">
          <p className="np-body text-center" style={{ color: '#737373' }}>No posts yet. Check back soon.</p>
        </div>
      ) : (
        <div className="mx-auto max-w-screen-xl px-6 mt-10">

          {/* ── Top Story + Secondary ─────────────────────────── */}
          <div className="flex flex-col lg:flex-row border border-[#111111]" style={{ background: '#fff', boxShadow: '5px 5px 0 #E5E5E0' }}>

            {/* Featured */}
            {featuredPost && (
              <Link
                href={`/blog/${featuredPost.slug}`}
                data-animate="left"
                className="flex-1 block p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-[#111111] group transition-colors duration-200 hover:bg-[rgba(204,0,0,0.02)]"
              >
                <div className="flex items-center gap-3 mb-5">
                  <span className="np-mono text-[8px] font-bold uppercase px-2 py-1" style={{ letterSpacing: '0.15em', background: '#CC0000', color: '#F9F9F7' }}>Lead Story</span>
                  {featuredPost.tags?.slice(0, 1).map(tag => (
                    <span key={tag} className="np-mono text-[9px] uppercase" style={{ letterSpacing: '0.12em', color: '#737373' }}>{tag}</span>
                  ))}
                </div>

                <h2
                  className="np-serif font-black leading-[0.92] mb-5 group-hover:text-[#CC0000] transition-colors duration-200"
                  style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3.2rem)', color: '#111111', letterSpacing: '-0.02em' }}
                >
                  {featuredPost.title}
                </h2>

                <p className="np-body text-[15px] leading-relaxed mb-6" style={{ color: '#525252' }}>
                  {featuredPost.description}
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5 np-mono text-[9px] uppercase" style={{ letterSpacing: '0.12em', color: '#A3A3A3' }}>
                    <Clock className="w-3 h-3" strokeWidth={1.5} />
                    {featuredPost.readingTime}
                  </div>
                  <span className="np-sans text-[10px] font-bold uppercase flex items-center gap-1.5 group-hover:text-[#CC0000] transition-colors duration-200" style={{ letterSpacing: '0.1em', color: '#111111' }}>
                    Read Full Article <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                  </span>
                </div>
              </Link>
            )}

            {/* Secondary story */}
            {secondPost && (
              <Link
                href={`/blog/${secondPost.slug}`}
                data-animate="right"
                className="lg:w-[300px] shrink-0 block p-8 group transition-colors duration-200 hover:bg-[rgba(204,0,0,0.02)]"
              >
                <div className="mb-4">
                  <span className="np-mono text-[8px] font-bold uppercase px-2 py-1 border border-[#111111]" style={{ color: '#111111', letterSpacing: '0.12em' }}>
                    {secondPost.tags?.[0] || 'Article'}
                  </span>
                </div>
                <h2
                  className="np-serif font-bold leading-tight mb-4 group-hover:text-[#CC0000] transition-colors duration-200"
                  style={{ fontSize: 'clamp(1.2rem, 2vw, 1.7rem)', color: '#111111' }}
                >
                  {secondPost.title}
                </h2>
                <p className="np-body text-[13px] leading-relaxed mb-5" style={{ color: '#525252' }}>
                  {secondPost.description}
                </p>
                <div className="flex items-center gap-1.5 np-mono text-[9px] uppercase" style={{ letterSpacing: '0.1em', color: '#A3A3A3' }}>
                  <Clock className="w-3 h-3" strokeWidth={1.5} />
                  {secondPost.readingTime}
                </div>
              </Link>
            )}
          </div>

          {/* ── Ornament divider ──────────────────────────────── */}
          <div className="mt-10 mb-2 flex items-center justify-center gap-4" style={{ color: '#D4D4D4' }}>
            <div className="flex-1 h-px bg-[#E5E5E0]" />
            <span className="np-serif text-[1.1rem] tracking-[1.2em]">✦ ✦ ✦</span>
            <div className="flex-1 h-px bg-[#E5E5E0]" />
          </div>

          {/* ── Post grid with filter ─────────────────────────── */}
          {restPosts.length > 0 && (
            <div className="py-10">
              <div data-animate="left" className="flex items-center gap-5 mb-8">
                <span className="np-mono text-[9px] uppercase" style={{ letterSpacing: '0.2em', color: '#CC0000' }}>§ More</span>
                <h2 className="np-serif font-black" style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', color: '#111111' }}>All Articles</h2>
                <div className="flex-1 h-px bg-[#E5E5E0] hidden md:block" />
              </div>
              <BlogTagFilter posts={restPosts} />
            </div>
          )}
        </div>
      )}

      {/* ── Footer CTA ────────────────────────────────────────── */}
      <section className="mt-10" style={{ borderTop: '4px solid #111111', background: '#F9F9F7' }}>
        <div className="mx-auto max-w-screen-xl px-6 py-20 flex flex-col items-center text-center">
          <p data-animate="up" className="np-mono text-[10px] font-semibold uppercase mb-5 px-3 py-1.5 border border-[#E5E5E0]" style={{ letterSpacing: '0.2em', color: '#CC0000', background: 'rgba(204,0,0,0.05)' }}>★ Try It Yourself</p>
          <h2 data-animate="up" data-delay="80" className="np-serif font-black mb-5 max-w-2xl" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', color: '#111111', lineHeight: 0.95, letterSpacing: '-0.02em' }}>
            Ready to ask smarter questions?
          </h2>
          <p data-animate="up" data-delay="160" className="np-body text-[16px] mb-8 max-w-lg" style={{ color: '#525252' }}>
            Create a free workspace and try every feature described in this journal.
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
