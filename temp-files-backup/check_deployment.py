#!/usr/bin/env python3
import pexpect
import time

print("🔍 Checking ProjectHub deployment status...")

try:
    ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', encoding='utf-8')
    ssh.expect(['password:', 'Password:'])
    ssh.sendline('JDU9xjn1ekx3rev_uma')
    ssh.expect('\\$')
    
    # Check if containers are running
    print("\n1. Checking Docker containers:")
    ssh.sendline('docker ps -a | grep projecthub || echo "No projecthub containers"')
    ssh.expect('\\$')
    output = ssh.before.split('\n')[1:-1]
    for line in output:
        print(f"   {line}")
    
    # Check docker-compose location
    print("\n2. Checking docker-compose.yml:")
    ssh.sendline('ls -la ~/projecthub/docker-compose.yml')
    ssh.expect('\\$')
    print(f"   {ssh.before.split(chr(13))[1]}")
    
    # Try to start containers
    print("\n3. Starting containers from user directory:")
    ssh.sendline('cd ~/projecthub && docker-compose up -d')
    ssh.expect('\\$', timeout=60)
    
    # Wait and check again
    time.sleep(10)
    print("\n4. Final container status:")
    ssh.sendline('docker ps | grep projecthub')
    ssh.expect('\\$')
    output = ssh.before.split('\n')[1:-1]
    for line in output:
        print(f"   {line}")
    
    # Check logs
    print("\n5. Backend logs:")
    ssh.sendline('docker logs projecthub-backend 2>&1 | tail -10')
    ssh.expect('\\$')
    output = ssh.before.split('\n')[1:-1]
    for line in output:
        print(f"   {line}")
    
    ssh.sendline('exit')
    ssh.close()
    
except Exception as e:
    print(f"Error: {e}")