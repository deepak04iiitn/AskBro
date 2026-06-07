'use client'

import { useEffect } from 'react'

const STYLES = `
  /* ── Base: hidden until visible ─────────────────────────────────── */
  [data-animate] {
    opacity: 0;
    transition-property: opacity, transform;
    transition-duration: 0.65s;
    transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
    will-change: opacity, transform;
  }
  [data-animate="up"]     { transform: translateY(36px); }
  [data-animate="up-sm"]  { transform: translateY(18px); }
  [data-animate="down"]   { transform: translateY(-24px); }
  [data-animate="left"]   { transform: translateX(-32px); }
  [data-animate="right"]  { transform: translateX(32px); }
  [data-animate="zoom"]   { transform: scale(0.92); }
  [data-animate="zoom-sm"]{ transform: scale(0.97); }
  [data-animate="fade"]   { }

  [data-visible] {
    opacity: 1 !important;
    transform: translate(0,0) scale(1) !important;
  }

  /* ── Stagger children with data-stagger on parent ───────────────── */
  [data-stagger] > * {
    opacity: 0;
    transform: translateY(28px);
    transition-property: opacity, transform;
    transition-duration: 0.6s;
    transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  }
  [data-stagger][data-visible] > *:nth-child(1)  { opacity:1; transform:none; transition-delay:0ms; }
  [data-stagger][data-visible] > *:nth-child(2)  { opacity:1; transform:none; transition-delay:100ms; }
  [data-stagger][data-visible] > *:nth-child(3)  { opacity:1; transform:none; transition-delay:200ms; }
  [data-stagger][data-visible] > *:nth-child(4)  { opacity:1; transform:none; transition-delay:300ms; }
  [data-stagger][data-visible] > *:nth-child(5)  { opacity:1; transform:none; transition-delay:400ms; }
  [data-stagger][data-visible] > *:nth-child(6)  { opacity:1; transform:none; transition-delay:500ms; }

  /* ── Card spotlight (cursor glow) ───────────────────────────────── */
  [data-spotlight] {
    position: relative;
    overflow: hidden;
  }
  [data-spotlight]::before {
    content: '';
    position: absolute;
    left: var(--spot-x, 50%);
    top: var(--spot-y, 50%);
    transform: translate(-50%, -50%);
    width: 380px;
    height: 380px;
    background: radial-gradient(circle, rgba(204,0,0,0.07) 0%, transparent 70%);
    opacity: var(--spot-op, 0);
    transition: opacity 0.3s ease;
    pointer-events: none;
    z-index: 0;
  }
  [data-spotlight] > * { position: relative; z-index: 1; }

  /* ── Hover lift ─────────────────────────────────────────────────── */
  [data-lift] {
    transition: transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease;
  }
  [data-lift]:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.1);
  }

  /* ── Underline link hover ───────────────────────────────────────── */
  [data-underline] {
    background-image: linear-gradient(#CC0000, #CC0000);
    background-size: 0% 1px;
    background-repeat: no-repeat;
    background-position: left bottom;
    transition: background-size 0.3s ease;
    padding-bottom: 1px;
  }
  [data-underline]:hover { background-size: 100% 1px; }

  /* ── Reduced motion ─────────────────────────────────────────────── */
  @media (prefers-reduced-motion: reduce) {
    [data-animate], [data-stagger] > * {
      transition: none !important;
      opacity: 1 !important;
      transform: none !important;
    }
  }
`

export default function ScrollAnimations() {
  useEffect(() => {
    const styleEl = document.createElement('style')
    styleEl.id = '__askbro-anim'
    styleEl.textContent = STYLES
    document.head.appendChild(styleEl)

    // ── Entrance observer ──────────────────────────────────────────
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const el = entry.target
          const delay = parseInt(el.getAttribute('data-delay') ?? '0', 10)
          const trigger = () => el.setAttribute('data-visible', '')
          delay > 0 ? setTimeout(trigger, delay) : trigger()
          io.unobserve(el)
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -50px 0px' }
    )

    const animEls = document.querySelectorAll('[data-animate], [data-stagger]')
    animEls.forEach((el) => io.observe(el))

    // ── Spotlight cursor tracking ──────────────────────────────────
    const spotCards = document.querySelectorAll('[data-spotlight]')
    const handlers = []
    spotCards.forEach((card) => {
      const onMove = (e) => {
        const r = card.getBoundingClientRect()
        card.style.setProperty('--spot-x', `${e.clientX - r.left}px`)
        card.style.setProperty('--spot-y', `${e.clientY - r.top}px`)
        card.style.setProperty('--spot-op', '1')
      }
      const onLeave = () => card.style.setProperty('--spot-op', '0')
      card.addEventListener('mousemove', onMove)
      card.addEventListener('mouseleave', onLeave)
      handlers.push({ card, onMove, onLeave })
    })

    return () => {
      io.disconnect()
      document.getElementById('__askbro-anim')?.remove()
      handlers.forEach(({ card, onMove, onLeave }) => {
        card.removeEventListener('mousemove', onMove)
        card.removeEventListener('mouseleave', onLeave)
      })
    }
  }, [])

  return null
}
