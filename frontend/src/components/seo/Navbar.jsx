'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, ChevronDown, LayoutDashboard, LogOut } from 'lucide-react'
import useAuthStore from '@/store/useAuthStore'


const NAV_LINKS = [
  {
    label: 'Features',
    children: [
      { href: '/features/document-qa',    label: 'Document Q&A',    sub: 'Chat with PDFs & docs' },
      { href: '/features/github-repo',    label: 'GitHub Repo Q&A', sub: 'Understand any codebase' },
      { href: '/features/integrations',   label: 'Integrations',    sub: 'Connect Notion & GitHub' },
      { href: '/features/interview-prep', label: 'Interview Prep',  sub: 'Ace technical interviews', comingSoon: true },
      { href: '/features/quizzes',        label: 'AI Quizzes',      sub: 'Generate quizzes from docs', comingSoon: true },
      { href: '/features/flashcards',     label: 'Flashcards',      sub: 'Spaced-repetition study',    comingSoon: true },
    ],
  },
  {
    label: 'Use Cases',
    children: [
      { href: '/use-cases/students',          label: 'Students',         sub: 'Study smarter with AI' },
      { href: '/use-cases/engineering-teams', label: 'Engineering Teams', sub: 'Team knowledge base' },
      { href: '/use-cases/developers',        label: 'Developers',        sub: 'Understand codebases' },
      { href: '/use-cases/onboarding',        label: 'Job Seekers',       sub: 'Land your next role' },
    ],
  },
  {
    label: 'Compare',
    children: [
      { href: '/compare/askbro-vs-chatpdf',    label: 'AskBro vs ChatPDF' },
      { href: '/compare/askbro-vs-notebooklm', label: 'AskBro vs NotebookLM' },
      { href: '/compare/askbro-vs-perplexity', label: 'AskBro vs Perplexity' },
    ],
  },
  { label: 'Blog', href: '/blog' },
]

function renderLabel(label) {
  if (!label.includes('AskBro')) return label
  const [before, after] = label.split('AskBro')
  return <>{before}Ask<span style={{ color: '#CC0000' }}>Bro</span>{after}</>
}

