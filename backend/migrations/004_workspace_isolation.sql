-- Migration 004: Add workspace isolation for multi-tenant support
-- This migration adds workspace functionality to enable data isolation between different organizations

-- Create workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    owner_id UUID NOT NULL REFERENCES users(id),
    settings JSONB DEFAULT '{
        "features": {
            "team_management": true,
            "advanced_reporting": true,
            "webhooks": true,
            "custom_fields": false
        },
        "limits": {
            "max_projects": 100,
            "max_users": 50,
            "max_storage_gb": 10
        }
    }',
    subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'professional', 'enterprise')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create workspace members table
CREATE TABLE IF NOT EXISTS workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    invited_by UUID REFERENCES users(id),
    
    UNIQUE(workspace_id, user_id)
);

-- Add workspace_id to existing tables
ALTER TABLE project_management.projects 
    ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;

ALTER TABLE teams 
    ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;

-- Only add workspace_id to webhooks if the table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'webhooks'
    ) THEN
        ALTER TABLE webhooks 
            ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add default workspace for existing data
DO $$
DECLARE
    default_workspace_id UUID;
    first_admin_id UUID;
BEGIN
    -- Find the first admin user to be the default workspace owner
    SELECT id INTO first_admin_id FROM users 
    WHERE role = 'admin' 
    ORDER BY created_at 
    LIMIT 1;
    
    -- If no admin found, use the first user
    IF first_admin_id IS NULL THEN
        SELECT id INTO first_admin_id FROM users 
        ORDER BY created_at 
        LIMIT 1;
    END IF;
    
    -- Only create default workspace if we have users
    IF first_admin_id IS NOT NULL THEN
        -- Create a default workspace for existing data
        INSERT INTO workspaces (name, slug, description, owner_id, subscription_tier)
        VALUES (
            'Default Workspace',
            'default-workspace',
            'Default workspace for migrated data',
            first_admin_id,
            'professional'
        )
        RETURNING id INTO default_workspace_id;
        
        -- Add all existing users to the default workspace
        INSERT INTO workspace_members (workspace_id, user_id, role)
        SELECT 
            default_workspace_id,
            u.id,
            CASE 
                WHEN u.id = first_admin_id THEN 'owner'
                WHEN u.role = 'admin' THEN 'admin'
                ELSE 'member'
            END
        FROM users u
        ON CONFLICT (workspace_id, user_id) DO NOTHING;
        
        -- Update existing projects
        UPDATE project_management.projects 
        SET workspace_id = default_workspace_id 
        WHERE workspace_id IS NULL;
        
        -- Update existing teams
        UPDATE teams 
        SET workspace_id = default_workspace_id 
        WHERE workspace_id IS NULL;
        
        -- Update existing webhooks if table exists
        IF EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'webhooks'
        ) THEN
            UPDATE webhooks 
            SET workspace_id = default_workspace_id 
            WHERE workspace_id IS NULL;
        END IF;
    END IF;
END $$;

-- Now make workspace_id NOT NULL after populating existing data
ALTER TABLE project_management.projects 
    ALTER COLUMN workspace_id SET NOT NULL;

ALTER TABLE teams 
    ALTER COLUMN workspace_id SET NOT NULL;

-- Webhooks can be workspace-specific or global, so we keep it nullable

-- Create workspace invitations table
CREATE TABLE IF NOT EXISTS workspace_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'member')),
    invited_by UUID NOT NULL REFERENCES users(id),
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    accepted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(workspace_id, email)
);

-- Add workspace context to user sessions
ALTER TABLE user_sessions
    ADD COLUMN IF NOT EXISTS current_workspace_id UUID REFERENCES workspaces(id);

-- Add workspace-specific user preferences
ALTER TABLE user_preferences
    ADD COLUMN IF NOT EXISTS workspace_preferences JSONB DEFAULT '{}';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workspaces_slug ON workspaces(slug);
CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_active ON workspaces(is_active);

CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_role ON workspace_members(role);

CREATE INDEX IF NOT EXISTS idx_projects_workspace ON project_management.projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_teams_workspace ON teams(workspace_id);

-- Only create webhooks index if table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'webhooks'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_webhooks_workspace ON webhooks(workspace_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_workspace_invitations_token ON workspace_invitations(token);
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_expires ON workspace_invitations(expires_at);

-- Update activity logs to include workspace context
ALTER TABLE activity_logs
    ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_activity_logs_workspace ON activity_logs(workspace_id);

-- Create a view for workspace statistics
CREATE OR REPLACE VIEW workspace_statistics AS
SELECT 
    w.id as workspace_id,
    w.name as workspace_name,
    w.subscription_tier,
    COUNT(DISTINCT wm.user_id) as total_users,
    COUNT(DISTINCT p.id) as total_projects,
    COUNT(DISTINCT t.id) as total_teams,
    COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END) as active_projects,
    COUNT(DISTINCT CASE WHEN p.status = 'completed' THEN p.id END) as completed_projects,
    w.created_at as workspace_created_at
FROM workspaces w
LEFT JOIN workspace_members wm ON w.id = wm.workspace_id
LEFT JOIN project_management.projects p ON w.id = p.workspace_id
LEFT JOIN teams t ON w.id = t.workspace_id
GROUP BY w.id, w.name, w.subscription_tier, w.created_at;

-- Update the updated_at trigger to include workspaces
DROP TRIGGER IF EXISTS update_workspaces_updated_at ON workspaces;
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add workspace isolation check function
CREATE OR REPLACE FUNCTION check_workspace_access(
    p_user_id UUID,
    p_workspace_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    has_access BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM workspace_members
        WHERE user_id = p_user_id 
        AND workspace_id = p_workspace_id
    ) INTO has_access;
    
    RETURN has_access;
END;
$$ LANGUAGE plpgsql;

-- Add RLS (Row Level Security) policies for workspace isolation
-- Note: These are commented out by default. Enable them after testing
-- ALTER TABLE project_management.projects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- Create policies for workspace isolation (commented out)
-- CREATE POLICY workspace_projects_policy ON project_management.projects
--     FOR ALL
--     USING (workspace_id IN (
--         SELECT workspace_id FROM workspace_members WHERE user_id = current_user_id()
--     ));

-- CREATE POLICY workspace_teams_policy ON teams
--     FOR ALL
--     USING (workspace_id IN (
--         SELECT workspace_id FROM workspace_members WHERE user_id = current_user_id()
--     ));

COMMENT ON TABLE workspaces IS 'Multi-tenant workspaces for data isolation';
COMMENT ON TABLE workspace_members IS 'Workspace membership and roles';
COMMENT ON TABLE workspace_invitations IS 'Pending workspace invitations';
COMMENT ON COLUMN workspaces.subscription_tier IS 'Subscription level determining feature access';
COMMENT ON FUNCTION check_workspace_access IS 'Verify user has access to a specific workspace';