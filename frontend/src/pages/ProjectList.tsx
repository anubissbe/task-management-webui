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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 dark:text-red-400 py-8">
        Failed to load projects
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Projects
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            A list of all projects in your workspace
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/projects/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
          >
            Add project
          </Link>
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
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-gray-900 dark:text-gray-300 font-medium mb-1">No projects yet</p>
                    <p className="text-gray-500 dark:text-gray-400">Get started by creating your first project</p>
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
                      className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                    >
                      View
                    </Link>
                    {canCompleteProject(project) && (
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to mark "${project.name}" as completed? This action cannot be undone.`)) {
                            completeProjectMutation.mutate(project.id);
                          }
                        }}
                        disabled={completeProjectMutation.isPending}
                        className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {completeProjectMutation.isPending ? 'Completing...' : 'Complete'}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
                          deleteProjectMutation.mutate(project.id);
                        }
                      }}
                      disabled={deleteProjectMutation.isPending}
                      className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleteProjectMutation.isPending ? 'Deleting...' : 'Delete'}
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