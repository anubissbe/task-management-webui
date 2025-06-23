import { createContext } from 'react';

export interface WorkspaceContextType {
  workspaceId: string;
}

export const WorkspaceContext = createContext<WorkspaceContextType>({
  workspaceId: 'default-workspace'
});