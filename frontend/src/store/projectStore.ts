import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Project, Task } from '../types';

interface ProjectState {
  // Current project
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;

  // Tasks for current project
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;

  // Filter state
  filters: {
    search: string;
    status: string | null;
    priority: string | null;
    assignee: string | null;
    dateRange: { start: Date | null; end: Date | null };
  };
  setFilter: (key: keyof ProjectState['filters'], value: any) => void;
  resetFilters: () => void;

  // View preferences
  viewMode: 'board' | 'list' | 'calendar' | 'timeline';
  setViewMode: (mode: ProjectState['viewMode']) => void;
  
  // Sorting preferences
  sortBy: 'created_at' | 'updated_at' | 'priority' | 'status' | 'name';
  sortOrder: 'asc' | 'desc';
  setSort: (by: ProjectState['sortBy'], order: ProjectState['sortOrder']) => void;

  // Selected tasks for bulk operations
  selectedTasks: string[];
  toggleTaskSelection: (taskId: string) => void;
  selectAllTasks: () => void;
  clearSelection: () => void;

  // UI state
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  editingTask: Task | null;
  setCreateModalOpen: (open: boolean) => void;
  setEditModalOpen: (open: boolean, task?: Task) => void;
}

const initialFilters = {
  search: '',
  status: null,
  priority: null,
  assignee: null,
  dateRange: { start: null, end: null },
};

export const useProjectStore = create<ProjectState>()(
  devtools(
    persist(
      (set, get) => ({
        // Current project
        currentProject: null,
        setCurrentProject: (project) => set({ currentProject: project }),

        // Tasks
        tasks: [],
        setTasks: (tasks) => set({ tasks }),
        addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
        updateTask: (taskId, updates) =>
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === taskId ? { ...task, ...updates } : task
            ),
          })),
        deleteTask: (taskId) =>
          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== taskId),
          })),

        // Filters
        filters: initialFilters,
        setFilter: (key, value) =>
          set((state) => ({
            filters: { ...state.filters, [key]: value },
          })),
        resetFilters: () => set({ filters: initialFilters }),

        // View preferences
        viewMode: 'board',
        setViewMode: (mode) => set({ viewMode: mode }),

        // Sorting
        sortBy: 'created_at',
        sortOrder: 'desc',
        setSort: (by, order) => set({ sortBy: by, sortOrder: order }),

        // Selection
        selectedTasks: [],
        toggleTaskSelection: (taskId) =>
          set((state) => ({
            selectedTasks: state.selectedTasks.includes(taskId)
              ? state.selectedTasks.filter((id) => id !== taskId)
              : [...state.selectedTasks, taskId],
          })),
        selectAllTasks: () =>
          set((state) => ({
            selectedTasks: state.tasks.map((task) => task.id),
          })),
        clearSelection: () => set({ selectedTasks: [] }),

        // UI state
        isCreateModalOpen: false,
        isEditModalOpen: false,
        editingTask: null,
        setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
        setEditModalOpen: (open, task) =>
          set({
            isEditModalOpen: open,
            editingTask: task || null,
          }),
      }),
      {
        name: 'project-store',
        partialize: (state) => ({
          viewMode: state.viewMode,
          sortBy: state.sortBy,
          sortOrder: state.sortOrder,
        }),
      }
    )
  )
);

// Computed selectors
export const useFilteredTasks = () => {
  const { tasks, filters, sortBy, sortOrder } = useProjectStore();

  let filtered = [...tasks];

  // Apply search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (task) =>
        task.name.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower)
    );
  }

  // Apply status filter
  if (filters.status) {
    filtered = filtered.filter((task) => task.status === filters.status);
  }

  // Apply priority filter
  if (filters.priority) {
    filtered = filtered.filter((task) => task.priority === filters.priority);
  }

  // Apply date range filter
  if (filters.dateRange.start || filters.dateRange.end) {
    filtered = filtered.filter((task) => {
      const taskDate = new Date(task.created_at);
      if (filters.dateRange.start && taskDate < filters.dateRange.start) return false;
      if (filters.dateRange.end && taskDate > filters.dateRange.end) return false;
      return true;
    });
  }

  // Apply sorting
  filtered.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'created_at':
      case 'updated_at':
        comparison = new Date(a[sortBy]).getTime() - new Date(b[sortBy]).getTime();
        break;
      case 'priority':
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        comparison = (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return filtered;
};

// Task statistics selector
export const useTaskStatistics = () => {
  const tasks = useProjectStore((state) => state.tasks);

  const stats = {
    total: tasks.length,
    byStatus: {
      pending: tasks.filter((t) => t.status === 'pending').length,
      in_progress: tasks.filter((t) => t.status === 'in_progress').length,
      blocked: tasks.filter((t) => t.status === 'blocked').length,
      testing: tasks.filter((t) => t.status === 'testing').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      failed: tasks.filter((t) => t.status === 'failed').length,
    },
    byPriority: {
      critical: tasks.filter((t) => t.priority === 'critical').length,
      high: tasks.filter((t) => t.priority === 'high').length,
      medium: tasks.filter((t) => t.priority === 'medium').length,
      low: tasks.filter((t) => t.priority === 'low').length,
    },
    completionRate: tasks.length > 0
      ? Math.round((tasks.filter((t) => t.status === 'completed').length / tasks.length) * 100)
      : 0,
  };

  return stats;
};