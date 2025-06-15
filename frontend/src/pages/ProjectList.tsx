import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { Project, ProjectStats } from '../types';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { format } from 'date-fns';

export const ProjectList: React.FC = () => {
  const queryClient = useQueryClient();
  const [projectStats, setProjectStats] = useState<Record<string, ProjectStats>>({});

  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getAllProjects,
  });

  // Fetch stats for all projects
  useEffect(() => {
    if (projects) {
      projects.forEach(project => {
        projectService.getProjectStats(project.id)
          .then(stats => {
            setProjectStats(prev => ({ ...prev, [project.id]: stats }));
          })
          .catch(() => {
            // Silently fail if stats can't be loaded
          });
      });
    }
  }, [projects]);

  const deleteProjectMutation = useMutation({
    mutationFn: projectService.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete project');
    },
  });

  const completeProjectMutation = useMutation({
    mutationFn: (projectId: string) => 
      projectService.updateProject(projectId, { 
        status: 'completed', 
        completed_at: new Date().toISOString() 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project marked as completed');
    },
    onError: () => {
      toast.error('Failed to complete project');
    },
  });

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'planning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'paused':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const canCompleteProject = (project: Project): boolean => {
    if (project.status !== 'active') return false;
    const stats = projectStats[project.id];
    if (!stats) return false;
    return stats.statistics.completion_rate === '100.0%';
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-orange-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black px-2 py-1 rounded flex items-center space-x-1">
              <span className="text-white font-bold text-xs">P</span>
              <span className="text-orange-500 font-bold text-xs">h</span>
            </div>
          </div>
        </div>
        <p className="mt-4 text-orange-600 dark:text-orange-400 font-medium">Loading ProjectHub-Mcp...</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Initializing MCP workspace</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg flex items-center justify-center mb-4 border-2 border-orange-500/50">
          <span className="text-white font-bold text-2xl">⚠️</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Unable to load projects
        </h3>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-2">
          There was an issue connecting to ProjectHub-Mcp
        </p>
        <p className="text-center text-orange-500 dark:text-orange-400 text-sm">
          MCP server may be unavailable
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="bg-gradient-to-r from-black/5 to-orange-500/10 dark:from-black/20 dark:to-orange-500/20 rounded-lg p-6 mb-6 border border-orange-500/20">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-black to-gray-700 rounded-lg flex items-center justify-center border border-orange-500/30">
                <span className="text-orange-500 font-bold text-lg">📁</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-orange-600 dark:from-white dark:to-orange-400 bg-clip-text text-transparent">
                  Projects
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Manage your projects in the MCP-enhanced workspace
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Link
              to="/projects/new"
              className="inline-flex items-center justify-center rounded-lg border border-orange-500/30 bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg hover:from-orange-700 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
            >
              ➕ Add Project
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 dark:ring-gray-700 md:rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/2">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">
                Created
              </th>
              <th className="relative px-6 py-3 w-32">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {projects?.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-black to-gray-700 rounded-xl flex items-center justify-center mb-6 border border-orange-500/30">
                      <span className="text-orange-500 text-3xl">📂</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No projects yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Get started by creating your first MCP-enhanced project</p>
                    <Link
                      to="/projects/new"
                      className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold hover:from-orange-700 hover:to-orange-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      ➕ Create First Project
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              projects?.map((project) => (
              <tr key={project.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      <Link
                        to={`/projects/${project.id}`}
                        className="hover:text-primary-600 dark:hover:text-primary-400"
                      >
                        {project.name}
                      </Link>
                    </div>
                    {project.description && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {project.description.length > 100 
                          ? `${project.description.slice(0, 100)}...` 
                          : project.description}
                      </div>
                    )}
                    {projectStats[project.id] && (
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {projectStats[project.id].statistics.task_breakdown.total > 0 ? (
                          <>
                            <span className="font-medium">
                              {projectStats[project.id].statistics.completion_rate}
                            </span>
                            {' complete '}
                            ({projectStats[project.id].statistics.task_breakdown.completed}/{projectStats[project.id].statistics.task_breakdown.total} tasks)
                          </>
                        ) : (
                          'No tasks yet'
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={clsx(
                      'inline-flex rounded-full px-2 text-xs font-semibold leading-5',
                      getStatusColor(project.status)
                    )}
                  >
                    {project.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {format(new Date(project.created_at), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      to={`/projects/${project.id}`}
                      className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold text-orange-600 hover:text-white hover:bg-orange-600 border border-orange-500/30 hover:border-orange-600 transition-all duration-200 transform hover:scale-105"
                    >
                      👁️ View
                    </Link>
                    {canCompleteProject(project) && (
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to mark "${project.name}" as completed? This action cannot be undone.`)) {
                            completeProjectMutation.mutate(project.id);
                          }
                        }}
                        disabled={completeProjectMutation.isPending}
                        className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold text-green-600 hover:text-white hover:bg-green-600 border border-green-500/30 hover:border-green-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {completeProjectMutation.isPending ? '⏳ Completing...' : '✅ Complete'}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
                          deleteProjectMutation.mutate(project.id);
                        }
                      }}
                      disabled={deleteProjectMutation.isPending}
                      className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold text-red-600 hover:text-white hover:bg-red-600 border border-red-500/30 hover:border-red-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {deleteProjectMutation.isPending ? '⏳ Deleting...' : '🗑️ Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>
    </div>
  );
};