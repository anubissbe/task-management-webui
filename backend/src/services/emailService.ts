import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import sanitizeHtml from 'sanitize-html';
import { User, Task, Project, Workspace } from '../types';

const readFileAsync = promisify(fs.readFile);

export interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

export interface NotificationData {
  user: User;
  task?: Task;
  project?: Project;
  workspace?: Workspace;
  actionBy?: User;
  customData?: Record<string, any>;
}

export interface EmailOptions {
  to: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: {
    filename: string;
    content: Buffer;
    contentType: string;
  }[];
}

export interface NotificationPreferences {
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

export interface DigestData {
  user: User;
  workspace: Workspace;
  timeRange: string;
  tasksCompleted: Task[];
  tasksAssigned: Task[];
  projectUpdates: {
    project: Project;
    updates: string[];
  }[];
  upcomingDeadlines: Task[];
  summary: {
    totalTasks: number;
    completedTasks: number;
    projectsActive: number;
    teamMembers: number;
  };
}

export interface PasswordResetData {
  user: User;
  resetToken: string;
  resetUrl: string;
}

export class EmailService {
  private transporter!: nodemailer.Transporter;
  private templatesCache: Map<string, handlebars.TemplateDelegate> = new Map();
  private isConfigured: boolean = false;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      }
    };

    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      console.warn('Email service not configured: Missing SMTP credentials');
      this.isConfigured = false;
      return;
    }

    this.transporter = nodemailer.createTransport(emailConfig);
    this.isConfigured = true;

    // Verify connection
    this.transporter.verify((error) => {
      if (error) {
        console.error('Email service configuration error:', error);
        this.isConfigured = false;
      } else {
        console.log('Email service ready for sending messages');
      }
    });
  }

  public isReady(): boolean {
    return this.isConfigured;
  }

  private async loadTemplate(templateName: string): Promise<handlebars.TemplateDelegate> {
    if (this.templatesCache.has(templateName)) {
      return this.templatesCache.get(templateName)!;
    }

    const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.hbs`);
    
    try {
      const templateContent = await readFileAsync(templatePath, 'utf-8');
      const compiledTemplate = handlebars.compile(templateContent);
      this.templatesCache.set(templateName, compiledTemplate);
      return compiledTemplate;
    } catch (error) {
      console.error(`Failed to load email template: ${templateName}`, error);
      // Return a default template
      const defaultTemplate = `
        <h2>{{subject}}</h2>
        <p>{{message}}</p>
        <hr>
        <p><small>This email was sent from ProjectHub-MCP</small></p>
      `;
      const compiledTemplate = handlebars.compile(defaultTemplate);
      this.templatesCache.set(templateName, compiledTemplate);
      return compiledTemplate;
    }
  }

  private async renderTemplate(templateName: string, data: any): Promise<EmailTemplate> {
    const template = await this.loadTemplate(templateName);
    const html = template(data);
    
    // Generate plain text version by safely removing HTML tags using sanitize-html
    // This properly handles all HTML entities, tags, and potential security issues
    const text = sanitizeHtml(html, {
      allowedTags: [], // Remove all HTML tags
      allowedAttributes: {}, // Remove all attributes
      textFilter: (text) => {
        // Normalize whitespace and decode HTML entities properly
        return text.replace(/\s+/g, ' ').trim();
      }
    });
    
    return {
      subject: data.subject || 'Notification from ProjectHub-MCP',
      text,
      html
    };
  }

  private generateUnsubscribeLink(userId: string, notificationType: string): string {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const token = Buffer.from(`${userId}:${notificationType}:${Date.now()}`).toString('base64');
    return `${baseUrl}/unsubscribe?token=${token}`;
  }

  // Core email sending method
  public async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isConfigured) {
      console.warn('Email service not configured, skipping email send');
      return false;
    }

    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: options.to,
        cc: options.cc,
        bcc: options.bcc,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  // Task assignment notification
  public async sendTaskAssignmentNotification(data: NotificationData): Promise<boolean> {
    if (!data.task || !data.user || !data.actionBy) {
      console.error('Missing required data for task assignment notification');
      return false;
    }

    const templateData = {
      subject: `Task Assigned: ${data.task.name}`,
      userName: data.user.username,
      taskName: data.task.name,
      taskDescription: data.task.description,
      assignedBy: data.actionBy.username,
      projectName: data.project?.name,
      dueDate: data.task.estimated_hours ? `Estimated: ${data.task.estimated_hours}h` : 'No deadline set',
      taskUrl: `${process.env.FRONTEND_URL}/projects/${data.task.project_id}/tasks/${data.task.id}`,
      unsubscribeUrl: this.generateUnsubscribeLink(data.user.id, 'task_assignment'),
    };

    const emailTemplate = await this.renderTemplate('task-assignment', templateData);

    return this.sendEmail({
      to: data.user.email,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    });
  }

  // Due date reminder notification
  public async sendDueDateReminderNotification(data: NotificationData): Promise<boolean> {
    if (!data.task || !data.user) {
      console.error('Missing required data for due date reminder notification');
      return false;
    }

    const templateData = {
      subject: `Reminder: Task "${data.task.name}" needs attention`,
      userName: data.user.username,
      taskName: data.task.name,
      taskDescription: data.task.description,
      projectName: data.project?.name,
      priority: data.task.priority,
      estimatedHours: data.task.estimated_hours,
      taskUrl: `${process.env.FRONTEND_URL}/projects/${data.task.project_id}/tasks/${data.task.id}`,
      unsubscribeUrl: this.generateUnsubscribeLink(data.user.id, 'due_date_reminder'),
    };

    const emailTemplate = await this.renderTemplate('due-date-reminder', templateData);

    return this.sendEmail({
      to: data.user.email,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    });
  }

  // Project update notification
  public async sendProjectUpdateNotification(data: NotificationData & { updateType: string; updateMessage: string }): Promise<boolean> {
    if (!data.project || !data.user) {
      console.error('Missing required data for project update notification');
      return false;
    }

    const templateData = {
      subject: `Project Update: ${data.project.name}`,
      userName: data.user.username,
      projectName: data.project.name,
      updateType: data.updateType,
      updateMessage: data.updateMessage,
      updatedBy: data.actionBy?.username || 'System',
      projectUrl: `${process.env.FRONTEND_URL}/projects/${data.project.id}`,
      unsubscribeUrl: this.generateUnsubscribeLink(data.user.id, 'project_updates'),
    };

    const emailTemplate = await this.renderTemplate('project-update', templateData);

    return this.sendEmail({
      to: data.user.email,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    });
  }

  // Daily digest notification
  public async sendDailyDigest(digestData: DigestData): Promise<boolean> {
    if (!digestData.user) {
      console.error('Missing user data for daily digest');
      return false;
    }

    const templateData = {
      subject: `Daily Digest - ${digestData.workspace.name}`,
      userName: digestData.user.username,
      workspaceName: digestData.workspace.name,
      timeRange: digestData.timeRange,
      tasksCompleted: digestData.tasksCompleted,
      tasksAssigned: digestData.tasksAssigned,
      projectUpdates: digestData.projectUpdates,
      upcomingDeadlines: digestData.upcomingDeadlines,
      summary: digestData.summary,
      dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
      unsubscribeUrl: this.generateUnsubscribeLink(digestData.user.id, 'daily_digest'),
    };

    const emailTemplate = await this.renderTemplate('daily-digest', templateData);

    return this.sendEmail({
      to: digestData.user.email,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    });
  }

  // Weekly digest notification
  public async sendWeeklyDigest(digestData: DigestData): Promise<boolean> {
    if (!digestData.user) {
      console.error('Missing user data for weekly digest');
      return false;
    }

    const templateData = {
      subject: `Weekly Digest - ${digestData.workspace.name}`,
      userName: digestData.user.username,
      workspaceName: digestData.workspace.name,
      timeRange: digestData.timeRange,
      tasksCompleted: digestData.tasksCompleted,
      tasksAssigned: digestData.tasksAssigned,
      projectUpdates: digestData.projectUpdates,
      upcomingDeadlines: digestData.upcomingDeadlines,
      summary: digestData.summary,
      reportsUrl: `${process.env.FRONTEND_URL}/reporting`,
      unsubscribeUrl: this.generateUnsubscribeLink(digestData.user.id, 'weekly_digest'),
    };

    const emailTemplate = await this.renderTemplate('weekly-digest', templateData);

    return this.sendEmail({
      to: digestData.user.email,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    });
  }

  // Password reset notification
  public async sendPasswordResetEmail(data: PasswordResetData): Promise<boolean> {
    if (!data.user || !data.resetToken || !data.resetUrl) {
      console.error('Missing required data for password reset notification');
      return false;
    }

    const templateData = {
      subject: 'Password Reset - ProjectHub',
      userName: data.user.username,
      resetToken: data.resetToken,
      resetUrl: data.resetUrl,
    };

    const emailTemplate = await this.renderTemplate('password-reset', templateData);

    return this.sendEmail({
      to: data.user.email,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    });
  }

  // Health check
  public async healthCheck(): Promise<boolean> {
    if (!this.isConfigured) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email service health check failed:', error);
      return false;
    }
  }

  // Rate limiting check (implemented with database)
  public async checkRateLimit(userId: string, notificationType: string): Promise<boolean> {
    const { rateLimitService } = await import('./rateLimitService');
    return rateLimitService.checkRateLimit(userId, notificationType);
  }

  // Record sent email for rate limiting
  public async recordSentEmail(userId: string, notificationType: string): Promise<void> {
    const { rateLimitService } = await import('./rateLimitService');
    await rateLimitService.recordSentEmail(userId, notificationType);
  }

  // Unsubscribe handling
  public parseUnsubscribeToken(token: string): { userId: string; notificationType: string; timestamp: number } | null {
    try {
      const decoded = Buffer.from(token, 'base64').toString('ascii');
      const [userId, notificationType, timestamp] = decoded.split(':');
      return {
        userId,
        notificationType,
        timestamp: parseInt(timestamp)
      };
    } catch (error) {
      console.error('Failed to parse unsubscribe token:', error);
      return null;
    }
  }
}

export const emailService = new EmailService();