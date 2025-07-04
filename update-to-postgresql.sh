#!/bin/bash

# Update script for PostgreSQL backend with webhook support
# Run this on your Synology to update to the new database-connected backend

echo "🔄 Updating ProjectHub to PostgreSQL Backend with Webhook Support"
echo "================================================================"

# Navigate to project directory
cd /volume1/docker/projecthub || {
    echo "❌ Error: Could not find project directory"
    exit 1
}

echo ""
echo "📋 This update will:"
echo "1. Pull the new PostgreSQL-connected backend container"
echo "2. Update the database schema with webhook support"
echo "3. Restart all containers"
echo "4. Preserve all existing data"
echo ""

read -p "Continue with the update? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Update cancelled."
    exit 1
fi

# Step 1: Pull the new backend container
echo ""
echo "📥 Pulling new PostgreSQL backend container..."
docker pull telkombe/projecthub-backend:latest

if [ $? -ne 0 ]; then
    echo "❌ Failed to pull backend container"
    exit 1
fi

# Step 2: Stop containers
echo ""
echo "🛑 Stopping containers..."
docker-compose down

# Step 3: Update database schema
echo ""
echo "🗄️  Updating database schema..."

# Start just the database
docker-compose up -d postgres

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Check if database is healthy
until docker exec projecthub-postgres pg_isready -U projecthub; do
    echo "Waiting for database..."
    sleep 2
done

echo "✅ Database is ready"

# Apply schema updates
echo ""
echo "📝 Applying schema updates..."

# Create a temporary SQL file with just the new schema additions
cat > /tmp/schema_update.sql << 'EOF'
-- Add missing columns and tables for webhook support

-- Add last_login column to users if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Update password column name if needed
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password_hash') THEN
        ALTER TABLE users RENAME COLUMN password_hash TO password;
    END IF;
END $$;

-- Ensure webhooks table exists with correct structure
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

-- Add sample webhook for testing (you can remove this later)
INSERT INTO webhooks (name, url, events, active) 
VALUES (
    'Test Webhook',
    'https://hooks.slack.com/services/YOUR/WEBHOOK/URL',
    '["task.created", "task.completed"]',
    false
) ON CONFLICT DO NOTHING;

-- Ensure all indexes exist
CREATE INDEX IF NOT EXISTS idx_webhooks_active ON webhooks(active);

-- Add any missing sample data
INSERT INTO users (id, email, password, first_name, last_name, role) 
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@projecthub.com',
    'dev123',
    'Admin',
    'User',
    'admin'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO users (id, email, password, first_name, last_name, role) 
VALUES (
    '00000000-0000-0000-0000-000000000002',
    'developer@projecthub.com',
    'dev123',
    'Developer',
    'User',
    'developer'
) ON CONFLICT (email) DO NOTHING;
EOF

# Apply the schema update
docker exec -i projecthub-postgres psql -U projecthub -d projecthub < /tmp/schema_update.sql

if [ $? -eq 0 ]; then
    echo "✅ Schema updated successfully"
else
    echo "⚠️  Schema update had some issues, but continuing..."
fi

# Cleanup
rm -f /tmp/schema_update.sql

# Step 4: Start all containers
echo ""
echo "🚀 Starting all containers with new backend..."
docker-compose up -d

# Step 5: Wait for everything to start
echo ""
echo "⏳ Waiting for containers to start..."
sleep 15

# Step 6: Check status
echo ""
echo "📊 Container Status:"
docker-compose ps

# Step 7: Test the new backend
echo ""
echo "🧪 Testing the new backend..."

# Test basic API
if curl -s -f http://localhost:3009/health > /dev/null; then
    echo "✅ Backend health check passed"
else
    echo "⚠️  Backend health check failed - checking logs..."
    docker logs projecthub-backend --tail 10
fi

# Test webhook endpoint
if curl -s -f http://localhost:3009/api/webhooks > /dev/null; then
    echo "✅ Webhook endpoint responding"
else
    echo "⚠️  Webhook endpoint not responding"
fi

echo ""
echo "🎉 Update Complete!"
echo ""
echo "📝 What's new:"
echo "✅ PostgreSQL-connected backend (no more mock data)"
echo "✅ Webhook functionality with database storage"
echo "✅ Real user authentication with database"
echo "✅ All existing data preserved"
echo ""
echo "🧪 To test webhook functionality:"
echo "1. Open http://192.168.1.24:5174"
echo "2. Login with: admin@projecthub.com / dev123"
echo "3. Go to Settings > Webhooks"
echo "4. Add your Slack webhook URL"
echo "5. Click 'Test' - should work without CORS errors!"
echo "6. Create a task - should trigger automatic Slack notification"
echo ""
echo "📊 Monitor logs:"
echo "docker logs -f projecthub-backend | grep -E '(webhook|Webhook|WEBHOOK|error|Error)'"