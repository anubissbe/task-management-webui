#\!/usr/bin/env python3
import pexpect
import time

print("🚀 Deploying minimal working frontend...")

try:
    ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', encoding='utf-8', timeout=60)
    ssh.expect(['password:', 'Password:'])
    ssh.sendline('JDU9xjn1ekx3rev_uma')
    ssh.expect('\\$')
    
    print("✓ Connected")
    
    # Create minimal HTML
    minimal_html = '''<\!DOCTYPE html>
<html>
<head>
    <title>ProjectHub</title>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; }
        .status { margin: 20px 0; padding: 20px; background: #f0f0f0; border-radius: 5px; }
        .ok { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        button { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 5px; }
        button:hover { background: #0056b3; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }
        .project { padding: 10px; margin: 5px 0; background: #f9f9f9; border-radius: 5px; display: flex; justify-content: space-between; }
        .active { color: green; }
        .completed { color: blue; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 ProjectHub</h1>
        <p>Enterprise Project Management System</p>
        
        <div class="status">
            <h2>System Status</h2>
            <p>Frontend: <span class="ok">✓ Running</span></p>
            <p>Backend API: <span id="api-status">Checking...</span></p>
            <p>Database: <span id="db-status">Checking...</span></p>
        </div>
        
        <button onclick="testAPI()">Test API</button>
        <button onclick="getProjects()">Load Projects</button>
        
        <div id="api-response" style="margin-top: 20px;"></div>
        <div id="projects" style="margin-top: 20px;"></div>
    </div>
    
    <script>
        function testAPI() {
            var apiStatus = document.getElementById("api-status");
            var dbStatus = document.getElementById("db-status");
            var response = document.getElementById("api-response");
            
            response.innerHTML = "Loading...";
            
            fetch("http://192.168.1.24:3007/api/health")
                .then(function(res) { 
                    if (res.ok) {
                        return res.json();
                    } else {
                        throw new Error("HTTP " + res.status);
                    }
                })
                .then(function(data) {
                    apiStatus.innerHTML = '<span class="ok">✓ Running</span>';
                    dbStatus.innerHTML = '<span class="ok">✓ Connected</span>';
                    response.innerHTML = "<pre>" + JSON.stringify(data, null, 2) + "</pre>";
                })
                .catch(function(err) {
                    apiStatus.innerHTML = '<span class="error">✗ Error</span>';
                    dbStatus.innerHTML = '<span class="error">✗ Unknown</span>';
                    response.innerHTML = '<pre class="error">Error: ' + err + '</pre>';
                });
        }
        
        function getProjects() {
            var projects = document.getElementById("projects");
            projects.innerHTML = "<h3>Projects:</h3><p>Loading...</p>";
            
            fetch("http://192.168.1.24:3007/api/projects")
                .then(function(res) { return res.json(); })
                .then(function(data) {
                    var html = "<h3>Projects:</h3>";
                    for (var i = 0; i < data.projects.length; i++) {
                        var p = data.projects[i];
                        html += '<div class="project">';
                        html += '<span>' + p.name + '</span>';
                        html += '<span class="' + p.status + '">' + p.status + '</span>';
                        html += '</div>';
                    }
                    projects.innerHTML = html;
                })
                .catch(function(err) {
                    projects.innerHTML = '<h3>Projects:</h3><p class="error">Error: ' + err + '</p>';
                });
        }
        
        // Auto-test on load
        testAPI();
    </script>
</body>
</html>'''
    
    # Write directly to file
    ssh.sendline(f'echo "JDU9xjn1ekx3rev_uma"  < /dev/null |  sudo -S tee /volume1/docker/projecthub-frontend/index.html > /dev/null << \'EOFHTML\'')
    ssh.sendline(minimal_html)
    ssh.sendline('EOFHTML')
    ssh.expect('\\$', timeout=30)
    
    # Force nginx reload
    print("✓ Reloading nginx...")
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker exec projecthub-frontend nginx -s reload')
    ssh.expect('\\$')
    
    # Also create a test.html to bypass cache
    ssh.sendline(f'echo "JDU9xjn1ekx3rev_uma" | sudo -S tee /volume1/docker/projecthub-frontend/test.html > /dev/null << \'EOFHTML\'')
    ssh.sendline(minimal_html)
    ssh.sendline('EOFHTML')
    ssh.expect('\\$', timeout=30)
    
    ssh.sendline('exit')
    ssh.close()
    
    print("\n✅ Minimal frontend deployed\!")
    print("\n🎉 Access options:")
    print("  1. Main page (clear cache first): http://192.168.1.24:5174/")
    print("  2. Test page (no cache): http://192.168.1.24:5174/test.html")

except Exception as e:
    print(f"Error: {e}")
    if 'ssh' in locals():
        ssh.close()
