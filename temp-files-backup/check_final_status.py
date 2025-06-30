#!/usr/bin/env python3
import pexpect

ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', encoding='utf-8')
ssh.expect(['password:', 'Password:'])
ssh.sendline('JDU9xjn1ekx3rev_uma')
ssh.expect('\\$')

print("Checking all Docker containers:")
ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker ps -a | head -20')
ssh.expect('\\$')
print(ssh.before)

print("\nChecking container logs:")
ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker logs projecthub-backend 2>&1 | tail -20')
ssh.expect('\\$')
print(ssh.before)

ssh.sendline('exit')
ssh.close()