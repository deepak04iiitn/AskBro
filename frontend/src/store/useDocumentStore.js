import { create } from 'zustand'
import { deleteDocument, getDocumentStatus, listDocuments } from '@/lib/api'

// Map of docId → intervalId for active polls
const _pollingMap = {}

const useDocumentStore = create((set, get) => ({
  documents: [],
  loading: false,
  error: null,

  async fetchDocuments(filters = {}) {
    set({ loading: true, error: null })
    try {
      const docs = await listDocuments(filters)
      set({ documents: docs })
    } catch (err) {
      set({ error: err.message })
    } finally {
      set({ loading: false })
    }
  },

  addDocument(doc) {
    set((state) => ({ documents: [doc, ...state.documents] }))
  },

  updateDocument(documentId, patch) {
    set((state) => ({
      documents: state.documents.map((d) =>
        d.document_id === documentId ? { ...d, ...patch } : d
      ),
    }))
  },

  removeDocument(documentId) {
    // Stop polling if active
    if (_pollingMap[documentId]) {
      clearInterval(_pollingMap[documentId])
      delete _pollingMap[documentId]
    }
    set((state) => ({
      documents: state.documents.filter((d) => d.document_id !== documentId),
    }))
  },

  /**
   * Poll /documents/{id}/status every 3 seconds.
   * Stops automatically when status becomes "completed" or "failed".
   */
  startPolling(documentId) {
    if (_pollingMap[documentId]) return // already polling

    const intervalId = setInterval(async () => {
      try {
        const status = await getDocumentStatus(documentId)
        get().updateDocument(documentId, {
          status: status.status,
          chunk_count: status.chunk_count,
          error_message: status.error_message,
        })

        if (status.status === 'completed' || status.status === 'failed') {
          clearInterval(_pollingMap[documentId])
          delete _pollingMap[documentId]
        }
      } catch {
        // network hiccup — keep polling
      }
    }, 3000)

    _pollingMap[documentId] = intervalId
  },

  async deleteDocument(documentId) {
    await deleteDocument(documentId)
    get().removeDocument(documentId)
  },
}))

export default useDocumentStore
