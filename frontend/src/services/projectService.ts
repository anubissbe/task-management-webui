import { api } from './api';
import { Project, ProjectStats } from '../types';

export const projectService = {
  async getAllProjects(): Promise<Project[]> {
    const response = await api.get('/projects');
    return response.data;
  },

  async getProjectById(id: string): Promise<Project> {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  async createProject(data: {
    name: string;
    description?: string;
    requirements?: string;
    acceptance_criteria?: string;
  }): Promise<Project> {
    const response = await api.post('/projects', data);
    return response.data;
  },

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },

  async deleteProject(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  },

  async getProjectStats(id: string): Promise<ProjectStats> {
    const response = await api.get(`/projects/${id}/stats`);
    return response.data;
  },
};