// Script to fix backend issues in the running container
const fs = require('fs');

// Fixed ProjectService createProject method
const fixedCreateProject = `
    async createProject(data) {
        const query = \`
      INSERT INTO project_management.projects 
      (
        name, description, status, priority, workspace_id,
        start_date, due_date, owner_id, created_by,
        requirements, acceptance_criteria, budget, team_id,
        tags, is_template, parent_id, completion_percentage,
        risks, dependencies, milestones, attachments,
        custom_fields, visibility
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9,
        $10, $11, $12, $13,
        $14, $15, $16, $17,
        $18, $19, $20, $21,
        $22, $23
      )
      RETURNING *
    \`;
        
        // Get current user ID from context (assuming it's passed in data)
        const userId = data.userId || data.created_by;
        
        const result = await database_1.pool.query(query, [
            data.name,
            data.description || '',
            data.status || 'planning',
            data.priority || 'medium',
            data.workspace_id,
            data.start_date || null,
            data.due_date || null,
            userId, // owner_id
            userId, // created_by
            data.requirements || '',
            data.acceptance_criteria || '',
            data.budget || null,
            data.team_id || null,
            data.tags || [],
            data.is_template || false,
            data.parent_id || null,
            data.completion_percentage || 0,
            data.risks || [],
            data.dependencies || [],
            data.milestones || '[]',
            data.attachments || '[]',
            data.custom_fields || '{}',
            data.visibility || 'private'
        ]);
        return result.rows[0];
    }
`;

// Fixed notification service to use PostgreSQL syntax
const fixedNotificationService = `
    async createNotificationTables() {
        try {
            // Create notification triggers table with PostgreSQL syntax
            await this.db.query(\`
      CREATE TABLE IF NOT EXISTS notification_triggers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(50) NOT NULL,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
        trigger_data JSONB NOT NULL DEFAULT '{}',
        scheduled_at TIMESTAMP,
        is_processed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
    \`);
            
            // Create indexes separately (PostgreSQL style)
            await this.db.query(\`
      CREATE INDEX IF NOT EXISTS idx_notification_triggers_user_workspace 
      ON notification_triggers(user_id, workspace_id);
    \`);
            
            await this.db.query(\`
      CREATE INDEX IF NOT EXISTS idx_notification_triggers_scheduled 
      ON notification_triggers(scheduled_at, is_processed);
    \`);
            
            // Create notification preferences table
            await this.db.query(\`
      CREATE TABLE IF NOT EXISTS notification_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        channel VARCHAR(50) NOT NULL,
        enabled BOOLEAN DEFAULT true,
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, channel)
      );
    \`);
            
            // Create sent notifications table
            await this.db.query(\`
      CREATE TABLE IF NOT EXISTS sent_notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        channel VARCHAR(50) NOT NULL,
        subject TEXT,
        content TEXT,
        metadata JSONB DEFAULT '{}',
        status VARCHAR(20) DEFAULT 'sent',
        sent_at TIMESTAMP DEFAULT NOW()
      );
    \`);
            
            // Create indexes for sent notifications
            await this.db.query(\`
      CREATE INDEX IF NOT EXISTS idx_sent_notifications_user 
      ON sent_notifications(user_id);
    \`);
            
            await this.db.query(\`
      CREATE INDEX IF NOT EXISTS idx_sent_notifications_sent_at 
      ON sent_notifications(sent_at);
    \`);
            
            console.log('Notification tables created successfully');
        } catch (error) {
            console.error('Failed to create notification tables:', error.message);
            // Don't throw - allow service to continue without notifications
        }
    }
`;

console.log(`
Backend Fix Instructions:
========================

1. The project creation issue is in the INSERT query missing required columns.
2. The notification service uses MySQL syntax instead of PostgreSQL.

To fix these issues, the backend container needs to be patched or rebuilt.
Since we're using pre-built images, we'll create a patching mechanism.
`);