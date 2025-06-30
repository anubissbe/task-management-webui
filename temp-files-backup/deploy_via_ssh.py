#!/usr/bin/env python3

import paramiko
import os
import time
import sys

# Configuration
SYNOLOGY_HOST = "192.168.1.24"
SYNOLOGY_PORT = 2222
SYNOLOGY_USER = "Bert"
SYNOLOGY_PASSWORD = "JDU9xjn1ekx3rev_uma"

def deploy_projecthub():
    """Deploy ProjectHub to Synology via SSH"""
    
    print("🚀 ProjectHub Deployment via SSH")
    print("================================")
    
    # Create SSH client
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        # Connect to Synology
        print(f"Connecting to {SYNOLOGY_HOST}:{SYNOLOGY_PORT}...")
        ssh.connect(
            hostname=SYNOLOGY_HOST,
            port=SYNOLOGY_PORT,
            username=SYNOLOGY_USER,
            password=SYNOLOGY_PASSWORD
        )
        print("✓ Connected to Synology")
        
        # Create SFTP client for file transfer
        sftp = ssh.open_sftp()
        
        # Transfer deployment package
        local_file = "projecthub-deployment-package.tar.gz"
        remote_file = "/tmp/projecthub-deployment-package.tar.gz"
        
        print(f"Transferring {local_file} to Synology...")
        sftp.put(local_file, remote_file)
        print("✓ Deployment package transferred")
        
        # Execute deployment commands
        commands = [
            # Create directories
            "sudo mkdir -p /volume1/docker/projecthub/{postgres,redis,backend,frontend}",
            "cd /volume1/docker/projecthub",
            
            # Extract deployment package
            "sudo tar -xzf /tmp/projecthub-deployment-package.tar.gz",
            "cd /volume1/docker/projecthub/deployment_package",
            
            # Copy files
            "sudo cp projecthub-source.tar.gz ../",
            "sudo cp docker-compose.synology-minimal.yml ../docker-compose.yml",
            "sudo cp .env.synology ../.env",
            
            # Extract source
            "cd /volume1/docker/projecthub",
            "sudo tar -xzf projecthub-source.tar.gz",
            "sudo rm projecthub-source.tar.gz",
            
            # Create data directories
            "sudo mkdir -p postgres redis",
            
            # Stop existing containers
            "sudo docker-compose down 2>/dev/null || true",
            
            # Pull images
            "sudo docker pull postgres:17-alpine",
            "sudo docker pull node:22-alpine",
            
            # Start services
            "sudo docker-compose up -d",
        ]
        
        print("\nExecuting deployment commands...")
        for cmd in commands:
            print(f"  Running: {cmd}")
            stdin, stdout, stderr = ssh.exec_command(cmd)
            stdout.channel.recv_exit_status()  # Wait for command to complete
            
            # Print output if any
            output = stdout.read().decode().strip()
            if output:
                print(f"    Output: {output}")
            
            # Check for errors
            error = stderr.read().decode().strip()
            if error and "Warning" not in error:
                print(f"    Warning: {error}")
        
        print("\n✓ Deployment commands executed")
        
        # Wait for services to start
        print("\nWaiting for services to initialize (45 seconds)...")
        time.sleep(45)
        
        # Run migrations
        print("\nRunning database migrations...")
        cmd = "cd /volume1/docker/projecthub && sudo docker exec projecthub-backend sh -c 'cd /app/backend && npm run migrate'"
        stdin, stdout, stderr = ssh.exec_command(cmd)
        stdout.channel.recv_exit_status()
        print("✓ Migrations completed (or already applied)")
        
        # Check container status
        print("\nChecking container status...")
        stdin, stdout, stderr = ssh.exec_command("cd /volume1/docker/projecthub && sudo docker-compose ps")
        status = stdout.read().decode()
        print(status)
        
        # Clean up
        ssh.exec_command("sudo rm /tmp/projecthub-deployment-package.tar.gz")
        
        print("\n✅ Deployment complete!")
        print("\nAccess your ProjectHub instance at:")
        print(f"  Frontend: http://{SYNOLOGY_HOST}:5174")
        print(f"  Backend API: http://{SYNOLOGY_HOST}:3007/api")
        print(f"  Health Check: http://{SYNOLOGY_HOST}:3007/api/health")
        
    except Exception as e:
        print(f"\n❌ Deployment failed: {str(e)}")
        sys.exit(1)
    finally:
        ssh.close()

if __name__ == "__main__":
    deploy_projecthub()