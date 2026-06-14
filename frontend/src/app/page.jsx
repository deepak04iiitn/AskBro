import Link from 'next/link'
import {
  FileText, GitBranch, Target, BrainCircuit, Layers, Plug2,
  ArrowRight, Upload, Cpu, MessageSquare,
  Shield, Zap, Users, BookOpen,
} from 'lucide-react'
import JsonLd from '@/components/seo/JsonLd'
import PublicLayout from '@/components/seo/PublicLayout'
import PersonaTabs from '@/components/seo/PersonaTabs'
import TestimonialsSection from '@/components/seo/TestimonialsSection'

export const metadata = {
  title: 'AskBro — Chat with PDFs, GitHub Repos & AI Study Tools | Free',
  description: 'AskBro is the AI workspace that lets you chat with PDFs, ask questions about any GitHub repository with cited answers, ace technical interviews, and auto-generate quizzes and flashcards from your documents. Free to start.',
  keywords: [
    'AI knowledge base', 'chat with PDF', 'ask questions about PDF', 'AI document assistant',
    'PDF Q&A tool', 'ask questions about GitHub repo', 'AI code explainer',
    'understand GitHub codebase with AI', 'AI technical interview prep', 'coding interview AI coach',
    'AI quiz generator from PDF', 'AI flashcard generator', 'best AI study tool', 'AskBro',
    'document chat AI', 'chat with documents free', 'RAG document QA', 'AI knowledge workspace',
    'PDF to flashcards', 'GitHub AI assistant', 'codebase AI search',
  ],
  alternates: { canonical: 'https://askbro.app' },
  openGraph: {
    type: 'website', locale: 'en_US', siteName: 'AskBro', url: 'https://askbro.app',
    title: 'AskBro — Chat with PDFs, GitHub Repos & AI Study Tools | Free',
    description: 'Chat with PDFs, ask questions about GitHub codebases, ace technical interviews, and auto-generate quizzes and flashcards — all in one private AI workspace. Free to start.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'AskBro — AI Knowledge Workspace' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AskBro — Chat with PDFs, GitHub Repos & AI Study Tools',
    description: 'Chat with PDFs, understand GitHub repos, ace interviews, and auto-generate quizzes and flashcards — free to start.',
    images: ['/og-image.png'],
  },
}

const homepageJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'AskBro',
    applicationCategory: 'ProductivityApplication',
    applicationSubCategory: 'AI Knowledge Management',
    operatingSystem: 'Web',
    url: 'https://askbro.app',
    description: 'AI workspace for chatting with PDFs, understanding GitHub repositories, technical interview preparation, and generating quizzes and flashcards from documents.',
    featureList: [
      'Chat with PDF documents and get cited answers',
      'Ask questions about GitHub repositories with file-level citations',
      'AI-powered technical interview preparation with scored feedback',
      'Auto-generate quizzes and practice questions from any document',
      'Create spaced-repetition flashcard decks from study material',
      'Multi-document search across your entire knowledge base',
      'Private workspace — your documents stay your own',
    ],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free plan available. No credit card required.',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '2400',
      bestRating: '5',
      worstRating: '1',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is AskBro?',
        acceptedAnswer: { '@type': 'Answer', text: 'AskBro is an AI knowledge workspace that lets you chat with PDF documents, ask questions about GitHub repositories, practice technical interviews with AI coaching, and automatically generate quizzes and flashcards from your study material — all in one private workspace.' },
      },
      {
        '@type': 'Question',
        name: 'Is AskBro free to use?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. AskBro has a free plan that requires no credit card. You can create a workspace, upload documents, and start chatting with your PDFs immediately at no cost.' },
      },
      {
        '@type': 'Question',
        name: 'What file types does AskBro support?',
        acceptedAnswer: { '@type': 'Answer', text: 'AskBro supports PDF, DOCX, DOC, TXT, and Markdown files. You can upload multiple documents and ask questions across all of them at once, with citations pointing to the exact page and file.' },
      },
      {
        '@type': 'Question',
        name: 'Can AskBro read and answer questions about GitHub repositories?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. Paste any public GitHub repository URL and AskBro indexes the entire codebase — source files, README, documentation, and configuration files. You can then ask architecture questions, trace bugs, and understand any part of the code with exact file and line citations.' },
      },
      {
        '@type': 'Question',
        name: 'How is AskBro different from ChatPDF or NotebookLM?',
        acceptedAnswer: { '@type': 'Answer', text: 'AskBro goes beyond single-document PDF chat. It combines document Q&A, GitHub repository search, technical interview coaching, AI quiz generation, and flashcard creation in one workspace. ChatPDF focuses only on PDF chat; NotebookLM focuses on document grounding and notes. AskBro is a complete AI learning and knowledge platform.' },
      },
      {
        '@type': 'Question',
        name: 'How accurate are AskBro\'s answers?',
        acceptedAnswer: { '@type': 'Answer', text: 'AskBro uses retrieval-augmented generation (RAG), which means every answer is grounded in your own uploaded documents or indexed repository — not general internet knowledge. Every answer includes a citation showing the exact source, preventing AI hallucinations.' },
      },
    ],
  },
]

