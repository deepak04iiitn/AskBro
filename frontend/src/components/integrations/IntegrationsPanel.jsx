'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Puzzle, Check, ExternalLink, Loader2, AlertCircle,
  CheckCircle2, Link2Off, GitBranch,
} from 'lucide-react'
import useAuthStore from '@/store/useAuthStore'
import {
  connectNotion,
  disconnectNotion,
  getNotionStatus,
} from '@/lib/integrationsApi'

// Notion N logo as inline SVG
function NotionIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z" />
    </svg>
  )
}

const STEP_BADGE_STYLE = {
  width: '22px',
  height: '22px',
  borderRadius: '50%',
  backgroundColor: '#EEF1FD',
  color: '#4361EE',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '11px',
  fontWeight: 700,
  flexShrink: 0,
}

function StepItem({ num, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
      <div style={STEP_BADGE_STYLE}>{num}</div>
      <p style={{ fontSize: '13px', color: '#4A4845', lineHeight: '1.55', paddingTop: '2px' }}>{children}</p>
    </div>
  )
}

function NotionConnectFlow({ onConnected, onDisconnected, initialStatus }) {
  const user = useAuthStore((s) => s.user)
  const isOwner = user?.role === 'owner'

  const [status, setStatus] = useState(initialStatus)
  const [token, setToken] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [error, setError] = useState('')

  async function handleConnect(e) {
    e.preventDefault()
    if (!token.trim()) return
    setError('')
    setConnecting(true)
    try {
      const res = await connectNotion(token.trim())
      const newStatus = { connected: true, workspace_name: res.workspace_name }
      setStatus(newStatus)
      setToken('')
      onConnected?.(newStatus)
    } catch (err) {
      setError(err.message)
    } finally {
      setConnecting(false)
    }
  }

  async function handleDisconnect() {
    setDisconnecting(true)
    setError('')
    try {
      await disconnectNotion()
      const newStatus = { connected: false }
      setStatus(newStatus)
      onDisconnected?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setDisconnecting(false)
    }
  }

  if (status?.connected) {
    return (
      <div style={{ marginTop: '16px' }}>
        {/* Connected state */}
        <div
          style={{
            backgroundColor: '#F0FDF4',
            border: '1.5px solid #BBF7D0',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              width: '36px', height: '36px', borderRadius: '10px',
              backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CheckCircle2 style={{ width: '18px', height: '18px', color: '#16A34A' }} strokeWidth={2} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#15803D' }}>Connected to Notion</p>
            {status.workspace_name && (
              <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                Workspace: {status.workspace_name}
              </p>
            )}
          </div>
        </div>

        {/* How to import guide */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #E3E1DC',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '16px',
          }}
        >
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#7A7874', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
            How to import a page
          </p>
          <StepItem num={1}>Open any page in Notion you want to import</StepItem>
          <StepItem num={2}>Click the <strong>...</strong> (three dots) menu in the top-right</StepItem>
          <StepItem num={3}>Click <strong>Add connections</strong></StepItem>
          <StepItem num={4}>Search for and select your <strong>Ask<span style={{ color: '#CC0000' }}>Bro</span></strong> integration</StepItem>
          <StepItem num={5}>Now paste the page URL in the <strong>Upload</strong> zone - <strong>Notion</strong> tab</StepItem>
        </div>

        {/* Disconnect - owner only */}
        {isOwner && (
          <div>
            {error && (
              <div
                style={{
                  backgroundColor: '#FEF2F2', borderLeft: '3px solid #DC2626',
                  borderRadius: '10px', padding: '10px 14px', marginBottom: '10px',
                }}
              >
                <p style={{ fontSize: '12px', color: '#DC2626' }}>{error}</p>
              </div>
            )}
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '13px', fontWeight: 600, color: '#DC2626',
                backgroundColor: 'transparent', border: '1.5px solid #FECACA',
                borderRadius: '10px', padding: '8px 16px', cursor: 'pointer',
                opacity: disconnecting ? 0.6 : 1,
              }}
              onMouseEnter={(e) => { if (!disconnecting) e.currentTarget.style.backgroundColor = '#FEF2F2' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              {disconnecting
                ? <Loader2 style={{ width: '14px', height: '14px' }} className="animate-spin" strokeWidth={2} />
                : <Link2Off style={{ width: '14px', height: '14px' }} strokeWidth={2} />
              }
              {disconnecting ? 'Disconnecting...' : 'Disconnect Notion'}
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ marginTop: '16px' }}>
      {/* Step 1: Create integration */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1.5px solid #E3E1DC',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '16px',
        }}
      >
        <p style={{ fontSize: '12px', fontWeight: 700, color: '#7A7874', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
          Step 1 - Create your Notion integration
        </p>
        <StepItem num={1}>
          Go to{' '}
          <a
            href="https://www.notion.so/my-integrations"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#4361EE', textDecoration: 'underline' }}
          >
            notion.so/my-integrations
          </a>
        </StepItem>
        <StepItem num={2}>Click <strong>New integration</strong></StepItem>
        <StepItem num={3}>Name it (e.g. <strong>Ask<span style={{ color: '#CC0000' }}>Bro</span></strong>) and select your workspace</StepItem>
        <StepItem num={4}>Under Capabilities: check <strong>Read content</strong> only</StepItem>
        <StepItem num={5}>Click Save - copy the <strong>Internal Integration Secret</strong> (starts with <code style={{ fontSize: '12px', backgroundColor: '#F4F3F0', padding: '1px 4px', borderRadius: '4px' }}>secret_</code>)</StepItem>
      </div>

      {/* Step 2: Paste token */}
      <form onSubmit={handleConnect}>
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #E3E1DC',
            borderRadius: '16px',
            padding: '16px',
          }}
        >
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#7A7874', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
            Step 2 - Paste your token
          </p>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4A4845', marginBottom: '6px' }}>
            Notion Integration Token
          </label>
          <input
            type="password"
            value={token}
            onChange={(e) => { setToken(e.target.value); setError('') }}
            placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxx"
            style={{
              width: '100%', height: '42px', borderRadius: '10px',
              border: '1.5px solid #E3E1DC', backgroundColor: '#F7F5F2',
              padding: '0 12px', fontSize: '13px', color: '#111110',
              outline: 'none', boxSizing: 'border-box',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#4361EE'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(67,97,238,0.10)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#E3E1DC'; e.currentTarget.style.boxShadow = 'none' }}
          />

          {error && (
            <div
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '8px',
                backgroundColor: '#FEF2F2', borderLeft: '3px solid #DC2626',
                borderRadius: '8px', padding: '10px 12px', marginTop: '10px',
              }}
            >
              <AlertCircle style={{ width: '14px', height: '14px', color: '#DC2626', flexShrink: 0, marginTop: '1px' }} strokeWidth={2} />
              <p style={{ fontSize: '12px', color: '#DC2626' }}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={connecting || !token.trim()}
            style={{
              marginTop: '12px', width: '100%', height: '42px',
              backgroundColor: '#4361EE', color: '#FFFFFF',
              border: 'none', borderRadius: '10px',
              fontSize: '13px', fontWeight: 600,
              cursor: connecting || !token.trim() ? 'not-allowed' : 'pointer',
              opacity: connecting || !token.trim() ? 0.5 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => { if (!connecting && token.trim()) e.currentTarget.style.backgroundColor = '#3451D6' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#4361EE' }}
          >
            {connecting
              ? <><Loader2 style={{ width: '15px', height: '15px' }} className="animate-spin" strokeWidth={2} /> Connectingâ€¦</>
              : <><Check style={{ width: '15px', height: '15px' }} strokeWidth={2.5} /> Connect Notion</>
            }
          </button>
        </div>
      </form>
    </div>
  )
}

export default function IntegrationsPanel({ onClose, onNotionStatusChange }) {
  const [notionExpanded, setNotionExpanded] = useState(false)
  const [notionStatus, setNotionStatus] = useState(null)
  const [loadingStatus, setLoadingStatus] = useState(true)

  useEffect(() => {
    async function loadStatus() {
      try {
        const s = await getNotionStatus()
        setNotionStatus(s)
        if (s.connected) setNotionExpanded(true)
      } catch {
        setNotionStatus({ connected: false })
      } finally {
        setLoadingStatus(false)
      }
    }
    loadStatus()
  }, [])

  function handleConnected(newStatus) {
    setNotionStatus(newStatus)
    onNotionStatusChange?.(true)
  }

  function handleDisconnected() {
    setNotionStatus({ connected: false })
    onNotionStatusChange?.(false)
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 49,
          backgroundColor: 'rgba(10,10,12,0.55)',
          backdropFilter: 'blur(6px)',
        }}
        onClick={onClose}
      />

      {/* Panel - slides in from right */}
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 50,
          width: '480px', maxWidth: '100vw',
          backgroundColor: '#F7F5F2',
          borderLeft: '1px solid #E3E1DC',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px 18px',
            borderBottom: '1px solid #E3E1DC',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            backgroundColor: '#FFFFFF',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px', height: '40px', borderRadius: '12px',
                backgroundColor: '#EEF1FD', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Puzzle style={{ width: '20px', height: '20px', color: '#4361EE' }} strokeWidth={1.8} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#111110', letterSpacing: '-0.01em' }}>
                Integrations
              </h2>
              <p style={{ fontSize: '12px', color: '#7A7874', marginTop: '2px' }}>
                Connect external tools to import content
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '34px', height: '34px', borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#AEABA6', backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F4F3F0'; e.currentTarget.style.color = '#3D3C3A' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#AEABA6' }}
          >
            <X style={{ width: '17px', height: '17px' }} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>

          {/* Integration cards row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '4px' }}>

            {/* Notion card */}
            <button
              onClick={() => setNotionExpanded((v) => !v)}
              style={{
                backgroundColor: '#FFFFFF',
                border: notionExpanded ? '2px solid #4361EE' : '1.5px solid #E3E1DC',
                borderRadius: '16px',
                padding: '16px',
                cursor: 'pointer',
                textAlign: 'left',
                borderLeft: notionExpanded ? '4px solid #4361EE' : undefined,
                transition: 'border-color 0.15s, box-shadow 0.15s',
                position: 'relative',
              }}
              onMouseEnter={(e) => { if (!notionExpanded) { e.currentTarget.style.borderColor = '#4361EE'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(67,97,238,0.10)' } }}
              onMouseLeave={(e) => { if (!notionExpanded) { e.currentTarget.style.borderColor = '#E3E1DC'; e.currentTarget.style.boxShadow = 'none' } }}
            >
              {/* Connected badge */}
              {notionStatus?.connected && (
                <div
                  style={{
                    position: 'absolute', top: '10px', right: '10px',
                    width: '8px', height: '8px', borderRadius: '50%',
                    backgroundColor: '#16A34A',
                  }}
                />
              )}
              <div
                style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  backgroundColor: '#F4F3F0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '10px', color: '#111110',
                }}
              >
                <NotionIcon size={18} />
              </div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#111110', marginBottom: '4px' }}>Notion</p>
              <p style={{ fontSize: '12px', color: '#7A7874', lineHeight: '1.4' }}>
                Import pages from your Notion workspace
              </p>
              {notionStatus?.connected && (
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#16A34A', marginTop: '8px' }}>
                  Connected
                </p>
              )}
            </button>

            {/* GitHub card - coming soon */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #E3E1DC',
                borderRadius: '16px',
                padding: '16px',
                opacity: 0.55,
                position: 'relative',
                cursor: 'not-allowed',
              }}
            >
              <div
                style={{
                  position: 'absolute', top: '10px', right: '10px',
                  fontSize: '10px', fontWeight: 700, color: '#7A7874',
                  backgroundColor: '#F4F3F0', borderRadius: '6px', padding: '2px 7px',
                }}
              >
                Soon
              </div>
              <div
                style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  backgroundColor: '#F4F3F0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '10px', color: '#7A7874',
                }}
              >
                <GitBranch style={{ width: '18px', height: '18px' }} strokeWidth={1.8} />
              </div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#111110', marginBottom: '4px' }}>GitHub</p>
              <p style={{ fontSize: '12px', color: '#7A7874', lineHeight: '1.4' }}>
                Sync repositories as searchable documents
              </p>
            </div>
          </div>

          {/* Notion expanded connect flow */}
          <AnimatePresence>
            {notionExpanded && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {loadingStatus ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                    <Loader2
                      style={{ width: '22px', height: '22px', color: '#D9D7D2' }}
                      className="animate-spin"
                      strokeWidth={2}
                    />
                  </div>
                ) : (
                  <NotionConnectFlow
                    initialStatus={notionStatus}
                    onConnected={handleConnected}
                    onDisconnected={handleDisconnected}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  )
}



