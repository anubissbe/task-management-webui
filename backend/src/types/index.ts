export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
export type TaskStatus = 'pending' | 'in_progress' | 'blocked' | 'testing' | 'completed' | 'failed';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type WorkspaceRole = 'owner' | 'admin' | 'member';
export type SubscriptionTier = 'free' | 'starter' | 'professional' | 'enterprise';
export type UserRole = 'admin' | 'manager' | 'developer' | 'viewer';

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  workspace_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  owner_id: string;
  settings: {
    features: {
      team_management: boolean;
      advanced_reporting: boolean;
      webhooks: boolean;
      custom_fields: boolean;
    };
    limits: {
      max_projects: number;
      max_users: number;
      max_storage_gb: number;
    };
  };
  subscription_tier: SubscriptionTier;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  joined_at: Date;
  invited_by?: string;
}

export interface WorkspaceInvitation {
  id: string;
  workspace_id: string;
  email: string;
  role: Exclude<WorkspaceRole, 'owner'>;
  invited_by: string;
  token: string;
  expires_at: Date;
  accepted_at?: Date;
  created_at: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  workspace_id: string;
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

export type WebhookEvent = 
  | 'task.created' 
  | 'task.updated' 
  | 'task.completed' 
  | 'task.deleted'
  | 'project.created'
  | 'project.updated'
  | 'project.completed'
  | 'project.deleted';

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  secret?: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
  last_triggered_at?: Date;
  failure_count: number;
  max_retries: number;
  retry_delay: number;
  headers?: Record<string, string>;
  project_id?: string; // Optional: webhook can be project-specific
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event: WebhookEvent;
  payload: Record<string, any>;
  response_status?: number;
  response_body?: string;
  error_message?: string;
  retry_count: number;
  delivered_at?: Date;
  created_at: Date;
}

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: Task | Project;
  previous_data?: Partial<Task | Project>;
  webhook: {
    id: string;
    name: string;
  };
}