# 📧 Email Notifications System Documentation

## Overview

The Email Notifications System provides comprehensive communication capabilities for ProjectHub-MCP, enabling automated and customizable email notifications for task management, project updates, and team collaboration.

## 🎯 Key Features

### 📧 Notification Types

1. **Task Assignment Notifications**
   - Sent when users are assigned to tasks
   - Includes task details, project context, and direct links
   - Priority-based styling and urgency indicators

2. **Due Date Reminders**
   - Automated reminders for approaching deadlines
   - Configurable reminder intervals
   - Priority-based alert styling

3. **Project Update Notifications**
   - Team-wide notifications for project changes
   - Status updates, milestone achievements, team changes
   - Contextual project information

4. **Daily Digest**
   - Personalized daily activity summaries
   - Completed tasks, new assignments, upcoming deadlines
   - Team performance insights and KPIs

5. **Weekly Digest**
   - Comprehensive weekly performance reports
   - Productivity analytics and trend insights
   - Team velocity and project progress

### 🎨 Professional Email Templates

All email templates feature:
- **Responsive Design** - Optimized for desktop, tablet, and mobile
- **Professional Styling** - Consistent branding and modern design
- **Cross-Client Compatibility** - Tested on major email clients
- **Accessibility** - WCAG 2.1 AA compliant
- **Interactive Elements** - Call-to-action buttons and links

## 🏗️ Technical Architecture

### Backend Services

#### EmailService (`src/services/emailService.ts`)
```typescript
export class EmailService {
  // Core email delivery with SMTP configuration
  public async sendEmail(options: EmailOptions): Promise<boolean>
  
  // Template rendering with Handlebars
  private async renderTemplate(templateName: string, data: any): Promise<EmailTemplate>
  
  // Notification-specific methods
  public async sendTaskAssignmentNotification(data: NotificationData): Promise<boolean>
  public async sendDueDateReminderNotification(data: NotificationData): Promise<boolean>
  public async sendProjectUpdateNotification(data: NotificationData): Promise<boolean>
  public async sendDailyDigest(digestData: DigestData): Promise<boolean>
  public async sendWeeklyDigest(digestData: DigestData): Promise<boolean>
}
```

#### NotificationService (`src/services/notificationService.ts`)
```typescript
export class NotificationService {
  // User preference management
  public async getUserNotificationPreferences(userId: string, workspaceId: string): Promise<NotificationPreferences>
  public async updateUserNotificationPreferences(userId: string, workspaceId: string, preferences: Partial<NotificationPreferences>): Promise<boolean>
  
  // Notification triggers
  public async triggerTaskAssignmentNotification(task: Task, assignedUser: User, assignedBy: User, project: Project, workspace: Workspace): Promise<boolean>
  public async triggerDueDateReminderNotification(task: Task, assignedUser: User, project: Project, workspace: Workspace): Promise<boolean>
  public async triggerProjectUpdateNotification(project: Project, workspace: Workspace, updateType: string, updateMessage: string, updatedBy: User, teamMembers: User[]): Promise<boolean>
  
  // Automated scheduling with cron jobs
  private async processDailyDigests(): Promise<void>
  private async processWeeklyDigests(): Promise<void>
  private async processDueDateReminders(): Promise<void>
}
```

#### RateLimitService (`src/services/rateLimitService.ts`)
```typescript
export class RateLimitService {
  // Rate limiting checks
  public async checkRateLimit(userId: string, notificationType: string): Promise<boolean>
  public async recordSentEmail(userId: string, notificationType: string): Promise<void>
  
  // Statistics and monitoring
  public async getRateLimitStatus(userId: string, notificationType?: string): Promise<RateLimitStatus[]>
  public async getStatistics(): Promise<RateLimitStatistics>
}
```

### Database Schema

#### Notification Preferences
```sql
CREATE TABLE notification_preferences (
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
```

#### Rate Limiting
```sql
CREATE TABLE email_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    email_count INTEGER DEFAULT 0,
    window_start TIMESTAMP NOT NULL,
    window_end TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, notification_type, window_start)
);
```

#### Notification Logging
```sql
CREATE TABLE notification_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    email_sent BOOLEAN DEFAULT false,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    sent_at TIMESTAMP
);
```

### Frontend Components

#### NotificationSettings (`src/pages/NotificationSettings.tsx`)
- Complete notification preferences management
- Live email testing functionality
- Rate limit status monitoring
- Timezone and scheduling configuration
- Responsive design for all devices

## 🔧 Configuration

### Environment Variables

```bash
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourdomain.com

# Application URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3001

# Feature Flags
EMAIL_NOTIFICATIONS_ENABLED=true
DIGEST_NOTIFICATIONS_ENABLED=true
RATE_LIMITING_ENABLED=true
```

### SMTP Provider Configuration

