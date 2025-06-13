import { api } from './api';
import { Task, TaskHistory, TestResult } from '../types';

export const taskService = {
  async getTasksByProject(projectId: string, status?: string): Promise<Task[]> {
    const params = status ? { status } : {};
    const response = await api.get(`/projects/${projectId}/tasks`, { params });
    return response.data;
  },

  async getTaskById(id: string): Promise<Task> {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  async getSubtasks(parentTaskId: string): Promise<Task[]> {
    const response = await api.get(`/tasks/${parentTaskId}/subtasks`);
    return response.data;
  },

  async createTask(data: {
    project_id: string;
    name: string;
    description?: string;
    priority?: string;
    parent_task_id?: string;
    test_criteria?: string;
    estimated_hours?: number;
  }): Promise<Task> {
    const response = await api.post('/tasks', data);
    return response.data;
  },

  async updateTask(id: string, data: Partial<Task>): Promise<Task> {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },

  async updateTaskStatus(id: string, status: string, notes?: string): Promise<Task> {
    const response = await api.patch(`/tasks/${id}/status`, { status, notes });
    return response.data;
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  async getTaskHistory(taskId: string): Promise<TaskHistory[]> {
    const response = await api.get(`/tasks/${taskId}/history`);
    return response.data;
  },

  async addTestResult(taskId: string, data: {
    test_name: string;
    status: 'passed' | 'failed' | 'skipped';
    output?: string;
    error_message?: string;
  }): Promise<TestResult> {
    const response = await api.post(`/tasks/${taskId}/test-results`, data);
    return response.data;
  },

  async getTestResults(taskId: string): Promise<TestResult[]> {
    const response = await api.get(`/tasks/${taskId}/test-results`);
    return response.data;
  },

  async getNextTask(projectId?: string): Promise<Task | null> {
    const params = projectId ? { projectId } : {};
    const response = await api.get('/next-task', { params });
    return response.data;
  },
};