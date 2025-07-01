#!/usr/bin/env python3
"""Deploy ProjectHub to Synology NAS"""

import paramiko
import os
import sys
import time

# Configuration
SYNOLOGY_HOST = "192.168.1.24"
SYNOLOGY_PORT = 2222
SYNOLOGY_USER = "Bert"
SYNOLOGY_PASSWORD = "JDU9xjn1ekx3rev_uma"
LOCAL_PACKAGE = "/tmp/projecthub-deploy.tar.gz"
REMOTE_DIR = "/volume1/docker/projecthub"

def execute_command(ssh, command, print_output=True):
    """Execute command and return output"""
    stdin, stdout, stderr = ssh.exec_command(command)
    stdout_text = stdout.read().decode()
    stderr_text = stderr.read().decode()
    exit_code = stdout.channel.recv_exit_status()
    
    if print_output and stdout_text:
        print(stdout_text)
    if stderr_text and "WARNING" not in stderr_text:
        print(f"Error: {stderr_text}")
    
    return exit_code == 0, stdout_text, stderr_text

def main():
    print("🚀 Deploying ProjectHub to Synology NAS...")
    
    # Check if package exists
    if not os.path.exists(LOCAL_PACKAGE):
        print(f"❌ Deployment package not found: {LOCAL_PACKAGE}")
        sys.exit(1)
    
    print(f"📦 Found deployment package: {LOCAL_PACKAGE}")
    
    # Use remote_dir as local variable
    remote_dir = REMOTE_DIR
    
    try:
        # Create SSH client
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        
        print(f"🔗 Connecting to {SYNOLOGY_HOST}:{SYNOLOGY_PORT}...")
        ssh.connect(
            hostname=SYNOLOGY_HOST,
            port=SYNOLOGY_PORT,
            username=SYNOLOGY_USER,
            password=SYNOLOGY_PASSWORD,
            timeout=30,
            look_for_keys=False,
            allow_agent=False
        )
        
        print("✅ Connected successfully!")
        
        # Create remote directory
        print("📁 Creating remote directory...")
        success, _, _ = execute_command(ssh, f"mkdir -p {remote_dir}")
        if not success:
            print("❌ Failed to create directory")
            return
        
        # Upload package using SFTP
        print("📤 Uploading deployment package...")
        sftp = ssh.open_sftp()
        remote_package = f"{remote_dir}/projecthub-deploy.tar.gz"
        sftp.put(LOCAL_PACKAGE, remote_package)
        sftp.close()
        print("✅ Package uploaded successfully!")
        
        # Extract package
        print("📦 Extracting package...")
        success, _, _ = execute_command(ssh, f"cd {remote_dir} && tar -xzf projecthub-deploy.tar.gz")
        if not success:
            print("❌ Failed to extract package")
            return
        
        # Check if docker-compose.yml exists
        print("🔍 Checking for docker-compose.yml...")
        success, output, _ = execute_command(ssh, f"ls -la {remote_dir}/docker-compose.yml", print_output=False)
        if not success:
            # Maybe it's in a subdirectory
            print("🔍 Looking for docker-compose.yml in subdirectories...")
            success, output, _ = execute_command(ssh, f"find {remote_dir} -name 'docker-compose.yml' -type f")
            if output.strip():
                compose_path = output.strip().split('\n')[0]
                compose_dir = os.path.dirname(compose_path)
                print(f"📁 Found docker-compose.yml in: {compose_dir}")
                remote_dir = compose_dir
        
        # Stop existing containers if any
        print("🛑 Stopping existing containers...")
        execute_command(ssh, f"cd {remote_dir} && docker-compose down 2>/dev/null || true")
        
        # Build and start containers
        print("🐳 Building Docker images...")
        success, _, _ = execute_command(ssh, f"cd {remote_dir} && docker-compose build")
        if not success:
            print("⚠️  Build had some warnings, continuing...")
        
        print("🚀 Starting Docker containers...")
        success, _, _ = execute_command(ssh, f"cd {remote_dir} && docker-compose up -d")
        if not success:
            print("❌ Failed to start containers")
            return
        
        # Wait for containers to start
        print("⏳ Waiting for containers to start...")
        time.sleep(10)
        
        # Check container status
        print("📊 Checking container status...")
        execute_command(ssh, f"cd {remote_dir} && docker-compose ps")
        
        # Check logs
        print("\n📋 Recent logs:")
        execute_command(ssh, f"cd {remote_dir} && docker-compose logs --tail=20")
        
        print("\n✅ Deployment complete!")
        print("🌐 Access ProjectHub at:")
        print("   - Backend API: http://192.168.1.24:3007")
        print("   - Frontend UI: http://192.168.1.24:5174")
        print("   - PostgreSQL: 192.168.1.24:5433")
        
        ssh.close()
        
    except Exception as e:
        print(f"❌ Deployment failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()