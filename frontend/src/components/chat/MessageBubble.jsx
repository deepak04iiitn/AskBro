import CitationCard from './CitationCard'

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-2`}>
      {/* Role label */}
      <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400 px-1">
        {isUser ? 'You' : 'AskBro'}
      </span>

      {/* Bubble */}
      <div
        className={`
          max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
          ${isUser
            ? 'bg-zinc-900 text-white rounded-br-sm'
            : 'bg-white border border-zinc-200 text-zinc-800 rounded-bl-sm shadow-sm'
          }
        `}
      >
        {message.content}

        {/* Blinking cursor while streaming */}
        {message.streaming && (
          <span className="inline-block w-0.5 h-4 bg-zinc-400 ml-0.5 align-middle animate-pulse" />
        )}
      </div>

      {/* Citations below assistant bubble */}
      {!isUser && message.citations?.length > 0 && (
        <div className="max-w-[85%] w-full space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400 px-1">Sources</p>
          {message.citations.map((c, i) => (
            <CitationCard key={i} citation={c} />
          ))}
        </div>
      )}
    </div>
  )
}
