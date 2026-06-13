import Link from 'next/link'
import {
  FileText, GitBranch, Target, BrainCircuit, Layers, BookMarked,
  ArrowRight, Upload, Cpu, MessageSquare,
  Shield, Zap, Users, BookOpen,
} from 'lucide-react'
import JsonLd from '@/components/seo/JsonLd'
import PublicLayout from '@/components/seo/PublicLayout'
import PersonaTabs from '@/components/seo/PersonaTabs'

export const metadata = {
  title: 'AskBro — AI Knowledge Base, Interview Prep, Quizzes & Flashcards',
  description: 'AskBro is your AI study and knowledge companion. Chat with PDFs, ask questions about GitHub repos, ace technical interviews, generate quizzes and flashcards — all in one place.',
  keywords: ['AI knowledge base','chat with PDF','AI document assistant','PDF Q&A tool','GitHub repo AI','AI code explainer','AI technical interview prep','AI quiz generator','AI flashcard generator','AskBro'],
  alternates: { canonical: 'https://askbro.app' },
  openGraph: { type: 'website', locale: 'en_US', siteName: 'AskBro', url: 'https://askbro.app', title: 'AskBro — AI Knowledge Base, Interview Prep, Quizzes & Flashcards', description: 'Chat with PDFs, explore GitHub repos, prep for interviews, and generate quizzes and flashcards.', images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'AskBro' }] },
  twitter: { card: 'summary_large_image', title: 'AskBro — AI Knowledge Base, Interview Prep, Quizzes & Flashcards', images: ['/og-image.png'] },
}

