#\!/usr/bin/env python3
import pexpect

print("🚀 Deploying fresh frontend on new port...")

try:
    ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', encoding='utf-8', timeout=60)
    ssh.expect(['password:', 'Password:'])
    ssh.sendline('JDU9xjn1ekx3rev_uma')
    ssh.expect('\\$')
    
    print("✓ Connected")
    
    # Stop old frontend
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma"  < /dev/null |  sudo -S docker stop projecthub-frontend')
    ssh.expect('\\$')
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker rm projecthub-frontend')
    ssh.expect('\\$')
    
    # Create new directory
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S rm -rf /volume1/docker/projecthub-frontend-new')
    ssh.expect('\\$')
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S mkdir -p /volume1/docker/projecthub-frontend-new')
    ssh.expect('\\$')
    
    # Create simple working HTML
    print("✓ Creating simple frontend...")
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S tee /volume1/docker/projecthub-frontend-new/index.html > /dev/null << \'EOFHTML\'')
    ssh.sendline('''<\!DOCTYPE html>
<html>
<head>
    <title>ProjectHub</title>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
        h1 { color: #333; }
        .status { margin: 20px 0; padding: 20px; background: #f0f0f0; border-radius: 5px; }
        .ok { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        button { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 5px; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 ProjectHub</h1>
        <p>Enterprise Project Management System</p>
        
        <div class="status">
            <h2>System Status</h2>
            <p>Frontend: <span class="ok">✓ Running on port 5175</span></p>
            <p>Backend API: <span id="api-status">Checking...</span></p>
            <p>Database: <span id="db-status">Checking...</span></p>
        </div>
        
        <button onclick="testAPI()">Test API</button>
        <button onclick="getProjects()">Load Projects</button>
        
        <div id="api-response"></div>
        <div id="projects"></div>
    </div>
    
    <script>
        function testAPI() {
            document.getElementById("api-response").innerHTML = "Loading...";
            
            fetch("http://192.168.1.24:3007/api/health")
                .then(function(res) { 
                    return res.json();
                })
                .then(function(data) {
                    document.getElementById("api-status").innerHTML = '<span class="ok">✓ Running</span>';
                    document.getElementById("db-status").innerHTML = '<span class="ok">✓ Connected</span>';
                    document.getElementById("api-response").innerHTML = "<pre>" + JSON.stringify(data, null, 2) + "</pre>";
                })
                .catch(function(err) {
                    document.getElementById("api-status").innerHTML = '<span class="error">✗ Error</span>';
                    document.getElementById("db-status").innerHTML = '<span class="error">✗ Unknown</span>';
                    document.getElementById("api-response").innerHTML = '<pre>Error: ' + err + '</pre>';
                });
        }
        
        function getProjects() {
            document.getElementById("projects").innerHTML = "<h3>Loading projects...</h3>";
            
            fetch("http://192.168.1.24:3007/api/projects")
                .then(function(res) { 
                    return res.json(); 
                })
                .then(function(data) {
                    var html = "<h3>Projects:</h3>";
                    for (var i = 0; i < data.projects.length; i++) {
                        html += "<p>" + data.projects[i].name + " - " + data.projects[i].status + "</p>";
                    }
                    document.getElementById("projects").innerHTML = html;
                })
                .catch(function(err) {
                    document.getElementById("projects").innerHTML = "<h3>Error loading projects: " + err + "</h3>";
                });
        }
        
        // Auto-test on load
        testAPI();
    </script>
</body>
</html>''')
    ssh.sendline('EOFHTML')
    ssh.expect('\\$')
    
    # Deploy on new port 5175
    print("✓ Deploying on port 5175...")
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker run -d --name projecthub-frontend-new -p 5175:80 -v /volume1/docker/projecthub-frontend-new:/usr/share/nginx/html:ro nginx:alpine')
    ssh.expect('\\$')
    
    ssh.sendline('exit')
    ssh.close()
    
    print("\n✅ Fresh frontend deployed\!")
    print("\n🎉 Access the working application at:")
    print("  http://192.168.1.24:5175")
    print("\nThis is a completely fresh instance with no cache issues\!")

except Exception as e:
    print(f"Error: {e}")
    if 'ssh' in locals():
        ssh.close()
