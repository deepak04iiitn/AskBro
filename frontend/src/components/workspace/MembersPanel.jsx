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

// Avatar colour palette — cycles through per initial letter
const AVATAR_COLORS = [
  { bg: '#EEF1FD', color: '#4361EE' },
  { bg: '#F5F3FF', color: '#7C3AED' },
  { bg: '#F0FDF4', color: '#16A34A' },
  { bg: '#FFF7ED', color: '#D97706' },
  { bg: '#FFF1F2', color: '#E11D48' },
  { bg: '#F0F9FF', color: '#0369A1' },
]

function avatarStyle(email, isOwner) {
  if (isOwner) return { bg: '#EEF1FD', color: '#4361EE' }
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
          className="bg-white w-full flex flex-col overflow-hidden"
          style={{
            maxWidth: '720px',
            maxHeight: '86vh',
            borderRadius: '24px',
            boxShadow: '0 40px 100px rgba(0,0,0,0.30), 0 0 0 1px rgba(0,0,0,0.06)',
          }}
        >
          {/* ── Header ──────────────────────────────────────────── */}
          <div className="px-8 pt-7 pb-6 shrink-0" style={{ borderBottom: '1px solid #E3E1DC' }}>
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#EEF1FD' }}
                >
                  <Users className="w-6 h-6" style={{ color: '#4361EE' }} strokeWidth={1.8} />
                </div>
                <div>
                  <h2 className="text-[20px] font-bold tracking-[-0.02em]" style={{ color: '#111110' }}>
                    Team Members
                  </h2>
                  <p className="text-[13px] mt-0.5" style={{ color: '#7A7874' }}>
                    Manage who has access to this workspace
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
                style={{ color: '#AEABA6' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F4F3F0'; e.currentTarget.style.color = '#3D3C3A' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = '#AEABA6' }}
              >
                <X className="w-4.5 h-4.5" strokeWidth={2.5} />
              </button>
            </div>

            {/* Workspace code + stats row */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Code pill with copy */}
              <button
                onClick={copyCode}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-all"
                style={{ backgroundColor: '#F7F5F2', border: '1.5px solid #E3E1DC' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4361EE'; e.currentTarget.style.backgroundColor = '#EEF1FD' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E3E1DC'; e.currentTarget.style.backgroundColor = '#F7F5F2' }}
              >
                <span className="text-[13px] font-bold font-mono tracking-wider" style={{ color: '#4361EE' }}>
                  {user?.workspace_code}
                </span>
                {codeCopied
                  ? <Check className="w-3.5 h-3.5 shrink-0" style={{ color: '#16A34A' }} strokeWidth={2.5} />
                  : <Copy className="w-3.5 h-3.5 shrink-0" style={{ color: '#AEABA6' }} strokeWidth={2} />
                }
                <span className="text-[11px]" style={{ color: codeCopied ? '#16A34A' : '#AEABA6' }}>
                  {codeCopied ? 'Copied!' : 'Copy code'}
                </span>
              </button>

              {/* Stats */}
              <div className="flex items-center gap-2 ml-auto">
                {[
                  { Icon: Users,      label: 'Total',   value: memberCount, bg: '#EEF1FD', color: '#4361EE' },
                  { Icon: ShieldCheck,label: 'Owners',  value: ownerCount,  bg: '#F5F3FF', color: '#7C3AED' },
                  { Icon: UserCheck,  label: 'Members', value: memberCount - ownerCount, bg: '#F0FDF4', color: '#16A34A' },
                ].map(({ Icon, label, value, bg, color }) => (
                  <div key={label} className="flex items-center gap-1.5 px-3 py-2 rounded-xl" style={{ backgroundColor: bg }}>
                    <Icon className="w-3.5 h-3.5 shrink-0" style={{ color }} strokeWidth={2} />
                    <span className="text-[12px] font-bold tabular-nums" style={{ color }}>{value}</span>
                    <span className="text-[11px]" style={{ color }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Search ──────────────────────────────────────────── */}
          <div className="px-8 py-4 shrink-0" style={{ borderBottom: '1px solid #F4F3F0' }}>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#AEABA6' }} strokeWidth={1.8} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search members by email…"
                className="w-full h-10 rounded-xl text-[13px] focus:outline-none transition-all"
                style={{ paddingLeft: '38px', paddingRight: '12px', backgroundColor: '#F7F5F2', border: '1.5px solid #E3E1DC', color: '#111110' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#4361EE'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(67,97,238,0.10)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#E3E1DC'; e.currentTarget.style.boxShadow = 'none' }}
              />
            </div>
          </div>

          {/* ── Member list ─────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-7 h-7 animate-spin" style={{ color: '#D9D7D2' }} strokeWidth={2} />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: '#F4F3F0' }}>
                  <Users className="w-7 h-7" style={{ color: '#AEABA6' }} strokeWidth={1.5} />
                </div>
                <p className="text-[14px] font-medium" style={{ color: '#4A4845' }}>
                  {search ? 'No members match your search.' : 'No members yet.'}
                </p>
                {search && (
                  <button onClick={() => setSearch('')} className="mt-2 text-[12px] underline cursor-pointer" style={{ color: '#4361EE' }}>
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <motion.ul layout className="px-3 py-3 space-y-1">
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
                        className="flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-colors"
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F7F5F2' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}
                      >
                        {/* Avatar */}
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-[15px] font-bold"
                          style={{ backgroundColor: av.bg, color: av.color }}
                        >
                          {m.email[0].toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-semibold truncate" style={{ color: '#111110' }}>
                            {m.email}
                          </p>
                          <p className="text-[12px] mt-0.5" style={{ color: '#AEABA6' }}>
                            {isThisOwner ? 'Workspace owner · full access' : 'Member · read & chat access'}
                          </p>
                        </div>

                        {/* Role badge + remove */}
                        <div className="shrink-0 flex items-center gap-3">
                          <span
                            className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-xl"
                            style={{ backgroundColor: isThisOwner ? '#EEF1FD' : '#F4F3F0', color: isThisOwner ? '#4361EE' : '#7A7874' }}
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
                              className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-xl cursor-pointer transition-colors disabled:opacity-40"
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

          {/* ── Invite form — owner only ─────────────────────────── */}
          {isOwner && (
            <div className="px-8 py-6 shrink-0" style={{ borderTop: '1px solid #E3E1DC', backgroundColor: '#F7F5F2' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#EEF1FD' }}>
                  <UserPlus className="w-3.5 h-3.5" style={{ color: '#4361EE' }} strokeWidth={2} />
                </div>
                <p className="text-[14px] font-semibold" style={{ color: '#111110' }}>Invite a teammate</p>
                <p className="text-[12px] ml-1" style={{ color: '#AEABA6' }}>They'll be able to sign in with the workspace code</p>
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
                    className="w-full h-11 rounded-xl text-[13px] focus:outline-none transition-all"
                    style={{ paddingLeft: '40px', paddingRight: '12px', backgroundColor: 'white', border: '1.5px solid #E3E1DC', color: '#111110' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#4361EE'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(67,97,238,0.10)' }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#E3E1DC'; e.currentTarget.style.boxShadow = 'none' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={addLoading || !addEmail.trim()}
                  className="h-11 px-6 text-white text-[13px] font-semibold rounded-xl cursor-pointer disabled:opacity-40 shrink-0 flex items-center gap-2 transition-colors"
                  style={{ backgroundColor: '#4361EE' }}
                  onMouseEnter={(e) => { if (!addLoading) e.currentTarget.style.backgroundColor = '#3451D6' }}
                  onMouseLeave={(e) => { if (!addLoading) e.currentTarget.style.backgroundColor = '#4361EE' }}
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
                  <motion.p
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="mt-3 text-[12px]" style={{ color: '#DC2626' }}
                  >
                    {addError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
