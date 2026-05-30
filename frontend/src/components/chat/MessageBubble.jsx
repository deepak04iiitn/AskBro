import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import CitationCard from './CitationCard'

const AVATAR_SIZE = 40 // px — keep in sync with w-10 h-10

function TypingIndicator() {
  return (
    // Min-height matches avatar so dots are vertically centred with it
    <div
      className="flex items-center gap-1"
      style={{ minHeight: `${AVATAR_SIZE}px` }}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block w-2 h-2 rounded-full"
          style={{ backgroundColor: '#AEABA6' }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.13, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

// ── Markdown component map ─────────────────────────────────────

const MD_COMPONENTS = {
  p: ({ children }) => (
    <p className="mb-4 last:mb-0 text-[15px] leading-[1.8]" style={{ color: '#111110' }}>
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 last:mb-0 space-y-1.5 pl-5" style={{ listStyleType: 'disc', color: '#3D3C3A' }}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 last:mb-0 space-y-1.5 pl-5" style={{ listStyleType: 'decimal', color: '#3D3C3A' }}>
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="text-[15px] leading-[1.7] pl-1" style={{ color: '#111110' }}>{children}</li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold" style={{ color: '#111110' }}>{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic" style={{ color: '#111110' }}>{children}</em>
  ),
  h1: ({ children }) => (
    <h1 className="text-[18px] font-bold mb-3 mt-5 first:mt-0 tracking-tight" style={{ color: '#111110' }}>{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-[16px] font-semibold mb-2 mt-4 first:mt-0 tracking-tight" style={{ color: '#111110' }}>{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-[15px] font-semibold mb-2 mt-3 first:mt-0" style={{ color: '#111110' }}>{children}</h3>
  ),
  code: ({ inline, children }) =>
    inline ? (
      <code
        className="text-[13px] px-1.5 py-0.5 rounded font-mono"
        style={{ backgroundColor: '#F0EFEC', color: '#3D3C3A', border: '1px solid #E3E1DC' }}
      >
        {children}
      </code>
    ) : (
      <code className="block text-[13px] font-mono leading-relaxed" style={{ color: '#111110' }}>{children}</code>
    ),
  pre: ({ children }) => (
    <pre
      className="mb-4 last:mb-0 rounded-xl px-4 py-4 overflow-x-auto text-[13px] font-mono leading-relaxed"
      style={{ backgroundColor: '#F0EFEC', border: '1px solid #E3E1DC', color: '#3D3C3A' }}
    >
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote
      className="mb-4 last:mb-0 pl-4 py-1 text-[14px] italic"
      style={{ borderLeft: '3px solid #E3E1DC', color: '#4A4845' }}
    >
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a href={href} className="underline underline-offset-2" style={{ color: '#4361EE' }}>{children}</a>
  ),
  hr: () => <hr className="my-4" style={{ borderColor: '#E3E1DC' }} />,
}

// Strip [Source: ...] entirely — citation chips below the answer handle attribution
function stripPageNumbers(text) {
  return text.replace(/\[Source:[^\]]*\]/gi, '').replace(/\n{3,}/g, '\n\n').trim()
}

export default function MessageBubble({ message, activeSourceId, onOpenSource }) {
  const isUser = message.role === 'user'
  const content = isUser ? message.content : stripPageNumbers(message.content || '')

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}
    >
      {isUser ? (
        <>
          <span className="text-[11px] font-medium px-1" style={{ color: '#AEABA6' }}>You</span>
          <div
            className="max-w-[78%] px-4 py-3 text-[15px] leading-relaxed"
            style={{
              backgroundColor: '#F0EFEC',
              borderRadius: '14px 14px 4px 14px',
              color: '#111110',
            }}
          >
            {content}
          </div>
        </>
      ) : (
        <div className="w-full flex gap-3 items-start">
          {/* AI avatar — w-10 h-10 = 40px */}
          <div
            className="w-10 h-10 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
            style={{ backgroundColor: '#EEF1FD' }}
          >
            <img
              src="/AskBro_Logo.png"
              alt="AskBro"
              className="w-full h-full object-contain mix-blend-multiply"
            />
          </div>

          <div className="flex-1 min-w-0">
            {message.streaming && !message.content ? (
              <TypingIndicator />
            ) : (
              <div className="prose-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
                  {content}
                </ReactMarkdown>
                {message.streaming && (
                  <span
                    className="inline-block w-0.5 h-4 ml-0.5 align-middle blink"
                    style={{ backgroundColor: '#4361EE' }}
                  />
                )}
              </div>
            )}

            <AnimatePresence>
              {message.citations?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.1 }}
                  className="mt-4"
                >
                  <p
                    className="text-[10px] font-bold uppercase tracking-widest mb-2"
                    style={{ color: '#AEABA6' }}
                  >
                    Sources
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {message.citations.map((c, i) => (
                      <CitationCard
                        key={i}
                        citation={c}
                        onOpen={onOpenSource}
                        isActive={activeSourceId === buildSourceId(c)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export function buildSourceId(citation) {
  return `${citation.fileName}::${citation.pageNumber}`
}
