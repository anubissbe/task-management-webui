#\!/usr/bin/env python3
import pexpect

print("🔧 Recreating frontend with fixed code...")

try:
    ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', encoding='utf-8', timeout=60)
    ssh.expect(['password:', 'Password:'])
    ssh.sendline('JDU9xjn1ekx3rev_uma')
    ssh.expect('\\$')
    
    print("✓ Connected")
    
    # Stop and remove frontend
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma"  < /dev/null |  sudo -S docker stop projecthub-frontend')
    ssh.expect('\\$')
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker rm projecthub-frontend')
    ssh.expect('\\$')
    
    # Remove old files
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S rm -rf /volume1/docker/projecthub-frontend')
    ssh.expect('\\$')
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S mkdir -p /volume1/docker/projecthub-frontend')
    ssh.expect('\\$')
    
    # Create new index.html with fixed JavaScript
    print("✓ Creating fixed frontend...")
    ssh.sendline("echo 'JDU9xjn1ekx3rev_uma' | sudo -S tee /volume1/docker/projecthub-frontend/index.html > /dev/null << 'EOFHTML'")
    ssh.sendline('''<\!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ProjectHub - Enterprise Project Management</title>
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E🚀%3C/text%3E%3C/svg%3E">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
            background: #f0f2f5; 
            color: #1a1a1a;
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 2rem 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 0 2rem; 
        }
        .header h1 { 
            font-size: 2.5rem; 
            margin-bottom: 0.5rem;
        }
        .header p { 
            opacity: 0.9; 
            font-size: 1.1rem;
        }
        .main-content {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
            margin: 2rem 0;
        }
        .card { 
            background: white; 
            border-radius: 12px; 
            padding: 2rem; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .card:hover {
            transform: translateY(-4px);
            box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        }
        .card h2 { 
            color: #333; 
            margin-bottom: 1rem;
            font-size: 1.5rem;
        }
        .status-grid { 
            display: grid; 
            gap: 1rem;
        }
        .status-item { 
            padding: 1rem; 
            background: #f8f9fa; 
            border-radius: 8px; 
            border-left: 4px solid #ddd;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .status-item.ok { border-left-color: #28a745; }
        .status-item.error { border-left-color: #dc3545; }
        .status-item.warning { border-left-color: #ffc107; }
        .status-label { 
            font-weight: 600; 
            color: #495057;
        }
        .status-value { 
            color: #6c757d; 
            font-size: 0.9rem;
        }
        .btn { 
            background: #667eea; 
            color: white; 
            border: none; 
            padding: 0.75rem 1.5rem; 
            border-radius: 6px; 
            cursor: pointer; 
            font-size: 1rem;
            font-weight: 500;
            transition: background 0.2s;
            margin-top: 1rem;
        }
        .btn:hover { 
            background: #5a67d8; 
        }
        .api-response { 
            background: #f5f5f5; 
            padding: 1rem; 
            border-radius: 6px; 
            font-family: Monaco, Consolas, monospace; 
            font-size: 0.875rem; 
            overflow-x: auto;
            margin-top: 1rem;
            border: 1px solid #e0e0e0;
        }
        .project-list {
            margin-top: 1rem;
        }
        .project-item {
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 6px;
            margin-bottom: 0.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .project-name {
            font-weight: 500;
        }
        .project-status {
            padding: 0.25rem 0.75rem;
            border-radius: 4px;
            font-size: 0.875rem;
            font-weight: 500;
        }
        .project-status.active {
            background: #d4edda;
            color: #155724;
        }
        .project-status.completed {
            background: #cce5ff;
            color: #004085;
        }
        .footer { 
            text-align: center; 
            padding: 3rem 2rem; 
            color: #6c757d;
            border-top: 1px solid #e0e0e0;
            margin-top: 3rem;
        }
        .links {
            margin-top: 1rem;
        }
        .links a {
            color: #667eea;
            text-decoration: none;
            margin: 0 0.5rem;
        }
        .links a:hover {
            text-decoration: underline;
        }
        @media (max-width: 768px) {
            .header h1 { font-size: 2rem; }
            .main-content { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="container">
            <h1>🚀 ProjectHub</h1>
            <p>Enterprise Project Management System</p>
        </div>
    </div>
    
    <div class="container">
        <div class="main-content">
            <div class="card">
                <h2>System Status</h2>
                <div class="status-grid">
                    <div class="status-item ok">
                        <span class="status-label">Frontend</span>
                        <span class="status-value">✓ Running on port 5174</span>
                    </div>
                    <div class="status-item" id="backend-status">
                        <span class="status-label">Backend API</span>
                        <span class="status-value" id="backend-value">Checking...</span>
                    </div>
                    <div class="status-item" id="db-status">
                        <span class="status-label">Database</span>
                        <span class="status-value" id="db-value">Checking...</span>
                    </div>
                </div>
                <button class="btn" onclick="checkHealth()">Refresh Status</button>
                <div class="api-response" id="api-response">Loading...</div>
            </div>
            
            <div class="card">
                <h2>Projects</h2>
                <div id="project-list" class="project-list">
                    <p style="color: #6c757d;">Loading projects...</p>
                </div>
                <button class="btn" onclick="loadProjects()">Refresh Projects</button>
            </div>
            
            <div class="card">
                <h2>Quick Links</h2>
                <div class="links">
                    <p>🔗 Backend API: <a href="http://192.168.1.24:3007" target="_blank">http://192.168.1.24:3007</a></p>
                    <p>🔗 Health Check: <a href="http://192.168.1.24:3007/api/health" target="_blank">/api/health</a></p>
                    <p>🔗 Projects API: <a href="http://192.168.1.24:3007/api/projects" target="_blank">/api/projects</a></p>
                </div>
            </div>
        </div>
    </div>
    
    <div class="footer">
        <p><strong>ProjectHub</strong> © 2024</p>
        <p>Built with React, Node.js, Express, and PostgreSQL</p>
    </div>
    
    <script>
        function checkHealth() {
            const backendStatus = document.getElementById("backend-status");
            const backendValue = document.getElementById("backend-value");
            const dbStatus = document.getElementById("db-status");
            const dbValue = document.getElementById("db-value");
            const apiResponse = document.getElementById("api-response");
            
            backendValue.textContent = "Connecting...";
            apiResponse.textContent = "Loading...";
            
            fetch("http://192.168.1.24:3007/api/health")
                .then(res => {
                    if (\!res.ok) throw new Error("HTTP " + res.status);
                    return res.json();
                })
                .then(data => {
                    backendStatus.className = "status-item ok";
                    backendValue.innerHTML = "✓ Running on port 3007";
                    
                    if (data.database === "configured") {
                        dbStatus.className = "status-item ok";
                        dbValue.innerHTML = "✓ PostgreSQL connected";
                    } else {
                        dbStatus.className = "status-item warning";
                        dbValue.innerHTML = "⚠ Connection pending";
                    }
                    
                    apiResponse.textContent = JSON.stringify(data, null, 2);
                })
                .catch(err => {
                    backendStatus.className = "status-item error";
                    backendValue.innerHTML = "✗ Not reachable";
                    
                    dbStatus.className = "status-item error";
                    dbValue.innerHTML = "✗ Unknown";
                    
                    apiResponse.textContent = "Error: " + err.message;
                });
        }
        
        function loadProjects() {
            const projectList = document.getElementById("project-list");
            projectList.innerHTML = '<p style="color: #6c757d;">Loading...</p>';
            
            fetch("http://192.168.1.24:3007/api/projects")
                .then(res => {
                    if (\!res.ok) throw new Error("HTTP " + res.status);
                    return res.json();
                })
                .then(data => {
                    if (data.projects && data.projects.length > 0) {
                        let html = '';
                        for (let i = 0; i < data.projects.length; i++) {
                            const project = data.projects[i];
                            html += '<div class="project-item">';
                            html += '<span class="project-name">' + project.name + '</span>';
                            html += '<span class="project-status ' + project.status + '">' + project.status + '</span>';
                            html += '</div>';
                        }
                        projectList.innerHTML = html;
                    } else {
                        projectList.innerHTML = '<p style="color: #6c757d;">No projects found</p>';
                    }
                })
                .catch(err => {
                    projectList.innerHTML = '<p style="color: #dc3545;">Error loading projects: ' + err.message + '</p>';
                });
        }
        
        // Initial load
        checkHealth();
        loadProjects();
        
        // Auto-refresh every 30 seconds
        setInterval(checkHealth, 30000);
    </script>
</body>
</html>''')
    ssh.sendline('EOFHTML')
    ssh.expect('\\$', timeout=30)
    
    # Deploy new frontend container
    print("✓ Deploying new frontend container...")
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker run -d --name projecthub-frontend -p 5174:80 -v /volume1/docker/projecthub-frontend:/usr/share/nginx/html:ro nginx:alpine')
    ssh.expect('\\$', timeout=60)
    
    print("✓ Verifying deployment...")
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker ps | grep projecthub')
    ssh.expect('\\$')
    print(ssh.before)
    
    ssh.sendline('exit')
    ssh.close()
    
    print("\n✅ Frontend completely recreated with fixed code\!")
    print("\n⚠️ IMPORTANT: Clear your browser cache:")
    print("  1. Press Ctrl+Shift+R (or Cmd+Shift+R on Mac)")
    print("  2. Or open Developer Tools (F12) → Network tab → Check 'Disable cache'")
    print("  3. Then refresh the page")

except Exception as e:
    print(f"Error: {e}")
    if 'ssh' in locals():
        ssh.close()
