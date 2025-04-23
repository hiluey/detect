import { create } from 'zustand';

export type State = {
  user: {
    id: string;
    email: string;
    username: string;
    auth_user_id: string;
  } | null;
  setUser: (user: State['user']) => void;
};

export const useStore = create<State>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
