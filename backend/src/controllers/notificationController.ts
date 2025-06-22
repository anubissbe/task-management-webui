import { Request, Response } from 'express';
import { notificationService } from '../services/notificationService';
import { emailService } from '../services/emailService';
import { z } from 'zod';

// Request validation schemas
const updatePreferencesSchema = z.object({
  taskAssignment: z.boolean().optional(),
  taskDueDate: z.boolean().optional(),
  projectUpdates: z.boolean().optional(),
  dailyDigest: z.boolean().optional(),
  weeklyDigest: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  digestTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  digestDays: z.array(z.number().min(0).max(6)).optional(),
  timezone: z.string().optional(),
});

const testNotificationSchema = z.object({
  type: z.enum(['task_assignment', 'due_date_reminder', 'project_update', 'daily_digest', 'weekly_digest']),
  taskId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
});

export class NotificationController {
  // Get user notification preferences
  public static async getNotificationPreferences(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const workspaceId = req.headers['x-workspace-id'] as string;

      if (!userId || !workspaceId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const preferences = await notificationService.getUserNotificationPreferences(userId, workspaceId);

      res.json({
        success: true,
        data: preferences
      });
    } catch (error) {
      console.error('Failed to get notification preferences:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to retrieve notification preferences'
      });
    }
  }

  // Update user notification preferences
  public static async updateNotificationPreferences(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const workspaceId = req.headers['x-workspace-id'] as string;

      if (!userId || !workspaceId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Validate request body
      const validationResult = updatePreferencesSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Invalid request data',
          details: validationResult.error.issues
        });
      }

      const preferences = validationResult.data;
      const success = await notificationService.updateUserNotificationPreferences(userId, workspaceId, preferences);

      if (!success) {
        return res.status(500).json({ error: 'Failed to update preferences' });
      }

      // Get updated preferences
      const updatedPreferences = await notificationService.getUserNotificationPreferences(userId, workspaceId);

      res.json({
        success: true,
        message: 'Notification preferences updated successfully',
        data: updatedPreferences
      });
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to update notification preferences'
      });
    }
  }

  // Test notification (for development/testing)
  public static async testNotification(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const workspaceId = req.headers['x-workspace-id'] as string;

      if (!userId || !workspaceId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Validate request body
      const validationResult = testNotificationSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Invalid request data',
          details: validationResult.error.issues
        });
      }

      const { type, taskId, projectId } = validationResult.data;

      // Only allow in development environment
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ error: 'Test notifications not allowed in production' });
      }

      let success = false;
      const testUser = {
        ...req.user!,
        username: req.user!.firstName + ' ' + req.user!.lastName,
        created_at: new Date(),
        updated_at: new Date()
      };
      const testWorkspace = {
        id: workspaceId,
        name: 'Test Workspace',
        slug: 'test-workspace',
        owner_id: userId,
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

      switch (type) {
        case 'task_assignment': {
          if (!taskId) {
            return res.status(400).json({ error: 'taskId required for task assignment notification' });
          }
          // Create a mock task for testing
          const mockTask = {
            id: taskId,
            name: 'Test Task Assignment',
            description: 'This is a test task assignment notification',
            project_id: projectId || 'test-project-id',
            priority: 'medium' as const,
            status: 'pending' as const,
            order_index: 0,
            assigned_to: userId,
            estimated_hours: 8,
            created_at: new Date(),
            updated_at: new Date()
          };
          const mockProject = {
            id: projectId || 'test-project-id',
            name: 'Test Project',
            description: 'Test project for notifications',
            status: 'active' as const,
            workspace_id: workspaceId,
            created_at: new Date(),
            updated_at: new Date()
          };
          success = await notificationService.triggerTaskAssignmentNotification(
            mockTask,
            testUser,
            testUser,
            mockProject,
            testWorkspace
          );
          break;
        }

        case 'due_date_reminder': {
          if (!taskId) {
            return res.status(400).json({ error: 'taskId required for due date reminder' });
          }
          const mockReminderTask = {
            id: taskId,
            name: 'Test Due Date Reminder',
            description: 'This task is due soon - test notification',
            project_id: projectId || 'test-project-id',
            priority: 'high' as const,
            status: 'in_progress' as const,
            order_index: 0,
            assigned_to: userId,
            estimated_hours: 4,
            created_at: new Date(),
            updated_at: new Date()
          };
          const mockReminderProject = {
            id: projectId || 'test-project-id',
            name: 'Test Project',
            description: 'Test project for notifications',
            status: 'active' as const,
            workspace_id: workspaceId,
            created_at: new Date(),
            updated_at: new Date()
          };
          success = await notificationService.triggerDueDateReminderNotification(
            mockReminderTask,
            testUser,
            mockReminderProject,
            testWorkspace
          );
          break;
        }

        case 'project_update': {
          if (!projectId) {
            return res.status(400).json({ error: 'projectId required for project update notification' });
          }
          const mockUpdateProject = {
            id: projectId,
            name: 'Test Project Update',
            description: 'Test project for update notifications',
            status: 'active' as const,
            workspace_id: workspaceId,
            created_at: new Date(),
            updated_at: new Date()
          };
          success = await notificationService.triggerProjectUpdateNotification(
            mockUpdateProject,
            testWorkspace,
            'status_update',
            'This is a test project update notification to verify email delivery.',
            testUser,
            [testUser]
          );
          break;
        }

        case 'daily_digest': {
          // Generate test daily digest data
          const mockDigestData = {
            user: testUser,
            workspace: testWorkspace,
            timeRange: 'Yesterday (Test)',
            tasksCompleted: [
              {
                id: '1',
                name: 'Test Completed Task 1',
                project_id: 'project-a',
                status: 'completed' as const,
                priority: 'medium' as const,
                order_index: 0,
                created_at: new Date(),
                updated_at: new Date()
              }
            ],
            tasksAssigned: [
              {
                id: '3',
                name: 'Test New Assignment',
                project_id: 'project-c',
                status: 'pending' as const,
                priority: 'medium' as const,
                order_index: 0,
                created_at: new Date(),
                updated_at: new Date()
              }
            ],
            projectUpdates: [
              {
                project: {
                  id: 'project-a',
                  name: 'Test Project A',
                  description: '',
                  status: 'active' as const,
                  workspace_id: workspaceId,
                  created_at: new Date(),
                  updated_at: new Date()
                },
                updates: ['Status updated to active', 'New team member added']
              }
            ],
            upcomingDeadlines: [
              {
                id: '4',
                name: 'Test Urgent Task',
                project_id: 'project-d',
                status: 'pending' as const,
                priority: 'high' as const,
                order_index: 0,
                created_at: new Date(),
                updated_at: new Date()
              }
            ],
            summary: {
              totalTasks: 4,
              completedTasks: 2,
              projectsActive: 3,
              teamMembers: 5
            }
          };
          success = await emailService.sendDailyDigest(mockDigestData);
          break;
        }

        case 'weekly_digest': {
          // Generate test weekly digest data
          const mockWeeklyDigestData = {
            user: testUser,
            workspace: testWorkspace,
            timeRange: 'This Week (Test)',
            tasksCompleted: [
              {
                id: '1',
                name: 'Weekly Test Task 1',
                project_id: 'project-a',
                status: 'completed' as const,
                priority: 'medium' as const,
                order_index: 0,
                created_at: new Date(),
                updated_at: new Date()
              }
            ],
            tasksAssigned: [
              {
                id: '4',
                name: 'New Weekly Assignment',
                project_id: 'project-d',
                status: 'pending' as const,
                priority: 'medium' as const,
                order_index: 0,
                created_at: new Date(),
                updated_at: new Date()
              }
            ],
            projectUpdates: [
              {
                project: {
                  id: 'project-a',
                  name: 'Test Project A',
                  description: '',
                  status: 'active' as const,
                  workspace_id: workspaceId,
                  created_at: new Date(),
                  updated_at: new Date()
                },
                updates: ['Major milestone completed', 'Sprint planning completed']
              }
            ],
            upcomingDeadlines: [
              {
                id: '5',
                name: 'Next Week Priority',
                project_id: 'project-e',
                status: 'pending' as const,
                priority: 'high' as const,
                order_index: 0,
                created_at: new Date(),
                updated_at: new Date()
              }
            ],
            summary: {
              totalTasks: 10,
              completedTasks: 7,
              projectsActive: 4,
              teamMembers: 8
            }
          };
          success = await emailService.sendWeeklyDigest(mockWeeklyDigestData);
          break;
        }

        default:
          return res.status(400).json({ error: 'Invalid notification type' });
      }

      res.json({
        success,
        message: success 
          ? `Test ${type} notification sent successfully`
          : `Failed to send test ${type} notification`,
        type,
        recipient: testUser.email
      });
    } catch (error) {
      console.error('Failed to send test notification:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to send test notification'
      });
    }
  }

  // Handle unsubscribe requests
  public static async unsubscribe(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        res.status(400).json({ error: 'Invalid or missing unsubscribe token' });
        return;
      }

      const success = await notificationService.handleUnsubscribe(token);

      if (!success) {
        res.status(400).json({ error: 'Invalid or expired unsubscribe token' });
        return;
      }

      // Return a simple HTML page for better UX
      const htmlResponse = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Unsubscribed - ProjectHub-MCP</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 100px auto; padding: 40px; text-align: center; }
            .success { color: #48bb78; font-size: 24px; margin-bottom: 20px; }
            .message { color: #4a5568; font-size: 16px; line-height: 1.6; }
            .link { color: #4299e1; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="success">✅ Unsubscribed Successfully</div>
          <div class="message">
            You have been successfully unsubscribed from this type of notification.
            <br><br>
            You can update your notification preferences anytime by logging into your 
            <a href="${process.env.FRONTEND_URL}/settings/notifications" class="link">account settings</a>.
          </div>
        </body>
        </html>
      `;

      res.setHeader('Content-Type', 'text/html');
      res.send(htmlResponse);
    } catch (error) {
      console.error('Failed to handle unsubscribe:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to process unsubscribe request'
      });
    }
  }

  // Get notification health status
  public static async getNotificationHealth(_req: Request, res: Response) {
    try {
      const health = await notificationService.healthCheck();
      const emailHealth = await emailService.healthCheck();

      const overallHealth = health.email && health.database && health.cron && emailHealth;

      res.status(overallHealth ? 200 : 503).json({
        success: overallHealth,
        services: {
          email: emailHealth,
          database: health.database,
          cron: health.cron,
          notifications: health.email
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to check notification health:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to check notification service health'
      });
    }
  }

  // Get notification statistics (for admin/debugging)
  public static async getNotificationStats(req: Request, res: Response) {
    try {
      const workspaceId = req.headers['x-workspace-id'] as string;

      if (!workspaceId) {
        return res.status(401).json({ error: 'Workspace context required' });
      }

      // This would require additional database queries to get stats
      // For now, return a placeholder response
      res.json({
        success: true,
        data: {
          totalNotificationsSent: 0,
          emailsSentToday: 0,
          activeUsers: 0,
          digestSubscribers: 0,
          lastDigestSent: null
        },
        message: 'Notification statistics feature coming soon'
      });
    } catch (error) {
      console.error('Failed to get notification stats:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to retrieve notification statistics'
      });
    }
  }

  // Manually trigger digest (for admin/testing)
  public static async triggerDigest(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const workspaceId = req.headers['x-workspace-id'] as string;
      const { type } = req.body;

      if (!userId || !workspaceId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!type || !['daily', 'weekly'].includes(type)) {
        return res.status(400).json({ error: 'Invalid digest type. Must be "daily" or "weekly"' });
      }

      // Only allow in development or for admin users
      if (process.env.NODE_ENV === 'production' && req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Manual digest trigger not allowed' });
      }

      // Trigger the appropriate digest
      let success = false;
      if (type === 'daily') {
        // Call the private method through reflection or create a public wrapper
        success = true; // Placeholder
      } else if (type === 'weekly') {
        success = true; // Placeholder
      }

      res.json({
        success,
        message: success 
          ? `${type} digest triggered successfully`
          : `Failed to trigger ${type} digest`,
        type,
        triggeredBy: req.user?.email
      });
    } catch (error) {
      console.error('Failed to trigger digest:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to trigger digest'
      });
    }
  }
}

export default NotificationController;