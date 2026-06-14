'use client'

import { useState } from 'react'
import Link from 'next/link'
import { GraduationCap, Building2, Code2, Briefcase, ArrowRight, X, Check } from 'lucide-react'

const PERSONAS = [
  {
    id: 'students', title: 'Students', Icon: GraduationCap,
    before: [
      'Spending hours making flashcards from lecture notes',
      'Ctrl+F through PDFs hunting for a single answer',
      'No way to quickly test your own understanding',
    ],
    after: [
      'Auto-generated flashcard decks from any document',
      'Ask in plain English, get page-cited answers instantly',
      'Quiz yourself on any study material on demand',
    ],
    ctaLabel: 'Start studying smarter', ctaHref: '/use-cases/students',
  },
  {
    id: 'engineering', title: 'Engineering Teams', Icon: Building2,
    before: [
      'Senior engineers interrupted for basic codebase questions',
      'Stale Confluence pages nobody keeps updated',
      'New developers take weeks to become productive',
    ],
    after: [
      'Engineers ask AskBro instead of Slack channels',
      'Indexed runbooks answer with citations instantly',
      'Onboard new developers in days, not weeks',
    ],
    ctaLabel: 'See for engineering teams', ctaHref: '/use-cases/engineering-teams',
  },
  {
    id: 'developers', title: 'Developers', Icon: Code2,
    before: [
      'Days reading unfamiliar codebases before contributing',
      'No fast way to trace a bug through all the layers',
      'Outdated or entirely missing documentation',
    ],
    after: [
      'Understand any repo architecture in hours',
      'Trace bugs with exact file and line citations',
      'Ask the questions that documentation never answers',
    ],
    ctaLabel: 'See for developers', ctaHref: '/use-cases/developers',
  },
  {
    id: 'jobseekers', title: 'Job Seekers', Icon: Briefcase,
    before: [
      "Generic prep that doesn't match the actual role",
      'No honest feedback on weak answers',
      'Interview anxiety from under-preparation',
    ],
    after: [
      'Targeted prep from any job description or company docs',
      'Instant, brutally honest feedback on every answer',
      'Unlimited practice until you feel genuinely confident',
    ],
    ctaLabel: 'Start interview prep', ctaHref: '/use-cases/onboarding',
  },
]

export default function PersonaTabs() {
  const [active, setActive] = useState(0)
  const persona = PERSONAS[active]

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex flex-wrap gap-0 border-l border-t border-[#111111] mb-0">
        {PERSONAS.map((p, i) => {
          const Icon = p.Icon
          const isActive = i === active
          return (
            <button
              key={p.id}
              onClick={() => setActive(i)}
              className="np-sans flex items-center gap-2 px-5 py-3 border-r border-b border-[#111111] text-[11px] font-semibold uppercase tracking-widest transition-colors duration-150"
              style={{
                background: isActive ? '#111111' : 'transparent',
                color: isActive ? '#F9F9F7' : '#737373',
              }}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={isActive ? 2 : 1.5} />
              {p.title}
            </button>
          )
        })}
        {/* Fill remaining space */}
        <div className="flex-1 border-b border-[#111111]" />
      </div>

      {/* Panel */}
      <div className="grid md:grid-cols-2 border-l border-b border-[#111111]">

        {/* Before column */}
        <div className="border-r border-[#111111] p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-5 h-5 border border-[#CC0000] flex items-center justify-center">
              <X className="w-3 h-3" style={{ color: '#CC0000' }} strokeWidth={2.5} />
            </div>
            <p className="np-mono text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: '#CC0000' }}>
              Before Ask<span style={{ color: '#CC0000' }}>Bro</span>
            </p>
          </div>
          <ul className="space-y-4">
            {persona.before.map((item) => (
              <li key={item} className="flex gap-3 pb-4 border-b border-[#E5E5E0]">
                <X className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: '#CC0000' }} strokeWidth={2} />
                <p className="np-body text-[13px] leading-relaxed" style={{ color: '#525252' }}>{item}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* After column */}
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-5 h-5 border border-[#111111] flex items-center justify-center" style={{ background: '#111111' }}>
              <Check className="w-3 h-3" style={{ color: '#F9F9F7' }} strokeWidth={2.5} />
            </div>
            <p className="np-mono text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: '#111111' }}>
              With Ask<span style={{ color: '#CC0000' }}>Bro</span>
            </p>
          </div>
          <ul className="space-y-4 mb-8">
            {persona.after.map((item) => (
              <li key={item} className="flex gap-3 pb-4 border-b border-[#E5E5E0]">
                <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: '#111111' }} strokeWidth={2} />
                <p className="np-body text-[13px] leading-relaxed" style={{ color: '#111111' }}>{item}</p>
              </li>
            ))}
          </ul>

          <Link
            href={persona.ctaHref}
            className="btn-outline-ink px-6 py-3 inline-flex items-center gap-2 transition-colors duration-150 hover:bg-[#CC0000] hover:border-[#CC0000] hover:text-[#F9F9F7]"
          >
            {persona.ctaLabel} <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </div>
  )
}
