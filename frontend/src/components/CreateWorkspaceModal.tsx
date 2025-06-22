import React, { useState } from 'react';
import { X, Building2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { workspaceService } from '../services/workspaceService';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (workspace: { id: string; name: string; description?: string }) => void;
}

export default function CreateWorkspaceModal({ isOpen, onClose, onSuccess }: CreateWorkspaceModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createWorkspaceMutation = useMutation({
    mutationFn: workspaceService.createWorkspace,
    onSuccess: (workspace) => {
      onSuccess(workspace);
      setFormData({ name: '', description: '' });
      setErrors({});
    },
    onError: (error: unknown) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { details?: Array<{ path: string[]; message: string }> } } };
        if (apiError.response?.data?.details) {
          const validationErrors: Record<string, string> = {};
          apiError.response.data.details.forEach((detail) => {
            validationErrors[detail.path[0]] = detail.message;
          });
          setErrors(validationErrors);
        } else {
          setErrors({ general: 'Failed to create workspace' });
        }
      } else {
        setErrors({ general: 'Failed to create workspace' });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!formData.name.trim()) {
      setErrors({ name: 'Workspace name is required' });
      return;
    }

    createWorkspaceMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Building2 className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Create New Workspace</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.general && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
              {errors.general}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Workspace Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
                errors.name ? 'border-red-500' : ''
              }`}
              placeholder="My Workspace"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
              rows={3}
              placeholder="Describe your workspace..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={createWorkspaceMutation.isPending}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createWorkspaceMutation.isPending ? 'Creating...' : 'Create Workspace'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}