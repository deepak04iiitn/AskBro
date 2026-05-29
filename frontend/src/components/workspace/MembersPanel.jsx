'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { addMember, listMembers, removeMember } from '@/lib/api'
import useAuthStore from '@/store/useAuthStore'
import { SCALE_IN } from '@/lib/animations'

export default function MembersPanel({ onClose }) {
  const user = useAuthStore((s) => s.user)
  const isOwner = user?.role === 'owner'

  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [addEmail, setAddEmail] = useState('')
  const [addError, setAddError] = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const [removeTarget, setRemoveTarget] = useState(null)

  async function fetchMembers() {
    try {
      const data = await listMembers()
      setMembers(data)
    } catch { /* keep existing */ }
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
    try {
      await removeMember(email)
      await fetchMembers()
    } catch { /* ignore */ }
    finally { setRemoveTarget(null) }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(15,17,23,0.55)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        {...SCALE_IN}
        className="bg-white rounded-2xl w-full max-w-[460px] flex flex-col overflow-hidden"
        style={{
          maxHeight: '540px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.20), 0 0 0 1px rgba(0,0,0,0.06)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
          <div>
            <h2 className="text-[15px] font-semibold text-fg">Team members</h2>
            <p className="text-[12px] text-fg-4 mt-0.5">{user?.workspace_code}</p>
          </div>
          <motion.button
            onClick={onClose}
            whileHover={{ backgroundColor: '#F1F3F9' }}
            whileTap={{ scale: 0.92 }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-fg-4 hover:text-fg transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        </div>

        {/* Member list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="py-10 text-center">
              <div className="w-6 h-6 border-2 border-border border-t-brand rounded-full animate-spin mx-auto" />
            </div>
          ) : members.length === 0 ? (
            <p className="text-[13px] text-fg-4 text-center py-10">No members yet.</p>
          ) : (
            <motion.ul layout>
              <AnimatePresence>
                {members.map((m, i) => (
                  <motion.li
                    key={m.email}
                    layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    transition={{ duration: 0.22 }}
                    className={`flex items-center gap-3 px-6 py-3.5 group hover:bg-surface transition-colors ${i > 0 ? 'border-t border-border-2' : ''}`}
                  >
                    {/* Gradient avatar */}
                    <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center shrink-0">
                      <span className="text-[12px] font-bold text-white">
                        {m.email[0].toUpperCase()}
                      </span>
                    </div>

                    <span className="flex-1 text-[13px] text-fg truncate min-w-0">{m.email}</span>

                    <span
                      className={`shrink-0 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        m.role === 'owner'
                          ? 'bg-brand-light text-brand'
                          : 'bg-surface-2 text-fg-3'
                      }`}
                    >
                      {m.role === 'owner' ? 'Owner' : 'Member'}
                    </span>

                    {isOwner && m.role !== 'owner' && (
                      <motion.button
                        onClick={() => handleRemove(m.email)}
                        disabled={removeTarget === m.email}
                        whileTap={{ scale: 0.9 }}
                        className="shrink-0 text-[12px] text-danger opacity-0 group-hover:opacity-100 disabled:opacity-40 transition-opacity cursor-pointer font-medium"
                      >
                        {removeTarget === m.email ? '...' : 'Remove'}
                      </motion.button>
                    )}
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
        </div>

        {/* Invite form — owner only */}
        {isOwner && (
          <div className="px-6 py-4 border-t border-border shrink-0">
            <p className="text-[12px] text-fg-3 mb-2.5 font-medium">Invite by email</p>
            <form onSubmit={handleAdd} className="flex gap-2">
              <input
                type="email"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                placeholder="colleague@company.com"
                required
                className="flex-1 h-10 px-3 bg-surface border border-border rounded-lg text-[13px] text-fg placeholder:text-fg-4 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-border transition-all"
              />
              <motion.button
                type="submit"
                disabled={addLoading || !addEmail.trim()}
                whileTap={{ scale: 0.96 }}
                className="h-10 px-5 gradient-brand text-white text-[13px] font-semibold rounded-lg cursor-pointer disabled:opacity-50 shrink-0"
              >
                {addLoading ? '...' : 'Invite'}
              </motion.button>
            </form>
            {addError && <p className="mt-2 text-[12px] text-danger">{addError}</p>}
          </div>
        )}
      </motion.div>
    </div>
  )
}
