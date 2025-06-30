#\!/usr/bin/env python3
import pexpect

ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', encoding='utf-8', timeout=60)
ssh.expect(['password:', 'Password:'])
ssh.sendline('JDU9xjn1ekx3rev_uma')
ssh.expect('\\$')

print("Checking deployment status...")

# Check if containers exist
ssh.sendline('echo "JDU9xjn1ekx3rev_uma"  < /dev/null |  sudo -S docker ps -a | grep projecthub-.*-real')
ssh.expect('\\$')
print("Containers:")
print(ssh.before)

# Check compose status
ssh.sendline('cd /volume1/docker/projecthub-real && echo "JDU9xjn1ekx3rev_uma" | sudo -S docker-compose logs --tail 20')
ssh.expect('\\$', timeout=30)
print("\nCompose logs:")
print(ssh.before)

# Check if source was cloned
ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S ls -la /volume1/docker/projecthub-real/')
ssh.expect('\\$')
print("\nDirectory contents:")
print(ssh.before)

ssh.sendline('exit')
ssh.close()
