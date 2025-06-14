import { create } from 'zustand';

interface AppState {
  selectedProjectId: string | null;
  setSelectedProjectId: (projectId: string | null) => void;
}

export const useStore = create<AppState>((set) => ({
  selectedProjectId: null,
  setSelectedProjectId: (projectId) => set({ selectedProjectId: projectId }),
}));