const homepageJsonLd = [
  { '@context': 'https://schema.org', '@type': 'WebSite', name: 'AskBro', url: 'https://askbro.app' },
  { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'AskBro', applicationCategory: 'ProductivityApplication', operatingSystem: 'Web', url: 'https://askbro.app', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
]

const features = [
  { icon: FileText,     title: 'Document Q&A',       sub: 'Chat with PDFs, docs and Markdown. Get page-level citations on every answer.',     href: '/features/document-qa',    tag: 'Popular' },
  { icon: BookMarked,   title: 'Notion Integration',  sub: 'Connect your Notion workspace and ask questions across all your pages and databases.', href: '/features/notion',   tag: 'New' },
  { icon: GitBranch,    title: 'GitHub Repo Q&A',     sub: 'Paste any public repo URL. Understand entire codebases in seconds.',                href: '/features/github-repo' },
  { icon: Target,       title: 'Interview Prep',      sub: 'AI coaching for technical rounds. Honest feedback so you can improve fast.',        href: '/features/interview-prep' },
  { icon: BrainCircuit, title: 'AI Quizzes',          sub: 'Turn any document into an adaptive quiz. Test knowledge, not memory.',             href: '/features/quizzes' },
  { icon: Layers,       title: 'Flashcards',          sub: 'Spaced-repetition decks auto-generated from your study material.',                 href: '/features/flashcards' },
]

const steps = [
  { icon: Upload,        n: '01', title: 'Upload or Connect',  body: 'Add a PDF, paste a GitHub URL, or drop in your study notes. No conversion required.' },
  { icon: Cpu,           n: '02', title: 'AskBro Reads It',     body: 'AskBro reads and understands every word in your document or repo — fully processed and ready to answer in under 30 seconds.' },
  { icon: MessageSquare, n: '03', title: 'Ask, Quiz, Prepare', body: 'Chat with your knowledge, generate quizzes, build flashcards, or start a live interview session.' },
]

const testimonials = [
  { quote: 'Cut my study time in half. The flashcard generation from my lecture notes is genuinely magic.', name: 'Sarah A.', role: 'CS Student, Univ. of Edinburgh', initials: 'SA', stars: 5 },
  { quote: 'Onboarded 3 developers to a new codebase in 2 days. Previously that took two full weeks.', name: 'James M.', role: 'Engineering Lead', initials: 'JM', stars: 5 },
  { quote: 'Landed my dream role after 2 weeks of interview prep with AskBro. The feedback is brutally honest.', name: 'Riya K.', role: 'Software Engineer', initials: 'RK', stars: 5 },
]

const stats = [
  { value: '2,400+', label: 'Active Workspaces' },
  { value: '15',     label: 'File Formats' },
  { value: '< 30s',  label: 'Ready in 30s' },
  { value: '4.9 ★',  label: 'User Rating' },
  { value: '99%',    label: 'Uptime' },
]

export default function HomePage() {
  return (
    <PublicLayout>
      <JsonLd data={homepageJsonLd} />

      {/* ── Breaking News Ticker ──────────────────────────────── */}
      <div style={{ background: '#CC0000', overflow: 'hidden', borderBottom: '2px solid #111111' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: 36 }}>
          <div
            className="np-mono text-[10px] font-bold uppercase shrink-0 px-4"
            style={{ background: '#111111', color: '#CC0000', height: '100%', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', letterSpacing: '0.15em' }}
          >
            ★ NEW
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div className="marquee-inner np-mono text-[10px] font-semibold uppercase" style={{ color: '#F9F9F7', letterSpacing: '0.1em' }}>
              {[...Array(4)].map((_, i) => (
                <span key={i} style={{ whiteSpace: 'nowrap', paddingRight: 80 }}>
                  Chat with PDFs &nbsp;·&nbsp; Understand GitHub Repos &nbsp;·&nbsp; Ace Technical Interviews &nbsp;·&nbsp; Generate AI Quizzes &nbsp;·&nbsp; Build Flashcards &nbsp;·&nbsp; 2,400+ Workspaces Active &nbsp;·&nbsp; Ready in Under 30 Seconds &nbsp;·&nbsp;
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section aria-labelledby="hero-heading" style={{ borderBottom: '4px solid #111111' }}>
        <div className="mx-auto max-w-screen-xl px-6">
          <div className="relative flex flex-col lg:flex-row">

            {/* ── Left: copy — its height defines the row ────────── */}
            <div className="flex-1 py-16 md:py-20 border-b lg:border-b-0 lg:pr-14">

              <p data-animate="up" className="np-mono text-[10px] font-semibold uppercase mb-7 inline-flex items-center gap-2 px-3 py-1.5 border border-[#E5E5E0]"
                style={{ letterSpacing: '0.2em', color: '#CC0000', background: 'rgba(204,0,0,0.05)' }}>
                ★ Breaking — AI Workspace
              </p>

              <h1
                id="hero-heading"
                data-animate="up" data-delay="80"
                className="np-serif font-black mb-6"
                style={{ lineHeight: 0.93, letterSpacing: '-0.025em', fontSize: 'clamp(3rem, 5.5vw, 5rem)' }}
              >
                <span style={{ color: '#CC0000' }}>One</span>{' '}
                <span style={{ color: '#111111' }}>workspace.</span>
                <br />
                <span style={{ color: '#111111' }}>Every question</span>
                <br />
                <em className="np-serif" style={{ color: '#737373', fontStyle: 'italic' }}>answered.</em>
              </h1>

              <p data-animate="up" data-delay="160" className="np-body text-[16px] leading-relaxed mb-9 max-w-lg" style={{ color: '#525252' }}>
                Chat with PDFs, understand GitHub repositories, ace technical interviews,
                and build study materials — all from one private AI workspace.
              </p>

              <div data-animate="up" data-delay="240" className="flex flex-wrap gap-3 mb-10">
                <Link href="/create" className="btn-ink px-7 py-3.5 inline-flex items-center gap-2">
                  Create Free Workspace <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </Link>
                <Link href="#features" className="btn-outline-ink px-7 py-3.5">
                  See What It Does
                </Link>
              </div>

              <div data-animate="fade" data-delay="400" className="flex flex-wrap gap-x-7 gap-y-3 pt-6 border-t border-[#E5E5E0]">
                {[
                  { icon: Shield,   label: 'Private by Default' },
                  { icon: Zap,      label: 'Ready in 30s' },
                  { icon: Users,    label: '2,400+ Workspaces' },
                  { icon: BookOpen, label: '15+ File Types' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: '#A3A3A3' }} strokeWidth={1.5} />
                    <span className="np-mono text-[10px] uppercase" style={{ letterSpacing: '0.1em', color: '#737373' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: width placeholder (keeps layout width, desktop) */}
            <div className="hidden lg:block w-[560px] shrink-0" aria-hidden="true" />

            {/* ── Right: mobile — normal flow, full width ────────── */}
            <div className="lg:hidden flex flex-col pb-10">
              <div className="border border-[#111111]" style={{ boxShadow: '6px 6px 0 #111111' }}>
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[#333]" style={{ background: '#111111' }}>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#CC0000]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#555]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#444]" />
                  <span className="np-mono text-[9px] uppercase tracking-widest ml-3" style={{ color: '#888' }}>AskBro — github.com/vercel/next.js</span>
                </div>
                <div className="p-4 space-y-3" style={{ background: '#FAFAF8' }}>
                  <div className="flex justify-end">
                    <div className="max-w-[82%] px-3.5 py-2.5 np-body text-[13px]" style={{ background: '#111111', color: '#F9F9F7' }}>How does Next.js handle SSR?</div>
                  </div>
                  <div className="flex justify-start">
                    <div className="px-3.5 py-3 np-body text-[13px] border border-[#E5E5E0]" style={{ background: '#fff', color: '#111111' }}>
                      <span className="np-mono text-[9px] uppercase tracking-widest block mb-1.5" style={{ color: '#CC0000' }}>AskBro · server/render.ts</span>
                      Next.js SSR runs your data-fetching code on every request and streams fully-rendered HTML — zero client JS for the initial paint.
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-3 border-t border-[#E5E5E0]" style={{ background: '#fff' }}>
                  <div className="flex-1 h-9 border border-[#E5E5E0] px-3 flex items-center">
                    <span className="np-body text-[12px]" style={{ color: '#C0C0C0' }}>Ask anything about this repo…</span>
                  </div>
                  <button className="px-4 h-9 btn-ink text-[11px] shrink-0">Ask</button>
                </div>
              </div>
            </div>

            {/* ── Right: absolutely fills the exact height of the row */}
            <div data-animate="right" data-delay="200" className="hidden lg:flex flex-col absolute top-0 right-0 bottom-0 w-[560px] py-16 md:py-20 pl-12">

              {/* Chat window */}
              <div className="border border-[#111111] flex flex-col flex-1 min-h-0" style={{ boxShadow: '6px 6px 0 #111111' }}>
                {/* Window bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[#333]" style={{ background: '#111111' }}>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#CC0000]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#555]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#444]" />
                  <span className="np-mono text-[9px] uppercase tracking-widest ml-3" style={{ color: '#888' }}>AskBro — github.com/vercel/next.js</span>
                </div>

                {/* Messages */}
                <div className="p-5 space-y-4 flex-1 overflow-y-auto min-h-0" style={{ background: '#FAFAF8' }}>

                  <div className="flex justify-end">
                    <div className="max-w-[80%] px-4 py-2.5 np-body text-[13px]" style={{ background: '#111111', color: '#F9F9F7' }}>
                      How does Next.js handle server-side rendering?
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="max-w-[95%] px-4 py-3.5 np-body text-[13px] border border-[#E5E5E0]" style={{ background: '#fff', color: '#111111' }}>
                      <span className="np-mono text-[9px] uppercase tracking-widest block mb-2" style={{ color: '#CC0000' }}>AskBro · server/render.ts, packages/next/src/server</span>
                      Next.js SSR works via <strong>getServerSideProps</strong> (Pages Router) or async React Server Components (App Router). On each request, the server runs your data-fetching code, passes props to the component tree, and streams the fully-rendered HTML to the client — zero client JS required for the initial paint.
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="max-w-[80%] px-4 py-2.5 np-body text-[13px]" style={{ background: '#111111', color: '#F9F9F7' }}>
                      Where is the routing logic defined?
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="max-w-[95%] px-4 py-3.5 np-body text-[13px] border border-[#E5E5E0]" style={{ background: '#fff', color: '#111111' }}>
                      <span className="np-mono text-[9px] uppercase tracking-widest block mb-2" style={{ color: '#CC0000' }}>AskBro · packages/next/src/shared/lib/router</span>
                      The core router lives in <code className="np-mono text-[11px] px-1 py-0.5" style={{ background: '#F0F0EE', color: '#CC0000' }}>packages/next/src/shared/lib/router/router.ts</code>. It handles both client-side transitions and SSR fallbacks, resolving dynamic segments, middleware redirects, and i18n locale prefixes before calling the matched page handler.
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="max-w-[80%] px-4 py-2.5 np-body text-[13px]" style={{ background: '#111111', color: '#F9F9F7' }}>
                      Explain the middleware pipeline
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="px-4 py-2.5 border border-[#E5E5E0]" style={{ background: '#fff' }}>
                      <span className="np-mono text-[10px] flex items-center gap-2" style={{ color: '#A3A3A3' }}>
                        <span className="flex gap-1">
                          {[0, 150, 300].map(d => (
                            <span key={d} className="w-1.5 h-1.5 rounded-full bg-[#CC0000] animate-bounce" style={{ animationDelay: `${d}ms` }} />
                          ))}
                        </span>
                        Reading middleware.ts and edge runtime…
                      </span>
                    </div>
                  </div>

                </div>

                {/* Input bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-t border-[#E5E5E0]" style={{ background: '#fff' }}>
                  <div className="flex-1 h-9 border border-[#E5E5E0] px-3 flex items-center">
                    <span className="np-body text-[12px]" style={{ color: '#C0C0C0' }}>Ask anything about this repo…</span>
                  </div>
                  <button className="px-4 h-9 btn-ink text-[11px] shrink-0">Ask</button>
                </div>
              </div>

            </div>
          </div>

          {/* ── Stats strip — full width below both columns ─────── */}
          <div data-stagger className="grid grid-cols-3 sm:grid-cols-5 border-t border-[#111111]">
            {stats.map(({ value, label }, i) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center py-6 px-4 text-center border-r border-[#E5E5E0] last:border-r-0"
                style={{ background: i % 2 === 0 ? 'rgba(0,0,0,0.025)' : 'transparent' }}
              >
                <span className="np-serif font-black leading-none mb-1" style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', color: '#111111' }}>{value}</span>
                <span className="np-mono text-[9px] uppercase" style={{ letterSpacing: '0.15em', color: '#737373' }}>{label}</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────────────── */}
      <section id="features" className="mt-10" style={{ borderBottom: '4px solid #111111' }}>
        <div className="mx-auto max-w-screen-xl px-6">

          {/* Section header */}
          <div className="py-10 border-b border-[#111111]">
            <div data-animate="left" className="flex items-center gap-5">
              <span className="np-mono text-[9px] uppercase" style={{ letterSpacing: '0.2em', color: '#CC0000' }}>§ 01</span>
              <h2 className="np-serif font-black" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)', color: '#111111' }}>The Features</h2>
              <div className="flex-1 h-px bg-[#111111] hidden md:block" />
            </div>
          </div>

          {/* Grid: 5 cards — 3 top, 2 bottom */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 border-l border-t border-[#111111]">
            {features.map(({ icon: Icon, title, sub, href, tag }, i) => (
              <Link
                key={title}
                href={href}
                data-animate="up" data-delay={String(i * 80)}
                data-spotlight
                className="hard-shadow-hover block p-10 border-r border-b border-[#111111] group"
              >
                <div className="flex items-start justify-between mb-8">
                  <div
                    className="border border-[#111111] flex items-center justify-center transition-colors duration-150 group-hover:border-[#CC0000] group-hover:text-[#CC0000]"
                    style={{ color: '#111111', width: 52, height: 52 }}
                  >
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  {tag && (
                    <span className="np-mono text-[8px] font-bold uppercase px-2.5 py-1.5" style={{ background: '#CC0000', color: '#F9F9F7', letterSpacing: '0.12em' }}>
                      {tag}
                    </span>
                  )}
                </div>
                <h3 className="np-serif font-bold text-[1.35rem] leading-tight mb-3" style={{ color: '#111111' }}>{title}</h3>
                <p className="np-body text-[14px] leading-relaxed mb-8" style={{ color: '#525252' }}>{sub}</p>
                <div className="np-sans text-[10px] font-bold uppercase flex items-center gap-2 group-hover:text-[#CC0000] transition-colors" style={{ letterSpacing: '0.1em', color: '#111111' }}>
                  Read More <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works (Inverted) ───────────────────────────── */}
      {/* ── How It Works ──────────────────────────────────────── */}
      <section className="mt-10" style={{ borderBottom: '4px solid #111111', background: '#F9F9F7' }}>
        <div className="mx-auto max-w-screen-xl px-6">

          {/* Section header */}
          <div className="py-10">
            <div className="flex items-center gap-5">
              <span className="np-mono text-[9px] uppercase" style={{ letterSpacing: '0.2em', color: '#CC0000' }}>§ 02</span>
              <h2 className="np-serif font-black" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)', color: '#111111' }}>How It Works</h2>
              <div className="flex-1 h-px bg-[#111111] hidden md:block" />
            </div>
          </div>

          {/* Steps — horizontal with connector line */}
          <div className="py-16 md:py-20">
            <div data-stagger className="grid md:grid-cols-3 gap-0 relative">

              {/* Connector line between steps (desktop only) */}
              <div
                className="hidden md:block absolute top-[52px] left-[calc(16.66%+24px)] right-[calc(16.66%+24px)] h-px"
                style={{ background: 'linear-gradient(to right, #CC0000, #E5E5E0, #CC0000)', zIndex: 0 }}
              />

              {steps.map(({ icon: Icon, n, title, body }, i) => (
                <div key={n} className="relative flex flex-col items-start md:items-center md:text-center px-8 pb-12 md:pb-0">

                  {/* Step badge */}
                  <div className="relative z-10 flex flex-col items-start md:items-center mb-8">
                    <div
                      className="w-[52px] h-[52px] flex items-center justify-center border-2 border-[#111111] mb-4"
                      style={{ background: i === 1 ? '#CC0000' : '#F9F9F7' }}
                    >
                      <Icon
                        className="w-5 h-5"
                        strokeWidth={1.5}
                        style={{ color: i === 1 ? '#F9F9F7' : '#111111' }}
                      />
                    </div>
                    <span
                      className="np-mono font-black text-[2rem] leading-none"
                      style={{ color: i === 1 ? '#CC0000' : '#E5E5E0', letterSpacing: '-0.02em' }}
                    >
                      {n}
                    </span>
                  </div>

                  <h3 className="np-serif font-bold text-[1.2rem] mb-3 leading-tight" style={{ color: '#111111' }}>{title}</h3>
                  <p className="np-body text-[14px] leading-relaxed max-w-xs" style={{ color: '#525252' }}>{body}</p>

                  {/* Mobile connector arrow */}
                  {i < steps.length - 1 && (
                    <div className="md:hidden absolute bottom-2 left-1/2 -translate-x-1/2 np-mono text-[18px]" style={{ color: '#E5E5E0' }}>↓</div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── Who Uses AskBro ──────────────────────────────────── */}
      <section className="mt-10" style={{ borderBottom: '4px solid #111111' }}>
        <div className="mx-auto max-w-screen-xl px-6">
          <div className="py-10">
            <div className="flex items-center gap-5">
              <span className="np-mono text-[9px] uppercase" style={{ letterSpacing: '0.2em', color: '#CC0000' }}>§ 03</span>
              <h2 className="np-serif font-black" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)', color: '#111111' }}>Who Uses AskBro</h2>
              <div className="flex-1 h-px bg-[#111111] hidden md:block" />
            </div>
          </div>
          <div className="py-12">
            <PersonaTabs />
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section className="mt-10" style={{ background: '#F9F9F7', borderBottom: '4px solid #111111' }}>
        <div className="mx-auto max-w-screen-xl px-6 py-16 md:py-20">

          {/* Section header — matches site-wide style */}
          <div className="flex items-center gap-5 mb-14">
            <span className="np-mono text-[9px] uppercase" style={{ letterSpacing: '0.2em', color: '#CC0000' }}>§ 04</span>
            <h2 className="np-serif font-black" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)', color: '#111111' }}>User Testimonials</h2>
            <div className="flex-1 h-px bg-[#111111] hidden md:block" />
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ quote, name, role, initials, stars }, i) => (
              <div
                key={name}
                data-animate="up" data-delay={String(i * 100)}
                data-lift
                className="flex flex-col p-8"
                style={{
                  background: '#fff',
                  border: '1px solid #E5E5E0',
                  boxShadow: i === 1 ? '0 8px 32px rgba(0,0,0,0.08)' : '0 2px 12px rgba(0,0,0,0.04)',
                  transform: i === 1 ? 'translateY(-8px)' : 'none',
                }}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: stars }).map((_, s) => (
                    <span key={s} style={{ color: '#CC0000', fontSize: '14px' }}>★</span>
                  ))}
                </div>

                {/* Quote */}
                <p className="np-body text-[15px] leading-relaxed flex-1 mb-7" style={{ color: '#404040' }}>
                  "{quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-5" style={{ borderTop: '1px solid #F0F0EE' }}>
                  <div
                    className="w-10 h-10 shrink-0 flex items-center justify-center np-sans text-[12px] font-bold"
                    style={{ background: i === 1 ? '#CC0000' : '#111111', color: '#F9F9F7', borderRadius: 0 }}
                  >
                    {initials}
                  </div>
                  <div>
                    <p className="np-sans text-[13px] font-semibold" style={{ color: '#111111' }}>{name}</p>
                    <p className="np-mono text-[9px] uppercase mt-0.5" style={{ letterSpacing: '0.1em', color: '#A3A3A3' }}>{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom trust line */}
          <p className="text-center np-mono text-[10px] uppercase mt-12" style={{ letterSpacing: '0.15em', color: '#A3A3A3' }}>
            Joining 2,400+ workspaces worldwide · Rated 4.9 ★
          </p>

        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="mt-10" style={{ background: '#F9F9F7', borderBottom: '4px solid #111111' }}>
        <div className="mx-auto max-w-screen-xl px-6 py-20 md:py-28 flex flex-col items-center text-center">

          <p data-animate="up" className="np-mono text-[10px] font-semibold uppercase mb-6 px-3 py-1.5 border border-[#E5E5E0]"
            style={{ letterSpacing: '0.2em', color: '#CC0000', background: 'rgba(204,0,0,0.05)' }}>
            ★ Free to Start — No Credit Card
          </p>

          <h2
            data-animate="up" data-delay="80"
            className="np-serif font-black mb-6 max-w-3xl"
            style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)', color: '#111111', lineHeight: 0.95, letterSpacing: '-0.025em' }}
          >
            Your knowledge.{' '}
            <em className="np-serif" style={{ color: '#CC0000', fontStyle: 'italic' }}>Finally answerable.</em>
          </h2>

          <p data-animate="up" data-delay="160" className="np-body text-[16px] leading-relaxed mb-10 max-w-xl" style={{ color: '#525252' }}>
            Join 2,400+ students, developers, and researchers who use AskBro to work smarter every day.
          </p>

          <div data-animate="up" data-delay="240" className="flex flex-wrap justify-center gap-4 mb-12">
            <Link href="/create" className="inline-flex items-center gap-2 px-8 py-4 np-sans text-[12px] font-bold uppercase tracking-widest transition-opacity hover:opacity-85"
              style={{ background: '#CC0000', color: '#F9F9F7', border: '2px solid #CC0000' }}>
              Create Free Workspace <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </Link>
            <Link href="/blog" className="inline-flex items-center gap-2 px-8 py-4 np-sans text-[12px] font-bold uppercase tracking-widest transition-colors hover:border-[#CC0000] hover:text-[#CC0000]"
              style={{ color: '#111111', border: '2px solid #111111' }}>
              Read the Blog
            </Link>
          </div>

          {/* Trust pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {['No credit card', 'Free forever plan', 'Private by default', '15+ file formats', 'Ready in 30s'].map((pill) => (
              <span key={pill} className="np-mono text-[10px] uppercase px-3 py-1.5" style={{ letterSpacing: '0.12em', color: '#737373', border: '1px solid #E5E5E0' }}>
                {pill}
              </span>
            ))}
          </div>

        </div>
      </section>

    </PublicLayout>
  )
}
