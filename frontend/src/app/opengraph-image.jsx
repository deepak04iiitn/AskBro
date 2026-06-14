import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'AskBro — AI Knowledge Base, Interview Prep, Quizzes & Flashcards'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0F1117 0%, #1a1d2e 60%, #1e1040 100%)',
          padding: '80px',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background accent glow */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 480,
            height: 480,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(67,97,238,0.35) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -60,
            left: 200,
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)',
          }}
        />

        {/* Logo badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: '#4361EE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 900,
              color: '#fff',
            }}
          >
            A
          </div>
          <span style={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            AskBro
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: '#fff',
            lineHeight: 1.1,
            letterSpacing: '-2px',
            margin: 0,
            marginBottom: 24,
            maxWidth: 780,
          }}
        >
          Your AI bro for{' '}
          <span style={{ color: '#818cf8' }}>docs, code &amp; interviews</span>
        </h1>

        {/* Sub-tagline */}
        <p
          style={{
            fontSize: 24,
            color: '#9ca3af',
            margin: 0,
            marginBottom: 48,
            maxWidth: 680,
            lineHeight: 1.4,
          }}
        >
          Chat with PDFs · GitHub Repo Q&amp;A · Interview Prep · Quizzes · Flashcards
        </p>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {['Document Q&A', 'GitHub Repos', 'Interview Prep', 'Quizzes', 'Flashcards'].map((label) => (
            <div
              key={label}
              style={{
                padding: '8px 20px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#e5e7eb',
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* CTA badge */}
        <div
          style={{
            position: 'absolute',
            bottom: 64,
            right: 80,
            background: '#4361EE',
            color: '#fff',
            fontSize: 20,
            fontWeight: 700,
            padding: '14px 32px',
            borderRadius: 12,
          }}
        >
          askbro.app →
        </div>
      </div>
    ),
    { ...size },
  )
}
