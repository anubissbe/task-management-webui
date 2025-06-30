#\!/usr/bin/env python3
import pexpect

ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', encoding='utf-8', timeout=60)
ssh.expect(['password:', 'Password:'])
ssh.sendline('JDU9xjn1ekx3rev_uma')
ssh.expect('\\$')

# Check if backend is running
ssh.sendline('echo "JDU9xjn1ekx3rev_uma"  < /dev/null |  sudo -S docker ps | grep projecthub-backend')
ssh.expect('\\$')
print("Backend status:")
print(ssh.before)

# Get logs
ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker logs projecthub-backend 2>&1 | tail -20')
ssh.expect('\\$')
print("\nBackend logs:")
print(ssh.before)

ssh.sendline('exit')
ssh.close()
