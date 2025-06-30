#\!/usr/bin/env python3
import pexpect
import time

ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', encoding='utf-8', timeout=120)
ssh.expect(['password:', 'Password:'])
ssh.sendline('JDU9xjn1ekx3rev_uma')
ssh.expect('\\$')

print("Checking repository structure...")

# Check what was actually cloned
ssh.sendline('echo "JDU9xjn1ekx3rev_uma"  < /dev/null |  sudo -S ls -la /volume1/docker/projecthub-real/source/')
ssh.expect('\\$')
print("Repository contents:")
print(ssh.before)

# Check if frontend exists
ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S ls -la /volume1/docker/projecthub-real/source/frontend/ 2>/dev/null || echo "No frontend directory"')
ssh.expect('\\$')
print("\nFrontend check:")
print(ssh.before)

# Check if backend exists  
ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S ls -la /volume1/docker/projecthub-real/source/backend/ 2>/dev/null || echo "No backend directory"')
ssh.expect('\\$')
print("\nBackend check:")
print(ssh.before)

# Try to start containers
print("\nStarting containers...")
ssh.sendline('cd /volume1/docker/projecthub-real && echo "JDU9xjn1ekx3rev_uma" | sudo -S docker-compose start postgres')
ssh.expect('\\$')

time.sleep(5)

ssh.sendline('cd /volume1/docker/projecthub-real && echo "JDU9xjn1ekx3rev_uma" | sudo -S docker-compose start backend')
ssh.expect('\\$')

ssh.sendline('cd /volume1/docker/projecthub-real && echo "JDU9xjn1ekx3rev_uma" | sudo -S docker-compose start frontend')
ssh.expect('\\$')

time.sleep(10)

# Check final status
ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker ps | grep projecthub-.*-real')
ssh.expect('\\$')
print("\nRunning containers:")
print(ssh.before)

# Check logs
ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker logs projecthub-backend-real --tail 10 2>&1')
ssh.expect('\\$')
print("\nBackend logs:")
print(ssh.before)

ssh.sendline('exit')
ssh.close()
