import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, Building2, Plus, Check } from 'lucide-react';
import { workspaceService } from '../services/workspaceService';
import { useWorkspaceStore } from '../stores/workspaceStore';
import CreateWorkspaceModal from './CreateWorkspaceModal';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  subscription_tier: string;
}

export default function WorkspaceSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();
  
  const { currentWorkspaceId, setCurrentWorkspace } = useWorkspaceStore();

  // Fetch user's workspaces
  const { data: workspaces = [], isLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: workspaceService.getUserWorkspaces,
  });

  // Current workspace
  const currentWorkspace = workspaces.find(w => w.id === currentWorkspaceId) || workspaces[0];

  // Switch workspace mutation
  const switchWorkspaceMutation = useMutation({
    mutationFn: (workspaceId: string) => workspaceService.switchWorkspace(workspaceId),
    onSuccess: (_, workspaceId) => {
      setCurrentWorkspace(workspaceId);
      // Invalidate all queries to refresh data for new workspace
      queryClient.invalidateQueries();
      setIsOpen(false);
    },
  });

  const handleWorkspaceSelect = (workspace: Workspace) => {
    if (workspace.id !== currentWorkspaceId) {
      switchWorkspaceMutation.mutate(workspace.id);
    } else {
      setIsOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <Building2 className="h-5 w-5 text-gray-500" />
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {currentWorkspace?.logo_url ? (
            <img 
              src={currentWorkspace.logo_url} 
              alt={currentWorkspace.name}
              className="h-5 w-5 rounded"
            />
          ) : (
            <Building2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          )}
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {currentWorkspace?.name || 'Select Workspace'}
          </span>
          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">
                Workspaces
              </div>
              
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  onClick={() => handleWorkspaceSelect(workspace)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {workspace.logo_url ? (
                      <img 
                        src={workspace.logo_url} 
                        alt={workspace.name}
                        className="h-8 w-8 rounded"
                      />
                    ) : (
                      <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-gray-500" />
                      </div>
                    )}
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {workspace.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {workspace.subscription_tier}
                      </div>
                    </div>
                  </div>
                  {workspace.id === currentWorkspaceId && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </button>
              ))}

              <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setShowCreateModal(true);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create New Workspace</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateWorkspaceModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={(workspace) => {
            setShowCreateModal(false);
            queryClient.invalidateQueries({ queryKey: ['workspaces'] });
            switchWorkspaceMutation.mutate(workspace.id);
          }}
        />
      )}
    </>
  );
}