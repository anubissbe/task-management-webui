import { DatabaseService } from '../config/database';

export interface RateLimit {
  userId: string;
  notificationType: string;
  count: number;
  windowStart: Date;
  windowEnd: Date;
}

export interface RateLimitConfig {
  maxEmails: number;
  windowMinutes: number;
}

export class RateLimitService {
  private db: DatabaseService;
  
  // Rate limit configurations for different notification types
  private rateLimits: Record<string, RateLimitConfig> = {
    task_assignment: { maxEmails: 10, windowMinutes: 60 }, // 10 emails per hour
    due_date_reminder: { maxEmails: 5, windowMinutes: 60 }, // 5 emails per hour
    project_update: { maxEmails: 15, windowMinutes: 60 }, // 15 emails per hour
    daily_digest: { maxEmails: 1, windowMinutes: 1440 }, // 1 email per day
    weekly_digest: { maxEmails: 1, windowMinutes: 10080 }, // 1 email per week
    default: { maxEmails: 20, windowMinutes: 60 } // Default: 20 emails per hour
  };

  constructor() {
    this.db = new DatabaseService();
    this.initializeRateLimitTable();
  }

  private async initializeRateLimitTable() {
    try {
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS email_rate_limits (
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
      `);

      // Create index for efficient lookups
      await this.db.query(`
        CREATE INDEX IF NOT EXISTS idx_email_rate_limits_user_type_window 
        ON email_rate_limits (user_id, notification_type, window_start, window_end);
      `);

      console.log('Rate limiting table initialized');
    } catch (error) {
      console.error('Failed to initialize rate limiting table:', error);
    }
  }

  // Check if user can send a notification
  public async checkRateLimit(userId: string, notificationType: string): Promise<boolean> {
    try {
      const config = this.rateLimits[notificationType] || this.rateLimits.default;
      const now = new Date();

      // Get current rate limit record for this user and notification type
      const result = await this.db.query(`
        SELECT * FROM email_rate_limits 
        WHERE user_id = $1 
          AND notification_type = $2 
          AND window_end > $3
        ORDER BY window_start DESC 
        LIMIT 1
      `, [userId, notificationType, now]);

      if (result.rows.length === 0) {
        // No existing record, user can send
        return true;
      }

      const rateLimit = result.rows[0];
      
      // Check if current window is still valid
      if (new Date(rateLimit.window_end) > now && rateLimit.email_count >= config.maxEmails) {
        console.log(`Rate limit exceeded for user ${userId}, type ${notificationType}: ${rateLimit.email_count}/${config.maxEmails}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to check rate limit:', error);
      // In case of error, allow the email to prevent blocking legitimate notifications
      return true;
    }
  }

  // Record a sent email
  public async recordSentEmail(userId: string, notificationType: string): Promise<void> {
    try {
      const config = this.rateLimits[notificationType] || this.rateLimits.default;
      const now = new Date();
      const windowStart = new Date(now.getTime() - config.windowMinutes * 60 * 1000);
      const windowEnd = new Date(now.getTime() + config.windowMinutes * 60 * 1000);

      // Try to update existing record in current window
      const updateResult = await this.db.query(`
        UPDATE email_rate_limits 
        SET email_count = email_count + 1,
            updated_at = NOW()
        WHERE user_id = $1 
          AND notification_type = $2 
          AND window_end > $3
          AND window_start <= $4
        RETURNING id
      `, [userId, notificationType, now, now]);

      if (updateResult.rows.length === 0) {
        // No existing record in current window, create new one
        await this.db.query(`
          INSERT INTO email_rate_limits 
          (user_id, notification_type, email_count, window_start, window_end)
          VALUES ($1, $2, 1, $3, $4)
        `, [userId, notificationType, windowStart, windowEnd]);
      }
    } catch (error) {
      console.error('Failed to record sent email:', error);
    }
  }

  // Get rate limit status for a user
  public async getRateLimitStatus(userId: string, notificationType?: string): Promise<{
    type: string;
    current: number;
    limit: number;
    windowMinutes: number;
    resetsAt: Date | null;
  }[]> {
    try {
      const types = notificationType ? [notificationType] : Object.keys(this.rateLimits);
      const status = [];

      for (const type of types) {
        if (type === 'default') continue;

        const config = this.rateLimits[type];
        const now = new Date();

        const result = await this.db.query(`
          SELECT * FROM email_rate_limits 
          WHERE user_id = $1 
            AND notification_type = $2 
            AND window_end > $3
          ORDER BY window_start DESC 
          LIMIT 1
        `, [userId, type, now]);

        let current = 0;
        let resetsAt = null;

        if (result.rows.length > 0) {
          const rateLimit = result.rows[0];
          current = rateLimit.email_count;
          resetsAt = new Date(rateLimit.window_end);
        }

        status.push({
          type,
          current,
          limit: config.maxEmails,
          windowMinutes: config.windowMinutes,
          resetsAt
        });
      }

      return status;
    } catch (error) {
      console.error('Failed to get rate limit status:', error);
      return [];
    }
  }

  // Clean up old rate limit records
  public async cleanup(): Promise<void> {
    try {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const result = await this.db.query(`
        DELETE FROM email_rate_limits 
        WHERE window_end < $1
      `, [oneWeekAgo]);

      console.log(`Cleaned up ${result.rowCount} old rate limit records`);
    } catch (error) {
      console.error('Failed to cleanup rate limit records:', error);
    }
  }

  // Update rate limit configuration (for admin use)
  public updateRateLimit(notificationType: string, config: RateLimitConfig): void {
    this.rateLimits[notificationType] = config;
    console.log(`Updated rate limit for ${notificationType}:`, config);
  }

  // Get all rate limit configurations
  public getRateLimitConfigs(): Record<string, RateLimitConfig> {
    return { ...this.rateLimits };
  }

  // Reset rate limits for a user (admin function)
  public async resetUserRateLimits(userId: string, notificationType?: string): Promise<boolean> {
    try {
      let query = 'DELETE FROM email_rate_limits WHERE user_id = $1';
      const params = [userId];

      if (notificationType) {
        query += ' AND notification_type = $2';
        params.push(notificationType);
      }

      await this.db.query(query, params);
      console.log(`Reset rate limits for user ${userId}${notificationType ? ` (type: ${notificationType})` : ''}`);
      return true;
    } catch (error) {
      console.error('Failed to reset user rate limits:', error);
      return false;
    }
  }

  // Get rate limit statistics
  public async getStatistics(): Promise<{
    totalRecords: number;
    activeUsers: number;
    topNotificationTypes: Array<{ type: string; count: number }>;
    averageEmailsPerUser: number;
  }> {
    try {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Get total active records
      const totalResult = await this.db.query(`
        SELECT COUNT(*) as total 
        FROM email_rate_limits 
        WHERE window_end > $1
      `, [now]);

      // Get active users
      const activeUsersResult = await this.db.query(`
        SELECT COUNT(DISTINCT user_id) as active_users 
        FROM email_rate_limits 
        WHERE window_end > $1
      `, [now]);

      // Get top notification types
      const topTypesResult = await this.db.query(`
        SELECT notification_type as type, SUM(email_count) as count
        FROM email_rate_limits 
        WHERE window_start >= $1
        GROUP BY notification_type 
        ORDER BY count DESC 
        LIMIT 10
      `, [oneDayAgo]);

      // Get average emails per user
      const avgResult = await this.db.query(`
        SELECT AVG(email_count) as avg_emails
        FROM email_rate_limits 
        WHERE window_start >= $1
      `, [oneDayAgo]);

      return {
        totalRecords: parseInt(totalResult.rows[0]?.total || '0'),
        activeUsers: parseInt(activeUsersResult.rows[0]?.active_users || '0'),
        topNotificationTypes: topTypesResult.rows.map((row: any) => ({
          type: row.type,
          count: parseInt(row.count)
        })),
        averageEmailsPerUser: parseFloat(avgResult.rows[0]?.avg_emails || '0')
      };
    } catch (error) {
      console.error('Failed to get rate limit statistics:', error);
      return {
        totalRecords: 0,
        activeUsers: 0,
        topNotificationTypes: [],
        averageEmailsPerUser: 0
      };
    }
  }
}

export const rateLimitService = new RateLimitService();