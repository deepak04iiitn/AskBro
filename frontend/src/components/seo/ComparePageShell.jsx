import Link from 'next/link'
import { ArrowRight, Check, X } from 'lucide-react'
import PublicLayout from './PublicLayout'
import JsonLd from './JsonLd'

export default function ComparePageShell({ competitor, headline, tagline, description, comparisonRows, rows, askBroWins, askbroWins, faqItems, faqJsonLd }) {
  const displayHeadline = headline || tagline
  const tableRows = comparisonRows || rows || []
  const wins = (askBroWins || askbroWins || []).map((item) =>
    typeof item === 'string' ? { title: item, body: null } : item
  )

  function renderCell(value) {
    if (typeof value === 'boolean') {
      return value ? (
        <span className="inline-flex w-5 h-5 border border-[#111111] bg-[#111111] items-center justify-center">
          <Check className="w-3 h-3 text-[#F9F9F7]" strokeWidth={2.5} />
        </span>
      ) : (
        <X className="w-4 h-4 mx-auto" style={{ color: '#CC0000' }} strokeWidth={2} />
      )
    }
    return <span className="np-mono text-[11px] font-semibold" style={{ color: '#111111' }}>{value}</span>
  }

  function renderCompetitorCell(value) {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-4 h-4 mx-auto" style={{ color: '#A3A3A3' }} strokeWidth={2} />
      ) : (
        <X className="w-4 h-4 mx-auto" style={{ color: '#D4D4D4' }} strokeWidth={2} />
      )
    }
    return <span className="np-mono text-[11px]" style={{ color: '#A3A3A3' }}>{value}</span>
  }

  return (
    <PublicLayout>
      {faqJsonLd && <JsonLd data={faqJsonLd} />}

      {/* ── Breadcrumb ───────────────────────────────────────── */}
      <div className="border-b" style={{ borderColor: '#E5E5E0', background: 'rgba(0,0,0,0.02)' }}>
        <div className="mx-auto max-w-screen-xl px-6 py-3 flex items-center gap-2 np-mono text-[10px] uppercase tracking-widest" style={{ color: '#737373' }}>
          <Link href="/" className="hover:text-[#CC0000] transition-colors duration-150">Home</Link>
          <span>/</span>
          <span>Compare</span>
          <span>/</span>
          <span style={{ color: '#111111' }}>AskBro vs {competitor}</span>
        </div>
      </div>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section style={{ borderBottom: '4px solid #111111', background: '#F9F9F7' }}>
        <div className="mx-auto max-w-screen-xl px-6 py-16 md:py-20">
          <p data-animate="up" className="np-mono text-[10px] font-semibold uppercase mb-5 inline-block px-3 py-1.5 border border-[#E5E5E0]" style={{ letterSpacing: '0.2em', color: '#CC0000', background: 'rgba(204,0,0,0.05)' }}>★ Comparative Analysis</p>
          <h1 data-animate="up" data-delay="80" className="np-serif font-black leading-[0.9] tracking-tight mb-6" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', color: '#111111' }}>
            {displayHeadline}
          </h1>
          <p data-animate="up" data-delay="160" className="np-body text-[16px] leading-relaxed max-w-2xl mb-8" style={{ color: '#525252' }}>
            {description}
          </p>
          <div data-animate="up" data-delay="240">
            <Link href="/create" className="inline-flex items-center gap-2 px-8 py-4 np-sans text-[12px] font-bold uppercase tracking-widest transition-opacity hover:opacity-85" style={{ background: '#CC0000', color: '#F9F9F7', border: '2px solid #CC0000' }}>
              Try AskBro Free <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Comparison Table ─────────────────────────────────── */}
      {tableRows.length > 0 && (
        <section className="mt-10" style={{ borderBottom: '4px solid #111111' }}>
          <div className="mx-auto max-w-screen-xl px-6">
            <div className="py-10">
              <div data-animate="left" className="flex items-center gap-5">
                <span className="np-mono text-[9px] uppercase" style={{ letterSpacing: '0.2em', color: '#CC0000' }}>§ 01</span>
                <h2 className="np-serif font-black" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)', color: '#111111' }}>Feature Comparison</h2>
                <div className="flex-1 h-px bg-[#111111] hidden md:block" />
              </div>
            </div>

            <div data-animate="up" data-delay="80" className="overflow-x-auto pb-16">
              <table className="w-full border border-[#E5E5E0]" style={{ background: '#fff', boxShadow: '5px 5px 0 #E5E5E0' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #111111' }}>
                    <th className="p-5 text-left np-mono text-[10px] uppercase tracking-widest font-semibold border-r border-[#E5E5E0]" style={{ color: '#737373', width: '40%', background: '#F9F9F7' }}>Feature</th>
                    <th className="p-5 text-center np-sans text-[13px] font-black uppercase border-r border-[#E5E5E0]" style={{ color: '#111111', background: 'rgba(204,0,0,0.04)' }}>AskBro</th>
                    <th className="p-5 text-center np-sans text-[13px] font-semibold uppercase" style={{ color: '#A3A3A3', background: '#F9F9F7' }}>{competitor}</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row, i) => {
                    const askBroVal = row.askBro ?? row.askbro
                    const themVal   = row.them   ?? row.competitor
                    return (
                      <tr key={row.feature} className="border-b border-[#E5E5E0] transition-colors duration-150 hover:bg-[rgba(204,0,0,0.02)]" style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.012)' }}>
                        <td className="p-5 border-r border-[#E5E5E0] np-body text-[13px]" style={{ color: '#404040' }}>{row.feature}</td>
                        <td className="p-5 border-r border-[#E5E5E0] text-center">{renderCell(askBroVal)}</td>
                        <td className="p-5 text-center">{renderCompetitorCell(themVal)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ── Why AskBro Wins ──────────────────────────────────── */}
      {wins.length > 0 && (
        <section className="mt-10" style={{ borderBottom: '4px solid #111111', background: '#F9F9F7' }}>
          <div className="mx-auto max-w-screen-xl px-6">
            <div className="py-10">
              <div data-animate="left" className="flex items-center gap-5">
                <span className="np-mono text-[9px] uppercase" style={{ letterSpacing: '0.2em', color: '#CC0000' }}>§ 02</span>
                <h2 className="np-serif font-black" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)', color: '#111111' }}>Why AskBro Wins</h2>
                <div className="flex-1 h-px bg-[#111111] hidden md:block" />
              </div>
            </div>
            <div data-stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
              {wins.map((win, i) => (
                <div key={i} data-lift
                  className="p-8 border border-[#E5E5E0] transition-colors duration-200 hover:border-[#111111]"
                  style={{ background: '#fff' }}>
                  <div className="w-9 h-9 border border-[#E5E5E0] flex items-center justify-center mb-6" style={{ background: 'rgba(204,0,0,0.06)' }}>
                    <Check className="w-4 h-4" strokeWidth={2.5} style={{ color: '#CC0000' }} />
                  </div>
                  {win.title && (
                    <h3 className="np-serif font-bold text-[1.1rem] mb-3" style={{ color: '#111111' }}>{win.title}</h3>
                  )}
                  {win.body && (
                    <p className="np-body text-[14px] leading-relaxed" style={{ color: '#525252' }}>{win.body}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ──────────────────────────────────────────────── */}
      {faqItems?.length > 0 && (
        <section className="mt-10" style={{ borderBottom: '4px solid #111111' }}>
          <div className="mx-auto max-w-screen-xl px-6">
            <div className="py-10">
              <div data-animate="left" className="flex items-center gap-5">
                <span className="np-mono text-[9px] uppercase" style={{ letterSpacing: '0.2em', color: '#CC0000' }}>§ 03</span>
                <h2 className="np-serif font-black" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)', color: '#111111' }}>Common Questions</h2>
                <div className="flex-1 h-px bg-[#111111] hidden md:block" />
              </div>
            </div>
            <div className="grid lg:grid-cols-2 gap-6 pb-16">
              {faqItems.map(({ q, a }, i) => (
                <div key={q} data-animate="up" data-delay={i * 60}
                  className="p-8 border border-[#E5E5E0] transition-shadow duration-200 hover:shadow-md"
                  style={{ background: '#fff' }}>
                  <h3 className="np-serif font-bold text-[1.05rem] mb-3" style={{ color: '#111111' }}>{q}</h3>
                  <p className="np-body text-[14px] leading-relaxed" style={{ color: '#525252' }}>{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="mt-10" style={{ borderBottom: '4px solid #111111', background: '#F9F9F7' }}>
        <div className="mx-auto max-w-screen-xl px-6 py-20 flex flex-col items-center text-center">
          <p data-animate="up" className="np-mono text-[10px] font-semibold uppercase mb-5 px-3 py-1.5 border border-[#E5E5E0]" style={{ letterSpacing: '0.2em', color: '#CC0000', background: 'rgba(204,0,0,0.05)' }}>★ The Verdict</p>
          <h2 data-animate="up" data-delay="80" className="np-serif font-black mb-5 max-w-2xl" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', color: '#111111', lineHeight: 0.95, letterSpacing: '-0.02em' }}>
            Make the switch to AskBro
          </h2>
          <p data-animate="up" data-delay="160" className="np-body text-[16px] mb-8 max-w-lg" style={{ color: '#525252' }}>
            Free to start. No credit card required. See the difference yourself.
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
