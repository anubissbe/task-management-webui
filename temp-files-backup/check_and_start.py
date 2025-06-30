#\!/usr/bin/env python3
import pexpect

ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', encoding='utf-8', timeout=60)
ssh.expect(['password:', 'Password:'])
ssh.sendline('JDU9xjn1ekx3rev_uma')
ssh.expect('\\$')

print("Checking official docker-compose...")

# Check the main docker-compose.yml
ssh.sendline('echo "JDU9xjn1ekx3rev_uma"  < /dev/null |  sudo -S head -30 /volume1/docker/projecthub-real/source/docker-compose.yml')
ssh.expect('\\$')
print("Main docker-compose.yml:")
print(ssh.before)

# Check Synology compose
ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S cat /volume1/docker/projecthub-real/source/docker-compose.synology.yml')
ssh.expect('\\$')
print("\nSynology docker-compose.yml:")
print(ssh.before)

# Check current container status
ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker ps -a | grep -E "(projecthub|postgres)"')
ssh.expect('\\$')
print("\nCurrent containers:")
print(ssh.before)

ssh.sendline('exit')
ssh.close()
