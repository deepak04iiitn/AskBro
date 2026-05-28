'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { saveToken } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function LoginForm() {
  const router = useRouter()
  const [form, setForm] = useState({ workspace_code: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/workspaces/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.detail || 'Login failed. Please check your credentials.')
        return
      }

      saveToken(data.access_token)
      router.push('/dashboard')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / brand */}
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold tracking-tight text-zinc-900">AskBro</span>
          <p className="mt-1 text-sm text-zinc-500">Sign in to your workspace</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Workspace code */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wide mb-1.5">
                Workspace Code
              </label>
              <input
                name="workspace_code"
                value={form.workspace_code}
                onChange={handleChange}
                placeholder="WSP-XXXX"
                required
                autoComplete="off"
                className="w-full px-3 py-2.5 text-sm border border-zinc-300 rounded-lg bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wide mb-1.5">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@company.com"
                required
                autoComplete="email"
                className="w-full px-3 py-2.5 text-sm border border-zinc-300 rounded-lg bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wide mb-1.5">
                Password
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                autoComplete="current-password"
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
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p className="mt-6 text-center text-sm text-zinc-500">
          New workspace?{' '}
          <Link href="/create" className="font-medium text-zinc-900 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
