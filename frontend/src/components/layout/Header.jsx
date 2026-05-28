'use client'

import Link from 'next/link'
import useAuthStore from '@/store/useAuthStore'

export default function Header() {
  const user = useAuthStore((s) => s.user)

  return (
    <header className="h-14 border-b border-zinc-200 bg-white flex items-center px-4 shrink-0">
      <span className="text-base font-bold tracking-tight text-zinc-900 select-none">AskBro</span>

      <div className="ml-auto flex items-center gap-3">
        {user && (
          <span className="hidden sm:block text-xs text-zinc-500 truncate max-w-[200px]">
            {user.email}
          </span>
        )}
        <Link
          href="/upload"
          className="text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-300 text-zinc-700 hover:bg-zinc-50 transition-colors"
        >
          Upload
        </Link>
      </div>
    </header>
  )
}
