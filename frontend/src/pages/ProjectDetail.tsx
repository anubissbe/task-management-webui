import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { useProjectStore, useFilteredTasks, useTaskStatistics } from '../store/projectStore';
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';
// import { TaskFilters } from '../components/TaskFilters';
// import { BulkTaskActions } from '../components/BulkTaskActions';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { EditTaskModal } from '../components/EditTaskModal';
import { ExportTasks } from '../components/ExportTasks';
import { DraggableTaskList } from '../components/SimpleDraggableTaskList';
// import { format } from 'date-fns';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { Task, TaskStatus } from '../types';
import { CalendarView } from '../components/CalendarView';
import { TimelineView } from '../components/TimelineView';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    setCurrentProject,
    setTasks,
    viewMode,
    setViewMode,
    selectedTasks,
    toggleTaskSelection,
    isCreateModalOpen,
    setCreateModalOpen,
    isEditModalOpen,
    setEditModalOpen,
    editingTask,
  } = useProjectStore();

  const filteredTasks = useFilteredTasks();
  const stats = useTaskStatistics();
  const { emitTaskUpdate, isConnected } = useRealtimeUpdates(id);

  // Fetch project details
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getProjectById(id!),
    enabled: !!id,
  });

  // Fetch tasks
  const { data: tasks, isLoading: tasksLoading, refetch: refetchTasks } = useQuery({
    queryKey: ['tasks', id],
    queryFn: () => taskService.getTasksByProject(id!),
    enabled: !!id,
  });

  // Update store when data changes
  useEffect(() => {
    if (project) setCurrentProject(project);
    if (tasks) setTasks(tasks);
  }, [project, tasks, setCurrentProject, setTasks]);

  // Update task status mutation
  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      taskService.updateTaskStatus(taskId, status),
    onSuccess: (_data, variables) => {
      refetchTasks();
      toast.success('Task status updated');
      // Emit real-time update
      emitTaskUpdate(variables.taskId, { status: variables.status });
    },
    onError: () => {
      toast.error('Failed to update task status');
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: taskService.deleteTask,
    onSuccess: () => {
      refetchTasks();
      toast.success('Task deleted');
      setEditModalOpen(false);
    },
    onError: () => {
      toast.error('Failed to delete task');
    },
  });

  const handleTaskClick = (task: Task) => {
    setEditModalOpen(true, task);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate(taskId);
    }
  };


  // const getStatusIcon = (status: TaskStatus) => {
  //   switch (status) {
  //     case 'completed':
  //       return '✓';
  //     case 'in_progress':
  //       return '→';
  //     case 'blocked':
  //       return '✗';
  //     case 'testing':
  //       return '🧪';
  //     case 'failed':
  //       return '!';
  //     default:
  //       return '○';
  //   }
  // };

  if (projectLoading || tasksLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Project not found</p>
        <Link to="/" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
          Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <nav className="flex items-center text-sm mb-2">
              <Link to="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                Projects
              </Link>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-900 dark:text-white">{project.name}</span>
            </nav>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
            {project.description && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{project.description}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {isConnected && (
              <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full mr-1 animate-pulse"></div>
                Live
              </div>
            )}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <div className="font-medium">{stats.total} tasks</div>
              <div>{stats.completionRate}% complete</div>
            </div>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Task
            </button>
          </div>
        </div>
      </div>

      {/* View mode toggle */}
      <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('board')}
              className={clsx(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                viewMode === 'board'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={clsx(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={clsx(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              Calendar
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={clsx(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                viewMode === 'timeline'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              Timeline
            </button>
          </div>
          <div className="flex items-center gap-3">
            <ExportTasks />
            {/* <TaskFilters /> */}
          </div>
        </div>
      </div>

      {/* Bulk actions */}
      {/* {selectedTasks.length > 0 && <BulkTaskActions />} */}

      {/* Task list */}
      <div className="flex-1">
        {viewMode === 'board' && (
          <div className="p-6">
            <Link to={`/projects/${id}/board`} className="text-primary-600 hover:text-primary-700 inline-flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Open Kanban Board
            </Link>
          </div>
        )}

        {viewMode === 'list' && (
          <div className="px-6 py-4">
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
              <DraggableTaskList
                tasks={filteredTasks}
                onTaskClick={handleTaskClick}
                onStatusChange={(taskId, status) => {
                  updateTaskStatusMutation.mutate({ taskId, status });
                }}
                onDeleteTask={handleDeleteTask}
                selectedTasks={selectedTasks}
                onToggleSelection={toggleTaskSelection}
              />
            </div>
          </div>
        )}

        {viewMode === 'calendar' && (
          <div className="p-6">
            <CalendarView 
              tasks={filteredTasks} 
              onTaskClick={handleTaskClick}
            />
          </div>
        )}

        {viewMode === 'timeline' && (
          <div className="p-6">
            <TimelineView 
              tasks={filteredTasks} 
              onTaskClick={handleTaskClick}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateTaskModal
          projectId={id!}
          onClose={() => {
            refetchTasks();
            setCreateModalOpen(false);
          }}
          onTaskCreated={() => {
            refetchTasks();
            setCreateModalOpen(false);
          }}
        />
      )}

      {isEditModalOpen && editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={() => {
            refetchTasks();
            setEditModalOpen(false);
          }}
          onTaskUpdated={() => {
            refetchTasks();
            setEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
};