-- ProjectHub Database Schema
-- This creates an empty database ready for data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'planning',
    priority VARCHAR(50) DEFAULT 'medium',
    start_date DATE,
    end_date DATE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'todo',
    priority VARCHAR(50) DEFAULT 'medium',
    assignee_id UUID REFERENCES users(id),
    assignee VARCHAR(50), -- For display purposes
    due_date DATE,
    estimated_hours INTEGER,
    actual_hours INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    events JSONB DEFAULT '[]',
    active BOOLEAN DEFAULT true,
    secret VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_triggered TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_tasks_status ON tasks(status);

-- Create update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for development/testing

-- Insert default admin user (password: dev123)
INSERT INTO users (id, email, password, first_name, last_name, role) 
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@projecthub.com',
    'dev123',
    'Admin',
    'User',
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- Insert developer user (password: dev123)
INSERT INTO users (id, email, password, first_name, last_name, role) 
VALUES (
    '00000000-0000-0000-0000-000000000002',
    'developer@projecthub.com',
    'dev123',
    'Developer',
    'User',
    'developer'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample projects
INSERT INTO projects (id, name, description, status, priority, created_by) 
VALUES 
    (
        '00000000-0000-0000-0000-000000000001',
        'Website Redesign',
        'Complete redesign of the company website with modern UI/UX',
        'planning',
        'high',
        '00000000-0000-0000-0000-000000000001'
    ),
    (
        '00000000-0000-0000-0000-000000000002',
        'Mobile App Development',
        'Develop a mobile application for iOS and Android',
        'active',
        'medium',
        '00000000-0000-0000-0000-000000000001'
    ),
    (
        '00000000-0000-0000-0000-000000000003',
        'API Documentation',
        'Create comprehensive API documentation for developers',
        'completed',
        'low',
        '00000000-0000-0000-0000-000000000002'
    )
ON CONFLICT (id) DO NOTHING;

-- Insert sample tasks
INSERT INTO tasks (id, title, description, project_id, status, priority, assignee_id, assignee) 
VALUES 
    (
        '00000000-0000-0000-0000-000000000001',
        'Design homepage mockup',
        'Create initial design mockups for the new homepage',
        '00000000-0000-0000-0000-000000000001',
        'todo',
        'high',
        '00000000-0000-0000-0000-000000000002',
        'Developer User'
    ),
    (
        '00000000-0000-0000-0000-000000000002',
        'Setup development environment',
        'Configure local development environment for the project',
        '00000000-0000-0000-0000-000000000001',
        'in_progress',
        'medium',
        '00000000-0000-0000-0000-000000000002',
        'Developer User'
    ),
    (
        '00000000-0000-0000-0000-000000000003',
        'Create user authentication flow',
        'Implement login and registration functionality',
        '00000000-0000-0000-0000-000000000002',
        'pending',
        'high',
        '00000000-0000-0000-0000-000000000001',
        'Admin User'
    ),
    (
        '00000000-0000-0000-0000-000000000004',
        'Write API endpoints documentation',
        'Document all REST API endpoints with examples',
        '00000000-0000-0000-0000-000000000003',
        'completed',
        'medium',
        '00000000-0000-0000-0000-000000000002',
        'Developer User'
    ),
    (
        '00000000-0000-0000-0000-000000000005',
        'Test webhook integration',
        'Test Slack webhook notifications for task updates',
        '00000000-0000-0000-0000-000000000001',
        'pending',
        'low',
        '00000000-0000-0000-0000-000000000001',
        'Admin User'
    )
ON CONFLICT (id) DO NOTHING;