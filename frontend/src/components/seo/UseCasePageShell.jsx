import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import PublicLayout from './PublicLayout'
import JsonLd from './JsonLd'

export default function UseCasePageShell({ icon: Icon, persona, headline, tagline, description, painPoints, benefits, features, relatedFeatures, testimonial, faqItems, faqJsonLd }) {
  const displayHeadline = headline || tagline
  const displayFeatures = features || relatedFeatures

  return (
    <PublicLayout>
      {faqJsonLd && <JsonLd data={faqJsonLd} />}

      {/* ── Breadcrumb ───────────────────────────────────────── */}
      <div className="border-b" style={{ borderColor: '#E5E5E0', background: 'rgba(0,0,0,0.02)' }}>
        <div className="mx-auto max-w-screen-xl px-6 py-3 flex items-center gap-2 np-mono text-[10px] uppercase tracking-widest" style={{ color: '#737373' }}>
          <Link href="/" className="hover:text-[#CC0000] transition-colors duration-150">Home</Link>
          <span>/</span>
          <span>Use Cases</span>
          <span>/</span>
          <span style={{ color: '#111111' }}>{persona}</span>
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
                <p className="np-mono text-[10px] font-semibold uppercase" style={{ letterSpacing: '0.2em', color: '#CC0000' }}>★ Use Case — {persona}</p>
              </div>
              <h1 data-animate="up" data-delay="80" className="np-serif font-black leading-[0.92] mb-6" style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', color: '#111111', letterSpacing: '-0.02em' }}>
                {displayHeadline}
              </h1>
              <p data-animate="up" data-delay="160" className="np-body text-[16px] leading-relaxed mb-8 max-w-xl" style={{ color: '#525252' }}>
                {description}
              </p>
              <div data-animate="up" data-delay="240">
                <Link href="/create" className="inline-flex items-center gap-2 px-7 py-3.5 np-sans text-[12px] font-bold uppercase tracking-widest transition-opacity hover:opacity-85" style={{ background: '#CC0000', color: '#F9F9F7', border: '2px solid #CC0000' }}>
                  Start Free <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </Link>
              </div>
            </div>

            {/* Pain points */}
            {painPoints?.length > 0 && (
              <div data-animate="right" data-delay="200" className="lg:w-[300px] shrink-0 border border-[#E5E5E0]" style={{ background: '#fff', boxShadow: '5px 5px 0 #E5E5E0' }}>
                <div className="px-6 py-4 border-b border-[#E5E5E0]">
                  <p className="np-mono text-[9px] uppercase font-bold" style={{ letterSpacing: '0.2em', color: '#CC0000' }}>The Problem</p>
                </div>
                <div className="divide-y divide-[#E5E5E0]">
                  {painPoints.map((pt, i) => (
                    <div key={i} className="px-6 py-4">
                      {typeof pt === 'string' ? (
                        <p className="np-body text-[13px] leading-relaxed" style={{ color: '#525252' }}>"{pt}"</p>
                      ) : (
                        <>
                          {pt.title && <p className="np-sans text-[11px] font-semibold mb-1" style={{ color: '#111111' }}>{pt.title}</p>}
                          {pt.body && <p className="np-body text-[12px] leading-relaxed" style={{ color: '#525252' }}>{pt.body}</p>}
                        </>
                      )}
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
                <h2 className="np-serif font-black" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)', color: '#111111' }}>The Solution</h2>
                <div className="flex-1 h-px bg-[#111111] hidden md:block" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 border-l border-t border-[#111111]">
              {benefits.map(({ title, body }, i) => (
                <div key={title} data-animate="up" data-delay={i * 70} data-spotlight
                  className="p-10 border-r border-b border-[#111111] transition-colors duration-200 hover:bg-[rgba(204,0,0,0.02)]">
                  <div className="w-9 h-9 border border-[#111111] flex items-center justify-center mb-6">
                    <Check className="w-4 h-4" strokeWidth={2.5} style={{ color: '#CC0000' }} />
                  </div>
                  <h3 className="np-serif font-bold text-[1.2rem] mb-3" style={{ color: '#111111' }}>{title}</h3>
                  <p className="np-body text-[14px] leading-relaxed" style={{ color: '#525252' }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Features used ────────────────────────────────────── */}
      {displayFeatures?.length > 0 && (
        <section className="mt-10" style={{ borderBottom: '4px solid #111111', background: '#F9F9F7' }}>
          <div className="mx-auto max-w-screen-xl px-6">
            <div className="py-10">
              <div data-animate="left" className="flex items-center gap-5">
                <span className="np-mono text-[9px] uppercase" style={{ letterSpacing: '0.2em', color: '#CC0000' }}>§ 02</span>
                <h2 className="np-serif font-black" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)', color: '#111111' }}>Features You'll Use</h2>
                <div className="flex-1 h-px bg-[#111111] hidden md:block" />
              </div>
            </div>
            <div data-stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 pb-16">
              {displayFeatures.map((feat) => {
                const FIcon = feat.icon
                return (
                  <Link key={feat.href} href={feat.href} data-lift
                    className="flex items-center gap-4 p-6 border border-[#E5E5E0] group transition-colors duration-200 hover:border-[#111111]"
                    style={{ background: '#fff' }}>
                    {FIcon && (
                      <div className="w-10 h-10 border border-[#E5E5E0] flex items-center justify-center shrink-0 transition-colors duration-200 group-hover:border-[#CC0000] group-hover:text-[#CC0000]" style={{ color: '#111111' }}>
                        <FIcon className="w-4 h-4" strokeWidth={1.5} />
                      </div>
                    )}
                    <span className="np-sans text-[12px] font-semibold flex-1" style={{ color: '#111111' }}>{feat.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-[#CC0000]" strokeWidth={2} />
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Testimonial ──────────────────────────────────────── */}
      {testimonial && (
        <section className="mt-10" style={{ borderBottom: '4px solid #111111', background: '#F9F9F7' }}>
          <div className="mx-auto max-w-screen-xl px-6 py-16">
            <div data-animate="zoom" className="border border-[#111111] p-10 md:p-14 max-w-3xl mx-auto relative" style={{ background: '#fff', boxShadow: '6px 6px 0 #E5E5E0' }}>
              <div className="np-serif text-[5rem] leading-none absolute -top-5 left-8" style={{ color: '#CC0000', opacity: 0.3 }}>"</div>
              <p className="np-body text-[17px] leading-relaxed mb-8" style={{ color: '#404040' }}>
                {testimonial.quote}
              </p>
              <div className="flex items-center gap-3 pt-5 border-t border-[#E5E5E0]">
                <div className="w-10 h-10 flex items-center justify-center np-sans text-[12px] font-bold shrink-0" style={{ background: '#CC0000', color: '#F9F9F7' }}>
                  {testimonial.name?.split(' ').map(w => w[0]).join('').slice(0,2)}
                </div>
                <div>
                  <p className="np-sans text-[13px] font-semibold" style={{ color: '#111111' }}>{testimonial.name}</p>
                  <p className="np-mono text-[9px] uppercase tracking-widest mt-0.5" style={{ color: '#A3A3A3' }}>{testimonial.role}</p>
                </div>
              </div>
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
          <p data-animate="up" className="np-mono text-[10px] font-semibold uppercase mb-5 px-3 py-1.5 border border-[#E5E5E0]" style={{ letterSpacing: '0.2em', color: '#CC0000', background: 'rgba(204,0,0,0.05)' }}>★ Built for {persona || 'You'}</p>
          <h2 data-animate="up" data-delay="80" className="np-serif font-black mb-5 max-w-2xl" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', color: '#111111', lineHeight: 0.95, letterSpacing: '-0.02em' }}>
            Start working smarter today
          </h2>
          <p data-animate="up" data-delay="160" className="np-body text-[16px] mb-8 max-w-lg" style={{ color: '#525252' }}>
            Free to start. No credit card required. Join 2,400+ users already on AskBro.
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
