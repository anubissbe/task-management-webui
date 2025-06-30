#\!/usr/bin/env python3
import pexpect

ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', encoding='utf-8', timeout=60)
ssh.expect(['password:', 'Password:'])
ssh.sendline('JDU9xjn1ekx3rev_uma')
ssh.expect('\\$')

print("Checking current application status...")

# Check frontend logs for errors
ssh.sendline('echo "JDU9xjn1ekx3rev_uma"  < /dev/null |  sudo -S docker logs projecthub-frontend --tail 30')
ssh.expect('\\$', timeout=30)
print("Frontend logs:")
print(ssh.before)

# Check backend status
ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker logs projecthub-backend --tail 10')
ssh.expect('\\$')
print("\nBackend logs:")
print(ssh.before)

# Check container status
ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker ps | grep projecthub')
ssh.expect('\\$')
print("\nRunning containers:")
print(ssh.before)

ssh.sendline('exit')
ssh.close()
