#\!/usr/bin/env python3
import pexpect

ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', encoding='utf-8', timeout=60)
ssh.expect(['password:', 'Password:'])
ssh.sendline('JDU9xjn1ekx3rev_uma')
ssh.expect('\\$')

print("Checking container status...")

# Check all containers
ssh.sendline('echo "JDU9xjn1ekx3rev_uma"  < /dev/null |  sudo -S docker ps -a | grep projecthub')
ssh.expect('\\$')
print("Container status:")
print(ssh.before)

# Check backend logs
ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker logs projecthub-backend 2>&1 || echo "No backend container"')
ssh.expect('\\$', timeout=30)
print("\nBackend logs:")
print(ssh.before)

# Check frontend logs
ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker logs projecthub-frontend 2>&1')
ssh.expect('\\$', timeout=30)
print("\nFrontend logs:")
print(ssh.before)

# Check postgres
ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker logs projecthub-postgres --tail 10 2>&1')
ssh.expect('\\$')
print("\nPostgreSQL logs:")
print(ssh.before)

ssh.sendline('exit')
ssh.close()
