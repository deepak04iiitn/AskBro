'use client'

import { useEffect, useState } from 'react'
import { addMember, listMembers, removeMember } from '@/lib/api'
import useAuthStore from '@/store/useAuthStore'

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
    } catch {
      // keep existing list
    } finally {
      setLoading(false)
    }
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
    } catch {
      // silently ignore — could show toast
    } finally {
      setRemoveTarget(null)
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[80vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div>
            <h2 className="text-sm font-bold text-zinc-900">Team Members</h2>
            <p className="text-xs text-zinc-400 mt-0.5">{user?.workspace_code}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Member list */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {loading ? (
            <p className="text-xs text-zinc-400 text-center py-6">Loading…</p>
          ) : members.length === 0 ? (
            <p className="text-xs text-zinc-400 text-center py-6">No members yet.</p>
          ) : (
            <ul className="space-y-1">
              {members.map((m) => (
                <li
                  key={m.email}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-50 group"
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-zinc-600">
                      {m.email[0].toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-800 truncate">{m.email}</p>
                  </div>

                  {/* Role badge */}
                  <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                    m.role === 'owner'
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-100 text-zinc-500'
                  }`}>
                    {m.role}
                  </span>

                  {/* Remove — owner can remove non-owners other than themselves */}
                  {isOwner && m.role !== 'owner' && (
                    <button
                      onClick={() => handleRemove(m.email)}
                      disabled={removeTarget === m.email}
                      className="shrink-0 w-6 h-6 flex items-center justify-center rounded text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-30"
                      title="Remove member"
                    >
                      {removeTarget === m.email ? (
                        <span className="w-3 h-3 border-2 border-zinc-300 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Add member — owner only */}
        {isOwner && (
          <div className="px-5 py-4 border-t border-zinc-100">
            <form onSubmit={handleAdd} className="flex gap-2">
              <input
                type="email"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                placeholder="colleague@company.com"
                required
                className="flex-1 px-3 py-2 text-sm border border-zinc-300 rounded-lg bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition"
              />
              <button
                type="submit"
                disabled={addLoading || !addEmail.trim()}
                className="px-4 py-2 text-sm font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
              >
                {addLoading ? '…' : 'Add'}
              </button>
            </form>
            {addError && (
              <p className="mt-2 text-xs text-red-500">{addError}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
