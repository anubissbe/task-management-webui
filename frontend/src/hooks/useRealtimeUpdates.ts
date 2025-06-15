import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { useProjectStore } from '../store/projectStore';
import toast from 'react-hot-toast';
import { Task } from '../types';

let socket: Socket | null = null;

export const useRealtimeUpdates = (projectId?: string) => {
  const queryClient = useQueryClient();
  const { currentProject, updateTask, addTask, deleteTask } = useProjectStore();

  useEffect(() => {
    // Initialize socket connection
    if (!socket) {
      const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3001';
      socket = io(wsUrl, {
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        console.log('WebSocket connected');
      });

      socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
      });

      socket.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    }

    // Join project room if projectId is provided
    if (projectId && socket) {
      socket.emit('join-project', projectId);

      // Task events
      socket.on('task-created', (task) => {
        addTask(task);
        queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
        toast.success(`New task created: ${task.name}`, {
          icon: '📋',
          duration: 3000,
        });
      });

      socket.on('task-updated', (task) => {
        updateTask(task.id, task);
        queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
        
        // Only show toast for status changes
        const currentTask = useProjectStore.getState().tasks.find(t => t.id === task.id);
        if (currentTask && currentTask.status !== task.status) {
          toast.success(`Task "${task.name}" status changed to ${task.status}`, {
            icon: '🔄',
            duration: 3000,
          });
        }
      });

      socket.on('task-deleted', (taskId) => {
        deleteTask(taskId);
        queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
        toast.success('Task deleted', {
          icon: '🗑️',
          duration: 3000,
        });
      });

      // Project events
      socket.on('project-updated', (project) => {
        if (currentProject?.id === project.id) {
          useProjectStore.getState().setCurrentProject(project);
          queryClient.invalidateQueries({ queryKey: ['project', project.id] });
          toast.success('Project updated', {
            icon: '📝',
            duration: 3000,
          });
        }
      });

      // User activity events
      socket.on('user-joined', (data) => {
        toast(`${data.userName} joined the project`, {
          icon: '👋',
          duration: 2000,
        });
      });

      socket.on('user-left', (data) => {
        toast(`${data.userName} left the project`, {
          icon: '👋',
          duration: 2000,
        });
      });

      // Collaboration events
      socket.on('task-assigned', (data) => {
        toast(`${data.userName} was assigned to "${data.taskName}"`, {
          icon: '👤',
          duration: 3000,
        });
      });

      socket.on('comment-added', (data) => {
        toast(`${data.userName} commented on "${data.taskName}"`, {
          icon: '💬',
          duration: 3000,
        });
      });
    }

    // Cleanup
    return () => {
      if (projectId && socket) {
        socket.emit('leave-project', projectId);
        socket.off('task-created');
        socket.off('task-updated');
        socket.off('task-deleted');
        socket.off('project-updated');
        socket.off('user-joined');
        socket.off('user-left');
        socket.off('task-assigned');
        socket.off('comment-added');
      }
    };
  }, [projectId, queryClient, currentProject, updateTask, addTask, deleteTask]);

  // Emit events
  const emitTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    if (socket && projectId) {
      socket.emit('update-task', { projectId, taskId, updates });
    }
  };

  const emitTaskCreate = (task: Task) => {
    if (socket && projectId) {
      socket.emit('create-task', { projectId, task });
    }
  };

  const emitTaskDelete = (taskId: string) => {
    if (socket && projectId) {
      socket.emit('delete-task', { projectId, taskId });
    }
  };

  const emitUserActivity = (activity: string, data?: Record<string, unknown>) => {
    if (socket && projectId) {
      socket.emit('user-activity', { projectId, activity, ...data });
    }
  };

  return {
    emitTaskUpdate,
    emitTaskCreate,
    emitTaskDelete,
    emitUserActivity,
    isConnected: socket?.connected || false,
  };
};