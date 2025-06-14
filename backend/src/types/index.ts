export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
export type TaskStatus = 'pending' | 'in_progress' | 'blocked' | 'testing' | 'completed' | 'failed';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  metadata?: Record<string, any>;
  requirements?: string;
  acceptance_criteria?: string;
  created_at: Date;
  updated_at: Date;
  started_at?: Date;
  completed_at?: Date;
}

export interface Task {
  id: string;
  project_id: string;
  parent_task_id?: string;
  name: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  order_index: number;
  estimated_hours?: number;
  actual_hours?: number;
  metadata?: Record<string, any>;
  implementation_notes?: string;
  test_criteria?: string;
  verification_steps?: string;
  assigned_to?: string;
  created_at: Date;
  updated_at: Date;
  started_at?: Date;
  completed_at?: Date;
}

export interface TaskHistory {
  id: string;
  task_id: string;
  action: string;
  old_value?: Record<string, any>;
  new_value?: Record<string, any>;
  notes?: string;
  created_at: Date;
  created_by: string;
}

export interface TestResult {
  id: string;
  task_id: string;
  test_name: string;
  status: 'passed' | 'failed' | 'skipped';
  output?: string;
  error_message?: string;
  metadata?: Record<string, any>;
  created_at: Date;
}

export interface ProjectStats {
  project: Project;
  statistics: {
    completion_rate: string;
    task_breakdown: {
      total: number;
      completed: number;
      in_progress: number;
      blocked: number;
      pending: number;
    };
    test_results: {
      total: number;
      passed: number;
      failed: number;
      pass_rate: string;
    };
    time_tracking: {
      avg_estimated_hours: number;
      avg_actual_hours: number;
    };
  };
}