function DropdownMenu({ label, children }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="np-sans flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest px-3 py-2 transition-colors duration-150 hover:text-[#CC0000]"
        style={{ color: open ? '#CC0000' : '#111111' }}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {label}
        <ChevronDown
          className="w-3 h-3 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          strokeWidth={2}
        />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 z-50 min-w-[220px]"
          style={{
            background: '#F9F9F7',
            border: '1px solid #111111',
            boxShadow: '4px 4px 0px 0px #111111',
            marginTop: 4,
          }}
        >
          {children.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 border-b border-[#E5E5E0] last:border-b-0 transition-colors duration-150 hover:bg-[#111111] hover:text-[#F9F9F7] group"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="np-sans text-[11px] font-semibold uppercase tracking-widest block">{renderLabel(item.label)}</span>
                {item.comingSoon && (
                  <span className="np-mono text-[8px] font-bold uppercase shrink-0 px-1.5 py-0.5" style={{ background: '#F0EDE6', color: '#737373', border: '1px solid #D9D7D2', letterSpacing: '0.1em' }}>
                    Soon
                  </span>
                )}
              </div>
              {item.sub && (
                <span className="np-body text-[11px] text-[#737373] group-hover:text-[#E5E5E0] block mt-0.5">{item.sub}</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSection, setMobileSection] = useState(null)
  const [mounted, setMounted] = useState(false)

  const router  = useRouter()
  const user    = useAuthStore((s) => s.user)
  const hydrate = useAuthStore((s) => s.hydrate)
  const logout  = useAuthStore((s) => s.logout)

  function handleLogout() {
    logout()
    router.push('/login')
  }

  // Hydrate auth from localStorage after first client paint
  useEffect(() => {
    hydrate()
    setMounted(true)
  }, [hydrate])

  const today = new Date()
  const edition = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <header
      className="newsprint-bg sticky top-0 z-40"
      style={{ borderBottom: '2px solid #111111' }}
    >
      {/* Single main row: Logo + Nav + CTA — all inline */}
      <div className="mx-auto max-w-screen-xl px-6">
        <div className="flex items-center justify-between gap-4 py-3">

          {/* Logo */}
          <Link href="/" aria-label="AskBro Home" className="shrink-0">
            <div className="flex items-center gap-2.5">
              <img
                src="/AskBro_Logo.png"
                alt="AskBro"
                className="h-10 w-10 object-contain"
              />
              <span
                className="np-serif font-black tracking-tight leading-none"
                style={{ fontSize: '1.75rem', color: '#111111' }}
              >
                Ask<span style={{ color: '#CC0000' }}>Bro</span>
              </span>
            </div>
          </Link>

          {/* Desktop nav links — center */}
          <nav
            className="hidden md:flex items-center justify-center flex-1"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map((item) =>
              item.children ? (
                <DropdownMenu key={item.label} label={item.label} children={item.children} />
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="np-sans text-[11px] font-semibold uppercase tracking-widest px-3 py-2 transition-colors duration-150 hover:text-[#CC0000]"
                  style={{ color: '#111111' }}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* Desktop CTA — right */}
          <div className="hidden md:flex items-center gap-2 shrink-0" style={{ minWidth: 160 }}>
            {!mounted ? null : user ? (
              <>
                <Link
                  href="/dashboard"
                  className="btn-ink px-5 py-2.5 inline-flex items-center gap-2 min-h-[36px]"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" strokeWidth={2} />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="np-sans text-[11px] font-semibold uppercase tracking-widest px-3 py-2 inline-flex items-center gap-1.5 transition-colors duration-150 hover:text-[#CC0000] cursor-pointer"
                  style={{ color: '#737373' }}
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" strokeWidth={2} />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="np-sans text-[11px] font-semibold uppercase tracking-widest px-4 py-2 transition-colors duration-150 hover:text-[#CC0000]"
                  style={{ color: '#111111' }}
                >
                  Sign In
                </Link>
                <Link href="/create" className="btn-ink px-5 py-2.5 inline-flex items-center min-h-[36px]">
                  Start Free →
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 border border-[#111111] hover:bg-[#111111] hover:text-[#F9F9F7] transition-colors duration-150"
            onClick={() => setMobileOpen(v => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen
              ? <X    className="w-5 h-5" strokeWidth={1.5} />
              : <Menu className="w-5 h-5" strokeWidth={1.5} />
            }
          </button>

        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="md:hidden border-t border-[#E5E5E0]"
          style={{ background: '#F9F9F7' }}
        >
          <div className="mx-auto max-w-screen-xl px-6 pt-3 pb-5">
            {NAV_LINKS.map((item) => (
              <div key={item.label} className="border-b border-[#E5E5E0]">
                {item.children ? (
                  <>
                    <button
                      className="w-full flex items-center justify-between py-3 np-sans text-[11px] font-semibold uppercase tracking-widest text-left hover:text-[#CC0000] transition-colors"
                      style={{ color: '#111111' }}
                      onClick={() => setMobileSection(mobileSection === item.label ? null : item.label)}
                    >
                      {item.label}
                      <ChevronDown
                        className="w-3.5 h-3.5 transition-transform duration-200 shrink-0"
                        style={{ transform: mobileSection === item.label ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        strokeWidth={2}
                      />
                    </button>
                    {mobileSection === item.label && (
                      <div className="pl-4 pb-2 border-t border-[#E5E5E0]">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => { setMobileOpen(false); setMobileSection(null) }}
                            className="flex items-center justify-between py-2.5 np-sans text-[11px] font-semibold uppercase tracking-widest hover:text-[#CC0000] transition-colors border-b border-[#E5E5E0] last:border-b-0"
                            style={{ color: '#525252' }}
                          >
                            {renderLabel(child.label)}
                            {child.comingSoon && (
                              <span className="np-mono text-[8px] font-bold uppercase px-1.5 py-0.5 ml-2" style={{ background: '#F0EDE6', color: '#737373', border: '1px solid #D9D7D2', letterSpacing: '0.1em' }}>
                                Soon
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block py-3 np-sans text-[11px] font-semibold uppercase tracking-widest hover:text-[#CC0000] transition-colors"
                    style={{ color: '#111111' }}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
            <div className="pt-4 flex flex-col gap-2">
              {!mounted ? null : user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="btn-ink w-full text-center py-3 flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" strokeWidth={2} />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { setMobileOpen(false); handleLogout() }}
                    className="btn-outline-ink w-full py-3 flex items-center justify-center gap-2 cursor-pointer"
                    style={{ color: '#737373', borderColor: '#E5E5E0' }}
                  >
                    <LogOut className="w-4 h-4" strokeWidth={2} />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="btn-outline-ink w-full text-center py-3"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/create"
                    onClick={() => setMobileOpen(false)}
                    className="btn-ink w-full text-center py-3"
                    style={{ background: '#CC0000', borderColor: '#CC0000' }}
                  >
                    Start Free →
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </header>
  )
}