const features = [
  { icon: FileText,     title: 'Document Q&A',    sub: 'Chat with PDFs, docs and Markdown. Get page-level citations on every answer.',                                                                        href: '/features/document-qa',    tag: 'Popular' },
  { icon: GitBranch,    title: 'GitHub Repo Q&A', sub: 'Connect your GitHub account and import any repository. Ask questions across the entire codebase with exact file and line citations.',                  href: '/features/github-repo',    tag: 'New' },
  { icon: Plug2,        title: 'Integrations',    sub: 'Connect Notion and GitHub — import pages and repositories directly into your workspace and ask questions across every source.',                      href: '/features/integrations' },
  { icon: Target,       title: 'Interview Prep',  sub: 'AI coaching for technical rounds — DSA, system design, and behavioural. Honest scored feedback so you can improve fast.',                              href: '/features/interview-prep', comingSoon: true },
  { icon: BrainCircuit, title: 'AI Quizzes',      sub: 'Turn any document into an adaptive multiple-choice, true/false, or short-answer quiz. Test knowledge, not memory.',                                   href: '/features/quizzes',        comingSoon: true },
  { icon: Layers,       title: 'Flashcards',      sub: 'Spaced-repetition decks auto-generated from your study material. Study smarter with cards that adapt to what you know.',                              href: '/features/flashcards',     comingSoon: true },
]

