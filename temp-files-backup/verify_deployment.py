#!/usr/bin/env python3
import pexpect
import time

print("🔍 Verifying ProjectHub deployment on Synology...")

try:
    # Connect to Synology
    ssh_command = f"ssh -p 2222 Bert@192.168.1.24"
    child = pexpect.spawn(ssh_command)
    
    # Handle authentication
    index = child.expect(['password:', pexpect.EOF, pexpect.TIMEOUT], timeout=30)
    if index == 0:
        child.sendline('JDU9xjn1ekx3rev_uma')
    
    # Wait for prompt
    child.expect(['\\$', '#'], timeout=30)
    
    # Check containers
    print("\nChecking Docker containers...")
    child.sendline('cd /volume1/docker/projecthub && sudo docker-compose ps')
    child.expect(['password for', '\\$', '#'], timeout=30)
    if 'password for' in child.before.decode():
        child.sendline('JDU9xjn1ekx3rev_uma')
        child.expect(['\\$', '#'], timeout=30)
    
    # Get output
    output = child.before.decode()
    print(output)
    
    # Check logs
    print("\nChecking backend logs...")
    child.sendline('sudo docker logs projecthub-backend --tail 20')
    child.expect(['\\$', '#'], timeout=30)
    print(child.before.decode())
    
    child.sendline('exit')
    child.close()

except Exception as e:
    print(f"Verification error: {e}")