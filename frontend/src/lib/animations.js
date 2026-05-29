// Framer Motion variants — single source of truth.
// Spread onto motion.* components: <motion.div {...ITEM_ANIM} />

// ── Stagger container ─────────────────────────────────────
export const PAGE_ANIM = {
  initial: 'hidden',
  animate: 'visible',
  variants: {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.07 } },
  },
}

// ── Staggered child — slide up + fade in ──────────────────
export const ITEM_ANIM = {
  variants: {
    hidden:  { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.42, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  },
}

// ── Scale in — modals, dropdowns, toasts ──────────────────
export const SCALE_IN = {
  initial:    { opacity: 0, scale: 0.96, y: 8 },
  animate:    { opacity: 1, scale: 1,    y: 0 },
  exit:       { opacity: 0, scale: 0.96, y: 8 },
  transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
}

// ── Panel slide in/out from right ─────────────────────────
export const PANEL_SLIDE = {
  initial:    { opacity: 0, x: 40 },
  animate:    { opacity: 1, x: 0  },
  exit:       { opacity: 0, x: 40 },
  transition: { type: 'spring', stiffness: 320, damping: 32 },
}

// ── Fade in simple ────────────────────────────────────────
export const FADE_IN = {
  initial:    { opacity: 0 },
  animate:    { opacity: 1 },
  exit:       { opacity: 0 },
  transition: { duration: 0.2 },
}

// ── Step slide — auth multi-step forms ────────────────────
export const SLIDE_IN_RIGHT = {
  initial:    { opacity: 0, x: 20 },
  animate:    { opacity: 1, x: 0  },
  exit:       { opacity: 0, x: -20 },
  transition: { duration: 0.22, ease: 'easeInOut' },
}