const steps = [
  { icon: Upload,        n: '01', title: 'Upload or Connect',  body: 'Add a PDF, paste a GitHub URL, or drop in your study notes. No conversion required.' },
  { icon: Cpu,           n: '02', title: <>Ask<span style={{ color: '#CC0000' }}>Bro</span> Reads It</>,     body: <>Ask<span style={{ color: '#CC0000' }}>Bro</span> reads and understands every word in your document or repo — fully processed and ready to answer in under 30 seconds.</> },
  { icon: MessageSquare, n: '03', title: 'Ask, Quiz, Prepare', body: 'Chat with your knowledge, generate quizzes, build flashcards, or start a live interview session.' },
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
                  <span className="np-mono text-[9px] uppercase tracking-widest ml-3" style={{ color: '#888' }}>Ask<span style={{ color: '#CC0000' }}>Bro</span> — github.com/vercel/next.js</span>
                </div>
                <div className="p-4 space-y-3" style={{ background: '#FAFAF8' }}>
                  <div className="flex justify-end">
                    <div className="max-w-[82%] px-3.5 py-2.5 np-body text-[13px]" style={{ background: '#111111', color: '#F9F9F7' }}>How does Next.js handle SSR?</div>
                  </div>
                  <div className="flex justify-start">
                    <div className="px-3.5 py-3 np-body text-[13px] border border-[#E5E5E0]" style={{ background: '#fff', color: '#111111' }}>
                      <span className="np-mono text-[9px] uppercase tracking-widest block mb-1.5" style={{ color: '#CC0000' }}>Ask<span style={{ color: '#CC0000' }}>Bro</span> · server/render.ts</span>
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
                  <span className="np-mono text-[9px] uppercase tracking-widest ml-3" style={{ color: '#888' }}>Ask<span style={{ color: '#CC0000' }}>Bro</span> — github.com/vercel/next.js</span>
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
                      <span className="np-mono text-[9px] uppercase tracking-widest block mb-2" style={{ color: '#CC0000' }}>Ask<span style={{ color: '#CC0000' }}>Bro</span> · server/render.ts, packages/next/src/server</span>
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
                      <span className="np-mono text-[9px] uppercase tracking-widest block mb-2" style={{ color: '#CC0000' }}>Ask<span style={{ color: '#CC0000' }}>Bro</span> · packages/next/src/shared/lib/router</span>
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

          {/* Grid: 6 cards — 3 top, 3 bottom */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 border-l border-t border-[#111111]">
            {features.map(({ icon: Icon, title, sub, href, tag, comingSoon }, i) => (
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
                  {comingSoon ? (
                    <span className="np-mono text-[8px] font-bold uppercase px-2.5 py-1.5" style={{ background: '#F0EDE6', color: '#737373', border: '1px solid #D9D7D2', letterSpacing: '0.12em' }}>
                      Coming Soon
                    </span>
                  ) : tag ? (
                    <span className="np-mono text-[8px] font-bold uppercase px-2.5 py-1.5" style={{ background: '#CC0000', color: '#F9F9F7', letterSpacing: '0.12em' }}>
                      {tag}
                    </span>
                  ) : null}
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
              <h2 className="np-serif font-black" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)', color: '#111111' }}>Who Uses Ask<span style={{ color: '#CC0000' }}>Bro</span></h2>
              <div className="flex-1 h-px bg-[#111111] hidden md:block" />
            </div>
          </div>
          <div className="py-12">
            <PersonaTabs />
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <TestimonialsSection />

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="mt-10" aria-labelledby="faq-heading" style={{ borderBottom: '4px solid #111111' }}>
        <div className="mx-auto max-w-screen-xl px-6">
          <div className="py-10 border-b border-[#111111]">
            <div className="flex items-center gap-5">
              <span className="np-mono text-[9px] uppercase" style={{ letterSpacing: '0.2em', color: '#CC0000' }}>§ 04</span>
              <h2 id="faq-heading" className="np-serif font-black" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)', color: '#111111' }}>Common Questions</h2>
              <div className="flex-1 h-px bg-[#111111] hidden md:block" />
            </div>
          </div>
          <div className="grid lg:grid-cols-2 gap-6 py-12">
            {[
              { q: 'What is AskBro?', a: 'AskBro is an AI knowledge workspace that lets you chat with PDF documents, ask questions about GitHub repositories, practice technical interviews, and automatically generate quizzes and flashcards — all in one private, free workspace.' },
              { q: 'Is AskBro free to use?', a: 'Yes. AskBro has a free plan with no credit card required. Create a workspace in seconds and start chatting with your PDFs or GitHub repos immediately.' },
              { q: 'What file types does AskBro support for document Q&A?', a: 'AskBro supports PDF, DOCX, DOC, TXT, and Markdown files. You can upload multiple documents and ask questions that span your entire library — with citations pointing to the exact page and file.' },
              { q: 'Can AskBro read and answer questions about GitHub repositories?', a: 'Yes. Paste any public GitHub repository URL and AskBro indexes the entire codebase — source files, README, documentation, and configuration files. Ask architecture questions, trace bugs, and understand any part of the code with exact file and line citations.' },
              { q: 'How is AskBro different from ChatPDF or NotebookLM?', a: 'AskBro combines document Q&A, GitHub repo search, technical interview coaching, AI quiz generation, and flashcard creation in one workspace. ChatPDF focuses only on PDF chat; NotebookLM focuses on document grounding. AskBro is a complete AI learning and knowledge platform.' },
              { q: 'How accurate are AskBro\'s answers?', a: 'AskBro uses retrieval-augmented generation (RAG), meaning every answer is grounded in your own uploaded documents — not general internet knowledge. Every response includes a page-level citation so you can verify the source instantly.' },
            ].map(({ q, a }) => (
              <div key={q} className="p-8 border border-[#E5E5E0]" style={{ background: '#fff' }}>
                <h3 className="np-serif font-bold text-[1.05rem] mb-3" style={{ color: '#111111' }}>{q}</h3>
                <p className="np-body text-[14px] leading-relaxed" style={{ color: '#525252' }}>{a}</p>
              </div>
            ))}
          </div>
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
            Join 2,400+ students, developers, and researchers who use Ask<span style={{ color: '#CC0000' }}>Bro</span> to work smarter every day.
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
