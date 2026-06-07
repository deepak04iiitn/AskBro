'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

function slugify(text) {
  if (!text) return ''
  const str = Array.isArray(text) ? text.join('') : String(text)
  return str.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
}

function extractHeadings(content) {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm
  const headings = []
  let match
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2].trim().replace(/\*\*/g, '').replace(/`/g, '')
    const id = slugify(text)
    headings.push({ level, text, id })
  }
  return headings
}

export default function BlogTocSidebar({ content }) {
  const headings = extractHeadings(content)
  const [activeId, setActiveId] = useState(null)

  useEffect(() => {
    if (headings.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((entry) => { if (entry.isIntersecting) setActiveId(entry.target.id) }) },
      { rootMargin: '-10% 0% -75% 0%', threshold: 0 }
    )
    headings.forEach(({ id }) => { const el = document.getElementById(id); if (el) observer.observe(el) })
    return () => observer.disconnect()
  }, [])

  if (headings.length === 0) return null

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 border border-[#111111]">
        <div className="border-b border-[#111111] px-5 py-3" style={{ background: '#111111' }}>
          <p className="np-mono text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: '#F9F9F7' }}>
            // On This Page
          </p>
        </div>

        <nav aria-label="Table of contents" style={{ background: '#F9F9F7' }}>
          <ul>
            {headings.map(({ id, text, level }) => {
              const isActive = activeId === id
              return (
                <li key={id} style={{ borderBottom: '1px solid #E5E5E0' }}>
                  <a
                    href={`#${id}`}
                    className="block px-5 py-2.5 np-sans text-[11px] transition-colors duration-150"
                    style={{
                      paddingLeft: level === 3 ? 28 : 20,
                      color: isActive ? '#CC0000' : '#525252',
                      background: isActive ? 'rgba(204,0,0,0.04)' : 'transparent',
                      fontWeight: isActive ? 600 : 400,
                      borderLeft: isActive ? '2px solid #CC0000' : '2px solid transparent',
                    }}
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}
                  >
                    {text}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* CTA box */}
        <div className="border-t border-[#111111] p-5" style={{ background: '#111111' }}>
          <p className="np-sans text-[11px] font-semibold mb-1" style={{ color: '#F9F9F7' }}>Try AskBro free</p>
          <p className="np-mono text-[10px] mb-3" style={{ color: '#737373' }}>No credit card needed.</p>
          <a
            href="/create"
            className="np-sans text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors hover:text-[#CC0000]"
            style={{ color: '#F9F9F7' }}
          >
            Get started <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
          </a>
        </div>
      </div>
    </aside>
  )
}
