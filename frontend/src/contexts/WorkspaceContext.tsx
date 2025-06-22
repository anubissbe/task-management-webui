import React, { createContext, useContext } from 'react';

interface WorkspaceContextType {
  workspaceId: string;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  workspaceId: 'default-workspace'
});

export const useWorkspace = () => {
  return useContext(WorkspaceContext);
};

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