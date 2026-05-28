'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createWorkspace, login } from '@/lib/api'
import useAuthStore from '@/store/useAuthStore'

export default function CreateWorkspaceForm() {
  const router = useRouter()
  const setUser = useAuthStore((s) => s.setUser)

  const [form, setForm] = useState({
    name: '',
    owner_email: '',
    password: '',
    member_emails: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const memberEmails = form.member_emails
      ? form.member_emails.split(',').map((s) => s.trim()).filter(Boolean)
      : []

    try {
      const created = await createWorkspace({
        name: form.name,
        owner_email: form.owner_email,
        password: form.password,
        member_emails: memberEmails,
      })

      // Auto-login with the new workspace code
      const { access_token } = await login({
        workspace_code: created.workspace_code,
        email: form.owner_email,
        password: form.password,
      })

      setUser(access_token)
      router.replace('/dashboard')
    } catch (err) {
      setError(err.message || 'Failed to create workspace.')
    } finally {
      setLoading(false)
    }
  }

  // ── Form ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold tracking-tight text-zinc-900">AskBro</span>
          <p className="mt-1 text-sm text-zinc-500">Create a new workspace</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Workspace name */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wide mb-1.5">
                Workspace Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Acme Corp"
                required
                className="w-full px-3 py-2.5 text-sm border border-zinc-300 rounded-lg bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition"
              />
            </div>

            {/* Owner email */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wide mb-1.5">
                Your Email <span className="text-zinc-400 normal-case font-normal">(owner)</span>
              </label>
              <input
                name="owner_email"
                type="email"
                value={form.owner_email}
                onChange={handleChange}
                placeholder="you@company.com"
                required
                className="w-full px-3 py-2.5 text-sm border border-zinc-300 rounded-lg bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wide mb-1.5">
                Workspace Password
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Choose a strong password"
                required
                className="w-full px-3 py-2.5 text-sm border border-zinc-300 rounded-lg bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition"
              />
            </div>

            {/* Member emails */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wide mb-1.5">
                Invite Members <span className="text-zinc-400 normal-case font-normal">(optional, comma-separated)</span>
              </label>
              <input
                name="member_emails"
                value={form.member_emails}
                onChange={handleChange}
                placeholder="alice@co.com, bob@co.com"
                className="w-full px-3 py-2.5 text-sm border border-zinc-300 rounded-lg bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                <span className="mt-0.5">⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-sm font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating…' : 'Create workspace'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have a code?{' '}
          <Link href="/login" className="font-medium text-zinc-900 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
