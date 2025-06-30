#!/bin/bash
echo "Applying simple backend patches..."

# Create a working backend patch
docker exec projecthub-mcp-backend sh -c '
# Backup files
cp /app/dist/services/projectService.js /app/dist/services/projectService.js.backup
cp /app/dist/services/notificationService.js /app/dist/services/notificationService.js.backup

# Fix notification service - just disable the problematic init
sed -i "s/await this.createNotificationTables();/console.log(\"Skipping notification table creation\");/" /app/dist/services/notificationService.js

# Fix project service - ensure defaults for required fields
cat > /tmp/fix.js << "EOF"
const fs = require("fs");
const file = "/app/dist/services/projectService.js";
let content = fs.readFileSync(file, "utf8");

// Find the createProject method and add default values
content = content.replace(
    "data.requirements,",
    "data.requirements || \"\","
);
content = content.replace(
    "data.acceptance_criteria,",
    "data.acceptance_criteria || \"\","
);

fs.writeFileSync(file, content);
console.log("Patched project service");
EOF

node /tmp/fix.js
'

echo "Patches applied!"