'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Clock, ArrowRight } from 'lucide-react'

export default function BlogTagFilter({ posts }) {
  const [activeTag, setActiveTag] = useState('All')
  const allTags = ['All', ...new Set(posts.flatMap((p) => p.tags || []))]
  const filtered = activeTag === 'All' ? posts : posts.filter((p) => p.tags?.includes(activeTag))

  return (
    <div>
      {/* Tag filter chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        {allTags.slice(0, 8).map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className="np-mono text-[9px] font-semibold uppercase tracking-widest px-3 py-2 border transition-colors duration-150"
            style={{
              borderColor: '#111111',
              background: activeTag === tag ? '#111111' : 'transparent',
              color: activeTag === tag ? '#F9F9F7' : '#111111',
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Post grid — collapsed newspaper grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 border-l border-t" style={{ borderColor: '#111111' }}>
        {filtered.map((post, i) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="hard-shadow-hover block p-6 border-r border-b group"
            style={{ borderColor: '#111111' }}
            data-animate="up"
            data-delay={i * 50}
          >
            {/* Tag */}
            {post.tags?.slice(0, 1).map((tag) => (
              <span
                key={tag}
                className="np-mono text-[8px] font-bold uppercase tracking-[0.15em] block mb-3"
                style={{ color: '#CC0000' }}
              >
                {tag}
              </span>
            ))}

            <h2
              className="np-serif font-bold leading-tight mb-3 group-hover:text-[#CC0000] transition-colors duration-150"
              style={{ fontSize: '1.15rem', color: '#111111' }}
            >
              {post.title}
            </h2>

            <p className="np-body text-[12px] leading-relaxed mb-4 line-clamp-3" style={{ color: '#525252' }}>
              {post.description}
            </p>

            <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: '#E5E5E0' }}>
              <div className="flex items-center gap-1.5 np-mono text-[9px] uppercase tracking-widest" style={{ color: '#A3A3A3' }}>
                <Clock className="w-3 h-3" strokeWidth={1.5} />
                {post.readingTime}
              </div>
              <span className="np-sans text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 group-hover:text-[#CC0000] transition-colors" style={{ color: '#111111' }}>
                Read <ArrowRight className="w-3 h-3" strokeWidth={2} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