#### Gmail
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-gmail@gmail.com
SMTP_PASSWORD=your-app-password  # Use App Password, not regular password
```

#### Outlook/Hotmail
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
```

#### SendGrid
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

## 📊 Rate Limiting

### Default Limits

| Notification Type | Limit | Window |
|-------------------|-------|--------|
| Task Assignment | 10 emails | 1 hour |
| Due Date Reminder | 5 emails | 1 hour |
| Project Update | 15 emails | 1 hour |
| Daily Digest | 1 email | 24 hours |
| Weekly Digest | 1 email | 7 days |

### Custom Configuration

Rate limits can be customized via the RateLimitService:

```typescript
rateLimitService.updateRateLimit('task_assignment', {
  maxEmails: 15,
  windowMinutes: 60
});
```

## 🎨 Email Templates

### Template Structure

All templates follow a consistent structure:
- **Header** - Branding and notification type
- **Content** - Main notification information
- **Action Buttons** - Primary call-to-action
- **Footer** - Unsubscribe links and branding

### Template Customization

Templates use Handlebars for dynamic content:

```handlebars
{{userName}} - User's display name
{{taskName}} - Task title
{{projectName}} - Project name
{{taskUrl}} - Direct link to task
{{unsubscribeUrl}} - Unsubscribe link
```

### Adding Custom Templates

1. Create new `.hbs` file in `src/templates/emails/`
2. Use existing templates as reference
3. Test with EmailService.testNotification()
4. Update EmailService to load new template

## 🧪 Testing

### Manual Testing

Use the notification settings page to send test emails:

```typescript
// Test task assignment notification
POST /api/notifications/test
{
  "type": "task_assignment",
  "taskId": "test-task-id",
  "projectId": "test-project-id"
}
```

### Automated Testing

E2E tests cover:
- Email delivery functionality
- Template rendering
- Rate limiting
- User preferences
- Unsubscribe workflow

## 📈 Monitoring

### Health Checks

```bash
# Check email service health
GET /api/notifications/health

# Check rate limit statistics
GET /api/notifications/stats
```

### Logging

All email activities are logged:
- Successful deliveries
- Failed attempts
- Rate limit violations
- User preference changes

## 🔒 Security

### Data Protection
- No sensitive data in email content
- Secure token-based unsubscribe system
- Rate limiting prevents abuse
- Environment variable configuration

### SMTP Security
- TLS/SSL encryption
- Authentication required
- Connection pooling with timeouts
- Error handling without exposing credentials

## 🚀 Deployment

### Production Checklist

- [ ] Configure SMTP credentials
- [ ] Set production frontend URL
- [ ] Enable rate limiting
- [ ] Configure digest schedules
- [ ] Test email delivery
- [ ] Monitor error logs
- [ ] Set up email provider monitoring

### Scaling Considerations

- **High Volume**: Consider dedicated email service (SendGrid, Mailgun)
- **Multiple Regions**: Configure regional SMTP endpoints
- **Load Balancing**: Distribute email sending across instances
- **Queue Management**: Implement Redis-based job queues for high volume

## 🔧 Troubleshooting

### Common Issues

#### Emails Not Sending
1. Check SMTP credentials
2. Verify firewall settings
3. Check email provider limits
4. Review error logs

#### Template Rendering Issues
1. Verify template file exists
2. Check template syntax
3. Validate data objects
4. Clear template cache

#### Rate Limiting Issues
1. Check user rate limit status
2. Adjust rate limit configuration
3. Clear rate limit records if needed
4. Monitor for abuse patterns

## 📚 API Reference

### Notification Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications/preferences` | Get user notification preferences |
| PUT | `/api/notifications/preferences` | Update notification preferences |
| POST | `/api/notifications/test` | Send test notification (dev only) |
| GET | `/api/notifications/health` | Service health check |
| GET | `/api/notifications/stats` | Rate limiting statistics |
| GET | `/api/notifications/unsubscribe` | Handle unsubscribe requests |

### Notification Preferences Schema

```typescript
interface NotificationPreferences {
  taskAssignment: boolean;
  taskDueDate: boolean;
  projectUpdates: boolean;
  dailyDigest: boolean;
  weeklyDigest: boolean;
  emailEnabled: boolean;
  digestTime: string; // "08:00"
  digestDays: number[]; // [1,2,3,4,5] for weekdays
  timezone: string;
}
```

## 🎯 Best Practices

### Email Content
- Keep subject lines concise and descriptive
- Use clear call-to-action buttons
- Include relevant context and links
- Respect user preferences and rate limits

### Performance
- Cache compiled templates
- Use connection pooling for SMTP
- Implement retry logic for failed sends
- Monitor email delivery rates

### User Experience
- Provide granular notification controls
- Include easy unsubscribe options
- Use professional email design
- Test across email clients

---

For additional support or feature requests, please visit our [GitHub Issues](https://github.com/anubissbe/ProjectHub-Mcp/issues) page.