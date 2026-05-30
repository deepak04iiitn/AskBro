import { create } from 'zustand'
import { createChat, deleteChatApi, listChats } from '@/lib/api'

const useChatsStore = create((set, get) => ({
  chats: [],
  loading: false,

  async fetchChats() {
    set({ loading: true })
    try {
      const chats = await listChats()
      set({ chats, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  async createNewChat() {
    const chat = await createChat()
    set((state) => ({ chats: [chat, ...state.chats] }))
    return chat
  },

  async deleteChat(id) {
    await deleteChatApi(id)
    set((state) => ({ chats: state.chats.filter((c) => c.id !== id) }))
  },

  updateChatTitle(id, title) {
    set((state) => ({
      chats: state.chats.map((c) => c.id === id ? { ...c, title } : c),
    }))
  },

  bumpChat(id) {
    set((state) => {
      const chat = state.chats.find((c) => c.id === id)
      if (!chat) return state
      return {
        chats: [
          { ...chat, updated_at: new Date().toISOString() },
          ...state.chats.filter((c) => c.id !== id),
        ],
      }
    })
  },
}))

export default useChatsStore
