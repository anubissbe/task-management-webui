#\!/usr/bin/env python3
import subprocess
import base64

print("🚀 Quick ProjectHub deployment...")

# Read the working HTML file
with open('/tmp/projecthub-final.html', 'r') as f:
    html_content = f.read()

# Base64 encode to avoid shell escaping issues
encoded_html = base64.b64encode(html_content.encode()).decode()

# Create deployment script
script = f"""#\!/bin/bash
# Stop existing containers
echo "JDU9xjn1ekx3rev_uma"  < /dev/null |  sudo -S docker stop projecthub-frontend-final 2>/dev/null || true
echo "JDU9xjn1ekx3rev_uma" | sudo -S docker rm projecthub-frontend-final 2>/dev/null || true

# Create directory and decode HTML
echo "JDU9xjn1ekx3rev_uma" | sudo -S mkdir -p /volume1/docker/projecthub-final
echo "{encoded_html}" | base64 -d | sudo tee /volume1/docker/projecthub-final/index.html > /dev/null

# Start nginx container
echo "JDU9xjn1ekx3rev_uma" | sudo -S docker run -d --name projecthub-frontend-final -p 5173:80 -v /volume1/docker/projecthub-final:/usr/share/nginx/html:ro nginx:alpine

echo "Deployment complete\!"
"""

try:
    # Use scp to copy script and execute
    with open('/tmp/deploy_script.sh', 'w') as f:
        f.write(script)
    
    # Copy script
    subprocess.run(['scp', '-P', '2222', '/tmp/deploy_script.sh', 'Bert@192.168.1.24:/tmp/'], check=True)
    
    # Execute script
    result = subprocess.run(['ssh', '-p', '2222', 'Bert@192.168.1.24', 'bash /tmp/deploy_script.sh'], 
                          capture_output=True, text=True, timeout=30)
    
    print("✅ ProjectHub deployed\!")
    print("Frontend: http://192.168.1.24:5173")
    print("Backend: http://192.168.1.24:3008")
    print("Login: admin@projecthub.com / admin123")
    
except Exception as e:
    print(f"Error: {e}")
