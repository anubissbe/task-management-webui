import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../services/projectService';
import toast from 'react-hot-toast';

// CreateProject component - Fixed version (December 2024)

export const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    requirements: '',
    acceptance_criteria: '',
  });

  const createProjectMutation = useMutation({
    mutationFn: projectService.createProject,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created successfully!');
      navigate(`/projects/${data.id}`);
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create project';
      toast.error(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Project name is required');
      return;
    }
    createProjectMutation.mutate(formData);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-0">
      <div className="bg-gradient-to-r from-black via-gray-900 to-black rounded-2xl p-8 mb-8 border-2 border-orange-500/50 shadow-2xl shadow-orange-500/20">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-800 rounded-2xl flex items-center justify-center border-2 border-orange-400/50 shadow-xl shadow-orange-500/40 animate-glow">
            <span className="text-white text-3xl">🚀</span>
          </div>
          <div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-white via-orange-200 to-orange-500 bg-clip-text text-transparent animate-fade-in">
              NEW PROJECT
            </h1>
            <p className="text-base font-semibold text-orange-300 uppercase tracking-wider">
              Create MCP-Enhanced Project
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-900 shadow-2xl shadow-orange-500/10 dark:shadow-orange-500/30 ring-2 ring-orange-500/30 dark:ring-orange-500/50 rounded-xl p-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-black text-orange-400 uppercase tracking-wider mb-2">
                Project Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="block w-full rounded-lg border-2 border-orange-500/30 bg-black/50 px-4 py-3 text-white placeholder-gray-500 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/50 sm:text-sm"
                placeholder="Enter project name..."
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-black text-orange-400 uppercase tracking-wider mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="block w-full rounded-lg border-2 border-orange-500/30 bg-black/50 px-4 py-3 text-white placeholder-gray-500 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/50 sm:text-sm"
                placeholder="Describe your project..."
              />
            </div>

            <div>
              <label htmlFor="requirements" className="block text-sm font-black text-orange-400 uppercase tracking-wider mb-2">
                Requirements
              </label>
              <textarea
                id="requirements"
                name="requirements"
                rows={4}
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                className="block w-full rounded-lg border-2 border-orange-500/30 bg-black/50 px-4 py-3 text-white placeholder-gray-500 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/50 sm:text-sm"
                placeholder="List project requirements..."
              />
            </div>

            <div>
              <label htmlFor="acceptance_criteria" className="block text-sm font-black text-orange-400 uppercase tracking-wider mb-2">
                Acceptance Criteria
              </label>
              <textarea
                id="acceptance_criteria"
                name="acceptance_criteria"
                rows={4}
                value={formData.acceptance_criteria}
                onChange={(e) => setFormData({ ...formData, acceptance_criteria: e.target.value })}
                className="block w-full rounded-lg border-2 border-orange-500/30 bg-black/50 px-4 py-3 text-white placeholder-gray-500 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/50 sm:text-sm"
                placeholder="Define acceptance criteria..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center rounded-xl border-2 border-gray-700 bg-gray-900 px-6 py-3 text-base font-bold text-gray-300 shadow-sm hover:bg-gray-800 hover:border-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-500/50 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createProjectMutation.isPending}
            className="inline-flex items-center justify-center rounded-xl border-2 border-orange-500/50 bg-gradient-to-r from-orange-600 to-orange-500 px-8 py-3 text-base font-bold text-white shadow-2xl shadow-orange-500/40 hover:from-orange-500 hover:to-orange-400 hover:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-500/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none uppercase tracking-wider"
          >
            {createProjectMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <span className="text-xl mr-2">✨</span>
                Create Project
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};