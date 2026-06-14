'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Users, Mail, UserMinus, Crown, Loader2,
  UserPlus, Copy, Check, Search, ShieldCheck, UserCheck,
} from 'lucide-react'
import { addMember, listMembers, removeMember } from '@/lib/api'
import useAuthStore from '@/store/useAuthStore'
import Sidebar from '@/components/layout/Sidebar'

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

export default function MembersPage() {
  const router   = useRouter()
  const hydrate  = useAuthStore((s) => s.hydrate)
  const user     = useAuthStore((s) => s.user)
  const isOwner  = user?.role === 'owner'

  const [hydrated,     setHydrated]     = useState(false)
  const [members,      setMembers]      = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [addEmail,     setAddEmail]     = useState('')
  const [addError,     setAddError]     = useState('')
  const [addLoading,   setAddLoading]   = useState(false)
  const [removeTarget, setRemoveTarget] = useState(null)
  const [codeCopied,   setCodeCopied]   = useState(false)

  useEffect(() => { hydrate(); setHydrated(true) }, [hydrate])
  useEffect(() => {
    if (!hydrated) return
    if (!user) { router.replace('/login'); return }
    fetchMembers()
  }, [hydrated, user, router])

  async function fetchMembers() {
    setLoading(true)
    try { setMembers(await listMembers()) }
    catch { /* keep */ }
    finally { setLoading(false) }
  }

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

  if (!hydrated || !user) return null

  const ownerCount  = members.filter((m) => m.role === 'owner').length
  const memberCount = members.length
  const filtered    = members.filter((m) =>
    !search.trim() || m.email.toLowerCase().includes(search.toLowerCase())
  )

  const STATS = [
    { Icon: Users,      label: 'Total',   value: memberCount,              unit: 'workspace members', color: '#CC0000',  bg: '#FEF2F2' },
    { Icon: ShieldCheck,label: 'Owners',  value: ownerCount,               unit: 'with full access',  color: '#111111',  bg: '#F5F0E8' },
    { Icon: UserCheck,  label: 'Members', value: memberCount - ownerCount, unit: 'read & chat access', color: '#16A34A', bg: '#F0FDF4' },
  ]

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F9F9F7' }}>
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <main className="flex-1 overflow-y-auto newsprint-bg" style={{ backgroundColor: '#F9F9F7' }}>

        {/* ── Sticky top bar ─────────────────────────────────── */}
        <div
          className="sticky top-0 z-10 px-8 h-14 flex items-center justify-between shrink-0"
          style={{ backgroundColor: '#F9F9F7', borderBottom: '1px solid #111111' }}
        >
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4" style={{ color: '#CC0000' }} strokeWidth={2} />
            <h1 className="np-serif font-black text-[16px]" style={{ color: '#111111' }}>
              Team Members
            </h1>
            <span
              className="np-mono text-[10px] font-bold uppercase tracking-widest px-2 py-0.5"
              style={{ backgroundColor: '#111111', color: '#F9F9F7' }}
            >
              {memberCount} {memberCount === 1 ? 'person' : 'people'}
            </span>
          </div>
          <Link
            href="/dashboard"
            className="np-mono flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest transition-colors"
            style={{ color: '#CC0000' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#AA0000' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#CC0000' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
            Back to chat
          </Link>
        </div>

        {/* ── Page content ─────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-8 py-8 space-y-6">

          {/* ── Stats bar ──────────────────────────────────────── */}
          <div
            className="overflow-hidden"
            style={{ border: '1px solid #111111', boxShadow: '4px 4px 0px 0px #111111', backgroundColor: '#F9F9F7' }}
          >
            <div className="grid grid-cols-3 divide-x" style={{ borderColor: '#E5E5E0' }}>
              {STATS.map(({ Icon, label, value, unit, color, bg }, idx) => (
                <div
                  key={label}
                  className="px-6 py-5 flex flex-col gap-3"
                  style={{ borderRight: idx < 2 ? '1px solid #E5E5E0' : 'none' }}
                >
                  <div
                    className="w-8 h-8 flex items-center justify-center"
                    style={{ backgroundColor: bg, border: '1px solid #E5E5E0' }}
                  >
                    <Icon className="w-4 h-4" style={{ color }} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="np-serif font-black leading-none tabular-nums" style={{ fontSize: '28px', color: '#111111' }}>
                      {value}
                    </p>
                    <p className="np-mono text-[11px] font-bold uppercase tracking-widest mt-2" style={{ color: '#737373' }}>{label}</p>
                    <p className="np-body text-[10px] mt-0.5" style={{ color: '#AEABA6' }}>{unit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Workspace code ─────────────────────────────────── */}
          <div
            className="px-6 py-5 flex items-center justify-between flex-wrap gap-4"
            style={{ backgroundColor: '#F0EDE6', border: '1px solid #E5E5E0' }}
          >
            <div>
              <p className="np-mono text-[9px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: '#CC0000' }}>★ Workspace Code</p>
              <p className="np-body text-[13px]" style={{ color: '#737373' }}>
                Share this code with teammates so they can join during sign-up.
              </p>
            </div>
            <button
              onClick={copyCode}
              className="flex items-center gap-3 px-5 py-3 cursor-pointer transition-all shrink-0"
              style={{ backgroundColor: '#F9F9F7', border: '1.5px solid #E5E5E0' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#CC0000' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E5E0' }}
            >
              <span className="np-mono text-[18px] font-black tracking-[0.25em]" style={{ color: '#CC0000' }}>
                {user?.workspace_code}
              </span>
              {codeCopied
                ? <Check className="w-4 h-4 shrink-0" style={{ color: '#16A34A' }} strokeWidth={2.5} />
                : <Copy className="w-4 h-4 shrink-0" style={{ color: '#AEABA6' }} strokeWidth={2} />
              }
              <span className="np-mono text-[11px] font-bold uppercase tracking-widest" style={{ color: codeCopied ? '#16A34A' : '#737373' }}>
                {codeCopied ? 'Copied!' : 'Copy'}
              </span>
            </button>
          </div>

          {/* ── Main card: search + list + invite ──────────────── */}
          <div
            style={{ border: '1px solid #111111', boxShadow: '4px 4px 0px 0px #111111', backgroundColor: '#F9F9F7' }}
          >
            {/* Search */}
            <div className="px-6 py-4" style={{ borderBottom: '1px solid #E5E5E0' }}>
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
                  onBlur={(e)  => { e.currentTarget.style.borderColor = '#E5E5E0'; e.currentTarget.style.boxShadow = 'none' }}
                />
              </div>
            </div>

            {/* Member list */}
            <div className="min-h-[200px]">
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
                <motion.ul layout>
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
                          className="flex items-center gap-4 px-6 py-4 transition-colors"
                          style={{ borderBottom: '1px solid #E5E5E0' }}
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
                              style={{
                                backgroundColor: isThisOwner ? '#111111' : '#F5F0E8',
                                color:           isThisOwner ? '#F9F9F7' : '#737373',
                                border:          isThisOwner ? 'none' : '1px solid #E5E5E0',
                              }}
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

            {/* Invite form — owner only */}
            {isOwner && (
              <div className="px-6 py-6" style={{ borderTop: '1px solid #E5E5E0', backgroundColor: '#F0EDE6' }}>
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
                      onBlur={(e)  => { e.currentTarget.style.borderColor = '#E5E5E0'; e.currentTarget.style.boxShadow = 'none' }}
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
          </div>

        </div>
      </main>
    </div>
  )
}
