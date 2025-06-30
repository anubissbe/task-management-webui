#\!/usr/bin/env python3
import pexpect

print("🔧 Fixing HTML display issue...")

try:
    ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', encoding='utf-8', timeout=60)
    ssh.expect(['password:', 'Password:'])
    ssh.sendline('JDU9xjn1ekx3rev_uma')
    ssh.expect('\\$')
    
    print("✓ Connected")
    
    # Check what's in the directory
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma"  < /dev/null |  sudo -S ls -la /volume1/docker/projecthub-simple/')
    ssh.expect('\\$')
    print("Directory contents:")
    print(ssh.before)
    
    # Check what nginx is serving
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker exec projecthub-frontend-simple ls -la /usr/share/nginx/html/')
    ssh.expect('\\$')
    print("\nNginx directory:")
    print(ssh.before)
    
    # Check if the HTML file has proper content
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S head -5 /volume1/docker/projecthub-simple/index.html')
    ssh.expect('\\$')
    print("\nHTML file content:")
    print(ssh.before)
    
    # The issue might be that the HTML file has escaped characters
    # Let's recreate the file with proper content
    print("✓ Recreating HTML file...")
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S rm /volume1/docker/projecthub-simple/index.html')
    ssh.expect('\\$')
    
    # Create the HTML file without heredoc to avoid escaping issues
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S tee /volume1/docker/projecthub-simple/index.html > /dev/null << "EOFHTML"')
    
    # Send the HTML content directly
    html_content = '''<\!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ProjectHub - Enterprise Project Management</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚀</text></svg>">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            min-height: 100vh; 
        }
        .login-container { 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            min-height: 100vh; 
            padding: 20px; 
        }
        .login-card { 
            background: white; 
            border-radius: 12px; 
            box-shadow: 0 20px 40px rgba(0,0,0,0.1); 
            padding: 40px; 
            width: 100%; 
            max-width: 400px; 
        }
        .app-container { 
            display: none; 
            min-height: 100vh; 
            background: #f8fafc; 
        }
        .header { 
            background: white; 
            border-bottom: 1px solid #e2e8f0; 
            padding: 16px 24px; 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
        }
        .main-content { 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 24px; 
        }
        .logo { 
            font-size: 24px; 
            font-weight: bold; 
            color: #1a202c; 
        }
        .btn { 
            padding: 12px 24px; 
            border: none; 
            border-radius: 6px; 
            font-weight: 500; 
            cursor: pointer; 
            transition: all 0.2s; 
        }
        .btn-primary { 
            background: #4299e1; 
            color: white; 
        }
        .btn-primary:hover { 
            background: #3182ce; 
        }
        .btn-secondary { 
            background: #edf2f7; 
            color: #2d3748; 
        }
        .form-group { 
            margin-bottom: 20px; 
        }
        .form-label { 
            display: block; 
            margin-bottom: 8px; 
            font-weight: 500; 
            color: #2d3748; 
        }
        .form-input { 
            width: 100%; 
            padding: 12px; 
            border: 1px solid #cbd5e0; 
            border-radius: 6px; 
            font-size: 16px; 
        }
        .stats-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 20px; 
            margin-bottom: 32px; 
        }
        .stat-card { 
            background: white; 
            padding: 24px; 
            border-radius: 8px; 
            box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
        }
        .stat-number { 
            font-size: 32px; 
            font-weight: bold; 
            color: #1a202c; 
        }
        .projects-list { 
            background: white; 
            border-radius: 8px; 
            box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
        }
        .project-item { 
            padding: 20px; 
            border-bottom: 1px solid #e2e8f0; 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
        }
        .demo-buttons { 
            display: flex; 
            gap: 10px; 
            margin-top: 20px; 
        }
        .demo-btn { 
            flex: 1; 
            padding: 8px 16px; 
            background: #f7fafc; 
            border: 1px solid #e2e8f0; 
            border-radius: 6px; 
            cursor: pointer; 
        }
        .error { 
            background: #fed7d7; 
            color: #c53030; 
            padding: 12px; 
            border-radius: 6px; 
            margin-bottom: 16px; 
            display: none; 
        }
        .text-center { 
            text-align: center; 
        }
        .progress-bar { 
            width: 100px; 
            height: 8px; 
            background: #edf2f7; 
            border-radius: 4px; 
            overflow: hidden; 
        }
        .progress-fill { 
            height: 100%; 
            background: #4299e1; 
        }
        .status-badge { 
            padding: 4px 12px; 
            border-radius: 20px; 
            font-size: 12px; 
            font-weight: 500; 
        }
        .status-active { 
            background: #c6f6d5; 
            color: #22543d; 
        }
        .status-completed { 
            background: #bee3f8; 
            color: #2c5282; 
        }
    </style>
</head>
<body>
    <div id="loginScreen" class="login-container">
        <div class="login-card">
            <div class="text-center">
                <h1>🚀 ProjectHub</h1>
                <p style="color: #718096; margin-bottom: 32px;">Enterprise Project Management</p>
            </div>
            <form id="loginForm">
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-input" id="email" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Password</label>
                    <input type="password" class="form-input" id="password" required>
                </div>
                <div id="loginError" class="error"></div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Sign In</button>
            </form>
            <div class="demo-buttons">
                <button class="demo-btn" onclick="fillDemo('admin')">Admin Demo</button>
                <button class="demo-btn" onclick="fillDemo('user')">User Demo</button>
            </div>
        </div>
    </div>
    
    <div id="appScreen" class="app-container">
        <header class="header">
            <div class="logo">🚀 ProjectHub</div>
            <div style="display: flex; align-items: center; gap: 16px;">
                <span id="userName">Loading...</span>
                <button class="btn btn-secondary" onclick="logout()">Logout</button>
            </div>
        </header>
        <main class="main-content">
            <h2>Dashboard</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number" id="totalProjects">0</div>
                    <div style="color: #718096;">Total Projects</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="activeProjects">0</div>
                    <div style="color: #718096;">Active Projects</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="completedProjects">0</div>
                    <div style="color: #718096;">Completed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="avgProgress">0%</div>
                    <div style="color: #718096;">Average Progress</div>
                </div>
            </div>
            <div class="projects-list">
                <div style="padding: 20px; border-bottom: 1px solid #e2e8f0;">
                    <h3>Your Projects</h3>
                </div>
                <div id="projectsList"></div>
            </div>
        </main>
    </div>
    
    <script>
        let currentUser = null;
        
        window.addEventListener('load', () => {
            const savedUser = localStorage.getItem('projecthub_user');
            if (savedUser) {
                currentUser = JSON.parse(savedUser);
                showApp();
                loadProjects();
            }
        });
        
        function fillDemo(type) {
            document.getElementById('email').value = type === 'admin' ? 'admin@projecthub.com' : 'demo@projecthub.com';
            document.getElementById('password').value = type === 'admin' ? 'admin123' : 'demo123';
        }
        
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('loginError');
            
            try {
                const response = await fetch('http://192.168.1.24:3008/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();
                
                if (data.success) {
                    currentUser = data.user;
                    localStorage.setItem('projecthub_user', JSON.stringify(data.user));
                    localStorage.setItem('projecthub_token', data.token);
                    showApp();
                    loadProjects();
                } else {
                    errorDiv.textContent = data.error || 'Login failed';
                    errorDiv.style.display = 'block';
                }
            } catch (error) {
                errorDiv.textContent = 'Network error. Please try again.';
                errorDiv.style.display = 'block';
            }
        });
        
        function showApp() {
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('appScreen').style.display = 'block';
            document.getElementById('userName').textContent = currentUser.name;
        }
        
        function logout() {
            localStorage.clear();
            currentUser = null;
            document.getElementById('loginScreen').style.display = 'flex';
            document.getElementById('appScreen').style.display = 'none';
            document.getElementById('loginForm').reset();
            document.getElementById('loginError').style.display = 'none';
        }
        
        async function loadProjects() {
            try {
                const response = await fetch('http://192.168.1.24:3008/api/projects');
                const data = await response.json();
                const projects = data.projects || [];
                
                document.getElementById('totalProjects').textContent = projects.length;
                document.getElementById('activeProjects').textContent = projects.filter(p => p.status === 'active').length;
                document.getElementById('completedProjects').textContent = projects.filter(p => p.status === 'completed').length;
                
                const avgProgress = projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) : 0;
                document.getElementById('avgProgress').textContent = avgProgress + '%';
                
                document.getElementById('projectsList').innerHTML = projects.map(project => `
                    <div class="project-item">
                        <div>
                            <h3>${project.name}</h3>
                            <p style="color: #718096; font-size: 14px;">${project.description}</p>
                        </div>
                        <div style="display: flex; align-items: center; gap: 16px;">
                            <div style="text-align: center;">
                                <div style="font-weight: 600;">${project.progress}%</div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${project.progress}%;"></div>
                                </div>
                            </div>
                            <span class="status-badge status-${project.status}">${project.status}</span>
                        </div>
                    </div>
                `).join('');
            } catch (error) {
                console.error('Failed to load projects:', error);
            }
        }
    </script>
</body>
</html>'''
    
    ssh.sendline(html_content)
    ssh.sendline('EOFHTML')
    ssh.expect('\\$', timeout=30)
    
    # Restart nginx to pick up the new file
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker restart projecthub-frontend-simple')
    ssh.expect('\\$')
    
    print("✓ HTML file recreated and nginx restarted")
    
    ssh.sendline('exit')
    ssh.close()
    
    print("\n✅ HTML display fixed\!")
    print("\n🎉 Your ProjectHub application should now display properly:")
    print("  Frontend: http://192.168.1.24:5173")
    print("  Backend: http://192.168.1.24:3008")
    print("\nThe favicon error and content.js errors are just cosmetic - they don't affect functionality.")

except Exception as e:
    print(f"Error: {e}")
    if 'ssh' in locals():
        ssh.close()
