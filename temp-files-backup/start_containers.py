#!/usr/bin/env python3
import pexpect
import time

ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', encoding='utf-8')
ssh.expect(['password:', 'Password:'])
ssh.sendline('JDU9xjn1ekx3rev_uma')
ssh.expect('\\$')

print("Starting ProjectHub containers...")

# Start containers
commands = [
    'echo "JDU9xjn1ekx3rev_uma" | sudo -S docker start projecthub-postgres',
    'sleep 5',
    'echo "JDU9xjn1ekx3rev_uma" | sudo -S docker start projecthub-backend',
    'echo "JDU9xjn1ekx3rev_uma" | sudo -S docker start projecthub-frontend',
    'sleep 5',
    'echo "JDU9xjn1ekx3rev_uma" | sudo -S docker ps | grep projecthub'
]

for cmd in commands:
    print(f"→ {cmd}")
    ssh.sendline(cmd)
    ssh.expect('\\$', timeout=30)
    time.sleep(1)

print("\nContainers status:")
print(ssh.before)

ssh.sendline('exit')
ssh.close()

print("\n✅ Containers started!")