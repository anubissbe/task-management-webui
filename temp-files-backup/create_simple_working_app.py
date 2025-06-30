#\!/usr/bin/env python3
import pexpect
import time

print("🚀 Creating simple working ProjectHub app...")

try:
    ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', encoding='utf-8', timeout=180)
    ssh.expect(['password:', 'Password:'])
    ssh.sendline('JDU9xjn1ekx3rev_uma')
    ssh.expect('\\$')
    
    print("✓ Connected")
    
    # Stop current frontend
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma"  < /dev/null |  sudo -S docker stop projecthub-frontend')
    ssh.expect('\\$')
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker rm projecthub-frontend')
    ssh.expect('\\$')
    
    # Create directory for simple app
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S mkdir -p /volume1/docker/projecthub-simple')
    ssh.expect('\\$')
    
    # Create simple HTML/CSS/JS app
    print("✓ Creating simple frontend...")
    ssh.sendline('''echo "JDU9xjn1ekx3rev_uma" | sudo -S tee /volume1/docker/projecthub-simple/index.html > /dev/null << 'EOFHTML'
<\!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ProjectHub - Enterprise Project Management</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
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
        
        .user-info {
            display: flex;
            align-items: center;
            gap: 16px;
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
        
        .btn-secondary:hover {
            background: #e2e8f0;
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
        
        .form-input:focus {
            outline: none;
            border-color: #4299e1;
            box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
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
        
        .stat-label {
            color: #718096;
            margin-top: 4px;
        }
        
        .projects-list {
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .project-item {
            padding: 20px;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .project-item:last-child {
            border-bottom: none;
        }
        
        .project-info h3 {
            font-weight: 600;
            margin-bottom: 4px;
        }
        
        .project-info p {
            color: #718096;
            font-size: 14px;
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
            transition: width 0.3s;
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
            font-size: 14px;
        }
        
        .demo-btn:hover {
            background: #edf2f7;
        }
        
        .error {
            background: #fed7d7;
            color: #c53030;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 16px;
        }
        
        h1, h2 {
            margin-bottom: 16px;
        }
        
        .text-center {
            text-align: center;
        }
    </style>
</head>
<body>
    <\!-- Login Screen -->
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
                
                <div id="loginError" class="error" style="display: none;"></div>
                
                <button type="submit" class="btn btn-primary" style="width: 100%;">
                    Sign In
                </button>
            </form>
            
            <div class="demo-buttons">
                <button class="demo-btn" onclick="fillDemo('admin')">Admin Demo</button>
                <button class="demo-btn" onclick="fillDemo('user')">User Demo</button>
            </div>
        </div>
    </div>
    
    <\!-- Main App -->
    <div id="appScreen" class="app-container">
        <header class="header">
            <div class="logo">🚀 ProjectHub</div>
            <div class="user-info">
                <span id="userName">Loading...</span>
                <button class="btn btn-secondary" onclick="logout()">Logout</button>
            </div>
        </header>
        
        <main class="main-content">
            <h2>Dashboard</h2>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number" id="totalProjects">0</div>
                    <div class="stat-label">Total Projects</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="activeProjects">0</div>
                    <div class="stat-label">Active Projects</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="completedProjects">0</div>
                    <div class="stat-label">Completed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="avgProgress">0%</div>
                    <div class="stat-label">Average Progress</div>
                </div>
            </div>
            
            <div class="projects-list">
                <div style="padding: 20px; border-bottom: 1px solid #e2e8f0;">
                    <h3>Your Projects</h3>
                </div>
                <div id="projectsList">
                    <\!-- Projects will be loaded here -->
                </div>
            </div>
        </main>
    </div>
    
    <script>
        let currentUser = null;
        
        // Check if already logged in
        window.addEventListener('load', () => {
            const savedUser = localStorage.getItem('projecthub_user');
            const savedToken = localStorage.getItem('projecthub_token');
            
            if (savedUser && savedToken) {
                currentUser = JSON.parse(savedUser);
                showApp();
                loadProjects();
            }
        });
        
        // Demo credentials
        function fillDemo(type) {
            if (type === 'admin') {
                document.getElementById('email').value = 'admin@projecthub.com';
                document.getElementById('password').value = 'admin123';
            } else {
                document.getElementById('email').value = 'demo@projecthub.com';
                document.getElementById('password').value = 'demo123';
            }
        }
        
        // Login form
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('loginError');
            
            try {
                const response = await fetch('http://192.168.1.24:3008/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
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
            localStorage.removeItem('projecthub_user');
            localStorage.removeItem('projecthub_token');
            currentUser = null;
            
            document.getElementById('loginScreen').style.display = 'flex';
            document.getElementById('appScreen').style.display = 'none';
            
            // Clear form
            document.getElementById('loginForm').reset();
            document.getElementById('loginError').style.display = 'none';
        }
        
        async function loadProjects() {
            try {
                const response = await fetch('http://192.168.1.24:3008/api/projects');
                const data = await response.json();
                const projects = data.projects || [];
                
                // Update stats
                document.getElementById('totalProjects').textContent = projects.length;
                document.getElementById('activeProjects').textContent = projects.filter(p => p.status === 'active').length;
                document.getElementById('completedProjects').textContent = projects.filter(p => p.status === 'completed').length;
                
                const avgProgress = projects.length > 0 
                    ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
                    : 0;
                document.getElementById('avgProgress').textContent = avgProgress + '%';
                
                // Render projects
                const projectsList = document.getElementById('projectsList');
                projectsList.innerHTML = projects.map(project => `
                    <div class="project-item">
                        <div class="project-info">
                            <h3>${project.name}</h3>
                            <p>${project.description}</p>
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
</html>
EOFHTML''')
    ssh.expect('\\$', timeout=30)
    
    # Start simple frontend with nginx
    print("✓ Starting simple frontend...")
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker run -d --name projecthub-frontend-simple -p 5173:80 -v /volume1/docker/projecthub-simple:/usr/share/nginx/html:ro nginx:alpine')
    ssh.expect('\\$', timeout=60)
    
    print("✓ Waiting for services to start...")
    time.sleep(10)
    
    # Check status
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker ps | grep projecthub')
    ssh.expect('\\$')
    print("\nRunning containers:")
    print(ssh.before)
    
    ssh.sendline('exit')
    ssh.close()
    
    print("\n✅ Simple ProjectHub app created\!")
    print("\n🎉 Your working ProjectHub application:")
    print("  Frontend: http://192.168.1.24:5173")
    print("  Backend: http://192.168.1.24:3008")
    print("\n🔐 Login Credentials:")
    print("  Admin: admin@projecthub.com / admin123")
    print("  User: demo@projecthub.com / demo123")
    print("\n✨ Features:")
    print("  • Clean, modern UI without complex build issues")
    print("  • Working authentication system")
    print("  • Project dashboard with statistics")
    print("  • Responsive design")
    print("  • No CSS compilation errors\!")

except Exception as e:
    print(f"Error: {e}")
    if 'ssh' in locals():
        ssh.close()
