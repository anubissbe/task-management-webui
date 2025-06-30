#\!/usr/bin/env python3
import pexpect

ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', encoding='utf-8', timeout=60)
ssh.expect(['password:', 'Password:'])
ssh.sendline('JDU9xjn1ekx3rev_uma')
ssh.expect('\\$')

print("Checking build status...")

# Check all containers
ssh.sendline('echo "JDU9xjn1ekx3rev_uma"  < /dev/null |  sudo -S docker ps -a | head -20')
ssh.expect('\\$')
print("All containers:")
print(ssh.before)

# Check docker-compose logs
ssh.sendline('cd /volume1/docker/projecthub-real && echo "JDU9xjn1ekx3rev_uma" | sudo -S docker-compose -f docker-compose-synology.yml logs --tail 30')
ssh.expect('\\$', timeout=30)
print("\nDocker-compose logs:")
print(ssh.before)

# Check images
ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker images | grep projecthub')
ssh.expect('\\$')
print("\nBuilt images:")
print(ssh.before)

ssh.sendline('exit')
ssh.close()
