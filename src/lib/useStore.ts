import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type State = {
  user: {
    id: string
    email: string
    username: string
    auth_user_id: string
  } | null
  setUser: (user: State['user']) => void
}

export const useStore = create<State>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    {
      name: 'user-storage', 
    }
  )
)
