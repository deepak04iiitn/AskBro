import { create } from 'zustand'

/**
 * Message shape:
 * {
 *   id:        string   — unique per message
 *   role:      'user' | 'assistant'
 *   content:   string   — full text (built up token by token for assistant)
 *   citations: Array    — populated when done: true arrives
 *   streaming: boolean  — true while tokens are still arriving
 * }
 */

let _idCounter = 0
function nextId() {
  return `msg_${Date.now()}_${_idCounter++}`
}

const useChatStore = create((set, get) => ({
  messages: [],
  streaming: false,
  chatId: null,

  setChatId(id) {
    set({ chatId: id })
  },

  /**
   * Load messages from the API response into the store.
   * Converts API format { id, role, content, citations, created_at }
   * to store format { id, role, content, citations, streaming: false }.
   */
  loadMessages(apiMessages) {
    const messages = apiMessages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      citations: m.citations ?? [],
      streaming: false,
    }))
    set({ messages })
  },

  addMessage({ role, content = '', citations = [], streaming = false }) {
    const msg = { id: nextId(), role, content, citations, streaming }
    set((state) => ({ messages: [...state.messages, msg] }))
    return msg.id
  },

  /**
   * Append a token to the last assistant message.
   */
  appendToken(token) {
    set((state) => {
      const msgs = [...state.messages]
      const last = msgs[msgs.length - 1]
      if (last && last.role === 'assistant') {
        msgs[msgs.length - 1] = { ...last, content: last.content + token }
      }
      return { messages: msgs }
    })
  },

  /**
   * Mark the last assistant message as done and attach citations.
   */
  setCitations(citations) {
    set((state) => {
      const msgs = [...state.messages]
      const last = msgs[msgs.length - 1]
      if (last && last.role === 'assistant') {
        msgs[msgs.length - 1] = { ...last, citations, streaming: false }
      }
      return { messages: msgs, streaming: false }
    })
  },

  setStreaming(val) {
    set({ streaming: val })
  },

  clearMessages() {
    set({ messages: [], streaming: false, chatId: null })
  },
}))

export default useChatStore
