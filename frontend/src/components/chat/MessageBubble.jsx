import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import CitationCard from './CitationCard'

const AVATAR_SIZE = 40

function TypingIndicator() {
  return (
    <div
      className="flex items-center gap-1"
      style={{ minHeight: `${AVATAR_SIZE}px` }}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block w-2 h-2 rounded-full"
          style={{ backgroundColor: '#CC0000' }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.13, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

const MD_COMPONENTS = {
  p: ({ children }) => (
    <p className="np-body mb-4 last:mb-0 text-[15px] leading-[1.8]" style={{ color: '#111111' }}>
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
    <li className="np-body text-[15px] leading-[1.7] pl-1" style={{ color: '#111111' }}>{children}</li>
  ),
  strong: ({ children }) => (
    <strong className="font-bold" style={{ color: '#111111' }}>{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic" style={{ color: '#3D3C3A' }}>{children}</em>
  ),
  h1: ({ children }) => (
    <h1 className="np-serif text-[20px] font-black mb-3 mt-5 first:mt-0" style={{ color: '#111111' }}>{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="np-serif text-[17px] font-bold mb-2 mt-4 first:mt-0" style={{ color: '#111111' }}>{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="np-sans text-[15px] font-bold mb-2 mt-3 first:mt-0" style={{ color: '#111111' }}>{children}</h3>
  ),
  code: ({ inline, children }) =>
    inline ? (
      <code
        className="np-mono text-[13px] px-1.5 py-0.5"
        style={{ backgroundColor: '#F5F0E8', color: '#111111', border: '1px solid #E5E5E0' }}
      >
        {children}
      </code>
    ) : (
      <code className="block np-mono text-[13px] leading-relaxed" style={{ color: '#111111' }}>{children}</code>
    ),
  pre: ({ children }) => (
    <pre
      className="mb-4 last:mb-0 px-4 py-4 overflow-x-auto np-mono text-[13px] leading-relaxed"
      style={{ backgroundColor: '#F5F0E8', borderLeft: '3px solid #111111', color: '#111111' }}
    >
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote
      className="mb-4 last:mb-0 pl-4 py-1 np-body text-[14px] italic"
      style={{ borderLeft: '3px solid #CC0000', color: '#4A4845' }}
    >
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a href={href} className="underline underline-offset-2 transition-colors hover:text-[#AA0000]" style={{ color: '#CC0000' }}>{children}</a>
  ),
  hr: () => <hr className="my-4" style={{ borderColor: '#E5E5E0' }} />,
}

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
          <span className="np-mono text-[10px] font-bold uppercase tracking-widest px-1" style={{ color: '#CC0000' }}>You</span>
          <div
            className="max-w-[78%] px-4 py-3 np-body text-[15px] leading-relaxed"
            style={{
              backgroundColor: '#F0EDE6',
              borderRadius: '14px 14px 4px 14px',
              border: '1px solid #E5E5E0',
              color: '#111111',
            }}
          >
            {content}
          </div>
        </>
      ) : (
        <div className="w-full flex gap-3 items-start">
          {/* AI avatar */}
          <div
            className="w-10 h-10 overflow-hidden shrink-0 flex items-center justify-center"
            style={{ backgroundColor: '#F5F0E8', border: '1px solid #E5E5E0' }}
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
                    style={{ backgroundColor: '#CC0000' }}
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
                    className="np-mono text-[9px] font-bold uppercase tracking-[0.2em] mb-2"
                    style={{ color: '#CC0000' }}
                  >
                    ★ Sources
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
