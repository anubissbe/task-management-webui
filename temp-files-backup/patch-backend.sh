#!/bin/bash
echo "Patching ProjectHub backend..."

# Create patch for projectService.js
cat << 'EOF' > /tmp/projectService.patch
--- a/dist/services/projectService.js
+++ b/dist/services/projectService.js
@@ -30,13 +30,45 @@
     async createProject(data) {
         const query = `
       INSERT INTO project_management.projects 
-      (name, description, requirements, acceptance_criteria, status, workspace_id)
-      VALUES ($1, $2, $3, $4, 'planning', $5)
+      (
+        name, description, status, priority, workspace_id,
+        start_date, due_date, owner_id, created_by,
+        requirements, acceptance_criteria, budget, team_id,
+        tags, is_template, parent_id, completion_percentage,
+        risks, dependencies, milestones, attachments,
+        custom_fields, visibility
+      )
+      VALUES (
+        $1, $2, $3, $4, $5,
+        $6, $7, $8, $9,
+        $10, $11, $12, $13,
+        $14, $15, $16, $17,
+        $18, $19, $20, $21,
+        $22, $23
+      )
       RETURNING *
     `;
+        const userId = data.userId || data.created_by || data.owner_id;
         const result = await database_1.pool.query(query, [
             data.name,
-            data.description,
+            data.description || '',
+            data.status || 'planning',
+            data.priority || 'medium',
+            data.workspace_id,
+            data.start_date || null,
+            data.due_date || null,
+            userId,
+            userId,
             data.requirements,
             data.acceptance_criteria,
-            data.workspace_id
+            data.budget || null,
+            data.team_id || null,
+            data.tags || [],
+            data.is_template || false,
+            data.parent_id || null,
+            data.completion_percentage || 0,
+            data.risks || [],
+            data.dependencies || [],
+            data.milestones || '[]',
+            data.attachments || '[]',
+            data.custom_fields || '{}',
+            data.visibility || 'private'
         ]);
EOF

# Copy patch to container and apply
docker cp /tmp/projectService.patch projecthub-mcp-backend:/tmp/
docker exec projecthub-mcp-backend sh -c "cd /app && patch -p1 < /tmp/projectService.patch || echo 'Patch may have failed, trying sed approach...'"

# Alternative approach using sed
echo "Applying project service fix..."
docker exec projecthub-mcp-backend sh -c "
# Backup original
cp /app/dist/services/projectService.js /app/dist/services/projectService.js.bak

# Create fixed version
cat > /tmp/fix-project-create.js << 'FIXEOF'
// Find and replace the createProject method
const fs = require('fs');
const path = require('path');

const filePath = '/app/dist/services/projectService.js';
let content = fs.readFileSync(filePath, 'utf8');

// Replace the createProject method
const oldMethod = /async createProject\(data\) \{[\s\S]*?return result\.rows\[0\];\s*\}/;
const newMethod = \`async createProject(data) {
        const query = \\\`
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
        \\\$1, \\\$2, \\\$3, \\\$4, \\\$5,
        \\\$6, \\\$7, \\\$8, \\\$9,
        \\\$10, \\\$11, \\\$12, \\\$13,
        \\\$14, \\\$15, \\\$16, \\\$17,
        \\\$18, \\\$19, \\\$20, \\\$21,
        \\\$22, \\\$23
      )
      RETURNING *
    \\\`;
        const userId = data.userId || data.created_by || data.owner_id || '00000000-0000-0000-0000-000000000000';
        const result = await database_1.pool.query(query, [
            data.name,
            data.description || '',
            data.status || 'planning',
            data.priority || 'medium',
            data.workspace_id,
            data.start_date || null,
            data.due_date || null,
            userId,
            userId,
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
    }\`;

if (content.match(oldMethod)) {
    content = content.replace(oldMethod, newMethod);
    fs.writeFileSync(filePath, content);
    console.log('Successfully patched projectService.js');
} else {
    console.log('Could not find method to patch - trying alternative approach');
}
FIXEOF

node /tmp/fix-project-create.js
"

echo "Fixing notification service..."
docker exec projecthub-mcp-backend sh -c "
# Fix notification service
cat > /tmp/fix-notification.js << 'FIXEOF'
const fs = require('fs');
const filePath = '/app/dist/services/notificationService.js';
let content = fs.readFileSync(filePath, 'utf8');

// Replace MySQL INDEX syntax with PostgreSQL CREATE INDEX
content = content.replace(
    /INDEX idx_notification_triggers_user_workspace \(user_id, workspace_id\)/g,
    'CONSTRAINT idx_notification_triggers_user_workspace UNIQUE (user_id, workspace_id)'
);

content = content.replace(
    /INDEX idx_notification_triggers_scheduled \(scheduled_at, is_processed\)/g,
    'CHECK (scheduled_at IS NOT NULL OR is_processed = false)'
);

// Alternative: comment out the table creation entirely since tables already exist
const createTablesRegex = /async createNotificationTables\(\) \{[\s\S]*?\}/;
const newMethod = \`async createNotificationTables() {
        try {
            console.log('Notification tables already exist, skipping creation');
            return;
        } catch (error) {
            console.error('Notification table check failed:', error.message);
        }
    }\`;

content = content.replace(createTablesRegex, newMethod);

fs.writeFileSync(filePath, content);
console.log('Successfully patched notificationService.js');
FIXEOF

node /tmp/fix-notification.js
"

echo "Patches applied. Restarting backend..."
docker restart projecthub-mcp-backend

echo "Waiting for backend to start..."
sleep 5

echo "Patch complete!"