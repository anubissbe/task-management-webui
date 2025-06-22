import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { workspaceService } from '../services/workspaceService';

interface WorkspaceState {
  currentWorkspaceId: string | null;
  setCurrentWorkspace: (workspaceId: string) => void;
  clearCurrentWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      currentWorkspaceId: null,
      
      setCurrentWorkspace: (workspaceId: string) => {
        set({ currentWorkspaceId: workspaceId });
        // Store in localStorage for API interceptor
        localStorage.setItem('current_workspace_id', workspaceId);
        // Set the workspace header for all API requests
        workspaceService.setWorkspaceHeader(workspaceId);
      },
      
      clearCurrentWorkspace: () => {
        set({ currentWorkspaceId: null });
        localStorage.removeItem('current_workspace_id');
        workspaceService.clearWorkspaceHeader();
      },
    }),
    {
      name: 'workspace-storage',
    }
  )
);