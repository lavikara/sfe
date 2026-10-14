import { create } from 'zustand'
import type { User } from '@/types/api'
import { getMe } from '@/lib/api/endpoints'

interface UserState {
  user: User | null
  userLoading: boolean
  fetchLoggedInUser: () => Promise<void>
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  userLoading: true,

  fetchLoggedInUser: async () => {
    set({ userLoading: true })
    try {
      const response = await getMe()
      set({ user: response.data })
      set({ userLoading: false })
    } catch (err) {
      console.error('Error fetching logged-in user:', err)
      set({ userLoading: false })
    }
  },
}))
