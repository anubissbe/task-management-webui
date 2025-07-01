import * as cron from 'node-cron';
import { emailService, NotificationData, DigestData, NotificationPreferences } from './emailService';
import { User, Task, Project, Workspace } from '../types';
import { DatabaseService } from '../config/database';

export interface NotificationTrigger {
  id: string;
  type: 'task_assignment' | 'due_date_reminder' | 'project_update' | 'daily_digest' | 'weekly_digest';
  userId: string;
  workspaceId: string;
  triggerData: Record<string, any>;
  scheduledAt?: Date;
  isProcessed: boolean;
  createdAt: Date;
}

export interface NotificationRule {
  id: string;
  userId: string;
  workspaceId: string;
  type: string;
  conditions: Record<string, any>;
  isEnabled: boolean;
  preferences: NotificationPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export class NotificationService {
  private db: DatabaseService;
  private cronJobs: Map<string, cron.ScheduledTask> = new Map();

  constructor() {
    this.db = new DatabaseService();
    this.initializeService();
  }

  private async initializeService() {
    try {
      await this.createNotificationTables();
      this.setupCronJobs();
      console.log('Notification service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  private async createNotificationTables() {
    // Create notification triggers table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS notification_triggers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(50) NOT NULL,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
        trigger_data JSONB NOT NULL DEFAULT '{}',
        scheduled_at TIMESTAMP,
        is_processed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        INDEX idx_notification_triggers_user_workspace (user_id, workspace_id),
        INDEX idx_notification_triggers_scheduled (scheduled_at, is_processed)
      );
    `);

    // Create notification preferences table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS notification_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
        task_assignment BOOLEAN DEFAULT true,
        task_due_date BOOLEAN DEFAULT true,
        project_updates BOOLEAN DEFAULT true,
        daily_digest BOOLEAN DEFAULT false,
        weekly_digest BOOLEAN DEFAULT true,
        email_enabled BOOLEAN DEFAULT true,
        digest_time VARCHAR(5) DEFAULT '08:00',
        digest_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5],
        timezone VARCHAR(50) DEFAULT 'UTC',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, workspace_id)
      );
    `);

    // Create notification log table for tracking sent notifications
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS notification_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        email_sent BOOLEAN DEFAULT false,
        error_message TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        sent_at TIMESTAMP,
        INDEX idx_notification_log_user_type (user_id, type),
        INDEX idx_notification_log_created (created_at)
      );
    `);

    // Create unsubscribe tokens table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS unsubscribe_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        notification_type VARCHAR(50) NOT NULL,
        token VARCHAR(255) UNIQUE NOT NULL,
        is_used BOOLEAN DEFAULT false,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        used_at TIMESTAMP,
        INDEX idx_unsubscribe_tokens_token (token),
        INDEX idx_unsubscribe_tokens_user (user_id, notification_type)
      );
    `);
  }

  private setupCronJobs() {
    // Daily digest job - runs every day at different times based on user preferences
    const dailyDigestJob = cron.schedule('0 * * * *', async () => { // Every hour
      await this.processDailyDigests();
    });

    // Weekly digest job - runs every Monday at different times based on user preferences
    const weeklyDigestJob = cron.schedule('0 * * * 1', async () => { // Every hour on Monday
      await this.processWeeklyDigests();
    });

    // Due date reminder job - runs every hour
    const dueDateReminderJob = cron.schedule('0 * * * *', async () => {
      await this.processDueDateReminders();
    });

    // Process pending notifications - runs every 5 minutes
    const pendingNotificationsJob = cron.schedule('*/5 * * * *', async () => {
      await this.processPendingNotifications();
    });

    this.cronJobs.set('dailyDigest', dailyDigestJob);
    this.cronJobs.set('weeklyDigest', weeklyDigestJob);
    this.cronJobs.set('dueDateReminder', dueDateReminderJob);
    this.cronJobs.set('pendingNotifications', pendingNotificationsJob);

    // Start all cron jobs
    this.cronJobs.forEach(job => job.start());
    console.log('Notification cron jobs started'): Promise<NotificationPreferences> {
    const result = await this.db.query(
      'SELECT * FROM notification_preferences WHERE user_id = $1 AND workspace_id = $2',
      [userId, workspaceId]
    );

    if (result.rows.length === 0) {
      // Return default preferences
      return {
        taskAssignment: true,
        taskDueDate: true,
        projectUpdates: true,
        dailyDigest: false,
        weeklyDigest: true,
        emailEnabled: true,
        digestTime: '08:00',
        digestDays: [1, 2, 3, 4, 5], // weekdays
        timezone: 'UTC'
      };
    }

    const prefs = result.rows[0];
    return {
      taskAssignment: prefs.task_assignment,
      taskDueDate: prefs.task_due_date,
      projectUpdates: prefs.project_updates,
      dailyDigest: prefs.daily_digest,
      weeklyDigest: prefs.weekly_digest,
      emailEnabled: prefs.email_enabled,
      digestTime: prefs.digest_time,
      digestDays: prefs.digest_days,
      timezone: prefs.timezone
    };
  }

  // Update user notification preferences
  public async updateUserNotificationPreferences(
    userId: string, 
    workspaceId: string, 
    preferences: Partial<NotificationPreferences>
  ): Promise<boolean> {
    try {
      await this.db.query(`
        INSERT INTO notification_preferences 
        (user_id, workspace_id, task_assignment, task_due_date, project_updates, 
         daily_digest, weekly_digest, email_enabled, digest_time, digest_days, timezone)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (user_id, workspace_id) 
        DO UPDATE SET 
          task_assignment = COALESCE($3, notification_preferences.task_assignment),
          task_due_date = COALESCE($4, notification_preferences.task_due_date),
          project_updates = COALESCE($5, notification_preferences.project_updates),
          daily_digest = COALESCE($6, notification_preferences.daily_digest),
          weekly_digest = COALESCE($7, notification_preferences.weekly_digest),
          email_enabled = COALESCE($8, notification_preferences.email_enabled),
          digest_time = COALESCE($9, notification_preferences.digest_time),
          digest_days = COALESCE($10, notification_preferences.digest_days),
          timezone = COALESCE($11, notification_preferences.timezone),
          updated_at = NOW()
      `, [
        userId, workspaceId,
        preferences.taskAssignment,
        preferences.taskDueDate,
        preferences.projectUpdates,
        preferences.dailyDigest,
        preferences.weeklyDigest,
        preferences.emailEnabled,
        preferences.digestTime,
        preferences.digestDays,
        preferences.timezone
      ]);
      return true;
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      return false;
    }
  }

  // Task assignment notification
  public async triggerTaskAssignmentNotification(
    task: Task, 
    assignedUser: User, 
    assignedBy: User, 
    project: Project, 
    workspace: Workspace
  ): Promise<boolean> {
    const preferences = await this.getUserNotificationPreferences(assignedUser.id, workspace.id);
    
    if (!preferences.emailEnabled || !preferences.taskAssignment) {
      console.log(`Task assignment notification disabled for user ${assignedUser.id}`);
      return false;
    }

    // Check rate limits
    const canSend = await emailService.checkRateLimit(assignedUser.id, 'task_assignment');
    if (!canSend) {
      console.log(`Rate limit exceeded for user ${assignedUser.id}`);
      return false;
    }

    const notificationData: NotificationData = {
      user: assignedUser,
      task,
      project,
      workspace,
      actionBy: assignedBy
    };

    const success = await emailService.sendTaskAssignmentNotification(notificationData);
    
    // Record sent email for rate limiting
    if (success) {
      await emailService.recordSentEmail(assignedUser.id, 'task_assignment');
    }
    
    // Log the notification
    await this.logNotification(assignedUser.id, workspace.id, 'task_assignment', success ? 'sent' : 'failed', success, {
      taskId: task.id,
      projectId: project.id,
      assignedBy: assignedBy.id
    });

    return success;
  }

  // Due date reminder notification
  public async triggerDueDateReminderNotification(
    task: Task, 
    assignedUser: User, 
    project: Project, 
    workspace: Workspace
  ): Promise<boolean> {
    const preferences = await this.getUserNotificationPreferences(assignedUser.id, workspace.id);
    
    if (!preferences.emailEnabled || !preferences.taskDueDate) {
      return false;
    }

    const canSend = await emailService.checkRateLimit(assignedUser.id, 'due_date_reminder');
    if (!canSend) {
      return false;
    }

    const notificationData: NotificationData = {
      user: assignedUser,
      task,
      project,
      workspace
    };

    const success = await emailService.sendDueDateReminderNotification(notificationData);
    
    // Record sent email for rate limiting
    if (success) {
      await emailService.recordSentEmail(assignedUser.id, 'due_date_reminder');
    }
    
    await this.logNotification(assignedUser.id, workspace.id, 'due_date_reminder', success ? 'sent' : 'failed', success, {
      taskId: task.id,
      projectId: project.id
    });

    return success;
  }

  // Project update notification
  public async triggerProjectUpdateNotification(
    project: Project,
    workspace: Workspace,
    updateType: string,
    updateMessage: string,
    updatedBy: User,
    teamMembers: User[]
  ): Promise<boolean> {
    let successCount = 0;

    for (const member of teamMembers) {
      const preferences = await this.getUserNotificationPreferences(member.id, workspace.id);
      
      if (!preferences.emailEnabled || !preferences.projectUpdates) {
        continue;
      }

      const canSend = await emailService.checkRateLimit(member.id, 'project_update');
      if (!canSend) {
        continue;
      }

      const success = await emailService.sendProjectUpdateNotification({
        user: member,
        project,
        workspace,
        actionBy: updatedBy,
        updateType,
        updateMessage
      });

      await this.logNotification(member.id, workspace.id, 'project_update', success ? 'sent' : 'failed', success, {
        projectId: project.id,
        updateType,
        updatedBy: updatedBy.id
      });

      if (success) successCount++;
    }

    return successCount > 0;
  }

  // Process daily digests
  private async processDailyDigests() {
    const currentHour = new Date().getHours();
    const currentDay = new Date().getDay();

    // Get users who should receive daily digest at this hour
    const result = await this.db.query(`
      SELECT DISTINCT np.user_id, np.workspace_id, u.email, u.username, w.name as workspace_name
      FROM notification_preferences np
      JOIN users u ON u.id = np.user_id
      JOIN workspaces w ON w.id = np.workspace_id
      WHERE np.daily_digest = true 
        AND np.email_enabled = true
        AND EXTRACT(HOUR FROM (np.digest_time || ':00')::time) = $1
        AND $2 = ANY(np.digest_days)
    `, [currentHour, currentDay]);

    for (const row of result.rows) {
      await this.generateAndSendDailyDigest(row.user_id, row.workspace_id);
    }
  }

  // Process weekly digests
  private async processWeeklyDigests() {
    const currentHour = new Date().getHours();
    const currentDay = new Date().getDay();

    if (currentDay !== 1) return; // Only on Mondays

    const result = await this.db.query(`
      SELECT DISTINCT np.user_id, np.workspace_id
      FROM notification_preferences np
      JOIN users u ON u.id = np.user_id
      JOIN workspaces w ON w.id = np.workspace_id
      WHERE np.weekly_digest = true 
        AND np.email_enabled = true
        AND EXTRACT(HOUR FROM (np.digest_time || ':00')::time) = $1
    `, [currentHour]);

    for (const row of result.rows) {
      await this.generateAndSendWeeklyDigest(row.user_id, row.workspace_id);
    }
  }

  // Generate and send daily digest
  private async generateAndSendDailyDigest(userId: string, workspaceId: string) {
    try {
      // Get user and workspace data
      const [userResult, workspaceResult] = await Promise.all([
        this.db.query('SELECT * FROM users WHERE id = $1', [userId]),
        this.db.query('SELECT * FROM workspaces WHERE id = $1', [workspaceId])
      ]);

      if (userResult.rows.length === 0 || workspaceResult.rows.length === 0) {
        return;
      }

      const user = userResult.rows[0];
      const workspace = workspaceResult.rows[0];

      // Get yesterday's data
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const startOfDay = new Date(yesterday.setHours(0, 0, 0, 0));
      const endOfDay = new Date(yesterday.setHours(23, 59, 59, 999));

      // Get completed tasks
      const tasksCompletedResult = await this.db.query(`
        SELECT t.*, p.name as project_name 
        FROM tasks t 
        JOIN projects p ON p.id = t.project_id
        WHERE t.assigned_to = $1 
          AND p.workspace_id = $2
          AND t.status = 'completed'
          AND t.completed_at BETWEEN $3 AND $4
      `, [userId, workspaceId, startOfDay, endOfDay]);

      // Get newly assigned tasks
      const tasksAssignedResult = await this.db.query(`
        SELECT t.*, p.name as project_name 
        FROM tasks t 
        JOIN projects p ON p.id = t.project_id
        WHERE t.assigned_to = $1 
          AND p.workspace_id = $2
          AND t.created_at BETWEEN $3 AND $4
      `, [userId, workspaceId, startOfDay, endOfDay]);

      // Get upcoming deadlines (next 3 days)
      const upcomingDeadlinesResult = await this.db.query(`
        SELECT t.*, p.name as project_name 
        FROM tasks t 
        JOIN projects p ON p.id = t.project_id
        WHERE t.assigned_to = $1 
          AND p.workspace_id = $2
          AND t.status NOT IN ('completed', 'cancelled')
          AND t.due_date BETWEEN NOW() AND NOW() + INTERVAL '3 days'
      `, [userId, workspaceId]);

      const digestData: DigestData = {
        user,
        workspace,
        timeRange: 'Yesterday',
        tasksCompleted: tasksCompletedResult.rows,
        tasksAssigned: tasksAssignedResult.rows,
        projectUpdates: [], // TODO: Implement project updates tracking
        upcomingDeadlines: upcomingDeadlinesResult.rows,
        summary: {
          totalTasks: tasksAssignedResult.rows.length + tasksCompletedResult.rows.length,
          completedTasks: tasksCompletedResult.rows.length,
          projectsActive: 0, // TODO: Calculate active projects
          teamMembers: 0 // TODO: Calculate team members
        }
      };

      const success = await emailService.sendDailyDigest(digestData);
      
      await this.logNotification(userId, workspaceId, 'daily_digest', success ? 'sent' : 'failed', success, {
        tasksCompleted: tasksCompletedResult.rows.length,
        tasksAssigned: tasksAssignedResult.rows.length
      });

    } catch (error) {
      console.error('Failed to generate daily digest:', error);
    }
  }

  // Generate and send weekly digest
  private async generateAndSendWeeklyDigest(_userId: string, _workspaceId: string) {
    // Similar to daily digest but for weekly timeframe
    // Implementation would be similar to daily digest with wider date range
    console.log('Weekly digest generation not yet implemented');
  }

  // Process due date reminders
  private async processDueDateReminders() {
    // Get tasks that are due soon and haven't been reminded recently
    const result = await this.db.query(`
      SELECT t.*, u.email, u.username, p.name as project_name, w.name as workspace_name
      FROM tasks t
      JOIN users u ON u.id = t.assigned_to
      JOIN projects p ON p.id = t.project_id
      JOIN workspaces w ON w.id = p.workspace_id
      LEFT JOIN notification_log nl ON nl.user_id = u.id 
        AND nl.type = 'due_date_reminder'
        AND nl.metadata->>'taskId' = t.id::text
        AND nl.created_at > NOW() - INTERVAL '24 hours'
      WHERE t.status NOT IN ('completed', 'cancelled')
        AND t.due_date IS NOT NULL
        AND t.due_date <= NOW() + INTERVAL '24 hours'
        AND nl.id IS NULL
    `);

    for (const row of result.rows) {
      const mockProject = {
        id: 'project-id',
        name: row.project_name,
        description: '',
        status: 'active' as const,
        workspace_id: 'workspace-id',
        created_at: new Date(),
        updated_at: new Date()
      };
      
      const mockWorkspace = {
        id: 'workspace-id',
        name: row.workspace_name,
        slug: 'workspace',
        owner_id: 'owner-id',
        settings: {
          features: {
            team_management: true,
            advanced_reporting: true,
            webhooks: true,
            custom_fields: false
          },
          limits: {
            max_projects: 100,
            max_users: 50,
            max_storage_gb: 10
          }
        },
        subscription_tier: 'professional' as const,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      await this.triggerDueDateReminderNotification(row, row, mockProject, mockWorkspace);
    }
  }

  // Process pending notifications
  private async processPendingNotifications() {
    const result = await this.db.query(`
      SELECT * FROM notification_triggers 
      WHERE is_processed = false 
        AND (scheduled_at IS NULL OR scheduled_at <= NOW())
      ORDER BY created_at ASC
      LIMIT 100
    `);

    for (const trigger of result.rows) {
      await this.processNotificationTrigger(trigger);
    }
  }

  // Process individual notification trigger
  private async processNotificationTrigger(trigger: any) {
    try {
      // Mark as processed first to avoid duplication
      await this.db.query(
        'UPDATE notification_triggers SET is_processed = true WHERE id = $1',
        [trigger.id]
      );

      // Process based on type
      switch (trigger.type) {
        case 'task_assignment':
          // Implementation for task assignment
          break;
        case 'project_update':
          // Implementation for project update
          break;
        default:
          console.warn(`Unknown notification trigger type: ${trigger.type}`);
      }
    } catch (error) {
      console.error('Failed to process notification trigger:', error);
    }
  }

  // Log notification for tracking
  private async logNotification(
    userId: string, 
    workspaceId: string, 
    type: string, 
    status: string, 
    emailSent: boolean, 
    metadata: Record<string, any> = {}
  ) {
    try {
      await this.db.query(`
        INSERT INTO notification_log 
        (user_id, workspace_id, type, status, email_sent, metadata, sent_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [userId, workspaceId, type, status, emailSent, JSON.stringify(metadata), emailSent ? new Date() : null]);
    } catch (error) {
      console.error('Failed to log notification:', error);
    }
  }

  // Handle unsubscribe requests
  public async handleUnsubscribe(token: string): Promise<boolean> {
    const tokenData = emailService.parseUnsubscribeToken(token);
    if (!tokenData) {
      return false;
    }

    const { userId, notificationType } = tokenData;

    try {
      // Update user preferences to disable this notification type
      const updateQuery = `
        UPDATE notification_preferences 
        SET ${notificationType} = false, updated_at = NOW()
        WHERE user_id = $1
      `;
      
      await this.db.query(updateQuery, [userId]);
      
      // Log the unsubscribe
      await this.db.query(`
        INSERT INTO unsubscribe_tokens (user_id, notification_type, token, is_used, used_at)
        VALUES ($1, $2, $3, true, NOW())
        ON CONFLICT (token) DO UPDATE SET is_used = true, used_at = NOW()
      `, [userId, notificationType, token]);

      return true;
    } catch (error) {
      console.error('Failed to handle unsubscribe:', error);
      return false;
    }
  }

  // Health check
  public async healthCheck(): Promise<{ email: boolean; database: boolean; cron: boolean }> {
    const emailHealth = await emailService.healthCheck();
    
    let databaseHealth = false;
    try {
      await this.db.query('SELECT 1');
      databaseHealth = true;
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    const cronHealth = this.cronJobs.size > 0;

    return {
      email: emailHealth,
      database: databaseHealth,
      cron: cronHealth
    };
  }

  // Cleanup old logs and notifications
  public async cleanup() {
    try {
      // Clean up old notification logs (older than 30 days)
      await this.db.query(`
        DELETE FROM notification_log 
        WHERE created_at < NOW() - INTERVAL '30 days'
      `);

      // Clean up processed notification triggers (older than 7 days)
      await this.db.query(`
        DELETE FROM notification_triggers 
        WHERE is_processed = true AND created_at < NOW() - INTERVAL '7 days'
      `);

      // Clean up old unsubscribe tokens (older than 90 days)
      await this.db.query(`
        DELETE FROM unsubscribe_tokens 
        WHERE created_at < NOW() - INTERVAL '90 days'
      `);

      console.log('Notification service cleanup completed');
    } catch (error) {
      console.error('Failed to cleanup notification service:', error);
    }
  }
}

export const notificationService = new NotificationService();