export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
export type TaskStatus = 'pending' | 'in_progress' | 'blocked' | 'testing' | 'completed' | 'failed';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  metadata?: Record<string, unknown>;
  requirements?: string;
  acceptance_criteria?: string;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
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
  metadata?: Record<string, unknown>;
  implementation_notes?: string;
  test_criteria?: string;
  verification_steps?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  due_date?: string;
  // Dependencies
  depends_on?: string[]; // Array of task IDs this task depends on
  blocked_by?: string[]; // Computed array of blocking task IDs
  blocks?: string[]; // Array of task IDs this task blocks
  // Frontend additions
  subtask_count?: number;
  completed_subtasks?: number;
  // Collaboration
  comments_count?: number;
  last_activity?: string;
  watchers?: string[];
  attachments?: TaskAttachment[];
}

export interface TaskDependency {
  id: string;
  task_id: string;
  depends_on_task_id: string;
  dependency_type: 'blocks' | 'subtask' | 'related';
  created_at: string;
  created_by: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  author: string;
  content: string;
  mentions?: string[];
  created_at: string;
  updated_at?: string;
  parent_comment_id?: string; // For threaded discussions
}

export interface TaskAttachment {
  id: string;
  task_id: string;
  filename: string;
  file_size: number;
  mime_type: string;
  upload_path: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface ActivityEntry {
  id: string;
  project_id: string;
  task_id?: string;
  user: string;
  action: 'created' | 'updated' | 'commented' | 'status_changed' | 'assigned' | 'attached_file' | 'dependency_added';
  details: Record<string, unknown>;
  created_at: string;
}

export interface TaskHistory {
  id: string;
  task_id: string;
  action: string;
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  notes?: string;
  created_at: string;
  created_by: string;
}

export interface TestResult {
  id: string;
  task_id: string;
  test_name: string;
  status: 'passed' | 'failed' | 'skipped';
  output?: string;
  error_message?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
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
    dependencies: {
      total_dependencies: number;
      blocking_tasks: number;
      critical_path_length: number;
    };
    collaboration: {
      total_comments: number;
      active_discussions: number;
      recent_activity_count: number;
    };
  };
}