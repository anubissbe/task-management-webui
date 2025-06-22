-- Permission Audit Log Migration
-- This migration adds permission audit logging functionality

-- Create permission audit log table
CREATE TABLE IF NOT EXISTS permission_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    resource_id UUID,
    granted BOOLEAN NOT NULL,
    context JSONB DEFAULT '{}',
    checked_at TIMESTAMP DEFAULT NOW(),
    
    -- Indexes for performance
    INDEX (user_id),
    INDEX (resource),
    INDEX (action),
    INDEX (checked_at),
    INDEX (granted)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_permission_audit_log_user_id ON permission_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_permission_audit_log_resource ON permission_audit_log(resource);
CREATE INDEX IF NOT EXISTS idx_permission_audit_log_action ON permission_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_permission_audit_log_checked_at ON permission_audit_log(checked_at);
CREATE INDEX IF NOT EXISTS idx_permission_audit_log_granted ON permission_audit_log(granted);
CREATE INDEX IF NOT EXISTS idx_permission_audit_log_resource_id ON permission_audit_log(resource_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_permission_audit_log_user_resource ON permission_audit_log(user_id, resource);
CREATE INDEX IF NOT EXISTS idx_permission_audit_log_resource_action ON permission_audit_log(resource, action);

-- Add comments for documentation
COMMENT ON TABLE permission_audit_log IS 'Audit trail for permission checks and authorization events';
COMMENT ON COLUMN permission_audit_log.resource IS 'The resource being accessed (e.g., projects, tasks, users)';
COMMENT ON COLUMN permission_audit_log.action IS 'The action being performed (e.g., read, write, delete)';
COMMENT ON COLUMN permission_audit_log.resource_id IS 'ID of the specific resource (optional)';
COMMENT ON COLUMN permission_audit_log.granted IS 'Whether the permission was granted or denied';
COMMENT ON COLUMN permission_audit_log.context IS 'Additional context about the permission check';

-- Create function to clean up old audit logs (older than 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_permission_audit_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM permission_audit_log 
    WHERE checked_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Create function to get permission statistics
CREATE OR REPLACE FUNCTION get_permission_stats(
    p_user_id UUID DEFAULT NULL,
    p_resource VARCHAR DEFAULT NULL,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    resource VARCHAR,
    action VARCHAR,
    total_checks BIGINT,
    granted_checks BIGINT,
    denied_checks BIGINT,
    success_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pal.resource,
        pal.action,
        COUNT(*) as total_checks,
        COUNT(*) FILTER (WHERE pal.granted = true) as granted_checks,
        COUNT(*) FILTER (WHERE pal.granted = false) as denied_checks,
        ROUND(
            (COUNT(*) FILTER (WHERE pal.granted = true)::NUMERIC / COUNT(*)) * 100, 
            2
        ) as success_rate
    FROM permission_audit_log pal
    WHERE 
        (p_user_id IS NULL OR pal.user_id = p_user_id)
        AND (p_resource IS NULL OR pal.resource = p_resource)
        AND pal.checked_at >= NOW() - (p_days || ' days')::INTERVAL
    GROUP BY pal.resource, pal.action
    ORDER BY pal.resource, pal.action;
END;
$$ LANGUAGE plpgsql;

COMMIT;