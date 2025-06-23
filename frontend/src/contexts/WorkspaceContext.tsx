import React, { createContext } from 'react';

interface WorkspaceContextType {
  workspaceId: string;
}

export const WorkspaceContext = createContext<WorkspaceContextType>({
  workspaceId: 'default-workspace'
});

export const WorkspaceProvider: React.FC<{ children: React.ReactNode; workspaceId?: string }> = ({ 
  children, 
  workspaceId = 'default-workspace' 
}) => {
  return (
    <WorkspaceContext.Provider value={{ workspaceId }}>
      {children}
    </WorkspaceContext.Provider>
  );
};