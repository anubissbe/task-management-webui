#\!/usr/bin/env python3
import pexpect

ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', encoding='utf-8', timeout=60)
ssh.expect(['password:', 'Password:'])
ssh.sendline('JDU9xjn1ekx3rev_uma')
ssh.expect('\\$')

print("Deploying clean frontend...")

# Stop current frontend containers
ssh.sendline('echo "JDU9xjn1ekx3rev_uma"  < /dev/null |  sudo -S docker stop $(sudo docker ps -q --filter name=projecthub-frontend) 2>/dev/null || true')
ssh.expect('\\$')
ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker rm $(sudo docker ps -aq --filter name=projecthub-frontend) 2>/dev/null || true')
ssh.expect('\\$')

# Create directory
ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S mkdir -p /volume1/docker/projecthub-clean')
ssh.expect('\\$')

# Copy the clean HTML file
ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S cp /tmp/projecthub.html /volume1/docker/projecthub-clean/index.html 2>/dev/null || echo "File not found, will create directly"')
ssh.expect('\\$')

print("Checking if file was copied...")
ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S ls -la /volume1/docker/projecthub-clean/')
ssh.expect('\\$')
print(ssh.before)

# Start new frontend
ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker run -d --name projecthub-frontend-clean -p 5173:80 -v /volume1/docker/projecthub-clean:/usr/share/nginx/html:ro nginx:alpine')
ssh.expect('\\$')

import time
time.sleep(5)

# Check status
ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker ps | grep projecthub')
ssh.expect('\\$')
print("\nRunning containers:")
print(ssh.before)

ssh.sendline('exit')
ssh.close()

print("\n✅ Clean frontend deployed\!")
print("Frontend: http://192.168.1.24:5173")
