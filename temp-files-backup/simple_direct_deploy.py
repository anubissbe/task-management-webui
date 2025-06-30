#!/usr/bin/env python3
import pexpect
import time

print("🚀 Simple direct deployment...")

try:
    ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', encoding='utf-8')
    ssh.expect(['password:', 'Password:'])
    ssh.sendline('JDU9xjn1ekx3rev_uma')
    ssh.expect('\\$')
    
    # Create and run a simple deployment script
    commands = [
        'echo "JDU9xjn1ekx3rev_uma" | sudo -S docker run -d --name proj-db -e POSTGRES_PASSWORD=pass123 -p 5433:5432 postgres:15-alpine',
        'echo "JDU9xjn1ekx3rev_uma" | sudo -S docker run -d --name proj-web -p 3007:80 nginx:alpine',
        'sleep 5',
        'echo "JDU9xjn1ekx3rev_uma" | sudo -S docker ps | grep proj'
    ]
    
    for cmd in commands:
        print(f"Running: {cmd[:50]}...")
        ssh.sendline(cmd)
        ssh.expect('\\$', timeout=60)
        time.sleep(1)
    
    # Get the output of the last command
    output = ssh.before
    print("\nContainers running:")
    print(output)
    
    ssh.sendline('exit')
    ssh.close()
    
    print("\n✅ Deployment complete!")
    print("\nServices:")
    print("  Web: http://192.168.1.24:3007")
    print("  Database: postgresql://postgres:pass123@192.168.1.24:5433/postgres")

except Exception as e:
    print(f"Error: {e}")