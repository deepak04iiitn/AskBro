import { create } from 'zustand'
import {
  getGitHubStatus,
  listImportedRepos,
  getRepoStatus,
  removeRepo,
  syncRepo,
} from '@/lib/githubApi'

const _pollingMap = {}

const useGitHubStore = create((set, get) => ({
  status: null,          // GitHubStatusResponse | null
  repos: [],             // RepoStatusResponse[]
  loading: false,
  error: null,

  async fetchStatus() {
    try {
      const s = await getGitHubStatus()
      set({ status: s })
      return s
    } catch {
      return null
    }
  },

  async fetchRepos() {
    set({ loading: true, error: null })
    try {
      const repos = await listImportedRepos()
      set({ repos })
    } catch (err) {
      set({ error: err.message })
    } finally {
      set({ loading: false })
    }
  },

  setStatus(s) {
    set({ status: s })
  },

  addRepo(repo) {
    set((state) => ({ repos: [repo, ...state.repos] }))
  },

  updateRepo(repoId, patch) {
    set((state) => ({
      repos: state.repos.map((r) => r.repo_id === repoId ? { ...r, ...patch } : r),
    }))
  },

  async removeRepo(repoId) {
    if (_pollingMap[repoId]) {
      clearInterval(_pollingMap[repoId])
      delete _pollingMap[repoId]
    }
    await removeRepo(repoId)
    set((state) => ({ repos: state.repos.filter((r) => r.repo_id !== repoId) }))
  },

  async syncRepo(repoId, forceFull = false) {
    await syncRepo(repoId, forceFull)
    get().updateRepo(repoId, { status: 'pending' })
    get().startPolling(repoId)
  },

  startPolling(repoId) {
    if (_pollingMap[repoId]) return

    const id = setInterval(async () => {
      try {
        const updated = await getRepoStatus(repoId)
        get().updateRepo(repoId, updated)
        if (updated.status === 'ready' || updated.status === 'failed') {
          clearInterval(_pollingMap[repoId])
          delete _pollingMap[repoId]
        }
      } catch {
        // network blip — keep polling
      }
    }, 4000)

    _pollingMap[repoId] = id
  },
}))

export default useGitHubStore
