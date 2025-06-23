import { useContext } from 'react';
import { WorkspaceContext } from '../contexts/WorkspaceContext';

export const useWorkspace = () => {
  return useContext(WorkspaceContext);
};