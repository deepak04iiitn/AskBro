import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import PublicLayout from './PublicLayout'
import JsonLd from './JsonLd'

export default function FeaturePageShell({ icon: Icon, title, headline, description, benefits, steps, faqItems, related, faqJsonLd, stats }) {
  return (
    <PublicLayout>
      {faqJsonLd && <JsonLd data={faqJsonLd} />}

      {/* ── Breadcrumb ───────────────────────────────────────── */}
      <div className="border-b" style={{ borderColor: '#E5E5E0', background: 'rgba(0,0,0,0.02)' }}>
        <div className="mx-auto max-w-screen-xl px-6 py-3 flex items-center gap-2 np-mono text-[10px] uppercase tracking-widest" style={{ color: '#737373' }}>
          <Link href="/" className="hover:text-[#CC0000] transition-colors duration-150">Home</Link>
          <span>/</span>
          <Link href="/#features" className="hover:text-[#CC0000] transition-colors duration-150">Features</Link>
          <span>/</span>
          <span style={{ color: '#111111' }}>{title}</span>
        </div>
      </div>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section style={{ borderBottom: '4px solid #111111', background: '#F9F9F7' }}>
        <div className="mx-auto max-w-screen-xl px-6 py-16 md:py-20">
          <div className="flex flex-col lg:flex-row lg:items-start gap-12">

            {/* Copy */}
            <div className="flex-1">
              <div data-animate="up" className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 border-2 border-[#111111] flex items-center justify-center" style={{ background: '#fff' }}>
                  {Icon && <Icon className="w-5 h-5" strokeWidth={1.5} style={{ color: '#CC0000' }} />}
                </div>
                <p className="np-mono text-[10px] font-semibold uppercase" style={{ letterSpacing: '0.2em', color: '#CC0000' }}>★ Feature Report</p>
              </div>
              <h1 data-animate="up" data-delay="80" className="np-serif font-black leading-[0.92] mb-6" style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', color: '#111111', letterSpacing: '-0.02em' }}>
                {headline}
              </h1>
              <p data-animate="up" data-delay="160" className="np-body text-[16px] leading-relaxed mb-8 max-w-xl" style={{ color: '#525252' }}>
                {description}
              </p>
              <div data-animate="up" data-delay="240" className="flex flex-wrap gap-3">
                <Link href="/create" className="btn-ink px-7 py-3.5 inline-flex items-center gap-2" style={{ background: '#CC0000', borderColor: '#CC0000' }}>
                  Try It Free <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </Link>
                <Link href="/login" className="btn-outline-ink px-7 py-3.5 transition-colors hover:border-[#CC0000] hover:text-[#CC0000]">
                  Sign In
                </Link>
              </div>
            </div>

            {/* Stats */}
            {stats?.length > 0 && (
              <div data-animate="right" data-delay="200" className="lg:w-[280px] shrink-0 border border-[#E5E5E0]" style={{ background: '#fff', boxShadow: '5px 5px 0 #E5E5E0' }}>
                <div className="px-6 py-4 border-b border-[#E5E5E0]">
                  <p className="np-mono text-[9px] uppercase font-bold" style={{ letterSpacing: '0.2em', color: '#CC0000' }}>Key Stats</p>
                </div>
                <div className="divide-y divide-[#E5E5E0]">
                  {stats.map(({ value, label }) => (
                    <div key={label} className="px-6 py-4">
                      <span className="np-serif font-black text-[2.2rem] leading-none block" style={{ color: '#111111' }}>{value}</span>
                      <span className="np-mono text-[9px] uppercase mt-1 block" style={{ letterSpacing: '0.1em', color: '#737373' }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Benefits ─────────────────────────────────────────── */}
      {benefits?.length > 0 && (
        <section className="mt-10" style={{ borderBottom: '4px solid #111111' }}>
          <div className="mx-auto max-w-screen-xl px-6">
            <div className="py-10">
              <div data-animate="left" className="flex items-center gap-5">
                <span className="np-mono text-[9px] uppercase" style={{ letterSpacing: '0.2em', color: '#CC0000' }}>§ 01</span>
                <h2 className="np-serif font-black" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)', color: '#111111' }}>What You Get</h2>
                <div className="flex-1 h-px bg-[#111111] hidden md:block" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 border-l border-t border-[#111111]">
              {benefits.map(({ title: bTitle, body }, i) => (
                <div key={bTitle} data-animate="up" data-delay={i * 70} data-spotlight
                  className="p-10 border-r border-b border-[#111111] transition-colors duration-200 hover:bg-[rgba(204,0,0,0.02)]">
                  <div className="w-9 h-9 border border-[#111111] flex items-center justify-center mb-6 transition-colors duration-200 group-hover:border-[#CC0000]">
                    <Check className="w-4 h-4" strokeWidth={2.5} style={{ color: '#CC0000' }} />
                  </div>
                  <h3 className="np-serif font-bold text-[1.2rem] mb-3" style={{ color: '#111111' }}>{bTitle}</h3>
                  <p className="np-body text-[14px] leading-relaxed" style={{ color: '#525252' }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── How It Works ─────────────────────────────────────── */}
      {steps?.length > 0 && (
        <section className="mt-10" style={{ borderBottom: '4px solid #111111', background: '#F9F9F7' }}>
          <div className="mx-auto max-w-screen-xl px-6">
            <div className="py-10">
              <div data-animate="left" className="flex items-center gap-5">
                <span className="np-mono text-[9px] uppercase" style={{ letterSpacing: '0.2em', color: '#CC0000' }}>§ 02</span>
                <h2 className="np-serif font-black" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)', color: '#111111' }}>How It Works</h2>
                <div className="flex-1 h-px bg-[#111111] hidden md:block" />
              </div>
            </div>
            <div data-stagger className="grid md:grid-cols-3 gap-8 pb-16">
              {steps.map(({ n, title: sTitle, body }, i) => {
                const stepNum = n ?? String(i + 1).padStart(2, '0')
                return (
                  <div key={stepNum} className="flex flex-col">
                    <div className="flex items-center gap-4 mb-5">
                      <span className="np-mono font-black text-[2.5rem] leading-none" style={{ color: i === 1 ? '#CC0000' : '#E5E5E0' }}>{stepNum}</span>
                      <div className="flex-1 h-px" style={{ background: '#E5E5E0' }} />
                    </div>
                    <h3 className="np-serif font-bold text-[1.2rem] mb-3" style={{ color: '#111111' }}>{sTitle}</h3>
                    <p className="np-body text-[14px] leading-relaxed" style={{ color: '#525252' }}>{body}</p>
                  </div>
                )
              })}
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

      {/* ── Related ──────────────────────────────────────────── */}
      {related?.length > 0 && (
        <section className="mt-10" style={{ borderBottom: '4px solid #111111', background: '#F9F9F7' }}>
          <div className="mx-auto max-w-screen-xl px-6">
            <div className="py-10">
              <div data-animate="left" className="flex items-center gap-5">
                <span className="np-mono text-[9px] uppercase" style={{ letterSpacing: '0.2em', color: '#CC0000' }}>§ 04</span>
                <h2 className="np-serif font-black" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)', color: '#111111' }}>Also Covered</h2>
                <div className="flex-1 h-px bg-[#111111] hidden md:block" />
              </div>
            </div>
            <div data-stagger className="grid md:grid-cols-3 gap-6 pb-16">
              {related.map((item) => {
                const rTitle = item.title || item.label
                return (
                  <Link key={item.href} href={item.href} data-lift
                    className="block p-8 border border-[#E5E5E0] group transition-colors duration-200 hover:border-[#111111]"
                    style={{ background: '#fff' }}>
                    <h3 className="np-serif font-bold text-[1.15rem] mb-4 group-hover:text-[#CC0000] transition-colors duration-200" style={{ color: '#111111' }}>{rTitle}</h3>
                    <div className="np-sans text-[10px] font-bold uppercase flex items-center gap-2 group-hover:text-[#CC0000] transition-colors duration-200" style={{ letterSpacing: '0.1em', color: '#737373' }}>
                      Read More <ArrowRight className="w-3 h-3" strokeWidth={2} />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="mt-10" style={{ borderBottom: '4px solid #111111', background: '#F9F9F7' }}>
        <div className="mx-auto max-w-screen-xl px-6 py-20 flex flex-col items-center text-center">
          <p data-animate="up" className="np-mono text-[10px] font-semibold uppercase mb-5 px-3 py-1.5 border border-[#E5E5E0]" style={{ letterSpacing: '0.2em', color: '#CC0000', background: 'rgba(204,0,0,0.05)' }}>★ Try It Free</p>
          <h2 data-animate="up" data-delay="80" className="np-serif font-black mb-5 max-w-2xl" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', color: '#111111', lineHeight: 0.95, letterSpacing: '-0.02em' }}>
            Ready to try {title}?
          </h2>
          <p data-animate="up" data-delay="160" className="np-body text-[16px] mb-8 max-w-lg" style={{ color: '#525252' }}>
            Create a free workspace and experience every feature described above.
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
