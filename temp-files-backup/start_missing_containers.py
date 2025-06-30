#\!/usr/bin/env python3
import pexpect
import time

ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', encoding='utf-8', timeout=120)
ssh.expect(['password:', 'Password:'])
ssh.sendline('JDU9xjn1ekx3rev_uma')
ssh.expect('\\$')

print("Starting missing containers...")

# Start PostgreSQL
ssh.sendline('echo "JDU9xjn1ekx3rev_uma"  < /dev/null |  sudo -S docker start projecthub-postgres')
ssh.expect('\\$')
print("✓ Started PostgreSQL")

time.sleep(5)

# Start backend
ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker start projecthub-backend')
ssh.expect('\\$')
print("✓ Started backend")

print("✓ Waiting for services to initialize...")
time.sleep(30)

# Check status
ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker ps | grep projecthub')
ssh.expect('\\$')
print("\nRunning containers:")
print(ssh.before)

# Check backend logs
ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker logs projecthub-backend --tail 20')
ssh.expect('\\$')
print("\nBackend logs:")
print(ssh.before)

# Check frontend logs
ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker logs projecthub-frontend --tail 20')
ssh.expect('\\$')
print("\nFrontend logs:")
print(ssh.before)

ssh.sendline('exit')
ssh.close()
