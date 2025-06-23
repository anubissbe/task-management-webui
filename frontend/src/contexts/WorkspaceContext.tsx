import React from 'react';
import { WorkspaceContext } from './WorkspaceContext';

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