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
        return 'bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800';
      case 'active':
        return 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300 border border-green-200 dark:border-green-800';
      case 'paused':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200 border border-orange-300 dark:border-orange-700';
      case 'completed':
        return 'bg-orange-100 text-orange-900 dark:bg-orange-950/50 dark:text-orange-200 border border-orange-300 dark:border-orange-800';
      case 'cancelled':
        return 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300 border border-red-200 dark:border-red-800';
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
      <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
        <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center mb-6 border-4 border-orange-500/60 shadow-2xl shadow-red-500/30 animate-pulse">
          <span className="text-white text-4xl">⚠️</span>
        </div>
        <h3 className="text-3xl font-black text-transparent bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text mb-3">
          CONNECTION ERROR
        </h3>
        <p className="text-center text-gray-600 dark:text-gray-400 font-semibold mb-2">
          Unable to connect to ProjectHub-MCP
        </p>
        <p className="text-center text-orange-500 font-bold uppercase tracking-wider text-sm animate-pulse-slow">
          MCP Protocol Unavailable
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-8 px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-black rounded-xl transition-all transform hover:scale-110 shadow-2xl shadow-orange-500/40 uppercase tracking-wider text-lg"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="bg-gradient-to-r from-black via-gray-900 to-black rounded-2xl p-8 mb-8 border-2 border-orange-500/50 shadow-2xl shadow-orange-500/20">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-800 rounded-2xl flex items-center justify-center border-2 border-orange-400/50 shadow-xl shadow-orange-500/40 animate-glow">
                <span className="text-white text-3xl">📁</span>
              </div>
              <div>
                <h1 className="text-5xl font-black bg-gradient-to-r from-white via-orange-200 to-orange-500 bg-clip-text text-transparent animate-fade-in">
                  PROJECTS
                </h1>
                <p className="text-base font-semibold text-orange-300 uppercase tracking-wider">
                  MCP-Enhanced Workspace Management
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 sm:mt-0 sm:ml-16 sm:flex-none">
            <Link
              to="/projects/new"
              className="inline-flex items-center justify-center rounded-xl border-2 border-orange-500/50 bg-gradient-to-r from-orange-600 to-orange-500 px-8 py-4 text-lg font-black text-white shadow-2xl shadow-orange-500/40 hover:from-orange-500 hover:to-orange-400 hover:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-500/50 transition-all duration-300 transform hover:scale-110 uppercase tracking-wider"
            >
              <span className="text-2xl mr-3">➕</span> Create Project
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8 overflow-hidden shadow-2xl shadow-orange-500/10 dark:shadow-orange-500/30 ring-2 ring-orange-500/30 dark:ring-orange-500/50 md:rounded-xl overflow-x-auto dark:bg-gradient-to-br dark:from-black dark:via-orange-950/10 dark:to-black">
        <table className="min-w-full divide-y divide-orange-500/20">
          <thead className="bg-gradient-to-r from-orange-50 via-orange-100 to-orange-50 dark:from-black dark:via-orange-950/20 dark:to-black">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider w-1/2">
                Project Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider w-24">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider w-32">
                Created
              </th>
              <th className="relative px-6 py-4 w-32 text-sm font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gradient-to-b dark:from-black dark:via-orange-950/5 dark:to-black divide-y divide-gray-200 dark:divide-orange-500/20">
            {projects?.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-32 bg-gradient-to-br from-black via-gray-900 to-black rounded-2xl flex items-center justify-center mb-8 border-4 border-orange-500/50 shadow-2xl shadow-orange-500/30 animate-pulse-slow">
                      <span className="text-orange-500 text-6xl">📂</span>
                    </div>
                    <h3 className="text-3xl font-black bg-gradient-to-r from-gray-600 to-orange-600 bg-clip-text text-transparent mb-4">NO PROJECTS YET</h3>
                    <p className="text-gray-500 dark:text-gray-400 font-semibold mb-6 text-lg">Launch your first MCP-enhanced project</p>
                    <Link
                      to="/projects/new"
                      className="inline-flex items-center px-8 py-4 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 text-white font-black text-lg hover:from-orange-500 hover:to-orange-400 transition-all duration-300 transform hover:scale-110 shadow-2xl shadow-orange-500/40 uppercase tracking-wider"
                    >
                      <span className="text-2xl mr-3">➕</span> Create First Project
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              projects?.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-orange-500/10 transition-colors duration-200">
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
                      <div className="text-sm text-gray-500 dark:text-gray-300">
                        {project.description.length > 100 
                          ? `${project.description.slice(0, 100)}...` 
                          : project.description}
                      </div>
                    )}
                    {projectStats[project.id] && (
                      <div className="mt-1 text-xs text-gray-500 dark:text-orange-400/70">
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
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