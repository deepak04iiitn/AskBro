'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Users, Mail, UserMinus, Crown, Loader2,
  UserPlus, Copy, Check, Search, ShieldCheck, UserCheck,
} from 'lucide-react'
import { addMember, listMembers, removeMember } from '@/lib/api'
import useAuthStore from '@/store/useAuthStore'

const PANEL_ANIM = {
  initial:    { opacity: 0, scale: 0.96, y: 12 },
  animate:    { opacity: 1, scale: 1,    y: 0  },
  exit:       { opacity: 0, scale: 0.96, y: 12 },
  transition: { duration: 0.24, ease: [0.16, 1, 0.3, 1] },
}

const AVATAR_COLORS = [
  { bg: '#FEF2F2', color: '#CC0000' },
  { bg: '#F5F0E8', color: '#111111' },
  { bg: '#F0FDF4', color: '#16A34A' },
  { bg: '#FFF7ED', color: '#D97706' },
  { bg: '#FFF1F2', color: '#E11D48' },
  { bg: '#F5F0E8', color: '#737373' },
]

function avatarStyle(email, isOwner) {
  if (isOwner) return { bg: '#111111', color: '#F9F9F7' }
  const idx = email.charCodeAt(0) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx]
}

export default function MembersPanel({ onClose }) {
  const user    = useAuthStore((s) => s.user)
  const isOwner = user?.role === 'owner'

  const [members,      setMembers]      = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [addEmail,     setAddEmail]     = useState('')
  const [addError,     setAddError]     = useState('')
  const [addLoading,   setAddLoading]   = useState(false)
  const [removeTarget, setRemoveTarget] = useState(null)
  const [codeCopied,   setCodeCopied]   = useState(false)

  async function fetchMembers() {
    try { setMembers(await listMembers()) }
    catch { /* keep */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchMembers() }, [])

  async function handleAdd(e) {
    e.preventDefault()
    if (!addEmail.trim()) return
    setAddError('')
    setAddLoading(true)
    try {
      await addMember(addEmail.trim())
      setAddEmail('')
      await fetchMembers()
    } catch (err) {
      setAddError(err.message)
    } finally {
      setAddLoading(false)
    }
  }

  async function handleRemove(email) {
    setRemoveTarget(email)
    try { await removeMember(email); await fetchMembers() }
    catch { /* ignore */ }
    finally { setRemoveTarget(null) }
  }

  function copyCode() {
    navigator.clipboard.writeText(user?.workspace_code ?? '')
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  const ownerCount  = members.filter((m) => m.role === 'owner').length
  const memberCount = members.length
  const filtered    = members.filter((m) =>
    !search.trim() || m.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ backgroundColor: 'rgba(10,10,12,0.65)', backdropFilter: 'blur(8px)' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          {...PANEL_ANIM}
          className="w-full flex flex-col overflow-hidden"
          style={{
            maxWidth: '700px',
            maxHeight: '86vh',
            backgroundColor: '#F9F9F7',
            border: '1px solid #111111',
            boxShadow: '6px 6px 0px 0px #111111',
          }}
        >
          {/* ── Header ──────────────────────────────────────── */}
          <div className="px-8 pt-7 pb-6 shrink-0" style={{ borderBottom: '1px solid #E5E5E0', backgroundColor: '#F0EDE6' }}>
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#111111', border: '1px solid #111111' }}
                >
                  <Users className="w-6 h-6" style={{ color: '#CC0000' }} strokeWidth={1.8} />
                </div>
                <div>
                  <p className="np-mono text-[9px] font-bold uppercase tracking-[0.2em] mb-0.5" style={{ color: '#CC0000' }}>★ Workspace</p>
                  <h2 className="np-serif text-[20px] font-black" style={{ color: '#111111' }}>
                    Team Members
                  </h2>
                  <p className="np-body text-[13px] mt-0.5" style={{ color: '#737373' }}>
                    Manage who has access to this workspace
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center cursor-pointer transition-colors"
                style={{ color: '#AEABA6' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E5E5E0'; e.currentTarget.style.color = '#111111' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = '#AEABA6' }}
              >
                <X className="w-4.5 h-4.5" strokeWidth={2.5} />
              </button>
            </div>

            {/* Workspace code + stats row */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={copyCode}
                className="flex items-center gap-2 px-4 py-2.5 cursor-pointer transition-all"
                style={{ backgroundColor: '#F9F9F7', border: '1.5px solid #E5E5E0' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#CC0000'; e.currentTarget.style.backgroundColor = '#FEF9F0' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E5E0'; e.currentTarget.style.backgroundColor = '#F9F9F7' }}
              >
                <span className="np-mono text-[13px] font-bold tracking-wider" style={{ color: '#CC0000' }}>
                  {user?.workspace_code}
                </span>
                {codeCopied
                  ? <Check className="w-3.5 h-3.5 shrink-0" style={{ color: '#16A34A' }} strokeWidth={2.5} />
                  : <Copy className="w-3.5 h-3.5 shrink-0" style={{ color: '#AEABA6' }} strokeWidth={2} />
                }
                <span className="np-mono text-[11px]" style={{ color: codeCopied ? '#16A34A' : '#AEABA6' }}>
                  {codeCopied ? 'Copied!' : 'Copy code'}
                </span>
              </button>

              <div className="flex items-center gap-2 ml-auto">
                {[
                  { Icon: Users,      label: 'Total',   value: memberCount, bg: '#FEF2F2', color: '#CC0000' },
                  { Icon: ShieldCheck,label: 'Owners',  value: ownerCount,  bg: '#F5F0E8', color: '#111111' },
                  { Icon: UserCheck,  label: 'Members', value: memberCount - ownerCount, bg: '#F0FDF4', color: '#16A34A' },
                ].map(({ Icon, label, value, bg, color }) => (
                  <div key={label} className="flex items-center gap-1.5 px-3 py-2" style={{ backgroundColor: bg, border: '1px solid #E5E5E0' }}>
                    <Icon className="w-3.5 h-3.5 shrink-0" style={{ color }} strokeWidth={2} />
                    <span className="np-mono text-[12px] font-bold tabular-nums" style={{ color }}>{value}</span>
                    <span className="np-mono text-[10px] uppercase tracking-widest" style={{ color }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Search ──────────────────────────────────────── */}
          <div className="px-8 py-4 shrink-0" style={{ borderBottom: '1px solid #E5E5E0' }}>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#AEABA6' }} strokeWidth={1.8} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search members by email…"
                className="w-full h-10 text-[13px] focus:outline-none transition-all np-body"
                style={{ paddingLeft: '38px', paddingRight: '12px', backgroundColor: '#F9F9F7', border: '1.5px solid #E5E5E0', color: '#111111' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#111111'; e.currentTarget.style.boxShadow = '2px 2px 0px 0px #111111' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5E0'; e.currentTarget.style.boxShadow = 'none' }}
              />
            </div>
          </div>

          {/* ── Member list ─────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-7 h-7 animate-spin" style={{ color: '#D9D7D2' }} strokeWidth={2} />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 flex items-center justify-center mb-4" style={{ backgroundColor: '#F5F0E8', border: '1px solid #E5E5E0' }}>
                  <Users className="w-7 h-7" style={{ color: '#AEABA6' }} strokeWidth={1.5} />
                </div>
                <p className="np-sans text-[14px] font-medium" style={{ color: '#4A4845' }}>
                  {search ? 'No members match your search.' : 'No members yet.'}
                </p>
                {search && (
                  <button onClick={() => setSearch('')} className="mt-2 np-mono text-[12px] underline cursor-pointer" style={{ color: '#CC0000' }}>
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <motion.ul layout className="px-3 py-3 space-y-0.5">
                <AnimatePresence>
                  {filtered.map((m) => {
                    const isThisOwner = m.role === 'owner'
                    const av = avatarStyle(m.email, isThisOwner)
                    return (
                      <motion.li
                        key={m.email}
                        layout
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18 }}
                        className="flex items-center gap-4 px-4 py-3.5 transition-colors"
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F0E8' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}
                      >
                        <div
                          className="w-11 h-11 flex items-center justify-center shrink-0 np-mono text-[15px] font-bold"
                          style={{ backgroundColor: av.bg, color: av.color, border: '1px solid #E5E5E0' }}
                        >
                          {m.email[0].toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="np-sans text-[14px] font-semibold truncate" style={{ color: '#111111' }}>
                            {m.email}
                          </p>
                          <p className="np-mono text-[11px] mt-0.5 uppercase tracking-wide" style={{ color: '#AEABA6' }}>
                            {isThisOwner ? 'Workspace owner · full access' : 'Member · read & chat access'}
                          </p>
                        </div>

                        <div className="shrink-0 flex items-center gap-3">
                          <span
                            className="inline-flex items-center gap-1.5 np-mono text-[10px] font-bold uppercase tracking-widest px-3 py-1.5"
                            style={{ backgroundColor: isThisOwner ? '#111111' : '#F5F0E8', color: isThisOwner ? '#F9F9F7' : '#737373', border: isThisOwner ? 'none' : '1px solid #E5E5E0' }}
                          >
                            {isThisOwner
                              ? <><Crown className="w-3 h-3" strokeWidth={2} /> Owner</>
                              : <><UserCheck className="w-3 h-3" strokeWidth={2} /> Member</>
                            }
                          </span>

                          {isOwner && !isThisOwner && (
                            <button
                              onClick={() => handleRemove(m.email)}
                              disabled={removeTarget === m.email}
                              className="flex items-center gap-1.5 np-mono text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 cursor-pointer transition-colors disabled:opacity-40"
                              style={{ color: '#DC2626', backgroundColor: 'transparent' }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FEF2F2' }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                            >
                              {removeTarget === m.email
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
                                : <UserMinus className="w-3.5 h-3.5" strokeWidth={2} />
                              }
                              Remove
                            </button>
                          )}
                        </div>
                      </motion.li>
                    )
                  })}
                </AnimatePresence>
              </motion.ul>
            )}
          </div>

          {/* ── Invite form — owner only ─────────────────────── */}
          {isOwner && (
            <div className="px-8 py-6 shrink-0" style={{ borderTop: '1px solid #E5E5E0', backgroundColor: '#F0EDE6' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 flex items-center justify-center" style={{ backgroundColor: '#111111' }}>
                  <UserPlus className="w-3.5 h-3.5" style={{ color: '#CC0000' }} strokeWidth={2} />
                </div>
                <p className="np-sans text-[14px] font-semibold" style={{ color: '#111111' }}>Invite a teammate</p>
                <p className="np-body text-[12px] ml-1" style={{ color: '#AEABA6' }}>They'll be able to sign in with the workspace code</p>
              </div>

              <form onSubmit={handleAdd} className="flex gap-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#AEABA6' }} strokeWidth={1.8} />
                  <input
                    type="email"
                    value={addEmail}
                    onChange={(e) => { setAddEmail(e.target.value); setAddError('') }}
                    placeholder="colleague@company.com"
                    required
                    className="w-full h-11 text-[13px] focus:outline-none transition-all np-body"
                    style={{ paddingLeft: '40px', paddingRight: '12px', backgroundColor: '#F9F9F7', border: '1.5px solid #E5E5E0', color: '#111111' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#111111'; e.currentTarget.style.boxShadow = '2px 2px 0px 0px #111111' }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5E0'; e.currentTarget.style.boxShadow = 'none' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={addLoading || !addEmail.trim()}
                  className="btn-ink h-11 px-6 cursor-pointer disabled:opacity-40 shrink-0 flex items-center gap-2"
                >
                  {addLoading
                    ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                    : <UserPlus className="w-4 h-4" strokeWidth={2} />
                  }
                  {addLoading ? 'Inviting…' : 'Send invite'}
                </button>
              </form>

              <AnimatePresence>
                {addError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="mt-3 px-4 py-2" style={{ borderLeft: '3px solid #CC0000' }}
                  >
                    <p className="np-mono text-[12px] uppercase tracking-wide" style={{ color: '#CC0000' }}>{addError}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
