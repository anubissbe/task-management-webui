#\!/usr/bin/env python3
import pexpect

ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', encoding='utf-8', timeout=60)
ssh.expect(['password:', 'Password:'])
ssh.sendline('JDU9xjn1ekx3rev_uma')
ssh.expect('\\$')

print("Debugging deployment...")

# Check all containers including stopped ones
ssh.sendline('echo "JDU9xjn1ekx3rev_uma"  < /dev/null |  sudo -S docker ps -a | grep -E "(projecthub|postgres)"')
ssh.expect('\\$')
print("All ProjectHub containers:")
print(ssh.before)

# Check if builds were successful
ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker images | grep projecthub')
ssh.expect('\\$')
print("\nBuilt images:")
print(ssh.before)

# Check Dockerfiles exist
ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S ls -la /volume1/docker/projecthub-real/source/backend/Dockerfile*')
ssh.expect('\\$')
print("\nBackend Dockerfiles:")
print(ssh.before)

ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S ls -la /volume1/docker/projecthub-real/source/frontend/Dockerfile*')
ssh.expect('\\$')
print("\nFrontend Dockerfiles:")
print(ssh.before)

# Check package.json files
ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S head -10 /volume1/docker/projecthub-real/source/backend/package.json')
ssh.expect('\\$')
print("\nBackend package.json:")
print(ssh.before)

ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S head -10 /volume1/docker/projecthub-real/source/frontend/package.json')
ssh.expect('\\$')
print("\nFrontend package.json:")
print(ssh.before)

ssh.sendline('exit')
ssh.close()
