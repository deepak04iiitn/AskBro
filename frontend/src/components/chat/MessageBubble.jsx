import { motion, AnimatePresence } from 'framer-motion'
import CitationCard from './CitationCard'

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block w-1.5 h-1.5 rounded-full bg-brand"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

export default function MessageBubble({ message, activeSourceId, onOpenSource }) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, x: isUser ? 20 : -20, y: 8 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}
    >
      {/* Role label */}
      <span className="text-[11px] font-medium text-fg-4 px-1">
        {isUser ? 'You' : 'AskBro'}
      </span>

      {isUser ? (
        /* User bubble — white card */
        <div
          className="max-w-[82%] px-4 py-3 bg-white text-[15px] text-fg leading-relaxed"
          style={{
            border: '1.5px solid #E4E7EF',
            borderRadius: '16px 16px 4px 16px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          {message.content}
        </div>
      ) : (
        /* AI — no background, just text */
        <div className="max-w-[85%] flex gap-3 items-start">
          <img
            src="/AskBro_Logo.png"
            alt="AskBro"
            className="w-6 h-6 object-contain shrink-0 mt-0.5"
          />
          <div>
            {/* Show typing indicator only if streaming and content is empty */}
            {message.streaming && !message.content ? (
              <TypingIndicator />
            ) : (
              <p className="text-[15px] text-fg-2 leading-[1.8] whitespace-pre-wrap">
                {message.content}
                {message.streaming && (
                  <span className="inline-block w-0.5 h-4 bg-brand ml-0.5 align-middle blink" />
                )}
              </p>
            )}

            {/* Citation chips */}
            <AnimatePresence>
              {!isUser && message.citations?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="flex flex-wrap gap-1.5 mt-3"
                >
                  {message.citations.map((c, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.06, duration: 0.2 }}
                    >
                      <CitationCard
                        citation={c}
                        onOpen={onOpenSource}
                        isActive={activeSourceId === buildSourceId(c)}
                      />
                    </motion.div>
                  ))}
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
