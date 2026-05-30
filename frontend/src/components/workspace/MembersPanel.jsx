'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Users, Mail, UserMinus, Crown, Loader2, UserPlus } from 'lucide-react'
import { addMember, listMembers, removeMember } from '@/lib/api'
import useAuthStore from '@/store/useAuthStore'

const PANEL_ANIM = {
  initial:    { opacity: 0, scale: 0.95, y: 8 },
  animate:    { opacity: 1, scale: 1,    y: 0 },
  exit:       { opacity: 0, scale: 0.95, y: 8 },
  transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
}

export default function MembersPanel({ onClose }) {
  const user = useAuthStore((s) => s.user)
  const isOwner = user?.role === 'owner'

  const [members, setMembers]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [addEmail, setAddEmail]     = useState('')
  const [addError, setAddError]     = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const [removeTarget, setRemoveTarget] = useState(null)

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

  const memberCount = members.length

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ backgroundColor: 'rgba(10,10,12,0.60)', backdropFilter: 'blur(6px)' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          {...PANEL_ANIM}
          className="bg-white w-full flex flex-col overflow-hidden"
          style={{
            maxWidth: '540px',
            maxHeight: '660px',
            borderRadius: '20px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.06)',
          }}
        >
          {/* ── Header ──────────────────────────────────────────── */}
          <div
            className="px-7 pt-6 pb-5 shrink-0"
            style={{ borderBottom: '1px solid #E3E1DC' }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#EEF1FD' }}
                >
                  <Users className="w-5 h-5" style={{ color: '#4361EE' }} strokeWidth={1.8} />
                </div>
                <div>
                  <h2 className="text-[17px] font-bold tracking-[-0.01em]" style={{ color: '#111110' }}>
                    Team members
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: '#EEF1FD', color: '#4361EE' }}
                    >
                      {user?.workspace_code}
                    </span>
                    {!loading && (
                      <span className="text-[11px]" style={{ color: '#AEABA6' }}>
                        {memberCount} member{memberCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                style={{ color: '#AEABA6' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F4F3F0'
                  e.currentTarget.style.color = '#3D3C3A'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = ''
                  e.currentTarget.style.color = '#AEABA6'
                }}
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* ── Member list ─────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#D9D7D2' }} strokeWidth={2} />
              </div>
            ) : members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: '#F4F3F0' }}
                >
                  <Users className="w-6 h-6" style={{ color: '#AEABA6' }} strokeWidth={1.5} />
                </div>
                <p className="text-[13px]" style={{ color: '#AEABA6' }}>No members yet.</p>
              </div>
            ) : (
              <motion.ul layout className="py-2">
                <AnimatePresence>
                  {members.map((m, i) => {
                    const initial = m.email[0].toUpperCase()
                    const isThisOwner = m.role === 'owner'
                    return (
                      <motion.li
                        key={m.email}
                        layout
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.2 }}
                        className="group flex items-center gap-3.5 px-7 py-3 transition-colors"
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F7F5F2' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}
                      >
                        {/* Avatar */}
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-[13px] font-bold"
                          style={{
                            backgroundColor: isThisOwner ? '#EEF1FD' : '#F0EFEC',
                            color: isThisOwner ? '#4361EE' : '#7A7874',
                          }}
                        >
                          {initial}
                        </div>

                        {/* Email */}
                        <span className="flex-1 text-[13px] font-medium truncate min-w-0" style={{ color: '#111110' }}>
                          {m.email}
                        </span>

                        {/* Role badge */}
                        <span
                          className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                          style={{
                            backgroundColor: isThisOwner ? '#EEF1FD' : '#F4F3F0',
                            color: isThisOwner ? '#4361EE' : '#7A7874',
                          }}
                        >
                          {isThisOwner && <Crown className="w-2.5 h-2.5" strokeWidth={2} />}
                          {isThisOwner ? 'Owner' : 'Member'}
                        </span>

                        {/* Remove button */}
                        {isOwner && !isThisOwner && (
                          <button
                            onClick={() => handleRemove(m.email)}
                            disabled={removeTarget === m.email}
                            className="shrink-0 flex items-center gap-1 text-[12px] font-semibold opacity-0 group-hover:opacity-100 disabled:opacity-40 transition-all cursor-pointer"
                            style={{ color: '#DC2626' }}
                          >
                            {removeTarget === m.email
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
                              : <UserMinus className="w-3.5 h-3.5" strokeWidth={2} />
                            }
                            <span>Remove</span>
                          </button>
                        )}
                      </motion.li>
                    )
                  })}
                </AnimatePresence>
              </motion.ul>
            )}
          </div>

          {/* ── Invite form — owner only ─────────────────────────── */}
          {isOwner && (
            <div
              className="px-7 py-5 shrink-0"
              style={{ borderTop: '1px solid #E3E1DC', backgroundColor: '#F7F5F2' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <UserPlus className="w-4 h-4" style={{ color: '#4361EE' }} strokeWidth={2} />
                <p className="text-[13px] font-semibold" style={{ color: '#111110' }}>
                  Invite a teammate
                </p>
              </div>

              <form onSubmit={handleAdd} className="flex gap-2.5">
                <div className="relative flex-1">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: '#AEABA6' }}
                    strokeWidth={1.8}
                  />
                  <input
                    type="email"
                    value={addEmail}
                    onChange={(e) => { setAddEmail(e.target.value); setAddError('') }}
                    placeholder="colleague@company.com"
                    required
                    className="w-full h-11 rounded-xl text-[13px] focus:outline-none transition-all"
                    style={{
                      paddingLeft: '38px',
                      paddingRight: '12px',
                      backgroundColor: 'white',
                      border: '1.5px solid #E3E1DC',
                      color: '#111110',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#4361EE'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(67,97,238,0.10)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#E3E1DC'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={addLoading || !addEmail.trim()}
                  className="h-11 px-5 text-white text-[13px] font-semibold rounded-xl cursor-pointer disabled:opacity-40 shrink-0 flex items-center gap-1.5 transition-colors"
                  style={{ backgroundColor: '#4361EE' }}
                  onMouseEnter={(e) => { if (!addLoading) e.currentTarget.style.backgroundColor = '#3451D6' }}
                  onMouseLeave={(e) => { if (!addLoading) e.currentTarget.style.backgroundColor = '#4361EE' }}
                >
                  {addLoading
                    ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                    : <UserPlus className="w-4 h-4" strokeWidth={2} />
                  }
                  {addLoading ? 'Sending…' : 'Invite'}
                </button>
              </form>

              {addError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2.5 text-[12px]"
                  style={{ color: '#DC2626' }}
                >
                  {addError}
                </motion.p>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
