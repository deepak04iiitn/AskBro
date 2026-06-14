import Link from 'next/link'
import Navbar from './Navbar'
import ScrollAnimations from './ScrollAnimations'
import { Share2, Code2, Globe } from 'lucide-react'

const footerSections = [
  {
    title: 'Features',
    links: [
      { href: '/features/document-qa',    label: 'Document Q&A' },
      { href: '/features/github-repo',    label: 'GitHub Repo Q&A' },
      { href: '/features/integrations',   label: 'Integrations' },
      { href: '/features/interview-prep', label: 'Interview Prep' },
      { href: '/features/quizzes',        label: 'AI Quizzes' },
      { href: '/features/flashcards',     label: 'Flashcards' },
    ],
  },
  {
    title: 'Use Cases',
    links: [
      { href: '/use-cases/students',          label: 'Students' },
      { href: '/use-cases/engineering-teams', label: 'Engineering Teams' },
      { href: '/use-cases/developers',        label: 'Developers' },
      { href: '/use-cases/onboarding',        label: 'Job Seekers' },
    ],
  },
  {
    title: 'Compare',
    links: [
      { href: '/compare/askbro-vs-chatpdf',    label: 'vs ChatPDF' },
      { href: '/compare/askbro-vs-notebooklm', label: 'vs NotebookLM' },
      { href: '/compare/askbro-vs-perplexity', label: 'vs Perplexity' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { href: '/blog',   label: 'Blog' },
      { href: '/login',  label: 'Sign In' },
      { href: '/create', label: 'Create Workspace' },
    ],
  },
]

const socialLinks = [
  { Icon: Share2, href: '#', label: 'Twitter / X' },
  { Icon: Code2,  href: '#', label: 'GitHub' },
  { Icon: Globe,  href: '#', label: 'LinkedIn' },
]

export default function PublicLayout({ children }) {
  const year = new Date().getFullYear()

  return (
    <div className="newsprint-bg min-h-screen" style={{ color: '#111111', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <ScrollAnimations />
      <Navbar />
      <main>{children}</main>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer style={{ background: '#0D0D0D', borderTop: '4px solid #CC0000' }}>

        {/* Top band — brand + tagline + CTA */}
        <div className="mx-auto max-w-screen-xl px-6 pt-16 pb-12" style={{ borderBottom: '1px solid #1E1E1E' }}>
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10">

            {/* Brand */}
            <div className="max-w-md">
              <Link href="/" className="flex items-center gap-3 mb-5" aria-label="AskBro">
                <img src="/AskBro_Logo.png" alt="AskBro" className="h-10 w-10 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
                <span className="np-serif font-black leading-none tracking-tight" style={{ fontSize: '2rem', color: '#F9F9F7' }}>Ask<span style={{ color: '#CC0000' }}>Bro</span></span>
              </Link>
                <p className="np-body text-[14px] leading-relaxed mb-6" style={{ color: '#999' }}>
                  The AI workspace that turns your documents, GitHub repos, and study material into answers — instantly.
                </p>
                <div className="flex items-center gap-3">
                  {socialLinks.map(({ Icon, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      aria-label={label}
                      className="w-9 h-9 flex items-center justify-center transition-all duration-150 hover:text-[#F9F9F7] hover:border-[#888]"
                      style={{ border: '1px solid #444', color: '#888', borderRadius: 0 }}
                    >
                    <Icon className="w-4 h-4" strokeWidth={1.5} />
                  </a>
                ))}
              </div>
            </div>

            {/* CTA block */}
            <div className="flex flex-col items-start lg:items-end gap-4">
              <p className="np-mono text-[10px] uppercase" style={{ letterSpacing: '0.2em', color: '#888' }}>Start for free today</p>
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-8 py-4 np-sans text-[12px] font-bold uppercase tracking-widest transition-opacity hover:opacity-85"
                style={{ background: '#CC0000', color: '#F9F9F7' }}
              >
                Create Free Workspace →
              </Link>
              <p className="np-mono text-[10px]" style={{ color: '#777', letterSpacing: '0.08em' }}>No credit card · Free forever plan</p>
            </div>

          </div>
        </div>

        {/* Nav columns */}
        <div className="mx-auto max-w-screen-xl px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {footerSections.map((section) => (
              <div key={section.title}>
                <p className="np-mono text-[9px] font-bold uppercase mb-5" style={{ letterSpacing: '0.2em', color: '#CC0000' }}>
                  {section.title}
                </p>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="np-sans text-[13px] transition-colors duration-150 hover:text-[#F9F9F7]"
                        style={{ color: '#999' }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mx-auto max-w-screen-xl px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3" style={{ borderTop: '1px solid #1A1A1A' }}>
          <p className="np-mono text-[10px] uppercase" style={{ letterSpacing: '0.15em', color: '#555' }}>
            © {year} Ask<span style={{ color: '#CC0000' }}>Bro</span> · All rights reserved
          </p>
          <p className="np-mono text-[10px] uppercase" style={{ letterSpacing: '0.15em', color: '#555' }}>
            Built for curious minds · AI Edition
          </p>
        </div>

      </footer>
    </div>
  )
}
