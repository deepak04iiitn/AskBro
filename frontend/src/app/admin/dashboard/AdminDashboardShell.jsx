'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, Building2, FileText,
  Activity, LogOut, ChevronLeft, ChevronRight, ShieldCheck,
} from 'lucide-react'
import { fetchAdminMetrics } from '@/lib/adminApi'

const MetricsContext = createContext(null)
export function useMetrics() { return useContext(MetricsContext) }

const NAV_ITEMS = [
  { label: 'Overview',    href: '/admin/dashboard',            Icon: LayoutDashboard },
  { label: 'Users',       href: '/admin/dashboard/users',      Icon: Users           },
  { label: 'Workspaces',  href: '/admin/dashboard/workspaces', Icon: Building2       },
  { label: 'Documents',   href: '/admin/dashboard/documents',  Icon: FileText        },
  { label: 'Activity',    href: '/admin/dashboard/activity',   Icon: Activity        },
]

const LABEL_T = { duration: 0.1 }

export default function AdminDashboardLayout({ children }) {
  const router   = useRouter()
  const pathname = usePathname()

  const [metrics,   setMetrics]   = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('askbro_admin_token')
    if (!token) { router.replace('/admin/login'); return }
    loadMetrics()
  }, [])

  async function loadMetrics() {
    try {
      setLoading(true)
      setMetrics(await fetchAdminMetrics())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleSignOut() {
    localStorage.removeItem('askbro_admin_token')
    router.push('/admin/login')
  }

  return (
    <MetricsContext.Provider value={{ metrics, loading, error, refetch: loadMetrics }}>
      <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F7F5F2' }}>

        {/* ── Sidebar ──────────────────────────────────────────── */}
        <motion.aside
          animate={{ width: collapsed ? 68 : 280 }}
          transition={{ type: 'spring', stiffness: 280, damping: 30 }}
          className="shrink-0 flex flex-col h-full relative z-20"
          style={{ backgroundColor: '#F7F5F2', borderRight: '1px solid #E3E1DC' }}
        >
          {/* Header */}
          <div
            className="shrink-0"
            style={{ padding: collapsed ? '16px 12px' : '18px 16px 14px', borderBottom: '1px solid #E3E1DC' }}
          >
            {!collapsed ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <img src="/AskBro_Logo.png" alt="AskBro" className="h-10 w-auto mix-blend-multiply" />
                  <button
                    onClick={() => setCollapsed(true)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer"
                    style={{ color: '#AEABA6' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E3E1DC'; e.currentTarget.style.color = '#3D3C3A' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#AEABA6' }}
                  >
                    <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>
                {/* Admin badge */}
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ backgroundColor: '#EEF1FD', border: '1px solid #C7D2FE' }}
                >
                  <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: '#4361EE' }} strokeWidth={2} />
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold" style={{ color: '#4361EE' }}>Admin Panel</p>
                    <p className="text-[10px]" style={{ color: '#7A7874' }}>Full platform access</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={() => setCollapsed(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors cursor-pointer"
                  style={{ color: '#AEABA6' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E3E1DC'; e.currentTarget.style.color = '#3D3C3A' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#AEABA6' }}
                >
                  <ChevronRight className="w-4 h-4" strokeWidth={2} />
                </button>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: '#EEF1FD' }}
                  title="Admin Panel"
                >
                  <ShieldCheck className="w-4.5 h-4.5" style={{ color: '#4361EE' }} strokeWidth={2} />
                </div>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
            {NAV_ITEMS.map(({ label, href, Icon }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-[13px] font-medium transition-colors"
                  style={{
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    backgroundColor: isActive ? '#EEF1FD' : 'transparent',
                    color: isActive ? '#4361EE' : '#4A4845',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#EEECEA' }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent' }}
                  title={collapsed ? label : undefined}
                >
                  <Icon
                    className="w-4.5 h-4.5 shrink-0"
                    style={{ color: isActive ? '#4361EE' : '#7A7874' }}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  {!collapsed && (
                    <motion.span animate={{ opacity: collapsed ? 0 : 1 }} transition={LABEL_T}>
                      {label}
                    </motion.span>
                  )}
                  {!collapsed && isActive && (
                    <span
                      className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: '#4361EE' }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Sign out */}
          <div className="shrink-0 flex justify-center" style={{ borderTop: '1px solid #E3E1DC', padding: '12px 16px' }}>
            {collapsed ? (
              <button
                onClick={handleSignOut}
                className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors cursor-pointer"
                style={{ color: '#7A7874' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FEF2F2'; e.currentTarget.style.color = '#DC2626' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#7A7874' }}
                title="Sign out"
              >
                <LogOut className="w-4 h-4" strokeWidth={1.8} />
              </button>
            ) : (
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center gap-2 w-full h-10 rounded-xl text-[13px] font-semibold transition-colors cursor-pointer"
                style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FEE2E2' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FEF2F2' }}
              >
                <LogOut className="w-4 h-4" strokeWidth={2} />
                Sign out
              </button>
            )}
          </div>
        </motion.aside>

        {/* ── Main content ─────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto" style={{ backgroundColor: '#F7F5F2' }}>
          {children}
        </main>
      </div>
    </MetricsContext.Provider>
  )
}
